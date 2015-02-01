(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

/* Package-scope variables */
var deepExtend, camelToDash, dashToCamel, camelCaseify, getSetting, getThemeSetting, getSiteUrl, trimWords, can, _, capitalise, expString;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-lib/lib/lib.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
getSiteUrl = function () {                                                                                             // 1
  return getSetting('siteUrl', Meteor.absoluteUrl());                                                                  // 2
}                                                                                                                      // 3
                                                                                                                       // 4
getSetting = function(setting, defaultValue){                                                                          // 5
  var settings = Settings.find().fetch()[0];                                                                           // 6
                                                                                                                       // 7
  if (Meteor.isServer && Meteor.settings && !!Meteor.settings[setting]) { // if on the server, look in Meteor.settings // 8
    return Meteor.settings[setting];                                                                                   // 9
                                                                                                                       // 10
  } else if (Meteor.settings && Meteor.settings.public && !!Meteor.settings.public[setting]) { // look in Meteor.settings.public
    return Meteor.settings.public[setting];                                                                            // 12
                                                                                                                       // 13
  } else if(settings && (typeof settings[setting] !== 'undefined')) { // look in Settings collection                   // 14
    return settings[setting];                                                                                          // 15
                                                                                                                       // 16
  } else if (typeof defaultValue !== 'undefined') { // fallback to default                                             // 17
    return  defaultValue;                                                                                              // 18
                                                                                                                       // 19
  } else { // or return undefined                                                                                      // 20
    return undefined;                                                                                                  // 21
  }                                                                                                                    // 22
                                                                                                                       // 23
};                                                                                                                     // 24
                                                                                                                       // 25
getThemeSetting = function(setting, defaultValue){                                                                     // 26
  if(typeof themeSettings[setting] !== 'undefined'){                                                                   // 27
    return themeSettings[setting];                                                                                     // 28
  }else{                                                                                                               // 29
    return typeof defaultValue === 'undefined' ? '' : defaultValue;                                                    // 30
  }                                                                                                                    // 31
};                                                                                                                     // 32
                                                                                                                       // 33
camelToDash = function (str) {                                                                                         // 34
  return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();                                 // 35
}                                                                                                                      // 36
                                                                                                                       // 37
camelCaseify = function(str) {                                                                                         // 38
  return dashToCamel(str.replace(' ', '-'));                                                                           // 39
}                                                                                                                      // 40
                                                                                                                       // 41
dashToCamel = function (str) {                                                                                         // 42
  return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});                            // 43
}                                                                                                                      // 44
                                                                                                                       // 45
trimWords = function(s, numWords) {                                                                                    // 46
  expString = s.split(/\s+/,numWords);                                                                                 // 47
  if(expString.length >= numWords)                                                                                     // 48
    return expString.join(" ")+"…";                                                                                    // 49
  return s;                                                                                                            // 50
};                                                                                                                     // 51
                                                                                                                       // 52
capitalise = function (string) {                                                                                       // 53
  return string.charAt(0).toUpperCase() + string.slice(1);                                                             // 54
}                                                                                                                      // 55
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-lib/lib/deep.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// see https://gist.github.com/furf/3208381                                                                            // 1
                                                                                                                       // 2
_.mixin({                                                                                                              // 3
                                                                                                                       // 4
  // Get/set the value of a nested property                                                                            // 5
  deep: function (obj, key, value) {                                                                                   // 6
                                                                                                                       // 7
    var keys = key.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2').replace(/^\./, '').split('.'),                           // 8
        root,                                                                                                          // 9
        i = 0,                                                                                                         // 10
        n = keys.length;                                                                                               // 11
                                                                                                                       // 12
    // Set deep value                                                                                                  // 13
    if (arguments.length > 2) {                                                                                        // 14
                                                                                                                       // 15
      root = obj;                                                                                                      // 16
      n--;                                                                                                             // 17
                                                                                                                       // 18
      while (i < n) {                                                                                                  // 19
        key = keys[i++];                                                                                               // 20
        obj = obj[key] = _.isObject(obj[key]) ? obj[key] : {};                                                         // 21
      }                                                                                                                // 22
                                                                                                                       // 23
      obj[keys[i]] = value;                                                                                            // 24
                                                                                                                       // 25
      value = root;                                                                                                    // 26
                                                                                                                       // 27
    // Get deep value                                                                                                  // 28
    } else {                                                                                                           // 29
      while ((obj = obj[keys[i++]]) != null && i < n) {};                                                              // 30
      value = i < n ? void 0 : obj;                                                                                    // 31
    }                                                                                                                  // 32
                                                                                                                       // 33
    return value;                                                                                                      // 34
  }                                                                                                                    // 35
                                                                                                                       // 36
});                                                                                                                    // 37
                                                                                                                       // 38
// Usage:                                                                                                              // 39
//                                                                                                                     // 40
// var obj = {                                                                                                         // 41
//   a: {                                                                                                              // 42
//     b: {                                                                                                            // 43
//       c: {                                                                                                          // 44
//         d: ['e', 'f', 'g']                                                                                          // 45
//       }                                                                                                             // 46
//     }                                                                                                               // 47
//   }                                                                                                                 // 48
// };                                                                                                                  // 49
//                                                                                                                     // 50
// Get deep value                                                                                                      // 51
// _.deep(obj, 'a.b.c.d[2]'); // 'g'                                                                                   // 52
//                                                                                                                     // 53
// Set deep value                                                                                                      // 54
// _.deep(obj, 'a.b.c.d[2]', 'george');                                                                                // 55
//                                                                                                                     // 56
// _.deep(obj, 'a.b.c.d[2]'); // 'george'                                                                              // 57
                                                                                                                       // 58
                                                                                                                       // 59
_.mixin({                                                                                                              // 60
  pluckDeep: function (obj, key) {                                                                                     // 61
    return _.map(obj, function (value) { return _.deep(value, key); });                                                // 62
  }                                                                                                                    // 63
});                                                                                                                    // 64
                                                                                                                       // 65
                                                                                                                       // 66
_.mixin({                                                                                                              // 67
                                                                                                                       // 68
 // Return a copy of an object containing all but the blacklisted properties.                                          // 69
  unpick: function (obj) {                                                                                             // 70
    obj || (obj = {});                                                                                                 // 71
    return _.pick(obj, _.difference(_.keys(obj), _.flatten(Array.prototype.slice.call(arguments, 1))));                // 72
  }                                                                                                                    // 73
                                                                                                                       // 74
});                                                                                                                    // 75
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-lib/lib/deep_extend.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// see: http://stackoverflow.com/questions/9399365/deep-extend-like-jquerys-for-nodejs                                 // 1
deepExtend = function () {                                                                                             // 2
  var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},                                       // 3
      i = 1,                                                                                                           // 4
      length = arguments.length,                                                                                       // 5
      deep = false,                                                                                                    // 6
      toString = Object.prototype.toString,                                                                            // 7
      hasOwn = Object.prototype.hasOwnProperty,                                                                        // 8
      push = Array.prototype.push,                                                                                     // 9
      slice = Array.prototype.slice,                                                                                   // 10
      trim = String.prototype.trim,                                                                                    // 11
      indexOf = Array.prototype.indexOf,                                                                               // 12
      class2type = {                                                                                                   // 13
        "[object Boolean]": "boolean",                                                                                 // 14
        "[object Number]": "number",                                                                                   // 15
        "[object String]": "string",                                                                                   // 16
        "[object Function]": "function",                                                                               // 17
        "[object Array]": "array",                                                                                     // 18
        "[object Date]": "date",                                                                                       // 19
        "[object RegExp]": "regexp",                                                                                   // 20
        "[object Object]": "object"                                                                                    // 21
      },                                                                                                               // 22
      jQuery = {                                                                                                       // 23
        isFunction: function (obj) {                                                                                   // 24
          return jQuery.type(obj) === "function";                                                                      // 25
        },                                                                                                             // 26
        isArray: Array.isArray ||                                                                                      // 27
        function (obj) {                                                                                               // 28
          return jQuery.type(obj) === "array";                                                                         // 29
        },                                                                                                             // 30
        isWindow: function (obj) {                                                                                     // 31
          return obj != null && obj == obj.window;                                                                     // 32
        },                                                                                                             // 33
        isNumeric: function (obj) {                                                                                    // 34
          return !isNaN(parseFloat(obj)) && isFinite(obj);                                                             // 35
        },                                                                                                             // 36
        type: function (obj) {                                                                                         // 37
          return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";                               // 38
        },                                                                                                             // 39
        isPlainObject: function (obj) {                                                                                // 40
          if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {                                                 // 41
            return false;                                                                                              // 42
          }                                                                                                            // 43
          try {                                                                                                        // 44
            if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
              return false;                                                                                            // 46
            }                                                                                                          // 47
          } catch (e) {                                                                                                // 48
            return false;                                                                                              // 49
          }                                                                                                            // 50
          var key;                                                                                                     // 51
          for (key in obj) {}                                                                                          // 52
          return key === undefined || hasOwn.call(obj, key);                                                           // 53
        }                                                                                                              // 54
      };                                                                                                               // 55
    if (typeof target === "boolean") {                                                                                 // 56
      deep = target;                                                                                                   // 57
      target = arguments[1] || {};                                                                                     // 58
      i = 2;                                                                                                           // 59
    }                                                                                                                  // 60
    if (typeof target !== "object" && !jQuery.isFunction(target)) {                                                    // 61
      target = {};                                                                                                     // 62
    }                                                                                                                  // 63
    if (length === i) {                                                                                                // 64
      target = this;                                                                                                   // 65
      --i;                                                                                                             // 66
    }                                                                                                                  // 67
    for (i; i < length; i++) {                                                                                         // 68
      if ((options = arguments[i]) != null) {                                                                          // 69
        for (name in options) {                                                                                        // 70
          src = target[name];                                                                                          // 71
          copy = options[name];                                                                                        // 72
          if (target === copy) {                                                                                       // 73
            continue;                                                                                                  // 74
          }                                                                                                            // 75
          if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {                  // 76
            if (copyIsArray) {                                                                                         // 77
              copyIsArray = false;                                                                                     // 78
              clone = src && jQuery.isArray(src) ? src : [];                                                           // 79
            } else {                                                                                                   // 80
              clone = src && jQuery.isPlainObject(src) ? src : {};                                                     // 81
            }                                                                                                          // 82
            // WARNING: RECURSION                                                                                      // 83
            target[name] = deepExtend(deep, clone, copy);                                                              // 84
          } else if (copy !== undefined) {                                                                             // 85
            target[name] = copy;                                                                                       // 86
          }                                                                                                            // 87
        }                                                                                                              // 88
      }                                                                                                                // 89
    }                                                                                                                  // 90
    return target;                                                                                                     // 91
  };                                                                                                                   // 92
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-lib/lib/autolink.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
//https://github.com/bryanwoods/autolink-js                                                                            // 1
(function(){var a,b=[].slice;a=function(){var j,i,d,f,e,c,g,h;c=1<=arguments.length?b.call(arguments,0):[];g=/(^|\s)(\b(https?):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|]\b)/ig;if(c.length>0){e=c[0];i=e.callback;if((i!=null)&&typeof i==="function"){j=i;delete e.callback;}f="";for(d in e){h=e[d];f+=" "+d+"='"+h+"'";}return this.replace(g,function(l,o,k){var n,m;m=j&&j(k);n=m||("<a href='"+k+"'"+f+">"+k+"</a>");return""+o+n;});}else{return this.replace(g,"$1<a href='$2'>$2</a>");}};String.prototype.autoLink=a;}).call(this);
                                                                                                                       // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/telescope-lib/lib/permissions.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
'use strict';                                                                                                          // 1
                                                                                                                       // 2
can = {};                                                                                                              // 3
                                                                                                                       // 4
// Permissions                                                                                                         // 5
                                                                                                                       // 6
// user:                Defaults to Meteor.user()                                                                      // 7
//                                                                                                                     // 8
// return true if all is well, false                                                                                   // 9
can.view = function(user) {                                                                                            // 10
  if (getSetting('requireViewInvite', false)) {                                                                        // 11
                                                                                                                       // 12
    if (Meteor.isClient) {                                                                                             // 13
      // on client only, default to the current user                                                                   // 14
      user = (typeof user === 'undefined') ? Meteor.user() : user;                                                     // 15
    }                                                                                                                  // 16
                                                                                                                       // 17
    return (!!user && (isAdmin(user) || isInvited(user)));                                                             // 18
  }                                                                                                                    // 19
  return true;                                                                                                         // 20
};                                                                                                                     // 21
can.viewById = function(userId) {                                                                                      // 22
  // if an invite is required to view, run permission check, else return true                                          // 23
  if (getSetting('requireViewInvite', false)) {                                                                        // 24
    return !!userId ? can.view(Meteor.users.findOne(userId)) : false;                                                  // 25
  }                                                                                                                    // 26
  return true;                                                                                                         // 27
};                                                                                                                     // 28
can.post = function(user, returnError) {                                                                               // 29
  user = (typeof user === 'undefined') ? Meteor.user() : user;                                                         // 30
                                                                                                                       // 31
  if (!user) {                                                                                                         // 32
    return returnError ? "no_account" : false;                                                                         // 33
  } else if (isAdmin(user)) {                                                                                          // 34
    return true;                                                                                                       // 35
  } else if (getSetting('requirePostInvite')) {                                                                        // 36
    if (user.isInvited) {                                                                                              // 37
      return true;                                                                                                     // 38
    } else {                                                                                                           // 39
      return returnError ? "no_invite" : false;                                                                        // 40
    }                                                                                                                  // 41
  } else {                                                                                                             // 42
    return true;                                                                                                       // 43
  }                                                                                                                    // 44
};                                                                                                                     // 45
can.comment = function(user, returnError) {                                                                            // 46
  return can.post(user, returnError);                                                                                  // 47
};                                                                                                                     // 48
can.vote = function(user, returnError) {                                                                               // 49
  return can.post(user, returnError);                                                                                  // 50
};                                                                                                                     // 51
can.edit = function(user, item, returnError) {                                                                         // 52
  user = (typeof user === 'undefined') ? Meteor.user() : user;                                                         // 53
                                                                                                                       // 54
  if (!user || !item || (user._id !== item.userId && !isAdmin(user))) {                                                // 55
    return returnError ? "no_rights" : false;                                                                          // 56
  } else {                                                                                                             // 57
    return true;                                                                                                       // 58
  }                                                                                                                    // 59
};                                                                                                                     // 60
can.editById = function(userId, item) {                                                                                // 61
  var user = Meteor.users.findOne(userId);                                                                             // 62
  return can.edit(user, item);                                                                                         // 63
};                                                                                                                     // 64
can.currentUserEdit = function(item) {                                                                                 // 65
  return can.edit(Meteor.user(), item);                                                                                // 66
};                                                                                                                     // 67
can.invite = function(user) {                                                                                          // 68
  return isInvited(user) || isAdmin(user);                                                                             // 69
};                                                                                                                     // 70
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-lib'] = {
  deepExtend: deepExtend,
  camelToDash: camelToDash,
  dashToCamel: dashToCamel,
  camelCaseify: camelCaseify,
  getSetting: getSetting,
  getThemeSetting: getThemeSetting,
  getSiteUrl: getSiteUrl,
  trimWords: trimWords,
  can: can,
  _: _,
  capitalise: capitalise
};

})();

//# sourceMappingURL=telescope-lib.js.map
