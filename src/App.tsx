import { useState } from 'react'

import AgentSelector from './components/AgentSelector'
import CustomerSelector from './components/CustomerSelector'

import { agents } from './data/agents'
import { customers } from './data/customers'

import type { Agent } from './types/agent'
import type { Customer } from './types/customer'

function App() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleAgentChange = (agentNumber: string) => {
    const agent = agents.find(
      (agent) => agent.agentNumber === agentNumber,
    )

    setSelectedAgent(agent ?? null)
    setSelectedCustomer(null)
  }

  const handleCustomerChange = (customerNumber: string) => {
    const customer = customers.find(
      (customer) => customer.customerNumber === customerNumber,
    )

    setSelectedCustomer(customer ?? null)
  }

  const agentCustomers = selectedAgent
    ? customers.filter(
        (customer) =>
          customer.agentNumber === selectedAgent.agentNumber,
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
    </main>
  )
}

export default App