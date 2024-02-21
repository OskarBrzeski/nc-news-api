const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const app = require("../app");
const endpointsData = require("../endpoints.json");

const request = require("supertest");

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
});

describe("/api/does-not-exist", () => {
    test("GET 404: returns error if endpoint does not exist", () => {
        return request(app)
            .get("/api/get-does-not-exist")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("Endpoint does not exist");
            });
    });
    test("POST 404: returns error if endpoint does not exist", () => {
        return request(app)
            .post("/api/post-does-not-exist")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("Endpoint does not exist");
            });
    });
    test("PATCH 404: returns error if endpoint does not exist", () => {
        return request(app)
            .patch("/api/patch-does-not-exist")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("Endpoint does not exist");
            });
    });
    test("DELETE 404: returns error if endpoint does not exist", () => {
        return request(app)
            .delete("/api/delete-does-not-exist")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("Endpoint does not exist");
            });
    });
});

describe("GET /api", () => {
    test("200: returns the object in endpoints.json", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body: { endpoints } }) => {
                expect(endpoints).toEqual(endpointsData);
            });
    });
});

describe("GET /api/topics", () => {
    test("200: returns all topics as objects with correct attributes", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body: { topics } }) => {
                expect(topics).toHaveLength(3);

                topics.forEach((topic) => {
                    expect(topic).toMatchObject({
                        description: expect.any(String),
                        slug: expect.any(String),
                    });
                });
            });
    });
});

describe("GET /api/articles", () => {
    test("200: returns array of all articles", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles).toHaveLength(13);

                articles.forEach((article) => {
                    expect(article).toMatchObject({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        article_img_url: expect.any(String),
                        comment_count: expect.any(Number),
                    });

                    expect(article).not.toHaveProperty("body");
                });
            });
    });

    test("200: array of articles is sorted by descending date", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                expect(articles).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });

    test("200: article comment count is correct", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                articles.forEach((article) => {
                    if (article.article_id === 1) {
                        expect(article.comment_count).toBe(11);
                    }

                    if (article.article_id === 2) {
                        expect(article.comment_count).toBe(0);
                    }
                });
            });
    });

    test("200: article created_at date is correct", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body: { articles } }) => {
                // Not affected by weird Timezone magic
                expect(articles[0].created_at).toBe("2020-11-03T09:12:00.000Z");

                // Affected by weird Timezone magic
                expect(articles[1].created_at).toBe("2020-10-18T02:00:00.000Z");
            });
    });
});

describe("GET /api/articles/:article_id", () => {
    test("200: returns article with the given id", () => {
        const expected = {
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            article_id: 1,
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: "2020-07-09T21:11:00.000Z",
            votes: 100,
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };

        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toEqual(expected);
            });
    });

    test("404: returns error when given id without article", () => {
        return request(app)
            .get("/api/articles/1000")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("No article found with given ID");
            });
    });

    test("400: returns error when given invalid id type", () => {
        return request(app)
            .get("/api/articles/one")
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("ID of invalid type given");
            });
    });
});

describe("PATCH /api/articles/:article_id", () => {
    test("200: successfully increments article vote count", () => {
        const body = { inc_votes: 10 };

        return request(app)
            .patch("/api/articles/1")
            .send(body)
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toMatchObject({
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T21:11:00.000Z",
                    votes: 110,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                });
            });
    });

    test("200: successfully decrements article vote count", () => {
        const body = { inc_votes: -10 };

        return request(app)
            .patch("/api/articles/1")
            .send(body)
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toMatchObject({
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T21:11:00.000Z",
                    votes: 90,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                });
            });
    });

    test("200: successfully decrements article vote count below 0", () => {
        const body = { inc_votes: -150 };

        return request(app)
            .patch("/api/articles/1")
            .send(body)
            .expect(200)
            .then(({ body: { article } }) => {
                expect(article).toMatchObject({
                    article_id: 1,
                    title: "Living in the shadow of a great man",
                    topic: "mitch",
                    author: "butter_bridge",
                    body: "I find this existence challenging",
                    created_at: "2020-07-09T21:11:00.000Z",
                    votes: -50,
                    article_img_url:
                        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                });
            });
    });

    test("400: returns error when request body is missing attribute", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({})
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("Missing attribute in request body");
            });
    });

    test("404: returns error when given id without article", () => {
        const body = { inc_votes: 10 };

        return request(app)
            .patch("/api/articles/1000")
            .send(body)
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("No article found with given ID");
            });
    });

    test("400: returns error when given invalid id type", () => {
        const body = { inc_votes: 10 };

        return request(app)
            .patch("/api/articles/one")
            .send(body)
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("ID of invalid type given");
            });
    });
});

describe("GET /api/articles/:articles_id/comments", () => {
    test("200: returns array of all comments for given article", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toHaveLength(11);

                comments.forEach((comment) => {
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                        article_id: 1,
                    });
                });
            });
    });
    test("200: array of comments is ordered by descending date", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });

    test("200: comment created_at date is correct", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                // Not affected by weird Timezone magic
                expect(comments[0].created_at).toBe("2020-11-03T21:00:00.000Z");

                // Affected by weird Timezone magic
                expect(comments[2].created_at).toBe("2020-07-21T01:20:00.000Z");
            });
    });

    test("200: returns empty array if article has no comments", () => {
        return request(app)
            .get("/api/articles/2/comments")
            .expect(200)
            .then(({ body: { comments } }) => {
                expect(comments).toEqual([]);
            });
    });

    test("404: returns error when given id without article", () => {
        return request(app)
            .get("/api/articles/1000/comments")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("No article found with given ID");
            });
    });

    test("400: returns error when given invalid id type", () => {
        return request(app)
            .get("/api/articles/one/comments")
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("ID of invalid type given");
            });
    });
});

describe("POST /api/articles/:article_id/comments", () => {
    test("201: successfully adds comment", () => {
        const body = {
            username: "rogersop",
            body: "Wonderful article.",
        };

        return request(app)
            .post("/api/articles/1/comments")
            .send(body)
            .expect(201)
            .then(({ body: { comment } }) => {
                expect(comment).toMatchObject({
                    comment_id: expect.any(Number),
                    body: body.body,
                    votes: 0,
                    author: body.username,
                    article_id: 1,
                    created_at: expect.any(String),
                });
            });
    });

    test("400: returns error when request body is missing attributes", () => {
        const body = {
            body: "Wonderful article.",
        };

        return request(app)
            .post("/api/articles/1/comments")
            .send(body)
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("Missing attribute in request body");
            });
    });

    test("404: returns error when request body references username that does not exist", () => {
        const body = {
            username: "wonderuser",
            body: "Wonderful article.",
        };

        return request(app)
            .post("/api/articles/1/comments")
            .send(body)
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("No user found with given username");
            });
    });

    test("404: returns error when given id without article", () => {
        const body = {
            username: "rogersop",
            body: "Wonderful article.",
        };

        return request(app)
            .post("/api/articles/1000/comments")
            .send(body)
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("No article found with given ID");
            });
    });

    test("400: returns error when given invalid id type", () => {
        const body = {
            username: "rogersop",
            body: "Wonderful article.",
        };

        return request(app)
            .post("/api/articles/one/comments")
            .send(body)
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("ID of invalid type given");
            });
    });
});

describe("DELETE /api/comments/:comment_id", () => {
    test("204: successfully removes comment", () => {
        return request(app)
            .delete("/api/comments/1")
            .expect(204)
            .then(({ body }) => {
                expect(body).toEqual({});
            });
    });

    test("404: returns error when given id without comment", () => {
        return request(app)
            .delete("/api/comments/1000")
            .expect(404)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Not found");
                expect(desc).toBe("No comment found with given ID");
            });
    });

    test("400: returns error when given invalid id type", () => {
        return request(app)
            .delete("/api/comments/one")
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("ID of invalid type given");
            });
    });
});

describe("GET /api/users", () => {
    test("200: returns array of all users", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body: { users } }) => {
                expect(users).toHaveLength(4);

                users.forEach((user) => {
                    expect(user).toMatchObject({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String),
                    });
                });
            });
    });
});
