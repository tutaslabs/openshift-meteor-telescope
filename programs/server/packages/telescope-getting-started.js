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
var moment = Package['momentjs:moment'].moment;
var Iron = Package['iron:core'].Iron;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;

/* Package-scope variables */
var deleteDummyContent, __, parentComment, translations;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-getting-started/package-i18n.js                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
TAPi18n.packages["telescope-getting-started"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"};
                                                                                                                  // 2
// define package's translation function (proxy to the i18next)                                                   // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                  // 4
                                                                                                                  // 5
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-getting-started/lib/getting_started.js                                                      //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
addToPostSchema.push(                                                                                             // 1
  {                                                                                                               // 2
    propertyName: 'dummySlug',                                                                                    // 3
    propertySchema: {                                                                                             // 4
      type: String,                                                                                               // 5
      optional: true,                                                                                             // 6
      autoform: {                                                                                                 // 7
        omit: true                                                                                                // 8
      }                                                                                                           // 9
    }                                                                                                             // 10
  }                                                                                                               // 11
);                                                                                                                // 12
                                                                                                                  // 13
addToPostSchema.push(                                                                                             // 14
  {                                                                                                               // 15
    propertyName: 'isDummy',                                                                                      // 16
    propertySchema: {                                                                                             // 17
      type: Boolean,                                                                                              // 18
      optional: true,                                                                                             // 19
      autoform: {                                                                                                 // 20
        omit: true                                                                                                // 21
      }                                                                                                           // 22
    }                                                                                                             // 23
  }                                                                                                               // 24
);                                                                                                                // 25
                                                                                                                  // 26
addToCommentsSchema.push(                                                                                         // 27
  {                                                                                                               // 28
    propertyName: 'isDummy',                                                                                      // 29
    propertySchema: {                                                                                             // 30
      type: Boolean,                                                                                              // 31
      optional: true,                                                                                             // 32
      autoform: {                                                                                                 // 33
        omit: true                                                                                                // 34
      }                                                                                                           // 35
    }                                                                                                             // 36
  }                                                                                                               // 37
);                                                                                                                // 38
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-getting-started/lib/server/dummy_content.js                                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var toTitleCase = function (str) {                                                                                // 1
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}); // 2
}                                                                                                                 // 3
                                                                                                                  // 4
var createPost = function (slug, postedAt, username, thumbnail) {                                                 // 5
  var post = {                                                                                                    // 6
    postedAt: postedAt,                                                                                           // 7
    body: Assets.getText("content/" + slug + ".md"),                                                              // 8
    title: toTitleCase(slug.replace(/_/g, ' ')),                                                                  // 9
    dummySlug: slug,                                                                                              // 10
    isDummy: true,                                                                                                // 11
    userId: Meteor.users.findOne({username: username})._id                                                        // 12
  }                                                                                                               // 13
                                                                                                                  // 14
  if (typeof thumbnail !== "undefined")                                                                           // 15
    post.thumbnailUrl = "/packages/telescope-getting-started/content/images/" + thumbnail                         // 16
                                                                                                                  // 17
  submitPost(post);                                                                                               // 18
}                                                                                                                 // 19
                                                                                                                  // 20
var createComment = function (slug, username, body, parentBody) {                                                 // 21
                                                                                                                  // 22
  var comment = {                                                                                                 // 23
    postId: Posts.findOne({dummySlug: slug})._id,                                                                 // 24
    userId: Meteor.users.findOne({username: username})._id,                                                       // 25
    body: body,                                                                                                   // 26
    isDummy: true,                                                                                                // 27
    disableNotifications: true                                                                                    // 28
  }                                                                                                               // 29
  if (parentComment = Comments.findOne({body: parentBody}))                                                       // 30
    comment.parentCommentId = parentComment._id;                                                                  // 31
                                                                                                                  // 32
  submitComment(comment);                                                                                         // 33
}                                                                                                                 // 34
                                                                                                                  // 35
var createDummyUsers = function () {                                                                              // 36
  Accounts.createUser({                                                                                           // 37
    username: 'Bruce',                                                                                            // 38
    email: 'dummyuser1@telescopeapp.org',                                                                         // 39
    profile: {                                                                                                    // 40
      isDummy: true                                                                                               // 41
    }                                                                                                             // 42
  });                                                                                                             // 43
  Accounts.createUser({                                                                                           // 44
    username: 'Arnold',                                                                                           // 45
    email: 'dummyuser2@telescopeapp.org',                                                                         // 46
    profile: {                                                                                                    // 47
      isDummy: true                                                                                               // 48
    }                                                                                                             // 49
  });                                                                                                             // 50
  Accounts.createUser({                                                                                           // 51
    username: 'Julia',                                                                                            // 52
    email: 'dummyuser3@telescopeapp.org',                                                                         // 53
    profile: {                                                                                                    // 54
      isDummy: true                                                                                               // 55
    }                                                                                                             // 56
  });                                                                                                             // 57
}                                                                                                                 // 58
                                                                                                                  // 59
var createDummyPosts = function () {                                                                              // 60
                                                                                                                  // 61
  createPost("read_this_first", moment().toDate(), "Bruce", "telescope.png");                                     // 62
                                                                                                                  // 63
  createPost("deploying_telescope", moment().subtract(10, 'minutes').toDate(), "Arnold");                         // 64
                                                                                                                  // 65
  createPost("customizing_telescope", moment().subtract(3, 'hours').toDate(), "Julia");                           // 66
                                                                                                                  // 67
  createPost("getting_help", moment().subtract(1, 'days').toDate(), "Bruce", "stackoverflow.png");                // 68
                                                                                                                  // 69
  createPost("removing_getting_started_posts", moment().subtract(2, 'days').toDate(), "Julia");                   // 70
                                                                                                                  // 71
}                                                                                                                 // 72
                                                                                                                  // 73
var createDummyComments = function () {                                                                           // 74
                                                                                                                  // 75
  createComment("read_this_first", "Bruce", "What an awesome app!");                                              // 76
                                                                                                                  // 77
  createComment("deploying_telescope", "Arnold", "Deploy to da choppah!");                                        // 78
  createComment("deploying_telescope", "Julia", "Do you really need to say this all the time?", "Deploy to the choppah!");
                                                                                                                  // 80
  createComment("customizing_telescope", "Julia", "I can't wait to make my app pretty. Get it? *Pretty*?");       // 81
                                                                                                                  // 82
  createComment("removing_getting_started_posts", "Bruce", "Yippee ki-yay, motherfucker!");                       // 83
  createComment("removing_getting_started_posts", "Arnold", "I don't think you're supposed to swear in here…", "Yippee ki-yay, motherfucker!");
                                                                                                                  // 85
}                                                                                                                 // 86
                                                                                                                  // 87
deleteDummyContent = function () {                                                                                // 88
  Meteor.users.remove({'profile.isDummy': true});                                                                 // 89
  Posts.remove({isDummy: true});                                                                                  // 90
  Comments.remove({isDummy: true});                                                                               // 91
}                                                                                                                 // 92
                                                                                                                  // 93
Meteor.methods({                                                                                                  // 94
  addGettingStartedContent: function () {                                                                         // 95
    if (isAdmin(Meteor.user())) {                                                                                 // 96
      createDummyUsers();                                                                                         // 97
      createDummyPosts();                                                                                         // 98
      createDummyComments();                                                                                      // 99
    }                                                                                                             // 100
  },                                                                                                              // 101
  removeGettingStartedContent: function () {                                                                      // 102
    if (isAdmin(Meteor.user()))                                                                                   // 103
      deleteDummyContent();                                                                                       // 104
  }                                                                                                               // 105
})                                                                                                                // 106
                                                                                                                  // 107
Meteor.startup(function () {                                                                                      // 108
  // insert dummy content only if createDummyContent hasn't happened and there aren't any posts in the db         // 109
  if (!Events.findOne({name: 'createDummyContent'}) && !Posts.find().count()) {                                   // 110
    createDummyUsers();                                                                                           // 111
    createDummyPosts();                                                                                           // 112
    createDummyComments();                                                                                        // 113
    logEvent({name: 'createDummyContent', unique: true, important: true});                                        // 114
  }                                                                                                               // 115
});                                                                                                               // 116
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-getting-started/Users/tutasg/meteor/telescope/packages/telescope-getting-started/i18n/en.i1 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-getting-started",                                                                   // 2
    namespace = "telescope-getting-started";                                                                      // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
// integrate the fallback language translations                                                                   // 8
translations = {};                                                                                                // 9
translations[namespace] = {"translation_key":"translation string"};                                               // 10
TAPi18n._loadLangFileObject("en", translations);                                                                  // 11
                                                                                                                  // 12
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-getting-started'] = {
  deleteDummyContent: deleteDummyContent
};

})();

//# sourceMappingURL=telescope-getting-started.js.map
