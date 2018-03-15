import { businessesApiMixin } from '../mixins/businesses-mixin'
import { filterMixin } from '../mixins/utils'
import { formsMixin } from '../mixins/forms-mixin'
import { debounce } from 'lodash'
import BusinessTaxView from './business-tax'
import BusinessUnitView from './business-unit'

import Cookies from 'js-cookie'

export default {
  name: 'BusinessConfigurationsView',
  template: '#business-configurations-view',
  mixins: [businessesApiMixin, filterMixin, formsMixin],
  delimiters: ['[[', ']]'],

  data () {
    return {
      componentsDisplay: {
        taxes : true,
        units: false,
        general: false
      }
    }
  },

  watch: {

  },

  mounted () {

  },

  methods: {
    displayComponent(component) {
      for (let [key, value] of Object.entries(this.componentsDisplay)) {
        this.componentsDisplay[key] = false
      }
      this.componentsDisplay[component] = true
    }
  },

  components: {
    'business-tax': BusinessTaxView,
    'business-unit': BusinessUnitView
  }
}
