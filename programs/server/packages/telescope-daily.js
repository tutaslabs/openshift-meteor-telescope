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
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var FastRender = Package['meteorhacks:fast-render'].FastRender;
var SubsManager = Package['meteorhacks:subs-manager'].SubsManager;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var getDigestURL = Package['telescope-singleday'].getDigestURL;
var PostsDigestController = Package['telescope-singleday'].PostsDigestController;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var PostsDailyController, __, daysPerPage, translations;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/package-i18n.js                                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
TAPi18n.packages["telescope-daily"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"}; // 1
                                                                                                                  // 2
// define package's translation function (proxy to the i18next)                                                   // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                  // 4
                                                                                                                  // 5
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/lib/daily.js                                                                          //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
daysPerPage = 5;                                                                                                  // 1
                                                                                                                  // 2
viewsMenu.push({                                                                                                  // 3
  route: 'postsDaily',                                                                                            // 4
  label: 'daily',                                                                                                 // 5
  description: 'day_by_day_view'                                                                                  // 6
});                                                                                                               // 7
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/lib/routes.js                                                                         //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var coreSubscriptions = new SubsManager({                                                                         // 1
  // cache recent 50 subscriptions                                                                                // 2
  cacheLimit: 50,                                                                                                 // 3
  // expire any subscription after 30 minutes                                                                     // 4
  expireIn: 30                                                                                                    // 5
});                                                                                                               // 6
                                                                                                                  // 7
PostsDailyController = RouteController.extend({                                                                   // 8
                                                                                                                  // 9
  template: function() {                                                                                          // 10
    // use a function to make sure the template is evaluated *after* any template overrides                       // 11
    return getTemplate('postsDaily');                                                                             // 12
  },                                                                                                              // 13
                                                                                                                  // 14
  subscriptions: function () {                                                                                    // 15
    // this.days = this.params.days ? this.params.days : daysPerPage;                                             // 16
    // TODO: find a way to preload the first n posts of the first 5 days?                                         // 17
  },                                                                                                              // 18
                                                                                                                  // 19
  data: function () {                                                                                             // 20
    this.days = this.params.days ? this.params.days : daysPerPage;                                                // 21
    Session.set('postsDays', this.days);                                                                          // 22
    return {                                                                                                      // 23
      days: this.days                                                                                             // 24
    };                                                                                                            // 25
  },                                                                                                              // 26
                                                                                                                  // 27
  getTitle: function () {                                                                                         // 28
    return i18n.t('daily') + ' - ' + getSetting('title', "Telescope");                                            // 29
  },                                                                                                              // 30
                                                                                                                  // 31
  getDescription: function () {                                                                                   // 32
    return i18n.t('day_by_day_view');                                                                             // 33
  },                                                                                                              // 34
                                                                                                                  // 35
  fastRender: true                                                                                                // 36
});                                                                                                               // 37
                                                                                                                  // 38
Meteor.startup(function () {                                                                                      // 39
                                                                                                                  // 40
  Router.route('/daily/:days?', {                                                                                 // 41
    name: 'postsDaily',                                                                                           // 42
    controller: PostsDailyController                                                                              // 43
  });                                                                                                             // 44
                                                                                                                  // 45
});                                                                                                               // 46
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/Users/tutasg/meteor/telescope/packages/telescope-daily/i18n/de.i18n.js                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-daily",                                                                             // 2
    namespace = "telescope-daily";                                                                                // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                                   // 8
  TAPi18n.translations["de"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                        // 12
  TAPi18n.translations["de"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["de"][namespace], {"daily":"Daily"});                                               // 16
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/Users/tutasg/meteor/telescope/packages/telescope-daily/i18n/en.i18n.js                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-daily",                                                                             // 2
    namespace = "telescope-daily";                                                                                // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
// integrate the fallback language translations                                                                   // 8
translations = {};                                                                                                // 9
translations[namespace] = {"daily":"Daily","day_by_day_view":"The most popular posts of each day.","load_next_days":"Load Next Days"};
TAPi18n._loadLangFileObject("en", translations);                                                                  // 11
                                                                                                                  // 12
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/Users/tutasg/meteor/telescope/packages/telescope-daily/i18n/es.i18n.js                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-daily",                                                                             // 2
    namespace = "telescope-daily";                                                                                // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                                   // 8
  TAPi18n.translations["es"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                        // 12
  TAPi18n.translations["es"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["es"][namespace], null);                                                            // 16
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/Users/tutasg/meteor/telescope/packages/telescope-daily/i18n/fr.i18n.js                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-daily",                                                                             // 2
    namespace = "telescope-daily";                                                                                // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                                   // 8
  TAPi18n.translations["fr"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                        // 12
  TAPi18n.translations["fr"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["fr"][namespace], {"daily":"Jour par jour"});                                       // 16
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/Users/tutasg/meteor/telescope/packages/telescope-daily/i18n/it.i18n.js                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-daily",                                                                             // 2
    namespace = "telescope-daily";                                                                                // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                                   // 8
  TAPi18n.translations["it"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                        // 12
  TAPi18n.translations["it"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["it"][namespace], {"daily":"Daily"});                                               // 16
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-daily/Users/tutasg/meteor/telescope/packages/telescope-daily/i18n/zh-CN.i18n.js             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-daily",                                                                             // 2
    namespace = "telescope-daily";                                                                                // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                                // 8
  TAPi18n.translations["zh-CN"] = {};                                                                             // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                                     // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                                  // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"daily":"Daily"});                                            // 16
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-daily'] = {
  PostsDailyController: PostsDailyController
};

})();

//# sourceMappingURL=telescope-daily.js.map
