'use strict'

import { filterMixin } from '../mixins/utils'
import { debounce } from 'lodash'

export default {
  name: 'BusinessAddView',
  template: '#business-view',
  mixins: [filterMixin],

  delimiters: ['[[', ']]'],

  data () {
    return {
    	businesses: [],
    	businessToDelete: {},
    	loading: true
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'business') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchData()
  },

  methods: {
  	fetchData: debounce(function () { this.fetchBusiness() }, 500, {'leading': true}),

  	fetchBusiness () {
  		this.loading = true
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      params.params.page = this.page

  		const apiUrl = '/businesses/api/business/'
      this.$http.get(apiUrl, params).then(response => {
        this.businesses = response.body
        this.setPaginationData(response)
        this.loading = false
      })
  	},

  	deleteBusiness () {
  		const apiUrl = `/businesses/api/business/${this.businessToDelete.id}/`
      this.$http.delete(apiUrl).then(response => {
        window.location.reload()
        this.fetchData()
      })
  	}
  }
}
