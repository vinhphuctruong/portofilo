// ============================================
// Portfolio App - Public Frontend
// ============================================

const API = '';

// --- State ---
let profileData = null;
let projectsData = [];
let activeFilter = 'all';

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadProjects();
  initNavbar();
  initScrollReveal();
  document.getElementById('footerYear').textContent = new Date().getFullYear();
});

// --- API Calls ---
async function loadProfile() {
  try {
    const res = await fetch(`${API}/api/profile`);
    profileData = await res.json();
    renderProfile();
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

async function loadProjects() {
  try {
    const res = await fetch(`${API}/api/projects`);
    projectsData = await res.json();
    renderFilters();
    renderProjects();
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

// --- Render Profile ---
function renderProfile() {
  const p = profileData;

  // Update page title
  document.title = `${p.name} | ${p.title}`;

  // Hero
  document.getElementById('heroName').textContent = p.name;
  document.getElementById('heroTitle').textContent = p.title;
  document.getElementById('heroBio').textContent = p.bio;
  document.getElementById('footerName').textContent = p.name;

  // Avatar
  const avatarEl = document.getElementById('heroAvatar');
  if (p.avatar) {
    avatarEl.innerHTML = `<img src="${p.avatar}" alt="${p.name}" />`;
  }

  // Resume button
  if (p.resume_url) {
    const resumeBtn = document.getElementById('heroResume');
    resumeBtn.href = p.resume_url;
    resumeBtn.target = '_blank';
    resumeBtn.style.display = 'inline-flex';
  }

  // About bio
  document.getElementById('aboutBio').textContent = p.bio;

  // About info items
  const infoContainer = document.getElementById('aboutInfo');
  infoContainer.innerHTML = '';

  const infoItems = [
    { icon: 'mail', label: 'Email', value: p.email, link: `mailto:${p.email}` },
    { icon: 'phone', label: 'Điện thoại', value: p.phone, link: `tel:${p.phone}` },
    { icon: 'map-pin', label: 'Địa điểm', value: p.location },
    { icon: 'globe', label: 'Website', value: p.website, link: p.website },
  ];

  infoItems.forEach(item => {
    if (!item.value) return;
    const el = document.createElement('div');
    el.className = 'info-item';
    el.innerHTML = `
      <div>${getIcon(item.icon)}</div>
      <div>
        <div class="info-label">${item.label}</div>
        <div class="info-value">${item.link ? `<a href="${item.link}" target="_blank">${item.value}</a>` : item.value}</div>
      </div>
    `;
    infoContainer.appendChild(el);
  });

  // Skills
  const skillsGrid = document.getElementById('skillsGrid');
  skillsGrid.innerHTML = '';
  (p.skills || []).forEach(skill => {
    const badge = document.createElement('span');
    badge.className = 'skill-badge';
    badge.textContent = skill;
    skillsGrid.appendChild(badge);
  });

  // Contact cards
  renderContact();
}

function renderContact() {
  const p = profileData;
  const cardsContainer = document.getElementById('contactCards');
  const socialsContainer = document.getElementById('contactSocials');

  cardsContainer.innerHTML = '';
  socialsContainer.innerHTML = '';

  // Contact cards
  if (p.email) {
    cardsContainer.innerHTML += `
      <div class="contact-card">
        ${getIcon('mail', 32)}
        <h4>Email</h4>
        <p><a href="mailto:${p.email}">${p.email}</a></p>
      </div>
    `;
  }

  if (p.phone) {
    cardsContainer.innerHTML += `
      <div class="contact-card">
        ${getIcon('phone', 32)}
        <h4>Điện thoại</h4>
        <p><a href="tel:${p.phone}">${p.phone}</a></p>
      </div>
    `;
  }

  if (p.location) {
    cardsContainer.innerHTML += `
      <div class="contact-card">
        ${getIcon('map-pin', 32)}
        <h4>Địa điểm</h4>
        <p>${p.location}</p>
      </div>
    `;
  }

  // Social links
  const socials = [
    { key: 'github', icon: 'github', url: p.github },
    { key: 'linkedin', icon: 'linkedin', url: p.linkedin },
    { key: 'website', icon: 'globe', url: p.website },
  ];

  socials.forEach(s => {
    if (!s.url) return;
    socialsContainer.innerHTML += `
      <a href="${s.url}" target="_blank" rel="noopener" class="social-link" title="${s.key}">
        ${getIcon(s.icon, 22)}
      </a>
    `;
  });
}

// --- Render Projects ---
function renderFilters() {
  const filterContainer = document.getElementById('projectsFilter');
  const categories = ['all', ...new Set(projectsData.map(p => p.category).filter(Boolean))];

  filterContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn${cat === activeFilter ? ' active' : ''}`;
    btn.dataset.filter = cat;
    btn.textContent = cat === 'all' ? 'Tất cả' : cat;
    btn.addEventListener('click', () => {
      activeFilter = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects();
    });
    filterContainer.appendChild(btn);
  });
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';

  const filtered = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 3rem;">Chưa có dự án nào.</p>`;
    return;
  }

  filtered.forEach((project, i) => {
    const card = document.createElement('div');
    card.className = 'project-card reveal';
    card.style.transitionDelay = `${i * 0.1}s`;

    const imageHtml = project.image
      ? `<img src="${project.image}" alt="${project.title}" loading="lazy" />`
      : `<div class="project-image-placeholder">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21 15 16 10 5 21"/>
           </svg>
         </div>`;

    const techHtml = (project.tech_stack || [])
      .map(t => `<span class="tech-tag">${t}</span>`)
      .join('');

    let linksHtml = '';
    if (project.live_url) {
      linksHtml += `<a href="${project.live_url}" target="_blank" rel="noopener" class="project-link project-link-live">
        ${getIcon('external-link', 16)} Live Demo
      </a>`;
    }
    if (project.github_url) {
      linksHtml += `<a href="${project.github_url}" target="_blank" rel="noopener" class="project-link project-link-github">
        ${getIcon('github', 16)} GitHub
      </a>`;
    }

    card.innerHTML = `
      <div class="project-image">
        ${imageHtml}
        ${project.featured ? '<span class="project-featured-badge">Featured</span>' : ''}
        ${project.category ? `<span class="project-category-badge">${project.category}</span>` : ''}
      </div>
      <div class="project-body">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tech">${techHtml}</div>
        <div class="project-links">${linksHtml}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Trigger scroll reveal for new cards
  setTimeout(() => {
    document.querySelectorAll('.project-card.reveal').forEach(el => {
      observeElement(el);
    });
  }, 50);
}

// --- Navbar ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNav();
  });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close mobile menu on link click
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    });
  });
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}

// --- Scroll Reveal ---
function initScrollReveal() {
  document.querySelectorAll('.section-title, .about-text, .about-skills, .contact-card').forEach(el => {
    el.classList.add('reveal');
    observeElement(el);
  });
}

function observeElement(el) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(el);
}

// --- Icon Helper ---
function getIcon(name, size = 20) {
  const icons = {
    mail: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    phone: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    'map-pin': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    globe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    github: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
    linkedin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    'external-link': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  };
  return icons[name] || '';
}
