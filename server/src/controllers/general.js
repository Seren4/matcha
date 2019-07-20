var express = require('express');
var router = express.Router();
var general_model = require('../models/general.js');
var crypto = require("crypto");

/**
 * ERROR CHECK ZONE
 */
function validation(field, value) {
    let re;
    switch (field) {
        case 'login':
            re = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{3,13}$/;
            break;
        case 'id':
            re = /^[0-9a-fA-F]+$/;
            break;
        case 'verb':
            re = new RegExp("^(sent|put|remove|reciprocate|pay)$");
            break;
        case 'object':
            re = new RegExp("^(message|like|visit)$");
            break;
    }
    return re.test(value);
}

router.get('/get_profiles/:user_id', function (req, res)
{
    if (req.params.user_id && validation('id', req.params.user_id)) {
        let user_id = req.params.user_id;
        general_model.get_profiles(user_id, function (error, results) {
            if (error) res.send({success: false, message: "Profiles cannot be retrieved!"});
            else res.send({success: true, message: "Profiles retrieved!", response: results});

        })
    }
    else res.send({success: false, message: "Profiles cannot be retrieved!"});

});

/**
 * GET PEOPLE I BANNED
 * */
router.get('/get_banned/:user_id', function (req, res)
{
    if (req.params.user_id && validation('id', req.params.user_id)) {
        let user_id = req.params.user_id;
        general_model.get_banned(user_id, function (error, results) {
            if (error) res.send({success: false, message: "Profiles cannot be retrieved!"});
            else res.send({success: true, message: "Profiles retrieved!", response: results});
        })
    }
    else res.send({success: false, message: "Profiles cannot be retrieved!"});


});

router.get('/:option(get_visits|get_likes)/:user_id', function (req, res)
{
    if (req.params.user_id && validation('id', req.params.user_id)) {
        let user_id = req.params.user_id;
        let option = req.params.option;
        general_model.get_visitors_likers(option, user_id, function (error, results) {
            if (error) res.send({success: false, message: "Visitors/Likers cannot be retrieved!"});
            else res.send({success: true, message: "Visitors/Likers retrieved!", response: results});

        })
    }
    else res.send({success: false, message: "Visitors/Likers cannot be retrieved!"});

});


router.get('/user_exists/:card_id/', function (req, res)
{
    if (req.params.card_id && validation('id', req.params.card_id)) {
        let card_id = req.params.card_id;
        general_model.user_exists(card_id, function (error, message, result) {
            if (error) res.send({success: false, message: message, result: result});
            else res.send({success: true, message: message, result: result});
        })
    }
    else res.send({success: false, message: message, result: result});

});

router.post('/:option(visit|like|ban)/', function (req, res)
{
    if (req.body.actor_user_id && validation('id', req.body.actor_user_id) && req.body.target_user_id && validation('id', req.body.target_user_id)) {
        let actor_user_id = req.body.actor_user_id;
        let target_user_id = req.body.target_user_id;
        let option = req.params.option;
        if (actor_user_id !== target_user_id) {
            general_model.add_visit_like_ban(option, actor_user_id, target_user_id, function (error) {
                if (error) res.send({success: false, message: "Error while adding " + req.params.option});
                else res.send({success: true, message: req.params.option + " record added"});
            })
        }
    }
    else res.send({success: false, message: "Error while adding " + req.params.option});
});

router.post('/get_like_status/', function (req, res)
{
    if (req.body.data.actor_user_id && validation('id', req.body.data.actor_user_id) && req.body.data.target_user_id && validation('id', req.body.data.target_user_id)) {

        let actor_user_id = req.body.data.actor_user_id;
        let target_user_id = req.body.data.target_user_id;
        if (actor_user_id !== target_user_id) {
            general_model.get_like_status(actor_user_id, target_user_id, function (error, outcome) {
                if (error) res.send({success: false, message: "Error while getting like status"});
                else if (!error && outcome === true) res.send({success: true, message: "Like record retrieved"});
                else if (!error && outcome === false) res.send({success: false, message: "Like record not found"});
            })
        }
    }
    else res.send({success: false, message: "Error while getting like status"});
});

router.post('/get_ban_status/', function (req, res)
{
    if (req.body.data.actor_user_id && validation('id', req.body.data.actor_user_id) && req.body.data.target_user_id && validation('id', req.body.data.target_user_id)) {
        let actor_user_id = req.body.data.actor_user_id;
        let target_user_id = req.body.data.target_user_id;
        if (actor_user_id !== target_user_id) {
            general_model.get_ban_status(actor_user_id, target_user_id, function (error, outcome) {
                if (error) res.send({success: false, message: "Error while getting ban status"});
                else if (!error && outcome === true) res.send({success: true, message: "Ban record retrieved"});
                else if (!error && outcome === false) res.send({success: false, message: "Ban record not found"});
            })
        }
    }
    else res.send({success: false, message: "Ban record not found"});
});

/**
 * RETRIEVE SCORE
 * */
router.post('/get_score/', function (req, res)
{
    if (req.body.data.user_id && validation('id', req.body.data.user_id)){
        let user_id = req.body.data.user_id;
        general_model.get_score(user_id, function (error, score) {
            if (error) res.send({success: false});
            else res.send({success: true, score: score});
        })
    }
    else res.send({success: false});
});

router.post('/report_fake/', function (req, res)
{
    if (req.body.actor_user_id && validation('id', req.body.actor_user_id) && req.body.target_user_id && validation('id', req.body.target_user_id)) {
        let actor_user_id = req.body.actor_user_id;
        let target_user_id = req.body.target_user_id;
        if (actor_user_id !== target_user_id) {
            general_model.report_fake(actor_user_id, target_user_id, function (error) {
                if (error) res.send({success: false, message: "Error while reporting as fake"});
                else res.send({success: true, message: "Report as fake ok"});
            })
        }
    }
    else res.send({success: false, message: "Error while reporting as fake"});
});

router.post('/get_fake_status/', function (req, res)
{
    if (req.body.data.actor_user_id && validation('id', req.body.data.actor_user_id) && req.body.data.target_user_id && validation('id', req.body.data.target_user_id)) {
        let actor_user_id = req.body.data.actor_user_id;
        let target_user_id = req.body.data.target_user_id;
        if (actor_user_id !== target_user_id) {
            general_model.get_fake_status(actor_user_id, target_user_id, function (error, outcome) {
                if (error) res.send({success: false, message: "Error while getting fake status"});
                else if (!error && outcome) res.send({success: true, message: "Fake record retrieved"});
                else if (!error && !outcome) res.send({success: false, message: "Fake record not found"});
            })
        }
    }
    else res.send({success: false, message: "Error while getting fake status"});
});

router.post('/store_id/', function (req, res)
{
    if (req.body.login && validation('login', req.body.login) && req.body.user_id && validation('id', req.body.user_id) && req.body.id ){
        let login = req.body.login;
        let id = req.body.id;
        let user_id = req.body.user_id;
        general_model.store_id(login, user_id, id, function (error, outcome) {
            if (error) res.send({success: false, message: "Error while storing socket id"});
            else if (!error && outcome) res.send({success: true, message: "Socket id stored"});
            else res.send({success: false, message: "Error while storing socket id"});

        })
    }
    else res.send({success: false, message: "Error while storing socket id"});
});

router.post('/create_room/', function (req, res)
{
    if (req.body.login1 && validation('login', req.body.login1) && req.body.login2
        && validation('login', req.body.login2) && req.body.user1_id && validation('id', req.body.user1_id)
        && req.body.user2_id && validation('id', req.body.user2_id))
    {
        let login1 = req.body.login1;
        let login2 = req.body.login2;
        let user1_id = req.body.user1_id;
        let user2_id = req.body.user2_id;
        let room = crypto.randomBytes(20).toString('hex');
        general_model.create_room(login1, user1_id, login2, user2_id, room, function (error, outcome, room_id) {
            if (error || !outcome) res.send({success: false, message: "Error while creating room"});
            else if (!error && outcome) res.send({success: true, message: "Room created", room_id: room_id});
        })
    }
    else res.send({success: false, message: "Error while creating room"});

});

/**
 * GET CHAT HISTORY
 * */
router.post('/retrieve_history/', function (req, res)
{
    if (req.body.room_id && validation('id', req.body.room_id)) {
        let room_id = req.body.room_id;
        general_model.retrieve_history(room_id, function (error, success, results) {res.send({success: success, history: results});})
    }
    else res.send({success: false, history: null});

});

router.post('/retrieve_chats/', function (req, res)
{
    if (req.body.user_id && validation('id', req.body.user_id)) {
        let user_id = req.body.user_id;
        general_model.retrieve_chats(user_id, function (error, results) {res.send({error: error, chats: results});})
    }
    else res.send({error: true, chats: null});

});

/**
 * Retrieve single chat on profile completion/uncompletion for page Chat
 */
router.post('/retrieve_one_chat/', function (req, res)
{
    if (req.body.from_user_id && validation('id', req.body.from_user_id) && req.body.to_user_id && validation('id', req.body.to_user_id)) {
        let from_user_id = req.body.from_user_id;
        let to_user_id = req.body.to_user_id;
        general_model.retrieve_one_chat(from_user_id, to_user_id, function (error, results) {res.send({error: error, chats: results});})
    }
    else res.send({error: true, chats: null});
});

/**
 *  ACTION
 */
router.post('/action/', function (req, res)
{
    let {actor_id, verb, object, target_id} = req.body;
    if (verb && validation('verb', verb) && object && validation('object', object)
        && target_id && validation('id', target_id) && actor_id && validation('id', actor_id))
    {
        let values = {actor_id, verb, object, target_id};
        general_model.action(values, function (error, results) {res.send({error: error, results: results});})
    }
    else res.send({error: true, results: null});
});


router.post('/retrieve_notification/', function (req, res)
{
    if (req.body.target_id && validation('id', req.body.target_id))
    {
        let target_id = req.body.target_id;
        general_model.retrieve_notification(target_id, function (error, results) {res.send({error: error, notification: results});})
    }
    else res.send({error: true, notification: null});

});

router.post('/retrieve_notification_chat/', function (req, res)
{
    if (req.body.target_id && validation('id', req.body.target_id))
    {
        let target_id = req.body.target_id;
        general_model.retrieve_notification_chat(target_id, function (error, results) {res.send({error: error, notification: results});})
    }
    else res.send({error: true, notification: null});
});

router.post('/update_notification/', function (req, res)
{
    if (req.body.target_id && validation('id', req.body.target_id))
    {
        let target_id = req.body.target_id;
        general_model.update_notification(target_id, function (error, results) {res.send({error:error, notification:results});})
    }
    else res.send({error: true, notification: null});
});
router.post('/update_notification_chat/', function (req, res)
{
    if (req.body.target_id && validation('id', req.body.target_id) && req.body.actor_id && validation('id', req.body.actor_id))
    {
        let target_id = req.body.target_id;
        let actor_id = req.body.actor_id;
        general_model.update_notification_chat(target_id,actor_id, function (error, results) {res.send({error:error, notification:results});})
    }
    else res.send({error: true, notification: null});
});

module.exports = router;
