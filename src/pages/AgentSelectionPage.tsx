import { useState } from 'react'
import { agents } from '../data/agents'
import type { Agent } from '../types/agent'

function AgentSelectionPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  const handleAgentChange = (agentId: string) => {
    const agent = agents.find((agent) => agent.id === agentId)

    setSelectedAgent(agent ?? null)
  }

  return (
    <main>
      <h1>Levantamiento de pedidos</h1>

      <h2>Seleccionar agente</h2>

      <label htmlFor="agent">Agente</label>

      <select
        id="agent"
        value={selectedAgent?.id ?? ''}
        onChange={(event) => handleAgentChange(event.target.value)}
      >
        <option value="">Seleccione un agente</option>

        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.id} - {agent.name}
          </option>
        ))}
      </select>

      {selectedAgent && (
        <section>
          <h3>Datos del agente</h3>

          <p>
            <strong>ID:</strong> {selectedAgent.id}
          </p>

          <p>
            <strong>Nombre:</strong> {selectedAgent.name}
          </p>

          <p>
            <strong>Zona:</strong> {selectedAgent.zone}
          </p>
        </section>
      )}
    </main>
  )
}

export default AgentSelectionPage