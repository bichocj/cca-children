import Cookies from 'js-cookie'
import Vue from 'vue'

Vue.http.interceptors.push(function (request, next) {
  request.headers.set('X-CSRFToken', Cookies.get('csrftoken'))
  next()
})
