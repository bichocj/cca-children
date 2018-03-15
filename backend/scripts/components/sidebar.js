import Cookies from 'js-cookie'

export default {
  name: 'sidebar',

  data: function () {
    return {
      user: {
        profile: {}
      },
      businessId: undefined
    }
  },

  watch: {

  },

  mounted () {
    this.businessId = parseInt(Cookies.get('business_pk'))
    this.initializeShortCuts()
  },

  methods: {
    setCurrentBussiness (businessId) {
      Cookies.set('business_pk', businessId)
      this.businessId = businessId
      window.location.reload()
    },

    initializeShortCuts () {
      const _this = this
      document.addEventListener('keyup', onKeyUp, false)

      function onKeyUp (e) {
        let activeElementType = document.activeElement.type
        if (activeElementType === 'search' || activeElementType === 'text') { return }

        let hasPressedShiftN = e.shiftKey && e.keyCode === 78
        let hasPressedShiftB = e.shiftKey && e.keyCode === 66
        if (hasPressedShiftN) { _this.goto_new_item_view() }
        if (hasPressedShiftB) { _this.goback_to_the_list() }
      }
    },

    goto_new_item_view () {
      switch (this.$route.name) {
        case 'referral_guides':
          this.$router.push({ name: 'referral_guides_add' })
          break
        case 'sales':
          this.$router.push({ name: 'sales_add' })
          break
        case 'products':
          this.$router.push({ name: 'products_add' })
          break
        case 'clients':
          this.$router.push({ name: 'clients_add' })
          break
        case 'employees':
          this.$router.push({ name: 'employees_add' })
          break
        default:
          break
      }
    },

    goback_to_the_list () {
      switch (this.$route.name) {
        case 'referral_guides_add':
          this.$router.push({ name: 'referral_guides' })
          break
        case 'sales_add':
          this.$router.push({ name: 'sales' })
          break
        case 'products_add':
          this.$router.push({ name: 'products' })
          break
        case 'clients_add':
          this.$router.push({ name: 'clients' })
          break
        case 'employees_add':
          this.$router.push({ name: 'employees' })
          break
        default:
          break
      }
    }
  }
}
