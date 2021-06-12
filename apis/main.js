var userModel = require("../models/user");
var resumeModel = require("../models/resume");

// var ProfileImages = require("../models/profilemodel");
var crypto = require("crypto-js");
var nodemailer = require('nodemailer');
const util = require("util");
var upload = require("../helper/profileImageController");

var emailHelper = require("./../helper/email")
var TOKEN_VALIDITY = 24 * 60 * 60 * 1000;
var AES_KEY = '6fnhkgo71s0caeqma6ojjftu4n1m1d85';
var BASE_URL = '';
var async = require('async');

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverRide = require("method-override");




// module.

module.exports.fnLogin = (req, res, next) => {
    var response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var userName = req.body.email
        var password = req.body.password
        userName = (userName && typeof userName === 'string') ? userName.trim() : null;
        password = (password && typeof password === 'string') ? password.trim() : null;
        console.log(userName)
        console.log(req.body.email)
        console.log(password)
        console.log(req.body.password)
        if (userName && password) {
            userModel.findOne({
                $or: [
                    { email: userName },
                    { username: userName },
                    { phone: userName }
                ]
            })
                .lean()
                .exec(function (e1, result) {
                    if (!e1) {
                        password = crypto.SHA256(password).toString();
                        if (result && result.password == password) {
                            if (result.status) {
                                delete result.password;
                                var token = result._id.toString()
                                token = crypto.AES.encrypt(token, AES_KEY).toString();
                                result.token = token;
                                response.status = 'success';
                                response.data = result;
                                response.msg = '';
                                res.json(response);
                            } else {
                                response.msg = "You are blocked.";
                                res.json(response);
                            }
                        } else {
                            response.msg = "Invalid credential.";
                            res.json(response);
                        }
                    } else {
                        console.log('Server error --> fnLogin --> e1', e1);
                        res.json(response);
                    }
                })
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnLogin --> e', e);
        res.json(response);
    }
}


module.exports.fnLoginWithLinkedin = (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var linkedinId = req.body.linkedinId;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        linkedinId = (linkedinId) ? linkedinId.trim() : null;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;
        if (linkedinId && email) {
            userModel.findOne({ email: email, linkedinId: linkedinId }).lean().exec(function (e1, result) {
                if (!e1) {
                    if (result && result._id) {
                        delete result.password;
                        var token = result._id.toString()
                        token = crypto.AES.encrypt(token, AES_KEY).toString();
                        result.token = token;
                        response.status = 'success';
                        response.data = result;
                        response.msg = '';
                        res.json(response);
                    } else {
                        var userData = {
                            linkedinId: linkedinId,
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            name: firstName && lastName ? firstName + ' ' + lastName : '',
                            status: 1
                        };
                        userModel(userData).save({ lean: true }, function (e2, savedUserData) {
                            if (!e2) {
                                if (savedUserData && savedUserData._id) {
                                    savedUserData = savedUserData.toObject()
                                    var token = savedUserData._id.toString()
                                    token = crypto.AES.encrypt(token, AES_KEY).toString();
                                    delete savedUserData.password;
                                    savedUserData["token"] = token;
                                    response.status = 'success';
                                    response.data = savedUserData;
                                    response.msg = '';
                                    res.json(response);
                                } else {
                                    console.log('Server error --> fnLoginWithLinkedin --> e2', 'error while save data');
                                    res.json(response);
                                }
                            } else {
                                console.log('Server error --> fnLoginWithLinkedin --> e2', e2);
                                res.json(response);
                            }
                        })
                    }
                } else {
                    console.log('Server error --> fnLoginWithLinkedin --> e1', e1);
                    res.json(response);
                }
            })
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {

        console.log('Server error --> fnLoginWithLinkedin --> e', e);
        res.json(response);
    }
}

module.exports.fnLoginWithGoogle = (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var googleId = req.body.googleId;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        googleId = (googleId) ? googleId.trim() : null;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;
        if (googleId && email) {
            userModel.findOne({ email: email, googleId: googleId }).lean().exec(function (e1, result) {
                if (!e1) {
                    if (result && result._id) {
                        delete result.password;
                        var token = result._id.toString()
                        token = crypto.AES.encrypt(token, AES_KEY).toString();
                        result.token = token;
                        response.status = 'success';
                        response.data = result;
                        response.msg = '';
                        res.json(response);
                    } else {
                        var userData = {
                            googleId: googleId,
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            name: firstName && lastName ? firstName + ' ' + lastName : '',
                            status: 1
                        };
                        userModel(userData).save(function (e2, savedUserData) {
                            if (!e2) {
                                if (savedUserData && savedUserData._id) {
                                    savedUserData = savedUserData.toObject()
                                    var token = savedUserData._id.toString()
                                    token = crypto.AES.encrypt(token, AES_KEY).toString();
                                    savedUserData.token = token;
                                    response.status = 'success';
                                    response.data = savedUserData;
                                    response.msg = '';
                                    res.json(response);
                                } else {
                                    console.log('Server error --> fnLoginWithGoogle --> e2', 'error while save data');
                                    res.json(response);
                                }
                            } else {
                                console.log('Server error --> fnLoginWithGoogle --> e2', e2);
                                res.json(response);
                            }
                        })
                    }
                } else {
                    console.log('Server error --> fnLoginWithGoogle --> e1', e1);
                    res.json(response);
                }
            })
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnLoginWithGoogle --> e', e);
        res.json(response);
    }

}

module.exports.fnRegister = (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var phone = req.body.phone;
        var password = req.body.password;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        firstName = (firstName && typeof firstName === 'string') ? firstName.trim() : null;
        lastName = (lastName && typeof lastName === 'string') ? lastName.trim() : null;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;
        phone = (phone && typeof phone === 'string') ? phone.trim() : null;
        // userName = (userName && typeof userName === 'string') ? userName.trim() : null;
        password = (password && typeof password === 'string') ? password.trim() : null;
        if (firstName && lastName && email && phone && password) {
            userModel.findOne({ $or: [{ email: email }] }).exec(function (e1, result) {
                if (!e1) {
                    if (result && result._id) {
                        response.msg = 'Already registered';
                        res.json(response);
                    } else {

                        password = crypto.SHA256(password).toString();
                        var userData = {
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            name: firstName + ' ' + lastName,
                            password: password,
                            phone: phone,
                            status: 1
                        };
                        userModel(userData).save(function (e2, savedUserData) {
                            if (!e2) {
                                if (savedUserData && savedUserData._id) {
                                    savedUserData = savedUserData.toObject();
                                    var token = savedUserData._id.toString()
                                    token = crypto.AES.encrypt(token, AES_KEY).toString();

                                    savedUserData.token = token;
                                    savedUserData['token'] = token;

                                    response.status = 'success';
                                    response.data = savedUserData;
                                    response.msg = '';
                                    res.json(response);
                                } else {
                                    console.log('Server error --> fnRegister --> e2', 'error while save data');
                                    res.json(response);
                                }
                            } else {
                                console.log('Server error --> fnRegister --> e1', e1);
                                res.json(response);
                            }
                        })
                    }

                } else {
                    console.log('Server error --> fnRegister --> e1', e1);
                    res.json(response);
                }
            })
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnRegister --> e', e);
        res.json(response);
    }
}


async function getLatestResdetails(userinfo) {
    var resumes = await resumeModel.find({ userId: userinfo._id }).lean();
    console.log(userinfo.usertype);
    var userSampleData = {};
    userSampleData.id = userinfo._id;
    userSampleData.Name = userinfo.name;
    userSampleData.phone = userinfo.phone;
    userSampleData.usertype = userinfo.usertype;
    userSampleData.email = userinfo.email;




    // console.log(userResume);
    if (resumes.length == 0) {
        userSampleData.city = "Not Defined";
        userSampleData.state = "Not Defined";
        userSampleData.jobTitle = "Not Defined";
        userSampleData.country = "Not Defined";

        var updateUser = userSampleData;
        // console.log(updateUser);
        return updateUser;

        // userinfo.push(userSampleData);

    } else {
        var dateList = [];

        if (dateList.some(date => date === null)) {
            var id = resumes[0]._id;
            var resResult = await resumeModel.findOne({ _id: id }).lean();
            // resumeModel.findOne({ _id: id }).lean().exec(function (e1, resResult) {
            !(resResult.city == "" || resResult.city == undefined) ? userSampleData.city = resResult.city.toString() : userSampleData.city = "Not Defined";
            !(resResult.state == "" || resResult.state == undefined) ? userSampleData.state = resResult.state.toString() : userSampleData.state = "Not Defined";
            !(resResult.jobTitle == "" || resResult.jobTitle == undefined) ? userSampleData.jobTitle = resResult.jobTitle.toString() : userSampleData.jobTitle = "Not Defined";
            !(resResult.country == "" || resResult.country == undefined) ? userSampleData.country = resResult.country.toString() : userSampleData.country = "Not Defined";
            !(resResult.country == "" || resResult.country == undefined) ? userSampleData.country = resResult.country.toString() : userSampleData.country = "Not Defined";

            // updatedUserdata.push(userSampleData);
            var updateUser = userSampleData;
            return updateUser;
        } else {
            var indexOfMaxValue = dateList.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
            var id = resumes[indexOfMaxValue]._id;
            var resResult = await resumeModel.findOne({ _id: id }).lean();
            !(resResult.city == "" || resResult.city == undefined) ? userSampleData.city = resResult.city.toString() : userSampleData.city = "Not Defined";
            !(resResult.state == "" || resResult.state == undefined) ? userSampleData.state = resResult.state.toString() : userSampleData.state = "Not Defined";
            !(resResult.jobTitle == "" || resResult.jobTitle == undefined) ? userSampleData.jobTitle = resResult.jobTitle.toString() : userSampleData.jobTitle = "Not Defined";
            !(resResult.country == "" || resResult.country == undefined) ? userSampleData.country = resResult.country.toString() : userSampleData.country = "Not Defined";

            var updateUser = userSampleData;
            return updateUser;
        };
    }


}

module.exports.fnGetAllUsersLatestData = async (req, res, next) => {
    var updatedUserdata = [];

    var response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }

    try {
        var userData = await userModel.find().lean();
        try {
            var userNewData = userData.filter((user) => user.usertype != "MAINADMIN");
            for (let index = 0; index < userNewData.length; index++) {
                if (userNewData[index] != "MAINADMIN") {
                    const userinfo = userNewData[index];
                    var updateddata = await getLatestResdetails(userinfo);
                    updatedUserdata.push(updateddata);
                }

            }

        } catch (e) {
            console.log('Server error --> fnGetResumeList --> e', e);
            res.json(response);
        }
        res.json({
            status: "success",
            data: updatedUserdata,
        })

    } catch (e) {

        console.log('Server error --> fnUpdateResume --> e', e);
        res.json(response);
    }
    // console.log(updatedUserdata);

}


module.exports.fnAdminRegister = (req, res, next) => {


    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var email = req.body.email;
        var phone = req.body.phone;
        var password = req.body.password;
        var usertype = req.body.usertype;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        firstName = (firstName && typeof firstName === 'string') ? firstName.trim() : null;
        lastName = (lastName && typeof lastName === 'string') ? lastName.trim() : null;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;
        phone = (phone && typeof phone === 'string') ? phone.trim() : null;
        // userName = (userName && typeof userName === 'string') ? userName.trim() : null;
        console.log(firstName);

        // console.log(firstName + lastName + email + phone + password);
        if (firstName && lastName && email && phone && password) {

            userModel.findOne({ $or: [{ email: email }, { phone: phone }] }).exec(function (e1, result) {
                if (!e1) {
                    if (result && result._id) {
                        response.msg = 'Already registered';
                        res.json(response);
                    } else {
                        console.log("Success Admin");
                        password = crypto.SHA256(password).toString();
                        var userData = {
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            name: firstName + ' ' + lastName,
                            password: password,
                            phone: phone,
                            status: 1,
                            usertype: usertype,

                        };
                        userModel(userData).save(function (e2, savedUserData) {
                            if (!e2) {
                                if (savedUserData && savedUserData._id) {
                                    savedUserData = savedUserData.toObject();
                                    var token = savedUserData._id.toString()
                                    token = crypto.AES.encrypt(token, AES_KEY).toString();

                                    savedUserData.token = token;
                                    savedUserData['token'] = token;

                                    response.status = 'success';
                                    response.data = savedUserData;
                                    response.msg = 'Admin Successfully Added';
                                    res.json(response);
                                } else {
                                    console.log('Server error --> fnRegister --> e2', 'error while save data');
                                    res.json(response);
                                }
                            } else {
                                console.log('Server error --> fnRegister --> e1', e2);
                                res.json(response);
                            }
                        })
                    }

                } else {
                    console.log('Server error --> fnRegister --> e1', e1);
                    res.json(response);
                }
            })
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnRegister --> e', e);
        res.json(response);
    }
}




module.exports.fnGetAllUsersData = async (req, res, next) => {
    var response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }

    try {
        const userData = await userModel.find({ usertype: "USER" }).lean();
        res.json({
            status: "success",
            data: userData
        })
    } catch (e) {
        console.log('Server error --> fnUpdateResume --> e', e);
        res.json(response);
    }
}


module.exports.fnUpdateProfile = (req, res, next) => {
    var response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }

    try {
        var userId = req.body.userId;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var phoneNo = req.body.phone;
        var email = req.body.email;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        firstName = (firstName && typeof firstName === 'string') ? firstName.trim() : null;
        lastName = (lastName && typeof lastName === 'string') ? lastName.trim() : null;
        phoneNo = (phoneNo && typeof phoneNo === 'string') ? phoneNo.trim() : null;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;
        if (firstName && lastName && phoneNo && email) {
            var userUpdatedData = {
                userId: userId,
                firstName: firstName,
                lastName: lastName,
                phone: phoneNo,
                email: email,
                name: firstName + ' ' + lastName,
            };
            userModel.findOne({ $or: [{ email: email }] }).exec(function (e1, result) {
                console.log(result);

                if (!e1) {
                    if (result && result._id && userId != result._id) {
                        console.log("registered Acc")
                        response.msg = 'Already registered';
                        res.json(response);
                    } else {
                        console.log(userUpdatedData);
                        userModel.findByIdAndUpdate(userId, userUpdatedData, { new: true }, function (e1, result) {
                            if (!e1) {

                                response.status = 'success';
                                response.msg = 'User Details Updated is updated.';
                                response.data = result;
                                res.json(response);
                            } else {
                                console.log('Server error --> FnUpdate User Details --> e1', e1);
                                res.json(response);
                            }
                        })
                    }
                }
            });

        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnUpdateResume --> e', e);
        res.json(response);
    }

}





module.exports.fnGetAdminProfile = async (req, res, next) => {
    let response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    const userId = req.body.userId;
    try {
        if (userId) {
            const userData = await userModel.findById(userId).lean();
            response.status = 'success';
            response.msg = 'User Details Updated By Admin.';
            response.data = userData;
            res.json(response);
        } else {
            res.join({
                status: "error",
                msg: "Bad Request"
            })
        }
    } catch (e) {
        console.log('Server error --> fnGetAdminProfile --> e', e);
        res.json(response);
    }
}

module.exports.fnUpdateAdminProfile = (req, res, next) => {
    var response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }

    try {
        // var userId = req.body.userId;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var phoneNo = req.body.phoneNo;
        var email = req.body.email;
        const userId = req.body.userId;
        console.log("here");
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        firstName = (firstName && typeof firstName === 'string') ? firstName.trim() : null;
        lastName = (lastName && typeof lastName === 'string') ? lastName.trim() : null;
        phoneNo = (phoneNo && typeof phoneNo === 'string') ? phoneNo.trim() : null;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;

        if (firstName && lastName && phoneNo && email && userId) {
            var userUpdatedData = {
                firstName,
                lastName,
                phone: phoneNo,
                email,
                name: firstName + ' ' + lastName,
            };
            userModel.findOneAndUpdate({ _id: userId }, userUpdatedData, { new: true }, function (e1, result) {
                if (!e1) {
                    console.log(e1);
                    var data_old = {
                        email: email,
                        subject: "Alert! User Details Updated",
                        heading: "Updating The Details By The Admin",
                        test: `Your Details Updated \n email -- ${email} to ${email} \n name -- ${firstName + ' ' + lastName}\n phone-no ${phoneNo}`,
                    }
                    var data_update = {
                        email: email,
                        subject: "Alert! User Details Updated",
                        heading: "Updating The Details By The Admin",
                        test: `Your Details Updated \n email -- ${email} to ${email} \n name -- ${firstName + ' ' + lastName}\n phone-no ${phoneNo}`,
                    }
                    emailHelper.sendMail(data_old);
                    emailHelper.sendMail(data_update);

                    response.status = 'success';
                    response.msg = 'User Details Updated By Admin.';
                    response.data = result;
                    res.json(response);
                } else {
                    console.log('Server error --> FnUpdate User Details --> e1', e1);
                    res.json(response);
                }
            })

        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnUpdateResume --> e', e);
        res.json(response);
    }

}


module.exports.fnChangeAdminPassword = async (req, res, next) => {
    let response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        let userId = req.body.userId;
        let oldPassword = req.body.oldPassword;
        let password = req.body.newPassword;
        if (userId && oldPassword && password) {
            if (oldPassword && password) {
                const userData = await userModel.findById(userId).lean();
                oldPassword = crypto.SHA256(oldPassword).toString();
                if (userData && userData.password == oldPassword) {
                    password = crypto.SHA256(password).toString();
                    await userModel.findByIdAndUpdate(userId, { password: password });
                    response.status = "success"
                    response.msg = "Password Changed Successfully";
                    res.json(response);
                } else {
                    response.status = "error"
                    response.msg = "Old Password is not correct";
                    res.json(response);
                }
            } else {
                response.status = "error"
                response.msg = "Bad Request";
                res.json(response);
            }
        } else {
            response.status = "error"
            response.msg = "Bad Request";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnUpdateResume --> e', e);
        res.json(response);
    }
}




module.exports.fnDeleteUser = (req, res, next) => {
    var response = {
        status: 'error',
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }

    try {
        var email = req.body.email;

        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;

        if (email) {
            userModel.findOne({ $or: [{ email: email }] }).exec(function (e1, result) {
                // console.log(reslut);
                try {
                    if (!e1) {
                        var usertype = result.usertype;

                        // MAINADMIN,
                        if (usertype !== "MAINADMIN") {
                            userModel.remove({ email: email }, function (e1, result) {
                                if (!e1) {
                                    console.log(e1);
                                    var data = {
                                        email: email,
                                        subject: "Alert! User Deleted",
                                        heading: "Deleting Account By The Admin",
                                        test: `Your Account Has been Deleted by the ADMIN`,
                                    }

                                    emailHelper.sendMail(data);
                                    response.status = 'success';
                                    response.msg = 'User Deleted By Admin.';
                                    response.data = result;
                                    res.json(response);
                                } else {
                                    console.log('Server error --> Delete User Details --> e1', e1);
                                    res.json(response);
                                }
                            })
                        } else {
                            response.msg = "User is Main Admin.";
                            res.json(response);
                        }
                    }
                } catch (error) {
                    response.msg = "User Not Found";
                    res.json(response);
                }


            }

            )



        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnUpdateResume --> e', e);
        res.json(response);
    }

}

module.exports.fnChangePassword = async (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }

    try {
        var userId = req.session.userId;
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;
        oldPassword = (oldPassword && typeof oldPassword === 'string') && oldPassword.length > 6 ? oldPassword.trim() : null;
        newPassword = (newPassword && typeof newPassword === 'string') && newPassword.length > 6 ? newPassword.trim() : null;
        if (oldPassword && newPassword) {
            var userData = await userModel.findById(userId).lean();
            oldPassword = crypto.SHA256(oldPassword).toString();
            if (userData && userData.password == oldPassword) {
                newPassword = crypto.SHA256(newPassword).toString();
                await userModel.findByIdAndUpdate(userId, { password: newPassword });
                response.status = "success"
                response.msg = "";
                res.json(response);
            } else {
                response.msg = "Invalid credential.";
                res.json(response);
            }
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }

    } catch (e) {
        console.log('Server error --> fnChangePassword --> e', e);
        res.json(response);
    }
}

module.exports.fnForgotPasswordEmailSend = async (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var email = req.body.email;
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        email = (email && typeof email === 'string' && re.test(String(email).toLowerCase())) ? email.trim() : null;
        if (email) {
            var userData = await userModel.findOne({ email: email }).lean();
            if (userData && userData.email) {
                var otp = Math.floor(100000 + Math.random() * 900000).toString();
                await userModel.findOneAndUpdate({ email: email }, { otp: otp });
                //send mail
                console.log(otp);
                var data = {
                    email: userData.email,
                    subject: "Otp for reset password",
                    heading: "Password Change Request",
                    test: `your otp for reset password on resume app is  ${otp.toString()}`,
                }
                emailHelper.sendMail(data);
                response.status = "success";
                response.msg = "otp send to your register email address for reset password";
                res.json(response);
            } else {
                response.msg = "You are not Registered";
                res.json(response);
            }

        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnForgotPasswordEmailSend --> e', e);
        res.json(response);
    }
}







module.exports.fnVerifyOtpForForgotPassword = async (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        var otp = req.body.otp;
        var email = req.body.email;
        var password = req.body.password;
        password = (password && typeof password === 'string') ? password.trim() : null;
        email = (email && typeof email === 'string') ? email.trim() : null;
        otp = (otp && typeof otp === 'string') ? otp.trim() : null;
        if (email && password && otp) {
            var userData = await userModel.findOne({ email: email, otp: otp }).lean();
            if (userData && userData._id && userData.otp) {
                password = crypto.SHA256(password).toString();
                await userModel.findOneAndUpdate({ email: email, otp: otp }, { password: password, otp: "" });
                response.status = "success";
                response.msg = "your password is changed. try with login";
                res.json(response);
            } else {
                response.msg = "Invalid Parameters.";
                res.json(response);
            }
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnVerifyOtpForForgotPassword --> e', e);
        res.json(response);
    }
}

module.exports.fnGetLoginUserDetails = (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {
        userModel.findById(req.session.userId).lean().exec(function (e1, result) {
            if (!e1) {
                delete result.password;
                response.status = 'success';
                response.data = result;
                response.msg = '';
                res.json(response);
            } else {
                console.log("Server error --> fnGetLoginUserDetails --> e1 --> " + e1);
                res.json(response);
            }
        })
    } catch (e) {
        console.log("Server error --> fnGetLoginUserDetails --> e --> " + e);
        res.json(response);
    }
}

var accomplishmentsModel = require("../models/accomplishments");
var affiliationsModel = require("../models/affiliations");
var certificationsModel = require("../models/certifications");
var jobDescriptionModel = require("../models/jobDescription");
var skillsModel = require("../models/skills");
var summaryModel = require("../models/summary");
var jobtitleModel = require("../models/jobtitle");
var fieldOfStudyModel = require("../models/fieldOfStudy");
var degreeModel = require("../models/degree");
module.exports.fnGetChildDataCount = async (req, res, next) => {
    var response = {
        status: "error",
        msg: 'Something happened wrong, please try again after sometime.',
        data: {},
        method: req.url.split('/')[req.url.split('/').length - 1]
    }
    try {

        let jobtitleId = req.body.jobtitleId
        jobtitleId = (jobtitleId && typeof jobtitleId === 'string') ? jobtitleId.trim() : null;
        // 5d562bd23022f752159b6012
        if (jobtitleId) {
            let accomplishments = await accomplishmentsModel.countDocuments({ jobtitle: jobtitleId })
            let affiliations = await affiliationsModel.countDocuments({ jobtitle: jobtitleId })
            let certifications = await certificationsModel.countDocuments({ jobtitle: jobtitleId })
            let jobDescription = await jobDescriptionModel.countDocuments({ jobtitle: jobtitleId })
            let skills = await skillsModel.countDocuments({ jobtitle: jobtitleId })
            let summary = await summaryModel.countDocuments({ jobtitle: jobtitleId })
            let jobtitle = await jobtitleModel.findById(jobtitleId)
            let data = {
                accomplishments: accomplishments,
                affiliations: affiliations,
                certifications: certifications,
                jobDescription: jobDescription,
                skills: skills,
                summary: summary,
                jobtitle: jobtitle,
            }
            response.data = data;
            response.status = 'success'
            response.msg = ''
            res.json(response)
        } else {
            response.msg = "Invalid Parameters.";
            res.json(response);
        }
    } catch (e) {
        console.log('Server error --> fnGetChildDataCount --> e', e);
        res.json(response);
    }
}

module.exports.fnAuthoriseToken = async (req, res, next) => {
    var response = {
        status: 'error',
        msg: 'Unauthorised request.'
    };
    try {
        if (req.session.userId) {
            next();
        } else {
            response.code = 401;
            res.json(response);
        }
    } catch (e) {
        console.log("Server error --> fnAuthoriseToken --> e --> " + e);
        res.json(response);
    }
}
const axios = require('axios');
const resume = require("../models/resume");
module.exports.fnTest = async (req, res, next) => {
    let objectid = "";
    var summaryData = [];
    var skillData = [];
    var responsibilityData = [];
    // const data = req.body.data;
    let data = req.body.data;


    for (let index = 1; index < data.length; index++) {
        const element = data[index];
        if (element["Job Title"]) {
            let jobdata = await jobtitleModel.findOne({ title: element["Job Title"] });
            if (jobdata && jobdata._id) {
                console.log(jobdata._id)
                objectid = jobdata._id;

            } else {
                var d = await jobtitleModel({ 'title': element["Job Title"] }).save()
                console.log("data");
                console.log("data");
                console.log(d);
                console.log("data");
                objectid = d.toObject()._id;
            }
        }
        if (element["Summary / Professional Summery"]) {
            summaryData.push({
                "title": element["Summary / Professional Summery"].trim(),
                "jobtitle": objectid.toString().trim(),
                "expFlag": [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5"
                ]
            })
        }
        if (element["Skills"]) {
            skillData.push({
                "title": element["Skills"].trim(),
                "jobtitle": objectid.toString().trim(),
                "expFlag": [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5"
                ]
            })
        }
        if (element["Respnocibilities"] && objectid.toString().trim()) {
            responsibilityData.push({
                "description": element["Respnocibilities"].trim(),
                "jobtitle": objectid.toString().trim(),
                "expFlag": [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5"
                ]
            })
        }
    }
    /*
        for (let index = 0; index < summaryData.length; index++) {
                const element = summaryData[index];
                await summaryModel.findOneAndDelete({"jobtitle":element.jobtitle,"title":element.title});
                
                // var d =  await summaryModel.deleteMany({"jobtitle":element.jobtitle,"title":element.title})
                // if(!(d && d._id)){
                        await summaryModel(element).save();
                // }
        }

        for (let index = 0; index < skillData.length; index++) {
                const element = skillData[index];
                var d =  await skillsModel.findOneAndDelete({"jobtitle":element.jobtitle,"title":element.title})
                // var d =  await skillsModel.deleteMany({"jobtitle":element.jobtitle,"title":element.title})
                // if(!(d && d._id)){
                        await skillsModel(element).save();
                // }
        }
        */
    console.log(responsibilityData.length)
    for (let index = 0; index < responsibilityData.length; index++) {
        const element = responsibilityData[index];
        var d = await jobDescriptionModel.findOneAndDelete({ "jobtitle": element.jobtitle, "description": element.title })
        // var d =  await jobDescriptionModel.deleteMany({"jobtitle":element.jobtitle,"description":element.title})
        // if(!(d && d._id)){
        await jobDescriptionModel(element).save();
        // }
    }

    console.log("i am here");
    res.json({
        status: "success",
        msg: "Imported Successfully"
    });
}