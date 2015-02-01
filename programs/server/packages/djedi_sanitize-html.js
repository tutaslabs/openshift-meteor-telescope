(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var sanitizeHtml;

(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/djedi:sanitize-html/sanitize-html.js                     //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
sanitizeHtml = Npm.require('sanitize-html');                         // 1
                                                                     // 2
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['djedi:sanitize-html'] = {
  sanitizeHtml: sanitizeHtml
};

})();

//# sourceMappingURL=djedi_sanitize-html.js.map
