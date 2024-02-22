const db = require("../db/connection");

exports.selectAllTopics = () => {
    return db.query("SELECT * FROM topics;").then(({ rows }) => {
        return rows;
    });
};

exports.selectTopicBySlug = (slug) => {
    const query = `
        SELECT * FROM topics
        WHERE slug = $1
    `;

    return db.query(query, [slug]).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "Not found",
                desc: "No topic found with given slug",
            });
        }

        return rows[0];
    });
};
