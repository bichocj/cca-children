import { filterMixin } from '../mixins/utils'
import { debounce } from 'lodash'
import MovementsAddView from './movements-add'

const moment = require('moment')

export default {
  name: 'movementsView',
  template: '#movements-view',
  mixins: [filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      movementId: undefined,
      movements: [],
      typeList: [],
      movementToDelete: {},
      sort: '',
      loading: false,
      filters: {
        'created_at__gte': moment().format('YYYY-MM-DD'),
      }
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'movements') {
        this.fetchData()
        this.fetchTypeList()
      }
    }
  },

  mounted () {
    this.fetchTypeList()
    this.fetchData()
  },

  methods: {
    fetchData: debounce(function () { this.fetchMovementList() }, 500, {'leading': true}),

    fetchMovementList () {
      const parsedFilters = $.extend({}, this.filters)

      if (parsedFilters.created_at__gte) {
        const startDate = moment(parsedFilters.created_at__gte, 'YYYY-MM-DD').toDate()
        parsedFilters.created_at__gte = moment(startDate).toISOString()
      }
      if (parsedFilters.created_at__lte) {
        const endDate = moment(parsedFilters.created_at__lte, 'YYYY-MM-DD').toDate()
        endDate.setHours(23, 59, 59, 999)
        parsedFilters.created_at__lte = moment(endDate).toISOString()
      }

      const apiUrl = '/movements/api/movements/'
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

    deleteMovement (movement) {
      const apiUrl = `/movements/api/movements/${movement.id}/`
      this.$http.delete(apiUrl).then(response => { this.fetchData() })
    }
  },

  components: {
    'movement-add': MovementsAddView
  }
}
