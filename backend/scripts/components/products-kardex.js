import { filterMixin } from '../mixins/utils'

export default {
  name: 'ProductKardexView',
  template: '#product-kardex-view',
  mixins: [filterMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      referralGuideItems: [],
      kardexData: {},
      product: {},
      productId: undefined,
      loading: false
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'products_kardex') {
        if (this.$route.params.id) {
          this.resetData()
          this.productId = this.$route.params.id
          this.fetchProduct()
        }
      }
    }
  },

  mounted () {
    if (this.$route.params.id) {
      this.productId = this.$route.params.id
      this.fetchProduct()
    }
  },

  methods: {

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    fetchProduct () {
      const apiUrl = `/inventory/api/product/${this.productId}`
      this.$http.get(apiUrl).then(response => {
        this.product = response.body
        this.fetchReferralGuideItems()
        this.fetchReferralGuideItems()
        this.fetchKardex()
      })
    },

    fetchKardex () {
      const apiUrl = `/inventory/api/products/${this.productId}/kardex/`
      this.$http.get(apiUrl).then(response => {
        this.kardexData = response.body
      })
    },

    fetchReferralGuideItems () {
      const apiUrl = '/inventory/api/referral-guide-item/'
      const params = {
        params: this.filters
      }
      params.params.page = this.page
      params.params.product = this.product.id
      this.loading = true
      this.$http.get(apiUrl, params).then(response => {
        this.referralGuideItems = response.body.results
        // Set pagination
        this.setPaginationData(response)
        this.loading = false
      })
    },

    showReport: function (format) {
      const apiUrl = `/inventory/api/products/${this.productId}/kardex-report-${format}/`
      window.open(apiUrl, 'Download')
    }
  }
}
