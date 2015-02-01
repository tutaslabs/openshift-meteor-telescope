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
var buildEmailTemplate = Package['telescope-email'].buildEmailTemplate;
var sendEmail = Package['telescope-email'].sendEmail;
var buildAndSendEmail = Package['telescope-email'].buildAndSendEmail;
var getEmailTemplate = Package['telescope-email'].getEmailTemplate;
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var Herald = Package['kestanous:herald'].Herald;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var Handlebars = Package['cmather:handlebars-server'].Handlebars;
var OriginalHandlebars = Package['cmather:handlebars-server'].OriginalHandlebars;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var Herald, buildEmailNotification, getUnsubscribeLink, notificationEmail, __, translations;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/lib/notifications.js                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
// add new post notification callback on post submit                                                               // 1
postAfterSubmitMethodCallbacks.push(function (post) {                                                              // 2
                                                                                                                   // 3
  var adminIds = _.pluck(Meteor.users.find({'isAdmin': true}, {fields: {_id:1}}).fetch(), '_id');                  // 4
  var notifiedUserIds = _.pluck(Meteor.users.find({'profile.notifications.posts': 1}, {fields: {_id:1}}).fetch(), '_id');
                                                                                                                   // 6
  // remove post author ID from arrays                                                                             // 7
  var adminIds = _.without(adminIds, post.userId);                                                                 // 8
  var notifiedUserIds = _.without(notifiedUserIds, post.userId);                                                   // 9
                                                                                                                   // 10
  if (post.status === STATUS_PENDING && !!adminIds.length) {                                                       // 11
    // if post is pending, only notify admins                                                                      // 12
    Herald.createNotification(adminIds, {courier: 'newPendingPost', data: post});                                  // 13
  } else if (!!notifiedUserIds.length) {                                                                           // 14
    // if post is approved, notify everybody                                                                       // 15
    Herald.createNotification(notifiedUserIds, {courier: 'newPost', data: post});                                  // 16
  }                                                                                                                // 17
  return post;                                                                                                     // 18
                                                                                                                   // 19
});                                                                                                                // 20
                                                                                                                   // 21
// notify users that their pending post has been approved                                                          // 22
postApproveCallbacks.push(function (post) {                                                                        // 23
  Herald.createNotification(post.userId, {courier: 'postApproved', data: post});                                   // 24
  return post;                                                                                                     // 25
});                                                                                                                // 26
                                                                                                                   // 27
// add new comment notification callback on comment submit                                                         // 28
commentAfterSubmitMethodCallbacks.push(function (comment) {                                                        // 29
  if(Meteor.isServer && !comment.disableNotifications){                                                            // 30
                                                                                                                   // 31
    var post = Posts.findOne(comment.postId),                                                                      // 32
        notificationData = {                                                                                       // 33
          comment: _.pick(comment, '_id', 'userId', 'author', 'body'),                                             // 34
          post: _.pick(post, '_id', 'userId', 'title', 'url')                                                      // 35
        },                                                                                                         // 36
        userIdsNotified = [];                                                                                      // 37
                                                                                                                   // 38
    // 1. Notify author of post                                                                                    // 39
    // do not notify author of post if they're the ones posting the comment                                        // 40
    if (comment.userId !== post.userId) {                                                                          // 41
                                                                                                                   // 42
      Herald.createNotification(post.userId, {courier: 'newComment', data: notificationData});                     // 43
      userIdsNotified.push(post.userId);                                                                           // 44
                                                                                                                   // 45
    }                                                                                                              // 46
                                                                                                                   // 47
    // 2. Notify author of comment being replied to                                                                // 48
    if (!!comment.parentCommentId) {                                                                               // 49
                                                                                                                   // 50
      var parentComment = Comments.findOne(comment.parentCommentId);                                               // 51
                                                                                                                   // 52
      // do not notify author of parent comment if they're also post author or comment author                      // 53
      // (someone could be replying to their own comment)                                                          // 54
      if (parentComment.userId !== post.userId || parentComment.userId !== comment.userId) {                       // 55
                                                                                                                   // 56
        // add parent comment to notification data                                                                 // 57
        notificationData.parentComment = _.pick(parentComment, '_id', 'userId', 'author');                         // 58
                                                                                                                   // 59
        Herald.createNotification(parentComment.userId, {courier: 'newReply', data: notificationData});            // 60
        userIdsNotified.push(parentComment.userId);                                                                // 61
                                                                                                                   // 62
      }                                                                                                            // 63
                                                                                                                   // 64
    }                                                                                                              // 65
                                                                                                                   // 66
    // 3. Notify users subscribed to the thread                                                                    // 67
    // TODO: ideally this would be injected from the telescope-subscribe-to-posts package                          // 68
    if (!!post.subscribers) {                                                                                      // 69
                                                                                                                   // 70
      // remove userIds of users that have already been notified                                                   // 71
      // and of comment author (they could be replying in a thread they're subscribed to)                          // 72
      var subscriberIdsToNotify = _.difference(post.subscribers, userIdsNotified, [comment.userId]);               // 73
      Herald.createNotification(subscriberIdsToNotify, {courier: 'newCommentSubscribed', data: notificationData}); // 74
                                                                                                                   // 75
      userIdsNotified = userIdsNotified.concat(subscriberIdsToNotify);                                             // 76
                                                                                                                   // 77
    }                                                                                                              // 78
                                                                                                                   // 79
  }                                                                                                                // 80
                                                                                                                   // 81
  console.log(userIdsNotified)                                                                                     // 82
  console.log(comment.body)                                                                                        // 83
                                                                                                                   // 84
  return comment;                                                                                                  // 85
                                                                                                                   // 86
});                                                                                                                // 87
                                                                                                                   // 88
var emailNotifications = {                                                                                         // 89
  propertyName: 'emailNotifications',                                                                              // 90
  propertySchema: {                                                                                                // 91
    type: Boolean,                                                                                                 // 92
    optional: true,                                                                                                // 93
    defaultValue: true,                                                                                            // 94
    autoform: {                                                                                                    // 95
      group: 'notifications_fieldset',                                                                             // 96
      instructions: 'Enable email notifications for new posts and new comments (requires restart).'                // 97
    }                                                                                                              // 98
  }                                                                                                                // 99
};                                                                                                                 // 100
addToSettingsSchema.push(emailNotifications);                                                                      // 101
                                                                                                                   // 102
// make it possible to disable notifications on a per-comment basis                                                // 103
addToCommentsSchema.push(                                                                                          // 104
  {                                                                                                                // 105
    propertyName: 'disableNotifications',                                                                          // 106
    propertySchema: {                                                                                              // 107
      type: Boolean,                                                                                               // 108
      optional: true,                                                                                              // 109
      autoform: {                                                                                                  // 110
        omit: true                                                                                                 // 111
      }                                                                                                            // 112
    }                                                                                                              // 113
  }                                                                                                                // 114
);                                                                                                                 // 115
                                                                                                                   // 116
function setNotificationDefaults (user) {                                                                          // 117
  // set notifications default preferences                                                                         // 118
  user.profile.notifications = {                                                                                   // 119
    users: false,                                                                                                  // 120
    posts: false,                                                                                                  // 121
    comments: true,                                                                                                // 122
    replies: true                                                                                                  // 123
  };                                                                                                               // 124
  return user;                                                                                                     // 125
}                                                                                                                  // 126
userCreatedCallbacks.push(setNotificationDefaults);                                                                // 127
                                                                                                                   // 128
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/lib/herald.js                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
                                                                                                                   // 1
// send emails every second when in dev environment                                                                // 2
if (Meteor.absoluteUrl().indexOf('localhost') !== -1)                                                              // 3
  Herald.settings.queueTimer = 1000;                                                                               // 4
                                                                                                                   // 5
Meteor.startup(function () {                                                                                       // 6
                                                                                                                   // 7
  Herald.collection.deny({                                                                                         // 8
    update: !can.editById,                                                                                         // 9
    remove: !can.editById                                                                                          // 10
  });                                                                                                              // 11
                                                                                                                   // 12
  // disable all email notifications when "emailNotifications" is set to false                                     // 13
  Herald.settings.overrides.email = !getSetting('emailNotifications', true);                                       // 14
                                                                                                                   // 15
});                                                                                                                // 16
                                                                                                                   // 17
var commentEmail = function (userToNotify) {                                                                       // 18
  var notification = this;                                                                                         // 19
  // put in setTimeout so it doesn't hold up the rest of the method                                                // 20
  Meteor.setTimeout(function () {                                                                                  // 21
    notificationEmail = buildEmailNotification(notification);                                                      // 22
    sendEmail(getEmail(userToNotify), notificationEmail.subject, notificationEmail.html);                          // 23
  }, 1);                                                                                                           // 24
}                                                                                                                  // 25
                                                                                                                   // 26
var getCommenterProfileUrl = function (comment) {                                                                  // 27
  var user = Meteor.users.findOne(comment.userId);                                                                 // 28
  if (user) {                                                                                                      // 29
    return getProfileUrl(user);                                                                                    // 30
  } else {                                                                                                         // 31
    return getProfileUrlBySlugOrId(comment.userId);                                                                // 32
  }                                                                                                                // 33
}                                                                                                                  // 34
                                                                                                                   // 35
var getAuthor = function (comment) {                                                                               // 36
  var user = Meteor.users.findOne(comment.userId);                                                                 // 37
  if (user) {                                                                                                      // 38
    return getUserName(user);                                                                                      // 39
  } else {                                                                                                         // 40
    return comment.author;                                                                                         // 41
  }                                                                                                                // 42
}                                                                                                                  // 43
                                                                                                                   // 44
// ------------------------------------------------------------------------------------------- //                  // 45
// -----------------------------------------  Posts ------------------------------------------ //                  // 46
// ------------------------------------------------------------------------------------------- //                  // 47
                                                                                                                   // 48
Herald.addCourier('newPost', {                                                                                     // 49
  media: {                                                                                                         // 50
    email: {                                                                                                       // 51
      emailRunner: function (user) {                                                                               // 52
        var p = getPostProperties(this.data);                                                                      // 53
        var subject = p.postAuthorName+' has created a new post: '+p.postTitle;                                    // 54
        var html = buildEmailTemplate(getEmailTemplate('emailNewPost')(p));                                        // 55
        sendEmail(getEmail(user), subject, html);                                                                  // 56
      }                                                                                                            // 57
    }                                                                                                              // 58
  }                                                                                                                // 59
  // message: function (user) { return 'email template?' }                                                         // 60
});                                                                                                                // 61
                                                                                                                   // 62
Herald.addCourier('newPendingPost', {                                                                              // 63
  media: {                                                                                                         // 64
    email: {                                                                                                       // 65
      emailRunner: function (user) {                                                                               // 66
        var p = getPostProperties(this.data);                                                                      // 67
        var subject = p.postAuthorName+' has a new post pending approval: '+p.postTitle;                           // 68
        var html = buildEmailTemplate(getEmailTemplate('emailNewPendingPost')(p));                                 // 69
        sendEmail(getEmail(user), subject, html);                                                                  // 70
      }                                                                                                            // 71
    }                                                                                                              // 72
  }                                                                                                                // 73
});                                                                                                                // 74
                                                                                                                   // 75
Herald.addCourier('postApproved', {                                                                                // 76
  media: {                                                                                                         // 77
    onsite: {},                                                                                                    // 78
    email: {                                                                                                       // 79
      emailRunner: function (user) {                                                                               // 80
        var p = getPostProperties(this.data);                                                                      // 81
        var subject = 'Your post “'+p.postTitle+'” has been approved';                                             // 82
        var html = buildEmailTemplate(getEmailTemplate('emailPostApproved')(p));                                   // 83
        sendEmail(getEmail(user), subject, html);                                                                  // 84
      }                                                                                                            // 85
    }                                                                                                              // 86
  },                                                                                                               // 87
  message: {                                                                                                       // 88
    default: function (user) {                                                                                     // 89
      return Blaze.toHTML(Blaze.With(this, function () {                                                           // 90
        return Template[getTemplate('notificationPostApproved')];                                                  // 91
      }));                                                                                                         // 92
    }                                                                                                              // 93
  },                                                                                                               // 94
  transform: {                                                                                                     // 95
    postUrl: function () {                                                                                         // 96
      var p = getPostProperties(this.data);                                                                        // 97
      return p.postUrl;                                                                                            // 98
    },                                                                                                             // 99
    postTitle: function () {                                                                                       // 100
      var p = getPostProperties(this.data);                                                                        // 101
      return p.postTitle;                                                                                          // 102
    }                                                                                                              // 103
  }                                                                                                                // 104
});                                                                                                                // 105
                                                                                                                   // 106
// ------------------------------------------------------------------------------------------- //                  // 107
// ---------------------------------------- Comments ----------------------------------------- //                  // 108
// ------------------------------------------------------------------------------------------- //                  // 109
                                                                                                                   // 110
// specify how to get properties used in template from comment data                                                // 111
var commentCourierTransform = {                                                                                    // 112
  profileUrl: function () {                                                                                        // 113
    return getCommenterProfileUrl(this.data.comment);                                                              // 114
  },                                                                                                               // 115
  postCommentUrl: function () {                                                                                    // 116
    return Router.path('post_page', {_id: this.data.post._id});                                                    // 117
  },                                                                                                               // 118
  author: function () {                                                                                            // 119
    return getAuthor(this.data.comment);                                                                           // 120
  },                                                                                                               // 121
  postTitle: function () {                                                                                         // 122
    return this.data.post.title;                                                                                   // 123
  },                                                                                                               // 124
  url: function () {                                                                                               // 125
    return Router.path('comment_reply', {_id: this.parentComment._id});                                            // 126
  }                                                                                                                // 127
};                                                                                                                 // 128
                                                                                                                   // 129
Herald.addCourier('newComment', {                                                                                  // 130
  media: {                                                                                                         // 131
    onsite: {},                                                                                                    // 132
    email: {                                                                                                       // 133
      emailRunner: commentEmail                                                                                    // 134
    }                                                                                                              // 135
  },                                                                                                               // 136
  message: {                                                                                                       // 137
    default: function (user) {                                                                                     // 138
      return Blaze.toHTML(Blaze.With(this, function () {                                                           // 139
        return Template[getTemplate('notificationNewComment')];                                                    // 140
      }));                                                                                                         // 141
    }                                                                                                              // 142
  },                                                                                                               // 143
  transform: commentCourierTransform                                                                               // 144
});                                                                                                                // 145
                                                                                                                   // 146
Herald.addCourier('newReply', {                                                                                    // 147
  media: {                                                                                                         // 148
    onsite: {},                                                                                                    // 149
    email: {                                                                                                       // 150
      emailRunner: commentEmail                                                                                    // 151
    }                                                                                                              // 152
  },                                                                                                               // 153
  message: {                                                                                                       // 154
    default: function (user) {                                                                                     // 155
      return Blaze.toHTML(Blaze.With(this, function () {                                                           // 156
        return Template[getTemplate('notificationNewReply')];                                                      // 157
      }));                                                                                                         // 158
    }                                                                                                              // 159
  },                                                                                                               // 160
  transform: commentCourierTransform                                                                               // 161
});                                                                                                                // 162
                                                                                                                   // 163
Herald.addCourier('newCommentSubscribed', {                                                                        // 164
  media: {                                                                                                         // 165
    onsite: {},                                                                                                    // 166
    email: {                                                                                                       // 167
      emailRunner: commentEmail                                                                                    // 168
    }                                                                                                              // 169
  },                                                                                                               // 170
  message: {                                                                                                       // 171
    default: function (user) {                                                                                     // 172
      return Blaze.toHTML(Blaze.With(this, function () {                                                           // 173
        return Template[getTemplate('notificationNewReply')];                                                      // 174
      }));                                                                                                         // 175
    }                                                                                                              // 176
  },                                                                                                               // 177
  transform: commentCourierTransform                                                                               // 178
});                                                                                                                // 179
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/package-i18n.js                                                                //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
TAPi18n.packages["telescope-notifications"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"};
                                                                                                                   // 2
// define package's translation function (proxy to the i18next)                                                    // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                   // 4
                                                                                                                   // 5
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/lib/server/notifications-server.js                                             //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
getUnsubscribeLink = function(user){                                                                               // 1
  return getRouteUrl('unsubscribe', {hash: user.email_hash});                                                      // 2
};                                                                                                                 // 3
                                                                                                                   // 4
// given a notification, return the correct subject and html to send an email                                      // 5
buildEmailNotification = function (notification) {                                                                 // 6
                                                                                                                   // 7
  var subject,                                                                                                     // 8
      template,                                                                                                    // 9
      post = notification.data.post,                                                                               // 10
      comment = notification.data.comment;                                                                         // 11
                                                                                                                   // 12
  switch(notification.courier){                                                                                    // 13
                                                                                                                   // 14
    case 'newComment':                                                                                             // 15
      subject = notification.author()+' left a new comment on your post "' + post.title + '"';                     // 16
      template = 'emailNewComment';                                                                                // 17
      break;                                                                                                       // 18
                                                                                                                   // 19
    case 'newReply':                                                                                               // 20
      subject = notification.author()+' replied to your comment on "'+post.title+'"';                              // 21
      template = 'emailNewReply';                                                                                  // 22
      break;                                                                                                       // 23
                                                                                                                   // 24
    case 'newCommentSubscribed':                                                                                   // 25
      subject = notification.author()+' left a new comment on "' + post.title + '"';                               // 26
      template = 'emailNewComment';                                                                                // 27
      break;                                                                                                       // 28
                                                                                                                   // 29
    default:                                                                                                       // 30
      break;                                                                                                       // 31
  }                                                                                                                // 32
                                                                                                                   // 33
  var emailProperties = _.extend(notification.data, {                                                              // 34
    body: marked(comment.body),                                                                                    // 35
    profileUrl: getProfileUrlBySlugOrId(comment.userId),                                                           // 36
    postCommentUrl: getPostCommentUrl(post._id, comment._id),                                                      // 37
    postLink: getPostLink(post)                                                                                    // 38
  });                                                                                                              // 39
                                                                                                                   // 40
  // console.log(emailProperties)                                                                                  // 41
                                                                                                                   // 42
  var notificationHtml = getEmailTemplate(template)(emailProperties);                                              // 43
  var html = buildEmailTemplate(notificationHtml);                                                                 // 44
                                                                                                                   // 45
  return {                                                                                                         // 46
    subject: subject,                                                                                              // 47
    html: html                                                                                                     // 48
  }                                                                                                                // 49
};                                                                                                                 // 50
                                                                                                                   // 51
Meteor.methods({                                                                                                   // 52
  unsubscribeUser : function(hash){                                                                                // 53
    // TO-DO: currently, if you have somebody's email you can unsubscribe them                                     // 54
    // A user-specific salt should be added to the hashing method to prevent this                                  // 55
    var user = Meteor.users.findOne({email_hash: hash});                                                           // 56
    if(user){                                                                                                      // 57
      var update = Meteor.users.update(user._id, {                                                                 // 58
        $set: {                                                                                                    // 59
          'profile.notifications.users' : 0,                                                                       // 60
          'profile.notifications.posts' : 0,                                                                       // 61
          'profile.notifications.comments' : 0,                                                                    // 62
          'profile.notifications.replies' : 0                                                                      // 63
        }                                                                                                          // 64
      });                                                                                                          // 65
      return true;                                                                                                 // 66
    }                                                                                                              // 67
    return false;                                                                                                  // 68
  }                                                                                                                // 69
});                                                                                                                // 70
                                                                                                                   // 71
                                                                                                                   // 72
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/lib/server/routes.js                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Meteor.startup(function () {                                                                                       // 1
                                                                                                                   // 2
  // Notification email                                                                                            // 3
                                                                                                                   // 4
  Router.route('/email/notification/:id?', {                                                                       // 5
    name: 'notification',                                                                                          // 6
    where: 'server',                                                                                               // 7
    action: function() {                                                                                           // 8
      var notification = Herald.collection.findOne(this.params.id);                                                // 9
      var notificationContents = buildEmailNotification(notification);                                             // 10
      this.response.write(notificationContents.html);                                                              // 11
      this.response.end();                                                                                         // 12
    }                                                                                                              // 13
  });                                                                                                              // 14
                                                                                                                   // 15
});                                                                                                                // 16
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/Users/tutasg/meteor/telescope/packages/telescope-notifications/i18n/de.i18n.js //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _ = Package.underscore._,                                                                                      // 1
    package_name = "telescope-notifications",                                                                      // 2
    namespace = "telescope-notifications";                                                                         // 3
                                                                                                                   // 4
if (package_name != "project") {                                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                          // 6
}                                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                                    // 8
  TAPi18n.translations["de"] = {};                                                                                 // 9
}                                                                                                                  // 10
                                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                         // 12
  TAPi18n.translations["de"][namespace] = {};                                                                      // 13
}                                                                                                                  // 14
                                                                                                                   // 15
_.extend(TAPi18n.translations["de"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/Users/tutasg/meteor/telescope/packages/telescope-notifications/i18n/en.i18n.js //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _ = Package.underscore._,                                                                                      // 1
    package_name = "telescope-notifications",                                                                      // 2
    namespace = "telescope-notifications";                                                                         // 3
                                                                                                                   // 4
if (package_name != "project") {                                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                          // 6
}                                                                                                                  // 7
// integrate the fallback language translations                                                                    // 8
translations = {};                                                                                                 // 9
translations[namespace] = {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications","notifications_fieldset":"Notifications","emailNotifications":"Email Notifications","your_post":"Your post","has_been_approved":"has been approved"};
TAPi18n._loadLangFileObject("en", translations);                                                                   // 11
                                                                                                                   // 12
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/Users/tutasg/meteor/telescope/packages/telescope-notifications/i18n/es.i18n.js //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _ = Package.underscore._,                                                                                      // 1
    package_name = "telescope-notifications",                                                                      // 2
    namespace = "telescope-notifications";                                                                         // 3
                                                                                                                   // 4
if (package_name != "project") {                                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                          // 6
}                                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                                    // 8
  TAPi18n.translations["es"] = {};                                                                                 // 9
}                                                                                                                  // 10
                                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                         // 12
  TAPi18n.translations["es"][namespace] = {};                                                                      // 13
}                                                                                                                  // 14
                                                                                                                   // 15
_.extend(TAPi18n.translations["es"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/Users/tutasg/meteor/telescope/packages/telescope-notifications/i18n/fr.i18n.js //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _ = Package.underscore._,                                                                                      // 1
    package_name = "telescope-notifications",                                                                      // 2
    namespace = "telescope-notifications";                                                                         // 3
                                                                                                                   // 4
if (package_name != "project") {                                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                          // 6
}                                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                                    // 8
  TAPi18n.translations["fr"] = {};                                                                                 // 9
}                                                                                                                  // 10
                                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                         // 12
  TAPi18n.translations["fr"][namespace] = {};                                                                      // 13
}                                                                                                                  // 14
                                                                                                                   // 15
_.extend(TAPi18n.translations["fr"][namespace], {"left_a_new_comment_on":"a laissé un nouveau commentaire sur","has_replied_to_your_comment_on":"a répondu à","mark_as_read":"Marquer comme lu","no_notifications":"Aucune notification","you_have_been_unsubscribed_from_all_notifications":"Vous avez été désabonné de toutes les notifications.","user_not_found":"Utilisateur non trouvé","1_notification":"1 notification","notifications":"notifications","emailNotifications":"Notifications par Email","your_post":"Votre post","has_been_approved":"a été approuvé"});
                                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/Users/tutasg/meteor/telescope/packages/telescope-notifications/i18n/it.i18n.js //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _ = Package.underscore._,                                                                                      // 1
    package_name = "telescope-notifications",                                                                      // 2
    namespace = "telescope-notifications";                                                                         // 3
                                                                                                                   // 4
if (package_name != "project") {                                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                          // 6
}                                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                                    // 8
  TAPi18n.translations["it"] = {};                                                                                 // 9
}                                                                                                                  // 10
                                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                         // 12
  TAPi18n.translations["it"][namespace] = {};                                                                      // 13
}                                                                                                                  // 14
                                                                                                                   // 15
_.extend(TAPi18n.translations["it"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-notifications/Users/tutasg/meteor/telescope/packages/telescope-notifications/i18n/zh-CN.i18n //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _ = Package.underscore._,                                                                                      // 1
    package_name = "telescope-notifications",                                                                      // 2
    namespace = "telescope-notifications";                                                                         // 3
                                                                                                                   // 4
if (package_name != "project") {                                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                          // 6
}                                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                                 // 8
  TAPi18n.translations["zh-CN"] = {};                                                                              // 9
}                                                                                                                  // 10
                                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                                      // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                                   // 13
}                                                                                                                  // 14
                                                                                                                   // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-notifications'] = {
  Herald: Herald,
  buildEmailNotification: buildEmailNotification,
  getUnsubscribeLink: getUnsubscribeLink
};

})();

//# sourceMappingURL=telescope-notifications.js.map
