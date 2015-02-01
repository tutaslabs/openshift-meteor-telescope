(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var _ = Package.underscore._;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var HTTP, _methodHTTP, Fiber, runServerMethod;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/tap:http-methods/http.methods.server.api.js                                                               //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/*                                                                                                                    // 1
                                                                                                                      // 2
GET /note                                                                                                             // 3
GET /note/:id                                                                                                         // 4
POST /note                                                                                                            // 5
PUT /note/:id                                                                                                         // 6
DELETE /note/:id                                                                                                      // 7
                                                                                                                      // 8
*/                                                                                                                    // 9
HTTP = Package.http && Package.http.HTTP || {};                                                                       // 10
                                                                                                                      // 11
var url = Npm.require('url');                                                                                         // 12
var stream = Npm.require('stream');                                                                                   // 13
                                                                                                                      // 14
// Primary local test scope                                                                                           // 15
_methodHTTP = {};                                                                                                     // 16
                                                                                                                      // 17
                                                                                                                      // 18
_methodHTTP.methodHandlers = {};                                                                                      // 19
_methodHTTP.methodTree = {};                                                                                          // 20
                                                                                                                      // 21
// This could be changed eg. could allow larger data chunks than 1.000.000                                            // 22
// 5mb = 5 * 1024 * 1024 = 5242880;                                                                                   // 23
HTTP.methodsMaxDataLength = 5242880; //1e6;                                                                           // 24
                                                                                                                      // 25
_methodHTTP.nameFollowsConventions = function(name) {                                                                 // 26
  // Check that name is string, not a falsy or empty                                                                  // 27
  return name && name === '' + name && name !== '';                                                                   // 28
};                                                                                                                    // 29
                                                                                                                      // 30
                                                                                                                      // 31
_methodHTTP.getNameList = function(name) {                                                                            // 32
  // Remove leading and trailing slashes and make command array                                                       // 33
  name = name && name.replace(/^\//g, '') || ''; // /^\/|\/$/g                                                        // 34
  // TODO: Get the format from the url - eg.: "/list/45.json" format should be                                        // 35
  // set in this function by splitting the last list item by . and have format                                        // 36
  // as the last item. How should we toggle:                                                                          // 37
  // "/list/45/item.name.json" and "/list/45/item.name"?                                                              // 38
  // We would either have to check all known formats or allways determin the "."                                      // 39
  // as an extension. Resolving in "json" and "name" as handed format - the user                                      // 40
  // Could simply just add the format as a parametre? or be explicit about                                            // 41
  // naming                                                                                                           // 42
  return name && name.split('/') || [];                                                                               // 43
};                                                                                                                    // 44
                                                                                                                      // 45
// Merge two arrays one containing keys and one values                                                                // 46
_methodHTTP.createObject = function(keys, values) {                                                                   // 47
  var result = {};                                                                                                    // 48
  if (keys && values) {                                                                                               // 49
    for (var i = 0; i < keys.length; i++) {                                                                           // 50
      result[keys[i]] = values[i] && decodeURIComponent(values[i]) || '';                                             // 51
    }                                                                                                                 // 52
  }                                                                                                                   // 53
  return result;                                                                                                      // 54
};                                                                                                                    // 55
                                                                                                                      // 56
_methodHTTP.addToMethodTree = function(methodName) {                                                                  // 57
  var list = _methodHTTP.getNameList(methodName);                                                                     // 58
  var name = '/';                                                                                                     // 59
  // Contains the list of params names                                                                                // 60
  var params = [];                                                                                                    // 61
  var currentMethodTree = _methodHTTP.methodTree;                                                                     // 62
                                                                                                                      // 63
  for (var i = 0; i < list.length; i++) {                                                                             // 64
    var lastListItem = (i === list.length - 1);                                                                       // 65
                                                                                                                      // 66
    // get the key name                                                                                               // 67
    var key = list[i];                                                                                                // 68
    // Check if it expects a value                                                                                    // 69
    if (key[0] === ':') {                                                                                             // 70
      // This is a value                                                                                              // 71
      params.push(key.slice(1));                                                                                      // 72
      key = ':value';                                                                                                 // 73
    }                                                                                                                 // 74
    name += key + '/';                                                                                                // 75
                                                                                                                      // 76
    // Set the key into the method tree                                                                               // 77
    if (typeof currentMethodTree[key] === 'undefined') {                                                              // 78
      currentMethodTree[key] = {};                                                                                    // 79
    }                                                                                                                 // 80
                                                                                                                      // 81
    // Dig deeper                                                                                                     // 82
    currentMethodTree = currentMethodTree[key];                                                                       // 83
                                                                                                                      // 84
  }                                                                                                                   // 85
                                                                                                                      // 86
  if (_.isEmpty(currentMethodTree[':ref'])) {                                                                         // 87
    currentMethodTree[':ref'] = {                                                                                     // 88
      name: name,                                                                                                     // 89
      params: params                                                                                                  // 90
    };                                                                                                                // 91
  }                                                                                                                   // 92
                                                                                                                      // 93
  return currentMethodTree[':ref'];                                                                                   // 94
};                                                                                                                    // 95
                                                                                                                      // 96
// This method should be optimized for speed since its called on allmost every                                        // 97
// http call to the server so we return null as soon as we know its not a method                                      // 98
_methodHTTP.getMethod = function(name) {                                                                              // 99
  // Check if the                                                                                                     // 100
  if (!_methodHTTP.nameFollowsConventions(name)) {                                                                    // 101
    return null;                                                                                                      // 102
  }                                                                                                                   // 103
  var list = _methodHTTP.getNameList(name);                                                                           // 104
  // Check if we got a correct list                                                                                   // 105
  if (!list || !list.length) {                                                                                        // 106
    return null;                                                                                                      // 107
  }                                                                                                                   // 108
  // Set current refernce in the _methodHTTP.methodTree                                                               // 109
  var currentMethodTree = _methodHTTP.methodTree;                                                                     // 110
  // Buffer for values to hand on later                                                                               // 111
  var values = [];                                                                                                    // 112
  // Iterate over the method name and check if its found in the method tree                                           // 113
  for (var i = 0; i < list.length; i++) {                                                                             // 114
    // get the key name                                                                                               // 115
    var key = list[i];                                                                                                // 116
    // We expect to find the key or :value if not we break                                                            // 117
    if (typeof currentMethodTree[key] !== 'undefined' ||                                                              // 118
            typeof currentMethodTree[':value'] !== 'undefined') {                                                     // 119
      // We got a result now check if its a value                                                                     // 120
      if (typeof currentMethodTree[key] === 'undefined') {                                                            // 121
        // Push the value                                                                                             // 122
        values.push(key);                                                                                             // 123
        // Set the key to :value to dig deeper                                                                        // 124
        key = ':value';                                                                                               // 125
      }                                                                                                               // 126
                                                                                                                      // 127
    } else {                                                                                                          // 128
      // Break - method call not found                                                                                // 129
      return null;                                                                                                    // 130
    }                                                                                                                 // 131
                                                                                                                      // 132
    // Dig deeper                                                                                                     // 133
    currentMethodTree = currentMethodTree[key];                                                                       // 134
  }                                                                                                                   // 135
                                                                                                                      // 136
  // Extract reference pointer                                                                                        // 137
  var reference = currentMethodTree && currentMethodTree[':ref'];                                                     // 138
  if (typeof reference !== 'undefined') {                                                                             // 139
    return {                                                                                                          // 140
      name: reference.name,                                                                                           // 141
      params: _methodHTTP.createObject(reference.params, values),                                                     // 142
      handle: _methodHTTP.methodHandlers[reference.name]                                                              // 143
    };                                                                                                                // 144
  } else {                                                                                                            // 145
    // Did not get any reference to the method                                                                        // 146
    return null;                                                                                                      // 147
  }                                                                                                                   // 148
};                                                                                                                    // 149
                                                                                                                      // 150
// This method retrieves the userId from the token and makes sure that the token                                      // 151
// is valid and not expired                                                                                           // 152
_methodHTTP.getUserId = function() {                                                                                  // 153
  var self = this;                                                                                                    // 154
                                                                                                                      // 155
  // // Get ip, x-forwarded-for can be comma seperated ips where the first is the                                     // 156
  // // client ip                                                                                                     // 157
  // var ip = self.req.headers['x-forwarded-for'] &&                                                                  // 158
  //         // Return the first item in ip list                                                                      // 159
  //         self.req.headers['x-forwarded-for'].split(',')[0] ||                                                     // 160
  //         // or return the remoteAddress                                                                           // 161
  //         self.req.connection.remoteAddress;                                                                       // 162
                                                                                                                      // 163
  // Check authentication                                                                                             // 164
  var userToken = self.query.token;                                                                                   // 165
                                                                                                                      // 166
  // Check if we are handed strings                                                                                   // 167
  try {                                                                                                               // 168
    userToken && check(userToken, String);                                                                            // 169
  } catch(err) {                                                                                                      // 170
    throw new Meteor.Error(404, 'Error user token and id not of type strings, Error: ' + (err.stack || err.message)); // 171
  }                                                                                                                   // 172
                                                                                                                      // 173
  // Set the this.userId                                                                                              // 174
  if (userToken) {                                                                                                    // 175
    // Look up user to check if user exists and is loggedin via token                                                 // 176
    var user = Meteor.users.findOne({                                                                                 // 177
        $or: [                                                                                                        // 178
          {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(userToken)},                           // 179
          {'services.resume.loginTokens.token': userToken}                                                            // 180
        ]                                                                                                             // 181
      });                                                                                                             // 182
    // TODO: check 'services.resume.loginTokens.when' to have the token expire                                        // 183
                                                                                                                      // 184
    // Set the userId in the scope                                                                                    // 185
    return user && user._id;                                                                                          // 186
  }                                                                                                                   // 187
                                                                                                                      // 188
  return null;                                                                                                        // 189
};                                                                                                                    // 190
                                                                                                                      // 191
                                                                                                                      // 192
// Public interface for adding server-side http methods - if setting a method to                                      // 193
// 'false' it would actually remove the method (can be used to unpublish a method)                                    // 194
HTTP.methods = function(newMethods) {                                                                                 // 195
  _.each(newMethods, function(func, name) {                                                                           // 196
    if (_methodHTTP.nameFollowsConventions(name)) {                                                                   // 197
      // Check if we got a function                                                                                   // 198
      //if (typeof func === 'function') {                                                                             // 199
        var method = _methodHTTP.addToMethodTree(name);                                                               // 200
        // The func is good                                                                                           // 201
        if (typeof _methodHTTP.methodHandlers[method.name] !== 'undefined') {                                         // 202
          if (func === false) {                                                                                       // 203
            // If the method is set to false then unpublish                                                           // 204
            delete _methodHTTP.methodHandlers[method.name];                                                           // 205
            // Delete the reference in the _methodHTTP.methodTree                                                     // 206
            delete method.name;                                                                                       // 207
            delete method.params;                                                                                     // 208
          } else {                                                                                                    // 209
            // We should not allow overwriting - following Meteor.methods                                             // 210
            throw new Error('HTTP method "' + name + '" is already registered');                                      // 211
          }                                                                                                           // 212
        } else {                                                                                                      // 213
          // We could have a function or a object                                                                     // 214
          // The object could have:                                                                                   // 215
          // '/test/': {                                                                                              // 216
          //   auth: function() ... returning the userId using over default                                           // 217
          //                                                                                                          // 218
          //   method: function() ...                                                                                 // 219
          //   or                                                                                                     // 220
          //   post: function() ...                                                                                   // 221
          //   put:                                                                                                   // 222
          //   get:                                                                                                   // 223
          //   delete:                                                                                                // 224
          //   head:                                                                                                  // 225
          // }                                                                                                        // 226
                                                                                                                      // 227
          /*                                                                                                          // 228
          We conform to the object format:                                                                            // 229
          {                                                                                                           // 230
            auth:                                                                                                     // 231
            post:                                                                                                     // 232
            put:                                                                                                      // 233
            get:                                                                                                      // 234
            delete:                                                                                                   // 235
            head:                                                                                                     // 236
          }                                                                                                           // 237
          This way we have a uniform reference                                                                        // 238
          */                                                                                                          // 239
                                                                                                                      // 240
          var uniObj = {};                                                                                            // 241
          if (typeof func === 'function') {                                                                           // 242
            uniObj = {                                                                                                // 243
              'auth': _methodHTTP.getUserId,                                                                          // 244
              'stream': false,                                                                                        // 245
              'POST': func,                                                                                           // 246
              'PUT': func,                                                                                            // 247
              'GET': func,                                                                                            // 248
              'DELETE': func,                                                                                         // 249
              'HEAD': func                                                                                            // 250
            };                                                                                                        // 251
          } else {                                                                                                    // 252
            uniObj = {                                                                                                // 253
              'stream': func.stream || false,                                                                         // 254
              'auth': func.auth || _methodHTTP.getUserId,                                                             // 255
              'POST': func.post || func.method,                                                                       // 256
              'PUT': func.put || func.method,                                                                         // 257
              'GET': func.get || func.method,                                                                         // 258
              'DELETE': func.delete || func.method,                                                                   // 259
              'HEAD': func.head || func.get || func.method                                                            // 260
            };                                                                                                        // 261
          }                                                                                                           // 262
                                                                                                                      // 263
          // Registre the method                                                                                      // 264
          _methodHTTP.methodHandlers[method.name] = uniObj; // func;                                                  // 265
                                                                                                                      // 266
        }                                                                                                             // 267
      // } else {                                                                                                     // 268
      //   // We do require a function as a function to execute later                                                 // 269
      //   throw new Error('HTTP.methods failed: ' + name + ' is not a function');                                    // 270
      // }                                                                                                            // 271
    } else {                                                                                                          // 272
      // We have to follow the naming spec defined in nameFollowsConventions                                          // 273
      throw new Error('HTTP.method "' + name + '" invalid naming of method');                                         // 274
    }                                                                                                                 // 275
  });                                                                                                                 // 276
};                                                                                                                    // 277
                                                                                                                      // 278
var sendError = function(res, code, message) {                                                                        // 279
  res.writeHead(code);                                                                                                // 280
  res.end(message);                                                                                                   // 281
};                                                                                                                    // 282
                                                                                                                      // 283
// This handler collects the header data into either an object (if json) or the                                       // 284
// raw data. The data is passed to the callback                                                                       // 285
var requestHandler = function(req, res, callback) {                                                                   // 286
  if (typeof callback !== 'function') {                                                                               // 287
    return null;                                                                                                      // 288
  }                                                                                                                   // 289
                                                                                                                      // 290
  // Container for buffers and a sum of the length                                                                    // 291
  var bufferData = [], dataLen = 0;                                                                                   // 292
                                                                                                                      // 293
  // Extract the body                                                                                                 // 294
  req.on('data', function(data) {                                                                                     // 295
    bufferData.push(data);                                                                                            // 296
    dataLen += data.length;                                                                                           // 297
                                                                                                                      // 298
    // We have to check the data length in order to spare the server                                                  // 299
    if (dataLen > HTTP.methodsMaxDataLength) {                                                                        // 300
      dataLen = 0;                                                                                                    // 301
      bufferData = [];                                                                                                // 302
      // Flood attack or faulty client                                                                                // 303
      sendError(res, 413, 'Flood attack or faulty client');                                                           // 304
      req.connection.destroy();                                                                                       // 305
    }                                                                                                                 // 306
  });                                                                                                                 // 307
                                                                                                                      // 308
  // When message is ready to be passed on                                                                            // 309
  req.on('end', function() {                                                                                          // 310
    if (res.finished) {                                                                                               // 311
      return;                                                                                                         // 312
    }                                                                                                                 // 313
                                                                                                                      // 314
    // Allow the result to be undefined if so                                                                         // 315
    var result;                                                                                                       // 316
                                                                                                                      // 317
    // If data found the work it - either buffer or json                                                              // 318
    if (dataLen > 0) {                                                                                                // 319
      result = new Buffer(dataLen);                                                                                   // 320
      // Merge the chunks into one buffer                                                                             // 321
      for (var i = 0, ln = bufferData.length, pos = 0; i < ln; i++) {                                                 // 322
        bufferData[i].copy(result, pos);                                                                              // 323
        pos += bufferData[i].length;                                                                                  // 324
        delete bufferData[i];                                                                                         // 325
      }                                                                                                               // 326
      // Check if we could be dealing with json                                                                       // 327
      if (result[0] == 0x7b && result[1] === 0x22) {                                                                  // 328
        try {                                                                                                         // 329
          // Convert the body into json and extract the data object                                                   // 330
          result = EJSON.parse(result.toString());                                                                    // 331
        } catch(err) {                                                                                                // 332
          // Could not parse so we return the raw data                                                                // 333
        }                                                                                                             // 334
      }                                                                                                               // 335
    } else {                                                                                                          // 336
      // Result will be undefined                                                                                     // 337
    }                                                                                                                 // 338
                                                                                                                      // 339
    try {                                                                                                             // 340
      callback(result);                                                                                               // 341
    } catch(err) {                                                                                                    // 342
      sendError(res, 500, 'Error in requestHandler callback, Error: ' + (err.stack || err.message) );                 // 343
    }                                                                                                                 // 344
  });                                                                                                                 // 345
                                                                                                                      // 346
};                                                                                                                    // 347
                                                                                                                      // 348
// This is the simplest handler - it simply passes req stream as data to the                                          // 349
// method                                                                                                             // 350
var streamHandler = function(req, res, callback) {                                                                    // 351
  try {                                                                                                               // 352
    callback();                                                                                                       // 353
  } catch(err) {                                                                                                      // 354
    sendError(res, 500, 'Error in requestHandler callback, Error: ' + (err.stack || err.message) );                   // 355
  }                                                                                                                   // 356
};                                                                                                                    // 357
                                                                                                                      // 358
// Handle the actual connection                                                                                       // 359
WebApp.connectHandlers.use(function(req, res, next) {                                                                 // 360
                                                                                                                      // 361
  // Check to se if this is a http method call                                                                        // 362
  var method = _methodHTTP.getMethod(req._parsedUrl.pathname);                                                        // 363
                                                                                                                      // 364
  // If method is null then it wasn't and we pass the request along                                                   // 365
  if (method === null) {                                                                                              // 366
    return next();                                                                                                    // 367
  }                                                                                                                   // 368
                                                                                                                      // 369
  var dataHandle = (method.handle && method.handle.stream)?streamHandler:requestHandler;                              // 370
                                                                                                                      // 371
  dataHandle(req, res, function(data) {                                                                               // 372
    // If methodsHandler not found or somehow the methodshandler is not a                                             // 373
    // function then return a 404                                                                                     // 374
    if (typeof method.handle === 'undefined') {                                                                       // 375
      sendError(res, 404, 'Error HTTP method handler "' + method.name + '" is not found');                            // 376
      return;                                                                                                         // 377
    }                                                                                                                 // 378
                                                                                                                      // 379
    // Set fiber scope                                                                                                // 380
    var fiberScope = {                                                                                                // 381
      // Pointers to Request / Response                                                                               // 382
      req: req,                                                                                                       // 383
      res: res,                                                                                                       // 384
      // Request / Response helpers                                                                                   // 385
      statusCode: 200,                                                                                                // 386
      method: req.method,                                                                                             // 387
      // Headers for response                                                                                         // 388
      headers: {                                                                                                      // 389
        'Content-Type': 'text/html'  // Set default type                                                              // 390
      },                                                                                                              // 391
      // Arguments                                                                                                    // 392
      data: data,                                                                                                     // 393
      query: req.query,                                                                                               // 394
      params: method.params,                                                                                          // 395
      // Method reference                                                                                             // 396
      reference: method.name,                                                                                         // 397
      methodObject: method.handle,                                                                                    // 398
      // Streaming flags                                                                                              // 399
      isReadStreaming: false,                                                                                         // 400
      isWriteStreaming: false,                                                                                        // 401
    };                                                                                                                // 402
                                                                                                                      // 403
    // Helper functions this scope                                                                                    // 404
    Fiber = Npm.require('fibers');                                                                                    // 405
    runServerMethod = Fiber(function(self) {                                                                          // 406
      // We fetch methods data from methodsHandler, the handler uses the this.addItem()                               // 407
      // function to populate the methods, this way we have better check control and                                  // 408
      // better error handling + messages                                                                             // 409
                                                                                                                      // 410
      // The scope for the user methodObject callbacks                                                                // 411
      var thisScope = {                                                                                               // 412
        // The user whos id and token was used to run this method, if set/found                                       // 413
        userId: null,                                                                                                 // 414
        // The id of the data                                                                                         // 415
        _id: null,                                                                                                    // 416
        // Set the query params ?token=1&id=2 -> { token: 1, id: 2 }                                                  // 417
        query: self.query,                                                                                            // 418
        // Set params /foo/:name/test/:id -> { name: '', id: '' }                                                     // 419
        params: self.params,                                                                                          // 420
        // Method GET, PUT, POST, DELETE, HEAD                                                                        // 421
        method: self.method,                                                                                          // 422
        // User agent                                                                                                 // 423
        userAgent: req.headers['user-agent'],                                                                         // 424
        // All request headers                                                                                        // 425
        requestHeaders: req.headers,                                                                                  // 426
        // Set the userId                                                                                             // 427
        setUserId: function(id) {                                                                                     // 428
          this.userId = id;                                                                                           // 429
        },                                                                                                            // 430
        // We dont simulate / run this on the client at the moment                                                    // 431
        isSimulation: false,                                                                                          // 432
        // Run the next method in a new fiber - This is default at the moment                                         // 433
        unblock: function() {},                                                                                       // 434
        // Set the content type in header, defaults to text/html?                                                     // 435
        setContentType: function(type) {                                                                              // 436
          self.headers['Content-Type'] = type;                                                                        // 437
        },                                                                                                            // 438
        setStatusCode: function(code) {                                                                               // 439
          self.statusCode = code;                                                                                     // 440
        },                                                                                                            // 441
        addHeader: function(key, value) {                                                                             // 442
          self.headers[key] = value;                                                                                  // 443
        },                                                                                                            // 444
        createReadStream: function() {                                                                                // 445
          self.isReadStreaming = true;                                                                                // 446
          return req;                                                                                                 // 447
        },                                                                                                            // 448
        createWriteStream: function() {                                                                               // 449
          self.isWriteStreaming = true;                                                                               // 450
          return res;                                                                                                 // 451
        },                                                                                                            // 452
        Error: function(err) {                                                                                        // 453
                                                                                                                      // 454
          if (err instanceof Meteor.Error) {                                                                          // 455
            // Return controlled error                                                                                // 456
            sendError(res, err.error, err.message);                                                                   // 457
          } else if (err instanceof Error) {                                                                          // 458
            // Return error trace - this is not intented                                                              // 459
            sendError(res, 503, 'Error in method "' + self.reference + '", Error: ' + (err.stack || err.message) );   // 460
          } else {                                                                                                    // 461
            sendError(res, 503, 'Error in method "' + self.reference + '"' );                                         // 462
          }                                                                                                           // 463
                                                                                                                      // 464
        },                                                                                                            // 465
        // getData: function() {                                                                                      // 466
        //   // XXX: TODO if we could run the request handler stuff eg.                                               // 467
        //   // in here in a fiber sync it could be cool - and the user did                                           // 468
        //   // not have to specify the stream=true flag?                                                             // 469
        // }                                                                                                          // 470
      };                                                                                                              // 471
                                                                                                                      // 472
      var methodCall = self.methodObject[self.method];                                                                // 473
                                                                                                                      // 474
      // If the method call is set for the POST/PUT/GET or DELETE then run the                                        // 475
      // respective methodCall if its a function                                                                      // 476
      if (typeof methodCall === 'function') {                                                                         // 477
                                                                                                                      // 478
        // Get the userId - This is either set as a method specific handler and                                       // 479
        // will allways default back to the builtin getUserId handler                                                 // 480
        try {                                                                                                         // 481
          // Try to set the userId                                                                                    // 482
          thisScope.userId = self.methodObject.auth.apply(self);                                                      // 483
        } catch(err) {                                                                                                // 484
          sendError(res, err.error, (err.message || err.stack));                                                      // 485
          return;                                                                                                     // 486
        }                                                                                                             // 487
                                                                                                                      // 488
        // Get the result of the methodCall                                                                           // 489
        var result;                                                                                                   // 490
        // Get a result back to send to the client                                                                    // 491
        try {                                                                                                         // 492
          result = methodCall.apply(thisScope, [self.data]) || '';                                                    // 493
        } catch(err) {                                                                                                // 494
          if (err instanceof Meteor.Error) {                                                                          // 495
            // Return controlled error                                                                                // 496
            sendError(res, err.error, err.message);                                                                   // 497
          } else {                                                                                                    // 498
            // Return error trace - this is not intented                                                              // 499
            sendError(res, 503, 'Error in method "' + self.reference + '", Error: ' + (err.stack || err.message) );   // 500
          }                                                                                                           // 501
          return;                                                                                                     // 502
        }                                                                                                             // 503
                                                                                                                      // 504
        // If OK / 200 then Return the result                                                                         // 505
        if (self.statusCode === 200) {                                                                                // 506
          // Set headers                                                                                              // 507
          _.each(self.headers, function(value, key) {                                                                 // 508
            // If value is defined then set the header, this allows for unsetting                                     // 509
            // the default content-type                                                                               // 510
            if (typeof value !== 'undefined')                                                                         // 511
              res.setHeader(key, value);                                                                              // 512
          });                                                                                                         // 513
                                                                                                                      // 514
          if (self.method === "HEAD") {                                                                               // 515
            res.end();                                                                                                // 516
            return;                                                                                                   // 517
          }                                                                                                           // 518
                                                                                                                      // 519
          // Return result                                                                                            // 520
          var resultBuffer = new Buffer(result);                                                                      // 521
                                                                                                                      // 522
          // Check if user wants to overwrite content length for some reason?                                         // 523
          if (typeof self.headers['Content-Length'] === 'undefined') {                                                // 524
            self.headers['Content-Length'] = resultBuffer.length;                                                     // 525
          }                                                                                                           // 526
                                                                                                                      // 527
          // Check if we allow and have a stream and the user is read streaming                                       // 528
          // Then                                                                                                     // 529
          var streamsWaiting = 1;                                                                                     // 530
                                                                                                                      // 531
          // We wait until the user has finished reading                                                              // 532
          if (self.isReadStreaming) {                                                                                 // 533
            // console.log('Read stream');                                                                            // 534
            req.on('end', function() {                                                                                // 535
              streamsWaiting--;                                                                                       // 536
              // If no streams are waiting                                                                            // 537
              if (streamsWaiting == 0 && !self.isWriteStreaming) {                                                    // 538
                res.end(resultBuffer);                                                                                // 539
              }                                                                                                       // 540
            });                                                                                                       // 541
                                                                                                                      // 542
          } else {                                                                                                    // 543
            streamsWaiting--;                                                                                         // 544
          }                                                                                                           // 545
                                                                                                                      // 546
          // We wait until the user has finished writing                                                              // 547
          if (self.isWriteStreaming) {                                                                                // 548
            // console.log('Write stream');                                                                           // 549
          } else {                                                                                                    // 550
            // If we are done reading the buffer - eg. not streaming                                                  // 551
            if (streamsWaiting == 0) res.end(resultBuffer);                                                           // 552
          }                                                                                                           // 553
                                                                                                                      // 554
                                                                                                                      // 555
        } else {                                                                                                      // 556
          // Set headers                                                                                              // 557
          _.each(self.headers, function(value, key) {                                                                 // 558
            // If value is defined then set the header, this allows for unsetting                                     // 559
            // the default content-type                                                                               // 560
            if (typeof value !== 'undefined')                                                                         // 561
              res.setHeader(key, value);                                                                              // 562
          });                                                                                                         // 563
          // Allow user to alter the status code and send a message                                                   // 564
          sendError(res, self.statusCode, result);                                                                    // 565
        }                                                                                                             // 566
                                                                                                                      // 567
      } else {                                                                                                        // 568
        sendError(res, 404, 'Service not found');                                                                     // 569
      }                                                                                                               // 570
                                                                                                                      // 571
                                                                                                                      // 572
    });                                                                                                               // 573
    // Run http methods handler                                                                                       // 574
    try {                                                                                                             // 575
      runServerMethod.run(fiberScope);                                                                                // 576
    } catch(err) {                                                                                                    // 577
      sendError(res, 500, 'Error running the server http method handler, Error: ' + (err.stack || err.message));      // 578
    }                                                                                                                 // 579
                                                                                                                      // 580
  }); // EO Request handler                                                                                           // 581
                                                                                                                      // 582
                                                                                                                      // 583
});                                                                                                                   // 584
                                                                                                                      // 585
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['tap:http-methods'] = {
  HTTP: HTTP,
  _methodHTTP: _methodHTTP
};

})();

//# sourceMappingURL=tap_http-methods.js.map
