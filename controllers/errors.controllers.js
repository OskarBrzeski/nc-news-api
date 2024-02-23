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
            desc: "Invalid type given, expected integer",
        });
    }

    next(err);
};

exports.handleMissingAttributes = (err, req, res, next) => {
    if (err.code === "23502") {
        res.status(400).send({
            msg: "Bad request",
            desc: "Missing attribute in request body",
        });
    }

    next(err);
};

exports.handleInvalidForeignKey = (err, req, res, next) => {
    if (err.code === "23503") {
        let err_desc = "";

        switch (err.constraint) {
            case "articles_topic_fkey":
                err_desc = "No topic found with given slug";
                break;
            case "articles_author_fkey":
            case "comments_author_fkey":
                err_desc = "No user found with given username";
                break;
            case "comments_article_id_fkey":
                err_desc = "No article found with given ID";
                break;
            default:
                err_desc = "Foreign key constraint was violated";
        }

        res.status(404).send({
            msg: "Not found",
            desc: err_desc,
        });
    }

    next(err);
};

exports.logErrors = (err, req, res, next) => {
    console.log(err);

    next(err);
};
