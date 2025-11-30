import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { courseService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [refreshKey, setRefreshKey] = useState(0)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await courseService.getCourses()
        setCourses(data)
      } catch (err) {
        setError('Erro ao carregar cursos')
        console.error('Admin dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Delete course handler
  const handleDelete = async (courseId) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return
    try {
      await courseService.deleteCourse(courseId)
      // refresh list
      setRefreshKey(k => k + 1)
      // reload
      const data = await courseService.getCourses()
      setCourses(data)
    } catch (err) {
      alert('Erro ao excluir curso')
      console.error(err)
    }
  }

  useEffect(() => {
    // reload when refreshKey changes
    ;(async () => {
      try {
        setLoading(true)
        const data = await courseService.getCourses()
        setCourses(data)
      } catch (err) {
        setError('Erro ao carregar cursos')
      } finally {
        setLoading(false)
      }
    })()
  }, [refreshKey])

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Acesso negado. Apenas administradores podem ver este painel.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-responsive">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-lg">Painel Administrativo</h1>
          <Link to="/admin/cursos/novo" className="btn-primary">Criar Novo Curso</Link>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white shadow rounded">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Título</th>
                  <th className="px-4 py-2">Categoria</th>
                  <th className="px-4 py-2">Link</th>
                  <th className="px-4 py-2">Public.</th>
                  <th className="px-4 py-2">Criado em</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-600">Nenhum curso cadastrado</td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id} className="border-t">
                      <td className="px-4 py-3">{course.id}</td>
                      <td className="px-4 py-3">{course.title}</td>
                      <td className="px-4 py-3">{course.category}</td>
                      <td className="px-4 py-3">{course.link ? (<a href={course.link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Abrir</a>) : '-'}</td>
                      <td className="px-4 py-3">{course.is_published ? 'Sim' : 'Não'}</td>
                      <td className="px-4 py-3">{new Date(course.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Link to={`/curso/${course.id}`} className="text-primary-600 hover:underline mr-4">Ver</Link>
                        <Link to={`/admin/cursos/${course.id}/editar`} className="text-indigo-600 hover:underline mr-4">Editar</Link>
                        <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:underline">Excluir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
