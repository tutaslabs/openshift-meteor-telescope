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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var __, InviteSchema, Invites, translations;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/package-i18n.js                                                                       //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
TAPi18n.packages["telescope-invites"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"}; // 1
                                                                                                                    // 2
// define package's translation function (proxy to the i18next)                                                     // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                    // 4
                                                                                                                    // 5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/lib/invites.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
InviteSchema = new SimpleSchema({                                                                                   // 1
  _id: {                                                                                                            // 2
    type: String,                                                                                                   // 3
    optional: true                                                                                                  // 4
  },                                                                                                                // 5
  invitingUserId: {                                                                                                 // 6
    type: String,                                                                                                   // 7
    optional: true                                                                                                  // 8
  },                                                                                                                // 9
  invitedUserEmail: {                                                                                               // 10
    type: String,                                                                                                   // 11
    regEx: SimpleSchema.RegEx.Email                                                                                 // 12
  },                                                                                                                // 13
  accepted: {                                                                                                       // 14
    type: Boolean,                                                                                                  // 15
    optional: true                                                                                                  // 16
  }                                                                                                                 // 17
});                                                                                                                 // 18
                                                                                                                    // 19
Invites = new Meteor.Collection("invites");                                                                         // 20
Invites.attachSchema(InviteSchema);                                                                                 // 21
                                                                                                                    // 22
// invites are managed through Meteor method                                                                        // 23
                                                                                                                    // 24
Invites.deny({                                                                                                      // 25
  insert: function(){ return true; },                                                                               // 26
  update: function(){ return true; },                                                                               // 27
  remove: function(){ return true; }                                                                                // 28
});                                                                                                                 // 29
                                                                                                                    // 30
userProfileEdit.push({                                                                                              // 31
  template: 'userInvites',                                                                                          // 32
  order: 2                                                                                                          // 33
});                                                                                                                 // 34
                                                                                                                    // 35
 function setStartingInvites (user) {                                                                               // 36
  // give new users a few invites (default to 3)                                                                    // 37
  user.inviteCount = getSetting('startInvitesCount', 3);                                                            // 38
  return user;                                                                                                      // 39
}                                                                                                                   // 40
userCreatedCallbacks.push(setStartingInvites);                                                                      // 41
                                                                                                                    // 42
function checkIfInvited (user) {                                                                                    // 43
  // if the new user has been invited                                                                               // 44
  // set her status accordingly and update invitation info                                                          // 45
  if(invitesEnabled() && getEmail(user)){                                                                           // 46
    var invite = Invites.findOne({ invitedUserEmail : getEmail(user) });                                            // 47
    if(invite){                                                                                                     // 48
      var invitedBy = Meteor.users.findOne({ _id : invite.invitingUserId });                                        // 49
                                                                                                                    // 50
      user = _.extend(user, {                                                                                       // 51
        isInvited: true,                                                                                            // 52
        invitedBy: invitedBy._id,                                                                                   // 53
        invitedByName: getDisplayName(invitedBy)                                                                    // 54
      });                                                                                                           // 55
                                                                                                                    // 56
      Invites.update(invite._id, {$set : {                                                                          // 57
        accepted : true                                                                                             // 58
      }});                                                                                                          // 59
    }                                                                                                               // 60
  }                                                                                                                 // 61
  return user;                                                                                                      // 62
}                                                                                                                   // 63
userCreatedCallbacks.push(checkIfInvited);                                                                          // 64
                                                                                                                    // 65
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/lib/server/invites.js                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
Meteor.methods({                                                                                                    // 1
                                                                                                                    // 2
  inviteUser: function(invitation){                                                                                 // 3
                                                                                                                    // 4
    // invite user returns the following hash                                                                       // 5
    // { newUser : true|false }                                                                                     // 6
    // newUser is true if the person being invited is not on the site yet                                           // 7
                                                                                                                    // 8
    // invitation can either contain userId or an email address :                                                   // 9
    // { invitedUserEmail : 'bob@gmail.com' } or { userId : 'user-id' }                                             // 10
                                                                                                                    // 11
    check(invitation, Match.OneOf(                                                                                  // 12
      { invitedUserEmail : String },                                                                                // 13
      { userId : String }                                                                                           // 14
    ));                                                                                                             // 15
                                                                                                                    // 16
    var user = invitation.invitedUserEmail ?                                                                        // 17
          Meteor.users.findOne({ emails : { $elemMatch: { address: invitation.invitedUserEmail } } }) :             // 18
          Meteor.users.findOne({ _id : invitation.userId }),                                                        // 19
        userEmail = invitation.invitedUserEmail ? invitation.invitedUserEmail :                                     // 20
          getEmail(user),                                                                                           // 21
        currentUser = Meteor.user(),                                                                                // 22
        currentUserCanInvite = currentUserIsAdmin ||                                                                // 23
          (currentUser.inviteCount > 0 && can.invite(currentUser)),                                                 // 24
        currentUserIsAdmin = isAdmin(currentUser);                                                                  // 25
                                                                                                                    // 26
    // check if the person is already invited                                                                       // 27
    if(user && can.invite(user)){                                                                                   // 28
      throw new Meteor.Error(403, "This person is already invited.");                                               // 29
    } else {                                                                                                        // 30
      if (!currentUserCanInvite){                                                                                   // 31
        throw new Meteor.Error(701, "You can't invite this user, sorry.");                                          // 32
      }                                                                                                             // 33
                                                                                                                    // 34
      // don't allow duplicate multpile invite for the same person                                                  // 35
      var existingInvite = Invites.findOne({ invitedUserEmail : userEmail });                                       // 36
                                                                                                                    // 37
      if (existingInvite) {                                                                                         // 38
        throw new Meteor.Error(403, "Somebody has already invited this person.");                                   // 39
      }                                                                                                             // 40
                                                                                                                    // 41
      // create an invite                                                                                           // 42
      // consider invite accepted if the invited person has an account already                                      // 43
      Invites.insert({                                                                                              // 44
        invitingUserId: Meteor.userId(),                                                                            // 45
        invitedUserEmail: userEmail,                                                                                // 46
        accepted: typeof user !== "undefined"                                                                       // 47
      });                                                                                                           // 48
                                                                                                                    // 49
      // update invinting user                                                                                      // 50
      Meteor.users.update(Meteor.userId(), {$inc:{inviteCount: -1}, $inc:{invitedCount: 1}});                       // 51
                                                                                                                    // 52
      if(user){                                                                                                     // 53
        // update invited user                                                                                      // 54
        Meteor.users.update(user._id, {$set: {                                                                      // 55
          isInvited: true,                                                                                          // 56
          invitedBy: Meteor.userId(),                                                                               // 57
          invitedByName: getDisplayName(currentUser)                                                                // 58
        }});                                                                                                        // 59
      }                                                                                                             // 60
                                                                                                                    // 61
      var communityName = getSetting('title','Telescope'),                                                          // 62
          emailSubject = 'You are invited to try '+communityName,                                                   // 63
          emailProperties = {                                                                                       // 64
            newUser : typeof user === 'undefined',                                                                  // 65
            communityName : communityName,                                                                          // 66
            actionLink : user ? getSigninUrl() : getSignupUrl(),                                                    // 67
            invitedBy : getDisplayName(currentUser),                                                                // 68
            profileUrl : getProfileUrl(currentUser)                                                                 // 69
          };                                                                                                        // 70
                                                                                                                    // 71
      Meteor.setTimeout(function () {                                                                               // 72
        buildAndSendEmail(userEmail, emailSubject, getTemplate('emailInvite'), emailProperties);                    // 73
      }, 1);                                                                                                        // 74
                                                                                                                    // 75
    }                                                                                                               // 76
                                                                                                                    // 77
    return {                                                                                                        // 78
      newUser : typeof user === 'undefined'                                                                         // 79
    };                                                                                                              // 80
  }                                                                                                                 // 81
});                                                                                                                 // 82
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/lib/server/publications.js                                                            //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
Meteor.publish('invites', function (userId) {                                                                       // 1
  var invites = Invites.find({invitingUserId: userId})                                                              // 2
  return (this.userId === userId || isAdmin(Meteor.user())) ? invites : []                                          // 3
});                                                                                                                 // 4
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/Users/tutasg/meteor/telescope/packages/telescope-invites/i18n/de.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-invites",                                                                             // 2
    namespace = "telescope-invites";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                                     // 8
  TAPi18n.translations["de"] = {};                                                                                  // 9
}                                                                                                                   // 10
                                                                                                                    // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                          // 12
  TAPi18n.translations["de"][namespace] = {};                                                                       // 13
}                                                                                                                   // 14
                                                                                                                    // 15
_.extend(TAPi18n.translations["de"][namespace], {"translation_key":"translation string"});                          // 16
                                                                                                                    // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/Users/tutasg/meteor/telescope/packages/telescope-invites/i18n/en.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-invites",                                                                             // 2
    namespace = "telescope-invites";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
// integrate the fallback language translations                                                                     // 8
translations = {};                                                                                                  // 9
translations[namespace] = {"translation_key":"translation string"};                                                 // 10
TAPi18n._loadLangFileObject("en", translations);                                                                    // 11
                                                                                                                    // 12
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/Users/tutasg/meteor/telescope/packages/telescope-invites/i18n/es.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-invites",                                                                             // 2
    namespace = "telescope-invites";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                                     // 8
  TAPi18n.translations["es"] = {};                                                                                  // 9
}                                                                                                                   // 10
                                                                                                                    // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                          // 12
  TAPi18n.translations["es"][namespace] = {};                                                                       // 13
}                                                                                                                   // 14
                                                                                                                    // 15
_.extend(TAPi18n.translations["es"][namespace], {"translation_key":"translation string"});                          // 16
                                                                                                                    // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/Users/tutasg/meteor/telescope/packages/telescope-invites/i18n/fr.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-invites",                                                                             // 2
    namespace = "telescope-invites";                                                                                // 3
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
_.extend(TAPi18n.translations["fr"][namespace], {"translation_key":"translation string"});                          // 16
                                                                                                                    // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/Users/tutasg/meteor/telescope/packages/telescope-invites/i18n/it.i18n.js              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-invites",                                                                             // 2
    namespace = "telescope-invites";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                                     // 8
  TAPi18n.translations["it"] = {};                                                                                  // 9
}                                                                                                                   // 10
                                                                                                                    // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                          // 12
  TAPi18n.translations["it"][namespace] = {};                                                                       // 13
}                                                                                                                   // 14
                                                                                                                    // 15
_.extend(TAPi18n.translations["it"][namespace], {"translation_key":"translation string"});                          // 16
                                                                                                                    // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/telescope-invites/Users/tutasg/meteor/telescope/packages/telescope-invites/i18n/zh-CN.i18n.js           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var _ = Package.underscore._,                                                                                       // 1
    package_name = "telescope-invites",                                                                             // 2
    namespace = "telescope-invites";                                                                                // 3
                                                                                                                    // 4
if (package_name != "project") {                                                                                    // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                           // 6
}                                                                                                                   // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                                  // 8
  TAPi18n.translations["zh-CN"] = {};                                                                               // 9
}                                                                                                                   // 10
                                                                                                                    // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                                       // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                                    // 13
}                                                                                                                   // 14
                                                                                                                    // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"translation_key":"translation string"});                       // 16
                                                                                                                    // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-invites'] = {};

})();

//# sourceMappingURL=telescope-invites.js.map
