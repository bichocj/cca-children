'use strict'

import { inventoryApiMixin } from '../mixins/inventory-mixin'
import { businessesApiMixin } from '../mixins/businesses-mixin'
import { filterMixin } from '../mixins/utils'
import { formsMixin } from '../mixins/forms-mixin'
import { debounce } from 'lodash'

import Cookies from 'js-cookie'

export default {
  name: 'BusinessUnitAddView',
  template: '#business-unit-add-view',
  props: ['businessUnitId', 'modalId'],
  mixins: [formsMixin, inventoryApiMixin],

  delimiters: ['[[', ']]'],

  data () {
    return {
      businessUnit: { unit: {} },
      errors: {},
      unitSearch: '',
      unitForm: false,
      unitCategorySearch: '',
      unitSelected: false,
      unit: {},
      formMethod: undefined,
      inputFlow: [
        'inputUnit',
        'inputDescription',
        'inputCategory'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    unitSearch: {
      handler () {
        this.setUnitSelected()
      },
      deep: true
    },

    unitCategorySearch: {
      handler () {
        this.setUnitCategorySelected()
      },
      deep: true
    },

    businessUnitId () {
      this.routeHandler()
    }

  },

  mounted () {
    this.fetchUnitCategoriesList()
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearBusinessUnitId')
      this.resetData()
    })

    $(`#${this.modalId}`).on('show.bs.modal', () => {
      this.fetchUnitCategoriesList()
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
        this.formMethod = this.createBusinessUnit
      }
    },

    setFocus () {
      document.getElementById('inputUnit').focus()
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    fetchUnitData (query, done) {
      const apiUrl = '/inventory/api/units/'
      var searchFilters = {'name__icontains': query
      }
      const params = {
        params: searchFilters
      }
      const newUnit = { 'name': query + ' (Nueva unidad)', 'new_unit_name': query, 'id': -1 }
      this.$http.get(apiUrl, params).then(response => {
        response.body.push(newUnit)
        done(response.body)
      })
    },

    resetBusinessUnit () {
      this.businessUnit.unit_id = undefined
      this.unitSearch = ''
      this.unitCategorySearch= ''
      this.unitSelected = false
      this.unit = {}
      this.errors = {}
    },

    setUnitSelected () {
      if (this.unitSearch && this.unitSearch.id) {
        if (this.unitSearch.id > 0) {
          this.businessUnit.unit_id = this.unitSearch.id
          this.unitSearch = this.unitSearch
          this.unit = this.unitSearch
          this.unitSelected = true
          this.unitCategorySearch = this.unit.unit_category
          document.getElementById('inputSubmit').focus()
        } else {
          this.unitForm = true
          this.unit.name = this.unitSearch.new_unit_name
          this.unitSearch = this.new_unit_name
          document.getElementById('inputDescription').focus()
        }
      }
    },

    setUnitCategorySelected () {
      if (this.unitCategorySearch && this.unitCategorySearch.id) {
        if (this.unitCategorySearch.id > 0) {
          this.unit.unit_category_id = this.unitCategorySearch.id
        }
      }
    },

    createUnit (callback = () => {}) {
      const apiUrl = `/inventory/api/units/`
      this.$http.post(apiUrl, this.unit).then(response => {
        this.unit = response.body
        this.errors = {}
        this.unitForm = false
        this.unitSelected = true
        this.businessUnit.unit_id = this.unit.id
        this.unitSearch = this.unit.name
        callback()
      }, response => {
        this.errors = response.body
      })
    },

    fetchBusinessUnit () {
      const apiUrl = `/inventory/api/business-unit/${this.businessUnitId}`
      this.$http.get(apiUrl).then(response => {
        this.businessUnit = response.body
        this.businessUnit.unit_id = this.businessUnit.unit.id
        this.unit = this.businessUnit.unit
        this.unitForm = true
      })
    },

    createBusinessUnit () {
      if (!this.unitForm) {
        this.saveBusinessUnit()
      } else {
        this.createUnit(() => { this.saveBusinessUnit() })
      }
    },

    saveBusinessUnit (user) {
      const apiUrl = '/inventory/api/business-unit/'
      this.businessUnit.business = Cookies.get('business_pk')

      this.disableSubmit()
      this.$http.post(apiUrl, this.businessUnit).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    goCategory (e) {
      if (e.target.value) {
        document.getElementById('inputCategory').focus()
      }
    },

    goSubmit (e) {
      if (e.target.value) {
        document.getElementById('inputSubmit').focus()
      }
    }
  }
}
