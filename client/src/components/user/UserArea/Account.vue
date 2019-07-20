<template>
  <div class="column is-offset-1-desktop is-three-fifths-desktop is-two-thirds-tablet ">

    <article class="message is-danger" v-if="error_flag">
      <div class="message-body">
        <ul>
          <li v-for="error in errors">- {{error}}</li>
        </ul>
      </div>
    </article>

    <article class="message is-success" v-if="!error_flag && response">
      <div class="message-body">
        {{response}}
      </div>
    </article>

    <!-- CHANGE PASSWORD -->
    <form class="box" onsubmit="return false;">
      <div class="field">
        <label class="label has-text-left	">Old Password</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="password" placeholder="Old Password" v-model="p_pass" autocomplete="off">
          <span class="icon is-small is-left">
          <i class="fas fa-user"></i>
        </span>
        </p>
      </div>

      <div class="field">
        <label class="label has-text-left	">New Password</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="password" placeholder="New Password" v-model="account.new_password" autocomplete="off">
          <span class="icon is-small is-left">
          <i class="fas fa-user"></i>
        </span>
        </p>
      </div>
      <div class="field">
        <label class="label has-text-left	">Confirm New Password</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="password" placeholder="Confirm New Password" v-model="account.confirm_new_password" autocomplete="off">
          <span class="icon is-small is-left">
          <i class="fas fa-user"></i>
        </span>
        </p>
      </div>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <button class="button is-info" @click="editUser('edit_password')">Change Password</button>
        </div>
        <div class="control">
          <button class="button is-danger" @click="resetValues">Cancel</button>
        </div>
      </div>
  </form>

    <!--CHANGE LOGIN-->
    <form class="box" onsubmit="return false;">
      <div class="field">
        <label class="label has-text-left	">New Login</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="text" placeholder="Login" v-model="account.new_login">
          <span class="icon is-small is-left">
              <i class="fas fa-envelope"></i>
        </span>
        </p>
      </div>
      <div class="field">
        <label class="label has-text-left	">Password</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="password" placeholder="Password" v-model="l_pass" autocomplete="off">
          <span class="icon is-small is-left">
          <i class="fas fa-user"></i>
        </span>
        </p>
      </div>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <button class="button is-info" @click="editUser('edit_login')">Change login</button>
        </div>
        <div class="control">
          <button class="button is-danger" @click="resetValues">Cancel</button>
        </div>
      </div>
    </form>

    <!--CHANGE EMAIL-->

    <form class="box" onsubmit="return false;">
      <div class="field">
        <label class="label has-text-left	">New Email</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="email" placeholder="Email" v-model="account.new_email">
          <span class="icon is-small is-left">
              <i class="fas fa-envelope"></i>
        </span>
        </p>
      </div>
      <div class="field">
        <label class="label has-text-left	">Password</label>
        <p class="control is-small has-icons-left">
          <input class="input" type="password" placeholder="Password" v-model="e_pass" autocomplete="off">
          <span class="icon is-small is-left">
          <i class="fas fa-user"></i>
        </span>
        </p>
      </div>
      <div class="field is-grouped is-grouped-multiline">
        <div class="control">
          <button class="button is-info" @click="editUser('edit_email')">Change email</button>
        </div>
        <div class="control">
          <button class="button is-danger" @click="resetValues">Cancel</button>
        </div>
      </div>
    </form>

  </div>
</template>

<script>
  import {EventBus} from '../../../event-bus'
  import UserService from '@/services/UserService'
  export default {
    name: 'Account',
    data() {
      return {
        currentComponent: 'Profile',
        isLogged: this.$session.get('b_sessionID') ? 1 : 0,
        user_data: null,
        login: '',
        user_id: null,
        p_pass: '', l_pass: '', e_pass: '',
        account: {
          login:'',
          new_login:'',
          email: '',
          new_email: '',
          password: '',
          new_password: '',
          confirm_new_password: ''
        },
        notification: {
          mail: ''
        },
        error_flag: false,
        errors: {},
        response: null
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
      /**
       * RETRIEVE ZONE
       * */
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
        let resp = await UserService.get_user_data({option:'get_mail', login: this.login});
        if (resp && resp.data) {
          this.account.email = resp.data.response[0].email;
          this.account.new_email = this.account.email;
          this.account.login = this.login;
          this.account.new_login = this.login;
        }
      },
      /**
       * EDIT ZONE
       * */
      async editUser(option)
      {
        this.response = null;
        this.error_check(option);
        if (this.error_flag === false) {

          if (this.p_pass)
            this.account.password = this.p_pass;
          else if (this.l_pass)
            this.account.password = this.l_pass;
          else if (this.e_pass)
            this.account.password = this.e_pass;

          if ((option === "edit_login" && this.account.login !== this.account.new_login) ||
            (option === "edit_email" && this.account.email !== this.account.new_email) ||
            (option === "edit_password" && (this.account.password !== this.account.new_password) &&
              (this.account.password !== this.account.confirm_new_password)))
          {
            this.account['id'] = this.user_id;
            const response = await UserService.edit_user_data({option: option, data: this.account});
            if (response && response.data && response.data.success)
            {
              if (option === "edit_login")
              {
                this.login = this.account.new_login;
                EventBus.$emit('login_changed', this.account.new_login);
              }
              this.resetValues();
              this.response = response.data.message;
            }
            else if (response && response.data && !response.data.success)
            {
              this.errors = response.data.errors;
              this.error_flag = true;
            }
          }
        }
      },
      resetValues() {
        this.account = {
          new_login:'',
          login:'',
          email: '',
          new_email: '',
          password: '',
          new_password: '',
          confirm_new_password: '',
        };
        this.errors = {};
        this.error_flag = false;
        this.p_pass = '';
        this.l_pass = '';
        this.e_pass = '';
        this.response = null;
        this.retrieve_user_data();
      },
      checkIfIsLogged() {
        return (!!this.user_id);
      },
      /**
       * ERROR CHECK ZONE
       * */
      error_check(option)
      {
        this.error_flag = false;
        this.errors = {};
        if (option === 'edit_login') {
            this.e_pass = this.p_pass = '';
            if (!this.account.login || !this.l_pass) this.errors.isempty = 'Please fill all fields.';
            else
              {
              if (!this.validation('login', this.account.login)) this.errors.login = 'Invalid username.';
              if (!this.validation('password', this.l_pass)) this.errors.password = 'Invalid password.';
              if (this.account.login === this.account.new_login) this.errors.unchanged = 'Please enter a new login.'
              }
          }
        else if (option === 'edit_email') {
          this.l_pass = this.l_pass = '';
          if (!this.account.new_email || !this.e_pass) this.errors.isempty = 'Please fill all fields.';
          else {
            if (!this.validation('email', this.account.new_email)) this.errors.email = 'Invalid email.';
            if (!this.validation('password', this.e_pass)) this.errors.password = 'Invalid password.';
            if (this.account.new_email === this.account.email) this.errors.unchanged = 'Please enter a new email.'
          }
        }
        else if (option === 'edit_password') {
          this.l_pass = this.e_pass = '';
          if (!this.p_pass || !this.account.new_password || !this.account.new_password) this.errors.isempty = 'Please fill all fields.';
          else {
            if (!this.validation('password', this.p_pass)) this.errors.password = 'Invalid password.';
            if (this.account.new_password !== this.account.confirm_new_password) this.errors.pass_match = "Passwords don't match";
            if (!this.validation('password', this.account.new_password)) this.errors.password = 'Invalid password.';
            if (!this.validation('password', this.account.confirm_new_password)) this.errors.password = 'Invalid password.';
            if (this.p_pass === this.account.new_password  && this.account.new_password === this.account.confirm_new_password) this.errors.unchanged = 'Please enter a new password.'
          }
        }
        this.error_flag = !!(this.errors.login || this.errors.email || this.errors.password || this.errors.isempty || this.errors.pass_match || this.errors.unchanged);
      },
      validation(field, value) {
        let re;
        switch (field) {
          case 'login':
            re = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{3,13}$/u;
            break;
          case 'email':
            re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            break;
          case 'password':
            re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            break;
        }
        return re.test(value);
      }
    }
  }
</script>

<style type="text/css" scoped>
</style>
