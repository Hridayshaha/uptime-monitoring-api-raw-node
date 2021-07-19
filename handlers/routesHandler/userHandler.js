/* eslint-disable no-underscore-dangle */
/*
 *
 * Title: User Handle Route
 * Description: All Users route handle here
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */
// Dependencies
const data = require('../../lib/data');
const utilities = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
// const { token } = require('../../routes');

// Module Scafolding
const handler = {};

// main function
handler.userHandler = (requestObject, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestObject.method) > -1) {
        handler._user[requestObject.method](requestObject, callback);
    } else {
        callback(405);
    }
};

handler._user = {};

handler._user.post = (requestObject, callback) => {
    // eslint-disable-next-line prettier/prettier
    const firstName = typeof requestObject.body.firstName === 'string' && requestObject.body.firstName.trim().length > 0 ? requestObject.body.firstName : false;

    // eslint-disable-next-line prettier/prettier
    const lastName = typeof requestObject.body.lastName === 'string' && requestObject.body.lastName.trim().length > 0 ? requestObject.body.lastName : false;

    // eslint-disable-next-line prettier/prettier
    const phone = typeof requestObject.body.phone === 'string' && requestObject.body.phone.trim().length === 11 ? requestObject.body.phone : false;

    // eslint-disable-next-line prettier/prettier
    const password = typeof requestObject.body.password === 'string' && requestObject.body.password.trim().length > 0 ? requestObject.body.password : false;

    // eslint-disable-next-line prettier/prettier
    const tosAgreement = typeof requestObject.body.tosAgreement === 'boolean'
            ? requestObject.body.tosAgreement
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't exits
        data.read('users', phone, (err) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: utilities.hash(password),
                    tosAgreement,
                };

                // Write or create data of user
                data.create('users', phone, userObject, (err1) => {
                    if (!err1) {
                        callback(200, {
                            success: 'Created User Sucessfully',
                        });
                    } else {
                        callback(500, {
                            error: 'Could no create user',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in server site. File already exits.',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._user.get = (requestObject, callback) => {
    // Check the phone number is valid
    // eslint-disable-next-line prettier/prettier
    const phone = typeof requestObject.queryObject.phone === 'string' && requestObject.queryObject.phone.trim().length === 11 ? requestObject.queryObject.phone : false;

    if (phone) {
        // eslint-disable-next-line prettier/prettier
        const tokenId = typeof requestObject.headerObject.token === 'string' ? requestObject.headerObject.token : false;

        tokenHandler._token.verify(tokenId, phone, (tokenID) => {
            if (tokenID) {
                // Get the user'
                data.read('users', phone, (err, u) => {
                    const user = { ...utilities.parseJSON(u) };
                    if (!err && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Requested user not found',
                        });
                    }
                });
            } else {
                console.log(tokenId, tokenID);
                callback(403, { error: 'Authentication Faield!' });
            }
        });
    } else {
        callback(404, {
            error: 'Requested user not found',
        });
    }
};

handler._user.put = (requestObject, callback) => {
    // eslint-disable-next-line prettier/prettier
    const firstName = typeof requestObject.body.firstName === 'string' && requestObject.body.firstName.trim().length > 0 ? requestObject.body.firstName : false;

    // eslint-disable-next-line prettier/prettier
    const lastName = typeof requestObject.body.lastName === 'string' && requestObject.body.lastName.trim().length > 0 ? requestObject.body.lastName : false;

    // eslint-disable-next-line prettier/prettier
    const phone = typeof requestObject.body.phone === 'string' && requestObject.body.phone.trim().length === 11 ? requestObject.body.phone : false;

    // eslint-disable-next-line prettier/prettier
    const password = typeof requestObject.body.password === 'string' && requestObject.body.password.trim().length > 0 ? requestObject.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            // eslint-disable-next-line prettier/prettier
            const tokenId = typeof requestObject.headerObject.token === 'string' ? requestObject.headerObject.token : false;

            tokenHandler._token.verify(tokenId, phone, (tokenIdCheck) => {
                if (tokenIdCheck) {
                    // Check the user
                    data.read('users', phone, (err, uData) => {
                        const userData = { ...JSON.parse(uData) };
                        if (!err && uData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = utilities.hash(password);
                            }

                            // write the file
                            data.update('users', phone, userData, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'Sucessfully user was updated !',
                                    });
                                } else {
                                    console.log(err2);
                                    callback(500, {
                                        error: 'server side error',
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                error: 'There is an error server side ',
                            });
                        }
                    });
                } else {
                    callback(403, { error: 'Authentication Failure!' });
                }
            });
        } else {
            callback(400, {
                error: 'Error happened from your side',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid Phone Number',
        });
    }
};

handler._user.delete = (requestObject, callback) => {
    // Check the phone number is valid
    // eslint-disable-next-line prettier/prettier
    const phone = typeof requestObject.queryObject.phone === 'string' && requestObject.queryObject.phone.trim().length === 11 ? requestObject.queryObject.phone : false;

    if (phone) {
        // eslint-disable-next-line prettier/prettier
        const tokenId = typeof requestObject.headerObject.token === 'string' ? requestObject.headerObject.token : false;

        tokenHandler._token.verify(tokenId, phone, (tokenIdCheck) => {
            if (tokenIdCheck) {
                // read the file
                data.read('users', phone, (err) => {
                    if (!err) {
                        data.delete('users', phone, (err2) => {
                            if (!err2) {
                                callback(200, {
                                    message: 'Succesfully deleted the file . ',
                                });
                            } else {
                                callback(500, {
                                    error: 'Cannot get the file for delete in server side. ',
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: 'Cannot read the file. ',
                        });
                    }
                });
            } else {
                callback(403, { error: 'Authentication Failure!' });
            }
        });
    } else {
        callback(400, {
            error: 'Invalid phone number',
        });
    }
};

// Module Export
module.exports = handler;
