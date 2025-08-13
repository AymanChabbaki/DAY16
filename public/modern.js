const API = '/api/posts';
const postsDiv = document.getElementById('posts');
const form = document.getElementById('postForm');
const cancelEditBtn = document.getElementById('cancelEdit');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');
let editId = null;

function showToast(msg, color = '#2563eb') {
  toast.textContent = msg;
  toast.style.background = color;
  toast.className = 'show';
  setTimeout(() => { toast.className = ''; }, 2200);
}

function tagElements(tags) {
  return (tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ');
}

function postHTML(post) {
  return `<div class="post" data-id="${post.id}">
    <div class="actions">
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </div>
    <h2>${post.title}</h2>
    <div class="meta">By <b>${post.author}</b> • ${new Date(post.createdAt).toLocaleString()}</div>
    <div>${post.content.replace(/\n/g, '<br>')}</div>
    <div class="tags">${tagElements(post.tags)}</div>
  </div>`;
}

async function fetchPosts() {
  const res = await fetch(API);
  const data = await res.json();
  postsDiv.innerHTML = data.data.length
    ? data.data.map(postHTML).join('')
    : '<div style="text-align:center;color:#64748b;">No posts yet. Be the first to write one!</div>';
}

form.onsubmit = async e => {
  e.preventDefault();
  const title = form.title.value.trim();
  const author = form.author.value.trim();
  const tags = form.tags.value.split(',').map(t => t.trim()).filter(Boolean);
  const content = form.content.value.trim();
  if (!title || !author || !content) return showToast('Please fill all required fields', '#ef4444');
  const payload = { title, author, tags, content };
  if (editId) {
    await fetch(`${API}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showToast('Post updated!');
    editId = null;
    submitBtn.textContent = 'Add Post';
    cancelEditBtn.style.display = 'none';
  } else {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showToast('Post created!');
  }
  form.reset();
  fetchPosts();
};

postsDiv.onclick = async e => {
  const postDiv = e.target.closest('.post');
  if (!postDiv) return;
  const id = postDiv.getAttribute('data-id');
  if (e.target.classList.contains('delete')) {
    if (confirm('Delete this post?')) {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      showToast('Post deleted!', '#ef4444');
      fetchPosts();
    }
  }
  if (e.target.classList.contains('edit')) {
    const res = await fetch(`${API}/${id}`);
    const { data: post } = await res.json();
    form.title.value = post.title;
    form.author.value = post.author;
    form.tags.value = (post.tags || []).join(', ');
    form.content.value = post.content;
    editId = id;
    submitBtn.textContent = 'Update Post';
    cancelEditBtn.style.display = '';
    form.scrollIntoView({behavior:'smooth'});
  }
};

cancelEditBtn.onclick = () => {
  editId = null;
  form.reset();
  submitBtn.textContent = 'Add Post';
  cancelEditBtn.style.display = 'none';
};

fetchPosts();
