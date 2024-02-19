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

describe("GET /api/articles/:article_id", () => {
    test("200: returns article with the given id", () => {
        const expected = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: 1594329060000,
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

    test("400: returns error when given invalid id", () => {
        return request(app)
            .get("/api/articles/one")
            .expect(400)
            .then(({ body: { msg, desc } }) => {
                expect(msg).toBe("Bad request");
                expect(desc).toBe("ID of invalid type given");
            });
    });
});
