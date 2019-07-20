<template>
  <div>
    <form id="register_form" v-if="showForm" onsubmit="return false;">
      <div class="field">
        <div class="control has-icons-left">
          <input class="input" type="text" placeholder="Name" v-model="name">
          <span class="icon is-small is-left">
      <i class="fas fa-user"></i>
    </span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left">
          <input class="input" type="text" placeholder="Surname" v-model="surname">
          <span class="icon is-small is-left">
      <i class="fas fa-user"></i>
    </span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left">
          <input class="input"  type="number" placeholder="Age" v-model="age">
          <span class="icon is-small is-left">
            <i class="fas fa-user"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left">
          <input class="input" type="text" placeholder="Login" v-model="login">
          <span class="icon is-small is-left">
            <i class="fas fa-user"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left ">
          <input class="input" type="email" placeholder="Email" v-model="email">
          <span class="icon is-large is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>

      </div>
      <div class="field">
        <div class="control has-icons-left">
          <input class="input" type="password" placeholder="Password" v-model="password" autocomplete="off">
          <span class="icon is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
      </div>

      <div class="field is-grouped-centered is-grouped">
        <div class="control">
          <button class="button is-success" @click="RegisterUser">
            Register
          </button>
        </div>
      </div>
    </form>

    <!--ERRORS BANNER-->
    <div class="banner">
      <article class="message is-danger" v-if="flag && errors">
        <div class="message-body">
          <ul v-for="error in errors">
            <li >- {{error}}</li>
          </ul>
        </div>
      </article>
    </div>

    <!--SUCCESS BANNER-->

    <div class="banner" v-if="showAlert">
      <article class="message is-link">
        <div class="message-body">
          <p>{{alert}}</p>
        </div>
      </article>
    </div>

  </div>
</template>

<script>
  import {EventBus} from '../../event-bus'
  import UserService from '@/services/UserService'
    export default
    {
        name: 'NewPost',
        data () {
            return {
              name: '', surname: '', login: '', email: '', password: '', age: '',
              showAlert: false,
              showForm: true,
              found: true,
              alert:'',
              errors: {},
              flag: false
            }
        },
      mounted() {
        if (this.$session.get('b_sessionID')) {
          this.$router.replace('/');
          EventBus.$emit('logged', this.login);
        }
      },
        methods: {
          async RegisterUser()
          {
            this.error_check();
            if (this.flag === false)
            {
              const response = await UserService.register({
                name: this.name, surname: this.surname, login: this.login,
                email: this.email, password: this.password, age:this.age
              });
              if (response && response.data)
              {
                if (!response.data.success)
                {
                  this.errors.alert = response.data.message;
                  this.flag = true;
                }
                else
                {
                  this.alert = response.data.message + ' Check your mail!  ';
                  this.showAlert = true;
                  this.showForm = false;
                  this.name = this.surname = this.email = this.login = this.password = this.age = '';

                }
              }
            }
          },
          error_check(){
            this.errors = {};
            if (!this.name)
              this.errors.name = 'Name required.';
            else if (!this.validation('name', this.name))
              this.errors.name = 'Please enter a valid name.';
            if (!this.surname)
              this.errors.surname = 'Surname required.';
            else if (!this.validation('surname', this.surname))
              this.errors.surname = 'Please enter a valid surname.';
            if (!this.age)
              this.errors.age = 'Age required.';
            else if (!this.validation('age', this.age))
              this.errors.age = 'Please enter a valid age.';
            else if (this.age < 18 || this.age > 101)
              this.errors.age = 'Age must be > 18.';
            if (!this.login)
              this.errors.login = 'Login required.';
            else if (!this.validation('login', this.login))
              this.errors.login = 'A valid login must contain letters and can contain numbers, must begin ' +
                'with a letter and have a length between 4 and 12 characters.';
            if (!this.email)
              this.errors.email = 'Email required.';
            else if (!this.validation('email', this.email))
              this.errors.email = 'Valid email required.';
            if (!this.password)
              this.errors.password = 'Password required.';
            else if (!this.validation('password', this.password))
              this.errors.password = "A valid password requires a lowercase and an uppercase character, " +
                "a number and a special character, a length of at least 8.";
            this.flag = !!(this.errors.name || this.errors.surname || this.errors.age ||
              this.errors.email || this.errors.login || this.errors.password);
          },
          validation(field, value) {
            let re;
            switch (field) {
              case 'email':
                re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                break;
               case 'name':
                 re = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
                 break;
               case 'surname':
                 re = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;
                 break;
              case 'login':
                re = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{3,13}$/u;
                break;
               case 'password':
                 re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                 break;
               case 'age':
                 re = new RegExp("^(18?[1-9]|[1-9][0-9]|[1][1-9][1-9]|101)$");
                 break;
            }
            return re.test(value);
          }
        }
    }
</script>
<!--todo add everywhere scoped-->
<style scoped>
    #register_form
    {
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
