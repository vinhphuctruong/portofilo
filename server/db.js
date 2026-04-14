const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT DEFAULT 'Your Name',
    title TEXT DEFAULT 'Full-Stack Developer',
    bio TEXT DEFAULT 'Passionate developer building amazing web applications.',
    avatar TEXT DEFAULT '',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    location TEXT DEFAULT '',
    github TEXT DEFAULT '',
    linkedin TEXT DEFAULT '',
    website TEXT DEFAULT '',
    skills TEXT DEFAULT '[]',
    resume_url TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    live_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    tech_stack TEXT DEFAULT '[]',
    category TEXT DEFAULT 'Web',
    featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed admin if not exists
const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hash);
  console.log('✅ Default admin created: admin / admin123');
}

// Seed profile if not exists
const profileExists = db.prepare('SELECT id FROM profile WHERE id = 1').get();
if (!profileExists) {
  db.prepare(`INSERT INTO profile (id, name, title, bio, skills) VALUES (1, ?, ?, ?, ?)`).run(
    'Nguyen Van A',
    'Full-Stack Developer',
    'Tôi là một lập trình viên full-stack với hơn 3 năm kinh nghiệm xây dựng các ứng dụng web hiện đại. Đam mê tạo ra các sản phẩm chất lượng cao với trải nghiệm người dùng tuyệt vời.',
    JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'AWS'])
  );
  console.log('✅ Default profile created');
}

// Seed sample projects if empty
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
if (projectCount.count === 0) {
  const insertProject = db.prepare(`
    INSERT INTO projects (title, description, live_url, github_url, tech_stack, category, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProject.run(
    'E-Commerce Platform',
    'Nền tảng thương mại điện tử hoàn chỉnh với giỏ hàng, thanh toán online, quản lý sản phẩm và dashboard admin.',
    'https://example.com/ecommerce',
    'https://github.com/example/ecommerce',
    JSON.stringify(['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis']),
    'Web',
    1,
    1
  );

  insertProject.run(
    'Task Management App',
    'Ứng dụng quản lý công việc real-time với drag & drop, notification, và team collaboration.',
    'https://example.com/taskapp',
    'https://github.com/example/taskapp',
    JSON.stringify(['Next.js', 'TypeScript', 'PostgreSQL', 'Socket.io']),
    'Web',
    1,
    2
  );

  insertProject.run(
    'AI Chat Assistant',
    'Trợ lý AI thông minh sử dụng GPT-4 với khả năng phân tích dữ liệu và tạo nội dung tự động.',
    'https://example.com/aichat',
    'https://github.com/example/aichat',
    JSON.stringify(['Python', 'FastAPI', 'React', 'OpenAI', 'Docker']),
    'AI/ML',
    1,
    3
  );

  console.log('✅ Sample projects created');
}

module.exports = db;
