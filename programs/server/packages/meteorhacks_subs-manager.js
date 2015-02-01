(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var SubsManager;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// packages/meteorhacks:subs-manager/lib/sub_manager.js                                     //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
SubsManager = function (options) {                                                          // 1
  var self = this;                                                                          // 2
  self.options = options || {};                                                             // 3
  // maxiumum number of subscriptions are cached                                            // 4
  self.options.cacheLimit = self.options.cacheLimit || 10;                                  // 5
  // maximum time, subscription stay in the cache                                           // 6
  self.options.expireIn = self.options.expireIn || 5;                                       // 7
                                                                                            // 8
  self._cacheMap = {};                                                                      // 9
  self._cacheList = [];                                                                     // 10
  self.ready = false;                                                                       // 11
  self.dep = new Deps.Dependency();                                                         // 12
                                                                                            // 13
  self.computation = self._registerComputation();                                           // 14
};                                                                                          // 15
                                                                                            // 16
SubsManager.prototype.subscribe = function() {                                              // 17
  var self = this;                                                                          // 18
  if(Meteor.isClient) {                                                                     // 19
    this._addSub(arguments);                                                                // 20
                                                                                            // 21
    return {                                                                                // 22
      ready: function() {                                                                   // 23
        self.dep.depend();                                                                  // 24
        return self.ready;                                                                  // 25
      }                                                                                     // 26
    };                                                                                      // 27
  } else {                                                                                  // 28
    // to support fast-render                                                               // 29
    if(Meteor.subscribe) {                                                                  // 30
      return Meteor.subscribe.apply(Meteor, arguments);                                     // 31
    }                                                                                       // 32
  }                                                                                         // 33
};                                                                                          // 34
                                                                                            // 35
SubsManager.prototype._addSub = function(args) {                                            // 36
  var self = this;                                                                          // 37
  var hash = EJSON.stringify(args);                                                         // 38
  args = _.toArray(args);                                                                   // 39
  if(!self._cacheMap[hash]) {                                                               // 40
    var sub = {                                                                             // 41
      args: args,                                                                           // 42
      hash: hash                                                                            // 43
    };                                                                                      // 44
                                                                                            // 45
    this._handleError(sub);                                                                 // 46
                                                                                            // 47
    self._cacheMap[hash] = sub;                                                             // 48
    self._cacheList.push(sub);                                                              // 49
                                                                                            // 50
    self.ready = false;                                                                     // 51
    // no need to interfere with the current computation                                    // 52
    if(Deps.currentComputation) {                                                           // 53
      Deps.afterFlush(function() {                                                          // 54
        self.computation.invalidate();                                                      // 55
      });                                                                                   // 56
    } else {                                                                                // 57
      self.computation.invalidate();                                                        // 58
    }                                                                                       // 59
  }                                                                                         // 60
                                                                                            // 61
  // add the current sub to the top of the list                                             // 62
  var sub = self._cacheMap[hash];                                                           // 63
  sub.updated = (new Date).getTime();                                                       // 64
                                                                                            // 65
  var index = self._cacheList.indexOf(sub);                                                 // 66
  self._cacheList.splice(index, 1);                                                         // 67
  self._cacheList.push(sub);                                                                // 68
};                                                                                          // 69
                                                                                            // 70
SubsManager.prototype._applyCacheLimit = function () {                                      // 71
  var self = this;                                                                          // 72
  var overflow = self._cacheList.length - self.options.cacheLimit;                          // 73
  if(overflow > 0) {                                                                        // 74
    var removedSubs = self._cacheList.splice(0, overflow);                                  // 75
    _.each(removedSubs, function(sub) {                                                     // 76
      delete self._cacheMap[sub.hash];                                                      // 77
    });                                                                                     // 78
  }                                                                                         // 79
};                                                                                          // 80
                                                                                            // 81
SubsManager.prototype._applyExpirations = function() {                                      // 82
  var self = this;                                                                          // 83
  var newCacheList = [];                                                                    // 84
                                                                                            // 85
  var expirationTime = (new Date).getTime() - self.options.expireIn * 60 * 1000;            // 86
  _.each(self._cacheList, function(sub) {                                                   // 87
    if(sub.updated >= expirationTime) {                                                     // 88
      newCacheList.push(sub);                                                               // 89
    } else {                                                                                // 90
      delete self._cacheMap[sub.hash];                                                      // 91
    }                                                                                       // 92
  });                                                                                       // 93
                                                                                            // 94
  self._cacheList = newCacheList;                                                           // 95
};                                                                                          // 96
                                                                                            // 97
SubsManager.prototype._registerComputation = function() {                                   // 98
  var self = this;                                                                          // 99
  var computation = Deps.autorun(function() {                                               // 100
    self._applyExpirations();                                                               // 101
    self._applyCacheLimit();                                                                // 102
                                                                                            // 103
    var ready = true;                                                                       // 104
    _.each(self._cacheList, function(sub) {                                                 // 105
      sub.ready = Meteor.subscribe.apply(Meteor, sub.args).ready();                         // 106
      ready = ready && sub.ready;                                                           // 107
    });                                                                                     // 108
                                                                                            // 109
    if(ready) {                                                                             // 110
      self.ready = true;                                                                    // 111
      self.dep.changed();                                                                   // 112
    }                                                                                       // 113
  });                                                                                       // 114
                                                                                            // 115
  return computation;                                                                       // 116
};                                                                                          // 117
                                                                                            // 118
SubsManager.prototype._createIdentifier = function(args) {                                  // 119
  var tmpArgs = _.map(args, function(value) {                                               // 120
    if(typeof value == "string") {                                                          // 121
      return '"' + value + '"';                                                             // 122
    } else {                                                                                // 123
      return value;                                                                         // 124
    }                                                                                       // 125
  });                                                                                       // 126
                                                                                            // 127
  return tmpArgs.join(', ');                                                                // 128
};                                                                                          // 129
                                                                                            // 130
SubsManager.prototype._handleError = function(sub) {                                        // 131
  var args = sub.args;                                                                      // 132
  var lastElement = _.last(args);                                                           // 133
  sub.identifier = this._createIdentifier(args);                                            // 134
                                                                                            // 135
  if(!lastElement) {                                                                        // 136
    args.push({onError: errorHandlingLogic});                                               // 137
  } else if(typeof lastElement == "function") {                                             // 138
    args.pop();                                                                             // 139
    args.push({onReady: lastElement, onError: errorHandlingLogic});                         // 140
  } else if(typeof lastElement.onError == "function") {                                     // 141
    var originalOnError = lastElement.onError;                                              // 142
    lastElement.onError = function(err) {                                                   // 143
      errorHandlingLogic(err);                                                              // 144
      originalOnError(err);                                                                 // 145
    };                                                                                      // 146
  } else if(typeof lastElement.onReady == "function") {                                     // 147
    lastElement.onError = errorHandlingLogic;                                               // 148
  } else {                                                                                  // 149
    args.push({onError: errorHandlingLogic});                                               // 150
  }                                                                                         // 151
                                                                                            // 152
  function errorHandlingLogic (err) {                                                       // 153
    console.log("Error invoking SubsManager.subscribe(%s): ", sub.identifier , err.reason); // 154
    // expire this sub right away.                                                          // 155
    // Then expiration machanism will take care of the sub removal                          // 156
    sub.updated = new Date(1);                                                              // 157
  }                                                                                         // 158
};                                                                                          // 159
                                                                                            // 160
SubsManager.prototype.reset = function() {                                                  // 161
  var self = this;                                                                          // 162
  var oldComputation = self.computation;                                                    // 163
  self.computation = self._registerComputation();                                           // 164
                                                                                            // 165
  // invalidate the new compuation and it will fire new subscriptions                       // 166
  self.computation.invalidate();                                                            // 167
                                                                                            // 168
  // after above invalidation completed, fire stop the old computation                      // 169
  // which then send unsub messages                                                         // 170
  // mergeBox will correct send changed data and there'll be no flicker                     // 171
  Deps.afterFlush(function() {                                                              // 172
    oldComputation.stop();                                                                  // 173
  });                                                                                       // 174
};                                                                                          // 175
//////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:subs-manager'] = {
  SubsManager: SubsManager
};

})();

//# sourceMappingURL=meteorhacks_subs-manager.js.map
