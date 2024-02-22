const { getEndpoints } = require("../controllers/api.controllers");

const apiRouter = require("express").Router();

apiRouter.get("/", getEndpoints);

module.exports = apiRouter;
