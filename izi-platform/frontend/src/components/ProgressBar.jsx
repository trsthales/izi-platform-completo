import React from 'react'
import { CheckCircle, Circle } from 'lucide-react'

const ProgressBar = ({ 
  modules = [], 
  completedModules = [], 
  showLabels = true,
  size = 'md',
  variant = 'default'
}) => {
  const totalModules = modules.length
  const completedCount = completedModules.length
  const progressPercentage = totalModules > 0 ? (completedCount / totalModules) * 100 : 0

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="space-y-2">
        {showLabels && (
          <div className="flex items-center justify-between">
            <span className={`font-medium text-gray-700 ${textSizes[size]}`}>
              Progresso do Curso
            </span>
            <span className={`font-semibold text-gray-900 ${textSizes[size]}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        )}
        
        <div className={`progress-bar ${sizeClasses[size]}`}>
          <div 
            className={`progress-fill ${
              variant === 'success' ? 'bg-success-600' : 
              variant === 'warning' ? 'bg-warning-600' : 
              'bg-primary-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Module Status */}
      {totalModules > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Módulos concluídos: {completedCount}/{totalModules}</span>
            <span>
              {completedCount === totalModules ? '✅ Curso completo!' : '⏳ Continue estudando'}
            </span>
          </div>

          {/* Module Indicators */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {modules.map((module, index) => {
              const isCompleted = completedModules.includes(module.id)
              const isAccessible = index === 0 || completedModules.includes(modules[index - 1]?.id)
              
              return (
                <div
                  key={module.id}
                  className={`
                    flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200
                    ${isCompleted 
                      ? 'bg-success-100 text-success-700' 
                      : isAccessible 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-success-600" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium truncate w-full text-center">
                    {index + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {completedCount === totalModules && totalModules > 0 && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-success-600" />
            <div>
              <h4 className="font-semibold text-success-900">Parabéns! 🎉</h4>
              <p className="text-sm text-success-700">
                Você concluiu este curso com sucesso. Continue explorando outros conteúdos!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressBar