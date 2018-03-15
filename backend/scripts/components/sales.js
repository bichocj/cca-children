import { debounce } from 'lodash'
import { filterMixin } from '../mixins/utils'

const moment = require('moment')

export default {
  name: 'SalesView',
  template: '#sales-view',
  mixins: [filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      invoices: [],
      invoiceToDelete: {},
      total: 0,
      loading: false,

      documentTypeList: [],
      isActiveDisplayList: [
        {'id': 1, 'name': 'Procedió'},
        {'id': 0, 'name': 'Anulado'}
      ]
    }
  },

  mounted () {
    this.fetchData()
    this.fetchDocumentTypeList()
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'sales') {
        this.fetchData()
      }
    }
  },

  methods: {
    fetchInvoicelist () {
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

      const apiUrl = '/sales/api/invoice/'
      const params = {
        params: parsedFilters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true
      this.$http.get(apiUrl, params).then(response => {
        this.invoices = response.body.results
        // Set pagination
        this.setPaginationData(response)
        this.loading = false
      })

      const apiTotalUrl = '/sales/api/invoice-total/'
      this.$http.get(apiTotalUrl, params).then(response => {
        this.total = response.body.total
      })
    },

    fetchData: debounce(function () { this.fetchInvoicelist() }, 300, {'leading': true}),

    fetchDocumentTypeList () {
      const apiUrl = `/inventory/api/document-type/`

      this.$http.get(apiUrl).then(response => {
        this.documentTypeList = response.body
      })
    },

    deleteInvoice () {
      const apiUrl = `/sales/api/invoice/${this.invoiceToDelete.id}/`

      this.$http.patch(apiUrl, { is_active: false }).then(response => {
        this.fetchInvoicelist()
      })
    },

    showReport (format) {
      const apiUrl = `/sales/api/invoice-report-${format}/`
      const params = {
        params: this.filters
      }

      params.params.ordering = this.sort
      const url = apiUrl + this.objectToQuerystring(params.params)
      window.open(url, 'Download')
    }
  }
}
