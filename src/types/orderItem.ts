import type { BedSize, ProductType } from './product'

export interface OrderItem {
  productNumber: string
  model: string
  productType: ProductType
  bedSize: BedSize
  quantity: number
  price: number
}