const {
    selectArticleById,
    selectArticles,
    updateArticleVotes,
} = require("../models/articles.models");
const { selectTopicBySlug } = require("../models/topics.models");

exports.getArticles = (req, res, next) => {
    const promises = [];

    if (req.query.topic !== undefined) {
        promises.push(selectTopicBySlug(req.query.topic));
    }

    promises.push(selectArticles(req.query));

    Promise.all(promises)
        .then((outcomes) => {
            return outcomes[outcomes.length - 1];
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

exports.patchArticleById = (req, res, next) => {
    const articleId = req.params.article_id;
    const { inc_votes } = req.body;

    if (inc_votes === undefined) {
        next({
            status: 400,
            msg: "Bad request",
            desc: "Missing attribute in request body",
        });
    }

    updateArticleVotes(articleId, inc_votes)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};
