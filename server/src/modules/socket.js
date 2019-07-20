const io = require('socket.io');
var general_model = require('../models/general.js');

module.exports = function(io) {

    io.sockets.on("connection", function(socket){

        socket.on("check_likes", function(target_room_perso, target_user_id, notification_flag, chat_flag, cards_user_id){

                    function check() {io.to('Room:' + target_room_perso).emit('refresh_likes');}
                    setTimeout(check, 500);
                    if (notification_flag) {
                        function notify() {io.to('Room:' + target_room_perso).emit('notification');}
                        setTimeout(notify, 500);
                    }
                    if (chat_flag)
                    {
                        function notify_chat_page() {io.to('Room:' + target_room_perso).emit('update_chat_page', cards_user_id);}
                        setTimeout(notify_chat_page, 500);
                    }
                    function update_list() { io.to('Room:' + target_room_perso).emit('update_list', "get_likes"); }
                    setTimeout(update_list, 500);

                general_model.get_room_perso_from_user_id(cards_user_id, function (error, results){
                    if (results){
                        function aaa() {io.to('Room:' + results.room_perso).emit('update_chat_page', target_user_id);}
                        setTimeout(aaa, 500);
                    }
                })


            });

        socket.on("check_visited_online_status", function (room_perso) {
            if ( io.sockets.adapter.rooms["Room:" + room_perso]) {
                let count = io.sockets.adapter.rooms["Room:" + room_perso].length;
                socket.emit("check_visited_online_status_response", count);
            }
            else socket.emit("check_visited_online_status_response", 0);
        });

        socket.on("disconnect", function() {
            let date = new Date();
            general_model.get_room_perso_from_socket_id(socket.id, function (error, room_perso, user_id, login) {
                if (room_perso && user_id && !error) {
                    if (!io.sockets.adapter.rooms["Room:" + room_perso]) {
                        io.sockets.emit("user_logged_out", user_id);
                        general_model.set_offline_status(user_id, date, 0, function () {});
                        socket.leave("Room:"+room_perso);
                    }
                }
            });
        });

        socket.on("join", function(room_id){socket.join("Room:" + room_id);});

        socket.on("logout", function(login, user_id, room_perso){
            let date = new Date();
            general_model.set_online_status(login, date, 0, function (error, results) {io.sockets.emit("user_logged_out", user_id);});
            io.to('Room:' + room_perso).emit('logout'); // forces every opened tab to logout
            socket.leave("Room:"+room_perso);
        });

        socket.on("notify_visit", function(room_perso){

            function emit_notification() {io.to('Room:' + room_perso).emit('notification');}
            setTimeout(emit_notification, 1000);

            function update_list() {io.to('Room:' + room_perso).emit('update_list', "get_visits");}
            setTimeout(update_list, 1000);

        });

        socket.on("refresh_visited_profile", function(visitor_id, visited_id){
            general_model.get_room_perso_from_user_id(visitor_id, function (error, results) {
                if (results){
                    function aaa() {
                        io.to('Room:' + results.room_perso).emit('refresh_visited_profile', visited_id);
                        io.to('Room:' + results.room_perso).emit("update_adv_list", visited_id);
                    }
                    setTimeout(aaa, 500);
                }
            });
        });

        socket.on("send_message", function(data){
            let room_id = data.room_id;
            let user1_room_perso = data.user1_room_perso;
            let me_room_perso= data.me_room_perso;
            socket.join("Room:"+room_id);
            /** alert receiver to retrieve message*/
            if (room_id && user1_room_perso && me_room_perso && data.from_user_id && data.to_user_id && data.msg)
            {
                data.msg = data.msg.replace(/</g, " ").replace(/>/g, " ").replace(/&/g, " ").replace(/"/g," ").replace(/'/g," ").replace(/\//g, " ");
                let values = {room:room_id,from_user_id:data.from_user_id,to_user_id:data.to_user_id,msg:data.msg};
                general_model.save_message(values, function(save_error){
                     if (save_error) io.to('Room:' + me_room_perso).emit('chat_error');
					 else {
                         io.to('Room:' + me_room_perso).emit('message_sent', data);
                         function notify () {io.to('Room:' + user1_room_perso).emit('notification');}
                         setTimeout(notify, 1500);
                         io.to('Room:' + user1_room_perso).emit('get_message', data);
                     }
                })
            }
            else if (me_room_perso) io.to('Room:' + me_room_perso).emit('chat_error');
        });

        socket.on("update_home_list", function(data){io.sockets.emit("update_home_list", data);});

        socket.on("update_notification", function(user_id){
            general_model.get_room_perso_from_user_id(user_id, function (error, results){
                if (results)
                {
                    function update_not() {io.to('Room:' + results.room_perso).emit('update_notification', user_id);}
                    setTimeout(update_not, 500);
                }
            });
        });

         socket.on("update_notification_chat", function(user_id, actor_login, actor_id){
            general_model.get_room_perso_from_user_id(user_id, function (error, results){
                if (results)
                {
                    function update_not() {io.to('Room:' + results.room_perso).emit('update_notification_chat', user_id, actor_login, actor_id);}
                    setTimeout(update_not, 500);
                }
            });
        });

        socket.on("user_login", function(login, user_id){
            general_model.set_online_status(login,null , 1, function ()
            {
                function notify_status() {io.sockets.emit("user_logged_in", user_id);}
                setTimeout(notify_status, 500);
            });
        });
    });
};
