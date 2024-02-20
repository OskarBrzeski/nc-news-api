const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const {
    handleBadEndpoint,
    handleBadIdType,
    handleCustomError,
} = require("./controllers/errors.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const {
    getArticleById,
    getArticles,
} = require("./controllers/articles.controllers");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.all("/*", handleBadEndpoint);

app.use(handleCustomError);

app.use(handleBadIdType);

module.exports = app;
