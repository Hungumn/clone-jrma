const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const SENDGRID_API_KEY =
	'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';
exports.handler = async (event) => {
	let verificationCode = '';

	sgMail.setApiKey(SENDGRID_API_KEY);
	verificationCode = crypto.randomInt(0, 1000000).toString().padStart(6, '0');

	console.log('asdasd', event.request.session, verificationCode);
	if (event.request.session.length === 2) {
		const msg = {
			to: [event.request.userAttributes['email']],
			from: 'bjm-jmra@benjamin.co.jp',
			subject: 'Sending ',
			text: 'Your password for secure login is ' + verificationCode,
		};
		try {
			const response = await sgMail.send(msg);
			console.log(response);
		} catch (e) {
			console.log('sendgrid e', e);
		}
	} else {
		console.log('else');
		//if the user makes a mistake, we utilize the verification code from the previous session so that the user can retry.
		const previousChallenge = event.request.session.slice(-1)[0];
		verificationCode = previousChallenge.challengeMetadata;
	}

	//add to privateChallengeParameters. This will be used by verify auth lambda.
	console.log(verificationCode);
	event.response.privateChallengeParameters = {
		verificationCode: verificationCode,
	};

	//add it to session, so its available during the next invocation.
	event.response.challengeMetadata = verificationCode;

	return event;
};
