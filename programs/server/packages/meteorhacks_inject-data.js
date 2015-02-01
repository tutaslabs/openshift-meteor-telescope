(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var EJSON = Package.ejson.EJSON;
var _ = Package.underscore._;

/* Package-scope variables */
var InjectData;

(function () {

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/meteorhacks:inject-data/lib/namespace.js                      //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
InjectData = {};                                                          // 1
////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/meteorhacks:inject-data/lib/utils.js                          //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
InjectData._encode = function(ejson) {                                    // 1
  var ejsonString = EJSON.stringify(ejson);                               // 2
  return encodeURIComponent(ejsonString);                                 // 3
};                                                                        // 4
                                                                          // 5
InjectData._decode = function(encodedEjson) {                             // 6
  var decodedEjsonString = decodeURIComponent(encodedEjson);              // 7
  return EJSON.fromJSONValue(JSON.parse(decodedEjsonString));             // 8
};                                                                        // 9
                                                                          // 10
////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/meteorhacks:inject-data/lib/server.js                         //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
var http = Npm.require('http');                                           // 1
                                                                          // 2
var templateText = Assets.getText('lib/inject.html');                     // 3
var injectDataTemplate = _.template(templateText);                        // 4
                                                                          // 5
// custome API                                                            // 6
http.OutgoingMessage.prototype.pushData = function pushData(key, value) { // 7
  if(!this._injectPayload) {                                              // 8
    this._injectPayload = {};                                             // 9
  }                                                                       // 10
                                                                          // 11
  this._injectPayload[key] = value;                                       // 12
};                                                                        // 13
                                                                          // 14
http.OutgoingMessage.prototype.getData = function getData(key) {          // 15
  if(this._injectPayload) {                                               // 16
    return _.clone(this._injectPayload[key]);                             // 17
  } else {                                                                // 18
    return null;                                                          // 19
  }                                                                       // 20
};                                                                        // 21
                                                                          // 22
// overrides                                                              // 23
var originalWrite = http.OutgoingMessage.prototype.write;                 // 24
http.OutgoingMessage.prototype.write = function(chunk, encoding) {        // 25
  var condition =                                                         // 26
    this._injectPayload && !this._injected &&                             // 27
    encoding === undefined &&                                             // 28
    /<!DOCTYPE html>/.test(chunk);                                        // 29
                                                                          // 30
  if(condition) {                                                         // 31
    // if cors headers included if may cause some security holes          // 32
    // so we simply turn off injecting if we detect an cors header        // 33
    // read more: http://goo.gl/eGwb4e                                    // 34
    if(this._headers['access-control-allow-origin']) {                    // 35
      var warnMessage =                                                   // 36
        'warn: injecting data turned off due to CORS headers. ' +         // 37
        'read more: http://goo.gl/eGwb4e';                                // 38
                                                                          // 39
      console.warn(warnMessage);                                          // 40
      originalWrite.call(this, chunk, encoding);                          // 41
      return;                                                             // 42
    }                                                                     // 43
                                                                          // 44
    // inject data                                                        // 45
    var data = InjectData._encode(this._injectPayload);                   // 46
    var injectHtml = injectDataTemplate({data: data});                    // 47
    chunk = chunk.replace('</head>', injectHtml + '\n</head>');           // 48
                                                                          // 49
    this._injected = true;                                                // 50
  }                                                                       // 51
                                                                          // 52
  originalWrite.call(this, chunk, encoding);                              // 53
};                                                                        // 54
////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:inject-data'] = {
  InjectData: InjectData
};

})();

//# sourceMappingURL=meteorhacks_inject-data.js.map
