import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import CourseCard from '../components/CourseCard'
import { BookOpen, Plus, Search, Filter } from 'lucide-react'

const MyCoursesPage = () => {
  const { user } = useAuthStore()
  const [myCourses, setMyCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('my-courses') // 'my-courses' | 'all-courses'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load user's enrolled courses
      const enrolledCourses = await courseService.getMyEnrollments()
      setMyCourses(enrolledCourses)

      // Load all available courses
      const availableCourses = await courseService.getCourses()
      setAllCourses(availableCourses)
      
    } catch (err) {
      setError('Erro ao carregar cursos. Tente novamente.')
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollCourse = async (courseId) => {
    try {
      await courseService.enrollCourse(courseId)
      
      // Reload courses to reflect enrollment
      const [enrolledCourses, availableCourses] = await Promise.all([
        courseService.getMyEnrollments(),
        courseService.getCourses()
      ])
      
      setMyCourses(enrolledCourses)
      setAllCourses(availableCourses)
      
      // Show success message
      alert('Matrícula realizada com sucesso!')
      
    } catch (err) {
      alert('Erro ao se matricular no curso. Tente novamente.')
      console.error('Error enrolling in course:', err)
    }
  }

  const getFilteredCourses = (courses) => {
    let filtered = courses

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(course => course.category === filterCategory)
    }

    return filtered
  }

  const getUserProgress = (courseId) => {
    const course = myCourses.find(c => c.id === courseId)
    return course?.progress || 0
  }

  const isUserEnrolled = (courseId) => {
    return myCourses.some(c => c.id === courseId)
  }

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'programming', label: 'Programação' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'business', label: 'Negócios' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-responsive">
          <div className="space-y-8">
            <div className="text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
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
          <button
            onClick={loadCourses}
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-responsive">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div className="text-center space-y-4">
            <h1 className="heading-lg">
              Bem-vindo, {user?.name}! 👋
            </h1>
            <p className="text-body max-w-2xl mx-auto">
              Continue sua jornada de aprendizado e descubra novos conteúdos
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-white p-1 rounded-lg shadow-sm border">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('my-courses')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'my-courses'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Meus Cursos ({myCourses.length})
                </button>
                <button
                  onClick={() => setActiveTab('all-courses')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'all-courses'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todos os Cursos ({allCourses.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input pl-10 appearance-none"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {activeTab === 'my-courses' ? (
          <div className="space-y-8">
            {getFilteredCourses(myCourses).length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterCategory !== 'all' 
                    ? 'Nenhum curso encontrado' 
                    : 'Você ainda não tem cursos matriculados'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterCategory !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Explore nossa biblioteca de cursos e comece sua jornada de aprendizado'
                  }
                </p>
                {!searchTerm && filterCategory === 'all' && (
                  <button
                    onClick={() => setActiveTab('all-courses')}
                    className="btn-primary"
                  >
                    Explorar Cursos
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Meus Cursos ({getFilteredCourses(myCourses).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredCourses(myCourses).map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      isEnrolled={true}
                      progress={getUserProgress(course.id)}
                      showEnrollButton={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {getFilteredCourses(allCourses).length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os termos de busca ou filtros
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterCategory('all')
                  }}
                  className="btn-secondary"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Todos os Cursos ({getFilteredCourses(allCourses).length})
                  </h2>
                  <div className="text-sm text-gray-600">
                    {myCourses.length > 0 && (
                      <span>{myCourses.length} curso(s) matriculado(s)</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredCourses(allCourses).map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={handleEnrollCourse}
                      isEnrolled={isUserEnrolled(course.id)}
                      progress={getUserProgress(course.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCoursesPage