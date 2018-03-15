import { inventoryApiMixin } from '../mixins/inventory-mixin'
import { filterMixin } from '../mixins/utils'
import { debounce } from 'lodash'

const moment = require('moment')

export default {
  name: 'ReferralGuideView',
  template: '#referral-guide-view',
  mixins: [inventoryApiMixin, filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      referralGuides: [],
      referralGuideToDelete: {},
      loading: false,
      isActiveDisplayList: [
        {'id': 1, 'name': 'Procedió'},
        {'id': 0, 'name': 'Anulado'}
      ]
    }
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'referral_guides') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchCategoryList()
    this.fetchData()
  },

  methods: {
    fetchReferralGuideList () {
      this.loading = true
      const parsedFilters = $.extend({}, this.filters)

      if (parsedFilters.date__gte) {
        const startDate = moment(parsedFilters.date__gte, 'YYYY-MM-DD').toDate()
        parsedFilters.date__gte = moment(startDate).toISOString()
      }
      if (parsedFilters.date__lte) {
        const endDate = moment(parsedFilters.date__lte, 'YYYY-MM-DD').toDate()
        endDate.setHours(23, 59, 59, 999)
        parsedFilters.date__lte = moment(endDate).toISOString()
      }

      const apiUrl = '/inventory/api/referral-guide/'
      const params = {
        params: parsedFilters
      }
      params.params.ordering = this.sort
      params.params.page = this.page

      this.$http.get(apiUrl, params).then(response => {
        this.referralGuides = response.body.results
          // Set pagination
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchData: debounce(function () { this.fetchReferralGuideList() }, 500, {'leading': true}),

    deleteReferralGuide () {
      const apiUrl = `/inventory/api/referral-guide/${this.referralGuideToDelete.id}/`

      this.$http.patch(apiUrl, { is_active: false }).then(response => {
        this.fetchReferralGuideList()
      })
    },

    showReport (format) {
      const parsedFilters = $.extend({}, this.filters)

      if (parsedFilters.date__gte) {
        const startDate = moment(parsedFilters.date__gte, 'YYYY-MM-DD').toDate()
        parsedFilters.date__gte = moment(startDate).toISOString()
      }
      if (parsedFilters.date__lte) {
        const endDate = moment(parsedFilters.date__lte, 'YYYY-MM-DD').toDate()
        endDate.setHours(23, 59, 59, 999)
        parsedFilters.date__lte = moment(endDate).toISOString()
      }

      const apiUrl = `/inventory/api/referral-guide-report-${format}/`
      const params = {
        params: parsedFilters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      params.params.ordering = this.sort
      const url = apiUrl + this.objectToQuerystring(params.params)
      window.open(url, 'Download')
    }
  }
}
