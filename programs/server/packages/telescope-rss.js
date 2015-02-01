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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;

/* Package-scope variables */
var serveRSS, servePostRSS, serveCommentRSS, post;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-rss/lib/server/rss.js                                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var RSS = Npm.require('rss');                                                                                     // 1
                                                                                                                  // 2
var getMeta = function(url) {                                                                                     // 3
  var siteUrl = getSetting('siteUrl', Meteor.absoluteUrl());                                                      // 4
  return {                                                                                                        // 5
    title: getSetting('title'),                                                                                   // 6
    description: getSetting('tagline'),                                                                           // 7
    feed_url: siteUrl+url,                                                                                        // 8
    site_url: siteUrl,                                                                                            // 9
    image_url: siteUrl+'img/favicon.png',                                                                         // 10
  };                                                                                                              // 11
};                                                                                                                // 12
                                                                                                                  // 13
servePostRSS = function(view, url) {                                                                              // 14
  var feed = new RSS(getMeta(url));                                                                               // 15
                                                                                                                  // 16
  var params = getPostsParameters({view: view, limit: 20});                                                       // 17
  delete params['options']['sort']['sticky'];                                                                     // 18
                                                                                                                  // 19
  Posts.find(params.find, params.options).forEach(function(post) {                                                // 20
    var description = !!post.body ? post.body+'</br></br>' : '';                                                  // 21
    feed.item({                                                                                                   // 22
     title: post.title,                                                                                           // 23
     description: description+'<a href="'+getPostUrl(post._id)+'">Discuss</a>',                                   // 24
     author: post.author,                                                                                         // 25
     date: post.postedAt,                                                                                         // 26
     url: getPostLink(post),                                                                                      // 27
     guid: post._id                                                                                               // 28
    });                                                                                                           // 29
  });                                                                                                             // 30
                                                                                                                  // 31
  return feed.xml();                                                                                              // 32
};                                                                                                                // 33
                                                                                                                  // 34
serveCommentRSS = function() {                                                                                    // 35
  var feed = new RSS(getMeta(Router.path('rss_comments')));                                                       // 36
                                                                                                                  // 37
  Comments.find({isDeleted: {$ne: true}}, {sort: {postedAt: -1}, limit: 20}).forEach(function(comment) {          // 38
    post = Posts.findOne(comment.postId);                                                                         // 39
    feed.item({                                                                                                   // 40
     title: 'Comment on '+post.title,                                                                             // 41
     description: comment.body+'</br></br>'+'<a href="'+getPostCommentUrl(post._id, comment._id)+'">Discuss</a>', // 42
     author: comment.author,                                                                                      // 43
     date: comment.postedAt,                                                                                      // 44
     url: getCommentUrl(comment._id),                                                                             // 45
     guid: comment._id                                                                                            // 46
    });                                                                                                           // 47
  });                                                                                                             // 48
                                                                                                                  // 49
  return feed.xml();                                                                                              // 50
};                                                                                                                // 51
                                                                                                                  // 52
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-rss/lib/server/routes.js                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Meteor.startup(function () {                                                                                      // 1
                                                                                                                  // 2
    // New Post RSS                                                                                               // 3
                                                                                                                  // 4
    Router.route('/feed.xml', function () {                                                                       // 5
      this.response.write(servePostRSS('new', 'feed.xml'));                                                       // 6
      this.response.end();                                                                                        // 7
    }, {                                                                                                          // 8
      name: 'feed',                                                                                               // 9
      where: 'server'                                                                                             // 10
    });                                                                                                           // 11
                                                                                                                  // 12
    // New Post RSS                                                                                               // 13
                                                                                                                  // 14
    Router.route('/rss/posts/new.xml', function () {                                                              // 15
      this.response.write(servePostRSS('top', 'rss/posts/new.xml'));                                              // 16
      this.response.end();                                                                                        // 17
    }, {                                                                                                          // 18
      name: 'rss_posts_new',                                                                                      // 19
      where: 'server'                                                                                             // 20
    });                                                                                                           // 21
                                                                                                                  // 22
    // Top Post RSS                                                                                               // 23
                                                                                                                  // 24
    Router.route('/rss/posts/top.xml', function () {                                                              // 25
      this.response.write(servePostRSS('top', 'rss/posts/top.xml'));                                              // 26
      this.response.end();                                                                                        // 27
    }, {                                                                                                          // 28
      name: 'rss_posts_top',                                                                                      // 29
      where: 'server'                                                                                             // 30
    });                                                                                                           // 31
                                                                                                                  // 32
    // Best Post RSS                                                                                              // 33
                                                                                                                  // 34
    Router.route('/rss/posts/best.xml', function () {                                                             // 35
      this.response.write(servePostRSS('best', 'rss/posts/best.xml'));                                            // 36
      this.response.end();                                                                                        // 37
    }, {                                                                                                          // 38
      name: 'rss_posts_best',                                                                                     // 39
      where: 'server'                                                                                             // 40
    });                                                                                                           // 41
                                                                                                                  // 42
    // Comment RSS                                                                                                // 43
                                                                                                                  // 44
    Router.route('/rss/comments.xml', function() {                                                                // 45
      this.response.write(serveCommentRSS());                                                                     // 46
      this.response.end();                                                                                        // 47
    }, {                                                                                                          // 48
      name: 'rss_comments',                                                                                       // 49
      where: 'server'                                                                                             // 50
    });                                                                                                           // 51
                                                                                                                  // 52
});                                                                                                               // 53
                                                                                                                  // 54
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-rss'] = {
  serveRSS: serveRSS
};

})();

//# sourceMappingURL=telescope-rss.js.map
