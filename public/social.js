// Social Media Blog App - JavaScript

// State management
let posts = [];
let currentEditingId = null;
let currentPage = 1;
let postLikes = JSON.parse(localStorage.getItem('postLikes') || '{}');
let postComments = JSON.parse(localStorage.getItem('postComments') || '{}');
let currentUser = localStorage.getItem('currentUser') || 'Anonymous';

// Search debouncing
let searchTimeout;
const SEARCH_DELAY = 300;

// DOM elements
const modal = document.getElementById('modal-overlay');
const postForm = document.getElementById('postForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submit-text');
const modalTitle = document.getElementById('modal-title');
const cancelEditBtn = document.getElementById('cancelEdit');
const searchInput = document.getElementById('searchInput');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  lucide.createIcons();
  setupEventListeners();
  loadPosts();
  loadStats();
  initializeTheme();
}

function setupEventListeners() {
  // Form submission
  postForm.addEventListener('submit', handleSubmit);
  
  // Search functionality (if search input exists)
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeCreateModal();
    }
  });
}

// Modal functions
function openCreateModal() {
  currentEditingId = null;
  postForm.reset();
  modalTitle.innerHTML = '<i data-lucide="edit-3"></i> Create Post';
  submitText.textContent = 'Publish';
  submitBtn.className = 'btn-primary';
  cancelEditBtn.style.display = 'none';
  modal.classList.add('show');
  lucide.createIcons();
  
  // Focus on title input
  setTimeout(() => {
    document.getElementById('title').focus();
  }, 100);
}

function closeCreateModal() {
  modal.classList.remove('show');
  currentEditingId = null;
  postForm.reset();
}

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(postForm);
  const postData = {
    title: formData.get('title') || document.getElementById('title').value,
    content: formData.get('content') || document.getElementById('content').value,
    author: formData.get('author') || document.getElementById('author').value,
    tags: formData.get('tags') || document.getElementById('tags').value
  };

  // Basic validation
  if (!postData.title || !postData.content || !postData.author) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitText.textContent = currentEditingId ? 'Updating...' : 'Publishing...';

    const url = currentEditingId ? `/api/posts/${currentEditingId}` : '/api/posts';
    const method = currentEditingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    if (!response.ok) throw new Error('Failed to save post');

    closeCreateModal();
    showToast(currentEditingId ? 'Post updated successfully!' : 'Post published successfully!', 'success');
    loadPosts();
    loadStats();
  } catch (error) {
    console.error('Error saving post:', error);
    showToast('Failed to save post. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = currentEditingId ? 'Update' : 'Publish';
  }
}

// Load and display posts
async function loadPosts(searchQuery = '') {
  try {
    const url = searchQuery ? `/api/posts/search?q=${encodeURIComponent(searchQuery)}` : '/api/posts';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Loaded data:', data); // Debug log
    
    // Handle both array responses and object responses
    if (Array.isArray(data)) {
      posts = data;
    } else if (data && Array.isArray(data.posts)) {
      posts = data.posts;
    } else if (data && data.data && Array.isArray(data.data)) {
      posts = data.data;
    } else {
      console.warn('Unexpected data format:', data);
      posts = [];
    }
    
    // Ensure posts are sorted by creation date (newest first) as a backup
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderPosts(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
    const feedContainer = document.getElementById('posts-feed') || document.getElementById('posts');
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div class="error" style="text-align: center; padding: 40px; color: #e74c3c;">
          <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 16px;"></i>
          <h3>Failed to load posts</h3>
          <p>Please check your connection and refresh the page</p>
          <button onclick="loadPosts()" style="margin-top: 16px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry</button>
        </div>
      `;
      lucide.createIcons();
    }
  }
}

// Render posts in social media style
function renderPosts(postsToRender) {
  const feedContainer = document.getElementById('posts-feed') || document.getElementById('posts');
  if (!feedContainer) return;

  // Ensure postsToRender is an array
  if (!Array.isArray(postsToRender)) {
    console.error('renderPosts: Expected array, got:', typeof postsToRender, postsToRender);
    postsToRender = [];
  }

  if (postsToRender.length === 0) {
    feedContainer.innerHTML = `
      <div class="no-posts">
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i data-lucide="message-circle" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3 style="margin: 0 0 8px 0; color: var(--text-secondary);">No posts yet</h3>
          <p style="margin: 0;">Be the first to share something!</p>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  feedContainer.innerHTML = postsToRender.map(post => createPostCard(post)).join('');
  lucide.createIcons();
}

// Create individual post card
function createPostCard(post) {
  const timeAgo = formatTimeAgo(post.createdAt);
  const authorInitial = post.author.charAt(0).toUpperCase();
  
  // Handle tags - can be string or array
  let tags = [];
  if (post.tags) {
    if (Array.isArray(post.tags)) {
      tags = post.tags;
    } else if (typeof post.tags === 'string') {
      tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
  }

  // Get like and comment counts
  const isLiked = postLikes[post.id] || false;
  const comments = postComments[post.id] || [];
  const commentCount = comments.length;

  return `
    <div class="post-card" data-id="${post.id}">
      <div class="post-header">
        <div class="post-author-info">
          <div class="post-avatar">${authorInitial}</div>
          <div class="post-meta">
            <div class="post-author">${escapeHtml(post.author)}</div>
            <div class="post-time">${timeAgo}</div>
          </div>
        </div>
        <div class="post-actions-header">
          <button class="post-action-btn" onclick="editPost('${post.id}')" title="Edit post">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="post-action-btn" onclick="deletePost('${post.id}')" title="Delete post">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      
      <div class="post-title">${escapeHtml(post.title)}</div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      
      ${tags.length > 0 ? `
        <div class="post-tags">
          ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      
      <div class="post-footer">
        <button class="post-footer-btn ${isLiked ? 'like-active' : ''}" onclick="toggleLike('${post.id}')">
          <i data-lucide="heart"></i>
          <span>${isLiked ? 'Liked' : 'Like'}</span>
        </button>
        <button class="post-footer-btn" onclick="sharePost('${post.id}')">
          <i data-lucide="share"></i>
          <span>Share</span>
        </button>
        <button class="post-footer-btn" onclick="toggleComments('${post.id}')">
          <i data-lucide="message-circle"></i>
          <span>Comment</span>
          ${commentCount > 0 ? `<span class="comment-count">${commentCount}</span>` : ''}
        </button>
      </div>
      
      <!-- Comments Section -->
      <div class="comments-section" id="comments-${post.id}">
        <div class="comment-form">
          <div class="comment-avatar">${currentUser.charAt(0).toUpperCase()}</div>
          <div class="comment-input-container">
            <textarea 
              class="comment-input" 
              placeholder="Write a comment..." 
              id="comment-input-${post.id}"
              onkeypress="handleCommentKeyPress(event, '${post.id}')"
            ></textarea>
            <button class="comment-submit" onclick="addComment('${post.id}')">
              <i data-lucide="send"></i>
            </button>
          </div>
        </div>
        
        <div class="comments-list" id="comments-list-${post.id}">
          ${comments.length === 0 ? 
            '<div class="comments-empty">No comments yet. Be the first to comment!</div>' :
            comments.map(comment => createCommentHTML(comment)).join('')
          }
        </div>
      </div>
    </div>
  `;
}

// Social media interactions
function toggleLike(postId) {
  const btn = event.currentTarget;
  const icon = btn.querySelector('i');
  const span = btn.querySelector('span');
  
  // Toggle like state
  postLikes[postId] = !postLikes[postId];
  
  // Update UI
  if (postLikes[postId]) {
    btn.classList.add('like-active');
    span.textContent = 'Liked';
    showToast('❤️ Post liked!', 'success');
  } else {
    btn.classList.remove('like-active');
    span.textContent = 'Like';
    showToast('💔 Like removed', 'info');
  }
  
  // Save to localStorage
  localStorage.setItem('postLikes', JSON.stringify(postLikes));
  lucide.createIcons();
}

function sharePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (post && navigator.share) {
    navigator.share({
      title: post.title,
      text: post.content,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    const url = `${window.location.href}#post-${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('🔗 Link copied to clipboard!', 'success');
    });
  }
}

function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection) {
    if (commentsSection.classList.contains('show')) {
      commentsSection.classList.remove('show');
    } else {
      commentsSection.classList.add('show');
      // Focus on comment input
      setTimeout(() => {
        const commentInput = document.getElementById(`comment-input-${postId}`);
        if (commentInput) commentInput.focus();
      }, 100);
    }
  }
}

function createCommentHTML(comment) {
  const timeAgo = formatTimeAgo(comment.createdAt);
  const authorInitial = comment.author.charAt(0).toUpperCase();
  
  return `
    <div class="comment-item">
      <div class="comment-avatar">${authorInitial}</div>
      <div class="comment-content">
        <div class="comment-author">${escapeHtml(comment.author)}</div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
        <div class="comment-time">${timeAgo}</div>
      </div>
    </div>
  `;
}

function addComment(postId) {
  const commentInput = document.getElementById(`comment-input-${postId}`);
  const commentText = commentInput.value.trim();
  
  if (!commentText) {
    showToast('Please write a comment first', 'error');
    return;
  }
  
  // Create comment object
  const comment = {
    id: Date.now().toString(),
    text: commentText,
    author: currentUser,
    createdAt: new Date().toISOString()
  };
  
  // Add to comments array
  if (!postComments[postId]) {
    postComments[postId] = [];
  }
  postComments[postId].unshift(comment); // Add to beginning
  
  // Save to localStorage
  localStorage.setItem('postComments', JSON.stringify(postComments));
  
  // Update UI
  updateCommentsDisplay(postId);
  commentInput.value = '';
  
  // Update comment count in footer
  updateCommentCount(postId);
  
  showToast('💬 Comment added!', 'success');
}

function updateCommentsDisplay(postId) {
  const commentsList = document.getElementById(`comments-list-${postId}`);
  const comments = postComments[postId] || [];
  
  if (commentsList) {
    if (comments.length === 0) {
      commentsList.innerHTML = '<div class="comments-empty">No comments yet. Be the first to comment!</div>';
    } else {
      // Sort comments by timestamp (newest first)
      const sortedComments = [...comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      commentsList.innerHTML = sortedComments.map(comment => createCommentHTML(comment)).join('');
    }
    lucide.createIcons();
  }
}

function updateCommentCount(postId) {
  const commentBtn = document.querySelector(`[onclick="toggleComments('${postId}')"]`);
  const comments = postComments[postId] || [];
  const existingCount = commentBtn.querySelector('.comment-count');
  
  if (comments.length > 0) {
    if (existingCount) {
      existingCount.textContent = comments.length;
    } else {
      const countSpan = document.createElement('span');
      countSpan.className = 'comment-count';
      countSpan.textContent = comments.length;
      commentBtn.appendChild(countSpan);
    }
  } else if (existingCount) {
    existingCount.remove();
  }
}

function handleCommentKeyPress(event, postId) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    addComment(postId);
  }
}

// Set current user function
function setCurrentUser() {
  const userName = prompt('Enter your name for comments:', currentUser);
  if (userName && userName.trim()) {
    currentUser = userName.trim();
    localStorage.setItem('currentUser', currentUser);
    showToast(`👋 Welcome ${currentUser}!`, 'success');
    // Refresh posts to update comment avatars
    renderPosts(posts);
  }
}

// Edit post
function editPost(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  currentEditingId = id;
  
  document.getElementById('title').value = post.title;
  document.getElementById('content').value = post.content;
  document.getElementById('author').value = post.author;
  
  // Handle tags - convert array to string if needed
  let tagsValue = '';
  if (post.tags) {
    if (Array.isArray(post.tags)) {
      tagsValue = post.tags.join(', ');
    } else if (typeof post.tags === 'string') {
      tagsValue = post.tags;
    }
  }
  document.getElementById('tags').value = tagsValue;
  
  modalTitle.innerHTML = '<i data-lucide="edit-3"></i> Edit Post';
  submitText.textContent = 'Update';
  submitBtn.className = 'btn-primary';
  cancelEditBtn.style.display = 'inline-flex';
  
  modal.classList.add('show');
  lucide.createIcons();
  
  // Focus on title
  setTimeout(() => {
    document.getElementById('title').focus();
  }, 100);
}

// Delete post
async function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete post');

    showToast('Post deleted successfully!', 'success');
    loadPosts();
    loadStats();
  } catch (error) {
    console.error('Error deleting post:', error);
    showToast('Failed to delete post. Please try again.', 'error');
  }
}

// Search functionality
function handleSearch(e) {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
  
  searchTimeout = setTimeout(() => {
    loadPosts(query);
  }, SEARCH_DELAY);
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch('/api/posts/stats');
    if (!response.ok) throw new Error('Failed to load stats');
    
    const result = await response.json();
    console.log('Stats response:', result); // Debug log
    
    // Handle the nested data structure
    const stats = result.data || result;
    updateStats(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Update statistics display
function updateStats(stats) {
  console.log('Updating stats with:', stats); // Debug log
  
  const totalPostsEl = document.getElementById('total-posts');
  const totalAuthorsEl = document.getElementById('total-authors');
  const totalTagsEl = document.getElementById('total-tags');

  if (totalPostsEl) totalPostsEl.textContent = stats.totalPosts || 0;
  if (totalAuthorsEl) totalAuthorsEl.textContent = stats.totalAuthors || 0;
  if (totalTagsEl) totalTagsEl.textContent = stats.totalTags || 0;

  // Always show stats if there are any posts
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    if (stats.totalPosts > 0) {
      statsBar.style.display = 'grid';
    } else {
      // Keep hidden if no posts
      statsBar.style.display = 'none';
    }
  }
}

// Theme management
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update theme icon
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
  }
  
  lucide.createIcons();
  showToast(`🎨 Theme switched to ${newTheme} mode`, 'info');
}

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update theme icon
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  }
}

// Navigation functions for navbar
function scrollToSection(sectionId) {
  if (sectionId === 'form-section') {
    openCreateModal();
  } else if (sectionId === 'posts-section') {
    const feedContainer = document.getElementById('posts-feed');
    if (feedContainer) {
      feedContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function scrollToFeed() {
  const feedContainer = document.getElementById('posts-feed');
  if (feedContainer) {
    feedContainer.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showStats() {
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    const isCurrentlyHidden = statsBar.style.display === 'none' || getComputedStyle(statsBar).display === 'none';
    
    if (isCurrentlyHidden) {
      // First load stats to ensure we have current data
      loadStats().then(() => {
        statsBar.style.display = 'grid';
        statsBar.style.opacity = '0';
        statsBar.style.transform = 'translateY(-10px)';
        
        // Animate in
        requestAnimationFrame(() => {
          statsBar.style.transition = 'all 0.3s ease';
          statsBar.style.opacity = '1';
          statsBar.style.transform = 'translateY(0)';
        });
        
        // Scroll to stats
        setTimeout(() => {
          statsBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        
        showToast('📊 Stats are now visible', 'success');
      });
    } else {
      // Animate out
      statsBar.style.transition = 'all 0.3s ease';
      statsBar.style.opacity = '0';
      statsBar.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        statsBar.style.display = 'none';
      }, 300);
      
      showToast('📊 Stats hidden', 'info');
    }
  } else {
    showToast('Stats section not found', 'error');
  }
}

// Utility functions
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatTimeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return postDate.toLocaleDateString();
}

function showToast(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `toast toast-${type}`;
  
  // Toast styles
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    opacity: '0',
    transform: 'translateX(100%)',
    transition: 'all 0.3s ease',
    zIndex: '10000',
    maxWidth: '300px'
  });
  
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 100);

  // Hide toast
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
