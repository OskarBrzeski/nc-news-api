const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getNotExists } = require("./controllers/errors.controllers");
const { getEndpoints } = require("./controllers/api.controllers");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

// Allows error from invalid endpoint to go into middleware
app.get("/*", getNotExists);

app.use((err, req, res, next) => {
    if (err.status && err.msg && err.desc) {
        res.status(err.status).send({ msg: err.msg, desc: err.desc });
    }

    next(err);
});

module.exports = app;
