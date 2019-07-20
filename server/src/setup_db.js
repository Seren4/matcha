var mysql = require('mysql');
var faker = require('faker');
const bcrypt = require("bcrypt");
var crypto = require("crypto");


var conn = create_connetion();
var tag_array = ["sport", "music", "cinema", "photography", "art", "eco", "theatre", "travelling", "fashion", "coding"];


/**
 * CREATE CONNECTION
 * */
function create_connetion()
{
    let db_params = {
        host: "localhost",
        user: "root",
        password: ""
    };
    return mysql.createConnection(db_params);
}


/**
 * CREATE DATABASE
 * */

    var sql = "DROP DATABASE IF EXISTS matcha";

    conn.query(sql, function (err, rows) {
        if (!err && rows.affectedRows > 0) console.log('\x1b[36m%s\x1b[0m',"Database matcha deleted.");
        else
            console.log(err)
    });

    sql = "CREATE DATABASE IF NOT EXISTS matcha";
    conn.query(sql, function (err, rows) {
        if (!err && rows.affectedRows) console.log('\x1b[36m%s\x1b[0m',"Database matcha created.");
    });

    sql = "USE matcha";
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m',"Database matcha used.");
    });



/** USER TABLE creation**/
function create_users_table() {
    let sql = `CREATE TABLE IF NOT EXISTS users
           (
             id            VARCHAR(100) PRIMARY KEY,
             room_perso    VARCHAR(40) UNIQUE,
             card_id       VARCHAR(40) UNIQUE,
             name          VARCHAR(255)        NOT NULL,
             surname       VARCHAR(255)        NOT NULL,
             login         VARCHAR(255) UNIQUE NOT NULL,
             email         VARCHAR(255) UNIQUE NOT NULL,
             age           INT,
             password      VARCHAR(255)        NOT NULL,
             image_profile LONGBLOB,
             image1        LONGBLOB,
             image2        LONGBLOB,
             image3        LONGBLOB,
             image4        LONGBLOB,
             gender        VARCHAR(6) CHECK (gender in ('male', 'female')),
             pref          VARCHAR(8) DEFAULT 'bisex',
             bio           TEXT,
             score         INT(20)    DEFAULT 100,
             status        TINYINT(1) DEFAULT 0,
             hash          VARCHAR(255) UNIQUE,
             complete      TINYINT(1) DEFAULT 0,
             online        TINYINT(1) DEFAULT 0,
             logout_time   TIMESTAMP,
             lat           DECIMAL(10, 8),
             lng           DECIMAL(11, 8),
             city          VARCHAR(255),
             country       VARCHAR(255),
             country_code  VARCHAR(5),
             postcode      VARCHAR(10)
           )`;
    conn.query(sql, function (err, rows) {
        if (!err) console.log('\x1b[36m%s\x1b[0m',"\nTable users created.");
    });
}



/** TAGS TABLE creation and population **/
function create_tags_table() {
    let sql = `CREATE TABLE IF NOT EXISTS tags
               (
                 id  INT AUTO_INCREMENT PRIMARY KEY,
                 tag VARCHAR(20) NOT NULL UNIQUE
               )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table tags created");
    });
}

function populate_tags_table()
{
    let flag = 1;
    tag_array.forEach(function (tag)
    {
        let sql = 'INSERT INTO tags (tag) VALUES (?)';
        conn.query(sql, tag, function (err, rows)
        {
            if (err || !rows.affectedRows) flag = 0;
            if (tag_array.length - 1 === tag_array.indexOf(tag) && flag)
                console.log('\x1b[36m%s\x1b[0m',"Table tags  populated");
        });
    });
}

/** LOGIN_TAGS TABLE creation **/


function create_login_tags_table()
{

    let sql = `CREATE TABLE IF NOT EXISTS login_tags
           (
             id      INT AUTO_INCREMENT PRIMARY KEY,
             tag     VARCHAR(20)  NOT NULL,
             user_id VARCHAR(100) NOT NULL,
             login   VARCHAR(255) NOT NULL,
             FOREIGN KEY (tag) REFERENCES tags (tag),
             FOREIGN KEY (login) REFERENCES users (login) ON UPDATE CASCADE,
             FOREIGN KEY (user_id) REFERENCES users (id)


           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table login_tags created");
    });
}


/**
 * VISITS table creation
 **/
function create_visits_table() {
    let sql = `CREATE TABLE IF NOT EXISTS visits
           (
             id         INT AUTO_INCREMENT PRIMARY KEY,
             visitor_id VARCHAR(100) NOT NULL,
             visited_id VARCHAR(100) NOT NULL,
             date       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (visitor_id) REFERENCES users (id),
             FOREIGN KEY (visited_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table visits created");
    });
}

/**
 * LIKES table creation
 **/
function create_likes_table() {
    let sql = `CREATE TABLE IF NOT EXISTS likes
           (
             id       INT AUTO_INCREMENT PRIMARY KEY,
             liker_id VARCHAR(100) NOT NULL,
             liked_id VARCHAR(100) NOT NULL,
             date     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (liker_id) REFERENCES users (id),
             FOREIGN KEY (liked_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table likes created");
    });
}
/**
 * BAN table creation
 **/
function create_ban_table() {

    let sql = `CREATE TABLE IF NOT EXISTS ban
           (
             id        INT AUTO_INCREMENT PRIMARY KEY,
             banner_id VARCHAR(100) NOT NULL,
             banned_id VARCHAR(100) NOT NULL,
             date      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (banner_id) REFERENCES users (id),
             FOREIGN KEY (banned_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table ban created");
    });
}
/**
 * FAKE table creation
 **/
function create_fake_table() {

    let sql = `CREATE TABLE IF NOT EXISTS fake
           (
             id       INT AUTO_INCREMENT PRIMARY KEY,
             faker_id VARCHAR(100) NOT NULL,
             faked_id VARCHAR(100) NOT NULL,
             date     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (faker_id) REFERENCES users (id),
             FOREIGN KEY (faked_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table fake created");
    });
}


/**
 * NOTIFICATION table creation
 **/
function create_notification_table() {

    let sql = `CREATE TABLE IF NOT EXISTS notification
           (
             id        INT AUTO_INCREMENT PRIMARY KEY,
             actor_id  VARCHAR(100) NOT NULL,
             verb      VARCHAR(255) NOT NULL CHECK (verb in ('sent', 'put', 'remove', 'reciprocate', 'pay')),
             object    VARCHAR(255) NOT NULL CHECK (object in ('message', 'like', 'visit')),
             target_id VARCHAR(100) NOT NULL,
             seen      TINYINT(1)            DEFAULT 0,
             date      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (actor_id) REFERENCES users (id),
             FOREIGN KEY (target_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table notification  created");
    });
}

/**
 * CHAT TABLE creation
 **/
function create_chat_table() {

    let sql = `CREATE TABLE IF NOT EXISTS chat
           (
             room     VARCHAR(40) UNIQUE NOT NULL PRIMARY KEY,
             login1   VARCHAR(20)        NOT NULL,
             login2   VARCHAR(20)        NOT NULL,
             user1_id VARCHAR(100)       NOT NULL,
             user2_id VARCHAR(100)       NOT NULL,
             date     TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (login1) REFERENCES users (login) ON UPDATE CASCADE,
             FOREIGN KEY (login2) REFERENCES users (login) ON UPDATE CASCADE,
             FOREIGN KEY (user1_id) REFERENCES users (id),
             FOREIGN KEY (user2_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err, rows) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table chat created");
    });
}
/**
 * CHAT MESSAGE creation
 **/
function create_message_table() {

    let sql = `CREATE TABLE IF NOT EXISTS message
           (
             message_id   INT AUTO_INCREMENT PRIMARY KEY,
             room         VARCHAR(40)  NOT NULL,
             from_user_id VARCHAR(100) NOT NULL,
             to_user_id   VARCHAR(100) NOT NULL,
             date         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             msg          TINYTEXT     NOT NULL,
             FOREIGN KEY (room) REFERENCES chat (room) ON DELETE CASCADE,
             FOREIGN KEY (from_user_id) REFERENCES users (id),
             FOREIGN KEY (to_user_id) REFERENCES users (id)
           )`;
    conn.query(sql, function (err, rows) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table message created");
    });
}
/**
 * CHAT SOCKET creation
 **/
function create_socket_table() {

    let sql = `CREATE TABLE IF NOT EXISTS socket
           (
             id      VARCHAR(40)  NOT NULL PRIMARY KEY,
             login   VARCHAR(20)  NOT NULL,
             user_id VARCHAR(100) NOT NULL,
             date    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (login) REFERENCES users (login) ON UPDATE CASCADE,
             FOREIGN KEY (user_id) REFERENCES users (id)

           )`;
    conn.query(sql, function (err) {
        if (!err) console.log('\x1b[36m%s\x1b[0m', "Table socket created");
    });
}
/** USER A && FAKE USERS creation **/
function create_user_a()
{
    let pass = bcrypt.hashSync('Serea!1234', 5);
    let room_perso = crypto.randomBytes(20).toString('hex');
    let hash = crypto.randomBytes(20).toString('hex');
    let id = crypto.randomBytes(40).toString('hex');
    let card_id = crypto.randomBytes(20).toString('hex');

    let email = faker.internet.email(), age = 30, bio='suca', gender='male';
    let sql = "INSERT INTO users(id, login,password,status,hash,name,surname,email,age,bio,gender,room_perso,card_id) VALUES (?, ?,?,?,?,?,?,?,?,?,?,?,?)";
    conn.query(sql,[id, 'serea',pass,1,hash,'a','a',email,age,bio,gender,room_perso,card_id], function (err, rows)
    {
        if (!err && rows.affectedRows) console.log('\x1b[36m%s\x1b[0m', "\nTest user a created");
    });

}

function create_user_b()
{
    let room_perso = crypto.randomBytes(20).toString('hex');
    let pass = bcrypt.hashSync('Sereb!1234', 5);
    let hash = crypto.randomBytes(20).toString('hex');
    let id = crypto.randomBytes(40).toString('hex');
    let card_id = crypto.randomBytes(20).toString('hex');

    let email = faker.internet.email(), age = 30, bio='suca', gender='male';
    let sql = "INSERT INTO users(id, login,password,status,hash,name,surname,email,age,bio,gender,room_perso,card_id) VALUES (?, ?,?,?,?,?,?,?, ?, ?, ?,?,?)";
    conn.query(sql,[id, 'sereb',pass,1,hash,'b','b',email, age, bio, gender,room_perso,card_id], function (err, rows)
    {
        if (!err && rows.affectedRows > 0) console.log('\x1b[36m%s\x1b[0m', "Test user b created");
    });

}

function create_user_c()
{
    let room_perso = crypto.randomBytes(20).toString('hex');
    let pass = bcrypt.hashSync('Serec!1234', 5);
    let hash = crypto.randomBytes(20).toString('hex');
    let id = crypto.randomBytes(40).toString('hex');
    let card_id = crypto.randomBytes(20).toString('hex');
    let email = faker.internet.email(), age = 30, bio='suca', gender='male';
    let sql = "INSERT INTO users(id, login,password,status,hash,name,surname,email,age,bio,gender,room_perso,card_id) VALUES (?, ?,?,?,?,?,?,?, ?, ?, ?,?,?)";
    conn.query(sql,[id, 'serec',pass,1,hash,'c','c',email, age, bio, gender,room_perso,card_id], function (err, rows)
    {
        if (!err && rows.affectedRows > 0) console.log('\x1b[36m%s\x1b[0m', "Test user c created");
    });
}

function create_user_d()
{
    let room_perso = crypto.randomBytes(20).toString('hex');
    let pass = bcrypt.hashSync('Sered!1234', 5);
    let hash = crypto.randomBytes(20).toString('hex');
    let id = crypto.randomBytes(40).toString('hex');
    let card_id = crypto.randomBytes(20).toString('hex');
    let email = faker.internet.email(), age = 30, bio='suca', gender='male';
    let sql = "INSERT INTO users(id, login,password,status,hash,name,surname,email,age,bio,gender,room_perso,card_id) VALUES (?, ?,?,?,?,?,?,?, ?, ?, ?,?,?)";
    conn.query(sql,[id, 'sered',pass,1,hash,'d','d',email, age, bio, gender,room_perso,card_id], function (err, rows)
    {
        if (!err && rows.affectedRows > 0) console.log('\x1b[36m%s\x1b[0m', "Test user d created");
    });
}

function create_user_e()
{
    let room_perso = crypto.randomBytes(20).toString('hex');
    let pass = bcrypt.hashSync('Seree!1234', 5);
    let hash = crypto.randomBytes(20).toString('hex');
    let id = crypto.randomBytes(40).toString('hex');
    let card_id = crypto.randomBytes(20).toString('hex');
    let email = faker.internet.email(), age = 30, bio='suca', gender='male';
    let sql = "INSERT INTO users(id, login,password,status,hash,name,surname,email,age,bio,gender,room_perso,card_id) VALUES (?, ?,?,?,?,?,?,?, ?, ?, ?,?,?)";
    conn.query(sql,[id, 'seree',pass,1,hash,'e','e',email, age, bio, gender,room_perso,card_id], function (err, rows)
    {
        if (!err && rows.affectedRows > 0) console.log('\x1b[36m%s\x1b[0m', "Test user e created");
    });
}



/** FUNCTION RETURNING RANDOM INT BETWEEN MIN & MAX**/
function random_int(min, max)
{
    return Math.floor(Math.random() * (max - min) ) + min;
}

function create_users()
{

    let genders = ["male","female"], preferences = ["straight","gay","bisex"];
    let name, surname, login, email, age, password;
    let image_profile, image1, image2, image3, image4, gender, pref, bio, status, hash, score, logout_time, id, online;
    let lat = null, lng = null, city = null, country = null, country_code = null, postcode = null;
    let sql;
    let room_perso;
    let card_id;
    let fields = "(id,name,surname,login,email,age,password,image_profile,image1,image2,image3,image4,gender,pref,bio,status,hash,score,complete,lat,lng,city,country,country_code,postcode,room_perso,card_id,logout_time,online)";
    let values = "(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    let array = [];

    faker.locale = "fr";


    for (let i = 0; i < 1000; i++) {
        room_perso = crypto.randomBytes(20).toString('hex');
        lat = faker.address.latitude();
        lng = faker.address.longitude();
        country = faker.address.country();
        country_code = faker.address.countryCode();
        postcode = faker.address.zipCode("#####");
        city = faker.address.city();
        id = crypto.randomBytes(40).toString('hex');
        name = faker.name.firstName();
        surname = faker.name.lastName();
        login = faker.internet.userName();
        password = faker.internet.password();
        email = faker.internet.email();
        age = random_int(18, 75);
        score = random_int(0, 500);
        image_profile = faker.image.avatar();
        image1 = faker.image.avatar();
        image2 = faker.image.avatar();
        image3 = faker.image.avatar();
        image4 = faker.image.avatar();
        gender = genders[random_int(0, genders.length)];
        pref = preferences[random_int(0, preferences.length)];
        bio = faker.lorem.paragraph();
        status = 1;
        hash = crypto.randomBytes(20).toString('hex');
        card_id = crypto.randomBytes(20).toString('hex');
        online = random_int(0, 2);
        logout_time = faker.date.past();


        sql = "INSERT IGNORE INTO users " + fields + " VALUES " + values;
        array = [id, name, surname, login, email, age, password, image_profile, image1, image2, image3, image4, gender, pref, bio, status, hash, score, 1, lat, lng, city, country, country_code, postcode, room_perso, card_id, logout_time, online];

        let self = this;
        conn.query(sql, array, function (err, rows) {
            if (!err && rows.affectedRows) {
                return 1;
            }
        });
    }
}


 function populate_login_tags() {
     let sql = "SELECT login, id FROM users";

    conn.query(sql, sql, function (err, rows) {

        let i = 0;
        let length = rows.length;

        rows.forEach(function (el) {

         let tag_array_rand_amount = random_int(1, tag_array.length);
         let tags_query_array = [];
         for (let i = 0; i < tag_array_rand_amount; i++) {
             let tag = tag_array[random_int(0, tag_array.length - 1)];
             while (tags_query_array.includes(tag) === true)
                 tag = tag_array[random_int(0, tag_array.length - 1)];
             tags_query_array.push(tag);
         }
         tags_query_array.forEach(function (tag)
         {
             let sql2 = "INSERT INTO login_tags(tag,login, user_id) VALUES (?,?,?)";
             conn.query(sql2, [tag, el.login, el.id], function (err, rows) {
                 i++;
                 if (!err && rows.affectedRows && i === length) conn.end();

             });
         });

     })
    });
}

create_users_table();

create_tags_table();
populate_tags_table();
create_login_tags_table();

create_visits_table();
create_likes_table();
create_ban_table();
create_fake_table();

create_notification_table();

create_chat_table();
create_message_table();
create_socket_table();


create_user_a();
create_user_b();
create_user_c();
create_user_d();
create_user_e();
create_users();

populate_login_tags();








