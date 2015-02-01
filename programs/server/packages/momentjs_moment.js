(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var moment;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/momentjs:moment/moment.js                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
//! moment.js                                                                                                          // 1
//! version : 2.9.0                                                                                                    // 2
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors                                                         // 3
//! license : MIT                                                                                                      // 4
//! momentjs.com                                                                                                       // 5
                                                                                                                       // 6
(function (undefined) {                                                                                                // 7
    /************************************                                                                              // 8
        Constants                                                                                                      // 9
    ************************************/                                                                              // 10
                                                                                                                       // 11
    var moment,                                                                                                        // 12
        VERSION = '2.9.0',                                                                                             // 13
        // the global-scope this is NOT the global object in Node.js                                                   // 14
        globalScope = (typeof global !== 'undefined' && (typeof window === 'undefined' || window === global.window)) ? global : this,
        oldGlobalMoment,                                                                                               // 16
        round = Math.round,                                                                                            // 17
        hasOwnProperty = Object.prototype.hasOwnProperty,                                                              // 18
        i,                                                                                                             // 19
                                                                                                                       // 20
        YEAR = 0,                                                                                                      // 21
        MONTH = 1,                                                                                                     // 22
        DATE = 2,                                                                                                      // 23
        HOUR = 3,                                                                                                      // 24
        MINUTE = 4,                                                                                                    // 25
        SECOND = 5,                                                                                                    // 26
        MILLISECOND = 6,                                                                                               // 27
                                                                                                                       // 28
        // internal storage for locale config files                                                                    // 29
        locales = {},                                                                                                  // 30
                                                                                                                       // 31
        // extra moment internal properties (plugins register props here)                                              // 32
        momentProperties = [],                                                                                         // 33
                                                                                                                       // 34
        // check for nodeJS                                                                                            // 35
        hasModule = (typeof module !== 'undefined' && module && module.exports),                                       // 36
                                                                                                                       // 37
        // ASP.NET json date format regex                                                                              // 38
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,                                                                       // 39
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,                              // 40
                                                                                                                       // 41
        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html                   // 42
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere                                   // 43
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,
                                                                                                                       // 45
        // format tokens                                                                                               // 46
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,                                          // 48
                                                                                                                       // 49
        // parsing token regexes                                                                                       // 50
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99                                                                  // 51
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999                                                             // 52
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999                                                             // 53
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999                                              // 54
        parseTokenDigits = /\d+/, // nonzero number of digits                                                          // 55
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z                                 // 57
        parseTokenT = /T/i, // T (ISO separator)                                                                       // 58
        parseTokenOffsetMs = /[\+\-]?\d+/, // 1234567890123                                                            // 59
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123                                   // 60
                                                                                                                       // 61
        //strict parsing regexes                                                                                       // 62
        parseTokenOneDigit = /\d/, // 0 - 9                                                                            // 63
        parseTokenTwoDigits = /\d\d/, // 00 - 99                                                                       // 64
        parseTokenThreeDigits = /\d{3}/, // 000 - 999                                                                  // 65
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999                                                                 // 66
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999                                                      // 67
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf                                                             // 68
                                                                                                                       // 69
        // iso 8601 regex                                                                                              // 70
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)   // 71
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
                                                                                                                       // 73
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',                                                                            // 74
                                                                                                                       // 75
        isoDates = [                                                                                                   // 76
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],                                                                 // 77
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],                                                                       // 78
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],                                                                       // 79
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],                                                                            // 80
            ['YYYY-DDD', /\d{4}-\d{3}/]                                                                                // 81
        ],                                                                                                             // 82
                                                                                                                       // 83
        // iso time formats and regexes                                                                                // 84
        isoTimes = [                                                                                                   // 85
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],                                                             // 86
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],                                                                       // 87
            ['HH:mm', /(T| )\d\d:\d\d/],                                                                               // 88
            ['HH', /(T| )\d\d/]                                                                                        // 89
        ],                                                                                                             // 90
                                                                                                                       // 91
        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-', '15', '30']                                     // 92
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,                                                                      // 93
                                                                                                                       // 94
        // getter and setter names                                                                                     // 95
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),                                 // 96
        unitMillisecondFactors = {                                                                                     // 97
            'Milliseconds' : 1,                                                                                        // 98
            'Seconds' : 1e3,                                                                                           // 99
            'Minutes' : 6e4,                                                                                           // 100
            'Hours' : 36e5,                                                                                            // 101
            'Days' : 864e5,                                                                                            // 102
            'Months' : 2592e6,                                                                                         // 103
            'Years' : 31536e6                                                                                          // 104
        },                                                                                                             // 105
                                                                                                                       // 106
        unitAliases = {                                                                                                // 107
            ms : 'millisecond',                                                                                        // 108
            s : 'second',                                                                                              // 109
            m : 'minute',                                                                                              // 110
            h : 'hour',                                                                                                // 111
            d : 'day',                                                                                                 // 112
            D : 'date',                                                                                                // 113
            w : 'week',                                                                                                // 114
            W : 'isoWeek',                                                                                             // 115
            M : 'month',                                                                                               // 116
            Q : 'quarter',                                                                                             // 117
            y : 'year',                                                                                                // 118
            DDD : 'dayOfYear',                                                                                         // 119
            e : 'weekday',                                                                                             // 120
            E : 'isoWeekday',                                                                                          // 121
            gg: 'weekYear',                                                                                            // 122
            GG: 'isoWeekYear'                                                                                          // 123
        },                                                                                                             // 124
                                                                                                                       // 125
        camelFunctions = {                                                                                             // 126
            dayofyear : 'dayOfYear',                                                                                   // 127
            isoweekday : 'isoWeekday',                                                                                 // 128
            isoweek : 'isoWeek',                                                                                       // 129
            weekyear : 'weekYear',                                                                                     // 130
            isoweekyear : 'isoWeekYear'                                                                                // 131
        },                                                                                                             // 132
                                                                                                                       // 133
        // format function strings                                                                                     // 134
        formatFunctions = {},                                                                                          // 135
                                                                                                                       // 136
        // default relative time thresholds                                                                            // 137
        relativeTimeThresholds = {                                                                                     // 138
            s: 45,  // seconds to minute                                                                               // 139
            m: 45,  // minutes to hour                                                                                 // 140
            h: 22,  // hours to day                                                                                    // 141
            d: 26,  // days to month                                                                                   // 142
            M: 11   // months to year                                                                                  // 143
        },                                                                                                             // 144
                                                                                                                       // 145
        // tokens to ordinalize and pad                                                                                // 146
        ordinalizeTokens = 'DDD w W M D d'.split(' '),                                                                 // 147
        paddedTokens = 'M D H h m s w W'.split(' '),                                                                   // 148
                                                                                                                       // 149
        formatTokenFunctions = {                                                                                       // 150
            M    : function () {                                                                                       // 151
                return this.month() + 1;                                                                               // 152
            },                                                                                                         // 153
            MMM  : function (format) {                                                                                 // 154
                return this.localeData().monthsShort(this, format);                                                    // 155
            },                                                                                                         // 156
            MMMM : function (format) {                                                                                 // 157
                return this.localeData().months(this, format);                                                         // 158
            },                                                                                                         // 159
            D    : function () {                                                                                       // 160
                return this.date();                                                                                    // 161
            },                                                                                                         // 162
            DDD  : function () {                                                                                       // 163
                return this.dayOfYear();                                                                               // 164
            },                                                                                                         // 165
            d    : function () {                                                                                       // 166
                return this.day();                                                                                     // 167
            },                                                                                                         // 168
            dd   : function (format) {                                                                                 // 169
                return this.localeData().weekdaysMin(this, format);                                                    // 170
            },                                                                                                         // 171
            ddd  : function (format) {                                                                                 // 172
                return this.localeData().weekdaysShort(this, format);                                                  // 173
            },                                                                                                         // 174
            dddd : function (format) {                                                                                 // 175
                return this.localeData().weekdays(this, format);                                                       // 176
            },                                                                                                         // 177
            w    : function () {                                                                                       // 178
                return this.week();                                                                                    // 179
            },                                                                                                         // 180
            W    : function () {                                                                                       // 181
                return this.isoWeek();                                                                                 // 182
            },                                                                                                         // 183
            YY   : function () {                                                                                       // 184
                return leftZeroFill(this.year() % 100, 2);                                                             // 185
            },                                                                                                         // 186
            YYYY : function () {                                                                                       // 187
                return leftZeroFill(this.year(), 4);                                                                   // 188
            },                                                                                                         // 189
            YYYYY : function () {                                                                                      // 190
                return leftZeroFill(this.year(), 5);                                                                   // 191
            },                                                                                                         // 192
            YYYYYY : function () {                                                                                     // 193
                var y = this.year(), sign = y >= 0 ? '+' : '-';                                                        // 194
                return sign + leftZeroFill(Math.abs(y), 6);                                                            // 195
            },                                                                                                         // 196
            gg   : function () {                                                                                       // 197
                return leftZeroFill(this.weekYear() % 100, 2);                                                         // 198
            },                                                                                                         // 199
            gggg : function () {                                                                                       // 200
                return leftZeroFill(this.weekYear(), 4);                                                               // 201
            },                                                                                                         // 202
            ggggg : function () {                                                                                      // 203
                return leftZeroFill(this.weekYear(), 5);                                                               // 204
            },                                                                                                         // 205
            GG   : function () {                                                                                       // 206
                return leftZeroFill(this.isoWeekYear() % 100, 2);                                                      // 207
            },                                                                                                         // 208
            GGGG : function () {                                                                                       // 209
                return leftZeroFill(this.isoWeekYear(), 4);                                                            // 210
            },                                                                                                         // 211
            GGGGG : function () {                                                                                      // 212
                return leftZeroFill(this.isoWeekYear(), 5);                                                            // 213
            },                                                                                                         // 214
            e : function () {                                                                                          // 215
                return this.weekday();                                                                                 // 216
            },                                                                                                         // 217
            E : function () {                                                                                          // 218
                return this.isoWeekday();                                                                              // 219
            },                                                                                                         // 220
            a    : function () {                                                                                       // 221
                return this.localeData().meridiem(this.hours(), this.minutes(), true);                                 // 222
            },                                                                                                         // 223
            A    : function () {                                                                                       // 224
                return this.localeData().meridiem(this.hours(), this.minutes(), false);                                // 225
            },                                                                                                         // 226
            H    : function () {                                                                                       // 227
                return this.hours();                                                                                   // 228
            },                                                                                                         // 229
            h    : function () {                                                                                       // 230
                return this.hours() % 12 || 12;                                                                        // 231
            },                                                                                                         // 232
            m    : function () {                                                                                       // 233
                return this.minutes();                                                                                 // 234
            },                                                                                                         // 235
            s    : function () {                                                                                       // 236
                return this.seconds();                                                                                 // 237
            },                                                                                                         // 238
            S    : function () {                                                                                       // 239
                return toInt(this.milliseconds() / 100);                                                               // 240
            },                                                                                                         // 241
            SS   : function () {                                                                                       // 242
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);                                               // 243
            },                                                                                                         // 244
            SSS  : function () {                                                                                       // 245
                return leftZeroFill(this.milliseconds(), 3);                                                           // 246
            },                                                                                                         // 247
            SSSS : function () {                                                                                       // 248
                return leftZeroFill(this.milliseconds(), 3);                                                           // 249
            },                                                                                                         // 250
            Z    : function () {                                                                                       // 251
                var a = this.utcOffset(),                                                                              // 252
                    b = '+';                                                                                           // 253
                if (a < 0) {                                                                                           // 254
                    a = -a;                                                                                            // 255
                    b = '-';                                                                                           // 256
                }                                                                                                      // 257
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);                      // 258
            },                                                                                                         // 259
            ZZ   : function () {                                                                                       // 260
                var a = this.utcOffset(),                                                                              // 261
                    b = '+';                                                                                           // 262
                if (a < 0) {                                                                                           // 263
                    a = -a;                                                                                            // 264
                    b = '-';                                                                                           // 265
                }                                                                                                      // 266
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);                            // 267
            },                                                                                                         // 268
            z : function () {                                                                                          // 269
                return this.zoneAbbr();                                                                                // 270
            },                                                                                                         // 271
            zz : function () {                                                                                         // 272
                return this.zoneName();                                                                                // 273
            },                                                                                                         // 274
            x    : function () {                                                                                       // 275
                return this.valueOf();                                                                                 // 276
            },                                                                                                         // 277
            X    : function () {                                                                                       // 278
                return this.unix();                                                                                    // 279
            },                                                                                                         // 280
            Q : function () {                                                                                          // 281
                return this.quarter();                                                                                 // 282
            }                                                                                                          // 283
        },                                                                                                             // 284
                                                                                                                       // 285
        deprecations = {},                                                                                             // 286
                                                                                                                       // 287
        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'],                                 // 288
                                                                                                                       // 289
        updateInProgress = false;                                                                                      // 290
                                                                                                                       // 291
    // Pick the first defined of two or three arguments. dfl comes from                                                // 292
    // default.                                                                                                        // 293
    function dfl(a, b, c) {                                                                                            // 294
        switch (arguments.length) {                                                                                    // 295
            case 2: return a != null ? a : b;                                                                          // 296
            case 3: return a != null ? a : b != null ? b : c;                                                          // 297
            default: throw new Error('Implement me');                                                                  // 298
        }                                                                                                              // 299
    }                                                                                                                  // 300
                                                                                                                       // 301
    function hasOwnProp(a, b) {                                                                                        // 302
        return hasOwnProperty.call(a, b);                                                                              // 303
    }                                                                                                                  // 304
                                                                                                                       // 305
    function defaultParsingFlags() {                                                                                   // 306
        // We need to deep clone this object, and es5 standard is not very                                             // 307
        // helpful.                                                                                                    // 308
        return {                                                                                                       // 309
            empty : false,                                                                                             // 310
            unusedTokens : [],                                                                                         // 311
            unusedInput : [],                                                                                          // 312
            overflow : -2,                                                                                             // 313
            charsLeftOver : 0,                                                                                         // 314
            nullInput : false,                                                                                         // 315
            invalidMonth : null,                                                                                       // 316
            invalidFormat : false,                                                                                     // 317
            userInvalidated : false,                                                                                   // 318
            iso: false                                                                                                 // 319
        };                                                                                                             // 320
    }                                                                                                                  // 321
                                                                                                                       // 322
    function printMsg(msg) {                                                                                           // 323
        if (moment.suppressDeprecationWarnings === false &&                                                            // 324
                typeof console !== 'undefined' && console.warn) {                                                      // 325
            console.warn('Deprecation warning: ' + msg);                                                               // 326
        }                                                                                                              // 327
    }                                                                                                                  // 328
                                                                                                                       // 329
    function deprecate(msg, fn) {                                                                                      // 330
        var firstTime = true;                                                                                          // 331
        return extend(function () {                                                                                    // 332
            if (firstTime) {                                                                                           // 333
                printMsg(msg);                                                                                         // 334
                firstTime = false;                                                                                     // 335
            }                                                                                                          // 336
            return fn.apply(this, arguments);                                                                          // 337
        }, fn);                                                                                                        // 338
    }                                                                                                                  // 339
                                                                                                                       // 340
    function deprecateSimple(name, msg) {                                                                              // 341
        if (!deprecations[name]) {                                                                                     // 342
            printMsg(msg);                                                                                             // 343
            deprecations[name] = true;                                                                                 // 344
        }                                                                                                              // 345
    }                                                                                                                  // 346
                                                                                                                       // 347
    function padToken(func, count) {                                                                                   // 348
        return function (a) {                                                                                          // 349
            return leftZeroFill(func.call(this, a), count);                                                            // 350
        };                                                                                                             // 351
    }                                                                                                                  // 352
    function ordinalizeToken(func, period) {                                                                           // 353
        return function (a) {                                                                                          // 354
            return this.localeData().ordinal(func.call(this, a), period);                                              // 355
        };                                                                                                             // 356
    }                                                                                                                  // 357
                                                                                                                       // 358
    function monthDiff(a, b) {                                                                                         // 359
        // difference in months                                                                                        // 360
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),                                   // 361
            // b is in (anchor - 1 month, anchor + 1 month)                                                            // 362
            anchor = a.clone().add(wholeMonthDiff, 'months'),                                                          // 363
            anchor2, adjust;                                                                                           // 364
                                                                                                                       // 365
        if (b - anchor < 0) {                                                                                          // 366
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');                                                     // 367
            // linear across the month                                                                                 // 368
            adjust = (b - anchor) / (anchor - anchor2);                                                                // 369
        } else {                                                                                                       // 370
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');                                                     // 371
            // linear across the month                                                                                 // 372
            adjust = (b - anchor) / (anchor2 - anchor);                                                                // 373
        }                                                                                                              // 374
                                                                                                                       // 375
        return -(wholeMonthDiff + adjust);                                                                             // 376
    }                                                                                                                  // 377
                                                                                                                       // 378
    while (ordinalizeTokens.length) {                                                                                  // 379
        i = ordinalizeTokens.pop();                                                                                    // 380
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);                                   // 381
    }                                                                                                                  // 382
    while (paddedTokens.length) {                                                                                      // 383
        i = paddedTokens.pop();                                                                                        // 384
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);                                            // 385
    }                                                                                                                  // 386
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);                                                 // 387
                                                                                                                       // 388
                                                                                                                       // 389
    function meridiemFixWrap(locale, hour, meridiem) {                                                                 // 390
        var isPm;                                                                                                      // 391
                                                                                                                       // 392
        if (meridiem == null) {                                                                                        // 393
            // nothing to do                                                                                           // 394
            return hour;                                                                                               // 395
        }                                                                                                              // 396
        if (locale.meridiemHour != null) {                                                                             // 397
            return locale.meridiemHour(hour, meridiem);                                                                // 398
        } else if (locale.isPM != null) {                                                                              // 399
            // Fallback                                                                                                // 400
            isPm = locale.isPM(meridiem);                                                                              // 401
            if (isPm && hour < 12) {                                                                                   // 402
                hour += 12;                                                                                            // 403
            }                                                                                                          // 404
            if (!isPm && hour === 12) {                                                                                // 405
                hour = 0;                                                                                              // 406
            }                                                                                                          // 407
            return hour;                                                                                               // 408
        } else {                                                                                                       // 409
            // thie is not supposed to happen                                                                          // 410
            return hour;                                                                                               // 411
        }                                                                                                              // 412
    }                                                                                                                  // 413
                                                                                                                       // 414
    /************************************                                                                              // 415
        Constructors                                                                                                   // 416
    ************************************/                                                                              // 417
                                                                                                                       // 418
    function Locale() {                                                                                                // 419
    }                                                                                                                  // 420
                                                                                                                       // 421
    // Moment prototype object                                                                                         // 422
    function Moment(config, skipOverflow) {                                                                            // 423
        if (skipOverflow !== false) {                                                                                  // 424
            checkOverflow(config);                                                                                     // 425
        }                                                                                                              // 426
        copyConfig(this, config);                                                                                      // 427
        this._d = new Date(+config._d);                                                                                // 428
        // Prevent infinite loop in case updateOffset creates new moment                                               // 429
        // objects.                                                                                                    // 430
        if (updateInProgress === false) {                                                                              // 431
            updateInProgress = true;                                                                                   // 432
            moment.updateOffset(this);                                                                                 // 433
            updateInProgress = false;                                                                                  // 434
        }                                                                                                              // 435
    }                                                                                                                  // 436
                                                                                                                       // 437
    // Duration Constructor                                                                                            // 438
    function Duration(duration) {                                                                                      // 439
        var normalizedInput = normalizeObjectUnits(duration),                                                          // 440
            years = normalizedInput.year || 0,                                                                         // 441
            quarters = normalizedInput.quarter || 0,                                                                   // 442
            months = normalizedInput.month || 0,                                                                       // 443
            weeks = normalizedInput.week || 0,                                                                         // 444
            days = normalizedInput.day || 0,                                                                           // 445
            hours = normalizedInput.hour || 0,                                                                         // 446
            minutes = normalizedInput.minute || 0,                                                                     // 447
            seconds = normalizedInput.second || 0,                                                                     // 448
            milliseconds = normalizedInput.millisecond || 0;                                                           // 449
                                                                                                                       // 450
        // representation for dateAddRemove                                                                            // 451
        this._milliseconds = +milliseconds +                                                                           // 452
            seconds * 1e3 + // 1000                                                                                    // 453
            minutes * 6e4 + // 1000 * 60                                                                               // 454
            hours * 36e5; // 1000 * 60 * 60                                                                            // 455
        // Because of dateAddRemove treats 24 hours as different from a                                                // 456
        // day when working around DST, we need to store them separately                                               // 457
        this._days = +days +                                                                                           // 458
            weeks * 7;                                                                                                 // 459
        // It is impossible translate months into days without knowing                                                 // 460
        // which months you are are talking about, so we have to store                                                 // 461
        // it separately.                                                                                              // 462
        this._months = +months +                                                                                       // 463
            quarters * 3 +                                                                                             // 464
            years * 12;                                                                                                // 465
                                                                                                                       // 466
        this._data = {};                                                                                               // 467
                                                                                                                       // 468
        this._locale = moment.localeData();                                                                            // 469
                                                                                                                       // 470
        this._bubble();                                                                                                // 471
    }                                                                                                                  // 472
                                                                                                                       // 473
    /************************************                                                                              // 474
        Helpers                                                                                                        // 475
    ************************************/                                                                              // 476
                                                                                                                       // 477
                                                                                                                       // 478
    function extend(a, b) {                                                                                            // 479
        for (var i in b) {                                                                                             // 480
            if (hasOwnProp(b, i)) {                                                                                    // 481
                a[i] = b[i];                                                                                           // 482
            }                                                                                                          // 483
        }                                                                                                              // 484
                                                                                                                       // 485
        if (hasOwnProp(b, 'toString')) {                                                                               // 486
            a.toString = b.toString;                                                                                   // 487
        }                                                                                                              // 488
                                                                                                                       // 489
        if (hasOwnProp(b, 'valueOf')) {                                                                                // 490
            a.valueOf = b.valueOf;                                                                                     // 491
        }                                                                                                              // 492
                                                                                                                       // 493
        return a;                                                                                                      // 494
    }                                                                                                                  // 495
                                                                                                                       // 496
    function copyConfig(to, from) {                                                                                    // 497
        var i, prop, val;                                                                                              // 498
                                                                                                                       // 499
        if (typeof from._isAMomentObject !== 'undefined') {                                                            // 500
            to._isAMomentObject = from._isAMomentObject;                                                               // 501
        }                                                                                                              // 502
        if (typeof from._i !== 'undefined') {                                                                          // 503
            to._i = from._i;                                                                                           // 504
        }                                                                                                              // 505
        if (typeof from._f !== 'undefined') {                                                                          // 506
            to._f = from._f;                                                                                           // 507
        }                                                                                                              // 508
        if (typeof from._l !== 'undefined') {                                                                          // 509
            to._l = from._l;                                                                                           // 510
        }                                                                                                              // 511
        if (typeof from._strict !== 'undefined') {                                                                     // 512
            to._strict = from._strict;                                                                                 // 513
        }                                                                                                              // 514
        if (typeof from._tzm !== 'undefined') {                                                                        // 515
            to._tzm = from._tzm;                                                                                       // 516
        }                                                                                                              // 517
        if (typeof from._isUTC !== 'undefined') {                                                                      // 518
            to._isUTC = from._isUTC;                                                                                   // 519
        }                                                                                                              // 520
        if (typeof from._offset !== 'undefined') {                                                                     // 521
            to._offset = from._offset;                                                                                 // 522
        }                                                                                                              // 523
        if (typeof from._pf !== 'undefined') {                                                                         // 524
            to._pf = from._pf;                                                                                         // 525
        }                                                                                                              // 526
        if (typeof from._locale !== 'undefined') {                                                                     // 527
            to._locale = from._locale;                                                                                 // 528
        }                                                                                                              // 529
                                                                                                                       // 530
        if (momentProperties.length > 0) {                                                                             // 531
            for (i in momentProperties) {                                                                              // 532
                prop = momentProperties[i];                                                                            // 533
                val = from[prop];                                                                                      // 534
                if (typeof val !== 'undefined') {                                                                      // 535
                    to[prop] = val;                                                                                    // 536
                }                                                                                                      // 537
            }                                                                                                          // 538
        }                                                                                                              // 539
                                                                                                                       // 540
        return to;                                                                                                     // 541
    }                                                                                                                  // 542
                                                                                                                       // 543
    function absRound(number) {                                                                                        // 544
        if (number < 0) {                                                                                              // 545
            return Math.ceil(number);                                                                                  // 546
        } else {                                                                                                       // 547
            return Math.floor(number);                                                                                 // 548
        }                                                                                                              // 549
    }                                                                                                                  // 550
                                                                                                                       // 551
    // left zero fill a number                                                                                         // 552
    // see http://jsperf.com/left-zero-filling for performance comparison                                              // 553
    function leftZeroFill(number, targetLength, forceSign) {                                                           // 554
        var output = '' + Math.abs(number),                                                                            // 555
            sign = number >= 0;                                                                                        // 556
                                                                                                                       // 557
        while (output.length < targetLength) {                                                                         // 558
            output = '0' + output;                                                                                     // 559
        }                                                                                                              // 560
        return (sign ? (forceSign ? '+' : '') : '-') + output;                                                         // 561
    }                                                                                                                  // 562
                                                                                                                       // 563
    function positiveMomentsDifference(base, other) {                                                                  // 564
        var res = {milliseconds: 0, months: 0};                                                                        // 565
                                                                                                                       // 566
        res.months = other.month() - base.month() +                                                                    // 567
            (other.year() - base.year()) * 12;                                                                         // 568
        if (base.clone().add(res.months, 'M').isAfter(other)) {                                                        // 569
            --res.months;                                                                                              // 570
        }                                                                                                              // 571
                                                                                                                       // 572
        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));                                              // 573
                                                                                                                       // 574
        return res;                                                                                                    // 575
    }                                                                                                                  // 576
                                                                                                                       // 577
    function momentsDifference(base, other) {                                                                          // 578
        var res;                                                                                                       // 579
        other = makeAs(other, base);                                                                                   // 580
        if (base.isBefore(other)) {                                                                                    // 581
            res = positiveMomentsDifference(base, other);                                                              // 582
        } else {                                                                                                       // 583
            res = positiveMomentsDifference(other, base);                                                              // 584
            res.milliseconds = -res.milliseconds;                                                                      // 585
            res.months = -res.months;                                                                                  // 586
        }                                                                                                              // 587
                                                                                                                       // 588
        return res;                                                                                                    // 589
    }                                                                                                                  // 590
                                                                                                                       // 591
    // TODO: remove 'name' arg after deprecation is removed                                                            // 592
    function createAdder(direction, name) {                                                                            // 593
        return function (val, period) {                                                                                // 594
            var dur, tmp;                                                                                              // 595
            //invert the arguments, but complain about it                                                              // 596
            if (period !== null && !isNaN(+period)) {                                                                  // 597
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;                                                                 // 599
            }                                                                                                          // 600
                                                                                                                       // 601
            val = typeof val === 'string' ? +val : val;                                                                // 602
            dur = moment.duration(val, period);                                                                        // 603
            addOrSubtractDurationFromMoment(this, dur, direction);                                                     // 604
            return this;                                                                                               // 605
        };                                                                                                             // 606
    }                                                                                                                  // 607
                                                                                                                       // 608
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {                                  // 609
        var milliseconds = duration._milliseconds,                                                                     // 610
            days = duration._days,                                                                                     // 611
            months = duration._months;                                                                                 // 612
        updateOffset = updateOffset == null ? true : updateOffset;                                                     // 613
                                                                                                                       // 614
        if (milliseconds) {                                                                                            // 615
            mom._d.setTime(+mom._d + milliseconds * isAdding);                                                         // 616
        }                                                                                                              // 617
        if (days) {                                                                                                    // 618
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);                                          // 619
        }                                                                                                              // 620
        if (months) {                                                                                                  // 621
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);                                          // 622
        }                                                                                                              // 623
        if (updateOffset) {                                                                                            // 624
            moment.updateOffset(mom, days || months);                                                                  // 625
        }                                                                                                              // 626
    }                                                                                                                  // 627
                                                                                                                       // 628
    // check if is an array                                                                                            // 629
    function isArray(input) {                                                                                          // 630
        return Object.prototype.toString.call(input) === '[object Array]';                                             // 631
    }                                                                                                                  // 632
                                                                                                                       // 633
    function isDate(input) {                                                                                           // 634
        return Object.prototype.toString.call(input) === '[object Date]' ||                                            // 635
            input instanceof Date;                                                                                     // 636
    }                                                                                                                  // 637
                                                                                                                       // 638
    // compare two arrays, return the number of differences                                                            // 639
    function compareArrays(array1, array2, dontConvert) {                                                              // 640
        var len = Math.min(array1.length, array2.length),                                                              // 641
            lengthDiff = Math.abs(array1.length - array2.length),                                                      // 642
            diffs = 0,                                                                                                 // 643
            i;                                                                                                         // 644
        for (i = 0; i < len; i++) {                                                                                    // 645
            if ((dontConvert && array1[i] !== array2[i]) ||                                                            // 646
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {                                             // 647
                diffs++;                                                                                               // 648
            }                                                                                                          // 649
        }                                                                                                              // 650
        return diffs + lengthDiff;                                                                                     // 651
    }                                                                                                                  // 652
                                                                                                                       // 653
    function normalizeUnits(units) {                                                                                   // 654
        if (units) {                                                                                                   // 655
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');                                                  // 656
            units = unitAliases[units] || camelFunctions[lowered] || lowered;                                          // 657
        }                                                                                                              // 658
        return units;                                                                                                  // 659
    }                                                                                                                  // 660
                                                                                                                       // 661
    function normalizeObjectUnits(inputObject) {                                                                       // 662
        var normalizedInput = {},                                                                                      // 663
            normalizedProp,                                                                                            // 664
            prop;                                                                                                      // 665
                                                                                                                       // 666
        for (prop in inputObject) {                                                                                    // 667
            if (hasOwnProp(inputObject, prop)) {                                                                       // 668
                normalizedProp = normalizeUnits(prop);                                                                 // 669
                if (normalizedProp) {                                                                                  // 670
                    normalizedInput[normalizedProp] = inputObject[prop];                                               // 671
                }                                                                                                      // 672
            }                                                                                                          // 673
        }                                                                                                              // 674
                                                                                                                       // 675
        return normalizedInput;                                                                                        // 676
    }                                                                                                                  // 677
                                                                                                                       // 678
    function makeList(field) {                                                                                         // 679
        var count, setter;                                                                                             // 680
                                                                                                                       // 681
        if (field.indexOf('week') === 0) {                                                                             // 682
            count = 7;                                                                                                 // 683
            setter = 'day';                                                                                            // 684
        }                                                                                                              // 685
        else if (field.indexOf('month') === 0) {                                                                       // 686
            count = 12;                                                                                                // 687
            setter = 'month';                                                                                          // 688
        }                                                                                                              // 689
        else {                                                                                                         // 690
            return;                                                                                                    // 691
        }                                                                                                              // 692
                                                                                                                       // 693
        moment[field] = function (format, index) {                                                                     // 694
            var i, getter,                                                                                             // 695
                method = moment._locale[field],                                                                        // 696
                results = [];                                                                                          // 697
                                                                                                                       // 698
            if (typeof format === 'number') {                                                                          // 699
                index = format;                                                                                        // 700
                format = undefined;                                                                                    // 701
            }                                                                                                          // 702
                                                                                                                       // 703
            getter = function (i) {                                                                                    // 704
                var m = moment().utc().set(setter, i);                                                                 // 705
                return method.call(moment._locale, m, format || '');                                                   // 706
            };                                                                                                         // 707
                                                                                                                       // 708
            if (index != null) {                                                                                       // 709
                return getter(index);                                                                                  // 710
            }                                                                                                          // 711
            else {                                                                                                     // 712
                for (i = 0; i < count; i++) {                                                                          // 713
                    results.push(getter(i));                                                                           // 714
                }                                                                                                      // 715
                return results;                                                                                        // 716
            }                                                                                                          // 717
        };                                                                                                             // 718
    }                                                                                                                  // 719
                                                                                                                       // 720
    function toInt(argumentForCoercion) {                                                                              // 721
        var coercedNumber = +argumentForCoercion,                                                                      // 722
            value = 0;                                                                                                 // 723
                                                                                                                       // 724
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {                                                          // 725
            if (coercedNumber >= 0) {                                                                                  // 726
                value = Math.floor(coercedNumber);                                                                     // 727
            } else {                                                                                                   // 728
                value = Math.ceil(coercedNumber);                                                                      // 729
            }                                                                                                          // 730
        }                                                                                                              // 731
                                                                                                                       // 732
        return value;                                                                                                  // 733
    }                                                                                                                  // 734
                                                                                                                       // 735
    function daysInMonth(year, month) {                                                                                // 736
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();                                                    // 737
    }                                                                                                                  // 738
                                                                                                                       // 739
    function weeksInYear(year, dow, doy) {                                                                             // 740
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;                                          // 741
    }                                                                                                                  // 742
                                                                                                                       // 743
    function daysInYear(year) {                                                                                        // 744
        return isLeapYear(year) ? 366 : 365;                                                                           // 745
    }                                                                                                                  // 746
                                                                                                                       // 747
    function isLeapYear(year) {                                                                                        // 748
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;                                               // 749
    }                                                                                                                  // 750
                                                                                                                       // 751
    function checkOverflow(m) {                                                                                        // 752
        var overflow;                                                                                                  // 753
        if (m._a && m._pf.overflow === -2) {                                                                           // 754
            overflow =                                                                                                 // 755
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :                                                          // 756
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :                           // 757
                m._a[HOUR] < 0 || m._a[HOUR] > 24 ||                                                                   // 758
                    (m._a[HOUR] === 24 && (m._a[MINUTE] !== 0 ||                                                       // 759
                                           m._a[SECOND] !== 0 ||                                                       // 760
                                           m._a[MILLISECOND] !== 0)) ? HOUR :                                          // 761
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :                                                       // 762
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :                                                       // 763
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :                                       // 764
                -1;                                                                                                    // 765
                                                                                                                       // 766
            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {                                    // 767
                overflow = DATE;                                                                                       // 768
            }                                                                                                          // 769
                                                                                                                       // 770
            m._pf.overflow = overflow;                                                                                 // 771
        }                                                                                                              // 772
    }                                                                                                                  // 773
                                                                                                                       // 774
    function isValid(m) {                                                                                              // 775
        if (m._isValid == null) {                                                                                      // 776
            m._isValid = !isNaN(m._d.getTime()) &&                                                                     // 777
                m._pf.overflow < 0 &&                                                                                  // 778
                !m._pf.empty &&                                                                                        // 779
                !m._pf.invalidMonth &&                                                                                 // 780
                !m._pf.nullInput &&                                                                                    // 781
                !m._pf.invalidFormat &&                                                                                // 782
                !m._pf.userInvalidated;                                                                                // 783
                                                                                                                       // 784
            if (m._strict) {                                                                                           // 785
                m._isValid = m._isValid &&                                                                             // 786
                    m._pf.charsLeftOver === 0 &&                                                                       // 787
                    m._pf.unusedTokens.length === 0 &&                                                                 // 788
                    m._pf.bigHour === undefined;                                                                       // 789
            }                                                                                                          // 790
        }                                                                                                              // 791
        return m._isValid;                                                                                             // 792
    }                                                                                                                  // 793
                                                                                                                       // 794
    function normalizeLocale(key) {                                                                                    // 795
        return key ? key.toLowerCase().replace('_', '-') : key;                                                        // 796
    }                                                                                                                  // 797
                                                                                                                       // 798
    // pick the locale from the array                                                                                  // 799
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each                       // 800
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {                                                                                     // 802
        var i = 0, j, next, locale, split;                                                                             // 803
                                                                                                                       // 804
        while (i < names.length) {                                                                                     // 805
            split = normalizeLocale(names[i]).split('-');                                                              // 806
            j = split.length;                                                                                          // 807
            next = normalizeLocale(names[i + 1]);                                                                      // 808
            next = next ? next.split('-') : null;                                                                      // 809
            while (j > 0) {                                                                                            // 810
                locale = loadLocale(split.slice(0, j).join('-'));                                                      // 811
                if (locale) {                                                                                          // 812
                    return locale;                                                                                     // 813
                }                                                                                                      // 814
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {                           // 815
                    //the next array item is better than a shallower substring of this one                             // 816
                    break;                                                                                             // 817
                }                                                                                                      // 818
                j--;                                                                                                   // 819
            }                                                                                                          // 820
            i++;                                                                                                       // 821
        }                                                                                                              // 822
        return null;                                                                                                   // 823
    }                                                                                                                  // 824
                                                                                                                       // 825
    function loadLocale(name) {                                                                                        // 826
        var oldLocale = null;                                                                                          // 827
        if (!locales[name] && hasModule) {                                                                             // 828
            try {                                                                                                      // 829
                oldLocale = moment.locale();                                                                           // 830
                require('./locale/' + name);                                                                           // 831
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);                                                                              // 833
            } catch (e) { }                                                                                            // 834
        }                                                                                                              // 835
        return locales[name];                                                                                          // 836
    }                                                                                                                  // 837
                                                                                                                       // 838
    // Return a moment from input, that is local/utc/utcOffset equivalent to                                           // 839
    // model.                                                                                                          // 840
    function makeAs(input, model) {                                                                                    // 841
        var res, diff;                                                                                                 // 842
        if (model._isUTC) {                                                                                            // 843
            res = model.clone();                                                                                       // 844
            diff = (moment.isMoment(input) || isDate(input) ?                                                          // 845
                    +input : +moment(input)) - (+res);                                                                 // 846
            // Use low-level api, because this fn is low-level api.                                                    // 847
            res._d.setTime(+res._d + diff);                                                                            // 848
            moment.updateOffset(res, false);                                                                           // 849
            return res;                                                                                                // 850
        } else {                                                                                                       // 851
            return moment(input).local();                                                                              // 852
        }                                                                                                              // 853
    }                                                                                                                  // 854
                                                                                                                       // 855
    /************************************                                                                              // 856
        Locale                                                                                                         // 857
    ************************************/                                                                              // 858
                                                                                                                       // 859
                                                                                                                       // 860
    extend(Locale.prototype, {                                                                                         // 861
                                                                                                                       // 862
        set : function (config) {                                                                                      // 863
            var prop, i;                                                                                               // 864
            for (i in config) {                                                                                        // 865
                prop = config[i];                                                                                      // 866
                if (typeof prop === 'function') {                                                                      // 867
                    this[i] = prop;                                                                                    // 868
                } else {                                                                                               // 869
                    this['_' + i] = prop;                                                                              // 870
                }                                                                                                      // 871
            }                                                                                                          // 872
            // Lenient ordinal parsing accepts just a number in addition to                                            // 873
            // number + (possibly) stuff coming from _ordinalParseLenient.                                             // 874
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + /\d{1,2}/.source);                // 875
        },                                                                                                             // 876
                                                                                                                       // 877
        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),  // 878
        months : function (m) {                                                                                        // 879
            return this._months[m.month()];                                                                            // 880
        },                                                                                                             // 881
                                                                                                                       // 882
        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),                                   // 883
        monthsShort : function (m) {                                                                                   // 884
            return this._monthsShort[m.month()];                                                                       // 885
        },                                                                                                             // 886
                                                                                                                       // 887
        monthsParse : function (monthName, format, strict) {                                                           // 888
            var i, mom, regex;                                                                                         // 889
                                                                                                                       // 890
            if (!this._monthsParse) {                                                                                  // 891
                this._monthsParse = [];                                                                                // 892
                this._longMonthsParse = [];                                                                            // 893
                this._shortMonthsParse = [];                                                                           // 894
            }                                                                                                          // 895
                                                                                                                       // 896
            for (i = 0; i < 12; i++) {                                                                                 // 897
                // make the regex if we don't have it already                                                          // 898
                mom = moment.utc([2000, i]);                                                                           // 899
                if (strict && !this._longMonthsParse[i]) {                                                             // 900
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');     // 901
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }                                                                                                      // 903
                if (!strict && !this._monthsParse[i]) {                                                                // 904
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');                             // 905
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');                                    // 906
                }                                                                                                      // 907
                // test the regex                                                                                      // 908
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {                         // 909
                    return i;                                                                                          // 910
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {                  // 911
                    return i;                                                                                          // 912
                } else if (!strict && this._monthsParse[i].test(monthName)) {                                          // 913
                    return i;                                                                                          // 914
                }                                                                                                      // 915
            }                                                                                                          // 916
        },                                                                                                             // 917
                                                                                                                       // 918
        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),                             // 919
        weekdays : function (m) {                                                                                      // 920
            return this._weekdays[m.day()];                                                                            // 921
        },                                                                                                             // 922
                                                                                                                       // 923
        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),                                                     // 924
        weekdaysShort : function (m) {                                                                                 // 925
            return this._weekdaysShort[m.day()];                                                                       // 926
        },                                                                                                             // 927
                                                                                                                       // 928
        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),                                                              // 929
        weekdaysMin : function (m) {                                                                                   // 930
            return this._weekdaysMin[m.day()];                                                                         // 931
        },                                                                                                             // 932
                                                                                                                       // 933
        weekdaysParse : function (weekdayName) {                                                                       // 934
            var i, mom, regex;                                                                                         // 935
                                                                                                                       // 936
            if (!this._weekdaysParse) {                                                                                // 937
                this._weekdaysParse = [];                                                                              // 938
            }                                                                                                          // 939
                                                                                                                       // 940
            for (i = 0; i < 7; i++) {                                                                                  // 941
                // make the regex if we don't have it already                                                          // 942
                if (!this._weekdaysParse[i]) {                                                                         // 943
                    mom = moment([2000, 1]).day(i);                                                                    // 944
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');                                  // 946
                }                                                                                                      // 947
                // test the regex                                                                                      // 948
                if (this._weekdaysParse[i].test(weekdayName)) {                                                        // 949
                    return i;                                                                                          // 950
                }                                                                                                      // 951
            }                                                                                                          // 952
        },                                                                                                             // 953
                                                                                                                       // 954
        _longDateFormat : {                                                                                            // 955
            LTS : 'h:mm:ss A',                                                                                         // 956
            LT : 'h:mm A',                                                                                             // 957
            L : 'MM/DD/YYYY',                                                                                          // 958
            LL : 'MMMM D, YYYY',                                                                                       // 959
            LLL : 'MMMM D, YYYY LT',                                                                                   // 960
            LLLL : 'dddd, MMMM D, YYYY LT'                                                                             // 961
        },                                                                                                             // 962
        longDateFormat : function (key) {                                                                              // 963
            var output = this._longDateFormat[key];                                                                    // 964
            if (!output && this._longDateFormat[key.toUpperCase()]) {                                                  // 965
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {          // 966
                    return val.slice(1);                                                                               // 967
                });                                                                                                    // 968
                this._longDateFormat[key] = output;                                                                    // 969
            }                                                                                                          // 970
            return output;                                                                                             // 971
        },                                                                                                             // 972
                                                                                                                       // 973
        isPM : function (input) {                                                                                      // 974
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays                         // 975
            // Using charAt should be more compatible.                                                                 // 976
            return ((input + '').toLowerCase().charAt(0) === 'p');                                                     // 977
        },                                                                                                             // 978
                                                                                                                       // 979
        _meridiemParse : /[ap]\.?m?\.?/i,                                                                              // 980
        meridiem : function (hours, minutes, isLower) {                                                                // 981
            if (hours > 11) {                                                                                          // 982
                return isLower ? 'pm' : 'PM';                                                                          // 983
            } else {                                                                                                   // 984
                return isLower ? 'am' : 'AM';                                                                          // 985
            }                                                                                                          // 986
        },                                                                                                             // 987
                                                                                                                       // 988
                                                                                                                       // 989
        _calendar : {                                                                                                  // 990
            sameDay : '[Today at] LT',                                                                                 // 991
            nextDay : '[Tomorrow at] LT',                                                                              // 992
            nextWeek : 'dddd [at] LT',                                                                                 // 993
            lastDay : '[Yesterday at] LT',                                                                             // 994
            lastWeek : '[Last] dddd [at] LT',                                                                          // 995
            sameElse : 'L'                                                                                             // 996
        },                                                                                                             // 997
        calendar : function (key, mom, now) {                                                                          // 998
            var output = this._calendar[key];                                                                          // 999
            return typeof output === 'function' ? output.apply(mom, [now]) : output;                                   // 1000
        },                                                                                                             // 1001
                                                                                                                       // 1002
        _relativeTime : {                                                                                              // 1003
            future : 'in %s',                                                                                          // 1004
            past : '%s ago',                                                                                           // 1005
            s : 'a few seconds',                                                                                       // 1006
            m : 'a minute',                                                                                            // 1007
            mm : '%d minutes',                                                                                         // 1008
            h : 'an hour',                                                                                             // 1009
            hh : '%d hours',                                                                                           // 1010
            d : 'a day',                                                                                               // 1011
            dd : '%d days',                                                                                            // 1012
            M : 'a month',                                                                                             // 1013
            MM : '%d months',                                                                                          // 1014
            y : 'a year',                                                                                              // 1015
            yy : '%d years'                                                                                            // 1016
        },                                                                                                             // 1017
                                                                                                                       // 1018
        relativeTime : function (number, withoutSuffix, string, isFuture) {                                            // 1019
            var output = this._relativeTime[string];                                                                   // 1020
            return (typeof output === 'function') ?                                                                    // 1021
                output(number, withoutSuffix, string, isFuture) :                                                      // 1022
                output.replace(/%d/i, number);                                                                         // 1023
        },                                                                                                             // 1024
                                                                                                                       // 1025
        pastFuture : function (diff, output) {                                                                         // 1026
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];                                             // 1027
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);                      // 1028
        },                                                                                                             // 1029
                                                                                                                       // 1030
        ordinal : function (number) {                                                                                  // 1031
            return this._ordinal.replace('%d', number);                                                                // 1032
        },                                                                                                             // 1033
        _ordinal : '%d',                                                                                               // 1034
        _ordinalParse : /\d{1,2}/,                                                                                     // 1035
                                                                                                                       // 1036
        preparse : function (string) {                                                                                 // 1037
            return string;                                                                                             // 1038
        },                                                                                                             // 1039
                                                                                                                       // 1040
        postformat : function (string) {                                                                               // 1041
            return string;                                                                                             // 1042
        },                                                                                                             // 1043
                                                                                                                       // 1044
        week : function (mom) {                                                                                        // 1045
            return weekOfYear(mom, this._week.dow, this._week.doy).week;                                               // 1046
        },                                                                                                             // 1047
                                                                                                                       // 1048
        _week : {                                                                                                      // 1049
            dow : 0, // Sunday is the first day of the week.                                                           // 1050
            doy : 6  // The week that contains Jan 1st is the first week of the year.                                  // 1051
        },                                                                                                             // 1052
                                                                                                                       // 1053
        firstDayOfWeek : function () {                                                                                 // 1054
            return this._week.dow;                                                                                     // 1055
        },                                                                                                             // 1056
                                                                                                                       // 1057
        firstDayOfYear : function () {                                                                                 // 1058
            return this._week.doy;                                                                                     // 1059
        },                                                                                                             // 1060
                                                                                                                       // 1061
        _invalidDate: 'Invalid date',                                                                                  // 1062
        invalidDate: function () {                                                                                     // 1063
            return this._invalidDate;                                                                                  // 1064
        }                                                                                                              // 1065
    });                                                                                                                // 1066
                                                                                                                       // 1067
    /************************************                                                                              // 1068
        Formatting                                                                                                     // 1069
    ************************************/                                                                              // 1070
                                                                                                                       // 1071
                                                                                                                       // 1072
    function removeFormattingTokens(input) {                                                                           // 1073
        if (input.match(/\[[\s\S]/)) {                                                                                 // 1074
            return input.replace(/^\[|\]$/g, '');                                                                      // 1075
        }                                                                                                              // 1076
        return input.replace(/\\/g, '');                                                                               // 1077
    }                                                                                                                  // 1078
                                                                                                                       // 1079
    function makeFormatFunction(format) {                                                                              // 1080
        var array = format.match(formattingTokens), i, length;                                                         // 1081
                                                                                                                       // 1082
        for (i = 0, length = array.length; i < length; i++) {                                                          // 1083
            if (formatTokenFunctions[array[i]]) {                                                                      // 1084
                array[i] = formatTokenFunctions[array[i]];                                                             // 1085
            } else {                                                                                                   // 1086
                array[i] = removeFormattingTokens(array[i]);                                                           // 1087
            }                                                                                                          // 1088
        }                                                                                                              // 1089
                                                                                                                       // 1090
        return function (mom) {                                                                                        // 1091
            var output = '';                                                                                           // 1092
            for (i = 0; i < length; i++) {                                                                             // 1093
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];                        // 1094
            }                                                                                                          // 1095
            return output;                                                                                             // 1096
        };                                                                                                             // 1097
    }                                                                                                                  // 1098
                                                                                                                       // 1099
    // format date using native date object                                                                            // 1100
    function formatMoment(m, format) {                                                                                 // 1101
        if (!m.isValid()) {                                                                                            // 1102
            return m.localeData().invalidDate();                                                                       // 1103
        }                                                                                                              // 1104
                                                                                                                       // 1105
        format = expandFormat(format, m.localeData());                                                                 // 1106
                                                                                                                       // 1107
        if (!formatFunctions[format]) {                                                                                // 1108
            formatFunctions[format] = makeFormatFunction(format);                                                      // 1109
        }                                                                                                              // 1110
                                                                                                                       // 1111
        return formatFunctions[format](m);                                                                             // 1112
    }                                                                                                                  // 1113
                                                                                                                       // 1114
    function expandFormat(format, locale) {                                                                            // 1115
        var i = 5;                                                                                                     // 1116
                                                                                                                       // 1117
        function replaceLongDateFormatTokens(input) {                                                                  // 1118
            return locale.longDateFormat(input) || input;                                                              // 1119
        }                                                                                                              // 1120
                                                                                                                       // 1121
        localFormattingTokens.lastIndex = 0;                                                                           // 1122
        while (i >= 0 && localFormattingTokens.test(format)) {                                                         // 1123
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);                               // 1124
            localFormattingTokens.lastIndex = 0;                                                                       // 1125
            i -= 1;                                                                                                    // 1126
        }                                                                                                              // 1127
                                                                                                                       // 1128
        return format;                                                                                                 // 1129
    }                                                                                                                  // 1130
                                                                                                                       // 1131
                                                                                                                       // 1132
    /************************************                                                                              // 1133
        Parsing                                                                                                        // 1134
    ************************************/                                                                              // 1135
                                                                                                                       // 1136
                                                                                                                       // 1137
    // get the regex to find the next token                                                                            // 1138
    function getParseRegexForToken(token, config) {                                                                    // 1139
        var a, strict = config._strict;                                                                                // 1140
        switch (token) {                                                                                               // 1141
        case 'Q':                                                                                                      // 1142
            return parseTokenOneDigit;                                                                                 // 1143
        case 'DDDD':                                                                                                   // 1144
            return parseTokenThreeDigits;                                                                              // 1145
        case 'YYYY':                                                                                                   // 1146
        case 'GGGG':                                                                                                   // 1147
        case 'gggg':                                                                                                   // 1148
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;                                          // 1149
        case 'Y':                                                                                                      // 1150
        case 'G':                                                                                                      // 1151
        case 'g':                                                                                                      // 1152
            return parseTokenSignedNumber;                                                                             // 1153
        case 'YYYYYY':                                                                                                 // 1154
        case 'YYYYY':                                                                                                  // 1155
        case 'GGGGG':                                                                                                  // 1156
        case 'ggggg':                                                                                                  // 1157
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;                                            // 1158
        case 'S':                                                                                                      // 1159
            if (strict) {                                                                                              // 1160
                return parseTokenOneDigit;                                                                             // 1161
            }                                                                                                          // 1162
            /* falls through */                                                                                        // 1163
        case 'SS':                                                                                                     // 1164
            if (strict) {                                                                                              // 1165
                return parseTokenTwoDigits;                                                                            // 1166
            }                                                                                                          // 1167
            /* falls through */                                                                                        // 1168
        case 'SSS':                                                                                                    // 1169
            if (strict) {                                                                                              // 1170
                return parseTokenThreeDigits;                                                                          // 1171
            }                                                                                                          // 1172
            /* falls through */                                                                                        // 1173
        case 'DDD':                                                                                                    // 1174
            return parseTokenOneToThreeDigits;                                                                         // 1175
        case 'MMM':                                                                                                    // 1176
        case 'MMMM':                                                                                                   // 1177
        case 'dd':                                                                                                     // 1178
        case 'ddd':                                                                                                    // 1179
        case 'dddd':                                                                                                   // 1180
            return parseTokenWord;                                                                                     // 1181
        case 'a':                                                                                                      // 1182
        case 'A':                                                                                                      // 1183
            return config._locale._meridiemParse;                                                                      // 1184
        case 'x':                                                                                                      // 1185
            return parseTokenOffsetMs;                                                                                 // 1186
        case 'X':                                                                                                      // 1187
            return parseTokenTimestampMs;                                                                              // 1188
        case 'Z':                                                                                                      // 1189
        case 'ZZ':                                                                                                     // 1190
            return parseTokenTimezone;                                                                                 // 1191
        case 'T':                                                                                                      // 1192
            return parseTokenT;                                                                                        // 1193
        case 'SSSS':                                                                                                   // 1194
            return parseTokenDigits;                                                                                   // 1195
        case 'MM':                                                                                                     // 1196
        case 'DD':                                                                                                     // 1197
        case 'YY':                                                                                                     // 1198
        case 'GG':                                                                                                     // 1199
        case 'gg':                                                                                                     // 1200
        case 'HH':                                                                                                     // 1201
        case 'hh':                                                                                                     // 1202
        case 'mm':                                                                                                     // 1203
        case 'ss':                                                                                                     // 1204
        case 'ww':                                                                                                     // 1205
        case 'WW':                                                                                                     // 1206
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;                                            // 1207
        case 'M':                                                                                                      // 1208
        case 'D':                                                                                                      // 1209
        case 'd':                                                                                                      // 1210
        case 'H':                                                                                                      // 1211
        case 'h':                                                                                                      // 1212
        case 'm':                                                                                                      // 1213
        case 's':                                                                                                      // 1214
        case 'w':                                                                                                      // 1215
        case 'W':                                                                                                      // 1216
        case 'e':                                                                                                      // 1217
        case 'E':                                                                                                      // 1218
            return parseTokenOneOrTwoDigits;                                                                           // 1219
        case 'Do':                                                                                                     // 1220
            return strict ? config._locale._ordinalParse : config._locale._ordinalParseLenient;                        // 1221
        default :                                                                                                      // 1222
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));                                // 1223
            return a;                                                                                                  // 1224
        }                                                                                                              // 1225
    }                                                                                                                  // 1226
                                                                                                                       // 1227
    function utcOffsetFromString(string) {                                                                             // 1228
        string = string || '';                                                                                         // 1229
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),                                              // 1230
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],                                           // 1231
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],                                         // 1232
            minutes = +(parts[1] * 60) + toInt(parts[2]);                                                              // 1233
                                                                                                                       // 1234
        return parts[0] === '+' ? minutes : -minutes;                                                                  // 1235
    }                                                                                                                  // 1236
                                                                                                                       // 1237
    // function to convert string input to date                                                                        // 1238
    function addTimeToArrayFromToken(token, input, config) {                                                           // 1239
        var a, datePartArray = config._a;                                                                              // 1240
                                                                                                                       // 1241
        switch (token) {                                                                                               // 1242
        // QUARTER                                                                                                     // 1243
        case 'Q':                                                                                                      // 1244
            if (input != null) {                                                                                       // 1245
                datePartArray[MONTH] = (toInt(input) - 1) * 3;                                                         // 1246
            }                                                                                                          // 1247
            break;                                                                                                     // 1248
        // MONTH                                                                                                       // 1249
        case 'M' : // fall through to MM                                                                               // 1250
        case 'MM' :                                                                                                    // 1251
            if (input != null) {                                                                                       // 1252
                datePartArray[MONTH] = toInt(input) - 1;                                                               // 1253
            }                                                                                                          // 1254
            break;                                                                                                     // 1255
        case 'MMM' : // fall through to MMMM                                                                           // 1256
        case 'MMMM' :                                                                                                  // 1257
            a = config._locale.monthsParse(input, token, config._strict);                                              // 1258
            // if we didn't find a month name, mark the date as invalid.                                               // 1259
            if (a != null) {                                                                                           // 1260
                datePartArray[MONTH] = a;                                                                              // 1261
            } else {                                                                                                   // 1262
                config._pf.invalidMonth = input;                                                                       // 1263
            }                                                                                                          // 1264
            break;                                                                                                     // 1265
        // DAY OF MONTH                                                                                                // 1266
        case 'D' : // fall through to DD                                                                               // 1267
        case 'DD' :                                                                                                    // 1268
            if (input != null) {                                                                                       // 1269
                datePartArray[DATE] = toInt(input);                                                                    // 1270
            }                                                                                                          // 1271
            break;                                                                                                     // 1272
        case 'Do' :                                                                                                    // 1273
            if (input != null) {                                                                                       // 1274
                datePartArray[DATE] = toInt(parseInt(                                                                  // 1275
                            input.match(/\d{1,2}/)[0], 10));                                                           // 1276
            }                                                                                                          // 1277
            break;                                                                                                     // 1278
        // DAY OF YEAR                                                                                                 // 1279
        case 'DDD' : // fall through to DDDD                                                                           // 1280
        case 'DDDD' :                                                                                                  // 1281
            if (input != null) {                                                                                       // 1282
                config._dayOfYear = toInt(input);                                                                      // 1283
            }                                                                                                          // 1284
                                                                                                                       // 1285
            break;                                                                                                     // 1286
        // YEAR                                                                                                        // 1287
        case 'YY' :                                                                                                    // 1288
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);                                                     // 1289
            break;                                                                                                     // 1290
        case 'YYYY' :                                                                                                  // 1291
        case 'YYYYY' :                                                                                                 // 1292
        case 'YYYYYY' :                                                                                                // 1293
            datePartArray[YEAR] = toInt(input);                                                                        // 1294
            break;                                                                                                     // 1295
        // AM / PM                                                                                                     // 1296
        case 'a' : // fall through to A                                                                                // 1297
        case 'A' :                                                                                                     // 1298
            config._meridiem = input;                                                                                  // 1299
            // config._isPm = config._locale.isPM(input);                                                              // 1300
            break;                                                                                                     // 1301
        // HOUR                                                                                                        // 1302
        case 'h' : // fall through to hh                                                                               // 1303
        case 'hh' :                                                                                                    // 1304
            config._pf.bigHour = true;                                                                                 // 1305
            /* falls through */                                                                                        // 1306
        case 'H' : // fall through to HH                                                                               // 1307
        case 'HH' :                                                                                                    // 1308
            datePartArray[HOUR] = toInt(input);                                                                        // 1309
            break;                                                                                                     // 1310
        // MINUTE                                                                                                      // 1311
        case 'm' : // fall through to mm                                                                               // 1312
        case 'mm' :                                                                                                    // 1313
            datePartArray[MINUTE] = toInt(input);                                                                      // 1314
            break;                                                                                                     // 1315
        // SECOND                                                                                                      // 1316
        case 's' : // fall through to ss                                                                               // 1317
        case 'ss' :                                                                                                    // 1318
            datePartArray[SECOND] = toInt(input);                                                                      // 1319
            break;                                                                                                     // 1320
        // MILLISECOND                                                                                                 // 1321
        case 'S' :                                                                                                     // 1322
        case 'SS' :                                                                                                    // 1323
        case 'SSS' :                                                                                                   // 1324
        case 'SSSS' :                                                                                                  // 1325
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);                                                 // 1326
            break;                                                                                                     // 1327
        // UNIX OFFSET (MILLISECONDS)                                                                                  // 1328
        case 'x':                                                                                                      // 1329
            config._d = new Date(toInt(input));                                                                        // 1330
            break;                                                                                                     // 1331
        // UNIX TIMESTAMP WITH MS                                                                                      // 1332
        case 'X':                                                                                                      // 1333
            config._d = new Date(parseFloat(input) * 1000);                                                            // 1334
            break;                                                                                                     // 1335
        // TIMEZONE                                                                                                    // 1336
        case 'Z' : // fall through to ZZ                                                                               // 1337
        case 'ZZ' :                                                                                                    // 1338
            config._useUTC = true;                                                                                     // 1339
            config._tzm = utcOffsetFromString(input);                                                                  // 1340
            break;                                                                                                     // 1341
        // WEEKDAY - human                                                                                             // 1342
        case 'dd':                                                                                                     // 1343
        case 'ddd':                                                                                                    // 1344
        case 'dddd':                                                                                                   // 1345
            a = config._locale.weekdaysParse(input);                                                                   // 1346
            // if we didn't get a weekday name, mark the date as invalid                                               // 1347
            if (a != null) {                                                                                           // 1348
                config._w = config._w || {};                                                                           // 1349
                config._w['d'] = a;                                                                                    // 1350
            } else {                                                                                                   // 1351
                config._pf.invalidWeekday = input;                                                                     // 1352
            }                                                                                                          // 1353
            break;                                                                                                     // 1354
        // WEEK, WEEK DAY - numeric                                                                                    // 1355
        case 'w':                                                                                                      // 1356
        case 'ww':                                                                                                     // 1357
        case 'W':                                                                                                      // 1358
        case 'WW':                                                                                                     // 1359
        case 'd':                                                                                                      // 1360
        case 'e':                                                                                                      // 1361
        case 'E':                                                                                                      // 1362
            token = token.substr(0, 1);                                                                                // 1363
            /* falls through */                                                                                        // 1364
        case 'gggg':                                                                                                   // 1365
        case 'GGGG':                                                                                                   // 1366
        case 'GGGGG':                                                                                                  // 1367
            token = token.substr(0, 2);                                                                                // 1368
            if (input) {                                                                                               // 1369
                config._w = config._w || {};                                                                           // 1370
                config._w[token] = toInt(input);                                                                       // 1371
            }                                                                                                          // 1372
            break;                                                                                                     // 1373
        case 'gg':                                                                                                     // 1374
        case 'GG':                                                                                                     // 1375
            config._w = config._w || {};                                                                               // 1376
            config._w[token] = moment.parseTwoDigitYear(input);                                                        // 1377
        }                                                                                                              // 1378
    }                                                                                                                  // 1379
                                                                                                                       // 1380
    function dayOfYearFromWeekInfo(config) {                                                                           // 1381
        var w, weekYear, week, weekday, dow, doy, temp;                                                                // 1382
                                                                                                                       // 1383
        w = config._w;                                                                                                 // 1384
        if (w.GG != null || w.W != null || w.E != null) {                                                              // 1385
            dow = 1;                                                                                                   // 1386
            doy = 4;                                                                                                   // 1387
                                                                                                                       // 1388
            // TODO: We need to take the current isoWeekYear, but that depends on                                      // 1389
            // how we interpret now (local, utc, fixed offset). So create                                              // 1390
            // a now version of current config (take local/utc/offset flags, and                                       // 1391
            // create now).                                                                                            // 1392
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);                                    // 1393
            week = dfl(w.W, 1);                                                                                        // 1394
            weekday = dfl(w.E, 1);                                                                                     // 1395
        } else {                                                                                                       // 1396
            dow = config._locale._week.dow;                                                                            // 1397
            doy = config._locale._week.doy;                                                                            // 1398
                                                                                                                       // 1399
            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);                                // 1400
            week = dfl(w.w, 1);                                                                                        // 1401
                                                                                                                       // 1402
            if (w.d != null) {                                                                                         // 1403
                // weekday -- low day numbers are considered next week                                                 // 1404
                weekday = w.d;                                                                                         // 1405
                if (weekday < dow) {                                                                                   // 1406
                    ++week;                                                                                            // 1407
                }                                                                                                      // 1408
            } else if (w.e != null) {                                                                                  // 1409
                // local weekday -- counting starts from begining of week                                              // 1410
                weekday = w.e + dow;                                                                                   // 1411
            } else {                                                                                                   // 1412
                // default to begining of week                                                                         // 1413
                weekday = dow;                                                                                         // 1414
            }                                                                                                          // 1415
        }                                                                                                              // 1416
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);                                                  // 1417
                                                                                                                       // 1418
        config._a[YEAR] = temp.year;                                                                                   // 1419
        config._dayOfYear = temp.dayOfYear;                                                                            // 1420
    }                                                                                                                  // 1421
                                                                                                                       // 1422
    // convert an array to a date.                                                                                     // 1423
    // the array should mirror the parameters below                                                                    // 1424
    // note: all values past the year are optional and will default to the lowest possible value.                      // 1425
    // [year, month, day , hour, minute, second, millisecond]                                                          // 1426
    function dateFromConfig(config) {                                                                                  // 1427
        var i, date, input = [], currentDate, yearToUse;                                                               // 1428
                                                                                                                       // 1429
        if (config._d) {                                                                                               // 1430
            return;                                                                                                    // 1431
        }                                                                                                              // 1432
                                                                                                                       // 1433
        currentDate = currentDateArray(config);                                                                        // 1434
                                                                                                                       // 1435
        //compute day of the year from weeks and weekdays                                                              // 1436
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {                                        // 1437
            dayOfYearFromWeekInfo(config);                                                                             // 1438
        }                                                                                                              // 1439
                                                                                                                       // 1440
        //if the day of the year is set, figure out what it is                                                         // 1441
        if (config._dayOfYear) {                                                                                       // 1442
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);                                                       // 1443
                                                                                                                       // 1444
            if (config._dayOfYear > daysInYear(yearToUse)) {                                                           // 1445
                config._pf._overflowDayOfYear = true;                                                                  // 1446
            }                                                                                                          // 1447
                                                                                                                       // 1448
            date = makeUTCDate(yearToUse, 0, config._dayOfYear);                                                       // 1449
            config._a[MONTH] = date.getUTCMonth();                                                                     // 1450
            config._a[DATE] = date.getUTCDate();                                                                       // 1451
        }                                                                                                              // 1452
                                                                                                                       // 1453
        // Default to current date.                                                                                    // 1454
        // * if no year, month, day of month are given, default to today                                               // 1455
        // * if day of month is given, default month and year                                                          // 1456
        // * if month is given, default only year                                                                      // 1457
        // * if year is given, don't default anything                                                                  // 1458
        for (i = 0; i < 3 && config._a[i] == null; ++i) {                                                              // 1459
            config._a[i] = input[i] = currentDate[i];                                                                  // 1460
        }                                                                                                              // 1461
                                                                                                                       // 1462
        // Zero out whatever was not defaulted, including time                                                         // 1463
        for (; i < 7; i++) {                                                                                           // 1464
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];                       // 1465
        }                                                                                                              // 1466
                                                                                                                       // 1467
        // Check for 24:00:00.000                                                                                      // 1468
        if (config._a[HOUR] === 24 &&                                                                                  // 1469
                config._a[MINUTE] === 0 &&                                                                             // 1470
                config._a[SECOND] === 0 &&                                                                             // 1471
                config._a[MILLISECOND] === 0) {                                                                        // 1472
            config._nextDay = true;                                                                                    // 1473
            config._a[HOUR] = 0;                                                                                       // 1474
        }                                                                                                              // 1475
                                                                                                                       // 1476
        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);                                      // 1477
        // Apply timezone offset from input. The actual utcOffset can be changed                                       // 1478
        // with parseZone.                                                                                             // 1479
        if (config._tzm != null) {                                                                                     // 1480
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);                                          // 1481
        }                                                                                                              // 1482
                                                                                                                       // 1483
        if (config._nextDay) {                                                                                         // 1484
            config._a[HOUR] = 24;                                                                                      // 1485
        }                                                                                                              // 1486
    }                                                                                                                  // 1487
                                                                                                                       // 1488
    function dateFromObject(config) {                                                                                  // 1489
        var normalizedInput;                                                                                           // 1490
                                                                                                                       // 1491
        if (config._d) {                                                                                               // 1492
            return;                                                                                                    // 1493
        }                                                                                                              // 1494
                                                                                                                       // 1495
        normalizedInput = normalizeObjectUnits(config._i);                                                             // 1496
        config._a = [                                                                                                  // 1497
            normalizedInput.year,                                                                                      // 1498
            normalizedInput.month,                                                                                     // 1499
            normalizedInput.day || normalizedInput.date,                                                               // 1500
            normalizedInput.hour,                                                                                      // 1501
            normalizedInput.minute,                                                                                    // 1502
            normalizedInput.second,                                                                                    // 1503
            normalizedInput.millisecond                                                                                // 1504
        ];                                                                                                             // 1505
                                                                                                                       // 1506
        dateFromConfig(config);                                                                                        // 1507
    }                                                                                                                  // 1508
                                                                                                                       // 1509
    function currentDateArray(config) {                                                                                // 1510
        var now = new Date();                                                                                          // 1511
        if (config._useUTC) {                                                                                          // 1512
            return [                                                                                                   // 1513
                now.getUTCFullYear(),                                                                                  // 1514
                now.getUTCMonth(),                                                                                     // 1515
                now.getUTCDate()                                                                                       // 1516
            ];                                                                                                         // 1517
        } else {                                                                                                       // 1518
            return [now.getFullYear(), now.getMonth(), now.getDate()];                                                 // 1519
        }                                                                                                              // 1520
    }                                                                                                                  // 1521
                                                                                                                       // 1522
    // date from string and format string                                                                              // 1523
    function makeDateFromStringAndFormat(config) {                                                                     // 1524
        if (config._f === moment.ISO_8601) {                                                                           // 1525
            parseISO(config);                                                                                          // 1526
            return;                                                                                                    // 1527
        }                                                                                                              // 1528
                                                                                                                       // 1529
        config._a = [];                                                                                                // 1530
        config._pf.empty = true;                                                                                       // 1531
                                                                                                                       // 1532
        // This array is used to make a Date, either with `new Date` or `Date.UTC`                                     // 1533
        var string = '' + config._i,                                                                                   // 1534
            i, parsedInput, tokens, token, skipped,                                                                    // 1535
            stringLength = string.length,                                                                              // 1536
            totalParsedInputLength = 0;                                                                                // 1537
                                                                                                                       // 1538
        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];                                // 1539
                                                                                                                       // 1540
        for (i = 0; i < tokens.length; i++) {                                                                          // 1541
            token = tokens[i];                                                                                         // 1542
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];                               // 1543
            if (parsedInput) {                                                                                         // 1544
                skipped = string.substr(0, string.indexOf(parsedInput));                                               // 1545
                if (skipped.length > 0) {                                                                              // 1546
                    config._pf.unusedInput.push(skipped);                                                              // 1547
                }                                                                                                      // 1548
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);                               // 1549
                totalParsedInputLength += parsedInput.length;                                                          // 1550
            }                                                                                                          // 1551
            // don't parse if it's not a known token                                                                   // 1552
            if (formatTokenFunctions[token]) {                                                                         // 1553
                if (parsedInput) {                                                                                     // 1554
                    config._pf.empty = false;                                                                          // 1555
                }                                                                                                      // 1556
                else {                                                                                                 // 1557
                    config._pf.unusedTokens.push(token);                                                               // 1558
                }                                                                                                      // 1559
                addTimeToArrayFromToken(token, parsedInput, config);                                                   // 1560
            }                                                                                                          // 1561
            else if (config._strict && !parsedInput) {                                                                 // 1562
                config._pf.unusedTokens.push(token);                                                                   // 1563
            }                                                                                                          // 1564
        }                                                                                                              // 1565
                                                                                                                       // 1566
        // add remaining unparsed input length to the string                                                           // 1567
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;                                              // 1568
        if (string.length > 0) {                                                                                       // 1569
            config._pf.unusedInput.push(string);                                                                       // 1570
        }                                                                                                              // 1571
                                                                                                                       // 1572
        // clear _12h flag if hour is <= 12                                                                            // 1573
        if (config._pf.bigHour === true && config._a[HOUR] <= 12) {                                                    // 1574
            config._pf.bigHour = undefined;                                                                            // 1575
        }                                                                                                              // 1576
        // handle meridiem                                                                                             // 1577
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR],                                             // 1578
                config._meridiem);                                                                                     // 1579
        dateFromConfig(config);                                                                                        // 1580
        checkOverflow(config);                                                                                         // 1581
    }                                                                                                                  // 1582
                                                                                                                       // 1583
    function unescapeFormat(s) {                                                                                       // 1584
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {                   // 1585
            return p1 || p2 || p3 || p4;                                                                               // 1586
        });                                                                                                            // 1587
    }                                                                                                                  // 1588
                                                                                                                       // 1589
    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript            // 1590
    function regexpEscape(s) {                                                                                         // 1591
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');                                                            // 1592
    }                                                                                                                  // 1593
                                                                                                                       // 1594
    // date from string and array of format strings                                                                    // 1595
    function makeDateFromStringAndArray(config) {                                                                      // 1596
        var tempConfig,                                                                                                // 1597
            bestMoment,                                                                                                // 1598
                                                                                                                       // 1599
            scoreToBeat,                                                                                               // 1600
            i,                                                                                                         // 1601
            currentScore;                                                                                              // 1602
                                                                                                                       // 1603
        if (config._f.length === 0) {                                                                                  // 1604
            config._pf.invalidFormat = true;                                                                           // 1605
            config._d = new Date(NaN);                                                                                 // 1606
            return;                                                                                                    // 1607
        }                                                                                                              // 1608
                                                                                                                       // 1609
        for (i = 0; i < config._f.length; i++) {                                                                       // 1610
            currentScore = 0;                                                                                          // 1611
            tempConfig = copyConfig({}, config);                                                                       // 1612
            if (config._useUTC != null) {                                                                              // 1613
                tempConfig._useUTC = config._useUTC;                                                                   // 1614
            }                                                                                                          // 1615
            tempConfig._pf = defaultParsingFlags();                                                                    // 1616
            tempConfig._f = config._f[i];                                                                              // 1617
            makeDateFromStringAndFormat(tempConfig);                                                                   // 1618
                                                                                                                       // 1619
            if (!isValid(tempConfig)) {                                                                                // 1620
                continue;                                                                                              // 1621
            }                                                                                                          // 1622
                                                                                                                       // 1623
            // if there is any input that was not parsed add a penalty for that format                                 // 1624
            currentScore += tempConfig._pf.charsLeftOver;                                                              // 1625
                                                                                                                       // 1626
            //or tokens                                                                                                // 1627
            currentScore += tempConfig._pf.unusedTokens.length * 10;                                                   // 1628
                                                                                                                       // 1629
            tempConfig._pf.score = currentScore;                                                                       // 1630
                                                                                                                       // 1631
            if (scoreToBeat == null || currentScore < scoreToBeat) {                                                   // 1632
                scoreToBeat = currentScore;                                                                            // 1633
                bestMoment = tempConfig;                                                                               // 1634
            }                                                                                                          // 1635
        }                                                                                                              // 1636
                                                                                                                       // 1637
        extend(config, bestMoment || tempConfig);                                                                      // 1638
    }                                                                                                                  // 1639
                                                                                                                       // 1640
    // date from iso format                                                                                            // 1641
    function parseISO(config) {                                                                                        // 1642
        var i, l,                                                                                                      // 1643
            string = config._i,                                                                                        // 1644
            match = isoRegex.exec(string);                                                                             // 1645
                                                                                                                       // 1646
        if (match) {                                                                                                   // 1647
            config._pf.iso = true;                                                                                     // 1648
            for (i = 0, l = isoDates.length; i < l; i++) {                                                             // 1649
                if (isoDates[i][1].exec(string)) {                                                                     // 1650
                    // match[5] should be 'T' or undefined                                                             // 1651
                    config._f = isoDates[i][0] + (match[6] || ' ');                                                    // 1652
                    break;                                                                                             // 1653
                }                                                                                                      // 1654
            }                                                                                                          // 1655
            for (i = 0, l = isoTimes.length; i < l; i++) {                                                             // 1656
                if (isoTimes[i][1].exec(string)) {                                                                     // 1657
                    config._f += isoTimes[i][0];                                                                       // 1658
                    break;                                                                                             // 1659
                }                                                                                                      // 1660
            }                                                                                                          // 1661
            if (string.match(parseTokenTimezone)) {                                                                    // 1662
                config._f += 'Z';                                                                                      // 1663
            }                                                                                                          // 1664
            makeDateFromStringAndFormat(config);                                                                       // 1665
        } else {                                                                                                       // 1666
            config._isValid = false;                                                                                   // 1667
        }                                                                                                              // 1668
    }                                                                                                                  // 1669
                                                                                                                       // 1670
    // date from iso format or fallback                                                                                // 1671
    function makeDateFromString(config) {                                                                              // 1672
        parseISO(config);                                                                                              // 1673
        if (config._isValid === false) {                                                                               // 1674
            delete config._isValid;                                                                                    // 1675
            moment.createFromInputFallback(config);                                                                    // 1676
        }                                                                                                              // 1677
    }                                                                                                                  // 1678
                                                                                                                       // 1679
    function map(arr, fn) {                                                                                            // 1680
        var res = [], i;                                                                                               // 1681
        for (i = 0; i < arr.length; ++i) {                                                                             // 1682
            res.push(fn(arr[i], i));                                                                                   // 1683
        }                                                                                                              // 1684
        return res;                                                                                                    // 1685
    }                                                                                                                  // 1686
                                                                                                                       // 1687
    function makeDateFromInput(config) {                                                                               // 1688
        var input = config._i, matched;                                                                                // 1689
        if (input === undefined) {                                                                                     // 1690
            config._d = new Date();                                                                                    // 1691
        } else if (isDate(input)) {                                                                                    // 1692
            config._d = new Date(+input);                                                                              // 1693
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {                                                 // 1694
            config._d = new Date(+matched[1]);                                                                         // 1695
        } else if (typeof input === 'string') {                                                                        // 1696
            makeDateFromString(config);                                                                                // 1697
        } else if (isArray(input)) {                                                                                   // 1698
            config._a = map(input.slice(0), function (obj) {                                                           // 1699
                return parseInt(obj, 10);                                                                              // 1700
            });                                                                                                        // 1701
            dateFromConfig(config);                                                                                    // 1702
        } else if (typeof(input) === 'object') {                                                                       // 1703
            dateFromObject(config);                                                                                    // 1704
        } else if (typeof(input) === 'number') {                                                                       // 1705
            // from milliseconds                                                                                       // 1706
            config._d = new Date(input);                                                                               // 1707
        } else {                                                                                                       // 1708
            moment.createFromInputFallback(config);                                                                    // 1709
        }                                                                                                              // 1710
    }                                                                                                                  // 1711
                                                                                                                       // 1712
    function makeDate(y, m, d, h, M, s, ms) {                                                                          // 1713
        //can't just apply() to create a date:                                                                         // 1714
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);                                                                     // 1716
                                                                                                                       // 1717
        //the date constructor doesn't accept years < 1970                                                             // 1718
        if (y < 1970) {                                                                                                // 1719
            date.setFullYear(y);                                                                                       // 1720
        }                                                                                                              // 1721
        return date;                                                                                                   // 1722
    }                                                                                                                  // 1723
                                                                                                                       // 1724
    function makeUTCDate(y) {                                                                                          // 1725
        var date = new Date(Date.UTC.apply(null, arguments));                                                          // 1726
        if (y < 1970) {                                                                                                // 1727
            date.setUTCFullYear(y);                                                                                    // 1728
        }                                                                                                              // 1729
        return date;                                                                                                   // 1730
    }                                                                                                                  // 1731
                                                                                                                       // 1732
    function parseWeekday(input, locale) {                                                                             // 1733
        if (typeof input === 'string') {                                                                               // 1734
            if (!isNaN(input)) {                                                                                       // 1735
                input = parseInt(input, 10);                                                                           // 1736
            }                                                                                                          // 1737
            else {                                                                                                     // 1738
                input = locale.weekdaysParse(input);                                                                   // 1739
                if (typeof input !== 'number') {                                                                       // 1740
                    return null;                                                                                       // 1741
                }                                                                                                      // 1742
            }                                                                                                          // 1743
        }                                                                                                              // 1744
        return input;                                                                                                  // 1745
    }                                                                                                                  // 1746
                                                                                                                       // 1747
    /************************************                                                                              // 1748
        Relative Time                                                                                                  // 1749
    ************************************/                                                                              // 1750
                                                                                                                       // 1751
                                                                                                                       // 1752
    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize                          // 1753
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {                                      // 1754
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);                                    // 1755
    }                                                                                                                  // 1756
                                                                                                                       // 1757
    function relativeTime(posNegDuration, withoutSuffix, locale) {                                                     // 1758
        var duration = moment.duration(posNegDuration).abs(),                                                          // 1759
            seconds = round(duration.as('s')),                                                                         // 1760
            minutes = round(duration.as('m')),                                                                         // 1761
            hours = round(duration.as('h')),                                                                           // 1762
            days = round(duration.as('d')),                                                                            // 1763
            months = round(duration.as('M')),                                                                          // 1764
            years = round(duration.as('y')),                                                                           // 1765
                                                                                                                       // 1766
            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||                                             // 1767
                minutes === 1 && ['m'] ||                                                                              // 1768
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||                                               // 1769
                hours === 1 && ['h'] ||                                                                                // 1770
                hours < relativeTimeThresholds.h && ['hh', hours] ||                                                   // 1771
                days === 1 && ['d'] ||                                                                                 // 1772
                days < relativeTimeThresholds.d && ['dd', days] ||                                                     // 1773
                months === 1 && ['M'] ||                                                                               // 1774
                months < relativeTimeThresholds.M && ['MM', months] ||                                                 // 1775
                years === 1 && ['y'] || ['yy', years];                                                                 // 1776
                                                                                                                       // 1777
        args[2] = withoutSuffix;                                                                                       // 1778
        args[3] = +posNegDuration > 0;                                                                                 // 1779
        args[4] = locale;                                                                                              // 1780
        return substituteTimeAgo.apply({}, args);                                                                      // 1781
    }                                                                                                                  // 1782
                                                                                                                       // 1783
                                                                                                                       // 1784
    /************************************                                                                              // 1785
        Week of Year                                                                                                   // 1786
    ************************************/                                                                              // 1787
                                                                                                                       // 1788
                                                                                                                       // 1789
    // firstDayOfWeek       0 = sun, 6 = sat                                                                           // 1790
    //                      the day of the week that starts the week                                                   // 1791
    //                      (usually sunday or monday)                                                                 // 1792
    // firstDayOfWeekOfYear 0 = sun, 6 = sat                                                                           // 1793
    //                      the first week is the week that contains the first                                         // 1794
    //                      of this day of the week                                                                    // 1795
    //                      (eg. ISO weeks use thursday (4))                                                           // 1796
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {                                                   // 1797
        var end = firstDayOfWeekOfYear - firstDayOfWeek,                                                               // 1798
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),                                                        // 1799
            adjustedMoment;                                                                                            // 1800
                                                                                                                       // 1801
                                                                                                                       // 1802
        if (daysToDayOfWeek > end) {                                                                                   // 1803
            daysToDayOfWeek -= 7;                                                                                      // 1804
        }                                                                                                              // 1805
                                                                                                                       // 1806
        if (daysToDayOfWeek < end - 7) {                                                                               // 1807
            daysToDayOfWeek += 7;                                                                                      // 1808
        }                                                                                                              // 1809
                                                                                                                       // 1810
        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');                                                        // 1811
        return {                                                                                                       // 1812
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),                                                           // 1813
            year: adjustedMoment.year()                                                                                // 1814
        };                                                                                                             // 1815
    }                                                                                                                  // 1816
                                                                                                                       // 1817
    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday          // 1818
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {                           // 1819
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;                                             // 1820
                                                                                                                       // 1821
        d = d === 0 ? 7 : d;                                                                                           // 1822
        weekday = weekday != null ? weekday : firstDayOfWeek;                                                          // 1823
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);            // 1824
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;                                       // 1825
                                                                                                                       // 1826
        return {                                                                                                       // 1827
            year: dayOfYear > 0 ? year : year - 1,                                                                     // 1828
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear                                   // 1829
        };                                                                                                             // 1830
    }                                                                                                                  // 1831
                                                                                                                       // 1832
    /************************************                                                                              // 1833
        Top Level Functions                                                                                            // 1834
    ************************************/                                                                              // 1835
                                                                                                                       // 1836
    function makeMoment(config) {                                                                                      // 1837
        var input = config._i,                                                                                         // 1838
            format = config._f,                                                                                        // 1839
            res;                                                                                                       // 1840
                                                                                                                       // 1841
        config._locale = config._locale || moment.localeData(config._l);                                               // 1842
                                                                                                                       // 1843
        if (input === null || (format === undefined && input === '')) {                                                // 1844
            return moment.invalid({nullInput: true});                                                                  // 1845
        }                                                                                                              // 1846
                                                                                                                       // 1847
        if (typeof input === 'string') {                                                                               // 1848
            config._i = input = config._locale.preparse(input);                                                        // 1849
        }                                                                                                              // 1850
                                                                                                                       // 1851
        if (moment.isMoment(input)) {                                                                                  // 1852
            return new Moment(input, true);                                                                            // 1853
        } else if (format) {                                                                                           // 1854
            if (isArray(format)) {                                                                                     // 1855
                makeDateFromStringAndArray(config);                                                                    // 1856
            } else {                                                                                                   // 1857
                makeDateFromStringAndFormat(config);                                                                   // 1858
            }                                                                                                          // 1859
        } else {                                                                                                       // 1860
            makeDateFromInput(config);                                                                                 // 1861
        }                                                                                                              // 1862
                                                                                                                       // 1863
        res = new Moment(config);                                                                                      // 1864
        if (res._nextDay) {                                                                                            // 1865
            // Adding is smart enough around DST                                                                       // 1866
            res.add(1, 'd');                                                                                           // 1867
            res._nextDay = undefined;                                                                                  // 1868
        }                                                                                                              // 1869
                                                                                                                       // 1870
        return res;                                                                                                    // 1871
    }                                                                                                                  // 1872
                                                                                                                       // 1873
    moment = function (input, format, locale, strict) {                                                                // 1874
        var c;                                                                                                         // 1875
                                                                                                                       // 1876
        if (typeof(locale) === 'boolean') {                                                                            // 1877
            strict = locale;                                                                                           // 1878
            locale = undefined;                                                                                        // 1879
        }                                                                                                              // 1880
        // object construction must be done this way.                                                                  // 1881
        // https://github.com/moment/moment/issues/1423                                                                // 1882
        c = {};                                                                                                        // 1883
        c._isAMomentObject = true;                                                                                     // 1884
        c._i = input;                                                                                                  // 1885
        c._f = format;                                                                                                 // 1886
        c._l = locale;                                                                                                 // 1887
        c._strict = strict;                                                                                            // 1888
        c._isUTC = false;                                                                                              // 1889
        c._pf = defaultParsingFlags();                                                                                 // 1890
                                                                                                                       // 1891
        return makeMoment(c);                                                                                          // 1892
    };                                                                                                                 // 1893
                                                                                                                       // 1894
    moment.suppressDeprecationWarnings = false;                                                                        // 1895
                                                                                                                       // 1896
    moment.createFromInputFallback = deprecate(                                                                        // 1897
        'moment construction falls back to js Date. This is ' +                                                        // 1898
        'discouraged and will be removed in upcoming major ' +                                                         // 1899
        'release. Please refer to ' +                                                                                  // 1900
        'https://github.com/moment/moment/issues/1407 for more info.',                                                 // 1901
        function (config) {                                                                                            // 1902
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));                                          // 1903
        }                                                                                                              // 1904
    );                                                                                                                 // 1905
                                                                                                                       // 1906
    // Pick a moment m from moments so that m[fn](other) is true for all                                               // 1907
    // other. This relies on the function fn to be transitive.                                                         // 1908
    //                                                                                                                 // 1909
    // moments should either be an array of moment objects or an array, whose                                          // 1910
    // first element is an array of moment objects.                                                                    // 1911
    function pickBy(fn, moments) {                                                                                     // 1912
        var res, i;                                                                                                    // 1913
        if (moments.length === 1 && isArray(moments[0])) {                                                             // 1914
            moments = moments[0];                                                                                      // 1915
        }                                                                                                              // 1916
        if (!moments.length) {                                                                                         // 1917
            return moment();                                                                                           // 1918
        }                                                                                                              // 1919
        res = moments[0];                                                                                              // 1920
        for (i = 1; i < moments.length; ++i) {                                                                         // 1921
            if (moments[i][fn](res)) {                                                                                 // 1922
                res = moments[i];                                                                                      // 1923
            }                                                                                                          // 1924
        }                                                                                                              // 1925
        return res;                                                                                                    // 1926
    }                                                                                                                  // 1927
                                                                                                                       // 1928
    moment.min = function () {                                                                                         // 1929
        var args = [].slice.call(arguments, 0);                                                                        // 1930
                                                                                                                       // 1931
        return pickBy('isBefore', args);                                                                               // 1932
    };                                                                                                                 // 1933
                                                                                                                       // 1934
    moment.max = function () {                                                                                         // 1935
        var args = [].slice.call(arguments, 0);                                                                        // 1936
                                                                                                                       // 1937
        return pickBy('isAfter', args);                                                                                // 1938
    };                                                                                                                 // 1939
                                                                                                                       // 1940
    // creating with utc                                                                                               // 1941
    moment.utc = function (input, format, locale, strict) {                                                            // 1942
        var c;                                                                                                         // 1943
                                                                                                                       // 1944
        if (typeof(locale) === 'boolean') {                                                                            // 1945
            strict = locale;                                                                                           // 1946
            locale = undefined;                                                                                        // 1947
        }                                                                                                              // 1948
        // object construction must be done this way.                                                                  // 1949
        // https://github.com/moment/moment/issues/1423                                                                // 1950
        c = {};                                                                                                        // 1951
        c._isAMomentObject = true;                                                                                     // 1952
        c._useUTC = true;                                                                                              // 1953
        c._isUTC = true;                                                                                               // 1954
        c._l = locale;                                                                                                 // 1955
        c._i = input;                                                                                                  // 1956
        c._f = format;                                                                                                 // 1957
        c._strict = strict;                                                                                            // 1958
        c._pf = defaultParsingFlags();                                                                                 // 1959
                                                                                                                       // 1960
        return makeMoment(c).utc();                                                                                    // 1961
    };                                                                                                                 // 1962
                                                                                                                       // 1963
    // creating with unix timestamp (in seconds)                                                                       // 1964
    moment.unix = function (input) {                                                                                   // 1965
        return moment(input * 1000);                                                                                   // 1966
    };                                                                                                                 // 1967
                                                                                                                       // 1968
    // duration                                                                                                        // 1969
    moment.duration = function (input, key) {                                                                          // 1970
        var duration = input,                                                                                          // 1971
            // matching against regexp is expensive, do it on demand                                                   // 1972
            match = null,                                                                                              // 1973
            sign,                                                                                                      // 1974
            ret,                                                                                                       // 1975
            parseIso,                                                                                                  // 1976
            diffRes;                                                                                                   // 1977
                                                                                                                       // 1978
        if (moment.isDuration(input)) {                                                                                // 1979
            duration = {                                                                                               // 1980
                ms: input._milliseconds,                                                                               // 1981
                d: input._days,                                                                                        // 1982
                M: input._months                                                                                       // 1983
            };                                                                                                         // 1984
        } else if (typeof input === 'number') {                                                                        // 1985
            duration = {};                                                                                             // 1986
            if (key) {                                                                                                 // 1987
                duration[key] = input;                                                                                 // 1988
            } else {                                                                                                   // 1989
                duration.milliseconds = input;                                                                         // 1990
            }                                                                                                          // 1991
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {                                                  // 1992
            sign = (match[1] === '-') ? -1 : 1;                                                                        // 1993
            duration = {                                                                                               // 1994
                y: 0,                                                                                                  // 1995
                d: toInt(match[DATE]) * sign,                                                                          // 1996
                h: toInt(match[HOUR]) * sign,                                                                          // 1997
                m: toInt(match[MINUTE]) * sign,                                                                        // 1998
                s: toInt(match[SECOND]) * sign,                                                                        // 1999
                ms: toInt(match[MILLISECOND]) * sign                                                                   // 2000
            };                                                                                                         // 2001
        } else if (!!(match = isoDurationRegex.exec(input))) {                                                         // 2002
            sign = (match[1] === '-') ? -1 : 1;                                                                        // 2003
            parseIso = function (inp) {                                                                                // 2004
                // We'd normally use ~~inp for this, but unfortunately it also                                         // 2005
                // converts floats to ints.                                                                            // 2006
                // inp may be undefined, so careful calling replace on it.                                             // 2007
                var res = inp && parseFloat(inp.replace(',', '.'));                                                    // 2008
                // apply sign while we're at it                                                                        // 2009
                return (isNaN(res) ? 0 : res) * sign;                                                                  // 2010
            };                                                                                                         // 2011
            duration = {                                                                                               // 2012
                y: parseIso(match[2]),                                                                                 // 2013
                M: parseIso(match[3]),                                                                                 // 2014
                d: parseIso(match[4]),                                                                                 // 2015
                h: parseIso(match[5]),                                                                                 // 2016
                m: parseIso(match[6]),                                                                                 // 2017
                s: parseIso(match[7]),                                                                                 // 2018
                w: parseIso(match[8])                                                                                  // 2019
            };                                                                                                         // 2020
        } else if (duration == null) {// checks for null or undefined                                                  // 2021
            duration = {};                                                                                             // 2022
        } else if (typeof duration === 'object' &&                                                                     // 2023
                ('from' in duration || 'to' in duration)) {                                                            // 2024
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));                                   // 2025
                                                                                                                       // 2026
            duration = {};                                                                                             // 2027
            duration.ms = diffRes.milliseconds;                                                                        // 2028
            duration.M = diffRes.months;                                                                               // 2029
        }                                                                                                              // 2030
                                                                                                                       // 2031
        ret = new Duration(duration);                                                                                  // 2032
                                                                                                                       // 2033
        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {                                                // 2034
            ret._locale = input._locale;                                                                               // 2035
        }                                                                                                              // 2036
                                                                                                                       // 2037
        return ret;                                                                                                    // 2038
    };                                                                                                                 // 2039
                                                                                                                       // 2040
    // version number                                                                                                  // 2041
    moment.version = VERSION;                                                                                          // 2042
                                                                                                                       // 2043
    // default format                                                                                                  // 2044
    moment.defaultFormat = isoFormat;                                                                                  // 2045
                                                                                                                       // 2046
    // constant that refers to the ISO standard                                                                        // 2047
    moment.ISO_8601 = function () {};                                                                                  // 2048
                                                                                                                       // 2049
    // Plugins that add properties should also add the key here (null value),                                          // 2050
    // so we can properly clone ourselves.                                                                             // 2051
    moment.momentProperties = momentProperties;                                                                        // 2052
                                                                                                                       // 2053
    // This function will be called whenever a moment is mutated.                                                      // 2054
    // It is intended to keep the offset in sync with the timezone.                                                    // 2055
    moment.updateOffset = function () {};                                                                              // 2056
                                                                                                                       // 2057
    // This function allows you to set a threshold for relative time strings                                           // 2058
    moment.relativeTimeThreshold = function (threshold, limit) {                                                       // 2059
        if (relativeTimeThresholds[threshold] === undefined) {                                                         // 2060
            return false;                                                                                              // 2061
        }                                                                                                              // 2062
        if (limit === undefined) {                                                                                     // 2063
            return relativeTimeThresholds[threshold];                                                                  // 2064
        }                                                                                                              // 2065
        relativeTimeThresholds[threshold] = limit;                                                                     // 2066
        return true;                                                                                                   // 2067
    };                                                                                                                 // 2068
                                                                                                                       // 2069
    moment.lang = deprecate(                                                                                           // 2070
        'moment.lang is deprecated. Use moment.locale instead.',                                                       // 2071
        function (key, value) {                                                                                        // 2072
            return moment.locale(key, value);                                                                          // 2073
        }                                                                                                              // 2074
    );                                                                                                                 // 2075
                                                                                                                       // 2076
    // This function will load locale and then set the global locale.  If                                              // 2077
    // no arguments are passed in, it will simply return the current global                                            // 2078
    // locale key.                                                                                                     // 2079
    moment.locale = function (key, values) {                                                                           // 2080
        var data;                                                                                                      // 2081
        if (key) {                                                                                                     // 2082
            if (typeof(values) !== 'undefined') {                                                                      // 2083
                data = moment.defineLocale(key, values);                                                               // 2084
            }                                                                                                          // 2085
            else {                                                                                                     // 2086
                data = moment.localeData(key);                                                                         // 2087
            }                                                                                                          // 2088
                                                                                                                       // 2089
            if (data) {                                                                                                // 2090
                moment.duration._locale = moment._locale = data;                                                       // 2091
            }                                                                                                          // 2092
        }                                                                                                              // 2093
                                                                                                                       // 2094
        return moment._locale._abbr;                                                                                   // 2095
    };                                                                                                                 // 2096
                                                                                                                       // 2097
    moment.defineLocale = function (name, values) {                                                                    // 2098
        if (values !== null) {                                                                                         // 2099
            values.abbr = name;                                                                                        // 2100
            if (!locales[name]) {                                                                                      // 2101
                locales[name] = new Locale();                                                                          // 2102
            }                                                                                                          // 2103
            locales[name].set(values);                                                                                 // 2104
                                                                                                                       // 2105
            // backwards compat for now: also set the locale                                                           // 2106
            moment.locale(name);                                                                                       // 2107
                                                                                                                       // 2108
            return locales[name];                                                                                      // 2109
        } else {                                                                                                       // 2110
            // useful for testing                                                                                      // 2111
            delete locales[name];                                                                                      // 2112
            return null;                                                                                               // 2113
        }                                                                                                              // 2114
    };                                                                                                                 // 2115
                                                                                                                       // 2116
    moment.langData = deprecate(                                                                                       // 2117
        'moment.langData is deprecated. Use moment.localeData instead.',                                               // 2118
        function (key) {                                                                                               // 2119
            return moment.localeData(key);                                                                             // 2120
        }                                                                                                              // 2121
    );                                                                                                                 // 2122
                                                                                                                       // 2123
    // returns locale data                                                                                             // 2124
    moment.localeData = function (key) {                                                                               // 2125
        var locale;                                                                                                    // 2126
                                                                                                                       // 2127
        if (key && key._locale && key._locale._abbr) {                                                                 // 2128
            key = key._locale._abbr;                                                                                   // 2129
        }                                                                                                              // 2130
                                                                                                                       // 2131
        if (!key) {                                                                                                    // 2132
            return moment._locale;                                                                                     // 2133
        }                                                                                                              // 2134
                                                                                                                       // 2135
        if (!isArray(key)) {                                                                                           // 2136
            //short-circuit everything else                                                                            // 2137
            locale = loadLocale(key);                                                                                  // 2138
            if (locale) {                                                                                              // 2139
                return locale;                                                                                         // 2140
            }                                                                                                          // 2141
            key = [key];                                                                                               // 2142
        }                                                                                                              // 2143
                                                                                                                       // 2144
        return chooseLocale(key);                                                                                      // 2145
    };                                                                                                                 // 2146
                                                                                                                       // 2147
    // compare moment object                                                                                           // 2148
    moment.isMoment = function (obj) {                                                                                 // 2149
        return obj instanceof Moment ||                                                                                // 2150
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));                                                      // 2151
    };                                                                                                                 // 2152
                                                                                                                       // 2153
    // for typechecking Duration objects                                                                               // 2154
    moment.isDuration = function (obj) {                                                                               // 2155
        return obj instanceof Duration;                                                                                // 2156
    };                                                                                                                 // 2157
                                                                                                                       // 2158
    for (i = lists.length - 1; i >= 0; --i) {                                                                          // 2159
        makeList(lists[i]);                                                                                            // 2160
    }                                                                                                                  // 2161
                                                                                                                       // 2162
    moment.normalizeUnits = function (units) {                                                                         // 2163
        return normalizeUnits(units);                                                                                  // 2164
    };                                                                                                                 // 2165
                                                                                                                       // 2166
    moment.invalid = function (flags) {                                                                                // 2167
        var m = moment.utc(NaN);                                                                                       // 2168
        if (flags != null) {                                                                                           // 2169
            extend(m._pf, flags);                                                                                      // 2170
        }                                                                                                              // 2171
        else {                                                                                                         // 2172
            m._pf.userInvalidated = true;                                                                              // 2173
        }                                                                                                              // 2174
                                                                                                                       // 2175
        return m;                                                                                                      // 2176
    };                                                                                                                 // 2177
                                                                                                                       // 2178
    moment.parseZone = function () {                                                                                   // 2179
        return moment.apply(null, arguments).parseZone();                                                              // 2180
    };                                                                                                                 // 2181
                                                                                                                       // 2182
    moment.parseTwoDigitYear = function (input) {                                                                      // 2183
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);                                                       // 2184
    };                                                                                                                 // 2185
                                                                                                                       // 2186
    moment.isDate = isDate;                                                                                            // 2187
                                                                                                                       // 2188
    /************************************                                                                              // 2189
        Moment Prototype                                                                                               // 2190
    ************************************/                                                                              // 2191
                                                                                                                       // 2192
                                                                                                                       // 2193
    extend(moment.fn = Moment.prototype, {                                                                             // 2194
                                                                                                                       // 2195
        clone : function () {                                                                                          // 2196
            return moment(this);                                                                                       // 2197
        },                                                                                                             // 2198
                                                                                                                       // 2199
        valueOf : function () {                                                                                        // 2200
            return +this._d - ((this._offset || 0) * 60000);                                                           // 2201
        },                                                                                                             // 2202
                                                                                                                       // 2203
        unix : function () {                                                                                           // 2204
            return Math.floor(+this / 1000);                                                                           // 2205
        },                                                                                                             // 2206
                                                                                                                       // 2207
        toString : function () {                                                                                       // 2208
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');                               // 2209
        },                                                                                                             // 2210
                                                                                                                       // 2211
        toDate : function () {                                                                                         // 2212
            return this._offset ? new Date(+this) : this._d;                                                           // 2213
        },                                                                                                             // 2214
                                                                                                                       // 2215
        toISOString : function () {                                                                                    // 2216
            var m = moment(this).utc();                                                                                // 2217
            if (0 < m.year() && m.year() <= 9999) {                                                                    // 2218
                if ('function' === typeof Date.prototype.toISOString) {                                                // 2219
                    // native implementation is ~50x faster, use it when we can                                        // 2220
                    return this.toDate().toISOString();                                                                // 2221
                } else {                                                                                               // 2222
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');                                            // 2223
                }                                                                                                      // 2224
            } else {                                                                                                   // 2225
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');                                              // 2226
            }                                                                                                          // 2227
        },                                                                                                             // 2228
                                                                                                                       // 2229
        toArray : function () {                                                                                        // 2230
            var m = this;                                                                                              // 2231
            return [                                                                                                   // 2232
                m.year(),                                                                                              // 2233
                m.month(),                                                                                             // 2234
                m.date(),                                                                                              // 2235
                m.hours(),                                                                                             // 2236
                m.minutes(),                                                                                           // 2237
                m.seconds(),                                                                                           // 2238
                m.milliseconds()                                                                                       // 2239
            ];                                                                                                         // 2240
        },                                                                                                             // 2241
                                                                                                                       // 2242
        isValid : function () {                                                                                        // 2243
            return isValid(this);                                                                                      // 2244
        },                                                                                                             // 2245
                                                                                                                       // 2246
        isDSTShifted : function () {                                                                                   // 2247
            if (this._a) {                                                                                             // 2248
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }                                                                                                          // 2250
                                                                                                                       // 2251
            return false;                                                                                              // 2252
        },                                                                                                             // 2253
                                                                                                                       // 2254
        parsingFlags : function () {                                                                                   // 2255
            return extend({}, this._pf);                                                                               // 2256
        },                                                                                                             // 2257
                                                                                                                       // 2258
        invalidAt: function () {                                                                                       // 2259
            return this._pf.overflow;                                                                                  // 2260
        },                                                                                                             // 2261
                                                                                                                       // 2262
        utc : function (keepLocalTime) {                                                                               // 2263
            return this.utcOffset(0, keepLocalTime);                                                                   // 2264
        },                                                                                                             // 2265
                                                                                                                       // 2266
        local : function (keepLocalTime) {                                                                             // 2267
            if (this._isUTC) {                                                                                         // 2268
                this.utcOffset(0, keepLocalTime);                                                                      // 2269
                this._isUTC = false;                                                                                   // 2270
                                                                                                                       // 2271
                if (keepLocalTime) {                                                                                   // 2272
                    this.subtract(this._dateUtcOffset(), 'm');                                                         // 2273
                }                                                                                                      // 2274
            }                                                                                                          // 2275
            return this;                                                                                               // 2276
        },                                                                                                             // 2277
                                                                                                                       // 2278
        format : function (inputString) {                                                                              // 2279
            var output = formatMoment(this, inputString || moment.defaultFormat);                                      // 2280
            return this.localeData().postformat(output);                                                               // 2281
        },                                                                                                             // 2282
                                                                                                                       // 2283
        add : createAdder(1, 'add'),                                                                                   // 2284
                                                                                                                       // 2285
        subtract : createAdder(-1, 'subtract'),                                                                        // 2286
                                                                                                                       // 2287
        diff : function (input, units, asFloat) {                                                                      // 2288
            var that = makeAs(input, this),                                                                            // 2289
                zoneDiff = (that.utcOffset() - this.utcOffset()) * 6e4,                                                // 2290
                anchor, diff, output, daysAdjust;                                                                      // 2291
                                                                                                                       // 2292
            units = normalizeUnits(units);                                                                             // 2293
                                                                                                                       // 2294
            if (units === 'year' || units === 'month' || units === 'quarter') {                                        // 2295
                output = monthDiff(this, that);                                                                        // 2296
                if (units === 'quarter') {                                                                             // 2297
                    output = output / 3;                                                                               // 2298
                } else if (units === 'year') {                                                                         // 2299
                    output = output / 12;                                                                              // 2300
                }                                                                                                      // 2301
            } else {                                                                                                   // 2302
                diff = this - that;                                                                                    // 2303
                output = units === 'second' ? diff / 1e3 : // 1000                                                     // 2304
                    units === 'minute' ? diff / 6e4 : // 1000 * 60                                                     // 2305
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60                                                 // 2306
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst                   // 2307
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst             // 2308
                    diff;                                                                                              // 2309
            }                                                                                                          // 2310
            return asFloat ? output : absRound(output);                                                                // 2311
        },                                                                                                             // 2312
                                                                                                                       // 2313
        from : function (time, withoutSuffix) {                                                                        // 2314
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);             // 2315
        },                                                                                                             // 2316
                                                                                                                       // 2317
        fromNow : function (withoutSuffix) {                                                                           // 2318
            return this.from(moment(), withoutSuffix);                                                                 // 2319
        },                                                                                                             // 2320
                                                                                                                       // 2321
        calendar : function (time) {                                                                                   // 2322
            // We want to compare the start of today, vs this.                                                         // 2323
            // Getting start-of-today depends on whether we're locat/utc/offset                                        // 2324
            // or not.                                                                                                 // 2325
            var now = time || moment(),                                                                                // 2326
                sod = makeAs(now, this).startOf('day'),                                                                // 2327
                diff = this.diff(sod, 'days', true),                                                                   // 2328
                format = diff < -6 ? 'sameElse' :                                                                      // 2329
                    diff < -1 ? 'lastWeek' :                                                                           // 2330
                    diff < 0 ? 'lastDay' :                                                                             // 2331
                    diff < 1 ? 'sameDay' :                                                                             // 2332
                    diff < 2 ? 'nextDay' :                                                                             // 2333
                    diff < 7 ? 'nextWeek' : 'sameElse';                                                                // 2334
            return this.format(this.localeData().calendar(format, this, moment(now)));                                 // 2335
        },                                                                                                             // 2336
                                                                                                                       // 2337
        isLeapYear : function () {                                                                                     // 2338
            return isLeapYear(this.year());                                                                            // 2339
        },                                                                                                             // 2340
                                                                                                                       // 2341
        isDST : function () {                                                                                          // 2342
            return (this.utcOffset() > this.clone().month(0).utcOffset() ||                                            // 2343
                this.utcOffset() > this.clone().month(5).utcOffset());                                                 // 2344
        },                                                                                                             // 2345
                                                                                                                       // 2346
        day : function (input) {                                                                                       // 2347
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();                                            // 2348
            if (input != null) {                                                                                       // 2349
                input = parseWeekday(input, this.localeData());                                                        // 2350
                return this.add(input - day, 'd');                                                                     // 2351
            } else {                                                                                                   // 2352
                return day;                                                                                            // 2353
            }                                                                                                          // 2354
        },                                                                                                             // 2355
                                                                                                                       // 2356
        month : makeAccessor('Month', true),                                                                           // 2357
                                                                                                                       // 2358
        startOf : function (units) {                                                                                   // 2359
            units = normalizeUnits(units);                                                                             // 2360
            // the following switch intentionally omits break keywords                                                 // 2361
            // to utilize falling through the cases.                                                                   // 2362
            switch (units) {                                                                                           // 2363
            case 'year':                                                                                               // 2364
                this.month(0);                                                                                         // 2365
                /* falls through */                                                                                    // 2366
            case 'quarter':                                                                                            // 2367
            case 'month':                                                                                              // 2368
                this.date(1);                                                                                          // 2369
                /* falls through */                                                                                    // 2370
            case 'week':                                                                                               // 2371
            case 'isoWeek':                                                                                            // 2372
            case 'day':                                                                                                // 2373
                this.hours(0);                                                                                         // 2374
                /* falls through */                                                                                    // 2375
            case 'hour':                                                                                               // 2376
                this.minutes(0);                                                                                       // 2377
                /* falls through */                                                                                    // 2378
            case 'minute':                                                                                             // 2379
                this.seconds(0);                                                                                       // 2380
                /* falls through */                                                                                    // 2381
            case 'second':                                                                                             // 2382
                this.milliseconds(0);                                                                                  // 2383
                /* falls through */                                                                                    // 2384
            }                                                                                                          // 2385
                                                                                                                       // 2386
            // weeks are a special case                                                                                // 2387
            if (units === 'week') {                                                                                    // 2388
                this.weekday(0);                                                                                       // 2389
            } else if (units === 'isoWeek') {                                                                          // 2390
                this.isoWeekday(1);                                                                                    // 2391
            }                                                                                                          // 2392
                                                                                                                       // 2393
            // quarters are also special                                                                               // 2394
            if (units === 'quarter') {                                                                                 // 2395
                this.month(Math.floor(this.month() / 3) * 3);                                                          // 2396
            }                                                                                                          // 2397
                                                                                                                       // 2398
            return this;                                                                                               // 2399
        },                                                                                                             // 2400
                                                                                                                       // 2401
        endOf: function (units) {                                                                                      // 2402
            units = normalizeUnits(units);                                                                             // 2403
            if (units === undefined || units === 'millisecond') {                                                      // 2404
                return this;                                                                                           // 2405
            }                                                                                                          // 2406
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');               // 2407
        },                                                                                                             // 2408
                                                                                                                       // 2409
        isAfter: function (input, units) {                                                                             // 2410
            var inputMs;                                                                                               // 2411
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');                              // 2412
            if (units === 'millisecond') {                                                                             // 2413
                input = moment.isMoment(input) ? input : moment(input);                                                // 2414
                return +this > +input;                                                                                 // 2415
            } else {                                                                                                   // 2416
                inputMs = moment.isMoment(input) ? +input : +moment(input);                                            // 2417
                return inputMs < +this.clone().startOf(units);                                                         // 2418
            }                                                                                                          // 2419
        },                                                                                                             // 2420
                                                                                                                       // 2421
        isBefore: function (input, units) {                                                                            // 2422
            var inputMs;                                                                                               // 2423
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');                              // 2424
            if (units === 'millisecond') {                                                                             // 2425
                input = moment.isMoment(input) ? input : moment(input);                                                // 2426
                return +this < +input;                                                                                 // 2427
            } else {                                                                                                   // 2428
                inputMs = moment.isMoment(input) ? +input : +moment(input);                                            // 2429
                return +this.clone().endOf(units) < inputMs;                                                           // 2430
            }                                                                                                          // 2431
        },                                                                                                             // 2432
                                                                                                                       // 2433
        isBetween: function (from, to, units) {                                                                        // 2434
            return this.isAfter(from, units) && this.isBefore(to, units);                                              // 2435
        },                                                                                                             // 2436
                                                                                                                       // 2437
        isSame: function (input, units) {                                                                              // 2438
            var inputMs;                                                                                               // 2439
            units = normalizeUnits(units || 'millisecond');                                                            // 2440
            if (units === 'millisecond') {                                                                             // 2441
                input = moment.isMoment(input) ? input : moment(input);                                                // 2442
                return +this === +input;                                                                               // 2443
            } else {                                                                                                   // 2444
                inputMs = +moment(input);                                                                              // 2445
                return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));           // 2446
            }                                                                                                          // 2447
        },                                                                                                             // 2448
                                                                                                                       // 2449
        min: deprecate(                                                                                                // 2450
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',   // 2451
                 function (other) {                                                                                    // 2452
                     other = moment.apply(null, arguments);                                                            // 2453
                     return other < this ? this : other;                                                               // 2454
                 }                                                                                                     // 2455
         ),                                                                                                            // 2456
                                                                                                                       // 2457
        max: deprecate(                                                                                                // 2458
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',    // 2459
                function (other) {                                                                                     // 2460
                    other = moment.apply(null, arguments);                                                             // 2461
                    return other > this ? this : other;                                                                // 2462
                }                                                                                                      // 2463
        ),                                                                                                             // 2464
                                                                                                                       // 2465
        zone : deprecate(                                                                                              // 2466
                'moment().zone is deprecated, use moment().utcOffset instead. ' +                                      // 2467
                'https://github.com/moment/moment/issues/1779',                                                        // 2468
                function (input, keepLocalTime) {                                                                      // 2469
                    if (input != null) {                                                                               // 2470
                        if (typeof input !== 'string') {                                                               // 2471
                            input = -input;                                                                            // 2472
                        }                                                                                              // 2473
                                                                                                                       // 2474
                        this.utcOffset(input, keepLocalTime);                                                          // 2475
                                                                                                                       // 2476
                        return this;                                                                                   // 2477
                    } else {                                                                                           // 2478
                        return -this.utcOffset();                                                                      // 2479
                    }                                                                                                  // 2480
                }                                                                                                      // 2481
        ),                                                                                                             // 2482
                                                                                                                       // 2483
        // keepLocalTime = true means only change the timezone, without                                                // 2484
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->                                        // 2485
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset                                         // 2486
        // +0200, so we adjust the time as needed, to be valid.                                                        // 2487
        //                                                                                                             // 2488
        // Keeping the time actually adds/subtracts (one hour)                                                         // 2489
        // from the actual represented time. That is why we call updateOffset                                          // 2490
        // a second time. In case it wants us to change the offset again                                               // 2491
        // _changeInProgress == true case, then we have to adjust, because                                             // 2492
        // there is no such time in the given timezone.                                                                // 2493
        utcOffset : function (input, keepLocalTime) {                                                                  // 2494
            var offset = this._offset || 0,                                                                            // 2495
                localAdjust;                                                                                           // 2496
            if (input != null) {                                                                                       // 2497
                if (typeof input === 'string') {                                                                       // 2498
                    input = utcOffsetFromString(input);                                                                // 2499
                }                                                                                                      // 2500
                if (Math.abs(input) < 16) {                                                                            // 2501
                    input = input * 60;                                                                                // 2502
                }                                                                                                      // 2503
                if (!this._isUTC && keepLocalTime) {                                                                   // 2504
                    localAdjust = this._dateUtcOffset();                                                               // 2505
                }                                                                                                      // 2506
                this._offset = input;                                                                                  // 2507
                this._isUTC = true;                                                                                    // 2508
                if (localAdjust != null) {                                                                             // 2509
                    this.add(localAdjust, 'm');                                                                        // 2510
                }                                                                                                      // 2511
                if (offset !== input) {                                                                                // 2512
                    if (!keepLocalTime || this._changeInProgress) {                                                    // 2513
                        addOrSubtractDurationFromMoment(this,                                                          // 2514
                                moment.duration(input - offset, 'm'), 1, false);                                       // 2515
                    } else if (!this._changeInProgress) {                                                              // 2516
                        this._changeInProgress = true;                                                                 // 2517
                        moment.updateOffset(this, true);                                                               // 2518
                        this._changeInProgress = null;                                                                 // 2519
                    }                                                                                                  // 2520
                }                                                                                                      // 2521
                                                                                                                       // 2522
                return this;                                                                                           // 2523
            } else {                                                                                                   // 2524
                return this._isUTC ? offset : this._dateUtcOffset();                                                   // 2525
            }                                                                                                          // 2526
        },                                                                                                             // 2527
                                                                                                                       // 2528
        isLocal : function () {                                                                                        // 2529
            return !this._isUTC;                                                                                       // 2530
        },                                                                                                             // 2531
                                                                                                                       // 2532
        isUtcOffset : function () {                                                                                    // 2533
            return this._isUTC;                                                                                        // 2534
        },                                                                                                             // 2535
                                                                                                                       // 2536
        isUtc : function () {                                                                                          // 2537
            return this._isUTC && this._offset === 0;                                                                  // 2538
        },                                                                                                             // 2539
                                                                                                                       // 2540
        zoneAbbr : function () {                                                                                       // 2541
            return this._isUTC ? 'UTC' : '';                                                                           // 2542
        },                                                                                                             // 2543
                                                                                                                       // 2544
        zoneName : function () {                                                                                       // 2545
            return this._isUTC ? 'Coordinated Universal Time' : '';                                                    // 2546
        },                                                                                                             // 2547
                                                                                                                       // 2548
        parseZone : function () {                                                                                      // 2549
            if (this._tzm) {                                                                                           // 2550
                this.utcOffset(this._tzm);                                                                             // 2551
            } else if (typeof this._i === 'string') {                                                                  // 2552
                this.utcOffset(utcOffsetFromString(this._i));                                                          // 2553
            }                                                                                                          // 2554
            return this;                                                                                               // 2555
        },                                                                                                             // 2556
                                                                                                                       // 2557
        hasAlignedHourOffset : function (input) {                                                                      // 2558
            if (!input) {                                                                                              // 2559
                input = 0;                                                                                             // 2560
            }                                                                                                          // 2561
            else {                                                                                                     // 2562
                input = moment(input).utcOffset();                                                                     // 2563
            }                                                                                                          // 2564
                                                                                                                       // 2565
            return (this.utcOffset() - input) % 60 === 0;                                                              // 2566
        },                                                                                                             // 2567
                                                                                                                       // 2568
        daysInMonth : function () {                                                                                    // 2569
            return daysInMonth(this.year(), this.month());                                                             // 2570
        },                                                                                                             // 2571
                                                                                                                       // 2572
        dayOfYear : function (input) {                                                                                 // 2573
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;           // 2574
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');                                     // 2575
        },                                                                                                             // 2576
                                                                                                                       // 2577
        quarter : function (input) {                                                                                   // 2578
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3); // 2579
        },                                                                                                             // 2580
                                                                                                                       // 2581
        weekYear : function (input) {                                                                                  // 2582
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;                // 2583
            return input == null ? year : this.add((input - year), 'y');                                               // 2584
        },                                                                                                             // 2585
                                                                                                                       // 2586
        isoWeekYear : function (input) {                                                                               // 2587
            var year = weekOfYear(this, 1, 4).year;                                                                    // 2588
            return input == null ? year : this.add((input - year), 'y');                                               // 2589
        },                                                                                                             // 2590
                                                                                                                       // 2591
        week : function (input) {                                                                                      // 2592
            var week = this.localeData().week(this);                                                                   // 2593
            return input == null ? week : this.add((input - week) * 7, 'd');                                           // 2594
        },                                                                                                             // 2595
                                                                                                                       // 2596
        isoWeek : function (input) {                                                                                   // 2597
            var week = weekOfYear(this, 1, 4).week;                                                                    // 2598
            return input == null ? week : this.add((input - week) * 7, 'd');                                           // 2599
        },                                                                                                             // 2600
                                                                                                                       // 2601
        weekday : function (input) {                                                                                   // 2602
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;                                          // 2603
            return input == null ? weekday : this.add(input - weekday, 'd');                                           // 2604
        },                                                                                                             // 2605
                                                                                                                       // 2606
        isoWeekday : function (input) {                                                                                // 2607
            // behaves the same as moment#day except                                                                   // 2608
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)                                          // 2609
            // as a setter, sunday should belong to the previous week.                                                 // 2610
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);                     // 2611
        },                                                                                                             // 2612
                                                                                                                       // 2613
        isoWeeksInYear : function () {                                                                                 // 2614
            return weeksInYear(this.year(), 1, 4);                                                                     // 2615
        },                                                                                                             // 2616
                                                                                                                       // 2617
        weeksInYear : function () {                                                                                    // 2618
            var weekInfo = this.localeData()._week;                                                                    // 2619
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);                                               // 2620
        },                                                                                                             // 2621
                                                                                                                       // 2622
        get : function (units) {                                                                                       // 2623
            units = normalizeUnits(units);                                                                             // 2624
            return this[units]();                                                                                      // 2625
        },                                                                                                             // 2626
                                                                                                                       // 2627
        set : function (units, value) {                                                                                // 2628
            var unit;                                                                                                  // 2629
            if (typeof units === 'object') {                                                                           // 2630
                for (unit in units) {                                                                                  // 2631
                    this.set(unit, units[unit]);                                                                       // 2632
                }                                                                                                      // 2633
            }                                                                                                          // 2634
            else {                                                                                                     // 2635
                units = normalizeUnits(units);                                                                         // 2636
                if (typeof this[units] === 'function') {                                                               // 2637
                    this[units](value);                                                                                // 2638
                }                                                                                                      // 2639
            }                                                                                                          // 2640
            return this;                                                                                               // 2641
        },                                                                                                             // 2642
                                                                                                                       // 2643
        // If passed a locale key, it will set the locale for this                                                     // 2644
        // instance.  Otherwise, it will return the locale configuration                                               // 2645
        // variables for this instance.                                                                                // 2646
        locale : function (key) {                                                                                      // 2647
            var newLocaleData;                                                                                         // 2648
                                                                                                                       // 2649
            if (key === undefined) {                                                                                   // 2650
                return this._locale._abbr;                                                                             // 2651
            } else {                                                                                                   // 2652
                newLocaleData = moment.localeData(key);                                                                // 2653
                if (newLocaleData != null) {                                                                           // 2654
                    this._locale = newLocaleData;                                                                      // 2655
                }                                                                                                      // 2656
                return this;                                                                                           // 2657
            }                                                                                                          // 2658
        },                                                                                                             // 2659
                                                                                                                       // 2660
        lang : deprecate(                                                                                              // 2661
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {                                                                                           // 2663
                if (key === undefined) {                                                                               // 2664
                    return this.localeData();                                                                          // 2665
                } else {                                                                                               // 2666
                    return this.locale(key);                                                                           // 2667
                }                                                                                                      // 2668
            }                                                                                                          // 2669
        ),                                                                                                             // 2670
                                                                                                                       // 2671
        localeData : function () {                                                                                     // 2672
            return this._locale;                                                                                       // 2673
        },                                                                                                             // 2674
                                                                                                                       // 2675
        _dateUtcOffset : function () {                                                                                 // 2676
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.                                          // 2677
            // https://github.com/moment/moment/pull/1871                                                              // 2678
            return -Math.round(this._d.getTimezoneOffset() / 15) * 15;                                                 // 2679
        }                                                                                                              // 2680
                                                                                                                       // 2681
    });                                                                                                                // 2682
                                                                                                                       // 2683
    function rawMonthSetter(mom, value) {                                                                              // 2684
        var dayOfMonth;                                                                                                // 2685
                                                                                                                       // 2686
        // TODO: Move this out of here!                                                                                // 2687
        if (typeof value === 'string') {                                                                               // 2688
            value = mom.localeData().monthsParse(value);                                                               // 2689
            // TODO: Another silent failure?                                                                           // 2690
            if (typeof value !== 'number') {                                                                           // 2691
                return mom;                                                                                            // 2692
            }                                                                                                          // 2693
        }                                                                                                              // 2694
                                                                                                                       // 2695
        dayOfMonth = Math.min(mom.date(),                                                                              // 2696
                daysInMonth(mom.year(), value));                                                                       // 2697
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);                                        // 2698
        return mom;                                                                                                    // 2699
    }                                                                                                                  // 2700
                                                                                                                       // 2701
    function rawGetter(mom, unit) {                                                                                    // 2702
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();                                                     // 2703
    }                                                                                                                  // 2704
                                                                                                                       // 2705
    function rawSetter(mom, unit, value) {                                                                             // 2706
        if (unit === 'Month') {                                                                                        // 2707
            return rawMonthSetter(mom, value);                                                                         // 2708
        } else {                                                                                                       // 2709
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);                                            // 2710
        }                                                                                                              // 2711
    }                                                                                                                  // 2712
                                                                                                                       // 2713
    function makeAccessor(unit, keepTime) {                                                                            // 2714
        return function (value) {                                                                                      // 2715
            if (value != null) {                                                                                       // 2716
                rawSetter(this, unit, value);                                                                          // 2717
                moment.updateOffset(this, keepTime);                                                                   // 2718
                return this;                                                                                           // 2719
            } else {                                                                                                   // 2720
                return rawGetter(this, unit);                                                                          // 2721
            }                                                                                                          // 2722
        };                                                                                                             // 2723
    }                                                                                                                  // 2724
                                                                                                                       // 2725
    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);                              // 2726
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);                                             // 2727
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);                                             // 2728
    // Setting the hour should keep the time, because the user explicitly                                              // 2729
    // specified which hour he wants. So trying to maintain the same hour (in                                          // 2730
    // a new timezone) makes sense. Adding/subtracting hours does not follow                                           // 2731
    // this rule.                                                                                                      // 2732
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);                                                    // 2733
    // moment.fn.month is defined separately                                                                           // 2734
    moment.fn.date = makeAccessor('Date', true);                                                                       // 2735
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));        // 2736
    moment.fn.year = makeAccessor('FullYear', true);                                                                   // 2737
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));    // 2738
                                                                                                                       // 2739
    // add plural methods                                                                                              // 2740
    moment.fn.days = moment.fn.day;                                                                                    // 2741
    moment.fn.months = moment.fn.month;                                                                                // 2742
    moment.fn.weeks = moment.fn.week;                                                                                  // 2743
    moment.fn.isoWeeks = moment.fn.isoWeek;                                                                            // 2744
    moment.fn.quarters = moment.fn.quarter;                                                                            // 2745
                                                                                                                       // 2746
    // add aliased format methods                                                                                      // 2747
    moment.fn.toJSON = moment.fn.toISOString;                                                                          // 2748
                                                                                                                       // 2749
    // alias isUtc for dev-friendliness                                                                                // 2750
    moment.fn.isUTC = moment.fn.isUtc;                                                                                 // 2751
                                                                                                                       // 2752
    /************************************                                                                              // 2753
        Duration Prototype                                                                                             // 2754
    ************************************/                                                                              // 2755
                                                                                                                       // 2756
                                                                                                                       // 2757
    function daysToYears (days) {                                                                                      // 2758
        // 400 years have 146097 days (taking into account leap year rules)                                            // 2759
        return days * 400 / 146097;                                                                                    // 2760
    }                                                                                                                  // 2761
                                                                                                                       // 2762
    function yearsToDays (years) {                                                                                     // 2763
        // years * 365 + absRound(years / 4) -                                                                         // 2764
        //     absRound(years / 100) + absRound(years / 400);                                                          // 2765
        return years * 146097 / 400;                                                                                   // 2766
    }                                                                                                                  // 2767
                                                                                                                       // 2768
    extend(moment.duration.fn = Duration.prototype, {                                                                  // 2769
                                                                                                                       // 2770
        _bubble : function () {                                                                                        // 2771
            var milliseconds = this._milliseconds,                                                                     // 2772
                days = this._days,                                                                                     // 2773
                months = this._months,                                                                                 // 2774
                data = this._data,                                                                                     // 2775
                seconds, minutes, hours, years = 0;                                                                    // 2776
                                                                                                                       // 2777
            // The following code bubbles up values, see the tests for                                                 // 2778
            // examples of what that means.                                                                            // 2779
            data.milliseconds = milliseconds % 1000;                                                                   // 2780
                                                                                                                       // 2781
            seconds = absRound(milliseconds / 1000);                                                                   // 2782
            data.seconds = seconds % 60;                                                                               // 2783
                                                                                                                       // 2784
            minutes = absRound(seconds / 60);                                                                          // 2785
            data.minutes = minutes % 60;                                                                               // 2786
                                                                                                                       // 2787
            hours = absRound(minutes / 60);                                                                            // 2788
            data.hours = hours % 24;                                                                                   // 2789
                                                                                                                       // 2790
            days += absRound(hours / 24);                                                                              // 2791
                                                                                                                       // 2792
            // Accurately convert days to years, assume start from year 0.                                             // 2793
            years = absRound(daysToYears(days));                                                                       // 2794
            days -= absRound(yearsToDays(years));                                                                      // 2795
                                                                                                                       // 2796
            // 30 days to a month                                                                                      // 2797
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.                                          // 2798
            months += absRound(days / 30);                                                                             // 2799
            days %= 30;                                                                                                // 2800
                                                                                                                       // 2801
            // 12 months -> 1 year                                                                                     // 2802
            years += absRound(months / 12);                                                                            // 2803
            months %= 12;                                                                                              // 2804
                                                                                                                       // 2805
            data.days = days;                                                                                          // 2806
            data.months = months;                                                                                      // 2807
            data.years = years;                                                                                        // 2808
        },                                                                                                             // 2809
                                                                                                                       // 2810
        abs : function () {                                                                                            // 2811
            this._milliseconds = Math.abs(this._milliseconds);                                                         // 2812
            this._days = Math.abs(this._days);                                                                         // 2813
            this._months = Math.abs(this._months);                                                                     // 2814
                                                                                                                       // 2815
            this._data.milliseconds = Math.abs(this._data.milliseconds);                                               // 2816
            this._data.seconds = Math.abs(this._data.seconds);                                                         // 2817
            this._data.minutes = Math.abs(this._data.minutes);                                                         // 2818
            this._data.hours = Math.abs(this._data.hours);                                                             // 2819
            this._data.months = Math.abs(this._data.months);                                                           // 2820
            this._data.years = Math.abs(this._data.years);                                                             // 2821
                                                                                                                       // 2822
            return this;                                                                                               // 2823
        },                                                                                                             // 2824
                                                                                                                       // 2825
        weeks : function () {                                                                                          // 2826
            return absRound(this.days() / 7);                                                                          // 2827
        },                                                                                                             // 2828
                                                                                                                       // 2829
        valueOf : function () {                                                                                        // 2830
            return this._milliseconds +                                                                                // 2831
              this._days * 864e5 +                                                                                     // 2832
              (this._months % 12) * 2592e6 +                                                                           // 2833
              toInt(this._months / 12) * 31536e6;                                                                      // 2834
        },                                                                                                             // 2835
                                                                                                                       // 2836
        humanize : function (withSuffix) {                                                                             // 2837
            var output = relativeTime(this, !withSuffix, this.localeData());                                           // 2838
                                                                                                                       // 2839
            if (withSuffix) {                                                                                          // 2840
                output = this.localeData().pastFuture(+this, output);                                                  // 2841
            }                                                                                                          // 2842
                                                                                                                       // 2843
            return this.localeData().postformat(output);                                                               // 2844
        },                                                                                                             // 2845
                                                                                                                       // 2846
        add : function (input, val) {                                                                                  // 2847
            // supports only 2.0-style add(1, 's') or add(moment)                                                      // 2848
            var dur = moment.duration(input, val);                                                                     // 2849
                                                                                                                       // 2850
            this._milliseconds += dur._milliseconds;                                                                   // 2851
            this._days += dur._days;                                                                                   // 2852
            this._months += dur._months;                                                                               // 2853
                                                                                                                       // 2854
            this._bubble();                                                                                            // 2855
                                                                                                                       // 2856
            return this;                                                                                               // 2857
        },                                                                                                             // 2858
                                                                                                                       // 2859
        subtract : function (input, val) {                                                                             // 2860
            var dur = moment.duration(input, val);                                                                     // 2861
                                                                                                                       // 2862
            this._milliseconds -= dur._milliseconds;                                                                   // 2863
            this._days -= dur._days;                                                                                   // 2864
            this._months -= dur._months;                                                                               // 2865
                                                                                                                       // 2866
            this._bubble();                                                                                            // 2867
                                                                                                                       // 2868
            return this;                                                                                               // 2869
        },                                                                                                             // 2870
                                                                                                                       // 2871
        get : function (units) {                                                                                       // 2872
            units = normalizeUnits(units);                                                                             // 2873
            return this[units.toLowerCase() + 's']();                                                                  // 2874
        },                                                                                                             // 2875
                                                                                                                       // 2876
        as : function (units) {                                                                                        // 2877
            var days, months;                                                                                          // 2878
            units = normalizeUnits(units);                                                                             // 2879
                                                                                                                       // 2880
            if (units === 'month' || units === 'year') {                                                               // 2881
                days = this._days + this._milliseconds / 864e5;                                                        // 2882
                months = this._months + daysToYears(days) * 12;                                                        // 2883
                return units === 'month' ? months : months / 12;                                                       // 2884
            } else {                                                                                                   // 2885
                // handle milliseconds separately because of floating point math errors (issue #1867)                  // 2886
                days = this._days + Math.round(yearsToDays(this._months / 12));                                        // 2887
                switch (units) {                                                                                       // 2888
                    case 'week': return days / 7 + this._milliseconds / 6048e5;                                        // 2889
                    case 'day': return days + this._milliseconds / 864e5;                                              // 2890
                    case 'hour': return days * 24 + this._milliseconds / 36e5;                                         // 2891
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;                                   // 2892
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;                             // 2893
                    // Math.floor prevents floating point math errors here                                             // 2894
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;            // 2895
                    default: throw new Error('Unknown unit ' + units);                                                 // 2896
                }                                                                                                      // 2897
            }                                                                                                          // 2898
        },                                                                                                             // 2899
                                                                                                                       // 2900
        lang : moment.fn.lang,                                                                                         // 2901
        locale : moment.fn.locale,                                                                                     // 2902
                                                                                                                       // 2903
        toIsoString : deprecate(                                                                                       // 2904
            'toIsoString() is deprecated. Please use toISOString() instead ' +                                         // 2905
            '(notice the capitals)',                                                                                   // 2906
            function () {                                                                                              // 2907
                return this.toISOString();                                                                             // 2908
            }                                                                                                          // 2909
        ),                                                                                                             // 2910
                                                                                                                       // 2911
        toISOString : function () {                                                                                    // 2912
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js            // 2913
            var years = Math.abs(this.years()),                                                                        // 2914
                months = Math.abs(this.months()),                                                                      // 2915
                days = Math.abs(this.days()),                                                                          // 2916
                hours = Math.abs(this.hours()),                                                                        // 2917
                minutes = Math.abs(this.minutes()),                                                                    // 2918
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);                                       // 2919
                                                                                                                       // 2920
            if (!this.asSeconds()) {                                                                                   // 2921
                // this is the same as C#'s (Noda) and python (isodate)...                                             // 2922
                // but not other JS (goog.date)                                                                        // 2923
                return 'P0D';                                                                                          // 2924
            }                                                                                                          // 2925
                                                                                                                       // 2926
            return (this.asSeconds() < 0 ? '-' : '') +                                                                 // 2927
                'P' +                                                                                                  // 2928
                (years ? years + 'Y' : '') +                                                                           // 2929
                (months ? months + 'M' : '') +                                                                         // 2930
                (days ? days + 'D' : '') +                                                                             // 2931
                ((hours || minutes || seconds) ? 'T' : '') +                                                           // 2932
                (hours ? hours + 'H' : '') +                                                                           // 2933
                (minutes ? minutes + 'M' : '') +                                                                       // 2934
                (seconds ? seconds + 'S' : '');                                                                        // 2935
        },                                                                                                             // 2936
                                                                                                                       // 2937
        localeData : function () {                                                                                     // 2938
            return this._locale;                                                                                       // 2939
        },                                                                                                             // 2940
                                                                                                                       // 2941
        toJSON : function () {                                                                                         // 2942
            return this.toISOString();                                                                                 // 2943
        }                                                                                                              // 2944
    });                                                                                                                // 2945
                                                                                                                       // 2946
    moment.duration.fn.toString = moment.duration.fn.toISOString;                                                      // 2947
                                                                                                                       // 2948
    function makeDurationGetter(name) {                                                                                // 2949
        moment.duration.fn[name] = function () {                                                                       // 2950
            return this._data[name];                                                                                   // 2951
        };                                                                                                             // 2952
    }                                                                                                                  // 2953
                                                                                                                       // 2954
    for (i in unitMillisecondFactors) {                                                                                // 2955
        if (hasOwnProp(unitMillisecondFactors, i)) {                                                                   // 2956
            makeDurationGetter(i.toLowerCase());                                                                       // 2957
        }                                                                                                              // 2958
    }                                                                                                                  // 2959
                                                                                                                       // 2960
    moment.duration.fn.asMilliseconds = function () {                                                                  // 2961
        return this.as('ms');                                                                                          // 2962
    };                                                                                                                 // 2963
    moment.duration.fn.asSeconds = function () {                                                                       // 2964
        return this.as('s');                                                                                           // 2965
    };                                                                                                                 // 2966
    moment.duration.fn.asMinutes = function () {                                                                       // 2967
        return this.as('m');                                                                                           // 2968
    };                                                                                                                 // 2969
    moment.duration.fn.asHours = function () {                                                                         // 2970
        return this.as('h');                                                                                           // 2971
    };                                                                                                                 // 2972
    moment.duration.fn.asDays = function () {                                                                          // 2973
        return this.as('d');                                                                                           // 2974
    };                                                                                                                 // 2975
    moment.duration.fn.asWeeks = function () {                                                                         // 2976
        return this.as('weeks');                                                                                       // 2977
    };                                                                                                                 // 2978
    moment.duration.fn.asMonths = function () {                                                                        // 2979
        return this.as('M');                                                                                           // 2980
    };                                                                                                                 // 2981
    moment.duration.fn.asYears = function () {                                                                         // 2982
        return this.as('y');                                                                                           // 2983
    };                                                                                                                 // 2984
                                                                                                                       // 2985
    /************************************                                                                              // 2986
        Default Locale                                                                                                 // 2987
    ************************************/                                                                              // 2988
                                                                                                                       // 2989
                                                                                                                       // 2990
    // Set default locale, other locale will inherit from English.                                                     // 2991
    moment.locale('en', {                                                                                              // 2992
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,                                                                          // 2993
        ordinal : function (number) {                                                                                  // 2994
            var b = number % 10,                                                                                       // 2995
                output = (toInt(number % 100 / 10) === 1) ? 'th' :                                                     // 2996
                (b === 1) ? 'st' :                                                                                     // 2997
                (b === 2) ? 'nd' :                                                                                     // 2998
                (b === 3) ? 'rd' : 'th';                                                                               // 2999
            return number + output;                                                                                    // 3000
        }                                                                                                              // 3001
    });                                                                                                                // 3002
                                                                                                                       // 3003
    /* EMBED_LOCALES */                                                                                                // 3004
                                                                                                                       // 3005
    /************************************                                                                              // 3006
        Exposing Moment                                                                                                // 3007
    ************************************/                                                                              // 3008
                                                                                                                       // 3009
    function makeGlobal(shouldDeprecate) {                                                                             // 3010
        /*global ender:false */                                                                                        // 3011
        if (typeof ender !== 'undefined') {                                                                            // 3012
            return;                                                                                                    // 3013
        }                                                                                                              // 3014
        oldGlobalMoment = globalScope.moment;                                                                          // 3015
        if (shouldDeprecate) {                                                                                         // 3016
            globalScope.moment = deprecate(                                                                            // 3017
                    'Accessing Moment through the global scope is ' +                                                  // 3018
                    'deprecated, and will be removed in an upcoming ' +                                                // 3019
                    'release.',                                                                                        // 3020
                    moment);                                                                                           // 3021
        } else {                                                                                                       // 3022
            globalScope.moment = moment;                                                                               // 3023
        }                                                                                                              // 3024
    }                                                                                                                  // 3025
                                                                                                                       // 3026
    // CommonJS module is defined                                                                                      // 3027
    if (hasModule) {                                                                                                   // 3028
        module.exports = moment;                                                                                       // 3029
    } else if (typeof define === 'function' && define.amd) {                                                           // 3030
        define(function (require, exports, module) {                                                                   // 3031
            if (module.config && module.config() && module.config().noGlobal === true) {                               // 3032
                // release the global variable                                                                         // 3033
                globalScope.moment = oldGlobalMoment;                                                                  // 3034
            }                                                                                                          // 3035
                                                                                                                       // 3036
            return moment;                                                                                             // 3037
        });                                                                                                            // 3038
        makeGlobal(true);                                                                                              // 3039
    } else {                                                                                                           // 3040
        makeGlobal();                                                                                                  // 3041
    }                                                                                                                  // 3042
}).call(this);                                                                                                         // 3043
                                                                                                                       // 3044
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/momentjs:moment/meteor/export.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// moment.js makes `moment` global on the window (or global) object, while Meteor expects a file-scoped global variable
moment = this.moment;                                                                                                  // 2
delete this.moment;                                                                                                    // 3
                                                                                                                       // 4
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['momentjs:moment'] = {
  moment: moment
};

})();

//# sourceMappingURL=momentjs_moment.js.map
