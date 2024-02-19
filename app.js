const express = require("express");
const { getTopics, getNotExists } = require("./controllers/topics.controllers");

const app = express();

app.get("/api/topics", getTopics);

// Allows error from invalid endpoint to go into middleware
app.get("/api/*", getNotExists)

app.use((err, req, res, next) => {
    if (err.status && err.msg && err.desc) {
        res.status(err.status).send({msg: err.msg, desc: err.desc});
    }
    
    next(err)
})

module.exports = app;
