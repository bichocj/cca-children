import { businessesApiMixin } from '../mixins/businesses-mixin'
import { filterMixin } from '../mixins/utils'
import { formsMixin } from '../mixins/forms-mixin'
import { debounce } from 'lodash'
import BusinessTaxAddView from './business-tax-add'

import Cookies from 'js-cookie'

export default {
  name: 'BusinessTaxView',
  template: '#business-tax-view',
  mixins: [businessesApiMixin, filterMixin, formsMixin],
  props: ['display'],
  delimiters: ['[[', ']]'],

  data () {
    return {
      businessTaxes: [],
      taxToDelete: {},
      taxToDefault: {},
      sort: '',
      loading: false,
      roleList: [],
      errors: {},
      businessTaxId: undefined,
    }
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'business_configurations') {
        this.fetchData()
      }
    },
  },

  mounted () {
    this.fetchData()
  },

  methods: {
    fetchBusinessTaxList () {
      const apiUrl = '/inventory/api/business-tax/'
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true
      this.formMethod = this.createBusinessTax

      this.$http.get(apiUrl, params).then(response => {
        this.businessTaxes = response.body.results
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchData: debounce(function () { this.fetchBusinessTaxList() }, 500, {'leading': true}),

    deleteBusinessTax () {
      const apiUrl = `/inventory/api/business-tax/${this.taxToDelete.id}/`

      this.$http.delete(apiUrl).then(response => {
        this.fetchBusinessTaxList()
      })
    },

    defaultBusinessTax () {
      const apiUrl = `/inventory/api/business-tax/${this.taxToDefault.id}/`

      this.taxToDefault.is_default = !this.taxToDefault.is_default
      this.taxToDefault.tax_id = this.taxToDefault.id
      this.$http.put(apiUrl, this.taxToDefault).then(response => {
        this.fetchBusinessTaxList()
      })
    }
  },

  components : {
    'business-tax-add': BusinessTaxAddView
  }
}
