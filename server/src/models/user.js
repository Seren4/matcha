var pool = require('../modules/db_connector');
const sendmail = require('sendmail')({ silent: true});
const bcrypt = require("bcrypt");
var crypto = require("crypto");


/**
 * REGISTER
 * */
exports.register = function (values, done) {
    let link = "http://localhost:8080/verify/" + values.rand;
    let sql = "INSERT INTO users (id, name, surname, login, email, password, hash, age, room_perso, card_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let val = [values.id, values.name, values.surname, values.login, values.email, values.password, values.rand, values.age, values.room_perso, values.card_id];
    pool.query(sql, val, function (err, rows) {
            if (err || !rows.affectedRows) {
                return done("User already existing.");
            }
            else {
                let mail_error = false;
                sendmail(
                    {
                        from: 'nimeni@oranek.com',
                        to: values.email,
                        subject: 'Please confirm your Email account',
                        html: "Hello! Click <a href=" + link + ">here</a> to verify your email."
                    },
                    function (err)
                    {
                        if (err)
                        {
                            let sql = "DELETE FROM users WHERE email=?";
                            pool.query(sql, values.email, function (err)
                            {
                                if (err) return done("The mail you inserted is not valid!");

                            });
                            return done("The mail you inserted is not valid!")
                        }
                        return done(null);
                    });
            }
        });
};

exports.activate_user = function (hash, done) {

    let sql = "UPDATE users SET status=? WHERE hash=?";
    pool.query(sql, [1, hash], function (err, rows)
    {
        if (!err && rows.affectedRows)
        {
            let rand = crypto.randomBytes(20).toString('hex');
            sql = "UPDATE users SET hash=? WHERE hash=?";
            pool.query(sql, [rand, hash], function (error, rows) {
                if (!error && rows.affectedRows)
                    return done(null)
                else return done(true)
            })
        }
        else return done(true)
    })
};

/**
 * LOGIN
 **/
exports.login = function (login, password, done)
{
    let sql = "SELECT id,password,complete FROM users WHERE login=? AND status=?";
    pool.query(sql, [login, 1], function (err, rows)
    {

        if (rows.length === 1)
        {
            if (bcrypt.compareSync(password, rows[0].password))
                return done("User found", rows[0].id, rows[0].complete);
            else
                return done("Wrong password");
        }
        else
            return done("User not found")
    })
};
/**
 * MAIL RESET PASSWORD
 * */

exports.mailResetPw = function (email, done)
{
    let hash = crypto.randomBytes(40).toString('hex');
    let link = "http://localhost:8080/resetPw/" + hash;
    let sql = "UPDATE users SET hash=? WHERE email=?";
    pool.query(sql, [hash, email], function (err, rows) {
        if (err || !rows.affectedRows)
            return done("Mail not found.");
        else
        {
            sendmail({
                    from: 'nimeni@oranek.com',
                    to: email,
                    subject: 'Reset Password',
                    html: "Hello! Click <a href=" + link + ">here</a> to change your password."},
                function (err) {
                    if (err) return done("The mail you inserted is not valid!");
                    return done(null);
                });
        }
    });
};

/**
 * RESET PASSWORD
 */
exports.resetPw = function (hash, password, done) {

    let new_hash = crypto.randomBytes(40).toString('hex');

    let sql = "UPDATE users SET password=?, hash=? WHERE hash=?";
    pool.query(sql, [password, new_hash, hash], function (err, rows) {
        if (rows.affectedRows)
            return done(true);
        else
            return done(false);
    });
};

/**
 * Retrieve user profile, photos or account data
 * */
exports.get_user_data = function (login, option, done) {
    let sql;
    if (option === "get_profile")
    {
        let fields = 'a.id,a.name,a.surname,a.login,a.age,a.pref,a.gender,a.complete,a.score,a.bio,a.online,a.logout_time,a.city,a.country,a.country_code,a.postcode,a.lat,a.lng';
        sql = "SELECT " + fields + " , CONCAT(GROUP_CONCAT(b.tag)) tags FROM users a LEFT JOIN login_tags b " +
            "ON a.login = b.login WHERE a.login=? GROUP BY a.login";
    }
    if (option === "get_mail")
        sql = "SELECT email FROM users WHERE login=?";
    else if (option === "get_photos")
        sql = "SELECT image1,image2,image3,image4 FROM users WHERE login=?";
    else if (option === "get_profile_pic")
        sql = "SELECT image_profile,complete FROM users WHERE login=?";
    pool.query(sql, login, function (err, rows) {
        if (err)
            return done(true);
        else
            return done(null, rows);
    });
};

/**
 * GET ALL EXISTING TAGS
 */
exports.get_all_tags = function (done) {
    let sql = "SELECT * FROM tags";
    pool.query(sql, function (err, rows)
    {
        if (err)
            return done(true);
        else
            return done(null, rows);
    });
};



/**
 * CHECK USER COMPLETION
 */
exports.get_user_completion = function(user_id, done)
{
    let sql = "SELECT complete,lat,lng,room_perso FROM users WHERE id=? AND status=?";
     pool.query(sql, [user_id,1], function (err, rows)
     {
         if (err)
             return done(0);
         else if (rows && rows[0])
             return done(rows[0].complete,{lat:rows[0].lat, lng:rows[0].lng}, rows[0].room_perso);
     });
};


/**
 * EDIT PROFILE
 */
function buildConditions(params) {
    let fields;
    let values = [];
    let obj = {};
    let param;

    for (param in params)
    {
            if (fields)
                fields += ', ' + param + '=?';
            else
                fields = ' ' + param + '=?';
            values.push(params[param]);
    }
    obj.fields = fields;
    obj.values = values;
    return (obj);
}

/**
 * EDIT USER DATA/ACCOUNT/PHOTOS
 * */
function update_table(sql, values, user_id, option, done)
{
    pool.query(sql, values, function (err, rows)
    {
        let message = option.replace(/^(.*)_/, "");
        if (err || rows.affectedRows === 0)
            return done(message + " cannot be updated!", null);
        else
        {
            let sql = "SELECT a.name,a.surname,a.gender,a.bio,a.age,a.image_profile,CONCAT(GROUP_CONCAT(b.tag)) tags " +
                "FROM users a INNER JOIN login_tags b ON a.id = b.user_id WHERE a.id=? AND a.status=? GROUP BY a.id";

            pool.query(sql, [user_id, 1] , function (err, rows)
            {
                if (rows.length >= 1 && rows[0].image_profile && rows[0].age && rows[0].bio && rows[0].gender && rows[0].name && rows[0].surname && rows[0].tags)
                {
                    let sql_up = "UPDATE users SET complete=? WHERE id=? AND status=?";
                    pool.query(sql_up, [1, user_id, 1], function (err)
                    {
                        if (err)
                            return done(message + " cannot be updated!", null);
                        else
                            return done(null, message + " successfully updated!");
                    });
                }
                else
                {
                    let sql_up = "UPDATE users SET complete = ? WHERE id=? AND status=?";
                    pool.query(sql_up, [0, user_id, 1], function (err)
                    {
                        if (err)
                            return done(message + " cannot be updated!", null);
                        else
                            return done(null, message + " successfully updated!");
                    });
                }
            });
        }
    });
}

exports.edit_user_data = function (option, user_id, values, done)
{
    let obj, sql, match;
    if (option === "edit_password" || option === "edit_login" || option === "edit_email") //account section
    {
        sql = "SELECT * FROM users WHERE id=? AND status=?";
        pool.query(sql, [user_id, 1], function (err, rows)
        {
            if (rows && rows[0].password && values.password)
            {
                match = bcrypt.compareSync(values.password, rows[0].password);
                if (match)
                {
                    if (option === "edit_login")
                        obj = buildConditions({"login": values.new_login});
                    else if (option === "edit_email")
                        obj = buildConditions({"email": values.new_email});
                    else
                        obj = buildConditions({"password": bcrypt.hashSync(values.new_password, 5)});

                    sql = 'UPDATE users SET' + obj.fields + " WHERE id=?";
                    obj.values.push(user_id);
                    update_table(sql, obj.values, user_id, option, done);
                }
                else
                    return done("Wrong password");
            }
            else
                return done("User not found");
        });
    }
    else // photos,profile,profile_pic,delete_img
    {
        obj = buildConditions(values);
        sql = 'UPDATE users SET' + obj.fields + " WHERE id=?";
        obj.values.push(user_id);
        update_table(sql, obj.values, user_id, option, done);
    }
};

/**
 * ADD TAG
 */
exports.add_user_tag = function (values, done) {
    let sql = "SELECT 1 FROM users WHERE id=? AND status=?";
    pool.query(sql, [values.user_id, 1], function (err, rows) {
        if (err)
            return done(true);
        let sql = "INSERT IGNORE INTO tags (tag) VALUES(?)";
        pool.query(sql, values.tag, function (err)
        {
            if (err)
                return done(true);
            sql = "INSERT INTO login_tags (tag, login, user_id) VALUES (?, ?, ?)";
            update_table(sql, [values.tag, values.login, values.user_id], values.user_id, 'Tag', done);
        })
    })
};

/**
 * DELETE TAG
 */
exports.delete_user_tag = function (values, done) {
    let sql = "SELECT 1 FROM users WHERE id=? AND status=?";
    pool.query(sql, [values.user_id, 1], function (err) {
        if (err)
            return done(err);
        let sql = "SELECT 1 FROM tags WHERE tag=?";                 //check if tags exists, before deleting it
        pool.query(sql, values.tag, function (err, rows) {
            if (err || rows.length === 0)
                return done(err);
            sql = "DELETE FROM login_tags WHERE user_id=? AND tag=?";
            update_table(sql, [values.user_id, values.tag], values.user_id, 'Tag', done);
        })
    })
};



/**
 * Logout endpoint
 */
exports.logout = function (session_id, done) {
    let sql = 'DELETE FROM sessions WHERE session_id=?';
    pool.query(sql, session_id, function (err, rows) {
        if (err || !rows.affectedRows)
            return done("Session not found | not destroyed");
        return done(null);
    });
};

/**
 * STORE POSITION
 */

exports.store_position = function (values, user_id, done) {

    let obj = buildConditions(values);
    let sql = 'UPDATE users SET' + obj.fields + ' WHERE id=?';
    obj.values.push(user_id);
    pool.query(sql, obj.values, function (err, rows) {
        if (err || !rows.affectedRows) return done("error");
        else return done(null)
    });

};

 /**
 * GET USER_ID FROM SESSION_ID
 */
exports.get_user_id = function (session_id, done) {
    let sql = "SELECT data FROM sessions WHERE session_id=?";
    pool.query(sql, session_id, function (err, rows) {

        if (rows && rows[0]) {
            let data_parsed = JSON.parse(rows[0].data);
            sql = "SELECT login,room_perso, complete FROM users WHERE id=?";
            pool.query(sql, data_parsed.userID, function (err, rows)
            {
                if (err)
                    return done(true);
                else
                    return done(null, data_parsed.userID, rows[0].login,rows[0].room_perso,rows[0].complete);
            });
        }
        else
            return done("No session found");

    });

};
