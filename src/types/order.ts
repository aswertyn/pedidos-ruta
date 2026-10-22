import type { OrderItem } from './orderItem'
import type { ManualConsignee } from './manualConsignee'
import type { PolyethyleneBag } from './polyethyleneBag'

export type DeliveryPriority =
  | 'urgent'
  | 'immediate'
  | 'scheduled'

export interface Order {
  folio: string
  conditions: string
  customerPhone: string
  consigneeName: string
  consigneePhone: string

  agentNumber: string
  customerNumber: string

  consigneeNumber: string | null
  manualConsignee: ManualConsignee | null

  items: OrderItem[]
  polyethyleneBag: PolyethyleneBag[]

  observations: string
  orderDate: string
  deliveryPriority: DeliveryPriority
  purchaseOrder: string
}