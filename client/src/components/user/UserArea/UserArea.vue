<template>
  <div class="container">
    <div class="columns section" v-if="isLogged">
        <div class="card column is-one-third-desktop is-one-quarter-tablet is-half-mobile" style="height: fit-content">

        <div class="card-image">
          <figure class="image is-4by3 ">
            <img class="" src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image" id="profile_pic">
          </figure>

          <div class="image is-overlay is-clipped" style="padding: 1%">
            <label>
              <input class="file-input" type="file"  name="files[]" @change="handleUpload($event)" accept="image/*"/>
              <span class="button is-rounded is-inverted" v-if="!chosen">
                  <span class="file-label">change</span>
                </span>
            </label>

            <span class="button is-rounded is-success" v-if="chosen" @click="upload">
                <i class="fas fa-upload"></i>
                <p class="file-label">upload</p>
              </span>
          </div>
        </div>

        <div class="card-content">
          <aside class="menu">
            <ul class="menu-list">
              <li><a @click="changeCurrentComponent('Profile')">
                <h4 class="subtitle is-5 " :class="{'has-text-weight-bold': currentComponent==='Profile'}">Profile</h4>
              </a></li>
              <li><a @click="changeCurrentComponent('Photos')">
                <h4 class="subtitle is-5" :class="{'has-text-weight-bold': currentComponent==='Photos'}">Photos</h4>
                </a></li>
              <li><a @click="changeCurrentComponent('Account')">
                <h4 class="subtitle is-5" :class="{'has-text-weight-bold': currentComponent==='Account'}">Account</h4>
              </a></li>
            </ul>
          </aside>
        </div>

        <div class="" v-show="alert">
          <article class="message is-danger">
            <div class="message-body">
              {{alert}}
            </div>
          </article>
        </div>
      </div>

      <component :is="currentComponent"></component>

    </div>
  </div>
</template>

<script>
  import UserService from '@/services/UserService'
  import Profile from './Profile'
  import Account from './Account'
  import Photos from '@/components/user/UserArea/Photos'

  export default {
    name: 'UserArea',
    components:
      {
        Profile,
        Photos,
        Account,
      },
    data() {
      return {
        login: '',
        chosen: false,
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        complete:0,
        showNotification: false,
        currentComponent: null,
        profile_pic: {
          image_profile: '',
        },
        notification: {
          mail: ''
        },
        user_id:'',
        alert: null,
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
            self.currentComponent= 'Profile';
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
      async retrieve_user_data()
      {
        let resp = await UserService.get_user_data({option:'get_profile_pic', login: this.login});

        if (resp && resp.data && resp.data.success)
        {
          document.getElementById('profile_pic').setAttribute('src', 'data:image/jpeg;base64' + Buffer.from(resp.data.response[0].image_profile.data, 'binary'));
          this.complete = resp.data.response[0].complete;
        }
      },
      async handleUpload (evt) {
        if (!window.FileReader || !window.DataView) {
          this.alert = "Error: Your browser doesn't support api ...";
        }
        else if (evt && evt.target && evt.target.files && evt.target.files[0]) {
          let file = evt.target.files[0];
          this.alert = null;
              /** check the size */
              if (file.size) {
                /** check the mime type */
                if (!file.type.match('image.*')) {
                  this.alert = "Error: Wrong format";
                  return;
                }
                /** check the size max */
                if (file.size > 2000000) {
                  this.alert = "Error: Image bigger than 2M";
                  return;
                }
                /** check the first4Bytes */
                const file_error = await this.readUploadedFileAsArrayBuffer(file);

                if (!file_error) {
                  /** finally read the photo */
                  const fileContents = await this.readUploadedFileAsText(file);
                  if (fileContents){
                    this.profile_pic.image_profile = fileContents;
                    this.chosen = true;
                  }
                  else this.alert = "Error: Wrong format";
                }
                else this.alert = "Error: Wrong format";
              }
              else this.alert = "Error: Wrong format";
            }
        else this.alert = "Error: Wrong format";
      },
      readUploadedFileAsText(inputFile){
        const temporaryFileReader = new FileReader();
        return new Promise((resolve) => {

          temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            resolve(false);
          };
          temporaryFileReader.onload = (e) => {
            document.getElementById('profile_pic').setAttribute('src',  e.target.result);
            document.getElementById('profile_pic').style.opacity = "0.5";
            resolve(temporaryFileReader.result);
          };
          temporaryFileReader.readAsDataURL(inputFile);
        });
      },
      readUploadedFileAsArrayBuffer(inputFile){
        const temporaryFileReader = new FileReader();
        return new Promise((resolve) => {
          temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            resolve(false);
          };
          temporaryFileReader.onload = (e) => {

            let af = e.target.result
              , view = new DataView(af), file_error = false;
            if (view && view.getUint32(0, false)) {

              let first4Bytes = view.getUint32(0, false);

              let first4BytesHex = Number(first4Bytes).toString(16).toUpperCase();
              switch (first4BytesHex) {
                case 'FFD8FFE0':
                case 'FFD8FFE1':
                case 'FFD8FFE2':
                case 'FFD8FFE3':
                  break;
                case '89504E47':
                  break;
                case '47494638':
                  break;
                default:
                  file_error = true;
                  break;
              }
            }
            resolve(file_error);
          };
          temporaryFileReader.readAsArrayBuffer(inputFile);
        });
      },
      async upload()
      {
        this.alert = null;
        document.getElementById('profile_pic').style.opacity = "1";
        this.profile_pic['user_id'] = this.user_id;

        const response =  await UserService.edit_user_data( {option:'edit_profile_pic',  data:this.profile_pic});
        if (response && response.data){
          if (!response.data.success) {
            this.alert = response.data.errors;
            this.retrieve_user_data();
          }
          else
          {
            if (this.complete === 0)
            {
              this.$socket.emit("update_home_list", {login: this.login, user_id:this.user_id});
              this.complete = 1;
            }
          }
        }
        this.chosen = false;
      },
      changeCurrentComponent(value){
        this.currentComponent = value;
        this.showNotification = false;
        this.alert = null;
      },
      showForm()
      {
        this.currentComponent = null;
        this.showNotification = true;
      },
      checkIfIsLogged() {
        return (!!this.user_id);
      },
    }
  }
</script>

<style type="text/css" scoped>

  @media screen and (max-width: 768px) {
    .column.is-half-mobile {
      width: 60% !important;
      margin-left: 20% !important;
    }
  }

  .form input, .form textarea {
    width: 500px;
    padding: 10px;
    border: 1px solid #e0dede;
    outline: none;
    font-size: 12px;
  }

  .form div {
    margin: 20px;
  }
  .ChangePicBtn
  {
    z-index:1;
    position: relative;
  }
</style>
