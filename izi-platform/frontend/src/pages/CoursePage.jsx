import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { courseService } from '../services/authService'
import ProgressBar from '../components/ProgressBar'
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Play, 
  CheckCircle,
  Lock,
  Award
} from 'lucide-react'

const CoursePage = () => {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState([])
  const [currentModule, setCurrentModule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [courseData, modulesData, progressData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getCourseModules(courseId),
        courseService.getUserProgress(courseId)
      ])

      setCourse(courseData)
      setModules(modulesData)
      setProgress(progressData.completedModules || [])
      setCurrentModule(modulesData[0] || null)

    } catch (err) {
      setError('Erro ao carregar o curso. Tente novamente.')
      console.error('Error loading course:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleComplete = async (moduleId) => {
    try {
      await courseService.updateProgress(moduleId, true)
      
      // Update local progress
      setProgress(prev => [...prev, moduleId])
      
      // If this was the last module, refresh progress data
      if (!progress.includes(moduleId)) {
        const updatedProgress = await courseService.getUserProgress(courseId)
        setProgress(updatedProgress.completedModules || [])
      }
      
    } catch (err) {
      console.error('Error updating progress:', err)
      alert('Erro ao salvar progresso. Tente novamente.')
    }
  }

  const isModuleCompleted = (moduleId) => {
    return progress.includes(moduleId)
  }

  const isModuleAccessible = (moduleIndex) => {
    // First module is always accessible
    if (moduleIndex === 0) return true
    
    // Check if previous module is completed
    const previousModule = modules[moduleIndex - 1]
    return previousModule ? isModuleCompleted(previousModule.id) : false
  }

  const getCourseProgress = () => {
    if (modules.length === 0) return 0
    return Math.round((progress.length / modules.length) * 100)
  }

  const getNextModule = () => {
    const currentIndex = modules.findIndex(m => m.id === currentModule?.id)
    if (currentIndex < modules.length - 1) {
      return modules[currentIndex + 1]
    }
    return null
  }

  const handleModuleSelect = (module) => {
    setCurrentModule(module)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-responsive">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/cursos" className="btn-primary">
            Voltar aos Cursos
          </Link>
        </div>
      </div>
    )
  }

  if (!course || modules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curso não encontrado</h2>
          <p className="text-gray-600 mb-6">Este curso pode ter sido removido ou você não está matriculado.</p>
          <Link to="/cursos" className="btn-primary">
            Voltar aos Cursos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-responsive py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link 
              to="/cursos" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar aos Cursos</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-lg text-gray-600">{course.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration || '8h de conteúdo'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{modules.length} módulos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.students || 0} estudantes</span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar 
                modules={modules}
                completedModules={progress}
                showLabels={true}
                size="lg"
              />
            </div>

            {/* Course Image */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 h-48 rounded-lg flex items-center justify-center">
                <div className="text-6xl opacity-20">
                  {course.icon || '📚'}
                </div>
              </div>

              {getCourseProgress() === 100 && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Award className="h-6 w-6 text-success-600" />
                    <div>
                      <h4 className="font-semibold text-success-900">Parabéns!</h4>
                      <p className="text-sm text-success-700">Você concluiu este curso!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-responsive py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Content */}
          <div className="lg:col-span-2">
            {currentModule ? (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="space-y-6">
                  {/* Module Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {isModuleCompleted(currentModule.id) ? (
                          <CheckCircle className="h-6 w-6 text-success-600" />
                        ) : (
                          <Play className="h-6 w-6 text-primary-600" />
                        )}
                        <h2 className="text-2xl font-bold text-gray-900">
                          Módulo {modules.findIndex(m => m.id === currentModule.id) + 1}: {currentModule.title}
                        </h2>
                      </div>
                      <p className="text-gray-600">
                        {currentModule.description || 'Conteúdo do módulo'}
                      </p>
                    </div>
                  </div>

                  {/* Module Content */}
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Conteúdo do Módulo</h3>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          Este é um módulo de exemplo do curso "{course.title}". 
                          Aqui você encontraria o conteúdo educacional completo, 
                          incluindo textos explicativos, imagens, vídeos e exercícios práticos.
                        </p>
                        
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                          <h4 className="font-semibold text-primary-900 mb-2">🎯 Objetivos do Módulo</h4>
                          <ul className="list-disc list-inside space-y-1 text-primary-800">
                            <li>Compreender os conceitos fundamentais</li>
                            <li>Aplicar conhecimentos na prática</li>
                            <li>Desenvolver projetos relacionados</li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-900 mb-2">📝 Exercícios Práticos</h4>
                          <p className="text-yellow-800">
                            Ao final deste módulo, você encontrará exercícios práticos 
                            para reforçar o aprendizado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div>
                      {isModuleCompleted(currentModule.id) ? (
                        <span className="badge-success">✓ Módulo concluído</span>
                      ) : (
                        <button
                          onClick={() => handleModuleComplete(currentModule.id)}
                          className="btn-primary"
                        >
                          Marcar como Concluído
                        </button>
                      )}
                    </div>

                    {getNextModule() && (
                      <button
                        onClick={() => handleModuleSelect(getNextModule())}
                        className="btn-outline"
                      >
                        Próximo Módulo →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Selecione um módulo
                </h3>
                <p className="text-gray-600">
                  Escolha um módulo na lista ao lado para começar a estudar
                </p>
              </div>
            )}
          </div>

          {/* Module List Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Módulos do Curso ({modules.length})
              </h3>
              
              <div className="space-y-3">
                {modules.map((module, index) => {
                  const isCompleted = isModuleCompleted(module.id)
                  const isAccessible = isModuleAccessible(index)
                  const isActive = currentModule?.id === module.id
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => isAccessible && handleModuleSelect(module)}
                      disabled={!isAccessible}
                      className={`
                        w-full text-left p-4 rounded-lg border transition-all duration-200
                        ${isActive 
                          ? 'bg-primary-50 border-primary-200 text-primary-900' 
                          : isCompleted
                            ? 'bg-success-50 border-success-200 text-success-900 hover:bg-success-100'
                            : isAccessible
                              ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-success-600" />
                          ) : isAccessible ? (
                            <Play className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {index + 1}.
                            </span>
                            <span className="text-sm font-medium truncate">
                              {module.title}
                            </span>
                          </div>
                          {module.duration && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {module.duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Course Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sobre este Curso
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Progresso:</span>
                  <span className="font-medium">{getCourseProgress()}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Módulos:</span>
                  <span className="font-medium">{modules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Concluídos:</span>
                  <span className="font-medium">{progress.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Restantes:</span>
                  <span className="font-medium">{modules.length - progress.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage