const {
    selectArticleById,
    selectAllArticles,
} = require("../models/articles.models");
const {
    selectCommentCountsByArticleId,
} = require("../models/comments.models");

exports.getArticles = (req, res, next) => {
    const promises = [selectAllArticles(), selectCommentCountsByArticleId()];

    Promise.all(promises)
        .then(([articles, commentsPerArticle]) => {
            articles.forEach((article) => {
                article.comment_count = commentsPerArticle[article.article_id] || 0;
                delete article.body;
            })

            return articles
        })
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
