/* eslint-disable operator-linebreak */
/*
 *
 * Title: Enivonment Object
 * Description: All enivonment variables added.
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */
// Dependencies

// Module Scafolding
const environment = {};

// Environment Variables
environment.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'sdlfjsjlfsdhsdfkjfhsdj',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15005550006',
        accountSid: 'ACebda70b48879258518e97185fb0d4ede',
        authToken: '06ddba4d3b3e10cf0230e08c071509f2',
    },
};

environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'sdlfjsjlfsdhsdfksdfsdfssfj',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15005550006',
        accountSid: 'ACebda70b48879258518e97185fb0d4ede',
        authToken: '06ddba4d3b3e10cf0230e08c071509f2',
    },
};
// Which Environment Variables Runs
const checkEnvVariables =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

const runEnvironment =
    typeof environment[checkEnvVariables] === 'object'
        ? environment[checkEnvVariables]
        : environment.staging;

// Export Current Environment Variables
module.exports = runEnvironment;
