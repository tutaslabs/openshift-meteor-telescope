(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var i18n = Package['telescope-i18n'].i18n;
var setLanguage = Package['telescope-i18n'].setLanguage;
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
var check = Package.check.check;
var Match = Package.check.Match;

/* Package-scope variables */
var postStatuses, STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED, adminMenu, viewsMenu, addToPostSchema, addToCommentsSchema, addToSettingsSchema, addToUserSchema, preloadSubscriptions, primaryNav, secondaryNav, viewParameters, footerModules, heroModules, threadModules, postModules, postThumbnail, postHeading, postMeta, modulePositions, postClassCallbacks, postSubmitRenderedCallbacks, postSubmitClientCallbacks, postSubmitMethodCallbacks, postAfterSubmitMethodCallbacks, postApproveCallbacks, postEditRenderedCallbacks, postEditClientCallbacks, postEditMethodCallbacks, postAfterEditMethodCallbacks, commentClassCallbacks, commentSubmitRenderedCallbacks, commentSubmitClientCallbacks, commentSubmitMethodCallbacks, commentAfterSubmitMethodCallbacks, commentEditRenderedCallbacks, commentEditClientCallbacks, commentEditMethodCallbacks, commentAfterEditMethodCallbacks, upvoteCallbacks, downvoteCallbacks, userEditRenderedCallbacks, userEditClientCallbacks, userProfileCompleteChecks, userProfileDisplay, userProfileEdit, userCreatedCallbacks, getTemplate, templates, themeSettings;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/telescope-base/lib/base.js                                                                        //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
// ------------------------------------- Schemas -------------------------------- //                          // 1
                                                                                                              // 2
// array containing properties to be added to the post/settings/comments schema on startup.                   // 3
addToPostSchema = [];                                                                                         // 4
addToCommentsSchema = [];                                                                                     // 5
addToSettingsSchema = [];                                                                                     // 6
addToUserSchema = [];                                                                                         // 7
                                                                                                              // 8
SimpleSchema.extendOptions({                                                                                  // 9
  editable: Match.Optional(Boolean),  // editable: true means the field can be edited by the document's owner // 10
  hidden: Match.Optional(Boolean)     // hidden: true means the field is never shown in a form no matter what // 11
});                                                                                                           // 12
// ----------------------------------- Posts Statuses ------------------------------ //                       // 13
                                                                                                              // 14
postStatuses = [                                                                                              // 15
  {                                                                                                           // 16
    value: 1,                                                                                                 // 17
    label: 'Pending'                                                                                          // 18
  },                                                                                                          // 19
  {                                                                                                           // 20
    value: 2,                                                                                                 // 21
    label: 'Approved'                                                                                         // 22
  },                                                                                                          // 23
  {                                                                                                           // 24
    value: 3,                                                                                                 // 25
    label: 'Rejected'                                                                                         // 26
  }                                                                                                           // 27
]                                                                                                             // 28
                                                                                                              // 29
STATUS_PENDING=1;                                                                                             // 30
STATUS_APPROVED=2;                                                                                            // 31
STATUS_REJECTED=3;                                                                                            // 32
                                                                                                              // 33
// ------------------------------------- Navigation -------------------------------- //                       // 34
                                                                                                              // 35
                                                                                                              // 36
// array containing nav items; initialize with views menu and admin menu                                      // 37
primaryNav = [                                                                                                // 38
  {                                                                                                           // 39
    template: 'viewsMenu',                                                                                    // 40
    order: 10                                                                                                 // 41
  },                                                                                                          // 42
  {                                                                                                           // 43
    template: 'adminMenu',                                                                                    // 44
    order: 20                                                                                                 // 45
  }                                                                                                           // 46
];                                                                                                            // 47
                                                                                                              // 48
secondaryNav = [                                                                                              // 49
  {                                                                                                           // 50
    template: 'userMenu',                                                                                     // 51
    order: 10                                                                                                 // 52
  },                                                                                                          // 53
  {                                                                                                           // 54
    template:'notificationsMenu',                                                                             // 55
    order: 20                                                                                                 // 56
  },                                                                                                          // 57
  {                                                                                                           // 58
    template: 'submitButton',                                                                                 // 59
    order: 30                                                                                                 // 60
  }                                                                                                           // 61
];                                                                                                            // 62
                                                                                                              // 63
// array containing items in the admin menu                                                                   // 64
adminMenu = [                                                                                                 // 65
  {                                                                                                           // 66
    route: 'posts_pending',                                                                                   // 67
    label: 'Pending',                                                                                         // 68
    description: 'posts_awaiting_moderation'                                                                  // 69
  },                                                                                                          // 70
  {                                                                                                           // 71
    route: 'posts_scheduled',                                                                                 // 72
    label: 'Scheduled',                                                                                       // 73
    description: 'future_scheduled_posts'                                                                     // 74
  },                                                                                                          // 75
  {                                                                                                           // 76
    route: 'all-users',                                                                                       // 77
    label: 'Users',                                                                                           // 78
    description: 'users_dashboard'                                                                            // 79
  },                                                                                                          // 80
  {                                                                                                           // 81
    route: 'settings',                                                                                        // 82
    label: 'Settings',                                                                                        // 83
    description: 'telescope_settings_panel'                                                                   // 84
  }                                                                                                           // 85
];                                                                                                            // 86
                                                                                                              // 87
// array containing items in the views menu                                                                   // 88
viewsMenu = [                                                                                                 // 89
  {                                                                                                           // 90
    route: 'posts_top',                                                                                       // 91
    label: 'top',                                                                                             // 92
    description: 'most_popular_posts'                                                                         // 93
  },                                                                                                          // 94
  {                                                                                                           // 95
    route: 'posts_new',                                                                                       // 96
    label: 'new',                                                                                             // 97
    description: 'newest_posts'                                                                               // 98
  },                                                                                                          // 99
  {                                                                                                           // 100
    route: 'posts_best',                                                                                      // 101
    label: 'best',                                                                                            // 102
    description: 'highest_ranked_posts_ever'                                                                  // 103
  }                                                                                                           // 104
];                                                                                                            // 105
                                                                                                              // 106
// ------------------------------------- Views -------------------------------- //                            // 107
                                                                                                              // 108
                                                                                                              // 109
// object containing post list view parameters                                                                // 110
viewParameters = {};                                                                                          // 111
                                                                                                              // 112
// will be common to all other view unless specific properties are overwritten                                // 113
viewParameters.baseParameters = {                                                                             // 114
  find: {                                                                                                     // 115
    status: STATUS_APPROVED                                                                                   // 116
  },                                                                                                          // 117
  options: {                                                                                                  // 118
    limit: 10                                                                                                 // 119
  }                                                                                                           // 120
};                                                                                                            // 121
                                                                                                              // 122
viewParameters.top = function (terms) {                                                                       // 123
  return {                                                                                                    // 124
    options: {sort: {sticky: -1, score: -1}}                                                                  // 125
  };                                                                                                          // 126
}                                                                                                             // 127
                                                                                                              // 128
viewParameters.new = function (terms) {                                                                       // 129
  return {                                                                                                    // 130
    options: {sort: {sticky: -1, postedAt: -1}}                                                               // 131
  };                                                                                                          // 132
}                                                                                                             // 133
                                                                                                              // 134
viewParameters.best = function (terms) {                                                                      // 135
  return {                                                                                                    // 136
    options: {sort: {sticky: -1, baseScore: -1}}                                                              // 137
  };                                                                                                          // 138
}                                                                                                             // 139
                                                                                                              // 140
viewParameters.pending = function (terms) {                                                                   // 141
  return {                                                                                                    // 142
    find: {                                                                                                   // 143
      status: 1                                                                                               // 144
    },                                                                                                        // 145
    options: {sort: {createdAt: -1}},                                                                         // 146
    showFuture: true                                                                                          // 147
  };                                                                                                          // 148
}                                                                                                             // 149
                                                                                                              // 150
viewParameters.scheduled = function (terms) {                                                                 // 151
  return {                                                                                                    // 152
    find: {postedAt: {$gte: new Date()}},                                                                     // 153
    options: {sort: {postedAt: -1}}                                                                           // 154
  };                                                                                                          // 155
}                                                                                                             // 156
                                                                                                              // 157
viewParameters.userPosts = function (terms) {                                                                 // 158
  return {                                                                                                    // 159
    find: {userId: terms.userId},                                                                             // 160
    options: {limit: 5, sort: {postedAt: -1}}                                                                 // 161
  };                                                                                                          // 162
}                                                                                                             // 163
                                                                                                              // 164
viewParameters.userUpvotedPosts = function (terms) {                                                          // 165
  var user = Meteor.users.findOne(terms.userId);                                                              // 166
  var postsIds = _.pluck(user.votes.upvotedPosts, "itemId");                                                  // 167
  return {                                                                                                    // 168
    find: {_id: {$in: postsIds}, userId: {$ne: terms.userId}}, // exclude own posts                           // 169
    options: {limit: 5, sort: {postedAt: -1}}                                                                 // 170
  };                                                                                                          // 171
}                                                                                                             // 172
                                                                                                              // 173
viewParameters.userDownvotedPosts = function (terms) {                                                        // 174
  var user = Meteor.users.findOne(terms.userId);                                                              // 175
  var postsIds = _.pluck(user.votes.downvotedPosts, "itemId");                                                // 176
  // TODO: sort based on votedAt timestamp and not postedAt, if possible                                      // 177
  return {                                                                                                    // 178
    find: {_id: {$in: postsIds}},                                                                             // 179
    options: {limit: 5, sort: {postedAt: -1}}                                                                 // 180
  };                                                                                                          // 181
}                                                                                                             // 182
                                                                                                              // 183
heroModules = [];                                                                                             // 184
                                                                                                              // 185
footerModules = [];                                                                                           // 186
                                                                                                              // 187
threadModules = [];                                                                                           // 188
                                                                                                              // 189
postModules = [                                                                                               // 190
  {                                                                                                           // 191
    template: 'postRank',                                                                                     // 192
    order: 1                                                                                                  // 193
  },                                                                                                          // 194
  {                                                                                                           // 195
    template: 'postUpvote',                                                                                   // 196
    order: 10                                                                                                 // 197
  },                                                                                                          // 198
  {                                                                                                           // 199
    template: 'postContent',                                                                                  // 200
    order: 20                                                                                                 // 201
  },                                                                                                          // 202
  {                                                                                                           // 203
    template: 'postAvatars',                                                                                  // 204
    order: 30                                                                                                 // 205
  },                                                                                                          // 206
  {                                                                                                           // 207
    template: 'postDiscuss',                                                                                  // 208
    order: 40                                                                                                 // 209
  },                                                                                                          // 210
  {                                                                                                           // 211
    template: 'postActions',                                                                                  // 212
    order: 50                                                                                                 // 213
  }                                                                                                           // 214
];                                                                                                            // 215
                                                                                                              // 216
postThumbnail = [];                                                                                           // 217
                                                                                                              // 218
postHeading = [                                                                                               // 219
  {                                                                                                           // 220
    template: 'postTitle',                                                                                    // 221
    order: 10                                                                                                 // 222
  },                                                                                                          // 223
  {                                                                                                           // 224
    template: 'postDomain',                                                                                   // 225
    order: 20                                                                                                 // 226
  }                                                                                                           // 227
];                                                                                                            // 228
                                                                                                              // 229
postMeta = [                                                                                                  // 230
  {                                                                                                           // 231
    template: 'postAuthor',                                                                                   // 232
    order: 10                                                                                                 // 233
  },                                                                                                          // 234
  {                                                                                                           // 235
    template: 'postInfo',                                                                                     // 236
    order: 20                                                                                                 // 237
  },                                                                                                          // 238
  {                                                                                                           // 239
    template: 'postCommentsLink',                                                                             // 240
    order: 30                                                                                                 // 241
  },                                                                                                          // 242
  {                                                                                                           // 243
    template: 'postAdmin',                                                                                    // 244
    order: 50                                                                                                 // 245
  }                                                                                                           // 246
]                                                                                                             // 247
// ------------------------------ Callbacks ------------------------------ //                                 // 248
                                                                                                              // 249
postClassCallbacks = [];                                                                                      // 250
                                                                                                              // 251
postSubmitClientCallbacks = [];                                                                               // 252
postSubmitMethodCallbacks = [];                                                                               // 253
postAfterSubmitMethodCallbacks = []; // runs on server only in a timeout                                      // 254
                                                                                                              // 255
postEditClientCallbacks = []; // loops over post object                                                       // 256
postEditMethodCallbacks = []; // loops over modifier (i.e. "{$set: {foo: bar}}") object                       // 257
postAfterEditMethodCallbacks = []; // loops over modifier object                                              // 258
                                                                                                              // 259
postApproveCallbacks = [];                                                                                    // 260
                                                                                                              // 261
commentClassCallbacks = [];                                                                                   // 262
                                                                                                              // 263
commentSubmitRenderedCallbacks = [];                                                                          // 264
commentSubmitClientCallbacks = [];                                                                            // 265
commentSubmitMethodCallbacks = [];                                                                            // 266
commentAfterSubmitMethodCallbacks = [];                                                                       // 267
                                                                                                              // 268
commentEditRenderedCallbacks = [];                                                                            // 269
commentEditClientCallbacks = [];                                                                              // 270
commentEditMethodCallbacks = []; // not used yet                                                              // 271
commentAfterEditMethodCallbacks = []; // not used yet                                                         // 272
                                                                                                              // 273
userEditRenderedCallbacks = [];                                                                               // 274
userEditClientCallbacks = [];                                                                                 // 275
userCreatedCallbacks = [];                                                                                    // 276
userProfileCompleteChecks = [];                                                                               // 277
                                                                                                              // 278
upvoteCallbacks = [];                                                                                         // 279
downvoteCallbacks = [];                                                                                       // 280
                                                                                                              // 281
// ------------------------------------- User Profiles -------------------------------- //                    // 282
                                                                                                              // 283
userProfileDisplay = [                                                                                        // 284
  {                                                                                                           // 285
    template: 'userInfo',                                                                                     // 286
    order: 1                                                                                                  // 287
  },                                                                                                          // 288
  {                                                                                                           // 289
    template: 'userPosts',                                                                                    // 290
    order: 2                                                                                                  // 291
  },                                                                                                          // 292
  {                                                                                                           // 293
    template: 'userUpvotedPosts',                                                                             // 294
    order: 3                                                                                                  // 295
  },                                                                                                          // 296
  {                                                                                                           // 297
    template: 'userDownvotedPosts',                                                                           // 298
    order: 5                                                                                                  // 299
  },                                                                                                          // 300
  {                                                                                                           // 301
    template: 'userComments',                                                                                 // 302
    order: 5                                                                                                  // 303
  }                                                                                                           // 304
];                                                                                                            // 305
                                                                                                              // 306
userProfileEdit = [                                                                                           // 307
  {                                                                                                           // 308
    template: 'userAccount',                                                                                  // 309
    order: 1                                                                                                  // 310
  }                                                                                                           // 311
]                                                                                                             // 312
                                                                                                              // 313
userProfileCompleteChecks.push(                                                                               // 314
  function(user) {                                                                                            // 315
    return !!getEmail(user) && !!getUserName(user);                                                           // 316
  }                                                                                                           // 317
);                                                                                                            // 318
                                                                                                              // 319
// ------------------------------ Dynamic Templates ------------------------------ //                         // 320
                                                                                                              // 321
                                                                                                              // 322
templates = {}                                                                                                // 323
                                                                                                              // 324
getTemplate = function (name) {                                                                               // 325
  // if template has been overwritten, return this; else return template name                                 // 326
  return !!templates[name] ? templates[name] : name;                                                          // 327
}                                                                                                             // 328
                                                                                                              // 329
// ------------------------------ Theme Settings ------------------------------ //                            // 330
                                                                                                              // 331
themeSettings = {                                                                                             // 332
  'useDropdowns': true // whether or not to use dropdown menus in a theme                                     // 333
};                                                                                                            // 334
                                                                                                              // 335
// ------------------------------ Subscriptions ------------------------------ //                             // 336
                                                                                                              // 337
// array containing subscriptions to be preloaded                                                             // 338
preloadSubscriptions = [];                                                                                    // 339
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/telescope-base/lib/base_server.js                                                                 //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
                                                                                                              // 1
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-base'] = {
  postStatuses: postStatuses,
  STATUS_PENDING: STATUS_PENDING,
  STATUS_APPROVED: STATUS_APPROVED,
  STATUS_REJECTED: STATUS_REJECTED,
  adminMenu: adminMenu,
  viewsMenu: viewsMenu,
  addToPostSchema: addToPostSchema,
  addToCommentsSchema: addToCommentsSchema,
  addToSettingsSchema: addToSettingsSchema,
  addToUserSchema: addToUserSchema,
  preloadSubscriptions: preloadSubscriptions,
  primaryNav: primaryNav,
  secondaryNav: secondaryNav,
  viewParameters: viewParameters,
  footerModules: footerModules,
  heroModules: heroModules,
  threadModules: threadModules,
  postModules: postModules,
  postThumbnail: postThumbnail,
  postHeading: postHeading,
  postMeta: postMeta,
  modulePositions: modulePositions,
  postClassCallbacks: postClassCallbacks,
  postSubmitRenderedCallbacks: postSubmitRenderedCallbacks,
  postSubmitClientCallbacks: postSubmitClientCallbacks,
  postSubmitMethodCallbacks: postSubmitMethodCallbacks,
  postAfterSubmitMethodCallbacks: postAfterSubmitMethodCallbacks,
  postApproveCallbacks: postApproveCallbacks,
  postEditRenderedCallbacks: postEditRenderedCallbacks,
  postEditClientCallbacks: postEditClientCallbacks,
  postEditMethodCallbacks: postEditMethodCallbacks,
  postAfterEditMethodCallbacks: postAfterEditMethodCallbacks,
  commentClassCallbacks: commentClassCallbacks,
  commentSubmitRenderedCallbacks: commentSubmitRenderedCallbacks,
  commentSubmitClientCallbacks: commentSubmitClientCallbacks,
  commentSubmitMethodCallbacks: commentSubmitMethodCallbacks,
  commentAfterSubmitMethodCallbacks: commentAfterSubmitMethodCallbacks,
  commentEditRenderedCallbacks: commentEditRenderedCallbacks,
  commentEditClientCallbacks: commentEditClientCallbacks,
  commentEditMethodCallbacks: commentEditMethodCallbacks,
  commentAfterEditMethodCallbacks: commentAfterEditMethodCallbacks,
  upvoteCallbacks: upvoteCallbacks,
  downvoteCallbacks: downvoteCallbacks,
  userEditRenderedCallbacks: userEditRenderedCallbacks,
  userEditClientCallbacks: userEditClientCallbacks,
  userProfileCompleteChecks: userProfileCompleteChecks,
  userProfileDisplay: userProfileDisplay,
  userProfileEdit: userProfileEdit,
  userCreatedCallbacks: userCreatedCallbacks,
  getTemplate: getTemplate,
  templates: templates,
  themeSettings: themeSettings
};

})();

//# sourceMappingURL=telescope-base.js.map
