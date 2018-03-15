export const formsMixin = {
  methods: {
    inputFormHandler (e) {
      if (e.keyCode === 13) {
        if (e.shiftKey) {
          e.preventDefault()
          this.formMethod()
        } else {
          const inputId = e.target.id
          const index = this.inputFlow.indexOf(inputId)
          if (index === this.inputFlow.length - 1) {
            e.preventDefault()
          } else {
            window.document.getElementById(this.inputFlow[index + 1]).focus()
          }
        }
      }
    },

    focusEsc (nextInput) {
      window.document.getElementById(nextInput).focus()
    },

    checkTest (test, callback, $event) {
      // execute callback if pass the test
      if (test) { callback($event) }
    },

    resetData () {
      Object.assign(this.$data, this.$options.data())
    },

    disableSubmit (inputId = 'inputSubmit') {
      document.getElementById(inputId).style.pointerEvents = 'none'
      document.getElementById(inputId).style.opacity = 0.6
    },

    enableSubmit (inputId = 'inputSubmit') {
      document.getElementById(inputId).style.pointerEvents = 'auto'
      document.getElementById(inputId).style.opacity = 1
    },
  }

}
