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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;

/* Package-scope variables */
var preloadSubscriptions, adminMenu, Categories, addToPostSchema, primaryNav, postModules, getPostCategories, categorySchema, getCategoryUrl, __, translations;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/lib/categories.js                                                                     //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
// category schema                                                                                               // 1
categorySchema = new SimpleSchema({                                                                              // 2
  name: {                                                                                                        // 3
    type: String                                                                                                 // 4
  },                                                                                                             // 5
  description: {                                                                                                 // 6
    type: String,                                                                                                // 7
    optional: true,                                                                                              // 8
    autoform: {                                                                                                  // 9
      rows: 3                                                                                                    // 10
    }                                                                                                            // 11
  },                                                                                                             // 12
  order: {                                                                                                       // 13
    type: Number,                                                                                                // 14
    optional: true                                                                                               // 15
  },                                                                                                             // 16
  slug: {                                                                                                        // 17
    type: String,                                                                                                // 18
    optional: true,                                                                                              // 19
    autoform: {                                                                                                  // 20
    }                                                                                                            // 21
  }                                                                                                              // 22
});                                                                                                              // 23
                                                                                                                 // 24
Categories = new Meteor.Collection("categories");                                                                // 25
Categories.attachSchema(categorySchema);                                                                         // 26
                                                                                                                 // 27
Categories.before.insert(function (userId, doc) {                                                                // 28
  // if no slug has been provided, generate one                                                                  // 29
  if (!doc.slug)                                                                                                 // 30
    doc.slug = slugify(doc.name);                                                                                // 31
});                                                                                                              // 32
                                                                                                                 // 33
// category post list parameters                                                                                 // 34
viewParameters.category = function (terms) {                                                                     // 35
  var categoryId = Categories.findOne({slug: terms.category})._id;                                               // 36
  return {                                                                                                       // 37
    find: {'categories': {$in: [categoryId]}} ,                                                                  // 38
    options: {sort: {sticky: -1, score: -1}} // for now categories views default to the "top" view               // 39
  };                                                                                                             // 40
}                                                                                                                // 41
                                                                                                                 // 42
Meteor.startup(function () {                                                                                     // 43
  Categories.allow({                                                                                             // 44
    insert: isAdminById,                                                                                         // 45
    update: isAdminById,                                                                                         // 46
    remove: isAdminById                                                                                          // 47
  });                                                                                                            // 48
                                                                                                                 // 49
  Meteor.methods({                                                                                               // 50
    submitCategory: function(category){                                                                          // 51
      console.log(category)                                                                                      // 52
      if (!Meteor.user() || !isAdmin(Meteor.user()))                                                             // 53
        throw new Meteor.Error(i18n.t('you_need_to_login_and_be_an_admin_to_add_a_new_category'));               // 54
      var categoryId=Categories.insert(category);                                                                // 55
      return category.name;                                                                                      // 56
    }                                                                                                            // 57
  });                                                                                                            // 58
});                                                                                                              // 59
                                                                                                                 // 60
getPostCategories = function (post) {                                                                            // 61
  return !!post.categories ? Categories.find({_id: {$in: post.categories}}).fetch() : [];                        // 62
}                                                                                                                // 63
                                                                                                                 // 64
getCategoryUrl = function(slug){                                                                                 // 65
  return getSiteUrl()+'category/'+slug;                                                                          // 66
};                                                                                                               // 67
                                                                                                                 // 68
// add callback that adds categories CSS classes                                                                 // 69
postClassCallbacks.push(function (post, postClass){                                                              // 70
  var classArray = _.map(getPostCategories(post), function (category){return "category-"+category.slug});        // 71
  return postClass + " " + classArray.join(' ');                                                                 // 72
});                                                                                                              // 73
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/lib/custom_fields.js                                                                  //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
addToPostSchema.push(                                                                                            // 1
  {                                                                                                              // 2
    propertyName: 'categories',                                                                                  // 3
    propertySchema: {                                                                                            // 4
      type: [String],                                                                                            // 5
      optional: true,                                                                                            // 6
      editable: true,                                                                                            // 7
      autoform: {                                                                                                // 8
        editable: true,                                                                                          // 9
        noselect: true,                                                                                          // 10
        options: function () {                                                                                   // 11
          var categories = Categories.find().map(function (category) {                                           // 12
            return {                                                                                             // 13
              value: category._id,                                                                               // 14
              label: category.name                                                                               // 15
            }                                                                                                    // 16
          });                                                                                                    // 17
          return categories;                                                                                     // 18
        }                                                                                                        // 19
      }                                                                                                          // 20
    }                                                                                                            // 21
  }                                                                                                              // 22
);                                                                                                               // 23
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/lib/hooks.js                                                                          //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
adminMenu.push({                                                                                                 // 1
  route: 'categories',                                                                                           // 2
  label: 'Categories',                                                                                           // 3
  description: 'add_and_remove_categories'                                                                       // 4
});                                                                                                              // 5
                                                                                                                 // 6
// push "categories" modules to postHeading                                                                      // 7
postHeading.push({                                                                                               // 8
  template: 'postCategories',                                                                                    // 9
  order: 30                                                                                                      // 10
});                                                                                                              // 11
                                                                                                                 // 12
// push "categoriesMenu" template to primaryNav                                                                  // 13
primaryNav.push({                                                                                                // 14
  template: 'categoriesMenu',                                                                                    // 15
  order: 50                                                                                                      // 16
});                                                                                                              // 17
                                                                                                                 // 18
// we want to wait until categories are all loaded to load the rest of the app                                   // 19
preloadSubscriptions.push('categories');                                                                         // 20
                                                                                                                 // 21
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/package-i18n.js                                                                       //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
TAPi18n.packages["telescope-tags"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"}; // 1
                                                                                                                 // 2
// define package's translation function (proxy to the i18next)                                                  // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                 // 4
                                                                                                                 // 5
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/lib/server/publications.js                                                            //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
Meteor.publish('categories', function() {                                                                        // 1
  if(can.viewById(this.userId)){                                                                                 // 2
    return Categories.find();                                                                                    // 3
  }                                                                                                              // 4
  return [];                                                                                                     // 5
});                                                                                                              // 6
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/Users/tutasg/meteor/telescope/packages/telescope-tags/i18n/de.i18n.js                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "telescope-tags",                                                                             // 2
    namespace = "telescope-tags";                                                                                // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                                  // 8
  TAPi18n.translations["de"] = {};                                                                               // 9
}                                                                                                                // 10
                                                                                                                 // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                       // 12
  TAPi18n.translations["de"][namespace] = {};                                                                    // 13
}                                                                                                                // 14
                                                                                                                 // 15
_.extend(TAPi18n.translations["de"][namespace], {"categories":"Kategorien"});                                    // 16
                                                                                                                 // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/Users/tutasg/meteor/telescope/packages/telescope-tags/i18n/en.i18n.js                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "telescope-tags",                                                                             // 2
    namespace = "telescope-tags";                                                                                // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
// integrate the fallback language translations                                                                  // 8
translations = {};                                                                                               // 9
translations[namespace] = {"categories":"Categories","add_and_remove_categories":"Add and remove categories."};  // 10
TAPi18n._loadLangFileObject("en", translations);                                                                 // 11
                                                                                                                 // 12
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/Users/tutasg/meteor/telescope/packages/telescope-tags/i18n/es.i18n.js                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "telescope-tags",                                                                             // 2
    namespace = "telescope-tags";                                                                                // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                                  // 8
  TAPi18n.translations["es"] = {};                                                                               // 9
}                                                                                                                // 10
                                                                                                                 // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                       // 12
  TAPi18n.translations["es"][namespace] = {};                                                                    // 13
}                                                                                                                // 14
                                                                                                                 // 15
_.extend(TAPi18n.translations["es"][namespace], {"categories":"Categorías"});                                    // 16
                                                                                                                 // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/Users/tutasg/meteor/telescope/packages/telescope-tags/i18n/fr.i18n.js                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "telescope-tags",                                                                             // 2
    namespace = "telescope-tags";                                                                                // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                                  // 8
  TAPi18n.translations["fr"] = {};                                                                               // 9
}                                                                                                                // 10
                                                                                                                 // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                       // 12
  TAPi18n.translations["fr"][namespace] = {};                                                                    // 13
}                                                                                                                // 14
                                                                                                                 // 15
_.extend(TAPi18n.translations["fr"][namespace], {"categories":"Catégories"});                                    // 16
                                                                                                                 // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/Users/tutasg/meteor/telescope/packages/telescope-tags/i18n/it.i18n.js                 //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "telescope-tags",                                                                             // 2
    namespace = "telescope-tags";                                                                                // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                                  // 8
  TAPi18n.translations["it"] = {};                                                                               // 9
}                                                                                                                // 10
                                                                                                                 // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                       // 12
  TAPi18n.translations["it"][namespace] = {};                                                                    // 13
}                                                                                                                // 14
                                                                                                                 // 15
_.extend(TAPi18n.translations["it"][namespace], {"categories":"Categorie"});                                     // 16
                                                                                                                 // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/telescope-tags/Users/tutasg/meteor/telescope/packages/telescope-tags/i18n/zh-CN.i18n.js              //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
var _ = Package.underscore._,                                                                                    // 1
    package_name = "telescope-tags",                                                                             // 2
    namespace = "telescope-tags";                                                                                // 3
                                                                                                                 // 4
if (package_name != "project") {                                                                                 // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                        // 6
}                                                                                                                // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                               // 8
  TAPi18n.translations["zh-CN"] = {};                                                                            // 9
}                                                                                                                // 10
                                                                                                                 // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                                    // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                                 // 13
}                                                                                                                // 14
                                                                                                                 // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"categories":"分类"});                                         // 16
                                                                                                                 // 17
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-tags'] = {
  preloadSubscriptions: preloadSubscriptions,
  adminMenu: adminMenu,
  Categories: Categories,
  addToPostSchema: addToPostSchema,
  primaryNav: primaryNav,
  postModules: postModules,
  getPostCategories: getPostCategories
};

})();

//# sourceMappingURL=telescope-tags.js.map
