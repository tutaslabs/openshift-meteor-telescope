(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var KadiraBinaryDeps = Package['meteorhacks:kadira-binary-deps'].KadiraBinaryDeps;
var MeteorX = Package['meteorhacks:meteorx'].MeteorX;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package.ddp.DDP;
var DDPServer = Package.ddp.DDPServer;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;
var HTTP = Package.http.HTTP;
var Email = Package.email.Email;
var Random = Package.random.Random;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var Kadira, BaseErrorModel, Jobs, Retry, HaveAsyncCallback, UniqueId, DefaultUniqueId, Ntp, WaitTimeBuilder, KadiraModel, MethodsModel, PubsubModel, collectionName, SystemModel, ErrorModel, OplogCheck, TracerStore, wrapServer, wrapSession, wrapSubscription, wrapOplogObserveDriver, wrapPollingObserveDriver, wrapMultiplexer, TrackUncaughtExceptions, TrackMeteorDebug, remoteProfileCPU, localProfileCPU, getCpuProfile, writeToDisk, setLabels;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/common/unify.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Kadira = {};                                                                                                          // 1
Kadira.options = {};                                                                                                  // 2
                                                                                                                      // 3
if(Meteor.wrapAsync) {                                                                                                // 4
  Kadira._wrapAsync = Meteor.wrapAsync;                                                                               // 5
} else {                                                                                                              // 6
  Kadira._wrapAsync = Meteor._wrapAsync;                                                                              // 7
}                                                                                                                     // 8
                                                                                                                      // 9
Kadira._binaryRequire = function(moduleName) {                                                                        // 10
  if(typeof KadiraBinaryDeps != 'undefined') {                                                                        // 11
    return KadiraBinaryDeps.require(moduleName);                                                                      // 12
  } else {                                                                                                            // 13
    return Npm.require(moduleName);                                                                                   // 14
  }                                                                                                                   // 15
};                                                                                                                    // 16
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/models/base_error.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
BaseErrorModel = function(options) {                                                                                  // 1
  this._filters = [];                                                                                                 // 2
};                                                                                                                    // 3
                                                                                                                      // 4
BaseErrorModel.prototype.addFilter = function(filter) {                                                               // 5
  if(typeof filter === 'function') {                                                                                  // 6
    this._filters.push(filter);                                                                                       // 7
  } else {                                                                                                            // 8
    throw new Error("Error filter must be a function");                                                               // 9
  }                                                                                                                   // 10
};                                                                                                                    // 11
                                                                                                                      // 12
BaseErrorModel.prototype.removeFilter = function(filter) {                                                            // 13
  var index = this._filters.indexOf(filter);                                                                          // 14
  if(index >= 0) {                                                                                                    // 15
    this._filters.splice(index, 1);                                                                                   // 16
  }                                                                                                                   // 17
};                                                                                                                    // 18
                                                                                                                      // 19
BaseErrorModel.prototype.applyFilters = function(type, message, error, subType) {                                     // 20
  for(var lc=0; lc<this._filters.length; lc++) {                                                                      // 21
    var filter = this._filters[lc];                                                                                   // 22
    try {                                                                                                             // 23
      var validated = filter(type, message, error, subType);                                                          // 24
      if(!validated) return false;                                                                                    // 25
    } catch (ex) {                                                                                                    // 26
      // we need to remove this filter                                                                                // 27
      // we may ended up in a error cycle                                                                             // 28
      this._filters.splice(lc, 1);                                                                                    // 29
      throw new Error("an error thrown from a filter you've suplied", ex.message);                                    // 30
    }                                                                                                                 // 31
  }                                                                                                                   // 32
                                                                                                                      // 33
  return true;                                                                                                        // 34
};                                                                                                                    // 35
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/jobs.js                                                                            //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Jobs = {};                                                                                                            // 1
Jobs.getAsync = function(id, callback) {                                                                              // 2
  var payload = {                                                                                                     // 3
    action: 'get',                                                                                                    // 4
    params: {                                                                                                         // 5
      id: id                                                                                                          // 6
    }                                                                                                                 // 7
  };                                                                                                                  // 8
                                                                                                                      // 9
  Kadira.send(payload, '/jobs', callback);                                                                            // 10
};                                                                                                                    // 11
                                                                                                                      // 12
Jobs.setAsync = function(id, changes, callback) {                                                                     // 13
  var payload = {                                                                                                     // 14
    action: 'set',                                                                                                    // 15
    params: {                                                                                                         // 16
      id: id                                                                                                          // 17
    }                                                                                                                 // 18
  };                                                                                                                  // 19
  _.extend(payload.params, changes);                                                                                  // 20
                                                                                                                      // 21
  Kadira.send(payload, '/jobs', callback);                                                                            // 22
};                                                                                                                    // 23
                                                                                                                      // 24
                                                                                                                      // 25
Jobs.get = Kadira._wrapAsync(Jobs.getAsync);                                                                          // 26
Jobs.set = Kadira._wrapAsync(Jobs.setAsync);                                                                          // 27
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/retry.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Retry logic with an exponential backoff.                                                                           // 1
//                                                                                                                    // 2
// options:                                                                                                           // 3
//  baseTimeout: time for initial reconnect attempt (ms).                                                             // 4
//  exponent: exponential factor to increase timeout each attempt.                                                    // 5
//  maxTimeout: maximum time between retries (ms).                                                                    // 6
//  minCount: how many times to reconnect "instantly".                                                                // 7
//  minTimeout: time to wait for the first `minCount` retries (ms).                                                   // 8
//  fuzz: factor to randomize retry times by (to avoid retry storms).                                                 // 9
                                                                                                                      // 10
//TODO: remove this class and use Meteor Retry in a later version of meteor.                                          // 11
                                                                                                                      // 12
Retry = function (options) {                                                                                          // 13
  var self = this;                                                                                                    // 14
  _.extend(self, _.defaults(_.clone(options || {}), {                                                                 // 15
    baseTimeout: 1000, // 1 second                                                                                    // 16
    exponent: 2.2,                                                                                                    // 17
    // The default is high-ish to ensure a server can recover from a                                                  // 18
    // failure caused by load.                                                                                        // 19
    maxTimeout: 5 * 60000, // 5 minutes                                                                               // 20
    minTimeout: 10,                                                                                                   // 21
    minCount: 2,                                                                                                      // 22
    fuzz: 0.5 // +- 25%                                                                                               // 23
  }));                                                                                                                // 24
  self.retryTimer = null;                                                                                             // 25
};                                                                                                                    // 26
                                                                                                                      // 27
_.extend(Retry.prototype, {                                                                                           // 28
                                                                                                                      // 29
  // Reset a pending retry, if any.                                                                                   // 30
  clear: function () {                                                                                                // 31
    var self = this;                                                                                                  // 32
    if(self.retryTimer)                                                                                               // 33
      clearTimeout(self.retryTimer);                                                                                  // 34
    self.retryTimer = null;                                                                                           // 35
  },                                                                                                                  // 36
                                                                                                                      // 37
  // Calculate how long to wait in milliseconds to retry, based on the                                                // 38
  // `count` of which retry this is.                                                                                  // 39
  _timeout: function (count) {                                                                                        // 40
    var self = this;                                                                                                  // 41
                                                                                                                      // 42
    if(count < self.minCount)                                                                                         // 43
      return self.minTimeout;                                                                                         // 44
                                                                                                                      // 45
    var timeout = Math.min(                                                                                           // 46
      self.maxTimeout,                                                                                                // 47
      self.baseTimeout * Math.pow(self.exponent, count));                                                             // 48
    // fuzz the timeout randomly, to avoid reconnect storms when a                                                    // 49
    // server goes down.                                                                                              // 50
    timeout = timeout * ((Random.fraction() * self.fuzz) +                                                            // 51
                         (1 - self.fuzz/2));                                                                          // 52
    return Math.ceil(timeout);                                                                                        // 53
  },                                                                                                                  // 54
                                                                                                                      // 55
  // Call `fn` after a delay, based on the `count` of which retry this is.                                            // 56
  retryLater: function (count, fn) {                                                                                  // 57
    var self = this;                                                                                                  // 58
    var timeout = self._timeout(count);                                                                               // 59
    if(self.retryTimer)                                                                                               // 60
      clearTimeout(self.retryTimer);                                                                                  // 61
                                                                                                                      // 62
    self.retryTimer = setTimeout(fn, timeout);                                                                        // 63
    return timeout;                                                                                                   // 64
  }                                                                                                                   // 65
                                                                                                                      // 66
});                                                                                                                   // 67
                                                                                                                      // 68
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/utils.js                                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 1
                                                                                                                      // 2
HaveAsyncCallback = function(args) {                                                                                  // 3
  var lastArg = args[args.length -1];                                                                                 // 4
  return (typeof lastArg) == 'function';                                                                              // 5
};                                                                                                                    // 6
                                                                                                                      // 7
UniqueId = function(start) {                                                                                          // 8
  this.id = 0;                                                                                                        // 9
}                                                                                                                     // 10
                                                                                                                      // 11
UniqueId.prototype.get = function() {                                                                                 // 12
  return "" + this.id++;                                                                                              // 13
};                                                                                                                    // 14
                                                                                                                      // 15
DefaultUniqueId = new UniqueId();                                                                                     // 16
                                                                                                                      // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/ntp.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var logger = getLogger();                                                                                             // 1
                                                                                                                      // 2
Ntp = function (endpoint) {                                                                                           // 3
  this.setEndpoint(endpoint);                                                                                         // 4
  this.diff = 0;                                                                                                      // 5
  this.synced = false;                                                                                                // 6
  this.reSyncCount = 0;                                                                                               // 7
  this.reSync = new Retry({                                                                                           // 8
    baseTimeout: 1000*60,                                                                                             // 9
    maxTimeout: 1000*60*10,                                                                                           // 10
    minCount: 0                                                                                                       // 11
  });                                                                                                                 // 12
}                                                                                                                     // 13
                                                                                                                      // 14
Ntp._now = function() {                                                                                               // 15
  var now = Date.now();                                                                                               // 16
  if(typeof now == 'number') {                                                                                        // 17
    return now;                                                                                                       // 18
  } else if(now instanceof Date) {                                                                                    // 19
    // some extenal JS libraries override Date.now and returns a Date object                                          // 20
    // which directly affect us. So we need to prepare for that                                                       // 21
    return now.getTime();                                                                                             // 22
  } else {                                                                                                            // 23
    // trust me. I've seen now === undefined                                                                          // 24
    return (new Date()).getTime();                                                                                    // 25
  }                                                                                                                   // 26
};                                                                                                                    // 27
                                                                                                                      // 28
Ntp.prototype.setEndpoint = function(endpoint) {                                                                      // 29
  this.endpoint = endpoint + '/simplentp/sync';                                                                       // 30
};                                                                                                                    // 31
                                                                                                                      // 32
Ntp.prototype.getTime = function() {                                                                                  // 33
  return Ntp._now() + Math.round(this.diff);                                                                          // 34
};                                                                                                                    // 35
                                                                                                                      // 36
Ntp.prototype.syncTime = function(localTime) {                                                                        // 37
  return localTime + Math.ceil(this.diff);                                                                            // 38
};                                                                                                                    // 39
                                                                                                                      // 40
Ntp.prototype.sync = function() {                                                                                     // 41
  logger('init sync');                                                                                                // 42
  var self = this;                                                                                                    // 43
  var retryCount = 0;                                                                                                 // 44
  var retry = new Retry({                                                                                             // 45
    baseTimeout: 1000*20,                                                                                             // 46
    maxTimeout: 1000*60,                                                                                              // 47
    minCount: 1,                                                                                                      // 48
    minTimeout: 0                                                                                                     // 49
  });                                                                                                                 // 50
  syncTime();                                                                                                         // 51
                                                                                                                      // 52
  function syncTime () {                                                                                              // 53
    if(retryCount<5) {                                                                                                // 54
      logger('attempt time sync with server', retryCount);                                                            // 55
      // if we send 0 to the retryLater, cacheDns will run immediately                                                // 56
      retry.retryLater(retryCount++, cacheDns);                                                                       // 57
    } else {                                                                                                          // 58
      logger('maximum retries reached');                                                                              // 59
      self.reSync.retryLater(self.reSyncCount++, function () {                                                        // 60
        var args = [].slice.call(arguments);                                                                          // 61
        self.sync.apply(self, args);                                                                                  // 62
      });                                                                                                             // 63
    }                                                                                                                 // 64
  }                                                                                                                   // 65
                                                                                                                      // 66
  // first attempt is to cache dns. So, calculation does not                                                          // 67
  // include DNS resolution time                                                                                      // 68
  function cacheDns () {                                                                                              // 69
    self.getServerTime(function(err) {                                                                                // 70
      if(!err) {                                                                                                      // 71
        calculateTimeDiff();                                                                                          // 72
      } else {                                                                                                        // 73
        syncTime();                                                                                                   // 74
      }                                                                                                               // 75
    });                                                                                                               // 76
  }                                                                                                                   // 77
                                                                                                                      // 78
  function calculateTimeDiff () {                                                                                     // 79
    var startTime = (new Date()).getTime();                                                                           // 80
    self.getServerTime(function(err, serverTime) {                                                                    // 81
      if(!err && serverTime) {                                                                                        // 82
        // (Date.now() + startTime)/2 : Midpoint between req and res                                                  // 83
        self.diff = serverTime - ((new Date()).getTime() + startTime)/2;                                              // 84
        self.synced = true;                                                                                           // 85
        // we need to send 1 into retryLater.                                                                         // 86
        self.reSync.retryLater(self.reSyncCount++, function () {                                                      // 87
          var args = [].slice.call(arguments);                                                                        // 88
          self.sync.apply(self, args);                                                                                // 89
        });                                                                                                           // 90
        logger('successfully updated diff value', self.diff);                                                         // 91
      } else {                                                                                                        // 92
        syncTime();                                                                                                   // 93
      }                                                                                                               // 94
    });                                                                                                               // 95
  }                                                                                                                   // 96
}                                                                                                                     // 97
                                                                                                                      // 98
Ntp.prototype.getServerTime = function(callback) {                                                                    // 99
  var self = this;                                                                                                    // 100
                                                                                                                      // 101
  if(Meteor.isServer) {                                                                                               // 102
    var Fiber = Npm.require('fibers');                                                                                // 103
    new Fiber(function() {                                                                                            // 104
      HTTP.get(self.endpoint, function (err, res) {                                                                   // 105
        if(err) {                                                                                                     // 106
          callback(err);                                                                                              // 107
        } else {                                                                                                      // 108
          var serverTime = parseInt(res.content)                                                                      // 109
          callback(null, serverTime);                                                                                 // 110
        }                                                                                                             // 111
      });                                                                                                             // 112
    }).run();                                                                                                         // 113
  } else {                                                                                                            // 114
    $.ajax({                                                                                                          // 115
      type: 'GET',                                                                                                    // 116
      url: self.endpoint,                                                                                             // 117
      success: function(serverTime) {                                                                                 // 118
        callback(null, parseInt(serverTime));                                                                         // 119
      },                                                                                                              // 120
      error: function(err) {                                                                                          // 121
        callback(err);                                                                                                // 122
      }                                                                                                               // 123
    });                                                                                                               // 124
  }                                                                                                                   // 125
};                                                                                                                    // 126
                                                                                                                      // 127
function getLogger() {                                                                                                // 128
  if(Meteor.isServer) {                                                                                               // 129
    return Npm.require('debug')("kadira:ntp");                                                                        // 130
  } else {                                                                                                            // 131
    return function(message) {                                                                                        // 132
      var canLogKadira =                                                                                              // 133
        Meteor._localStorage.getItem('LOG_KADIRA') !== null                                                           // 134
        && typeof console !== 'undefined';                                                                            // 135
                                                                                                                      // 136
      if(canLogKadira) {                                                                                              // 137
        if(message) {                                                                                                 // 138
          message = "kadira:ntp " + message;                                                                          // 139
          arguments[0] = message;                                                                                     // 140
        }                                                                                                             // 141
        console.log.apply(console, arguments);                                                                        // 142
      }                                                                                                               // 143
    }                                                                                                                 // 144
  }                                                                                                                   // 145
}                                                                                                                     // 146
                                                                                                                      // 147
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/wait_time_builder.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var WAITON_MESSAGE_FIELDS = ['msg', 'id', 'method', 'name', 'waitTime'];                                              // 1
                                                                                                                      // 2
// This is way how we can build waitTime and it's breakdown                                                           // 3
WaitTimeBuilder = function() {                                                                                        // 4
  this._waitListStore = {};                                                                                           // 5
  this._currentProcessingMessages = {};                                                                               // 6
  this._messageCache = {};                                                                                            // 7
};                                                                                                                    // 8
                                                                                                                      // 9
WaitTimeBuilder.prototype.register = function(session, msgId) {                                                       // 10
  var self = this;                                                                                                    // 11
  var mainKey = self._getMessageKey(session.id, msgId);                                                               // 12
                                                                                                                      // 13
  var waitList = session.inQueue.map(function(msg) {                                                                  // 14
    var key = self._getMessageKey(session.id, msg.id);                                                                // 15
    return self._getCacheMessage(key, msg);                                                                           // 16
  });                                                                                                                 // 17
                                                                                                                      // 18
  //add currently processing ddp message if exists                                                                    // 19
  var currentlyProcessingMessage = this._currentProcessingMessages[session.id];                                       // 20
  if(currentlyProcessingMessage) {                                                                                    // 21
    var key = self._getMessageKey(session.id, currentlyProcessingMessage.id);                                         // 22
    waitList.unshift(this._getCacheMessage(key, currentlyProcessingMessage));                                         // 23
  }                                                                                                                   // 24
                                                                                                                      // 25
  this._waitListStore[mainKey] = waitList;                                                                            // 26
};                                                                                                                    // 27
                                                                                                                      // 28
WaitTimeBuilder.prototype.build = function(session, msgId) {                                                          // 29
  var mainKey = this._getMessageKey(session.id, msgId);                                                               // 30
  var waitList = this._waitListStore[mainKey] || [];                                                                  // 31
  delete this._waitListStore[mainKey];                                                                                // 32
                                                                                                                      // 33
  var filteredWaitList =  waitList.map(this._cleanCacheMessage.bind(this));                                           // 34
  return filteredWaitList;                                                                                            // 35
};                                                                                                                    // 36
                                                                                                                      // 37
WaitTimeBuilder.prototype._getMessageKey = function(sessionId, msgId) {                                               // 38
  return sessionId + "::" + msgId;                                                                                    // 39
};                                                                                                                    // 40
                                                                                                                      // 41
WaitTimeBuilder.prototype._getCacheMessage = function(key, msg) {                                                     // 42
  var self = this;                                                                                                    // 43
  var cachedMessage = self._messageCache[key];                                                                        // 44
  if(!cachedMessage) {                                                                                                // 45
    self._messageCache[key] = cachedMessage = _.pick(msg, WAITON_MESSAGE_FIELDS);                                     // 46
    cachedMessage._key = key;                                                                                         // 47
    cachedMessage._registered = 1;                                                                                    // 48
  } else {                                                                                                            // 49
    cachedMessage._registered++;                                                                                      // 50
  }                                                                                                                   // 51
                                                                                                                      // 52
  return cachedMessage;                                                                                               // 53
};                                                                                                                    // 54
                                                                                                                      // 55
WaitTimeBuilder.prototype._cleanCacheMessage = function(msg) {                                                        // 56
  msg._registered--;                                                                                                  // 57
  if(msg._registered == 0) {                                                                                          // 58
    delete this._messageCache[msg._key];                                                                              // 59
  }                                                                                                                   // 60
                                                                                                                      // 61
  // need to send a clean set of objects                                                                              // 62
  // otherwise register can go with this                                                                              // 63
  return _.pick(msg, WAITON_MESSAGE_FIELDS);                                                                          // 64
};                                                                                                                    // 65
                                                                                                                      // 66
WaitTimeBuilder.prototype.trackWaitTime = function(session, msg, unblock) {                                           // 67
  var self = this;                                                                                                    // 68
  var started = Date.now();                                                                                           // 69
  self._currentProcessingMessages[session.id] = msg;                                                                  // 70
                                                                                                                      // 71
  var unblocked = false;                                                                                              // 72
  var wrappedUnblock = function() {                                                                                   // 73
    if(!unblocked) {                                                                                                  // 74
      var waitTime = Date.now() - started;                                                                            // 75
      var key = self._getMessageKey(session.id, msg.id);                                                              // 76
      var cachedMessage = self._messageCache[key];                                                                    // 77
      if(cachedMessage) {                                                                                             // 78
        cachedMessage.waitTime = waitTime;                                                                            // 79
      }                                                                                                               // 80
      delete self._currentProcessingMessages[session.id];                                                             // 81
      unblocked = true;                                                                                               // 82
      unblock();                                                                                                      // 83
    }                                                                                                                 // 84
  };                                                                                                                  // 85
                                                                                                                      // 86
  return wrappedUnblock;                                                                                              // 87
};                                                                                                                    // 88
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/models/0model.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
KadiraModel = function() {                                                                                            // 1
                                                                                                                      // 2
};                                                                                                                    // 3
                                                                                                                      // 4
KadiraModel.prototype._getDateId = function(timestamp) {                                                              // 5
  var remainder = timestamp % (1000 * 60);                                                                            // 6
  var dateId = timestamp - remainder;                                                                                 // 7
  return dateId;                                                                                                      // 8
};                                                                                                                    // 9
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/models/methods.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var METHOD_METRICS_FIELDS = ['wait', 'db', 'http', 'email', 'async', 'compute', 'total'];                             // 1
                                                                                                                      // 2
MethodsModel = function (metricsThreshold) {                                                                          // 3
  var self = this;                                                                                                    // 4
                                                                                                                      // 5
  this.methodMetricsByMinute = {};                                                                                    // 6
  this.errorMap = {};                                                                                                 // 7
                                                                                                                      // 8
  this._metricsThreshold = _.extend({                                                                                 // 9
    "wait": 100,                                                                                                      // 10
    "db": 100,                                                                                                        // 11
    "http": 1000,                                                                                                     // 12
    "email": 100,                                                                                                     // 13
    "async": 100,                                                                                                     // 14
    "compute": 100,                                                                                                   // 15
    "total": 200                                                                                                      // 16
  }, metricsThreshold || {});                                                                                         // 17
                                                                                                                      // 18
  //store max time elapsed methods for each method, event(metrics-field)                                              // 19
  this.maxEventTimesForMethods = {};                                                                                  // 20
                                                                                                                      // 21
  this.tracerStore = new TracerStore({                                                                                // 22
    interval: 1000 * 60, //process traces every minute                                                                // 23
    maxTotalPoints: 30, //for 30 minutes                                                                              // 24
    archiveEvery: 5 //always trace for every 5 minutes,                                                               // 25
  });                                                                                                                 // 26
                                                                                                                      // 27
  this.tracerStore.start();                                                                                           // 28
};                                                                                                                    // 29
                                                                                                                      // 30
_.extend(MethodsModel.prototype, KadiraModel.prototype);                                                              // 31
                                                                                                                      // 32
MethodsModel.prototype.processMethod = function(methodTrace) {                                                        // 33
  var dateId = this._getDateId(methodTrace.at);                                                                       // 34
                                                                                                                      // 35
  //append metrics to previous values                                                                                 // 36
  this._appendMetrics(dateId, methodTrace);                                                                           // 37
  if(methodTrace.errored) {                                                                                           // 38
    this.methodMetricsByMinute[dateId].methods[methodTrace.name].errors ++                                            // 39
  }                                                                                                                   // 40
                                                                                                                      // 41
  this.tracerStore.addTrace(methodTrace);                                                                             // 42
};                                                                                                                    // 43
                                                                                                                      // 44
MethodsModel.prototype._appendMetrics = function(id, methodTrace) {                                                   // 45
  //initialize meteric for this time interval                                                                         // 46
  if(!this.methodMetricsByMinute[id]) {                                                                               // 47
    this.methodMetricsByMinute[id] = {                                                                                // 48
      // startTime needs to be converted into serverTime before sending                                               // 49
      startTime: methodTrace.at,                                                                                      // 50
      methods: {}                                                                                                     // 51
    };                                                                                                                // 52
  }                                                                                                                   // 53
                                                                                                                      // 54
  var methods = this.methodMetricsByMinute[id].methods;                                                               // 55
                                                                                                                      // 56
  //initialize method                                                                                                 // 57
  if(!methods[methodTrace.name]) {                                                                                    // 58
    methods[methodTrace.name] = {                                                                                     // 59
      count: 0,                                                                                                       // 60
      errors: 0                                                                                                       // 61
    };                                                                                                                // 62
                                                                                                                      // 63
    METHOD_METRICS_FIELDS.forEach(function(field) {                                                                   // 64
      methods[methodTrace.name][field] = 0;                                                                           // 65
    });                                                                                                               // 66
  }                                                                                                                   // 67
                                                                                                                      // 68
  //merge                                                                                                             // 69
  METHOD_METRICS_FIELDS.forEach(function(field) {                                                                     // 70
    var value = methodTrace.metrics[field];                                                                           // 71
    if(value > 0) {                                                                                                   // 72
      methods[methodTrace.name][field] += value;                                                                      // 73
    }                                                                                                                 // 74
  });                                                                                                                 // 75
                                                                                                                      // 76
  methods[methodTrace.name].count++;                                                                                  // 77
  this.methodMetricsByMinute[id].endTime = methodTrace.metrics.at;                                                    // 78
};                                                                                                                    // 79
                                                                                                                      // 80
/*                                                                                                                    // 81
  There are two types of data                                                                                         // 82
                                                                                                                      // 83
  1. methodMetrics - metrics about the methods (for every 10 secs)                                                    // 84
  2. methodRequests - raw method request. normally max, min for every 1 min and errors always                         // 85
*/                                                                                                                    // 86
MethodsModel.prototype.buildPayload = function(buildDetailedInfo) {                                                   // 87
  var payload = {                                                                                                     // 88
    methodMetrics: [],                                                                                                // 89
    methodRequests: []                                                                                                // 90
  };                                                                                                                  // 91
                                                                                                                      // 92
  //handling metrics                                                                                                  // 93
  var methodMetricsByMinute = this.methodMetricsByMinute;                                                             // 94
  this.methodMetricsByMinute = {};                                                                                    // 95
                                                                                                                      // 96
  //create final paylod for methodMetrics                                                                             // 97
  for(var key in methodMetricsByMinute) {                                                                             // 98
    var methodMetrics = methodMetricsByMinute[key];                                                                   // 99
    // converting startTime into the actual serverTime                                                                // 100
    var startTime = methodMetrics.startTime;                                                                          // 101
    methodMetrics.startTime = Kadira.syncedDate.syncTime(startTime);                                                  // 102
                                                                                                                      // 103
    for(var methodName in methodMetrics.methods) {                                                                    // 104
      METHOD_METRICS_FIELDS.forEach(function(field) {                                                                 // 105
        methodMetrics.methods[methodName][field] /=                                                                   // 106
          methodMetrics.methods[methodName].count;                                                                    // 107
      });                                                                                                             // 108
    }                                                                                                                 // 109
                                                                                                                      // 110
    payload.methodMetrics.push(methodMetricsByMinute[key]);                                                           // 111
  }                                                                                                                   // 112
                                                                                                                      // 113
  //collect traces and send them with the payload                                                                     // 114
  payload.methodRequests = this.tracerStore.collectTraces();                                                          // 115
                                                                                                                      // 116
  return payload;                                                                                                     // 117
};                                                                                                                    // 118
                                                                                                                      // 119
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/models/pubsub.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var logger = Npm.require('debug')('kadira:pubsub');                                                                   // 1
                                                                                                                      // 2
PubsubModel = function() {                                                                                            // 3
  this.metricsByMinute = {};                                                                                          // 4
  this.subscriptions = {};                                                                                            // 5
                                                                                                                      // 6
  this.tracerStore = new TracerStore({                                                                                // 7
    interval: 1000 * 60, //process traces every minute                                                                // 8
    maxTotalPoints: 30, //for 30 minutes                                                                              // 9
    archiveEvery: 5 //always trace for every 5 minutes,                                                               // 10
  });                                                                                                                 // 11
                                                                                                                      // 12
  this.tracerStore.start();                                                                                           // 13
}                                                                                                                     // 14
                                                                                                                      // 15
PubsubModel.prototype._trackSub = function(session, msg) {                                                            // 16
  logger('SUB:', session.id, msg.id, msg.name, msg.params);                                                           // 17
  var publication = this._getPublicationName(msg.name);                                                               // 18
  var subscriptionId = msg.id;                                                                                        // 19
  var timestamp = Ntp._now();                                                                                         // 20
  var metrics = this._getMetrics(timestamp, publication);                                                             // 21
                                                                                                                      // 22
  metrics.subs++;                                                                                                     // 23
  this.subscriptions[msg.id] = {                                                                                      // 24
    // We use localTime here, because when we used synedTime we might get                                             // 25
    // minus or more than we've expected                                                                              // 26
    //   (before serverTime diff changed overtime)                                                                    // 27
    startTime: timestamp,                                                                                             // 28
    publication: publication,                                                                                         // 29
    params: msg.params,                                                                                               // 30
    id: msg.id                                                                                                        // 31
  };                                                                                                                  // 32
                                                                                                                      // 33
  //set session startedTime                                                                                           // 34
  session._startTime = session._startTime || timestamp;                                                               // 35
};                                                                                                                    // 36
                                                                                                                      // 37
_.extend(PubsubModel.prototype, KadiraModel.prototype);                                                               // 38
                                                                                                                      // 39
PubsubModel.prototype._trackUnsub = function(session, sub) {                                                          // 40
  logger('UNSUB:', session.id, sub._subscriptionId);                                                                  // 41
  var publication = this._getPublicationName(sub._name);                                                              // 42
  var subscriptionId = sub._subscriptionId;                                                                           // 43
  var subscriptionState = this.subscriptions[subscriptionId];                                                         // 44
                                                                                                                      // 45
  var startTime = null;                                                                                               // 46
  //sometime, we don't have these states                                                                              // 47
  if(subscriptionState) {                                                                                             // 48
    startTime = subscriptionState.startTime;                                                                          // 49
  } else {                                                                                                            // 50
    //if this is null subscription, which is started automatically                                                    // 51
    //hence, we don't have a state                                                                                    // 52
    startTime = session._startTime;                                                                                   // 53
  }                                                                                                                   // 54
                                                                                                                      // 55
  //in case, we can't get the startTime                                                                               // 56
  if(startTime) {                                                                                                     // 57
    var timestamp = Ntp._now();                                                                                       // 58
    var metrics = this._getMetrics(timestamp, publication);                                                           // 59
    //track the count                                                                                                 // 60
    if(sub._name != null) {                                                                                           // 61
      // we can't track subs for `null` publications.                                                                 // 62
      // so we should not track unsubs too                                                                            // 63
      metrics.unsubs++;                                                                                               // 64
    }                                                                                                                 // 65
    //use the current date to get the lifeTime of the subscription                                                    // 66
    metrics.lifeTime += timestamp - startTime;                                                                        // 67
    //this is place we can clean the subscriptionState if exists                                                      // 68
    delete this.subscriptions[subscriptionId];                                                                        // 69
  }                                                                                                                   // 70
};                                                                                                                    // 71
                                                                                                                      // 72
PubsubModel.prototype._trackReady = function(session, sub, trace) {                                                   // 73
  logger('READY:', session.id, sub._subscriptionId);                                                                  // 74
  //use the current time to track the response time                                                                   // 75
  var publication = this._getPublicationName(sub._name);                                                              // 76
  var subscriptionId = sub._subscriptionId;                                                                           // 77
  var timestamp = Ntp._now();                                                                                         // 78
  var metrics = this._getMetrics(timestamp, publication);                                                             // 79
                                                                                                                      // 80
  var subscriptionState = this.subscriptions[subscriptionId];                                                         // 81
  if(subscriptionState && !subscriptionState.readyTracked) {                                                          // 82
    metrics.resTime += timestamp - subscriptionState.startTime;                                                       // 83
    subscriptionState.readyTracked = true;                                                                            // 84
  }                                                                                                                   // 85
                                                                                                                      // 86
  if(trace) {                                                                                                         // 87
    this.tracerStore.addTrace(trace);                                                                                 // 88
  }                                                                                                                   // 89
};                                                                                                                    // 90
                                                                                                                      // 91
PubsubModel.prototype._trackError = function(session, sub, trace) {                                                   // 92
  logger('ERROR:', session.id, sub._subscriptionId);                                                                  // 93
  //use the current time to track the response time                                                                   // 94
  var publication = this._getPublicationName(sub._name);                                                              // 95
  var subscriptionId = sub._subscriptionId;                                                                           // 96
  var timestamp = Ntp._now();                                                                                         // 97
  var metrics = this._getMetrics(timestamp, publication);                                                             // 98
                                                                                                                      // 99
  metrics.errors++;                                                                                                   // 100
                                                                                                                      // 101
  if(trace) {                                                                                                         // 102
    this.tracerStore.addTrace(trace);                                                                                 // 103
  }                                                                                                                   // 104
};                                                                                                                    // 105
                                                                                                                      // 106
PubsubModel.prototype._trackNetworkImpact = function(session, sub, event, collection, id, stringifiedFields) {        // 107
  logger('DI:' + event, session.id, sub._subscriptionId, collection, id);                                             // 108
  if(event != 'removed' && stringifiedFields) {                                                                       // 109
    var subscriptionId = sub._subscriptionId;                                                                         // 110
    var subscriptionState = this.subscriptions[subscriptionId];                                                       // 111
                                                                                                                      // 112
    var publication = this._getPublicationName(sub._name);                                                            // 113
    var timestamp = Ntp._now();                                                                                       // 114
    var metrics = this._getMetrics(timestamp, publication);                                                           // 115
                                                                                                                      // 116
    if(subscriptionState) {                                                                                           // 117
      var sendingDataSize = Buffer.byteLength(stringifiedFields);                                                     // 118
      sub._totalDocsSent = sub._totalDocsSent || 0;                                                                   // 119
      sub._totalDocsSent++;                                                                                           // 120
      sub._totalDataSent = sub._totalDataSent || 0;                                                                   // 121
      sub._totalDataSent += sendingDataSize;                                                                          // 122
      if(subscriptionState.readyTracked) {                                                                            // 123
        //using JSON instead of EJSON to save the CPU usage                                                           // 124
        if(event == 'added') {                                                                                        // 125
          metrics.bytesAddedAfterReady += sendingDataSize;                                                            // 126
        } else if(event == 'changed') {                                                                               // 127
          metrics.bytesChangedAfterReady += sendingDataSize;                                                          // 128
        };                                                                                                            // 129
      } else {                                                                                                        // 130
        metrics.bytesBeforeReady += sendingDataSize;                                                                  // 131
      }                                                                                                               // 132
    }                                                                                                                 // 133
  }                                                                                                                   // 134
};                                                                                                                    // 135
                                                                                                                      // 136
PubsubModel.prototype._getMetrics = function(timestamp, publication) {                                                // 137
  var dateId = this._getDateId(timestamp);                                                                            // 138
                                                                                                                      // 139
  if(!this.metricsByMinute[dateId]) {                                                                                 // 140
    this.metricsByMinute[dateId] = {                                                                                  // 141
      // startTime needs to be convert to serverTime before sending to the server                                     // 142
      startTime: timestamp,                                                                                           // 143
      pubs: {}                                                                                                        // 144
    };                                                                                                                // 145
  }                                                                                                                   // 146
                                                                                                                      // 147
  if(!this.metricsByMinute[dateId].pubs[publication]) {                                                               // 148
    this.metricsByMinute[dateId].pubs[publication] = {                                                                // 149
      subs: 0,                                                                                                        // 150
      unsubs: 0,                                                                                                      // 151
      resTime: 0,                                                                                                     // 152
      bytesBeforeReady: 0,                                                                                            // 153
      bytesAddedAfterReady: 0,                                                                                        // 154
      bytesChangedAfterReady: 0,                                                                                      // 155
      activeSubs: 0,                                                                                                  // 156
      activeDocs: 0,                                                                                                  // 157
      lifeTime: 0,                                                                                                    // 158
      totalObservers: 0,                                                                                              // 159
      cachedObservers: 0,                                                                                             // 160
      createdObservers: 0,                                                                                            // 161
      deletedObservers: 0,                                                                                            // 162
      avgDocSize: 0,                                                                                                  // 163
      errors: 0                                                                                                       // 164
    };                                                                                                                // 165
  }                                                                                                                   // 166
                                                                                                                      // 167
  return this.metricsByMinute[dateId].pubs[publication];                                                              // 168
};                                                                                                                    // 169
                                                                                                                      // 170
PubsubModel.prototype._getPublicationName = function(name) {                                                          // 171
  return name || "null(autopublish)";                                                                                 // 172
};                                                                                                                    // 173
                                                                                                                      // 174
PubsubModel.prototype._getSubscriptionInfo = function() {                                                             // 175
  var self = this;                                                                                                    // 176
  var activeSubs = {};                                                                                                // 177
  var activeDocs = {};                                                                                                // 178
  var totalDocsSent = {};                                                                                             // 179
  var totalDataSent = {};                                                                                             // 180
  var totalObservers = {};                                                                                            // 181
  var cachedObservers = {};                                                                                           // 182
                                                                                                                      // 183
  for(var sessionId in Meteor.default_server.sessions) {                                                              // 184
    var session = Meteor.default_server.sessions[sessionId];                                                          // 185
    _.each(session._namedSubs, countSubData);                                                                         // 186
    _.each(session._universalSubs, countSubData);                                                                     // 187
  }                                                                                                                   // 188
                                                                                                                      // 189
  var avgDocSize = {};                                                                                                // 190
  _.each(totalDataSent, function(value, publication) {                                                                // 191
    avgDocSize[publication] = totalDataSent[publication] / totalDocsSent[publication];                                // 192
  });                                                                                                                 // 193
                                                                                                                      // 194
  var avgObserverReuse = {};                                                                                          // 195
  _.each(totalObservers, function(value, publication) {                                                               // 196
    avgObserverReuse[publication] = cachedObservers[publication] / totalObservers[publication];                       // 197
  });                                                                                                                 // 198
                                                                                                                      // 199
  return {                                                                                                            // 200
    activeSubs: activeSubs,                                                                                           // 201
    activeDocs: activeDocs,                                                                                           // 202
    avgDocSize: avgDocSize,                                                                                           // 203
    avgObserverReuse: avgObserverReuse                                                                                // 204
  };                                                                                                                  // 205
                                                                                                                      // 206
  function countSubData (sub) {                                                                                       // 207
    var publication = self._getPublicationName(sub._name);                                                            // 208
    countSubscriptions(sub, publication);                                                                             // 209
    countDocuments(sub, publication);                                                                                 // 210
    countTotalDocsSent(sub, publication);                                                                             // 211
    countTotalDataSent(sub, publication);                                                                             // 212
    countObservers(sub, publication);                                                                                 // 213
  }                                                                                                                   // 214
                                                                                                                      // 215
  function countSubscriptions (sub, publication) {                                                                    // 216
    activeSubs[publication] = activeSubs[publication] || 0;                                                           // 217
    activeSubs[publication]++;                                                                                        // 218
  }                                                                                                                   // 219
                                                                                                                      // 220
  function countDocuments (sub, publication) {                                                                        // 221
    activeDocs[publication] = activeDocs[publication] || 0;                                                           // 222
    for(collectionName in sub._documents) {                                                                           // 223
      activeDocs[publication] += _.keys(sub._documents[collectionName]).length;                                       // 224
    }                                                                                                                 // 225
  }                                                                                                                   // 226
                                                                                                                      // 227
  function countTotalDocsSent (sub, publication) {                                                                    // 228
    totalDocsSent[publication] = totalDocsSent[publication] || 0;                                                     // 229
    totalDocsSent[publication] += sub._totalDocsSent;                                                                 // 230
  }                                                                                                                   // 231
                                                                                                                      // 232
  function countTotalDataSent (sub, publication) {                                                                    // 233
    totalDataSent[publication] = totalDataSent[publication] || 0;                                                     // 234
    totalDataSent[publication] += sub._totalDataSent;                                                                 // 235
  }                                                                                                                   // 236
                                                                                                                      // 237
  function countObservers(sub, publication) {                                                                         // 238
    totalObservers[publication] = totalObservers[publication] || 0;                                                   // 239
    cachedObservers[publication] = cachedObservers[publication] || 0;                                                 // 240
                                                                                                                      // 241
    totalObservers[publication] += sub._totalObservers;                                                               // 242
    cachedObservers[publication] += sub._cachedObservers;                                                             // 243
  }                                                                                                                   // 244
}                                                                                                                     // 245
                                                                                                                      // 246
PubsubModel.prototype.buildPayload = function(buildDetailInfo) {                                                      // 247
  var metricsByMinute = this.metricsByMinute;                                                                         // 248
  this.metricsByMinute = {};                                                                                          // 249
                                                                                                                      // 250
  var payload = {                                                                                                     // 251
    pubMetrics: []                                                                                                    // 252
  };                                                                                                                  // 253
                                                                                                                      // 254
  var subscriptionData = this._getSubscriptionInfo();                                                                 // 255
  var activeSubs = subscriptionData.activeSubs;                                                                       // 256
  var activeDocs = subscriptionData.activeDocs;                                                                       // 257
  var avgDocSize = subscriptionData.avgDocSize;                                                                       // 258
  var avgObserverReuse = subscriptionData.avgObserverReuse;                                                           // 259
                                                                                                                      // 260
  //to the averaging                                                                                                  // 261
  for(var dateId in metricsByMinute) {                                                                                // 262
    var dateMetrics = metricsByMinute[dateId];                                                                        // 263
    // We need to convert startTime into actual serverTime                                                            // 264
    dateMetrics.startTime = Kadira.syncedDate.syncTime(dateMetrics.startTime);                                        // 265
                                                                                                                      // 266
    for(var publication in metricsByMinute[dateId].pubs) {                                                            // 267
      var singlePubMetrics = metricsByMinute[dateId].pubs[publication];                                               // 268
      // We only calculate resTime for new subscriptions                                                              // 269
      singlePubMetrics.resTime /= singlePubMetrics.subs;                                                              // 270
      singlePubMetrics.resTime = singlePubMetrics.resTime || 0;                                                       // 271
      // We only track lifeTime in the unsubs                                                                         // 272
      singlePubMetrics.lifeTime /= singlePubMetrics.unsubs;                                                           // 273
      singlePubMetrics.lifeTime = singlePubMetrics.lifeTime || 0;                                                     // 274
                                                                                                                      // 275
      // This is a very efficient solution. We can come up with another solution                                      // 276
      // which maintains the count inside the API.                                                                    // 277
      // But for now, this is the most reliable method.                                                               // 278
                                                                                                                      // 279
      // If there are two ore more dateIds, we will be using the currentCount for all of them.                        // 280
      // We can come up with a better solution later on.                                                              // 281
      singlePubMetrics.activeSubs = activeSubs[publication] || 0;                                                     // 282
      singlePubMetrics.activeDocs = activeDocs[publication] || 0;                                                     // 283
      singlePubMetrics.avgDocSize = avgDocSize[publication] || 0;                                                     // 284
      singlePubMetrics.avgObserverReuse = avgObserverReuse[publication] || 0;                                         // 285
    }                                                                                                                 // 286
    payload.pubMetrics.push(metricsByMinute[dateId]);                                                                 // 287
  }                                                                                                                   // 288
                                                                                                                      // 289
  //collect traces and send them with the payload                                                                     // 290
  payload.pubRequests = this.tracerStore.collectTraces();                                                             // 291
                                                                                                                      // 292
  return payload;                                                                                                     // 293
};                                                                                                                    // 294
                                                                                                                      // 295
PubsubModel.prototype.incrementHandleCount = function(trace, isCached) {                                              // 296
  var publicationName = trace.name;                                                                                   // 297
  var timestamp = Ntp._now();                                                                                         // 298
  var publication = this._getMetrics(timestamp, publicationName);                                                     // 299
                                                                                                                      // 300
  var session = Meteor.default_server.sessions[trace.session];                                                        // 301
  if(session) {                                                                                                       // 302
    var sub = session._namedSubs[trace.id];                                                                           // 303
    if(sub) {                                                                                                         // 304
      sub._totalObservers = sub._totalObservers || 0;                                                                 // 305
      sub._cachedObservers = sub._cachedObservers || 0;                                                               // 306
    }                                                                                                                 // 307
  }                                                                                                                   // 308
  // not sure, we need to do this? But I don't need to break the however                                              // 309
  sub = sub || {_totalObservers:0 , _cachedObservers: 0};                                                             // 310
                                                                                                                      // 311
  publication.totalObservers++;                                                                                       // 312
  sub._totalObservers++;                                                                                              // 313
  if(isCached) {                                                                                                      // 314
    publication.cachedObservers++;                                                                                    // 315
    sub._cachedObservers++;                                                                                           // 316
  }                                                                                                                   // 317
}                                                                                                                     // 318
                                                                                                                      // 319
PubsubModel.prototype.trackCreatedObserver = function(info) {                                                         // 320
  var timestamp = Ntp._now();                                                                                         // 321
  var publication = this._getMetrics(timestamp, info.name);                                                           // 322
  publication.createdObservers++;                                                                                     // 323
}                                                                                                                     // 324
                                                                                                                      // 325
PubsubModel.prototype.trackDeletedObserver = function(info) {                                                         // 326
  var timestamp = Ntp._now();                                                                                         // 327
  var publication = this._getMetrics(timestamp, info.name);                                                           // 328
  publication.deletedObservers++;                                                                                     // 329
}                                                                                                                     // 330
                                                                                                                      // 331
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/models/system.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var os = Npm.require('os');                                                                                           // 1
                                                                                                                      // 2
SystemModel = function () {                                                                                           // 3
  var self = this;                                                                                                    // 4
  this.startTime = Ntp._now();                                                                                        // 5
  this.newSessions = 0;                                                                                               // 6
  this.sessionTimeout = 1000 * 60 * 30; //30 min                                                                      // 7
                                                                                                                      // 8
  try {                                                                                                               // 9
    var usage = Kadira._binaryRequire('usage');                                                                       // 10
    this.usageLookup = Kadira._wrapAsync(usage.lookup.bind(usage));                                                   // 11
  } catch(ex) {                                                                                                       // 12
    console.error('Kadira: usage npm module loading failed - ', ex.message);                                          // 13
  }                                                                                                                   // 14
}                                                                                                                     // 15
                                                                                                                      // 16
_.extend(SystemModel.prototype, KadiraModel.prototype);                                                               // 17
                                                                                                                      // 18
SystemModel.prototype.buildPayload = function() {                                                                     // 19
  var metrics = {};                                                                                                   // 20
  var now = Ntp._now();                                                                                               // 21
  metrics.startTime = Kadira.syncedDate.syncTime(this.startTime);                                                     // 22
  metrics.endTime = Kadira.syncedDate.syncTime(now);                                                                  // 23
                                                                                                                      // 24
  metrics.sessions = _.keys(Meteor.default_server.sessions).length;                                                   // 25
  metrics.memory = process.memoryUsage().rss / (1024*1024);                                                           // 26
  metrics.newSessions = this.newSessions;                                                                             // 27
  this.newSessions = 0;                                                                                               // 28
                                                                                                                      // 29
  var usage = this.getUsage() || {};                                                                                  // 30
  metrics.pcpu = usage.cpu;                                                                                           // 31
  if(usage.cpuInfo) {                                                                                                 // 32
    metrics.cputime = usage.cpuInfo.cpuTime;                                                                          // 33
    metrics.pcpuUser = usage.cpuInfo.pcpuUser;                                                                        // 34
    metrics.pcpuSystem = usage.cpuInfo.pcpuSystem;                                                                    // 35
  }                                                                                                                   // 36
                                                                                                                      // 37
  this.startTime = now;                                                                                               // 38
  return {systemMetrics: [metrics]};                                                                                  // 39
};                                                                                                                    // 40
                                                                                                                      // 41
SystemModel.prototype.getUsage = function() {                                                                         // 42
  if(this.usageLookup && !this._dontTrackUsage) {                                                                     // 43
    try {                                                                                                             // 44
      return this.usageLookup(process.pid, {keepHistory: true});                                                      // 45
    } catch(ex) {                                                                                                     // 46
      if(/Unsupported OS/.test(ex.message)) {                                                                         // 47
        this._dontTrackUsage = true;                                                                                  // 48
        var message =                                                                                                 // 49
          "kadira: we can't track CPU usage in this OS. " +                                                           // 50
          "But it will work when you deploy your app!"                                                                // 51
        console.warn(message);                                                                                        // 52
      } else {                                                                                                        // 53
        throw ex;                                                                                                     // 54
      }                                                                                                               // 55
    }                                                                                                                 // 56
  }                                                                                                                   // 57
};                                                                                                                    // 58
                                                                                                                      // 59
SystemModel.prototype.handleSessionActivity = function(msg, session) {                                                // 60
  if(msg.msg === 'connect' && !msg.session) {                                                                         // 61
    this.countNewSession(session);                                                                                    // 62
  } else if(['sub', 'method'].indexOf(msg.msg) != -1) {                                                               // 63
    if(!this.isSessionActive(session)) {                                                                              // 64
      this.countNewSession(session);                                                                                  // 65
    }                                                                                                                 // 66
  }                                                                                                                   // 67
  session._activeAt = Date.now();                                                                                     // 68
}                                                                                                                     // 69
                                                                                                                      // 70
SystemModel.prototype.countNewSession = function(session) {                                                           // 71
  if(!isLocalAddress(session.socket)) {                                                                               // 72
    this.newSessions++;                                                                                               // 73
  }                                                                                                                   // 74
}                                                                                                                     // 75
                                                                                                                      // 76
SystemModel.prototype.isSessionActive = function(session) {                                                           // 77
  var inactiveTime = Date.now() - session._activeAt;                                                                  // 78
  return inactiveTime < this.sessionTimeout;                                                                          // 79
}                                                                                                                     // 80
                                                                                                                      // 81
// ------------------------------------------------------------------------- //                                       // 82
                                                                                                                      // 83
// http://regex101.com/r/iF3yR3/2                                                                                     // 84
var isLocalHostRegex = /^(?:.*\.local|localhost)(?:\:\d+)?|127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/;
                                                                                                                      // 86
// http://regex101.com/r/hM5gD8/1                                                                                     // 87
var isLocalAddressRegex = /^127(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}$/;
                                                                                                                      // 89
function isLocalAddress (socket) {                                                                                    // 90
  var host = socket.headers['host'];                                                                                  // 91
  if(host) return isLocalHostRegex.test(host);                                                                        // 92
  var address = socket.headers['x-forwarded-for'] || socket.remoteAddress;                                            // 93
  if(address) return isLocalAddressRegex.test(address);                                                               // 94
}                                                                                                                     // 95
                                                                                                                      // 96
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/models/errors.js                                                                   //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
ErrorModel = function (appId) {                                                                                       // 1
  BaseErrorModel.call(this);                                                                                          // 2
  var self = this;                                                                                                    // 3
  this.appId = appId;                                                                                                 // 4
  this.errors = {};                                                                                                   // 5
  this.startTime = Date.now();                                                                                        // 6
  this.maxErrors = 10;                                                                                                // 7
}                                                                                                                     // 8
                                                                                                                      // 9
_.extend(ErrorModel.prototype, KadiraModel.prototype);                                                                // 10
_.extend(ErrorModel.prototype, BaseErrorModel.prototype);                                                             // 11
                                                                                                                      // 12
ErrorModel.prototype.buildPayload = function() {                                                                      // 13
  var metrics = _.values(this.errors);                                                                                // 14
  this.startTime = Date.now();                                                                                        // 15
  this.errors = {};                                                                                                   // 16
  return {errors: metrics};                                                                                           // 17
};                                                                                                                    // 18
                                                                                                                      // 19
ErrorModel.prototype.errorCount = function () {                                                                       // 20
  return _.values(this.errors).length;                                                                                // 21
};                                                                                                                    // 22
                                                                                                                      // 23
ErrorModel.prototype.trackError = function(ex, trace) {                                                               // 24
  var key = trace.type + ':' + ex.message;                                                                            // 25
  if(this.errors[key]) {                                                                                              // 26
    this.errors[key].count++;                                                                                         // 27
  } else if (this.errorCount() < this.maxErrors) {                                                                    // 28
    var errorDef = this._formatError(ex, trace);                                                                      // 29
    if(this.applyFilters(errorDef.type, errorDef.name, ex, errorDef.subType)) {                                       // 30
      this.errors[key] = this._formatError(ex, trace);                                                                // 31
    }                                                                                                                 // 32
  }                                                                                                                   // 33
};                                                                                                                    // 34
                                                                                                                      // 35
ErrorModel.prototype._formatError = function(ex, trace) {                                                             // 36
  var time = Date.now();                                                                                              // 37
  return {                                                                                                            // 38
    appId: this.appId,                                                                                                // 39
    name: ex.message,                                                                                                 // 40
    type: trace.type,                                                                                                 // 41
    startTime: time,                                                                                                  // 42
    subType: trace.subType || trace.name,                                                                             // 43
    trace: trace,                                                                                                     // 44
    stacks: [{stack: ex.stack}],                                                                                      // 45
    count: 1,                                                                                                         // 46
  }                                                                                                                   // 47
};                                                                                                                    // 48
                                                                                                                      // 49
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/kadira.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var http = Npm.require('http');                                                                                       // 1
var hostname = Npm.require('os').hostname();                                                                          // 2
var logger = Npm.require('debug')('kadira:apm');                                                                      // 3
var Fibers = Npm.require('fibers');                                                                                   // 4
                                                                                                                      // 5
Kadira.models = {};                                                                                                   // 6
Kadira.options = {};                                                                                                  // 7
Kadira.env = {                                                                                                        // 8
  currentSub: null, // keep current subscription inside ddp                                                           // 9
  kadiraInfo: new Meteor.EnvironmentVariable(),                                                                       // 10
};                                                                                                                    // 11
Kadira.waitTimeBuilder = new WaitTimeBuilder();                                                                       // 12
Kadira.errors = [];                                                                                                   // 13
Kadira.errors.addFilter = Kadira.errors.push.bind(Kadira.errors);                                                     // 14
                                                                                                                      // 15
Kadira.connect = function(appId, appSecret, options) {                                                                // 16
  options = options || {};                                                                                            // 17
  options.appId = appId;                                                                                              // 18
  options.appSecret = appSecret;                                                                                      // 19
  options.payloadTimeout = options.payloadTimeout || 1000 * 20;                                                       // 20
  options.endpoint = options.endpoint || "https://engine.kadira.io";                                                  // 21
  options.thresholds = options.thresholds || {};                                                                      // 22
  options.hostname = options.hostname || hostname;                                                                    // 23
                                                                                                                      // 24
  // remove trailing slash from endpoint url (if any)                                                                 // 25
  if(_.last(options.endpoint) === '/') {                                                                              // 26
    options.endpoint = options.endpoint.substr(0, options.endpoint.length - 1);                                       // 27
  }                                                                                                                   // 28
                                                                                                                      // 29
  // error tracking is enabled by default                                                                             // 30
  if(options.enableErrorTracking === undefined) {                                                                     // 31
    options.enableErrorTracking = true;                                                                               // 32
  }                                                                                                                   // 33
                                                                                                                      // 34
  Kadira.options = options;                                                                                           // 35
  Kadira.options.authHeaders = {                                                                                      // 36
    'KADIRA-APP-ID': Kadira.options.appId,                                                                            // 37
    'KADIRA-APP-SECRET': Kadira.options.appSecret                                                                     // 38
  };                                                                                                                  // 39
                                                                                                                      // 40
  Kadira.syncedDate = new Ntp(options.endpoint);                                                                      // 41
  Kadira.syncedDate.sync();                                                                                           // 42
  Kadira.models.methods = new MethodsModel(options.thresholds.methods);                                               // 43
  Kadira.models.pubsub = new PubsubModel();                                                                           // 44
  Kadira.models.system = new SystemModel();                                                                           // 45
  Kadira.models.error = new ErrorModel(appId);                                                                        // 46
                                                                                                                      // 47
  // handle pre-added filters                                                                                         // 48
  var addFilterFn = Kadira.models.error.addFilter.bind(Kadira.models.error);                                          // 49
  Kadira.errors.forEach(addFilterFn);                                                                                 // 50
  Kadira.errors = Kadira.models.error;                                                                                // 51
                                                                                                                      // 52
  // setting runtime info, which will be sent to kadira                                                               // 53
  __meteor_runtime_config__.kadira = {                                                                                // 54
    appId: appId,                                                                                                     // 55
    endpoint: options.endpoint                                                                                        // 56
  };                                                                                                                  // 57
                                                                                                                      // 58
  if(options.enableErrorTracking) {                                                                                   // 59
    Kadira.enableErrorTracking();                                                                                     // 60
  } else {                                                                                                            // 61
    Kadira.disableErrorTracking();                                                                                    // 62
  }                                                                                                                   // 63
                                                                                                                      // 64
  if(appId && appSecret) {                                                                                            // 65
    options.appId = options.appId.trim();                                                                             // 66
    options.appSecret = options.appSecret.trim();                                                                     // 67
    Kadira._pingToCheckAuth(function(){                                                                               // 68
      // it takes time to calculate version 'sha' values                                                              // 69
      // it'll be ready when Meteor.startup is called                                                                 // 70
      Meteor.startup(Kadira._sendAppStats);                                                                           // 71
      Kadira._schedulePayloadSend();                                                                                  // 72
    });                                                                                                               // 73
    logger('connected to app: ', appId);                                                                              // 74
  } else {                                                                                                            // 75
    throw new Error('Kadira: required appId and appSecret');                                                          // 76
  }                                                                                                                   // 77
                                                                                                                      // 78
  // start tracking errors                                                                                            // 79
  Meteor.startup(function () {                                                                                        // 80
    TrackUncaughtExceptions();                                                                                        // 81
    TrackMeteorDebug();                                                                                               // 82
  })                                                                                                                  // 83
                                                                                                                      // 84
  //start wrapping Meteor's internal methods                                                                          // 85
  Kadira._startInstrumenting(function() {                                                                             // 86
    console.log('Kadira: completed instrumenting the app')                                                            // 87
    Kadira.connected = true;                                                                                          // 88
  });                                                                                                                 // 89
                                                                                                                      // 90
  Meteor.publish(null, function () {                                                                                  // 91
    var options = __meteor_runtime_config__.kadira;                                                                   // 92
    this.added('kadira_settings', Random.id(), options);                                                              // 93
    this.ready();                                                                                                     // 94
  });                                                                                                                 // 95
};                                                                                                                    // 96
                                                                                                                      // 97
//track how many times we've sent the data (once per minute)                                                          // 98
Kadira._buildPayload = function () {                                                                                  // 99
  var payload = {host: Kadira.options.hostname};                                                                      // 100
  var buildDetailedInfo = Kadira._isDetailedInfo();                                                                   // 101
  _.extend(payload, Kadira.models.methods.buildPayload(buildDetailedInfo));                                           // 102
  _.extend(payload, Kadira.models.pubsub.buildPayload(buildDetailedInfo));                                            // 103
  _.extend(payload, Kadira.models.system.buildPayload());                                                             // 104
  if(Kadira.options.enableErrorTracking) {                                                                            // 105
    _.extend(payload, Kadira.models.error.buildPayload());                                                            // 106
  }                                                                                                                   // 107
                                                                                                                      // 108
  return payload;                                                                                                     // 109
}                                                                                                                     // 110
                                                                                                                      // 111
Kadira._countDataSent = 0;                                                                                            // 112
Kadira._detailInfoSentInterval = Math.ceil((1000*60) / Kadira.options.payloadTimeout);                                // 113
Kadira._isDetailedInfo = function () {                                                                                // 114
  return (Kadira._countDataSent++ % Kadira._detailInfoSentInterval) == 0;                                             // 115
}                                                                                                                     // 116
                                                                                                                      // 117
Kadira.authCheckFailures = 0;                                                                                         // 118
Kadira._pingToCheckAuth = function (callback) {                                                                       // 119
  var httpOptions = {headers: Kadira.options.authHeaders, data: {}};                                                  // 120
  var endpoint = Kadira.options.endpoint + '/ping';                                                                   // 121
  var authRetry = new Retry({                                                                                         // 122
    minCount: 0, // don't do any immediate retries                                                                    // 123
    baseTimeout: 5 * 1000                                                                                             // 124
  });                                                                                                                 // 125
                                                                                                                      // 126
  new Fibers(function() {                                                                                             // 127
    HTTP.call('POST', endpoint, httpOptions, function(err, response){                                                 // 128
      if(response) {                                                                                                  // 129
        if(response.statusCode == 200) {                                                                              // 130
          console.log('Kadira: successfully authenticated');                                                          // 131
          authRetry.clear();                                                                                          // 132
          callback();                                                                                                 // 133
        } else if(response.statusCode == 401) {                                                                       // 134
          console.error('Kadira: authentication failed - check your appId & appSecret')                               // 135
        } else {                                                                                                      // 136
          retryPingToCheckAuth();                                                                                     // 137
        }                                                                                                             // 138
      } else {                                                                                                        // 139
        retryPingToCheckAuth();                                                                                       // 140
      }                                                                                                               // 141
    });                                                                                                               // 142
  }).run();                                                                                                           // 143
                                                                                                                      // 144
  function retryPingToCheckAuth(){                                                                                    // 145
    console.log('Kadira: retrying to authenticate');                                                                  // 146
    authRetry.retryLater(Kadira.authCheckFailures, function(){                                                        // 147
      Kadira._pingToCheckAuth(callback);                                                                              // 148
    });                                                                                                               // 149
  }                                                                                                                   // 150
}                                                                                                                     // 151
                                                                                                                      // 152
Kadira._sendAppStats = function () {                                                                                  // 153
  var appStats = {};                                                                                                  // 154
  appStats.release = Meteor.release;                                                                                  // 155
  appStats.packageVersions = [];                                                                                      // 156
  appStats.appVersions = {                                                                                            // 157
    webapp: __meteor_runtime_config__['autoupdateVersion'],                                                           // 158
    refreshable: __meteor_runtime_config__['autoupdateVersionRefreshable'],                                           // 159
    cordova: __meteor_runtime_config__['autoupdateVersionCordova']                                                    // 160
  }                                                                                                                   // 161
                                                                                                                      // 162
  // TODO get version number for installed packages                                                                   // 163
  _.each(Package, function (v, name) {                                                                                // 164
    appStats.packageVersions.push({name: name, version: null});                                                       // 165
  });                                                                                                                 // 166
                                                                                                                      // 167
  Kadira._send({                                                                                                      // 168
    host: Kadira.options.hostname,                                                                                    // 169
    startTime: new Date(),                                                                                            // 170
    appStats: appStats                                                                                                // 171
  });                                                                                                                 // 172
}                                                                                                                     // 173
                                                                                                                      // 174
Kadira._schedulePayloadSend = function () {                                                                           // 175
  setTimeout(function () {                                                                                            // 176
    Kadira._sendPayload(Kadira._schedulePayloadSend);                                                                 // 177
  }, Kadira.options.payloadTimeout);                                                                                  // 178
}                                                                                                                     // 179
                                                                                                                      // 180
Kadira._sendPayload = function (callback) {                                                                           // 181
  new Fibers(function() {                                                                                             // 182
    var payload = Kadira._buildPayload();                                                                             // 183
    Kadira._send(payload, function (err) {                                                                            // 184
      if(err) {                                                                                                       // 185
        console.error('Kadira: Error sending payload (dropped after 5 tries)', err.message);                          // 186
      }                                                                                                               // 187
                                                                                                                      // 188
      callback && callback();                                                                                         // 189
    });                                                                                                               // 190
  }).run();                                                                                                           // 191
}                                                                                                                     // 192
                                                                                                                      // 193
Kadira._send = function (payload, callback) {                                                                         // 194
  var endpoint = Kadira.options.endpoint;                                                                             // 195
  var httpOptions = {headers: Kadira.options.authHeaders, data: payload};                                             // 196
  var payloadRetries = 0;                                                                                             // 197
  var payloadRetry = new Retry({                                                                                      // 198
    minCount: 0, // don't do any immediate payloadRetries                                                             // 199
    baseTimeout: 5*1000,                                                                                              // 200
    maxTimeout: 60000                                                                                                 // 201
  });                                                                                                                 // 202
                                                                                                                      // 203
  callHTTP();                                                                                                         // 204
                                                                                                                      // 205
  function callHTTP() {                                                                                               // 206
    new Fibers(function() {                                                                                           // 207
      HTTP.call('POST', endpoint, httpOptions, function(err, response){                                               // 208
        if(response && response.statusCode === 401) {                                                                 // 209
          // do not retry if authentication fails                                                                     // 210
          throw new Error('Kadira: AppId, AppSecret combination is invalid');                                         // 211
        }                                                                                                             // 212
                                                                                                                      // 213
        if(response && response.statusCode == 200) {                                                                  // 214
          if(payloadRetries > 0) {                                                                                    // 215
            logger('connected again and payload sent.')                                                               // 216
          }                                                                                                           // 217
          cleaPayloadRetry();                                                                                         // 218
          callback && callback();                                                                                     // 219
        } else {                                                                                                      // 220
          tryAgain(err);                                                                                              // 221
        }                                                                                                             // 222
      });                                                                                                             // 223
    }).run();                                                                                                         // 224
  }                                                                                                                   // 225
                                                                                                                      // 226
  function tryAgain(err) {                                                                                            // 227
    err = err || {};                                                                                                  // 228
    logger('retrying to send payload to server')                                                                      // 229
    if(++payloadRetries < 5) {                                                                                        // 230
      payloadRetry.retryLater(payloadRetries, callHTTP);                                                              // 231
    } else {                                                                                                          // 232
      cleaPayloadRetry();                                                                                             // 233
      callback && callback(err);                                                                                      // 234
    }                                                                                                                 // 235
  }                                                                                                                   // 236
                                                                                                                      // 237
  function cleaPayloadRetry() {                                                                                       // 238
    payloadRetries = 0;                                                                                               // 239
    payloadRetry.clear();                                                                                             // 240
  }                                                                                                                   // 241
}                                                                                                                     // 242
                                                                                                                      // 243
// this return the __kadiraInfo from the current Fiber by default                                                     // 244
// if called with 2nd argument as true, it will get the kadira info from                                              // 245
// Meteor.EnvironmentVariable                                                                                         // 246
//                                                                                                                    // 247
// WARNNING: returned info object is the reference object.                                                            // 248
//  Changing it might cause issues when building traces. So use with care                                             // 249
Kadira._getInfo = function(currentFiber, useEnvironmentVariable) {                                                    // 250
  currentFiber = currentFiber || Fibers.current;                                                                      // 251
  if(currentFiber) {                                                                                                  // 252
    if(useEnvironmentVariable) {                                                                                      // 253
      return Kadira.env.kadiraInfo.get();                                                                             // 254
    }                                                                                                                 // 255
    return currentFiber.__kadiraInfo;                                                                                 // 256
  }                                                                                                                   // 257
};                                                                                                                    // 258
                                                                                                                      // 259
// this does not clone the info object. So, use with care                                                             // 260
Kadira._setInfo = function(info) {                                                                                    // 261
  Fibers.current.__kadiraInfo = info;                                                                                 // 262
};                                                                                                                    // 263
                                                                                                                      // 264
Kadira.enableErrorTracking = function () {                                                                            // 265
  __meteor_runtime_config__.kadira.enableErrorTracking = true;                                                        // 266
  Kadira.options.enableErrorTracking = true;                                                                          // 267
};                                                                                                                    // 268
                                                                                                                      // 269
Kadira.disableErrorTracking = function () {                                                                           // 270
  __meteor_runtime_config__.kadira.enableErrorTracking = false;                                                       // 271
  Kadira.options.enableErrorTracking = false;                                                                         // 272
};                                                                                                                    // 273
                                                                                                                      // 274
Kadira.trackError = function (type, message, options) {                                                               // 275
  if(Kadira.options.enableErrorTracking && type && message) {                                                         // 276
    options = options || {};                                                                                          // 277
    options.subType = options.subType || 'server';                                                                    // 278
    options.stacks = options.stacks || '';                                                                            // 279
    var error = {message: message, stack: options.stacks};                                                            // 280
    var trace = {                                                                                                     // 281
      type: type,                                                                                                     // 282
      subType: options.subType,                                                                                       // 283
      name: message,                                                                                                  // 284
      errored: true,                                                                                                  // 285
      at: Kadira.syncedDate.getTime(),                                                                                // 286
      events: [['start', 0, {}], ['error', 0, {error: error}]],                                                       // 287
      metrics: {total: 0}                                                                                             // 288
    };                                                                                                                // 289
    Kadira.models.error.trackError(error, trace);                                                                     // 290
  }                                                                                                                   // 291
}                                                                                                                     // 292
                                                                                                                      // 293
Kadira.ignoreErrorTracking = function (err) {                                                                         // 294
  err._skipKadira = true;                                                                                             // 295
}                                                                                                                     // 296
                                                                                                                      // 297
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/check_for_oplog.js                                                                 //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// expose for testing purpose                                                                                         // 1
OplogCheck = {};                                                                                                      // 2
                                                                                                                      // 3
OplogCheck._070 = function(cursorDescription) {                                                                       // 4
  var options = cursorDescription.options;                                                                            // 5
  if (options.limit) {                                                                                                // 6
    return {                                                                                                          // 7
      code: "070_LIMIT_NOT_SUPPORTED",                                                                                // 8
      reason: "Meteor 0.7.0 does not support limit with oplog.",                                                      // 9
      solution: "Upgrade your app to Meteor version 0.7.2 or later."                                                  // 10
    }                                                                                                                 // 11
  };                                                                                                                  // 12
                                                                                                                      // 13
  var exists$ = _.any(cursorDescription.selector, function (value, field) {                                           // 14
    if (field.substr(0, 1) === '$')                                                                                   // 15
      return true;                                                                                                    // 16
  });                                                                                                                 // 17
                                                                                                                      // 18
  if(exists$) {                                                                                                       // 19
    return {                                                                                                          // 20
      code: "070_$_NOT_SUPPORTED",                                                                                    // 21
      reason: "Meteor 0.7.0 supports only equal checks with oplog.",                                                  // 22
      solution: "Upgrade your app to Meteor version 0.7.2 or later."                                                  // 23
    }                                                                                                                 // 24
  };                                                                                                                  // 25
                                                                                                                      // 26
  var onlyScalers = _.all(cursorDescription.selector, function (value, field) {                                       // 27
    return typeof value === "string" ||                                                                               // 28
      typeof value === "number" ||                                                                                    // 29
      typeof value === "boolean" ||                                                                                   // 30
      value === null ||                                                                                               // 31
      value instanceof Meteor.Collection.ObjectID;                                                                    // 32
  });                                                                                                                 // 33
                                                                                                                      // 34
  if(!onlyScalers) {                                                                                                  // 35
    return {                                                                                                          // 36
      code: "070_ONLY_SCALERS",                                                                                       // 37
      reason: "Meteor 0.7.0 only supports scalers as comparators.",                                                   // 38
      solution: "Upgrade your app to Meteor version 0.7.2 or later."                                                  // 39
    }                                                                                                                 // 40
  }                                                                                                                   // 41
                                                                                                                      // 42
  return true;                                                                                                        // 43
};                                                                                                                    // 44
                                                                                                                      // 45
OplogCheck._071 = function(cursorDescription) {                                                                       // 46
  var options = cursorDescription.options;                                                                            // 47
  var matcher = new Minimongo.Matcher(cursorDescription.selector);                                                    // 48
  if (options.limit) {                                                                                                // 49
    return {                                                                                                          // 50
      code: "071_LIMIT_NOT_SUPPORTED",                                                                                // 51
      reason: "Meteor 0.7.1 does not support limit with oplog.",                                                      // 52
      solution: "Upgrade your app to Meteor version 0.7.2 or later."                                                  // 53
    }                                                                                                                 // 54
  };                                                                                                                  // 55
                                                                                                                      // 56
  return true;                                                                                                        // 57
};                                                                                                                    // 58
                                                                                                                      // 59
                                                                                                                      // 60
OplogCheck.env = function() {                                                                                         // 61
  if(!process.env.MONGO_OPLOG_URL) {                                                                                  // 62
    return {                                                                                                          // 63
      code: "NO_ENV",                                                                                                 // 64
      reason: "You haven't added oplog support for your the Meteor app.",                                             // 65
      solution: "Add oplog support for your Meteor app. see: http://goo.gl/Co1jJc"                                    // 66
    }                                                                                                                 // 67
  } else {                                                                                                            // 68
    return true;                                                                                                      // 69
  }                                                                                                                   // 70
};                                                                                                                    // 71
                                                                                                                      // 72
OplogCheck.disableOplog = function(cursorDescription) {                                                               // 73
  if(cursorDescription.options._disableOplog) {                                                                       // 74
    return {                                                                                                          // 75
      code: "DISABLE_OPLOG",                                                                                          // 76
      reason: "You've disable oplog for this cursor explicitly with _disableOplog option."                            // 77
    };                                                                                                                // 78
  } else {                                                                                                            // 79
    return true;                                                                                                      // 80
  }                                                                                                                   // 81
};                                                                                                                    // 82
                                                                                                                      // 83
// when creating Minimongo.Matcher object, if that's throws an exception                                              // 84
// meteor won't do the oplog support                                                                                  // 85
OplogCheck.miniMongoMatcher = function(cursorDescription) {                                                           // 86
  if(Minimongo.Matcher) {                                                                                             // 87
    try {                                                                                                             // 88
      var matcher = new Minimongo.Matcher(cursorDescription.selector);                                                // 89
      return true;                                                                                                    // 90
    } catch(ex) {                                                                                                     // 91
      return {                                                                                                        // 92
        code: "MINIMONGO_MATCHER_ERROR",                                                                              // 93
        reason: "There's something wrong in your mongo query: " +  ex.message,                                        // 94
        solution: "Check your selector and change it accordingly."                                                    // 95
      };                                                                                                              // 96
    }                                                                                                                 // 97
  } else {                                                                                                            // 98
    // If there is no Minimongo.Matcher, we don't need to check this                                                  // 99
    return true;                                                                                                      // 100
  }                                                                                                                   // 101
};                                                                                                                    // 102
                                                                                                                      // 103
OplogCheck.miniMongoSorter = function(cursorDescription) {                                                            // 104
  var matcher = new Minimongo.Matcher(cursorDescription.selector);                                                    // 105
  if(Minimongo.Sorter && cursorDescription.options.sort) {                                                            // 106
    try {                                                                                                             // 107
      var sorter = new Minimongo.Sorter(                                                                              // 108
        cursorDescription.options.sort,                                                                               // 109
        { matcher: matcher }                                                                                          // 110
      );                                                                                                              // 111
      return true;                                                                                                    // 112
    } catch(ex) {                                                                                                     // 113
      return {                                                                                                        // 114
        code: "MINIMONGO_SORTER_ERROR",                                                                               // 115
        reason: "Some of your sort specifiers are not supported: " + ex.message,                                      // 116
        solution: "Check your sort specifiers and chage them accordingly."                                            // 117
      }                                                                                                               // 118
    }                                                                                                                 // 119
  } else {                                                                                                            // 120
    return true;                                                                                                      // 121
  }                                                                                                                   // 122
};                                                                                                                    // 123
                                                                                                                      // 124
OplogCheck.fields = function(cursorDescription) {                                                                     // 125
  var options = cursorDescription.options;                                                                            // 126
  if(options.fields) {                                                                                                // 127
    try {                                                                                                             // 128
      LocalCollection._checkSupportedProjection(options.fields);                                                      // 129
      return true;                                                                                                    // 130
    } catch (e) {                                                                                                     // 131
      if (e.name === "MinimongoError") {                                                                              // 132
        return {                                                                                                      // 133
          code: "NOT_SUPPORTED_FIELDS",                                                                               // 134
          reason: "Some of the field filters are not supported: " + e.message,                                        // 135
          solution: "Try removing those field filters."                                                               // 136
        };                                                                                                            // 137
      } else {                                                                                                        // 138
        throw e;                                                                                                      // 139
      }                                                                                                               // 140
    }                                                                                                                 // 141
  }                                                                                                                   // 142
  return true;                                                                                                        // 143
};                                                                                                                    // 144
                                                                                                                      // 145
OplogCheck.skip = function(cursorDescription) {                                                                       // 146
  if(cursorDescription.options.skip) {                                                                                // 147
    return {                                                                                                          // 148
      code: "SKIP_NOT_SUPPORTED",                                                                                     // 149
      reason: "Skip does not support with oplog.",                                                                    // 150
      solution: "Try to avoid using skip. Use range queries instead: http://goo.gl/b522Av"                            // 151
    };                                                                                                                // 152
  }                                                                                                                   // 153
                                                                                                                      // 154
  return true;                                                                                                        // 155
};                                                                                                                    // 156
                                                                                                                      // 157
OplogCheck.where = function(cursorDescription) {                                                                      // 158
  var matcher = new Minimongo.Matcher(cursorDescription.selector);                                                    // 159
  if(matcher.hasWhere()) {                                                                                            // 160
    return {                                                                                                          // 161
      code: "WHERE_NOT_SUPPORTED",                                                                                    // 162
      reason: "Meteor does not support queries with $where.",                                                         // 163
      solution: "Try to remove $where from your query. Use some alternative."                                         // 164
    }                                                                                                                 // 165
  };                                                                                                                  // 166
                                                                                                                      // 167
  return true;                                                                                                        // 168
};                                                                                                                    // 169
                                                                                                                      // 170
OplogCheck.geo = function(cursorDescription) {                                                                        // 171
  var matcher = new Minimongo.Matcher(cursorDescription.selector);                                                    // 172
                                                                                                                      // 173
  if(matcher.hasGeoQuery()) {                                                                                         // 174
    return {                                                                                                          // 175
      code: "GEO_NOT_SUPPORTED",                                                                                      // 176
      reason: "Meteor does not support queries with geo partial operators.",                                          // 177
      solution: "Try to remove geo partial operators from your query if possible."                                    // 178
    }                                                                                                                 // 179
  };                                                                                                                  // 180
                                                                                                                      // 181
  return true;                                                                                                        // 182
};                                                                                                                    // 183
                                                                                                                      // 184
OplogCheck.limitButNoSort = function(cursorDescription) {                                                             // 185
  var options = cursorDescription.options;                                                                            // 186
                                                                                                                      // 187
  if((options.limit && !options.sort)) {                                                                              // 188
    return {                                                                                                          // 189
      code: "LIMIT_NO_SORT",                                                                                          // 190
      reason: "Meteor oplog implementation does not support limit without a sort specifier.",                         // 191
      solution: "Try adding a sort specifier."                                                                        // 192
    }                                                                                                                 // 193
  };                                                                                                                  // 194
                                                                                                                      // 195
  return true;                                                                                                        // 196
};                                                                                                                    // 197
                                                                                                                      // 198
OplogCheck.olderVersion = function(cursorDescription, driver) {                                                       // 199
  if(driver && !driver.constructor.cursorSupported) {                                                                 // 200
    return {                                                                                                          // 201
      code: "OLDER_VERSION",                                                                                          // 202
      reason: "Your Meteor version does not have oplog support.",                                                     // 203
      solution: "Upgrade your app to Meteor version 0.7.2 or later."                                                  // 204
    };                                                                                                                // 205
  }                                                                                                                   // 206
  return true;                                                                                                        // 207
};                                                                                                                    // 208
                                                                                                                      // 209
OplogCheck.gitCheckout = function(cursorDescription, driver) {                                                        // 210
  if(!Meteor.release) {                                                                                               // 211
    return {                                                                                                          // 212
      code: "GIT_CHECKOUT",                                                                                           // 213
      reason: "Seems like your Meteor version is based on a Git checkout and it doesn't have the oplog support.",     // 214
      solution: "Try to upgrade your Meteor version."                                                                 // 215
    };                                                                                                                // 216
  }                                                                                                                   // 217
  return true;                                                                                                        // 218
};                                                                                                                    // 219
                                                                                                                      // 220
var preRunningMatchers = [                                                                                            // 221
  OplogCheck.env,                                                                                                     // 222
  OplogCheck.disableOplog,                                                                                            // 223
  OplogCheck.miniMongoMatcher                                                                                         // 224
];                                                                                                                    // 225
                                                                                                                      // 226
var globalMatchers = [                                                                                                // 227
  OplogCheck.fields,                                                                                                  // 228
  OplogCheck.skip,                                                                                                    // 229
  OplogCheck.where,                                                                                                   // 230
  OplogCheck.geo,                                                                                                     // 231
  OplogCheck.limitButNoSort,                                                                                          // 232
  OplogCheck.miniMongoSorter,                                                                                         // 233
  OplogCheck.olderVersion,                                                                                            // 234
  OplogCheck.gitCheckout                                                                                              // 235
];                                                                                                                    // 236
                                                                                                                      // 237
var versionMatchers = [                                                                                               // 238
  [/^0\.7\.1/, OplogCheck._071],                                                                                      // 239
  [/^0\.7\.0/, OplogCheck._070],                                                                                      // 240
];                                                                                                                    // 241
                                                                                                                      // 242
Kadira.checkWhyNoOplog = function(cursorDescription, observerDriver) {                                                // 243
  if(typeof Minimongo == 'undefined') {                                                                               // 244
    return {                                                                                                          // 245
      code: "CANNOT_DETECT",                                                                                          // 246
      reason: "You are running an older Meteor version and Kadira can't check oplog state.",                          // 247
      solution: "Try updating your Meteor app"                                                                        // 248
    }                                                                                                                 // 249
  }                                                                                                                   // 250
                                                                                                                      // 251
  var result = runMatchers(preRunningMatchers, cursorDescription, observerDriver);                                    // 252
  if(result !== true) {                                                                                               // 253
    return result;                                                                                                    // 254
  }                                                                                                                   // 255
                                                                                                                      // 256
  var meteorVersion = Meteor.release;                                                                                 // 257
  for(var lc=0; lc<versionMatchers.length; lc++) {                                                                    // 258
    var matcherInfo = versionMatchers[lc];                                                                            // 259
    if(matcherInfo[0].test(meteorVersion)) {                                                                          // 260
      var matched = matcherInfo[1](cursorDescription, observerDriver);                                                // 261
      if(matched !== true) {                                                                                          // 262
        return matched;                                                                                               // 263
      }                                                                                                               // 264
    }                                                                                                                 // 265
  }                                                                                                                   // 266
                                                                                                                      // 267
  result = runMatchers(globalMatchers, cursorDescription, observerDriver);                                            // 268
  if(result !== true) {                                                                                               // 269
    return result;                                                                                                    // 270
  }                                                                                                                   // 271
                                                                                                                      // 272
  return {                                                                                                            // 273
    code: "OPLOG_SUPPORTED",                                                                                          // 274
    reason: "This query should support oplog. It's weird if it's not.",                                               // 275
    solution: "Please contact Kadira support and let's discuss."                                                      // 276
  };                                                                                                                  // 277
};                                                                                                                    // 278
                                                                                                                      // 279
function runMatchers(matcherList, cursorDescription, observerDriver) {                                                // 280
  for(var lc=0; lc<matcherList.length; lc++) {                                                                        // 281
    var matcher = matcherList[lc];                                                                                    // 282
    var matched = matcher(cursorDescription, observerDriver);                                                         // 283
    if(matched !== true) {                                                                                            // 284
      return matched;                                                                                                 // 285
    }                                                                                                                 // 286
  }                                                                                                                   // 287
  return true;                                                                                                        // 288
}                                                                                                                     // 289
                                                                                                                      // 290
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/tracer.js                                                                          //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fibers = Npm.require('fibers');                                                                                   // 1
var eventLogger = Npm.require('debug')('kadira:tracer');                                                              // 2
var REPITITIVE_EVENTS = {'db': true, 'http': true, 'email': true, 'wait': true, 'async': true};                       // 3
                                                                                                                      // 4
function Tracer() {                                                                                                   // 5
                                                                                                                      // 6
};                                                                                                                    // 7
                                                                                                                      // 8
//In the future, we might wan't to track inner fiber events too.                                                      // 9
//Then we can't serialize the object with methods                                                                     // 10
//That's why we use this method of returning the data                                                                 // 11
Tracer.prototype.start = function(session, msg) {                                                                     // 12
  var traceInfo = {                                                                                                   // 13
    _id: session.id + "::" + msg.id,                                                                                  // 14
    session: session.id,                                                                                              // 15
    userId: session.userId,                                                                                           // 16
    id: msg.id,                                                                                                       // 17
    events: []                                                                                                        // 18
  };                                                                                                                  // 19
                                                                                                                      // 20
  if(msg.msg == 'method') {                                                                                           // 21
    traceInfo.type = 'method';                                                                                        // 22
    traceInfo.name = msg.method;                                                                                      // 23
  } else if(msg.msg == 'sub') {                                                                                       // 24
    traceInfo.type = 'sub';                                                                                           // 25
    traceInfo.name = msg.name;                                                                                        // 26
  } else {                                                                                                            // 27
    return null;                                                                                                      // 28
  }                                                                                                                   // 29
                                                                                                                      // 30
  return traceInfo;                                                                                                   // 31
};                                                                                                                    // 32
                                                                                                                      // 33
Tracer.prototype.event = function(traceInfo, type, data) {                                                            // 34
  // do not allow to proceed, if already completed or errored                                                         // 35
  var lastEvent = this.getLastEvent(traceInfo);                                                                       // 36
  if(lastEvent && ['complete', 'error'].indexOf(lastEvent.type) >= 0) {                                               // 37
    return false;                                                                                                     // 38
  }                                                                                                                   // 39
                                                                                                                      // 40
  //expecting a end event                                                                                             // 41
  var eventId = true;                                                                                                 // 42
                                                                                                                      // 43
  //specially handling for repitivive events like db, http                                                            // 44
  if(REPITITIVE_EVENTS[type]) {                                                                                       // 45
    //can't accept a new start event                                                                                  // 46
    if(traceInfo._lastEventId) {                                                                                      // 47
      return false;                                                                                                   // 48
    }                                                                                                                 // 49
    eventId = traceInfo._lastEventId = DefaultUniqueId.get();                                                         // 50
  }                                                                                                                   // 51
                                                                                                                      // 52
  var event = {type: type, at: Ntp._now()};                                                                           // 53
  if(data) {                                                                                                          // 54
    event.data = data;                                                                                                // 55
  }                                                                                                                   // 56
                                                                                                                      // 57
  traceInfo.events.push(event);                                                                                       // 58
                                                                                                                      // 59
  eventLogger("%s %s", type, traceInfo._id);                                                                          // 60
  return eventId;                                                                                                     // 61
};                                                                                                                    // 62
                                                                                                                      // 63
Tracer.prototype.eventEnd = function(traceInfo, eventId, data) {                                                      // 64
  if(traceInfo._lastEventId && traceInfo._lastEventId == eventId) {                                                   // 65
    var lastEvent = this.getLastEvent(traceInfo);                                                                     // 66
    var type = lastEvent.type + 'end';                                                                                // 67
    var event = {type: type, at: Ntp._now()};                                                                         // 68
    if(data) {                                                                                                        // 69
      event.data = data;                                                                                              // 70
    }                                                                                                                 // 71
    traceInfo.events.push(event);                                                                                     // 72
    eventLogger("%s %s", type, traceInfo._id);                                                                        // 73
                                                                                                                      // 74
    traceInfo._lastEventId = null;                                                                                    // 75
    return true;                                                                                                      // 76
  } else {                                                                                                            // 77
    return false;                                                                                                     // 78
  }                                                                                                                   // 79
};                                                                                                                    // 80
                                                                                                                      // 81
Tracer.prototype.getLastEvent = function(traceInfo) {                                                                 // 82
  return traceInfo.events[traceInfo.events.length -1]                                                                 // 83
};                                                                                                                    // 84
                                                                                                                      // 85
Tracer.prototype.endLastEvent = function(traceInfo) {                                                                 // 86
  var lastEvent = this.getLastEvent(traceInfo);                                                                       // 87
  if(lastEvent && !/end$/.test(lastEvent.type)) {                                                                     // 88
    traceInfo.events.push({                                                                                           // 89
      type: lastEvent.type + 'end',                                                                                   // 90
      at: Ntp._now()                                                                                                  // 91
    });                                                                                                               // 92
    return true;                                                                                                      // 93
  }                                                                                                                   // 94
  return false;                                                                                                       // 95
};                                                                                                                    // 96
                                                                                                                      // 97
Tracer.prototype.buildTrace = function(traceInfo) {                                                                   // 98
  var firstEvent = traceInfo.events[0];                                                                               // 99
  var lastEvent = traceInfo.events[traceInfo.events.length - 1];                                                      // 100
  var processedEvents = [];                                                                                           // 101
                                                                                                                      // 102
  if(firstEvent.type != 'start') {                                                                                    // 103
    console.warn('Kadira: trace is not started yet');                                                                 // 104
    return null;                                                                                                      // 105
  } else if(lastEvent.type != 'complete' && lastEvent.type != 'error') {                                              // 106
    //trace is not completed or errored yet                                                                           // 107
    console.warn('Kadira: trace is not completed or errored yet');                                                    // 108
    return null;                                                                                                      // 109
  } else {                                                                                                            // 110
    //build the metrics                                                                                               // 111
    traceInfo.errored = lastEvent.type == 'error';                                                                    // 112
    traceInfo.at = firstEvent.at;                                                                                     // 113
                                                                                                                      // 114
    var metrics = {                                                                                                   // 115
      total: lastEvent.at - firstEvent.at,                                                                            // 116
    };                                                                                                                // 117
                                                                                                                      // 118
    var totalNonCompute = 0;                                                                                          // 119
                                                                                                                      // 120
    firstEvent = ['start', 0];                                                                                        // 121
    if(traceInfo.events[0].data) firstEvent.push(traceInfo.events[0].data);                                           // 122
    processedEvents.push(firstEvent);                                                                                 // 123
                                                                                                                      // 124
    for(var lc=1; lc < traceInfo.events.length - 1; lc += 2) {                                                        // 125
      var prevEventEnd = traceInfo.events[lc-1];                                                                      // 126
      var startEvent = traceInfo.events[lc];                                                                          // 127
      var endEvent = traceInfo.events[lc+1];                                                                          // 128
      var computeTime = startEvent.at - prevEventEnd.at;                                                              // 129
      if(computeTime > 0) processedEvents.push(['compute', computeTime]);                                             // 130
      if(!endEvent) {                                                                                                 // 131
        console.error('Kadira: no end event for type: ', startEvent.type);                                            // 132
        return null;                                                                                                  // 133
      } else if(endEvent.type != startEvent.type + 'end') {                                                           // 134
        console.error('Kadira: endevent type mismatch: ', startEvent.type, endEvent.type, JSON.stringify(traceInfo)); // 135
        return null;                                                                                                  // 136
      } else {                                                                                                        // 137
        var elapsedTimeForEvent = endEvent.at - startEvent.at                                                         // 138
        var currentEvent = [startEvent.type, elapsedTimeForEvent];                                                    // 139
        currentEvent.push(_.extend({}, startEvent.data, endEvent.data));                                              // 140
        processedEvents.push(currentEvent);                                                                           // 141
        metrics[startEvent.type] = metrics[startEvent.type] || 0;                                                     // 142
        metrics[startEvent.type] += elapsedTimeForEvent;                                                              // 143
        totalNonCompute += elapsedTimeForEvent;                                                                       // 144
      }                                                                                                               // 145
    }                                                                                                                 // 146
                                                                                                                      // 147
    computeTime = lastEvent.at - traceInfo.events[traceInfo.events.length - 2];                                       // 148
    if(computeTime > 0) processedEvents.push(['compute', computeTime]);                                               // 149
                                                                                                                      // 150
    var lastEventData = [lastEvent.type, 0];                                                                          // 151
    if(lastEvent.data) lastEventData.push(lastEvent.data);                                                            // 152
    processedEvents.push(lastEventData);                                                                              // 153
                                                                                                                      // 154
    metrics.compute = metrics.total - totalNonCompute;                                                                // 155
    traceInfo.metrics = metrics;                                                                                      // 156
    traceInfo.events = processedEvents;                                                                               // 157
    traceInfo.isEventsProcessed = true;                                                                               // 158
    return traceInfo;                                                                                                 // 159
  }                                                                                                                   // 160
};                                                                                                                    // 161
                                                                                                                      // 162
Kadira.tracer = new Tracer();                                                                                         // 163
                                                                                                                      // 164
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/tracer_store.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var logger = Npm.require('debug')('kadira:ts');                                                                       // 1
                                                                                                                      // 2
TracerStore = function TracerStore(options) {                                                                         // 3
  options = options || {};                                                                                            // 4
                                                                                                                      // 5
  this.maxTotalPoints = options.maxTotalPoints || 30;                                                                 // 6
  this.interval = options.interval || 1000 * 60;                                                                      // 7
  this.archiveEvery = options.archiveEvery || this.maxTotalPoints / 6;                                                // 8
                                                                                                                      // 9
  //store max total on the past 30 minutes (or past 30 items)                                                         // 10
  this.maxTotals = {};                                                                                                // 11
  //store the max trace of the current interval                                                                       // 12
  this.currentMaxTrace = {};                                                                                          // 13
  //archive for the traces                                                                                            // 14
  this.traceArchive = [];                                                                                             // 15
                                                                                                                      // 16
  this.processedCnt = {};                                                                                             // 17
                                                                                                                      // 18
  //group errors by messages between an interval                                                                      // 19
  this.errorMap = {};                                                                                                 // 20
};                                                                                                                    // 21
                                                                                                                      // 22
TracerStore.prototype.addTrace = function(trace) {                                                                    // 23
  var kind = [trace.type, trace.name].join('::');                                                                     // 24
  if(!this.currentMaxTrace[kind]) {                                                                                   // 25
    this.currentMaxTrace[kind] = EJSON.clone(trace);                                                                  // 26
  } else if(this.currentMaxTrace[kind].metrics.total < trace.metrics.total) {                                         // 27
    this.currentMaxTrace[kind] = EJSON.clone(trace);                                                                  // 28
  } else if(trace.errored) {                                                                                          // 29
    this._handleErrors(trace);                                                                                        // 30
  }                                                                                                                   // 31
};                                                                                                                    // 32
                                                                                                                      // 33
TracerStore.prototype.collectTraces = function() {                                                                    // 34
  var traces = this.traceArchive;                                                                                     // 35
  this.traceArchive = [];                                                                                             // 36
                                                                                                                      // 37
  // convert at(timestamp) into the actual serverTime                                                                 // 38
  traces.forEach(function(trace) {                                                                                    // 39
    trace.at = Kadira.syncedDate.syncTime(trace.at);                                                                  // 40
  });                                                                                                                 // 41
  return traces;                                                                                                      // 42
};                                                                                                                    // 43
                                                                                                                      // 44
TracerStore.prototype.start = function() {                                                                            // 45
  this._timeoutHandler = setInterval(this.processTraces.bind(this), this.interval);                                   // 46
};                                                                                                                    // 47
                                                                                                                      // 48
TracerStore.prototype.stop = function() {                                                                             // 49
  if(this._timeoutHandler) {                                                                                          // 50
    clearInterval(this._timeoutHandler);                                                                              // 51
  }                                                                                                                   // 52
};                                                                                                                    // 53
                                                                                                                      // 54
TracerStore.prototype._handleErrors = function(trace) {                                                               // 55
  // sending error requests as it is                                                                                  // 56
  var lastEvent = trace.events[trace.events.length -1];                                                               // 57
  if(lastEvent && lastEvent[2]) {                                                                                     // 58
    var error = lastEvent[2].error;                                                                                   // 59
                                                                                                                      // 60
    // grouping errors occured (reset after processTraces)                                                            // 61
    var errorKey = [trace.type, trace.name, error.message].join("::");                                                // 62
    if(!this.errorMap[errorKey]) {                                                                                    // 63
      var erroredTrace = EJSON.clone(trace);                                                                          // 64
      this.errorMap[errorKey] = erroredTrace;                                                                         // 65
                                                                                                                      // 66
      this.traceArchive.push(erroredTrace);                                                                           // 67
    }                                                                                                                 // 68
  } else {                                                                                                            // 69
    logger('last events is not an error: ', JSON.stringify(trace.events));                                            // 70
  }                                                                                                                   // 71
};                                                                                                                    // 72
                                                                                                                      // 73
TracerStore.prototype.processTraces = function() {                                                                    // 74
  var self = this;                                                                                                    // 75
  var kinds = _.union(                                                                                                // 76
    _.keys(this.maxTotals),                                                                                           // 77
    _.keys(this.currentMaxTrace)                                                                                      // 78
  );                                                                                                                  // 79
                                                                                                                      // 80
  kinds.forEach(function(kind) {                                                                                      // 81
    self.processedCnt[kind] = self.processedCnt[kind] || 0;                                                           // 82
    var currentMaxTrace = self.currentMaxTrace[kind];                                                                 // 83
    var currentMaxTotal = currentMaxTrace? currentMaxTrace.metrics.total : 0;                                         // 84
                                                                                                                      // 85
    self.maxTotals[kind] = self.maxTotals[kind] || [];                                                                // 86
    //add the current maxPoint                                                                                        // 87
    self.maxTotals[kind].push(currentMaxTotal);                                                                       // 88
    var exceedingPoints = self.maxTotals[kind].length - self.maxTotalPoints;                                          // 89
    if(exceedingPoints > 0) {                                                                                         // 90
      self.maxTotals[kind].splice(0, exceedingPoints);                                                                // 91
    }                                                                                                                 // 92
                                                                                                                      // 93
    var archiveDefault = (self.processedCnt[kind] % self.archiveEvery) == 0;                                          // 94
    self.processedCnt[kind]++;                                                                                        // 95
                                                                                                                      // 96
    var canArchive = archiveDefault                                                                                   // 97
      || self._isTraceOutlier(kind, currentMaxTrace);                                                                 // 98
                                                                                                                      // 99
    if(canArchive && currentMaxTrace) {                                                                               // 100
      self.traceArchive.push(currentMaxTrace);                                                                        // 101
    }                                                                                                                 // 102
                                                                                                                      // 103
    //reset currentMaxTrace                                                                                           // 104
    self.currentMaxTrace[kind] = null;                                                                                // 105
  });                                                                                                                 // 106
                                                                                                                      // 107
  //reset the errorMap                                                                                                // 108
  self.errorMap = {};                                                                                                 // 109
};                                                                                                                    // 110
                                                                                                                      // 111
TracerStore.prototype._isTraceOutlier = function(kind, trace) {                                                       // 112
  if(trace) {                                                                                                         // 113
    var dataSet = this.maxTotals[kind];                                                                               // 114
    return this._isOutlier(dataSet, trace.metrics.total, 3);                                                          // 115
  } else {                                                                                                            // 116
    return false;                                                                                                     // 117
  }                                                                                                                   // 118
};                                                                                                                    // 119
                                                                                                                      // 120
/*                                                                                                                    // 121
  Data point must exists in the dataSet                                                                               // 122
*/                                                                                                                    // 123
TracerStore.prototype._isOutlier = function(dataSet, dataPoint, maxMadZ) {                                            // 124
  var median = this._getMedian(dataSet);                                                                              // 125
  var mad = this._calculateMad(dataSet, median);                                                                      // 126
  var madZ = this._funcMedianDeviation(median)(dataPoint) / mad;                                                      // 127
                                                                                                                      // 128
  return madZ > maxMadZ;                                                                                              // 129
};                                                                                                                    // 130
                                                                                                                      // 131
TracerStore.prototype._getMedian = function(dataSet) {                                                                // 132
  var sortedDataSet = _.clone(dataSet).sort(function(a, b) {                                                          // 133
    return a-b;                                                                                                       // 134
  });                                                                                                                 // 135
  return this._pickQuartile(sortedDataSet, 2);                                                                        // 136
};                                                                                                                    // 137
                                                                                                                      // 138
TracerStore.prototype._pickQuartile = function(dataSet, num) {                                                        // 139
  var pos = ((dataSet.length + 1) * num) / 4;                                                                         // 140
  if(pos % 1 == 0) {                                                                                                  // 141
    return dataSet[pos -1];                                                                                           // 142
  } else {                                                                                                            // 143
    pos = pos - (pos % 1);                                                                                            // 144
    return (dataSet[pos -1] + dataSet[pos])/2                                                                         // 145
  }                                                                                                                   // 146
};                                                                                                                    // 147
                                                                                                                      // 148
TracerStore.prototype._calculateMad = function(dataSet, median) {                                                     // 149
  var medianDeviations = _.map(dataSet, this._funcMedianDeviation(median));                                           // 150
  var mad = this._getMedian(medianDeviations);                                                                        // 151
                                                                                                                      // 152
  return mad;                                                                                                         // 153
};                                                                                                                    // 154
                                                                                                                      // 155
TracerStore.prototype._funcMedianDeviation = function(median) {                                                       // 156
  return function(x) {                                                                                                // 157
    return Math.abs(median - x);                                                                                      // 158
  };                                                                                                                  // 159
};                                                                                                                    // 160
                                                                                                                      // 161
TracerStore.prototype._getMean = function(dataPoints) {                                                               // 162
  if(dataPoints.length > 0) {                                                                                         // 163
    var total = 0;                                                                                                    // 164
    dataPoints.forEach(function(point) {                                                                              // 165
      total += point;                                                                                                 // 166
    });                                                                                                               // 167
    return total/dataPoints.length;                                                                                   // 168
  } else {                                                                                                            // 169
    return 0;                                                                                                         // 170
  }                                                                                                                   // 171
};                                                                                                                    // 172
                                                                                                                      // 173
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/wrap_server.js                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 1
                                                                                                                      // 2
wrapServer = function(serverProto) {                                                                                  // 3
  var originalHandleConnect = serverProto._handleConnect                                                              // 4
  serverProto._handleConnect = function(socket, msg) {                                                                // 5
    originalHandleConnect.call(this, socket, msg);                                                                    // 6
    if(Kadira.connected) {                                                                                            // 7
      Kadira.models.system.handleSessionActivity(msg, socket._meteorSession);                                         // 8
    }                                                                                                                 // 9
  };                                                                                                                  // 10
};                                                                                                                    // 11
                                                                                                                      // 12
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/wrap_session.js                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
wrapSession = function(sessionProto) {                                                                                // 1
  var originalProcessMessage = sessionProto.processMessage;                                                           // 2
  sessionProto.processMessage = function(msg) {                                                                       // 3
    if(Kadira.connected) {                                                                                            // 4
      var kadiraInfo = {                                                                                              // 5
        session: this.id,                                                                                             // 6
        userId: this.userId                                                                                           // 7
      };                                                                                                              // 8
                                                                                                                      // 9
      if(msg.msg == 'method' || msg.msg == 'sub') {                                                                   // 10
        kadiraInfo.trace = Kadira.tracer.start(this, msg);                                                            // 11
        Kadira.waitTimeBuilder.register(this, msg.id);                                                                // 12
                                                                                                                      // 13
        //use JSON stringify to save the CPU                                                                          // 14
        var startData = { userId: this.userId, params: JSON.stringify(msg.params) };                                  // 15
        Kadira.tracer.event(kadiraInfo.trace, 'start', startData);                                                    // 16
        var waitEventId = Kadira.tracer.event(kadiraInfo.trace, 'wait', {}, kadiraInfo);                              // 17
        msg._waitEventId = waitEventId;                                                                               // 18
        msg.__kadiraInfo = kadiraInfo;                                                                                // 19
                                                                                                                      // 20
        if(msg.msg == 'sub') {                                                                                        // 21
          // start tracking inside processMessage allows us to indicate                                               // 22
          // wait time as well                                                                                        // 23
          Kadira.models.pubsub._trackSub(this, msg);                                                                  // 24
        }                                                                                                             // 25
      }                                                                                                               // 26
                                                                                                                      // 27
      // Update session last active time                                                                              // 28
      Kadira.models.system.handleSessionActivity(msg, this);                                                          // 29
    }                                                                                                                 // 30
                                                                                                                      // 31
    return originalProcessMessage.call(this, msg);                                                                    // 32
  };                                                                                                                  // 33
                                                                                                                      // 34
  //adding the method context to the current fiber                                                                    // 35
  var originalMethodHandler = sessionProto.protocol_handlers.method;                                                  // 36
  sessionProto.protocol_handlers.method = function(msg, unblock) {                                                    // 37
    var self = this;                                                                                                  // 38
    //add context                                                                                                     // 39
    var kadiraInfo = msg.__kadiraInfo;                                                                                // 40
    Kadira._setInfo(kadiraInfo);                                                                                      // 41
                                                                                                                      // 42
    // end wait event                                                                                                 // 43
    var waitList = Kadira.waitTimeBuilder.build(this, msg.id);                                                        // 44
    Kadira.tracer.eventEnd(kadiraInfo.trace, msg._waitEventId, {waitOn: waitList});                                   // 45
                                                                                                                      // 46
    unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);                                               // 47
    var response = Kadira.env.kadiraInfo.withValue(kadiraInfo, function () {                                          // 48
      return originalMethodHandler.call(self, msg, unblock);                                                          // 49
    });                                                                                                               // 50
    unblock();                                                                                                        // 51
    return response;                                                                                                  // 52
  };                                                                                                                  // 53
                                                                                                                      // 54
  //to capture the currently processing message                                                                       // 55
  var orginalSubHandler = sessionProto.protocol_handlers.sub;                                                         // 56
  sessionProto.protocol_handlers.sub = function(msg, unblock) {                                                       // 57
    var self = this;                                                                                                  // 58
    //add context                                                                                                     // 59
    var kadiraInfo = msg.__kadiraInfo;                                                                                // 60
    Kadira._setInfo(kadiraInfo);                                                                                      // 61
                                                                                                                      // 62
    // end wait event                                                                                                 // 63
    var waitList = Kadira.waitTimeBuilder.build(this, msg.id);                                                        // 64
    Kadira.tracer.eventEnd(kadiraInfo.trace, msg._waitEventId, {waitOn: waitList});                                   // 65
                                                                                                                      // 66
    unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);                                               // 67
    var response = Kadira.env.kadiraInfo.withValue(kadiraInfo, function () {                                          // 68
      return orginalSubHandler.call(self, msg, unblock);                                                              // 69
    });                                                                                                               // 70
    unblock();                                                                                                        // 71
    return response;                                                                                                  // 72
  };                                                                                                                  // 73
                                                                                                                      // 74
  //to capture the currently processing message                                                                       // 75
  var orginalUnSubHandler = sessionProto.protocol_handlers.unsub;                                                     // 76
  sessionProto.protocol_handlers.unsub = function(msg, unblock) {                                                     // 77
    unblock = Kadira.waitTimeBuilder.trackWaitTime(this, msg, unblock);                                               // 78
    var response = orginalUnSubHandler.call(this, msg, unblock);                                                      // 79
    unblock();                                                                                                        // 80
    return response;                                                                                                  // 81
  };                                                                                                                  // 82
                                                                                                                      // 83
  //track method ending (to get the result of error)                                                                  // 84
  var originalSend = sessionProto.send;                                                                               // 85
  sessionProto.send = function(msg) {                                                                                 // 86
    if(msg.msg == 'result') {                                                                                         // 87
      var kadiraInfo = Kadira._getInfo();                                                                             // 88
      if(msg.error) {                                                                                                 // 89
        var error = _.pick(msg.error, ['message', 'stack']);                                                          // 90
                                                                                                                      // 91
        // pick the error from the wrapped method handler                                                             // 92
        if(kadiraInfo && kadiraInfo.currentError) {                                                                   // 93
          // the error stack is wrapped so Meteor._debug can identify                                                 // 94
          // this as a method error.                                                                                  // 95
          error = _.pick(kadiraInfo.currentError, ['message', 'stack']);                                              // 96
        }                                                                                                             // 97
                                                                                                                      // 98
        Kadira.tracer.endLastEvent(kadiraInfo.trace);                                                                 // 99
        Kadira.tracer.event(kadiraInfo.trace, 'error', {error: error});                                               // 100
      } else {                                                                                                        // 101
        var isForced = Kadira.tracer.endLastEvent(kadiraInfo.trace);                                                  // 102
        if (isForced) {                                                                                               // 103
          console.warn('Kadira endevent forced complete', JSON.stringify(kadiraInfo.trace.events));                   // 104
        };                                                                                                            // 105
        Kadira.tracer.event(kadiraInfo.trace, 'complete');                                                            // 106
      }                                                                                                               // 107
                                                                                                                      // 108
      if(kadiraInfo) {                                                                                                // 109
        //processing the message                                                                                      // 110
        var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);                                                       // 111
        Kadira.models.methods.processMethod(trace);                                                                   // 112
                                                                                                                      // 113
        // error may or may not exist and error tracking can be disabled                                              // 114
        if(error && Kadira.options.enableErrorTracking) {                                                             // 115
          // if we have currentError, we should track that                                                            // 116
          // otherwise, try to get  error from DDP message                                                            // 117
          var errorToTrack = kadiraInfo.currentError || error;                                                        // 118
          Kadira.models.error.trackError(errorToTrack, trace);                                                        // 119
        }                                                                                                             // 120
                                                                                                                      // 121
        //clean and make sure, fiber is clean                                                                         // 122
        //not sure we need to do this, but a preventive measure                                                       // 123
        Kadira._setInfo(null);                                                                                        // 124
      }                                                                                                               // 125
    }                                                                                                                 // 126
                                                                                                                      // 127
    return originalSend.call(this, msg);                                                                              // 128
  };                                                                                                                  // 129
                                                                                                                      // 130
  //for the pub/sub data-impact calculation                                                                           // 131
  ['sendAdded', 'sendChanged', 'sendRemoved'].forEach(function(funcName) {                                            // 132
    var originalFunc = sessionProto[funcName];                                                                        // 133
    sessionProto[funcName] = function(collectionName, id, fields) {                                                   // 134
      var self = this;                                                                                                // 135
      //fields is not relevant for `sendRemoved`, but does make any harm                                              // 136
      var eventName = funcName.substring(4).toLowerCase();                                                            // 137
      var subscription = Kadira.env.currentSub;                                                                       // 138
                                                                                                                      // 139
      if(subscription) {                                                                                              // 140
        // we need to pick the actual DDP message send by the meteor                                                  // 141
        // otherwise that'll add a huge performance issue                                                             // 142
        // that's why we do this nasty hack, but it works great                                                       // 143
        var originalSocketSend = self.socket.send;                                                                    // 144
        var stringifiedFields;                                                                                        // 145
        self.socket.send = function(rawData) {                                                                        // 146
          stringifiedFields = rawData;                                                                                // 147
          originalSocketSend.call(self, rawData);                                                                     // 148
        };                                                                                                            // 149
                                                                                                                      // 150
        var res = originalFunc.call(self, collectionName, id, fields);                                                // 151
        Kadira.models.pubsub._trackNetworkImpact(self, subscription, eventName, collectionName, id, stringifiedFields);
                                                                                                                      // 153
        // revert to the original function                                                                            // 154
        self.socket.send = originalSocketSend;                                                                        // 155
        return res;                                                                                                   // 156
      } else {                                                                                                        // 157
        return originalFunc.call(self, collectionName, id, fields);                                                   // 158
      }                                                                                                               // 159
    };                                                                                                                // 160
  });                                                                                                                 // 161
};                                                                                                                    // 162
                                                                                                                      // 163
// wrap existing method handlers for capturing errors                                                                 // 164
_.each(Meteor.default_server.method_handlers, function(handler, name) {                                               // 165
  wrapMethodHanderForErrors(name, handler, Meteor.default_server.method_handlers);                                    // 166
});                                                                                                                   // 167
                                                                                                                      // 168
// wrap future method handlers for capturing errors                                                                   // 169
var originalMeteorMethods = Meteor.methods;                                                                           // 170
Meteor.methods = function(methodMap) {                                                                                // 171
  _.each(methodMap, function(handler, name) {                                                                         // 172
    wrapMethodHanderForErrors(name, handler, methodMap);                                                              // 173
  });                                                                                                                 // 174
  originalMeteorMethods(methodMap);                                                                                   // 175
};                                                                                                                    // 176
                                                                                                                      // 177
                                                                                                                      // 178
function wrapMethodHanderForErrors(name, originalHandler, methodMap) {                                                // 179
  methodMap[name] = function() {                                                                                      // 180
    try{                                                                                                              // 181
      return originalHandler.apply(this, arguments);                                                                  // 182
    } catch(ex) {                                                                                                     // 183
      if(Kadira._getInfo()) {                                                                                         // 184
        Kadira._getInfo().currentError = ex;                                                                          // 185
                                                                                                                      // 186
        var newError = cloneError(ex);                                                                                // 187
        ex = newError;                                                                                                // 188
      }                                                                                                               // 189
      throw ex;                                                                                                       // 190
    }                                                                                                                 // 191
  }                                                                                                                   // 192
}                                                                                                                     // 193
                                                                                                                      // 194
function cloneError(err) {                                                                                            // 195
  if(err instanceof Meteor.Error) {                                                                                   // 196
    var newError = new Meteor.Error(err.error, err.reason);                                                           // 197
  } else {                                                                                                            // 198
    var newError = new Error(err.message);                                                                            // 199
  }                                                                                                                   // 200
                                                                                                                      // 201
  newError.stack = {stack: err.stack, source: 'method'};                                                              // 202
  return newError;                                                                                                    // 203
}                                                                                                                     // 204
                                                                                                                      // 205
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/wrap_subscription.js                                                        //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fiber = Npm.require('fibers');                                                                                    // 1
                                                                                                                      // 2
wrapSubscription = function(subscriptionProto) {                                                                      // 3
  // If the ready event runs outside the Fiber, Kadira._getInfo() doesn't work.                                       // 4
  // we need some other way to store kadiraInfo so we can use it at ready hijack.                                     // 5
  var originalRunHandler = subscriptionProto._runHandler;                                                             // 6
  subscriptionProto._runHandler = function() {                                                                        // 7
    var kadiraInfo = Kadira._getInfo();                                                                               // 8
    if (kadiraInfo) {                                                                                                 // 9
      this.__kadiraInfo = kadiraInfo;                                                                                 // 10
    };                                                                                                                // 11
    originalRunHandler.call(this);                                                                                    // 12
  }                                                                                                                   // 13
                                                                                                                      // 14
  var originalReady = subscriptionProto.ready;                                                                        // 15
  subscriptionProto.ready = function() {                                                                              // 16
    // meteor has a field called `_ready` which tracks this                                                           // 17
    // but we need to make it future proof                                                                            // 18
    if(!this._apmReadyTracked) {                                                                                      // 19
      var kadiraInfo = Kadira._getInfo() || this.__kadiraInfo;                                                        // 20
      delete this.__kadiraInfo;                                                                                       // 21
      //sometime .ready can be called in the context of the method                                                    // 22
      //then we have some problems, that's why we are checking this                                                   // 23
      //eg:- Accounts.createUser                                                                                      // 24
      if(kadiraInfo && this._subscriptionId == kadiraInfo.trace.id) {                                                 // 25
        var isForced = Kadira.tracer.endLastEvent(kadiraInfo.trace);                                                  // 26
        if (isForced) {                                                                                               // 27
          console.warn('Kadira endevent forced complete', JSON.stringify(kadiraInfo.trace.events));                   // 28
        };                                                                                                            // 29
        Kadira.tracer.event(kadiraInfo.trace, 'complete');                                                            // 30
        var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);                                                       // 31
      }                                                                                                               // 32
                                                                                                                      // 33
      Kadira.models.pubsub._trackReady(this._session, this, trace);                                                   // 34
      this._apmReadyTracked = true;                                                                                   // 35
    }                                                                                                                 // 36
                                                                                                                      // 37
    // we still pass the control to the original implementation                                                       // 38
    // since multiple ready calls are handled by itself                                                               // 39
    originalReady.call(this);                                                                                         // 40
  };                                                                                                                  // 41
                                                                                                                      // 42
  var originalError = subscriptionProto.error;                                                                        // 43
  subscriptionProto.error = function(err) {                                                                           // 44
    var kadiraInfo = Kadira._getInfo();                                                                               // 45
                                                                                                                      // 46
    if(kadiraInfo && this._subscriptionId == kadiraInfo.trace.id) {                                                   // 47
      Kadira.tracer.endLastEvent(kadiraInfo.trace);                                                                   // 48
                                                                                                                      // 49
      var errorForApm = _.pick(err, 'message', 'stack');                                                              // 50
      Kadira.tracer.event(kadiraInfo.trace, 'error', {error: errorForApm});                                           // 51
      var trace = Kadira.tracer.buildTrace(kadiraInfo.trace);                                                         // 52
                                                                                                                      // 53
      Kadira.models.pubsub._trackError(this._session, this, trace);                                                   // 54
                                                                                                                      // 55
      // error tracking can be disabled and if there is a trace                                                       // 56
      // trace should be avaialble all the time, but it won't                                                         // 57
      // if something wrong happened on the trace building                                                            // 58
      if(Kadira.options.enableErrorTracking && trace) {                                                               // 59
        Kadira.models.error.trackError(err, trace);                                                                   // 60
      }                                                                                                               // 61
    }                                                                                                                 // 62
                                                                                                                      // 63
    // wrap error stack so Meteor._debug can identify and ignore it                                                   // 64
    err.stack = {stack: err.stack, source: 'subscription'};                                                           // 65
    originalError.call(this, err);                                                                                    // 66
  };                                                                                                                  // 67
                                                                                                                      // 68
  var originalDeactivate = subscriptionProto._deactivate;                                                             // 69
  subscriptionProto._deactivate = function() {                                                                        // 70
    Kadira.models.pubsub._trackUnsub(this._session, this);                                                            // 71
    originalDeactivate.call(this);                                                                                    // 72
  };                                                                                                                  // 73
                                                                                                                      // 74
  //adding the currenSub env variable                                                                                 // 75
  ['added', 'changed', 'removed'].forEach(function(funcName) {                                                        // 76
    var originalFunc = subscriptionProto[funcName];                                                                   // 77
    subscriptionProto[funcName] = function(collectionName, id, fields) {                                              // 78
      var self = this;                                                                                                // 79
                                                                                                                      // 80
      //we need to run this code in a fiber and that's how we track                                                   // 81
      //subscription info. May be we can figure out, some other way to do this                                        // 82
      Kadira.env.currentSub = self;                                                                                   // 83
      var res = originalFunc.call(self, collectionName, id, fields);                                                  // 84
      Kadira.env.currentSub = null;                                                                                   // 85
                                                                                                                      // 86
      return res;                                                                                                     // 87
    };                                                                                                                // 88
  });                                                                                                                 // 89
};                                                                                                                    // 90
                                                                                                                      // 91
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/wrap_observers.js                                                           //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
wrapOplogObserveDriver = function(proto) {                                                                            // 1
  var originalRunQuery = proto._runQuery;                                                                             // 2
  proto._runQuery = function() {                                                                                      // 3
    var start = Date.now();                                                                                           // 4
    originalRunQuery.call(this);                                                                                      // 5
    this._lastPollTime = Date.now() - start;                                                                          // 6
  };                                                                                                                  // 7
                                                                                                                      // 8
  var originalStop = proto.stop;                                                                                      // 9
  proto.stop = function() {                                                                                           // 10
    if(this._ownerInfo && this._ownerInfo.type === 'sub') {                                                           // 11
      Kadira.models.pubsub.trackDeletedObserver(this._ownerInfo);                                                     // 12
    }                                                                                                                 // 13
                                                                                                                      // 14
    return originalStop.call(this);                                                                                   // 15
  };                                                                                                                  // 16
};                                                                                                                    // 17
                                                                                                                      // 18
wrapPollingObserveDriver = function(proto) {                                                                          // 19
  var originalPollMongo = proto._pollMongo;                                                                           // 20
  proto._pollMongo = function() {                                                                                     // 21
    var start = Date.now();                                                                                           // 22
    originalPollMongo.call(this);                                                                                     // 23
    this._lastPollTime = Date.now() - start;                                                                          // 24
  };                                                                                                                  // 25
                                                                                                                      // 26
  var originalStop = proto.stop;                                                                                      // 27
  proto.stop = function() {                                                                                           // 28
    if(this._ownerInfo && this._ownerInfo.type === 'sub') {                                                           // 29
      Kadira.models.pubsub.trackDeletedObserver(this._ownerInfo);                                                     // 30
    }                                                                                                                 // 31
                                                                                                                      // 32
    return originalStop.call(this);                                                                                   // 33
  };                                                                                                                  // 34
};                                                                                                                    // 35
                                                                                                                      // 36
wrapMultiplexer = function(proto) {                                                                                   // 37
  var originalInitalAdd = proto.addHandleAndSendInitialAdds;                                                          // 38
   proto.addHandleAndSendInitialAdds = function(handle) {                                                             // 39
    if(!this._firstInitialAddTime) {                                                                                  // 40
      this._firstInitialAddTime = Date.now();                                                                         // 41
    }                                                                                                                 // 42
                                                                                                                      // 43
    handle._wasMultiplexerReady = this._ready();                                                                      // 44
    handle._queueLength = this._queue._taskHandles.length;                                                            // 45
                                                                                                                      // 46
    if(!handle._wasMultiplexerReady) {                                                                                // 47
      handle._elapsedPollingTime = Date.now() - this._firstInitialAddTime;                                            // 48
    }                                                                                                                 // 49
    return originalInitalAdd.call(this, handle);                                                                      // 50
  };                                                                                                                  // 51
};                                                                                                                    // 52
                                                                                                                      // 53
// to count observers                                                                                                 // 54
var mongoConnectionProto = MeteorX.MongoConnection.prototype;                                                         // 55
var originalObserveChanges = mongoConnectionProto._observeChanges;                                                    // 56
mongoConnectionProto._observeChanges = function(cursorDescription, ordered, callbacks) {                              // 57
  var ret = originalObserveChanges.call(this, cursorDescription, ordered, callbacks);                                 // 58
  // get the Kadira Info via the Meteor.EnvironmentalVariable                                                         // 59
  var kadiraInfo = Kadira._getInfo(null, true);                                                                       // 60
                                                                                                                      // 61
  if(kadiraInfo && ret._multiplexer) {                                                                                // 62
    if(!ret._multiplexer.__kadiraTracked) {                                                                           // 63
      // new multiplexer                                                                                              // 64
      ret._multiplexer.__kadiraTracked = true;                                                                        // 65
      Kadira.models.pubsub.incrementHandleCount(kadiraInfo.trace, false);                                             // 66
      if(kadiraInfo.trace.type == 'sub') {                                                                            // 67
        var ownerInfo = {                                                                                             // 68
          type: kadiraInfo.trace.type,                                                                                // 69
          name: kadiraInfo.trace.name,                                                                                // 70
        };                                                                                                            // 71
                                                                                                                      // 72
        var observerDriver = ret._multiplexer._observeDriver;                                                         // 73
        observerDriver._ownerInfo = ownerInfo;                                                                        // 74
        Kadira.models.pubsub.trackCreatedObserver(ownerInfo);                                                         // 75
      }                                                                                                               // 76
    } else {                                                                                                          // 77
      Kadira.models.pubsub.incrementHandleCount(kadiraInfo.trace, true);                                              // 78
    }                                                                                                                 // 79
  }                                                                                                                   // 80
                                                                                                                      // 81
  return ret;                                                                                                         // 82
}                                                                                                                     // 83
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/session.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var logger = Npm.require('debug')('kadira:hijack:session');                                                           // 1
                                                                                                                      // 2
Kadira._startInstrumenting = function(callback) {                                                                     // 3
  //instrumenting session                                                                                             // 4
  wrapServer(MeteorX.Server.prototype);                                                                               // 5
  wrapSession(MeteorX.Session.prototype);                                                                             // 6
  wrapSubscription(MeteorX.Subscription.prototype);                                                                   // 7
                                                                                                                      // 8
  if(MeteorX.MongoOplogDriver) {                                                                                      // 9
    wrapOplogObserveDriver(MeteorX.MongoOplogDriver.prototype);                                                       // 10
  }                                                                                                                   // 11
                                                                                                                      // 12
  if(MeteorX.MongoPollingDriver) {                                                                                    // 13
    wrapPollingObserveDriver(MeteorX.MongoPollingDriver.prototype);                                                   // 14
  }                                                                                                                   // 15
                                                                                                                      // 16
  if(MeteorX.Multiplexer) {                                                                                           // 17
    wrapMultiplexer(MeteorX.Multiplexer.prototype);                                                                   // 18
  }                                                                                                                   // 19
                                                                                                                      // 20
  setLabels();                                                                                                        // 21
  callback();                                                                                                         // 22
};                                                                                                                    // 23
                                                                                                                      // 24
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/db.js                                                                       //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var mongoConnectionProto = MeteorX.MongoConnection.prototype;                                                         // 1
                                                                                                                      // 2
//findOne is handled by find - so no need to track it                                                                 // 3
//upsert is handles by update                                                                                         // 4
['find', 'update', 'remove', 'insert', '_ensureIndex', '_dropIndex'].forEach(function(func) {                         // 5
  var originalFunc = mongoConnectionProto[func];                                                                      // 6
  mongoConnectionProto[func] = function(collName, selector, mod, options) {                                           // 7
    options = options || {};                                                                                          // 8
    var payload = {                                                                                                   // 9
      coll: collName,                                                                                                 // 10
      func: func,                                                                                                     // 11
    };                                                                                                                // 12
                                                                                                                      // 13
    if(func == 'insert') {                                                                                            // 14
      //add nothing more to the payload                                                                               // 15
    } else if(func == '_ensureIndex' || func == '_dropIndex') {                                                       // 16
      //add index                                                                                                     // 17
      payload.index = JSON.stringify(selector);                                                                       // 18
    } else if(func == 'update' && options.upsert) {                                                                   // 19
      payload.func = 'upsert';                                                                                        // 20
      payload.selector = JSON.stringify(selector);                                                                    // 21
    } else {                                                                                                          // 22
      //all the other functions have selectors                                                                        // 23
      payload.selector = JSON.stringify(selector);                                                                    // 24
    }                                                                                                                 // 25
                                                                                                                      // 26
    var kadiraInfo = Kadira._getInfo();                                                                               // 27
    if(kadiraInfo) {                                                                                                  // 28
      var eventId = Kadira.tracer.event(kadiraInfo.trace, 'db', payload);                                             // 29
    }                                                                                                                 // 30
                                                                                                                      // 31
    //this cause V8 to avoid any performance optimizations, but this is must to use                                   // 32
    //otherwise, if the error adds try catch block our logs get messy and didn't work                                 // 33
    //see: issue #6                                                                                                   // 34
    try{                                                                                                              // 35
      var ret = originalFunc.apply(this, arguments);                                                                  // 36
      //handling functions which can be triggered with an asyncCallback                                               // 37
      var endOptions = {};                                                                                            // 38
                                                                                                                      // 39
      if(HaveAsyncCallback(arguments)) {                                                                              // 40
        endOptions.async = true;                                                                                      // 41
      }                                                                                                               // 42
                                                                                                                      // 43
      if(func == 'update') {                                                                                          // 44
        // upsert only returns an object when called `upsert` directly                                                // 45
        // otherwise it only act an update command                                                                    // 46
        if(options.upsert && typeof ret == 'object') {                                                                // 47
          endOptions.updatedDocs = ret.numberAffected;                                                                // 48
          endOptions.insertedId = ret.insertedId;                                                                     // 49
        } else {                                                                                                      // 50
          endOptions.updatedDocs = ret;                                                                               // 51
        }                                                                                                             // 52
      } else if(func == 'remove') {                                                                                   // 53
        endOptions.removedDocs = ret;                                                                                 // 54
      }                                                                                                               // 55
                                                                                                                      // 56
      if(eventId) {                                                                                                   // 57
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endOptions);                                                // 58
      }                                                                                                               // 59
    } catch(ex) {                                                                                                     // 60
      if(eventId) {                                                                                                   // 61
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {err: ex.message});                                         // 62
      }                                                                                                               // 63
      throw ex;                                                                                                       // 64
    }                                                                                                                 // 65
                                                                                                                      // 66
    return ret;                                                                                                       // 67
  };                                                                                                                  // 68
});                                                                                                                   // 69
                                                                                                                      // 70
var cursorProto = MeteorX.MongoCursor.prototype;                                                                      // 71
['forEach', 'map', 'fetch', 'count', 'observeChanges', 'observe', 'rewind'].forEach(function(type) {                  // 72
  var originalFunc = cursorProto[type];                                                                               // 73
  cursorProto[type] = function() {                                                                                    // 74
    var cursorDescription = this._cursorDescription;                                                                  // 75
    var payload = {                                                                                                   // 76
      coll: cursorDescription.collectionName,                                                                         // 77
      selector: JSON.stringify(cursorDescription.selector),                                                           // 78
      func: type,                                                                                                     // 79
      cursor: true                                                                                                    // 80
    };                                                                                                                // 81
                                                                                                                      // 82
    if(cursorDescription.options) {                                                                                   // 83
      var options = _.pick(cursorDescription.options, ['fields', 'sort', 'limit']);                                   // 84
      for(var field in options) {                                                                                     // 85
        var value = options[field]                                                                                    // 86
        if(typeof value == 'object') {                                                                                // 87
          value = JSON.stringify(value);                                                                              // 88
        }                                                                                                             // 89
        payload[field] = value;                                                                                       // 90
      }                                                                                                               // 91
    };                                                                                                                // 92
                                                                                                                      // 93
    var kadiraInfo = Kadira._getInfo();                                                                               // 94
    if(kadiraInfo) {                                                                                                  // 95
      var eventId = Kadira.tracer.event(kadiraInfo.trace, 'db', payload);                                             // 96
    }                                                                                                                 // 97
                                                                                                                      // 98
    try{                                                                                                              // 99
      var ret = originalFunc.apply(this, arguments);                                                                  // 100
                                                                                                                      // 101
      var endData = {};                                                                                               // 102
      if(type == 'observeChanges' || type == 'observe') {                                                             // 103
        var observerDriver;                                                                                           // 104
        endData.oplog = false;                                                                                        // 105
        // get data written by the multiplexer                                                                        // 106
        endData.wasMultiplexerReady = ret._wasMultiplexerReady;                                                       // 107
        endData.queueLength = ret._queueLength;                                                                       // 108
        endData.elapsedPollingTime = ret._elapsedPollingTime;                                                         // 109
                                                                                                                      // 110
        if(ret._multiplexer) {                                                                                        // 111
          endData.noOfHandles = Object.keys(ret._multiplexer._handles).length;                                        // 112
                                                                                                                      // 113
          // older meteor versions done not have an _multiplexer value                                                // 114
          observerDriver = ret._multiplexer._observeDriver;                                                           // 115
          if(observerDriver) {                                                                                        // 116
            observerDriver = ret._multiplexer._observeDriver;                                                         // 117
            var observerDriverClass = observerDriver.constructor;                                                     // 118
            var usesOplog = typeof observerDriverClass.cursorSupported == 'function';                                 // 119
            endData.oplog = usesOplog;                                                                                // 120
            var size = 0;                                                                                             // 121
            ret._multiplexer._cache.docs.forEach(function() {size++});                                                // 122
            endData.noOfCachedDocs = size;                                                                            // 123
                                                                                                                      // 124
            // if multiplexerWasNotReady, we need to get the time spend for the polling                               // 125
            if(!ret._wasMultiplexerReady) {                                                                           // 126
              endData.initialPollingTime = observerDriver._lastPollTime;                                              // 127
            }                                                                                                         // 128
          }                                                                                                           // 129
        }                                                                                                             // 130
                                                                                                                      // 131
        if(!endData.oplog) {                                                                                          // 132
          // let's try to find the reason                                                                             // 133
          var reasonInfo = Kadira.checkWhyNoOplog(cursorDescription, observerDriver);                                 // 134
          endData.noOplogCode = reasonInfo.code;                                                                      // 135
          endData.noOplogReason = reasonInfo.reason;                                                                  // 136
          endData.noOplogSolution = reasonInfo.solution;                                                              // 137
        }                                                                                                             // 138
      } else if(type == 'fetch' || type == 'map'){                                                                    // 139
        //for other cursor operation                                                                                  // 140
        endData.docsFetched = ret.length;                                                                             // 141
      }                                                                                                               // 142
                                                                                                                      // 143
      if(eventId) {                                                                                                   // 144
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endData);                                                   // 145
      }                                                                                                               // 146
      return ret;                                                                                                     // 147
    } catch(ex) {                                                                                                     // 148
      if(eventId) {                                                                                                   // 149
        Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {err: ex.message});                                         // 150
      }                                                                                                               // 151
      throw ex;                                                                                                       // 152
    }                                                                                                                 // 153
  };                                                                                                                  // 154
});                                                                                                                   // 155
                                                                                                                      // 156
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/http.js                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var originalCall = HTTP.call;                                                                                         // 1
                                                                                                                      // 2
HTTP.call = function(method, url) {                                                                                   // 3
  var kadiraInfo = Kadira._getInfo();                                                                                 // 4
  if(kadiraInfo) {                                                                                                    // 5
    var eventId = Kadira.tracer.event(kadiraInfo.trace, 'http', {method: method, url: url});                          // 6
  }                                                                                                                   // 7
                                                                                                                      // 8
  try {                                                                                                               // 9
    var response = originalCall.apply(this, arguments);                                                               // 10
                                                                                                                      // 11
    //if the user supplied an asynCallback, we don't have a response object and it handled asynchronously             // 12
    //we need to track it down to prevent issues like: #3                                                             // 13
    var endOptions = HaveAsyncCallback(arguments)? {async: true}: {statusCode: response.statusCode};                  // 14
    if(eventId) {                                                                                                     // 15
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, endOptions);                                                  // 16
    }                                                                                                                 // 17
    return response;                                                                                                  // 18
  } catch(ex) {                                                                                                       // 19
    if(eventId) {                                                                                                     // 20
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {err: ex.message});                                           // 21
    }                                                                                                                 // 22
    throw ex;                                                                                                         // 23
  }                                                                                                                   // 24
};                                                                                                                    // 25
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/email.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var originalSend = Email.send;                                                                                        // 1
                                                                                                                      // 2
Email.send = function(options) {                                                                                      // 3
  var kadiraInfo = Kadira._getInfo();                                                                                 // 4
  if(kadiraInfo) {                                                                                                    // 5
    var eventId = Kadira.tracer.event(kadiraInfo.trace, 'email');                                                     // 6
  }                                                                                                                   // 7
  try {                                                                                                               // 8
    var ret = originalSend.call(this, options);                                                                       // 9
    if(eventId) {                                                                                                     // 10
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId);                                                              // 11
    }                                                                                                                 // 12
    return ret;                                                                                                       // 13
  } catch(ex) {                                                                                                       // 14
    if(eventId) {                                                                                                     // 15
      Kadira.tracer.eventEnd(kadiraInfo.trace, eventId, {err: ex.message});                                           // 16
    }                                                                                                                 // 17
    throw ex;                                                                                                         // 18
  }                                                                                                                   // 19
};                                                                                                                    // 20
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/async.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var Fibers = Npm.require('fibers');                                                                                   // 1
                                                                                                                      // 2
var originalYield = Fibers.yield;                                                                                     // 3
Fibers.yield = function() {                                                                                           // 4
  var kadiraInfo = Kadira._getInfo();                                                                                 // 5
  if(kadiraInfo) {                                                                                                    // 6
    var eventId = Kadira.tracer.event(kadiraInfo.trace, 'async');;                                                    // 7
    if(eventId) {                                                                                                     // 8
      Fibers.current._apmEventId = eventId;                                                                           // 9
    }                                                                                                                 // 10
  }                                                                                                                   // 11
                                                                                                                      // 12
  originalYield();                                                                                                    // 13
};                                                                                                                    // 14
                                                                                                                      // 15
var originalRun = Fibers.prototype.run;                                                                               // 16
Fibers.prototype.run = function(val) {                                                                                // 17
  if(this._apmEventId) {                                                                                              // 18
    var kadiraInfo = Kadira._getInfo(this);                                                                           // 19
    Kadira.tracer.eventEnd(kadiraInfo.trace, this._apmEventId);                                                       // 20
    this._apmEventId = null;                                                                                          // 21
  }                                                                                                                   // 22
  originalRun.call(this, val);                                                                                        // 23
};                                                                                                                    // 24
                                                                                                                      // 25
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/hijack/error.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
TrackUncaughtExceptions = function () {                                                                               // 1
  process.on('uncaughtException', function (err) {                                                                    // 2
    // skip errors with `_skipKadira` flag                                                                            // 3
    if(err._skipKadira) {                                                                                             // 4
      return;                                                                                                         // 5
    }                                                                                                                 // 6
                                                                                                                      // 7
    // let the server crash normally if error tracking is disabled                                                    // 8
    if(!Kadira.options.enableErrorTracking) {                                                                         // 9
      throw err;                                                                                                      // 10
    }                                                                                                                 // 11
                                                                                                                      // 12
    // looking for already tracked errors and throw them immediately                                                  // 13
    // throw error immediately if kadira is not ready                                                                 // 14
    if(err._tracked || !Kadira.connected) {                                                                           // 15
      throw err;                                                                                                      // 16
    }                                                                                                                 // 17
                                                                                                                      // 18
    var trace = getTrace(err, 'server-crash', 'uncaughtException');                                                   // 19
    Kadira.models.error.trackError(err, trace);                                                                       // 20
    Kadira._sendPayload(function () {                                                                                 // 21
      clearTimeout(timer);                                                                                            // 22
      throwError(err);                                                                                                // 23
    });                                                                                                               // 24
                                                                                                                      // 25
    var timer = setTimeout(function () {                                                                              // 26
      throwError(err);                                                                                                // 27
    }, 1000*10);                                                                                                      // 28
                                                                                                                      // 29
    function throwError(err) {                                                                                        // 30
      // sometimes error came back from a fiber.                                                                      // 31
      // But we don't fibers to track that error for us                                                               // 32
      // That's why we throw the error on the nextTick                                                                // 33
      process.nextTick(function() {                                                                                   // 34
        // we need to mark this error where we really need to throw                                                   // 35
        err._tracked = true;                                                                                          // 36
        throw err;                                                                                                    // 37
      });                                                                                                             // 38
    }                                                                                                                 // 39
  });                                                                                                                 // 40
}                                                                                                                     // 41
                                                                                                                      // 42
TrackMeteorDebug = function () {                                                                                      // 43
  var originalMeteorDebug = Meteor._debug;                                                                            // 44
  Meteor._debug = function (message, stack) {                                                                         // 45
    if(!Kadira.options.enableErrorTracking) {                                                                         // 46
      return originalMeteorDebug.call(this, message, stack);                                                          // 47
    }                                                                                                                 // 48
                                                                                                                      // 49
    // We've changed `stack` into an object at method and sub handlers so we can                                      // 50
    // ignore them here. These errors are already tracked so don't track again.                                       // 51
    if(stack && stack.stack) {                                                                                        // 52
      stack = stack.stack                                                                                             // 53
    } else {                                                                                                          // 54
      // only send to the server, if only connected to kadira                                                         // 55
      if(Kadira.connected) {                                                                                          // 56
        var error = new Error(message);                                                                               // 57
        error.stack = stack;                                                                                          // 58
        var trace = getTrace(error, 'server-internal', 'Meteor._debug');                                              // 59
        Kadira.models.error.trackError(error, trace);                                                                 // 60
      }                                                                                                               // 61
    }                                                                                                                 // 62
                                                                                                                      // 63
    return originalMeteorDebug.apply(this, arguments);                                                                // 64
  }                                                                                                                   // 65
}                                                                                                                     // 66
                                                                                                                      // 67
function getTrace(err, type, subType) {                                                                               // 68
  return {                                                                                                            // 69
    type: type,                                                                                                       // 70
    subType: subType,                                                                                                 // 71
    name: err.message,                                                                                                // 72
    errored: true,                                                                                                    // 73
    at: Kadira.syncedDate.getTime(),                                                                                  // 74
    events: [                                                                                                         // 75
      ['start', 0, {}],                                                                                               // 76
      ['error', 0, {error: {message: err.message, stack: err.stack}}]                                                 // 77
    ],                                                                                                                // 78
    metrics: {                                                                                                        // 79
      total: 0                                                                                                        // 80
    }                                                                                                                 // 81
  };                                                                                                                  // 82
}                                                                                                                     // 83
                                                                                                                      // 84
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/profile/server.js                                                                  //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var fs = Npm.require('fs');                                                                                           // 1
                                                                                                                      // 2
Meteor.methods({                                                                                                      // 3
  "kadira.profileCpu": function(arg1, arg2, type) {                                                                   // 4
    check(arguments, [Match.Any]);                                                                                    // 5
    this.unblock();                                                                                                   // 6
    if(type == 'remote') {                                                                                            // 7
      return remoteProfileCPU(arg1, arg2);                                                                            // 8
    } else {                                                                                                          // 9
      return localProfileCPU(arg1, arg2);                                                                             // 10
    }                                                                                                                 // 11
  }                                                                                                                   // 12
});                                                                                                                   // 13
                                                                                                                      // 14
remoteProfileCPU = function(timeToProfileSecs, id) {                                                                  // 15
  // get the job and validate it                                                                                      // 16
  var job = Jobs.get(id);                                                                                             // 17
                                                                                                                      // 18
  if(!job) {                                                                                                          // 19
    throw new Meteor.Error(403, "There is no such cpuProfile job: " + id);                                            // 20
  } else if(job.state != 'created') {                                                                                 // 21
    throw new Meteor.Error(403, "CPU profile job has been already performed!");                                       // 22
  }                                                                                                                   // 23
                                                                                                                      // 24
  try {                                                                                                               // 25
    console.log("Kadira: remote CPU profiling started for %s secs", timeToProfileSecs);                               // 26
    var usage = Kadira.models.system.getUsage() || {};                                                                // 27
    var jobData = {beforeCpu: usage.cpu};                                                                             // 28
    Jobs.set(id, {state: 'initiated', data: jobData});                                                                // 29
                                                                                                                      // 30
    var name = Random.id();                                                                                           // 31
    var profile = getCpuProfile(name, timeToProfileSecs);                                                             // 32
    console.log("Kadira: uploding the taken CPU profile");                                                            // 33
    Jobs.set(id, {state: 'profile-taken'});                                                                           // 34
                                                                                                                      // 35
    uploadProfile(profile, job.data.uploadUrl);                                                                       // 36
    console.log("Kadira: profiling has been completed! Visit Kadira UI to analyze it.");                              // 37
    Jobs.set(id, {state: 'completed'});                                                                               // 38
                                                                                                                      // 39
    return "CPU Profile has been completed. Check Kadira UI to analyze it.";                                          // 40
  } catch(ex) {                                                                                                       // 41
    Jobs.set(id, {state: 'errored', data:{errorMessage: ex.message}});                                                // 42
    throw ex;                                                                                                         // 43
  }                                                                                                                   // 44
};                                                                                                                    // 45
                                                                                                                      // 46
localProfileCPU = function(timeToProfileSecs, outputLocation) {                                                       // 47
  if(!process.env.KADIRA_PROFILE_LOCALLY) {                                                                           // 48
    throw new Meteor.Error(403, "run your app with `KADIRA_PROFILE_LOCALLY` env vairable to profile locally.")        // 49
  }                                                                                                                   // 50
                                                                                                                      // 51
  var name = Random.id();                                                                                             // 52
  if(!outputLocation) {                                                                                               // 53
    outputLocation = '/tmp/' + name + '.cpuprofile';                                                                  // 54
  }                                                                                                                   // 55
  console.log('Kadira: started profiling for %s secs', timeToProfileSecs);                                            // 56
  var profile = getCpuProfile(name, timeToProfileSecs);                                                               // 57
                                                                                                                      // 58
  console.log('Kadira: saving CPU profile to: ' + outputLocation);                                                    // 59
  writeToDisk(outputLocation, JSON.stringify(profile));                                                               // 60
  console.log('Kadira: CPU profile saved.');                                                                          // 61
                                                                                                                      // 62
  return "cpu profile has been saved to: " + outputLocation;                                                          // 63
};                                                                                                                    // 64
                                                                                                                      // 65
getCpuProfile = Kadira._wrapAsync(function(name, timeToProfileSecs, callback) {                                       // 66
  var v8Profiler = Kadira._binaryRequire('v8-profiler');                                                              // 67
  v8Profiler.startProfiling(name);                                                                                    // 68
  setTimeout(function() {                                                                                             // 69
    var profile = v8Profiler.stopProfiling(name);                                                                     // 70
    callback(null, profile);                                                                                          // 71
  }, timeToProfileSecs * 1000);                                                                                       // 72
});                                                                                                                   // 73
                                                                                                                      // 74
writeToDisk = Kadira._wrapAsync(fs.writeFile);                                                                        // 75
                                                                                                                      // 76
function uploadProfile (profile, url) {                                                                               // 77
  var content = JSON.stringify(profile);                                                                              // 78
  var headers = {                                                                                                     // 79
    'Content-Type': 'application/json',                                                                               // 80
    'Content-Length': Buffer.byteLength(content)                                                                      // 81
  };                                                                                                                  // 82
  return HTTP.put(url, {content: content, headers: headers});                                                         // 83
}                                                                                                                     // 84
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/profile/set_labels.js                                                              //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
setLabels = function () {                                                                                             // 1
  // name Session.prototype.send                                                                                      // 2
  var originalSend = MeteorX.Session.prototype.send;                                                                  // 3
  MeteorX.Session.prototype.send = function kadira_Session_send (msg) {                                               // 4
    return originalSend.call(this, msg);                                                                              // 5
  }                                                                                                                   // 6
                                                                                                                      // 7
  // name mongodb.Connection.createDataHandler                                                                        // 8
  var mongodb = MongoInternals.NpmModule;                                                                             // 9
  var originalCreateDataHandler = mongodb.Connection.createDataHandler;                                               // 10
  mongodb.Connection.createDataHandler = function (self) {                                                            // 11
    var originalHandler = originalCreateDataHandler.call(this, self);                                                 // 12
    return function kadira_MongoDB_dataHandler (data) {                                                               // 13
      return originalHandler.call(this, data);                                                                        // 14
    }                                                                                                                 // 15
  }                                                                                                                   // 16
                                                                                                                      // 17
  // name Multiplexer initial adds                                                                                    // 18
  var originalSendAdds = MeteorX.Multiplexer.prototype._sendAdds;                                                     // 19
  MeteorX.Multiplexer.prototype._sendAdds = function kadira_Multiplexer_sendAdds (handle) {                           // 20
    return originalSendAdds.call(this, handle);                                                                       // 21
  }                                                                                                                   // 22
                                                                                                                      // 23
  // name MongoConnection insert                                                                                      // 24
  var originalMongoInsert = MeteorX.MongoConnection.prototype._insert;                                                // 25
  MeteorX.MongoConnection.prototype._insert = function kadira_MongoConnection_insert (coll, doc, cb) {                // 26
    return originalMongoInsert.call(this, coll, doc, cb);                                                             // 27
  }                                                                                                                   // 28
                                                                                                                      // 29
  // name MongoConnection update                                                                                      // 30
  var originalMongoUpdate = MeteorX.MongoConnection.prototype._update;                                                // 31
  MeteorX.MongoConnection.prototype._update = function kadira_MongoConnection_update (coll, selector, mod, options, cb) {
    return originalMongoUpdate.call(this, coll, selector, mod, options, cb);                                          // 33
  }                                                                                                                   // 34
                                                                                                                      // 35
  // name MongoConnection remove                                                                                      // 36
  var originalMongoRemove = MeteorX.MongoConnection.prototype._remove;                                                // 37
  MeteorX.MongoConnection.prototype._remove = function kadira_MongoConnection_remove (coll, selector, cb) {           // 38
    return originalMongoRemove.call(this, coll, selector, cb);                                                        // 39
  }                                                                                                                   // 40
                                                                                                                      // 41
  // name Pubsub added                                                                                                // 42
  var originalPubsubAdded = MeteorX.Session.prototype.sendAdded;                                                      // 43
  MeteorX.Session.prototype.sendAdded = function kadira_Session_sendAdded (coll, id, fields) {                        // 44
    return originalPubsubAdded.call(this, coll, id, fields);                                                          // 45
  }                                                                                                                   // 46
                                                                                                                      // 47
  // name Pubsub changed                                                                                              // 48
  var originalPubsubChanged = MeteorX.Session.prototype.sendChanged;                                                  // 49
  MeteorX.Session.prototype.sendChanged = function kadira_Session_sendChanged (coll, id, fields) {                    // 50
    return originalPubsubChanged.call(this, coll, id, fields);                                                        // 51
  }                                                                                                                   // 52
                                                                                                                      // 53
  // name Pubsub removed                                                                                              // 54
  var originalPubsubRemoved = MeteorX.Session.prototype.sendRemoved;                                                  // 55
  MeteorX.Session.prototype.sendRemoved = function kadira_Session_sendRemoved (coll, id) {                            // 56
    return originalPubsubRemoved.call(this, coll, id);                                                                // 57
  }                                                                                                                   // 58
                                                                                                                      // 59
  // name MongoCursor forEach                                                                                         // 60
  var originalCursorForEach = MeteorX.MongoCursor.prototype.forEach;                                                  // 61
  MeteorX.MongoCursor.prototype.forEach = function kadira_Cursor_forEach () {                                         // 62
    return originalCursorForEach.apply(this, arguments);                                                              // 63
  }                                                                                                                   // 64
                                                                                                                      // 65
  // name MongoCursor map                                                                                             // 66
  var originalCursorMap = MeteorX.MongoCursor.prototype.map;                                                          // 67
  MeteorX.MongoCursor.prototype.map = function kadira_Cursor_map () {                                                 // 68
    return originalCursorMap.apply(this, arguments);                                                                  // 69
  }                                                                                                                   // 70
                                                                                                                      // 71
  // name MongoCursor fetch                                                                                           // 72
  var originalCursorFetch = MeteorX.MongoCursor.prototype.fetch;                                                      // 73
  MeteorX.MongoCursor.prototype.fetch = function kadira_Cursor_fetch () {                                             // 74
    return originalCursorFetch.apply(this, arguments);                                                                // 75
  }                                                                                                                   // 76
                                                                                                                      // 77
  // name MongoCursor count                                                                                           // 78
  var originalCursorCount = MeteorX.MongoCursor.prototype.count;                                                      // 79
  MeteorX.MongoCursor.prototype.count = function kadira_Cursor_count () {                                             // 80
    return originalCursorCount.apply(this, arguments);                                                                // 81
  }                                                                                                                   // 82
                                                                                                                      // 83
  // name MongoCursor observeChanges                                                                                  // 84
  var originalCursorObserveChanges = MeteorX.MongoCursor.prototype.observeChanges;                                    // 85
  MeteorX.MongoCursor.prototype.observeChanges = function kadira_Cursor_observeChanges () {                           // 86
    return originalCursorObserveChanges.apply(this, arguments);                                                       // 87
  }                                                                                                                   // 88
                                                                                                                      // 89
  // name MongoCursor observe                                                                                         // 90
  var originalCursorObserve = MeteorX.MongoCursor.prototype.observe;                                                  // 91
  MeteorX.MongoCursor.prototype.observe = function kadira_Cursor_observe () {                                         // 92
    return originalCursorObserve.apply(this, arguments);                                                              // 93
  }                                                                                                                   // 94
                                                                                                                      // 95
  // name MongoCursor rewind                                                                                          // 96
  var originalCursorRewind = MeteorX.MongoCursor.prototype.rewind;                                                    // 97
  MeteorX.MongoCursor.prototype.rewind = function kadira_Cursor_rewind () {                                           // 98
    return originalCursorRewind.apply(this, arguments);                                                               // 99
  }                                                                                                                   // 100
                                                                                                                      // 101
  // name CrossBar listen                                                                                             // 102
  var originalCrossbarListen = DDPServer._Crossbar.prototype.listen;                                                  // 103
  DDPServer._Crossbar.prototype.listen = function kadira_Crossbar_listen (trigger, callback) {                        // 104
    return originalCrossbarListen.call(this, trigger, callback);                                                      // 105
  }                                                                                                                   // 106
                                                                                                                      // 107
  // name CrossBar fire                                                                                               // 108
  var originalCrossbarFire = DDPServer._Crossbar.prototype.fire;                                                      // 109
  DDPServer._Crossbar.prototype.fire = function kadira_Crossbar_fire (notification) {                                 // 110
    return originalCrossbarFire.call(this, notification);                                                             // 111
  }                                                                                                                   // 112
}                                                                                                                     // 113
                                                                                                                      // 114
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/auto_connect.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// AutoConnect using Environment Variables                                                                            // 1
if(process.env.KADIRA_APP_ID && process.env.KADIRA_APP_SECRET) {                                                      // 2
  Kadira.connect(                                                                                                     // 3
    process.env.KADIRA_APP_ID,                                                                                        // 4
    process.env.KADIRA_APP_SECRET                                                                                     // 5
  );                                                                                                                  // 6
                                                                                                                      // 7
  Kadira.connect = function() {                                                                                       // 8
    throw new Error('Kadira has been already connected using credentials from Environment Variables');                // 9
  };                                                                                                                  // 10
}                                                                                                                     // 11
                                                                                                                      // 12
// AutoConnect using Meteor.settings                                                                                  // 13
if(                                                                                                                   // 14
  Meteor.settings.kadira &&                                                                                           // 15
  Meteor.settings.kadira.appId &&                                                                                     // 16
  Meteor.settings.kadira.appSecret                                                                                    // 17
) {                                                                                                                   // 18
  Kadira.connect(                                                                                                     // 19
    Meteor.settings.kadira.appId,                                                                                     // 20
    Meteor.settings.kadira.appSecret,                                                                                 // 21
    Meteor.settings.kadira.options || {}                                                                              // 22
  );                                                                                                                  // 23
                                                                                                                      // 24
  Kadira.connect = function() {                                                                                       // 25
    throw new Error('Kadira has been already connected using credentials from Meteor.settings');                      // 26
  };                                                                                                                  // 27
}                                                                                                                     // 28
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/common/default_error_filters.js                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
var commonErrRegExps = [                                                                                              // 1
  /connection timeout\. no (\w*) heartbeat received/i,                                                                // 2
  /INVALID_STATE_ERR/i,                                                                                               // 3
];                                                                                                                    // 4
                                                                                                                      // 5
Kadira.errorFilters = {                                                                                               // 6
  filterValidationErrors: function(type, message, err) {                                                              // 7
    if(err && err instanceof Meteor.Error) {                                                                          // 8
      return false;                                                                                                   // 9
    } else {                                                                                                          // 10
      return true;                                                                                                    // 11
    }                                                                                                                 // 12
  },                                                                                                                  // 13
                                                                                                                      // 14
  filterCommonMeteorErrors: function(type, message) {                                                                 // 15
    for(var lc=0; lc<commonErrRegExps.length; lc++) {                                                                 // 16
      var regExp = commonErrRegExps[lc];                                                                              // 17
      if(regExp.test(message)) {                                                                                      // 18
        return false;                                                                                                 // 19
      }                                                                                                               // 20
    }                                                                                                                 // 21
    return true;                                                                                                      // 22
  }                                                                                                                   // 23
};                                                                                                                    // 24
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/meteorhacks:kadira/lib/common/send.js                                                                     //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
Kadira.send = function (payload, path, callback) {                                                                    // 1
  if(!Kadira.connected)  {                                                                                            // 2
    throw new Error("You need to connect with Kadira first, before sending messages!");                               // 3
  }                                                                                                                   // 4
                                                                                                                      // 5
  path = (path.substr(0, 1) != '/')? "/" + path : path;                                                               // 6
  var endpoint = Kadira.options.endpoint + path;                                                                      // 7
  var retryCount = 0;                                                                                                 // 8
  var retry = new Retry({                                                                                             // 9
    minCount: 1,                                                                                                      // 10
    minTimeout: 0,                                                                                                    // 11
    baseTimeout: 1000*5,                                                                                              // 12
    maxTimeout: 1000*60,                                                                                              // 13
  });                                                                                                                 // 14
                                                                                                                      // 15
  var sendFunction = Kadira._getSendFunction();                                                                       // 16
  tryToSend();                                                                                                        // 17
                                                                                                                      // 18
  function tryToSend(err) {                                                                                           // 19
    if(retryCount < 5) {                                                                                              // 20
      retry.retryLater(retryCount++, send);                                                                           // 21
    } else {                                                                                                          // 22
      console.warn('Error sending error traces to kadira server');                                                    // 23
      if(callback) callback(err);                                                                                     // 24
    }                                                                                                                 // 25
  }                                                                                                                   // 26
                                                                                                                      // 27
  function send() {                                                                                                   // 28
    sendFunction(endpoint, payload, function(err, content, statusCode) {                                              // 29
      if(err) {                                                                                                       // 30
        tryToSend(err);                                                                                               // 31
      } else if(statusCode == 200){                                                                                   // 32
        if(callback) callback(null, content);                                                                         // 33
      } else {                                                                                                        // 34
        if(callback) callback(new Meteor.Error(statusCode, content));                                                 // 35
      }                                                                                                               // 36
    });                                                                                                               // 37
  }                                                                                                                   // 38
};                                                                                                                    // 39
                                                                                                                      // 40
Kadira._getSendFunction = function() {                                                                                // 41
  return (Meteor.isServer)? Kadira._serverSend : Kadira._clientSend;                                                  // 42
};                                                                                                                    // 43
                                                                                                                      // 44
Kadira._clientSend = function (endpoint, payload, callback) {                                                         // 45
  $.ajax({                                                                                                            // 46
    type: 'POST',                                                                                                     // 47
    url: endpoint,                                                                                                    // 48
    contentType: 'application/json',                                                                                  // 49
    data: JSON.stringify(payload),                                                                                    // 50
    error: function(err) {                                                                                            // 51
      callback(err);                                                                                                  // 52
    },                                                                                                                // 53
    success: function(data) {                                                                                         // 54
      callback(null, data, 200);                                                                                      // 55
    }                                                                                                                 // 56
  });                                                                                                                 // 57
}                                                                                                                     // 58
                                                                                                                      // 59
Kadira._serverSend = function (endpoint, payload, callback) {                                                         // 60
  callback = callback || function() {};                                                                               // 61
  var Fiber = Npm.require('fibers');                                                                                  // 62
  new Fiber(function() {                                                                                              // 63
    var httpOptions = {                                                                                               // 64
      data: payload,                                                                                                  // 65
      headers: Kadira.options.authHeaders                                                                             // 66
    };                                                                                                                // 67
                                                                                                                      // 68
    HTTP.call('POST', endpoint, httpOptions, function(err, res) {                                                     // 69
      if(res) {                                                                                                       // 70
        var content = (res.statusCode == 200)? res.data : res.content;                                                // 71
        callback(null, content, res.statusCode);                                                                      // 72
      } else {                                                                                                        // 73
        callback(err);                                                                                                // 74
      }                                                                                                               // 75
    });                                                                                                               // 76
  }).run();                                                                                                           // 77
}                                                                                                                     // 78
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:kadira'] = {
  Kadira: Kadira
};

})();

//# sourceMappingURL=meteorhacks_kadira.js.map
