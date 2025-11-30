import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  BookOpen, 
  Users, 
  Award, 
  PlayCircle, 
  CheckCircle,
  ArrowRight,
  Star,
  Quote
} from 'lucide-react'

const LandingPage = () => {
  const { isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Newsletter subscription logic here
    alert('Obrigado! Você foi inscrito em nossa newsletter.')
    setEmail('')
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Cursos de Qualidade',
      description: 'Aprenda com conteúdo criado por especialistas e atualizado constantemente.'
    },
    {
      icon: PlayCircle,
      title: 'Aprendizado Interativo',
      description: 'Experiência de aprendizado dinâmica com exercícios práticos e projetos reais.'
    },
    {
      icon: Users,
      title: 'Comunidade Ativa',
      description: 'Conecte-se com outros estudantes e compartilhe conhecimento.'
    },
    {
      icon: Award,
      title: 'Certificados',
      description: 'Receba certificados reconhecidos pelo mercado ao concluir seus cursos.'
    }
  ]

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Desenvolvedora Frontend',
      content: 'A IZI transformou minha carreira. Os cursos são práticos e realmente me prepararam para o mercado.',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'UI/UX Designer',
      content: 'Conteúdo de alta qualidade e instructors preparados. Recomendo para quem quer evoluir profissionalmente.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Product Manager',
      content: 'A plataforma é intuitiva e o suporte é excepcional. Aprendi muito em pouco tempo.',
      rating: 5
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Estudantes Ativos' },
    { number: '50+', label: 'Cursos Disponíveis' },
    { number: '95%', label: 'Taxa de Satisfação' },
    { number: '24/7', label: 'Suporte Disponível' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container-responsive section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="heading-xl text-white">
                  Revolucione seu
                  <span className="text-primary-200"> aprendizado</span>
                  online
                </h1>
                <p className="text-xl text-primary-100 leading-relaxed">
                  Descubra uma nova forma de aprender com nossa plataforma educacional 
                  interativa. Cursos práticos, certificados reconhecidos e uma comunidade 
                  de milhares de estudantes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link to="/cursos" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                    Continuar Estudando
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/registrar" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                      Começar Grátis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link to="/login" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                      Entrar
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary-200" />
                  <span className="text-primary-100">Sem taxa de matrícula</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary-200" />
                  <span className="text-primary-100">Certificado gratuito</span>
                </div>
              </div>
            </div>

            <div className="lg:text-center">
              <div className="relative">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    {stats.map((stat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="text-2xl font-bold text-white">{stat.number}</div>
                        <div className="text-sm text-primary-200">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-primary-400 pt-6">
                    <p className="text-primary-100 text-sm">
                      "A melhor plataforma educacional que já usei!"
                    </p>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-responsive">
          <div className="text-center space-y-4 mb-16">
            <h2 className="heading-lg">Por que escolher a IZI?</h2>
            <p className="text-body max-w-2xl mx-auto">
              Nossa plataforma foi desenvolvida pensando na experiência do estudante, 
              oferecendo as melhores ferramentas para um aprendizado eficaz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-gray-50">
        <div className="container-responsive">
          <div className="text-center space-y-4 mb-16">
            <h2 className="heading-lg">O que nossos estudantes dizem</h2>
            <p className="text-body max-w-2xl mx-auto">
              Mais de 10.000 estudantes já transformaram suas carreiras com a IZI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <Quote className="h-8 w-8 text-primary-600" />
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section bg-primary-600 text-white">
        <div className="container-responsive">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Fique por dentro das novidades</h2>
              <p className="text-primary-100">
                Receba em primeira mão informações sobre novos cursos, 
                promoções exclusivas e dicas de estudo.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button 
                type="submit"
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage