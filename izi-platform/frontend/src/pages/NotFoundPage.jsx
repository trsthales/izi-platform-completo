import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-6">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-9xl font-bold text-gray-300">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Página não encontrada
            </h1>
            <p className="text-lg text-gray-600">
              Ops! A página que você está procurando não existe ou foi movida.
            </p>
            <p className="text-sm text-gray-500">
              Verifique se o endereço está correto ou retorne à página inicial.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Página Inicial</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar</span>
            </button>
          </div>

          {/* Helpful Links */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Você pode estar procurando por:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link
                to="/cursos"
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Cursos</div>
                <div className="text-gray-600">Explore nossos cursos</div>
              </Link>
              
              <Link
                to="/login"
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Login</div>
                <div className="text-gray-600">Entrar na sua conta</div>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Problemas para acessar?{' '}
              <a 
                href="mailto:suporte@izi.com" 
                className="text-primary-600 hover:text-primary-500 underline"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage