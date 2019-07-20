var pool = require('../modules/db_connector');

/**
 * CHECK USER EXISTENCE
 * */
exports.user_exists = function (card_id, done) {

    let fields = 'a.id,a.card_id,a.room_perso,a.name,a.surname,a.login,a.age,a.pref,a.gender,a.complete,a.score,a.bio,a.online,a.logout_time,' +
        'a.image_profile, a.image1, a.image2, a.image3, a.image4,a.city,a.country,a.country_code,a.postcode';
    let sql = "SELECT " + fields + " , CONCAT(GROUP_CONCAT(b.tag)) tags FROM users a LEFT JOIN login_tags b " +
        "ON a.id = b.user_id WHERE a.card_id=? AND a.complete=? GROUP BY a.card_id";
    pool.query(sql, [card_id, 1], function (error, rows)
    {
        if (error)
            return done(true, "User not found", null);
        else if (rows.length === 1)
            return done(null, "User found", rows[0]);
        else
            return done(null, "User not found", null);
    });
};

/**
 * GET ALL PROFILES
 * */
exports.get_profiles = function (user_id, done) {
    let fields = 'a.card_id,a.name,a.surname,a.login,a.age,a.pref,a.gender,a.complete,a.score,a.image_profile,a.lat,a.lng,a.city,a.country,a.country_code,a.postcode';
    let sql = "SELECT " + fields + " , CONCAT(GROUP_CONCAT(b.tag)) tags FROM users a LEFT JOIN login_tags b " +
        "ON a.id = b.user_id WHERE a.id<>? AND a.complete = ? AND b.user_id<>? GROUP BY a.login";
    pool.query(sql, [user_id, 1, user_id], function (err, rows) {
        if (err)
            return done(true);
        else
            return done(null, rows);
    });
};

/**
 * GET PEOPLE I BANNED
 * */
exports.get_banned = function (user_id, done) {
    let sql = "SELECT users.card_id FROM users INNER JOIN ban ON users.id = ban.banned_id WHERE ban.banner_id = ?";
    pool.query(sql, user_id, function (err, rows) {
        if (err)
            return done(true);
        else
            return done(null, rows);
    });
};


exports.get_visitors_likers = function (option, user_id, done) {
    let sql;
    let fields = 'a.id,a.card_id,a.name,a.surname,a.login,a.age,a.pref,a.gender,a.complete,a.score,a.image_profile,a.lat,a.lng,a.city,a.country,a.country_code,a.postcode';
    if (option === 'get_visits')
        sql = "SELECT " + fields + " , CONCAT(GROUP_CONCAT(DISTINCT b.tag)) tags FROM users a LEFT JOIN login_tags b " +
            "ON a.id = b.user_id INNER JOIN visits c ON c.visitor_id = a.id WHERE c.visited_id = ? AND a.id<>? AND a.complete = ? GROUP BY a.id";
    else
        sql = "SELECT " + fields + " , CONCAT(GROUP_CONCAT(DISTINCT b.tag)) tags FROM users a LEFT JOIN login_tags b " +
            "ON a.id = b.user_id INNER JOIN likes c ON c.liker_id = a.id WHERE c.liked_id = ? AND a.id<>? AND a.complete = ? GROUP BY a.id";
    pool.query(sql, [user_id, user_id, 1], function (err, rows) {
        if (err)
            return done(true);
        else
            return done(null, rows);
    });
};


/**
 * ADD VISIT/LIKE/BAN
 * */
function make_query (sql, parameters, done, score_option)
{
    pool.query(sql, parameters, function (err, rows) {
        if (err || !rows.affectedRows)
            return done("Visit/like/ban record not inserted.");
        else
        {
            let sql1;
            if (score_option)
            {
                if (score_option === 'like') sql1 = "UPDATE users SET score = (CASE WHEN score < 496 THEN score + 5 ELSE 500 END) WHERE id = ?";
                else if (score_option === 'remove_like') sql1 = "UPDATE users SET score = (CASE WHEN score > 4 THEN score - 5 ELSE 0 END) WHERE id = ?";
                else if (score_option === 'ban') sql1 = "UPDATE users SET score = (CASE WHEN score > 49 THEN score - 50 ELSE 0 END) WHERE id = ?";
                else if (score_option === 'remove_ban') sql1 = "UPDATE users SET score = (CASE WHEN score < 451 THEN score + 50 ELSE 500 END) WHERE id = ?";

                pool.query(sql1, parameters[1], function (err, rows) {
                    if (err || !rows.affectedRows)
                        return done("Score not updated.");
                });
            }
        }
    });
    return done(null);
}

exports.add_visit_like_ban = function (option, actor_user_id, target_user_id, done) {
    let sql;
    let score_option;
    if (option === "visit")
    {
        sql = "INSERT INTO visits (visitor_id, visited_id) VALUES (?, ?)";
        make_query(sql, [actor_user_id, target_user_id], done, null);
    }
    else if (option === "like")
    {
        sql = "SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?";
        pool.query(sql, [actor_user_id, target_user_id], function (err, rows)
        {
            sql = rows && rows.length === 1 ? "DELETE FROM likes WHERE liker_id = ? AND liked_id = ?" : "INSERT INTO likes (liker_id, liked_id) VALUES (?, ?)";
            score_option = rows.length === 1? "remove_like" : 'like';
            make_query(sql, [actor_user_id, target_user_id], done, score_option);
        })
    }
    else if (option === "ban")
    {
        sql = "SELECT 1 FROM ban WHERE banner_id = ? AND banned_id = ?";
        pool.query(sql, [actor_user_id, target_user_id], function (err, rows)
        {
            sql = rows && rows.length === 1 ? "DELETE FROM ban WHERE banner_id = ? AND banned_id = ?" : "INSERT INTO ban (banner_id, banned_id) VALUES (?, ?)";
            score_option = rows.length === 1? "remove_ban" : 'ban';
            make_query(sql, [actor_user_id, target_user_id], done, score_option);
        })
    }

};


exports.get_like_status = function (actor_user_id, target_user_id, done)
{
    let sql = "SELECT * FROM likes WHERE liker_id = ? AND liked_id = ?";
    pool.query(sql, [actor_user_id, target_user_id], function (error, rows)
    {
        if (error)
            return done(true, false);
        else if (!error && rows.length === 1)
            return done(null, true);
        else if (!error && rows.length !== 1)
            return done(null, false)
    })
};

exports.get_ban_status = function (actor_user_id, target_user_id, done)
{
    let sql = "SELECT * FROM ban WHERE banner_id = ? AND banned_id = ?";
    pool.query(sql, [actor_user_id, target_user_id], function (error, rows)
    {
        if (error)
            return done(true, false);
        else if (!error && rows.length === 1)
            return done(null, true);
        else if (!error && rows.length !== 1)
            return done(null, false)
    })
};

exports.get_score = function (user_id, done)
{
    let sql = "SELECT score FROM users WHERE id = ?";
    pool.query(sql, user_id, function (error, rows)
    {
        if (error || rows.length !== 1)
            return done("Error", null);
        else if (!error && rows.length === 1)
            return done(null, rows[0].score)
    })
};

exports.report_fake = function (actor_user_id, target_user_id, done) {

    let sql = "INSERT INTO fake (faker_id, faked_id) VALUES (?, ?)";
    make_query(sql, [actor_user_id, target_user_id], done, null);
};

exports.get_fake_status = function (actor_user_id, target_user_id, done)
{
    let sql = "SELECT 1 FROM fake WHERE faker_id = ? AND faked_id = ?";
    pool.query(sql, [actor_user_id, target_user_id], function (error, rows)
    {
        if (error)
            return done(true, false);
        else if (!error && rows.length === 1)
            return done(null, true);
        else if (!error && rows.length !== 1)
            return done(null, false)
    })
};

exports.store_id = function (login, user_id, id, done)
{

    let sql = "INSERT IGNORE INTO socket (login, user_id, id) VALUES (?,?, ?)";
    pool.query(sql, [login, user_id, id], function (error, rows)
    {
        if (error)
            return done(true, false);
        else if (!error && rows.length === 1)
            return done(null, true);
        else if (!error && rows.length !== 1)
            return done(null, false)
    })
};


exports.create_room = function (login1, user1_id, login2, user2_id, room, done)
{
    let sql = "SELECT room FROM chat WHERE user1_id IN (?, ?) AND user2_id IN (?, ?)";
    pool.query(sql, [user1_id, user2_id, user1_id, user2_id], function (error, rows)
    {
        if (error)
            return done(true, false);
        else if (!error && rows.length === 1)
            return done(null, true, rows[0].room);
        else if (!error && rows.length === 0)
        {
            sql = "INSERT INTO chat (login1, user1_id, login2, user2_id, room) VALUES (?, ?, ?, ?, ?)";
            pool.query(sql, [login1, user1_id, login2, user2_id, room], function (error, rows)
            {
                if (error)
                    return done(true, false);
                else if (!error && rows.affectedRows === 1)
                    return done(null, true, room);
                else if (!error && rows.affectedRows !== 1)
                    return done(null, false)
            });
        }
    })
};

exports.get_socket_id = function (login, done)
{
    let sql = "SELECT id FROM socket WHERE login=? order by date desc limit 1";
    pool.query(sql, login, function (error, rows)
    {
        if (error)
            return done(true, false);
        else
            return done(null, rows[0]);
    })
};

exports.get_room_perso_from_user_id = function (user1_id, done)
{
    let sql = "SELECT room_perso FROM users WHERE id=?";
    pool.query(sql, [user1_id], function (error, rows)
    {
        if (error)
            return done(true, false);
        else
            return done(null, rows[0]);
    })
};

exports.get_room_perso_from_socket_id = function (id, done)
{
    let sql = "SELECT socket.user_id,users.room_perso,users.login FROM socket INNER JOIN users ON socket.user_id=users.id  WHERE  socket.id=?";
    pool.query(sql, id, function (error, rows)
    {
         if (error || !rows.length)
             return done("no result found", false);
         else
            return done(null, rows[0].room_perso, rows[0].user_id, rows[0].login);
    })
};


/**
 * SAVE MESSAGE INTO DATABASE
 */
exports.save_message = function (values, done)
{

    let sql = "INSERT INTO message (room, from_user_id, to_user_id, msg) VALUES (?,?,?,?)";
    pool.query(sql, [values.room, values.from_user_id, values.to_user_id, values.msg], function (error, rows)
    {
        if (error)
            return done(true, false);
        else
            return done(null, true);
    })
};

/**
 * RETRIEVE MESSAGES
 * */
exports.retrieve_history = function (room_id, done)
{
    let sql = "SELECT * FROM message WHERE room=? ORDER BY date ASC";

    pool.query(sql, room_id, function (error, rows)
    {
        if (error || !rows.length)
            return done(true, false, null);
        else
            return done(null, true, rows);
    })
};

exports.retrieve_chats = function (user_id, done)
{
    let fields  = " a.room, a.user1_id, a.user2_id, a.login1, a.login2, b.image_profile, b.online, b.logout_time, b.room_perso ";
    let logins = "(CASE WHEN a.user1_id != ? AND a.user2_id = ? THEN a.user1_id = b.id WHEN a.user2_id != ? AND a.user1_id = ? THEN a.user2_id = b.id END)";
    let logins2 = "(CASE WHEN a.user1_id != ? AND a.user2_id = ? THEN a.user1_id WHEN a.user2_id != ? AND a.user1_id = ? THEN a.user2_id END)";
    let matched = "(select liked_id from likes,(select liker_id  as liked from likes  where liked_id = ?) as sub where liked_id = sub.liked AND liker_id = ?)";
    let in_ban = "(select banned_id from ban where banner_id=?)";
    let sql = "SELECT" + fields + "from chat a LEFT JOIN users b ON " + logins + " WHERE " + logins2 + " IN " + matched +
        " AND " + logins2 + " NOT IN " + in_ban + " AND b.complete=?";
    pool.query(sql, [user_id,user_id,user_id,user_id,user_id, user_id,user_id, user_id, user_id, user_id,user_id,user_id, user_id, user_id, user_id, 1], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};

/**
 * Retrieve single chat on profile completion/uncompletion for page Chat
 */
exports.retrieve_one_chat = function (from_user_id, to_user_id, done)
{
    let fields  = " a.room, a.user1_id, a.user2_id, a.login1, a.login2, b.image_profile, b.online, b.logout_time, b.room_perso ";
    let logins = "(CASE WHEN a.user1_id = ? AND a.user2_id = ? THEN a.user2_id = b.id WHEN a.user2_id = ? AND a.user1_id = ? THEN a.user1_id = b.id END)";
    let logins2 = "(CASE WHEN a.user1_id = ? AND a.user2_id = ? THEN a.user2_id WHEN a.user2_id = ? AND a.user1_id = ? THEN a.user1_id END)";
    let matched = "(select liker_id from likes WHERE liker_id IN (select liked_id as liked from likes  where liker_id = ? AND liked_id = ?) AND liked_id = ?)";
    let in_ban = "(select banned_id from ban where banner_id=?)";
    let sql = "SELECT" + fields + "from chat a LEFT JOIN users b ON " + logins + " WHERE " + logins2 + " IN " + matched +
        " AND " + logins2 + " NOT IN " + in_ban + " AND b.complete=?";
    pool.query(sql, [from_user_id, to_user_id, from_user_id, to_user_id, from_user_id, to_user_id, from_user_id, to_user_id, from_user_id, to_user_id, from_user_id, from_user_id, to_user_id, from_user_id, to_user_id, from_user_id, 1], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};


/**
 * SET USER LOGOUT TIME
 * */
exports.set_online_status = function (login, date, status, done)
{
    let sql = "UPDATE users SET online = ?, logout_time = ? WHERE login = ?";
    pool.query(sql, [status, date, login], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};

/**
 * SET USER LOGOUT TIME ON SOCKET-DISCONNECT
 * */
exports.set_offline_status = function (user_id, date, status, done)
{
    let sql = "UPDATE users SET online = ?, logout_time = ? WHERE id = ?";
    pool.query(sql, [status, date, user_id], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};

/**
 * ACTION
 */
exports.action = function (values, done) {

    // let actor_id = values.actor_id, verb = values.verb, object = values.object, target_id = values.target_id;
    let sql_check_ban = "SELECT 1 FROM ban WHERE banner_id = ? AND banned_id = ?";

    pool.query(sql_check_ban, [values.target_id, values.actor_id], function (error, res)
    {
        if (res && res.length === 0)
        {
            let sql = "INSERT INTO notification (actor_id, verb, object, target_id) VALUES (?, ?, ?, ?)";

            if (values.object === 'message')
            {
                let sql_check = "SELECT 1 FROM notification WHERE actor_id=? AND verb=? AND object=? AND target_id=? AND (seen = ? OR seen = ?)";
                let sql_up;
                pool.query(sql_check, [values.actor_id, values.verb, values.object, values.target_id, 1, 0], function (err, rows)
                {
                    if (err)
                        return done(true, null);
                    if (rows.length > 0)
                    {
                        sql_up = "UPDATE notification SET seen=?, date=Now() WHERE actor_id=? AND verb=? AND object=? AND target_id=?";
                        make_query(sql_up, [0, values.actor_id, values.verb, values.object, values.target_id], done, null);
                    }
                    else
                    {
                        make_query(sql, [values.actor_id, values.verb, values.object, values.target_id], done, null);
                    }
                });
            }
            else make_query(sql, [values.actor_id, values.verb, values.object, values.target_id], done, null);
        }
    })

};


exports.retrieve_notification = function (target_id, done)
{

    let sql = "SELECT a.*, b.login FROM notification a INNER JOIN users b ON a.actor_id = b.id WHERE target_id = ? ORDER BY date DESC";
    pool.query(sql, target_id, function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};

exports.retrieve_notification_chat = function (target_id, done)
{

    let sql = "SELECT a.*, b.login FROM notification a INNER JOIN users b ON a.actor_id = b.id WHERE a.target_id = ? AND a.object = 'message' AND a.seen = 0 ORDER BY date DESC";
    pool.query(sql, target_id, function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};

exports.update_notification = function (target_id, done)
{

    let sql = "UPDATE notification SET seen=? WHERE target_id = ?";
    pool.query(sql, [1,target_id], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};

exports.update_notification_chat = function (target_id, actor_id, done)
{

    let sql = "UPDATE notification SET seen=? WHERE target_id = ? AND object = 'message' AND actor_id = ?";
    pool.query(sql, [1,target_id, actor_id], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};


exports.get_all_rooms_im_in = function (user_id, done)
{
    let sql = "SELECT room FROM chat where user1_id=? OR user2_id=?";
    pool.query(sql, [user_id, user_id], function (error, rows)
    {
        if (error)
            return done(true, null);
        else
            return done(null, rows);
    })
};
