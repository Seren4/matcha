<template>
    <div class="notification" v-bind:class="[found ? 'is-success' : 'is-danger']" v-if="showMessage">
      <button class="delete" @click="to_login()"></button>
      {{alert}}
    </div>
</template>

<script>
  import {EventBus} from '../../event-bus'
  import UserService from '@/services/UserService'
  export default
  {
    name: 'Verify',
    data () {
      return {
        showMessage: false,
        found: false,
        alert:'',
      }
    },
    mounted () {
      if (this.$session.get('b_sessionID')) {
        this.$router.replace('/');
        EventBus.$emit('logged', this.login);
      }
      else if (this.$route.params.id)
        this.verify_user()
    },
    methods: {
      async verify_user () {
        let str = this.$route.params.id;
        let re = /^[0-9a-fA-F]+$/;
        if (re.test(str))
        {
          const response = await UserService.verify({id: str});
          if (response && response.data)
          {
            this.alert = response.data.message;
            if (response.data.success) this.found = true;
            else this.alert = 'An error has been encountered during the confirmation.';
            this.showMessage = true;
          }
        }
        else
        {
          this.alert = 'An error has been encountered during the confirmation.';
          this.showMessage = true;
        }
      },
      async to_login(){
        this.$router.push({ name: 'Login' });
      }
    }
  }
</script>

<style scoped>
  .notification
  {
    width: 40%;
    margin-left: 30%;
    margin-top: 5%;
  }
</style>
