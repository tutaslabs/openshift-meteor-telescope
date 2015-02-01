(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var EJSON = Package.ejson.EJSON;

/* Package-scope variables */
var Mongo;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/aldeed:collection2/collection2.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/* global Meteor, _, SimpleSchema, Mongo:true, Match, Package, EJSON */                                              // 1
                                                                                                                     // 2
// Extend the schema options allowed by SimpleSchema                                                                 // 3
SimpleSchema.extendOptions({                                                                                         // 4
  index: Match.Optional(Match.OneOf(Number, String, Boolean)),                                                       // 5
  unique: Match.Optional(Boolean),                                                                                   // 6
  denyInsert: Match.Optional(Boolean),                                                                               // 7
  denyUpdate: Match.Optional(Boolean)                                                                                // 8
});                                                                                                                  // 9
                                                                                                                     // 10
// Define some extra validation error messages                                                                       // 11
SimpleSchema.messages({                                                                                              // 12
  notUnique: "[label] must be unique",                                                                               // 13
  insertNotAllowed: "[label] cannot be set during an insert",                                                        // 14
  updateNotAllowed: "[label] cannot be set during an update"                                                         // 15
});                                                                                                                  // 16
                                                                                                                     // 17
/*                                                                                                                   // 18
 * Public API                                                                                                        // 19
 */                                                                                                                  // 20
                                                                                                                     // 21
// backwards compatibility                                                                                           // 22
if (typeof Mongo === "undefined") {                                                                                  // 23
  Mongo = {};                                                                                                        // 24
  Mongo.Collection = Meteor.Collection;                                                                              // 25
}                                                                                                                    // 26
                                                                                                                     // 27
/**                                                                                                                  // 28
 * Mongo.Collection.prototype.attachSchema                                                                           // 29
 * @param {SimpleSchema|Object} ss - SimpleSchema instance or a schema definition object from which to create a new SimpleSchema instance
 * @param {Object} [options]                                                                                         // 31
 * @param {Boolean} [options.transform=false] Set to `true` if your document must be passed through the collection's transform to properly validate.
 * @param {Boolean} [options.replace=false] Set to `true` to replace any existing schema instead of combining        // 33
 * @return {undefined}                                                                                               // 34
 *                                                                                                                   // 35
 * Use this method to attach a schema to a collection created by another package,                                    // 36
 * such as Meteor.users. It is most likely unsafe to call this method more than                                      // 37
 * once for a single collection, or to call this for a collection that had a                                         // 38
 * schema object passed to its constructor.                                                                          // 39
 */                                                                                                                  // 40
Mongo.Collection.prototype.attachSchema = function c2AttachSchema(ss, options) {                                     // 41
  var self = this;                                                                                                   // 42
  options = options || {};                                                                                           // 43
                                                                                                                     // 44
  if (!(ss instanceof SimpleSchema)) {                                                                               // 45
    ss = new SimpleSchema(ss);                                                                                       // 46
  }                                                                                                                  // 47
                                                                                                                     // 48
  self._c2 = self._c2 || {};                                                                                         // 49
                                                                                                                     // 50
  // If we've already attached one schema, we combine both into a new schema unless options.replace is `true`        // 51
  if (self._c2._simpleSchema && options.replace !== true) {                                                          // 52
    ss = new SimpleSchema([self._c2._simpleSchema, ss]);                                                             // 53
  }                                                                                                                  // 54
                                                                                                                     // 55
  // Track the schema in the collection                                                                              // 56
  self._c2._simpleSchema = ss;                                                                                       // 57
                                                                                                                     // 58
  function ensureIndex(c, index, indexName, unique, sparse) {                                                        // 59
    Meteor.startup(function () {                                                                                     // 60
      c._collection._ensureIndex(index, {                                                                            // 61
        background: true,                                                                                            // 62
        name: indexName,                                                                                             // 63
        unique: unique,                                                                                              // 64
        sparse: sparse                                                                                               // 65
      });                                                                                                            // 66
    });                                                                                                              // 67
  }                                                                                                                  // 68
                                                                                                                     // 69
  function dropIndex(c, indexName) {                                                                                 // 70
    Meteor.startup(function () {                                                                                     // 71
      try {                                                                                                          // 72
        c._collection._dropIndex(indexName);                                                                         // 73
      } catch (err) {                                                                                                // 74
        // no index with that name, which is what we want                                                            // 75
      }                                                                                                              // 76
    });                                                                                                              // 77
  }                                                                                                                  // 78
                                                                                                                     // 79
  // Loop over fields definitions and ensure collection indexes (server side only)                                   // 80
  if (Meteor.isServer) {                                                                                             // 81
    _.each(ss.schema(), function(definition, fieldName) {                                                            // 82
      if ('index' in definition || definition.unique === true) {                                                     // 83
        var index = {}, indexValue;                                                                                  // 84
        // If they specified `unique: true` but not `index`,                                                         // 85
        // we assume `index: 1` to set up the unique index in mongo                                                  // 86
        if ('index' in definition) {                                                                                 // 87
          indexValue = definition.index;                                                                             // 88
          if (indexValue === true) {                                                                                 // 89
            indexValue = 1;                                                                                          // 90
          }                                                                                                          // 91
        } else {                                                                                                     // 92
          indexValue = 1;                                                                                            // 93
        }                                                                                                            // 94
        var indexName = 'c2_' + fieldName;                                                                           // 95
        // In the index object, we want object array keys without the ".$" piece                                     // 96
        var idxFieldName = fieldName.replace(/\.\$\./g, ".");                                                        // 97
        index[idxFieldName] = indexValue;                                                                            // 98
        var unique = !!definition.unique && (indexValue === 1 || indexValue === -1);                                 // 99
        var sparse = !!definition.optional && unique;                                                                // 100
                                                                                                                     // 101
        if (indexValue === false) {                                                                                  // 102
          dropIndex(self, indexName);                                                                                // 103
        } else {                                                                                                     // 104
          ensureIndex(self, index, indexName, unique, sparse);                                                       // 105
        }                                                                                                            // 106
      }                                                                                                              // 107
    });                                                                                                              // 108
  }                                                                                                                  // 109
                                                                                                                     // 110
  // Set up additional checks                                                                                        // 111
  ss.validator(function() {                                                                                          // 112
    var def = this.definition;                                                                                       // 113
    var val = this.value;                                                                                            // 114
    var op = this.operator;                                                                                          // 115
                                                                                                                     // 116
    if (def.denyInsert && val !== void 0 && !op) {                                                                   // 117
      // This is an insert of a defined value into a field where denyInsert=true                                     // 118
      return "insertNotAllowed";                                                                                     // 119
    }                                                                                                                // 120
                                                                                                                     // 121
    if (def.denyUpdate && op) {                                                                                      // 122
      // This is an insert of a defined value into a field where denyUpdate=true                                     // 123
      if (op !== "$set" || (op === "$set" && val !== void 0)) {                                                      // 124
        return "updateNotAllowed";                                                                                   // 125
      }                                                                                                              // 126
    }                                                                                                                // 127
                                                                                                                     // 128
    return true;                                                                                                     // 129
  });                                                                                                                // 130
                                                                                                                     // 131
  defineDeny(self, options);                                                                                         // 132
  keepInsecure(self);                                                                                                // 133
};                                                                                                                   // 134
                                                                                                                     // 135
Mongo.Collection.prototype.simpleSchema = function c2SS() {                                                          // 136
  var self = this;                                                                                                   // 137
  return self._c2 ? self._c2._simpleSchema : null;                                                                   // 138
};                                                                                                                   // 139
                                                                                                                     // 140
// Wrap DB write operation methods                                                                                   // 141
_.each(['insert', 'update', 'upsert'], function(methodName) {                                                        // 142
  var _super = Mongo.Collection.prototype[methodName];                                                               // 143
  Mongo.Collection.prototype[methodName] = function () {                                                             // 144
    var self = this, args = _.toArray(arguments);                                                                    // 145
    if (self._c2) {                                                                                                  // 146
      args = doValidate.call(self, methodName, args, false,                                                          // 147
        (Meteor.isClient && Meteor.userId && Meteor.userId()) || null, Meteor.isServer);                             // 148
      if (!args) {                                                                                                   // 149
        // doValidate already called the callback or threw the error                                                 // 150
        if (methodName === "insert") {                                                                               // 151
          // insert should always return an ID to match core behavior                                                // 152
          return self._makeNewID();                                                                                  // 153
        } else {                                                                                                     // 154
          return;                                                                                                    // 155
        }                                                                                                            // 156
      }                                                                                                              // 157
    }                                                                                                                // 158
    return _super.apply(self, args);                                                                                 // 159
  };                                                                                                                 // 160
});                                                                                                                  // 161
                                                                                                                     // 162
/*                                                                                                                   // 163
 * Private                                                                                                           // 164
 */                                                                                                                  // 165
                                                                                                                     // 166
function doValidate(type, args, skipAutoValue, userId, isFromTrustedCode) {                                          // 167
  var self = this, schema = self._c2._simpleSchema,                                                                  // 168
      doc, callback, error, options, isUpsert, selector, last, hasCallback,                                          // 169
      isLocalCollection = (self._connection === null);                                                               // 170
                                                                                                                     // 171
  if (!args.length) {                                                                                                // 172
    throw new Error(type + " requires an argument");                                                                 // 173
  }                                                                                                                  // 174
                                                                                                                     // 175
  // Gather arguments and cache the selector                                                                         // 176
  if (type === "insert") {                                                                                           // 177
    doc = args[0];                                                                                                   // 178
    options = args[1];                                                                                               // 179
    callback = args[2];                                                                                              // 180
                                                                                                                     // 181
    // The real insert doesn't take options                                                                          // 182
    if (typeof options === "function") {                                                                             // 183
      args = [doc, options];                                                                                         // 184
    } else if (typeof callback === "function") {                                                                     // 185
      args = [doc, callback];                                                                                        // 186
    } else {                                                                                                         // 187
      args = [doc];                                                                                                  // 188
    }                                                                                                                // 189
                                                                                                                     // 190
  } else if (type === "update" || type === "upsert") {                                                               // 191
    selector = args[0];                                                                                              // 192
    doc = args[1];                                                                                                   // 193
    options = args[2];                                                                                               // 194
    callback = args[3];                                                                                              // 195
  } else {                                                                                                           // 196
    throw new Error("invalid type argument");                                                                        // 197
  }                                                                                                                  // 198
                                                                                                                     // 199
  // Support missing options arg                                                                                     // 200
  if (!callback && typeof options === "function") {                                                                  // 201
    callback = options;                                                                                              // 202
    options = {};                                                                                                    // 203
  }                                                                                                                  // 204
  options = options || {};                                                                                           // 205
                                                                                                                     // 206
  last = args.length - 1;                                                                                            // 207
                                                                                                                     // 208
  hasCallback = (typeof args[last] === 'function');                                                                  // 209
                                                                                                                     // 210
  // If update was called with upsert:true or upsert was called, flag as an upsert                                   // 211
  isUpsert = (type === "upsert" || (type === "update" && options.upsert === true));                                  // 212
                                                                                                                     // 213
  // Add a default callback function if we're on the client and no callback was given                                // 214
  if (Meteor.isClient && !callback) {                                                                                // 215
    // Client can't block, so it can't report errors by exception,                                                   // 216
    // only by callback. If they forget the callback, give them a                                                    // 217
    // default one that logs the error, so they aren't totally                                                       // 218
    // baffled if their writes don't work because their database is                                                  // 219
    // down.                                                                                                         // 220
    callback = function(err) {                                                                                       // 221
      if (err) {                                                                                                     // 222
        Meteor._debug(type + " failed: " + (err.reason || err.stack));                                               // 223
      }                                                                                                              // 224
    };                                                                                                               // 225
  }                                                                                                                  // 226
                                                                                                                     // 227
  // If client validation is fine or is skipped but then something                                                   // 228
  // is found to be invalid on the server, we get that error back                                                    // 229
  // as a special Meteor.Error that we need to parse.                                                                // 230
  if (Meteor.isClient && hasCallback) {                                                                              // 231
    callback = args[last] = wrapCallbackForParsingServerErrors(self, options.validationContext, callback);           // 232
  }                                                                                                                  // 233
                                                                                                                     // 234
  // If _id has already been added, remove it temporarily if it's                                                    // 235
  // not explicitly defined in the schema.                                                                           // 236
  var id;                                                                                                            // 237
  if (doc._id && !schema.allowsKey("_id")) {                                                                         // 238
    id = doc._id;                                                                                                    // 239
    delete doc._id;                                                                                                  // 240
  }                                                                                                                  // 241
                                                                                                                     // 242
  function doClean(docToClean, getAutoValues, filter, autoConvert, removeEmptyStrings, trimStrings) {                // 243
    // Clean the doc/modifier in place                                                                               // 244
    schema.clean(docToClean, {                                                                                       // 245
      filter: filter,                                                                                                // 246
      autoConvert: autoConvert,                                                                                      // 247
      getAutoValues: getAutoValues,                                                                                  // 248
      isModifier: (type !== "insert"),                                                                               // 249
      removeEmptyStrings: removeEmptyStrings,                                                                        // 250
      trimStrings: trimStrings,                                                                                      // 251
      extendAutoValueContext: _.extend({                                                                             // 252
        isInsert: (type === "insert"),                                                                               // 253
        isUpdate: (type === "update" && options.upsert !== true),                                                    // 254
        isUpsert: isUpsert,                                                                                          // 255
        userId: userId,                                                                                              // 256
        isFromTrustedCode: isFromTrustedCode,                                                                        // 257
        docId: ((type === "update" || type === "upsert") && selector && selector._id) ? selector._id : void 0,       // 258
        isLocalCollection: isLocalCollection                                                                         // 259
      }, options.extendAutoValueContext || {})                                                                       // 260
    });                                                                                                              // 261
  }                                                                                                                  // 262
                                                                                                                     // 263
  // On the server and for local collections, we allow passing `getAutoValues: false` to disable autoValue functions // 264
  if ((Meteor.isServer || isLocalCollection) && options.getAutoValues === false) {                                   // 265
    skipAutoValue = true;                                                                                            // 266
  }                                                                                                                  // 267
                                                                                                                     // 268
  // Preliminary cleaning on both client and server. On the server and for local                                     // 269
  // collections, automatic values will also be set at this point.                                                   // 270
  doClean(doc, ((Meteor.isServer || isLocalCollection) && !skipAutoValue), options.filter !== false, options.autoConvert !== false, options.removeEmptyStrings !== false, options.trimStrings !== false);
                                                                                                                     // 272
  // We clone before validating because in some cases we need to adjust the                                          // 273
  // object a bit before validating it. If we adjusted `doc` itself, our                                             // 274
  // changes would persist into the database.                                                                        // 275
  var docToValidate = {};                                                                                            // 276
  for (var prop in doc) {                                                                                            // 277
    // We omit prototype properties when cloning because they will not be valid                                      // 278
    // and mongo omits them when saving to the database anyway.                                                      // 279
    if (doc.hasOwnProperty(prop)) {                                                                                  // 280
      docToValidate[prop] = doc[prop];                                                                               // 281
    }                                                                                                                // 282
  }                                                                                                                  // 283
                                                                                                                     // 284
  // On the server, upserts are possible; SimpleSchema handles upserts pretty                                        // 285
  // well by default, but it will not know about the fields in the selector,                                         // 286
  // which are also stored in the database if an insert is performed. So we                                          // 287
  // will allow these fields to be considered for validation by adding them                                          // 288
  // to the $set in the modifier. This is no doubt prone to errors, but there                                        // 289
  // probably isn't any better way right now.                                                                        // 290
  if (Meteor.isServer && isUpsert && _.isObject(selector)) {                                                         // 291
    var set = docToValidate.$set || {};                                                                              // 292
    docToValidate.$set = _.clone(selector);                                                                          // 293
    _.extend(docToValidate.$set, set);                                                                               // 294
  }                                                                                                                  // 295
                                                                                                                     // 296
  // Set automatic values for validation on the client.                                                              // 297
  // On the server, we already updated doc with auto values, but on the client,                                      // 298
  // we will add them to docToValidate for validation purposes only.                                                 // 299
  // This is because we want all actual values generated on the server.                                              // 300
  if (Meteor.isClient && !isLocalCollection) {                                                                       // 301
    doClean(docToValidate, true, false, false, false, false);                                                        // 302
  }                                                                                                                  // 303
                                                                                                                     // 304
  // Validate doc                                                                                                    // 305
  var ctx = schema.namedContext(options.validationContext);                                                          // 306
  var isValid;                                                                                                       // 307
  if (options.validate === false) {                                                                                  // 308
    isValid = true;                                                                                                  // 309
  } else {                                                                                                           // 310
    isValid = ctx.validate(docToValidate, {                                                                          // 311
      modifier: (type === "update" || type === "upsert"),                                                            // 312
      upsert: isUpsert,                                                                                              // 313
      extendedCustomContext: _.extend({                                                                              // 314
        isInsert: (type === "insert"),                                                                               // 315
        isUpdate: (type === "update" && options.upsert !== true),                                                    // 316
        isUpsert: isUpsert,                                                                                          // 317
        userId: userId,                                                                                              // 318
        isFromTrustedCode: isFromTrustedCode,                                                                        // 319
        docId: ((type === "update" || type === "upsert") && selector && selector._id) ? selector._id : void 0,       // 320
        isLocalCollection: isLocalCollection                                                                         // 321
      }, options.extendedCustomContext || {})                                                                        // 322
    });                                                                                                              // 323
  }                                                                                                                  // 324
                                                                                                                     // 325
  if (isValid) {                                                                                                     // 326
    // Add the ID back                                                                                               // 327
    if (id) {                                                                                                        // 328
      doc._id = id;                                                                                                  // 329
    }                                                                                                                // 330
                                                                                                                     // 331
    // Update the args to reflect the cleaned doc                                                                    // 332
    if (type === "insert") {                                                                                         // 333
      args[0] = doc;                                                                                                 // 334
    } else {                                                                                                         // 335
      args[1] = doc;                                                                                                 // 336
    }                                                                                                                // 337
                                                                                                                     // 338
    // If callback, set invalidKey when we get a mongo unique error                                                  // 339
    if (Meteor.isServer && hasCallback) {                                                                            // 340
      args[last] = wrapCallbackForParsingMongoValidationErrors(self, doc, options.validationContext, args[last]);    // 341
    }                                                                                                                // 342
                                                                                                                     // 343
    return args;                                                                                                     // 344
  } else {                                                                                                           // 345
    error = getErrorObject(ctx);                                                                                     // 346
    if (callback) {                                                                                                  // 347
      // insert/update/upsert pass `false` when there's an error, so we do that                                      // 348
      callback(error, false);                                                                                        // 349
    } else {                                                                                                         // 350
      throw error;                                                                                                   // 351
    }                                                                                                                // 352
  }                                                                                                                  // 353
}                                                                                                                    // 354
                                                                                                                     // 355
function getErrorObject(context) {                                                                                   // 356
  var message, invalidKeys = context.invalidKeys();                                                                  // 357
  if (invalidKeys.length) {                                                                                          // 358
    message = context.keyErrorMessage(invalidKeys[0].name);                                                          // 359
  } else {                                                                                                           // 360
    message = "Failed validation";                                                                                   // 361
  }                                                                                                                  // 362
  var error = new Error(message);                                                                                    // 363
  error.invalidKeys = invalidKeys;                                                                                   // 364
  error.validationContext = context;                                                                                 // 365
  // If on the server, we add a sanitized error, too, in case we're                                                  // 366
  // called from a method.                                                                                           // 367
  if (Meteor.isServer) {                                                                                             // 368
    error.sanitizedError = new Meteor.Error(400, message);                                                           // 369
  }                                                                                                                  // 370
  return error;                                                                                                      // 371
}                                                                                                                    // 372
                                                                                                                     // 373
function addUniqueError(context, errorMessage) {                                                                     // 374
  var name = errorMessage.split('c2_')[1].split(' ')[0];                                                             // 375
  var val = errorMessage.split('dup key:')[1].split('"')[1];                                                         // 376
  context.addInvalidKeys([{                                                                                          // 377
    name: name,                                                                                                      // 378
    type: 'notUnique',                                                                                               // 379
    value: val                                                                                                       // 380
  }]);                                                                                                               // 381
}                                                                                                                    // 382
                                                                                                                     // 383
function wrapCallbackForParsingMongoValidationErrors(col, doc, vCtx, cb) {                                           // 384
  return function wrappedCallbackForParsingMongoValidationErrors(error) {                                            // 385
    if (error && ((error.name === "MongoError" && error.code === 11001) || error.message.indexOf('MongoError: E11000' !== -1)) && error.message.indexOf('c2_') !== -1) {
      var context = col.simpleSchema().namedContext(vCtx);                                                           // 387
      addUniqueError(context, error.message);                                                                        // 388
      arguments[0] = getErrorObject(context);                                                                        // 389
    }                                                                                                                // 390
    return cb.apply(this, arguments);                                                                                // 391
  };                                                                                                                 // 392
}                                                                                                                    // 393
                                                                                                                     // 394
function wrapCallbackForParsingServerErrors(col, vCtx, cb) {                                                         // 395
  return function wrappedCallbackForParsingServerErrors(error) {                                                     // 396
    // Handle our own validation errors                                                                              // 397
    var context = col.simpleSchema().namedContext(vCtx);                                                             // 398
    if (error instanceof Meteor.Error && error.error === 400 && error.reason === "INVALID" && typeof error.details === "string") {
      var invalidKeysFromServer = EJSON.parse(error.details);                                                        // 400
      context.addInvalidKeys(invalidKeysFromServer);                                                                 // 401
      arguments[0] = getErrorObject(context);                                                                        // 402
    }                                                                                                                // 403
    // Handle Mongo unique index errors, which are forwarded to the client as 409 errors                             // 404
    else if (error instanceof Meteor.Error && error.error === 409 && error.reason && error.reason.indexOf('E11000') !== -1 && error.reason.indexOf('c2_') !== -1) {
      addUniqueError(context, error.reason);                                                                         // 406
      arguments[0] = getErrorObject(context);                                                                        // 407
    }                                                                                                                // 408
    return cb.apply(this, arguments);                                                                                // 409
  };                                                                                                                 // 410
}                                                                                                                    // 411
                                                                                                                     // 412
var alreadyInsecured = {};                                                                                           // 413
function keepInsecure(c) {                                                                                           // 414
  // If insecure package is in use, we need to add allow rules that return                                           // 415
  // true. Otherwise, it would seemingly turn off insecure mode.                                                     // 416
  if (Package && Package.insecure && !alreadyInsecured[c._name]) {                                                   // 417
    c.allow({                                                                                                        // 418
      insert: function() {                                                                                           // 419
        return true;                                                                                                 // 420
      },                                                                                                             // 421
      update: function() {                                                                                           // 422
        return true;                                                                                                 // 423
      },                                                                                                             // 424
      remove: function () {                                                                                          // 425
        return true;                                                                                                 // 426
      },                                                                                                             // 427
      fetch: [],                                                                                                     // 428
      transform: null                                                                                                // 429
    });                                                                                                              // 430
    alreadyInsecured[c._name] = true;                                                                                // 431
  }                                                                                                                  // 432
  // If insecure package is NOT in use, then adding the two deny functions                                           // 433
  // does not have any effect on the main app's security paradigm. The                                               // 434
  // user will still be required to add at least one allow function of her                                           // 435
  // own for each operation for this collection. And the user may still add                                          // 436
  // additional deny functions, but does not have to.                                                                // 437
}                                                                                                                    // 438
                                                                                                                     // 439
var alreadyDefined = {};                                                                                             // 440
function defineDeny(c, options) {                                                                                    // 441
  if (!alreadyDefined[c._name]) {                                                                                    // 442
                                                                                                                     // 443
    var isLocalCollection = (c._connection === null);                                                                // 444
                                                                                                                     // 445
    // First define deny functions to extend doc with the results of clean                                           // 446
    // and autovalues. This must be done with "transform: null" or we would be                                       // 447
    // extending a clone of doc and therefore have no effect.                                                        // 448
    c.deny({                                                                                                         // 449
      insert: function(userId, doc) {                                                                                // 450
        var ss = c.simpleSchema();                                                                                   // 451
        // If _id has already been added, remove it temporarily if it's                                              // 452
        // not explicitly defined in the schema.                                                                     // 453
        var id;                                                                                                      // 454
        if (Meteor.isServer && doc._id && !ss.allowsKey("_id")) {                                                    // 455
          id = doc._id;                                                                                              // 456
          delete doc._id;                                                                                            // 457
        }                                                                                                            // 458
                                                                                                                     // 459
        // Referenced doc is cleaned in place                                                                        // 460
        ss.clean(doc, {                                                                                              // 461
          isModifier: false,                                                                                         // 462
          // We don't do these here because they are done on the client if desired                                   // 463
          filter: false,                                                                                             // 464
          autoConvert: false,                                                                                        // 465
          removeEmptyStrings: false,                                                                                 // 466
          trimStrings: false,                                                                                        // 467
          extendAutoValueContext: {                                                                                  // 468
            isInsert: true,                                                                                          // 469
            isUpdate: false,                                                                                         // 470
            isUpsert: false,                                                                                         // 471
            userId: userId,                                                                                          // 472
            isFromTrustedCode: false,                                                                                // 473
            docId: id,                                                                                               // 474
            isLocalCollection: isLocalCollection                                                                     // 475
          }                                                                                                          // 476
        });                                                                                                          // 477
                                                                                                                     // 478
        // Add the ID back                                                                                           // 479
        if (id) {                                                                                                    // 480
          doc._id = id;                                                                                              // 481
        }                                                                                                            // 482
                                                                                                                     // 483
        return false;                                                                                                // 484
      },                                                                                                             // 485
      update: function(userId, doc, fields, modifier) {                                                              // 486
        var ss = c.simpleSchema();                                                                                   // 487
        // Referenced modifier is cleaned in place                                                                   // 488
        ss.clean(modifier, {                                                                                         // 489
          isModifier: true,                                                                                          // 490
          // We don't do these here because they are done on the client if desired                                   // 491
          filter: false,                                                                                             // 492
          autoConvert: false,                                                                                        // 493
          removeEmptyStrings: false,                                                                                 // 494
          trimStrings: false,                                                                                        // 495
          extendAutoValueContext: {                                                                                  // 496
            isInsert: false,                                                                                         // 497
            isUpdate: true,                                                                                          // 498
            isUpsert: false,                                                                                         // 499
            userId: userId,                                                                                          // 500
            isFromTrustedCode: false,                                                                                // 501
            docId: doc && doc._id,                                                                                   // 502
            isLocalCollection: isLocalCollection                                                                     // 503
          }                                                                                                          // 504
        });                                                                                                          // 505
                                                                                                                     // 506
        return false;                                                                                                // 507
      },                                                                                                             // 508
      fetch: ['_id'],                                                                                                // 509
      transform: null                                                                                                // 510
    });                                                                                                              // 511
                                                                                                                     // 512
    // Second define deny functions to validate again on the server                                                  // 513
    // for client-initiated inserts and updates. These should be                                                     // 514
    // called after the clean/autovalue functions since we're adding                                                 // 515
    // them after. These must *not* have "transform: null" if options.transform is true because                      // 516
    // we need to pass the doc through any transforms to be sure                                                     // 517
    // that custom types are properly recognized for type validation.                                                // 518
    c.deny(_.extend({                                                                                                // 519
      insert: function(userId, doc) {                                                                                // 520
        // We pass the false options because we will have done them on client if desired                             // 521
        doValidate.call(c, "insert", [doc, {trimStrings: false, removeEmptyStrings: false, filter: false, autoConvert: false}, function(error) {
            if (error) {                                                                                             // 523
              throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));                            // 524
            }                                                                                                        // 525
          }], true, userId, false);                                                                                  // 526
                                                                                                                     // 527
        return false;                                                                                                // 528
      },                                                                                                             // 529
      update: function(userId, doc, fields, modifier) {                                                              // 530
        // NOTE: This will never be an upsert because client-side upserts                                            // 531
        // are not allowed once you define allow/deny functions.                                                     // 532
        // We pass the false options because we will have done them on client if desired                             // 533
        doValidate.call(c, "update", [{_id: doc && doc._id}, modifier, {trimStrings: false, removeEmptyStrings: false, filter: false, autoConvert: false}, function(error) {
            if (error) {                                                                                             // 535
              throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));                            // 536
            }                                                                                                        // 537
          }], true, userId, false);                                                                                  // 538
                                                                                                                     // 539
        return false;                                                                                                // 540
      },                                                                                                             // 541
      fetch: ['_id']                                                                                                 // 542
    }, options.transform === true ? {} : {transform: null}));                                                        // 543
                                                                                                                     // 544
    // note that we've already done this collection so that we don't do it again                                     // 545
    // if attachSchema is called again                                                                               // 546
    alreadyDefined[c._name] = true;                                                                                  // 547
  }                                                                                                                  // 548
}                                                                                                                    // 549
                                                                                                                     // 550
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['aldeed:collection2'] = {};

})();

//# sourceMappingURL=aldeed_collection2.js.map
