export type ProductType = 'mattress' | 'box' | 'platform'

export type BedSize =
  | 'ind'
  | 'mat'
  | 'Q.S.'
  | 'K.S.'

export interface Product {
  productNumber: string
  model: string
  availableTypes: ProductType[]
  availableSizes: BedSize[]
}