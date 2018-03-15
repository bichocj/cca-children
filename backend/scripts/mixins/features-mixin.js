export const featuresMixin = {

  computed: {

    hasPettyCashFeature () {
      return window.BUSINESS_FEATURES.includes('petty-cash')
    },

    hasSalesFeature () {
      return window.BUSINESS_FEATURES.includes('sales')
    },

    hasReferralGuideFeature () {
      return window.BUSINESS_FEATURES.includes('referral-guides')
    }
  }

}
