class ProductItem {
  constructor (product, reference, unitPrice = 0, quantity = 1, id = undefined) {
    // reference could be invoice or referralGuide
    this.type = product.unit.unit_category.accept_decimal ? 'decimal' : 'integer'
    this._is_valid_quantity = true
    this._is_valid_unit_price = true

    this[reference._type] = reference.id
    this.product = product
    this.product_id = product.id
    this.unit_price = unitPrice
    this.quantity = quantity
    this.is_active = true
    this.id = id
    this._document_type = undefined
    this.document_type = reference.document_type
  }

  set document_type (value) {
    this._document_type = value
  }

  get subtotal () {
    return this.quantity * this.unit_price
  }

  get tax () {
    const factura = 1
    if (this._document_type !== factura) {
      return 0
    }
    return this.subtotal * this.product.tax.percentage
  }

  get total () {
    return this.tax + this.subtotal
  }

  get isValid () {
    return this.isValidQuantity && this.isValidUnitPrice
  }

  get isValidQuantity () {
    let test = this.quantity > 0
    if (this.type === 'integer') { test = test && Number.isInteger(Number(this.quantity)) }

    this._is_valid_quantity = test
    return this._is_valid_quantity
  }

  get isValidUnitPrice () {
    let unitPrice = this.unit_price || -1
    this._is_valid_unit_price = unitPrice >= 0
    return this._is_valid_unit_price
  }

  toJSON () {  // This method is required to serialize the class
    let {id, product_id, unit_price, quantity, is_active, product, referralGuide, invoice} = this
    return {id, product_id, unit_price, quantity, is_active, product, referralGuide, invoice}
  }

  static createFromList (reference) {
    let instances = []
    for (let item of reference.items) {
      instances.push(new ProductItem(
        item.product,
        reference,
        item.unit_price,
        item.quantity,
        item.id))
    }
    return instances
  }
}

export default ProductItem
