import chai from "chai";
import request from "supertest";

const mongoose = require("mongoose");
import Favorite from "../../../../api/favorites/favoriteModel";
import api from "../../../../index";
import favorites from "../../../../seedData/favorites";

const expect = chai.expect;
let db;
let userToken;
let normalUsername = favorites[0].username;
let newUsername = "user99";
let errorUsername = "user9999999";
let normalMovieId = favorites[0].favorites[0];
let errorMovieId = "99999999999";
let newMovieId = "385687";
let numOriginalFavoritesByOneUser;
let numOriginalAllFavoritesData;

describe("Favorites endpoint", () => {
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
            await Favorite.deleteMany();
            await Favorite.collection.insertMany(favorites);
        } catch (err) {
            console.error(`failed to Load favorites test Data: ${err}`);
        }
    });
    afterEach(() => {
        api.close();
    });

    describe("Unauthenticated scenarios for favorites endpoint ", () => {
        it("should return a 500 status code if the user is unauthenticated", () => {
            return request(api)
                .get("/api/favorites")
                .set("Accept", "application/json")
                .expect(500);
        });
    });
    describe("Authenticated scenarios for favorites endpoint ", () => {
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
        describe("GET /api/favorites ", () => {
            it("should return the 2 favorites data and a status 200", (done) => {
                request(api)
                    .get("/api/favorites")
                    .set("Accept", "application/json")
                    .set('Authorization', userToken)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body).to.be.a("object");
                        expect(Object.keys(res.body).length).to.equal(4);
                        expect(res.body.results).to.be.a("array");
                        expect(res.body.results.length).to.equal(2);
                        res.body.results.forEach((userFavorites) => {
                            expect(userFavorites).to.be.a("object");
                            expect(Object.keys(userFavorites).length).to.equal(3);
                            expect(userFavorites.favorites).to.be.a("array");
                            expect(userFavorites.favorites).to.not.be.null;
                        });
                        done();
                    });
            });
        });

        describe("GET /api/favorites/:username ", () => {
            //Normal
            describe("when the request username actually exists  ", () => {
                it("should return favorite movie ids of the specific user and a status 200", () => {
                    return request(api)
                        .get(`/api/favorites/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.favorites).to.be.a("array");
                            expect(res.body.favorites.length).to.equal(6);
                        });
                });
            });
            //Error
            describe("when the request username actually does not exist  ", () => {
                it("should return the NOT found message and a status 404", () => {
                    return request(api)
                        .get(`/api/favorites/${errorUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(404)
                        .expect({
                            success: false,
                            message: 'The favorites you requested of this user could not be found.',
                            code: 404
                        });
                });
            });
        });

        describe("POST /api/favorites/:username/movies/:movieId ", () => {
            //Normal
            describe("when username and movieId of the post request are valid and the username which has favorites records  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/favorites/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalFavoritesByOneUser = res.body.favorites.length;
                        });
                });
                it("should return the new entire favorites records and a status 200", () => {
                    return request(api)
                        .post(`/api/favorites/${normalUsername}/movies/${newMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The new favorite movie id of this user is added successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.favorites).to.be.a("array");
                            expect(res.body.result.favorites.length).to.equal(numOriginalFavoritesByOneUser + 1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/favorites/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.favorites.length).to.equal(numOriginalFavoritesByOneUser + 1);
                        });
                });
            });

            describe("when username and movieId of the post request are valid and the username which does not have favorites records  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/favorites`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalAllFavoritesData = res.body.results.length;
                        });
                });
                it("should return the new entire favorites records of a new username and a status 200", () => {
                    return request(api)
                        .post(`/api/favorites/${newUsername}/movies/${newMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The first favorite movie id of this user is added successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.favorites).to.be.a("array");
                            expect(res.body.result.favorites.length).to.equal(1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/favorites`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.results.length).to.equal(numOriginalAllFavoritesData + 1);
                        });
                });
            });
        });


        describe("DELETE /api/favorites/:username/movies/:movieId ", () => {
            //Normal
            describe("when the delete request are valid and the username which has more than one favorites record  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/favorites/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalFavoritesByOneUser = res.body.favorites.length;
                        });
                });
                it("should return the deleted entire favorites records and a status 200", () => {
                    return request(api)
                        .delete(`/api/favorites/${normalUsername}/movies/${normalMovieId}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property("msg", "The favorite movie id is deleted successfully.");
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(3);
                            expect(res.body.result.favorites).to.be.a("array");
                            expect(res.body.result.favorites.length).to.equal(numOriginalFavoritesByOneUser - 1);
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/favorites/${normalUsername}`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.favorites.length).to.equal(numOriginalFavoritesByOneUser - 1);
                        });
                });
            });

            describe("when the delete request are valid and the username which has just last one favorites record  ", () => {
                beforeEach(() => {
                    return request(api)
                        .get(`/api/favorites`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            numOriginalAllFavoritesData = res.body.results.length;
                        });
                });
                it("should return the confirmation information for deleting the last one successfully and a status 200", () => {
                    return request(api)
                        .delete(`/api/favorites/user2/movies/726209`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .expect(200)
                        .expect({
                            success: true,
                            msg: 'The favorite movie id is deleted and no more favorite movie ids left, so the entire document is deleted.',
                            code: 200
                        });
                });
                after(() => {
                    return request(api)
                        .get(`/api/favorites`)
                        .set("Accept", "application/json")
                        .set('Authorization', userToken)
                        .then((res) => {
                            expect(res.body.results.length).to.equal(numOriginalAllFavoritesData - 1);
                        });
                });
            });

            //Error
            describe("when the delete request fails  ", () => {
                describe("when the username of delete request is invalid  ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .delete(`/api/favorites/${errorUsername}/movies/${normalMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success: false, msg: 'The favorite document is not found to delete.', code: 404});
                    });
                });
                describe("when the movie id of delete request is invalid  ", () => {
                    it("should return the NOT found message and a status 404", () => {
                        return request(api)
                            .delete(`/api/favorites/${normalUsername}/movies/${errorMovieId}`)
                            .set("Accept", "application/json")
                            .set('Authorization', userToken)
                            .expect(404)
                            .expect({success: false, msg: 'The favorite document is not found to delete.', code: 404});
                    });
                });
            });

        });

    });
});