'use strict'

import { inventoryApiMixin } from '../mixins/inventory-mixin'
import { businessesApiMixin } from '../mixins/businesses-mixin'
import { formsMixin } from '../mixins/forms-mixin'
import ProductItem from '../models/product-item'

import Cookies from 'js-cookie'

const INPUT = 1
const moment = require('moment')

export default {
  name: 'referralGuideAddView',
  template: '#referral-guide-add-view',
  mixins: [formsMixin, inventoryApiMixin, businessesApiMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      categoryList: [],
      referralGuide: { items: [], _type: 'referral_guide' },
      date: moment().format('YYYY-MM-DD'),
      time: moment().toDate(),
      errors: {},
      alerts: {},
      productSearch: '',
      itemToEdit: {},
      itemToEditIndex: undefined,
      newItem: {},
      maxLength: 11,
      clientSearchByDoc: '',
      clientSelected: false,
      clientLoading: false,
      client: { errors: {} },
      documentTypeSearch: '',
      categorySearch: '',
      clientDocumentTypeSearch: '',
      referralGuideId: undefined,
      formMethod: undefined,
      isSaved: false,
      inputFlow: [
        'inputCategory',
        'inputReferralNumber',
        'inputDocumentType',
        'inputDocumentNumber',
        'inputClientDoc',
        'inputClientName',
        'inputClientDocumentType',
        'inputClienDocumentNumber',
        'inputClientAddress',
        'inputClientPhone',
        'inputClientEmail',
        'inputClientSubmit',
        'inputProduct'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    productSearch: {
      handler () {
        this.setProductSelected()
      },
      deep: true
    },

    clientSearchByDoc: {
      handler () {
        this.setClientDocSelected()
      },
      deep: true
    },

    documentTypeSearch: {
      handler () {
        this.setDocumentTypeSelected()
      },
      deep: true
    },

    categorySearch: {
      handler () {
        this.setCategorySelected()
      },
      deep: true
    },

    clientDocumentTypeSearch: {
      handler () {
        this.setClientDocumentTypeSelected()
      },
      deep: true
    }
  },

  mounted () {
    this.routeHandler()
    this.setClientFocus()
  },

  methods: {
    routeHandler () {
      if (['referral_guides_add', 'referral_guides_edit'].includes(this.$route.name)) {
        this.resetData()
        this.fetchDocumentTypeList()
        this.fetchClientDocumentTypeList()
        this.fetchCategoryList()

        if (this.$route.name === 'referral_guides_add') {
          this.client = { errors: {} }
          this.formMethod = this.createReferralGuide
        } else {
          this.referralGuideId = this.$route.params.id
          this.fetchReferralGuide()
          this.formMethod = this.updateReferralGuide
        }
      }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    setFocus () {
      document.getElementById('inputProduct').focus()
    },

    setClientFocus () {
      $('#createClientModal').on('shown.bs.modal', () => {
        $('#inputClientName').focus()
      })
    },

    resetClient () {
      this.client = { errors: {} }
      this.clientSelected = false
      this.referralGuide.client_id = undefined
      this.clientSearchByDoc = ''
      this.clientDocumentTypeSearch = ''
      document.getElementById('inputClientDocumentType').value = ''
    },

    fetchClientListByDoc (query, done) {
      const apiUrl = '/businesses/api/client/'
      const params = {
        params: { 'document_number__icontains': query, 'name__icontains': query, 'condition': 'OR' }
      }
      const isSuggestedQuery = RegExp('Nuevo cliente \\(.+\\)').test(query)
      const newClient = {
        'id': -1,
        'new_client_doc': query,
        'document_number': isSuggestedQuery ? query : `Nuevo cliente (${query})`
      }

      this.$http.get(apiUrl, params).then(response => {
        response.body.results.push(newClient)
        done(response.body.results)
      })
    },

    createClient () {
      const apiUrl = `/businesses/api/client/`
      this.client.business = Cookies.get('business_pk')
      this.$http.post(apiUrl, this.client).then(response => {
        this.client = response.body
        this.client.errors = {}
        this.referralGuide.client_id = this.client.id
        this.clientSelected = true
        this.clientSearchByDoc = this.client.document_number + '  (' + this.client.name + ')'
        document.getElementById('closeClientModal').click()
      }, response => {
        this.client.errors = response.body
      })
    },

    setClientDocSelected () {
      if (this.clientSearchByDoc && this.clientSearchByDoc.id) { //  check if a client has been selected
        if (this.clientSearchByDoc.id > 0) { // client selected exist
          this.referralGuide.client_id = this.clientSearchByDoc.id
          this.clientSearchByDoc = this.clientSearchByDoc.document_number + '  (' + this.clientSearchByDoc.name + ')'
          this.clientSelected = true
          document.getElementById('inputProduct').focus()
        } else { // client id  == -1 , we create a new cliente with doc
          document.getElementById('createButton').click()
          this.client = { errors: {} }
          if (/\D/.test(this.clientSearchByDoc.new_client_doc)) {  // Check is not number
            this.client.name = this.clientSearchByDoc.new_client_doc
          } else {
            this.client.document_number = this.clientSearchByDoc.new_client_doc
          }
        }
      }
    },

    setDocumentTypeSelected () {
      if (this.documentTypeSearch && this.documentTypeSearch.id) {
        this.referralGuide.document_type = this.documentTypeSearch.id
      } else {
        this.referralGuide.document_type = undefined
      }
    },

    setClientDocumentTypeSelected () {
      if (this.clientDocumentTypeSearch && this.clientDocumentTypeSearch.id) {
        this.client.document_type = this.clientDocumentTypeSearch.id
        this.maxLength = (this.clientDocumentTypeSearch.name === 'DNI') ? 8 : 11
        if (this.client.document_number) {
          this.client.document_number = this.client.document_number.slice(0, this.maxLength)
        }
      } else {
        this.client.document_type = undefined
        this.maxLength = 11
      }
    },

    setDocumentType () {
      if (this.referralGuide.document_type && this.documentTypeList) {
        this.documentTypeSearch = {
          'id': this.referralGuide.document_type,
          'name': this.documentTypeList.find(x => x.id === this.referralGuide.document_type).name
        }
      }
    },

    setCategorySelected () {
      if (this.categorySearch && this.categorySearch.id) {
        this.referralGuide.category = this.categorySearch.id
      } else {
        this.referralGuide.category = undefined
      }
    },

    setCategory () {
      if (this.referralGuide.category && this.categoryList) {
        this.categorySearch = {
          'id': this.referralGuide.category,
          'name': this.categoryList.find(x => x.id === this.referralGuide.category).name
        }
      }
    },

    fetchProductData (query, done) {
      const apiUrl = '/inventory/api/product/'
      const params = {
        params: { 'code__icontains': query, 'name__icontains': query, 'condition': 'OR' }
      }
      this.$http.get(apiUrl, params).then(response => {
        done(response.body.results)
      })
    },

    setProductSelected () {
      if (this.productSearch.id) {
        const input = 1
        let unitPrice = this.referralGuide.category === input ? (this.productSearch.buy_price || '') : this.productSearch.selling_price

        this.newItem = new ProductItem(this.productSearch, this.referralGuide, unitPrice)
        document.getElementById('newItemQuantity').focus()

        if (this.checkCurrenQuantity(this.newItem) > 0) {
          this.alerts.newItem = [`Ya agrego antes '${this.newItem.product.name}' a su orden`]
        }
      } else {
        this.alerts.newItem = undefined
        this.errors.newItem = undefined
        this.newItem = {}
      }
    },

    selectNumber () {
      // HACK: This small time will give time to the model to set the default quantity.
      let isInputActive
      let newItemQuantityInput = document.getElementById('newItemQuantity')
      let id = setInterval(() => {
        isInputActive = document.activeElement === newItemQuantityInput

        if (!newItemQuantityInput || !isInputActive) {
          return clearInterval(id)
        }
        if (newItemQuantityInput.value) {
          clearInterval(id)
          newItemQuantityInput.select()
        }
      }, 50)
    },

    setProductPriceFocus () {
      document.getElementById('newItemUnitPrice').focus()
    },

    fetchDocumentTypeList () {
      const apiUrl = `/inventory/api/document-type/`

      this.$http.get(apiUrl).then(response => {
        this.documentTypeList = response.body
        this.setDocumentType()
      })
    },

    fetchCategoryList (query, done) {
      const apiUrl = `/inventory/api/category/`

      if (this.categoryList.length) {
        if (done) {
          done(this.matchCategory(query))
        } else if (this.$route.name === 'referral_guides_add') {
          this.setCategoryDefault()
          this.setFocus()
        }
      } else {
        Promise.all([this.$http.get(apiUrl)]).then(values => {
          this.categoryList = values[0].body
          if (done) { done(this.matchCategory(query)) }
          if (this.$route.name === 'referral_guides_add') {
            this.setCategoryDefault()
            this.setFocus()
          }
        })
      }
    },

    setCategoryDefault () {
      this.categorySearch = this.categoryList.find((item) => item.id === INPUT)
    },

    matchCategory (query = '') {
      return this.categoryList.filter(obj => {
        return obj.name.toLowerCase().includes(query.toLowerCase())
      })
    },

    addNewItem () {
      const input = 1
      if (!this.newItem.isValid) { return }
      this.alerts.newItem = []
      this.errors.newItem = []

      if (this.referralGuide.items === undefined || this.referralGuide.items === null) {
        this.referralGuide.items = []
      }

      if (!this.newItem.unit_price) {
        document.getElementById('newItemUnitPrice').focus()
        this.newItem.unit_price = null
        this.errors.newItem.push(`Debe colocar un precio para '${this.newItem.product.name}' para completar su petición.`)
      }

      if (this.referralGuide.category !== input) {
        var current = this.checkCurrenQuantity(this.newItem)
        var stock = this.newItem.product.quantity - current

        if (stock < this.newItem.quantity) {
          document.getElementById('newItemQuantity').focus()
          this.newItem.quantity = null
          this.errors.newItem.push(`No hay suficientes existencias de '${this.newItem.product.name}' para completar su petición. ` +
                        (current > 0 ? `Tiene ${current} en su orden. ` : '') + `Quedan ${stock} existencias en stock.`)
        }
      }

      if (this.errors.newItem.length === 0) {
        this.referralGuide.items.push(this.newItem)
        this.newItem = {}
        document.getElementById('inputProduct').value = '' // to refesh from DOM
        document.getElementById('inputProduct').focus()
      }
    },

    checkCurrenQuantity (item) {
      var array = this.referralGuide.items
      var query = item.product.id
      var current = 0
      if (item) {
        current = array.reduce((n, obj) => {
          if (obj.product.id === query && obj.id === undefined) {
            return n + Number(obj.quantity)
          } else {
            return n
          }
        }, 0)
      }
      return current
    },

    removeItem (index) {
      this.referralGuide.items.splice(index, 1)
    },

    fetchReferralGuide () {
      const apiUrl = `/inventory/api/referral-guide/${this.referralGuideId}`

      this.$http.get(apiUrl).then(response => {
        this.referralGuide = response.body
        this.referralGuide._type = 'referral_guide'
        this.referralGuide.items = ProductItem.createFromList(this.referralGuide)
        if (this.referralGuide.client) {
          this.referralGuide.client_id = this.referralGuide.client.id
          this.clientSelected = true
          this.clientSearchByDoc = this.referralGuide.client.document_number + '  (' + this.referralGuide.client.name + ')'
        }
        this.setCategory()
        this.setDocumentType()
        this.date = moment(this.referralGuide.date).format('YYYY-MM-DD')
        this.time = moment(this.referralGuide.date).toDate()
      })
    },

    createReferralGuide () {
      const apiUrl = `/inventory/api/referral-guide/`

      this.referralGuide.business = Cookies.get('business_pk')
      this.referralGuide.date = this.parseFormatedDateTime()

      this.disableSubmit()

      this.$http.post(apiUrl, this.referralGuide).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.isSaved = true
        this.referralGuideId = response.body.id
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    updateReferralGuide () {
      this.referralGuide.date = this.parseFormatedDateTime()

      const apiUrl = `/inventory/api/referral-guide/${this.referralGuideId}/`

      this.disableSubmit()

      this.$http.put(apiUrl, this.referralGuide).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$router.push('/referral-guides')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    parseFormatedDateTime () {
      if (!this.date || !this.time) {
        this.date = moment().format('YYYY-MM-DD')
        this.time = moment().toDate()
      }
      var datetimeStr = this.date + ' ' + moment(this.time).format('hh:mm: A')
      var datetime = moment(datetimeStr, 'YYYY-MM-DD hh:mm: A', true)

      return datetime.format('YYYY-MM-DDTHH:mm:ss.SSSSSSZ')
    },

    acceptItemChanges (item) {
      this.errors.itemChanges = undefined
      if (this.itemToEdit.isValid) {
        let current = this.checkCurrenQuantity(item) - item.quantity
        let stock = item.product.quantity - current

        if (this.referralGuide.category === 1 || stock >= this.itemToEdit.quantity) {
          item.quantity = this.itemToEdit.quantity
          item.unit_price = this.itemToEdit.unit_price
          this.itemToEditIndex = -1
        } else {
          this.itemToEdit.quantity = undefined
          this.errors.itemChanges = [ (current > 0 ? `Tiene  ${current} en su orden. ` : '') + `\n Hay ${stock} disponibles.` ]
        }
      }
    },

    enableItemEdition (item, index) {
      this.errors.itemChanges = undefined
      this.itemToEdit = Object.assign(Object.create(Object.getPrototypeOf(item)), item)
      this.itemToEditIndex = index
    }
  }
}
