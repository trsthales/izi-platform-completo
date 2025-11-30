import bcrypt from 'bcryptjs'
import { query, transaction } from '../src/config/database.js'

// Sample data
const sampleCourses = [
  {
    title: 'Introdução ao HTML e CSS',
    description: 'Aprenda os fundamentos do desenvolvimento web criando suas primeiras páginas com HTML e CSS. Este curso é perfeito para iniciantes que querem entrar no mundo do desenvolvimento web.',
    category: 'programming',
    duration: 480, // 8 horas
    level: 'beginner',
    price: 0.00,
    icon: '🌐',
    is_published: true
  },
  {
    title: 'JavaScript Moderno',
    description: 'Domine o JavaScript moderno com ES6+, async/await, Promises e muito mais. Ideal para desenvolvedores que querem elevar suas habilidades em JavaScript.',
    category: 'programming',
    duration: 720, // 12 horas
    level: 'intermediate',
    price: 0.00,
    icon: '⚡',
    is_published: true
  },
  {
    title: 'React - Do Básico ao Avançado',
    description: 'Construa aplicações web modernas com React. Aprenda componentes, hooks, state management e melhores práticas para criar SPAs profissionais.',
    category: 'programming',
    duration: 960, // 16 horas
    level: 'intermediate',
    price: 0.00,
    icon: '⚛️',
    is_published: true
  },
  {
    title: 'Design UI/UX com Figma',
    description: 'Aprenda a criar interfaces atrativas e experiências de usuário excepcionais usando Figma. Do conceito ao protótipo interativo.',
    category: 'design',
    duration: 600, // 10 horas
    level: 'beginner',
    price: 0.00,
    icon: '🎨',
    is_published: true
  },
  {
    title: 'Marketing Digital Completo',
    description: 'Estratégias completas de marketing digital: SEO, redes sociais, email marketing, Google Ads e muito mais para impulsionar seu negócio.',
    category: 'marketing',
    duration: 840, // 14 horas
    level: 'beginner',
    price: 0.00,
    icon: '📈',
    is_published: true
  },
  {
    title: 'Gestão de Projetos Ágeis',
    description: 'Metodologias ágeis, Scrum, Kanban e técnicas modernas de gestão de projetos para líderes e profissionais de TI.',
    category: 'business',
    duration: 360, // 6 horas
    level: 'intermediate',
    price: 0.00,
    icon: '📋',
    is_published: true
  }
]

const sampleModules = {
  1: [ // HTML/CSS course modules
    {
      title: 'Introdução ao HTML',
      description: 'Conceitos básicos e estrutura de documentos HTML',
      duration: 60,
      order_index: 1
    },
    {
      title: 'Tags e Elementos Fundamentais',
      description: 'Aprenda as principais tags HTML e sua utilização',
      duration: 90,
      order_index: 2
    },
    {
      title: 'Introdução ao CSS',
      description: 'Estilização básica com CSS',
      duration: 75,
      order_index: 3
    },
    {
      title: 'Layout e Flexbox',
      description: 'Criação de layouts responsivos',
      duration: 120,
      order_index: 4
    },
    {
      title: 'Projeto Final: Landing Page',
      description: 'Construa sua primeira página completa',
      duration: 135,
      order_index: 5
    }
  ],
  2: [ // JavaScript course modules
    {
      title: 'Fundamentos do JavaScript',
      description: 'Variáveis, tipos de dados e operadores',
      duration: 90,
      order_index: 1
    },
    {
      title: 'Funções e Escopo',
      description: 'Criação e utilização de funções',
      duration: 105,
      order_index: 2
    },
    {
      title: 'Arrays e Objetos',
      description: 'Estruturas de dados em JavaScript',
      duration: 120,
      order_index: 3
    },
    {
      title: 'DOM e Eventos',
      description: 'Manipulação de elementos e eventos',
      duration: 135,
      order_index: 4
    },
    {
      title: 'Async/Await e Promises',
      description: 'Programação assíncrona moderna',
      duration: 150,
      order_index: 5
    },
    {
      title: 'Projeto: Aplicação Web Interativa',
      description: 'Construa uma aplicação completa',
      duration: 120,
      order_index: 6
    }
  ]
}

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...')

    // Clean existing data (for demo purposes)
    await query('TRUNCATE TABLE progress, enrollments, modules, courses, users RESTART IDENTITY CASCADE')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12)
    const adminResult = await query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      ['Admin User', 'admin@izi.com', adminPassword]
    )
    console.log('✅ Admin user created:', adminResult.rows[0].email)

    // Create demo users
    const demoUsers = [
      { name: 'João Silva', email: 'joao@example.com', password: 'demo123' },
      { name: 'Maria Santos', email: 'maria@example.com', password: 'demo123' },
      { name: 'Pedro Costa', email: 'pedro@example.com', password: 'demo123' }
    ]

    const hashedUsers = await Promise.all(
      demoUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    )

    for (const user of hashedUsers) {
      const result = await query(
        `INSERT INTO users (name, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id`,
        [user.name, user.email, user.password]
      )
      console.log('✅ User created:', user.email)
    }

    // Create courses
    const createdCourses = []
    for (const course of sampleCourses) {
      const result = await query(
        `INSERT INTO courses (title, description, category, duration, level, price, icon, is_published) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, title`,
        [course.title, course.description, course.category, course.duration, course.level, course.price, course.icon, course.is_published]
      )
      createdCourses.push(result.rows[0])
      console.log('✅ Course created:', course.title)
    }

    // Create modules for each course
    for (const course of createdCourses) {
      const modules = sampleModules[course.id] || [
        {
          title: 'Módulo 1: Introdução',
          description: 'Conceitos básicos',
          duration: 60,
          order_index: 1
        },
        {
          title: 'Módulo 2: Conceitos Avançados',
          description: 'Tópicos avançados',
          duration: 90,
          order_index: 2
        },
        {
          title: 'Projeto Final',
          description: 'Aplicação prática',
          duration: 120,
          order_index: 3
        }
      ]

      for (const module of modules) {
        await query(
          `INSERT INTO modules (course_id, title, description, duration, order_index, is_published) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [course.id, module.title, module.description, module.duration, module.order_index, true]
        )
      }
      console.log(`✅ ${modules.length} modules created for course: ${course.title}`)
    }

    // Create some enrollments
    const users = await query('SELECT id FROM users')
    const courses = await query('SELECT id FROM courses')
    const modules = await query('SELECT id, course_id FROM modules')

    // Randomly enroll users in courses
    for (const user of users.rows) {
      // Each user gets 2-4 random courses
      const numCourses = Math.floor(Math.random() * 3) + 2
      const selectedCourses = courses.rows
        .sort(() => Math.random() - 0.5)
        .slice(0, numCourses)

      for (const course of selectedCourses) {
        await query(
          'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
          [user.id, course.id]
        )

        // Add some progress (30-100% completion)
        const courseModules = modules.rows.filter(m => m.course_id === course.id)
        const completedModules = Math.floor(Math.random() * courseModules.length)
        
        for (let i = 0; i < completedModules; i++) {
          await query(
            'INSERT INTO progress (user_id, module_id, completed, completed_at) VALUES ($1, $2, true, CURRENT_TIMESTAMP)',
            [user.id, courseModules[i].id]
          )
        }
      }
    }

    console.log('✅ Sample enrollments and progress created')

    // Create some reviews (for future implementation)
    const reviews = [
      { user_id: 2, course_id: 1, rating: 5, comment: 'Excelente curso para iniciantes!' },
      { user_id: 3, course_id: 1, rating: 4, comment: 'Muito bom, explicação clara.' },
      { user_id: 2, course_id: 2, rating: 5, comment: 'JavaScript finalmente faz sentido!' },
      { user_id: 4, course_id: 2, rating: 4, comment: 'Conteúdo abrangente e prático.' }
    ]

    for (const review of reviews) {
      await query(
        'INSERT INTO reviews (user_id, course_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [review.user_id, review.course_id, review.rating, review.comment]
      )
    }

    console.log('✅ Sample reviews created')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users: ${users.rows.length}`)
    console.log(`   - Courses: ${courses.rows.length}`)
    console.log(`   - Modules: ${modules.rows.length}`)
    console.log(`   - Reviews: ${reviews.length}`)

    console.log('\n🔑 Demo Accounts:')
    console.log('   Admin: admin@izi.com / admin123')
    console.log('   User: joao@example.com / demo123')
    console.log('   User: maria@example.com / demo123')
    console.log('   User: pedro@example.com / demo123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../src/server.js').then(() => {
    import('../src/config/database.js').then(({ testConnection }) => {
      testConnection().then((connected) => {
        if (connected) {
          seedDatabase().then(() => {
            console.log('Seeding completed!')
            process.exit(0)
          }).catch((error) => {
            console.error('Seeding failed:', error)
            process.exit(1)
          })
        } else {
          console.error('Database connection failed!')
          process.exit(1)
        }
      })
    })
  })
}

export default seedDatabase