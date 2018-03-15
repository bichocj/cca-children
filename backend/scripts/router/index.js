import Home from '../components/home'
import ProductView from '../components/product'
import ProductAddView from '../components/product-add'
import ClientView from '../components/client'
import ClientAddView from '../components/client-add'
import EmployeeView from '../components/employee'
import EmployeeAddView from '../components/employee-add'
import ReferralGuideView from '../components/referral-guide'
import ReferralGuideAddView from '../components/referral-guide-add'
import ProductKardexView from '../components/products-kardex'
import SalesView from '../components/sales'
import SalesAddView from '../components/sales-add'
import movementsView from '../components/movements'
import MovementsAddView from '../components/movements-add'
import PettyCashView from '../components/petty-cash'
import PettyCashAddView from '../components/petty-cash-add'
import PettyCashSummaryView from '../components/petty-cash-summary'
import PettyCashMovementsView from '../components/petty-cash-movements'
import PettyCashMovementsAddView from '../components/petty-cash-movements-add'
import SupportView from '../components/support'
import ProfileView from '../components/profile'
import BusinessView from '../components/business'
import BusinessAddView from '../components/business-add'
import BusinessConfigurationsView from '../components/business-configurations'
import BusinessTaxView from '../components/business-tax'
import BusinessTaxAddView from '../components/business-tax-add'

export default [
  { path: '/', name: 'home', component: Home },
  { path: '/products', name: 'products', component: ProductView },
  { path: '/products/add', name: 'products_add', component: ProductAddView },
  { path: '/products/:id/edit', name: 'products_edit', component: ProductAddView },
  { path: '/products/:id/kardex', name: 'products_kardex', component: ProductKardexView },
  { path: '/clients', name: 'clients', component: ClientView },
  { path: '/clients/add', name: 'clients_add', component: ClientAddView },
  { path: '/clients/:id/edit', name: 'clients_edit', component: ClientAddView },
  { path: '/employees/', name: 'employees', component: EmployeeView },
  { path: '/employees/add/', name: 'employees_add', component: EmployeeAddView },
  { path: '/employees/:id/edit', name: 'employees_edit', component: EmployeeAddView },
  { path: '/referral-guides/', name: 'referral_guides', component: ReferralGuideView },
  { path: '/referral-guides/add', name: 'referral_guides_add', component: ReferralGuideAddView },
  { path: '/referral-guides/:id/edit', name: 'referral_guides_edit', component: ReferralGuideAddView },
  { path: '/sales/', name: 'sales', component: SalesView },
  { path: '/sales/add', name: 'sales_add', component: SalesAddView },
  { path: '/sales/:id/edit', name: 'sales_edit', component: SalesAddView },
  { path: '/movements', name: 'movements', component: movementsView },
  { path: '/movements/add/', name: 'movements_add', component: MovementsAddView },
  { path: '/movements/:id/edit', name: 'movements_edit', component: MovementsAddView },
  { path: '/petty-cash', name: 'petty_cash', component: PettyCashView },
  { path: '/petty-cash/add', name: 'petty_cash_add', component: PettyCashAddView },
  { path: '/petty-cash-summary/:id', name: 'petty_cash_summary', component: PettyCashSummaryView },
  { path: '/petty-cash/:pettyCashId/movements', name: 'petty_cash_movements', component: PettyCashMovementsView },
  { path: '/petty-cash/:pettyCashId/movements/add', name: 'petty_cash_movements_add', component: PettyCashMovementsAddView },
  { path: '/petty-cash/:pettyCashId/movements/:id/edit', name: 'petty_cash_movements_edit', component: PettyCashMovementsAddView },
  { path: '/support', name: 'support', component: SupportView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/business', name: 'business', component: BusinessView },
  { path: '/business/add', name: 'business_add', component: BusinessAddView },
  { path: '/business/:id/edit', name: 'business_edit', component: BusinessAddView },
  { path: '/business/configurations', name: 'business_configurations', component: BusinessConfigurationsView },
  // { path: '/business/tax', name: 'business_tax', component: BusinessTaxView },
  // { path: '/business/tax/add', name: 'business_tax_add', component: BusinessTaxAddView }

]
