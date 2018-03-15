import { filterMixin } from '../mixins/utils'
import { debounce } from 'lodash'
import clientAddView from './client-add'

export default {
  name: 'clientView',
  template: '#client-view',
  mixins: [filterMixin],

  delimiters: ['[[', ']]'],

  data () {
    return {
      clientId: undefined,
      clients: [],
      documentTypeList: [],
      clientToDelete: {},
      loading: false
    }
  },

  mounted () {
    this.fetchData()
    this.fetchDocumentTypeList()
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'clients') {
        this.fetchData()
      }
    }
  },

  methods: {
    fetchClientList () {
      const apiUrl = '/businesses/api/client/'
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true
      this.$http.get(apiUrl, params).then(response => {
        this.clients = response.body.results
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchData: debounce(function () { this.fetchClientList() }, 500, {'leading': true}),

    fetchDocumentTypeList () {
      const apiUrl = `/businesses/api/document-type/`

      this.$http.get(apiUrl).then(response => {
        this.documentTypeList = response.body
      })
    },

    deleteClient () {
      const apiUrl = `/businesses/api/client/${this.clientToDelete.id}/?changing_status=true`

      let payload = { is_active: false }
      this.$http.patch(apiUrl, payload).then(response => {
        this.fetchClientList()
      })
    },

    showReport (format) {
      const apiUrl = `/businesses/api/client-report-${format}/`
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      const url = apiUrl + this.objectToQuerystring(params.params)
      window.open(url, 'Download')
    }
  },

  components: {
    'client-add': clientAddView
  }
}
