(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var DDP = Package.ddp.DDP;
var DDPServer = Package.ddp.DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var Queue;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/artwells:queue/queue.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Queue = {};                                                                                                            // 1
if (typeof Queue.loglevel === "undefined") {                                                                           // 2
  Queue.loglevel = 3; /* 3 only includes lock conflicts.  2,3 includes successes */                                    // 3
}                                                                                                                      // 4
if (typeof Queue.logLife === "undefined") {                                                                            // 5
  Queue.logLife = 30; /* days to keep logfiles */                                                                      // 6
}                                                                                                                      // 7
if (typeof Queue.defaultPriority === "undefined") {                                                                    // 8
  Queue.defaultPriority = 5;/* 1 is highest */                                                                         // 9
}                                                                                                                      // 10
if (typeof Queue.defaultStatus === "undefined") {                                                                      // 11
  Queue.defaultStatus = "pending";/* by changing this to some other new word, you can make sure queue items are "blessed" in "pending" through another process. */
}                                                                                                                      // 13
if (typeof Queue.keepsuccess === "undefined") {                                                                        // 14
  Queue.keepsuccess = true; /* keep successful in queue as record */                                                   // 15
}                                                                                                                      // 16
if (typeof Queue.lockLife === "undefined") {                                                                           // 17
  Queue.lockLife = 30; /* minutes to keep lockfiles */                                                                 // 18
}                                                                                                                      // 19
if (typeof Queue.completedLife === "undefined") {                                                                      // 20
  Queue.completedLife = 30; /* days to keep completed tasks */                                                         // 21
}                                                                                                                      // 22
                                                                                                                       // 23
                                                                                                                       // 24
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/artwells:queue/lib/model.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    // 1
 * queue schema                                                                                                        // 2
 *                                                                                                                     // 3
 *{                                                                                                                    // 4
 *    "_id" : ObjectId,                                                                                                // 5
 *    "status" : string,                                                                                               // 6
 *    "priority" : int, // 1s first                                                                                    // 7
 *    "command" : string,                                                                                              // 8
 *    "execute_after" : ISODate,                                                                                       // 9
 *    "lock_name" : string, //only allow one task of this name to be queued                                            // 10
 *    "history" : {                                                                                                    // 11
 *   },                                                                                                                // 12
 *    "reattempt" :  //number of minutes to requeue                                                                    // 13
 *    "log_success" : //boolean                                                                                        // 14
 *    "created_at": ISODate,                                                                                           // 15
 *    "updated_at": ISODate                                                                                            // 16
 *}                                                                                                                    // 17
 *                                                                                                                     // 18
 */                                                                                                                    // 19
                                                                                                                       // 20
                                                                                                                       // 21
/**                                                                                                                    // 22
 *  queuelog schema                                                                                                    // 23
 *                                                                                                                     // 24
 *  "_id" : ObjectId,                                                                                                  // 25
 *   "status" : string, // lockfailed                                                                                  // 26
 *   "created_at" : ISODate                                                                                            // 27
 *   "command" : string,                                                                                               // 28
 *   "parent_id": string                                                                                               // 29
 *  "data": {                                                                                                          // 30
 *     results                                                                                                         // 31
 *  }                                                                                                                  // 32
 *                                                                                                                     // 33
 */                                                                                                                    // 34
                                                                                                                       // 35
                                                                                                                       // 36
Queue.entries = new Meteor.Collection("queue");                                                                        // 37
Queue.log = new Meteor.Collection("queuelog");                                                                         // 38
                                                                                                                       // 39
                                                                                                                       // 40
if (Meteor.isServer) {                                                                                                 // 41
  Queue.entries._ensureIndex({ lock_name: 1 }, { unique: true, sparse: true });                                        // 42
  /*just until Meteor bring findAndModify */                                                                           // 43
  if (typeof Queue.entries.findAndModify === "undefined") {                                                            // 44
    Queue.entries.findAndModify = function (query, sort, mod) {                                                        // 45
      sort.reactive = false;                                                                                           // 46
      var results = Queue.entries.find(query, sort, {reactive: true}).fetch();                                         // 47
      var modified = Queue.entries.update(query, mod, {multi: true});                                                  // 48
      if (modified) {                                                                                                  // 49
        return results;                                                                                                // 50
      }                                                                                                                // 51
    };                                                                                                                 // 52
  }                                                                                                                    // 53
  /* end fake findAndModify */                                                                                         // 54
}                                                                                                                      // 55
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/artwells:queue/lib/server/server.js                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Queue.purgeOldLogs = function () {                                                                                     // 1
  var before = new Date();                                                                                             // 2
  before.setDate(before.getDate() - Queue.logLife);                                                                    // 3
  Queue.log.remove({created_at: {$lte: before}});                                                                      // 4
};                                                                                                                     // 5
                                                                                                                       // 6
Queue.purgeOldLocks = function (before) {                                                                              // 7
  if (typeof before === "undefined" || before === null) {                                                              // 8
    before = new Date();                                                                                               // 9
    before.setMinutes(before.getMinutes() - Queue.lockLife);                                                           // 10
  }                                                                                                                    // 11
  Queue.entries.remove({created_at: {$lte: before}, lockname: {$exists: true}});                                       // 12
};                                                                                                                     // 13
                                                                                                                       // 14
Queue.purgeCompletedTasks = function (before) {                                                                        // 15
  if (typeof before === "undefined" || before === null) {                                                              // 16
    before = new Date();                                                                                               // 17
    before.setDate(before.getDate() - Queue.completedLife);                                                            // 18
  }                                                                                                                    // 19
  Queue.entries.remove({updated_at: {$lte: before}, status: 'completed'});                                             // 20
};                                                                                                                     // 21
                                                                                                                       // 22
Queue.add = function (entry) {                                                                                         // 23
  var res = false;                                                                                                     // 24
  /*command, name,  priority, execute_after, reattempt, lock_name, logsuccesses*/                                      // 25
  var entryarray = [];                                                                                                 // 26
  if (typeof entry !== "object" || entry === null) {                                                                   // 27
    return false;                                                                                                      // 28
  }                                                                                                                    // 29
  if (typeof entry.command !== "string") {                                                                             // 30
    return false;                                                                                                      // 31
  }                                                                                                                    // 32
  entryarray.command = entry.command;                                                                                  // 33
                                                                                                                       // 34
  if (typeof entry.execute_after === "undefined" || entry.execute_after === null) {                                    // 35
    entry.execute_after = new Date();                                                                                  // 36
  }                                                                                                                    // 37
  entryarray.execute_after = entry.execute_after;                                                                      // 38
  /* force default state through this method */                                                                        // 39
  entryarray.status = Queue.defaultStatus;                                                                             // 40
                                                                                                                       // 41
                                                                                                                       // 42
  entryarray.priority = Queue.defaultPriority; /* default to mediocre default*/                                        // 43
                                                                                                                       // 44
  if (typeof entry.priority === "number") {                                                                            // 45
    entryarray.priority = entry.priority;                                                                              // 46
  }                                                                                                                    // 47
                                                                                                                       // 48
  if (typeof entry.name === "string") {                                                                                // 49
    entryarray.name = entry.name;                                                                                      // 50
  }                                                                                                                    // 51
                                                                                                                       // 52
  if (typeof entry.lock_name === "string") {                                                                           // 53
    entryarray.lock_name = entry.lock_name;                                                                            // 54
  }                                                                                                                    // 55
                                                                                                                       // 56
  if (typeof entry.execute_after === "object") {                                                                       // 57
    entryarray.execute_after = entry.execute_after;                                                                    // 58
  }                                                                                                                    // 59
                                                                                                                       // 60
  if (typeof entry.log_success === "boolean") {                                                                        // 61
    entryarray.log_success = entry.log_success;                                                                        // 62
  }                                                                                                                    // 63
                                                                                                                       // 64
  if (typeof entry.reattempt === "number") {                                                                           // 65
    entryarray.reattempt = entry.reattempt;                                                                            // 66
  }                                                                                                                    // 67
  entryarray.created_at = new Date();                                                                                  // 68
  entryarray.updated_at = new Date();                                                                                  // 69
                                                                                                                       // 70
  try {                                                                                                                // 71
    res = Queue.entries.insert(entryarray);                                                                            // 72
  } catch (e) {                                                                                                        // 73
    /* lock errors are expected and should be logged only if verbose */                                                // 74
    if (e.err !== 'undefined' && e.err.indexOf('E11000') === 0 &&                                                      // 75
        Queue.loglevel > 2) {                                                                                          // 76
      Queue.log.insert({command: 'Queue.add failed ' + entryarray.lock_name, status: 'lockfailed', data: e.err, created_at: new Date()});
    } else if (Queue.loglevel > 0) {                                                                                   // 78
      /* otherwise include the whole stack */                                                                          // 79
      Queue.log.insert({command: 'Queue.add failed ' + entryarray.lock_name, status: 'lockfailed', data: e, created_at: new Date()});
    }                                                                                                                  // 81
  }                                                                                                                    // 82
  return res;                                                                                                          // 83
};                                                                                                                     // 84
                                                                                                                       // 85
/* not much now, but might need to be complicated in the future */                                                     // 86
Queue.remove = function (entryId) {                                                                                    // 87
  return Queue.entries.remove({_id: entryId});                                                                         // 88
};                                                                                                                     // 89
                                                                                                                       // 90
/* sets all found entries as 'locked'                                                                                  // 91
* @TODO by-priority                                                                                                    // 92
*/                                                                                                                     // 93
Queue.get = function (args) {                                                                                          // 94
/* defaults status: pending,execute_after:now, */                                                                      // 95
  var getstatus = "pending"; /* default retrieval status */                                                            // 96
  var execute_after = new Date();                                                                                      // 97
  /* do NOT use Queue.defaultStatus for getstatus, as you want to allow defaultStatus to serve an optional other purpose */
  if (typeof args.execute_after !== "undefined" || args.execute_after === null) {                                      // 99
    execute_after = args.execute_after;                                                                                // 100
  }                                                                                                                    // 101
                                                                                                                       // 102
  if (typeof args.status === "string") {                                                                               // 103
    getstatus = args.status;                                                                                           // 104
  }                                                                                                                    // 105
                                                                                                                       // 106
  return Queue.entries.findAndModify({execute_after: {$lte: execute_after}, status: getstatus}, {sort: {priority: 1}}, // 107
    {$set: {status: 'locked'}}                                                                                         // 108
    );                                                                                                                 // 109
                                                                                                                       // 110
};                                                                                                                     // 111
                                                                                                                       // 112
/* just used for testing but will be helpful for "blessed" level*/                                                     // 113
Queue.changeStatus = function (id, status) {                                                                           // 114
  var modified = Queue.entries.update({_id: id}, {$set: {status: status}});                                            // 115
  if (modified === 1) {                                                                                                // 116
    return true;                                                                                                       // 117
  }                                                                                                                    // 118
  return false;                                                                                                        // 119
};                                                                                                                     // 120
                                                                                                                       // 121
/* @TODO: add some sanity checks */                                                                                    // 122
Queue.process = function (entry) {                                                                                     // 123
  var result = false;                                                                                                  // 124
  var message = 'failed';                                                                                              // 125
  var history = null;                                                                                                  // 126
  try {                                                                                                                // 127
    result = new Function(entry.command)();                                                                            // 128
  } catch (e) {                                                                                                        // 129
    result = false;                                                                                                    // 130
    message = e.err;                                                                                                   // 131
  }                                                                                                                    // 132
  if (result !== false) {                                                                                              // 133
    if (entry.log_success ||  Queue.loglevel > 1) {                                                                    // 134
      Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'success', data: result, created_at: new Date()});
    }                                                                                                                  // 136
    if (Queue.keepsuccess) {                                                                                           // 137
      if (typeof entry.history !== "undefined") {                                                                      // 138
        history = entry.history + ' command returned true (' + new Date() + ');';                                      // 139
      } else {                                                                                                         // 140
        history = 'command returned true (' + new Date() + ');';                                                       // 141
      }                                                                                                                // 142
      var modified = Queue.entries.update({_id: entry._id}, {$set: {status: 'completed', history: history, updated_at: new Date()}});
      if (modified !== 1 && Queue.loglevel > 0) {                                                                      // 144
        Queue.log.insert({command: 'update on succes', parent_id: entry._id, status: 'exception', data: 'unable to update entry', created_at: new Date()});
      }                                                                                                                // 146
    }                                                                                                                  // 147
    return true;                                                                                                       // 148
  }                                                                                                                    // 149
                                                                                                                       // 150
  if (Queue.loglevel > 0) {                                                                                            // 151
    Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'exception', data: message, created_at: new Date()});
  }                                                                                                                    // 153
                                                                                                                       // 154
  if (entry.reattempt > 0) {                                                                                           // 155
    var execdate = new Date();                                                                                         // 156
    execdate.setMinutes(execdate.getMinutes() + entry.reattempt);                                                      // 157
    var reattemptmodified = Queue.entries.update({_id: entry._id}, {$set: {status: 'pending', execute_after: execdate}});
    if (reattemptmodified !== 1 && Queue.loglevel > 0) {                                                               // 159
      Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'exception', data: 'unable to requeue command', created_at: new Date()});
    }                                                                                                                  // 161
  } else {                                                                                                             // 162
    if (typeof entry.history !== "undefined") {                                                                        // 163
      history = entry.history + ' command returned false (' + new Date() + ');';                                       // 164
    } else {                                                                                                           // 165
      history = ' command returned false (' + new Date() + ');';                                                       // 166
    }                                                                                                                  // 167
    var historymodified = Queue.entries.update({_id: entry._id}, {$set: {status: 'failed', history: history, updated_at: new Date()}});
    if (historymodified !== 1 && Queue.loglevel > 0) {                                                                 // 169
      Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'exception', data: 'unable to requeue command', created_at: new Date()});
    }                                                                                                                  // 171
  }                                                                                                                    // 172
  return false;                                                                                                        // 173
};                                                                                                                     // 174
                                                                                                                       // 175
                                                                                                                       // 176
Queue.run = function (args) {                                                                                          // 177
  /* hacky locking with entry table */                                                                                 // 178
  if (typeof args === "undefined") {                                                                                   // 179
    args = [];                                                                                                         // 180
  }                                                                                                                    // 181
  var entry = [];                                                                                                      // 182
  var future = new Date();                                                                                             // 183
  var getargs = [];                                                                                                    // 184
  future.setDate(future.getDate() + 600); /* put it out there so it doesn't execute */                                 // 185
  entry.command = 'return true;';                                                                                      // 186
  entry.lock_name = 'query.run';                                                                                       // 187
  entry.execute_after = future;                                                                                        // 188
  var lock = Queue.add(entry);                                                                                         // 189
  if (lock === false) {                                                                                                // 190
    if (Queue.loglevel > 0) {                                                                                          // 191
      Queue.log.insert({command: 'Queue.run failed due to locking ' + entry.lock_name, status: 'lockfailed', created_at: new Date()});
    }                                                                                                                  // 193
    return false;                                                                                                      // 194
  }                                                                                                                    // 195
                                                                                                                       // 196
  /* lock obtained */                                                                                                  // 197
  if (typeof args.execute_after === "undefined" || args.execute_after === null) {                                      // 198
    args.execute_after = new Date();                                                                                   // 199
  }                                                                                                                    // 200
  getargs.execute_after = args.execute_after;                                                                          // 201
  /* @TODO: add args for status and execute_after */                                                                   // 202
  var all = Queue.get(getargs);                                                                                        // 203
  _.each(all, function (entry) {                                                                                       // 204
    Queue.process(entry);                                                                                              // 205
  });                                                                                                                  // 206
  /* lock */                                                                                                           // 207
  Queue.remove(lock);                                                                                                  // 208
  return true;                                                                                                         // 209
};                                                                                                                     // 210
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['artwells:queue'] = {
  Queue: Queue
};

})();

//# sourceMappingURL=artwells_queue.js.map
