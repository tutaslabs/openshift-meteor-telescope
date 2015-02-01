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
var serveAPI, twitterName;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/telescope-api/lib/server/api.js                                                            //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
serveAPI = function(limitSegment){                                                                     // 1
  var posts = [];                                                                                      // 2
  var limit = typeof limitSegment === 'undefined' ? 20 : limitSegment // default limit: 20 posts       // 3
                                                                                                       // 4
  Posts.find({status: STATUS_APPROVED}, {sort: {postedAt: -1}, limit: limit}).forEach(function(post) { // 5
    var url = getPostLink(post);                                                                       // 6
    var properties = {                                                                                 // 7
     title: post.title,                                                                                // 8
     headline: post.title, // for backwards compatibility                                              // 9
     author: post.author,                                                                              // 10
     date: post.postedAt,                                                                              // 11
     url: url,                                                                                         // 12
     guid: post._id                                                                                    // 13
    };                                                                                                 // 14
                                                                                                       // 15
    if(post.body)                                                                                      // 16
      properties.body = post.body;                                                                     // 17
                                                                                                       // 18
    if(post.url)                                                                                       // 19
      properties.domain = getDomain(url);                                                              // 20
                                                                                                       // 21
    if(twitterName = getTwitterNameById(post.userId))                                                  // 22
      properties.twitterName = twitterName;                                                            // 23
                                                                                                       // 24
    var comments = [];                                                                                 // 25
                                                                                                       // 26
    Comments.find({postId: post._id}, {sort: {postedAt: -1}, limit: 50}).forEach(function(comment) {   // 27
      var commentProperties = {                                                                        // 28
       body: comment.body,                                                                             // 29
       author: comment.author,                                                                         // 30
       date: comment.postedAt,                                                                         // 31
       guid: comment._id,                                                                              // 32
       parentCommentId: comment.parentCommentId                                                        // 33
      };                                                                                               // 34
      comments.push(commentProperties);                                                                // 35
    });                                                                                                // 36
                                                                                                       // 37
    var commentsToDelete = [];                                                                         // 38
                                                                                                       // 39
    comments.forEach(function(comment, index) {                                                        // 40
      if (comment.parentCommentId) {                                                                   // 41
        var parent = comments.filter(function(obj) {                                                   // 42
          return obj.guid === comment.parentCommentId;                                                 // 43
        })[0];                                                                                         // 44
        if (parent) {                                                                                  // 45
          parent.replies = parent.replies || [];                                                       // 46
          parent.replies.push(JSON.parse(JSON.stringify(comment)));                                    // 47
          commentsToDelete.push(index)                                                                 // 48
        }                                                                                              // 49
      }                                                                                                // 50
    });                                                                                                // 51
                                                                                                       // 52
    commentsToDelete.reverse().forEach(function(index) {                                               // 53
      comments.splice(index,1);                                                                        // 54
    });                                                                                                // 55
                                                                                                       // 56
    properties.comments = comments;                                                                    // 57
                                                                                                       // 58
    posts.push(properties);                                                                            // 59
  });                                                                                                  // 60
                                                                                                       // 61
  return JSON.stringify(posts);                                                                        // 62
};                                                                                                     // 63
                                                                                                       // 64
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                     //
// packages/telescope-api/lib/server/routes.js                                                         //
//                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                       //
Meteor.startup(function () {                                                                           // 1
                                                                                                       // 2
  Router.route('api', {                                                                                // 3
    where: 'server',                                                                                   // 4
    path: '/api/:limit?',                                                                              // 5
    action: function() {                                                                               // 6
      var limit = parseInt(this.params.limit);                                                         // 7
      this.response.write(serveAPI(limit));                                                            // 8
      this.response.end();                                                                             // 9
    }                                                                                                  // 10
  });                                                                                                  // 11
                                                                                                       // 12
});                                                                                                    // 13
/////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-api'] = {
  serveAPI: serveAPI
};

})();

//# sourceMappingURL=telescope-api.js.map
