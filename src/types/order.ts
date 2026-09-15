import type { OrderItem } from './orderItem'
import type { ManualConsignee } from './manualConsignee'

export type DeliveryPriority =
  | 'urgent'
  | 'immediate'
  | 'scheduled'

export interface Order {
  agentNumber: string
  customerNumber: string

  consigneeNumber: string | null
  manualConsignee: ManualConsignee | null

  items: OrderItem[]

  observations: string
  orderDate: string
  deliveryPriority: DeliveryPriority
  purchaseOrder: string
}