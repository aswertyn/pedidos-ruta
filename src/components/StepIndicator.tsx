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

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentStepNumber = steps.indexOf(currentStep) + 1

  return (
    <div>
      <p>
        Paso {currentStepNumber} de {steps.length}
      </p>

      <progress
        value={currentStepNumber}
        max={steps.length}
      />
    </div>
  )
}

export default StepIndicator