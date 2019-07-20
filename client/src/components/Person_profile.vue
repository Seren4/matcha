<template>
  <div class="container">
    <div class="notification is-info is-centered is-half-desktop" v-if="alert && (!isLogged || !completion || !completion_visited)">
      {{alert}}
    </div>
    <!--START-->
    <div class='columns'>
      <div class='container profile box section' v-if="isLogged && completion && completion_visited">
        <div class='section profile-heading'>
          <div class='columns is-mobile is-multiline'>
            <!--column 1 photo-->
            <div class='column is-full-mobile'>
              <span class='header-icon user-profile-image'>
                <figure class="is-inline-block image is-128x128">
                  <img class="is-rounded" v-bind:src="profile.image_profile" alt="Image">
                </figure>
              </span>
              <br>
              <div class='section' v-if="!faked && this.visitor !== this.profile.login">
                <button class="button is-small is-rounded is-outlined is-link" @click="showModal = true">Report as fake</button>
              </div>
            </div>
            <!--column2 name,login,bio-->
            <div class='column name is-full-mobile'>
              <p>
                <span class='title is-bold'>{{profile.name}} {{profile.surname}}</span>
              </p>
              <p>
                <span class='subtitle is-bold'>{{profile.login}}</span>
              </p>
              <br>
              <p class='tagline'>
                {{profile.bio}}
              </p>
            </div>
            <!--column3 age,sex,place-->
            <div class='column is-2-tablet is-4-mobile has-text-centered'>
              <span>
                <p class='stat-val'>{{profile.age}}</p>
              <p class='stat-key'>Age</p>
              </span>
              <br>
              <span>
                <p class='stat-val'>{{profile.gender}}, {{profile.pref}}</p>
                <p class='stat-key'>Orientation</p>
              </span>
              <br>
              <span v-if="profile.city && profile.country">
                <p class='stat-val'>{{profile.city}}, {{profile.postcode}}, {{profile.country}}, {{profile.country_code}}</p>
                <p class='stat-key'>Postition</p>
              </span>
            </div>
            <!--column4 score,likes-you,online-->
            <div class='column is-2-tablet is-4-mobile has-text-centered'>
              <span>
                <p class='stat-val'>{{profile.score}}</p>
                <p class='stat-key'>score</p>
              </span>
              <br>
              <span v-if="visited_likes">
                <p class='stat-val'>
                  <span class="icon is-small icon_red">
                        <i class="fas fa-heart "></i>
                  </span>
                </p>
                <p class='stat-key'>Likes you</p>
              </span>
              <br>
              <span>
                <p class='stat-val'>
                  <span class="icon_dark" :class="{'icon_green': profile.online === 'online'}">
                    <i class="fa fa-circle online"></i> {{profile.online}}
                  </span>
                </p>
                <p class='stat-val' v-show="profile.online==='offline'">
                  {{profile.last_visit}}
                </p>
              </span>
            </div>
            <!--column4 ban,like,chat-->
            <div class='column is-2-tablet is-4-mobile has-text-centered'>
              <span>
                <p class='stat-val is-size-3'>
                  <span class="" :class="{'icon_red': banned, 'icon_gray': !banned}" @click="add_visit_like_ban('ban')" style="border: none">
                    <i class="fas fa-ban"></i>
                  </span>
                </p>
              </span>
              <br>
              <span>
                <p class='stat-val is-size-3'>
                  <span class="icon" :class="{'icon_red': visitor_likes, 'icon_gray': !visitor_likes}" @click="add_visit_like_ban('like')" style="border: none">
                  <i class="fas fa-heart" ></i>
                  </span>
                </p>
              </span>
              <br>
              <p class='stat-val is-size-3'>
                <router-link class="icon" v-if="visitor_likes && visited_likes && !banned" style="border: none" :to="{name: 'Chat'}" target="_blank">
                  <i class="fas fa-comments" ></i>
                </router-link>
              </p>
            </div>
          </div>
        </div>
        <!--END-->
        <!--LOCATION/TAGS TAB-->
        <div class='profile-options column'>
          <div class='tabs is-fullwidth'>
            <ul style="border: none!important;">
              <li class='link' v-bind:class="{'is-active': tabs_value === 'tags'}">
                <a  @click="tabs_value = 'tags'">
              <span class='icon'>
                <i class="fas fa-skiing"></i>
              </span>
                  <span>My Interests</span>
                </a>
              </li>
              <li class='link' v-bind:class="{'is-active':tabs_value === 'gallery'}"  >
                <a @click="tabs_value = 'gallery'">
              <span class='icon'>
                <i class="fas fa-images"></i>
              </span>
                  <span>My Gallery</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <!--GALLERY-->
        <div class='columns is-mobile is-multiline' v-if="tabs_value === 'gallery'">
          <div class='column is-3-tablet is-6-mobile' v-for="photo in profile.photos" >
            <div class='card' style="background-color: transparent; border: transparent" v-if="photo">
              <div class='card-image' style="background-color: transparent; border: transparent">
                <figure class='image is-4by3' style="background-color: transparent; border: transparent">
                  <img v-bind:src="photo" alt="Image" style="background-color: transparent; border: transparent">
                </figure>
              </div>
            </div>
            <br>
          </div>
        </div>
        <!--TAGS-->
        <div class='columns is-mobile is-centered is-multiline' v-if="tabs_value === 'tags'">
          <div class="column is-narrow" v-for="tag in profile.tags">
            <div class="tags has-addons">
              <a class="tag is-link"># {{tag}}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--MODAL-->
    <div class="modal column" v-show="showModal" style="display: flex;">
      <div class="modal-background" @click="showModal = false">></div>
      <div class="modal-content box">
        <button class="button " @click="report_fake">Confirm Report as fake account</button>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="showModal = false"></button>
    </div>
  </div>
</template>

<script>
  import UserService from '../services/UserService'
  import General from '@/services/General'
  import { EventBus } from '../event-bus';

  export default {
    name: 'Person_profile',
    data()
    {
      return {
        open_chat: false,
        completion: 0,
        completion_visited: false,
        visitor_likes: false,
        visited_likes: false,
        banned: false,
        faked: false,
        visitor: '',
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        alert: null,
        unfinished: "You must complete your profile to access this page",
        unfinished_visited: "Profile not complete?",
        anonymous: "You must first log in to access this page",
        profile: [],
        photos: {image1: '', image2: '', image3: '', image4: ''},
        image_profile: '',
        notification: {mail: ''},
        showModal: false,
        showChat: false,
        duo: [],
        title:'',
        online:'',
        logout_time:'',
        user_id: null,
        tabs_value:'tags'
      }
    },
    mounted() {
      let self = this;
      this.get_user_id().then(function (logged) {
        if (!logged)
          self.alert = self.anonymous;
        else {
          self.visited_card_id = self.$route.params["card_id"];
          self.visitor_user_id = self.user_id;
          self.get_completion();
          self.user_exists();
        }
        EventBus.$on('close_chat', () => {
          self.open_chat = false;
          self.showChat = false;
        });
      });
    },
    methods: {
      async get_user_id(){
          const response = await UserService.get_user_id({'session_id':this.$session.get('b_sessionID')});
          if (response && response.data) {
            this.user_id = response.data.user_id;
            this.visitor = response.data.login;
          }
          return !!(response.data.user_id);
      },
      async report_fake() {
        if (this.visitor !== this.profile.login) {
          let data = {actor_user_id: this.visitor_user_id, target_user_id: this.visited_user_id};
          const response = await General.report_fake({data: data});
          this.get_fake_status();
          this.showModal = false;
          this.$socket.emit('refresh_visited_profile', this.visitor_user_id, this.visited_user_id);

        }
      },
      /**
       * RETRIEVE AREA
       * */
      async get_completion(){
        const response = await UserService.get_user_completion({user_id:this.user_id});
        if (response && response.data)
        {
          this.completion = response.data.completion;
          if (this.completion === 0) this.alert = this.unfinished;
        }
      },
      checkIfIsLogged() {
        return (!!this.user_id);
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
      async get_like_status(option)
      {
        if (this.visitor !== this.profile.login) {
          let data;
          if (option === 'visited_likes')
            data = {actor_user_id: this.visited_user_id, target_user_id: this.visitor_user_id};
          else if (option === 'visitor_likes')
            data = {actor_user_id: this.visitor_user_id, target_user_id: this.visited_user_id};
          let resp = await General.get_like_status({data: data});
          if (resp && resp.data)
          {
            if (option === 'visited_likes')
              this.visited_likes = resp.data.success;
            else if (option === 'visitor_likes')
              this.visitor_likes = resp.data.success;
          }
        }
      },
      async get_ban_status()
      {
        if (this.visitor_user_id !== this.visited_user_id) {
          let data = {actor_user_id: this.visitor_user_id, target_user_id: this.visited_user_id};
          let resp = await General.get_ban_status({data: data});
          if (resp && resp.data)
            this.banned = resp.data.success;
        }
      },
      async get_score()
      {
        if (this.visitor_user_id !== this.visited_user_id)
        {
          let resp = await General.get_score({data: {user_id: this.visited_user_id}});
          if (resp && resp.data && resp.data.success) this.profile.score = resp.data.score;
        }
      },
      async get_fake_status()
      {
        if (this.visitor_user_id !== this.visited_user_id) {
          let data = {actor_user_id: this.visitor_user_id, target_user_id: this.visited_user_id};
          let resp = await General.get_fake_status({data: data});
          if (resp && resp.data) this.faked = resp.data.success;
        }
      },
      async retrieve_profile(){
        let resp = await General.user_exists({card_id:this.visited_card_id});
        if (resp && resp.data && resp.data.result) {
          let data = resp.data.result;
          if (data.complete === 1) {
            this.visited_user_id = data.id;
            this.completion_visited = true;
            this.profile = data;
            let tags_array = this.profile.tags.split(',');
            this.profile.tags = [];
            this.profile.photos = {};
            this.profile.tags = tags_array;
            let time = this.getTimeFromDate(data.logout_time);
            this.profile.online = data.online === 1 ? "online" : "offline";
            this.profile.last_visit = data.online === 1 ? '' : "last visit " + time;
            this.profile.image_profile = Buffer.from(data.image_profile.data, 'binary');
            for (let i = 1, key; i < 5; i++) {
              key = 'image' + i;
              if (data[key] && data[key].data.length > 1){
                this.profile.photos[key] = Buffer.from(data[key], 'binary');
              }
            }
          }
        }
        return (resp.data.message);
      },
      /**
       * ACTION AREA
       * */
      async action (object, action)
      {
        let resp = await General.action({actor_id: this.visitor_user_id, verb:action, object:object, target_id: this.visited_user_id});
      },
      async add_visit_like_ban(option)
      {
        if (this.visitor !== this.profile.login) {
          let data = {actor_user_id: this.visitor_user_id, target_user_id: this.visited_user_id};
          let resp = await General.add_visit_like_ban({option: option, data: data});
          if (option === "visit") this.$socket.emit('notify_visit', this.profile.room_perso);
          if (option === "like")
          {
            let notification_flag = 0, chat_flag = 0;
            this.visitor_likes = !this.visitor_likes;
            if (this.visitor_likes && this.visited_likes) // send notification if reciprocate
              this.action('like', 'reciprocate');
            else if (this.visitor_likes && !this.visited_likes)
              this.action('like', 'put');
            else if (!this.visitor_likes && this.visited_likes)
              this.action('like', 'remove');
            // only if one of the 3 cases above is true, we emit the notification to update the notices list
            if ((this.visitor_likes && this.visited_likes)||(this.visitor_likes && !this.visited_likes)||
              (!this.visitor_likes && this.visited_likes))
              notification_flag = 1;
            // we update the chat page only if one reciprocates or removes the like
            if ((this.visitor_likes && this.visited_likes)||(!this.visitor_likes && this.visited_likes))
              chat_flag = 1;
            this.$socket.emit('check_likes', this.profile.room_perso, this.visited_user_id, notification_flag, chat_flag, this.visitor_user_id);
            this.$socket.emit('refresh_visited_profile', this.visitor_user_id, this.visited_user_id);
          }
          if (option === "ban")
          {
            this.get_ban_status();
            this.$socket.emit('refresh_visited_profile', this.visitor_user_id, this.visited_user_id);
          }
        }
      },
      async user_exists()
      {
        let outcome = await this.retrieve_profile();
        if (outcome && outcome === "User not found")
          this.$router.push({path: '/*'});
        else if (outcome && outcome === "User found" && this.visitor !== this.profile.login)
        {
          this.create_room();
          this.add_visit_like_ban("visit");
          this.action('visit', 'pay');
          this.get_like_status('visited_likes');
          this.get_like_status('visitor_likes');
          this.get_ban_status();
          this.get_fake_status();
        }
        else
          this.$router.push({path: '/*'});
      },
      async create_room(){
        let data = {login1: this.visitor, user1_id:this.visitor_user_id, login2: this.profile.login, user2_id:this.visited_user_id};
        let resp = await General.create_room({data: data});
      }
    },
    sockets: {
      /** on visited/visitor uncompletion, refresh*/
      update_home_list: function (data)
      {
        if (data.user_id === this.user_id || data.user_id === this.visited_user_id)
          this.$router.go();
      },
      refresh_visited_profile: function (visited_id){
        if (visited_id === this.visited_user_id)
        {
          this.get_ban_status();
          this.get_like_status('visitor_likes');
          this.get_fake_status();
          this.get_score();
        }
      },
      check_visited_online_status_response: function(count){
        if (count > 0)
          this.profile.online = "online";
        else
          this.profile.online = "offline";
      },
      refresh_likes: function ()
      {
        this.get_like_status('visited_likes');
      },
      user_logged_out:function (user_id) {
         if (this.visited_user_id === user_id){
            this.profile.online = "offline";
            this.profile.last_visit = this.getTimeFromDate(new Date());
         }
      },
      user_logged_in:function (user_id) {
        if (this.visited_user_id === user_id)
          this.retrieve_profile();
      }
    }

  }
</script>

<style scoped>
  .icon_dark
  {
    color: black;
  }
  .icon_green
  {
    color: limegreen;
  }
  .icon_red
  {
    color: darkred;
  }
  .icon_gray
  {
    color: dimgray;
  }

  .stat-val {
    font-size: 1em;
    font-weight: 200;
    /*padding-top: 20px;*/
  }

  .stat-key {
    font-size: 1em;
    font-weight: bold;
  }

  .section.profile-heading .column.is-2-tablet.has-text-centered + .has-text-centered {
    border-left: 1px dotted rgba(0, 0, 0, 0.2);
  }

  .container.profile {
    margin-top: 1%;
  }

  .control.is-pulled-left span.select {
    margin-right: 5px;
    border-radius: 2px;
  }

  .modal-card .content h1 {
    padding: 40px 10px 10px;
    border-bottom: 1px solid #dadada;
  }

  .container.profile .profile-options .tabs ul li.link a {
    margin-bottom: 20px;
    padding: 20px;
    background-color: transparent;
  }

  .tag:hover{
    cursor: default;
    text-decoration: none;
  }

</style>

