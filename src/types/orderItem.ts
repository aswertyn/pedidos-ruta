import type { BedSize, ProductType } from './product'

export interface OrderItem {
  codigo?: string
  model: string
  productType: ProductType
  bedSize: BedSize
  quantity: number
  price: number
  isManual: boolean
}