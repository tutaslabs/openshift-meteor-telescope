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
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var MailChimp = Package['miro:mailchimp'].MailChimp;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var SyncedCron = Package['percolatestudio:synced-cron'].SyncedCron;
var Handlebars = Package['cmather:handlebars-server'].Handlebars;
var OriginalHandlebars = Package['cmather:handlebars-server'].OriginalHandlebars;
var Iron = Package['iron:core'].Iron;
var Async = Package['meteorhacks:async'].Async;

/* Package-scope variables */
var resetNewsletterSchedule, __, campaignSchema, Campaigns, defaultFrequency, defaultPosts, getCampaignPosts, buildCampaign, scheduleNextCampaign, defaultTime, scheduleCampaign, addToMailChimpList, Handlebars, translations;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/package-i18n.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
TAPi18n.packages["telescope-newsletter"] = {"translation_function_name":"__","helper_name":"_","namespace":"project"}; // 1
                                                                                                                       // 2
// define package's translation function (proxy to the i18next)                                                        // 3
__ = TAPi18n._getPackageI18nextProxy("project");                                                                       // 4
                                                                                                                       // 5
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/newsletter.js                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
campaignSchema = new SimpleSchema({                                                                                    // 1
 _id: {                                                                                                                // 2
    type: String,                                                                                                      // 3
    optional: true                                                                                                     // 4
  },                                                                                                                   // 5
  createdAt: {                                                                                                         // 6
    type: Date,                                                                                                        // 7
    optional: true                                                                                                     // 8
  },                                                                                                                   // 9
  sentAt: {                                                                                                            // 10
    type: String,                                                                                                      // 11
    optional: true                                                                                                     // 12
  },                                                                                                                   // 13
  status: {                                                                                                            // 14
    type: String,                                                                                                      // 15
    optional: true                                                                                                     // 16
  },                                                                                                                   // 17
  posts: {                                                                                                             // 18
    type: [String],                                                                                                    // 19
    optional: true                                                                                                     // 20
  },                                                                                                                   // 21
  webHits: {                                                                                                           // 22
    type: Number,                                                                                                      // 23
    optional: true                                                                                                     // 24
  },                                                                                                                   // 25
});                                                                                                                    // 26
                                                                                                                       // 27
Campaigns = new Meteor.Collection("campaigns", {                                                                       // 28
  schema: campaignSchema                                                                                               // 29
});                                                                                                                    // 30
                                                                                                                       // 31
addToPostSchema.push(                                                                                                  // 32
  {                                                                                                                    // 33
    propertyName: 'scheduledAt',                                                                                       // 34
    propertySchema: {                                                                                                  // 35
      type: Date,                                                                                                      // 36
      optional: true,                                                                                                  // 37
      autoform: {                                                                                                      // 38
        omit: true                                                                                                     // 39
      }                                                                                                                // 40
    }                                                                                                                  // 41
  }                                                                                                                    // 42
);                                                                                                                     // 43
                                                                                                                       // 44
// Settings                                                                                                            // 45
                                                                                                                       // 46
var enableNewsletter = {                                                                                               // 47
  propertyName: 'enableNewsletter',                                                                                    // 48
  propertySchema: {                                                                                                    // 49
    type: Boolean,                                                                                                     // 50
    optional: true,                                                                                                    // 51
    autoform: {                                                                                                        // 52
      group: 'newsletter',                                                                                             // 53
      instructions: 'Enable newsletter (requires restart).'                                                            // 54
    }                                                                                                                  // 55
  }                                                                                                                    // 56
}                                                                                                                      // 57
addToSettingsSchema.push(enableNewsletter);                                                                            // 58
                                                                                                                       // 59
var showBanner = {                                                                                                     // 60
  propertyName: 'showBanner',                                                                                          // 61
  propertySchema: {                                                                                                    // 62
    type: Boolean,                                                                                                     // 63
    optional: true,                                                                                                    // 64
    label: 'Newsletter banner',                                                                                        // 65
    autoform: {                                                                                                        // 66
      group: 'newsletter',                                                                                             // 67
      instructions: 'Show newsletter sign-up form on the front page.'                                                  // 68
    }                                                                                                                  // 69
  }                                                                                                                    // 70
}                                                                                                                      // 71
addToSettingsSchema.push(showBanner);                                                                                  // 72
                                                                                                                       // 73
var mailChimpAPIKey = {                                                                                                // 74
  propertyName: 'mailChimpAPIKey',                                                                                     // 75
  propertySchema: {                                                                                                    // 76
    type: String,                                                                                                      // 77
    optional: true,                                                                                                    // 78
    autoform: {                                                                                                        // 79
      group: 'newsletter',                                                                                             // 80
      private: true                                                                                                    // 81
    }                                                                                                                  // 82
  }                                                                                                                    // 83
}                                                                                                                      // 84
addToSettingsSchema.push(mailChimpAPIKey);                                                                             // 85
                                                                                                                       // 86
var mailChimpListId = {                                                                                                // 87
  propertyName: 'mailChimpListId',                                                                                     // 88
  propertySchema: {                                                                                                    // 89
    type: String,                                                                                                      // 90
    optional: true,                                                                                                    // 91
    autoform: {                                                                                                        // 92
      group: 'newsletter',                                                                                             // 93
      instructions: 'The ID of the list you want to send to.',                                                         // 94
      private: true                                                                                                    // 95
    }                                                                                                                  // 96
  }                                                                                                                    // 97
}                                                                                                                      // 98
addToSettingsSchema.push(mailChimpListId);                                                                             // 99
                                                                                                                       // 100
var postsPerNewsletter = {                                                                                             // 101
  propertyName: 'postsPerNewsletter',                                                                                  // 102
  propertySchema: {                                                                                                    // 103
    type: Number,                                                                                                      // 104
    optional: true,                                                                                                    // 105
    autoform: {                                                                                                        // 106
      group: 'newsletter'                                                                                              // 107
    }                                                                                                                  // 108
  }                                                                                                                    // 109
}                                                                                                                      // 110
addToSettingsSchema.push(postsPerNewsletter);                                                                          // 111
                                                                                                                       // 112
var newsletterFrequency = {                                                                                            // 113
  propertyName: 'newsletterFrequency',                                                                                 // 114
  propertySchema: {                                                                                                    // 115
    type: Number,                                                                                                      // 116
    optional: true,                                                                                                    // 117
    autoform: {                                                                                                        // 118
      group: 'newsletter',                                                                                             // 119
      instructions: 'Defaults to once a week. Changes require restarting your app to take effect.',                    // 120
      options: [                                                                                                       // 121
        {                                                                                                              // 122
          value: 1,                                                                                                    // 123
          label: 'Every Day'                                                                                           // 124
        },                                                                                                             // 125
        {                                                                                                              // 126
          value: 2,                                                                                                    // 127
          label: 'Mondays, Wednesdays, Fridays'                                                                        // 128
        },                                                                                                             // 129
        {                                                                                                              // 130
          value: 3,                                                                                                    // 131
          label: 'Mondays & Thursdays'                                                                                 // 132
        },                                                                                                             // 133
        {                                                                                                              // 134
          value: 7,                                                                                                    // 135
          label: 'Once a week (Mondays)'                                                                               // 136
        }                                                                                                              // 137
      ]                                                                                                                // 138
    }                                                                                                                  // 139
  }                                                                                                                    // 140
}                                                                                                                      // 141
addToSettingsSchema.push(newsletterFrequency);                                                                         // 142
                                                                                                                       // 143
var newsletterTime = {                                                                                                 // 144
  propertyName: 'newsletterTime',                                                                                      // 145
  propertySchema: {                                                                                                    // 146
    type: String,                                                                                                      // 147
    optional: true,                                                                                                    // 148
    defaultValue: '00:00',                                                                                             // 149
    autoform: {                                                                                                        // 150
      group: 'newsletter',                                                                                             // 151
      instructions: 'Defaults to 00:00/12:00 AM. Time to send out newsletter if enabled.',                             // 152
      type: 'time'                                                                                                     // 153
    }                                                                                                                  // 154
  }                                                                                                                    // 155
}                                                                                                                      // 156
addToSettingsSchema.push(newsletterTime);                                                                              // 157
                                                                                                                       // 158
var autoSubscribe = {                                                                                                  // 159
  propertyName: 'autoSubscribe',                                                                                       // 160
  propertySchema: {                                                                                                    // 161
    type: Boolean,                                                                                                     // 162
    optional: true,                                                                                                    // 163
    autoform: {                                                                                                        // 164
      group: 'newsletter',                                                                                             // 165
      instructions: 'Automatically subscribe new users on sign-up.'                                                    // 166
    }                                                                                                                  // 167
  }                                                                                                                    // 168
}                                                                                                                      // 169
addToSettingsSchema.push(autoSubscribe);                                                                               // 170
                                                                                                                       // 171
// create new "campaign" lens for all posts from the past X days that haven't been scheduled yet                       // 172
viewParameters.campaign = function (terms) {                                                                           // 173
  return {                                                                                                             // 174
    find: {                                                                                                            // 175
      scheduledAt: {$exists: false},                                                                                   // 176
      postedAt: {                                                                                                      // 177
        $gte: terms.after                                                                                              // 178
      }                                                                                                                // 179
    },                                                                                                                 // 180
    options: {sort: {sticky: -1, score: -1}}                                                                           // 181
  };                                                                                                                   // 182
}                                                                                                                      // 183
                                                                                                                       // 184
heroModules.push({                                                                                                     // 185
  template: 'newsletterBanner'                                                                                         // 186
});                                                                                                                    // 187
                                                                                                                       // 188
 function subscribeUserOnCreation (user) {                                                                             // 189
  if (!!getSetting('autoSubscribe') && !!getEmail(user)) {                                                             // 190
    addToMailChimpList(user, false, function (error, result) {                                                         // 191
      console.log(error)                                                                                               // 192
      console.log(result)                                                                                              // 193
    });                                                                                                                // 194
  }                                                                                                                    // 195
  return user;                                                                                                         // 196
}                                                                                                                      // 197
userCreatedCallbacks.push(subscribeUserOnCreation);                                                                    // 198
                                                                                                                       // 199
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/campaign.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
defaultFrequency = 7;                                                                                                  // 1
defaultPosts = 5;                                                                                                      // 2
                                                                                                                       // 3
getCampaignPosts = function (postsCount) {                                                                             // 4
                                                                                                                       // 5
  var newsletterFrequency = getSetting('newsletterFrequency', defaultFrequency);                                       // 6
                                                                                                                       // 7
  // look for last scheduled campaign in the database                                                                  // 8
  var lastCampaign = SyncedCron._collection.findOne({name: 'Schedule newsletter'}, {sort: {finishedAt: -1}, limit: 1});
                                                                                                                       // 10
  // if there is a last campaign use its date, else default to posts from the last 7 days                              // 11
  var lastWeek = moment().subtract(7, 'days').toDate();                                                                // 12
  var after = (typeof lastCampaign != 'undefined') ? lastCampaign.finishedAt : lastWeek                                // 13
                                                                                                                       // 14
  var params = getPostsParameters({                                                                                    // 15
    view: 'campaign',                                                                                                  // 16
    limit: postsCount,                                                                                                 // 17
    after: after                                                                                                       // 18
  });                                                                                                                  // 19
  return Posts.find(params.find, params.options).fetch();                                                              // 20
}                                                                                                                      // 21
                                                                                                                       // 22
buildCampaign = function (postsArray) {                                                                                // 23
  var postsHTML = '', subject = '';                                                                                    // 24
                                                                                                                       // 25
  // 1. Iterate through posts and pass each of them through a handlebars template                                      // 26
  postsArray.forEach(function (post, index) {                                                                          // 27
    if(index > 0)                                                                                                      // 28
      subject += ', ';                                                                                                 // 29
                                                                                                                       // 30
    subject += post.title;                                                                                             // 31
                                                                                                                       // 32
    var postUser = Meteor.users.findOne(post.userId);                                                                  // 33
                                                                                                                       // 34
    // the naked post object as stored in the database is missing a few properties, so let's add them                  // 35
    var properties = _.extend(post, {                                                                                  // 36
      authorName: getAuthorName(post),                                                                                 // 37
      postLink: getPostLink(post),                                                                                     // 38
      profileUrl: getProfileUrl(postUser),                                                                             // 39
      postPageLink: getPostPageUrl(post),                                                                              // 40
      date: moment(post.postedAt).format("MMMM D YYYY")                                                                // 41
    });                                                                                                                // 42
                                                                                                                       // 43
    if (post.body)                                                                                                     // 44
      properties.body = marked(trimWords(post.body, 20)).replace('<p>', '').replace('</p>', ''); // remove p tags      // 45
                                                                                                                       // 46
    if(post.url)                                                                                                       // 47
      properties.domain = getDomain(post.url)                                                                          // 48
                                                                                                                       // 49
    postsHTML += getEmailTemplate('emailPostItem')(properties);                                                        // 50
  });                                                                                                                  // 51
                                                                                                                       // 52
  // 2. Wrap posts HTML in digest template                                                                             // 53
  var digestHTML = getEmailTemplate('emailDigest')({                                                                   // 54
    siteName: getSetting('title'),                                                                                     // 55
    date: moment().format("dddd, MMMM Do YYYY"),                                                                       // 56
    content: postsHTML                                                                                                 // 57
  });                                                                                                                  // 58
                                                                                                                       // 59
  // 3. wrap digest HTML in email wrapper tempalte                                                                     // 60
  var emailHTML = buildEmailTemplate(digestHTML);                                                                      // 61
                                                                                                                       // 62
  return {                                                                                                             // 63
    postIds: _.pluck(postsArray, '_id'),                                                                               // 64
    subject: trimWords(subject, 15),                                                                                   // 65
    html: emailHTML                                                                                                    // 66
  }                                                                                                                    // 67
}                                                                                                                      // 68
                                                                                                                       // 69
scheduleNextCampaign = function (isTest) {                                                                             // 70
  var isTest = typeof isTest === 'undefined' ? false : isTest;                                                         // 71
  var posts = getCampaignPosts(getSetting('postsPerNewsletter', defaultPosts));                                        // 72
  if(!!posts.length){                                                                                                  // 73
    return scheduleCampaign(buildCampaign(posts), isTest);                                                             // 74
  }else{                                                                                                               // 75
    var result = 'No posts to schedule today…';                                                                        // 76
    return result                                                                                                      // 77
  }                                                                                                                    // 78
}                                                                                                                      // 79
                                                                                                                       // 80
Meteor.methods({                                                                                                       // 81
  testCampaign: function () {                                                                                          // 82
    if(isAdminById(this.userId))                                                                                       // 83
      return scheduleNextCampaign(true);                                                                               // 84
  }                                                                                                                    // 85
});                                                                                                                    // 86
                                                                                                                       // 87
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/cron.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
SyncedCron.options = {                                                                                                 // 1
  log: false,                                                                                                          // 2
  collectionName: 'cronHistory',                                                                                       // 3
  utc: false,                                                                                                          // 4
  collectionTTL: 172800                                                                                                // 5
}                                                                                                                      // 6
                                                                                                                       // 7
defaultFrequency = 7; // once a week                                                                                   // 8
defaultTime = '00:00';                                                                                                 // 9
                                                                                                                       // 10
var getSchedule = function (parser) {                                                                                  // 11
  var frequency = getSetting('newsletterFrequency', defaultFrequency);                                                 // 12
  var recur = parser.recur();                                                                                          // 13
  var schedule;                                                                                                        // 14
  switch (frequency) {                                                                                                 // 15
    case 1: // every day                                                                                               // 16
      // sched = {schedules: [{dw: [1,2,3,4,5,6,0]}]};                                                                 // 17
      schedule = recur.on(1,2,3,4,5,6,0).dayOfWeek();                                                                  // 18
                                                                                                                       // 19
    case 2: // Mondays, Wednesdays, Fridays                                                                            // 20
      // sched = {schedules: [{dw: [2,4,6]}]};                                                                         // 21
      schedule = recur.on(2,4,6).dayOfWeek();                                                                          // 22
                                                                                                                       // 23
    case 3: // Mondays, Thursdays                                                                                      // 24
      // sched = {schedules: [{dw: [2,5]}]};                                                                           // 25
      schedule = recur.on(2,5).dayOfWeek();                                                                            // 26
                                                                                                                       // 27
    case 7: // Once a week (Mondays)                                                                                   // 28
      // sched = {schedules: [{dw: [2]}]};                                                                             // 29
      schedule = recur.on(2).dayOfWeek();                                                                              // 30
                                                                                                                       // 31
    default: // Once a week (Mondays)                                                                                  // 32
      schedule = recur.on(2).dayOfWeek();                                                                              // 33
  }                                                                                                                    // 34
  return schedule.on(getSetting('newsletterTime', defaultTime)).time();                                                // 35
}                                                                                                                      // 36
                                                                                                                       // 37
Meteor.methods({                                                                                                       // 38
  getNextJob: function () {                                                                                            // 39
    var nextJob = SyncedCron.nextScheduledAtDate('scheduleNewsletter');                                                // 40
    console.log(nextJob);                                                                                              // 41
    return nextJob;                                                                                                    // 42
  }                                                                                                                    // 43
});                                                                                                                    // 44
                                                                                                                       // 45
var addJob = function () {                                                                                             // 46
  SyncedCron.add({                                                                                                     // 47
    name: 'scheduleNewsletter',                                                                                        // 48
    schedule: function(parser) {                                                                                       // 49
      // parser is a later.parse object                                                                                // 50
      return getSchedule(parser);                                                                                      // 51
    },                                                                                                                 // 52
    job: function() {                                                                                                  // 53
      scheduleNextCampaign();                                                                                          // 54
    }                                                                                                                  // 55
  });                                                                                                                  // 56
}                                                                                                                      // 57
Meteor.startup(function () {                                                                                           // 58
  if (getSetting('enableNewsletter', false)) {                                                                         // 59
    addJob();                                                                                                          // 60
  }                                                                                                                    // 61
});                                                                                                                    // 62
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/mailchimp.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var htmlToText = Npm.require('html-to-text');                                                                          // 1
                                                                                                                       // 2
scheduleCampaign = function (campaign, isTest) {                                                                       // 3
  var isTest = typeof isTest === 'undefined' ? false : isTest;                                                         // 4
                                                                                                                       // 5
  var apiKey = getSetting('mailChimpAPIKey');                                                                          // 6
  var listId = getSetting('mailChimpListId');                                                                          // 7
                                                                                                                       // 8
  if(!!apiKey && !!listId){                                                                                            // 9
                                                                                                                       // 10
    try {                                                                                                              // 11
                                                                                                                       // 12
      var api = new MailChimp(apiKey);                                                                                 // 13
      var text = htmlToText.fromString(campaign.html, {wordwrap: 130});                                                // 14
      var defaultEmail = getSetting('defaultEmail');                                                                   // 15
      var campaignOptions = {                                                                                          // 16
        type: 'regular',                                                                                               // 17
        options: {                                                                                                     // 18
          list_id: listId,                                                                                             // 19
          subject: campaign.subject,                                                                                   // 20
          from_email: defaultEmail,                                                                                    // 21
          from_name: getSetting('title')+ ' Top Posts',                                                                // 22
        },                                                                                                             // 23
        content: {                                                                                                     // 24
          html: campaign.html,                                                                                         // 25
          text: text                                                                                                   // 26
        }                                                                                                              // 27
      };                                                                                                               // 28
                                                                                                                       // 29
      console.log( '// Creating campaign…');                                                                           // 30
                                                                                                                       // 31
      // create campaign                                                                                               // 32
      var campaign = api.call( 'campaigns', 'create', campaignOptions);                                                // 33
                                                                                                                       // 34
      console.log( '// Campaign created');                                                                             // 35
      // console.log(campaign)                                                                                         // 36
                                                                                                                       // 37
      var scheduledTime = moment().zone(0).add(1, 'hours').format("YYYY-MM-DD HH:mm:ss");                              // 38
                                                                                                                       // 39
      var scheduleOptions = {                                                                                          // 40
        cid: campaign.id,                                                                                              // 41
        schedule_time: scheduledTime                                                                                   // 42
      };                                                                                                               // 43
                                                                                                                       // 44
      // schedule campaign                                                                                             // 45
      var schedule = api.call('campaigns', 'schedule', scheduleOptions);                                               // 46
                                                                                                                       // 47
      console.log('// Campaign scheduled for '+scheduledTime);                                                         // 48
      // console.log(schedule)                                                                                         // 49
                                                                                                                       // 50
      // if this is not a test, mark posts as sent                                                                     // 51
      if (!isTest)                                                                                                     // 52
        Posts.update({_id: {$in: campaign.postIds}}, {$set: {scheduledAt: new Date()}}, {multi: true})                 // 53
                                                                                                                       // 54
      // send confirmation email                                                                                       // 55
      var confirmationHtml = getEmailTemplate('emailDigestConfirmation')({                                             // 56
        time: scheduledTime,                                                                                           // 57
        newsletterLink: campaign.archive_url,                                                                          // 58
        subject: campaign.subject                                                                                      // 59
      });                                                                                                              // 60
      sendEmail(defaultEmail, 'Newsletter scheduled', buildEmailTemplate(confirmationHtml));                           // 61
                                                                                                                       // 62
    } catch (error) {                                                                                                  // 63
      console.log(error);                                                                                              // 64
    }                                                                                                                  // 65
    return campaign.subject;                                                                                           // 66
  }                                                                                                                    // 67
}                                                                                                                      // 68
                                                                                                                       // 69
addToMailChimpList = function(userOrEmail, confirm, done){                                                             // 70
                                                                                                                       // 71
  var user, email;                                                                                                     // 72
                                                                                                                       // 73
  var confirm = (typeof confirm === 'undefined') ? false : confirm // default to no confirmation                       // 74
                                                                                                                       // 75
  // not sure if it's really necessary that the function take both user and email?                                     // 76
  if (typeof userOrEmail == "string") {                                                                                // 77
    user = null;                                                                                                       // 78
    email = userOrEmail;                                                                                               // 79
  } else if (typeof userOrEmail == "object") {                                                                         // 80
    user = userOrEmail;                                                                                                // 81
    email = getEmail(user);                                                                                            // 82
    if (!email)                                                                                                        // 83
      throw 'User must have an email address';                                                                         // 84
  }                                                                                                                    // 85
                                                                                                                       // 86
  var apiKey = getSetting('mailChimpAPIKey');                                                                          // 87
  var listId = getSetting('mailChimpListId');                                                                          // 88
                                                                                                                       // 89
  // add a user to a MailChimp list.                                                                                   // 90
  // called when a new user is created, or when an existing user fills in their email                                  // 91
  if(!!apiKey && !!listId){                                                                                            // 92
                                                                                                                       // 93
    try {                                                                                                              // 94
                                                                                                                       // 95
      console.log('// Adding "'+email+'" to MailChimp list…');                                                         // 96
                                                                                                                       // 97
      var api = new MailChimp(apiKey);                                                                                 // 98
      var subscribeOptions = {                                                                                         // 99
        id: listId,                                                                                                    // 100
        email: {"email": email},                                                                                       // 101
        double_optin: confirm                                                                                          // 102
      };                                                                                                               // 103
                                                                                                                       // 104
      // subscribe user                                                                                                // 105
      var subscribe = api.call('lists', 'subscribe', subscribeOptions);                                                // 106
                                                                                                                       // 107
      // mark user as subscribed                                                                                       // 108
      if(!!user)                                                                                                       // 109
        setUserSetting('subscribedToNewsletter', true, user);                                                          // 110
                                                                                                                       // 111
      console.log("// User subscribed");                                                                               // 112
                                                                                                                       // 113
      return subscribe;                                                                                                // 114
                                                                                                                       // 115
    } catch (error) {                                                                                                  // 116
      throw new Meteor.Error("subscription-failed", error.message);                                                    // 117
      console.log( error.message );                                                                                    // 118
    }                                                                                                                  // 119
  }                                                                                                                    // 120
};                                                                                                                     // 121
                                                                                                                       // 122
Meteor.methods({                                                                                                       // 123
  addCurrentUserToMailChimpList: function(){                                                                           // 124
    var currentUser = Meteor.users.findOne(this.userId);                                                               // 125
    try {                                                                                                              // 126
      return addToMailChimpList(currentUser, false);                                                                   // 127
    } catch (error) {                                                                                                  // 128
      throw new Meteor.Error(500, error.message);                                                                      // 129
    }                                                                                                                  // 130
  },                                                                                                                   // 131
  addEmailToMailChimpList: function (email) {                                                                          // 132
    try {                                                                                                              // 133
      return addToMailChimpList(email, true);                                                                          // 134
    } catch (error) {                                                                                                  // 135
      throw new Meteor.Error(500, error.message);                                                                      // 136
    }                                                                                                                  // 137
  }                                                                                                                    // 138
});                                                                                                                    // 139
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/routes.js                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 1
                                                                                                                       // 2
  Router.route('/email/campaign', {                                                                                    // 3
    name: 'campaign',                                                                                                  // 4
    where: 'server',                                                                                                   // 5
    action: function() {                                                                                               // 6
      var campaign = buildCampaign(getCampaignPosts(getSetting('postsPerNewsletter', 5)));                             // 7
      var campaignSubject = '<div class="campaign-subject"><strong>Subject:</strong> '+campaign.subject+' (note: contents might change)</div>';
      var campaignSchedule = '<div class="campaign-schedule"><strong>Scheduled for:</strong> '+ Meteor.call('getNextJob') +'</div>';
                                                                                                                       // 10
      this.response.write(campaignSubject+campaignSchedule+campaign.html);                                             // 11
      this.response.end();                                                                                             // 12
    }                                                                                                                  // 13
  });                                                                                                                  // 14
                                                                                                                       // 15
  Router.route('/email/digest-confirmation', {                                                                         // 16
    name: 'digestConfirmation',                                                                                        // 17
    where: 'server',                                                                                                   // 18
    action: function() {                                                                                               // 19
      var confirmationHtml = getEmailTemplate('emailDigestConfirmation')({                                             // 20
        time: 'January 1st, 1901',                                                                                     // 21
        newsletterLink: 'http://example.com',                                                                          // 22
        subject: 'Lorem ipsum dolor sit amet'                                                                          // 23
      });                                                                                                              // 24
      this.response.write(buildEmailTemplate(confirmationHtml));                                                       // 25
      this.response.end();                                                                                             // 26
    }                                                                                                                  // 27
  });                                                                                                                  // 28
                                                                                                                       // 29
});                                                                                                                    // 30
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/templates/handlebars.emailDigest.js                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<style type=\"text/css\">\n  .email-digest{\n  }\n  .digest-date{\n    color: #999;\n    font-weight: normal;\n    font-size: 16px;\n  }\n  .post-item{\n    border-top: 1px solid #ddd;\n  }\n  .post-date{\n    font-size: 13px;\n    color: #999;\n  }\n  .post-title{\n    font-size: 18px;\n    line-height: 1.6;\n  }\n  .post-thumbnail{\n  }\n  .post-meta{\n    font-size: 13px;\n    color: #999;\n    margin: 5px 0;\n  }\n  .post-meta a{\n    color: #333;\n  }  \n  .post-domain{\n    font-weight: bold;\n  }\n  .post-body-excerpt{\n    font-size: 14px;\n  }\n  .post-body-excerpt p{\n    margin: 0;\n  }\n</style>\n\n<span class=\"heading\">Recently on {{siteName}}</span>\n<span class=\"digest-date\">– {{date}}</span>\n<br><br>\n\n<div class=\"email-digest\">\n  {{{content}}}\n</div>\n<br>");Handlebars.templates["emailDigest"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "emailDigest"});};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/templates/handlebars.emailDigestConfirmation.js                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<span class=\"heading\">Newsletter scheduled for {{time}}</span><br><br>\n\n<a href=\"{{newsletterLink}}\">{{subject}}</a><br><br>");Handlebars.templates["emailDigestConfirmation"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "emailDigestConfirmation"});};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/lib/server/templates/handlebars.emailPostItem.js                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<div class=\"post-item\">\n<br >\n\n<span class=\"post-title\">\n  {{#if thumbnailUrl}}\n    <img class=\"post-thumbnail\" src=\"{{thumbnailUrl}}\"/>&nbsp;\n  {{/if}}\n\n  <a href=\"{{postLink}}\" target=\"_blank\">{{title}}</a>\n</span>\n\n<div class=\"post-meta\">\n  {{#if domain}}\n    <a class=\"post-domain\" href=\"\">{{domain}}</a>\n    | \n  {{/if}}\n  <span class=\"post-submitted\">Submitted by <a href=\"{{profileUrl}}\" class=\"comment-link\" target=\"_blank\">{{authorName}}</a></span>\n  <span class=\"post-date\">on {{date}}</span>\n  |\n  <a href=\"{{postPageLink}}\" class=\"comment-link\" target=\"_blank\">{{commentCount}} Comments</a>\n</div>\n\n\n{{#if body}}\n  <div class=\"post-body-excerpt\">\n    {{{htmlBody}}}\n    <a href=\"{{postPageLink}}\" class=\"comment-link\" target=\"_blank\">Read more</a>\n  </div>\n{{/if}}\n\n\n<br>\n</div>\n\n");Handlebars.templates["emailPostItem"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "emailPostItem"});};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/Users/tutasg/meteor/telescope/packages/telescope-newsletter/i18n/de.i18n.js           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _ = Package.underscore._,                                                                                          // 1
    package_name = "telescope-newsletter",                                                                             // 2
    namespace = "telescope-newsletter";                                                                                // 3
                                                                                                                       // 4
if (package_name != "project") {                                                                                       // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                              // 6
}                                                                                                                      // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                                        // 8
  TAPi18n.translations["de"] = {};                                                                                     // 9
}                                                                                                                      // 10
                                                                                                                       // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                             // 12
  TAPi18n.translations["de"][namespace] = {};                                                                          // 13
}                                                                                                                      // 14
                                                                                                                       // 15
_.extend(TAPi18n.translations["de"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/Users/tutasg/meteor/telescope/packages/telescope-newsletter/i18n/en.i18n.js           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _ = Package.underscore._,                                                                                          // 1
    package_name = "telescope-newsletter",                                                                             // 2
    namespace = "telescope-newsletter";                                                                                // 3
                                                                                                                       // 4
if (package_name != "project") {                                                                                       // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                              // 6
}                                                                                                                      // 7
// integrate the fallback language translations                                                                        // 8
translations = {};                                                                                                     // 9
translations[namespace] = {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!","newsletter":"newsletter","showBanner":"Show Banner","mailChimpAPIKey":"MailChimp API Key","mailChimpListId":"MailChimp List ID","postsPerNewsletter":"Posts per Newsletter","newsletterFrequency":"Newsletter Frequency","newsletterTime":"Newsletter Time","enableNewsletter":"Enable Newsletter","autoSubscribe":"Auto Subscribe"};
TAPi18n._loadLangFileObject("en", translations);                                                                       // 11
                                                                                                                       // 12
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/Users/tutasg/meteor/telescope/packages/telescope-newsletter/i18n/es.i18n.js           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _ = Package.underscore._,                                                                                          // 1
    package_name = "telescope-newsletter",                                                                             // 2
    namespace = "telescope-newsletter";                                                                                // 3
                                                                                                                       // 4
if (package_name != "project") {                                                                                       // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                              // 6
}                                                                                                                      // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                                        // 8
  TAPi18n.translations["es"] = {};                                                                                     // 9
}                                                                                                                      // 10
                                                                                                                       // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                             // 12
  TAPi18n.translations["es"][namespace] = {};                                                                          // 13
}                                                                                                                      // 14
                                                                                                                       // 15
_.extend(TAPi18n.translations["es"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/Users/tutasg/meteor/telescope/packages/telescope-newsletter/i18n/fr.i18n.js           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _ = Package.underscore._,                                                                                          // 1
    package_name = "telescope-newsletter",                                                                             // 2
    namespace = "telescope-newsletter";                                                                                // 3
                                                                                                                       // 4
if (package_name != "project") {                                                                                       // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                              // 6
}                                                                                                                      // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                                        // 8
  TAPi18n.translations["fr"] = {};                                                                                     // 9
}                                                                                                                      // 10
                                                                                                                       // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                             // 12
  TAPi18n.translations["fr"][namespace] = {};                                                                          // 13
}                                                                                                                      // 14
                                                                                                                       // 15
_.extend(TAPi18n.translations["fr"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!","newsletter":"newsletter","showBanner":"Afficher la Bannière","mailChimpAPIKey":"Clé API MailChimp","mailChimpListId":"ID Liste MailChimp","postsPerNewsletter":"Posts par Newsletter","newsletterFrequency":"Fréquence de la Newsletter"});
                                                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/Users/tutasg/meteor/telescope/packages/telescope-newsletter/i18n/it.i18n.js           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _ = Package.underscore._,                                                                                          // 1
    package_name = "telescope-newsletter",                                                                             // 2
    namespace = "telescope-newsletter";                                                                                // 3
                                                                                                                       // 4
if (package_name != "project") {                                                                                       // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                              // 6
}                                                                                                                      // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                                        // 8
  TAPi18n.translations["it"] = {};                                                                                     // 9
}                                                                                                                      // 10
                                                                                                                       // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                             // 12
  TAPi18n.translations["it"][namespace] = {};                                                                          // 13
}                                                                                                                      // 14
                                                                                                                       // 15
_.extend(TAPi18n.translations["it"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-newsletter/Users/tutasg/meteor/telescope/packages/telescope-newsletter/i18n/zh-CN.i18n.js        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _ = Package.underscore._,                                                                                          // 1
    package_name = "telescope-newsletter",                                                                             // 2
    namespace = "telescope-newsletter";                                                                                // 3
                                                                                                                       // 4
if (package_name != "project") {                                                                                       // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                              // 6
}                                                                                                                      // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                                     // 8
  TAPi18n.translations["zh-CN"] = {};                                                                                  // 9
}                                                                                                                      // 10
                                                                                                                       // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                                          // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                                       // 13
}                                                                                                                      // 14
                                                                                                                       // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                       // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-newsletter'] = {
  resetNewsletterSchedule: resetNewsletterSchedule
};

})();

//# sourceMappingURL=telescope-newsletter.js.map
