'use strict'

import { formsMixin } from '../mixins/forms-mixin'

const moment = require('moment')

export default {
  name: 'PettyCashAddView',
  template: '#petty-cash-add-view',
  mixins: [formsMixin],
  props: ['pettyCashId', 'modalId'],

  delimiters: ['[[', ']]'],

  data () {
    return {
      pettyCash: {
        number: -1
      },
      errors: {},
      formMethod: undefined,
      date: moment().format('YYYY-MM-DD'),
      time: moment().toDate(),
      maxLength: 11,
      inputFlow: [
        'inputAmount',
        'inputSubmit'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    pettyCashId () {
      this.routeHandler()
    }

  },

  mounted () {
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearPettyCashId')
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
      if (['petty_cash'].includes(this.$route.name)) {
        this.fetchPettyCashCounter()
        this.formMethod = this.createPettyCash
      }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    setFocus () {
      document.getElementById('inputAmount').focus()
    },

    fetchPettyCashCounter () {
      const apiUrl = '/petty-cash/api/petty-cash-number-counter/'
      this.$http.get(apiUrl).then(response => {
        this.pettyCash.number = response.body[0].count + 1
      })
    },

    createPettyCash () {
      const apiUrl = '/petty-cash/api/petty-cash/'

      this.disableSubmit()

      this.$http.post(apiUrl, this.pettyCash).then(response => {
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
