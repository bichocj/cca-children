import { filterMixin } from '../mixins/utils'
import { debounce, find } from 'lodash'
import PettyCashAddView from './petty-cash-add'

const moment = require('moment')

export default {
  name: 'PettyCashView',
  template: '#petty-cash-view',
  mixins: [filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      pettyCashList: [],
      pettyCashToDelete: {},
      sort: '',
      pettyCashId: undefined,
      loading: false,
      filters: {
        'start_date__gte': moment().format('YYYY-MM-DD'),
      }
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'petty_cash') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchData()
  },

  methods: {
    fetchData: debounce(function () { this.fetchPettyCashList() }, 500, {'leading': true}),

    fetchPettyCashList () {
      const apiUrl = '/petty-cash/api/petty-cash/'
      const parsedFilters = $.extend({}, this.filters)

      if (parsedFilters.start_date__gte) {
        const startDate = moment(parsedFilters.start_date__gte, 'YYYY-MM-DD').toDate()
        parsedFilters.start_date__gte = moment(startDate).toISOString()
      }
      if (parsedFilters.start_date__lte) {
        const endDate = moment(parsedFilters.start_date__lte, 'YYYY-MM-DD').toDate()
        endDate.setHours(23, 59, 59, 999)
        parsedFilters.start_date__lte = moment(endDate).toISOString()
      }

      const params = {
        params: parsedFilters
      }

      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true

      this.$http.get(apiUrl, params).then(response => {
        this.pettyCashList = response.body.results

        if (window.USER_GROUP !== 'Owner') {
          this.checkCurrentPettyCash()
        }

        this.setPaginationData(response)
        this.loading = false
      })
    },

    checkCurrentPettyCash () {
      const apiUrl = '/petty-cash/api/current-petty-cash/'
      this.$http.get(apiUrl).then(response => {
        let actives = response.body
        if (actives.length) {
          this.$router.push({ name: 'petty_cash_movements', params: {'pettyCashId': actives[0].id}})
        }
      })

    }

  },

  components: {
    'petty-cash-add': PettyCashAddView
  }

}
