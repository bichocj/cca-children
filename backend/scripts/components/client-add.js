'use strict'

import Cookies from 'js-cookie'
import { formsMixin } from '../mixins/forms-mixin'

export default {
  name: 'clientAddView',
  template: '#client-add-view',
  props: ['clientId', 'modalId'],
  mixins: [formsMixin],

  delimiters: ['[[', ']]'],

  data () {
    return {
      documentTypeList: [],
      client: {},
      errors: {},
      documentTypeSearch: '',
      formMethod: undefined,
      maxLength: 11,
      inputFlow: [
        'inputName',
        'inputDocumentType',
        'inputDocumentNumber',
        'inputAddress',
        'inputPhone',
        'inputEmail',
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
        this.setDocumentTypeSearch()
      },
      deep: true
    },

    clientId () {
      this.routeHandler()
    }

  },

  mounted () {
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearClientId')
      this.resetData()
    })

    $(`#${this.modalId}`).on('show.bs.modal', () => {
      this.routeHandler()
    })
  },

  methods: {
    routeHandler () {
      if (['clients'].includes(this.$route.name)) {
        this.resetData()
        this.fetchDocumentTypeList()

        if (this.clientId) {
          this.fetchClient()
          this.formMethod = this.updateClient
        } else {
          this.setFocus()
          this.formMethod = this.createClient
        }
      }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    setFocus () {
      document.getElementById('inputName').focus()
    },

    fetchDocumentTypeList () {
      const apiUrl = `/businesses/api/document-type/`

      this.$http.get(apiUrl).then(response => {
        this.documentTypeList = response.body
        this.setDocumentType()
      })
    },

    setDocumentType () {
      if (this.client.document_type && this.documentTypeList) {
        this.documentTypeSearch = {
          'id': this.client.document_type,
          'name': this.documentTypeList.find(x => x.id === this.client.document_type).name
        }
      }
    },

    setDocumentTypeSearch () {
      if (this.documentTypeSearch && this.documentTypeSearch.id) {
        this.client.document_type = this.documentTypeSearch.id
        this.maxLength = (this.documentTypeSearch.name === 'DNI') ? 8 : 11
        if (this.client.document_number) {
          this.client.document_number = this.client.document_number.slice(0, this.maxLength)
        }
      } else {
        this.client.document_type = undefined
        this.maxLength = 11
      }
    },

    fetchClient () {
      const apiUrl = `/businesses/api/client/${this.clientId}`

      this.$http.get(apiUrl).then(response => {
        this.client = response.body
        this.setDocumentType()
      })
    },

    createClient () {
      const apiUrl = `/businesses/api/client/`

      this.client.business = Cookies.get('business_pk')

      this.disableSubmit()

      this.$http.post(apiUrl, this.client).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    },

    updateClient () {
      const apiUrl = `/businesses/api/client/${this.clientId}/`

      this.disableSubmit()

      this.$http.put(apiUrl, this.client).then(response => {
        this.errors = {}
        this.enableSubmit()
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit()
      })
    }
  }
}
