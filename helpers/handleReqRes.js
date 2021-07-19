/*
 *
 * Title: Handle All Requests & Respons
 * Description: Here all reqests & response import items added.
 * Author: Hriday Shaha
 * Date: 5-July-2021
 *
 */
// dependecies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routesHandler/notFoundHandler');
const utilities = require('./utilities');

// module scafolding
const handler = {};

handler.handleReqRes = (req, res) => {
    // handle request
    // All reqest data
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const queryObject = parsedUrl.query;
    const headerObject = req.headers;
    const method = req.method.toLowerCase();

    const requestObject = {
        parsedUrl,
        path,
        trimmedPath,
        queryObject,
        headerObject,
        method,
    };
    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const reqHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestObject.body = utilities.parseJSON(realData);
        reqHandler(requestObject, (statuscode, payload) => {
            const statusCode = typeof statuscode === 'number' ? statuscode : 500;
            const payLoad = typeof payload === 'object' ? payload : {};

            const payLoadJson = JSON.stringify(payLoad);

            // handle response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadJson);
        });

        // // handle response
        // res.end('Responed Succesfully Done.');
    });
};
// moduole exports
module.exports = handler;
