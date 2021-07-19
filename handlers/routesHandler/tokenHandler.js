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
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');

// Module Scafolding
const handler = {};

// main function
handler.tokenHandler = (requestObject, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestObject.method) > -1) {
        handler._token[requestObject.method](requestObject, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestObject, callback) => {
    // eslint-disable-next-line prettier/prettier
    const phone = typeof requestObject.body.phone === 'string' && requestObject.body.phone.trim().length === 11 ? requestObject.body.phone : false;

    // eslint-disable-next-line prettier/prettier
    const password = typeof requestObject.body.password === 'string' && requestObject.body.password.trim().length > 0 ? requestObject.body.password : false;

    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            const hashPassword = hash(password);
            const userDataparse = parseJSON(userData);
            if (hashPassword === userDataparse.password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;

                const tokenObject = {
                    id: tokenId,
                    expires,
                    phone,
                };

                // Store the token
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'Token created successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'There was a problem in server side ',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Invalid Phone or password',
                });
            }
        });
    } else {
        console.log(phone, password);
        callback(405, {
            error: 'There was an error in your request',
        });
    }
};

handler._token.get = (requestObject, callback) => {
    // Check id is valid
    // eslint-disable-next-line prettier/prettier
    const id = typeof requestObject.queryObject.id === 'string' && requestObject.queryObject.id.length === 20 ? requestObject.queryObject.id : false;

    if (id) {
        // Read the file
        data.read('tokens', id, (err1, tokenData) => {
            const token = parseJSON(tokenData);
            if (!err1 && tokenData) {
                callback(200, token);
            } else {
                callback(500, {
                    error: 'Cannot read the token id.',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token is not valid . Error occured',
        });
    }
};

handler._token.put = (requestObject, callback) => {
    // Check id is valid
    // eslint-disable-next-line prettier/prettier
    const id = typeof requestObject.body.id === 'string' && requestObject.body.id.length === 20 ? requestObject.body.id : false;

    // eslint-disable-next-line prettier/prettier
    const extend = !!(typeof requestObject.body.extend === 'boolean' && requestObject.body.extend === true);

    if (id && extend) {
        // Read the data
        data.read('tokens', id, (err, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                // store or update the file
                data.update('tokens', id, tokenObject, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'Token is expire date is updated successfully',
                        });
                    } else {
                        callback(500, {
                            error: 'There was a porblem in server side',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token is expired',
                });
            }
        });
    }
};

handler._token.delete = (requestObject, callback) => {
    // Check id is valid
    // eslint-disable-next-line prettier/prettier
    const id = typeof requestObject.queryObject.id === 'string' && requestObject.queryObject.id.length === 20 ? requestObject.queryObject.id : false;

    if (id) {
        data.delete('tokens', id, (err) => {
            if (!err) {
                callback(200, {
                    message: 'successfully delete the token',
                });
            } else {
                callback(500, { error: 'server side error to delete the file' });
            }
        });
    } else {
        callback(500, { error: 'Server side error' });
    }
};

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            const token = JSON.parse(tokenData);
            if (token.phone === phone && token.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Module Export
module.exports = handler;
