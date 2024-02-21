const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const {
    handleBadEndpoint,
    handleBadIdType,
    handleCustomError,
    handleInvalidForeignKey,
    handleMissingAttributes,
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
    deleteCommentByCommentId,
} = require("./controllers/comments.controllers");
const { getAllUsers } = require("./controllers/users.controllers");

const app = express();

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteCommentByCommentId);

app.get("/api/users", getAllUsers);

app.all("/*", handleBadEndpoint);

app.use(handleCustomError);

app.use(handleBadIdType);

app.use(handleMissingAttributes);

app.use(handleInvalidForeignKey);

module.exports = app;
