(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var KadiraBinaryDeps;

(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/meteorhacks:kadira-binary-deps/index.js                  //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
KadiraBinaryDeps = {};                                               // 1
KadiraBinaryDeps.require = function(module) {                        // 2
  return Npm.require(module);                                        // 3
};                                                                   // 4
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['meteorhacks:kadira-binary-deps'] = {
  KadiraBinaryDeps: KadiraBinaryDeps
};

})();

//# sourceMappingURL=meteorhacks_kadira-binary-deps.js.map
