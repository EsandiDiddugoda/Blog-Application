// script.js for BlogApp
// Handles authentication, blog management, and UI interactivity

// --- Utility Functions ---
function getUser() {
    // Get user from localStorage (simulate authentication)
    return JSON.parse(localStorage.getItem('user'));
}
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}
function logoutUser() {
    logoutUserApi();
}

// --- AJAX Utility ---
function apiRequest(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    }).then(res => res.json());
}

// --- Authentication ---
if (window.location.pathname.endsWith('login.html')) {
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        apiRequest('../backend/login.php', { username, password })
            .then(res => {
                if (res.success) {
                    setUser({ username });
                    window.location.href = 'index.html';
                } else {
                    showError(res.message);
                }
            });
    });
}
if (window.location.pathname.endsWith('register.html')) {
    document.querySelector('form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        apiRequest('../backend/register.php', { username, email, password, confirmPassword })
            .then(res => {
                if (res.success) {
                    setUser({ username, email });
                    window.location.href = 'index.html';
                } else {
                    showError(res.message);
                }
            });
    });
}

function showError(msg) {
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.color = '#d291bc';
        errorDiv.style.background = '#ffe4ec';
        errorDiv.style.borderRadius = '10px';
        errorDiv.style.padding = '10px';
        errorDiv.style.margin = '10px 0';
        errorDiv.style.textAlign = 'center';
        document.querySelector('form').parentNode.insertBefore(errorDiv, document.querySelector('form'));
    }
    errorDiv.textContent = msg;
}

// --- Blog Management ---
function fetchBlogs() {
    return fetch('../backend/get_blogs.php', {
        method: 'POST',
        credentials: 'include'
    }).then(res => res.json());
}
function createOrUpdateBlog(data) {
    return apiRequest('../backend/blog_editor.php', data);
}
function deleteBlogApi(id) {
    return apiRequest('../backend/delete_blog.php', { id });
}

// Home page: Display blogs
if (window.location.pathname.endsWith('index.html')) {
    const blogList = document.getElementById('blog-list');
    fetchBlogs().then(res => {
        blogList.innerHTML = '';
        const blogs = res.blogs || [];
        const userId = res.currentUserId;

        if (blogs.length === 0) {
            blogList.innerHTML = `
                <div class="blog-card">
                    <h2>Sample Blog Title</h2>
                    <p class="blog-meta">By Author Name on 2025-10-17</p>
                    <p class="blog-excerpt">This is a short excerpt of the blog post...</p>
                    <a href="blog.html">Read More</a>
                </div>
            `;
        } else {
            blogs.forEach((blog, idx) => {
    const card = document.createElement('div');
    card.className = 'blog-card';

    // Blog content
    card.innerHTML = `
        <h2>${blog.title}</h2>
        <p class="blog-meta">By ${blog.author} on ${blog.created_at}</p>
        <p class="blog-excerpt">${blog.content.substring(0, 80)}...</p>
        <a href="blog.html?id=${blog.id}">Read More</a>
    `;

    // Actions (Edit/Delete) only for the owner
    if (userId && userId === blog.user_id) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'blog-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editBlog(blog.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function(event) {
            event.preventDefault();
            event.stopPropagation();
            // Show confirmation popup before deleting
            if (confirm('Are you sure you want to delete this blog?')) {
                deleteBlogApi(blog.id).then(res => {
                    if (res.success) {
                        window.location.href = 'index.html';
                    } else {
                        alert(res.message);
                    }
                });
            }
        };

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        card.appendChild(actionsDiv);
    }

    blogList.appendChild(card);
});
        }
    });
}

// Blog view page: Show single blog
const actionsDiv = document.createElement('div');
actionsDiv.className = 'blog-actions';

// Edit button
const editBtn = document.createElement('button');
editBtn.textContent = 'Edit';
editBtn.addEventListener('click', () => {
    window.location.href = `editor.html?id=${blog.id}`;
});

// Delete button with confirmation
const deleteBtn = document.createElement('button');
deleteBtn.textContent = 'Delete';
deleteBtn.onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    // Show confirmation popup before deleting
    if (confirm('Are you sure you want to delete this blog?')) {
        deleteBlogApi(blog.id).then(res => {
            if (res.success) {
                window.location.href = 'index.html';
            } else {
                alert(res.message);
            }
        });
    }
};

actionsDiv.appendChild(editBtn);
actionsDiv.appendChild(deleteBtn);
card.appendChild(actionsDiv);

// Blog editor page: Create or update blog
if (window.location.pathname.endsWith('editor.html')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const form = document.querySelector('form');
    if (id) {
        fetchBlogs().then(res => {
            const blogs = res.blogs || [];
            const blog = blogs.find(b => b.id == id);
            if (blog) {
                document.getElementById('title').value = blog.title;
                document.getElementById('content').value = blog.content;
            }
        });
    }
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const data = { title, content };
        if (id) data.id = id;
        createOrUpdateBlog(data).then(res => {
            if (res.success) {
                window.location.href = 'index.html';
            } else {
                showError(res.message);
            }
        });
    });
}

// Edit and Delete functions for blog.html
window.editBlog = function(id) {
    window.location.href = `editor.html?id=${id}`;
};

// Logout link
function logoutUserApi() {
    fetch('../backend/logout.php', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

// --- UI: Show/Hide navigation links based on authentication ---
document.addEventListener('DOMContentLoaded', function() {
    const user = getUser();
    const nav = document.querySelector('nav');
    if (user) {
        // Show logout link
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.onclick = function(e) {
            e.preventDefault();
            logoutUser();
        };
        nav.appendChild(logoutLink);
        // Hide login/register links
        Array.from(nav.querySelectorAll('a')).forEach(a => {
            if (a.textContent === 'Login' || a.textContent === 'Register') {
                a.style.display = 'none';
            }
        });
    }
});

// --- Responsive UI and error handling can be further improved with backend integration ---
// For demo, all data is stored in localStorage and authentication is simulated.
