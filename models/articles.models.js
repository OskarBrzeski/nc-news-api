const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
    return db
        .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Not found",
                    desc: "No article found with given ID",
                });
            }
            
            const article = rows[0];

            // For some reason, Postgres seems to be returning the date with a
            // timezone I didn't ask for, so I need to account for the discrepency
            const offsetMilliseconds = article.created_at.getTimezoneOffset() * 60 * 1000;
            article.created_at = Date.parse(article.created_at) - offsetMilliseconds;
            return article;
        });
};
