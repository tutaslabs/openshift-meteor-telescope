(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var CryptoJS = Package['jparker:crypto-core'].CryptoJS;

/* Package-scope variables */
var Gravatar;

(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/jparker:gravatar/gravatar.js                                       //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
/* global Gravatar, CryptoJS, _ */                                             // 1
Gravatar = {                                                                   // 2
                                                                               // 3
	/**                                                                           // 4
	 * `cleantString` remove starting and trailing whitespaces                    // 5
	 * and lowercase the input                                                    // 6
	 * @param  {String} string input string that may contain leading and trailing // 7
	 * whitespaces and uppercase letters                                          // 8
	 * @return {String}        output cleaned string                              // 9
	 */                                                                           // 10
	cleanString: function(string) {                                               // 11
		return string.trim().toLowerCase();                                          // 12
	},                                                                            // 13
                                                                               // 14
	/**                                                                           // 15
	 * `isHash` check if a string match the MD5 form :                            // 16
	 * 32 chars string containing letters from `a` to `f`                         // 17
	 * and digits from `0` to `9`                                                 // 18
	 * @param  {String}  string that might be a hash                              // 19
	 * @return {Boolean}                                                          // 20
	 */                                                                           // 21
	isHash: function(string) {                                                    // 22
		var self = this;                                                             // 23
		return /^[a-f0-9]{32}$/i.test(self.cleanString(string));                     // 24
	},                                                                            // 25
                                                                               // 26
	/**                                                                           // 27
	 * `hash` takes an input and run it through `CryptoJS.MD5`                    // 28
	 * @see https://atmospherejs.com/jparker/crypto-md5                           // 29
	 * @param  {String} string input string                                       // 30
	 * @return {String}        md5 hash of the input                              // 31
	 */                                                                           // 32
	hash: function(string) {                                                      // 33
		var self = this;                                                             // 34
		return CryptoJS.MD5(self.cleanString(string)).toString();                    // 35
	},                                                                            // 36
                                                                               // 37
	/**                                                                           // 38
	 * `imageUrl` will provide the url for the avatar, given an email or a hash   // 39
	 * and a set of options to be passed to the gravatar API                      // 40
	 * @see https://en.gravatar.com/site/implement/images/                        // 41
	 * @param  {String} emailOrHash email or pregenerated MD5 hash to query       // 42
	 * gravatar with.                                                             // 43
	 * @param  {Object} options     options to be passed to gravatar in the query // 44
	 * string. The `secure` will be used to determine which base url to use.      // 45
	 * @return {String}             complete url to the avatar                    // 46
	 */                                                                           // 47
	imageUrl: function(emailOrHash, options) {                                    // 48
		var self = this;                                                             // 49
		options = options || {};                                                     // 50
                                                                               // 51
		// Want HTTPS ?                                                              // 52
		var url = options.secure ?                                                   // 53
			'https://secure.gravatar.com/avatar/' :                                     // 54
			'http://www.gravatar.com/avatar/';                                          // 55
                                                                               // 56
		// Is it an MD5 already ?                                                    // 57
		if (self.isHash(emailOrHash)) {                                              // 58
			url += emailOrHash;                                                         // 59
		} else {                                                                     // 60
			url += self.hash(emailOrHash);                                              // 61
		}                                                                            // 62
                                                                               // 63
		delete options.secure;                                                       // 64
                                                                               // 65
		// Have any options to pass ?                                                // 66
		var params = _.map(options, function(val, key) {                             // 67
			return key + '=' + encodeURIComponent(val);                                 // 68
		}).join('&');                                                                // 69
                                                                               // 70
		if (params.length > 0) {                                                     // 71
			url += '?' + params;                                                        // 72
		}                                                                            // 73
                                                                               // 74
		return url;                                                                  // 75
	}                                                                             // 76
};                                                                             // 77
                                                                               // 78
/////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['jparker:gravatar'] = {
  Gravatar: Gravatar
};

})();

//# sourceMappingURL=jparker_gravatar.js.map
