(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
// packages/npm-container/index.js                                                             //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                               //
  Meteor.npmRequire = function(moduleName) {                                             // 74 // 1
    var module = Npm.require(moduleName);                                                // 75 // 2
    return module;                                                                       // 76 // 3
  };                                                                                     // 77 // 4
                                                                                         // 78 // 5
  Meteor.require = function(moduleName) {                                                // 79 // 6
    console.warn('Meteor.require is deprecated. Please use Meteor.npmRequire instead!'); // 80 // 7
    return Meteor.npmRequire(moduleName);                                                // 81 // 8
  };                                                                                     // 82 // 9
/////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['npm-container'] = {};

})();

//# sourceMappingURL=npm-container.js.map
