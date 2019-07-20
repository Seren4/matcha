var pool = require('./db_connector');

exports.executeQuery = function(query,callback){
    pool.getConnection(function(err,connection){
        if (err && connection) {
            connection.release();
        }
        connection.query(query,function(err,rows){
            connection.release();
            if(!err) {
                callback(null, {rows: rows});
            }
        });
        connection.on('error', function() {
            return;
        });
    });
};
