import type { Product } from '../types/product'

const availableSizes: Product['availableSizes'] = [
  'ind',
  'mat',
  'Q.S.',
  'K.S.',
]

const availableTypes: Product['availableTypes'] = [
  'mattress',
  'box',
  'platform',
]

export const products: Product[] = [
  {
   // productNumber: '',
    model: 'BAMBOE NO VUELTA ALOE',
    availableTypes,
    availableSizes,
  },
  {
   // productNumber: '',
    model: 'ALOE VERA NATURA',
    availableTypes,
    availableSizes,
  },
  {
   // productNumber: '',
    model: 'ROCK',
    availableTypes,
    availableSizes,
  },
  {
   // productNumber: '',
    model: 'ANIVERSARIO',
    availableTypes,
    availableSizes,
  },
  {
   // productNumber: '',
    model: 'VIENA',
    availableTypes,
    availableSizes,
  },
  {
   // productNumber: '',
    model: 'HOTELERO',
    availableTypes,
    availableSizes,
  },
  {
   // productNumber: '',
    model: 'DIAMOND',
    availableTypes,
    availableSizes,
  },
]