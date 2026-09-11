import type { Agent } from '../types/agent'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgent: Agent | null
  onAgentChange: (agentNumber : string) => void 
}

function AgentSelector({
  agents,
  selectedAgent,
  onAgentChange,
}: AgentSelectorProps) {
  return (
    <section>
      <h2>Seleccionar agente</h2>

      <select
        value={selectedAgent?.agentNumber  ?? ''}
        onChange={(event) => onAgentChange(event.target.value)}
      >
        <option value="">Seleccione un agente</option>

        {agents.map((agent) => (
          <option key={agent.agentNumber } value={agent.agentNumber }>
            {agent.agentNumber } - {agent.name}
          </option>
        ))}
      </select>

      {selectedAgent && (
        <div>
            <p>
                <strong>Número de agente:</strong> {selectedAgent.agentNumber}
            </p>
          <p>
            <strong>Agente:</strong> {selectedAgent.name}
          </p>

          <p>
            <strong>Zona:</strong> {selectedAgent.zone}
          </p>
        </div>
      )}
    </section>
  )
}

export default AgentSelector