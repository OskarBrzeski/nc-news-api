const { selectArticleById } = require("../models/articles.models");
const { selectCommentsByArticleId } = require("../models/comments.models");

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
