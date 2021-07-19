/*
 *
 * Title: Proeject initial files
 * Description: This is the initial file for this project.
 * Author: Hriday Shaha
 * Date: 5-July-2021
 *
 */
// dependencies
const server = require('./lib/server');
const workers = require('./lib/worker');

// Module Scafolding
const app = {};

// Start Server and the workers
app.init = () => {
    // start the Server
    server.init();

    // Start the workers
    workers.init();
};

// Start The process
app.init();

// Module Export
module.exports = app;
