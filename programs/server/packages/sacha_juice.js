(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var juice;

(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/sacha:juice/lib/juice.js                                 //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
juice = Npm.require('juice');                                        // 1
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['sacha:juice'] = {
  juice: juice
};

})();

//# sourceMappingURL=sacha_juice.js.map
