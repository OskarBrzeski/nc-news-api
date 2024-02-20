const {
    selectArticleById,
    selectAllArticles,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
    selectAllArticles()
        .then((articles) => {
            res.status(200).send({ articles });
        })
        .catch(next);
};

exports.getArticleById = (req, res, next) => {
    const article_id = req.params.article_id;

    selectArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};
