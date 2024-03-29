const db = require("../db/connection");

exports.selectArticles = ({
    sorted_by = "created_at",
    order = "desc",
    limit,
    p,
    ...queryObj
}) => {
    const validSorts = [
        "created_at",
        "author",
        "title",
        "article_id",
        "topic",
        "votes",
        "comment_count",
    ];

    if (!validSorts.includes(sorted_by)) {
        return Promise.reject({
            status: 400,
            msg: "Bad request",
            desc: "Cannot sort by given attribute",
        });
    }

    if (sorted_by !== "comment_count") {
        sorted_by = `a.${sorted_by}`;
    }

    if (!["asc", "desc"].includes(order)) {
        return Promise.reject({
            status: 400,
            msg: "Bad request",
            desc: "Order must be 'asc' or 'desc'",
        });
    }

    const valueArray = [];
    const queryArray = [];

    for (let key in queryObj) {
        valueArray.push(queryObj[key]);
        queryArray.push(`a.${key} = $${valueArray.length}`);
    }

    let whereClause = "";
    if (queryArray.length > 0) {
        whereClause = `WHERE ${queryArray.join(" AND ")}`;
    }

    const query = `
    SELECT a.author, a.title, a.article_id, a.topic,
    a.created_at, a.votes, a.article_img_url,
    CAST(COUNT(c.article_id) AS INTEGER) AS comment_count
    FROM articles AS a
    LEFT JOIN comments AS c ON a.article_id = c.article_id
    ${whereClause}
    GROUP BY a.article_id
    ORDER BY ${sorted_by} ${order};
    `;

    return db.query(query, valueArray).then(({ rows }) => {
        if (limit === undefined) {
            if (p !== undefined) {
                return Promise.reject({
                    status: 400,
                    msg: "Bad request",
                    desc: "Cannot serve page without limit",
                });
            }
            return { articles: rows };
        } else if (limit === "") {
            limit = 10;
        } else {
            limit = Number(limit);
        }

        if (isNaN(limit)) {
            return Promise.reject({
                status: 400,
                msg: "Bad request",
                desc: "Limit must be a number",
            });
        } else if (limit <= 0) {
            return Promise.reject({
                status: 400,
                msg: "Bad request",
                desc: "Cannot serve fewer than 1 article",
            });
        }

        let page;

        if (p === undefined) {
            page = 1;
        } else if (p === "" || isNaN(Number(p))) {
            return Promise.reject({
                status: 400,
                msg: "Bad request",
                desc: "Page must be a number",
            });
        } else {
            page = Number(p);
        }

        if (page <= 0 || (limit * (page - 1) + 1) > rows.length) {
            return Promise.reject({
                status: 400,
                msg: "Bad request",
                desc: "Cannot serve requested page",
            });
        }

        return {
            articles: rows.slice(limit * (page - 1), limit * page),
            total_count: rows.length,
        };
    });
};

exports.selectArticleById = (article_id) => {
    const query = `
        SELECT a.author, a.title, a.article_id, a.body, a.topic,
        a.created_at, a.votes, a.article_img_url,
        CAST(COUNT(c.article_id) AS INTEGER) AS comment_count
        FROM articles AS a
        LEFT JOIN comments AS c ON a.article_id = c.article_id
        WHERE a.article_id = $1
        GROUP BY a.article_id
    `;

    return db.query(query, [article_id]).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "Not found",
                desc: "No article found with given ID",
            });
        }

        return rows[0];
    });
};

exports.insertArticle = ({ title, topic, author, body, article_img_url }) => {
    let fields = "(title, topic, author, body)";
    let values = "($1, $2, $3, $4)";
    const valueArray = [title, topic, author, body];
    if (article_img_url !== undefined) {
        fields = "(title, topic, author, body, article_img_url)";
        values = "($1, $2, $3, $4, $5)";
        valueArray.push(article_img_url);
    }

    const query = `
    INSERT INTO articles
        ${fields}
    VALUES
        ${values}
    RETURNING *
    `;

    return db.query(query, valueArray).then(({ rows }) => {
        rows[0].comment_count = 0;

        return rows[0];
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
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "Not found",
                desc: "No article found with given ID",
            });
        }

        return rows[0];
    });
};
