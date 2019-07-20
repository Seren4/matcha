<template style="background-color:#C5DDEB;">
    <div class="container">
      <!--ALERT-->
      <div class="columns is-multiline is-centered">
        <div class="column is-half is-centered">
          <article class="message is-link is-narrow" v-if="alert && (!isLogged || !completion || !chats.length)">
            <div class="message-body">
              {{alert}}
            </div>
          </article>
        </div>
      </div>
      <div class="columns is-mobile" v-if="!alert && completion">
          <!--CARDS-->
          <div class="column is-one-quarter card" style="background: #434651">
                <div class="box" v-for="chat in chats" @click="start_chat(chat.to_login, chat.to_user_id, chat.room, chat.user1_room_perso)" style="background: #434651;">
                  <div class="columns is-multiline is-mobile ">
                    <div class="column is is-full-mobile is-one-quarter-tablet is-one-quarter-desktop">
                      <figure class="image is-48x48" >
                          <img v-bind:src="chat.image" alt="avatar" class="is-rounded" style="border: 2px solid lightgrey;border-radius: 25px;">
                        </figure>
                    </div>
                    <div class="column is is-full-mobile is-three-quarters-tablet is-three-quarters-desktop">
                      <p class="has-text-white">{{chat.to_login}}</p>
                      <div>
                      <span class=" icon is-small" v-bind:class="{'has-text-success' : chat.online==='online', 'has-text-danger':chat.online==='offline' }">
                        <i class="fa fa-circle online"></i>
                        <p class="has-text-grey-light" style="margin-left: 5px">{{chat.online}}</p>
                      </span>
                      </div>
                      <div>
                      <span class="icon is-medium has-text-success" v-if="chat.has_message" id="message_icon">
                        <i class="fas fa-envelope"></i>
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
          <!--CHAT-->
          <div class="column is-three-quarters card" style="background-color: #F2F5F8" v-show="show_chat" >
              <div class="columns is-multiline is-mobile">
                <!--HEADER-->
                <div class="column is-full card" style="background-color: #F2F5F8">
                  <nav class="level is-mobile">
                    <div class="level-left">
                      <div class="level-item">
                        <figure class="image is-64x64">
                          <img class="is-rounded" v-bind:src="current_chat_other_photo" alt="avatar" style="border: 2px solid lightgreen;border-radius: 25px;">
                        </figure>
                      </div>
                      <div class="level-item">
                        <span class="title is-6" ><strong>{{title}}</strong></span>
                      </div>
                    </div>
                  </nav>
                </div>
                <!--MESSAGES HISTORY-->
                <div class="column is-full card"  style="overflow-y: scroll;background-color: #F2F5F8;" id="chat_history">
                  <nav class="level" v-for="message in messageList">
                    <div class="level-left">
                      <div class="level-item" v-if="message.author !== 'me'" >
                        <ul style="list-style: none;">
                          <li class="has-text-left">
                             <span class="icon is-small" style="color: #86BB71">
                               <i class="fa fa-circle"></i>
                             </span>
                            <strong>{{current_chat_other}}</strong><span class="has-text-grey"> {{message.date}}</span>
                          </li>
                          <li>
                            <article class="message" v-if="message.author !== 'me'" style="background-color: #86BB71">
                              <div class="message-body has-text-white">
                                {{message.text}}
                              </div>
                            </article>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="level-right">
                      <div class="level-item" v-if="message.author === 'me'" >
                        <ul style="list-style: none">
                          <li class="has-text-left">
                            <span class="icon is-small" style="color: #94C2ED">
                               <i class="fa fa-circle"></i>
                             </span>
                            <strong>me</strong><span class="has-text-grey"> {{message.date}}</span>
                          </li>
                          <li>
                            <article class="message" v-if="message.author === 'me'" style="background-color: #94C2ED">
                              <div class="message-body has-text-white">
                                {{message.text}}
                              </div>
                            </article>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </nav>
                </div>
                <!--TYPE AREA-->
                <div class="column is-full">
                  <div class="columns is-mobile is-multiline">
                    <div class="column is-three-quarters">
                      <textarea class="textarea is-focused has-fixed-size" placeholder="Type your message" v-model="message_to_send" rows="1">{{message_to_send}}</textarea>
                    </div>
                    <div class="column is-one-quarter">
                      <a class="button is-medium is-fullwidth is-primary" @click="send_message">Send</a>
                    </div>
                  </div>
                </div>
              </div>
          </div>
    </div>

    </div>


</template>

<script>

  import General from '@/services/General'
  import UserService from '@/services/UserService'
  import { EventBus } from '../event-bus';

  export default {
    name: 'Chat',
    data()
    {
      return {
        duo: [],
        title:'',
        completion: 0,
        show: true,
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        login: '',
        user_id: null,
        alert: null,
        unfinished: "You must complete your profile to access this page",
        anonymous: "You must first log in to access this page",
        options: ['age', 'location', 'score', 'interests'],
        people_backup: [],
        chats: [],
        show_chat:false,
        messageList:[],
        message_to_send:'',
        current_chat_other:'',
        current_chat_other_id:'',
        current_chat_other_photo:null,
        has_message_flag: false

      }
    },
    mounted()
    {
      let self = this;
      this.get_user_id().then(function (logged) {
        if (!logged) self.$router.replace('/');
        else {
          self.get_completion();
          self.$socket.emit("joinAllRooms", self.user_id);
          setInterval(self.checkPageFocus, 4000);
        }
        EventBus.$on('close_chat', () => {self.show_chat = false;});
        EventBus.$on('notify_message', (actor) => {self.actor = actor;});
      });

    },
    methods: {
      /**
       * CHAT SIDEBAR
       * */
      async get_user_id(){
        const response = await UserService.get_user_id({'session_id':this.$session.get('b_sessionID')});
        if (response && response.data) {
          this.user_id = response.data.user_id;
          this.login = response.data.login;
          this.room_perso = response.data.room_perso;
        }
        return !!(response.data.user_id);
      },
      checkPageFocus() {
        if (document.hasFocus() && this.show_chat) {
          let i = this.chats.findIndex(i => i.to_user_id ===  this.duo[1].to_user_id);
          if (i !== -1 && this.chats[i].has_message) {
              this.chats[i].has_message = false;
              let data = {target_id: this.user_id, actor_id: this.duo[1].to_user_id};
              let resp = General.update_notification_chat({data: data});
              this.$socket.emit("update_notification_chat", this.duo[0].from_user_id, this.chats[i].to_login, this.duo[1].to_user_id);
            }
        }
      },
      checkIfIsLogged()
      {
        return (!!this.user_id);
      },
      async get_completion()
      {
        const response = await UserService.get_user_completion({user_id: this.user_id});
        if (response && response.data) {
          this.completion = response.data.completion;
          if (response.data.completion === 0) this.alert = this.unfinished;
          else this.retrieve_chats();
        }
      },
      async retrieve_one_chat(to_user_id)
      {
        let data = {from_user_id:this.user_id, to_user_id:to_user_id};
        let resp = await General.retrieve_one_chat({data: data});
        if (!resp.data.chats || !resp.data.chats.length) {
          let i = this.chats.findIndex(i => i.to_user_id === to_user_id);
          if (i >= 0) this.chats.splice(i, 1);
          if (this.duo && this.duo[1] && this.duo[1].to_user_id === to_user_id && this.show_chat){
            if (this.chats[0]) this.start_chat(this.chats[0].to_login, this.chats[0].to_user_id, this.chats[0].room, this.chats[0].user1_room_perso)
          }
        }
        else if (resp && resp.data && resp.data.chats)
        {
          let to_login = resp.data.chats[0].login1 === this.login ? resp.data.chats[0].login2 : resp.data.chats[0].login1;
          let to_user_id = resp.data.chats[0].user1_id === this.user_id ? resp.data.chats[0].user2_id : resp.data.chats[0].user1_id;
          this.chats.push({
            to_login: to_login,
            to_user_id: to_user_id,
            image: Buffer.from(resp.data.chats[0].image_profile.data, 'binary'),
            room: resp.data.chats[0].room,
            online: resp.data.chats[0].online === 1 ? "online" : "offline",
            user1_room_perso: resp.data.chats[0].room_perso
          })
        }
        if (!this.chats.length) this.alert = "You have no chats yet";
        else this.alert='';
      },
      async retrieve_chats()
      {
          let data = {user_id: this.user_id};
          let resp = await General.retrieve_chats({data: data});
          let chats = [];
          this.chats = [];
           if (!resp.data.chats.length) this.alert = "You have no chats yet"
           else if (resp && resp.data && resp.data.chats) {
             this.alert='';
             for (let i = 0; i < resp.data.chats.length; i++) {
               let to_login = resp.data.chats[i].login1 === this.login ? resp.data.chats[i].login2 : resp.data.chats[i].login1;
               let to_user_id = resp.data.chats[i].user1_id === this.user_id ? resp.data.chats[i].user2_id : resp.data.chats[i].user1_id;
               chats.push({
                 to_login: to_login,
                 to_user_id: to_user_id,
                 image: Buffer.from(resp.data.chats[i].image_profile.data, 'binary'),
                 room: resp.data.chats[i].room,
                 online: resp.data.chats[i].online === 1 ? "online" : "offline",
                 has_message: false,
                 user1_room_perso: resp.data.chats[i].room_perso
               })
             }
             this.chats.push.apply(this.chats, chats);
             this.start_chat(this.chats[0].to_login, this.chats[0].to_user_id, this.chats[0].room, this.chats[0].user1_room_perso)
           }
        this.retrieve_notification_chat();
      },
      async retrieve_notification_chat()
      {
        if (this.user_id) {

          let data = {target_id: this.user_id};
          let resp = await General.retrieve_notification_chat({data: data});
          if (resp && resp.data && resp.data.notification.length) {
            let res = resp.data.notification;
            let self = this;
            res.forEach(function (el) {
              let i = self.chats.findIndex(i => i.to_user_id === el.actor_id);
              if (i >= 0) self.chats[i].has_message = true;
            })
          }
        }
      },
      start_chat(to_login, to_user_id, room_id, user1_room_perso)
      {
        this.duo = [{from_user_id: this.user_id}, {to_user_id: to_user_id}, {room_id: room_id}, {user1_room_perso: user1_room_perso},  {me_room_perso: this.room_perso}];
        this.title = "Chat with " + to_login;
        let i = this.chats.findIndex(i => i.to_user_id === to_user_id);
        if (i !== -1) {
          this.current_chat_other_photo = 'data:image/jpeg;base64' + Buffer.from(this.chats[i].image, 'binary');
          this.current_chat_other = to_login;
          this.current_chat_other_id = to_user_id;
          setTimeout(function()
          {
            var objDiv = document.getElementById("chat_history");
            if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;
          }, 100);
          if (this.chats[i].has_message)
          {
            this.chats[i].has_message = false;
            let data = {target_id: this.user_id, actor_id: to_user_id};
            let resp = General.update_notification_chat({data: data});
            this.$socket.emit("update_notification_chat", this.duo[0].from_user_id, to_login, this.duo[1].to_user_id);
          }
        }
        this.show_chat = true;
      },
      getTimeFromDate(timestamp)
      {
        function pad(num) {return ("0" + num).slice(-2);}
        let date = new Date(timestamp);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = ("" + date.getFullYear()).slice(-2);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        return pad(day) + "/" + pad(month) + "/" + year + " " + pad(hours) + "h" + pad(minutes)
      },
      /**
       * CHAT WINDOW
       * */
      async action (object, action)
      {
        let resp = await General.action({actor_id: this.duo[0].from_user_id, verb:action, object:object, target_id: this.duo[1].to_user_id});
      },
      async retrieve_history(){
        this.messageList = [];
        let data = {room_id:this.duo[2].room_id};
        let resp = await General.retrieve_history({data:data});
        if (resp && resp.data && resp.data.history) {
          let history = resp.data.history;
          for (let i = 0; i < history.length; i++) {
            let author = this.duo[0].from_user_id === history[i].from_user_id ? 'me' : 'user1';
            this.messageList.push({author: author, text: history[i].msg, date: this.getTimeFromDate(history[i].date)});
          }
        }
      },
      send_message () {
        this.validate_message();
        if (this.duo[2].room_id) {
          this.$socket.emit('send_message',
            {
              from_user_id: this.duo[0].from_user_id,
              msg: this.message_to_send,
              to_user_id: this.duo[1].to_user_id,
              room_id: this.duo[2].room_id,
              user1_room_perso: this.duo[3].user1_room_perso,
              me_room_perso: this.duo[4].me_room_perso,
            }
          );
          this.message_to_send = '';
        }
      },
      /**
       * VALIDATION
       * */
      validate_message(){
        this.message_to_send = this.message_to_send.replace(/</g, " ").replace(/>/g, " ").replace(/&/g, " ").replace(/"/g," ").replace(/'/g," ").replace(/\//g, " ");
      }
    },
    watch:{
      //CHAT WINDOW
      duo: function ()
      {
        this.retrieve_history();
      }
    },
    sockets: {
      update_notification_chat: function(data){
        if (this.user_id === data[0])
        {
          let i = this.chats.findIndex(i => i.to_user_id === data[2]);
          if (i !== -1) {
            if (this.chats[i].has_message) this.chats[i].has_message = false;
          }
        }
      },
      user_logged_out:function (user_id) {
        this.chats.forEach(function (el) {
          if (el.to_user_id === user_id) el.online = "offline";
        })
      },
      user_logged_in:function (user_id) {
        this.chats.forEach(function (el) {
          if (el.to_user_id === user_id) el.online = "online"
        })
      },
      update_home_list:function (data) {
        if (data.user_id === this.user_id) this.$router.go();
        else {
          let self = this;
          self.retrieve_one_chat(data.user_id);
        }
      },
      update_chat_page:function (cards_user_id) {
        let self = this;
        self.retrieve_one_chat(cards_user_id);
      },
      /**
       * CHAT WINDOW
       * */
      get_message: function (data)
      {
        if (data.from_user_id === this.duo[1].to_user_id && data.to_user_id === this.duo[0].from_user_id && data.room_id === this.duo[2].room_id)
        {
          let message = {author: 'user1', text: data.msg, date: this.getTimeFromDate(new Date())};
          this.messageList.push(message);
        }
        if (data.to_user_id === this.user_id ) {
              let i = this.chats.findIndex(i => i.to_user_id === data.from_user_id);
              if (i !== -1 && this.duo[1].to_user_id !== data.from_user_id)
                this.chats[i].has_message = true;
            }

        setTimeout(function(){
          var objDiv = document.getElementById("chat_history");
          if (objDiv)
            objDiv.scrollTop = objDiv.scrollHeight;
        },50);
      },
      chat_error: function ()
      {
        let text = "Message not sent!";
        this.messageList.push({ author: 'me', type: 'text', data: {text} });
      },
      message_sent:function (data)
      {
        if (data.to_user_id === this.duo[1].to_user_id && data.from_user_id === this.duo[0].from_user_id && data.room_id === this.duo[2].room_id) {
          let message = {author: 'me', text: data.msg, date: this.getTimeFromDate(new Date())};
          this.messageList.push(message);
          setTimeout(function(){
            var objDiv = document.getElementById("chat_history");
            if (objDiv)
              objDiv.scrollTop = objDiv.scrollHeight;
          },50);
          this.action('message', 'sent');
        }
      },
    },
  }

</script>

<style scoped>
  @media screen and (min-width: 0px) {
    #chat_history
    {
      height: 80vw;
    }
  }
  @media screen and (min-width: 768px) {
    #chat_history
    {
      height: 50vw;
    }
  }
  @media screen and (min-width: 1224px) {
    #chat_history
    {
      height: 30vw;
    }
  }
</style>

