<template>
  <div class="column is-offset-1-desktop is-three-fifths-desktop is-two-thirds-tablet ">
    <div class="box">
      <div class="columns is-multiline is-mobile ">
        <div class="column is-half-desktop is-half-tablet is-half-mobile" v-for="photo in photos" v-show="photo">
          <div class="card photo_card" >
            <div class="card-image">
              <figure class="image is-5by4" >
                <img alt="user photos" v-bind:src="photo" v-bind:id="getKeyByValue(photos, photo)">
              </figure>
            </div>
            <footer class="card-footer" >
              <div class="card-footer-item" >
                <a class="is-small delete_photo" @click="deleteImg(photo)">DELETE</a>
              </div>
            </footer>
          </div>
        </div>
        <div class="column is-half-desktop is-half-tablet is-half-mobile" v-for="item in photos_to_upload" v-show="item.src">
          <div class="card" style="box-shadow: none!important;">
            <div class="card-image">
              <figure class="image is-5by4" style="opacity: 0.7;">
                <img class="thumb" alt="user photos" :id="item.id">
              </figure>
            </div>
          </div>
        </div>
      </div>

      <div class="column ">
        <div class="field"  v-show="dropbox_counter < spaceLeft && spaceLeft > 0">
          <div class="file is-centered  ">

            <label class="file-label" v-show="dropbox_counter < 4 || error">

              <form action="" id="input_form">
                <input class="file-input" type="file" id="files" name="files[]" multiple="" @change="handleUpload($event)" accept="image/*" />
              </form>

              <span class="file-cta">
              <span class="file-icon"> <i class="fas fa-upload"></i> </span>
                <span class="file-label"> Choose a file… </span>
            </span>
            </label>
          </div>
        </div>
      </div>

      <div class="column container is-four-fifths-desktop field is-grouped is-grouped-centered" v-show="chosen">
        <button class="button is-rounded is-success" @click="uploadPhoto">Upload</button>
        <button class="button is-rounded is-info" @click="cancel_preview">Cancel</button>
      </div>

      <div class="column"  v-show="dropbox_counter < spaceLeft && spaceLeft > 0">
        <article class="message is-notificaton" style="background-color: #f5f5f569">
          <div class="message-body">
            You can select only {{this.spaceLeft - this.dropbox_counter}} more {{this.spaceLeft - this.dropbox_counter === 1? 'image' : 'images'}} <p class="">(size max: 2M)</p>
          </div>
        </article>
      </div>

      <div class="column " v-show="show_error && alert">
        <article class="message is-danger">
          <div class="message-body">
            {{alert}}
          </div>
        </article>
      </div>

    </div>
  </div>
</template>

<script>
  import UserService from '@/services/UserService'

  export default {
    name: 'Photos',
    data() {
      return {
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        user_id:null,
        chosen: false,
        login: '',
        photos:{image1:null, image2:null, image3:null, image4:null},
        photos_position:{image1:null, image2:null, image3:null, image4:null},
        photos_to_upload:[{'id':'0','src':false},{'id':'1','src':false},{'id':'2','src':false},{'id':'3','src':false}],
        spaceLeft:0,
        dropbox_counter: 0,
        error:false,
        show_error:false,
        data: null,
        upload: {},
        array: {},
        alert: ''
      }
    },
    mounted() {
      let self = this;
      this.get_user_id().then(function(logged) {
        if (!logged)
          self.$router.replace('/');
        else {
          self.retrieve_user_data();
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
      checkIfIsLogged()
      {
        return (!!this.user_id);
      },
      async retrieve_user_data()
      {
        let resp = await UserService.get_user_data({option:'get_photos', login: this.login});
        for(let i = 1, key = 'image' + i; i < 5; i++, key = 'image' + i)
          if (resp.data.response[0][key] && resp.data.response[0][key].data.length > 1){
            this.photos_position[key] = true;
            this.photos[key] = 'data:image/jpeg;base64' + Buffer.from(resp.data.response[0][key], 'binary');
          } else
            this.photos_position[key] = false;

        this.spaceLeft = this.checkLength(this.photos);
      },
      getKeyByValue(object, value)
      {
        return Object.keys(object).find(key => object[key] === value);
      },
      async handleUpload (evt)
      {
        if (!window.FileReader || !window.DataView) {
          this.show_error = true;
          this.alert = "Error: Your browser doesn't support api ...";
        }
        else {
          let files = evt.target.files;
          this.error = false;
          this.show_error = false;
          this.alert = '';

          if (files.length > this.spaceLeft || files.length > this.spaceLeft - this.dropbox_counter)
          {
            this.error = true;
            this.show_error = true;
            this.alert = "Error: Too much images selected";
            document.getElementById("files").value = '';
          }
          else if (files.length)
          {
            /** Loop through the FileList and render image files as thumbnails */
            for (let i = 0, file; files[i]; i++)
            {
              file = files[i];
              /** check the size */
              if (file.size) {
                /** check the mime type */
                if (!file.type.match('image.*')) {
                  this.show_error = true;
                  this.alert = "Error: Wrong format";
                  return;
                }
                /** check the size max */
                if (file.size > 2000000) {
                  this.show_error = true;
                  this.alert = "Error: Image bigger than 2M";
                  return;
                }
                let j = 0;
                while (this.photos_to_upload[j].src === true)
                  j++;

                /** check the first4Bytes */
                const file_error = await this.readUploadedFileAsArrayBuffer(file);

                if (!file_error) {

                /** finally read the photo */
                const fileContents = await this.readUploadedFileAsText(file, j);
                if (fileContents) {
                  this.photos_to_upload[j].src = true;
                  this.dropbox_counter += 1;
                  this.chosen = true;

                  let k = 1, key;
                  while (k < 5 && this.photos_position['image' + k])
                    k++;
                  key = 'image' + k;
                  this.photos_position['image' + k] = true;
                  this.array[key] = fileContents;
                }
                }
                else{
                  this.show_error = true;
                  this.alert = "Error: Wrong format";
                }
              }
              else {
                this.show_error = true;
                this.alert = "Error: Wrong format";}
            }
          } else {
            this.show_error = true;
            this.alert = "Error: Wrong format";
          }
        }
      },
      readUploadedFileAsText(inputFile, j){
        const temporaryFileReader = new FileReader();
        return new Promise((resolve) => {

          temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            resolve(false);
          };
          temporaryFileReader.onload = (e) => {
            document.getElementById(j).src = e.target.result;
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
      async uploadPhoto()
      {
        if (this.chosen && this.array && this.user_id)
        {
          this.chosen = false;

          this.array['user_id'] = this.user_id;
         const response = await UserService.edit_user_data({option: 'edit_photos', data: this.array});
          let to_del;
         if (response && response.data.success) {

           if (response.data.invalid_indexes){
             to_del = response.data.invalid_indexes;
           }

           let j = 1;
           while (j < 5)
           {
             let key = 'image' + j;

               if (to_del && !to_del.includes(key) && !this.photos['image' + j] && this.array['image' + j])
               {
                 this.photos['image' + j] = this.array['image' + j];
               }
             j++;
           }
           let k = 1;
           while (k < 5) {
             if (this.photos['image' + k])
               this.photos_position['image' + k] = true;
             k++;
           }
           this.cancel_preview();

         } else if (response && !response.data.success) {
           this.cancel_preview();
           this.format_error = true;
         }
          this.spaceLeft = this.checkLength(this.photos);
        }

      },
      cancel_preview()
      {
        document.getElementById("input_form").reset();
        for (let i = 0; i < 4; i++){
          this.photos_to_upload[i].src = false;
        }
        this.array = {};
        this.upload = {};
        this.spaceLeft = this.checkLength(this.photos);
        this.dropbox_counter = 0;
        this.chosen = false;
        this.error = false;
        this.show_error = false;
        this.alert = '';

        let k = 1;
        while (k < 5) {
          if (this.photos['image' + k])
            this.photos_position['image' + k] = true;
          else
            this.photos_position['image' + k] = false;

          k++;
        }
      },
      async deleteImg(value)
      {
        let img_key = this.getKeyByValue(this.photos, value);
        if (this.user_id && img_key) {
          let image = {};
          image[img_key] = 0;
          this.photos[img_key] = null;
          this.photos_position[img_key] = false;
          this.spaceLeft += 1;
          image['user_id'] = this.user_id;
          let resp = await UserService.edit_user_data({option: 'delete_img', data: image});
        }
      },
      reorder()
      {

        let tmp, key1, key2, next;
        for(let i = 1; i < 5; i++)
        {
          for(let j = 1; j < 4; j++)
          {
            key1 = 'image' + j;
            next = j + 1;
            key2 = 'image' + next;
            if(!this.photos[key1] && this.photos[key2])
            {
              tmp = this.photos[key2];
              this.photos[key1] = tmp;
              this.photos[key2] = null;
            }
          }
        }

        let k = 1;
        while (k < 5) {
          if (this.photos['image' + k])
            this.photos_position['image' + k] = true;
          else
            this.photos_position['image' + k] = false;
          k++;
        }

      },
      checkLength(photos)
      {
        let space = 0;
        for (let i = 1; i < 5; i++)
          if (!photos['image'+ i])
            space++;
        return (space);
      }
    }
  }
</script>

<style type="text/css" scoped>
  /* the dash box */
  .over_btn
  {
    z-index:1;
    position: relative;
  }

  .front-element {
    position: absolute !important;
    top: 5px !important;
    right: 5px !important;
    z-index: 3 !important;
    background-color: red !important;
  }


  .delete_photo {
    color: firebrick;
  }
  .delete_photo:hover {
    color: red;
  }
</style>
