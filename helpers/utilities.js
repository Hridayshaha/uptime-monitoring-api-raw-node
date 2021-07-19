/*
 *
 * Title: Utilities Function will added here
 * Description: All Utiliteis functions will add here .
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */
// Dependencies
const crypto = require('crypto');
const environment = require('./environment');

// Module Scafolding
const utilities = {};
// String to Json Conversion
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// Hasing or encripted dat
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', environment.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};

// Create Random String
utilities.createRandomString = (strLength) => {
    let length = strLength;
    length = typeof strLength === 'number' && strLength > 0 ? strLength : false;

    if (length) {
        const possibleCharacters = 'afhoiulkalkjdfoihwohkjsdhifhsdpow54wr54e8e454ss4748w48e';

        let output = '';

        for (let i = 0; i < length; i += 1) {
            const randomChar = possibleCharacters.charAt(
                // eslint-disable-next-line comma-dangle
                Math.floor(Math.random() * possibleCharacters.length)
            );

            output += randomChar;
        }

        return output;
    }
    return false;
};

// Module Export
module.exports = utilities;
