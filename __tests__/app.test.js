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

describe("GET /api/does-not-exist", () => {
    test("404: returns error if endpoint does not exist", () => {
        return request(app)
            .get("/api/does-not-exist")
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
