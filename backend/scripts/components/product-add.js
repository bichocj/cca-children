'use strict'

import { inventoryApiMixin } from '../mixins/inventory-mixin'
import Cookies from 'js-cookie'
import { formsMixin } from '../mixins/forms-mixin'

export default {
  name: 'productAddView',
  props: ['productId', 'modalId'],
  template: '#product-add-view',
  mixins: [inventoryApiMixin, formsMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      taxList: [],
      product: {},
      errors: {},
      unitSearch: '',
      taxSearch: '',
      formMethod: undefined,
      inputFlow: [
        'inputName',
        'inputCode',
        'inputSellingPrice',
        'inputUnit',
        'inputTax',
        'inputSubmit'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    unitSearch: {
      handler () {
        this.setUnitSearch()
      },
      deep: true
    },

    taxSearch: {
      handler () {
        this.setTaxSearch()
      },
      deep: true
    },

    productId () {
      this.routeHandler()
    }
  },

  mounted () {
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearProductId')
      this.resetData()
    })

    $(`#${this.modalId}`).on('show.bs.modal', () => {
      this.routeHandler()
    })
  },

  methods: {
    routeHandler () {
      if (['products'].includes(this.$route.name)) {
        this.resetData()
        this.fetchTaxList()
        this.fetchUnitList()

        if (this.productId) {
          this.fetchProduct()
          this.formMethod = this.updateProduct
        } else {
          this.setFocus()
          this.formMethod = this.createProduct
        }
      }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    setFocus () {
      document.getElementById('inputName').focus()
    },

    fetchTaxList (query, done) {
      const apiUrl = '/inventory/api/taxes/'
      this.$http.get(apiUrl).then(response => {
        this.taxList = response.body
      })
    },

    fetchProduct () {
      const apiUrl = `/inventory/api/product/${this.productId}`
      this.$http.get(apiUrl).then(response => {
        this.product = response.body
        this.product.unit_id = this.product.unit.id
        this.unitSearch = this.product.unit
        this.taxSearch = this.product.tax
        delete this.product.unit
      })
    },

    createProduct () {
      const apiUrl = '/inventory/api/product/'
      this.product.business = Cookies.get('business_pk')

      this.disableSubmit()
      this.$http.post(apiUrl, this.product).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    updateProduct () {
      const apiUrl = `/inventory/api/product/${this.productId}/`

      this.disableSubmit()

      this.$http.put(apiUrl, this.product).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    setUnitSearch () {
      if (this.unitSearch && this.unitSearch.id) {
        this.product.unit_id = this.unitSearch.id
      } else {
        this.product.unit_id = undefined
      }
    },

    setTaxSearch () {
      if (this.taxSearch && this.taxSearch.id) {
        this.product.tax_id = this.taxSearch.id
      } else {
        this.product.tax_id = undefined
      }
    }
  }
}
