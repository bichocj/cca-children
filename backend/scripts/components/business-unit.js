import { inventoryApiMixin } from '../mixins/inventory-mixin'
import { businessesApiMixin } from '../mixins/businesses-mixin'
import { filterMixin } from '../mixins/utils'
import { formsMixin } from '../mixins/forms-mixin'
import { debounce } from 'lodash'
import BusinessUnitAddView from './business-unit-add'

import Cookies from 'js-cookie'

export default {
  name: 'BusinessUnitView',
  template: '#business-unit-view',
  mixins: [businessesApiMixin, filterMixin, formsMixin, inventoryApiMixin],
  props: ['display'],
  delimiters: ['[[', ']]'],

  data () {
    return {
      businessUnits: [],
      unitToDelete: {},
      unitToDefault: {},
      sort: '',
      loading: false,
      errors: {},
      businessUnitId: undefined,
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
    this.fetchUnitCategoriesList()
    this.fetchData()
  },

  methods: {
    fetchBusinessUnitList () {
      const apiUrl = '/inventory/api/business-unit/'
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.loading = true
      this.formMethod = this.createBusinessTax

      this.$http.get(apiUrl, params).then(response => {
        this.businessUnits = response.body.results
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchData: debounce(function () { this.fetchBusinessUnitList() }, 500, {'leading': true}),

    deleteBusinessUnit () {
      const apiUrl = `/inventory/api/business-unit/${this.unitToDelete.id}/`

      this.$http.delete(apiUrl).then(response => {
        this.fetchBusinessUnitList()
      })
    },

    defaultBusinessUnit () {
      const apiUrl = `/inventory/api/business-unit/${this.unitToDefault.id}/`

      this.unitToDefault.is_default = !this.unitToDefault.is_default
      this.unitToDefault.unit_id = this.unitToDefault.id
      this.$http.put(apiUrl, this.unitToDefault).then(response => {
        this.fetchBusinessUnitList()
      })
    }
  },

  components : {
    'business-unit-add': BusinessUnitAddView
  }
}
