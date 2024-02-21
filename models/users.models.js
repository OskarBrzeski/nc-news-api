const db = require("../db/connection");

exports.selectAllUsers = () => {
    const query = `
        SELECT * FROM users
    `;

    return db.query(query).then(({ rows }) => {
        return rows;
    });
};
exports.selectUserByUsername = (username) => {
    const query = `
        SELECT * FROM users WHERE username = $1
    `;

    return db.query(query, [username]).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: "Not found",
                desc: "No user found with given username",
            });
        }

        return rows[0];
    });
};
