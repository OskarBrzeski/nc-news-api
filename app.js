const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getNotExists } = require("./controllers/errors.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const { getArticleById } = require("./controllers/articles.controllers");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById)

// Allows error from invalid endpoint to go into middleware
app.get("/*", getNotExists);

app.use((err, req, res, next) => {
    if (err.status && err.msg && err.desc) {
        res.status(err.status).send({ msg: err.msg, desc: err.desc });
    }

    next(err);
});

app.use((err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({msg: "Bad request", desc: "ID of invalid type given"})
    }

    next(err)
})

module.exports = app;
