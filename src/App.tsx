import { useState } from 'react'

import AgentSelector from './components/AgentSelector'
import CustomerSelector from './components/CustomerSelector'
import ConsigneeSelector from './components/ConsigneeSelector'

import { agents } from './data/agents'
import { customers } from './data/customers'
import { consignees } from './data/consignees'

import type { Agent } from './types/agent'
import type { Customer } from './types/customer'
import type { Consignee } from './types/consignee'

function App() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedConsignee, setSelectedConsignee] = useState<Consignee | null>(null)

  const handleAgentChange = (agentNumber: string) => {
    const agent = agents.find(
      (agent) => agent.agentNumber === agentNumber,
    )

    setSelectedAgent(agent ?? null)
    setSelectedCustomer(null)
    setSelectedConsignee(null)
  }

  const handleCustomerChange = (customerNumber: string) => {
    const customer = customers.find(
      (customer) => customer.customerNumber === customerNumber,
    )

    setSelectedCustomer(customer ?? null)
    setSelectedConsignee(null)
  }

  const handleConsigneeChange = (consigneeNumber: string) => {
    const consignee = consignees.find(
      (consignee) =>
        consignee.consigneeNumber === consigneeNumber &&
        consignee.customerNumber === selectedCustomer?.customerNumber,
    )

    setSelectedConsignee(consignee ?? null)
  }

  const agentCustomers = selectedAgent
    ? customers.filter(
      (customer) =>
        customer.agentNumber === selectedAgent.agentNumber,
    )
    : []

  const customerConsignees = selectedCustomer
    ? consignees.filter(
      (consignee) =>
        consignee.customerNumber === selectedCustomer.customerNumber,
    )
    : []

  return (
    <main>
      <h1>Levantamiento de pedidos</h1>
      <p>Aplicación para captura de pedidos en ruta.</p>

      <AgentSelector
        agents={agents}
        selectedAgent={selectedAgent}
        onAgentChange={handleAgentChange}
      />

      {selectedAgent && (
        <CustomerSelector
          customers={agentCustomers}
          selectedCustomer={selectedCustomer}
          onCustomerChange={handleCustomerChange}
        />
      )}
      {selectedCustomer && (
        <ConsigneeSelector
          consignees={customerConsignees}
          selectedConsignee={selectedConsignee}
          onConsigneeChange={handleConsigneeChange}
        />
      )}
    </main>
  )
}

export default App