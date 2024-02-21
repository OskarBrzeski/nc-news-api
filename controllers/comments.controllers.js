const { selectArticleById } = require("../models/articles.models");
const {
    selectCommentsByArticleId,
    insertComment,
    deleteComment,
} = require("../models/comments.models");

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

    insertComment(username, body, articleId)
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
    const commentId = req.params.comment_id;

    deleteComment(commentId)
        .then(() => {
            res.status(204).send();
        })
        .catch(next);
};
