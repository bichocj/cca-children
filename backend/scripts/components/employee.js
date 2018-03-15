import { businessesApiMixin } from '../mixins/businesses-mixin'
import { filterMixin } from '../mixins/utils'
import { formsMixin } from '../mixins/forms-mixin'
import { debounce } from 'lodash'
import employeeAddView from './employee-add'

import Cookies from 'js-cookie'

export default {
  name: 'EmployeeView',
  template: '#employee-view',
  mixins: [businessesApiMixin, filterMixin, formsMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      employees: [],
      employeeToDelete: {},
      sort: '',
      loading: false,
      employeeId: undefined,
    }
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'employees') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchData()
  },

  methods: {
    fetchEmployeeList () {
      const apiUrl = '/businesses/api/business-user/'
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true

      this.$http.get(apiUrl, params).then(response => {
        this.employees = response.body.results
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchData: debounce(function () { this.fetchEmployeeList() }, 500, {'leading': true}),

    deleteEmployee () {
      const apiUrl = `/businesses/api/business-user/${this.employeeToDelete.id}/`

      this.$http.delete(apiUrl).then(response => {
        this.fetchEmployeeList()
      })
    },

    showReport (format) {
      const apiUrl = `/businesses/api/business-user-report-${format}/`
      const params = {
        params: this.filters
      }

      params.params.ordering = this.sort
      const url = apiUrl + this.objectToQuerystring(params.params)
      window.open(url, 'Download')
    }
  },

  components: {
    'employee-add': employeeAddView
  }
}
