const { selectAllTopics } = require("../models/topics.models");

exports.getNotExists = (req, res, next) => {
    next({ status: 404, msg: "Not found", desc: "Endpoint does not exist" });
};

exports.getTopics = (req, res, next) => {
    selectAllTopics()
        .then((rows) => {
            res.status(200).send({ topics: rows });
        })
        .catch((err) => {
            next(err);
        });
};
