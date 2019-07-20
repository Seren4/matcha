<template>
  <nav class="navbar is-transparent" >
    <div class="navbar-brand" >
      <div class="navbar-item">
        <a href="" class="nav_link navbar-item title is-5 is-transparent"  @click="goHome" >
          <img src="@/assets/icons/logo1.png" alt="Matcha" style="max-height:3.75rem">
          <p class="has-text-weight-bold is-size-5 has-text-danger" >Matcha</p>
        </a>
      </div>
      <label class="navbar-burger burger" data-target="navbarExampleTransparentExample" for="nav-toggle-state" aria-label="menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </label>
    </div>
    <input type="checkbox" id="nav-toggle-state" @click="close_menu"/>
    <div id="navbarExampleTransparentExample" class="navbar-menu">

      <div class="navbar-start">
        <span class="navbar-item"></span>
        <span class="navbar-item"></span>
        <a href="" class="navbar-item" @click="goHome"> Home</a>
        <router-link :to="{ name: 'Chat'}" v-show="isLogged" class="navbar-item">Chat</router-link>
        <div class="navbar-item" v-show="isLogged">
          <div class="dropdown">
            <div class="dropdown-trigger" @click="check_notification">
              <button class="button" aria-haspopup="true" aria-controls="dropdown-menu2" style="background: transparent;border: none">
                <span class="icon is-small" style="color: red" v-show="notification_active">
                  <i class="fas fa-heartbeat" aria-hidden="true"></i>
                </span>
                <span>Notices</span>
                <span class="icon is-small">
                  <i class="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </div>
            <div class="dropdown-menu" id="dropdown-menu2" role="menu" style="z-index: 1; width: 30vw">
              <div class="dropdown-content" v-show="notification.length">
                <div class="dropdown-item" v-for="not in notification" >
                  <div >
                    <span class="tag is-link">{{not.date}}</span>
                    <p  v-bind:class="not.class">{{not.text}}</p>
                  </div>
                  <hr class="dropdown-divider" v-show="notification[notification.indexOf(not)+1]">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="navbar-end">
        <router-link :to="{ name: 'Login'}" v-if="!isLogged" class="navbar-item">Login</router-link>
        <router-link :to="{ name: 'Register'}" v-if="!isLogged" class="navbar-item">Register</router-link>
        <router-link :to="{ name: 'UserArea'}" v-if="isLogged" class="navbar-item">{{username}}</router-link>
        <a class="navbar-item" v-if="isLogged" @click="logout">Logout</a>
      </div>
    </div>
  </nav>
</template>


<script>
  import { EventBus } from '../../event-bus';
  import General from '@/services/General';
  import UserService from '@/services/UserService'


  export default {
    name: 'myHeader',
    mounted () {
      if (this.$session.get('b_sessionID')){
        this.get_user_id();
      }
      if (this.isLogged)
      {
        this.retrieve_notification();
      }

      EventBus.$on('logged', (login) => {
        this.get_user_id(login);
        let dropdown = document.querySelector('.dropdown');
        if (dropdown) {
          let open = dropdown.classList.contains('is-active');
          if (open)
            dropdown.classList.toggle('is-active');
        }
      });

      EventBus.$on('login_changed', (value) => {
        this.username = value;
      });
    },
    data () {
      return {
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        username: '',
        user_id: '',
        notification:[],
        notification_active:false,
        unread_not:false,
        notice_open:false,
        home_flag:0,
        room_perso:'',
        completion: ''
      }
    },
    methods: {
      close_menu(){
        let dropdown = document.querySelector('.dropdown');
        if (dropdown && dropdown.classList.contains('is-active'))
            dropdown.classList.toggle('is-active');
      },
      async get_user_id(login){
        const response = await UserService.get_user_id({'session_id':this.$session.get('b_sessionID')});
        if (response && response.data && response.data.success)
        {
          this.user_id = response.data.user_id;
          this.username = response.data.login;
          this.room_perso = response.data.room_perso;
          this.completion = response.data.complete;
          if (login)
            this.isLogged = this.checkIfIsLogged(login);
          else
            this.isLogged = this.checkIfIsLogged(response.data.login);
          this.store_id();
          this.$socket.emit("join", this.room_perso);
        }
        else {
          this.logout();
        }
      },
      async store_id (){
        let data = {login: this.username, user_id:this.user_id, id: this.$socket.id};
        let resp = await General.store_id({data: data});
      },
      goHome (){
         this.$router.push('/')
      },
      checkIfIsLogged (login) {
        this.username = login;
        if (this.username) {
          this.retrieve_notification();
          this.$socket.emit('user_login', this.username, this.user_id);
        }
        return !!this.username;
      },
       logout () {
        let resp =  UserService.logout({b_session: this.$session.get('b_sessionID')});
        this.$socket.emit('logout', this.username,  this.user_id, this.room_perso);
        this.isLogged = false;
        this.username = '';
        EventBus.$emit('logout');
        this.$router.push('/');
        this.$session.destroy();
      },
       check_notification (event){
        let dropdown = document.querySelector('.dropdown');
        event.stopPropagation();
        dropdown.classList.toggle('is-active');
        let open = dropdown.classList.contains('is-active');
        if (open === false)
        {
          this.notification_active = false;
           this.notification.find((el, i) =>
            {
              if (!el.seen){
                this.notification[i].seen = 1;
                this.notification[i].class = "has-text-grey";

              }
            });
            let data = {target_id: this.user_id};
            let resp =  General.update_notification({data: data});
            this.$socket.emit("update_notification", this.user_id);
        }
      },
      async retrieve_notification()
      {
        if (this.user_id) {

          let data = {target_id: this.user_id};
          let resp = await General.retrieve_notification({data: data});
          if (resp && resp.data) {
            this.notification = [];
            let notification = [];
            let unread = 'has-text-dark has-text-weight-bold';
            let read = 'has-text-grey';
            for (let i = 0; i < resp.data.notification.length; i++) {
              if (resp.data.notification[i].seen === 0) {
                this.notification_active = true;
                break;
              }
            }
            for (let i = 0; i < resp.data.notification.length; i++) {

              let time = this.getTimeFromDate(resp.data.notification[i].date);
              let text = '';
              let actor = resp.data.notification[i].login;
              let verb = resp.data.notification[i].verb;
              let object = resp.data.notification[i].object;
              let seen = resp.data.notification[i].seen;

              if (object === 'message') {
                text = 'You have unread messages from ' + actor;
              } else if (object === 'like') {
                if (verb === 'put')
                  text = actor + " likes you";
                else if (verb === 'remove')
                  text = actor + " doesn't like you anymore";
                else if (verb === "reciprocate")
                  text = actor + " likes you back";
              } else if (object === 'visit')
                text = actor + " has been on your profile";


              notification.push({
                text: text,
                date: time,
                seen: seen,
                class: seen ? read : unread,
                object: object,
                actor: actor
              });
              if (!seen && object === 'message') {
                EventBus.$emit('notify_message', actor);
              }
            }
            this.notification.push.apply(this.notification, notification);
          }
        }
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
        // let sec = date.getSeconds();
        return pad(day) + "/" + pad(month) + "/" + year + " " + pad(hours) + "h" + pad(minutes)
      },
    },
    sockets: {
      logout: function()
      {
        this.$router.go();
      },
      update_notification: function(user_id){
        if (this.user_id === user_id)
        {
          this.notification_active = false;
          this.notification.forEach(function (el)
          {
            if (!el.seen)
            {
              el.seen = 1;
              el.class = "has-text-grey";
            }
          })
        }

      },
      update_notification_chat: function(data){
        if (this.user_id === data[0])
        {
          let self = this;
          this.notification_active = false;
          self.notification.forEach(function (el)
          {
            if (!el.seen && el.object==='message' && el.actor === data[1])
            {
              el.seen = 1;
              el.class = "has-text-grey";
            }
            if (!el.seen)
            {
              self.notification_active = true;
            }
          });
        }
      },
      notification: function ()
      {
          this.retrieve_notification();
      },
    },
    watch:{
      isLogged: function () {
        if (!this.isLogged)
          this.logout();
      }
    }

  }
</script>

<style scoped>

  .navbar{
    background-color: rgba(35, 169, 126, 0.69);
    /*background: transparent none !important;*/
  }
  #nav-toggle-state {
    display: none;
  }

  #nav-toggle-state:checked ~ .navbar-menu {
    display: block;
  }
  #navbarExampleTransparentExample{
    background-color: transparent!important;
    background-image: none;
  }

  .navbar-item{
    text-align: center;
  }
  .navbar-item:hover{
    color: rgba(17, 169, 55, 0.87);
  }

  .dropdown-content {
    min-width: 15em;
    max-height: 25em;
    overflow: auto;
  }

</style>
