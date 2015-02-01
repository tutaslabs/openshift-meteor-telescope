(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Gravatar = Package['jparker:gravatar'].Gravatar;

/* Package-scope variables */
var Avatar, getService, getGravatarUrl, getEmailOrHash;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/bengott:avatar/export.js                                                              //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// Avatar object to be exported                                                                   // 1
Avatar = {                                                                                        // 2
                                                                                                  // 3
  // If defined (e.g. from a startup config file in your app), these options                      // 4
  // override default functionality                                                               // 5
  options: {                                                                                      // 6
                                                                                                  // 7
    // Determines the type of fallback to use when no image can be found via                      // 8
    // linked services (Gravatar included):                                                       // 9
    //   "default image" (the default option, which will show either the image                    // 10
    //   specified by defaultImageUrl, the package's default image, or a Gravatar                 // 11
    //   default image)                                                                           // 12
    //     OR                                                                                     // 13
    //   "initials" (show the user's initials).                                                   // 14
    fallbackType: '',                                                                             // 15
                                                                                                  // 16
    // This will replace the included default avatar image's URL                                  // 17
    // ('packages/bengott_avatar/default.png'). It can be a relative path                         // 18
    // (relative to website's base URL, e.g. 'images/defaultAvatar.png').                         // 19
    defaultImageUrl: '',                                                                          // 20
                                                                                                  // 21
    // Gravatar default option to use (overrides default image URL)                               // 22
    // Options are available at:                                                                  // 23
    // https://secure.gravatar.com/site/implement/images/#default-image                           // 24
    gravatarDefault: '',                                                                          // 25
                                                                                                  // 26
    // This property on the user object will be used for retrieving gravatars                     // 27
    // (useful when user emails are not published).                                               // 28
    emailHashProperty: ''                                                                         // 29
  },                                                                                              // 30
                                                                                                  // 31
  // Get the initials of the user                                                                 // 32
  getInitials: function (user) {                                                                  // 33
                                                                                                  // 34
    var initials = '';                                                                            // 35
    var name = '';                                                                                // 36
    var parts = [];                                                                               // 37
                                                                                                  // 38
    if (user && user.profile && user.profile.firstName) {                                         // 39
      initials = user.profile.firstName.charAt(0).toUpperCase();                                  // 40
                                                                                                  // 41
      if (user.profile.lastName) {                                                                // 42
        initials += user.profile.lastName.charAt(0).toUpperCase();                                // 43
      }                                                                                           // 44
      else if (user.profile.familyName) {                                                         // 45
        initials += user.profile.familyName.charAt(0).toUpperCase();                              // 46
      }                                                                                           // 47
      else if (user.profile.secondName) {                                                         // 48
        initials += user.profile.secondName.charAt(0).toUpperCase();                              // 49
      }                                                                                           // 50
    }                                                                                             // 51
    else {                                                                                        // 52
      if (user && user.profile && user.profile.name) {                                            // 53
        name = user.profile.name;                                                                 // 54
      }                                                                                           // 55
      else if (user && user.username) {                                                           // 56
        name = user.username;                                                                     // 57
      }                                                                                           // 58
                                                                                                  // 59
      parts = name.split(' ');                                                                    // 60
      // Limit getInitials to first and last initial to avoid problems with                       // 61
      // very long multi-part names (e.g. "Jose Manuel Garcia Galvez")                            // 62
      initials = _.first(parts).charAt(0).toUpperCase();                                          // 63
      if (parts.length > 1) {                                                                     // 64
        initials += _.last(parts).charAt(0).toUpperCase();                                        // 65
      }                                                                                           // 66
    }                                                                                             // 67
                                                                                                  // 68
    return initials;                                                                              // 69
  },                                                                                              // 70
                                                                                                  // 71
  // Get the url of the user's avatar                                                             // 72
  getUrl: function (user) {                                                                       // 73
                                                                                                  // 74
    var url = '';                                                                                 // 75
    var defaultUrl, svc;                                                                          // 76
                                                                                                  // 77
    if (user) {                                                                                   // 78
      svc = getService(user);                                                                     // 79
      if (svc === 'twitter') {                                                                    // 80
        // use larger image (200x200 is smallest custom option)                                   // 81
        url = user.services.twitter.profile_image_url.replace('_normal.', '_200x200.');           // 82
      }                                                                                           // 83
      else if (svc === 'facebook') {                                                              // 84
        // use larger image (~200x200)                                                            // 85
        url = 'http://graph.facebook.com/' + user.services.facebook.id + '/picture?type=large';   // 86
      }                                                                                           // 87
      else if (svc === 'google') {                                                                // 88
        url = user.services.google.picture;                                                       // 89
      }                                                                                           // 90
      else if (svc === 'github') {                                                                // 91
        url = 'http://avatars.githubusercontent.com/' + user.services.github.username + '?s=200'; // 92
      }                                                                                           // 93
      else if (svc === 'instagram') {                                                             // 94
        url = user.services.instagram.profile_picture;                                            // 95
      }                                                                                           // 96
      else if (svc === 'none') {                                                                  // 97
        defaultUrl = Avatar.options.defaultImageUrl || 'packages/bengott_avatar/default.png';     // 98
        // If it's a relative path (no '//' anywhere), complete the URL                           // 99
        if (defaultUrl.indexOf('//') === -1) {                                                    // 100
          // Strip starting slash if it exists                                                    // 101
          if (defaultUrl.charAt(0) === '/') defaultUrl = defaultUrl.slice(1);                     // 102
          // Then add the relative path to the server's base URL                                  // 103
          defaultUrl = Meteor.absoluteUrl() + defaultUrl;                                         // 104
        }                                                                                         // 105
        url = getGravatarUrl(user, defaultUrl);                                                   // 106
      }                                                                                           // 107
    }                                                                                             // 108
                                                                                                  // 109
    return url;                                                                                   // 110
  }                                                                                               // 111
};                                                                                                // 112
                                                                                                  // 113
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/bengott:avatar/helpers.js                                                             //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// Get the account service to use for the user's avatar                                           // 1
// Priority: Twitter > Facebook > Google > GitHub > Instagram                                     // 2
getService = function (user) {                                                                    // 3
  if      (user && user.services && user.services.twitter)   { return 'twitter'; }                // 4
  else if (user && user.services && user.services.facebook)  { return 'facebook'; }               // 5
  else if (user && user.services && user.services.google)    { return 'google'; }                 // 6
  else if (user && user.services && user.services.github)    { return 'github'; }                 // 7
  else if (user && user.services && user.services.instagram) { return 'instagram'; }              // 8
  else                                                       { return 'none'; }                   // 9
};                                                                                                // 10
                                                                                                  // 11
getGravatarUrl = function (user, defaultUrl) {                                                    // 12
  var gravatarDefault;                                                                            // 13
  var validGravatars = ['404', 'mm', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'];      // 14
                                                                                                  // 15
  // Initials are shown when Gravatar returns 404.                                                // 16
  if (Avatar.options.fallbackType !== 'initials') {                                               // 17
    var valid = _.contains(validGravatars, Avatar.options.gravatarDefault);                       // 18
    gravatarDefault = valid ? Avatar.options.gravatarDefault : defaultUrl;                        // 19
  }                                                                                               // 20
  else {                                                                                          // 21
    gravatarDefault = '404';                                                                      // 22
  }                                                                                               // 23
                                                                                                  // 24
  var options = {                                                                                 // 25
    // NOTE: Gravatar's default option requires a publicly accessible URL,                        // 26
    // so it won't work when your app is running on localhost and you're                          // 27
    // using an image with either the standard default image URL or a custom                      // 28
    // defaultImageUrl that is a relative path (e.g. 'images/defaultAvatar.png').                 // 29
    default: gravatarDefault,                                                                     // 30
    size: 200, // use 200x200 like twitter and facebook above (might be useful later)             // 31
    secure: Meteor.absoluteUrl().slice(0,6) === 'https:'                                          // 32
  };                                                                                              // 33
                                                                                                  // 34
  var emailOrHash = getEmailOrHash(user);                                                         // 35
  return Gravatar.imageUrl(emailOrHash, options);                                                 // 36
};                                                                                                // 37
                                                                                                  // 38
// Get the user's email address or (if the emailHashProperty is defined) hash                     // 39
getEmailOrHash = function (user) {                                                                // 40
  var emailOrHash;                                                                                // 41
  if (user && Avatar.options.emailHashProperty && user[Avatar.options.emailHashProperty]) {       // 42
    emailOrHash = user[Avatar.options.emailHashProperty];                                         // 43
  }                                                                                               // 44
  else if (user && user.emails) {                                                                 // 45
    emailOrHash = user.emails[0].address; // TODO: try all emails                                 // 46
  }                                                                                               // 47
  else {                                                                                          // 48
    // If all else fails, return 32 zeros (trash hash, hehe) so that Gravatar                     // 49
    // has something to build a URL with at least.                                                // 50
    emailOrHash = '00000000000000000000000000000000';                                             // 51
  }                                                                                               // 52
  return emailOrHash;                                                                             // 53
};                                                                                                // 54
                                                                                                  // 55
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['bengott:avatar'] = {
  Avatar: Avatar
};

})();

//# sourceMappingURL=bengott_avatar.js.map
