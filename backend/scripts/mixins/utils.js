export const filterMixin = {
  data () {
    return {
      pagination: {
        numbers: []
      },
      page: 1,
      filters: {},
      filterErrors: {},
      advancedNumericFilters: {},
      sort: ''
    }
  },

  computed: {
    lastPage () {
      return (this.pagination.numbers.length &&
        this.pagination.numbers[this.pagination.numbers.length - 1]) || 1
    }
  },

  watch: {
    filters: {
      handler () {
        this.fetchData()
        this.page = 1
      },
      deep: true
    },

    sort () {
      this.fetchData()
      this.page = 1
    },

    advancedNumericFilters: {
      handler () {
        for (let filterName in this.advancedNumericFilters) {
          let newFilters = this.strToNumberQuery(filterName, this.advancedNumericFilters[filterName])
          if (newFilters) {
            Object.assign(this.filters, newFilters)
            this.filterErrors[filterName] = false
            this.fetchData()
            this.page = 1
          } else {
            this.filterErrors[filterName] = true
          }
        }
      },
      deep: true
    }
  },

  methods: {
    setPage (page) {
      // Look for last page if exists
      if (page < 1) { page = 1 }
      if (page > this.lastPage) { page = this.lastPage }
      this.page = page
      window.scrollTo(0, 0)
      this.fetchData()
    },

    strToNumberQuery (name, input) {
      const filters = {}
      filters[`${name}__gt`] = ''
      filters[`${name}__lt`] = ''
      filters[`${name}__lte`] = ''
      filters[`${name}__gte`] = ''
      filters[`${name}`] = ''

      const matchDict = {
        '>': '__gt',
        '<': '__lt',
        '>=': '__gte',
        '<=': '__lte',
        '=': ''
      }

      const regexpFilterSign = /^(>|<|=|>=|<=)?(\d+)$/
      const strFilters = input.split('&').filter(value => value)

      for (let filter of strFilters) {
        let match = regexpFilterSign.exec(filter)

        // Check if all filters are valid
        if (!match) {
          return false
        } else {
          let sign = matchDict[match['1'] || '=']

          // Check if the filter already exists. If it does, then is invalid.
          if (filters[`${name}${sign}`]) {
            return false
          } else {
            filters[`${name}${sign}`] = match[2]
          }
        }
      }

      return filters
    },

    resetFilters () {
      this.filters = {}
      this.filterErrors = {}
      this.advancedNumericFilters = {}
      this.sort = ''
    },

    setOrder (field) {
      if (field === this.sort) {
        this.sort = `-${this.sort}`
      } else if (`-${field}` === `${this.sort}`) {
        this.sort = ''
      } else {
        this.sort = field
      }
    },

    setPaginationData (response) {
      this.pagination.next = response.body.next
      this.pagination.previous = response.body.previous
      this.pagination.numbers = response.body.numbers
    },

    getSortIcon (field) {
      if (field === this.sort) {
        return 'fa-sort-up'
      } else if (`-${field}` === `${this.sort}`) {
        return 'fa-sort-down'
      } else {
        return 'fa-sort'
      }
    },

    fetchData () {
      console.warn('fetchData function must be implemented in component.')
    },

    objectToQuerystring (obj) {
      return Object.keys(obj).reduce((str, key, i) => {
        var delimiter, val
        delimiter = (i === 0) ? '?' : '&'
        key = encodeURIComponent(key)
        val = encodeURIComponent(obj[key])
        return [str, delimiter, key, '=', val].join('')
      }, '')
    }
  }
}
