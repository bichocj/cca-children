'use strict'

import { formsMixin } from '../mixins/forms-mixin'

const EXPENSE = 2

export default {
  name: 'MovementsAddView',
  props: ['movementId', 'modalId'],
  template: '#movements-add-view',
  mixins: [formsMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      typeList: [],
      descriptionList: [],
      errors: {},
      movement: {},
      description: {},
      typeSearch: '',
      descriptionSearch: '',
      descriptionSelected: false,
      formMethod: undefined,
      showDescriptionForm: false,
      inputFlow: [
        'inputDescription',
        'inputType',
        'inputAmount',
        'saveBtn'
      ]
    }
  },

  watch: {
    '$route.name' () {
      this.routeHandler()
    },

    descriptionSearch: {
      handler () {
        this.setDescriptionSearch()
      },
      deep: true
    },

    typeSearch: {
      handler () {
        this.setTypeSearch()
      },
      deep: true
    },

    movementId () {
      this.routeHandler()
    }
  },

  mounted () {
    this.routeHandler()
    $(`#${this.modalId}`).on('hide.bs.modal', () => {
      this.$emit('clearMovementId')
      this.resetData()
    })

    $(`#${this.modalId}`).on('show.bs.modal', () => {
      this.routeHandler()
    })
  },

  methods: {
    routeHandler () {
      if (['movements'].includes(this.$route.name)) {
        this.resetData()
        this.resetMovement()
        this.fetchTypeList()

        if (this.movementId) {
          this.fetchMovement()
          this.formMethod = this.updateMovement
        } else {
          this.formMethod = this.createMovement
          this.setFocus()
        }
      }
    },

    createMovement () {
      if (!this.showDescriptionForm) {
        this.saveMovement()
      } else {
        this.createDescription(() => { this.saveMovement() })
      }
    },

    updateMovement () {
      if (!this.showDescriptionForm) {
        this.putMovement()
      } else {
        this.createDescription(() => { this.putMovement() })
      }
    },

    saveMovement () {
      const apiUrl = '/movements/api/movements/'

      this.disableSubmit('saveBtn')

      this.$http.post(apiUrl, this.movement).then(response => {
        this.errors = {}
        this.enableSubmit('saveBtn')
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit('saveBtn')
      })
    },

    putMovement () {
      const apiUrl = `/movements/api/movements/${this.movementId}/`

      this.disableSubmit('saveBtn')

      this.$http.put(apiUrl, this.movement).then(response => {
        this.enableSubmit('saveBtn')
        this.$emit('save')
        $(`#${this.modalId}`).modal('hide')
      }, response => {
        this.errors = response.body
        this.enableSubmit('saveBtn')
      })
    },

    createDescription (callback = () => {}) {
      const apiUrl = '/movements/api/descriptions/'
      this.$http.post(apiUrl, this.description).then(response => {
        this.description = response.body
        this.errors = {}
        this.showDescriptionForm = false
        this.descriptionSelected = true
        this.movement.description_id = this.description.id
        this.descriptionSearch = this.description.name
        callback()
      }, response => {
        this.errors = response.body
      })
    },

    fetchTypeList () {
      const apiUrl = '/movements/api/types/'
      Promise.all([this.$http.get(apiUrl)]).then(response => {
        this.typeList = response[0].body
        if (this.$route.name === 'movements_add') {
          this.setTypeDefault()
          this.setFocus()
        }
      })
    },

    fetchDescriptionData (query, done) {
      const apiUrl = `/movements/api/descriptions/`

      const params = {
        params: { 'name__icontains': query }
      }

      const newItem = { 'name': `${query} (Nueva descripción)`, originalName: query, 'id': -1 }
      Promise.all([this.$http.get(apiUrl, params)]).then(values => {
        let response = values[0]
        response.body.push(newItem)
        this.descriptionList = response.body
        done(this.descriptionList)
      })
    },

    setDescriptionSearch () {
      if (this.descriptionSearch && this.descriptionSearch.id) {
        if (this.descriptionSearch.id > 0) {
          this.movement.description_id = this.descriptionSearch.id
          this.descriptionSelected = true
        } else {
          this.showDescriptionForm = true
          this.description.name = this.descriptionSearch.originalName
        }

        if (this.movement.type) {
          document.getElementById('inputAmount').focus()
        } else {
          document.getElementById('inputType').focus()
        }
      }
    },

    setType () {
      if (this.movement.type && this.typeList) {
        this.typeSearch = this.typeList.find(x => x.id === this.movement.type)
      }
    },

    setTypeSearch () {
      if (this.typeSearch && this.typeSearch.id) {
        this.movement.type = this.typeSearch.id
        if (document.getElementById('inputDescription').value.length) {
          document.getElementById('inputAmount').focus()
        }
      } else {
        this.movement.type = undefined
      }
    },

    setTypeDefault () {
      this.typeSearch = this.typeList.find((item) => item.id === EXPENSE)
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    fetchMovement () {
      const apiUrl = `/movements/api/movements/${this.movementId}/`
      this.$http.get(apiUrl).then(response => {
        this.movement = response.body
        this.movement.description_id = this.movement.description.id
        this.descriptionSearch = this.movement.description
        this.setType()
      })
    },

    resetMovement () {
      this.movement.description = undefined
      this.descriptionSearch = ''
      this.descriptionSelected = false
      this.errors = {}
    },

    setFocus () {
      document.getElementById('inputDescription').focus()
    },

    goForward (e) {
      if (e.target.value) {
        document.getElementById('saveBtn').focus()
      }
    }
  }
}
