import Vue from 'vue'
import VueResource from 'vue-resource'
import Sidebar from './components/sidebar'
import VueRouter from 'vue-router'
import Routes from './router'
import Vue2Filters from 'vue2-filters'
import * as uiv from 'uiv'

// import common from './common'

require('bootstrap')

const router = new VueRouter({routes: Routes})

Vue.use(uiv)
Vue.use(VueResource)
require('./interceptors')

Vue.use(Vue2Filters)
Vue.use(VueRouter)

const moment = require('moment-timezone')
require('moment/locale/es')
moment.tz.setDefault('America/Lima')

Vue.use(require('vue-moment'), {
  moment
})

new Vue({ // eslint-disable-line
  el: '#app',
  router: router,
  delimiters: ['[[', ']]'],
  data: {
    abc: 'hola'
  },

  components: {
    Sidebar
    // ClientComponent,
  }
})

Vue.http.interceptors.push((request, next) => {
  next(response => {
    // Unauthenticated or Forbidden
    if (response.status === 401 || response.status === 403) {
      window.location.href = '/accounts/logout/'
    }
  })
})
