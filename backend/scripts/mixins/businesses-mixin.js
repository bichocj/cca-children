export const businessesApiMixin = {
  data () {
    return {
      unitList: [],
      clientDocumentTypeList: [],
      roleList: []
    }
  },

  methods: {
    fetchClientDocumentTypeList () {
      const apiUrl = `/businesses/api/document-type/`
      this.$http.get(apiUrl).then(response => {
        this.clientDocumentTypeList = response.body
      })
    },
    fetchRoleList () {
      const apiUrl = '/businesses/api/role/'
      this.$http.get(apiUrl).then(response => {
        this.roleList = response.body
      })
    }
  }
}
