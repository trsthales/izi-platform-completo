import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, BookOpen, Play } from 'lucide-react'

const CourseCard = ({ 
  course, 
  onEnroll, 
  isEnrolled = false, 
  progress = 0,
  showEnrollButton = true 
}) => {
  const handleEnrollClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEnroll) {
      onEnroll(course.id)
    }
  }

  return (
    <div className="card card-hover group">
      <Link to={`/curso/${course.id}`} className="block">
        {/* Course Image */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 h-48 flex items-center justify-center">
            <div className="text-6xl opacity-20">
              {course.icon || '📚'}
            </div>
          </div>
          
          {/* Progress Badge */}
          {isEnrolled && progress > 0 && (
            <div className="absolute top-3 right-3">
              <span className="badge-success">
                {progress}% concluído
              </span>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white bg-opacity-90 p-3 rounded-full">
              <Play className="h-6 w-6 text-primary-600 ml-1" />
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="space-y-3">
          {/* Title and Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {course.description}
            </p>
          </div>

          {/* Course Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration || '8h'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.students || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="h-4 w-4" />
                <span>{course.modules_count || 0} módulos</span>
              </div>
            </div>
          </div>

          {/* Progress Bar (if enrolled) */}
          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progresso</span>
                <span className="font-medium text-gray-900">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {showEnrollButton && (
            <div className="pt-2">
              {isEnrolled ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-success-600 font-medium">
                    ✓ Matriculado
                  </span>
                  <Link 
                    to={`/curso/${course.id}`}
                    className="btn-primary text-sm"
                    onClick={handleEnrollClick}
                  >
                    Continuar
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleEnrollClick}
                  className="btn-primary w-full"
                >
                  Matricular-se
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default CourseCard