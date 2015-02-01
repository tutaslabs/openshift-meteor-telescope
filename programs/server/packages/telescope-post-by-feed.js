(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var HTTP = Package.http.HTTP;
var moment = Package['mrt:moment'].moment;
var SyncedCron = Package['percolatestudio:synced-cron'].SyncedCron;

/* Package-scope variables */
var Feeds, fetchFeeds, translations;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-post-by-feed/lib/feeds.js                                                                  //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var feedSchema = new SimpleSchema({                                                                              // 1
  url: {                                                                                                         // 2
    type: String,                                                                                                // 3
    regEx: SimpleSchema.RegEx.Url                                                                                // 4
  },                                                                                                             // 5
  userId: {                                                                                                      // 6
    type: String,                                                                                                // 7
    label: 'feedUser',                                                                                           // 8
    autoform: {                                                                                                  // 9
      instructions: 'Posts will be assigned to this user.',                                                      // 10
      options: function () {                                                                                     // 11
        var users = Meteor.users.find().map(function (user) {                                                    // 12
          return {                                                                                               // 13
            value: user._id,                                                                                     // 14
            label: getDisplayName(user)                                                                          // 15
          }                                                                                                      // 16
        });                                                                                                      // 17
        return users;                                                                                            // 18
      }                                                                                                          // 19
    }                                                                                                            // 20
  }                                                                                                              // 21
});                                                                                                              // 22
                                                                                                                 // 23
Feeds = new Meteor.Collection("feeds");                                                                          // 24
Feeds.attachSchema(feedSchema);                                                                                  // 25
                                                                                                                 // 26
// used to keep track of which feed a post was imported from                                                     // 27
var feedIdProperty = {                                                                                           // 28
  propertyName: 'feedId',                                                                                        // 29
  propertySchema: {                                                                                              // 30
    type: String,                                                                                                // 31
    label: 'feedId',                                                                                             // 32
    optional: true,                                                                                              // 33
    autoform: {                                                                                                  // 34
      omit: true                                                                                                 // 35
    }                                                                                                            // 36
  }                                                                                                              // 37
}                                                                                                                // 38
addToPostSchema.push(feedIdProperty);                                                                            // 39
                                                                                                                 // 40
// the RSS ID of the post in its original feed                                                                   // 41
var feedItemIdProperty = {                                                                                       // 42
  propertyName: 'feedItemId',                                                                                    // 43
  propertySchema: {                                                                                              // 44
    type: String,                                                                                                // 45
    label: 'feedItemId',                                                                                         // 46
    optional: true,                                                                                              // 47
    autoform: {                                                                                                  // 48
      omit: true                                                                                                 // 49
    }                                                                                                            // 50
  }                                                                                                              // 51
}                                                                                                                // 52
addToPostSchema.push(feedItemIdProperty);                                                                        // 53
                                                                                                                 // 54
Meteor.startup(function () {                                                                                     // 55
  Feeds.allow({                                                                                                  // 56
    insert: isAdminById,                                                                                         // 57
    update: isAdminById,                                                                                         // 58
    remove: isAdminById                                                                                          // 59
  });                                                                                                            // 60
                                                                                                                 // 61
  Meteor.methods({                                                                                               // 62
    insertFeed: function(feedUrl){                                                                               // 63
      check(feedUrl, feedSchema);                                                                                // 64
                                                                                                                 // 65
      if (Feeds.findOne({url: feedSchema.url}))                                                                  // 66
        throw new Meteor.Error('already-exists', i18n.t('feed_already_exists'));                                 // 67
                                                                                                                 // 68
      if (!Meteor.user() || !isAdmin(Meteor.user()))                                                             // 69
        throw new Meteor.Error('login-required', i18n.t('you_need_to_login_and_be_an_admin_to_add_a_new_feed')); // 70
                                                                                                                 // 71
      return Feeds.insert(feedUrl);                                                                              // 72
    }                                                                                                            // 73
  });                                                                                                            // 74
});                                                                                                              // 75
                                                                                                                 // 76
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-post-by-feed/lib/server/fetch_feeds.js                                                     //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var htmlParser = Npm.require('htmlparser2');                                                                     // 1
var toMarkdown = Npm.require('to-markdown').toMarkdown;                                                          // 2
var he = Npm.require('he')                                                                                       // 3
                                                                                                                 // 4
var getFirstAdminUser = function() {                                                                             // 5
  return Meteor.users.findOne({isAdmin: true}, {sort: {createdAt: 1}});                                          // 6
}                                                                                                                // 7
                                                                                                                 // 8
var handleFeed = function(error, feed) {                                                                         // 9
  if (error) return;                                                                                             // 10
                                                                                                                 // 11
  var feedItems = _.first(feed.items, 20); // limit feed to 20 items just in case                                // 12
  var userId = this._parser._options.userId;                                                                     // 13
                                                                                                                 // 14
  clog('// Parsing RSS feed: '+ feed.title)                                                                      // 15
                                                                                                                 // 16
  var newItemsCount = 0;                                                                                         // 17
                                                                                                                 // 18
  feedItems.forEach(function(item, index, array) {                                                               // 19
                                                                                                                 // 20
    // check if post already exists                                                                              // 21
    if (!!Posts.findOne({feedItemId: item.id})) {                                                                // 22
      // clog('// Feed item already imported')                                                                   // 23
    } else {                                                                                                     // 24
      newItemsCount++;                                                                                           // 25
                                                                                                                 // 26
      var post = {                                                                                               // 27
        title: he.decode(item.title),                                                                            // 28
        url: item.link,                                                                                          // 29
        feedId: feed.id,                                                                                         // 30
        feedItemId: item.id,                                                                                     // 31
        userId: userId                                                                                           // 32
      }                                                                                                          // 33
                                                                                                                 // 34
      if (item.description)                                                                                      // 35
        post.body = toMarkdown(he.decode(item.description));                                                     // 36
                                                                                                                 // 37
      // console.log(feed)                                                                                       // 38
                                                                                                                 // 39
      // if RSS item link is a 301 or 302 redirect, follow the redirect                                          // 40
      var get = HTTP.get(item.link, {followRedirects: false});                                                   // 41
      if (!!get.statusCode && (get.statusCode === 301 || get.statusCode === 302) && !!get.headers && !!get.headers.location) {
        post.url = get.headers.location;                                                                         // 43
      }                                                                                                          // 44
                                                                                                                 // 45
      // if RSS item has a date, use it                                                                          // 46
      if (item.pubDate)                                                                                          // 47
        post.postedAt = moment(item.pubDate).toDate();                                                           // 48
                                                                                                                 // 49
      try {                                                                                                      // 50
        submitPost(post);                                                                                        // 51
      } catch (error) {                                                                                          // 52
        // catch errors so they don't stop the loop                                                              // 53
        clog(error);                                                                                             // 54
      }                                                                                                          // 55
                                                                                                                 // 56
    }                                                                                                            // 57
  });                                                                                                            // 58
                                                                                                                 // 59
  clog('// Found ' + newItemsCount + ' new feed items')                                                          // 60
};                                                                                                               // 61
                                                                                                                 // 62
fetchFeeds = function() {                                                                                        // 63
  var content;                                                                                                   // 64
                                                                                                                 // 65
  Feeds.find().forEach(function(feed) {                                                                          // 66
                                                                                                                 // 67
    // if feed doesn't specify a user, default to admin                                                          // 68
    var userId = !!feed.userId ? feed.userId : getFirstAdminUser()._id;                                          // 69
                                                                                                                 // 70
    try {                                                                                                        // 71
                                                                                                                 // 72
      content = HTTP.get(feed.url).content;                                                                      // 73
      var feedHandler = new htmlParser.FeedHandler(handleFeed);                                                  // 74
      var parser = new htmlParser.Parser(feedHandler, {xmlMode: true, userId: userId});                          // 75
      parser.write(content);                                                                                     // 76
      parser.end();                                                                                              // 77
                                                                                                                 // 78
    } catch (error) {                                                                                            // 79
                                                                                                                 // 80
      console.log(error);                                                                                        // 81
      return true; // just go to next url                                                                        // 82
                                                                                                                 // 83
    }                                                                                                            // 84
  });                                                                                                            // 85
}                                                                                                                // 86
                                                                                                                 // 87
Meteor.methods({                                                                                                 // 88
  fetchFeeds: function () {                                                                                      // 89
    fetchFeeds();                                                                                                // 90
  },                                                                                                             // 91
  testEntities: function (text) {                                                                                // 92
    console.log(he.decode(text));                                                                                // 93
  },                                                                                                             // 94
  testToMarkdown: function (text) {                                                                              // 95
    console.log(toMarkdown(text));                                                                               // 96
  }                                                                                                              // 97
})                                                                                                               // 98
                                                                                                                 // 99
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-post-by-feed/lib/server/cron.js                                                            //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
SyncedCron.options = {                                                                                           // 1
  log: false,                                                                                                    // 2
  collectionName: 'cronHistory',                                                                                 // 3
  utc: false,                                                                                                    // 4
  collectionTTL: 172800                                                                                          // 5
}                                                                                                                // 6
                                                                                                                 // 7
var addJob = function () {                                                                                       // 8
  SyncedCron.add({                                                                                               // 9
    name: 'Post by RSS feed',                                                                                    // 10
    schedule: function(parser) {                                                                                 // 11
      return parser.text('every 30 minutes');                                                                    // 12
    },                                                                                                           // 13
    job: function() {                                                                                            // 14
      if (Feeds.find().count()) {                                                                                // 15
        fetchFeeds();                                                                                            // 16
      }                                                                                                          // 17
    }                                                                                                            // 18
  });                                                                                                            // 19
}                                                                                                                // 20
                                                                                                                 // 21
Meteor.startup(function () {                                                                                     // 22
  addJob();                                                                                                      // 23
})                                                                                                               // 24
                                                                                                                 // 25
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-post-by-feed/lib/server/publications.js                                                    //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
Meteor.publish('feeds', function() {                                                                             // 1
  if(isAdminById(this.userId)){                                                                                  // 2
    return Feeds.find();                                                                                         // 3
  }                                                                                                              // 4
  return [];                                                                                                     // 5
});                                                                                                              // 6
                                                                                                                 // 7
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-post-by-feed/Users/tutasg/meteor/telescope/packages/telescope-post-by-feed/i18n/en.i18n.js //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "project",                                                                                    // 2
    namespace = "project";                                                                                       // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
TAPi18n._enable({"helper_name":"_","supported_languages":null,"i18n_files_route":"/tap-i18n","cdn_path":null});  // 8
TAPi18n.languages_names["en"] = ["English","English"];                                                           // 9
// integrate the fallback language translations                                                                  // 10
translations = {};                                                                                               // 11
translations[namespace] = {"feed_already_exists":"A feed with the same URL already exists.","you_need_to_login_and_be_an_admin_to_add_a_new_feed":"You need to log in and be an admin to add a new feed.","import_new_posts_from_feeds":"Import new posts from feeds."};
TAPi18n._loadLangFileObject("en", translations);                                                                 // 13
                                                                                                                 // 14
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-post-by-feed'] = {
  Feeds: Feeds
};

})();

//# sourceMappingURL=telescope-post-by-feed.js.map
