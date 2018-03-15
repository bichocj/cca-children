import { businessesApiMixin } from '../mixins/businesses-mixin'
import { formsMixin } from '../mixins/forms-mixin'
import { featuresMixin } from '../mixins/features-mixin'
import ProductItem from '../models/product-item'

import Cookies from 'js-cookie'

const moment = require('moment')
const BOLETA = 2

export default {
  name: 'salesAddView',
  template: '#sales-add-view',
  mixins: [businessesApiMixin, formsMixin, featuresMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      invoice: {
        _type: 'invoice',
        document_type: BOLETA,
        items: [],
        cash: undefined,
        change: 0.00,
        total: 0.00
      },
      date: moment().format('YYYY-MM-DD'),
      time: moment().toDate(),
      errors: {},
      currentPettyCash: {},
      alerts: {},
      invoiceId: undefined,
      formMethod: undefined,
      productSearchList: [],
      productSearch: '',
      itemToEdit: {},
      itemToEditIndex: undefined,
      maxLength: 11,
      newItem: {},
      clientSearchByDoc: '',
      documentTypeList: [],
      documentTypeSearch: '',
      clientDocumentTypeSearch: '',
      documentNumberCounters: [],
      client: { errors: {} },
      clientSelected: false,
      clientLoading: false,
      isSaved: false,
      showSalesForm: false,
      inputFlow: [
        'inputDocumentType',
        'inputClientDoc',
        'inputClientName',
        'inputClientDocumentType',
        'inputClienDocumentNumber',
        'inputClientAddress',
        'inputClientPhone',
        'inputClientEmail',
        'inputClientSubmit',
        'inputProduct',
        'inputCash',
        'inputSubmit'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    documentTypeSearch: {
      handler () {
        this.setDocumentTypeSelected()
      },
      deep: true
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

    clientDocumentTypeSearch: {
      handler () {
        this.setClientDocumentTypeSelected()
      },
      deep: true
    },

    'invoice.cash' () {
      if (this.invoice.total) {
        this.invoice.change = this.invoice.cash > 0 ? (this.invoice.cash - this.invoice.total) : 0.00
      }
    },

    'invoice.total' () {
      if (this.invoice.total) {
        this.invoice.change = this.invoice.cash > 0 ? (this.invoice.cash - this.invoice.total) : 0.00
      }
    },

    itemToEditIndex () {
      if (this.itemToEditIndex === -1) {
        this.updateTotal()
      }
    }
  },

  mounted () {
    this.routeHandler()
    this.setClientFocus()
  },

  methods: {
    routeHandler () {
      if (['sales_add', 'sales_edit'].includes(this.$route.name)) {
        this.resetData()
        this.fetchDocumentTypeList()
        this.fetchClientDocumentTypeList()

        if (this.$route.params.id) {
          this.resetDocumentType()
          this.invoiceId = this.$route.params.id
          this.fetchInvoice()
          this.formMethod = this.updateInvoice
        } else {
          if (this.hasPettyCashFeature) { this.checkCurrentPettyCash() }
          this.fethDocumentTypeCounters()
          this.formMethod = this.createInvoice
        }
      }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    setFocus () {
      // HACK: This small time will give time to the model to set attributes.
      let inputProduct
      let inSalesAddView

      let id = setInterval(() => {
        inputProduct = document.getElementById('inputProduct')
        inSalesAddView = this.$route.name === 'sales_add'

        if (!inSalesAddView) { return clearInterval(id) }
        if (inputProduct) {
          clearInterval(id)
          inputProduct.focus()
        }
      }, 50)
    },

    setClientFocus () {
      $('#createClientModal').on('shown.bs.modal', () => {
        $('#inputClientName').focus()
      })
    },

    getDocumentNumber () {
      let number = '-'
      if (this.invoiceId) {
        number = this.invoice.document_number.padStart(6, '0')
      }
      return number
    },

    resetClient () {
      this.client = { errors: {} }
      this.clientSelected = false
      this.invoice.client_id = undefined
      this.clientSearchByDoc = ''
      this.clientDocumentTypeSearch = ''
      document.getElementById('inputClientDocumentType').value = ''
    },

    fethDocumentTypeCounters () {
      const apiUrl = '/sales/api/document-number-counter/'
      this.$http.get(apiUrl).then(response => {
        this.documentNumberCounters = response.body
        this.setDocumentTypeDefault()
      })
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
        this.invoice.client_id = this.client.id
        this.clientSelected = true
        this.clientSearchByDoc = this.client.document_number + '  (' + this.client.name + ')'
        document.getElementById('closeClientModal').click()
        document.getElementById('inputProduct').focus()
      }, response => {
        this.client.errors = response.body
      })
    },

    setClientDocSelected () {
      if (this.clientSearchByDoc && this.clientSearchByDoc.id) { //  check if a client has been selected
        if (this.clientSearchByDoc.id > 0) { // client selected exist
          this.invoice.client_id = this.clientSearchByDoc.id
          this.clientSearchByDoc = this.clientSearchByDoc.document_number + '  (' + this.clientSearchByDoc.name + ')'
          this.clientSelected = true
          document.getElementById('inputProduct').focus()
          this.errors.client_id = undefined
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

    fetchProductData (query, done) {
      const apiUrl = '/inventory/api/product/'
      const params = {
        params: { 'code__icontains': query, 'name__icontains': query, 'condition': 'OR' }
      }
      this.$http.get(apiUrl, params).then(response => {
        done(response.body.results)
      })
    },

    setDocumentTypeDefault () {
      this.documentTypeSearch = (this.documentTypeList).filter((item) => item['id'] === BOLETA)[0]
    },

    fetchDocumentTypeList () {
      const apiUrl = `/inventory/api/document-type/`
      this.$http.get(apiUrl).then(response => {
        this.documentTypeList = response.body
        if (this.$route.name === 'sales_add') { this.setFocus() }
      })
    },

    matchString (query = '') {
      return this.documentTypeList.filter(obj => {
        return obj.name.toLowerCase().includes(query.toLowerCase())
      })
    },

    setDocumentType () {
      if (this.invoice.document_type && this.documentTypeList) {
        this.documentTypeSearch = this.documentTypeList.find(x => x.id === this.invoice.document_type)
      }
    },

    setDocumentTypeSelected () {
      if (this.documentTypeSearch && this.documentTypeSearch.id) {
        this.invoice.document_type = this.documentTypeSearch.id
        let documentTypeSearchId = this.documentTypeSearch.id

        if (this.$route.name !== 'sales_edit') {
          let elem = this.documentNumberCounters.filter(item => { return item.document_type === documentTypeSearchId })[0]
          this.invoice.document_number = elem.count + 1
        }

        delete this.errors.document_type
        delete this.errors.document_number
      } else {
        this.invoice.document_number = '-'
      }
      this.computeTax()
    },

    resetDocumentType () {
      document.getElementById('inputDocumentType').value = ''
    },

    setProductSelected () {
      if (this.productSearch.id) {
        this.newItem = new ProductItem(this.productSearch, this.invoice, this.productSearch.selling_price)
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

    setProductPriceFocus () {
      document.getElementById('newItemUnitPrice').focus()
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

    addNewItem () {
      if (!this.newItem.isValid) { return }
      this.alerts.newItem = []
      this.errors.newItem = []

      if (this.invoice.items === undefined || this.invoice.items === null) {
        this.invoice.items = []
      }
      var current = this.checkCurrenQuantity(this.newItem)
      var stock = this.newItem.product.quantity - current
      if (!this.hasReferralGuideFeature || stock >= this.newItem.quantity) {
        this.invoice.items.push(this.newItem)
        this.newItem = {}
        document.getElementById('inputProduct').value = '' // to refesh from DOM
        document.getElementById('inputProduct').focus()
        this.updateTotal()
      } else {
        document.getElementById('newItemQuantity').focus()
        this.newItem.quantity = null
        this.errors.newItem = [ `No hay suficientes existencias de  '${this.newItem.product.name}' para completar su petición. ` +
                      (current > 0 ? `Tiene  ${current} en su orden. ` : '') + `Quedan ${stock} existencias en stock.` ]
      }
    },

    checkCurrenQuantity (item) {
      var array = this.invoice.items
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

    updateTotal () {
      let subtotal = 0
      let totalTax = 0
      let total = 0

      this.invoice.items.map(item => {
        subtotal += item.subtotal
        totalTax += item.tax
        total += item.total
      })

      this.invoice.subtotal = Math.round(subtotal * 100) / 100
      this.invoice.total_tax = Math.round(totalTax * 100) / 100
      this.invoice.total = Math.round(total * 100) / 100
    },

    fetchInvoice () {
      const apiUrl = `/sales/api/invoice/${this.invoiceId}`

      this.$http.get(apiUrl).then(response => {
        this.invoice = response.body
        this.invoice._type = 'invoice'
        this.invoice.items = ProductItem.createFromList(this.invoice)
        this.clientSelected = true
        if (this.invoice.client) {
          this.invoice.client_id = this.invoice.client.id
          this.clientSearchByDoc = this.invoice.client.document_number + '  (' + this.invoice.client.name + ')'
        }
        this.date = moment(this.invoice.date).format('YYYY-MM-DD')
        this.time = moment(this.invoice.date).toDate()
        this.setDocumentType()
      })
    },

    createInvoice () {
      if (!this.checkValidCash()) { return }

      const apiUrl = `/sales/api/invoice/`
      this.invoice.business = Cookies.get('business_pk')
      this.invoice.client = this.client.id
      this.invoice.date = this.parseFormatedDateTime()
      this.invoice.is_active = true

      this.disableSubmit()

      this.$http.post(apiUrl, this.invoice).then(response => {
        this.enableSubmit()
        this.isSaved = true
        this.errors = {}
        this.invoiceId = response.body.id
        this.invoice.id = response.body.id
        this.invoice.document_number = response.body.document_number
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    removeItem (index) {
      this.invoice.items.splice(index, 1)
      this.updateTotal()
    },

    updateInvoice () {
      if (!this.checkValidCash()) { return }

      const apiUrl = `/sales/api/invoice/${this.invoiceId}/`
      this.invoice.date = this.parseFormatedDateTime()
      this.invoice.items.forEach(item => { item.product_id = item.product.id })

      this.disableSubmit()

      this.$http.put(apiUrl, this.invoice).then(response => {
        this.enableSubmit()
        this.$router.push('/sales')
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

    decode (htmlEncode) {
      return $('<textarea></textarea>').html(htmlEncode).text()
    },

    printDiv (divid) {
      let contents = document.getElementById(divid).innerHTML
      let frame1 = document.createElement('iframe')
      frame1.name = 'frame1'
      frame1.style.position = 'absolute'
      frame1.style.top = '-1000000px'
      frame1.style.left = '0px'
      frame1.style.width = '300px'
      document.body.appendChild(frame1)
      let frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument
      frameDoc.document.open()
      frameDoc.document.write('<html><head><title>TICKET</title>')
      frameDoc.document.write('<link rel="stylesheet" href="/static/core/css/print.css" type="text/css" />')
      frameDoc.document.write('</head><body>')
      frameDoc.document.write(contents)
      frameDoc.document.write('</body></html>')

      frameDoc.document.close()
      setTimeout(() => {
        window.frames['frame1'].focus()
        window.frames['frame1'].print()
        document.body.removeChild(frame1)
      }, 500)
      return false
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

    acceptItemChanges (item) {
      this.errors.itemChanges = undefined

      if (this.itemToEdit.isValid) {
        let current = this.checkCurrenQuantity(item) - item.quantity
        let stock = item.product.quantity - current

        if (!this.hasReferralGuideFeature || stock >= this.itemToEdit.quantity) {
          item.quantity = this.itemToEdit.quantity
          item.unit_price = this.itemToEdit.unit_price
          this.itemToEditIndex = -1
        } else {
          this.itemToEdit.quantity = undefined
          this.errors.itemChanges = [ (current > 0 ? `Tiene  ${current} en su orden. ` : '') + `Hay ${stock} disponibles.` ]
        }
      }
    },

    enableItemEdition (item, index) {
      this.errors.itemChanges = undefined
      this.itemToEdit = Object.assign(Object.create(Object.getPrototypeOf(item)), item)
      this.itemToEditIndex = index
    },

    checkValidCash () {
      if (parseFloat(this.invoice.cash) < this.invoice.total && this.invoice.cash !== 0) {
        this.errors = { cash: ['El monto debe ser mayor o igual al total'] }
        return false
      }

      delete this.errors.cash
      return true
    },

    computeTax () {
      this.invoice.items.map(item => {
        item.document_type = this.invoice.document_type
      })
      this.updateTotal()
    },

    checkCurrentPettyCash () {
      this.currentPettyCash = {'exists': true}
      this.setFocus()
    }
  },

  computed: {
    documentNumber () {
      let number = '-'
      if (this.invoiceId && this.invoice.document_number) {
        number = this.invoice.document_number.padStart(6, '0')
      }
      return number
    },

    documentTypeDisplay () {
      return this.documentTypeSearch ? this.documentTypeSearch.name : ''
    }
  },

  filters: {
    time (value) {
      return moment(value).format('h:mm a')
    }
  }
}
