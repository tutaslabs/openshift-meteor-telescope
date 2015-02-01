(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Accounts = Package['accounts-base'].Accounts;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Queue = Package['artwells:queue'].Queue;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var Herald, transform, onRun, onRunResolve, users;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/$herald.js                                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
//This is our Global Object. $herald.js will be the first file loaded                                               // 1
Herald = {                                                                                                          // 2
  //Notification global settings                                                                                    // 3
  settings: {                                                                                                       // 4
    overrides: {}, //disable functionality for all users.                                                           // 5
    queueTimmer: 60000,                                                                                             // 6
    userPreferenceDefault: true,                                                                                    // 7
    collectionName: 'notifications',                                                                                // 8
    useIronRouter: true                                                                                             // 9
  },                                                                                                                // 10
                                                                                                                    // 11
  //media and runners                                                                                               // 12
  _media: function () { //supported media, extension packages should push new kinds                                 // 13
    return _.union(_.keys(Herald._serverRunners), _.keys(Herald._clientRunners))                                    // 14
  },                                                                                                                // 15
  _serverRunners: {}, //extension packages load their code here on servers                                          // 16
  _clientRunners: {}, //extension packages load their code here on clients                                          // 17
  _runnerCheckers: {}, //test if courier media data is valid                                                        // 18
                                                                                                                    // 19
                                                                                                                    // 20
  //couriers                                                                                                        // 21
  _couriers: {},                                                                                                    // 22
  _extentionParams: [] //UNDOCUMENTED: allow for more top level params on EventTypes                                // 23
};                                                                                                                  // 24
                                                                                                                    // 25
// Package users can define a predefined message from the notification instance.                                    // 26
// It requires the user pass a options.message function, string, or object.                                         // 27
//                                                                                                                  // 28
// If its a function it will be run with the from the instance scope                                                // 29
//                                                                                                                  // 30
// If its a string it will return a template with the instance                                                      // 31
// as its data.                                                                                                     // 32
//                                                                                                                  // 33
// If its an object it will run any number of templates or functions based on the optional                          // 34
// string argument given at the time of call. If no string is passed it will default                                // 35
// to 'default'. From there it acts the same as ether of the above patterns.                                        // 36
Herald._message = function (template) {                                                                             // 37
  var message, messageFormat = Herald._couriers[this.courier].messageFormat                                         // 38
                                                                                                                    // 39
  if(_.isObject(messageFormat) && !_.isFunction(messageFormat) && !_.isString(messageFormat)) {                     // 40
    if(messageFormat[template]) {                                                                                   // 41
      message = messageFormat[template]                                                                             // 42
    } else {                                                                                                        // 43
      message = messageFormat.default;                                                                              // 44
      if(!message) {                                                                                                // 45
        throw new Error('Herald: No default message defined for "' + this.courier + '" notifications');             // 46
      }                                                                                                             // 47
    }                                                                                                               // 48
  }                                                                                                                 // 49
  message = message || messageFormat;                                                                               // 50
                                                                                                                    // 51
  if(_.isFunction(message)) {                                                                                       // 52
    return message.apply(this)                                                                                      // 53
  }                                                                                                                 // 54
                                                                                                                    // 55
  else if(_.isString(message)) {                                                                                    // 56
    return Blaze.With(this, function () {                                                                           // 57
      return Template[message]                                                                                      // 58
    });                                                                                                             // 59
  }                                                                                                                 // 60
                                                                                                                    // 61
  else {                                                                                                            // 62
    throw new Error('Herald: message not defined for "' + this.courier + '" notifications');                        // 63
  }                                                                                                                 // 64
};                                                                                                                  // 65
                                                                                                                    // 66
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/collection.js                                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
Meteor.startup(function () {                                                                                        // 1
  //The collection and any instance functionality                                                                   // 2
  Herald.collection = new Meteor.Collection(Herald.settings.collectionName, {                                       // 3
    transform: function (notification) {                                                                            // 4
      if (notification.courier) { //courier may not be available if fields filter was called.                       // 5
        var courier = Herald._couriers[notification.courier];                                                       // 6
        //This is the basic message you want to output. Use in the app or as an email subject line                  // 7
        // it is optional and is set up with createNotification from the server code.                               // 8
        notification.message = function (template) {                                                                // 9
          if (template && !_.isString(template))                                                                    // 10
            throw new Error('Herald: message argument must be undefined or a string')                               // 11
          if (courier.messageFormat)                                                                                // 12
            return Herald._message.call(this, template)                                                             // 13
          else                                                                                                      // 14
            throw new Error('Herald: no message defined for "'+ this.courier +'"')                                  // 15
        };                                                                                                          // 16
                                                                                                                    // 17
        //internal scoping and cloning, because js is magically confusing                                           // 18
        if (courier.transform) {                                                                                    // 19
          transform = _.clone(courier.transform)                                                                    // 20
          notification = _.extend(transform, notification)                                                          // 21
        }                                                                                                           // 22
      };                                                                                                            // 23
      return notification                                                                                           // 24
    }                                                                                                               // 25
  });                                                                                                               // 26
                                                                                                                    // 27
  //Minimum requirement for notifications to work while still providing                                             // 28
  //basic security. For added limitations use `Herald.deny` in                                                      // 29
  //your app.                                                                                                       // 30
  Herald.collection.allow({                                                                                         // 31
    insert: function(userId, doc){                                                                                  // 32
      // new notifications can only be created via a Meteor method                                                  // 33
      return false;                                                                                                 // 34
    },                                                                                                              // 35
    update: function (userId, doc) {                                                                                // 36
      return userId == doc.userId                                                                                   // 37
    },                                                                                                              // 38
    remove: function (userId, doc) {                                                                                // 39
      return userId == doc.userId                                                                                   // 40
    }                                                                                                               // 41
  });                                                                                                               // 42
});                                                                                                                 // 43
                                                                                                                    // 44
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/couriers.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
Herald.addCourier = function (key, options) {                                                                       // 1
  check(key, String);                                                                                               // 2
  if (Herald._couriers[key])                                                                                        // 3
    throw new Error('Herald: courier "' + key + '"" already exists');                                               // 4
                                                                                                                    // 5
  check(options, Object);                                                                                           // 6
  Herald._couriers[key] = {                                                                                         // 7
    messageFormat: options.message                                                                                  // 8
  };                                                                                                                // 9
 var courier = Herald._couriers[key]                                                                                // 10
  //media is required but should only throw exceptions on the server, where it is needed.                           // 11
  if (Meteor.isServer) {                                                                                            // 12
    check(options.media, Object);                                                                                   // 13
    var media = _.keys(options.media)                                                                               // 14
    if (media.length == 0)                                                                                          // 15
      throw new Error('Herald: courier "'+ key + '" must have at least one medium');                                // 16
    media.forEach(function (medium) {                                                                               // 17
      if (!_.contains(Herald._media(), medium))                                                                     // 18
        throw new Error('Herald: medium "' + medium + '" is not a known media');                                    // 19
                                                                                                                    // 20
      Herald._runnerCheckers[medium].apply(options.media[medium])                                                   // 21
    });                                                                                                             // 22
  }                                                                                                                 // 23
  //define on both                                                                                                  // 24
  courier.media = options.media                                                                                     // 25
                                                                                                                    // 26
  courier.transform = options.transform;                                                                            // 27
                                                                                                                    // 28
  //white-listed params from extension packages                                                                     // 29
  _.extend(courier, _.pick(options, Herald._extentionParams))                                                       // 30
}                                                                                                                   // 31
                                                                                                                    // 32
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/runners.js                                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
Herald.addRunner = function (object) {                                                                              // 1
  if (!_.isObject(object)) throw new Error('Herald: Runner must have an `object` argument');                        // 2
  if (! _.isString(object.name)) throw new Error('Herald: Runner must medium `name`');                              // 3
  if (!_.isFunction(object.run)) throw new Error('Herald: Runner must have a `run` function');                      // 4
  if (!_.isFunction(object.check)) throw new Error('Herald: Runner must have a `check` function');                  // 5
  if (! (_.isArray(object.where) || _.isString(object.where)))                                                      // 6
    throw new Error('Herald: Runner `where` must be a valid environment');                                          // 7
                                                                                                                    // 8
  var where;                                                                                                        // 9
  if (_.isString(object.where))                                                                                     // 10
    where = [object.where]                                                                                          // 11
  else                                                                                                              // 12
    where = object.where                                                                                            // 13
                                                                                                                    // 14
  _.each(where, function (where) {                                                                                  // 15
    if (where == 'server')                                                                                          // 16
      Herald._serverRunners[object.name] = object.run                                                               // 17
    if (where == 'client')                                                                                          // 18
     Herald._clientRunners[object.name] = object.run                                                                // 19
  });                                                                                                               // 20
                                                                                                                    // 21
  Herald._runnerCheckers[object.name] = object.check                                                                // 22
}                                                                                                                   // 23
                                                                                                                    // 24
                                                                                                                    // 25
onRun = function () {}                                                                                              // 26
onRun.prototype.run = function () {                                                                                 // 27
  return { command: 'run' }                                                                                         // 28
}                                                                                                                   // 29
                                                                                                                    // 30
onRun.prototype.stop = function () {                                                                                // 31
  return { command: 'stop' }                                                                                        // 32
}                                                                                                                   // 33
                                                                                                                    // 34
onRun.prototype.delay = function (time) {                                                                           // 35
  return { command: 'delay', time: time }                                                                           // 36
}                                                                                                                   // 37
                                                                                                                    // 38
onRun.prototype.transfer = function (name, time) {                                                                  // 39
  return { command: 'transfer', name: name, time: time }                                                            // 40
}                                                                                                                   // 41
                                                                                                                    // 42
                                                                                                                    // 43
onRunResolve = function (notification, medium, result, run) {                                                       // 44
  switch(result.command) {                                                                                          // 45
    case 'run':                                                                                                     // 46
      //run true, but invalidation could have been triggered elsewhere so don't change                              // 47
      break;                                                                                                        // 48
    case 'stop':                                                                                                    // 49
      run = false                                                                                                   // 50
      break;                                                                                                        // 51
    case 'delay':                                                                                                   // 52
      run = false                                                                                                   // 53
      if (Herald._serverRunners[medium]) { //will only be called on server, no method needed                        // 54
        var query = {}                                                                                              // 55
        query['media.'+medium+'.send'] = true;                                                                      // 56
        var command = 'Herald.escalate("' + notification._id + '", "' + medium + '")'                               // 57
        Herald.collection.update(notificationId, {$set: query},function (err, count) {                              // 58
          Queue.add({command: command, execute_after: result.time})                                                 // 59
        });                                                                                                         // 60
                                                                                                                    // 61
      }                                                                                                             // 62
      if (Herald._clientRunners[medium]) {                                                                          // 63
        var delay = result.time.getTime() - new Date().getTime();                                                   // 64
        Meteor.call('HeraldUpdateAndDelay', notification._id, medium, delay)                                        // 65
      }                                                                                                             // 66
      break;                                                                                                        // 67
    case 'transfer':                                                                                                // 68
      run = false                                                                                                   // 69
      if (!Herald._clientRunners[result.name] && !Herald._serverRunners[result.name])                               // 70
        throw new Error('Herald: '+ medium +' transfer call - no medium '+ result.name)                             // 71
      if (Herald._serverRunners[result.name])                                                                       // 72
        Meteor.call('HeraldTransferServerMedium', notification._id, result)                                         // 73
      if (Herald._clientRunners[result.name]){                                                                      // 74
        var delay;                                                                                                  // 75
        if (result.time)                                                                                            // 76
          delay = result.time.getTime() - new Date().getTime();                                                     // 77
        var query = {}                                                                                              // 78
        query['media.' + result.name] = true                                                                        // 79
        Meteor.call('HeraldUpdateAndDelay', notification._id, query, delay)                                         // 80
                                                                                                                    // 81
      }                                                                                                             // 82
      break;                                                                                                        // 83
    default:                                                                                                        // 84
      throw new Error('Herald:' + medium + ' onRun returned the unknown command ' + result.command)                 // 85
  }                                                                                                                 // 86
  return run                                                                                                        // 87
}                                                                                                                   // 88
                                                                                                                    // 89
Meteor.methods({                                                                                                    // 90
  HeraldTransferServerMedium: function (notificationId, result) {                                                   // 91
    var notification = Herald.collection.findOne(notificationId);                                                   // 92
    if (this.userId != notification.userId) throw new Meteor.Meteor.Error(550, 'Herald: permission denied');        // 93
    if (!Herald._couriers[notification.courier].media[result.name])                                                 // 94
      throw new Error('Herald: '+ notification.courier +' transfer call - no medium '+ result.name)                 // 95
    var command = 'Herald.escalate("' + notification._id + '", "' + result.name + '")'                              // 96
    if (Meteor.isServer) {//simulation causes errors                                                                // 97
      var query = {}                                                                                                // 98
      query['media.'+ result.name +'.send'] = true;                                                                 // 99
      Herald.collection.update(notificationId, {$set: query}, function (err, count) {                               // 100
        if (result.time)                                                                                            // 101
          Queue.add({command: command, execute_after: result.time});                                                // 102
        else                                                                                                        // 103
          Queue.add({command: command});                                                                            // 104
      });                                                                                                           // 105
    }                                                                                                               // 106
  },                                                                                                                // 107
  HeraldUpdateAndDelay: function (notificationId, query, delay) {                                                   // 108
    if (!delay || delay < 1000) delay = 1000 //give at least one second for the dust to settle                      // 109
    var notification = Herald.collection.findOne(notificationId);                                                   // 110
    if (this.userId != notification.userId) throw new Meteor.Error(550, 'Herald: permission denied');               // 111
    if (!this.isSimulation) {                                                                                       // 112
      Meteor.setTimeout(function () {                                                                               // 113
        Herald.collection.update(notificationId, {$set: query})                                                     // 114
      }, delay)                                                                                                     // 115
    }                                                                                                               // 116
  }                                                                                                                 // 117
});                                                                                                                 // 118
                                                                                                                    // 119
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/users.js                                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
//userPreference - can be easily overloaded without loss of functionality.                                          // 1
Herald.userPreference = function (user, medium, courier) { return Herald.getUserPreference(user, medium, courier) } // 2
                                                                                                                    // 3
                                                                                                                    // 4
// set user medium preference                                                                                       // 5
Herald.setUserPreference = function (user, preference, courier) {                                                   // 6
                                                                                                                    // 7
  if (courier && !_.contains(_.keys(Herald._couriers), courier)) //optional and check                               // 8
    throw new Error('Herald - getUserPreference: courier "'+courier+'" not found')                                  // 9
                                                                                                                    // 10
  if (!_.isObject(preference)) throw new Error('Herald - getUserPreference: no media preference given')             // 11
  var badKeys = _.omit(preference, Herald._media() )                                                                // 12
  if (!_.isEmpty(badKeys)) throw new Error('Herald - getUserPreference: "'+ _.toArray(badKeys) + '" are not valid media')
                                                                                                                    // 14
  if (_.isString(user)) {                                                                                           // 15
    user = Meteor.users.findOne(user);                                                                              // 16
  } else if (!_.isObject(user)) {                                                                                   // 17
    if (Meteor.isClient)                                                                                            // 18
      user = Meteor.user();                                                                                         // 19
    else                                                                                                            // 20
      user = Meteor.users.findOne(this.userId);                                                                     // 21
  }                                                                                                                 // 22
  if (!user || !user._id) throw new Error('Herald - setUserPreference: user not found')                             // 23
                                                                                                                    // 24
  //not set                                                                                                         // 25
  if (!user.profile) {                                                                                              // 26
    return Meteor.users.update(user._id, {$set: {profile: newProfileMedia(preference)}});                           // 27
  }                                                                                                                 // 28
  if (!user.profile.notifications) {                                                                                // 29
    return Meteor.users.update(user._id, {$set: {'profile.notifications': newProfileMedia(preference).notifications}});
  }                                                                                                                 // 31
                                                                                                                    // 32
                                                                                                                    // 33
  if (!courier) { //generic only                                                                                    // 34
                                                                                                                    // 35
    if (!user.profile.notifications.media) {                                                                        // 36
      return Meteor.users.update(user._id, {                                                                        // 37
        $set: {'profile.notifications.media': newProfileMedia(preference).notifications.media}                      // 38
      });                                                                                                           // 39
    }                                                                                                               // 40
                                                                                                                    // 41
    //merge medium preferences                                                                                      // 42
    var media = user.profile.notifications.media;                                                                   // 43
    _.keys(preference).forEach(function (medium) {                                                                  // 44
      media[medium] = preference[medium]                                                                            // 45
    });                                                                                                             // 46
                                                                                                                    // 47
    return Meteor.users.update(user._id, { $set: {'profile.notifications.media': media} });                         // 48
  } //generic only end                                                                                              // 49
                                                                                                                    // 50
                                                                                                                    // 51
  //for courier set only                                                                                            // 52
  if (!user.profile.notifications.couriers || !user.profile.notifications.couriers[courier]) {                      // 53
    var query = {}                                                                                                  // 54
    query['profile.notifications.couriers.' + courier] = preference;                                                // 55
    return Meteor.users.update(user._id, { $set: query });                                                          // 56
  }                                                                                                                 // 57
  //merge couriers preferences                                                                                      // 58
  var pref = user.profile.notifications.couriers[courier];                                                          // 59
  _.keys(preference).forEach(function (medium) {                                                                    // 60
    pref[medium] = preference[medium]                                                                               // 61
  });                                                                                                               // 62
  var query = {}                                                                                                    // 63
  query['profile.notifications.couriers.' + courier] = pref;                                                        // 64
  return Meteor.users.update(user._id, { $set: query });                                                            // 65
                                                                                                                    // 66
}                                                                                                                   // 67
                                                                                                                    // 68
// get user [medium [courier]] preference                                                                           // 69
Herald.getUserPreference = function (user, medium, courier) {                                                       // 70
  if (!_.isString(medium)) throw new Error('Herald - getUserPreference: no medium given')                           // 71
  if (!_.contains(Herald._media(), medium))                                                                         // 72
    throw new Error('Herald - getUserPreference: medium "'+medium+'" not found')                                    // 73
  if (courier && !_.contains(_.keys(Herald._couriers), courier))                                                    // 74
    throw new Error('Herald - getUserPreference: courier "'+courier+'" not found')                                  // 75
                                                                                                                    // 76
  if (_.isString(user)) {                                                                                           // 77
    user = Meteor.users.findOne(user);                                                                              // 78
  } else if (!_.isObject(user)) {                                                                                   // 79
    if (Meteor.isClient)                                                                                            // 80
      user = Meteor.user();                                                                                         // 81
    else                                                                                                            // 82
      user = Meteor.users.findOne(this.userId);                                                                     // 83
  }                                                                                                                 // 84
                                                                                                                    // 85
  if (!user || !user._id) throw new Error('Herald - getUserPreference: user not found')                             // 86
                                                                                                                    // 87
  var defaultOutput = Herald.settings.userPreferenceDefault                                                         // 88
                                                                                                                    // 89
  //not set                                                                                                         // 90
  if (!user.profile)                                                                                                // 91
    return defaultOutput                                                                                            // 92
  if (!user.profile.notifications)                                                                                  // 93
    return defaultOutput                                                                                            // 94
                                                                                                                    // 95
  var useCourier = false; //assume not set, skip                                                                    // 96
                                                                                                                    // 97
  if (courier) useCourier = true; //set, don't skip                                                                 // 98
                                                                                                                    // 99
  if (useCourier) {                                                                                                 // 100
    if (!user.profile.notifications.couriers)                                                                       // 101
      useCourier = false //not set, skip                                                                            // 102
    if (useCourier && !user.profile.notifications.couriers[courier])                                                // 103
      useCourier = false //not set, skip                                                                            // 104
    if (useCourier && user.profile.notifications.couriers[courier].hasOwnProperty(medium)) {//skip?                 // 105
      return user.profile.notifications.couriers[courier][medium];                                                  // 106
    }                                                                                                               // 107
  }                                                                                                                 // 108
  //general                                                                                                         // 109
  if (!user.profile.notifications.media){                                                                           // 110
    return defaultOutput                                                                                            // 111
  }                                                                                                                 // 112
  if (user.profile.notifications.media.hasOwnProperty(medium))                                                      // 113
    return user.profile.notifications.media[medium]                                                                 // 114
  else                                                                                                              // 115
    return defaultOutput                                                                                            // 116
}                                                                                                                   // 117
                                                                                                                    // 118
var newProfileMedia = function (preferences) {                                                                      // 119
  return {                                                                                                          // 120
    notifications: {                                                                                                // 121
      media: preferences,                                                                                           // 122
      couriers: {}                                                                                                  // 123
    }                                                                                                               // 124
  };                                                                                                                // 125
}                                                                                                                   // 126
                                                                                                                    // 127
var newProfileCouriers = function (courier, preferences) {                                                          // 128
  var obj = {                                                                                                       // 129
    notifications: {                                                                                                // 130
      media: {},                                                                                                    // 131
      couriers: {}                                                                                                  // 132
    }                                                                                                               // 133
  };                                                                                                                // 134
  obj.notifications.couriers[courier] = preferences                                                                 // 135
  return obj;                                                                                                       // 136
}                                                                                                                   // 137
                                                                                                                    // 138
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/onsite.js                                                                          //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var runner = {                                                                                                      // 1
  name: 'onsite',                                                                                                   // 2
  where: ['client']                                                                                                 // 3
}                                                                                                                   // 4
runner.run = function (notification, user) {};                                                                      // 5
runner.check = function () {};                                                                                      // 6
Herald.addRunner(runner);                                                                                           // 7
                                                                                                                    // 8
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/lib/helpers.js                                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
//get notifications by user, [courier, [[medium]]                                                                   // 1
Herald.getNotifications = function (query, options) {                                                               // 2
  // break function if not finished with logging in                                                                 // 3
  if(Meteor.isClient && Meteor.loggingIn()){                                                                        // 4
    return [];                                                                                                      // 5
  }                                                                                                                 // 6
                                                                                                                    // 7
  if(!_.isObject(query)) {                                                                                          // 8
    throw new Meteor.Error("Herald getNotifications must contain Mongo filter query");                              // 9
  }                                                                                                                 // 10
                                                                                                                    // 11
  var badKeys = _.omit(query, ['user', 'courier', 'medium', 'read']);                                               // 12
  if(!_.isEmpty(badKeys)) {                                                                                         // 13
    throw new Error('Herald - getNotifications: unknown key(s) ' + _.toArray(badKeys))                              // 14
  }                                                                                                                 // 15
                                                                                                                    // 16
  var userId = query.user,                                                                                          // 17
    courier = query.courier,                                                                                        // 18
    medium = query.medium,                                                                                          // 19
    read = query.read,                                                                                              // 20
    user;                                                                                                           // 21
                                                                                                                    // 22
                                                                                                                    // 23
  if(typeof read === "undefined") {                                                                                 // 24
    read = false;                                                                                                   // 25
  }                                                                                                                 // 26
                                                                                                                    // 27
  //get user                                                                                                        // 28
  if(_.isString(userId)) {                                                                                          // 29
    user = Meteor.users.findOne(userId);                                                                            // 30
  } else if(!_.isObject(userId)) {                                                                                  // 31
    if(Meteor.isClient) {                                                                                           // 32
      user = Meteor.user();                                                                                         // 33
    } else {                                                                                                        // 34
      user = Meteor.users.findOne(this.userId);                                                                     // 35
    }                                                                                                               // 36
                                                                                                                    // 37
  }                                                                                                                 // 38
                                                                                                                    // 39
  // check if user exists                                                                                           // 40
  if(!user || !user._id) {                                                                                          // 41
    throw new Error('Herald - getNotifications: user not found');                                                   // 42
  }                                                                                                                 // 43
                                                                                                                    // 44
  // check courier                                                                                                  // 45
  if(courier && !_.contains(_.keys(Herald._couriers), courier)) {                                                   // 46
    throw new Error('Herald - getNotifications: courier "' + courier + '" not found');                              // 47
  }                                                                                                                 // 48
                                                                                                                    // 49
  // check medium                                                                                                   // 50
  if(medium && !_.contains(Herald._media(), medium)) {                                                              // 51
    throw new Error('Herald - getNotifications: medium "' + medium + '" not found');                                // 52
  }                                                                                                                 // 53
                                                                                                                    // 54
  var filter = {userId: user._id, read: read};                                                                      // 55
  if(medium) {                                                                                                      // 56
    filter['media.' + medium] = {$exists: true};                                                                    // 57
  }                                                                                                                 // 58
  if(courier) {                                                                                                     // 59
    filter['courier'] = courier;                                                                                    // 60
  }                                                                                                                 // 61
                                                                                                                    // 62
  return Herald.collection.find(filter, options);                                                                   // 63
};                                                                                                                  // 64
                                                                                                                    // 65
                                                                                                                    // 66
//literally mark-All-As-Read, cheers :)                                                                             // 67
Meteor.methods({                                                                                                    // 68
  heraldMarkAllAsRead: function () {                                                                                // 69
    Herald.collection.update(                                                                                       // 70
      {userId: this.userId},                                                                                        // 71
      {                                                                                                             // 72
        $set: {                                                                                                     // 73
          read: true                                                                                                // 74
        }                                                                                                           // 75
      },                                                                                                            // 76
      {multi: true}                                                                                                 // 77
    );                                                                                                              // 78
  }                                                                                                                 // 79
});                                                                                                                 // 80
                                                                                                                    // 81
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/server/createNotification.js                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
//You can insert manually but this should save you some work.                                                       // 1
Herald.createNotification = function (userIds, params) {                                                            // 2
  check(userIds, Match.OneOf([String], String)); //TODO: better Collection ID check                                 // 3
  check(params, Object);                                                                                            // 4
  if (!Herald._couriers[params.courier])                                                                            // 5
    throw new Error('Notification: courier type does not exists');                                                  // 6
                                                                                                                    // 7
  // always assume multiple users.                                                                                  // 8
  if (_.isString(userIds)) userIds = [userIds]                                                                      // 9
  users = Meteor.users.find({_id: {$in: userIds}}, {fields: {profile: 1}})                                          // 10
  users.forEach(function (user) { //create a notification for each user                                             // 11
                                                                                                                    // 12
    //When creating a new notification                                                                              // 13
    //                                                                                                              // 14
    // timestamp - you should timestamp every doc                                                                   // 15
    // userId - there must be a user to notify                                                                      // 16
    // courier - this is the courier                                                                                // 17
    // data - in database metadata, consider renaming                                                               // 18
    // read - default false, consider auto-delete?                                                                  // 19
    // escalated - track if higher level notifications have run                                                     // 20
    // url - allow of iron:router magic. set read to true if visited (see routeSeenByUser)                          // 21
    // media - a list of all the media the notification can be sent on but has not been.                            // 22
                                                                                                                    // 23
    var notification = {                                                                                            // 24
      timestamp: new Date().getTime(),                                                                              // 25
      userId: user._id,                                                                                             // 26
      courier: params.courier,                                                                                      // 27
      data: params.data,                                                                                            // 28
      read: false,                                                                                                  // 29
      escalated: false,                                                                                             // 30
      url: params.url,                                                                                              // 31
      media: {}                                                                                                     // 32
    };                                                                                                              // 33
                                                                                                                    // 34
    _.each(_.keys(Herald._couriers[params.courier].media), function (medium) {                                      // 35
      //check if this notification should be sent to medium                                                         // 36
      var run = true;                                                                                               // 37
      if (Herald._couriers[params.courier].media[medium].fallback) {                                                // 38
        run = false;                                                                                                // 39
      } else {                                                                                                      // 40
       if (!Herald.userPreference(user, medium, notification.courier)) run = false;                                 // 41
      };                                                                                                            // 42
                                                                                                                    // 43
      notification.media[medium] = {send: run, sent: false};                                                        // 44
    });                                                                                                             // 45
                                                                                                                    // 46
    //create notification and return its id                                                                         // 47
    var notificationId = Herald.collection.insert(notification);                                                    // 48
                                                                                                                    // 49
    //if no notificationId then insert failed anD PANIC, STOP, DON'T ACUTALLY DO THIS!                              // 50
    if (notificationId) {                                                                                           // 51
      notification._id = notificationId                                                                             // 52
      Herald.SetupEscalations(notification)                                                                         // 53
    }                                                                                                               // 54
                                                                                                                    // 55
    return notificationId;                                                                                          // 56
  });                                                                                                               // 57
};                                                                                                                  // 58
                                                                                                                    // 59
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/server/escalate.js                                                                     //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
//allow package users to delay escalations                                                                          // 1
Meteor.startup(function () {                                                                                        // 2
  //if no pattern is defined then skip this.                                                                        // 3
  // if (!Herald.settings.delayEscalation) return false;                                                            // 4
  console.log('Starting artwells:queue for Herald');                                                                // 5
  Meteor.setInterval(function(){Queue.run()}, Herald.settings.queueTimmer); /* once a minute */                     // 6
});                                                                                                                 // 7
                                                                                                                    // 8
                                                                                                                    // 9
Herald.SetupEscalations = function (notification) {                                                                 // 10
  if (notification.escalated) return false; //don't resend notifications                                            // 11
  _.each(_.keys(Herald._couriers[notification.courier].media), function (medium) {                                  // 12
    if (!_.contains(_.keys(Herald._serverRunners), medium)) return; //Server only                                   // 13
    if (!notification.media[medium].send || notification.media[medium].sent) return; //already sent/don't send      // 14
    var command = 'Meteor.call("heraldEscalate","' + notification._id + '", "' + medium + '")';                     // 15
    Queue.add({command: command })                                                                                  // 16
  });                                                                                                               // 17
  Herald.collection.update(notification._id, { $set: { escalated: true } } );                                       // 18
}                                                                                                                   // 19
                                                                                                                    // 20
Meteor.methods({                                                                                                    // 21
    /**                                                                                                             // 22
     * Server method to call Herald.escalate out of the queue package                                               // 23
     *                                                                                                              // 24
     * @param {string} notificationId                                                                               // 25
     * @param {string} medium                                                                                       // 26
     */                                                                                                             // 27
    "heraldEscalate": function (notificationId, medium) {                                                           // 28
        try {                                                                                                       // 29
            Herald.escalate(notificationId, medium);                                                                // 30
        } catch (e) {                                                                                               // 31
            throw new Meteor.Error("Can't start Herald.escalate: " + e);                                            // 32
        }                                                                                                           // 33
    }                                                                                                               // 34
});                                                                                                                 // 35
                                                                                                                    // 36
                                                                                                                    // 37
Herald.escalate = function (notificationId, medium) {                                                               // 38
                                                                                                                    // 39
  var notification = Herald.collection.findOne(notificationId);                                                     // 40
  if (!notification) return; //notification has been removed                                                        // 41
  if (notification.read) return; //don't escalate a read notification!                                              // 42
  if (!notification.media[medium].send || notification.media[medium].sent) return; //already sent/don't send        // 43
  if (Herald.settings.overrides[medium]) return; //disabled by override                                             // 44
                                                                                                                    // 45
  var user = Meteor.users.findOne(notification.userId)                                                              // 46
  if (!user) return; //user has been removed                                                                        // 47
                                                                                                                    // 48
                                                                                                                    // 49
  var run = true; //does the user want you to send on this medium?                                                  // 50
  if (!Herald.userPreference(user, medium, notification.courier)) run = false                                       // 51
                                                                                                                    // 52
  var thisOnRun = Herald._couriers[notification.courier].media[medium].onRun                                        // 53
  if (_.isFunction(thisOnRun)) {                                                                                    // 54
    var result = thisOnRun.call(new onRun(), notification, user, run)                                               // 55
    if (!result.command) throw new Error('Herald:' + medium + ' onRun did not return a command')                    // 56
    run = onRunResolve(notification, medium, result, run)                                                           // 57
  }                                                                                                                 // 58
                                                                                                                    // 59
  if (run) {                                                                                                        // 60
    Herald._serverRunners[medium].call(                                                                             // 61
      Herald._couriers[notification.courier].media[medium], notification, user)                                     // 62
    var query = {}                                                                                                  // 63
    query[ 'media.' + medium] = {send: false, sent: true};                                                          // 64
    Herald.collection.update(notification._id, { $set: query } );                                                   // 65
  } else {                                                                                                          // 66
    var query = {};                                                                                                 // 67
    query['media.' + medium + '.send'] =  false                                                                     // 68
    Herald.collection.update(notification._id, { $set: query } );                                                   // 69
  }                                                                                                                 // 70
                                                                                                                    // 71
                                                                                                                    // 72
};                                                                                                                  // 73
                                                                                                                    // 74
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/kestanous:herald/server/publish.js                                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// only publish notifications belonging to the current user                                                         // 1
Meteor.publish('notifications', function() {                                                                        // 2
  var media = _.keys(Herald._clientRunners).map(function (key) {                                                    // 3
    var medium = {};                                                                                                // 4
    medium['media.'+key] = {send: true, sent: false};                                                               // 5
    return medium;                                                                                                  // 6
  });                                                                                                               // 7
  return Herald.collection.find({userId:this.userId, $or: media});                                                  // 8
});                                                                                                                 // 9
                                                                                                                    // 10
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['kestanous:herald'] = {
  Herald: Herald
};

})();

//# sourceMappingURL=kestanous_herald.js.map
