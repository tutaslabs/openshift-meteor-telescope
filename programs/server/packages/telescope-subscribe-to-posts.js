(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var postStatuses = Package['telescope-base'].postStatuses;
var STATUS_PENDING = Package['telescope-base'].STATUS_PENDING;
var STATUS_APPROVED = Package['telescope-base'].STATUS_APPROVED;
var STATUS_REJECTED = Package['telescope-base'].STATUS_REJECTED;
var adminMenu = Package['telescope-base'].adminMenu;
var viewsMenu = Package['telescope-base'].viewsMenu;
var addToPostSchema = Package['telescope-base'].addToPostSchema;
var addToCommentsSchema = Package['telescope-base'].addToCommentsSchema;
var addToSettingsSchema = Package['telescope-base'].addToSettingsSchema;
var addToUserSchema = Package['telescope-base'].addToUserSchema;
var preloadSubscriptions = Package['telescope-base'].preloadSubscriptions;
var primaryNav = Package['telescope-base'].primaryNav;
var secondaryNav = Package['telescope-base'].secondaryNav;
var viewParameters = Package['telescope-base'].viewParameters;
var footerModules = Package['telescope-base'].footerModules;
var heroModules = Package['telescope-base'].heroModules;
var threadModules = Package['telescope-base'].threadModules;
var postModules = Package['telescope-base'].postModules;
var postThumbnail = Package['telescope-base'].postThumbnail;
var postHeading = Package['telescope-base'].postHeading;
var postMeta = Package['telescope-base'].postMeta;
var modulePositions = Package['telescope-base'].modulePositions;
var postClassCallbacks = Package['telescope-base'].postClassCallbacks;
var postSubmitRenderedCallbacks = Package['telescope-base'].postSubmitRenderedCallbacks;
var postSubmitClientCallbacks = Package['telescope-base'].postSubmitClientCallbacks;
var postSubmitMethodCallbacks = Package['telescope-base'].postSubmitMethodCallbacks;
var postAfterSubmitMethodCallbacks = Package['telescope-base'].postAfterSubmitMethodCallbacks;
var postApproveCallbacks = Package['telescope-base'].postApproveCallbacks;
var postEditRenderedCallbacks = Package['telescope-base'].postEditRenderedCallbacks;
var postEditClientCallbacks = Package['telescope-base'].postEditClientCallbacks;
var postEditMethodCallbacks = Package['telescope-base'].postEditMethodCallbacks;
var postAfterEditMethodCallbacks = Package['telescope-base'].postAfterEditMethodCallbacks;
var commentClassCallbacks = Package['telescope-base'].commentClassCallbacks;
var commentSubmitRenderedCallbacks = Package['telescope-base'].commentSubmitRenderedCallbacks;
var commentSubmitClientCallbacks = Package['telescope-base'].commentSubmitClientCallbacks;
var commentSubmitMethodCallbacks = Package['telescope-base'].commentSubmitMethodCallbacks;
var commentAfterSubmitMethodCallbacks = Package['telescope-base'].commentAfterSubmitMethodCallbacks;
var commentEditRenderedCallbacks = Package['telescope-base'].commentEditRenderedCallbacks;
var commentEditClientCallbacks = Package['telescope-base'].commentEditClientCallbacks;
var commentEditMethodCallbacks = Package['telescope-base'].commentEditMethodCallbacks;
var commentAfterEditMethodCallbacks = Package['telescope-base'].commentAfterEditMethodCallbacks;
var upvoteCallbacks = Package['telescope-base'].upvoteCallbacks;
var downvoteCallbacks = Package['telescope-base'].downvoteCallbacks;
var userEditRenderedCallbacks = Package['telescope-base'].userEditRenderedCallbacks;
var userEditClientCallbacks = Package['telescope-base'].userEditClientCallbacks;
var userProfileCompleteChecks = Package['telescope-base'].userProfileCompleteChecks;
var userProfileDisplay = Package['telescope-base'].userProfileDisplay;
var userProfileEdit = Package['telescope-base'].userProfileEdit;
var userCreatedCallbacks = Package['telescope-base'].userCreatedCallbacks;
var getTemplate = Package['telescope-base'].getTemplate;
var templates = Package['telescope-base'].templates;
var themeSettings = Package['telescope-base'].themeSettings;
var deepExtend = Package['telescope-lib'].deepExtend;
var camelToDash = Package['telescope-lib'].camelToDash;
var dashToCamel = Package['telescope-lib'].dashToCamel;
var camelCaseify = Package['telescope-lib'].camelCaseify;
var getSetting = Package['telescope-lib'].getSetting;
var getThemeSetting = Package['telescope-lib'].getThemeSetting;
var getSiteUrl = Package['telescope-lib'].getSiteUrl;
var trimWords = Package['telescope-lib'].trimWords;
var can = Package['telescope-lib'].can;
var _ = Package['telescope-lib']._;
var capitalise = Package['telescope-lib'].capitalise;
var i18n = Package['telescope-i18n'].i18n;
var setLanguage = Package['telescope-i18n'].setLanguage;
var Herald = Package['telescope-notifications'].Herald;
var buildEmailNotification = Package['telescope-notifications'].buildEmailNotification;
var getUnsubscribeLink = Package['telescope-notifications'].getUnsubscribeLink;
var Iron = Package['iron:core'].Iron;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;

/* Package-scope variables */
var subscribeItem, unsubscribeItem, __, translations;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/telescope-subscribe-to-posts/package-i18n.js                                      //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
TAPi18n.packages["telescope-subscribe-to-posts"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"};
                                                                                              // 2
// define package's translation function (proxy to the i18next)                               // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                              // 4
                                                                                              // 5
////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/telescope-subscribe-to-posts/lib/subscribe-to-posts.js                            //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
threadModules.push(                                                                           // 1
  {                                                                                           // 2
    template: 'postSubscribe',                                                                // 3
    order: 10                                                                                 // 4
  }                                                                                           // 5
);                                                                                            // 6
                                                                                              // 7
addToPostSchema.push(                                                                         // 8
  {                                                                                           // 9
    propertyName: 'subscribers',                                                              // 10
    propertySchema: {                                                                         // 11
      type: [String],                                                                         // 12
      optional: true,                                                                         // 13
      autoform: {                                                                             // 14
        omit: true                                                                            // 15
      }                                                                                       // 16
    }                                                                                         // 17
  }                                                                                           // 18
);                                                                                            // 19
                                                                                              // 20
addToPostSchema.push(                                                                         // 21
  {                                                                                           // 22
    propertyName: 'subscriberCount',                                                          // 23
    propertySchema: {                                                                         // 24
      type: Number,                                                                           // 25
      optional: true,                                                                         // 26
      autoform: {                                                                             // 27
        omit: true                                                                            // 28
      }                                                                                       // 29
    }                                                                                         // 30
  }                                                                                           // 31
);                                                                                            // 32
                                                                                              // 33
userProfileEdit.push(                                                                         // 34
  {                                                                                           // 35
    template: 'userSubscribedPosts',                                                          // 36
    order: 5                                                                                  // 37
  }                                                                                           // 38
);                                                                                            // 39
                                                                                              // 40
viewParameters.userSubscribedPosts = function (terms) {                                       // 41
  var user = Meteor.users.findOne(terms.userId),                                              // 42
      postsIds = [];                                                                          // 43
                                                                                              // 44
  if (user.subscribedItems && user.subscribedItems.Posts)                                     // 45
    postsIds = _.pluck(user.subscribedItems.Posts, "itemId");                                 // 46
                                                                                              // 47
  return {                                                                                    // 48
    find: {_id: {$in: postsIds}},                                                             // 49
    options: {limit: 5, sort: {postedAt: -1}}                                                 // 50
  };                                                                                          // 51
}                                                                                             // 52
                                                                                              // 53
var hasSubscribedItem = function (item, user) {                                               // 54
  return item.subscribers && item.subscribers.indexOf(user._id) != -1;                        // 55
};                                                                                            // 56
                                                                                              // 57
var addSubscribedItem = function (userId, item, collection) {                                 // 58
  var field = 'subscribedItems.' + collection;                                                // 59
  var add = {};                                                                               // 60
  add[field] = item;                                                                          // 61
  Meteor.users.update({_id: userId}, {                                                        // 62
    $addToSet: add                                                                            // 63
  });                                                                                         // 64
};                                                                                            // 65
                                                                                              // 66
var removeSubscribedItem = function (userId, itemId, collection) {                            // 67
  var field = 'subscribedItems.' + collection;                                                // 68
  var remove = {};                                                                            // 69
  remove[field] = {itemId: itemId};                                                           // 70
  Meteor.users.update({_id: userId}, {                                                        // 71
    $pull: remove                                                                             // 72
  });                                                                                         // 73
};                                                                                            // 74
                                                                                              // 75
subscribeItem = function (collection, itemId, user) {                                         // 76
  var item = collection.findOne(itemId),                                                      // 77
      collectionName = collection._name.slice(0,1).toUpperCase() + collection._name.slice(1); // 78
                                                                                              // 79
  if (!user || !item || hasSubscribedItem(item, user))                                        // 80
    return false;                                                                             // 81
                                                                                              // 82
  // author can't subscribe item                                                              // 83
  if (item.userId && item.userId === user._id)                                                // 84
    return false                                                                              // 85
                                                                                              // 86
  // Subscribe                                                                                // 87
  var result = collection.update({_id: itemId, subscribers: { $ne: user._id }}, {             // 88
    $addToSet: {subscribers: user._id},                                                       // 89
    $inc: {subscriberCount: 1}                                                                // 90
  });                                                                                         // 91
                                                                                              // 92
  if (result > 0) {                                                                           // 93
    // Add item to list of subscribed items                                                   // 94
    var obj = {                                                                               // 95
      itemId: item._id,                                                                       // 96
      subscribedAt: new Date()                                                                // 97
    };                                                                                        // 98
    addSubscribedItem(user._id, obj, collectionName);                                         // 99
  }                                                                                           // 100
                                                                                              // 101
  return true;                                                                                // 102
};                                                                                            // 103
                                                                                              // 104
unsubscribeItem = function (collection, itemId, user) {                                       // 105
  var user = Meteor.user(),                                                                   // 106
      item = collection.findOne(itemId),                                                      // 107
      collectionName = collection._name.slice(0,1).toUpperCase()+collection._name.slice(1);   // 108
                                                                                              // 109
  if (!user || !item  || !hasSubscribedItem(item, user))                                      // 110
    return false;                                                                             // 111
                                                                                              // 112
  // Unsubscribe                                                                              // 113
  var result = collection.update({_id: itemId, subscribers: user._id }, {                     // 114
    $pull: {subscribers: user._id},                                                           // 115
    $inc: {subscriberCount: -1}                                                               // 116
  });                                                                                         // 117
                                                                                              // 118
  if (result > 0) {                                                                           // 119
    // Remove item from list of subscribed items                                              // 120
    removeSubscribedItem(user._id, itemId, collectionName);                                   // 121
  }                                                                                           // 122
  return true;                                                                                // 123
};                                                                                            // 124
                                                                                              // 125
Meteor.methods({                                                                              // 126
  subscribePost: function(postId) {                                                           // 127
    return subscribeItem.call(this, Posts, postId, Meteor.user());                            // 128
  },                                                                                          // 129
  unsubscribePost: function(postId) {                                                         // 130
    return unsubscribeItem.call(this, Posts, postId, Meteor.user());                          // 131
  }                                                                                           // 132
});                                                                                           // 133
                                                                                              // 134
////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/telescope-subscribe-to-posts/lib/server/publications.js                           //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
Meteor.publish('userSubscribedPosts', function(terms) {                                       // 1
  var parameters = getPostsParameters(terms);                                                 // 2
  var posts = Posts.find(parameters.find, parameters.options);                                // 3
  return posts;                                                                               // 4
});                                                                                           // 5
                                                                                              // 6
////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                            //
// packages/telescope-subscribe-to-posts/Users/tutasg/meteor/telescope/packages/telescope-sub //
//                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                              //
var _ = Package.underscore._,                                                                 // 1
    package_name = "telescope-subscribe-to-posts",                                            // 2
    namespace = "telescope-subscribe-to-posts";                                               // 3
                                                                                              // 4
if (package_name != "project") {                                                              // 5
    namespace = TAPi18n.packages[package_name].namespace;                                     // 6
}                                                                                             // 7
// integrate the fallback language translations                                               // 8
translations = {};                                                                            // 9
translations[namespace] = {"subscribed_posts":"Subscribed Posts","subscribe_to_thread":"Subscribe to comment thread","unsubscribe_from_thread":"Unsubscribe from comment thread"};
TAPi18n._loadLangFileObject("en", translations);                                              // 11
                                                                                              // 12
////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-subscribe-to-posts'] = {
  subscribeItem: subscribeItem,
  unsubscribeItem: unsubscribeItem
};

})();

//# sourceMappingURL=telescope-subscribe-to-posts.js.map
