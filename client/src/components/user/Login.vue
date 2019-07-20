<template>
  <section v-if="!isLogged">
    <!--SUCCESS BANNER-->
    <div class="success_banner banner">
      <article class="message is-link" v-if="success_banner">
        <div class="message-body">
          <p>{{success_message}}</p>
        </div>
      </article>
    </div>
    <!--LOGIN-->
    <form class="login_form" v-if="showLogin && !showMailResetPw && !showResetPw" onsubmit="return false;">
      <div class="field">
        <div class="control has-icons-left">
          <input class="input" type="text" placeholder="Login" v-model="login">
          <span class="icon is-small is-left">
            <i class="fas fa-user"></i>
          </span>
        </div>
      </div>
      <div class="field">
        <div class="control has-icons-left">
          <input class="input" type="password" placeholder="Password" v-model="password" autocomplete="off">
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
      </div>
      <div class="field is-grouped-centered is-grouped">
        <div class="control buttons is-grouped">
          <button class="button is-success" @click="reset_errors();LoginUser()">
            Login
          </button>
          <button class="button is-success" @click="showMailResetPw = !showMailResetPw;reset_errors()">
            Reset password
          </button>
        </div>
      </div>
    </form>
    <!--EMAIL-->
    <form class="mail_form" v-if="showMailResetPw && !showResetPw" onsubmit="return false;">
      <div class="field">
        <div class="control has-icons-left ">
          <input class="input" type="email" placeholder="Email" v-model="email">
          <span class="icon is-large is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
      </div>
      <div class="field">
        <div class="control has-icons-left ">
          <input class="input" type="email" placeholder="Confirm Email" v-model="confirmEmail">
          <span class="icon is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <div class="control">
          <button class="button is-success" @click="reset_errors();sendMailReset()">
            Send Mail
          </button>
          <button class="button is-success" @click="reset_fields();reset_errors();">
            Cancel
          </button>
        </div>
      </div>
    </form>
    <!--PASSWORD-->
    <form class="pass_form" v-if="!showMailResetPw && showResetPw" onsubmit="return false;">
      <div class="field">
        <div class="control has-icons-left">
          <input class="input " type="password" placeholder="Password" v-model="password" autocomplete="off">
            <span class="icon  is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
      </div>
      <div class="field">
        <div class="control has-icons-left">
          <input class="input " type="password" placeholder="Confirm Password" v-model="confirmPassword" autocomplete="off">
          <span class="icon  is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
      </div>
      <div class="field is-grouped-centered is-grouped">
        <div class="control">
          <button class="button is-success" @click="reset_errors();resetPw()">Confirm</button>
        </div>
      </div>
    </form>
    <!--ERRORS BANNER-->
    <div class="banner">
      <article class="message is-danger" v-if="error_flag && errors">
        <div class="message-body">
          <ul v-for="error in errors">
            <li >- {{error}}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
  import {EventBus} from '../../event-bus'
  import UserService from '@/services/UserService'
  import General from '@/services/General'

  export default {
    name: 'Login',
    data() {
      return {
        showLogin:true,
        showResetPw: false,
        showMailResetPw: false,
        isLogged: false,
        found: true,
        alert: '',
        login: '',
        password: '',
        email: '',
        confirmEmail: '',
        confirmPassword: '',
        hash: '',
        errors: {},
        error_flag: false,
        user_id:'',
        success_banner:false,
        success_message:''
      }
    },
    mounted() {
      if (this.$session.get('b_sessionID')) {
        this.$router.replace('/');
        EventBus.$emit('logged', this.login);
      }
    else
      {
          if (this.$route.params.hash) {
            this.showResetPw = true;
            this.hash = this.$route.params.hash;
          }
        }

    },
    methods: {
      async store_id(){
        let data = {login: this.login, id:this.$socket.id, user_id: this.user_id};
        let resp = await General.store_id({data: data});
      },
      async LoginUser() {
        this.error_check('login');
        if (!this.error_flag)
        {
          const response = await UserService.login({login: this.login, password: this.password});
          if (response && response.data && !response.data.success)
          {
            this.errors = response.data.errors;
            this.error_flag = true;
          }
          else if (response && response.data && response.data.success)
          {
            this.$session.start();
            this.$session.set('b_sessionID', response.data.sessionID);
            this.user_id = response.data.user_id;
            EventBus.$emit('logged', this.login);
            this.$socket.emit('user_login', this.login, this.user_id);
            this.isLogged = true;
            this.store_id();
            this.$router.push('/')
          }
        }
      },
      async sendMailReset() {
        this.error_check('sendMail');
        if (this.error_flag === false)
        {
          const response = await UserService.mailResetPw({email: this.email, confirm_email:this.confirmEmail});
          if (response && response.data)
          {
            this.alert = response.data.message;
            if (!response.data.success)
            {
              this.errors = response.data.errors;
              this.error_flag = true;
            }
            else
            {
              this.success_banner = true;
              this.success_message = response.data.message;
              this.showLogin = false;
              this.showMailResetPw = false;
              this.showResetPw = false;
              this.email = '';
              this.confirmEmail = '';
            }
          }
        }
      },
      async resetPw() {
        this.error_check('resetPass');
        if (this.error_flag === false) {
          const response = await UserService.resetPw({
            hash: this.hash,
            password: this.password,
            confirm_password: this.confirmPassword
          });
          if (response && response.data)
          {
            if (!response.data.success)
            {
              this.errors = response.data.errors;
              this.error_flag = true;
            }
            else
            {
              this.success_banner = true;
              this.success_message = response.data.message;
              this.showMailResetPw = false;
              this.showResetPw = false;
              this.showLogin = true;
              this.password = '';
              this.confirmPassword = '';
            }
          }
        }
      },
      reset_fields(){
        this.login = '';
        this.password = '';
        this.confirmEmail = '';
        this.email = '';
        this.showMailResetPw = false;
      },
      /**
       * ERROR CHECK ZONE
       * */
      reset_errors(){
        this.error_flag = false;
        this.errors = {};
        this.success_banner = false;
        this.success_message = '';
      },
      error_check(value)
      {
        this.error_flag = false;
        this.errors = {};
        if (value === "login")
        {
          if (!this.login) this.errors.login = 'Login required.';
          else if (!this.validation('login', this.login)) this.errors.login = 'Invalid login.';
          if (!this.password) this.errors.password = 'Password required.';
          else if (!this.validation('password', this.password)) this.errors.password = 'Invalid password.';
          this.error_flag = !!(this.errors.login || this.errors.password);
        }
        else if (value === "sendMail")
        {
          if (!this.email)
            this.errors.email = 'Email required.';
          else if (!this.validation('email', this.email))
            this.errors.email = 'Valid email required.';
          if (!this.confirmEmail)
            this.errors.confirmEmail = 'Email required.';
          else if (!this.validation('email', this.confirmEmail))
            this.errors.confirmEmail = 'Valid email required.';
          if (this.email && this.confirmEmail && this.email.localeCompare(this.confirmEmail) !== 0)
            this.errors.mail_match = "Emails don't match";
          this.error_flag = !!(this.errors.email || this.errors.confirmEmail || this.errors.mail_match);

        }
        else if (value === "resetPass")
        {
          let valid = "A valid password requires a lowercase and an uppercase character, " + "a number and a special character, a length of at least 8.";
          if (!this.password) this.errors.password = 'Password required.';
          else if (!this.validation('password', this.password)) this.errors.password = valid;
          if (!this.confirmPassword) this.errors.confirmPassword = 'Password required.';
          else if (!this.validation('password', this.confirmPassword)) this.errors.confirmPassword = valid;
          this.error_flag = !!(this.errors.password || this.errors.confirmPassword);
          if (this.error_flag === false && this.password.toLowerCase().localeCompare(this.confirmPassword.toLowerCase()) !== 0)
          {
            this.error_flag = true;
            this.errors.confirmPassword = "Passwords don't match";
          }
        }
      },
      validation(field, value) {
        let re;
        switch (field) {
          case 'login':
            re = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{3,13}$/u;
            break;
          case 'password':
            re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            break;
          case 'email':
            re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            break;
        }
        return re.test(value);
      },
    },

  }
</script>

<style scoped>
  .login_form, .mail_form, .pass_form {
    width: 40%;
    margin-left: 30%;
    margin-top: 5%;
  }
  .banner{
    width: 40%;
    margin-left: 30%;
    margin-top: 5%;
  }
</style>
