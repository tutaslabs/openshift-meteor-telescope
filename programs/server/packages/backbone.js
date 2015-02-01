(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/backbone/backbone.js                                                                                  //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
//     Backbone.js 0.9.2                                                                                          // 1
                                                                                                                  // 2
//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.                                                          // 3
//     Backbone may be freely distributed under the MIT license.                                                  // 4
//     For all details and documentation:                                                                         // 5
//     http://backbonejs.org                                                                                      // 6
                                                                                                                  // 7
// Meteor changes occur inside <METEOR> </METEOR> -- dgreenspan                                                   // 8
                                                                                                                  // 9
(function(){                                                                                                      // 10
                                                                                                                  // 11
  // Initial Setup                                                                                                // 12
  // -------------                                                                                                // 13
                                                                                                                  // 14
  // Save a reference to the global object (`window` in the browser, `global`                                     // 15
  // on the server).                                                                                              // 16
  var root = this;                                                                                                // 17
                                                                                                                  // 18
  // Save the previous value of the `Backbone` variable, so that it can be                                        // 19
  // restored later on, if `noConflict` is used.                                                                  // 20
  var previousBackbone = root.Backbone;                                                                           // 21
                                                                                                                  // 22
  // Create a local reference to slice/splice.                                                                    // 23
  var slice = Array.prototype.slice;                                                                              // 24
  var splice = Array.prototype.splice;                                                                            // 25
                                                                                                                  // 26
  // The top-level namespace. All public Backbone classes and modules will                                        // 27
  // be attached to this. Exported for both CommonJS and the browser.                                             // 28
  var Backbone;                                                                                                   // 29
  if (typeof exports !== 'undefined') {                                                                           // 30
    Backbone = exports;                                                                                           // 31
  } else {                                                                                                        // 32
    Backbone = root.Backbone = {};                                                                                // 33
  }                                                                                                               // 34
                                                                                                                  // 35
  // Current version of the library. Keep in sync with `package.json`.                                            // 36
  Backbone.VERSION = '0.9.2';                                                                                     // 37
                                                                                                                  // 38
  // Require Underscore, if we're on the server, and it's not already present.                                    // 39
  // <METEOR> Commented these lines out; we have _ via api.use.                                                   // 40
  // var _ = root._;                                                                                              // 41
  // if (!_ && (typeof require !== 'undefined')) _ = require('underscore');                                       // 42
  // </METEOR>                                                                                                    // 43
                                                                                                                  // 44
  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.                                      // 45
  var $ = root.jQuery || root.Zepto || root.ender;                                                                // 46
                                                                                                                  // 47
  // Set the JavaScript library that will be used for DOM manipulation and                                        // 48
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,                                  // 49
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an                                         // 50
  // alternate JavaScript library (or a mock library for testing your views                                       // 51
  // outside of a browser).                                                                                       // 52
  Backbone.setDomLibrary = function(lib) {                                                                        // 53
    $ = lib;                                                                                                      // 54
  };                                                                                                              // 55
                                                                                                                  // 56
  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable                                     // 57
  // to its previous owner. Returns a reference to this Backbone object.                                          // 58
  Backbone.noConflict = function() {                                                                              // 59
    root.Backbone = previousBackbone;                                                                             // 60
    return this;                                                                                                  // 61
  };                                                                                                              // 62
                                                                                                                  // 63
  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option                                    // 64
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and                                    // 65
  // set a `X-Http-Method-Override` header.                                                                       // 66
  Backbone.emulateHTTP = false;                                                                                   // 67
                                                                                                                  // 68
  // Turn on `emulateJSON` to support legacy servers that can't deal with direct                                  // 69
  // `application/json` requests ... will encode the body as                                                      // 70
  // `application/x-www-form-urlencoded` instead and will send the model in a                                     // 71
  // form param named `model`.                                                                                    // 72
  Backbone.emulateJSON = false;                                                                                   // 73
                                                                                                                  // 74
  // Backbone.Events                                                                                              // 75
  // -----------------                                                                                            // 76
                                                                                                                  // 77
  // Regular expression used to split event strings                                                               // 78
  var eventSplitter = /\s+/;                                                                                      // 79
                                                                                                                  // 80
  // A module that can be mixed in to *any object* in order to provide it with                                    // 81
  // custom events. You may bind with `on` or remove with `off` callback functions                                // 82
  // to an event; trigger`-ing an event fires all callbacks in succession.                                        // 83
  //                                                                                                              // 84
  //     var object = {};                                                                                         // 85
  //     _.extend(object, Backbone.Events);                                                                       // 86
  //     object.on('expand', function(){ alert('expanded'); });                                                   // 87
  //     object.trigger('expand');                                                                                // 88
  //                                                                                                              // 89
  var Events = Backbone.Events = {                                                                                // 90
                                                                                                                  // 91
    // Bind one or more space separated events, `events`, to a `callback`                                         // 92
    // function. Passing `"all"` will bind the callback to all events fired.                                      // 93
    on: function(events, callback, context) {                                                                     // 94
                                                                                                                  // 95
      var calls, event, node, tail, list;                                                                         // 96
      if (!callback) return this;                                                                                 // 97
      events = events.split(eventSplitter);                                                                       // 98
      calls = this._callbacks || (this._callbacks = {});                                                          // 99
                                                                                                                  // 100
      // Create an immutable callback list, allowing traversal during                                             // 101
      // modification.  The tail is an empty object that will always be used                                      // 102
      // as the next node.                                                                                        // 103
      while (event = events.shift()) {                                                                            // 104
        list = calls[event];                                                                                      // 105
        node = list ? list.tail : {};                                                                             // 106
        node.next = tail = {};                                                                                    // 107
        node.context = context;                                                                                   // 108
        node.callback = callback;                                                                                 // 109
        calls[event] = {tail: tail, next: list ? list.next : node};                                               // 110
      }                                                                                                           // 111
                                                                                                                  // 112
      return this;                                                                                                // 113
    },                                                                                                            // 114
                                                                                                                  // 115
    // Remove one or many callbacks. If `context` is null, removes all callbacks                                  // 116
    // with that function. If `callback` is null, removes all callbacks for the                                   // 117
    // event. If `events` is null, removes all bound callbacks for all events.                                    // 118
    off: function(events, callback, context) {                                                                    // 119
      var event, calls, node, tail, cb, ctx;                                                                      // 120
                                                                                                                  // 121
      // No events, or removing *all* events.                                                                     // 122
      if (!(calls = this._callbacks)) return;                                                                     // 123
      if (!(events || callback || context)) {                                                                     // 124
        delete this._callbacks;                                                                                   // 125
        return this;                                                                                              // 126
      }                                                                                                           // 127
                                                                                                                  // 128
      // Loop through the listed events and contexts, splicing them out of the                                    // 129
      // linked list of callbacks if appropriate.                                                                 // 130
      events = events ? events.split(eventSplitter) : _.keys(calls);                                              // 131
      while (event = events.shift()) {                                                                            // 132
        node = calls[event];                                                                                      // 133
        delete calls[event];                                                                                      // 134
        if (!node || !(callback || context)) continue;                                                            // 135
        // Create a new list, omitting the indicated callbacks.                                                   // 136
        tail = node.tail;                                                                                         // 137
        while ((node = node.next) !== tail) {                                                                     // 138
          cb = node.callback;                                                                                     // 139
          ctx = node.context;                                                                                     // 140
          if ((callback && cb !== callback) || (context && ctx !== context)) {                                    // 141
            this.on(event, cb, ctx);                                                                              // 142
          }                                                                                                       // 143
        }                                                                                                         // 144
      }                                                                                                           // 145
                                                                                                                  // 146
      return this;                                                                                                // 147
    },                                                                                                            // 148
                                                                                                                  // 149
    // Trigger one or many events, firing all bound callbacks. Callbacks are                                      // 150
    // passed the same arguments as `trigger` is, apart from the event name                                       // 151
    // (unless you're listening on `"all"`, which will cause your callback to                                     // 152
    // receive the true name of the event as the first argument).                                                 // 153
    trigger: function(events) {                                                                                   // 154
      var event, node, calls, tail, args, all, rest;                                                              // 155
      if (!(calls = this._callbacks)) return this;                                                                // 156
      all = calls.all;                                                                                            // 157
      events = events.split(eventSplitter);                                                                       // 158
      rest = slice.call(arguments, 1);                                                                            // 159
                                                                                                                  // 160
      // For each event, walk through the linked list of callbacks twice,                                         // 161
      // first to trigger the event, then to trigger any `"all"` callbacks.                                       // 162
      while (event = events.shift()) {                                                                            // 163
        if (node = calls[event]) {                                                                                // 164
          tail = node.tail;                                                                                       // 165
          while ((node = node.next) !== tail) {                                                                   // 166
            node.callback.apply(node.context || this, rest);                                                      // 167
          }                                                                                                       // 168
        }                                                                                                         // 169
        if (node = all) {                                                                                         // 170
          tail = node.tail;                                                                                       // 171
          args = [event].concat(rest);                                                                            // 172
          while ((node = node.next) !== tail) {                                                                   // 173
            node.callback.apply(node.context || this, args);                                                      // 174
          }                                                                                                       // 175
        }                                                                                                         // 176
      }                                                                                                           // 177
                                                                                                                  // 178
      return this;                                                                                                // 179
    }                                                                                                             // 180
                                                                                                                  // 181
  };                                                                                                              // 182
                                                                                                                  // 183
  // Aliases for backwards compatibility.                                                                         // 184
  Events.bind   = Events.on;                                                                                      // 185
  Events.unbind = Events.off;                                                                                     // 186
                                                                                                                  // 187
  // Backbone.Model                                                                                               // 188
  // --------------                                                                                               // 189
                                                                                                                  // 190
  // Create a new model, with defined attributes. A client id (`cid`)                                             // 191
  // is automatically generated and assigned for you.                                                             // 192
  var Model = Backbone.Model = function(attributes, options) {                                                    // 193
    var defaults;                                                                                                 // 194
    attributes || (attributes = {});                                                                              // 195
    if (options && options.parse) attributes = this.parse(attributes);                                            // 196
    if (defaults = getValue(this, 'defaults')) {                                                                  // 197
      attributes = _.extend({}, defaults, attributes);                                                            // 198
    }                                                                                                             // 199
    if (options && options.collection) this.collection = options.collection;                                      // 200
    this.attributes = {};                                                                                         // 201
    this._escapedAttributes = {};                                                                                 // 202
    this.cid = _.uniqueId('c');                                                                                   // 203
    this.changed = {};                                                                                            // 204
    this._silent = {};                                                                                            // 205
    this._pending = {};                                                                                           // 206
    this.set(attributes, {silent: true});                                                                         // 207
    // Reset change tracking.                                                                                     // 208
    this.changed = {};                                                                                            // 209
    this._silent = {};                                                                                            // 210
    this._pending = {};                                                                                           // 211
    this._previousAttributes = _.clone(this.attributes);                                                          // 212
    this.initialize.apply(this, arguments);                                                                       // 213
  };                                                                                                              // 214
                                                                                                                  // 215
  // Attach all inheritable methods to the Model prototype.                                                       // 216
  _.extend(Model.prototype, Events, {                                                                             // 217
                                                                                                                  // 218
    // A hash of attributes whose current and previous value differ.                                              // 219
    changed: null,                                                                                                // 220
                                                                                                                  // 221
    // A hash of attributes that have silently changed since the last time                                        // 222
    // `change` was called.  Will become pending attributes on the next call.                                     // 223
    _silent: null,                                                                                                // 224
                                                                                                                  // 225
    // A hash of attributes that have changed since the last `'change'` event                                     // 226
    // began.                                                                                                     // 227
    _pending: null,                                                                                               // 228
                                                                                                                  // 229
    // The default name for the JSON `id` attribute is `"id"`. MongoDB and                                        // 230
    // CouchDB users may want to set this to `"_id"`.                                                             // 231
    idAttribute: 'id',                                                                                            // 232
                                                                                                                  // 233
    // Initialize is an empty function by default. Override it with your own                                      // 234
    // initialization logic.                                                                                      // 235
    initialize: function(){},                                                                                     // 236
                                                                                                                  // 237
    // Return a copy of the model's `attributes` object.                                                          // 238
    toJSON: function(options) {                                                                                   // 239
      return _.clone(this.attributes);                                                                            // 240
    },                                                                                                            // 241
                                                                                                                  // 242
    // Get the value of an attribute.                                                                             // 243
    get: function(attr) {                                                                                         // 244
      return this.attributes[attr];                                                                               // 245
    },                                                                                                            // 246
                                                                                                                  // 247
    // Get the HTML-escaped value of an attribute.                                                                // 248
    escape: function(attr) {                                                                                      // 249
      var html;                                                                                                   // 250
      if (html = this._escapedAttributes[attr]) return html;                                                      // 251
      var val = this.get(attr);                                                                                   // 252
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);                               // 253
    },                                                                                                            // 254
                                                                                                                  // 255
    // Returns `true` if the attribute contains a value that is not null                                          // 256
    // or undefined.                                                                                              // 257
    has: function(attr) {                                                                                         // 258
      return this.get(attr) != null;                                                                              // 259
    },                                                                                                            // 260
                                                                                                                  // 261
    // Set a hash of model attributes on the object, firing `"change"` unless                                     // 262
    // you choose to silence it.                                                                                  // 263
    set: function(key, value, options) {                                                                          // 264
      var attrs, attr, val;                                                                                       // 265
                                                                                                                  // 266
      // Handle both `"key", value` and `{key: value}` -style arguments.                                          // 267
      if (_.isObject(key) || key == null) {                                                                       // 268
        attrs = key;                                                                                              // 269
        options = value;                                                                                          // 270
      } else {                                                                                                    // 271
        attrs = {};                                                                                               // 272
        attrs[key] = value;                                                                                       // 273
      }                                                                                                           // 274
                                                                                                                  // 275
      // Extract attributes and options.                                                                          // 276
      options || (options = {});                                                                                  // 277
      if (!attrs) return this;                                                                                    // 278
      if (attrs instanceof Model) attrs = attrs.attributes;                                                       // 279
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;                                                // 280
                                                                                                                  // 281
      // Run validation.                                                                                          // 282
      if (!this._validate(attrs, options)) return false;                                                          // 283
                                                                                                                  // 284
      // Check for changes of `id`.                                                                               // 285
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];                                           // 286
                                                                                                                  // 287
      var changes = options.changes = {};                                                                         // 288
      var now = this.attributes;                                                                                  // 289
      var escaped = this._escapedAttributes;                                                                      // 290
      var prev = this._previousAttributes || {};                                                                  // 291
                                                                                                                  // 292
      // For each `set` attribute...                                                                              // 293
      for (attr in attrs) {                                                                                       // 294
        val = attrs[attr];                                                                                        // 295
                                                                                                                  // 296
        // If the new and current value differ, record the change.                                                // 297
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {                                  // 298
          delete escaped[attr];                                                                                   // 299
          (options.silent ? this._silent : changes)[attr] = true;                                                 // 300
        }                                                                                                         // 301
                                                                                                                  // 302
        // Update or delete the current value.                                                                    // 303
        options.unset ? delete now[attr] : now[attr] = val;                                                       // 304
                                                                                                                  // 305
        // If the new and previous value differ, record the change.  If not,                                      // 306
        // then remove changes for this attribute.                                                                // 307
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {                             // 308
          this.changed[attr] = val;                                                                               // 309
          if (!options.silent) this._pending[attr] = true;                                                        // 310
        } else {                                                                                                  // 311
          delete this.changed[attr];                                                                              // 312
          delete this._pending[attr];                                                                             // 313
        }                                                                                                         // 314
      }                                                                                                           // 315
                                                                                                                  // 316
      // Fire the `"change"` events.                                                                              // 317
      if (!options.silent) this.change(options);                                                                  // 318
      return this;                                                                                                // 319
    },                                                                                                            // 320
                                                                                                                  // 321
    // Remove an attribute from the model, firing `"change"` unless you choose                                    // 322
    // to silence it. `unset` is a noop if the attribute doesn't exist.                                           // 323
    unset: function(attr, options) {                                                                              // 324
      (options || (options = {})).unset = true;                                                                   // 325
      return this.set(attr, null, options);                                                                       // 326
    },                                                                                                            // 327
                                                                                                                  // 328
    // Clear all attributes on the model, firing `"change"` unless you choose                                     // 329
    // to silence it.                                                                                             // 330
    clear: function(options) {                                                                                    // 331
      (options || (options = {})).unset = true;                                                                   // 332
      return this.set(_.clone(this.attributes), options);                                                         // 333
    },                                                                                                            // 334
                                                                                                                  // 335
    // Fetch the model from the server. If the server's representation of the                                     // 336
    // model differs from its current attributes, they will be overriden,                                         // 337
    // triggering a `"change"` event.                                                                             // 338
    fetch: function(options) {                                                                                    // 339
      options = options ? _.clone(options) : {};                                                                  // 340
      var model = this;                                                                                           // 341
      var success = options.success;                                                                              // 342
      options.success = function(resp, status, xhr) {                                                             // 343
        if (!model.set(model.parse(resp, xhr), options)) return false;                                            // 344
        if (success) success(model, resp);                                                                        // 345
      };                                                                                                          // 346
      options.error = Backbone.wrapError(options.error, model, options);                                          // 347
      return (this.sync || Backbone.sync).call(this, 'read', this, options);                                      // 348
    },                                                                                                            // 349
                                                                                                                  // 350
    // Set a hash of model attributes, and sync the model to the server.                                          // 351
    // If the server returns an attributes hash that differs, the model's                                         // 352
    // state will be `set` again.                                                                                 // 353
    save: function(key, value, options) {                                                                         // 354
      var attrs, current;                                                                                         // 355
                                                                                                                  // 356
      // Handle both `("key", value)` and `({key: value})` -style calls.                                          // 357
      if (_.isObject(key) || key == null) {                                                                       // 358
        attrs = key;                                                                                              // 359
        options = value;                                                                                          // 360
      } else {                                                                                                    // 361
        attrs = {};                                                                                               // 362
        attrs[key] = value;                                                                                       // 363
      }                                                                                                           // 364
      options = options ? _.clone(options) : {};                                                                  // 365
                                                                                                                  // 366
      // If we're "wait"-ing to set changed attributes, validate early.                                           // 367
      if (options.wait) {                                                                                         // 368
        if (!this._validate(attrs, options)) return false;                                                        // 369
        current = _.clone(this.attributes);                                                                       // 370
      }                                                                                                           // 371
                                                                                                                  // 372
      // Regular saves `set` attributes before persisting to the server.                                          // 373
      var silentOptions = _.extend({}, options, {silent: true});                                                  // 374
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {                                    // 375
        return false;                                                                                             // 376
      }                                                                                                           // 377
                                                                                                                  // 378
      // After a successful server-side save, the client is (optionally)                                          // 379
      // updated with the server-side state.                                                                      // 380
      var model = this;                                                                                           // 381
      var success = options.success;                                                                              // 382
      options.success = function(resp, status, xhr) {                                                             // 383
        var serverAttrs = model.parse(resp, xhr);                                                                 // 384
        if (options.wait) {                                                                                       // 385
          delete options.wait;                                                                                    // 386
          serverAttrs = _.extend(attrs || {}, serverAttrs);                                                       // 387
        }                                                                                                         // 388
        if (!model.set(serverAttrs, options)) return false;                                                       // 389
        if (success) {                                                                                            // 390
          success(model, resp);                                                                                   // 391
        } else {                                                                                                  // 392
          model.trigger('sync', model, resp, options);                                                            // 393
        }                                                                                                         // 394
      };                                                                                                          // 395
                                                                                                                  // 396
      // Finish configuring and sending the Ajax request.                                                         // 397
      options.error = Backbone.wrapError(options.error, model, options);                                          // 398
      var method = this.isNew() ? 'create' : 'update';                                                            // 399
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);                                   // 400
      if (options.wait) this.set(current, silentOptions);                                                         // 401
      return xhr;                                                                                                 // 402
    },                                                                                                            // 403
                                                                                                                  // 404
    // Destroy this model on the server if it was already persisted.                                              // 405
    // Optimistically removes the model from its collection, if it has one.                                       // 406
    // If `wait: true` is passed, waits for the server to respond before removal.                                 // 407
    destroy: function(options) {                                                                                  // 408
      options = options ? _.clone(options) : {};                                                                  // 409
      var model = this;                                                                                           // 410
      var success = options.success;                                                                              // 411
                                                                                                                  // 412
      var triggerDestroy = function() {                                                                           // 413
        model.trigger('destroy', model, model.collection, options);                                               // 414
      };                                                                                                          // 415
                                                                                                                  // 416
      if (this.isNew()) {                                                                                         // 417
        triggerDestroy();                                                                                         // 418
        return false;                                                                                             // 419
      }                                                                                                           // 420
                                                                                                                  // 421
      options.success = function(resp) {                                                                          // 422
        if (options.wait) triggerDestroy();                                                                       // 423
        if (success) {                                                                                            // 424
          success(model, resp);                                                                                   // 425
        } else {                                                                                                  // 426
          model.trigger('sync', model, resp, options);                                                            // 427
        }                                                                                                         // 428
      };                                                                                                          // 429
                                                                                                                  // 430
      options.error = Backbone.wrapError(options.error, model, options);                                          // 431
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);                                 // 432
      if (!options.wait) triggerDestroy();                                                                        // 433
      return xhr;                                                                                                 // 434
    },                                                                                                            // 435
                                                                                                                  // 436
    // Default URL for the model's representation on the server -- if you're                                      // 437
    // using Backbone's restful methods, override this to change the endpoint                                     // 438
    // that will be called.                                                                                       // 439
    url: function() {                                                                                             // 440
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();                     // 441
      if (this.isNew()) return base;                                                                              // 442
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);               // 443
    },                                                                                                            // 444
                                                                                                                  // 445
    // **parse** converts a response into the hash of attributes to be `set` on                                   // 446
    // the model. The default implementation is just to pass the response along.                                  // 447
    parse: function(resp, xhr) {                                                                                  // 448
      return resp;                                                                                                // 449
    },                                                                                                            // 450
                                                                                                                  // 451
    // Create a new model with identical attributes to this one.                                                  // 452
    clone: function() {                                                                                           // 453
      return new this.constructor(this.attributes);                                                               // 454
    },                                                                                                            // 455
                                                                                                                  // 456
    // A model is new if it has never been saved to the server, and lacks an id.                                  // 457
    isNew: function() {                                                                                           // 458
      return this.id == null;                                                                                     // 459
    },                                                                                                            // 460
                                                                                                                  // 461
    // Call this method to manually fire a `"change"` event for this model and                                    // 462
    // a `"change:attribute"` event for each changed attribute.                                                   // 463
    // Calling this will cause all objects observing the model to update.                                         // 464
    change: function(options) {                                                                                   // 465
      options || (options = {});                                                                                  // 466
      var changing = this._changing;                                                                              // 467
      this._changing = true;                                                                                      // 468
                                                                                                                  // 469
      // Silent changes become pending changes.                                                                   // 470
      for (var attr in this._silent) this._pending[attr] = true;                                                  // 471
                                                                                                                  // 472
      // Silent changes are triggered.                                                                            // 473
      var changes = _.extend({}, options.changes, this._silent);                                                  // 474
      this._silent = {};                                                                                          // 475
      for (var attr in changes) {                                                                                 // 476
        this.trigger('change:' + attr, this, this.get(attr), options);                                            // 477
      }                                                                                                           // 478
      if (changing) return this;                                                                                  // 479
                                                                                                                  // 480
      // Continue firing `"change"` events while there are pending changes.                                       // 481
      while (!_.isEmpty(this._pending)) {                                                                         // 482
        this._pending = {};                                                                                       // 483
        this.trigger('change', this, options);                                                                    // 484
        // Pending and silent changes still remain.                                                               // 485
        for (var attr in this.changed) {                                                                          // 486
          if (this._pending[attr] || this._silent[attr]) continue;                                                // 487
          delete this.changed[attr];                                                                              // 488
        }                                                                                                         // 489
        this._previousAttributes = _.clone(this.attributes);                                                      // 490
      }                                                                                                           // 491
                                                                                                                  // 492
      this._changing = false;                                                                                     // 493
      return this;                                                                                                // 494
    },                                                                                                            // 495
                                                                                                                  // 496
    // Determine if the model has changed since the last `"change"` event.                                        // 497
    // If you specify an attribute name, determine if that attribute has changed.                                 // 498
    hasChanged: function(attr) {                                                                                  // 499
      if (!arguments.length) return !_.isEmpty(this.changed);                                                     // 500
      return _.has(this.changed, attr);                                                                           // 501
    },                                                                                                            // 502
                                                                                                                  // 503
    // Return an object containing all the attributes that have changed, or                                       // 504
    // false if there are no changed attributes. Useful for determining what                                      // 505
    // parts of a view need to be updated and/or what attributes need to be                                       // 506
    // persisted to the server. Unset attributes will be set to undefined.                                        // 507
    // You can also pass an attributes object to diff against the model,                                          // 508
    // determining if there *would be* a change.                                                                  // 509
    changedAttributes: function(diff) {                                                                           // 510
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;                                        // 511
      var val, changed = false, old = this._previousAttributes;                                                   // 512
      for (var attr in diff) {                                                                                    // 513
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;                                                   // 514
        (changed || (changed = {}))[attr] = val;                                                                  // 515
      }                                                                                                           // 516
      return changed;                                                                                             // 517
    },                                                                                                            // 518
                                                                                                                  // 519
    // Get the previous value of an attribute, recorded at the time the last                                      // 520
    // `"change"` event was fired.                                                                                // 521
    previous: function(attr) {                                                                                    // 522
      if (!arguments.length || !this._previousAttributes) return null;                                            // 523
      return this._previousAttributes[attr];                                                                      // 524
    },                                                                                                            // 525
                                                                                                                  // 526
    // Get all of the attributes of the model at the time of the previous                                         // 527
    // `"change"` event.                                                                                          // 528
    previousAttributes: function() {                                                                              // 529
      return _.clone(this._previousAttributes);                                                                   // 530
    },                                                                                                            // 531
                                                                                                                  // 532
    // Check if the model is currently in a valid state. It's only possible to                                    // 533
    // get into an *invalid* state if you're using silent changes.                                                // 534
    isValid: function() {                                                                                         // 535
      return !this.validate(this.attributes);                                                                     // 536
    },                                                                                                            // 537
                                                                                                                  // 538
    // Run validation against the next complete set of model attributes,                                          // 539
    // returning `true` if all is well. If a specific `error` callback has                                        // 540
    // been passed, call that instead of firing the general `"error"` event.                                      // 541
    _validate: function(attrs, options) {                                                                         // 542
      if (options.silent || !this.validate) return true;                                                          // 543
      attrs = _.extend({}, this.attributes, attrs);                                                               // 544
      var error = this.validate(attrs, options);                                                                  // 545
      if (!error) return true;                                                                                    // 546
      if (options && options.error) {                                                                             // 547
        options.error(this, error, options);                                                                      // 548
      } else {                                                                                                    // 549
        this.trigger('error', this, error, options);                                                              // 550
      }                                                                                                           // 551
      return false;                                                                                               // 552
    }                                                                                                             // 553
                                                                                                                  // 554
  });                                                                                                             // 555
                                                                                                                  // 556
  // Backbone.Collection                                                                                          // 557
  // -------------------                                                                                          // 558
                                                                                                                  // 559
  // Provides a standard collection class for our sets of models, ordered                                         // 560
  // or unordered. If a `comparator` is specified, the Collection will maintain                                   // 561
  // its models in sort order, as they're added and removed.                                                      // 562
  var Collection = Backbone.Collection = function(models, options) {                                              // 563
    options || (options = {});                                                                                    // 564
    if (options.model) this.model = options.model;                                                                // 565
    if (options.comparator) this.comparator = options.comparator;                                                 // 566
    this._reset();                                                                                                // 567
    this.initialize.apply(this, arguments);                                                                       // 568
    if (models) this.reset(models, {silent: true, parse: options.parse});                                         // 569
  };                                                                                                              // 570
                                                                                                                  // 571
  // Define the Collection's inheritable methods.                                                                 // 572
  _.extend(Collection.prototype, Events, {                                                                        // 573
                                                                                                                  // 574
    // The default model for a collection is just a **Backbone.Model**.                                           // 575
    // This should be overridden in most cases.                                                                   // 576
    model: Model,                                                                                                 // 577
                                                                                                                  // 578
    // Initialize is an empty function by default. Override it with your own                                      // 579
    // initialization logic.                                                                                      // 580
    initialize: function(){},                                                                                     // 581
                                                                                                                  // 582
    // The JSON representation of a Collection is an array of the                                                 // 583
    // models' attributes.                                                                                        // 584
    toJSON: function(options) {                                                                                   // 585
      return this.map(function(model){ return model.toJSON(options); });                                          // 586
    },                                                                                                            // 587
                                                                                                                  // 588
    // Add a model, or list of models to the set. Pass **silent** to avoid                                        // 589
    // firing the `add` event for every new model.                                                                // 590
    add: function(models, options) {                                                                              // 591
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];                                       // 592
      options || (options = {});                                                                                  // 593
      models = _.isArray(models) ? models.slice() : [models];                                                     // 594
                                                                                                                  // 595
      // Begin by turning bare objects into model references, and preventing                                      // 596
      // invalid models or duplicate models from being added.                                                     // 597
      for (i = 0, length = models.length; i < length; i++) {                                                      // 598
        if (!(model = models[i] = this._prepareModel(models[i], options))) {                                      // 599
          throw new Error("Can't add an invalid model to a collection");                                          // 600
        }                                                                                                         // 601
        cid = model.cid;                                                                                          // 602
        id = model.id;                                                                                            // 603
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {                     // 604
          dups.push(i);                                                                                           // 605
          continue;                                                                                               // 606
        }                                                                                                         // 607
        cids[cid] = ids[id] = model;                                                                              // 608
      }                                                                                                           // 609
                                                                                                                  // 610
      // Remove duplicates.                                                                                       // 611
      i = dups.length;                                                                                            // 612
      while (i--) {                                                                                               // 613
        models.splice(dups[i], 1);                                                                                // 614
      }                                                                                                           // 615
                                                                                                                  // 616
      // Listen to added models' events, and index models for lookup by                                           // 617
      // `id` and by `cid`.                                                                                       // 618
      for (i = 0, length = models.length; i < length; i++) {                                                      // 619
        (model = models[i]).on('all', this._onModelEvent, this);                                                  // 620
        this._byCid[model.cid] = model;                                                                           // 621
        if (model.id != null) this._byId[model.id] = model;                                                       // 622
      }                                                                                                           // 623
                                                                                                                  // 624
      // Insert models into the collection, re-sorting if needed, and triggering                                  // 625
      // `add` events unless silenced.                                                                            // 626
      this.length += length;                                                                                      // 627
      index = options.at != null ? options.at : this.models.length;                                               // 628
      splice.apply(this.models, [index, 0].concat(models));                                                       // 629
      if (this.comparator) this.sort({silent: true});                                                             // 630
      if (options.silent) return this;                                                                            // 631
      for (i = 0, length = this.models.length; i < length; i++) {                                                 // 632
        if (!cids[(model = this.models[i]).cid]) continue;                                                        // 633
        options.index = i;                                                                                        // 634
        model.trigger('add', model, this, options);                                                               // 635
      }                                                                                                           // 636
      return this;                                                                                                // 637
    },                                                                                                            // 638
                                                                                                                  // 639
    // Remove a model, or a list of models from the set. Pass silent to avoid                                     // 640
    // firing the `remove` event for every model removed.                                                         // 641
    remove: function(models, options) {                                                                           // 642
      var i, l, index, model;                                                                                     // 643
      options || (options = {});                                                                                  // 644
      models = _.isArray(models) ? models.slice() : [models];                                                     // 645
      for (i = 0, l = models.length; i < l; i++) {                                                                // 646
        model = this.getByCid(models[i]) || this.get(models[i]);                                                  // 647
        if (!model) continue;                                                                                     // 648
        delete this._byId[model.id];                                                                              // 649
        delete this._byCid[model.cid];                                                                            // 650
        index = this.indexOf(model);                                                                              // 651
        this.models.splice(index, 1);                                                                             // 652
        this.length--;                                                                                            // 653
        if (!options.silent) {                                                                                    // 654
          options.index = index;                                                                                  // 655
          model.trigger('remove', model, this, options);                                                          // 656
        }                                                                                                         // 657
        this._removeReference(model);                                                                             // 658
      }                                                                                                           // 659
      return this;                                                                                                // 660
    },                                                                                                            // 661
                                                                                                                  // 662
    // Add a model to the end of the collection.                                                                  // 663
    push: function(model, options) {                                                                              // 664
      model = this._prepareModel(model, options);                                                                 // 665
      this.add(model, options);                                                                                   // 666
      return model;                                                                                               // 667
    },                                                                                                            // 668
                                                                                                                  // 669
    // Remove a model from the end of the collection.                                                             // 670
    pop: function(options) {                                                                                      // 671
      var model = this.at(this.length - 1);                                                                       // 672
      this.remove(model, options);                                                                                // 673
      return model;                                                                                               // 674
    },                                                                                                            // 675
                                                                                                                  // 676
    // Add a model to the beginning of the collection.                                                            // 677
    unshift: function(model, options) {                                                                           // 678
      model = this._prepareModel(model, options);                                                                 // 679
      this.add(model, _.extend({at: 0}, options));                                                                // 680
      return model;                                                                                               // 681
    },                                                                                                            // 682
                                                                                                                  // 683
    // Remove a model from the beginning of the collection.                                                       // 684
    shift: function(options) {                                                                                    // 685
      var model = this.at(0);                                                                                     // 686
      this.remove(model, options);                                                                                // 687
      return model;                                                                                               // 688
    },                                                                                                            // 689
                                                                                                                  // 690
    // Get a model from the set by id.                                                                            // 691
    get: function(id) {                                                                                           // 692
      if (id == null) return void 0;                                                                              // 693
      return this._byId[id.id != null ? id.id : id];                                                              // 694
    },                                                                                                            // 695
                                                                                                                  // 696
    // Get a model from the set by client id.                                                                     // 697
    getByCid: function(cid) {                                                                                     // 698
      return cid && this._byCid[cid.cid || cid];                                                                  // 699
    },                                                                                                            // 700
                                                                                                                  // 701
    // Get the model at the given index.                                                                          // 702
    at: function(index) {                                                                                         // 703
      return this.models[index];                                                                                  // 704
    },                                                                                                            // 705
                                                                                                                  // 706
    // Return models with matching attributes. Useful for simple cases of `filter`.                               // 707
    where: function(attrs) {                                                                                      // 708
      if (_.isEmpty(attrs)) return [];                                                                            // 709
      return this.filter(function(model) {                                                                        // 710
        for (var key in attrs) {                                                                                  // 711
          if (attrs[key] !== model.get(key)) return false;                                                        // 712
        }                                                                                                         // 713
        return true;                                                                                              // 714
      });                                                                                                         // 715
    },                                                                                                            // 716
                                                                                                                  // 717
    // Force the collection to re-sort itself. You don't need to call this under                                  // 718
    // normal circumstances, as the set will maintain sort order as each item                                     // 719
    // is added.                                                                                                  // 720
    sort: function(options) {                                                                                     // 721
      options || (options = {});                                                                                  // 722
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');                            // 723
      var boundComparator = _.bind(this.comparator, this);                                                        // 724
      if (this.comparator.length == 1) {                                                                          // 725
        this.models = this.sortBy(boundComparator);                                                               // 726
      } else {                                                                                                    // 727
        this.models.sort(boundComparator);                                                                        // 728
      }                                                                                                           // 729
      if (!options.silent) this.trigger('reset', this, options);                                                  // 730
      return this;                                                                                                // 731
    },                                                                                                            // 732
                                                                                                                  // 733
    // Pluck an attribute from each model in the collection.                                                      // 734
    pluck: function(attr) {                                                                                       // 735
      return _.map(this.models, function(model){ return model.get(attr); });                                      // 736
    },                                                                                                            // 737
                                                                                                                  // 738
    // When you have more items than you want to add or remove individually,                                      // 739
    // you can reset the entire set with a new list of models, without firing                                     // 740
    // any `add` or `remove` events. Fires `reset` when finished.                                                 // 741
    reset: function(models, options) {                                                                            // 742
      models  || (models = []);                                                                                   // 743
      options || (options = {});                                                                                  // 744
      for (var i = 0, l = this.models.length; i < l; i++) {                                                       // 745
        this._removeReference(this.models[i]);                                                                    // 746
      }                                                                                                           // 747
      this._reset();                                                                                              // 748
      this.add(models, _.extend({silent: true}, options));                                                        // 749
      if (!options.silent) this.trigger('reset', this, options);                                                  // 750
      return this;                                                                                                // 751
    },                                                                                                            // 752
                                                                                                                  // 753
    // Fetch the default set of models for this collection, resetting the                                         // 754
    // collection when they arrive. If `add: true` is passed, appends the                                         // 755
    // models to the collection instead of resetting.                                                             // 756
    fetch: function(options) {                                                                                    // 757
      options = options ? _.clone(options) : {};                                                                  // 758
      if (options.parse === undefined) options.parse = true;                                                      // 759
      var collection = this;                                                                                      // 760
      var success = options.success;                                                                              // 761
      options.success = function(resp, status, xhr) {                                                             // 762
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);                          // 763
        if (success) success(collection, resp);                                                                   // 764
      };                                                                                                          // 765
      options.error = Backbone.wrapError(options.error, collection, options);                                     // 766
      return (this.sync || Backbone.sync).call(this, 'read', this, options);                                      // 767
    },                                                                                                            // 768
                                                                                                                  // 769
    // Create a new instance of a model in this collection. Add the model to the                                  // 770
    // collection immediately, unless `wait: true` is passed, in which case we                                    // 771
    // wait for the server to agree.                                                                              // 772
    create: function(model, options) {                                                                            // 773
      var coll = this;                                                                                            // 774
      options = options ? _.clone(options) : {};                                                                  // 775
      model = this._prepareModel(model, options);                                                                 // 776
      if (!model) return false;                                                                                   // 777
      if (!options.wait) coll.add(model, options);                                                                // 778
      var success = options.success;                                                                              // 779
      options.success = function(nextModel, resp, xhr) {                                                          // 780
        if (options.wait) coll.add(nextModel, options);                                                           // 781
        if (success) {                                                                                            // 782
          success(nextModel, resp);                                                                               // 783
        } else {                                                                                                  // 784
          nextModel.trigger('sync', model, resp, options);                                                        // 785
        }                                                                                                         // 786
      };                                                                                                          // 787
      model.save(null, options);                                                                                  // 788
      return model;                                                                                               // 789
    },                                                                                                            // 790
                                                                                                                  // 791
    // **parse** converts a response into a list of models to be added to the                                     // 792
    // collection. The default implementation is just to pass it through.                                         // 793
    parse: function(resp, xhr) {                                                                                  // 794
      return resp;                                                                                                // 795
    },                                                                                                            // 796
                                                                                                                  // 797
    // Proxy to _'s chain. Can't be proxied the same way the rest of the                                          // 798
    // underscore methods are proxied because it relies on the underscore                                         // 799
    // constructor.                                                                                               // 800
    chain: function () {                                                                                          // 801
      return _(this.models).chain();                                                                              // 802
    },                                                                                                            // 803
                                                                                                                  // 804
    // Reset all internal state. Called when the collection is reset.                                             // 805
    _reset: function(options) {                                                                                   // 806
      this.length = 0;                                                                                            // 807
      this.models = [];                                                                                           // 808
      this._byId  = {};                                                                                           // 809
      this._byCid = {};                                                                                           // 810
    },                                                                                                            // 811
                                                                                                                  // 812
    // Prepare a model or hash of attributes to be added to this collection.                                      // 813
    _prepareModel: function(model, options) {                                                                     // 814
      options || (options = {});                                                                                  // 815
      if (!(model instanceof Model)) {                                                                            // 816
        var attrs = model;                                                                                        // 817
        options.collection = this;                                                                                // 818
        model = new this.model(attrs, options);                                                                   // 819
        if (!model._validate(model.attributes, options)) model = false;                                           // 820
      } else if (!model.collection) {                                                                             // 821
        model.collection = this;                                                                                  // 822
      }                                                                                                           // 823
      return model;                                                                                               // 824
    },                                                                                                            // 825
                                                                                                                  // 826
    // Internal method to remove a model's ties to a collection.                                                  // 827
    _removeReference: function(model) {                                                                           // 828
      if (this == model.collection) {                                                                             // 829
        delete model.collection;                                                                                  // 830
      }                                                                                                           // 831
      model.off('all', this._onModelEvent, this);                                                                 // 832
    },                                                                                                            // 833
                                                                                                                  // 834
    // Internal method called every time a model in the set fires an event.                                       // 835
    // Sets need to update their indexes when models change ids. All other                                        // 836
    // events simply proxy through. "add" and "remove" events that originate                                      // 837
    // in other collections are ignored.                                                                          // 838
    _onModelEvent: function(event, model, collection, options) {                                                  // 839
      if ((event == 'add' || event == 'remove') && collection != this) return;                                    // 840
      if (event == 'destroy') {                                                                                   // 841
        this.remove(model, options);                                                                              // 842
      }                                                                                                           // 843
      if (model && event === 'change:' + model.idAttribute) {                                                     // 844
        delete this._byId[model.previous(model.idAttribute)];                                                     // 845
        this._byId[model.id] = model;                                                                             // 846
      }                                                                                                           // 847
      this.trigger.apply(this, arguments);                                                                        // 848
    }                                                                                                             // 849
                                                                                                                  // 850
  });                                                                                                             // 851
                                                                                                                  // 852
  // Underscore methods that we want to implement on the Collection.                                              // 853
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',                                       // 854
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',                                        // 855
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',                                       // 856
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',                                  // 857
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];                                                              // 858
                                                                                                                  // 859
  // Mix in each Underscore method as a proxy to `Collection#models`.                                             // 860
  _.each(methods, function(method) {                                                                              // 861
    Collection.prototype[method] = function() {                                                                   // 862
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));                                      // 863
    };                                                                                                            // 864
  });                                                                                                             // 865
                                                                                                                  // 866
  // Backbone.Router                                                                                              // 867
  // -------------------                                                                                          // 868
                                                                                                                  // 869
  // Routers map faux-URLs to actions, and fire events when routes are                                            // 870
  // matched. Creating a new one sets its `routes` hash, if not set statically.                                   // 871
  var Router = Backbone.Router = function(options) {                                                              // 872
    options || (options = {});                                                                                    // 873
    if (options.routes) this.routes = options.routes;                                                             // 874
    this._bindRoutes();                                                                                           // 875
    this.initialize.apply(this, arguments);                                                                       // 876
  };                                                                                                              // 877
                                                                                                                  // 878
  // Cached regular expressions for matching named param parts and splatted                                       // 879
  // parts of route strings.                                                                                      // 880
  var namedParam    = /:\w+/g;                                                                                    // 881
  var splatParam    = /\*\w+/g;                                                                                   // 882
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;                                                                  // 883
                                                                                                                  // 884
  // Set up all inheritable **Backbone.Router** properties and methods.                                           // 885
  _.extend(Router.prototype, Events, {                                                                            // 886
                                                                                                                  // 887
    // Initialize is an empty function by default. Override it with your own                                      // 888
    // initialization logic.                                                                                      // 889
    initialize: function(){},                                                                                     // 890
                                                                                                                  // 891
    // Manually bind a single named route to a callback. For example:                                             // 892
    //                                                                                                            // 893
    //     this.route('search/:query/p:num', 'search', function(query, num) {                                     // 894
    //       ...                                                                                                  // 895
    //     });                                                                                                    // 896
    //                                                                                                            // 897
    route: function(route, name, callback) {                                                                      // 898
      Backbone.history || (Backbone.history = new History);                                                       // 899
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);                                                 // 900
      if (!callback) callback = this[name];                                                                       // 901
      Backbone.history.route(route, _.bind(function(fragment) {                                                   // 902
        var args = this._extractParameters(route, fragment);                                                      // 903
        callback && callback.apply(this, args);                                                                   // 904
        this.trigger.apply(this, ['route:' + name].concat(args));                                                 // 905
        Backbone.history.trigger('route', this, name, args);                                                      // 906
      }, this));                                                                                                  // 907
      return this;                                                                                                // 908
    },                                                                                                            // 909
                                                                                                                  // 910
    // Simple proxy to `Backbone.history` to save a fragment into the history.                                    // 911
    navigate: function(fragment, options) {                                                                       // 912
      Backbone.history.navigate(fragment, options);                                                               // 913
    },                                                                                                            // 914
                                                                                                                  // 915
    // Bind all defined routes to `Backbone.history`. We have to reverse the                                      // 916
    // order of the routes here to support behavior where the most general                                        // 917
    // routes can be defined at the bottom of the route map.                                                      // 918
    _bindRoutes: function() {                                                                                     // 919
      if (!this.routes) return;                                                                                   // 920
      var routes = [];                                                                                            // 921
      for (var route in this.routes) {                                                                            // 922
        routes.unshift([route, this.routes[route]]);                                                              // 923
      }                                                                                                           // 924
      for (var i = 0, l = routes.length; i < l; i++) {                                                            // 925
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);                                               // 926
      }                                                                                                           // 927
    },                                                                                                            // 928
                                                                                                                  // 929
    // Convert a route string into a regular expression, suitable for matching                                    // 930
    // against the current location hash.                                                                         // 931
    _routeToRegExp: function(route) {                                                                             // 932
      route = route.replace(escapeRegExp, '\\$&')                                                                 // 933
                   .replace(namedParam, '([^\/]+)')                                                               // 934
                   .replace(splatParam, '(.*?)');                                                                 // 935
      return new RegExp('^' + route + '$');                                                                       // 936
    },                                                                                                            // 937
                                                                                                                  // 938
    // Given a route, and a URL fragment that it matches, return the array of                                     // 939
    // extracted parameters.                                                                                      // 940
    _extractParameters: function(route, fragment) {                                                               // 941
      return route.exec(fragment).slice(1);                                                                       // 942
    }                                                                                                             // 943
                                                                                                                  // 944
  });                                                                                                             // 945
                                                                                                                  // 946
  // Backbone.History                                                                                             // 947
  // ----------------                                                                                             // 948
                                                                                                                  // 949
  // Handles cross-browser history management, based on URL fragments. If the                                     // 950
  // browser does not support `onhashchange`, falls back to polling.                                              // 951
  var History = Backbone.History = function() {                                                                   // 952
    this.handlers = [];                                                                                           // 953
    _.bindAll(this, 'checkUrl');                                                                                  // 954
  };                                                                                                              // 955
                                                                                                                  // 956
  // Cached regex for cleaning leading hashes and slashes .                                                       // 957
  var routeStripper = /^[#\/]/;                                                                                   // 958
                                                                                                                  // 959
  // Cached regex for detecting MSIE.                                                                             // 960
  var isExplorer = /msie [\w.]+/;                                                                                 // 961
                                                                                                                  // 962
  // Has the history handling already been started?                                                               // 963
  History.started = false;                                                                                        // 964
                                                                                                                  // 965
  // Set up all inheritable **Backbone.History** properties and methods.                                          // 966
  _.extend(History.prototype, Events, {                                                                           // 967
                                                                                                                  // 968
    // The default interval to poll for hash changes, if necessary, is                                            // 969
    // twenty times a second.                                                                                     // 970
    interval: 50,                                                                                                 // 971
                                                                                                                  // 972
    // Gets the true hash value. Cannot use location.hash directly due to bug                                     // 973
    // in Firefox where location.hash will always be decoded.                                                     // 974
    getHash: function(windowOverride) {                                                                           // 975
      var loc = windowOverride ? windowOverride.location : window.location;                                       // 976
      var match = loc.href.match(/#(.*)$/);                                                                       // 977
      return match ? match[1] : '';                                                                               // 978
    },                                                                                                            // 979
                                                                                                                  // 980
    // Get the cross-browser normalized URL fragment, either from the URL,                                        // 981
    // the hash, or the override.                                                                                 // 982
    getFragment: function(fragment, forcePushState) {                                                             // 983
      if (fragment == null) {                                                                                     // 984
        if (this._hasPushState || forcePushState) {                                                               // 985
          fragment = window.location.pathname;                                                                    // 986
          var search = window.location.search;                                                                    // 987
          if (search) fragment += search;                                                                         // 988
        } else {                                                                                                  // 989
          fragment = this.getHash();                                                                              // 990
        }                                                                                                         // 991
      }                                                                                                           // 992
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);             // 993
      return fragment.replace(routeStripper, '');                                                                 // 994
    },                                                                                                            // 995
                                                                                                                  // 996
    // Start the hash change handling, returning `true` if the current URL matches                                // 997
    // an existing route, and `false` otherwise.                                                                  // 998
    start: function(options) {                                                                                    // 999
      if (History.started) throw new Error("Backbone.history has already been started");                          // 1000
      // <METEOR>                                                                                                 // 1001
      if (typeof window === 'undefined')                                                                          // 1002
        throw new Error("Backbone.History is client-only, can't start on the server");                            // 1003
      // </METEOR>                                                                                                // 1004
      History.started = true;                                                                                     // 1005
                                                                                                                  // 1006
      // Figure out the initial configuration. Do we need an iframe?                                              // 1007
      // Is pushState desired ... is it available?                                                                // 1008
      this.options          = _.extend({}, {root: '/'}, this.options, options);                                   // 1009
      this._wantsHashChange = this.options.hashChange !== false;                                                  // 1010
      this._wantsPushState  = !!this.options.pushState;                                                           // 1011
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);           // 1012
      var fragment          = this.getFragment();                                                                 // 1013
      var docMode           = document.documentMode;                                                              // 1014
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7)); // 1015
                                                                                                                  // 1016
      if (oldIE) {                                                                                                // 1017
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;  // 1018
        this.navigate(fragment);                                                                                  // 1019
      }                                                                                                           // 1020
                                                                                                                  // 1021
      // Depending on whether we're using pushState or hashes, and whether                                        // 1022
      // 'onhashchange' is supported, determine how we check the URL state.                                       // 1023
      if (this._hasPushState) {                                                                                   // 1024
        $(window).bind('popstate', this.checkUrl);                                                                // 1025
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {                                 // 1026
        $(window).bind('hashchange', this.checkUrl);                                                              // 1027
      } else if (this._wantsHashChange) {                                                                         // 1028
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);                                       // 1029
      }                                                                                                           // 1030
                                                                                                                  // 1031
      // Determine if we need to change the base url, for a pushState link                                        // 1032
      // opened by a non-pushState browser.                                                                       // 1033
      this.fragment = fragment;                                                                                   // 1034
      var loc = window.location;                                                                                  // 1035
      var atRoot  = loc.pathname == this.options.root;                                                            // 1036
                                                                                                                  // 1037
      // If we've started off with a route from a `pushState`-enabled browser,                                    // 1038
      // but we're currently in a browser that doesn't support it...                                              // 1039
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {                      // 1040
        this.fragment = this.getFragment(null, true);                                                             // 1041
        window.location.replace(this.options.root + '#' + this.fragment);                                         // 1042
        // Return immediately as browser will do redirect to new url                                              // 1043
        return true;                                                                                              // 1044
                                                                                                                  // 1045
      // Or if we've started out with a hash-based route, but we're currently                                     // 1046
      // in a browser where it could be `pushState`-based instead...                                              // 1047
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {                              // 1048
        this.fragment = this.getHash().replace(routeStripper, '');                                                // 1049
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }                                                                                                           // 1051
                                                                                                                  // 1052
      if (!this.options.silent) {                                                                                 // 1053
        return this.loadUrl();                                                                                    // 1054
      }                                                                                                           // 1055
    },                                                                                                            // 1056
                                                                                                                  // 1057
    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,                                   // 1058
    // but possibly useful for unit testing Routers.                                                              // 1059
    stop: function() {                                                                                            // 1060
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);                            // 1061
      clearInterval(this._checkUrlInterval);                                                                      // 1062
      History.started = false;                                                                                    // 1063
    },                                                                                                            // 1064
                                                                                                                  // 1065
    // Add a route to be tested when the fragment changes. Routes added later                                     // 1066
    // may override previous routes.                                                                              // 1067
    route: function(route, callback) {                                                                            // 1068
      this.handlers.unshift({route: route, callback: callback});                                                  // 1069
    },                                                                                                            // 1070
                                                                                                                  // 1071
    // Checks the current URL to see if it has changed, and if it has,                                            // 1072
    // calls `loadUrl`, normalizing across the hidden iframe.                                                     // 1073
    checkUrl: function(e) {                                                                                       // 1074
      var current = this.getFragment();                                                                           // 1075
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));         // 1076
      if (current == this.fragment) return false;                                                                 // 1077
      if (this.iframe) this.navigate(current);                                                                    // 1078
      this.loadUrl() || this.loadUrl(this.getHash());                                                             // 1079
    },                                                                                                            // 1080
                                                                                                                  // 1081
    // Attempt to load the current URL fragment. If a route succeeds with a                                       // 1082
    // match, returns `true`. If no defined routes matches the fragment,                                          // 1083
    // returns `false`.                                                                                           // 1084
    loadUrl: function(fragmentOverride) {                                                                         // 1085
      var fragment = this.fragment = this.getFragment(fragmentOverride);                                          // 1086
      var matched = _.any(this.handlers, function(handler) {                                                      // 1087
        if (handler.route.test(fragment)) {                                                                       // 1088
          handler.callback(fragment);                                                                             // 1089
          return true;                                                                                            // 1090
        }                                                                                                         // 1091
      });                                                                                                         // 1092
      return matched;                                                                                             // 1093
    },                                                                                                            // 1094
                                                                                                                  // 1095
    // Save a fragment into the hash history, or replace the URL state if the                                     // 1096
    // 'replace' option is passed. You are responsible for properly URL-encoding                                  // 1097
    // the fragment in advance.                                                                                   // 1098
    //                                                                                                            // 1099
    // The options object can contain `trigger: true` if you wish to have the                                     // 1100
    // route callback be fired (not usually desirable), or `replace: true`, if                                    // 1101
    // you wish to modify the current URL without adding an entry to the history.                                 // 1102
    navigate: function(fragment, options) {                                                                       // 1103
      if (!History.started) return false;                                                                         // 1104
      if (!options || options === true) options = {trigger: options};                                             // 1105
      var frag = (fragment || '').replace(routeStripper, '');                                                     // 1106
      if (this.fragment == frag) return;                                                                          // 1107
                                                                                                                  // 1108
      // If pushState is available, we use it to set the fragment as a real URL.                                  // 1109
      if (this._hasPushState) {                                                                                   // 1110
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;                                // 1111
        this.fragment = frag;                                                                                     // 1112
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);                 // 1113
                                                                                                                  // 1114
      // If hash changes haven't been explicitly disabled, update the hash                                        // 1115
      // fragment to store history.                                                                               // 1116
      } else if (this._wantsHashChange) {                                                                         // 1117
        this.fragment = frag;                                                                                     // 1118
        this._updateHash(window.location, frag, options.replace);                                                 // 1119
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {                               // 1120
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.    // 1121
          // When replace is true, we don't want this.                                                            // 1122
          if(!options.replace) this.iframe.document.open().close();                                               // 1123
          this._updateHash(this.iframe.location, frag, options.replace);                                          // 1124
        }                                                                                                         // 1125
                                                                                                                  // 1126
      // If you've told us that you explicitly don't want fallback hashchange-                                    // 1127
      // based history, then `navigate` becomes a page refresh.                                                   // 1128
      } else {                                                                                                    // 1129
        window.location.assign(this.options.root + fragment);                                                     // 1130
      }                                                                                                           // 1131
      if (options.trigger) this.loadUrl(fragment);                                                                // 1132
    },                                                                                                            // 1133
                                                                                                                  // 1134
    // Update the hash location, either replacing the current entry, or adding                                    // 1135
    // a new one to the browser history.                                                                          // 1136
    _updateHash: function(location, fragment, replace) {                                                          // 1137
      if (replace) {                                                                                              // 1138
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);                 // 1139
      } else {                                                                                                    // 1140
        location.hash = fragment;                                                                                 // 1141
      }                                                                                                           // 1142
    }                                                                                                             // 1143
  });                                                                                                             // 1144
                                                                                                                  // 1145
  // Backbone.View                                                                                                // 1146
  // -------------                                                                                                // 1147
                                                                                                                  // 1148
  // Creating a Backbone.View creates its initial element outside of the DOM,                                     // 1149
  // if an existing element is not provided...                                                                    // 1150
  var View = Backbone.View = function(options) {                                                                  // 1151
    this.cid = _.uniqueId('view');                                                                                // 1152
    this._configure(options || {});                                                                               // 1153
    this._ensureElement();                                                                                        // 1154
    this.initialize.apply(this, arguments);                                                                       // 1155
    this.delegateEvents();                                                                                        // 1156
  };                                                                                                              // 1157
                                                                                                                  // 1158
  // Cached regex to split keys for `delegate`.                                                                   // 1159
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;                                                                   // 1160
                                                                                                                  // 1161
  // List of view options to be merged as properties.                                                             // 1162
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];                    // 1163
                                                                                                                  // 1164
  // Set up all inheritable **Backbone.View** properties and methods.                                             // 1165
  _.extend(View.prototype, Events, {                                                                              // 1166
                                                                                                                  // 1167
    // The default `tagName` of a View's element is `"div"`.                                                      // 1168
    tagName: 'div',                                                                                               // 1169
                                                                                                                  // 1170
    // jQuery delegate for element lookup, scoped to DOM elements within the                                      // 1171
    // current view. This should be prefered to global lookups where possible.                                    // 1172
    $: function(selector) {                                                                                       // 1173
      return this.$el.find(selector);                                                                             // 1174
    },                                                                                                            // 1175
                                                                                                                  // 1176
    // Initialize is an empty function by default. Override it with your own                                      // 1177
    // initialization logic.                                                                                      // 1178
    initialize: function(){},                                                                                     // 1179
                                                                                                                  // 1180
    // **render** is the core function that your view should override, in order                                   // 1181
    // to populate its element (`this.el`), with the appropriate HTML. The                                        // 1182
    // convention is for **render** to always return `this`.                                                      // 1183
    render: function() {                                                                                          // 1184
      return this;                                                                                                // 1185
    },                                                                                                            // 1186
                                                                                                                  // 1187
    // Remove this view from the DOM. Note that the view isn't present in the                                     // 1188
    // DOM by default, so calling this method may be a no-op.                                                     // 1189
    remove: function() {                                                                                          // 1190
      this.$el.remove();                                                                                          // 1191
      return this;                                                                                                // 1192
    },                                                                                                            // 1193
                                                                                                                  // 1194
    // For small amounts of DOM Elements, where a full-blown template isn't                                       // 1195
    // needed, use **make** to manufacture elements, one at a time.                                               // 1196
    //                                                                                                            // 1197
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));                                // 1198
    //                                                                                                            // 1199
    make: function(tagName, attributes, content) {                                                                // 1200
      var el = document.createElement(tagName);                                                                   // 1201
      if (attributes) $(el).attr(attributes);                                                                     // 1202
      if (content) $(el).html(content);                                                                           // 1203
      return el;                                                                                                  // 1204
    },                                                                                                            // 1205
                                                                                                                  // 1206
    // Change the view's element (`this.el` property), including event                                            // 1207
    // re-delegation.                                                                                             // 1208
    setElement: function(element, delegate) {                                                                     // 1209
      if (this.$el) this.undelegateEvents();                                                                      // 1210
      this.$el = (element instanceof $) ? element : $(element);                                                   // 1211
      this.el = this.$el[0];                                                                                      // 1212
      if (delegate !== false) this.delegateEvents();                                                              // 1213
      return this;                                                                                                // 1214
    },                                                                                                            // 1215
                                                                                                                  // 1216
    // Set callbacks, where `this.events` is a hash of                                                            // 1217
    //                                                                                                            // 1218
    // *{"event selector": "callback"}*                                                                           // 1219
    //                                                                                                            // 1220
    //     {                                                                                                      // 1221
    //       'mousedown .title':  'edit',                                                                         // 1222
    //       'click .button':     'save'                                                                          // 1223
    //       'click .open':       function(e) { ... }                                                             // 1224
    //     }                                                                                                      // 1225
    //                                                                                                            // 1226
    // pairs. Callbacks will be bound to the view, with `this` set properly.                                      // 1227
    // Uses event delegation for efficiency.                                                                      // 1228
    // Omitting the selector binds the event to `this.el`.                                                        // 1229
    // This only works for delegate-able events: not `focus`, `blur`, and                                         // 1230
    // not `change`, `submit`, and `reset` in Internet Explorer.                                                  // 1231
    delegateEvents: function(events) {                                                                            // 1232
      if (!(events || (events = getValue(this, 'events')))) return;                                               // 1233
      this.undelegateEvents();                                                                                    // 1234
      for (var key in events) {                                                                                   // 1235
        var method = events[key];                                                                                 // 1236
        if (!_.isFunction(method)) method = this[events[key]];                                                    // 1237
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');                              // 1238
        var match = key.match(delegateEventSplitter);                                                             // 1239
        var eventName = match[1], selector = match[2];                                                            // 1240
        method = _.bind(method, this);                                                                            // 1241
        eventName += '.delegateEvents' + this.cid;                                                                // 1242
        if (selector === '') {                                                                                    // 1243
          this.$el.bind(eventName, method);                                                                       // 1244
        } else {                                                                                                  // 1245
          this.$el.delegate(selector, eventName, method);                                                         // 1246
        }                                                                                                         // 1247
      }                                                                                                           // 1248
    },                                                                                                            // 1249
                                                                                                                  // 1250
    // Clears all callbacks previously bound to the view with `delegateEvents`.                                   // 1251
    // You usually don't need to use this, but may wish to if you have multiple                                   // 1252
    // Backbone views attached to the same DOM element.                                                           // 1253
    undelegateEvents: function() {                                                                                // 1254
      this.$el.unbind('.delegateEvents' + this.cid);                                                              // 1255
    },                                                                                                            // 1256
                                                                                                                  // 1257
    // Performs the initial configuration of a View with a set of options.                                        // 1258
    // Keys with special meaning *(model, collection, id, className)*, are                                        // 1259
    // attached directly to the view.                                                                             // 1260
    _configure: function(options) {                                                                               // 1261
      if (this.options) options = _.extend({}, this.options, options);                                            // 1262
      for (var i = 0, l = viewOptions.length; i < l; i++) {                                                       // 1263
        var attr = viewOptions[i];                                                                                // 1264
        if (options[attr]) this[attr] = options[attr];                                                            // 1265
      }                                                                                                           // 1266
      this.options = options;                                                                                     // 1267
    },                                                                                                            // 1268
                                                                                                                  // 1269
    // Ensure that the View has a DOM element to render into.                                                     // 1270
    // If `this.el` is a string, pass it through `$()`, take the first                                            // 1271
    // matching element, and re-assign it to `el`. Otherwise, create                                              // 1272
    // an element from the `id`, `className` and `tagName` properties.                                            // 1273
    _ensureElement: function() {                                                                                  // 1274
      if (!this.el) {                                                                                             // 1275
        var attrs = getValue(this, 'attributes') || {};                                                           // 1276
        if (this.id) attrs.id = this.id;                                                                          // 1277
        if (this.className) attrs['class'] = this.className;                                                      // 1278
        this.setElement(this.make(this.tagName, attrs), false);                                                   // 1279
      } else {                                                                                                    // 1280
        this.setElement(this.el, false);                                                                          // 1281
      }                                                                                                           // 1282
    }                                                                                                             // 1283
                                                                                                                  // 1284
  });                                                                                                             // 1285
                                                                                                                  // 1286
  // The self-propagating extend function that Backbone classes use.                                              // 1287
  var extend = function (protoProps, classProps) {                                                                // 1288
    var child = inherits(this, protoProps, classProps);                                                           // 1289
    child.extend = this.extend;                                                                                   // 1290
    return child;                                                                                                 // 1291
  };                                                                                                              // 1292
                                                                                                                  // 1293
  // Set up inheritance for the model, collection, and view.                                                      // 1294
  Model.extend = Collection.extend = Router.extend = View.extend = extend;                                        // 1295
                                                                                                                  // 1296
  // Backbone.sync                                                                                                // 1297
  // -------------                                                                                                // 1298
                                                                                                                  // 1299
  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.                                        // 1300
  var methodMap = {                                                                                               // 1301
    'create': 'POST',                                                                                             // 1302
    'update': 'PUT',                                                                                              // 1303
    'delete': 'DELETE',                                                                                           // 1304
    'read':   'GET'                                                                                               // 1305
  };                                                                                                              // 1306
                                                                                                                  // 1307
  // Override this function to change the manner in which Backbone persists                                       // 1308
  // models to the server. You will be passed the type of request, and the                                        // 1309
  // model in question. By default, makes a RESTful Ajax request                                                  // 1310
  // to the model's `url()`. Some possible customizations could be:                                               // 1311
  //                                                                                                              // 1312
  // * Use `setTimeout` to batch rapid-fire updates into a single request.                                        // 1313
  // * Send up the models as XML instead of JSON.                                                                 // 1314
  // * Persist models via WebSockets instead of Ajax.                                                             // 1315
  //                                                                                                              // 1316
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests                                  // 1317
  // as `POST`, with a `_method` parameter containing the true HTTP method,                                       // 1318
  // as well as all requests with the body as `application/x-www-form-urlencoded`                                 // 1319
  // instead of `application/json` with the model in a param named `model`.                                       // 1320
  // Useful when interfacing with server-side languages like **PHP** that make                                    // 1321
  // it difficult to read the body of `PUT` requests.                                                             // 1322
  Backbone.sync = function(method, model, options) {                                                              // 1323
    var type = methodMap[method];                                                                                 // 1324
                                                                                                                  // 1325
    // Default options, unless specified.                                                                         // 1326
    options || (options = {});                                                                                    // 1327
                                                                                                                  // 1328
    // Default JSON-request options.                                                                              // 1329
    var params = {type: type, dataType: 'json'};                                                                  // 1330
                                                                                                                  // 1331
    // Ensure that we have a URL.                                                                                 // 1332
    if (!options.url) {                                                                                           // 1333
      params.url = getValue(model, 'url') || urlError();                                                          // 1334
    }                                                                                                             // 1335
                                                                                                                  // 1336
    // Ensure that we have the appropriate request data.                                                          // 1337
    if (!options.data && model && (method == 'create' || method == 'update')) {                                   // 1338
      params.contentType = 'application/json';                                                                    // 1339
      params.data = JSON.stringify(model.toJSON());                                                               // 1340
    }                                                                                                             // 1341
                                                                                                                  // 1342
    // For older servers, emulate JSON by encoding the request into an HTML-form.                                 // 1343
    if (Backbone.emulateJSON) {                                                                                   // 1344
      params.contentType = 'application/x-www-form-urlencoded';                                                   // 1345
      params.data = params.data ? {model: params.data} : {};                                                      // 1346
    }                                                                                                             // 1347
                                                                                                                  // 1348
    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`                                // 1349
    // And an `X-HTTP-Method-Override` header.                                                                    // 1350
    if (Backbone.emulateHTTP) {                                                                                   // 1351
      if (type === 'PUT' || type === 'DELETE') {                                                                  // 1352
        if (Backbone.emulateJSON) params.data._method = type;                                                     // 1353
        params.type = 'POST';                                                                                     // 1354
        params.beforeSend = function(xhr) {                                                                       // 1355
          xhr.setRequestHeader('X-HTTP-Method-Override', type);                                                   // 1356
        };                                                                                                        // 1357
      }                                                                                                           // 1358
    }                                                                                                             // 1359
                                                                                                                  // 1360
    // Don't process data on a non-GET request.                                                                   // 1361
    if (params.type !== 'GET' && !Backbone.emulateJSON) {                                                         // 1362
      params.processData = false;                                                                                 // 1363
    }                                                                                                             // 1364
                                                                                                                  // 1365
    // Make the request, allowing the user to override any Ajax options.                                          // 1366
    return $.ajax(_.extend(params, options));                                                                     // 1367
  };                                                                                                              // 1368
                                                                                                                  // 1369
  // Wrap an optional error callback with a fallback error event.                                                 // 1370
  Backbone.wrapError = function(onError, originalModel, options) {                                                // 1371
    return function(model, resp) {                                                                                // 1372
      resp = model === originalModel ? resp : model;                                                              // 1373
      if (onError) {                                                                                              // 1374
        onError(originalModel, resp, options);                                                                    // 1375
      } else {                                                                                                    // 1376
        originalModel.trigger('error', originalModel, resp, options);                                             // 1377
      }                                                                                                           // 1378
    };                                                                                                            // 1379
  };                                                                                                              // 1380
                                                                                                                  // 1381
  // Helpers                                                                                                      // 1382
  // -------                                                                                                      // 1383
                                                                                                                  // 1384
  // Shared empty constructor function to aid in prototype-chain creation.                                        // 1385
  var ctor = function(){};                                                                                        // 1386
                                                                                                                  // 1387
  // Helper function to correctly set up the prototype chain, for subclasses.                                     // 1388
  // Similar to `goog.inherits`, but uses a hash of prototype properties and                                      // 1389
  // class properties to be extended.                                                                             // 1390
  var inherits = function(parent, protoProps, staticProps) {                                                      // 1391
    var child;                                                                                                    // 1392
                                                                                                                  // 1393
    // The constructor function for the new subclass is either defined by you                                     // 1394
    // (the "constructor" property in your `extend` definition), or defaulted                                     // 1395
    // by us to simply call the parent's constructor.                                                             // 1396
    if (protoProps && protoProps.hasOwnProperty('constructor')) {                                                 // 1397
      child = protoProps.constructor;                                                                             // 1398
    } else {                                                                                                      // 1399
      child = function(){ parent.apply(this, arguments); };                                                       // 1400
    }                                                                                                             // 1401
                                                                                                                  // 1402
    // Inherit class (static) properties from parent.                                                             // 1403
    _.extend(child, parent);                                                                                      // 1404
                                                                                                                  // 1405
    // Set the prototype chain to inherit from `parent`, without calling                                          // 1406
    // `parent`'s constructor function.                                                                           // 1407
    ctor.prototype = parent.prototype;                                                                            // 1408
    child.prototype = new ctor();                                                                                 // 1409
                                                                                                                  // 1410
    // Add prototype properties (instance properties) to the subclass,                                            // 1411
    // if supplied.                                                                                               // 1412
    if (protoProps) _.extend(child.prototype, protoProps);                                                        // 1413
                                                                                                                  // 1414
    // Add static properties to the constructor function, if supplied.                                            // 1415
    if (staticProps) _.extend(child, staticProps);                                                                // 1416
                                                                                                                  // 1417
    // Correctly set child's `prototype.constructor`.                                                             // 1418
    child.prototype.constructor = child;                                                                          // 1419
                                                                                                                  // 1420
    // Set a convenience property in case the parent's prototype is needed later.                                 // 1421
    child.__super__ = parent.prototype;                                                                           // 1422
                                                                                                                  // 1423
    return child;                                                                                                 // 1424
  };                                                                                                              // 1425
                                                                                                                  // 1426
  // Helper function to get a value from a Backbone object as a property                                          // 1427
  // or as a function.                                                                                            // 1428
  var getValue = function(object, prop) {                                                                         // 1429
    if (!(object && object[prop])) return null;                                                                   // 1430
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];                                            // 1431
  };                                                                                                              // 1432
                                                                                                                  // 1433
  // Throw an error when a URL is needed, and none is supplied.                                                   // 1434
  var urlError = function() {                                                                                     // 1435
    throw new Error('A "url" property or function must be specified');                                            // 1436
  };                                                                                                              // 1437
                                                                                                                  // 1438
}).call(this);                                                                                                    // 1439
                                                                                                                  // 1440
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.backbone = {};

})();

//# sourceMappingURL=backbone.js.map
