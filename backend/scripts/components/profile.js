export default {
  name: 'ProfileView',
  template: '#profile-view',
  delimiters: ['[[', ']]'],

  data () {
    return {
      errors: {},
      user: {},
      loading: true,
      showChangePasswordForm: false,
      password: { non_field_errors: null }
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'profile') {
        this.fetchUser()
      }
    }
  },

  mounted () {
    this.fetchUser()
  },

  methods: {
    fetchUser () {
      let apiUrl = `/accounts/api/user/${window.USER_ID}/`

      this.loading = true
      this.$http.get(apiUrl).then(response => {
        this.user = response.body
        this.loading = false
      })
    },

    save () {
      if (this.showChangePasswordForm) {
        this.changePassword()
      } else {
        this.updateUser()
      }
    },

    updateUser () {
      let apiUrl = `/accounts/api/user/${window.USER_ID}/`

      this.loading = true
      this.$http.put(apiUrl, this.user).then(response => {
        this.user = response.body
        this.setUserDisplay()
        this.$router.push({ name: 'home' })
      }, error => {
        this.errors = error.body
      })
    },

    changePassword () {
      let apiUrl = `/accounts/api/user/${window.USER_ID}/`

      let data = {
        new_password: this.password.new_password || ' ',
        new_password2: this.password.new_password2 || ' ',
        old_password: this.password.old_password || ' '
      }

      this.loading = true
      this.$http.patch(apiUrl, data).then(response => {
        window.location.href = '/accounts/logout/'
      }, error => {
        this.errors = error.body
      })
    },

    setUserDisplay () {
      let fullName
      if (this.user.first_name || this.user.last_name) {
        fullName = `${this.user.first_name} ${this.user.last_name}`
      } else {
        fullName = this.user.username
      }
      document.getElementById('userDisplay').innerHTML = fullName
    }
  }
}
