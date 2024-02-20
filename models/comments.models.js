const db = require("../db/connection");

exports.selectCommentCountsByArticleId = () => {
    return db.query("SELECT article_id, COUNT(*) FROM COMMENTS GROUP BY article_id").then(
        ({ rows }) => {
            const commentsPerArticle = {}

            rows.forEach((row) => {
                commentsPerArticle[row.article_id] = Number(row.count);
            })

            return commentsPerArticle;
        }
    );
};
