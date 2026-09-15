import type { OrderStep } from '../types/orderStep'

interface StepIndicatorProps {
  currentStep: OrderStep
}

const steps: OrderStep[] = [
  'agent',
  'customer',
  'delivery',
  'products',
  'details',
  'review',
]

const stepNames: Record<OrderStep, string> = {
  agent: 'Agente',
  customer: 'Cliente',
  delivery: 'Entrega',
  products: 'Productos',
  details: 'Datos finales',
  review: 'Revisión',
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentStepNumber = steps.indexOf(currentStep) + 1
  const progress = (currentStepNumber / steps.length) * 100

  return (
    <div className="step-indicator">
      <div className="step-information">
        <span className="step-number">
          PASO {currentStepNumber} DE {steps.length}
        </span>

        <span className="step-name">
          {stepNames[currentStep]}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-value"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default StepIndicator