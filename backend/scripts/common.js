// import Vue from 'vue'
// import VueResource from 'vue-resource'
//
// // Get cookie
// function getCookie (name) {
//   var value = '; ' + document.cookie
//   var parts = value.split('; ' + name + '=')
//   if (parts.length === 2) return parts.pop().split(';').shift()
// }
//
// Vue.use(VueResource)
//
// Vue.http.interceptors.push(function (request, next) {
//   var parser = document.createElement('a')
//   parser.href = request.url
//
//   // if (parser.hostname === 'www.googleapis.com') {
//   //   next()
//   // } else {
//     if (window.USER.is_authenticated) { request.headers.set('Authorization', `token ${getCookie('auth_token')}`) }
//     next()
//   // }
// })
//
// export default {
//   getCookie: getCookie
// }
