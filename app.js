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
    patchArticleById,
} = require("./controllers/articles.controllers");
const {
    getCommentsByArticleId,
    postComment,
} = require("./controllers/comments.controllers");

const app = express();

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.all("/*", handleBadEndpoint);

app.use(handleCustomError);

app.use(handleBadIdType);

module.exports = app;
