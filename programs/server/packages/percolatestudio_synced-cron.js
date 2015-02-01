(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Log = Package.logging.Log;

/* Package-scope variables */
var SyncedCron, Later;

(function () {

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/percolatestudio:synced-cron/synced-cron-server.js                        //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //
// A package for running jobs synchronized across multiple processes                 // 1
SyncedCron = {                                                                       // 2
  _entries: {},                                                                      // 3
  running: false,                                                                    // 4
  options: {                                                                         // 5
    //Log job run details to console                                                 // 6
    log: true,                                                                       // 7
                                                                                     // 8
    //Name of collection to use for synchronisation and logging                      // 9
    collectionName: 'cronHistory',                                                   // 10
                                                                                     // 11
    //Default to using localTime                                                     // 12
    utc: false,                                                                      // 13
                                                                                     // 14
    //TTL in seconds for history records in collection to expire                     // 15
    //NOTE: Unset to remove expiry but ensure you remove the index from              // 16
    //mongo by hand                                                                  // 17
    collectionTTL: 172800                                                            // 18
  }                                                                                  // 19
}                                                                                    // 20
                                                                                     // 21
Later = Npm.require('later');                                                        // 22
                                                                                     // 23
Meteor.startup(function() {                                                          // 24
  var options = SyncedCron.options;                                                  // 25
                                                                                     // 26
  // Don't allow TTL less than 5 minutes so we don't break synchronization           // 27
  var minTTL = 300;                                                                  // 28
                                                                                     // 29
  // Use UTC or localtime for evaluating schedules                                   // 30
  if (options.utc)                                                                   // 31
    Later.date.UTC();                                                                // 32
  else                                                                               // 33
    Later.date.localTime();                                                          // 34
                                                                                     // 35
  // collection holding the job history records                                      // 36
  SyncedCron._collection = new Mongo.Collection(options.collectionName);             // 37
  SyncedCron._collection._ensureIndex({intendedAt: 1, name: 1}, {unique: true});     // 38
                                                                                     // 39
  if (options.collectionTTL) {                                                       // 40
    if (options.collectionTTL > minTTL)                                              // 41
      SyncedCron._collection._ensureIndex({startedAt: 1 },                           // 42
        { expireAfterSeconds: options.collectionTTL } );                             // 43
    else                                                                             // 44
      console.log('Warning: Not going to use a TTL that is shorter than:' + minTTL); // 45
  }                                                                                  // 46
});                                                                                  // 47
                                                                                     // 48
var log = {                                                                          // 49
  info: function(message) {                                                          // 50
    if (SyncedCron.options.log)                                                      // 51
      Log.info({message: message});                                                  // 52
  }                                                                                  // 53
}                                                                                    // 54
                                                                                     // 55
var scheduleEntry = function(entry) {                                                // 56
  var schedule = entry.schedule(Later.parse);                                        // 57
  entry._timer =                                                                     // 58
    SyncedCron._laterSetInterval(SyncedCron._entryWrapper(entry), schedule);         // 59
                                                                                     // 60
  log.info('SyncedCron: scheduled "' + entry.name + '" next run @'                   // 61
    + Later.schedule(schedule).next(1));                                             // 62
}                                                                                    // 63
                                                                                     // 64
// add a scheduled job                                                               // 65
// SyncedCron.add({                                                                  // 66
//   name: String, //*required* unique name of the job                               // 67
//   schedule: function(laterParser) {},//*required* when to run the job             // 68
//   job: function() {}, //*required* the code to run                                // 69
// });                                                                               // 70
SyncedCron.add = function(entry) {                                                   // 71
  check(entry.name, String);                                                         // 72
  check(entry.schedule, Function);                                                   // 73
  check(entry.job, Function);                                                        // 74
                                                                                     // 75
  // check                                                                           // 76
  this._entries[entry.name] = entry;                                                 // 77
                                                                                     // 78
  // If cron is already running, start directly.                                     // 79
  if (this.running) {                                                                // 80
    scheduleEntry(entry);                                                            // 81
  }                                                                                  // 82
}                                                                                    // 83
                                                                                     // 84
// Start processing added jobs                                                       // 85
SyncedCron.start = function() {                                                      // 86
  var self = this;                                                                   // 87
                                                                                     // 88
  Meteor.startup(function() {                                                        // 89
    // Schedule each job with later.js                                               // 90
    _.each(self._entries, function(entry) {                                          // 91
      scheduleEntry(entry);                                                          // 92
    });                                                                              // 93
    self.running = true;                                                             // 94
  });                                                                                // 95
}                                                                                    // 96
                                                                                     // 97
// Return the next scheduled date of the first matching entry or undefined           // 98
SyncedCron.nextScheduledAtDate = function(jobName) {                                 // 99
  var entry = this._entries[jobName];                                                // 100
                                                                                     // 101
  if (entry)                                                                         // 102
    return Later.schedule(entry.schedule(Later.parse)).next(1);                      // 103
}                                                                                    // 104
                                                                                     // 105
// Remove and stop the entry referenced by jobName                                   // 106
SyncedCron.remove = function(jobName) {                                              // 107
  var entry = this._entries[jobName];                                                // 108
                                                                                     // 109
  if (entry) {                                                                       // 110
    if (entry._timer)                                                                // 111
      entry._timer.clear();                                                          // 112
                                                                                     // 113
    delete this._entries[jobName];                                                   // 114
    log.info('SyncedCron: Removed "' + entry.name);                                  // 115
  }                                                                                  // 116
}                                                                                    // 117
                                                                                     // 118
// Stop processing and remove ALL jobs                                               // 119
SyncedCron.stop = function() {                                                       // 120
  _.each(this._entries, function(entry, name) {                                      // 121
    SyncedCron.remove(name);                                                         // 122
  });                                                                                // 123
  this.running = false;                                                              // 124
}                                                                                    // 125
                                                                                     // 126
// The meat of our logic. Checks if the specified has already run. If not,           // 127
// records that it's running the job, runs it, and records the output                // 128
SyncedCron._entryWrapper = function(entry) {                                         // 129
  var self = this;                                                                   // 130
                                                                                     // 131
  return function(intendedAt) {                                                      // 132
    var jobHistory = {                                                               // 133
      intendedAt: intendedAt,                                                        // 134
      name: entry.name,                                                              // 135
      startedAt: new Date()                                                          // 136
    };                                                                               // 137
                                                                                     // 138
    // If we have a dup key error, another instance has already tried to run         // 139
    // this job.                                                                     // 140
    try {                                                                            // 141
      jobHistory._id = self._collection.insert(jobHistory);                          // 142
    } catch(e) {                                                                     // 143
      // http://www.mongodb.org/about/contributors/error-codes/                      // 144
      // 11000 == duplicate key error                                                // 145
      if (e.name === 'MongoError' && e.code === 11000) {                             // 146
        log.info('SyncedCron: Not running "' + entry.name + '" again.');             // 147
        return;                                                                      // 148
      }                                                                              // 149
                                                                                     // 150
      throw e;                                                                       // 151
    };                                                                               // 152
                                                                                     // 153
    // run and record the job                                                        // 154
    try {                                                                            // 155
      log.info('SyncedCron: Starting "' + entry.name + '".');                        // 156
      var output = entry.job(intendedAt); // <- Run the actual job                   // 157
                                                                                     // 158
      log.info('SyncedCron: Finished "' + entry.name + '".');                        // 159
      self._collection.update({_id: jobHistory._id}, {                               // 160
        $set: {                                                                      // 161
          finishedAt: new Date(),                                                    // 162
          result: output                                                             // 163
        }                                                                            // 164
      });                                                                            // 165
    } catch(e) {                                                                     // 166
      log.info('SyncedCron: Exception "' + entry.name +'" ' + e.stack);              // 167
      self._collection.update({_id: jobHistory._id}, {                               // 168
        $set: {                                                                      // 169
          finishedAt: new Date(),                                                    // 170
          error: e.stack                                                             // 171
        }                                                                            // 172
      });                                                                            // 173
    }                                                                                // 174
  };                                                                                 // 175
}                                                                                    // 176
                                                                                     // 177
// for tests                                                                         // 178
SyncedCron._reset = function() {                                                     // 179
  this._entries = {};                                                                // 180
  this._collection.remove({});                                                       // 181
  this.running = false;                                                              // 182
}                                                                                    // 183
                                                                                     // 184
// ---------------------------------------------------------------------------       // 185
// The following two functions are lifted from the later.js package, however         // 186
// I've made the following changes:                                                  // 187
// - Use Meteor.setTimeout and Meteor.clearTimeout                                   // 188
// - Added an 'intendedAt' parameter to the callback fn that specifies the precise   // 189
//   time the callback function *should* be run (so we can co-ordinate jobs)         // 190
//   between multiple, potentially laggy and unsynced machines                       // 191
                                                                                     // 192
// From: https://github.com/bunkat/later/blob/master/src/core/setinterval.js         // 193
SyncedCron._laterSetInterval = function(fn, sched) {                                 // 194
                                                                                     // 195
  var t = SyncedCron._laterSetTimeout(scheduleTimeout, sched),                       // 196
      done = false;                                                                  // 197
                                                                                     // 198
  /**                                                                                // 199
  * Executes the specified function and then sets the timeout for the next           // 200
  * interval.                                                                        // 201
  */                                                                                 // 202
  function scheduleTimeout(intendedAt) {                                             // 203
    if(!done) {                                                                      // 204
      fn(intendedAt);                                                                // 205
      t = SyncedCron._laterSetTimeout(scheduleTimeout, sched);                       // 206
    }                                                                                // 207
  }                                                                                  // 208
                                                                                     // 209
  return {                                                                           // 210
                                                                                     // 211
    /**                                                                              // 212
    * Clears the timeout.                                                            // 213
    */                                                                               // 214
    clear: function() {                                                              // 215
      done = true;                                                                   // 216
      t.clear();                                                                     // 217
    }                                                                                // 218
                                                                                     // 219
  };                                                                                 // 220
                                                                                     // 221
};                                                                                   // 222
                                                                                     // 223
// From: https://github.com/bunkat/later/blob/master/src/core/settimeout.js          // 224
SyncedCron._laterSetTimeout = function(fn, sched) {                                  // 225
                                                                                     // 226
  var s = Later.schedule(sched), t;                                                  // 227
  scheduleTimeout();                                                                 // 228
                                                                                     // 229
  /**                                                                                // 230
  * Schedules the timeout to occur. If the next occurrence is greater than the       // 231
  * max supported delay (2147483647 ms) than we delay for that amount before         // 232
  * attempting to schedule the timeout again.                                        // 233
  */                                                                                 // 234
  function scheduleTimeout() {                                                       // 235
    var now = Date.now(),                                                            // 236
        next = s.next(2, now),                                                       // 237
        diff = next[0].getTime() - now,                                              // 238
        intendedAt = next[0];                                                        // 239
                                                                                     // 240
    // minimum time to fire is one second, use next occurrence instead               // 241
    if(diff < 1000) {                                                                // 242
      diff = next[1].getTime() - now;                                                // 243
      intendedAt = next[1];                                                          // 244
    }                                                                                // 245
                                                                                     // 246
    if(diff < 2147483647) {                                                          // 247
      t = Meteor.setTimeout(function() { fn(intendedAt); }, diff);                   // 248
    }                                                                                // 249
    else {                                                                           // 250
      t = Meteor.setTimeout(scheduleTimeout, 2147483647);                            // 251
    }                                                                                // 252
  }                                                                                  // 253
                                                                                     // 254
  return {                                                                           // 255
                                                                                     // 256
    /**                                                                              // 257
    * Clears the timeout.                                                            // 258
    */                                                                               // 259
    clear: function() {                                                              // 260
      Meteor.clearTimeout(t);                                                        // 261
    }                                                                                // 262
                                                                                     // 263
  };                                                                                 // 264
                                                                                     // 265
};                                                                                   // 266
// ---------------------------------------------------------------------------       // 267
                                                                                     // 268
///////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['percolatestudio:synced-cron'] = {
  SyncedCron: SyncedCron
};

})();

//# sourceMappingURL=percolatestudio_synced-cron.js.map
