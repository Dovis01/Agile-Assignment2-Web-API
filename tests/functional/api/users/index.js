import chai from "chai";
import request from "supertest";

const mongoose = require("mongoose");
import User from "../../../../api/users/userModel";
import api from "../../../../index";
import users from "../../../../seedData/users";
import userAvatar from "../../../../seedData/userAvatar";

const expect = chai.expect;
let db;
let userToken;
let normalUsername = users[0].username;
let errorUsername = "user333";

describe("Users endpoint", () => {
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
            await User.deleteMany();
            // Register two users
            await request(api).post("/api/users?action=register").send({
                username: "user1",
                email: '134119874@gmail.com',
                password: "test123@",
            });
            await request(api).post("/api/users?action=register").send({
                username: "user2",
                email: '1344141114@gmail.com',
                password: 'test456@',
            });
            await request(api).post("/api/users?action=register").send({
                username: 'Dovis',
                email: '134414@gmail.com',
                password: 'test456@',
            });
        } catch (err) {
            console.error(`failed to Load users test Data: ${err}`);
        }
    });
    afterEach(() => {
        api.close();
    });

    describe("Unauthenticated scenarios for users endpoint", () => {
        describe("GET /api/users ", () => {
            it("should return the 3 users and a status 200", (done) => {
                request(api)
                    .get("/api/users")
                    .set("Accept", "application/json")
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body).to.be.a("array");
                        expect(res.body.length).to.equal(3);
                        res.body.forEach((user) => {
                            expect(user).to.have.property('username');
                            expect(user).to.have.property('email');
                            expect(user).to.have.property('password');
                        });
                        let result = res.body.map((user) => user.username);
                        expect(result).to.have.members(["user1", "user2", "Dovis"]);
                        done();
                    });
            });
        });

        describe("GET /api/users/:username ", () => {
            describe("when the request username actually exists  ", () => {
                it("should return the specific user details and a status 200", () => {
                    return request(api)
                        .get(`/api/users/${normalUsername}`)
                        .set("Accept", "application/json")
                        .expect(200)
                        .then((res) => {
                            expect(res.body).to.be.a("object");
                            expect(Object.keys(res.body).length).to.equal(5);
                            expect(res.body).to.have.property('username');
                            expect(res.body).to.have.property('email');
                            expect(res.body).to.have.property('password');
                        });
                });
            });
            describe("when the request username actually does not exist  ", () => {
                it("should return the NOT found message and a status 404", () => {
                    return request(api)
                        .get(`/api/users/${errorUsername}`)
                        .set("Accept", "application/json")
                        .expect(404)
                        .expect({success: false, msg: 'User not found.', code: 404});
                });
            });
        });

        describe("POST /api/users ", () => {
            describe("For a register action like signing up", () => {
                describe("when the request body params (payload) are correct", () => {
                    //Normal
                    it("should return a 201 status and the confirmation message for creating successfully", () => {
                        return request(api)
                            .post("/api/users?action=register")
                            .send({
                                username: "user3",
                                email: "136422@qq.com",
                                password: "test123@",
                            })
                            .expect(201)
                            .expect({success: true, msg: 'User successfully created.', code: 201});
                    });
                    after(() => {
                        return request(api)
                            .get("/api/users")
                            .set("Accept", "application/json")
                            .expect(200)
                            .then((res) => {
                                expect(res.body.length).to.equal(4);
                                const result = res.body.map((user) => user.username);
                                expect(result).to.have.members(["user1", "user2", "user3", "Dovis"]);
                            });
                    });

                    //Boundary
                    it("should return a 201 status and the confirmation message for password length is 8", () => {
                        return request(api)
                            .post("/api/users?action=register")
                            .send({
                                username: "user3",
                                email: "13441414@163.com",
                                password: "test123@",
                            })
                            .expect(201)
                            .expect({success: true, msg: 'User successfully created.', code: 201});
                    });
                    after(() => {
                        return request(api)
                            .get("/api/users")
                            .set("Accept", "application/json")
                            .expect(200)
                            .then((res) => {
                                expect(res.body.length).to.equal(4);
                                const result = res.body.map((user) => user.username);
                                expect(result).to.have.members(["user1", "user2", "user3", "Dovis"]);
                            });
                    });

                    it("should return a 201 status and the confirmation message for password length is 15", () => {
                        return request(api)
                            .post("/api/users?action=register")
                            .send({
                                username: "user3",
                                email: "13441414@wit.com",
                                password: "tteesstt112233@",
                            })
                            .expect(201)
                            .expect({success: true, msg: 'User successfully created.', code: 201});
                    });
                    after(() => {
                        return request(api)
                            .get("/api/users")
                            .set("Accept", "application/json")
                            .expect(200)
                            .then((res) => {
                                expect(res.body.length).to.equal(4);
                                const result = res.body.map((user) => user.username);
                                expect(result).to.have.members(["user1", "user2", "user3", "Dovis"]);
                            });
                    });
                });

                //Error
                describe("when the request body params (payload) are incorrect", () => {
                    describe("when the request params (payload) is empty ", () => {
                        it("should return a 400 status code and the error message for requiring three fields", () => {
                            return request(api)
                                .post("/api/users?action=register")
                                .send({})
                                .expect(400)
                                .expect({success: false, msg: 'Username, email and password are required.', code: 400});
                        });
                    });

                    describe("when one of the unique request params (payload) already exists ", () => {
                        it("should return a 401 status and the error message for username already exists", () => {
                            return request(api)
                                .post("/api/users?action=register")
                                .send({
                                    username: "user1",
                                    email: "136422@qq.com",
                                    password: "test123@",
                                })
                                .expect(401)
                                .expect({success: false, msg: 'Username already exists.', code: 401});
                        });
                        it("should return a 401 status and the error message for email already exists", () => {
                            return request(api)
                                .post("/api/users?action=register")
                                .send({
                                    username: errorUsername,
                                    email: "1344141114@gmail.com",
                                    password: "test123@",
                                })
                                .expect(401)
                                .expect({success: false, msg: 'Email already exists.', code: 401});
                        });
                    });

                    describe("when the password in payload is invalid ", () => {
                        it("should return a 400 status and the error message for password is too short", () => {
                            return request(api)
                                .post("/api/users?action=register")
                                .send({
                                    username: errorUsername,
                                    email: "13441414@163.com",
                                    password: "t",
                                })
                                .expect(400)
                                .expect({
                                    success: false,
                                    msg: 'Password must be between 8 and 15 characters long and contain at least one number, one letter and one special character.',
                                    code: 400
                                });
                        });
                        it("should return a 400 status and the error message for password is too long", () => {
                            return request(api)
                                .post("/api/users?action=register")
                                .send({
                                    username: errorUsername,
                                    email: "13441414@163.com",
                                    password: "tttttttttttttttttttttttttttttttttt212@",
                                })
                                .expect(400)
                                .expect({
                                    success: false,
                                    msg: 'Password must be between 8 and 15 characters long and contain at least one number, one letter and one special character.',
                                    code: 400
                                });
                        });
                        it("should return a 400 status and the error message for password does not match passwordValidator", () => {
                            return request(api)
                                .post("/api/users?action=register")
                                .send({
                                    username: errorUsername,
                                    email: "13441414@163.com",
                                    password: "t2222222",
                                })
                                .expect(400)
                                .expect({
                                    success: false,
                                    msg: 'Password must be between 8 and 15 characters long and contain at least one number, one letter and one special character.',
                                    code: 400
                                });
                        });
                    });
                });
            });

            describe("For an authenticate action like signing in", () => {
                describe("when the authentication method is by username and the payload is correct", () => {
                    //Normal
                    describe("when the payload is correct", () => {
                        it("should return a 200 status and a generated token", () => {
                            return request(api)
                                .post("/api/users?authMethod=username")
                                .send({
                                    username: "user1",
                                    password: "test123@",
                                })
                                .expect(200)
                                .then((res) => {
                                    expect(res.body.success).to.be.true;
                                    expect(res.body.token).to.not.be.undefined;
                                    expect(res.body).to.have.property('email', users[0].email);
                                    expect(res.body).to.have.property('code', 200);
                                });
                        });
                    });
                    //Error
                    describe("when the payload is not correct", () => {
                        it("should return a 404 status and fail to authenticate for incorrect username", () => {
                            return request(api)
                                .post("/api/users?authMethod=username")
                                .send({
                                    username: errorUsername,
                                    password: "test123@",
                                })
                                .expect(404)
                                .expect({
                                    success: false,
                                    msg: 'Authentication failed. User not found. Please check your username.',
                                    code: 404
                                });
                        });
                        it("should return a 401 status and fail to authenticate for wrong password", () => {
                            return request(api)
                                .post("/api/users?authMethod=username")
                                .send({
                                    username: normalUsername,
                                    password: "test1233@",
                                })
                                .expect(401)
                                .expect({success: false, msg: 'Wrong password.', code: 401});
                        });
                    });
                });
                describe("when the authentication method is by email and the payload is correct", () => {
                    //Normal
                    describe("when the payload is correct", () => {
                        it("should return a 200 status and a generated token", () => {
                            return request(api)
                                .post("/api/users?authMethod=email")
                                .send({
                                    email: "134119874@gmail.com",
                                    password: "test123@",
                                })
                                .expect(200)
                                .then((res) => {
                                    expect(res.body.success).to.be.true;
                                    expect(res.body.token).to.not.be.undefined;
                                    expect(res.body).to.have.property('username', users[0].username);
                                    expect(res.body).to.have.property('code', 200);
                                });
                        });

                    });
                    //Error
                    describe("when the payload is not correct", () => {
                        it("should return a 404 status and fail to authenticate for incorrect email", () => {
                            return request(api)
                                .post("/api/users?authMethod=email")
                                .send({
                                    email: "1341177777@gmail.com",
                                    password: "test123@",
                                })
                                .expect(404)
                                .expect({
                                    success: false,
                                    msg: 'Authentication failed. User not found. Please check your email.',
                                    code: 404
                                });
                        });
                        it("should return a 401 status and fail to authenticate for wrong password", () => {
                            return request(api)
                                .post("/api/users?authMethod=email")
                                .send({
                                    email: "134119874@gmail.com",
                                    password: "test1233@",
                                })
                                .expect(401)
                                .expect({success: false, msg: 'Wrong password.', code: 401});
                        });
                    });
                });
            });
        });
        });

    describe("Authenticated scenarios for users endpoint", () => {
        before(() => {
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
        describe("PUT /api/user/update/:username ", () => {
            //Common Error
            describe("when there is no update payload ", () => {
                it("should return error and status 400 for missing all required fields", () => {
                    return request(api)
                        .put(`/api/user/update/${normalUsername}`)
                        .set('Authorization', userToken)
                        .send({})
                        .expect(400)
                        .expect({success: false, msg: 'Lack the update information.', code: 400});
                });
            });

            describe("For updating users' basic information ", () => {
                //Normal
                describe("when payload for users' info is valid ", () => {
                    it("should return success message and status 200 for updating info successfully", () => {
                        return request(api)
                            .put(`/api/user/update/${normalUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                firstName: "Shijin",
                                lastName: "Zhang",
                                phoneNumber: "0892238382",
                                email: "15262795256@gmail.com",
                                city: "Waterford",
                                country: "Ireland",
                                address: "3 The Close, Waterford, Ireland",
                            })
                            .expect(200)
                            .then((res) => {
                                expect(res.body.success).to.be.true;
                                expect(res.body).to.have.property('msg', "User information updated successfully");
                                expect(res.body.user).to.be.a("object");
                                expect(Object.keys(res.body.user).length).to.equal(11);
                                expect(res.body).to.have.property('code', 200);
                            });
                    });
                });

                //Error
                describe("when payload for users' info is invalid ", () => {
                    it("should return error and status 400 for missing some required field (address)", () => {
                        return request(api)
                            .put(`/api/user/update/${normalUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                firstName: "Shijin",
                                lastName: "Zhang",
                                phoneNumber: "0892238382",
                                email: "15262795256@gmail.com",
                                city: "Waterford",
                                country: "Ireland",
                                address: ""
                            })
                            .expect(400)
                            .expect({
                                "success": false,
                                "msg": "Field 'address' cannot be empty.",
                                "code": 400
                            });
                    });
                    it("should return error and status 404 for updating error username", () => {
                        return request(api)
                            .put(`/api/user/update/${errorUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                firstName: "Shijin",
                                lastName: "Zhang",
                                phoneNumber: "0892238382",
                                email: "15262795256@gmail.com",
                                city: "Waterford",
                                country: "Ireland",
                                address: "3 The Close, Waterford, Ireland"
                            })
                            .expect(404)
                            .expect({success: false, msg: 'User not found', code: 404});
                    });
                });

            });
            describe("For updating users' password ", () => {
                //Normal
                describe("when payload for users' password is valid ", () => {
                    it("should return success message and status 200 for updating password successfully", () => {
                        return request(api)
                            .put(`/api/user/update/${normalUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                password: "test123@@@"
                            })
                            .expect(200)
                            .then((res) => {
                                expect(res.body.success).to.be.true;
                                expect(res.body).to.have.property('msg', "Password updated successfully");
                                expect(res.body.user).to.be.a("object");
                                expect(Object.keys(res.body.user).length).to.equal(4);
                                expect(res.body).to.have.property('code', 200);
                            });
                    });
                });

                //Error
                describe("when payload for users' password is invalid ", () => {
                    it("should return error and status 400 for not passing passwordValidator", () => {
                        return request(api)
                            .put(`/api/user/update/${normalUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                password: "test1233333"
                            })
                            .expect(400)
                            .expect({
                                success: false,
                                msg: 'Password must be between 8 and 15 characters long and contain at least one number, one letter and one special character.',
                                code: 400
                            });
                    });
                    it("should return error and status 404 for updating error username password", () => {
                        return request(api)
                            .put(`/api/user/update/${errorUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                password: "test123@@@"
                            })
                            .expect(404)
                            .expect({success: false, msg: 'User not found', code: 404});
                    });
                });

            });

            describe("For updating users' avatar ", () => {
                //Normal
                describe("when payload for users' avatar is valid ", () => {
                    it("should return success message and status 200 for updating avatar successfully", () => {
                        return request(api)
                            .put(`/api/user/update/${normalUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                avatar: userAvatar
                            })
                            .expect(200)
                            .then((res) => {
                                expect(res.body.success).to.be.true;
                                expect(res.body).to.have.property('msg', "Avatar updated successfully");
                                expect(res.body.user).to.be.a("object");
                                expect(Object.keys(res.body.user).length).to.equal(6);
                                expect(res.body.user.avatar).to.not.be.null;
                                expect(res.body).to.have.property('code', 200);
                            });
                    });
                });

                //Error
                describe("when payload for users' avatar is invalid ", () => {
                    it("should return error and status 404 for updating error username avatar", () => {
                        return request(api)
                            .put(`/api/user/update/${errorUsername}`)
                            .set('Authorization', userToken)
                            .send({
                                avatar: userAvatar
                            })
                            .expect(404)
                            .expect({success: false, msg: 'User not found', code: 404});
                    });
                });

            });
        });

        describe("DELETE /api/user/delete/:username ", () => {
            //Normal
            describe("when url param for user's username is valid ", () => {
                it("should return success message and status 200 for deleting user successfully", () => {
                    return request(api)
                        .delete(`/api/user/delete/${normalUsername}`)
                        .set('Authorization', userToken)
                        .expect(200)
                        .then((res) => {
                            expect(res.body.success).to.be.true;
                            expect(res.body).to.have.property('msg', "User successfully deleted.");
                            expect(res.body.result).to.be.a("object");
                            expect(Object.keys(res.body.result).length).to.equal(5);
                            expect(res.body).to.have.property('code', 200);
                        });
                });
            });

            //Error
            describe("when url param for user's username is invalid ", () => {
                it("should return error and status 404 for deleting error username", () => {
                    return request(api)
                        .delete(`/api/user/delete/${errorUsername}`)
                        .set('Authorization', userToken)
                        .expect(404)
                        .expect({success: false, msg: 'User not found.', code: 404});
                });
            });

        });

    });
});
