const db = require("../db/connection");
const { fixTimestamp } = require("./utils");

exports.selectCommentByCommentId = (commentId) => {
    const query = `
        SELECT * FROM comments
        WHERE comment_id = $1
    `;

    return db.query(query, [commentId]).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "Not found",
                desc: "No comment found with given ID",
            });
        }

        return rows[0];
    });
};

exports.selectCommentsByArticleId = (articleId) => {
    const query = `
        SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC
    `;

    return db.query(query, [articleId]).then(({ rows }) => {
        rows.forEach((comment) => {
            comment.created_at = fixTimestamp(comment.created_at);
        });

        return rows;
    });
};

exports.insertComment = (username, body, articleId) => {
    const query = `
        INSERT INTO comments
            (author, body, article_id)
        VALUES
            ($1, $2, $3)
        RETURNING *
    `;

    return db.query(query, [username, body, articleId]).then(({ rows }) => {
        return rows[0];
    });
};

exports.deleteComment = (commentId) => {
    const query = `
        DELETE FROM comments
        WHERE comment_id = $1
    `;

    return db.query(query, [commentId]);
};
