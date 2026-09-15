import type { Agent } from '../types/agent'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgent: Agent | null
  onAgentChange: (agentNumber: string) => void
}

function AgentSelector({
  agents,
  selectedAgent,
  onAgentChange,
}: AgentSelectorProps) {
  return (
    <section className="agent-selector">
      <h2>Seleccionar agente</h2>

      <p className="selector-help">
        Selecciona el agente que levantará el pedido.
      </p>

      <div className="agent-list">
        {agents.map((agent) => {
          const isSelected =
            selectedAgent?.agentNumber === agent.agentNumber

          return (
            <button
              key={agent.agentNumber}
              type="button"
              className={`agent-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onAgentChange(agent.agentNumber)}
            >
              <span className="agent-number">
                {agent.agentNumber}
              </span>

              <span className="agent-information">
                <span className="agent-name">
                  {agent.name}
                </span>

                <span className="agent-zone">
                  {agent.zone}
                </span>
              </span>

              {isSelected && (
                <span className="selection-check">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default AgentSelector