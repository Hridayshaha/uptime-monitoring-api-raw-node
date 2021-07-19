/*
 *
 * Title: Not Found Handler
 * Description: 404 Not Found Page
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */

// Module Scafolding
const handler = {};

// Not Found Handler
handler.notFoundHandler = (requestObject, callback) => {
    callback(404, {
        error: '404 Not Found',
    });
};

// Module Export
module.exports = handler;
