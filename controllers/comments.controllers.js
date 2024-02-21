const { selectArticleById } = require("../models/articles.models");
const {
    selectCommentsByArticleId,
    insertComment,
    selectCommentByCommentId,
    deleteComment,
} = require("../models/comments.models");
const { selectUserByUsername } = require("../models/users.models");

exports.getCommentsByArticleId = (req, res, next) => {
    const articleId = req.params.article_id;

    const promises = [
        selectArticleById(articleId),
        selectCommentsByArticleId(articleId),
    ];

    Promise.all(promises)
        .then(([_, comments]) => {
            res.status(200).send({ comments });
        })
        .catch(next);
};

exports.postComment = (req, res, next) => {
    const articleId = req.params.article_id;
    const { username, body } = req.body;

    if (username === undefined || body === undefined) {
        next({
            status: 400,
            msg: "Bad request",
            desc: "Missing attribute in request body",
        });
    }

    const promises = [
        selectArticleById(articleId),
        selectUserByUsername(username),
        insertComment(username, body, articleId),
    ];

    Promise.all(promises)
        .then(([_a, _b, comment]) => {
            res.status(201).send({ comment });
        })
        .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
    const commentId = req.params.comment_id;

    const promises = [
        selectCommentByCommentId(commentId),
        deleteComment(commentId),
    ];

    Promise.all(promises)
        .then(() => {
            res.status(204).send();
        })
        .catch(next);
};
