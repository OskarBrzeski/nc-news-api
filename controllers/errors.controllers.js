exports.handleBadEndpoint = (req, res, next) => {
    next({ status: 404, msg: "Not found", desc: "Endpoint does not exist" });
};