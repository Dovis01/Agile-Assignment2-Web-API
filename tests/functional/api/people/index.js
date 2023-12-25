import chai from "chai";
import request from "supertest";

const mongoose = require("mongoose");
import People from "../../../../api/people/peopleModel";
import api from "../../../../index";
import people from '../../../../seedData/people';

const expect = chai.expect;

let db;
const normalPeopleId = 12799;
const errorPeopleId = 99999999;

describe("People endpoint", () => {
    before(() => {
        mongoose.connect(process.env.MONGO_DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        db = mongoose.connection;
    });

    after(async () => {
        try {
            await db.dropDatabase();
        } catch (error) {
            console.log(error);
        }
    });

    beforeEach(async () => {
        try {
            await People.deleteMany();
            await People.collection.insertMany(people);
        } catch (err) {
            console.error(`failed to Load people Data: ${err}`);
        }
    });

    afterEach(() => {
        api.close(); // Release PORT 8080
    });

    describe("People source data from database storage ", () => {
        describe("GET /api/people ", () => {
            it("should return 2 people and a status 200", (done) => {
                request(api)
                    .get("/api/people")
                    .set("Accept", "application/json")
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body).to.have.property("total_pages", 1);
                        expect(res.body).to.have.property("total_results", 2);
                        expect(res.body.results).to.be.a("array");
                        expect(res.body.results.length).to.equal(2);
                        done();
                    });
            });
        });

        describe("GET /api/people/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching people", () => {
                    return request(api)
                        .get(`/api/people/${people[0].id}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.have.property("name", people[0].name);
                            expect(res.body).to.have.property("original_name", people[0].original_name);
                        });
                });
            });
            describe("when the id is invalid", () => {
                it("should return the NOT found message", () => {
                    return request(api)
                        .get(`/api/people/${errorPeopleId}`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            message: "The people you requested could not be found.",
                            code: 404
                        });
                });
            });
        });
    });

    describe("People source data from TMDB ", () => {
        describe("GET /api/people/tmdb/popular_people?page={PageNumber}", () => {
            describe("when the request page about popular people is valid", () => {
                //Normal
                it("should return 40 people and a status 200 for normal page", () => {
                    const normalPage = 3;
                    return request(api)
                        .get(`/api/people/tmdb/popular_people?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                //Boundary
                it("should return 40 people and a status 200 for min page", () => {
                    const minPage = 1;
                    return request(api)
                        .get(`/api/people/tmdb/popular_people?page=${minPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                it("should return 40 people and a status 200 for max page", () => {
                    const maxPage = 250;
                    return request(api)
                        .get(`/api/people/tmdb/popular_people?page=${maxPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
            });
            //Error
            describe("when the request page about popular people is invalid", () => {
                it("should return the bad request message for invalid page which is not a number", () => {
                    const invalidPage = "invalidPage";
                    return request(api)
                        .get(`/api/people/tmdb/popular_people?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number must be a number.`,
                            code: 400
                        });
                });
                it("should return the bad request message for less than min page", () => {
                    const invalidPage = 0;
                    return request(api)
                        .get(`/api/people/tmdb/popular_people?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be less than 1.`,
                            code: 400
                        });
                });
                it("should return the bad request message for greater than max page", () => {
                    const invalidPage = 251;
                    return request(api)
                        .get(`/api/people/tmdb/popular_people?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be greater than 250.`,
                            code: 400
                        });
                });
            });
        });

        describe("GET /api/people/tmdb/week_trending?page={PageNumber}", () => {
            describe("when the request page about week trending people is valid", () => {
                //Normal
                it("should return 40 people and a status 200 for normal page", () => {
                    const normalPage = 3;
                    return request(api)
                        .get(`/api/people/tmdb/week_trending?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                //Boundary
                it("should return 40 people and a status 200 for min page", () => {
                    const minPage = 1;
                    return request(api)
                        .get(`/api/people/tmdb/week_trending?page=${minPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                it("should return 40 people and a status 200 for max page", () => {
                    const maxPage = 250;
                    return request(api)
                        .get(`/api/people/tmdb/week_trending?page=${maxPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results).to.be.not.null;
                        });
                });
            });
            //Error
            describe("when the request page about week trending people is invalid", () => {
                it("should return the bad request message for invalid page which is not a number", () => {
                    const invalidPage = "invalidPage";
                    return request(api)
                        .get(`/api/people/tmdb/week_trending?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number must be a number.`,
                            code: 400
                        });
                });
                it("should return the bad request message for less than min page", () => {
                    const invalidPage = 0;
                    return request(api)
                        .get(`/api/people/tmdb/week_trending?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be less than 1.`,
                            code: 400
                        });
                });
                it("should return the bad request message for greater than max page", () => {
                    const invalidPage = 251;
                    return request(api)
                        .get(`/api/people/tmdb/week_trending?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be greater than 250.`,
                            code: 400
                        });
                });
            });
        });

        describe("GET /api/people/tmdb/:id", () => {
            describe("when the people id is valid", () => {
                it("should return the matching people", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${normalPeopleId}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.have.property("name", people[0].name);
                            expect(res.body).to.have.property("place_of_birth", "New York City, New York, USA");
                            expect(res.body).to.have.property("gender", people[0].gender);
                        });
                });
            });
            describe("when the people id is invalid", () => {
                it("should return the NOT found message", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${errorPeopleId}`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The specific person details data could not be found for this person id you requested.',
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/people/tmdb/:id/images", () => {
            describe("when the request people id about people images is valid", () => {
                it("should return people images and a status 200", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${normalPeopleId}/images`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property("id", normalPeopleId);
                            expect(res.body.profiles).to.be.a("array");
                            expect(res.body.profiles.length).to.equal(4);
                        });
                });
            });
            describe("when the request people id about people images is invalid", () => {
                it("should return the NOT found message for people images", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${errorPeopleId}/images`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The specific person images data could not be found for this person id you requested.',
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/people/tmdb/:id/movie_credits", () => {
            describe("when the request person id about person related movie credits is valid", () => {
                it("should return person related movie credits and a status 200", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${normalPeopleId}/movie_credits`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.cast).to.be.a("array");
                            expect(res.body.cast.length).to.equal(77);
                            expect(res.body.crew).to.be.a("array");
                            expect(res.body.crew.length).to.equal(2);
                            expect(res.body).to.have.property("id", normalPeopleId);
                        });
                });
            });
            describe("when the request person id about person related movie credits is invalid", () => {
                it("should return the NOT found message for person related movie credits", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${errorPeopleId}/movie_credits`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: "The specific person's related movie credits data could not be found for this person id you requested.",
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/people/tmdb/:id/tv_credits", () => {
            describe("when the request person id about person related tv credits is valid", () => {
                it("should return person related tv credits and a status 200", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${normalPeopleId}/tv_credits`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.cast).to.be.a("array");
                            expect(res.body.cast.length).to.equal(37);
                            expect(res.body.crew).to.be.a("array");
                            expect(res.body.crew.length).to.equal(0);
                            expect(res.body).to.have.property("id", normalPeopleId);
                        });
                });
            });
            describe("when the request person id about person related tv credits is invalid", () => {
                it("should return the NOT found message for person related tv credits", () => {
                    return request(api)
                        .get(`/api/people/tmdb/${errorPeopleId}/tv_credits`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: "The specific person's related tv credits data could not be found for this person id you requested.",
                            code: 404
                        });
                });
            });
        });

    });
});
