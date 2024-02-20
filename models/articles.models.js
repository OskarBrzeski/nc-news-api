const db = require("../db/connection");

exports.selectAllArticles = () => {
    const query = `
        SELECT a.author, a.title, a.article_id, a.topic,
        a.created_at, a.votes, a.article_img_url,
        CAST(COUNT(c.article_id) AS INTEGER) AS comment_count
        FROM articles AS a
        LEFT JOIN comments AS c ON a.article_id = c.article_id
        GROUP BY a.article_id
        ORDER BY a.created_at DESC;
    `;

    return db.query(query).then(({ rows }) => {
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
