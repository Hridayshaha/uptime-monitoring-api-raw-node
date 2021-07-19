/*
 *
 * Title: Sampple Route
 * Description: This is sample route
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */

// Module Scafolding
const handler = {};

// main function
handler.sampleHandler = (requestObject, callback) => {
    console.log(requestObject);
    callback(200, {
        Success: 'Sample File Succesfully Run',
    });
};

// Module Export
module.exports = handler;
