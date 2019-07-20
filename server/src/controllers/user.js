var express = require('express');
var router = express.Router();
var user_model = require('../models/user.js');
const bcrypt = require("bcrypt");
var crypto = require("crypto");
var Jimp = require('jimp');

/**
 * ERROR CHECK ZONE
 */
function validation(field, value) {
    let re;
    switch (field) {
        case 'login':
            re = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{3,13}$/;
            break;
        case 'password':
            re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            break;
        case 'email':
            re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            break;
        case 'name_surname':
            re = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
            break;
        case 'age':
            re = new RegExp("^(18?[1-9]|[1-9][0-9]|[1][1-9][1-9]|101)$");
            break;
        case 'pref':
            re = new RegExp("^(straigth|gay|bisex)$");
            break;
        case 'gender':
            re = /male|female/;
            break;
        case 'tag':
            re = /^[a-zA-Z0-9]+$/;
            break;
        case 'lat':
            re = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
            break;
        case 'lng':
            re = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
            break;
        case 'zipcode':
            re = /^\d{5}$/;
            break;
        case 'country_code':
            re = /^[a-zA-Z]{2}$/;
            break;
        case 'city':
            re = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;
            break;
        case 'hash':
            re = /^[0-9a-fA-F]+$/;
            break;
        case 'id':
            re = /^[0-9a-fA-F]+$/;
            break;
    }
    return re.test(value);
}

function check_input (situation, data) {
    let errors = {};
    switch (situation) {
        case 'login':
            if (!data.login) errors.login = 'Login required.';
            else if (!validation('login', data.login)) errors.login = 'Invalid login.';
            if (!data.password) errors.password = 'Password required.';
            else if (!validation('password', data.password)) errors.password = 'Invalid password.';
            return errors;
        case 'mail_reset_password':
            if (!data.email) errors.email = 'Email required.';
            else if (!validation('email', data.email)) errors.email = 'Valid email required.';
            if (!data.confirm_email) errors.confirm_email = 'Email required.';
            else if (!validation('email', data.confirm_email)) errors.confirm_email = 'Valid email required.';
            if (data.email && data.confirm_email && data.email !== data.confirm_email) errors.mail_match = "Emails don't match";
            return errors;
        case 'reset_password':
            if (!data.hash) errors.hash = 'Hash required.';
            else if (!validation('hash', data.hash)) errors.hash = 'Valid hash required.';
            if (!data.password) errors.password = 'Password required.';
            else if (!validation('password', data.password)) errors.password = 'Valid password required.';
            if (!data.confirm_password) errors.confirm_password = 'Password required.';
            else if (!validation('password', data.confirm_password)) errors.confirm_password = 'Valid password required.';
            if (data.password && data.confirm_password && data.password !== data.confirm_password) errors.password_match = "Passwords don't match";
            return errors;
        case 'register':
            if (!data.name) errors.name = 'Name required.';
            else if (!validation('name_surname', data.name)) errors.name = 'Please enter a valid name.';
            if (!data.surname) errors.surname = 'Surname required.';
            else if (!validation('name_surname', data.surname)) errors.surname = 'Please enter a valid surname.';
            if (!data.age) errors.age = 'Age required.';
            else if (!validation('age', data.age)) errors.age = 'Please enter a valid age.';
            else if (data.age < 18 || data.age > 101) errors.age = 'Age must be between 18 and 101.';
            if (!data.login) errors.login = 'Login required.';
            else if (!validation('login', data.login)) errors.login = 'A valid login must contain letters and can contain numbers, must begin with a letter and have a length between 4 and 12 characters.';
            if (!data.email) errors.email = 'Email required.';
            else if (!validation('email', data.email)) errors.email = 'Valid email required.';
            if (!data.password) errors.password = 'Password required.';
            else if (!validation('password', data.password)) errors.password = "A valid password requires a lowercase and an uppercase character, a number and a special character, a length of at least 8.";
            return errors;
        case 'edit_profile':
            if (!data.name) errors.name = 'Name required.';
            else if (!validation('name_surname', data.name)) errors.name = 'Please enter a valid name.';
            if (!data.surname) errors.surname = 'Surname required.';
            else if (!validation('name_surname', data.surname)) errors.surname = 'Please enter a valid surname.';
            if (!data.age) errors.age = 'Age required.';
            else if (data.age && !validation('age', data.age)) errors.age = 'Please enter a valid age.';
            else if (data.age &&!(data.age > 17 && data.age < 102)) errors.age = 'Age must be at least between 18 and 101.';
            if (data.pref && !validation('pref', data.pref)) errors.pref = 'Please select a preference.';
            if (data.gender && !validation('gender', data.gender)) errors.gender = 'Please select a gender';
            return errors;
        case 'edit_password':
            if (!data.password || !data.new_password || !data.confirm_new_password) errors.isempty = 'Please fill all fields.';
            else {
                if (!validation('password', data.password)) errors.password = 'Invalid password.';
                if (data.new_password !== data.confirm_new_password) errors.pass_match = "Passwords don't match";
                if (!validation('password', data.new_password)) errors.password = 'Invalid password.';
                if (!validation('password', data.confirm_new_password)) errors.password = 'Invalid password.';
                if (data.password === data.new_password === data.confirm_new_password) errors.unchanged = 'Please enter a new password.';
            }
            return errors;
        case 'edit_login':
            if (!data.new_login || !data.password) errors.isempty = 'Please fill all fields.';
            else
            {
                if (!validation('login', data.new_login)) errors.login = 'Invalid username.';
                if (!validation('password', data.password)) errors.password = 'Invalid password.';
                if (data.login && data.login === data.new_login) errors.unchanged = 'Please enter a new login.'
            }
            return errors;
        case 'edit_email':
            if (!data.new_email || !data.password) errors.isempty = 'Please fill all fields.';
            else {
                if (!validation('email', data.new_email)) errors.email = 'Invalid email.';
                if (!validation('password', data.password)) errors.password = 'Invalid password.';
                if (data.email === data.new_email) errors.unchanged = 'Please insert a new email.'
            }
            return errors;
        case 'tag':
            if (!data.tag) errors.tag = 'Please select or insert an interest.';
            else if (!validation('tag', data.tag)) errors.tag = 'Invalid interest.';
            if (!data.login || !validation('login', data.login)) errors.login = "Can't add interest";
            if (!data.user_id) errors.user_id = "Can't add interest.";
            return errors;
        case 'store_position':
            if (!data.user_id || (!data.lat || !validation('lat', data.lat)) || (!data.lng || !validation('lng', data.lng))) errors.location_a = "Invalid request.";
            if (data.city && !validation('city', data.city)) errors.location_b = "Invalid city.";
            if (data.country && !validation('city', data.country)) errors.location_c = "Invalid country.";
            if (data.country_code && !validation('country_code', data.country_code)) errors.location_d = "Invalid country code.";
            if (data.postcode && !validation('zipcode', data.postcode)) errors.location_e = "Invalid postcode.";
            return errors;

    }
}


/**
 * EDIT PROFILE AND ACCOUNT
 **/
router.post(['/:option(edit_profile|edit_password|edit_login|edit_email)/'], function (req, res) {
    let errors, switcher, params;
    let obj, option = req.params.option;
    let values = req.body;
    let model_values;
    if (values.id) {
        let id = values.id;
        if (option === 'edit_profile')// && values.name && values.surname)
        {
            errors = check_input('edit_profile', {
                name: values.name,
                surname: values.surname,
                age: values.age,
                gender: values.gender,
                pref: values.pref
            });
        }
        else if (option === 'edit_password')
        {
            errors = check_input('edit_password', {
                password: values.password,
                new_password: values.new_password,
                confirm_new_password: values.confirm_new_password
            });
        }
        else if (option === 'edit_login'){
            errors = check_input('edit_login', {
                login: values.login,
                new_login: values.new_login,
                password: values.password
            });

        } else if (option === 'edit_email') {
            errors = check_input('edit_email', {
                email: values.email,
                new_email: values.new_email,
                password: values.password
            });
        }
        else
            res.send({success: false, message: '',errors: {fail: "can't upload your data"}});
        if (errors.isempty || errors.login || errors.password || errors.email || errors.unchanged || errors.pass_match || errors.name || errors.surname || errors.age || errors.pref || errors.gender)
            res.send({success: false, message: '', errors: errors});
        else {
            if (option === 'edit_profile')
            {
                if (values.bio) values.bio = values.bio.replace(/</g, " ").replace(/>/g, " ").replace(/&/g, " ").replace(/"/g," ").replace(/'/g," ").replace(/\//g, " ");

                if (!values.pref)
                    values.pref = 'bisex';
                model_values = {name: values.name, surname: values.surname, age: values.age, gender: values.gender, pref: values.pref, bio: values.bio};
            }
            else if (option === 'edit_password')
                model_values = {password: values.password, new_password: values.new_password};
            else if (option === 'edit_login')
                model_values = {password: values.password, new_login: values.new_login};
            else if (option === 'edit_email')
                model_values = {password: values.password, new_email: values.new_email};

            user_model.edit_user_data(option, id, model_values, function (error, message) {
                let error_message;
                if (error)
                {
                    if (option === "edit_profile" || option === "edit-pass") error_message = "Invalid data inserted. Can't update profile.";
                    else if ((option === 'edit_login' && error !== 'Wrong password') || option === 'edit_email')  error_message = "User already existing.";
                    else error_message = error;
                }
                obj = error ? {success: false, message: "Error", errors: {fail: error_message}} : {success: true, message: message};
                res.send(obj);
            });
        }
    }
    else res.send({success: false, message: '', errors: {fail: "can't upload your data"}});
});


/**
 * REGISTER
 */
router.post('/register', function(req, res) {
    let {login,password,name,surname,email,age} = req.body;
    let errors = check_input('register', {login:login, password:password, name:name, surname:surname, age:age, email:email});
    if (errors.login || errors.password || errors.name || errors.surname || errors.email || errors.age)
         res.send({success: false, message:'', errors : errors});
    else
    {
        let values = req.body;
        values.password = bcrypt.hashSync(values.password, 5);
        values.rand = crypto.randomBytes(40).toString('hex');
        values.id = crypto.randomBytes(40).toString('hex');
        values.room_perso = crypto.randomBytes(20).toString('hex');
        values.card_id = crypto.randomBytes(20).toString('hex');
        user_model.register(values, function (error) {
            if (error)
                res.send({success: false, message: "login/email already exists", errors:{register_error:error}});
            else
                res.send({success: true, message: 'User registered successfully!'});
        });
    }
});

/**
 * LOGIN
 */
router.post('/login', function(req, res)
{
    let {login, password} = req.body;
    let errors = check_input('login', {login:login, password:password});
    if (errors.login || errors.password)
        res.send({success: false, message:'', errors : errors});
    else
    {
        user_model.login(login, password, function (message, user_id, complete)
        {
            if (message === "User found")
            {
                req.session.userID = user_id;
                res.send({success: true, message: message, user_id: user_id, sessionID: req.sessionID, complete: complete});
            }
            else res.send({success: false, message:message, errors:{user_not_found:'User not found'}});
        })
    }
});
/**
 * MAIL RESET PASSWORD
 */
router.post('/mailResetPw', function(req, res) {
    let email = req.body.email;
    let confirm_email = req.body.confirm_email;
    let errors = check_input('mail_reset_password', {email:email, confirm_email:confirm_email});
    if (errors.email || errors.confirm_email || errors.mail_match) res.send({success: false, message:'', errors : errors});
    else {
        user_model.mailResetPw(email, function (error) {
            if (error) res.send({success: false, message: "email doesn't exist", errors:{mail_reset_pass_error:error}});
            else res.send({success: true, message: 'We sent you an email to reset your password. Check your inbox.'});
        });
    }
});

/**
 * RESET PASSWORD
 */
router.post('/resetPw', function (req, res) {
    let {hash, password, confirm_password} = req.body;
    let errors = check_input('reset_password', {password:password, confirm_password:confirm_password, hash:hash});
    if (errors.password || errors.confirm_password || errors.password_match || errors.hash)
        res.send({success: false, message:'', errors : errors});
    else
    {
        password = bcrypt.hashSync(password, 5);
        user_model.resetPw(hash, password, function (outcome) {
            if (!outcome) res.send({success: false, message: "User not found", errors:{pass_not_changed:'Error encountered while changing your password. Please retry.'}});
            else res.send({success: true, message: 'Passwords have been changed. You may now log in.'});
        });
    }
});

/**
 * GET USER PROFILE, PHOTOS, ACCOUNT, TAGS
 */
router.post('/:option(get_profile_pic|get_profile|get_photos|get_account|get_mail)/', function (req, res)
{
    let option = req.params.option;
    let login = req.body.login;
    if (option && login) {
        user_model.get_user_data(login, option, function (error, results) {
            // todo : server error "Cannot read property 'length' of null", client response === "pic retrieved" ==> client error in USerArea line 113
            if (option === "get_profile_pic" && !results[0].image_profile) {
                res.send({success: false, message: "User " + option + " not found"});
                return;
            }
            if (error) res.send({success: false, message: "User" + option + "found"});
            else res.send({success: true, message: "User " + option + " retrieved!", response: results});
        })
    }
    else res.send({success: false, message: "Error"});
});

/**
 * GET USER PROFILE COMPLETION
 */
router.post('/get_user_completion/', function(req, res)
{
    if (req.body.user_id && validation('id', req.body.user_id)) {
        let user_id = req.body.user_id;
        user_model.get_user_completion(user_id, function (completion, coords, room_perso) {
            res.send({success: true, completion: completion, coords: coords, room_perso: room_perso});
        })
    }
    else res.send({success: false, completion: 0});

});

/**
 * GET ALL EXISTING TAGS
 */
router.get('/get_all_tags/', function(req, res)
{
    user_model.get_all_tags(function (error, tags)
    {
        if (error) res.send({success: false, message: "Cannot retrieve any tags"});
        else res.send({success: true, message: "Tags retrieved correctly", tags:tags});
    })
});



function check_buffer (photo) {

    let url = photo.replace(/^data:image\/\w+;base64,/, "");
    let buffer = Buffer.from(url, 'base64');
    if (buffer.length > 2000000) {
        return true;
    }
    return new Promise((resolve, reject) => {
        Jimp.read(buffer, (error, img) => {

            if (error) resolve(true);
            if (img && img.bitmap.width > 0 && img.bitmap.height > 0) resolve(false);
            else resolve(true);
        });
    });
}


function check_base64 (photo) {
    // Decodes a string of data which has been encoded using base-64 encoding.
    let my_atob = Buffer.from(photo, 'binary').toString('base64');
    // Creates a base-64 encoded ASCII string from a "string" of binary data.
    let my_btoa = Buffer.from(my_atob, 'base64').toString('binary');
    // if (btoa(atob(el)) == el)
    if (!(photo == my_btoa)) {
        return true;
    }
    return false;
}

/**
 *  EDIT PHOTOS edit_profile_pic & edit_photos & delete_img
 **/
router.post(['/:option(edit_profile_pic|edit_photos|delete_img)/'], async function (req, res) {
    let obj, option = req.params.option, values = req.body, errors = null, invalid_index = [];
    let user_id = values.user_id ?  values.user_id : null;
    if (user_id && validation('id', user_id))
    {
        delete values.user_id;
        if (option === "edit_photos" && (values.image1 || values.image2 || values.image3 || values.image4))
        {
            for (let key in values)
            {
                errors = await check_buffer(values[key]).then(function (value) {
                    if (value) return true;
                    else if (check_base64(values[key])) return true;
                    return false;
                });
                if (errors) invalid_index.push(key);
            }
            if (invalid_index)
            {
                for (let i = 0; i < invalid_index.length; i++)
                    delete values[invalid_index[i]];
            }
        }
        else if (option === "edit_profile_pic" && values.image_profile)
        {
            for (let key in values)
            {
                errors = await check_buffer(values[key]).then(function (value) {
                    if (value) return true;
                    else if (check_base64(values[key])) return true;
                    return false;
                });
            }
        }
        else if (option === "delete_img" && values)
        {
            let keys = Object.keys(values);
            if (!(keys.includes('image1') || keys.includes('image2') || keys.includes('image3') || keys.includes('image4') ))
                errors = true;
        }
        if (errors && (option === "delete_img" || option === "edit_profile_pic"))
            res.send({success: false, errors : "Invalid photo"});
        else
        {
            user_model.edit_user_data(option, user_id, values, function (error, message) {
                obj = error ? {success: false, message: error} : {
                    success: true,
                    message: message,
                    invalid_indexes: invalid_index ? invalid_index : null
                };
                res.send(obj);
            });
        }
    }
    else
        res.send({success: false, errors : "Invalid params"});
});



/**
 * ADD TAGS
 **/
router.post('/add_user_tag', function (req, res) {
    let values = {tag, login, user_id} = req.body;
    let errors = check_input('tag', {login:login, user_id:user_id, tag:tag});
    if (errors.tag) res.send({success: false, message: "add_user_tag error", errors : errors});
    else
    {
        user_model.add_user_tag(values, function (error)
        {
            if (error) res.send({success: false, message: "add_user_tag error",  errors :{tag_error:"Can't add interest."}});
            else res.send({success: true, message: 'Tag added!'});
        });
    }
});

/**
 * DELETE TAGS
 **/
router.post('/delete_user_tag', function (req, res) {
    let values = {tag, login, user_id} = req.body;
    let errors = check_input('tag', {login:login, user_id:user_id, tag:tag});
    if (errors.tag) res.send({success: false, message: "add_user_tag error", errors : errors});
    else
    {
        user_model.delete_user_tag(values, function (error) {
            if (error) res.send({success: false, message: "delete_user_tag error", errors :{tag_error:"Can't delete interest."}});
            else res.send({success: true, message: 'Tag-login deleted!'});
        })
    }
});


router.get('/verify/:id', function (req, res) {
    let re = /^[0-9a-fA-F]+$/;
    let hash = req.params.id;
    if (re.test(hash))
    {
        user_model.activate_user(hash,function (error) {
            if (error) res.send({success: false, message: "An error has been encountered during the confirmation."});
            else res.send({success: true, message: "Email has been verified. You may now login."});
        })
    }
    else res.send({success: false, message: "An error has been encountered during the confirmation."});
});


/**
 * LOGOUT
 * */
router.post('/logout', function (req, res)
{
    let session = req.body.b_session;
    user_model.logout(session, function () {});
});


/**
 * STORE POSITION
 */
router.post('/store_position', function (req, res) {
    let {lat, lng, city, country, country_code, postcode, user_id} = req.body;
    let errors = check_input('store_position', {lat:lat, lng:lng, city:city, postcode:postcode, country:country, country_code:country_code, user_id:user_id});
    if (errors.location_a || errors.location_b || errors.location_c || errors.location_e || errors.location_d)
        res.send({success: false, message: "store_position error", errors:errors});
    else {
        let values = {lat, lng, city, country, country_code, postcode};
        user_model.store_position(values, req.body.user_id, function (error) {
            if (error) res.send({success: false, message: "store_position error",  errors :{location_f_error:"Invalid request."}});
            else res.send({success: true, message: 'Position modified!'});
        })
    }
});
/**
 * GET USER_ID FROM SESSION_ID
 */
router.post('/get_user_id', function (req, res) {

    let session_id = req.body.session_id;
    if (session_id) {
        user_model.get_user_id(session_id, function (error, user_id, login,room_perso, complete) {
            if (error) res.send({success: false, message: "get_user_id error", error: error});
             else res.send({success: true, message: 'get_user_id ok!', user_id: user_id, login: login, room_perso:room_perso, complete:complete});
        })
    }
    else res.send({success: false, message: "get_user_id error", error: "no user logged"});
});

module.exports = router;
