export const inventoryApiMixin = {
  data () {
    return {
      unitList: [],
      categoryList: [],
      documentTypeList: [],
      unitCategoryList: []
    }
  },

  methods: {
    fetchUnitList (query, done = () => {}) {
      const apiUrl = '/inventory/api/units/'

      this.$http.get(apiUrl).then(response => {
        this.unitList = response.body
        done(response.body)
      })
    },

    fetchUnitCategoriesList (query, done = () => {}) {
      const apiUrl = '/inventory/api/unit-categories/'

      this.$http.get(apiUrl).then(response => {
        this.unitCategoryList = response.body
        done(response.body)
      })
    },

    fetchCategoryList () {
      const apiUrl = `/inventory/api/category/`
      this.$http.get(apiUrl).then(response => {
        this.categoryList = response.body
      })
    },

    fetchDocumentTypeList () {
      const apiUrl = `/inventory/api/document-type/`

      this.$http.get(apiUrl).then(response => {
        this.documentTypeList = response.body
      })
    }

  }
}
