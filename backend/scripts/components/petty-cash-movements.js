import { filterMixin } from '../mixins/utils'
import { debounce } from 'lodash'
import PettyCashMovementsAddView from './petty-cash-movements-add'

const EXPENSE = 2

export default {
  name: 'PettyCashMovementsView',
  template: '#petty-cash-movements-view',
  mixins: [filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      pettyCashMovementId: undefined,
      pettyCash: {},
      movements: [],
      typeList: [],
      movementToDelete: {},
      summary: { petty_cash: {} },
      sort: '',
      pettyCashId: null,
      allowedBack: true,
      allowedClose: true,
      loading: false,
      filters: {
        // 'type': EXPENSE
      }
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'petty_cash_movements') {
        this.fetchPettyCash()
        this.fetchData()
        this.fetchTypeList()
        this.fetchSummary()
      }
    }
  },

  mounted () {
    this.fetchPettyCash()
    this.fetchTypeList()
    this.fetchData()
    this.fetchSummary()
  },

  methods: {
    fetchData: debounce(function () { this.fetchMovementList() }, 500, {'leading': true}),

    fetchMovementList () {
      const parsedFilters = $.extend({}, this.filters)
      this.pettyCashId = this.$route.params.pettyCashId

      const apiUrl = `/petty-cash/api/petty-cash/${this.pettyCashId}/movements/`
      const params = {
        params: parsedFilters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true

      this.$http.get(apiUrl, params).then(response => {
        this.movements = response.body.results
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchTypeList () {
      const apiUrl = '/movements/api/types/'
      this.$http.get(apiUrl).then(response => {
        this.typeList = response.body
      })
    },

    fetchPettyCash () {
      const apiUrl = `/petty-cash/api/petty-cash/${this.$route.params.pettyCashId}/`
      this.$http.get(apiUrl).then(response => {
        this.pettyCash = response.body

        if (window.USER_GROUP !== 'Owner') {
          this.allowedBack = !this.pettyCash.is_active
          this.allowedClose = false
        }
      })
    },

    deleteMovement (movement) {
      const apiUrl = `/movements/api/movements/${movement.id}/`
      this.$http.delete(apiUrl).then(response => { this.fetchData() })
    },

    fetchSummary () {
      const apiUrl = `/petty-cash/api/petty-cash/${this.$route.params.pettyCashId}/summary/`

      this.$http.get(apiUrl).then(response => {
        this.summary = response.body
      })
    },

    closePettyCash () {
      const apiUrl = `/petty-cash/api/petty-cash/${this.summary.petty_cash.id}/`

      this.$http.delete(apiUrl).then(response => {
        this.summary.petty_cash.is_active = false
      })
    }
  },

  components: {
    'petty-cash-movement-add': PettyCashMovementsAddView
  }
}
