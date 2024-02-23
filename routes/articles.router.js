const {
    getArticles,
    getArticleById,
    patchArticleById,
    postArticle,
} = require("../controllers/articles.controllers");
const {
    getCommentsByArticleId,
    postComment,
} = require("../controllers/comments.controllers");

const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
    .route("/:article_id")
    .get(getArticleById)
    .patch(patchArticleById);

articlesRouter
    .route("/:article_id/comments", getCommentsByArticleId)
    .get(getCommentsByArticleId)
    .post(postComment);

module.exports = articlesRouter;
