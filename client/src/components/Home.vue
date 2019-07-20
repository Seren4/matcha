<template>
  <div class="container" >
    <!--ALERT-->
    <div class="columns is-multiline is-centered">
      <div class="column is-half is-centered">
        <article class="message is-link is-narrow" v-if="alert && (!isLogged || !completion)">
          <div class="message-body">
            {{alert}}
          </div>
        </article>
      </div>
    </div>
    <!--CONTENT-->
    <div v-if="showNav && completion">
      <!--PLACE MODAL-->
      <article class="message is-primary" v-show="show_place_modal" @click="show_place_modal=false">
        <div class="message-header">
          <p>Insert location</p>
          <button class="delete" aria-label="delete" @click="show_place_modal=false;"></button>
        </div>
        <div class="message-body">
          <div class="columns is-mobile is-centered">
            <div class="column is-full-mobile is-half-desktop">
              <span class="control has-icons-left ">
                <input id="place_modal_input" class="input is-rounded" type="text" @click.stop v-model="place_choice">
                <span class="icon is-small is-left">
              <i class="fas fa-globe-africa"></i>
            </span>
              </span>
            </div>
          </div>
        </div>
      </article>
      <!--SCORE MODAL-->
      <article class="message is-primary" v-show="show_score_modal" @click="show_score_modal=false">
        <div class="message-header">
          <p>Select score range</p>
          <button class="delete" aria-label="delete" @click="show_score_modal=false;"></button>
        </div>
        <div class="message-body">
          <p>
            <span class="has-text-grey">Score min: </span>
            <span id="score_slider_min_output" class="age_slider_min_output">0</span>
          </p>
          <input id="score_slider_min" class="age_slider" type="range" min="0" max="500" value="0" @input="slider('score','min')" @click.stop>
          <p>
            <span class="has-text-grey">Score max: </span>
            <span id="score_slider_max_output" class="age_slider_max_output">500</span>
          </p>
          <input id="score_slider_max" class="age_slider" type="range" min="0" max="500" value="500" @input="slider('score','max')" @click.stop>
        </div>
      </article>
      <!--AGE MODAL-->
      <article class="message is-primary" v-show="show_age_modal" @click="show_age_modal=false">
        <div class="message-header">
          <p>Select age range</p>
          <button class="delete" aria-label="delete" @click="show_age_modal=false;"></button>
        </div>
        <div class="message-body">
            <p>
              <span class="has-text-grey">Age min: </span>
              <span id="age_slider_min_output" class="age_slider_min_output">18</span>
            </p>
            <input id="age_slider_min" class="age_slider" type="range"  min="18" max="101" value="18" @input="slider('age','min')" @click.stop>
            <p>
              <span class="has-text-grey">Age max: </span>
              <span id="age_slider_max_output" class="age_slider_max_output">101</span>
            </p>
            <input id="age_slider_max" class="age_slider" type="range"  min="18" max="101" value="101" @input="slider('age','max')" @click.stop>
        </div>
      </article>
      <!--TAGS SELECT MODAL-->
      <article class="message is-primary" v-show="show_tags_modal && all_tags" @click="show_tags_modal=false">
        <div class="message-header">
          <p>Select one or more interests</p>
          <button class="delete" aria-label="delete" @click="show_tasg_modal=false"></button>
        </div>
        <div class="message-body" >
          <div class="field is-grouped is-grouped-multiline">
            <p class="control" v-for="tag in all_tags" @click.stop>
              <a class="tag tag_modal"  @click="edit_input_tags(tag)" v-bind:class="{ 'is-link': show_tags.includes(tag) ,'is-grey-lighter' : show_tags.includes(tag)}">{{tag}}</a>
            </p>
          </div>
        </div>
      </article>
      <div class="columns is-multiline is-mobile">
        <!--VIEW FILTER SORTING-->
        <div class="column ">
          <div class="field has-addons">
            <p class="control" id="filters_start">
              <a class="button is-rounded is-primary disabled">
              <span class="icon is-small">
                <i class="fas fa-filter"></i>
              </span>
              </a>
            </p>
            <p class="control">
              <a class="button is-rounded"  @click="show_age_modal=true;show_place_modal=false;show_tags_modal=false;show_score_modal=false">
                <span>age</span>
              </a>
            </p>
            <p class="control">
              <a class="button is-rounded" @click="show_age_modal=false;show_place_modal=false;show_tags_modal=false;show_score_modal=true">
                <span>score</span>
              </a>
            </p>
            <p class="control">
              <a class="button is-rounded" @click="show_age_modal=false;show_place_modal=true;show_tags_modal=false;show_score_modal=false">
                <span>place</span>
              </a>
            </p>
            <p class="control">
              <a class="button is-rounded"  @click="show_age_modal=false;show_place_modal=false;show_tags_modal=true;show_score_modal=false">
                <span>tags</span>
              </a>
            </p>
          </div>
      </div>
        <div class="column ">
          <!--SORTING-->
          <div class="field has-addons">
            <p class="control" id="sorters_start">
              <a class="button is-rounded is-primary">
                <span class="icon is-small">
                  <i class="fas fa-sort"></i>
                </span>
              </a>
            </p>
            <p class="control" @click="sort_choice='age' && sort('age')">
              <a class="button is-rounded" >
                <span>age</span>
              </a>
            </p>
            <p class="control" @click="sort_choice='score' && sort('score')">
              <a class="button" >
                <span>score</span>
              </a>
            </p>
            <p class="control"  @click="sort_choice='interests' && sort('interests')">
              <a class="button" >
                <span>tags</span>
              </a>
            </p>
            <p class="control" @click="sort_choice='location' && sort('location')">
              <a class="button is-rounded" >
                <span>place</span>
              </a>
            </p>
          </div>
        </div>
        <!--RESET BUTTON-->
        <div class="column">
          <div class="field" >
            <div class="control" id="reset_btn">
              <button class="button is-primary is-rounded" @click="reset">Reset</button>
            </div>
          </div>
        </div>
      </div>
      <!--ERROR-->
      <article class="message is-danger" v-if="error_flag && !my_isEmpty(errors)">
        <div class="message-body">
          <ul v-for="error in errors">
            <li  v-if="error">- {{error}}</li>
          </ul>
        </div>
      </article>
      <!--ALL/LIKES/VISITS TABS CHOICE-->
      <div class="tabs is-fullwidth is-medium is-centered">
        <ul>
          <li v-bind:class="{ 'is-active':value === view_options['likes']}">
            <a @click="switch_cards('get_likes', null);">
              <span class="icon is-small"><i class="far fa-thumbs-up" aria-hidden="true"></i></span>
              <span>Likes</span>
            </a>
          </li>
          <li v-bind:class="{ 'is-active':value === view_options['all']}">
            <a @click="switch_cards('all', null)">
              <span class="icon is-small"><i class="far fa-user" aria-hidden="true"></i></span>
              <span>All</span>
            </a>
          </li>
          <li v-bind:class="{ 'is-active':value === view_options['visits']}">
            <a @click="switch_cards('get_visits', null);">
              <span class="icon is-small"><i class="far fa-eye" aria-hidden="true"></i></span>
              <span>Visits</span>
            </a>
          </li>
        </ul>
      </div>
      <!--CARDS-->
      <div  class=" columns is-multiline" v-if="!alert && completion">
        <div class="column is-one-third-desktop is-half-tablet is-full-mobile" v-for="person in people_scroll">
            <div class="card people" >
              <router-link :to="{ path: 'person_profile/'+(person.card_id)}" target="_blank" >
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image is-96x96">
                    <img v-bind:src="person.image_profile" alt="Image" class="is-rounded">
                  </figure>
                </div>
                <div class="media-content is-vcentered" style="align-self: center">
                  <div class="content">

                  <p class="title is-4">{{person.name}} {{person.surname}}</p>
                  <p class="subtitle is-6">{{person.login}}</p>
                  </div>
                </div>
              </div>
              <div class="content is-grouped is-grouped-centered">
                <span class="button" style="border: transparent">
                  <span class="icon is-small">
                     <i class="fas fa-star-half-alt"></i>
                   </span>
                  <span>{{person.score}}</span>
                </span>
                <span class="button" style="border: transparent">

                   <span class="icon is-small ">
                      <i class="fa fa-venus-mars"></i>
                    </span>
                  <span>{{person.gender}}, {{person.pref}}</span>
                </span>
                <br>
                <span class="button" style="border: transparent">
                    <span class="icon is-small">
                      <i class="fas fa-calendar-alt"></i>
                    </span>
                    <span>{{person.age}} years</span>
                  </span>
                <span class="button" style="border: transparent">
                <span class="icon is-small ">
                    <i class="fas fa-snowboarding"></i>
                  </span>
                <span v-if="person.common_count">{{person.common_count}} shared interests</span>
                <span v-else>No shared interests</span>
                </span>
                <br>
                <span class="button" style="border: transparent">
                   <span class="icon is-small ">
                     <i class="fas fa-globe-americas"></i>
                   </span>
                  <p>
                  <span v-if="person.distance >= 0">{{person.distance}} Km</span>
                  </p>
                </span>
                <span class="button" style="border: transparent">
                  <p>
                    <span v-if="person.city"> {{person.city}}, </span>
                  <span v-if="person.country_code"> {{person.country_code}}</span>
                  </p>
                </span>
              </div>
            </div>
              </router-link>
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
  name: 'Home',
  data () {
    return {
      view_options:{all:'all',likes:'get_likes', visits:'get_visits'},
      value : '',
      completion: 0,
      show: true,
      showNav: false,
      /** user data */
      isLogged: this.$session.get('b_sessionID') ? 1 : 0,
      room_perso:'',
      login: null,
      user_id:null,
      visitor_profile:[],
      visitor_tags:[],
      /** people arrays */
      scroll_index:0,
      people_scroll:[],
      people:[],
      banned_people:[],
      people_backup:[],
      ban_update:0,
      /** sort filter */
      age_range:'',
      score_range:'',
      place_choice:'',
      tags_choice:'',
      sort_choice:'',
      sort_options: ['age', 'location', 'score', 'interests'],
      /** alerts */
      alert: null,
      unfinished:"You must complete your profile to access this page",
      anonymous:"You must first log in to access this page",
      /** errors */
      error_flag:false,
      errors: {},
      /** tags */
      all_tags:[],
      show_tags:[],
      show_tags_modal:false,
      show_age_modal:false,
      show_score_modal:false,
      show_place_modal:false,
      /** GEOLOCATION */
      geo_options: {enableHighAccuracy: true, maximumAge: 0},
      user_coords: {lat: null, lng: null, city : null, country : null, country_code : null, postcode : null, user_id: null},
    }
  },
  mounted() {
    let self = this;
    this.get_user_id().then(function (logged) {
      if (!logged)
        self.alert = self.anonymous;
      else {
        self.get_completion_check_if_located();
        EventBus.$on('logout', () => {
          self.isLogged = self.checkIfIsLogged();
          self.alert = self.anonymous;
          self.showNav = false;
        });
      }
    });
    /** close modal with ESC*/
    document.body.addEventListener('keyup', e => {
        if (e.keyCode === 27) {
          this.show_age_modal = false;
          this.show_tags_modal = false;
          this.show_score_modal = false;
          this.show_place_modal = false;
        }
    })
  },
  methods: {
    /**
     * LOG CHECK ZONE
     **/
    get_user_id: async function () {
      const response = await UserService.get_user_id({'session_id': this.$session.get('b_sessionID')});
      if (response && response.data)
      {
        this.user_id = response.data.user_id;
        this.login = response.data.login;
      }
      return !!(response.data.user_id);
    },
    checkIfIsLogged() {
      return (!!this.user_id);
    },
    /**
     * SCROLL ZONE
     **/
    scroll () {
      window.onscroll = () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight*0.8;
        let max = this.scroll_index + 20;
        if (bottomOfWindow) {
          while(this.scroll_index < max && this.scroll_index < this.people.length)
          {
            if (!(this.people_scroll.includes(this.people[this.scroll_index])))
              this.people_scroll.push(this.people[this.scroll_index++]);
          }
        }
      };
    },
    populate_first_9(){
      this.people_scroll = [];
      this.scroll_index = 0;
      let limit = this.people.length < 20 ? this.people.length : 20;
      while(this.scroll_index < limit)
        this.people_scroll.push(this.people[this.scroll_index++]);
    },
    /**
     * GEOLOCATION ZONE
     * */
    async store_position(){
      const response = await UserService.store_position(this.user_coords);
    },
    async hidden_get_position(){
      const response = await UserService.hidden_get_position();
      if (response && response.data)
      {
        this.user_coords.lat = response.data.lat;
        this.user_coords.lng = response.data.lon;
        this.user_coords.user_id = this.user_id;
        this.store_position();
      }
    },
    geolocation_success(pos) {
      let lat = pos.coords.latitude;
      let lng = pos.coords.longitude;
      let coords = lat + ', ' + lng;
      let self = this;
      UserService.reverse_geocoding(coords).then(function (resp) {
        if (resp && resp.data && resp.data.addresses[0] && resp.data.addresses[0].address)
        {
          let result = resp.data.addresses[0].address;

          self.user_coords.lat = lat;
          self.user_coords.lng = lng;
          self.user_coords.city = result.municipality;
          self.user_coords.country = result.country;
          self.user_coords.country_code = result.countryCode;
          self.user_coords.postcode = result.postalCode;
          self.user_coords.user_id = self.user_id;

          self.store_position();
        }
      });
    },
    geolocation_error(err) {
      /** err.code === 1 means user denied location => do it anyway */
      if (err.code === 1)
        this.hidden_get_position();
    },

    /**
     * RETRIEVE ZONE
     * */
    async get_all_tags()
    {
      this.all_tags=[];
      const response = await UserService.get_all_tags({option:'get_all_tags'});
      if (response && response.data && response.data.tags) {
        let tags = response.data.tags;
        for (let i = 0; i < tags.length; i++)
          this.all_tags.push(tags[i].tag);
        this.all_tags.sort();
      }
    },
    async get_banned(){
      this.banned_people = [];
      let banned_resp = await General.get_banned({user_id: this.user_id});
      if (banned_resp && banned_resp.data && banned_resp.data.response) {
        for (let i = 0; i < banned_resp.data.response.length; i++)
          this.banned_people.push(banned_resp.data.response[i].card_id);
      }
    },
    async get_completion_check_if_located() {
      const response = await UserService.get_user_completion({user_id:this.user_id});
      if (response && response.data) {
        this.completion = response.data.completion;
        this.room_perso = response.data.room_perso;
        this.$socket.emit("join", this.room_perso);
        if (response.data.completion === 0)
          this.alert = this.unfinished;
        else
          {
          this.showNav = true;
         let self = this;
            this.retrieve_visitor_info().then(function () {
              self.get_all_tags();
              self.switch_cards('all', null);
              self.scroll();


          });
        }
        // check if user has already been located, if not => propose
        if (!response.data.coords.lat || !response.data.coords.lng) {
          if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this.geolocation_success, this.geolocation_error, this.geo_options);
        }
      }

    },
    async retrieve_visitor_info()
    {
      let resp = await UserService.get_user_data({option:'get_profile', login: this.login});
      if (resp && resp.data && resp.data.response[0]) {

        this.visitor_profile = resp.data.response[0];
        if (this.visitor_profile.tags) {
          let tags_array = this.visitor_profile.tags.split(',');
          this.visitor_profile.tags = [];
          this.visitor_profile.tags.push.apply(this.visitor_profile.tags, tags_array);
        }
      }
    },
    /**
     * SWITCH VIEW ZONE
     * */
    async switch_cards(value, old_choices)
    {
      this.value = value;
      if (value === 'all' || value === 'get_visits' || value === 'get_likes') {
        this.people = [];
        let resp;
        if (value === 'all') {
          resp = await General.get_profiles({user_id: this.user_id});
          this.get_banned();
        }
        else {
          resp = await General.get_visitors_likers({option: value, user_id: this.user_id});
          this.get_banned();
        }
        if (resp && resp.data && resp.data.response)
        {
          for (let i = 0; i < resp.data.response.length; i++)
          {
            if (this.check_match(resp.data.response[i].gender, resp.data.response[i].pref))
            {
              this.people.push(resp.data.response[i]); // il filter altera l'array iniziale => cambiando range d'età, non abbiamo più tutti i profili
              this.people[this.people.length - 1].image_profile = Buffer.from(resp.data.response[i].image_profile, 'binary'); // il filter altera l'array iniziale => cambiando range d'età, non abbiamo più tutti i profili
              var distance = this.distance(this.visitor_profile.lat, this.visitor_profile.lng, resp.data.response[i].lat, resp.data.response[i].lng);
              this.people[this.people.length - 1].distance = Math.round(distance * 1000) / 1000;
              this.people[this.people.length - 1].state = resp.data.response[i].state;
              this.people[this.people.length - 1].city = resp.data.response[i].city;
              // SHARED INTERESTS
              if (this.visitor_profile.tags) {
                let common_count = 0, a_tags = resp.data.response[i].tags.split(',');
                this.visitor_profile.tags.forEach(function (el) {if (a_tags.includes(el)) common_count++;});
                resp.data.response[i].common_count = common_count;
                }
            }
          }
          this.sort_default();
          // backup
          this.people_backup = [];
          this.people_backup.push.apply(this.people_backup, this.people);
        }
        if (!old_choices && !(this.age_range || this.score_range || this.tags_choice || this.place_choice))
            this.populate_first_9();
          else if (!old_choices && (this.age_range || this.score_range || this.tags_choice || this.place_choice))
            this.filter_people();
          else if (old_choices) {
            this.age_range = old_choices.age_range;
            this.score_range = old_choices.score_range;
            this.tags_choice = old_choices.tags_choice;
            this.place_choice = old_choices.place_choice;
            this.filter_people();
        }
      }
    },
    check_match(gender, pref)
    {
      let my_gender = this.visitor_profile.gender;
      let my_pref = this.visitor_profile.pref;
      let flag = true;
        switch (my_pref)
        {
          case "gay":
            if (!(gender === my_gender && (pref === my_pref || pref === "bisex"))) flag = false;
            break;
          case "straight":
            if (!(gender !== my_gender && (pref === my_pref || pref === "bisex"))) flag = false;
            break;
          case "bisex":
            if (!((gender === my_gender && (pref === my_pref || pref === "gay")) || (gender !== my_gender && (pref === my_pref || pref === "straight")))) flag = false;
            break;
        }
      return flag;
    },
    distance(lat1, lon1, lat2, lon2) {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      dist = dist * 1.609344;
      return parseInt(dist)
    },
    /**
     * ERROR CHECK ZONE
     * */
    my_isEmpty(obj){
        for(var key in obj)
        {
          if(obj[key]) return false;
        }
        return true;
    },
    validation(field, value) {
      let re;
      switch (field) {
        case 'age':
          re = /^(18?[1-9]|[1-9][0-9]|[1][1-9][1-9]|101)$/;
          break;
        case 'score':
          re = /^(0?[0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1][0-9][0-9][0-9]|500)$/;
          break;
        case 'postcode':
          re = /^\d{5}$/;
          break;
        case 'country_code':
          re = /^[a-zA-Z]{2}$/;
          break;
        case 'country_name':
          re = /^[a-zA-Z]+(?:[\s][a-zA-Z]+)*$/;
          break;
        case 'city':
          re = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;
          break;
        case 'tag':
          re = /^[a-zA-Z0-9]+$/;
          break;
      }
      return re.test(value);
    },
    input_error_check(input_case)
    {
      let local_flag_error = false;
      let age_params, place_params, tags_params, score_params;
      if (input_case === 'age' && this.age_range)
      {
        age_params = this.age_range.replace(/\s/g, "").split('-').filter(Boolean);
        if (age_params.length === 2)
        {
          let min = parseInt(age_params[0]);
          let max = parseInt(age_params[1]);
          if (!this.validation('age', age_params[0]) || !this.validation('age', age_params[1]) || !(min > 17 && max < 102 && min <= max))
          {
            this.errors.age = "Invalid age range. Please respect the following format: min - max";
            local_flag_error = true;
          }
        }
        else {
          if (age_params.length > 2 || (age_params.length === 1 && (!this.validation('age', age_params[0]) || !(age_params[0] > 17 && age_params[0] < 102)))) {
            this.errors.age = "Invalid age range. Please respect the following format: min - max";
            local_flag_error = true;
          }
          else this.errors.age = null;
        }
      }
      else if (input_case === 'score' && this.score_range)
      {
        score_params = this.score_range.replace(/\s/g, "").split('-').filter(Boolean);
        if (score_params.length === 2)
        {
          let min = parseInt(score_params[0]);
          let max = parseInt(score_params[1]);
          if (!this.validation('score', score_params[0]) || !this.validation('score', score_params[1]) || !(min >= 0 && max <= 500 && min <= max))
          {
            this.errors.score = "Invalid score range. Please respect the following format: min - max";
            local_flag_error = true;
          }
        }
        else
        {
          if (score_params.length > 2 || (score_params.length === 1 && (!this.validation('score', score_params[0]) || !(score_params[0] >= 0 && score_params[0] <= 500)))) {
            this.errors.score = "Invalid score range. Please respect the following format: min - max";
            local_flag_error = true;
          }
          else this.errors.score = null;
        }
      }
      else if (input_case === 'place' && this.place_choice)
      {
        place_params = this.place_choice.replace(/\s\s+/g, "").split(',').filter(Boolean);
        for (let i = 0; i < place_params.length; i++)
          place_params[i]=place_params[i].trim();
        if (place_params.length >= 0 && place_params.length <= 2) {

          place_params.forEach(el => {
            if (!this.validation('city', el) && !this.validation('country_code', el) && !this.validation('postcode', el)) {
              this.errors.place = "Invalid location. Please respect the format: city, country, country code";
              local_flag_error = true;
            }
          });

        }
      }
      else if (input_case === 'tags' && this.tags_choice) {
        tags_params = this.tags_choice.replace(/\s/g, "").split(',').filter(Boolean);
        tags_params.forEach(el => {
          if (!this.validation('tag', el) || !this.all_tags.includes(el)) {
            this.errors.tags = "Invalid interests! Please respect the format: tag1, tag2, tag3...";
            local_flag_error = true;
          }
        });
      }

      if (local_flag_error === false)
      {
        if (input_case==='score') {this.errors.score = null;return score_params;}
        if (input_case==='age') {this.errors.age = null;return age_params;}
        if (input_case==='place') {this.errors.place = null;return place_params;}
        if (input_case==='tags') {this.errors.tags = null;return tags_params;}

      }
      else
        this.error_flag = true;

      return (local_flag_error);
    },
    /**
     * SORT ZONE
     * */
    sort(sort_choice)
    {
      if (sort_choice === 'age') this.people.sort(this.compare_age);
      else if (sort_choice === 'score') this.people.sort(this.compare_score);
      else if (sort_choice === 'interests') this.people.sort(this.compare_tags);
      else if (sort_choice === 'location') this.people.sort(this.compare_distance);
      this.populate_first_9();
    },
    compare_age(a, b) {
      let comparison = 0;
      if (a.age > b.age) comparison = 1;
      else if (a.age < b.age) comparison = -1;
      return comparison;
    },
    compare_distance(a, b) {
      let comparison = 0;
      if (a.distance > b.distance) comparison = 1;
      else if (a.distance < b.distance) comparison = -1;
      return comparison;
    },
    compare_score(a, b) {
      let comparison = 0;
      if (a.score > b.score) comparison = -1;
      else if (a.score < b.score) comparison = 1;
      return comparison;
    },
    compare_tags(a, b){

      let comparison = 0;
      let a_count = 0, b_count = 0, a_tags = a.tags.split(','), b_tags = b.tags.split(',');

      if (this.visitor_profile.tags) {
        this.visitor_profile.tags.forEach(function (el) {
          if (a_tags.includes(el)) a_count++;
          if (b_tags.includes(el)) b_count++;
        });
        a.common_count = a_count;
        b.common_count = b_count;

        if (a_count > b_count) comparison = -1;
        else if (a_count < b_count) comparison = 1;
        return comparison;
      }
    },
    sort_default()
    {
      this.people.sort(this.compare_score);
      this.people.sort(this.compare_tags);
      this.people.sort(this.compare_distance);
    },
    /**
     * FILTER ZONE
     * */

    filter_people()
    {
      /** when input reset choices manually (not clicking on reset button), go back to view */
      if (!this.age_range && !this.score_range && !this.tags_choice && !this.place_choice)
      {
        this.errors = {};
        this.error_flag = false;
        this.people = [];
        this.people_scroll = [];
        this.people.push.apply(this.people, this.people_backup);
        this.sort_default();
        this.populate_first_9();
      }
      else
      {
        /** backup people array before edit */
          this.people = [];
          this.people.push.apply(this.people, this.people_backup);
        /** hide banned people from research results */
            function removeByKey(array, params){
              array.some(function(item, index)
              {
                if (array[index][params.key] === params.value) array.splice(index, 1);
              })
            }
            let self = this;
            this.banned_people.forEach(function (el) {removeByKey(self.people, {key: 'card_id', value: el});});
        /** do the actual filtering */
          if (this.age_range) {
            let checked_params = this.input_error_check('age');
            if (checked_params && checked_params !== 'bluargh')
            {
              this.filter_age_score(checked_params, 'age');
              this.sort('age');
            }
          }
          else this.errors.age = null;
          if (this.score_range) {
            let checked_params = this.input_error_check('score');
            if (checked_params)
            {
              this.filter_age_score(checked_params, 'score');
              this.sort('score');
            }
          }
          else this.errors.score = null;
          if (this.tags_choice) {
            let checked_params = this.input_error_check('tags');
            if (checked_params)
            {
              this.filter_tags(checked_params);
              this.sort('interests');
            }
          }
          else this.errors.tags = null;
          if (this.place_choice) {
            let checked_params = this.input_error_check('place');
            if (checked_params)
            {
              this.filter_location(checked_params);
              this.sort('location');
            }
          }
          else this.errors.place = null;
         }
      },
    filter_age_score(range_array, value)
    {
      if (value === 'age' && (range_array[1] >= range_array[0]))
      {
        for (let i = this.people.length - 1; i >= 0; --i)
          if (!(this.people[i].age >= range_array[0] && this.people[i].age <= range_array[1]))
            this.people.splice(i, 1);
      }
      else if (value === 'score' && (range_array[1] >= range_array[0]))
      {
        for (let i = this.people.length - 1; i >= 0; --i)
          if (!(this.people[i].score >= range_array[0] && this.people[i].score <= range_array[1]))
            this.people.splice(i, 1);
      }
    },
    filter_tags(tags_array)
    {
      for (let i = this.people.length - 1; i >= 0; --i)
      {
        let person_tags =   this.people[i].tags.split(',');
        for (let j = tags_array.length - 1; j >= 0; --j)
        {
          if (!(person_tags.includes(tags_array[j])))
          {
            this.people.splice(i, 1);
            break;
          }
        }
      }
    },
    filter_location(location_parameters)
    {
      for (let i = 0; i<location_parameters.length;i++)
        location_parameters[i] = location_parameters[i].toLowerCase();
      for (let i = this.people.length - 1; i >= 0; --i)
      {
        if (!(this.people[i].country_code || this.people[i].city || this.people[i].postcode))
          this.people.splice(i, 1);
        else
        {
          let person_location_info = [this.people[i].country_code.toLowerCase(),this.people[i].city.toLowerCase(),this.people[i].postcode.toLowerCase()];
          let flag = 0;
          for (let j = location_parameters.length - 1; j >= 0; --j)
            if (person_location_info.includes(location_parameters[j]))
              flag++;
          if (flag !== location_parameters.length)
            this.people.splice(i, 1);
        }
      }
    },
    reset(){
      this.show_age_modal = false;
      this.show_score_modal = false;
      this.show_tags_modal = false;
      this.show_place_modal = false;
      this.sort_choice='';
      this.age_range='';
      this.score_range='';
      this.place_choice='';
      this.tags_choice='';
      this.show_tags=[];
      this.errors = {};
      this.error_flag = false;
      document.getElementById("place_modal_input").value = '';
      document.getElementById('age_slider_min_output').innerHTML = 0;
      document.getElementById('age_slider_max_output').innerHTML = 101;
      document.getElementById('age_slider_min').value = 0;
      document.getElementById('age_slider_max').value = 101;
      document.getElementById('score_slider_min_output').innerHTML = 0;
      document.getElementById('score_slider_max_output').innerHTML = 500;
      document.getElementById('score_slider_min').value = 0;
      document.getElementById('score_slider_max').value = 500;
    },
    /**
     * MODAL INPUT EDITING ZONE
     * */
    edit_input_tags(tag){
      if (!this.show_tags.length || !this.show_tags.includes(tag))
        this.show_tags.push(tag);
      else if (this.show_tags.includes(tag))
        this.show_tags.splice(this.show_tags.indexOf(tag), 1);
      this.tags_choice = this.show_tags.join(', ');
    },
    edit_input_age_score(value){
      let min, max, array, string;
      if (value === 'age')
      {
        min = document.getElementById('age_slider_min').value;
        max = document.getElementById('age_slider_max').value;
      }
      else if (value === 'score')
      {
        min = document.getElementById('score_slider_min').value;
        max = document.getElementById('score_slider_max').value;
      }
      array = [min, max];
      string = array.join(' - ');
      if (value === 'age') this.age_range = string;
      else if (value === 'score') this.score_range = string;
    },
    /**
     * MODAL ZONE
     * */
    slider(switcher, value)
    {
      let rangeSlider, rangeBullet;
      if (switcher==='age')
      {
        if (value === 'min')
        {
          rangeSlider = document.getElementById("age_slider_min");
          rangeBullet = document.getElementById("age_slider_min_output");
        }
        else if (value === 'max')
        {
          rangeSlider = document.getElementById("age_slider_max");
          rangeBullet = document.getElementById("age_slider_max_output");
        }
      }
      else if (switcher==='score')
      {
        if (value === 'min')
        {
          rangeSlider = document.getElementById("score_slider_min");
          rangeBullet = document.getElementById("score_slider_min_output");
        }
        else if (value === 'max')
        {
          rangeSlider = document.getElementById("score_slider_max");
          rangeBullet = document.getElementById("score_slider_max_output");
        }
      }
      rangeBullet.innerHTML = rangeSlider.value;
      this.edit_input_age_score(switcher);
    },
  },
  /**
   * WATCH
   * */
  watch:{
    age_range: function () {let self = this;setTimeout(function(){self.filter_people();},250)},
    score_range: function () {let self = this;setTimeout(function(){self.filter_people();},250)},
    place_choice: function () {let self = this;setTimeout(function(){self.filter_people();},250)},
    tags_choice: function () {let self = this;setTimeout(function(){self.filter_people();},250)},
    sort_choice: function () {this.filter_people();}
  },
    /**
     * SOCKET EVENTS ZONE
     * */
    sockets: {
      /**
       * Update list on somebody's ban
       */
      update_adv_list: function (id) // todo
      {
          /*let i = this.people.findIndex(i => i.id === id);
          if (i !== -1)
            this.people.splice(i, 1);
          let j = this.people_backup.findIndex(j => j.id === id);
          if (j !== -1)
            this.people_backup.splice(j, 1);

          let k = this.people_scroll.findIndex(k => k.id === id);
          if (k !== -1){
            this.people_scroll.splice(k, 1);
            console.log(this.people.length, this.people_backup.length)
          }
          else
            this.retrieve_profile(id);*/
        // let data = {age_range:this.age_range,score_range:this.score_range,tags_choice:this.tags_choice,place_choice:this.place_choice};
        // //console.log("Current choices", this.value, data);
        // console.log("Current choices", this.value, data);

        let self=this;
        this.get_banned().then(function (){self.filter_people()});
      },
      /**
       * Update list on somebody's (un)completion
       */
      update_home_list: function (data) // todo
      {
        if (data.user_id === this.user_id)
          this.$router.go();
        else
          this.switch_cards(this.value, null);

        // if (data.user_id === this.user_id)
        //   this.$router.go();
        // else
        // {
        //   // console.log("update_home_list");
        //   let i = this.people.findIndex(i => i.id === data.user_id);
        //   if (i !== -1)
        //     this.people.splice(i, 1);
        //   let j = this.people_backup.findIndex(j => j.id === data.user_id);
        //   if (j !== -1)
        //     this.people_backup.splice(j, 1);
        //   let k = this.people_scroll.findIndex(k => k.id === data.user_id);
        //   if (k !== -1)
        //     this.people_scroll.splice(k, 1);
        //   else
        //     this.switch_cards(this.value, null);
        // }

      },
      /** Update get_visits/get_likes list on somebody's visit/like to you */
      update_list: function (value)
      {
        let data = {age_range:this.age_range,score_range:this.score_range,tags_choice:this.tags_choice,place_choice:this.place_choice};

        if (this.completion && this.value === value)
          this.switch_cards(this.value, data);
      },
    }
}
</script>

<style scoped>
  .icon{
    color:dodgerblue;
  }

  .age_slider {
    -webkit-appearance: none;
    width: 100%;
    height: 15px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }

  .age_slider:hover {
    opacity: 1;
  }

  .age_slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
  }

  .age_slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
  }

  .people:hover
  {
    box-shadow: 5px 10px 8px #888888;
  }
  @media screen and (min-width: 900px) and (max-width: 1278px){
    .people{
      height: 30vw!important;
    }
  }
</style>
