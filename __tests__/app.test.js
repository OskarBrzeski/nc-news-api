const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const app = require("../app");

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
            .then(({ res: { statusMessage } }) => {
                expect(statusMessage).toBe("Not Found");
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
