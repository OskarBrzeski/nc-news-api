exports.handleBadEndpoint = (req, res, next) => {
    next({ status: 404, msg: "Not found", desc: "Endpoint does not exist" });
};

exports.handleCustomError = (err, req, res, next) => {
    if (err.status && err.msg && err.desc) {
        res.status(err.status).send({ msg: err.msg, desc: err.desc });
    }

    next(err);
};

exports.handleBadIdType = (err, req, res, next) => {
    if (err.code === "22P02") {
        res.status(400).send({
            msg: "Bad request",
            desc: "ID of invalid type given",
        });
    }

    next(err);
};
