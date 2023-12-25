import chai from "chai";
import request from "supertest";

const mongoose = require("mongoose");
import ToWatchList from "../../../../api/toWatchList/toWatchListModel";
import api from "../../../../index";
import toWatchList from "../../../../seedData/toWatchList";

const expect = chai.expect;
let db;
let userToken;
let normalUsername = toWatchList[0].username;
let newUsername = "user99";
let errorUsername = "user9999999";
let normalMovieId = toWatchList[0].toWatchList[0];
let errorMovieId = "99999999999";
let newMovieId = "385687";
let numOriginalToWatchListsByOneUser;
let numOriginalAllToWatchListsData;

describe("ToWatchLists endpoint", () => {
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
            await ToWatchList.deleteMany();
            await ToWatchList.collection.insertMany(toWatchList);
        } catch (err) {
            console.error(`failed to Load toWatchList test Data: ${err}`);
        }
    });
    afterEach(() => {
        api.close();
    });

    describe("Unauthenticated scenarios for toWatchList endpoint ", () => {
        it("should return a 500 status code if the user is unauthenticated", () => {
            return request(api)
                .get("/api/toWatchList")
                .set("Accept", "application/json")
                .expect(500);
        });
    });
    describe("Authenticated scenarios for toWatchList endpoint ", () => {
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
        describe("GET /api/toWatchList ", () => {
            it("should return the 2 toWatchList data and a status 200", (done) => {
                request(api)
                    .get("/api/toWatchList")
                    .set("Accept", "application/json")
                    .set('Authorization', userToken)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body).to.be.a("object");
                        expect(Object.keys(res.body).length).to.equal(4);
                        expect(res.body.results).to.be.a("array");
                        expect(res.body.results.length).to.equal(2);
                        res.body.results.forEach((userToWatchList) => {
                            expect(userToWatchList).to.be.a("object");
                            expect(Object.keys(userToWatchList).length).to.equal(3);
                            expect(userToWatchList.toWatchList).to.be.a("array");
                            expect(userToWatchList.toWatchList).to.not.be.null;
                        });
                        done();
                    });
            });
        });

        describe("GET /api/toWatchList/:username ", () => {
            //Normal
            describe("when the request username actually exists  ", () => {
                it("should return toWatchList movie ids of the specific user and a status 200", () => {
                    return request(api)
                        .get(`/api/toWatchList/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.toWatchList).to.be.a("array");
                            expect(res.body.toWatchList.length).to.equal(6);
                        });
                });
            });
            //Error
            describe("when the request username actually does not exist  ", () => {
                it("should return the NOT found message and a status 404", () => {
                    return request(api)
                        .get(`/api/toWatchList/${errorUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(404)
                        .expect({success:false, message: 'The toWatchLists you requested of this user could not be found.', code: 404});
                });
            });
        });

        describe("POST /api/toWatchList/:username/movies/:movieId ", () => {
            //Normal
            describe("when username and movieId of the post request are valid and the username which has toWatchList records  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/toWatchList/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalToWatchListsByOneUser = res.body.toWatchList.length;
                        });
                });
                it("should return the new entire toWatchList records and a status 200", () => {
                    return request(api)
                        .post(`/api/toWatchList/${normalUsername}/movies/${newMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The new id of movie to watch of this user is added successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.toWatchList).to.be.a("array");
                            expect(res.body.result.toWatchList.length).to.equal(numOriginalToWatchListsByOneUser + 1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/toWatchList/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.toWatchList.length).to.equal(numOriginalToWatchListsByOneUser + 1);
                        });
                });
            });

            describe("when username and movieId of the post request are valid and the username which does not have toWatchList records  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/toWatchList`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalAllToWatchListsData = res.body.results.length;
                        });
                });
                it("should return the new entire toWatchList records of a new username and a status 200", () => {
                    return request(api)
                        .post(`/api/toWatchList/${newUsername}/movies/${newMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The first id of movie to watch of this user is added successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.toWatchList).to.be.a("array");
                            expect(res.body.result.toWatchList.length).to.equal(1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/toWatchList`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.results.length).to.equal(numOriginalAllToWatchListsData + 1);
                        });
                });
            });
        });


        describe("DELETE /api/toWatchList/:username/movies/:movieId ", () => {
            //Normal
            describe("when the delete request is valid and the username which has more than one toWatchList record  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/toWatchList/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalToWatchListsByOneUser = res.body.toWatchList.length;
                        });
                });
                it("should return the deleted entire toWatchList records and a status 200", () => {
                    return request(api)
                        .delete(`/api/toWatchList/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The id of movie to watch is deleted successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.toWatchList).to.be.a("array");
                            expect(res.body.result.toWatchList.length).to.equal(numOriginalToWatchListsByOneUser - 1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/toWatchList/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.toWatchList.length).to.equal(numOriginalToWatchListsByOneUser - 1);
                        });
                });
            });

            describe("when the delete request are valid and the username which has just last one toWatchList record  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/toWatchList`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalAllToWatchListsData = res.body.results.length;
                        });
                });
                it("should return the confirmation information for deleting the last one successfully and a status 200", () => {
                    return request(api)
                        .delete(`/api/toWatchList/user2/movies/726209`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .expect({
                            success: true,
                            msg: 'The id of movie to watch is deleted and no more ids of movies to watch left, so the entire document is deleted.',
                            code: 200
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/toWatchList`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.results.length).to.equal(numOriginalAllToWatchListsData - 1);
                        });
                });
            });

            //Error
            describe("when the delete request fails  ", () => {
                describe("when the username of delete request is invalid  ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .delete(`/api/toWatchList/${errorUsername}/movies/${normalMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success: false, msg: 'The toWatchList document is not found to delete.', code: 404});
                    });
                });
                describe("when the movie id of delete request is invalid  ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .delete(`/api/toWatchList/${normalUsername}/movies/${errorMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success: false, msg: 'The toWatchList document is not found to delete.', code: 404});
                    });
                });
            });

        });

    });
});