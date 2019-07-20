<template>
    <div class="column is-offset-1-desktop is-three-fifths-desktop is-two-thirds-tablet">

      <!--PROFILE FORM-->
      <div class="box">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <label class="label has-text-left	">Name</label>
              <p class="control is-expanded has-icons-left">
                <input class="input" type="text" :placeholder="profile.name" v-model="profile.name">
                <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
              </p>
            </div>

            <div class="field">
              <label class="label has-text-left	">Surname</label>
              <p class="control is-expanded has-icons-left">
                <input class="input" type="text" :placeholder="profile.surname" v-model="profile.surname">
                <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
              </p>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-body ">

            <div class="field">
              <label class="label has-text-left	">Age</label>
              <p class="control has-icons-left">
                <input class="input" type="number" :placeholder="profile.age" v-model="profile.age">
                <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
              </p>
            </div>

            <div class="field">
              <label class="label">Orientation</label>
              <div class="control" style="text-align: center!important;">
                <div class="select">
                  <label>
                    <select v-model="profile.pref" :placeholder="profile.pref">
                      <option selected disabled hidden>Select dropdown</option>
                      <option>straight</option>
                      <option>gay</option>
                      <option>bisex</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Gender</label>
              <div class="control" style="text-align: center!important;">
                <div class="select">
                  <label>
                    <select v-model="profile.gender" :placeholder="profile.gender">
                      <option selected disabled hidden>Select dropdown</option>
                      <option>male</option>
                      <option>female</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="field is-horizontal">
          <div class="field-body">
            <div class="field">
              <label class="label has-text-left">Bio</label>
              <p class="control is-expanded ">
                <textarea class="textarea" placeholder="Bio" v-model="profile.bio"></textarea>
              </p>
            </div>

          </div>
        </div>
        <div class="field is-grouped is-grouped-multiline is-grouped-centered">
          <div class="control">
            <button class="button is-info is-rounded" @click="editUser">Update</button>
          </div>
          <div class="control">
            <button class="button is-link is-rounded" @click="resetValues">Cancel</button>
          </div>
        </div>

        <!--PROFILE FORM ERRORS-->
        <article class="message is-danger" v-if="error_flag">
          <div class="message-body">
            <ul v-for="error in errors">
              <li>- {{error}}</li>
            </ul>
          </div>
        </article>

        <!--LOCATION/TAGS TAB-->
        <div class="tabs is-fullwidth is-centered">
          <ul>
            <li v-bind:class="{'is-active': tabs_value === 'location'}">
              <a @click="tabs_value = 'location'">
              <span class="icon is-small">
                <i class="fas fa-map-marker-alt"></i>
              </span>
                <span>Location</span>
              </a>
            </li>
            <li v-bind:class="{'is-active': tabs_value === 'tags'}">
              <a @click="tabs_value = 'tags'">
              <span class="icon is-small">
                <i class="fas fa-snowboarding"></i>
              </span>
                <span>Interests</span>
              </a>
            </li>
          </ul>
        </div>

        <!--LOCATION TO SEND-->
        <div v-if="tabs_value === 'location'">
          <label class="label">Address</label>
          <div class="field is-grouped is-grouped-multiline is-grouped-centered" >
            <div class="control">
              <button class="button is-rounded is-link" @click="locateMe">
             <span class="icon is-small">
               <i class="fas fa-map-marker-alt"></i>
            </span>
                <span>Locate me</span>
              </button>
            </div>
            <div class="control" id="location_control">
              <input class="input is-rounded" type="text" v-model="address" placeholder="city, postalcode, country code" id="address">
            </div>
          </div>

          <article class="message" v-bind:class="{'is-danger':wrong_location_search,'is-success':search_results}" v-if="(wrong_location_search) || (search_results && !hide)">
            <div class="message-body">
              <span v-if="wrong_location_search && hide">
                <ul v-if="search_error">
                  <li v-for="error in search_error">
                    <p>{{error}}</p>
                  </li>
                </ul>
                <p v-if="!search_error">Invalid or insufficient parameters.<br>Please insert, no matter the order:<br><i>City, zipcode, country/country code</i> </p>
              </span>
              <div v-if="!hide">
                <div class="button is-loading is-black is-outlined"  style="border: none"></div>

                <div  v-for="res in search_results" class="location_result box" @click="store_position(res)" style="border: none;background-color: transparent">{{res.show}}</div>
              </div>
            </div>
          </article>
        </div>



        <!--TAGS SECTION-->
        <div v-if="tabs_value === 'tags'">
          <div class="field is-horizontal">
            <div class="field-body">

              <div class="field is-grouped is-grouped-multiline is-grouped-centered">

            <span class="control">
              <label class="label" >Select an interest</label>

            <span class="select is-rounded">
              <select v-model="tag1" @change="addTag(tag1)">
                <option v-for="tag in all_tags"> {{tag}}</option>
              </select>
            </span>
            </span>

                <span class="control has-text-centered">
              <label class="label" >Add one</label>
            <div class="field has-addons has-addons-right">

              <div class="control">
                <input class="input is-rounded" type="text" placeholder="add an interest" v-model="tag2">
              </div>
              <div class="control">
                <a class="button is-info is-rounded" @click="addTag(tag2)">Add</a>
              </div>

            </div>
            </span>
              </div>
            </div>
          </div>

          <div class="field is-horizontal is-centered section" >
            <div class="field-body ">
              <div class="field is-grouped is-grouped-multiline" v-if="profile.tags">
                <div class="control" v-for="tag in profile.tags">
                  <div class="tags has-addons">
                    <a class="tag is-link"># {{tag}}</a>
                    <a class="tag is-delete" @click="deleteTag(tag)"></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

</template>

<script>
  import {EventBus} from '../../../event-bus'
  import UserService from '@/services/UserService'

  export default {
    name: 'Profile',
    data() {
      return {
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        login: '',
        user_id:'',
        profile: [],
        notification: {mail: ''},
        tag: null,
        all_tags:[],
        complete: 0,
        emit_completion: 0,
        geo_options: {
          enableHighAccuracy: true,
          maximumAge: 0
        },
        address:'',
        search_results:[],
        show_search_result:'',
        hide : 1,
        wrong_location_search:0,
        error_flag: false, // error check flag
        errors: {},
        tag1:'',
        tag2:'',
        tabs_value:'location',
        search_error:null
      }
    },
    mounted() {
      let self = this;
      this.get_user_id().then(function(logged){
        if (!logged)
          self.$router.replace('/');
        else
        {
          self.retrieve_user_data();
          self.get_all_tags();
          self.address_input_timeout();
        }
      });
    },
    methods: {
      async get_user_id(){
        const response = await UserService.get_user_id({'session_id':this.$session.get('b_sessionID')});
        if (response && response.data) {
          this.user_id = response.data.user_id;
          this.login = response.data.login;
        }
        return !!(response.data.user_id);
      },
      /**
       * LOCATION ZONE
       * */
      address_input_timeout(){
        let self = this;
        let  textInput = document.getElementById('address'); // Get the input box
        let  timeout = null;  // Init a timeout variable to be used below
        if (textInput) {
          textInput.onkeyup = function (e) {
            this.hide = 0;
            /** Clear the timeout if it has already been set. This will prevent the previous task from executing,
            // if it has been less than <MILLISECONDS> */
            clearTimeout(timeout);
            /** Make a new timeout set to go off in 800ms */
            timeout = setTimeout(function () {
              self.search_location(textInput.value);
            }, 1000);
          };
        }
      },
       async search_location(address) {
        this.search_error = null;
         this.hide = 1;                    // used when a valid result is found
         let self = this, a, b, c, d;
         this.search_results = [];
         /** prepare array from address input */
         let address_array = address.split(',').filter(Boolean);
         /** lowercase array for matching purpose */
         for (let i = 0; i < address_array.length; i++)
           address_array[i] = address_array[i].trim().toLowerCase();
         /** check input validity */
         if (!this.check_location_params(address_array))
           this.wrong_location_search = 1;
         else {
           let resp = await UserService.geocoding(address).then(function (resp)
           {
             if (resp.data && resp.data.results)
             {
               let results = resp.data.results, pos, result, show;
               results.forEach(function (el)
               {
                 pos = el.position;
                 result = el.address;
                 a = result.municipality && address_array.includes(result.municipality.toLowerCase()) ? 1 : 0;
                 b = result.postalCode && address_array.includes(result.postalCode) ? 1 : 0;
                 c = result.countryCode && address_array.includes(result.countryCode.toLowerCase()) ? 1 : 0;
                 d = result.country && address_array.includes(result.country.toLowerCase()) ? 1 : 0;

                 /** if we found a valid result we can stop */
                 if ((a || b) && (c || d)) {
                   /** show result */
                   self.hide = 0;
                   self.wrong_location_search = 0;

                   function check (value) {
                     if (value)
                       return value + ' ';
                     else
                       return '';
                   }

                   show = check(result.municipality) + check(result.municipalitySubdivision) + check(result.postalCode) +
                     check(result.countrySubdivision) + check(result.country) + check(result.countryCode);

                   let exists = 0;

                   self.search_results.forEach(function (el) {
                     if (el.show === show)
                       exists = 1;
                   });

                   if (!exists) {
                     self.search_results.push({
                       "lat": pos.lat,
                       "lng": pos.lon,
                       "city": result.municipality,
                       "postcode": result.postalCode,
                       "country_code": result.countryCode,
                       "country": result.country,
                       "user_id": self.user_id,
                       "show": show
                     });
                   }
                 }
               });
             }
           });
         }
       },
      async store_position(user_coords){

        for (var propName in user_coords) {
          if (user_coords[propName] === null || user_coords[propName] === undefined) {
            delete user_coords[propName];
          }
        }
          delete user_coords['show'];
          const response = await UserService.store_position(user_coords);
          if (response && response.data && !response.data.success)
          {
            this.search_error = response.data.errors;
            this.hide = true;
            this.wrong_location_search = true;
          }
          else if (response && response.data && response.data.success)
          {
            /** hide serach result banner, if present */
              delete user_coords['lat'];
              delete user_coords['lng'];
              delete user_coords['user_id'];
              this.address = '';
              for (var propName in user_coords)
              {
                if (!this.address)
                  this.address += user_coords[propName];
                else
                  this.address += ', ' + user_coords[propName];
              }
          }
        this.hide = 1; // todo in or out

      },
      locateMe(){
        this.wrong_location_search = 0;
        let self = this;
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
          if (result.state == 'granted') {
            navigator.geolocation.getCurrentPosition(success, error, self.geo_options);
          }
          else if (result.state == 'prompt') {
            var isFirefox = typeof InstallTrigger !== 'undefined';
            if (isFirefox)
              alert("You denied access to your location. Please revoke the permission.");
            else
              navigator.geolocation.getCurrentPosition(success, error, self.geo_options);
          }
          else
          {
            alert("You denied access to your location. Please revoke the permission.");
          }
        });

        function success(pos) {
          let lat = pos.coords.latitude;
          let lng = pos.coords.longitude;
          let coords = lat + ', ' + lng;
          let user_coords =  {lat: null, lng: null, city : null, country : null, country_code : null, postcode : null, user_id: null};

          UserService.reverse_geocoding(coords).then(function (resp)
          {
            if (resp && resp.data && resp.data.addresses && resp.data.addresses[0])
            {
              let result = resp.data.addresses[0].address;
              self.hide = 0;

              function check (value) {
                if (value)
                  return value + ' ';
                else
                  return '';
              }

              let show = check(result.municipality) + check(result.municipalitySubdivision) + check(result.postalCode) +
                check(result.countrySubdivision) + check(result.country) + check(result.countryCode);

              self.search_results = [];
              self.search_results.push({
                "lat": pos.coords.latitude,
                "lng": pos.coords.longitude,
                "city": result.municipality,
                "postcode": result.postalCode,
                "country_code": result.countryCode,
                "country": result.country,
                "user_id": self.user_id,
                "show": show
              });
            }
          });

        }
        function error(err) {}
      },
      /**
       * RETRIEVE ZONE
       **/
      async get_completion()
      {
        const response = await UserService.get_user_completion({user_id: this.user_id});
        if (response && response.data) {
          this.complete = response.data.completion;
        }
      },
      async retrieve_user_data() {
        let resp = await UserService.get_user_data({option: 'get_profile', login: this.login});
        if (resp && resp.data && resp.data.response)
        {
          this.profile = resp.data.response[0];
          if (resp.data.response[0].city && resp.data.response[0].country_code && resp.data.response[0].country && resp.data.response[0].postcode)
            this.address = resp.data.response[0].city + ', ' + resp.data.response[0].postcode + ', ' + resp.data.response[0].country + ' (' + resp.data.response[0].country_code + ')';
          if (!this.emit_completion) {
            this.complete = this.profile.complete;
          } else
            {
            if (this.profile.complete !== this.complete)// || (this.profile.complete === 0 && this.complete === 0))
            {
              this.$socket.emit("update_home_list", {login: this.login, user_id: this.user_id});
              this.emit_completion = 0;
              this.complete = this.profile.complete;
            }
          }
          if (resp.data.response[0].tags) {
            let tags_array = this.profile.tags.split(',');
            this.profile.tags = [];
            this.profile.tags = tags_array;
          }
        }
      },
      /**
       * ERROR CHECK ZONE
       * */
      check_tag_delete(tag){
        if (!this.validation('tag', tag) || !(this.all_tags.includes(tag))){
          this.errors.tag = 'Tag not valid';
          this.error_flag = true;
          return false;
        }
        return true;
      },
      check_tag(tag){
        if (!this.validation('tag', tag)){
          this.errors.tag = 'Please insert a valid interest';
          this.error_flag = true;
          return false;
        }
        return true;
      },
      check_location_params(array){
        if (array.length !== 3)
          return 0;
        for(let i = 0; i < array.length; i++) {
          if (!this.validation('zipcode', array[i]) && !this.validation('city', array[i]) && !this.validation('country_code', array[i]))
            {
              return (0);
            }
        }
        return (1);
      },
      error_check(){
        this.errors = {};
        if (!this.profile.name) this.errors.name = 'Name required.';
        else if (!this.validation('name_surname', this.profile.name)) this.errors.name = 'Please enter a valid name.';
        if (!this.profile.surname) this.errors.surname = 'Surname required.';
        else if (!this.validation('name_surname', this.profile.surname)) this.errors.surname = 'Please enter a valid surname.';
        if (!this.profile.age) this.errors.age = 'Age required.';
        else if (!this.validation('age', this.profile.age)) this.errors.age = 'Please enter a valid age.';
        else if (!(this.profile.age > 17 && this.profile.age < 102)) this.errors.age = 'Age must be at least between 18 and 101.';
        if (!this.validation('pref', this.profile.pref)) this.errors.pref = 'Please select a preference.';
        if (!this.validation('gender', this.profile.gender)) this.errors.gender = 'Please select a gender';
        //if (this.profile.bio) this.profile.bio = this.profile.bio.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g, "&#x2F;");
        if (this.profile.bio) this.profile.bio = this.profile.bio.replace(/</g, " ").replace(/>/g, " ").replace(/&/g, " ").replace(/"/g," ").replace(/'/g," ").replace(/\//g, " ");

        this.error_flag = !!(this.errors.name || this.errors.surname || this.errors.age ||
          this.errors.pref || this.errors.gender);
      },
      validation(field, value) {
        let re;
        switch (field) {
          case 'name_surname':
            re = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
            break;
          case 'age':
            re = new RegExp("^(18?[1-9]|[1-9][0-9]|[1][1-9][1-9]|101)$");
            break;
          case 'pref':
            re = new RegExp("^(straigth|gay|bisex)$");
            break;
          case 'gender':
            re = /male|female/;
            break;
          case 'zipcode':
            re = /^\d{5}$/;
            break;
          case 'country_code':
            re = /^[a-zA-Z]{2}$/;
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
      /**
       * EDIT ZONE
       * */
      async editUser()
      {
        this.get_completion();
        this.error_check();
        if (this.error_flag === false)
        {
          let data = this.profile;

          /** Purify data to send */
          delete data.login;
          delete data.tags;
          delete data.logout_time;
          delete data.online;
          delete data.complete;
          delete data.score;
          delete data.city;
          delete data.country;
          delete data.country_code;
          delete data.postcode;
          delete data.lat;
          delete data.lng;

          const response = await UserService.edit_user_data({option: 'edit_profile', data: data});
          this.resetValues();
          this.emit_completion = 1;
          EventBus.$emit('completion');
          if (response && response.data && !response.data.success)
          {
            this.errors = response.data.errors;
            this.error_flag = true;
          }
        }
      },
      async addTag(tag)
      {
        if (tag && this.check_tag(tag))
        {
          tag = tag.replace(/\s/g, "").toLowerCase();
          if (!this.profile.tags)
            this.profile.tags = [];
          if (!this.profile.tags.includes(tag))
          {
            this.profile.tags.push(tag);
            if (!this.all_tags.includes(tag))
              this.all_tags.push(tag);
            this.all_tags.sort();
            const resp = await UserService.add_user_tag({tag: tag, login: this.login, user_id: this.profile.id});
            this.emit_completion = 1;
            this.retrieve_user_data();
          }
          this.tag2 = null;
        }
      },
      async deleteTag(tag) {
        if (tag && this.check_tag_delete(tag))
        {
          const resp = await UserService.delete_user_tag({tag: tag, login: this.login, user_id: this.profile.id});
          this.profile.tags = this.profile.tags.filter(item => item !== tag);
          this.emit_completion = 1;
          this.retrieve_user_data();
        }
      },
      resetValues() {
        this.error_flag = false;
        this.profile = [];
        this.tag2 = null;
        this.show_search_result='';
        this.hide = true;
        this.wrong_location_search=0;
        this.errors = {};
        this.retrieve_user_data();
      },
      checkIfIsLogged() {
        return (!!this.user_id);
      },
      async get_all_tags()
      {
        this.all_tags=[];
        const response = await UserService.get_all_tags({option:'get_all_tags'});
        let tags = response.data.tags;
        for(let i = 0; i < tags.length;i++)
          this.all_tags.push(tags[i].tag);
        this.all_tags.sort();
      },
    },
  }
</script>

<style type="text/css" scoped>

  .location_result:hover
  {
    box-shadow: 5px 10px 8px #888888;cursor: pointer;

  }
  @media screen and (max-width: 768px){
    #location_control{
      width:100%;
    }
  }
  @media screen and (max-width: 1223px){
    #location_control{
      width:60%;
    }
  }
  @media screen and (min-width: 1224px){
    #location_control{
      width:60%;
    }
  }

  .tag:hover{
    cursor: default;
    text-decoration: none;
  }
</style>
