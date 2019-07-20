import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Register from '@/components/user/Register'
import Login from '@/components/user/Login'
import Verify from '@/components/user/Verify'
import UserArea from '@/components/user/UserArea/UserArea'
import Person_profile from '@/components/Person_profile'
import Chat from '@/components/Chat'
import PageNotFound from '@/components/PageNotFound'
Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
      {
          path: '/',
          name: 'Home',
          component: Home
      },
      {
          path: '/register',
          name: 'Register',
          component: Register
      },
      {
        path: '/login',
        name: 'Login',
        component: Login
      },
      {
        path: '/verify/:id',
        name: 'Verify',
        component: Verify
      },
      {
          path: '/resetPw/:hash',
          component: Login
      },
      {
        path: '/user_area',
        name: 'UserArea',
        component: UserArea,
      },
      {
        path: '/person_profile/:card_id',
        name: 'Person_profile',
        component: Person_profile,

      },
      {
        path: '/chat',
        name: 'Chat',
        component: Chat
      },
      {
        path: "*",
        name: 'PageNotFound',
        component: PageNotFound
      },
    ]
})
