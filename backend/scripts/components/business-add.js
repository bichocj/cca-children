'use strict'

import { formsMixin } from '../mixins/forms-mixin'
import Cookies from 'js-cookie'

export default {
  name: 'BusinessAddView',
  template: '#business-add-view',
  mixins: [formsMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      businessId: undefined,
      business: {},
      errors: {},
      formMethod: undefined,
      inputFlow: [
        'inputName',
        'inputAddress',
        'inputRuc',
        'inputPhone',
        'inputSubmit'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    }
  },

  mounted () {
    this.routeHandler()
  },

  methods: {
    routeHandler () {
      if (['business_edit', 'business_add'].includes(this.$route.name)) {
        this.resetData()
        if (this.$route.name === 'business_edit') {
          this.businessId = this.$route.params.id
          this.fetchBusiness()
          this.formMethod = this.updateBusiness
        } else {
          this.setFocus()
          this.formMethod = this.createBusiness
        }
      }
    },

    setFocus () {
      document.getElementById('inputName').focus()
    },

    createBusiness () {
      const apiUrl = '/businesses/api/business/'

      this.disableSubmit()

      this.$http.post(apiUrl, this.business).then(response => {
        Cookies.set('business_pk', response.body.id)
        this.enableSubmit()
        this.$router.push({ name: 'home' })
        window.location.reload()
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    fetchBusiness () {
      const apiUrl = `/businesses/api/business/${this.businessId}`
      this.$http.get(apiUrl).then(response => {
        this.business = response.body
      })
    },

    updateBusiness () {
      const apiUrl = `/businesses/api/business/${this.businessId}/`

      this.disableSubmit()

      this.$http.put(apiUrl, this.business).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$router.push({ name: 'business' })
        window.location.reload()
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    }
  }
}
