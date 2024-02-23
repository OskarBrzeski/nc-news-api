const db = require("../db/connection");

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

exports.updateCommentVotes = (commentId, inc_votes) => {
    const query = `
        UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2
        RETURNING *
    `;

    return db.query(query, [inc_votes, commentId]).then(({ rows }) => {
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

exports.deleteComment = (commentId) => {
    const query = `
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *
    `;

    return db.query(query, [commentId]).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "Not found",
                desc: "No comment found with given ID",
            });
        }
    });
};
