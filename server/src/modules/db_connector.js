var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "",
    database: "matcha",
    // Whether or not to automatically check for and clear expired sessions:
    clearExpired: true,
    // Whether or not to create the sessions database table, if one does not already exist:
    createDatabaseTable: true,
    // The maximum age of a valid session; milliseconds:
    expiration: 86400000,
    charset: 'utf8mb4_bin',
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        },
    }
});

module.exports = pool;
