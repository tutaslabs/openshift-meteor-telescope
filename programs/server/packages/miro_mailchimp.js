(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var MailChimp;

(function () {

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/miro:mailchimp/lib/server/mailchimp.js                           //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
var getSettingsValueFor = function ( key ) {                                 // 1
		if (                                                                       // 2
			Meteor.settings &&                                                        // 3
			Meteor.settings.private &&                                                // 4
			Meteor.settings.private.MailChimp                                         // 5
		) {                                                                        // 6
			return Meteor.settings.private.MailChimp[key];                            // 7
		}                                                                          // 8
	};                                                                          // 9
                                                                             // 10
MailChimp = function ( apiKey, options ) {                                   // 11
	var mailChimpOptions = {                                                    // 12
			'apiKey' : apiKey || getSettingsValueFor( 'apiKey' ),                     // 13
			'options': options || {                                                   // 14
				'version': '2.0'	// Living on The Edge ;)                                // 15
			}                                                                         // 16
		},                                                                         // 17
                                                                             // 18
		mailChimp;                                                                 // 19
                                                                             // 20
                                                                             // 21
	if ( !mailChimpOptions.apiKey || mailChimpOptions.apiKey === '' ) {         // 22
		console.error( '[MailChimp] Error: No API Key defined!' );                 // 23
                                                                             // 24
		throw new Meteor.Error(                                                    // 25
			'1337',                                                                   // 26
			'No API Key defined',                                                     // 27
			'Define your API Key either in settings.json file or in a method call'    // 28
		);                                                                         // 29
	}                                                                           // 30
                                                                             // 31
	mailChimp = Npm.require( 'mailchimp' );                                     // 32
                                                                             // 33
	this._asyncAPI = mailChimp.MailChimpAPI(                                    // 34
		mailChimpOptions.apiKey,                                                   // 35
		mailChimpOptions.options                                                   // 36
	);                                                                          // 37
};                                                                           // 38
                                                                             // 39
MailChimp.prototype.call = function ( section, method, options, callback ) { // 40
	var wrapped = Meteor.wrapAsync( this._asyncAPI.call, this._asyncAPI );      // 41
                                                                             // 42
	return wrapped( section, method, options );                                 // 43
};                                                                           // 44
                                                                             // 45
Meteor.methods({                                                             // 46
	'MailChimp': function ( clientOptions, section, method, options ) {         // 47
		var mailChimp;                                                             // 48
                                                                             // 49
		try {                                                                      // 50
			mailChimp = new MailChimp( clientOptions.apiKey, clientOptions.options ); // 51
		} catch ( error ) {                                                        // 52
			throw new Meteor.Error( error.error, error.reason, error.details );       // 53
		}                                                                          // 54
                                                                             // 55
		options = options || {};                                                   // 56
                                                                             // 57
		switch ( section ) {                                                       // 58
			case 'lists':                                                             // 59
				if ( !options.id || options.id === '' ) {                                // 60
					options.id = getSettingsValueFor( 'listId' );                           // 61
				}                                                                        // 62
				break;                                                                   // 63
			default:                                                                  // 64
		}                                                                          // 65
                                                                             // 66
		return mailChimp.call( section, method, options );                         // 67
	}                                                                           // 68
});                                                                          // 69
                                                                             // 70
///////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['miro:mailchimp'] = {
  MailChimp: MailChimp
};

})();

//# sourceMappingURL=miro_mailchimp.js.map
