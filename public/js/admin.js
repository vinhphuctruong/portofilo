// ============================================
// Admin Dashboard - JavaScript
// ============================================

const API = '';
let currentProfile = null;
let currentProjects = [];
let currentCategories = [];
let editingProjectId = null;
let deleteProjectId = null;
let editingCategoryId = null;
let profileSkills = [];
let profileServices = [];
let projectTechStack = [];

// --- Auth Helper ---
function getToken() {
  return localStorage.getItem('portfolio_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

function logout() {
  localStorage.removeItem('portfolio_token');
  localStorage.removeItem('portfolio_user');
  window.location.href = '/login.html';
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  if (!getToken()) {
    window.location.href = '/login.html';
    return;
  }

  const username = localStorage.getItem('portfolio_user') || 'Admin';
  document.getElementById('sidebarUser').textContent = username;
  document.getElementById('sidebarAvatar').textContent = username.charAt(0).toUpperCase();

  initTabs();
  initSidebar();
  initProfileForm();
  initProjectsUI();
  initCategoriesUI();
  initSettingsForm();

  loadProfile();
  loadCategories();
  loadProjects();
});

// --- Tabs ---
function initTabs() {
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      document.getElementById(`tab${capitalize(tab)}`).classList.add('active');

      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
    });
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Sidebar ---
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('mobileToggle');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) logout();
  });
}

// ============================================
// PROFILE
// ============================================
async function loadProfile() {
  try {
    const res = await fetch(`${API}/api/profile`);
    currentProfile = await res.json();
    fillProfileForm();
  } catch (err) {
    showToast('Không thể tải thông tin profile', 'error');
  }
}

function fillProfileForm() {
  const p = currentProfile;
  document.getElementById('profileName').value = p.name || '';
  document.getElementById('profileTitle').value = p.title || '';
  document.getElementById('profileBio').value = p.bio || '';
  document.getElementById('profileEmail').value = p.email || '';
  document.getElementById('profilePhone').value = p.phone || '';
  document.getElementById('profileLocation').value = p.location || '';
  document.getElementById('profileGithub').value = p.github || '';
  document.getElementById('profileLinkedin').value = p.linkedin || '';
  document.getElementById('profileWebsite').value = p.website || '';
  document.getElementById('profileResume').value = p.resume_url || '';

  // Avatar preview
  if (p.avatar) {
    document.getElementById('avatarPreview').innerHTML = `<img src="${p.avatar}" alt="Avatar">`;
  }

  // Skills
  profileSkills = Array.isArray(p.skills) ? [...p.skills] : [];
  renderSkillTags('skillsTags', profileSkills);

  // Services
  profileServices = Array.isArray(p.services) ? [...p.services] : [];
  renderSkillTags('servicesTags', profileServices);
}

function initProfileForm() {
  // Avatar upload
  document.getElementById('avatarFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      document.getElementById('avatarPreview').innerHTML = `<img src="${url}" alt="Avatar">`;
      currentProfile.avatar = url;
    }
  });

  // Skills input
  initTagInput('skillInput', 'skillsTags', profileSkills);
  
  // Services input
  initTagInput('serviceInput', 'servicesTags', profileServices);

  // Form submit
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveProfileBtn');
    btn.disabled = true;
    btn.innerHTML = '<span>Đang lưu...</span>';

    try {
      const body = {
        name: document.getElementById('profileName').value,
        title: document.getElementById('profileTitle').value,
        bio: document.getElementById('profileBio').value,
        avatar: currentProfile.avatar || '',
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        location: document.getElementById('profileLocation').value,
        github: document.getElementById('profileGithub').value,
        linkedin: document.getElementById('profileLinkedin').value,
        website: document.getElementById('profileWebsite').value,
        resume_url: document.getElementById('profileResume').value,
        skills: profileSkills,
        services: profileServices
      };

      const res = await fetch(`${API}/api/profile`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      currentProfile = await res.json();
      showToast('Đã lưu thông tin thành công!', 'success');
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu thông tin`;
    }
  });
}

// ============================================
// PROJECTS
// ============================================
async function loadProjects() {
  try {
    const res = await fetch(`${API}/api/projects`);
    currentProjects = await res.json();
    renderProjectsList();
  } catch (err) {
    showToast('Không thể tải danh sách dự án', 'error');
  }
}

function renderProjectsList() {
  const container = document.getElementById('projectsList');

  if (currentProjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
        <h3>Chưa có dự án nào</h3>
        <p>Bấm "Thêm dự án" để bắt đầu thêm dự án vào portfolio.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = currentProjects.map(project => `
    <div class="project-row" data-id="${project.id}">
      <div class="project-row-image">
        ${project.image
          ? `<img src="${project.image}" alt="${project.title}">`
          : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
        }
      </div>
      <div class="project-row-info">
        <div class="project-row-title">
          ${project.featured ? '<span class="featured-dot" title="Nổi bật"></span>' : ''}
          ${project.title}
        </div>
        <div class="project-row-meta">
          <span class="category-badge">${project.category || 'Web'}</span>
          <span>${(project.tech_stack || []).slice(0, 3).join(', ')}${(project.tech_stack || []).length > 3 ? '...' : ''}</span>
        </div>
      </div>
      <div class="project-row-actions">
        ${project.live_url ? `
          <a href="${project.live_url}" target="_blank" class="btn-icon btn-icon-link" title="Xem live demo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        ` : ''}
        <button class="btn-icon" title="Chỉnh sửa" onclick="editProject(${project.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon btn-icon-danger" title="Xóa" onclick="confirmDelete(${project.id}, '${project.title.replace(/'/g, "\\'")}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function initProjectsUI() {
  // Add button
  document.getElementById('addProjectBtn').addEventListener('click', () => {
    editingProjectId = null;
    projectTechStack = [];
    document.getElementById('modalTitle').textContent = 'Thêm dự án mới';
    document.getElementById('projectForm').reset();
    document.getElementById('projectImagePreview').innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span>Click để tải ảnh</span>
    `;
    renderSkillTags('projectTechTags', projectTechStack);
    openModal('projectModal');
  });

  // Image upload click
  document.getElementById('projectImagePreview').addEventListener('click', () => {
    document.getElementById('projectImageFile').click();
  });

  document.getElementById('projectImageFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      document.getElementById('projectImagePreview').innerHTML = `<img src="${url}" alt="Preview">`;
      document.getElementById('projectImagePreview').dataset.url = url;
    }
  });

  // Tech stack input
  initTagInput('projectTechInput', 'projectTechTags', projectTechStack);

  // Modal controls
  document.getElementById('modalClose').addEventListener('click', () => closeModal('projectModal'));
  document.getElementById('modalCancelBtn').addEventListener('click', () => closeModal('projectModal'));

  // Save project
  document.getElementById('modalSaveBtn').addEventListener('click', saveProject);

  // Delete modal
  document.getElementById('deleteCancelBtn').addEventListener('click', () => closeModal('deleteModal'));
  document.getElementById('deleteConfirmBtn').addEventListener('click', deleteProject);

  // Close modals on overlay click
  document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('projectModal');
  });
  document.getElementById('deleteModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal('deleteModal');
  });
}

window.editProject = function(id) {
  const project = currentProjects.find(p => p.id === id);
  if (!project) return;

  editingProjectId = id;
  document.getElementById('modalTitle').textContent = 'Chỉnh sửa dự án';
  document.getElementById('projectTitle').value = project.title || '';
  document.getElementById('projectDescription').value = project.description || '';
  document.getElementById('projectCategory').value = project.category || 'Web';
  document.getElementById('projectLiveUrl').value = project.live_url || '';
  document.getElementById('projectGithubUrl').value = project.github_url || '';
  document.getElementById('projectSortOrder').value = project.sort_order || 0;
  document.getElementById('projectFeatured').checked = !!project.featured;

  // Image
  const preview = document.getElementById('projectImagePreview');
  if (project.image) {
    preview.innerHTML = `<img src="${project.image}" alt="Preview">`;
    preview.dataset.url = project.image;
  } else {
    preview.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span>Click để tải ảnh</span>
    `;
    preview.dataset.url = '';
  }

  // Tech stack
  projectTechStack = Array.isArray(project.tech_stack) ? [...project.tech_stack] : [];
  renderSkillTags('projectTechTags', projectTechStack);

  openModal('projectModal');
};

async function saveProject() {
  const title = document.getElementById('projectTitle').value.trim();
  if (!title) {
    showToast('Vui lòng nhập tên dự án', 'error');
    return;
  }

  const btn = document.getElementById('modalSaveBtn');
  btn.disabled = true;

  const body = {
    title,
    description: document.getElementById('projectDescription').value,
    image: document.getElementById('projectImagePreview').dataset?.url || '',
    live_url: document.getElementById('projectLiveUrl').value,
    github_url: document.getElementById('projectGithubUrl').value,
    tech_stack: projectTechStack,
    category: document.getElementById('projectCategory').value,
    featured: document.getElementById('projectFeatured').checked,
    sort_order: parseInt(document.getElementById('projectSortOrder').value) || 0
  };

  try {
    const url = editingProjectId ? `${API}/api/projects/${editingProjectId}` : `${API}/api/projects`;
    const method = editingProjectId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed');
    }

    showToast(editingProjectId ? 'Đã cập nhật dự án!' : 'Đã thêm dự án mới!', 'success');
    closeModal('projectModal');
    loadProjects();
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

window.confirmDelete = function(id, title) {
  deleteProjectId = id;
  document.getElementById('deleteMessage').textContent = `Bạn có chắc muốn xóa dự án "${title}"? Hành động này không thể hoàn tác.`;
  openModal('deleteModal');
};

async function deleteProject() {
  if (!deleteProjectId) return;

  try {
    const res = await fetch(`${API}/api/projects/${deleteProjectId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    if (!res.ok) throw new Error('Failed to delete');

    showToast('Đã xóa dự án thành công', 'success');
    closeModal('deleteModal');
    loadProjects();
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
}

// ============================================
// CATEGORIES
// ============================================
async function loadCategories() {
  try {
    const res = await fetch(`${API}/api/categories`);
    currentCategories = await res.json();
    renderCategoriesList();
    populateCategoryDropdowns();
  } catch (err) {
    showToast('Không thể tải danh sách danh mục', 'error');
  }
}

function renderCategoriesList() {
  const container = document.getElementById('categoriesList');
  if (currentCategories.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      <h3>Chưa có danh mục nào</h3>
    </div>`;
    return;
  }
  container.innerHTML = currentCategories.map(cat => `
    <div class="project-row">
      <div class="project-row-info">
        <div class="project-row-title">${cat.name}</div>
        <div class="project-row-meta"><span class="category-badge">Thứ tự: ${cat.sort_order || 0}</span></div>
      </div>
      <div class="project-row-actions">
        <button class="btn-icon" title="Chỉnh sửa" onclick="editCategory(${cat.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon btn-icon-danger" title="Xóa" onclick="deleteCategory(${cat.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function populateCategoryDropdowns() {
  const select = document.getElementById('projectCategory');
  select.innerHTML = currentCategories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function initCategoriesUI() {
  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    editingCategoryId = null;
    document.getElementById('categoryModalTitle').textContent = 'Thêm danh mục mới';
    document.getElementById('categoryForm').reset();
    openModal('categoryModal');
  });

  document.getElementById('categoryModalClose').addEventListener('click', () => closeModal('categoryModal'));
  document.getElementById('categoryModalCancelBtn').addEventListener('click', () => closeModal('categoryModal'));
  document.getElementById('categoryModalSaveBtn').addEventListener('click', saveCategory);
}

window.editCategory = function(id) {
  const cat = currentCategories.find(c => c.id === id);
  if (!cat) return;
  editingCategoryId = id;
  document.getElementById('categoryModalTitle').textContent = 'Chỉnh sửa danh mục';
  document.getElementById('categoryName').value = cat.name;
  document.getElementById('categorySortOrder').value = cat.sort_order || 0;
  openModal('categoryModal');
};

async function saveCategory() {
  const name = document.getElementById('categoryName').value.trim();
  const sort_order = parseInt(document.getElementById('categorySortOrder').value) || 0;
  if (!name) return showToast('Vui lòng nhập tên danh mục', 'error');
  
  const btn = document.getElementById('categoryModalSaveBtn');
  btn.disabled = true;

  try {
    const url = editingCategoryId ? `${API}/api/categories/${editingCategoryId}` : `${API}/api/categories`;
    const method = editingCategoryId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ name, sort_order }) });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed');
    showToast(editingCategoryId ? 'Đã cập nhật danh mục' : 'Thêm mới thành công', 'success');
    closeModal('categoryModal');
    loadCategories();
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

window.deleteCategory = async function(id) {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
  try {
    const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to delete');
    showToast('Đã xóa thành công', 'success');
    loadCategories();
  } catch (err) {
    showToast('Lỗi: ' + err.message, 'error');
  }
};

// ============================================
// SETTINGS
// ============================================
function initSettingsForm() {
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu mới không khớp!', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      showToast('Đã đổi mật khẩu thành công!', 'success');
      document.getElementById('passwordForm').reset();
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  });
}

// ============================================
// UTILITIES
// ============================================

// Upload image
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    showToast('Tải ảnh thành công', 'success');
    return data.url;
  } catch (err) {
    showToast('Lỗi tải ảnh: ' + err.message, 'error');
    return null;
  }
}

// Tag input helper
function initTagInput(inputId, containerId, arr) {
  const input = document.getElementById(inputId);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().replace(/,/g, '');
      if (val && !arr.includes(val)) {
        arr.push(val);
        renderSkillTags(containerId, arr);
      }
      input.value = '';
    }

    if (e.key === 'Backspace' && input.value === '' && arr.length > 0) {
      arr.pop();
      renderSkillTags(containerId, arr);
    }
  });
}

function renderSkillTags(containerId, arr) {
  const container = document.getElementById(containerId);
  container.innerHTML = arr.map((tag, i) => `
    <span class="skill-tag">
      ${tag}
      <button class="skill-tag-remove" onclick="removeTag('${containerId}', ${i})">&times;</button>
    </span>
  `).join('');
}

window.removeTag = function(containerId, index) {
  if (containerId === 'skillsTags') {
    profileSkills.splice(index, 1);
    renderSkillTags(containerId, profileSkills);
  } else if (containerId === 'servicesTags') {
    profileServices.splice(index, 1);
    renderSkillTags(containerId, profileServices);
  } else if (containerId === 'projectTechTags') {
    projectTechStack.splice(index, 1);
    renderSkillTags(containerId, projectTechStack);
  }
};

// Modal
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

// Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.innerHTML = `<span style="font-weight:700;font-size:1.1rem">${icons[type] || icons.info}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
