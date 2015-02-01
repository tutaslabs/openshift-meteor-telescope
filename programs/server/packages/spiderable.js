(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;

/* Package-scope variables */
var Spiderable;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/spiderable/spiderable.js                                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Spiderable = {};                                                                                                   // 1
                                                                                                                   // 2
                                                                                                                   // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/spiderable/spiderable_server.js                                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var fs = Npm.require('fs');                                                                                        // 1
var child_process = Npm.require('child_process');                                                                  // 2
var querystring = Npm.require('querystring');                                                                      // 3
var urlParser = Npm.require('url');                                                                                // 4
                                                                                                                   // 5
// list of bot user agents that we want to serve statically, but do                                                // 6
// not obey the _escaped_fragment_ protocol. The page is served                                                    // 7
// statically to any client whos user agent matches any of these                                                   // 8
// regexps. Users may modify this array.                                                                           // 9
//                                                                                                                 // 10
// An original goal with the spiderable package was to avoid doing                                                 // 11
// user-agent based tests. But the reality is not enough bots support                                              // 12
// the _escaped_fragment_ protocol, so we need to hardcode a list                                                  // 13
// here. I shed a silent tear.                                                                                     // 14
Spiderable.userAgentRegExps = [                                                                                    // 15
    /^facebookexternalhit/i, /^linkedinbot/i, /^twitterbot/i];                                                     // 16
                                                                                                                   // 17
// how long to let phantomjs run before we kill it                                                                 // 18
var REQUEST_TIMEOUT = 15*1000;                                                                                     // 19
// maximum size of result HTML. node's default is 200k which is too                                                // 20
// small for our docs.                                                                                             // 21
var MAX_BUFFER = 5*1024*1024; // 5MB                                                                               // 22
                                                                                                                   // 23
// Exported for tests.                                                                                             // 24
Spiderable._urlForPhantom = function (siteAbsoluteUrl, requestUrl) {                                               // 25
  // reassembling url without escaped fragment if exists                                                           // 26
  var parsedUrl = urlParser.parse(requestUrl);                                                                     // 27
  var parsedQuery = querystring.parse(parsedUrl.query);                                                            // 28
  delete parsedQuery['_escaped_fragment_'];                                                                        // 29
                                                                                                                   // 30
  var parsedAbsoluteUrl = urlParser.parse(siteAbsoluteUrl);                                                        // 31
  // If the ROOT_URL contains a path, Meteor strips that path off of the                                           // 32
  // request's URL before we see it. So we concatenate the pathname from                                           // 33
  // the request's URL with the root URL's pathname to get the full                                                // 34
  // pathname.                                                                                                     // 35
  if (parsedUrl.pathname.charAt(0) === "/") {                                                                      // 36
    parsedUrl.pathname = parsedUrl.pathname.substring(1);                                                          // 37
  }                                                                                                                // 38
  parsedAbsoluteUrl.pathname = urlParser.resolve(parsedAbsoluteUrl.pathname,                                       // 39
                                                 parsedUrl.pathname);                                              // 40
  parsedAbsoluteUrl.query = parsedQuery;                                                                           // 41
  // `url.format` will only use `query` if `search` is absent                                                      // 42
  parsedAbsoluteUrl.search = null;                                                                                 // 43
                                                                                                                   // 44
  return urlParser.format(parsedAbsoluteUrl);                                                                      // 45
};                                                                                                                 // 46
                                                                                                                   // 47
var PHANTOM_SCRIPT = Assets.getText("phantom_script.js");                                                          // 48
                                                                                                                   // 49
WebApp.connectHandlers.use(function (req, res, next) {                                                             // 50
  // _escaped_fragment_ comes from Google's AJAX crawling spec:                                                    // 51
  // https://developers.google.com/webmasters/ajax-crawling/docs/specification                                     // 52
  // This spec was designed during the brief era where using "#!" URLs was                                         // 53
  // common, so it mostly describes how to translate "#!" URLs into                                                // 54
  // _escaped_fragment_ URLs. Since then, "#!" URLs have gone out of style, but                                    // 55
  // the <meta name="fragment" content="!"> (see spiderable.html) approach also                                    // 56
  // described in the spec is still common and used by several crawlers.                                           // 57
  if (/\?.*_escaped_fragment_=/.test(req.url) ||                                                                   // 58
      _.any(Spiderable.userAgentRegExps, function (re) {                                                           // 59
        return re.test(req.headers['user-agent']); })) {                                                           // 60
                                                                                                                   // 61
    var url = Spiderable._urlForPhantom(Meteor.absoluteUrl(), req.url);                                            // 62
                                                                                                                   // 63
    // This string is going to be put into a bash script, so it's important                                        // 64
    // that 'url' (which comes from the network) can neither exploit phantomjs                                     // 65
    // or the bash script. JSON stringification should prevent it from                                             // 66
    // exploiting phantomjs, and since the output of JSON.stringify shouldn't                                      // 67
    // be able to contain newlines, it should be unable to exploit bash as                                         // 68
    // well.                                                                                                       // 69
    var phantomScript = "var url = " + JSON.stringify(url) + ";" +                                                 // 70
          PHANTOM_SCRIPT;                                                                                          // 71
                                                                                                                   // 72
    // Allow override of phantomjs args via env var                                                                // 73
    // We use one env var to try to keep env-var explosion under control.                                          // 74
    // We're not going to document this unless it is actually needed;                                              // 75
    // (if you find yourself needing this please let us know the use case!)                                        // 76
    var phantomJsArgs = process.env.METEOR_PKG_SPIDERABLE_PHANTOMJS_ARGS || '';                                    // 77
                                                                                                                   // 78
    // Default image loading to off (we don't need images)                                                         // 79
    if (phantomJsArgs.indexOf("--load-images=") === -1) {                                                          // 80
      phantomJsArgs += " --load-images=no";                                                                        // 81
    }                                                                                                              // 82
                                                                                                                   // 83
    // POODLE means SSLv3 is being turned off everywhere.                                                          // 84
    // phantomjs currently defaults to SSLv3, and won't use TLS.                                                   // 85
    // Use --ssl-protocol to set the default to TLSv1                                                              // 86
    // (another option would be 'any', but really, we want to say >= TLSv1)                                        // 87
    // More info: https://groups.google.com/forum/#!topic/meteor-core/uZhT3AHwpsI                                  // 88
    if (phantomJsArgs.indexOf("--ssl-protocol=") === -1) {                                                         // 89
      phantomJsArgs += " --ssl-protocol=TLSv1";                                                                    // 90
    }                                                                                                              // 91
                                                                                                                   // 92
    // Run phantomjs.                                                                                              // 93
    //                                                                                                             // 94
    // Use '/dev/stdin' to avoid writing to a temporary file. We can't                                             // 95
    // just omit the file, as PhantomJS takes that to mean 'use a                                                  // 96
    // REPL' and exits as soon as stdin closes.                                                                    // 97
    //                                                                                                             // 98
    // However, Node 0.8 broke the ability to open /dev/stdin in the                                               // 99
    // subprocess, so we can't just write our string to the process's stdin                                        // 100
    // directly; see https://gist.github.com/3751746 for the gory details. We                                      // 101
    // work around this with a bash heredoc. (We previous used a "cat |"                                           // 102
    // instead, but that meant we couldn't use exec and had to manage several                                      // 103
    // processes.)                                                                                                 // 104
    child_process.execFile(                                                                                        // 105
      '/bin/bash',                                                                                                 // 106
      ['-c',                                                                                                       // 107
       ("exec phantomjs " + phantomJsArgs + " /dev/stdin <<'END'\n" +                                              // 108
        phantomScript + "END\n")],                                                                                 // 109
      {timeout: REQUEST_TIMEOUT, maxBuffer: MAX_BUFFER},                                                           // 110
      function (error, stdout, stderr) {                                                                           // 111
        if (!error && /<html/i.test(stdout)) {                                                                     // 112
          res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});                                        // 113
          res.end(stdout);                                                                                         // 114
        } else {                                                                                                   // 115
          // phantomjs failed. Don't send the error, instead send the                                              // 116
          // normal page.                                                                                          // 117
          if (error && error.code === 127)                                                                         // 118
            Meteor._debug("spiderable: phantomjs not installed. Download and install from http://phantomjs.org/"); // 119
          else                                                                                                     // 120
            Meteor._debug("spiderable: phantomjs failed:", error, "\nstderr:", stderr);                            // 121
                                                                                                                   // 122
          next();                                                                                                  // 123
        }                                                                                                          // 124
      });                                                                                                          // 125
  } else {                                                                                                         // 126
    next();                                                                                                        // 127
  }                                                                                                                // 128
});                                                                                                                // 129
                                                                                                                   // 130
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.spiderable = {
  Spiderable: Spiderable
};

})();

//# sourceMappingURL=spiderable.js.map
