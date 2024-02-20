const db = require("../db/connection");

exports.selectAllArticles = () => {
    return db
        .query("SELECT * FROM articles ORDER BY created_at DESC")
        .then(({ rows }) => {
            rows.forEach((article) => {
                article.created_at = fixTimestamp(article.created_at);
            });
            
            return rows;
        });
};

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
            article.created_at = fixTimestamp(article.created_at);
            return article;
        });
};

function fixTimestamp(date) {
    // For some reason, Postgres seems to be returning the date with a
    // timezone I didn't ask for, so I need to account for the discrepency.
    // The worst part is, not every date is affected by this.
    const offsetMilliseconds = date.getTimezoneOffset() * 60 * 1000;
    const correctTimestamp = Date.parse(date) - offsetMilliseconds;
    return new Date(correctTimestamp);
}
