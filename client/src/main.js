// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueSession from 'vue-session'
import '../node_modules/bulma/css/bulma.css'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
  debug: false,
  connection: 'http://localhost:8081'
}));

Vue.use(VueSession, {
  persist: true
});
Vue.config.productionTip = true;
Vue.config.devtools=false;
Vue.config.silent = true;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
