import { inventoryApiMixin } from '../mixins/inventory-mixin'
import { filterMixin } from '../mixins/utils'
import { debounce } from 'lodash'
import ProductAddView from './product-add'

export default {
  name: 'productView',
  template: '#product-view',
  mixins: [inventoryApiMixin, filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      productId: undefined,
      products: [],
      productToDelete: {},
      loading: false
    }
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'products') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchUnitList()
    this.fetchData()
  },

  methods: {
    fetchProductList () {
      this.loading = true
      const apiUrl = '/inventory/api/product/'
      const params = {
        params: this.filters
      }
      params.params.ordering = this.sort
      params.params.page = this.page
      this.$http.get(apiUrl, params).then(response => {
        this.products = response.body.results
        // Set pagination
        this.setPaginationData(response)
        this.loading = false
      })
    },

    fetchData: debounce(function () { this.fetchProductList() }, 500, {'leading': true}),

    deleteProduct () {
      const apiUrl = `/inventory/api/product/${this.productToDelete.id}/?changing_status=true`

      let payload = { is_active: false }
      this.$http.patch(apiUrl, payload).then(response => {
        this.fetchData()
      })
    },

    showReport (format) {
      const apiUrl = `/inventory/api/product-report-${format}/`
      const params = {
        params: this.filters
      }

      params.params.ordering = this.sort
      const url = apiUrl + this.objectToQuerystring(params.params)
      window.open(url, 'Download')
    }

  },

  components: {
    'product-add': ProductAddView
  }
}
