(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var URL = Package.url.URL;

/* Package-scope variables */
var HTTP, makeErrorByStatus, populateData;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/http/httpcall_common.js                                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
makeErrorByStatus = function(statusCode, content) {                                                                 // 1
  var MAX_LENGTH = 500; // if you change this, also change the appropriate test                                     // 2
                                                                                                                    // 3
  var truncate = function(str, length) {                                                                            // 4
    return str.length > length ? str.slice(0, length) + '...' : str;                                                // 5
  };                                                                                                                // 6
                                                                                                                    // 7
  var message = "failed [" + statusCode + "]";                                                                      // 8
  if (content)                                                                                                      // 9
    message += " " + truncate(content.replace(/\n/g, " "), MAX_LENGTH);                                             // 10
                                                                                                                    // 11
  return new Error(message);                                                                                        // 12
};                                                                                                                  // 13
                                                                                                                    // 14
                                                                                                                    // 15
// Fill in `response.data` if the content-type is JSON.                                                             // 16
populateData = function(response) {                                                                                 // 17
  // Read Content-Type header, up to a ';' if there is one.                                                         // 18
  // A typical header might be "application/json; charset=utf-8"                                                    // 19
  // or just "application/json".                                                                                    // 20
  var contentType = (response.headers['content-type'] || ';').split(';')[0];                                        // 21
                                                                                                                    // 22
  // Only try to parse data as JSON if server sets correct content type.                                            // 23
  if (_.include(['application/json', 'text/javascript'], contentType)) {                                            // 24
    try {                                                                                                           // 25
      response.data = JSON.parse(response.content);                                                                 // 26
    } catch (err) {                                                                                                 // 27
      response.data = null;                                                                                         // 28
    }                                                                                                               // 29
  } else {                                                                                                          // 30
    response.data = null;                                                                                           // 31
  }                                                                                                                 // 32
};                                                                                                                  // 33
                                                                                                                    // 34
HTTP = {};                                                                                                          // 35
                                                                                                                    // 36
/**                                                                                                                 // 37
 * @summary Send an HTTP `GET` request. Equivalent to calling [`HTTP.call`](#http_call) with "GET" as the first argument.
 * @param {String} url The URL to which the request should be sent.                                                 // 39
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 40
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client. // 41
 * @locus Anywhere                                                                                                  // 42
 */                                                                                                                 // 43
HTTP.get = function (/* varargs */) {                                                                               // 44
  return HTTP.call.apply(this, ["GET"].concat(_.toArray(arguments)));                                               // 45
};                                                                                                                  // 46
                                                                                                                    // 47
/**                                                                                                                 // 48
 * @summary Send an HTTP `POST` request. Equivalent to calling [`HTTP.call`](#http_call) with "POST" as the first argument.
 * @param {String} url The URL to which the request should be sent.                                                 // 50
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 51
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client. // 52
 * @locus Anywhere                                                                                                  // 53
 */                                                                                                                 // 54
HTTP.post = function (/* varargs */) {                                                                              // 55
  return HTTP.call.apply(this, ["POST"].concat(_.toArray(arguments)));                                              // 56
};                                                                                                                  // 57
                                                                                                                    // 58
/**                                                                                                                 // 59
 * @summary Send an HTTP `PUT` request. Equivalent to calling [`HTTP.call`](#http_call) with "PUT" as the first argument.
 * @param {String} url The URL to which the request should be sent.                                                 // 61
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 62
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client. // 63
 * @locus Anywhere                                                                                                  // 64
 */                                                                                                                 // 65
HTTP.put = function (/* varargs */) {                                                                               // 66
  return HTTP.call.apply(this, ["PUT"].concat(_.toArray(arguments)));                                               // 67
};                                                                                                                  // 68
                                                                                                                    // 69
/**                                                                                                                 // 70
 * @summary Send an HTTP `DELETE` request. Equivalent to calling [`HTTP.call`](#http_call) with "DELETE" as the first argument. (Named `del` to avoid conflic with the Javascript keyword `delete`)
 * @param {String} url The URL to which the request should be sent.                                                 // 72
 * @param {Object} [callOptions] Options passed on to [`HTTP.call`](#http_call).                                    // 73
 * @param {Function} [asyncCallback] Callback that is called when the request is completed. Required on the client. // 74
 * @locus Anywhere                                                                                                  // 75
 */                                                                                                                 // 76
HTTP.del = function (/* varargs */) {                                                                               // 77
  return HTTP.call.apply(this, ["DELETE"].concat(_.toArray(arguments)));                                            // 78
};                                                                                                                  // 79
                                                                                                                    // 80
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/http/httpcall_server.js                                                                                 //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
var path = Npm.require('path');                                                                                     // 1
var request = Npm.require('request');                                                                               // 2
var url_util = Npm.require('url');                                                                                  // 3
                                                                                                                    // 4
// _call always runs asynchronously; HTTP.call, defined below,                                                      // 5
// wraps _call and runs synchronously when no callback is provided.                                                 // 6
var _call = function(method, url, options, callback) {                                                              // 7
                                                                                                                    // 8
  ////////// Process arguments //////////                                                                           // 9
                                                                                                                    // 10
  if (! callback && typeof options === "function") {                                                                // 11
    // support (method, url, callback) argument list                                                                // 12
    callback = options;                                                                                             // 13
    options = null;                                                                                                 // 14
  }                                                                                                                 // 15
                                                                                                                    // 16
  options = options || {};                                                                                          // 17
                                                                                                                    // 18
  method = (method || "").toUpperCase();                                                                            // 19
                                                                                                                    // 20
  if (! /^https?:\/\//.test(url))                                                                                   // 21
    throw new Error("url must be absolute and start with http:// or https://");                                     // 22
                                                                                                                    // 23
  var headers = {};                                                                                                 // 24
                                                                                                                    // 25
  var content = options.content;                                                                                    // 26
  if (options.data) {                                                                                               // 27
    content = JSON.stringify(options.data);                                                                         // 28
    headers['Content-Type'] = 'application/json';                                                                   // 29
  }                                                                                                                 // 30
                                                                                                                    // 31
                                                                                                                    // 32
  var params_for_url, params_for_body;                                                                              // 33
  if (content || method === "GET" || method === "HEAD")                                                             // 34
    params_for_url = options.params;                                                                                // 35
  else                                                                                                              // 36
    params_for_body = options.params;                                                                               // 37
                                                                                                                    // 38
  var new_url = URL._constructUrl(url, options.query, params_for_url);                                              // 39
                                                                                                                    // 40
  if (options.auth) {                                                                                               // 41
    if (options.auth.indexOf(':') < 0)                                                                              // 42
      throw new Error('auth option should be of the form "username:password"');                                     // 43
    headers['Authorization'] = "Basic "+                                                                            // 44
      (new Buffer(options.auth, "ascii")).toString("base64");                                                       // 45
  }                                                                                                                 // 46
                                                                                                                    // 47
  if (params_for_body) {                                                                                            // 48
    content = URL._encodeParams(params_for_body);                                                                   // 49
    headers['Content-Type'] = "application/x-www-form-urlencoded";                                                  // 50
  }                                                                                                                 // 51
                                                                                                                    // 52
  _.extend(headers, options.headers || {});                                                                         // 53
                                                                                                                    // 54
  // wrap callback to add a 'response' property on an error, in case                                                // 55
  // we have both (http 4xx/5xx error, which has a response payload)                                                // 56
  callback = (function(callback) {                                                                                  // 57
    return function(error, response) {                                                                              // 58
      if (error && response)                                                                                        // 59
        error.response = response;                                                                                  // 60
      callback(error, response);                                                                                    // 61
    };                                                                                                              // 62
  })(callback);                                                                                                     // 63
                                                                                                                    // 64
  // safety belt: only call the callback once.                                                                      // 65
  callback = _.once(callback);                                                                                      // 66
                                                                                                                    // 67
                                                                                                                    // 68
  ////////// Kickoff! //////////                                                                                    // 69
                                                                                                                    // 70
  var req_options = {                                                                                               // 71
    url: new_url,                                                                                                   // 72
    method: method,                                                                                                 // 73
    encoding: "utf8",                                                                                               // 74
    jar: false,                                                                                                     // 75
    timeout: options.timeout,                                                                                       // 76
    body: content,                                                                                                  // 77
    followRedirect: options.followRedirects,                                                                        // 78
    // Follow redirects on non-GET requests                                                                         // 79
    // also. (https://github.com/meteor/meteor/issues/2808)                                                         // 80
    followAllRedirects: options.followRedirects,                                                                    // 81
    headers: headers                                                                                                // 82
  };                                                                                                                // 83
                                                                                                                    // 84
  request(req_options, function(error, res, body) {                                                                 // 85
    var response = null;                                                                                            // 86
                                                                                                                    // 87
    if (! error) {                                                                                                  // 88
                                                                                                                    // 89
      response = {};                                                                                                // 90
      response.statusCode = res.statusCode;                                                                         // 91
      response.content = body;                                                                                      // 92
      response.headers = res.headers;                                                                               // 93
                                                                                                                    // 94
      populateData(response);                                                                                       // 95
                                                                                                                    // 96
      if (response.statusCode >= 400)                                                                               // 97
        error = makeErrorByStatus(response.statusCode, response.content);                                           // 98
    }                                                                                                               // 99
                                                                                                                    // 100
    callback(error, response);                                                                                      // 101
                                                                                                                    // 102
  });                                                                                                               // 103
};                                                                                                                  // 104
                                                                                                                    // 105
HTTP.call = Meteor.wrapAsync(_call);                                                                                // 106
                                                                                                                    // 107
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/http/deprecated.js                                                                                      //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// The HTTP object used to be called Meteor.http.                                                                   // 1
// XXX COMPAT WITH 0.6.4                                                                                            // 2
Meteor.http = HTTP;                                                                                                 // 3
                                                                                                                    // 4
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.http = {
  HTTP: HTTP
};

})();

//# sourceMappingURL=http.js.map
