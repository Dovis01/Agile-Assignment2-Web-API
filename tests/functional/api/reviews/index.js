import chai from "chai";
import request from "supertest";

const mongoose = require("mongoose");
import Review from "../../../../api/reviews/reviewModel";
import api from "../../../../index";
import reviews from "../../../../seedData/reviews";

const expect = chai.expect;
let db;
let userToken;
let normalUsername = reviews[0].username;
let newUsername = "user99";
let errorUsername = "user9999999";
let normalMovieId = reviews[0].movieId;
let errorMovieId = "99999999999";
let normalReviewId = reviews[0].reviews[0].id;
let errorReviewId = "99999999999";
let numOriginalReviewsByOneUser;
let numOriginalAllReviewsData;

describe("Reviews endpoint", () => {
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
            await Review.deleteMany();
            await Review.collection.insertMany(reviews);
        } catch (err) {
            console.error(`failed to Load reviews test Data: ${err}`);
        }
    });
    afterEach(() => {
        api.close();
    });

    describe("Unauthenticated scenarios for reviews endpoint ", () => {
        it("should return a 500 status code if the user is unauthenticated", () => {
            return request(api)
                .get("/api/reviews")
                .set("Accept", "application/json")
                .expect(500);
        });
    });
    describe("Authenticated scenarios for reviews endpoint ", () => {
        before(async () => {
            await request(api).post("/api/users?action=register").send({
                username: "user1",
                email: '134119874@gmail.com',
                password: "test123@",
            });
            return request(api)
                .post("/api/users?authMethod=username")
                .send({
                    username: "user1",
                    password: "test123@",
                })
                .expect(200)
                .then((res) => {
                    userToken = res.body.token;
                });
        });
        describe("GET /api/reviews ", () => {
            it("should return the 2 reviews data and a status 200", (done) => {
                request(api)
                    .get("/api/reviews")
                    .set("Accept", "application/json")
                    .set('Authorization', userToken)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body).to.be.a("object");
                        expect(Object.keys(res.body).length).to.equal(4);
                        expect(res.body.results).to.be.a("array");
                        expect(res.body.results.length).to.equal(2);
                        res.body.results.forEach((userReviews) => {
                            expect(userReviews).to.be.a("object");
                            expect(Object.keys(userReviews).length).to.equal(4);
                            expect(userReviews.reviews).to.be.a("array");
                            expect(userReviews.reviews).to.not.be.null;
                        });
                        done();
                    });
            });
        });

        describe("GET /api/reviews/:username ", () => {
            //Normal
            describe("when the request username actually exists  ", () => {
                it("should return reviewed movie ids of the specific user and a status 200", () => {
                    return request(api)
                        .get(`/api/reviews/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.be.a("array");
                            expect(res.body.length).to.equal(1);
                        });
                });
            });
            //Error
            describe("when the request username actually does not exist  ", () => {
                it("should return the NOT found message and a status 404", () => {
                    return request(api)
                        .get(`/api/reviews/${errorUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The reviews you requested of this user could not be found.',
                            status_code: 404
                        });
                });
            });
        });

        describe("GET /api/reviews/:username/movies/:movieId ", () => {
            //Normal
            describe("when the request username and movieId are valid  ", () => {
                it("should return all reviews record of the specific movie reviewed by the user and a status 200", () => {
                    return request(api)
                        .get(`/api/reviews/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(4);
                            expect(res.body.reviews).to.be.a("array");
                            expect(res.body.reviews.length).to.equal(5);
                        });
                });
            });
            //Error
            describe("when the request url is wrong ", () => {
                describe("when the request username is invalid ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .get(`/api/reviews/${errorUsername}/movies/${normalMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success:false, message: 'The reviews you requested could not be found.', status_code: 404});
                    });
                });
                describe("when the request movie id is invalid ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .get(`/api/reviews/${normalUsername}/movies/${errorMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success:false, message: 'The reviews you requested could not be found.', status_code: 404});
                    });
                });
            });
        });

        describe("GET /api/reviews/:reviewId/:username/movies/:movieId ", () => {
            //Normal
            describe("when the request reviewId, username and movieId are valid  ", () => {
                it("should return a specific review record of the specific movie reviewed by the user and a status 200", () => {
                    return request(api)
                        .get(`/api/reviews/${normalReviewId}/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(2);
                            expect(res.body.reviews).to.be.a("array");
                            expect(res.body.reviews[0]).to.be.a("object");
                            expect(Object.keys(res.body.reviews[0]).length).to.equal(5);
                            expect(res.body.reviews[0].content).to.not.be.null;
                        });
                });
            });
            //Error
            describe("when the request url is wrong ", () => {
                describe("when the request review id is invalid ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .get(`/api/reviews/${errorReviewId}/${normalUsername}/movies/${normalMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success:false, message: 'The review you requested could not be found.', status_code: 404});
                    });
                });
                describe("when the request username is invalid ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .get(`/api/reviews/${normalReviewId}/${errorUsername}/movies/${normalMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success:false, message: 'The review you requested could not be found.', status_code: 404});
                    });
                });
                describe("when the request movie id is invalid ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .get(`/api/reviews/${normalReviewId}/${normalUsername}/movies/${errorMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success:false, message: 'The review you requested could not be found.', status_code: 404});
                    });
                });
            });
        });

        describe("POST /api/reviews/:username/movies/:movieId ", () => {
            describe("when username and movieId of the post request are valid and the username which has review records  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/reviews/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalReviewsByOneUser = res.body.reviews.length;
                        });
                });
                it("should return the new entire review records and a status 200", () => {
                    return request(api)
                        .post(`/api/reviews/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .send({
                            author: "DDoviss",
                            rating: 3,
                            content: "Well, that movie is so cool. I want to watch it again!!!"
                        })
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The review is added successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.reviews).to.be.a("array");
                            expect(res.body.result.reviews[0]).to.be.a("object");
                            expect(res.body.result.reviews.length).to.equal(numOriginalReviewsByOneUser + 1);
                            expect(res.body.result.reviews[5].content).to.not.be.null;
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/reviews/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.reviews.length).to.equal(numOriginalReviewsByOneUser + 1);
                        });
                });
            });

            describe("when username and movieId of the post request are valid and the username which does not have review records  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/reviews`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalAllReviewsData = res.body.results.length;
                        });
                });
                it("should return the new entire review records of a new username and a status 200", () => {
                    return request(api)
                        .post(`/api/reviews/${newUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .send({
                            author: "DDoviss",
                            rating: 3,
                            content: "Well, that movie is so cool. I want to watch it again!!!"
                        })
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The first review is added successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.reviews).to.be.a("array");
                            expect(res.body.result.reviews[0]).to.be.a("object");
                            expect(res.body.result.reviews.length).to.equal(1);
                            expect(res.body.result.reviews[0].content).to.not.be.null;
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/reviews`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.results.length).to.equal(numOriginalAllReviewsData + 1);
                        });
                });
            });
        });

        describe("PUT /api/reviews/:reviewId/:username/movies/:movieId ", () => {
            //Normal
            describe("when the put request succeeds  ", () => {
                it("should return the updated entire review records and a status 200", () => {
                    return request(api)
                        .put(`/api/reviews/${normalReviewId}/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .send({
                            author: "Dovis1",
                            rating: 2,
                            content: "Bad, that is so cool. I want to watch it again!!!"
                        })
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The review is updated successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result).to.be.a("object");
                            expect(res.body.result).to.have.property("content", "Bad, that is so cool. I want to watch it again!!!");
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/reviews/${normalReviewId}/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.reviews[0]).to.have.property("author", "Dovis1");
                            expect(res.body.reviews[0]).to.have.property("rating", 2);
                            expect(res.body.reviews[0]).to.have.property("content", "Bad, that is so cool. I want to watch it again!!!");
                        });
                });
            });

            //Error
            describe("when the put request fails  ", () => {
                describe("when some of payload of put request is empty  ", () => {
                    it("should return the bad request and a status 400", () => {
                        return request(api)
                            .put(`/api/reviews/${normalReviewId}/${normalUsername}/movies/${normalMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .send({
                                author: "",
                                rating: 2,
                                content: "Bad, that is so cool. I want to watch it again!!!"
                            })
                            .expect(400)
                            .expect({success: false, msg: 'Author,rating and content are required.', code: 400});
                    });
                });
                describe("when the put request url is invalid  ", () => {
                    describe("when the request review id is invalid ", () => {
                        it("should return the NOT found message and a status 404", () => {
                            return request(api)
                                .put(`/api/reviews/${errorReviewId}/${normalUsername}/movies/${normalMovieId}`)
                                .set("Accept", "application/json")
                                .set('Authorization', userToken)
                                .send({
                                    author: "Dovis1",
                                    rating: 2,
                                    content: "Bad, that is so cool. I want to watch it again!!!"
                                })
                                .expect(404)
                                .expect({success: false, msg: 'The review document is not found to update.', code: 404});
                        });
                    });
                    describe("when the request username is invalid ", () => {
                        it("should return the NOT found message and a status 404", () => {
                            return request(api)
                                .put(`/api/reviews/${normalReviewId}/${errorUsername}/movies/${normalMovieId}`)
                                .set("Accept", "application/json")
                                .set('Authorization', userToken)
                                .send({
                                    author: "Dovis1",
                                    rating: 2,
                                    content: "Bad, that is so cool. I want to watch it again!!!"
                                })
                                .expect(404)
                                .expect({success: false, msg: 'The review document is not found to update.', code: 404});
                        });
                    });
                    describe("when the request movie id is invalid ", () => {
                        it("should return the NOT found message and a status 404", () => {
                            return request(api)
                                .put(`/api/reviews/${normalReviewId}/${normalUsername}/movies/${errorMovieId}`)
                                .set("Accept", "application/json")
                                .set('Authorization', userToken)
                                .send({
                                    author: "Dovis1",
                                    rating: 2,
                                    content: "Bad, that is so cool. I want to watch it again!!!"
                                })
                                .expect(404)
                                .expect({success: false, msg: 'The review document is not found to update.', code: 404});
                        });
                    });
                });
            });
        });

        describe("DELETE /api/reviews/:reviewId/:username/movies/:movieId ", () => {
            describe("when the delete request are valid and the username which has more than one review record  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/reviews/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalReviewsByOneUser = res.body.reviews.length;
                        });
                });
                it("should return the deleted entire review records and a status 200", () => {
                    return request(api)
                        .delete(`/api/reviews/8970871225/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The review is deleted successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.reviews).to.be.a("array");
                            expect(res.body.result.reviews[0]).to.be.a("object");
                            expect(res.body.result.reviews.length).to.equal(numOriginalReviewsByOneUser - 1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/reviews/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.reviews.length).to.equal(numOriginalReviewsByOneUser - 1);
                        });
                });
            });

            describe("when the delete request are valid and the username which has just last one review record  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/reviews`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalAllReviewsData = res.body.results.length;
                        });
                });
                it("should return the confirmation information for deleting the last one successfully and a status 200", () => {
                    return request(api)
                        .delete(`/api/reviews/8971871231/user2/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .expect({
                            success: true,
                            msg: 'The review is deleted and no more reviews left, so the entire document is deleted.',
                            code: 200
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/reviews`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.results.length).to.equal(numOriginalAllReviewsData - 1);
                        });
                });
            });
        });

    });
});