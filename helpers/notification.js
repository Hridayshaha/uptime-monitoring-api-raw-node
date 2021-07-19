/*
 *
 * Title: Notification LIbrary
 * Description: Important function about to notification.
 * Author: Hriday Shaha
 * Date: 9-July-2020
 *
 */
// Dependencies
const https = require('https');
const querystring = require('querystring');
const { twilio } = require('./environment');
// Module Scaffolding
const notification = {};

// Send SMS to user using Twillo API
notification.sendTwilioSms = (phone, msg, callback) => {
    // Input Validation
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;

    if (userPhone && userMsg) {
        // Configure The Request Payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // Stringify the Payload
        const stringifyPayload = querystring.stringify(payload);
        console.log(stringifyPayload);

        // Configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth: `${twilio.accountSid}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // Get the status code
            const status = res.statusCode;

            // Callback sucees
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                console.log(requestDetails);
                callback(`Status code returned was  ${status}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Phone or Message are required');
    }
};

// Module Export
module.exports = notification;
