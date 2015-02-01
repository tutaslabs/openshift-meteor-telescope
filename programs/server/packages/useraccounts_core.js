(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Accounts = Package['accounts-base'].Accounts;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var AccountsTemplates, Field, STATE_PAT, ERRORS_PAT, INFO_PAT, INPUT_ICONS_PAT, ObjWithStringValues, TEXTS_PAT, CONFIG_PAT, FIELD_SUB_PAT, FIELD_PAT, AT;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/useraccounts:core/lib/field.js                                                                          //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// ---------------------------------------------------------------------------------                                // 1
                                                                                                                    // 2
// Field object                                                                                                     // 3
                                                                                                                    // 4
// ---------------------------------------------------------------------------------                                // 5
                                                                                                                    // 6
                                                                                                                    // 7
Field = function(field){                                                                                            // 8
    check(field, FIELD_PAT);                                                                                        // 9
    _.defaults(this, field);                                                                                        // 10
                                                                                                                    // 11
    this.validating = new ReactiveVar(false);                                                                       // 12
    this.status = new ReactiveVar(null);                                                                            // 13
};                                                                                                                  // 14
                                                                                                                    // 15
if (Meteor.isClient)                                                                                                // 16
    Field.prototype.clearStatus = function(){                                                                       // 17
        return this.status.set(null);                                                                               // 18
    };                                                                                                              // 19
if (Meteor.isServer)                                                                                                // 20
    Field.prototype.clearStatus = function(){                                                                       // 21
        // Nothing to do server-side                                                                                // 22
        return                                                                                                      // 23
    };                                                                                                              // 24
                                                                                                                    // 25
Field.prototype.fixValue = function(value){                                                                         // 26
    if (this.type === "checkbox")                                                                                   // 27
        return !!value;                                                                                             // 28
    if (this.type === "select")                                                                                     // 29
        // TODO: something working...                                                                               // 30
        return value;                                                                                               // 31
    if (this.type === "radio")                                                                                      // 32
        // TODO: something working...                                                                               // 33
        return value;                                                                                               // 34
    // Possibly applies required transformations to the input value                                                 // 35
    if (this.trim)                                                                                                  // 36
        value = value.trim();                                                                                       // 37
    if (this.lowercase)                                                                                             // 38
        value = value.toLowerCase();                                                                                // 39
    if (this.uppercase)                                                                                             // 40
        value = value.toUpperCase();                                                                                // 41
    if (!!this.transform)                                                                                           // 42
        value = this.transform(value);                                                                              // 43
    return value;                                                                                                   // 44
};                                                                                                                  // 45
                                                                                                                    // 46
if (Meteor.isClient)                                                                                                // 47
    Field.prototype.getDisplayName = function(state){                                                               // 48
        var dN = this.displayName;                                                                                  // 49
        if (_.isObject(dN))                                                                                         // 50
            dN = dN[state] || dN["default"];                                                                        // 51
        if (!dN)                                                                                                    // 52
            dN = capitalize(this._id);                                                                              // 53
        return dN;                                                                                                  // 54
    };                                                                                                              // 55
                                                                                                                    // 56
if (Meteor.isClient)                                                                                                // 57
    Field.prototype.getPlaceholder = function(state){                                                               // 58
        var placeholder = this.placeholder;                                                                         // 59
        if (_.isObject(placeholder))                                                                                // 60
            placeholder = placeholder[state] || placeholder["default"];                                             // 61
        if (!placeholder)                                                                                           // 62
            placeholder = capitalize(this._id);                                                                     // 63
        return placeholder;                                                                                         // 64
    };                                                                                                              // 65
                                                                                                                    // 66
Field.prototype.getStatus = function(){                                                                             // 67
    return this.status.get();                                                                                       // 68
};                                                                                                                  // 69
                                                                                                                    // 70
if (Meteor.isClient)                                                                                                // 71
    Field.prototype.getValue = function(tempalteInstance){                                                          // 72
        if (this.type === "checkbox")                                                                               // 73
            return !!(tempalteInstance.$("#at-field-" + this._id + ":checked").val());                              // 74
        if (this.type === "radio")                                                                                  // 75
            return tempalteInstance.$("[name=at-field-"+ this._id + "]:checked").val();                             // 76
        return tempalteInstance.$("#at-field-" + this._id).val();                                                   // 77
    };                                                                                                              // 78
                                                                                                                    // 79
if (Meteor.isClient)                                                                                                // 80
    Field.prototype.hasError = function() {                                                                         // 81
        return this.negativeValidation && this.status.get();                                                        // 82
    };                                                                                                              // 83
                                                                                                                    // 84
if (Meteor.isClient)                                                                                                // 85
    Field.prototype.hasIcon = function(){                                                                           // 86
        if (this.showValidating && this.isValidating())                                                             // 87
            return true;                                                                                            // 88
        if (this.negativeFeedback && this.hasError())                                                               // 89
            return true;                                                                                            // 90
        if (this.positiveFeedback && this.hasSuccess())                                                             // 91
            return true;                                                                                            // 92
    };                                                                                                              // 93
                                                                                                                    // 94
if (Meteor.isClient)                                                                                                // 95
    Field.prototype.hasSuccess = function() {                                                                       // 96
        return this.positiveValidation && this.status.get() === false;                                              // 97
    };                                                                                                              // 98
                                                                                                                    // 99
if (Meteor.isClient)                                                                                                // 100
    Field.prototype.iconClass = function(){                                                                         // 101
        if (this.isValidating())                                                                                    // 102
            return AccountsTemplates.texts.inputIcons["isValidating"];                                              // 103
        if (this.hasError())                                                                                        // 104
            return AccountsTemplates.texts.inputIcons["hasError"];                                                  // 105
        if (this.hasSuccess())                                                                                      // 106
            return AccountsTemplates.texts.inputIcons["hasSuccess"];                                                // 107
    };                                                                                                              // 108
                                                                                                                    // 109
if (Meteor.isClient)                                                                                                // 110
    Field.prototype.isValidating = function(){                                                                      // 111
        return this.validating.get();                                                                               // 112
    };                                                                                                              // 113
                                                                                                                    // 114
if (Meteor.isClient)                                                                                                // 115
    Field.prototype.setError = function(err){                                                                       // 116
        check(err, Match.OneOf(String, undefined));                                                                 // 117
        return this.status.set(err || true);                                                                        // 118
    };                                                                                                              // 119
if (Meteor.isServer)                                                                                                // 120
    Field.prototype.setError = function(err){                                                                       // 121
        // Nothing to do server-side                                                                                // 122
        return;                                                                                                     // 123
    };                                                                                                              // 124
                                                                                                                    // 125
if (Meteor.isClient)                                                                                                // 126
    Field.prototype.setSuccess = function(){                                                                        // 127
        return this.status.set(false);                                                                              // 128
    };                                                                                                              // 129
if (Meteor.isServer)                                                                                                // 130
    Field.prototype.setSuccess = function(){                                                                        // 131
        // Nothing to do server-side                                                                                // 132
        return;                                                                                                     // 133
    };                                                                                                              // 134
                                                                                                                    // 135
                                                                                                                    // 136
if (Meteor.isClient)                                                                                                // 137
    Field.prototype.setValidating = function(state){                                                                // 138
        check(state, Boolean);                                                                                      // 139
        return this.validating.set(state);                                                                          // 140
    };                                                                                                              // 141
if (Meteor.isServer)                                                                                                // 142
    Field.prototype.setValidating = function(state){                                                                // 143
        // Nothing to do server-side                                                                                // 144
        return;                                                                                                     // 145
    };                                                                                                              // 146
                                                                                                                    // 147
if (Meteor.isClient)                                                                                                // 148
    Field.prototype.setValue = function(tempalteInstance, value){                                                   // 149
        if (this.type === "checkbox") {                                                                             // 150
            tempalteInstance.$("#at-field-" + this._id).prop('checked', true);                                      // 151
            return;                                                                                                 // 152
        }                                                                                                           // 153
        if (this.type === "radio") {                                                                                // 154
            tempalteInstance.$("[name=at-field-"+ this._id + "]").prop('checked', true);                            // 155
            return;                                                                                                 // 156
        }                                                                                                           // 157
        tempalteInstance.$("#at-field-" + this._id).val(value);                                                     // 158
    };                                                                                                              // 159
                                                                                                                    // 160
Field.prototype.validate = function(value, strict) {                                                                // 161
    check(value, Match.OneOf(undefined, String, Boolean));                                                          // 162
    this.setValidating(true);                                                                                       // 163
    this.clearStatus();                                                                                             // 164
    if (!value){                                                                                                    // 165
        if (!!strict){                                                                                              // 166
            if (this.required) {                                                                                    // 167
                this.setError("Required Field");                                                                    // 168
                this.setValidating(false);                                                                          // 169
                return "Required Field";                                                                            // 170
            }                                                                                                       // 171
            else {                                                                                                  // 172
                this.setSuccess();                                                                                  // 173
                this.setValidating(false);                                                                          // 174
                return false;                                                                                       // 175
            }                                                                                                       // 176
        }                                                                                                           // 177
        else {                                                                                                      // 178
            this.clearStatus();                                                                                     // 179
            this.setValidating(false);                                                                              // 180
            return null;                                                                                            // 181
        }                                                                                                           // 182
    }                                                                                                               // 183
    var valueLength = value.length;                                                                                 // 184
    var minLength = this.minLength;                                                                                 // 185
    if (minLength && valueLength < minLength) {                                                                     // 186
        this.setError("Minimum required length: " + minLength);                                                     // 187
        this.setValidating(false);                                                                                  // 188
        return "Minimum required length: " + minLength;                                                             // 189
    }                                                                                                               // 190
    var maxLength = this.maxLength;                                                                                 // 191
    if (maxLength && valueLength > maxLength) {                                                                     // 192
        this.setError("Maximum allowed length: " + maxLength);                                                      // 193
        this.setValidating(false);                                                                                  // 194
        return "Maximum allowed length: " + maxLength;                                                              // 195
    }                                                                                                               // 196
    if (this.re && valueLength && !value.match(this.re)) {                                                          // 197
        this.setError(this.errStr);                                                                                 // 198
        this.setValidating(false);                                                                                  // 199
        return this.errStr;                                                                                         // 200
    }                                                                                                               // 201
    if (this.func && valueLength){                                                                                  // 202
        var result = this.func(value);                                                                              // 203
        var err = result === true ? this.errStr || true : result;                                                   // 204
        if (result === undefined)                                                                                   // 205
            return err;                                                                                             // 206
        this.status.set(err);                                                                                       // 207
        this.setValidating(false);                                                                                  // 208
        return err;                                                                                                 // 209
    }                                                                                                               // 210
    this.setSuccess();                                                                                              // 211
    this.setValidating(false);                                                                                      // 212
    return false;                                                                                                   // 213
};                                                                                                                  // 214
                                                                                                                    // 215
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/useraccounts:core/lib/core.js                                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// ---------------------------------------------------------------------------------                                // 1
                                                                                                                    // 2
// Patterns for methods" parameters                                                                                 // 3
                                                                                                                    // 4
// ---------------------------------------------------------------------------------                                // 5
                                                                                                                    // 6
STATE_PAT = {                                                                                                       // 7
    changePwd: Match.Optional(String),                                                                              // 8
    enrollAccount: Match.Optional(String),                                                                          // 9
    forgotPwd: Match.Optional(String),                                                                              // 10
    resetPwd: Match.Optional(String),                                                                               // 11
    signIn: Match.Optional(String),                                                                                 // 12
    signUp: Match.Optional(String),                                                                                 // 13
};                                                                                                                  // 14
                                                                                                                    // 15
ERRORS_PAT = {                                                                                                      // 16
    mustBeLoggedIn: Match.Optional(String),                                                                         // 17
    pwdMismatch: Match.Optional(String),                                                                            // 18
};                                                                                                                  // 19
                                                                                                                    // 20
INFO_PAT = {                                                                                                        // 21
    emailSent: Match.Optional(String),                                                                              // 22
    emailVerified: Match.Optional(String),                                                                          // 23
    pwdChanged: Match.Optional(String),                                                                             // 24
    pwdReset: Match.Optional(String),                                                                               // 25
    pwdSet: Match.Optional(String),                                                                                 // 26
    signUpVerifyEmail: Match.Optional(String),                                                                      // 27
};                                                                                                                  // 28
                                                                                                                    // 29
INPUT_ICONS_PAT = {                                                                                                 // 30
    isValidating: Match.Optional(String),                                                                           // 31
    hasError: Match.Optional(String),                                                                               // 32
    hasSuccess: Match.Optional(String),                                                                             // 33
};                                                                                                                  // 34
                                                                                                                    // 35
ObjWithStringValues = Match.Where(function (x) {                                                                    // 36
    check(x, Object);                                                                                               // 37
    _.each(_.values(x), function(value){                                                                            // 38
        check(value, String);                                                                                       // 39
    });                                                                                                             // 40
    return true;                                                                                                    // 41
});                                                                                                                 // 42
                                                                                                                    // 43
TEXTS_PAT = {                                                                                                       // 44
    button: Match.Optional(STATE_PAT),                                                                              // 45
    errors: Match.Optional(ERRORS_PAT),                                                                             // 46
    navSignIn: Match.Optional(String),                                                                              // 47
    navSignOut: Match.Optional(String),                                                                             // 48
    info: Match.Optional(INFO_PAT),                                                                                 // 49
    inputIcons: Match.Optional(INPUT_ICONS_PAT),                                                                    // 50
    optionalField: Match.Optional(String),                                                                          // 51
    pwdLink_pre: Match.Optional(String),                                                                            // 52
    pwdLink_link: Match.Optional(String),                                                                           // 53
    pwdLink_suff: Match.Optional(String),                                                                           // 54
    sep: Match.Optional(String),                                                                                    // 55
    signInLink_pre: Match.Optional(String),                                                                         // 56
    signInLink_link: Match.Optional(String),                                                                        // 57
    signInLink_suff: Match.Optional(String),                                                                        // 58
    signUpLink_pre: Match.Optional(String),                                                                         // 59
    signUpLink_link: Match.Optional(String),                                                                        // 60
    signUpLink_suff: Match.Optional(String),                                                                        // 61
    socialAdd: Match.Optional(String),                                                                              // 62
    socialConfigure: Match.Optional(String),                                                                        // 63
    socialIcons: Match.Optional(ObjWithStringValues),                                                               // 64
    socialRemove: Match.Optional(String),                                                                           // 65
    socialSignIn: Match.Optional(String),                                                                           // 66
    socialSignUp: Match.Optional(String),                                                                           // 67
    socialWith: Match.Optional(String),                                                                             // 68
    termsPreamble: Match.Optional(String),                                                                          // 69
    termsPrivacy: Match.Optional(String),                                                                           // 70
    termsAnd: Match.Optional(String),                                                                               // 71
    termsTerms: Match.Optional(String),                                                                             // 72
    title: Match.Optional(STATE_PAT),                                                                               // 73
};                                                                                                                  // 74
                                                                                                                    // 75
// Configuration pattern to be checked with check                                                                   // 76
CONFIG_PAT = {                                                                                                      // 77
    // Behaviour                                                                                                    // 78
    confirmPassword: Match.Optional(Boolean),                                                                       // 79
    defaultState: Match.Optional(String),                                                                           // 80
    enablePasswordChange: Match.Optional(Boolean),                                                                  // 81
    enforceEmailVerification: Match.Optional(Boolean),                                                              // 82
    forbidClientAccountCreation: Match.Optional(Boolean),                                                           // 83
    overrideLoginErrors: Match.Optional(Boolean),                                                                   // 84
    sendVerificationEmail: Match.Optional(Boolean),                                                                 // 85
    socialLoginStyle: Match.Optional(Match.OneOf("popup", "redirect")),                                             // 86
                                                                                                                    // 87
    // Appearance                                                                                                   // 88
    defaultLayout: Match.Optional(String),                                                                          // 89
    showAddRemoveServices: Match.Optional(Boolean),                                                                 // 90
    showForgotPasswordLink: Match.Optional(Boolean),                                                                // 91
    showLabels: Match.Optional(Boolean),                                                                            // 92
    showPlaceholders: Match.Optional(Boolean),                                                                      // 93
    hideSignInLink: Match.Optional(Boolean),                                                                        // 94
    hideSignUpLink: Match.Optional(Boolean),                                                                        // 95
                                                                                                                    // 96
    // Client-side Validation                                                                                       // 97
    continuousValidation: Match.Optional(Boolean),                                                                  // 98
    negativeFeedback: Match.Optional(Boolean),                                                                      // 99
    negativeValidation: Match.Optional(Boolean),                                                                    // 100
    positiveValidation: Match.Optional(Boolean),                                                                    // 101
    positiveFeedback: Match.Optional(Boolean),                                                                      // 102
    showValidating: Match.Optional(Boolean),                                                                        // 103
                                                                                                                    // 104
    // Privacy Policy and Terms of Use                                                                              // 105
    privacyUrl: Match.Optional(String),                                                                             // 106
    termsUrl: Match.Optional(String),                                                                               // 107
                                                                                                                    // 108
    // Redirects                                                                                                    // 109
    homeRoutePath: Match.Optional(String),                                                                          // 110
    redirectTimeout: Match.Optional(Number),                                                                        // 111
                                                                                                                    // 112
    // Hooks                                                                                                        // 113
    onSubmitHook: Match.Optional(Function),                                                                         // 114
    onLogoutHook: Match.Optional(Function),                                                                         // 115
                                                                                                                    // 116
    texts: Match.Optional(TEXTS_PAT),                                                                               // 117
};                                                                                                                  // 118
                                                                                                                    // 119
                                                                                                                    // 120
FIELD_SUB_PAT = {                                                                                                   // 121
    "default": Match.Optional(String),                                                                              // 122
    changePwd: Match.Optional(String),                                                                              // 123
    enrollAccount: Match.Optional(String),                                                                          // 124
    forgotPwd: Match.Optional(String),                                                                              // 125
    resetPwd: Match.Optional(String),                                                                               // 126
    signIn: Match.Optional(String),                                                                                 // 127
    signUp: Match.Optional(String),                                                                                 // 128
};                                                                                                                  // 129
                                                                                                                    // 130
                                                                                                                    // 131
// Field pattern                                                                                                    // 132
FIELD_PAT = {                                                                                                       // 133
    _id: String,                                                                                                    // 134
    type: String,                                                                                                   // 135
    required: Match.Optional(Boolean),                                                                              // 136
    displayName: Match.Optional(Match.OneOf(String, FIELD_SUB_PAT)),                                                // 137
    placeholder: Match.Optional(Match.OneOf(String, FIELD_SUB_PAT)),                                                // 138
    select: Match.Optional([{text: String, value: Match.Any}]),                                                     // 139
    minLength: Match.Optional(Match.Integer),                                                                       // 140
    maxLength: Match.Optional(Match.Integer),                                                                       // 141
    re: Match.Optional(RegExp),                                                                                     // 142
    func: Match.Optional(Match.Where(_.isFunction)),                                                                // 143
    errStr: Match.Optional(String),                                                                                 // 144
                                                                                                                    // 145
    // Client-side Validation                                                                                       // 146
    continuousValidation: Match.Optional(Boolean),                                                                  // 147
    negativeFeedback: Match.Optional(Boolean),                                                                      // 148
    negativeValidation: Match.Optional(Boolean),                                                                    // 149
    positiveValidation: Match.Optional(Boolean),                                                                    // 150
    positiveFeedback: Match.Optional(Boolean),                                                                      // 151
                                                                                                                    // 152
    // Transforms                                                                                                   // 153
    trim: Match.Optional(Boolean),                                                                                  // 154
    lowercase: Match.Optional(Boolean),                                                                             // 155
    uppercase: Match.Optional(Boolean),                                                                             // 156
    transform: Match.Optional(Match.Where(_.isFunction)),                                                           // 157
                                                                                                                    // 158
    // Custom options                                                                                               // 159
    options: Match.Optional(Object),                                                                                // 160
};                                                                                                                  // 161
                                                                                                                    // 162
// Route configuration pattern to be checked with check                                                             // 163
var ROUTE_PAT = {                                                                                                   // 164
    name: Match.Optional(String),                                                                                   // 165
    path: Match.Optional(String),                                                                                   // 166
    template: Match.Optional(String),                                                                               // 167
    layoutTemplate: Match.Optional(String),                                                                         // 168
    redirect: Match.Optional(Match.OneOf(String, Match.Where(_.isFunction))),                                       // 169
};                                                                                                                  // 170
                                                                                                                    // 171
                                                                                                                    // 172
// -----------------------------------------------------------------------------                                    // 173
                                                                                                                    // 174
// AccountsTemplates object                                                                                         // 175
                                                                                                                    // 176
// -----------------------------------------------------------------------------                                    // 177
                                                                                                                    // 178
                                                                                                                    // 179
                                                                                                                    // 180
// -------------------                                                                                              // 181
// Client/Server stuff                                                                                              // 182
// -------------------                                                                                              // 183
                                                                                                                    // 184
// Constructor                                                                                                      // 185
AT = function() {                                                                                                   // 186
                                                                                                                    // 187
};                                                                                                                  // 188
                                                                                                                    // 189
                                                                                                                    // 190
                                                                                                                    // 191
                                                                                                                    // 192
/*                                                                                                                  // 193
    Each field object is represented by the following properties:                                                   // 194
        _id:         String   (required)  // A unique field"s id / name                                             // 195
        type:        String   (required)  // Displayed input type                                                   // 196
        required:    Boolean  (optional)  // Specifies Whether to fail or not when field is left empty              // 197
        displayName: String   (optional)  // The field"s name to be displayed as a label above the input element    // 198
        placeholder: String   (optional)  // The placeholder text to be displayed inside the input element          // 199
        minLength:   Integer  (optional)  // Possibly specifies the minimum allowed length                          // 200
        maxLength:   Integer  (optional)  // Possibly specifies the maximum allowed length                          // 201
        re:          RegExp   (optional)  // Regular expression for validation                                      // 202
        func:        Function (optional)  // Custom function for validation                                         // 203
        errStr:      String   (optional)  // Error message to be displayed in case re validation fails              // 204
*/                                                                                                                  // 205
                                                                                                                    // 206
                                                                                                                    // 207
                                                                                                                    // 208
/*                                                                                                                  // 209
    Routes configuration can be done by calling AccountsTemplates.configureRoute with the route name and the        // 210
    following options in a separate object. E.g. AccountsTemplates.configureRoute("gingIn", option);                // 211
        name:           String (optional). A unique route"s name to be passed to iron-router                        // 212
        path:           String (optional). A unique route"s path to be passed to iron-router                        // 213
        template:       String (optional). The name of the template to be rendered                                  // 214
        layoutTemplate: String (optional). The name of the layout to be used                                        // 215
        redirect:       String (optional). The name of the route (or its path) where to redirect after form submit  // 216
*/                                                                                                                  // 217
                                                                                                                    // 218
                                                                                                                    // 219
// Allowed routes along with theirs default configuration values                                                    // 220
AT.prototype.ROUTE_DEFAULT = {                                                                                      // 221
    changePwd:      { name: "atChangePwd",      path: "/change-password"},                                          // 222
    enrollAccount:  { name: "atEnrollAccount",  path: "/enroll-account"},                                           // 223
    ensureSignedIn: { name: "atEnsureSignedIn", path: null},                                                        // 224
    forgotPwd:      { name: "atForgotPwd",      path: "/forgot-password"},                                          // 225
    resetPwd:       { name: "atResetPwd",       path: "/reset-password"},                                           // 226
    signIn:         { name: "atSignIn",         path: "/sign-in"},                                                  // 227
    signUp:         { name: "atSignUp",         path: "/sign-up"},                                                  // 228
    verifyEmail:    { name: "atVerifyEmail",    path: "/verify-email"},                                             // 229
};                                                                                                                  // 230
                                                                                                                    // 231
                                                                                                                    // 232
                                                                                                                    // 233
// Allowed input types                                                                                              // 234
AT.prototype.INPUT_TYPES = [                                                                                        // 235
    "checkbox",                                                                                                     // 236
    "email",                                                                                                        // 237
    "hidden",                                                                                                       // 238
    "password",                                                                                                     // 239
    "radio",                                                                                                        // 240
    "select",                                                                                                       // 241
    "tel",                                                                                                          // 242
    "text",                                                                                                         // 243
    "url",                                                                                                          // 244
];                                                                                                                  // 245
                                                                                                                    // 246
// Current configuration values                                                                                     // 247
AT.prototype.options = {                                                                                            // 248
    // Appearance                                                                                                   // 249
    //defaultLayout: undefined,                                                                                     // 250
    showAddRemoveServices: false,                                                                                   // 251
    showForgotPasswordLink: false,                                                                                  // 252
    showLabels: true,                                                                                               // 253
    showPlaceholders: true,                                                                                         // 254
                                                                                                                    // 255
    // Behaviour                                                                                                    // 256
    confirmPassword: true,                                                                                          // 257
    defaultState: "signIn",                                                                                         // 258
    enablePasswordChange: false,                                                                                    // 259
    forbidClientAccountCreation: false,                                                                             // 260
    overrideLoginErrors: true,                                                                                      // 261
    sendVerificationEmail: false,                                                                                   // 262
    socialLoginStyle: "popup",                                                                                      // 263
                                                                                                                    // 264
    // Client-side Validation                                                                                       // 265
    //continuousValidation: false,                                                                                  // 266
    //negativeFeedback: false,                                                                                      // 267
    //negativeValidation: false,                                                                                    // 268
    //positiveValidation: false,                                                                                    // 269
    //positiveFeedback: false,                                                                                      // 270
    //showValidating: false,                                                                                        // 271
                                                                                                                    // 272
    // Privacy Policy and Terms of Use                                                                              // 273
    privacyUrl: undefined,                                                                                          // 274
    termsUrl: undefined,                                                                                            // 275
                                                                                                                    // 276
    // Redirects                                                                                                    // 277
    homeRoutePath: "/",                                                                                             // 278
    redirectTimeout: 2000, // 2 seconds                                                                             // 279
                                                                                                                    // 280
    // Hooks                                                                                                        // 281
    onSubmitHook: undefined,                                                                                        // 282
};                                                                                                                  // 283
                                                                                                                    // 284
AT.prototype.SPECIAL_FIELDS = [                                                                                     // 285
    "password_again",                                                                                               // 286
    "username_and_email",                                                                                           // 287
];                                                                                                                  // 288
                                                                                                                    // 289
// SignIn / SignUp fields                                                                                           // 290
AT.prototype._fields = [                                                                                            // 291
    new Field({                                                                                                     // 292
        _id: "email",                                                                                               // 293
        type: "email",                                                                                              // 294
        required: true,                                                                                             // 295
        lowercase: true,                                                                                            // 296
        trim: true,                                                                                                 // 297
        func: function(email){                                                                                      // 298
            return !_.contains(email, '@');                                                                         // 299
        },                                                                                                          // 300
        errStr: 'Invalid email',                                                                                    // 301
    }),                                                                                                             // 302
    new Field({                                                                                                     // 303
        _id: "password",                                                                                            // 304
        type: "password",                                                                                           // 305
        required: true,                                                                                             // 306
        minLength: 6,                                                                                               // 307
        displayName: {                                                                                              // 308
            "default": "password",                                                                                  // 309
            changePwd: "newPassword",                                                                               // 310
            resetPwd: "newPassword",                                                                                // 311
        },                                                                                                          // 312
        placeholder: {                                                                                              // 313
            "default": "password",                                                                                  // 314
            changePwd: "newPassword",                                                                               // 315
            resetPwd: "newPassword",                                                                                // 316
        },                                                                                                          // 317
    }),                                                                                                             // 318
];                                                                                                                  // 319
                                                                                                                    // 320
// Configured routes                                                                                                // 321
AT.prototype.routes = {};                                                                                           // 322
                                                                                                                    // 323
AT.prototype._initialized = false;                                                                                  // 324
                                                                                                                    // 325
// Input type validation                                                                                            // 326
AT.prototype._isValidInputType = function(value) {                                                                  // 327
    return _.indexOf(this.INPUT_TYPES, value) !== -1;                                                               // 328
};                                                                                                                  // 329
                                                                                                                    // 330
AT.prototype.addField = function(field) {                                                                           // 331
    // Fields can be added only before initialization                                                               // 332
    if (this._initialized)                                                                                          // 333
        throw new Error("AccountsTemplates.addField should strictly be called before AccountsTemplates.init!");     // 334
    field = _.pick(field, _.keys(FIELD_PAT));                                                                       // 335
    check(field, FIELD_PAT);                                                                                        // 336
    // Checks there"s currently no field called field._id                                                           // 337
    if (_.indexOf(_.pluck(this._fields, "_id"), field._id) !== -1)                                                  // 338
        throw new Error("A field called " + field._id + " already exists!");                                        // 339
    // Validates field.type                                                                                         // 340
    if (!this._isValidInputType(field.type))                                                                        // 341
        throw new Error("field.type is not valid!");                                                                // 342
    // Checks field.minLength is strictly positive                                                                  // 343
    if (typeof field.minLength !== "undefined" && field.minLength <= 0)                                             // 344
        throw new Error("field.minLength should be greater than zero!");                                            // 345
    // Checks field.maxLength is strictly positive                                                                  // 346
    if (typeof field.maxLength !== "undefined" && field.maxLength <= 0)                                             // 347
        throw new Error("field.maxLength should be greater than zero!");                                            // 348
    // Checks field.maxLength is greater than field.minLength                                                       // 349
    if (typeof field.minLength !== "undefined" && typeof field.minLength !== "undefined" && field.maxLength < field.minLength)
        throw new Error("field.maxLength should be greater than field.maxLength!");                                 // 351
                                                                                                                    // 352
    if (!(Meteor.isServer && _.contains(this.SPECIAL_FIELDS, field._id)))                                           // 353
        this._fields.push(new Field(field));                                                                        // 354
    return this._fields;                                                                                            // 355
};                                                                                                                  // 356
                                                                                                                    // 357
AT.prototype.addFields = function(fields) {                                                                         // 358
    var ok;                                                                                                         // 359
    try { // don"t bother with `typeof` - just access `length` and `catch`                                          // 360
        ok = fields.length > 0 && "0" in Object(fields);                                                            // 361
    } catch (e) {                                                                                                   // 362
        throw new Error("field argument should be an array of valid field objects!");                               // 363
    }                                                                                                               // 364
    if (ok) {                                                                                                       // 365
        _.map(fields, function(field){                                                                              // 366
            this.addField(field);                                                                                   // 367
        }, this);                                                                                                   // 368
    } else                                                                                                          // 369
        throw new Error("field argument should be an array of valid field objects!");                               // 370
    return this._fields;                                                                                            // 371
};                                                                                                                  // 372
                                                                                                                    // 373
AT.prototype.configure = function(config) {                                                                         // 374
    // Configuration options can be set only before initialization                                                  // 375
    if (this._initialized)                                                                                          // 376
        throw new Error("Configuration options must be set before AccountsTemplates.init!");                        // 377
                                                                                                                    // 378
    // Updates the current configuration                                                                            // 379
    check(config, CONFIG_PAT);                                                                                      // 380
    var options = _.omit(config, "texts");                                                                          // 381
    this.options = _.defaults(options, this.options);                                                               // 382
                                                                                                                    // 383
    if (Meteor.isClient){                                                                                           // 384
        // Possibly sets up client texts...                                                                         // 385
        if (config.texts){                                                                                          // 386
            var texts = config.texts;                                                                               // 387
            var simpleTexts = _.omit(texts, "button", "errors", "info", "inputIcons", "socialIcons", "title");      // 388
            this.texts = _.defaults(simpleTexts, this.texts);                                                       // 389
                                                                                                                    // 390
            if (texts.button) {                                                                                     // 391
                // Updates the current button object                                                                // 392
                this.texts.button = _.defaults(texts.button, this.texts.button);                                    // 393
            }                                                                                                       // 394
            if (texts.errors) {                                                                                     // 395
                // Updates the current errors object                                                                // 396
                this.texts.errors = _.defaults(texts.errors, this.texts.errors);                                    // 397
            }                                                                                                       // 398
            if (texts.info) {                                                                                       // 399
                // Updates the current info object                                                                  // 400
                this.texts.info = _.defaults(texts.info, this.texts.info);                                          // 401
            }                                                                                                       // 402
            if (texts.inputIcons) {                                                                                 // 403
                // Updates the current inputIcons object                                                            // 404
                this.texts.inputIcons = _.defaults(texts.inputIcons, this.texts.inputIcons);                        // 405
            }                                                                                                       // 406
            if (texts.socialIcons) {                                                                                // 407
                // Updates the current socialIcons object                                                           // 408
                this.texts.socialIcons = _.defaults(texts.socialIcons, this.texts.socialIcons);                     // 409
            }                                                                                                       // 410
            if (texts.title) {                                                                                      // 411
                // Updates the current title object                                                                 // 412
                this.texts.title = _.defaults(texts.title, this.texts.title);                                       // 413
            }                                                                                                       // 414
        }                                                                                                           // 415
    }                                                                                                               // 416
};                                                                                                                  // 417
                                                                                                                    // 418
AT.prototype.configureRoute = function(route, options) {                                                            // 419
    check(route, String);                                                                                           // 420
    check(options, Match.OneOf(undefined, ROUTE_PAT));                                                              // 421
    options = _.clone(options);                                                                                     // 422
    // Route Configuration can be done only before initialization                                                   // 423
    if (this._initialized)                                                                                          // 424
        throw new Error("Route Configuration can be done only before AccountsTemplates.init!");                     // 425
    // Only allowed routes can be configured                                                                        // 426
    if (!(route in this.ROUTE_DEFAULT))                                                                             // 427
        throw new Error("Unknown Route!");                                                                          // 428
                                                                                                                    // 429
    // Possibly adds a initial / to the provided path                                                               // 430
    if (options && options.path && options.path[0] !== "/")                                                         // 431
        options.path = "/" + options.path;                                                                          // 432
    // Updates the current configuration                                                                            // 433
    options = _.defaults(options || {}, this.ROUTE_DEFAULT[route]);                                                 // 434
    this.routes[route] = options;                                                                                   // 435
};                                                                                                                  // 436
                                                                                                                    // 437
AT.prototype.hasField = function(fieldId) {                                                                         // 438
    return !!this.getField(fieldId);                                                                                // 439
};                                                                                                                  // 440
                                                                                                                    // 441
AT.prototype.getField = function(fieldId) {                                                                         // 442
    var field = _.filter(this._fields, function(field){                                                             // 443
        return field._id == fieldId;                                                                                // 444
    });                                                                                                             // 445
    return (field.length === 1) ? field[0] : undefined;                                                             // 446
};                                                                                                                  // 447
                                                                                                                    // 448
AT.prototype.getFields = function() {                                                                               // 449
    return this._fields;                                                                                            // 450
};                                                                                                                  // 451
                                                                                                                    // 452
AT.prototype.getFieldIds = function() {                                                                             // 453
    return _.pluck(this._fields, "_id");                                                                            // 454
};                                                                                                                  // 455
                                                                                                                    // 456
AT.prototype.getRouteName = function(route) {                                                                       // 457
    if (route in this.routes)                                                                                       // 458
        return this.routes[route].name;                                                                             // 459
    return null;                                                                                                    // 460
};                                                                                                                  // 461
                                                                                                                    // 462
AT.prototype.getRoutePath = function(route) {                                                                       // 463
    if (route in this.routes)                                                                                       // 464
        return this.routes[route].path;                                                                             // 465
    return "#";                                                                                                     // 466
};                                                                                                                  // 467
                                                                                                                    // 468
AT.prototype.oauthServices = function(){                                                                            // 469
    // Extracts names of available services                                                                         // 470
    var names;                                                                                                      // 471
    if (Meteor.isServer)                                                                                            // 472
        names = (Accounts.oauth && Accounts.oauth.serviceNames()) || [];                                            // 473
    else                                                                                                            // 474
        names = (Accounts.oauth && Accounts.loginServicesConfigured() && Accounts.oauth.serviceNames()) || [];      // 475
    // Extracts names of configured services                                                                        // 476
    var configuredServices = [];                                                                                    // 477
    if (Accounts.loginServiceConfiguration)                                                                         // 478
        configuredServices = _.pluck(Accounts.loginServiceConfiguration.find().fetch(), "service");                 // 479
                                                                                                                    // 480
    // Builds a list of objects containing service name as _id and its configuration status                         // 481
    var services = _.map(names, function(name){                                                                     // 482
        return {                                                                                                    // 483
            _id : name,                                                                                             // 484
            configured: _.contains(configuredServices, name),                                                       // 485
        };                                                                                                          // 486
    });                                                                                                             // 487
                                                                                                                    // 488
    // Checks whether there is a UI to configure services...                                                        // 489
    // XXX: this only works with the accounts-ui package                                                            // 490
    var showUnconfigured = typeof Accounts._loginButtonsSession !== "undefined";                                    // 491
                                                                                                                    // 492
    // Filters out unconfigured services in case they"re not to be displayed                                        // 493
    if (!showUnconfigured){                                                                                         // 494
        services = _.filter(services, function(service){                                                            // 495
            return service.configured;                                                                              // 496
        });                                                                                                         // 497
    }                                                                                                               // 498
                                                                                                                    // 499
    // Sorts services by name                                                                                       // 500
    services = _.sortBy(services, function(service){                                                                // 501
        return service._id;                                                                                         // 502
    });                                                                                                             // 503
                                                                                                                    // 504
    return services;                                                                                                // 505
};                                                                                                                  // 506
                                                                                                                    // 507
AT.prototype.removeField = function(fieldId) {                                                                      // 508
    // Fields can be removed only before initialization                                                             // 509
    if (this._initialized)                                                                                          // 510
        throw new Error("AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!");  // 511
    // Tries to look up the field with given _id                                                                    // 512
    var index = _.indexOf(_.pluck(this._fields, "_id"), fieldId);                                                   // 513
    if (index !== -1)                                                                                               // 514
        return this._fields.splice(index, 1)[0];                                                                    // 515
    else                                                                                                            // 516
        if (!(Meteor.isServer && _.contains(this.SPECIAL_FIELDS, fieldId)))                                         // 517
            throw new Error("A field called " + fieldId + " does not exist!");                                      // 518
};                                                                                                                  // 519
                                                                                                                    // 520
AT.prototype.setupRoutes = function() {                                                                             // 521
    if (Meteor.isServer){                                                                                           // 522
        // Possibly prints a warning in case showForgotPasswordLink is set to true but the route is not configured  // 523
        if (AccountsTemplates.options.showForgotPasswordLink && !("forgotPwd" in  AccountsTemplates.routes))        // 524
            console.warn("[AccountsTemplates] WARNING: showForgotPasswordLink set to true, but forgotPwd route is not configured!");
        // Configures "reset password" email link                                                                   // 526
        if ("resetPwd" in AccountsTemplates.routes){                                                                // 527
            var resetPwdPath = AccountsTemplates.routes["resetPwd"].path.substr(1);                                 // 528
            Accounts.urls.resetPassword = function(token){                                                          // 529
                return Meteor.absoluteUrl(resetPwdPath + "/" + token);                                              // 530
            };                                                                                                      // 531
        }                                                                                                           // 532
        // Configures "enroll account" email link                                                                   // 533
        if ("enrollAccount" in AccountsTemplates.routes){                                                           // 534
            var enrollAccountPath = AccountsTemplates.routes["enrollAccount"].path.substr(1);                       // 535
            Accounts.urls.enrollAccount = function(token){                                                          // 536
                return Meteor.absoluteUrl(enrollAccountPath + "/" + token);                                         // 537
            };                                                                                                      // 538
        }                                                                                                           // 539
        // Configures "verify email" email link                                                                     // 540
        if ("verifyEmail" in AccountsTemplates.routes){                                                             // 541
            var verifyEmailPath = AccountsTemplates.routes["verifyEmail"].path.substr(1);                           // 542
            Accounts.urls.verifyEmail = function(token){                                                            // 543
                return Meteor.absoluteUrl(verifyEmailPath + "/" + token);                                           // 544
            };                                                                                                      // 545
        }                                                                                                           // 546
    }                                                                                                               // 547
                                                                                                                    // 548
    // Determines the default layout to be used in case no specific one is specified for single routes              // 549
    var defaultLayout = AccountsTemplates.options.defaultLayout || Router.options.layoutTemplate;                   // 550
                                                                                                                    // 551
    _.each(AccountsTemplates.routes, function(options, route){                                                      // 552
        if (route === "ensureSignedIn")                                                                             // 553
            return;                                                                                                 // 554
        if (route === "changePwd" && !AccountsTemplates.options.enablePasswordChange)                               // 555
            throw new Error("changePwd route configured but enablePasswordChange set to false!");                   // 556
        if (route === "forgotPwd" && !AccountsTemplates.options.showForgotPasswordLink)                             // 557
            throw new Error("forgotPwd route configured but showForgotPasswordLink set to false!");                 // 558
        if (route === "signUp" && AccountsTemplates.options.forbidClientAccountCreation)                            // 559
            throw new Error("signUp route configured but forbidClientAccountCreation set to true!");                // 560
        // Possibly prints a warning in case the MAIL_URL environment variable was not set                          // 561
        if (Meteor.isServer && route === "forgotPwd" && (!process.env.MAIL_URL || ! Package["email"])){             // 562
            console.warn("[AccountsTemplates] WARNING: showForgotPasswordLink set to true, but MAIL_URL is not configured!");
        }                                                                                                           // 564
                                                                                                                    // 565
        var name = options.name; // Default provided...                                                             // 566
        var path = options.path; // Default provided...                                                             // 567
        var template = options.template || "fullPageAtForm";                                                        // 568
        var layoutTemplate = options.layoutTemplate || defaultLayout;                                               // 569
                                                                                                                    // 570
        // Possibly adds token parameter                                                                            // 571
        if (_.contains(["enrollAccount", "resetPwd", "verifyEmail"], route)){                                       // 572
            path += "/:paramToken";                                                                                 // 573
            if (route === "verifyEmail")                                                                            // 574
                Router.route(path, {                                                                                // 575
                    name: name,                                                                                     // 576
                    template: template,                                                                             // 577
                    layoutTemplate: layoutTemplate,                                                                 // 578
                    onRun: function() {                                                                             // 579
                        AccountsTemplates.setState(route);                                                          // 580
                        AccountsTemplates.setDisabled(true);                                                        // 581
                        var token = this.params.paramToken;                                                         // 582
                        Accounts.verifyEmail(token, function(error){                                                // 583
                            AccountsTemplates.setDisabled(false);                                                   // 584
                            AccountsTemplates.submitCallback(error, route, function(){                              // 585
                                AccountsTemplates.state.form.set("result", AccountsTemplates.texts.info.emailVerified);
                            });                                                                                     // 587
                        });                                                                                         // 588
                                                                                                                    // 589
                        this.next();                                                                                // 590
                    },                                                                                              // 591
                    onStop: function() {                                                                            // 592
                        AccountsTemplates.clearState();                                                             // 593
                    },                                                                                              // 594
                });                                                                                                 // 595
            else                                                                                                    // 596
                Router.route(path, {                                                                                // 597
                    name: name,                                                                                     // 598
                    template: template,                                                                             // 599
                    layoutTemplate: layoutTemplate,                                                                 // 600
                    onRun: function() {                                                                             // 601
                        AccountsTemplates.paramToken = this.params.paramToken;                                      // 602
                        this.next();                                                                                // 603
                    },                                                                                              // 604
                    onBeforeAction: function() {                                                                    // 605
                        AccountsTemplates.setState(route);                                                          // 606
                        this.next();                                                                                // 607
                    },                                                                                              // 608
                    onStop: function() {                                                                            // 609
                        AccountsTemplates.clearState();                                                             // 610
                        AccountsTemplates.paramToken = null;                                                        // 611
                    }                                                                                               // 612
                });                                                                                                 // 613
        }                                                                                                           // 614
        else                                                                                                        // 615
            Router.route(path, {                                                                                    // 616
                name: name,                                                                                         // 617
                template: template,                                                                                 // 618
                layoutTemplate: layoutTemplate,                                                                     // 619
                onBeforeAction: function() {                                                                        // 620
                    if(Meteor.user() && route != 'changePwd')                                                       // 621
                        AccountsTemplates.postSubmitRedirect(route);                                                // 622
                    else                                                                                            // 623
                        AccountsTemplates.setState(route);                                                          // 624
                    this.next();                                                                                    // 625
                },                                                                                                  // 626
                onStop: function() {                                                                                // 627
                    AccountsTemplates.clearState();                                                                 // 628
                }                                                                                                   // 629
            });                                                                                                     // 630
    });                                                                                                             // 631
};                                                                                                                  // 632
                                                                                                                    // 633
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/useraccounts:core/lib/server.js                                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
// Initialization                                                                                                   // 1
                                                                                                                    // 2
AT.prototype.init = function() {                                                                                    // 3
    console.warn("[AccountsTemplates] There is no more need to call AccountsTemplates.init()! Simply remove the call ;-)");
};                                                                                                                  // 5
                                                                                                                    // 6
AT.prototype._init = function() {                                                                                   // 7
    if (this._initialized)                                                                                          // 8
        return;                                                                                                     // 9
                                                                                                                    // 10
    // Checks there is at least one account service installed                                                       // 11
    if (!Package["accounts-password"] && (!Accounts.oauth || Accounts.oauth.serviceNames().length === 0))           // 12
        throw Error("AccountsTemplates: You must add at least one account service!");                               // 13
                                                                                                                    // 14
    // A password field is strictly required                                                                        // 15
    var password = this.getField("password");                                                                       // 16
    if (!password)                                                                                                  // 17
        throw Error("A password field is strictly required!");                                                      // 18
    if (password.type !== "password")                                                                               // 19
        throw Error("The type of password field should be password!");                                              // 20
                                                                                                                    // 21
    // Then we can have "username" or "email" or even both of them                                                  // 22
    // but at least one of the two is strictly required                                                             // 23
    var username = this.getField("username");                                                                       // 24
    var email = this.getField("email");                                                                             // 25
    if (!username && !email)                                                                                        // 26
        throw Error("At least one field out of username and email is strictly required!");                          // 27
    if (username && !username.required)                                                                             // 28
        throw Error("The username field should be required!");                                                      // 29
    if (email){                                                                                                     // 30
        if (email.type !== "email")                                                                                 // 31
            throw Error("The type of email field should be email!");                                                // 32
        if (username){                                                                                              // 33
            // username and email                                                                                   // 34
            if (username.type !== "text")                                                                           // 35
                throw Error("The type of username field should be text when email field is present!");              // 36
        }else{                                                                                                      // 37
            // email only                                                                                           // 38
            if (!email.required)                                                                                    // 39
                throw Error("The email field should be required when username is not present!");                    // 40
        }                                                                                                           // 41
    }                                                                                                               // 42
    else{                                                                                                           // 43
        // username only                                                                                            // 44
        if (username.type !== "text" && username.type !== "tel")                                                    // 45
            throw Error("The type of username field should be text or tel!");                                       // 46
    }                                                                                                               // 47
                                                                                                                    // 48
    // Possibly publish more user data in order to be able to show add/remove                                       // 49
    // buttons for 3rd-party services                                                                               // 50
    if (this.options.showAddRemoveServices){                                                                        // 51
        // Publish additional current user info to get the list of registered services                              // 52
        // XXX TODO:                                                                                                // 53
        // ...adds only user.services.*.id                                                                          // 54
        Meteor.publish("userRegisteredServices", function() {                                                       // 55
            var userId = this.userId;                                                                               // 56
            return Meteor.users.find(userId, {fields: {services: 1}});                                              // 57
            /*                                                                                                      // 58
            if (userId){                                                                                            // 59
                var user = Meteor.users.findOne(userId);                                                            // 60
                var services_id = _.chain(user.services)                                                            // 61
                    .keys()                                                                                         // 62
                    .reject(function(service){return service === "resume";})                                        // 63
                    .map(function(service){return "services." + service + ".id";})                                  // 64
                    .value();                                                                                       // 65
                var projection = {};                                                                                // 66
                _.each(services_id, function(key){projection[key] = 1;});                                           // 67
                return Meteor.users.find(userId, {fields: projection});                                             // 68
            }                                                                                                       // 69
            */                                                                                                      // 70
        });                                                                                                         // 71
    }                                                                                                               // 72
                                                                                                                    // 73
    // Security stuff                                                                                               // 74
    if (this.options.overrideLoginErrors){                                                                          // 75
        Accounts.validateLoginAttempt(function(attempt){                                                            // 76
            if (attempt.error){                                                                                     // 77
                var reason = attempt.error.reason;                                                                  // 78
                if (reason === "User not found" || reason === "Incorrect password")                                 // 79
                    throw new Meteor.Error(403, "Login forbidden");                                                 // 80
            }                                                                                                       // 81
            return attempt.allowed;                                                                                 // 82
        });                                                                                                         // 83
    }                                                                                                               // 84
                                                                                                                    // 85
    if (this.options.sendVerificationEmail && this.options.enforceEmailVerification){                               // 86
        Accounts.validateLoginAttempt(function(info){                                                               // 87
            if (info.type !== "password" || info.methodName !== "login")                                            // 88
                return true;                                                                                        // 89
            var user = info.user;                                                                                   // 90
            if (!user)                                                                                              // 91
                return true;                                                                                        // 92
            var ok = true;                                                                                          // 93
            var loginEmail = info.methodArguments[0].user.email;                                                    // 94
            if (loginEmail){                                                                                        // 95
              var email = _.filter(user.emails, function(obj){                                                      // 96
                  return obj.address === loginEmail;                                                                // 97
              });                                                                                                   // 98
              if (!email.length || !email[0].verified)                                                              // 99
                  ok = false;                                                                                       // 100
            }                                                                                                       // 101
            else {                                                                                                  // 102
              // we got the username, lets check there's at lease one verified email                                // 103
              var emailVerified = _.chain(user.emails)                                                              // 104
                .pluck('verified')                                                                                  // 105
                .any()                                                                                              // 106
                .value();                                                                                           // 107
              if (!emailVerified)                                                                                   // 108
                ok = false;                                                                                         // 109
            }                                                                                                       // 110
            if (!ok)                                                                                                // 111
              throw new Meteor.Error(401, "Please verify your email first. Check the email and follow the link!" ); // 112
            return true;                                                                                            // 113
        });                                                                                                         // 114
    }                                                                                                               // 115
                                                                                                                    // 116
    // ------------                                                                                                 // 117
    // Server-Side Routes Definition                                                                                // 118
    //                                                                                                              // 119
    //   this allows for server-side iron-router usage, like, e.g.                                                  // 120
    //   Router.map(function(){                                                                                     // 121
    //       this.route("fullPageSigninForm", {                                                                     // 122
    //           path: "*",                                                                                         // 123
    //           where: "server"                                                                                    // 124
    //           action: function() {                                                                               // 125
    //               this.response.statusCode = 404;                                                                // 126
    //               return this.response.end(Handlebars.templates["404"]());                                       // 127
    //           }                                                                                                  // 128
    //       });                                                                                                    // 129
    //   })                                                                                                         // 130
    // ------------                                                                                                 // 131
    AccountsTemplates.setupRoutes();                                                                                // 132
                                                                                                                    // 133
    // Marks AccountsTemplates as initialized                                                                       // 134
    this._initialized = true;                                                                                       // 135
};                                                                                                                  // 136
                                                                                                                    // 137
AccountsTemplates = new AT();                                                                                       // 138
                                                                                                                    // 139
                                                                                                                    // 140
// Client side account creation is disabled by default:                                                             // 141
// the methos ATCreateUserServer is used instead!                                                                   // 142
// to actually disable client side account creation use:                                                            // 143
//                                                                                                                  // 144
//    AccountsTemplates.config({                                                                                    // 145
//        forbidClientAccountCreation: true                                                                         // 146
//    });                                                                                                           // 147
Accounts.config({                                                                                                   // 148
    forbidClientAccountCreation: true                                                                               // 149
});                                                                                                                 // 150
                                                                                                                    // 151
                                                                                                                    // 152
// Initialization                                                                                                   // 153
Meteor.startup(function(){                                                                                          // 154
    AccountsTemplates._init();                                                                                      // 155
});                                                                                                                 // 156
                                                                                                                    // 157
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/useraccounts:core/lib/methods.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
                                                                                                                    // 1
Meteor.methods({                                                                                                    // 2
    ATRemoveService: function(service_name){                                                                        // 3
        var userId = this.userId;                                                                                   // 4
        if (userId){                                                                                                // 5
            var user = Meteor.users.findOne(userId);                                                                // 6
            var numServices = _.keys(user.services).length; // including "resume"                                   // 7
            if (numServices === 2)                                                                                  // 8
                throw new Meteor.Error(403, "Cannot remove the only active service!", {});                          // 9
            var unset = {};                                                                                         // 10
            unset["services." + service_name] = "";                                                                 // 11
            Meteor.users.update(userId, {$unset: unset});                                                           // 12
        }                                                                                                           // 13
    },                                                                                                              // 14
});                                                                                                                 // 15
                                                                                                                    // 16
                                                                                                                    // 17
if (Meteor.isServer) {                                                                                              // 18
    Meteor.methods({                                                                                                // 19
        ATCreateUserServer: function(options){                                                                      // 20
            if (AccountsTemplates.options.forbidClientAccountCreation)                                              // 21
                throw new Meteor.Error(403, "Client side accounts creation is disabled!!!");                        // 22
            // createUser() does more checking.                                                                     // 23
            check(options, Object);                                                                                 // 24
            var allFieldIds = AccountsTemplates.getFieldIds();                                                      // 25
            // Picks-up whitelisted fields for profile                                                              // 26
            var profile = options.profile;                                                                          // 27
            profile = _.pick(profile, allFieldIds);                                                                 // 28
            profile = _.omit(profile, "username", "email", "password");                                             // 29
            // Validates fields" value                                                                              // 30
            var signupInfo = _.clone(profile);                                                                      // 31
            if (options.username)                                                                                   // 32
                signupInfo.username = options.username;                                                             // 33
            if (options.email)                                                                                      // 34
                signupInfo.email = options.email;                                                                   // 35
            if (options.password)                                                                                   // 36
                signupInfo.password = options.password;                                                             // 37
            var validationErrors = {};                                                                              // 38
            var someError = false;                                                                                  // 39
                                                                                                                    // 40
            // Validates fields values                                                                              // 41
            _.each(AccountsTemplates.getFields(), function(field){                                                  // 42
                var fieldId = field._id;                                                                            // 43
                var value = signupInfo[fieldId];                                                                    // 44
                if (fieldId === "password"){                                                                        // 45
                    // Can"t Pick-up password here                                                                  // 46
                    // NOTE: at this stage the password is already encripted,                                       // 47
                    //       so there is no way to validate it!!!                                                   // 48
                    check(value, Object);                                                                           // 49
                    return;                                                                                         // 50
                }                                                                                                   // 51
                var validationErr = field.validate(value, "strict");                                                // 52
                if (validationErr) {                                                                                // 53
                    validationErrors[fieldId] = validationErr;                                                      // 54
                    someError = true;                                                                               // 55
                }                                                                                                   // 56
            });                                                                                                     // 57
            if (someError)                                                                                          // 58
                throw new Meteor.Error(403, "Validation Errors", validationErrors);                                 // 59
                                                                                                                    // 60
            // Possibly removes the profile field                                                                   // 61
            if (_.isEmpty(options.profile))                                                                         // 62
                delete options.profile;                                                                             // 63
                                                                                                                    // 64
            // Create user. result contains id and token.                                                           // 65
            var userId = Accounts.createUser(options);                                                              // 66
            // safety belt. createUser is supposed to throw on error. send 500 error                                // 67
            // instead of sending a verification email with empty userid.                                           // 68
            if (! userId)                                                                                           // 69
                throw new Error("createUser failed to insert new user");                                            // 70
                                                                                                                    // 71
            // Send a email address verification email in case the context permits it                               // 72
            // and the specific configuration flag was set to true                                                  // 73
            if (options.email && AccountsTemplates.options.sendVerificationEmail)                                   // 74
                Accounts.sendVerificationEmail(userId, options.email);                                              // 75
        },                                                                                                          // 76
    });                                                                                                             // 77
}                                                                                                                   // 78
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['useraccounts:core'] = {
  AccountsTemplates: AccountsTemplates
};

})();

//# sourceMappingURL=useraccounts_core.js.map
