/*
 *
 * Title: Worker files
 * Description: This is the initial worker file of the application
 * Author: Hriday Shaha
 * Date: 5-July-2021
 *
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { sendTwilioSms } = require('../helpers/notification');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');

// Module Scafolding
const workers = {};

// Lookup all the checks .
workers.gatherAllChecks = () => {
    // get all the checks
    data.list('checks', (err1, checks) => {
        if (!err1 && checks) {
            checks.forEach((check) => {
                // read the checkData
                data.read('checks', check, (err2, originalCheckData) => {
                    if (!err2 && originalCheckData) {
                        // pass the data to the check validator
                        workers.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the checks data!');
                    }
                });
            });
        } else {
            console.log('Error: could not find any checks to process!');
        }
    });
};

// Validate indivisual check data
workers.validateCheckData = (originalCheckData) => {
    const orginalData = originalCheckData;
    if (originalCheckData && originalCheckData.checkId) {
        orginalData.state =
            typeof originalCheckData === 'string' &&
            ['up', 'down'].indexOf(originalCheckData.state) > -1
                ? originalCheckData.state
                : 'down';

        orginalData.lastChecked =
            typeof originalCheckData === 'number' && originalCheckData.lastCheck > 0
                ? originalCheckData.lastChecked
                : false;

        // Pass to the next process
        workers.performCheck(orginalData);
    } else {
        console.log('Error: Check was invalid or no properly formated.');
    }
};

// Perform Check
workers.performCheck = (orginalData) => {
    // Prepare the check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    // Mark the ourcome has not been send yet
    let outcomeSent = false;

    // Parse the hostname & full url form orginal data
    const parsedUrl = url.parse(`${orginalData.protocol}://${orginalData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // Construc the request object
    const requestDetails = {
        protocol: `${orginalData.protocol}:`,
        hostname: hostName,
        method: orginalData.method.toUpperCase(),
        path,
        timeout: orginalData.timeoutSeconds * 1000,
    };
    const protocolToUse = orginalData.protocol === 'http' ? http : https;
    const req = protocolToUse.request(requestDetails, (res) => {
        // Get the status code
        const status = res.statusCode;

        // Update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcomeSent) {
            workers.processCheckOutcome(orginalData, checkOutCome);
            outcomeSent = true;
        }
    });

    // Res Error handing
    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };

        if (!outcomeSent) {
            workers.processCheckOutcome(orginalData, checkOutCome);
            outcomeSent = true;
        }
    });
    // Response Time out -
    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        if (!outcomeSent) {
            workers.processCheckOutcome(orginalData, checkOutCome);
            outcomeSent = true;
        }
    });

    // Req End
    req.end();
};

// Process check function
workers.processCheckOutcome = (orginalData, checkOutCome) => {
    // Check outcome is up or down
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        orginalData.sucessCode.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    // Decide wheather we should alert the user
    const alertWanted = !!(orginalData.lastChecked && orginalData.state !== state);

    // Update the check orginalData
    const newCheckData = orginalData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // Update data to disk
    data.update('checks', newCheckData.checkId, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // Send the checkdata to next process
                workers.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed status not changed yet.');
            }
        } else {
            console.log('error: Error to save the data');
        }
    });
};

// Send notification sms to user if state changed
workers.alertUserToStatusChange = (newcheckData) => {
    const msg = `Alert: Your check for ${newcheckData.method.toUpperCase()} Method , Url ${
        newcheckData.protocol
    }://${newcheckData.url} is currently ${newcheckData.state}`;

    sendTwilioSms(newcheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was laerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was an error sending the SMS.');
        }
    });
};

// Loop the whole file after 1 minutes
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// Module Functions
workers.init = () => {
    // Gather all data
    workers.gatherAllChecks();
    // Loop the gather data after 1 minutes
    workers.loop();
};

// export
module.exports = workers;
