/*
 *
 * Title: Project Server -
 * Description: This is the initial server of the application
 * Author: Hriday Shaha
 * Date: 5-July-2021
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environment');

// Module Scafolding
const server = {};

// Create Server
server.createServer = () => {
    const createServerProject = http.createServer(server.handleReqRes);
    createServerProject.listen(environment.port, () => {
        console.log(`listening on port ${environment.port} on ${environment.envName} build ... `);
    });
};
// Handle Requests & Responses
server.handleReqRes = handleReqRes;

// Start Server
server.init = () => {
    server.createServer();
};

// export
module.exports = server;
