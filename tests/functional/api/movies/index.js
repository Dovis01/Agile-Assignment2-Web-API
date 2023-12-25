import chai from "chai";
import request from "supertest";

const mongoose = require("mongoose");
import Movie from "../../../../api/movies/movieModel";
import api from "../../../../index";
import movies from '../../../../seedData/movies';

const expect = chai.expect;

let db;
const normalMovieId = 590706;
const errorMovieId = 99999999;

describe("Movies endpoint", () => {
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
            await Movie.deleteMany();
            await Movie.collection.insertMany(movies);
        } catch (err) {
            console.error(`failed to Load movies test Data: ${err}`);
        }
    });

    afterEach(() => {
        api.close(); // Release PORT 8080
    });

    describe("Movies source data from database storage ", () => {
        describe("GET /api/movies ", () => {
            it("should return 20 movies and a status 200", (done) => {
                request(api)
                    .get("/api/movies")
                    .set("Accept", "application/json")
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.results).to.be.a("array");
                        expect(res.body.results.length).to.equal(10);
                        done();
                    });
            });
        });

        describe("GET /api/movies/:id", () => {
            describe("when the id is valid", () => {
                it("should return the matching movie", () => {
                    return request(api)
                        .get(`/api/movies/${movies[0].id}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.have.property("title", movies[0].title);
                        });
                });
            });
            describe("when the id is invalid", () => {
                it("should return the NOT found message", () => {
                    return request(api)
                        .get("/api/movies/9999")
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            code: 404,
                            message: "The movie you requested could not be found.",
                        });
                });
            });
        });
    });

    describe("Movies source data from TMDB ", () => {
        describe("GET /api/movies/tmdb/discover?page={PageNumber}", () => {
            describe("when the request page about discover movies is valid", () => {
                //Normal
                it("should return 40 movies and a status 200 for normal page", () => {
                    const normalPage = 3;
                    return request(api)
                        .get(`/api/movies/tmdb/discover?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                //Boundary
                it("should return 20 movies and a status 200 for min page", () => {
                    const minPage = 1;
                    return request(api)
                        .get(`/api/movies/tmdb/discover?page=${minPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                it("should return 20 movies and a status 200 for max page", () => {
                    const maxPage = 250;
                    return request(api)
                        .get(`/api/movies/tmdb/discover?page=${maxPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
            });
            //Error
            describe("when the request page about discover movies is invalid", () => {
                it("should return the bad request message for invalid page which is not a number", () => {
                    const invalidPage = "invalidPage";
                    return request(api)
                        .get(`/api/movies/tmdb/discover?page=${invalidPage}`)
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
                        .get(`/api/movies/tmdb/discover?page=${invalidPage}`)
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
                        .get(`/api/movies/tmdb/discover?page=${invalidPage}`)
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

        describe("GET /api/movies/tmdb/upcoming?page={PageNumber}", () => {
            describe("when the request page about upcoming movies is valid", () => {
                //Normal
                it("should return 40 movies and a status 200 for normal page", () => {
                    const normalPage = 3;
                    return request(api)
                        .get(`/api/movies/tmdb/upcoming?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                //Boundary
                it("should return 20 movies and a status 200 for min page", () => {
                    const minPage = 1;
                    return request(api)
                        .get(`/api/movies/tmdb/upcoming?page=${minPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                it("should return 20 movies and a status 200 for max page", () => {
                    const maxPage = 14;
                    return request(api)
                        .get(`/api/movies/tmdb/upcoming?page=${maxPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
            });
            //Error
            describe("when the request page about upcoming movies is invalid", () => {
                it("should return the bad request message for invalid page which is not a number", () => {
                    const invalidPage = "invalidPage";
                    return request(api)
                        .get(`/api/movies/tmdb/upcoming?page=${invalidPage}`)
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
                        .get(`/api/movies/tmdb/upcoming?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be less than 1.`,
                            code: 400
                        });
                });
                it("should return the bad request message for greater than max page", () => {
                    const invalidPage = 15;
                    return request(api)
                        .get(`/api/movies/tmdb/upcoming?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be greater than 14.`,
                            code: 400
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/nowplaying?page={PageNumber}", () => {
            describe("when the request page about nowplaying movies is valid", () => {
                //Normal
                it("should return 40 movies and a status 200 for normal page", () => {
                    const normalPage = 3;
                    return request(api)
                        .get(`/api/movies/tmdb/nowplaying?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                //Boundary
                it("should return 20 movies and a status 200 for min page", () => {
                    const minPage = 1;
                    return request(api)
                        .get(`/api/movies/tmdb/nowplaying?page=${minPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                it("should return 20 movies and a status 200 for max page", () => {
                    const maxPage = 51;
                    return request(api)
                        .get(`/api/movies/tmdb/nowplaying?page=${maxPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
            });
            //Error
            describe("when the request page about nowplaying movies is invalid", () => {
                it("should return the bad request message for invalid page which is not a number", () => {
                    const invalidPage = "invalidPage";
                    return request(api)
                        .get(`/api/movies/tmdb/nowplaying?page=${invalidPage}`)
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
                        .get(`/api/movies/tmdb/nowplaying?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be less than 1.`,
                            code: 400
                        });
                });
                it("should return the bad request message for greater than max page", () => {
                    const invalidPage = 52;
                    return request(api)
                        .get(`/api/movies/tmdb/nowplaying?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be greater than 51.`,
                            code: 400
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/week_trending?page={PageNumber}", () => {
            describe("when the request page about week trending movies is valid", () => {
                //Normal
                it("should return 40 movies and a status 200 for normal page", () => {
                    const normalPage = 3;
                    return request(api)
                        .get(`/api/movies/tmdb/week_trending?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                //Boundary
                it("should return 20 movies and a status 200 for min page", () => {
                    const minPage = 1;
                    return request(api)
                        .get(`/api/movies/tmdb/week_trending?page=${minPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
                it("should return 20 movies and a status 200 for max page", () => {
                    const maxPage = 100;
                    return request(api)
                        .get(`/api/movies/tmdb/week_trending?page=${maxPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(40);
                        });
                });
            });
            //Error
            describe("when the request page about week trending movies is invalid", () => {
                it("should return the bad request message for invalid page which is not a number", () => {
                    const invalidPage = "invalidPage";
                    return request(api)
                        .get(`/api/movies/tmdb/week_trending?page=${invalidPage}`)
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
                        .get(`/api/movies/tmdb/week_trending?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be less than 1.`,
                            code: 400
                        });
                });
                it("should return the bad request message for greater than max page", () => {
                    const invalidPage = 101;
                    return request(api)
                        .get(`/api/movies/tmdb/week_trending?page=${invalidPage}`)
                        .set("Accept", "application/json")
                        .expect(400)
                        .expect({
                            success: false,
                            message: `Page number cannot be greater than 100.`,
                            code: 400
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/:id/recommendations?page={PageNumber}", () => {
            describe("when the request about movie recommendations succeeds", () => {
                //Page: Normal+Boundary  MovieId: Normal
                it("should return 40 movies and a status 200 for normal page and movie id", () => {
                    const normalPage = 1;
                    return request(api)
                        .get(`/api/movies/tmdb/${normalMovieId}/recommendations?page=${normalPage}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(41);
                        });
                });
            });

            //Error
            describe("when the request about movie recommendations fails", () => {
                describe("when the request page about movie recommendations is invalid", () => {
                    it("should return the bad request message for invalid page which is not a number", () => {
                        const invalidPage = "invalidPage";
                        return request(api)
                            .get(`/api/movies/tmdb/${normalMovieId}/recommendations?page=${invalidPage}`)
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
                            .get(`/api/movies/tmdb/${normalMovieId}/recommendations?page=${invalidPage}`)
                            .set("Accept", "application/json")
                            .expect(400)
                            .expect({
                                success: false,
                                message: `Page number cannot be less than 1.`,
                                code: 400
                            });
                    });
                    it("should return the bad request message for greater than max page", () => {
                        const invalidPage = 2;
                        return request(api)
                            .get(`/api/movies/tmdb/${normalMovieId}/recommendations?page=${invalidPage}`)
                            .set("Accept", "application/json")
                            .expect(400)
                            .expect({
                                success: false,
                                message: `Page number cannot be greater than 1.`,
                                code: 400
                            });
                    });
                });

                describe("when the request movie id about movie recommendations is invalid", () => {
                    it("should return the bad request message for invalid movie id", () => {
                        const normalPage = 1;
                        return request(api)
                            .get(`/api/movies/tmdb/${errorMovieId}/recommendations?page=${normalPage}`)
                            .set("Accept", "application/json")
                            .expect(404)
                            .expect({
                                success: false,
                                message: 'The recommendations data could not be found for this movie id you requested.',
                                code: 404
                            });
                    });
                });
            });
        });

        describe("GET /api/movies/tmdb/genres", () => {
            it("should return all movie genres and a status 200", () => {
                return request(api)
                    .get("/api/movies/tmdb/genres")
                    .set("Accept", "application/json")
                    .expect(200)
                    .then((res) => {
                        expect(res.body.genres).to.be.a("array");
                        expect(res.body.genres.length).to.equal(19);
                    });
            });
        });

        describe("GET /api/movies/tmdb/:id/images", () => {
            describe("when the request movie id about movie images is valid", () => {
                it("should return movie images and a status 200", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${normalMovieId}/images`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body.backdrops).to.be.a("array");
                            expect(res.body.backdrops.length).to.equal(13);
                            expect(res.body).to.have.property("id", normalMovieId);
                            expect(res.body.logos).to.be.a("array");
                            expect(res.body.logos.length).to.equal(7);
                            expect(res.body.posters).to.be.a("array");
                            expect(res.body.posters.length).to.equal(28);
                        });
                });
            });
            describe("when the request movie id about movie images is invalid", () => {
                it("should return the NOT found message for movie images", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${errorMovieId}/images`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The images data could not be found for this movie id you requested.',
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/:id/videos", () => {
            describe("when the request movie id about movie videos is valid", () => {
                it("should return movie videos and a status 200", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${normalMovieId}/videos`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property("id", normalMovieId);
                            expect(res.body.results).to.be.a("array");
                            expect(res.body.results.length).to.equal(11);
                        });
                });
            });
            describe("when the request movie id about movie videos is invalid", () => {
                it("should return the NOT found message for movie videos", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${errorMovieId}/videos`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The videos data could not be found for this movie id you requested.',
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/:id/credits", () => {
            describe("when the request movie id about movie credits is valid", () => {
                it("should return movie related credits and a status 200", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${normalMovieId}/credits`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property("id", normalMovieId);
                            expect(res.body.cast).to.be.a("array");
                            expect(res.body.cast.length).to.equal(21);
                            expect(res.body.crew).to.be.a("array");
                        });
                });
            });
            describe("when the request movie id about movie credits is invalid", () => {
                it("should return the NOT found message for movie related credits", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${errorMovieId}/credits`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The movie related credits data could not be found for this movie id you requested.',
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/:id/reviews", () => {
            describe("when the request movie id about movie reviews is valid", () => {
                it("should return movie related reviews and a status 200", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${normalMovieId}/reviews`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then(res => {
                            expect(res.body).to.have.property("id", normalMovieId);
                            expect(res.body).to.have.property("page", 1);
                            expect(res.body.results).to.be.a("array");
                            expect(res.body).to.have.property("total_pages", 0);
                            expect(res.body).to.have.property("total_results", 0);

                        });
                });
            });
            describe("when the request movie id about movie reviews is invalid", () => {
                it("should return the NOT found message for movie related reviews", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${errorMovieId}/reviews`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The reviews data could not be found for this movie id you requested.',
                            code: 404
                        });
                });
            });
        });

        describe("GET /api/movies/tmdb/:id", () => {
            describe("when the movie id is valid", () => {
                it("should return the matching movie", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.have.property("title", movies[0].title);
                            expect(res.body).to.have.property("original_title", "Jiu Jitsu");
                        });
                });
            });
            describe("when the movie id is invalid", () => {
                it("should return the NOT found message", () => {
                    return request(api)
                        .get(`/api/movies/tmdb/${errorMovieId}`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The movie details data could not be found for this movie id you requested.',
                            code: 404
                        });
                });
            });
        });
    });
});
