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

describe("/api", () => {
    describe("GET", () => {
        test("200: returns the object in endpoints.json", () => {
            return request(app)
                .get("/api")
                .expect(200)
                .then(({ body: { endpoints } }) => {
                    expect(endpoints).toEqual(endpointsData);
                });
        });
    });
});

describe("/api/topics", () => {
    describe("GET", () => {
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
});

describe("/api/articles", () => {
    describe("GET", () => {
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
                    expect(articles[0].created_at).toBe(
                        "2020-11-03T09:12:00.000Z"
                    );

                    // Affected by weird Timezone magic
                    expect(articles[1].created_at).toBe(
                        "2020-10-18T02:00:00.000Z"
                    );
                });
        });

        describe("?topic=", () => {
            test("200: returns array of all article with the given topic", () => {
                return request(app)
                    .get("/api/articles?topic=mitch")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toHaveLength(12);

                        articles.forEach((article) => {
                            expect(article.topic).toBe("mitch");
                        });
                    });
            });

            test("200: returns empty array if topic exists but no articles have it", () => {
                return request(app)
                    .get("/api/articles?topic=paper")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toHaveLength(0);
                    });
            });

            test("404: returns error if topic does not exist", () => {
                return request(app)
                    .get("/api/articles?topic=cheese")
                    .expect(404)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Not found");
                        expect(desc).toBe("No topic found with given slug");
                    });
            });

            test("404: returns error if topic query left empty", () => {
                return request(app)
                    .get("/api/articles?topic=")
                    .expect(404)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Not found");
                        expect(desc).toBe("No topic found with given slug");
                    });
            });
        });

        describe("?sort_by=", () => {
            test("200: returns articles sorted by created_at", () => {
                return request(app)
                    .get("/api/articles?sorted_by=created_at")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("created_at", {
                            descending: true,
                        });
                    });
            });
            test("200: returns articles sorted by article_id", () => {
                return request(app)
                    .get("/api/articles?sorted_by=article_id")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("article_id", {
                            descending: true,
                        });
                    });
            });

            test("200: returns articles sorted by author", () => {
                return request(app)
                    .get("/api/articles?sorted_by=author")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("author", {
                            descending: true,
                        });
                    });
            });

            test("200: returns articles sorted by title", () => {
                return request(app)
                    .get("/api/articles?sorted_by=title")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("title", {
                            descending: true,
                        });
                    });
            });

            test("200: returns articles sorted by topic", () => {
                return request(app)
                    .get("/api/articles?sorted_by=topic")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("topic", {
                            descending: true,
                        });
                    });
            });

            test("200: returns articles sorted by votes", () => {
                return request(app)
                    .get("/api/articles?sorted_by=votes")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("votes", {
                            descending: true,
                        });
                    });
            });

            test("200: returns articles sorted by comment_count", () => {
                return request(app)
                    .get("/api/articles?sorted_by=comment_count")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("comment_count", {
                            descending: true,
                        });
                    });
            });

            test("400: returns error if trying to sort by image_url", () => {
                return request(app)
                    .get("/api/articles?sorted_by=article_img_url")
                    .expect(400)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Bad request");
                        expect(desc).toBe("Cannot sort by given attribute");
                    });
            });

            test("400: returns error if trying to sort by non-existent attribute", () => {
                return request(app)
                    .get("/api/articles?sorted_by=cheese")
                    .expect(400)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Bad request");
                        expect(desc).toBe("Cannot sort by given attribute");
                    });
            });

            test("400: returns error if sorted_by query left empty", () => {
                return request(app)
                    .get("/api/articles?sorted_by=")
                    .expect(400)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Bad request");
                        expect(desc).toBe("Cannot sort by given attribute");
                    });
            });
        });

        describe("?order=", () => {
            test("200: returns articles in descending order", () => {
                return request(app)
                    .get("/api/articles?order=desc")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("created_at", {
                            descending: true,
                        });
                    });
            });

            test("200: returns articles in ascending order", () => {
                return request(app)
                    .get("/api/articles?order=asc")
                    .expect(200)
                    .then(({ body: { articles } }) => {
                        expect(articles).toBeSortedBy("created_at", {
                            descending: false,
                        });
                    });
            });

            test("400: returns error if query not filled", () => {
                return request(app)
                    .get("/api/articles?order=")
                    .expect(400)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Bad request");
                        expect(desc).toBe("Order must be 'asc' or 'desc'");
                    });
            });

            test("400: returns error if query is given invalid value", () => {
                return request(app)
                    .get("/api/articles?order=middle")
                    .expect(400)
                    .then(({ body: { msg, desc } }) => {
                        expect(msg).toBe("Bad request");
                        expect(desc).toBe("Order must be 'asc' or 'desc'");
                    });
            });
        });
    });
});

describe("/api/articles/:article_id", () => {
    describe("GET", () => {
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
                comment_count: 11,
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
                    expect(desc).toBe("Invalid type given, expected integer");
                });
        });
    });

    describe("PATCH ", () => {
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

        test("400: returns error when request bodfy attribute is of incorrect type", () => {
            const body = {
                inc_votes: "cheese",
            };

            return request(app)
                .patch("/api/articles/1")
                .send(body)
                .expect(400)
                .then(({ body: { msg, desc } }) => {
                    expect(msg).toBe("Bad request");
                    expect(desc).toBe("Invalid type given, expected integer");
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
                    expect(desc).toBe("Invalid type given, expected integer");
                });
        });
    });
});

describe("/api/articles/:articles_id/comments", () => {
    describe("GET", () => {
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
                    expect(comments[0].created_at).toBe(
                        "2020-11-03T21:00:00.000Z"
                    );

                    // Affected by weird Timezone magic
                    expect(comments[2].created_at).toBe(
                        "2020-07-21T01:20:00.000Z"
                    );
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
                    expect(desc).toBe("Invalid type given, expected integer");
                });
        });
    });

    describe("POST", () => {
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
                    expect(desc).toBe("Invalid type given, expected integer");
                });
        });
    });
});

describe("/api/comments/:comment_id", () => {
    describe("DELETE", () => {
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
                    expect(desc).toBe("Invalid type given, expected integer");
                });
        });
    });
});

describe("/api/users", () => {
    describe("GET", () => {
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
});
