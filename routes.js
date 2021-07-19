/*
 *
 * Title: Routes Mangement
 * Description: All of Routes will be add in here .
 * Author: Hriday Shaha
 * Date: 5-July-2020
 *
 */

// Dependencies
const { sampleHandler } = require('./handlers/routesHandler/sampleHandlers');
const { userHandler } = require('./handlers/routesHandler/userHandler');
const { tokenHandler } = require('./handlers/routesHandler/tokenHandler');
const { checkHandler } = require('./handlers/routesHandler/checkHandler');

// Routes mangement
const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

// Module Export
module.exports = routes;
