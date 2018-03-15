import { debounce } from 'lodash'

export default {
  name: 'PettyCashSummaryView',
  template: '#petty-cash-summary-view',
  delimiters: ['[[', ']]'],

  data () {
    return {
      summary: { petty_cash: {} }
    }
  },

  watch: {
    '$route.name' () {
      if (this.$route.name === 'petty_cash_summary') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchData()
  },

  methods: {
    fetchData: debounce(function () { this.fetchSummary() }, 500, {'leading': true}),

    fetchSummary () {
      const apiUrl = `/petty-cash/api/petty-cash/${this.$route.params.id}/summary/`

      this.$http.get(apiUrl).then(response => {
        this.summary = response.body
      })
    },

    closePettyCash () {
      const apiUrl = `/petty-cash/api/petty-cash/${this.summary.petty_cash.id}/`

      this.$http.delete(apiUrl).then(response => {
        this.summary.petty_cash.is_active = false
      })
    }

  }
}
