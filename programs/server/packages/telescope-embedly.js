(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
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
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var HTTP = Package.http.HTTP;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;

/* Package-scope variables */
var __, getEmbedlyData, translations;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-embedly/package-i18n.js                                                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
TAPi18n.packages["telescope-embedly"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"}; // 1
                                                                                                                    // 2
// define package's translation function (proxy to the i18next)                                                     // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                    // 4
                                                                                                                    // 5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-embedly/lib/embedly.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var thumbnailProperty = {                                                                                           // 1
  propertyName: 'thumbnailUrl',                                                                                     // 2
  propertySchema: {                                                                                                 // 3
    type: String,                                                                                                   // 4
    label: 'thumbnail',                                                                                             // 5
    optional: true,                                                                                                 // 6
    autoform: {                                                                                                     // 7
      editable: true,                                                                                               // 8
      type: 'bootstrap-postthumbnail'                                                                               // 9
    }                                                                                                               // 10
  }                                                                                                                 // 11
}                                                                                                                   // 12
addToPostSchema.push(thumbnailProperty);                                                                            // 13
                                                                                                                    // 14
var mediaProperty = {                                                                                               // 15
  propertyName: 'media',                                                                                            // 16
  propertySchema: {                                                                                                 // 17
    type: Object,                                                                                                   // 18
    optional: true,                                                                                                 // 19
    blackbox: true,                                                                                                 // 20
    hidden: true,                                                                                                   // 21
    autoform: {                                                                                                     // 22
      omit: true                                                                                                    // 23
    }                                                                                                               // 24
  }                                                                                                                 // 25
}                                                                                                                   // 26
addToPostSchema.push(mediaProperty);                                                                                // 27
                                                                                                                    // 28
postThumbnail.push({                                                                                                // 29
  template: 'postThumbnail',                                                                                        // 30
  order: 15                                                                                                         // 31
});                                                                                                                 // 32
                                                                                                                    // 33
var embedlyKeyProperty = {                                                                                          // 34
  propertyName: 'embedlyKey',                                                                                       // 35
  propertySchema: {                                                                                                 // 36
    type: String,                                                                                                   // 37
    optional: true,                                                                                                 // 38
    autoform: {                                                                                                     // 39
      group: 'embedly',                                                                                             // 40
      private: true                                                                                                 // 41
    }                                                                                                               // 42
  }                                                                                                                 // 43
}                                                                                                                   // 44
addToSettingsSchema.push(embedlyKeyProperty);                                                                       // 45
                                                                                                                    // 46
var thumbnailWidthProperty = {                                                                                      // 47
  propertyName: 'thumbnailWidth',                                                                                   // 48
  propertySchema: {                                                                                                 // 49
    type: Number,                                                                                                   // 50
    optional: true,                                                                                                 // 51
    autoform: {                                                                                                     // 52
      group: 'embedly'                                                                                              // 53
    }                                                                                                               // 54
  }                                                                                                                 // 55
}                                                                                                                   // 56
addToSettingsSchema.push(thumbnailWidthProperty);                                                                   // 57
                                                                                                                    // 58
var thumbnailHeightProperty = {                                                                                     // 59
  propertyName: 'thumbnailHeight',                                                                                  // 60
  propertySchema: {                                                                                                 // 61
    type: Number,                                                                                                   // 62
    optional: true,                                                                                                 // 63
    autoform: {                                                                                                     // 64
      group: 'embedly'                                                                                              // 65
    }                                                                                                               // 66
  }                                                                                                                 // 67
}                                                                                                                   // 68
addToSettingsSchema.push(thumbnailHeightProperty);                                                                  // 69
                                                                                                                    // 70
// add callback that adds "has-thumbnail" or "no-thumbnail" CSS classes                                             // 71
postClassCallbacks.push(function (post, postClass){                                                                 // 72
  var thumbnailClass = !!post.thumbnailUrl ? "has-thumbnail" : "no-thumbnail";                                      // 73
  return postClass + " " + thumbnailClass;                                                                          // 74
});                                                                                                                 // 75
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-embedly/lib/server/get_embedly_data.js                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
getEmbedlyData = function (url) {                                                                                   // 1
  var data = {}                                                                                                     // 2
  var extractBase = 'http://api.embed.ly/1/extract';                                                                // 3
  var embedlyKey = getSetting('embedlyKey');                                                                        // 4
  var thumbnailWidth = getSetting('thumbnailWidth', 200);                                                           // 5
  var thumbnailHeight = getSetting('thumbnailHeight', 125);                                                         // 6
                                                                                                                    // 7
  if(!embedlyKey) {                                                                                                 // 8
    // fail silently to still let the post be submitted as usual                                                    // 9
    console.log("Couldn't find an Embedly API key! Please add it to your Telescope settings or remove the Embedly module.");
    return null;                                                                                                    // 11
  }                                                                                                                 // 12
                                                                                                                    // 13
  try {                                                                                                             // 14
                                                                                                                    // 15
    var result = Meteor.http.get(extractBase, {                                                                     // 16
      params: {                                                                                                     // 17
        key: embedlyKey,                                                                                            // 18
        url: url,                                                                                                   // 19
        image_width: thumbnailWidth,                                                                                // 20
        image_height: thumbnailHeight,                                                                              // 21
        image_method: 'crop'                                                                                        // 22
      }                                                                                                             // 23
    });                                                                                                             // 24
                                                                                                                    // 25
    // console.log(result)                                                                                          // 26
                                                                                                                    // 27
    if (!!result.data.images && !!result.data.images.length) // there may not always be an image                    // 28
      result.data.thumbnailUrl = result.data.images[0].url; // add thumbnailUrl as its own property                 // 29
                                                                                                                    // 30
    return _.pick(result.data, 'title', 'media', 'description', 'thumbnailUrl');                                    // 31
                                                                                                                    // 32
  } catch (error) {                                                                                                 // 33
    console.log(error)                                                                                              // 34
    // the first 13 characters of the Embedly errors are "failed [400] ", so remove them and parse the rest         // 35
    var errorObject = JSON.parse(error.message.substring(13));                                                      // 36
    throw new Meteor.Error(errorObject.error_code, errorObject.error_message);                                      // 37
    return null;                                                                                                    // 38
  }                                                                                                                 // 39
}                                                                                                                   // 40
                                                                                                                    // 41
// For security reason, we use a separate server-side API call to set the media object,                             // 42
// and the thumbnail object if it hasn't already been set                                                           // 43
                                                                                                                    // 44
// note: the following function is not used because it would hold up the post submission, use next one instead      // 45
// var addMediaOnSubmit = function (post) {                                                                         // 46
//   if(post.url){                                                                                                  // 47
//     var data = getEmbedlyData(post.url);                                                                         // 48
//     if (!!data) {                                                                                                // 49
//       // only add a thumbnailUrl if there isn't one already                                                      // 50
//       if(!post.thumbnailUrl && !!data.thumbnailUrl)                                                              // 51
//         post.thumbnailUrl = data.thumbnailUrl                                                                    // 52
//       // add media if necessary                                                                                  // 53
//       if(!!data.media.html)                                                                                      // 54
//         post.media = data.media                                                                                  // 55
//     }                                                                                                            // 56
//   }                                                                                                              // 57
//   return post;                                                                                                   // 58
// }                                                                                                                // 59
// postSubmitMethodCallbacks.push(addMediaOnSubmit);                                                                // 60
                                                                                                                    // 61
// Async variant that directly modifies the post object with update()                                               // 62
var addMediaAfterSubmit = function (post) {                                                                         // 63
  var set = {};                                                                                                     // 64
  if(post.url){                                                                                                     // 65
    var data = getEmbedlyData(post.url);                                                                            // 66
    if (!!data) {                                                                                                   // 67
      // only add a thumbnailUrl if there isn't one already                                                         // 68
      if (!post.thumbnailUrl && !!data.thumbnailUrl) {                                                              // 69
        post.thumbnailUrl = data.thumbnailUrl;                                                                      // 70
        set.thumbnailUrl = data.thumbnailUrl;                                                                       // 71
      }                                                                                                             // 72
      // add media if necessary                                                                                     // 73
      if (!!data.media.html) {                                                                                      // 74
        post.media = data.media;                                                                                    // 75
        set.media = data.media;                                                                                     // 76
      }                                                                                                             // 77
    }                                                                                                               // 78
  }                                                                                                                 // 79
  Posts.update(post._id, {$set: set});                                                                              // 80
  return post;                                                                                                      // 81
}                                                                                                                   // 82
postAfterSubmitMethodCallbacks.push(addMediaAfterSubmit);                                                           // 83
                                                                                                                    // 84
// TODO: find a way to only do this is URL has actually changed?                                                    // 85
var updateMediaOnEdit = function (updateObject) {                                                                   // 86
  var post = updateObject.$set                                                                                      // 87
  if(post.url){                                                                                                     // 88
    var data = getEmbedlyData(post.url);                                                                            // 89
    if(!!data && !!data.media.html)                                                                                 // 90
      updateObject.$set.media = data.media                                                                          // 91
  }                                                                                                                 // 92
  return updateObject;                                                                                              // 93
}                                                                                                                   // 94
postEditMethodCallbacks.push(updateMediaOnEdit);                                                                    // 95
                                                                                                                    // 96
                                                                                                                    // 97
Meteor.methods({                                                                                                    // 98
  testGetEmbedlyData: function (url) {                                                                              // 99
    console.log(getEmbedlyData(url))                                                                                // 100
  },                                                                                                                // 101
  getEmbedlyData: function (url) {                                                                                  // 102
    return getEmbedlyData(url);                                                                                     // 103
  },                                                                                                                // 104
  embedlyKeyExists: function () {                                                                                   // 105
    return !!getSetting('embedlyKey');                                                                              // 106
  },                                                                                                                // 107
  regenerateEmbedlyData: function (post) {                                                                          // 108
    if (can.edit(Meteor.user(), post)) {                                                                            // 109
      addMediaAfterSubmit(post);                                                                                    // 110
    }                                                                                                               // 111
  }                                                                                                                 // 112
});                                                                                                                 // 113
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-embedly/Users/tutasg/meteor/telescope/packages/telescope-embedly/i18n/en.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-embedly",                                                                             // 2
    namespace = "telescope-embedly";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
// integrate the fallback language translations                                                                     // 8
translations = {};                                                                                                  // 9
translations[namespace] = {"thumbnail":"Thumbnail","thumbnailUrl":"Thumbnail","regenerate_thumbnail":"Regenerate Thumbnail","clear_thumbnail":"Clear Thumbnail","please_fill_in_embedly_key":"Please fill in your Embedly API key to enable thumbnails."};
TAPi18n._loadLangFileObject("en", translations);                                                                    // 11
                                                                                                                    // 12
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-embedly/Users/tutasg/meteor/telescope/packages/telescope-embedly/i18n/fr.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-embedly",                                                                             // 2
    namespace = "telescope-embedly";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                                     // 8
  TAPi18n.translations["fr"] = {};                                                                                  // 9
}                                                                                                                   // 10
                                                                                                                    // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                          // 12
  TAPi18n.translations["fr"][namespace] = {};                                                                       // 13
}                                                                                                                   // 14
                                                                                                                    // 15
_.extend(TAPi18n.translations["fr"][namespace], {"thumbnail":"Aperçu","thumbnailUrl":"Aperçu","regenerate_thumbnail":"Regenerer l'aperçu","clear_thumbnail":"Effacer l'aperçu","please_fill_in_embedly_key":"Veuillez fournir une clé API Embedly pour activer les aperçus."});
                                                                                                                    // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-embedly'] = {};

})();

//# sourceMappingURL=telescope-embedly.js.map
