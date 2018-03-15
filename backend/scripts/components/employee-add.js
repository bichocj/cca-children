import { businessesApiMixin } from '../mixins/businesses-mixin'
import { formsMixin } from '../mixins/forms-mixin'

import Cookies from 'js-cookie'

export default {
  name: 'employeeAddView',
  template: '#employee-add-view',
  mixins: [formsMixin, businessesApiMixin],
  props: ['employeeId', 'modalId'],
  delimiters: ['[[', ']]'],

  data () {
    return {
      roleList: [],
      employee: { user: {}, role: {} },
      errors: {},
      userSearch: '',
      userForm: false,
      edit: false,
      roleSearch: '',
      employeeSelected: false,
      user: {},
      formMethod: undefined,
      inputFlow: [
        'inputUsername',
        'inputFirstname',
        'inputLastname',
        'inputEmail',
        'inputPassword',
        'inputRole'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    userSearch: {
      handler () {
        this.setUserSelected()
      },
      deep: true
    },

    roleSearch: {
      handler () {
        this.setRoleSearch()
      },
      deep: true
    },

    employeeId () {
      this.routeHandler()
    }
  },

  mounted () {
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearEmployeeId')
      this.resetData()
    })

    $(`#${this.modalId}`).on('show.bs.modal', () => {
      this.routeHandler()
    })

    $(`#${this.modalId}`).on('shown.bs.modal', () => {
      this.setFocus()
    })
  },

  methods: {
    routeHandler () {
      if (['employees'].includes(this.$route.name)) {
        this.errors = {}
        this.fetchRoleList()
        if (this.employeeId) {
          this.fetchEmployee()
          this.formMethod = this.putEmployee
        } else {
          this.resetData()
          this.formMethod = this.createEmployee
        }
      }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    setFocus () {
      if (this.employeeId) {
        document.getElementById('inputRole').focus()
      } else {
        document.getElementById('inputUser').focus()
      }
    },

    fetchUserData (query, done) {
      const apiUrl = '/accounts/api/user/'
      var searchFilters = {'username__icontains': query
      }
      const params = {
        params: searchFilters
      }
      const newUser = { 'username': query + ' (New User)', 'new_user_username': query, 'id': -1 }
      this.$http.get(apiUrl, params).then(response => {
        response.body.push(newUser)
        done(response.body)
      })
    },

    setUserSelected () {
      if (this.userSearch && this.userSearch.id) {
        if (this.userSearch.id > 0) {
          this.employee.user_id = this.userSearch.id
          this.userSearch = this.userSearch
          this.user = this.userSearch
          this.employeeSelected = true
          document.getElementById('inputRole').focus()
        } else {
          this.user.username = this.userSearch.new_user_username
          this.userSearch = this.new_user_username
          this.setUsernameFocus()
        }
      }
    },

    setUsernameFocus () {
      let id = setInterval(() => {
        if (document.getElementById('inputUsername').value) {
          clearInterval(id)
          document.getElementById('inputUsername').focus()
        }
      }, 50)
    },

    createUser (callback = () => {}) {
      const apiUrl = `/accounts/api/user/`
      this.$http.post(apiUrl, this.user).then(response => {
        this.user = response.body
        this.errors = {}
        this.userForm = false
        this.employeeSelected = true
        this.employee.user_id = this.user.id
        this.userSearch = this.user.username
        callback()
      }, response => {
        this.errors = response.body
      })
    },

    fetchEmployee () {
      const apiUrl = `/businesses/api/business-user/${this.employeeId}`
      this.$http.get(apiUrl).then(response => {
        this.employee = response.body
        this.employee.user_id = this.employee.user.id
        this.user = this.employee.user
        this.edit = true
        this.roleSearch = response.body.group
      })
    },

    resetEmployee () {
      this.employee.user_id = undefined
      this.userSearch = ''
      this.employeeSelected = false
      this.user = {}
      this.errors = {}
    },

    createEmployee () {
      if (this.user.id !== undefined) {
        this.saveEmployee()
      } else {
        this.createUser(() => { this.saveEmployee() })
      }
    },

    saveEmployee (user) {
      const apiUrl = '/businesses/api/business-user/'
      this.employee.business = Cookies.get('business_pk')

      this.disableSubmit()

      this.$http.post(apiUrl, this.employee).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    putEmployee () {
      const apiUrl = `/businesses/api/business-user/${this.employeeId}/`

      this.disableSubmit()

      this.$http.put(apiUrl, this.employee).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    setRoleSearch () {
      if (this.roleSearch && this.roleSearch.id) {
        this.employee.group = this.roleSearch.id
        this.employee.group_id = this.roleSearch.id
        document.getElementById('inputSubmit').focus()
      } else {
        this.employee.group = undefined
        this.employee.group_id = undefined
      }
    }
  }
}
