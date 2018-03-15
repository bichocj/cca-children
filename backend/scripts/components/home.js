import { Chart } from 'chart.js'
import { debounce } from 'lodash'

const moment = require('moment')
const today = moment().toDate()
const fromDate = moment().subtract(30, 'days').toDate()

today.setHours(23, 59, 59, 999)
fromDate.setHours(0, 0, 0, 0)


export default {
  name: 'homeView',
  template: '#home-view',
  mixins: [],
  delimiters: ['[[', ']]'],

  data () {
    return {
      salesChart: {
        labels: [],
        dataset: []
      },
      filters: {
        'date__lte': today.toISOString(),
        'date__gte': fromDate.toISOString()
      },
      loaded: {
        'salesStatistics': false,
        'higherExpenses': false
      }
    }
  },

  watch: { // to reload data after adding a new obj - Improve this
    '$route.name' () {
      if (this.$route.name === 'home') {
        this.fetchData()
      }
    }
  },

  mounted () {
    this.fetchData()
  },

  methods: {
    fetchData () {
      this.getChartData()
      this.getHigherExpensesData()
    },

    getChartData () {
      const parsedFilters = $.extend({}, this.filters)

      const apiUrl = '/stats/api/sales-statistics/'
      const params = {
        params: parsedFilters
      }

      this.$http.get(apiUrl, params).then(response => {
        this.loaded.salesStatistics = true
        this.salesChart.labels = response.body.labels
        this.salesChart.dataset = response.body.dataset

        let ctx = document.getElementById('sales-chart').getContext('2d')
        let salesChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.salesChart.labels,
            datasets: [{
              label: 'Número de ventas',
              data: this.salesChart.dataset,
              backgroundColor: 'hsla(211, 100%, 90%, 0.9)'
            }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero:true
                }
              }]
            }
          }
        })
      })
    },

    getHigherExpensesData () {
      const apiUrl = '/stats/api/higher-expenses/'
      this.$http.get(apiUrl).then(response => {
        this.loaded.higherExpenses = true
        let labels = response.body.labels
        let dataset = response.body.dataset
        let ctx = document.getElementById('higher-expenses').getContext('2d')
        let _salesChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Gasto total en soles',
              data: dataset,
              backgroundColor: 'hsla(211, 100%, 90%, 0.9)'
            }]
          },
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
        })
      })
    }
  },
  computed: {
    isLoaded () {
      return this.loaded.salesStatistics && this.loaded.salesStatistics
    },
    enoughData () {
      return this.salesChart.dataset.length > 1
    }
  }
}
