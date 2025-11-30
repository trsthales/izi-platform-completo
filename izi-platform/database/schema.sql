-- IZI Platform Database Schema
-- PostgreSQL Database for Educational Platform

-- Enable UUID extension (if using UUIDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'other',
    duration INTEGER, -- in minutes
    level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    price DECIMAL(10,2) DEFAULT 0.00,
    icon VARCHAR(10), -- emoji or icon identifier
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT, -- HTML content or markdown
    duration INTEGER, -- in minutes
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Comments table (for future implementation)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table (for future implementation)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_module ON progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_comments_module_id ON comments(module_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);

-- Triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate course completion percentage
CREATE OR REPLACE FUNCTION calculate_course_completion(user_id_param INTEGER, course_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_modules INTEGER;
    completed_modules INTEGER;
    completion_percentage INTEGER;
BEGIN
    -- Count total modules in course
    SELECT COUNT(*) INTO total_modules
    FROM modules
    WHERE course_id = course_id_param;
    
    -- Count completed modules for user
    SELECT COUNT(*) INTO completed_modules
    FROM progress p
    JOIN modules m ON p.module_id = m.id
    WHERE p.user_id = user_id_param
      AND p.completed = true
      AND m.course_id = course_id_param;
    
    -- Calculate percentage
    IF total_modules > 0 THEN
        completion_percentage := ROUND((completed_modules * 100.0 / total_modules));
    ELSE
        completion_percentage := 0;
    END IF;
    
    RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE OR REPLACE VIEW course_enrollment_stats AS
SELECT 
    c.id as course_id,
    c.title,
    COUNT(DISTINCT e.id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN p.completed = true THEN p.id END) as total_completions
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN progress p ON e.user_id = p.user_id
GROUP BY c.id, c.title;

CREATE OR REPLACE VIEW user_learning_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COUNT(DISTINCT e.id) as enrolled_courses,
    COUNT(DISTINCT CASE WHEN p.completed = true THEN p.id END) as completed_modules,
    AVG(
        CASE WHEN total_modules.total > 0 THEN
            (completed_modules.completed * 100.0 / total_modules.total)
        ELSE 0 END
    ) as average_progress
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
LEFT JOIN (
    SELECT 
        m.course_id,
        COUNT(*) as total
    FROM modules m
    GROUP BY m.course_id
) total_modules ON e.course_id = total_modules.course_id
LEFT JOIN (
    SELECT 
        m.course_id,
        COUNT(*) as completed
    FROM modules m
    JOIN progress p ON m.id = p.module_id
    WHERE p.completed = true
    GROUP BY m.course_id
) completed_modules ON e.course_id = completed_modules.course_id
LEFT JOIN progress p ON u.id = p.user_id
GROUP BY u.id, u.name, u.email;