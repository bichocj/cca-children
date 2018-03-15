'use strict'

import { businessesApiMixin } from '../mixins/businesses-mixin'
import { filterMixin } from '../mixins/utils'
import { formsMixin } from '../mixins/forms-mixin'
import { debounce } from 'lodash'

import Cookies from 'js-cookie'

export default {
  name: 'BusinessTaxAddView',
  template: '#business-tax-add-view',
  props: ['businessTaxId', 'modalId'],
  mixins: [formsMixin],

  delimiters: ['[[', ']]'],

  data () {
    return {
      businessTax: { tax: {} },
      errors: {},
      taxSearch: '',
      taxForm: false,
      roleSearch: '',
      taxSelected: false,
      tax: {},
      formMethod: undefined,
      inputFlow: [
        'inputTax',
        'inputAmount'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    taxSearch: {
      handler () {
        this.setTaxSelected()
      },
      deep: true
    },

    businessTaxId () {
      this.routeHandler()
    }

  },

  mounted () {
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearBusinessTaxId')
      this.resetData()
    })

    $(`#${this.modalId}`).on('show.bs.modal', () => {
      this.routeHandler()
    })

    $(`#${this.modalId}`).on('shown.bs.modal', () => {
      this.setFocus()
    })
  },

  methods: {
    routeHandler () {
      if (['business_configurations'].includes(this.$route.name)) {
        this.resetData()
        this.formMethod = this.createBusinessTax
      }
    },

    setFocus () {
      document.getElementById('inputTax').focus()
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    fetchTaxData (query, done) {
      const apiUrl = '/inventory/api/taxes/'
      var searchFilters = {'name__icontains': query
      }
      const params = {
        params: searchFilters
      }
      const newTax = { 'name': query + ' (Nuevo impuesto)', 'new_tax_name': query, 'id': -1 }
      this.$http.get(apiUrl, params).then(response => {
        response.body.push(newTax)
        done(response.body)
      })
    },

    resetBusinessTax () {
      this.businessTax.tax_id = undefined
      this.taxSearch = ''
      this.taxSelected = false
      this.tax = {}
      this.errors = {}
    },

    setTaxSelected () {
      if (this.taxSearch && this.taxSearch.id) {
        if (this.taxSearch.id > 0) {
          this.businessTax.tax_id = this.taxSearch.id
          this.taxSearch = this.taxSearch
          this.tax = this.taxSearch
          this.taxSelected = true
          document.getElementById('inputAmount').focus()
        } else {
          this.taxForm = true
          this.tax.name = this.taxSearch.new_tax_name
          this.taxSearch = this.new_tax_name
        }
      }
    },

    createTax (callback = () => {}) {
      const apiUrl = `/inventory/api/taxes/`
      this.$http.post(apiUrl, this.tax).then(response => {
        this.tax = response.body
        this.errors = {}
        this.taxForm = false
        this.taxSelected = true
        this.businessTax.tax_id = this.tax.id
        this.taxSearch = this.tax.name
        callback()
      }, response => {
        this.errors = response.body
      })
    },

    fetchBusinessTax () {
      const apiUrl = `/inventory/api/business-tax/${this.businessTaxId}`
      this.$http.get(apiUrl).then(response => {
        this.businessTax = response.body
        this.businessTax.tax_id = this.businessTax.tax.id
        this.tax = this.businessTax.tax
        this.taxForm = true
      })
    },

    createBusinessTax () {
      if (!this.taxForm) {
        this.saveBusinessTax()
      } else {
        this.createTax(() => { this.saveBusinessTax() })
      }
    },

    saveBusinessTax (user) {
      const apiUrl = '/inventory/api/business-tax/'
      this.businessTax.business = Cookies.get('business_pk')

      this.disableSubmit()
      this.$http.post(apiUrl, this.businessTax).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    goForward (e) {
      if (e.target.value) {
        document.getElementById('inputSubmit').focus()
      }
    }
  }
}
