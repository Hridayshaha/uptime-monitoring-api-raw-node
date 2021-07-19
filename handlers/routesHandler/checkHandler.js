/* eslint-disable no-underscore-dangle */
/*
 *
 * Title: Check Handle Route
 * Description: User defined check handle route
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */
// Dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environment');

// Module Scafolding
const handler = {};

// main function
handler.checkHandler = (requestObject, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestObject.method) > -1) {
        handler._check[requestObject.method](requestObject, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestObject, callback) => {
    const protocol =
        typeof requestObject.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestObject.body.protocol) > -1
            ? requestObject.body.protocol
            : false;

    const url =
        typeof requestObject.body.url === 'string' && requestObject.body.url.trim().length > 0
            ? requestObject.body.url
            : false;

    const method =
        typeof requestObject.body.method === 'string' &&
        ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestObject.body.method) > -1
            ? requestObject.body.method
            : false;

    const sucessCode =
        typeof requestObject.body.sucessCode === 'object' &&
        requestObject.body.sucessCode instanceof Array
            ? requestObject.body.sucessCode
            : false;

    const timeoutSeconds =
        typeof requestObject.body.timeoutSeconds === 'number' &&
        requestObject.body.timeoutSeconds % 1 === 0 &&
        requestObject.body.timeoutSeconds >= 1 &&
        requestObject.body.timeoutSeconds <= 5
            ? requestObject.body.timeoutSeconds
            : false;

    console.log(protocol, url, sucessCode, timeoutSeconds, method);
    if (protocol && url && method && sucessCode && timeoutSeconds) {
        const token =
            typeof requestObject.headerObject.token === 'string'
                ? requestObject.headerObject.token
                : false;

        // Read the userPhone number by Token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const tokenObject = parseJSON(tokenData);
                const userPhone = tokenObject.phone;

                // Read User Data by Phone number
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                    userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        checkId,
                                        protocol,
                                        url,
                                        method,
                                        sucessCode,
                                        timeoutSeconds,
                                        userPhone,
                                    };

                                    // Create a file in checks folder and save id with its id
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // Add check id to the user object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // Save the user object with new item
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, { error: 'Server side error' });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was an problem in server . ',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User is already reached max check limit',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication Failure !',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'user not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Token Authentication Error !',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request..',
        });
    }
};

handler._check.get = (requestObject, callback) => {
    const id =
        typeof requestObject.queryObject.id === 'string' ? requestObject.queryObject.id : false;

    if (id) {
        // Read the check data using this id
        data.read('checks', id, (err, checksData) => {
            if (!err && checksData) {
                const token =
                    typeof requestObject.headerObject.token === 'string'
                        ? requestObject.headerObject.token
                        : false;
                const checkObject = JSON.parse(checksData);
                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, checkObject);
                    } else {
                        callback(403, { error: 'Authentication Failure Token not verify' });
                    }
                });
            } else {
                callback(500, { error: 'Server side error' });
            }
        });
    } else {
        callback(400, {
            error: 'Your provided is not found.',
        });
    }
};

handler._check.put = (requestObject, callback) => {
    const id =
        typeof requestObject.queryObject.id === 'string' &&
        requestObject.queryObject.id.trim().length === 20
            ? requestObject.queryObject.id
            : false;

    // Validate Input
    const protocol =
        typeof requestObject.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestObject.body.protocol) > -1
            ? requestObject.body.protocol
            : false;

    const url =
        typeof requestObject.body.url === 'string' && requestObject.body.url.trim().length > 0
            ? requestObject.body.url
            : false;

    const method =
        typeof requestObject.body.method === 'string' &&
        ['POST', 'GET', 'PUT', 'DELETE'].indexOf(requestObject.body.method) > -1
            ? requestObject.body.method
            : false;

    const sucessCode =
        typeof requestObject.body.sucessCode === 'object' &&
        requestObject.body.sucessCode instanceof Array
            ? requestObject.body.sucessCode
            : false;

    const timeoutSeconds =
        typeof requestObject.body.timeoutSeconds === 'number' &&
        requestObject.body.timeoutSeconds % 1 === 0 &&
        requestObject.body.timeoutSeconds >= 1 &&
        requestObject.body.timeoutSeconds <= 5
            ? requestObject.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || sucessCode || timeoutSeconds) {
            // Read the Data
            data.read('checks', id, (err1, checksData) => {
                if (!err1 && checksData) {
                    const checksObject = parseJSON(checksData);
                    const token =
                        typeof requestObject.headerObject.token === 'string'
                            ? requestObject.headerObject.token
                            : false;

                    tokenHandler._token.verify(token, checksObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checksObject.protocol = protocol;
                            }

                            if (url) {
                                checksObject.url = url;
                            }

                            if (method) {
                                checksObject.method = method;
                            }

                            if (sucessCode) {
                                checksObject.sucessCode = sucessCode;
                            }

                            if (timeoutSeconds) {
                                checksObject.timeoutSeconds = timeoutSeconds;
                            }

                            // Update the file
                            data.update('checks', id, checksObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, { error: 'Sever side problem' });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication of Token failed' });
                        }
                    });
                } else {
                    callback(500, { error: 'Sever side problem' });
                }
            });
        } else {
            callback(400, { error: 'Update atleast one thing' });
        }
    } else {
        callback(400, { error: 'Provided id is not valid' });
    }
};

handler._check.delete = (requestObject, callback) => {
    const id =
        typeof requestObject.queryObject.id === 'string' &&
        requestObject.queryObject.id.trim().length === 20
            ? requestObject.queryObject.id
            : false;

    if (id) {
        // Read the file
        data.read('checks', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const checkObject = parseJSON(checkData);
                const token =
                    typeof requestObject.headerObject.token === 'string'
                        ? requestObject.headerObject.token
                        : false;

                tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Date the file
                        data.delete('checks', id, (err2) => {
                            if (!err2) {
                                data.read('users', checkObject.userPhone, (err3, userData) => {
                                    if (!err3) {
                                        const userObject = parseJSON(userData);
                                        const userChecks =
                                            typeof userObject.checks === 'object' &&
                                            userObject.checks instanceof Array
                                                ? userObject.checks
                                                : [];

                                        // Demove the deltected id from
                                        const checkPosition = userObject.checks.indexOf(id);
                                        userChecks.splice(checkPosition, 1);

                                        data.update(
                                            'users',
                                            userObject.phone,
                                            userObject,
                                            (err4) => {
                                                if (!err4) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {
                                                        error: 'Problem in Server Side',
                                                    });
                                                }
                                                // eslint-disable-next-line prettier/prettier
                                            },
                                        );
                                    } else {
                                        callback(500, { error: 'Problem in Server Side' });
                                    }
                                });
                            } else {
                                callback(500, { error: 'Problem in Server Side' });
                            }
                        });
                    } else {
                        callback(403, { error: 'Token Authentication Error' });
                    }
                });
            } else {
                callback(500, { error: 'Problem in Server Side' });
            }
        });
    } else {
        callback(403, { error: 'Problem in your request' });
    }
};

// Module Export
module.exports = handler;
