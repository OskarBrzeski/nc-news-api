const express = require("express");

const {
    handleBadEndpoint,
    handleBadIdType,
    handleCustomError,
    handleInvalidForeignKey,
    handleMissingAttributes,
} = require("./controllers/errors.controllers");

const apiRouter = require("./routes/api.router");
const articlesRouter = require("./routes/articles.router");
const topicsRouter = require("./routes/topics.router");
const commentsRouter = require("./routes/comments.router");
const usersRouter = require("./routes/users.router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/comments", commentsRouter);

apiRouter.use("/users", usersRouter);

app.all("/*", handleBadEndpoint);

app.use(handleCustomError);

app.use(handleBadIdType);

app.use(handleMissingAttributes);

app.use(handleInvalidForeignKey);

module.exports = app;
