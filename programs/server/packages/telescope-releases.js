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
var Iron = Package['iron:core'].Iron;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;

/* Package-scope variables */
var Releases, __, importRelease, release, translations;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-releases/package-i18n.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
TAPi18n.packages["telescope-releases"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"}; // 1
                                                                                                                     // 2
// define package's translation function (proxy to the i18next)                                                      // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                     // 4
                                                                                                                     // 5
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-releases/lib/releases.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Releases = new Meteor.Collection('releases');                                                                        // 1
                                                                                                                     // 2
heroModules.push({                                                                                                   // 3
  template: 'currentRelease'                                                                                         // 4
});                                                                                                                  // 5
                                                                                                                     // 6
preloadSubscriptions.push('currentRelease');                                                                         // 7
                                                                                                                     // 8
Meteor.startup(function () {                                                                                         // 9
  Releases.allow({                                                                                                   // 10
    insert: isAdminById,                                                                                             // 11
    update: isAdminById,                                                                                             // 12
    remove: isAdminById                                                                                              // 13
  });                                                                                                                // 14
});                                                                                                                  // 15
                                                                                                                     // 16
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-releases/lib/server/publications.js                                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Meteor.publish('currentRelease', function() {                                                                        // 1
  if(isAdminById(this.userId)){                                                                                      // 2
    return Releases.find({}, {sort: {createdAt: -1}, limit: 1});                                                     // 3
  }                                                                                                                  // 4
  return [];                                                                                                         // 5
});                                                                                                                  // 6
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-releases/lib/server/import_releases.js                                                         //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
importRelease = function (number) {                                                                                  // 1
  var releaseNotes = Assets.getText("releases/" + number + ".md");                                                   // 2
                                                                                                                     // 3
  if (!Releases.findOne({number: number})) {                                                                         // 4
                                                                                                                     // 5
    release = {                                                                                                      // 6
      number: number,                                                                                                // 7
      notes: releaseNotes,                                                                                           // 8
      createdAt: new Date(),                                                                                         // 9
      read: false                                                                                                    // 10
    }                                                                                                                // 11
    Releases.insert(release);                                                                                        // 12
                                                                                                                     // 13
  } else {                                                                                                           // 14
                                                                                                                     // 15
    // if release note already exists, update its content in case it's been updated                                  // 16
    Releases.update({number: number}, {$set: {notes: releaseNotes}})                                                 // 17
                                                                                                                     // 18
  }                                                                                                                  // 19
};                                                                                                                   // 20
                                                                                                                     // 21
Meteor.startup(function () {                                                                                         // 22
                                                                                                                     // 23
  importRelease('0.11.0');                                                                                           // 24
  importRelease('0.11.1');                                                                                           // 25
  importRelease('0.12.0');                                                                                           // 26
  importRelease('0.13.0');                                                                                           // 27
  importRelease('0.14.0');                                                                                           // 28
                                                                                                                     // 29
  // if this is before the first run, mark all release notes as read to avoid showing them                           // 30
  if (!Events.findOne({name: 'firstRun'})) {                                                                         // 31
    var r = Releases.update({}, {$set: {read: true}}, {multi: true});                                                // 32
  }                                                                                                                  // 33
                                                                                                                     // 34
});                                                                                                                  // 35
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-releases/Users/tutasg/meteor/telescope/packages/telescope-releases/i18n/en.i18n.js             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var _ = Package.underscore._,                                                                                        // 1
    package_name = "telescope-releases",                                                                             // 2
    namespace = "telescope-releases";                                                                                // 3
                                                                                                                     // 4
if (package_name != "project") {                                                                                     // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                            // 6
}                                                                                                                    // 7
// integrate the fallback language translations                                                                      // 8
translations = {};                                                                                                   // 9
translations[namespace] = {"telescope_has_been_updated":"Telescope has been updated."};                              // 10
TAPi18n._loadLangFileObject("en", translations);                                                                     // 11
                                                                                                                     // 12
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-releases'] = {
  Releases: Releases
};

})();

//# sourceMappingURL=telescope-releases.js.map
