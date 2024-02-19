const { endpoints } = require("../models/api.models");

exports.getEndpoints = ((req, res, next) => {
    endpoints()
        .then((endpoints) => {
            res.status(200).send({ endpoints });
        })
        .catch(next);
});
