const db = require("../db/connection");
const { fixTimestamp } = require("./utils");

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

exports.updateArticleVotes = (articleId, votes) => {
    const query = `
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *
    `;

    return db.query(query, [votes, articleId]).then(({ rows }) => {
        rows[0].created_at = fixTimestamp(rows[0].created_at);

        return rows[0];
    });
};
