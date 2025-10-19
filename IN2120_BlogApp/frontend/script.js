// script.js for BlogApp
// Handles authentication, blog management, and UI interactivity

// --- Utility Functions ---
function getUser() {
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

// --- Blog Management ---
function fetchBlogs() {
    return fetch('../backend/get_blogs.php', {
        method: 'POST',
        credentials: 'include'
    }).then(res => res.json());
}

function createOrUpdateBlog(data) {
    const user = getUser();
    if (!user) {
        return Promise.resolve({ success: false, message: 'You must be logged in' });
    }
    return apiRequest('../backend/blog_editor.php', data);
}

function deleteBlogApi(id) {
    return apiRequest('../backend/delete_blog.php', { id });
}

function editBlog(id) {
    window.location.href = `editor.html?id=${id}`;
}

// --- Authentication ---
if (window.location.pathname.endsWith('login.html')) {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
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
}

if (window.location.pathname.endsWith('register.html')) {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            apiRequest('../backend/register.php', { username, email, password, confirmPassword })
                .then(res => {
                    if (res.success) {
                        setUser({ username, email });
                        window.location.href = 'editor.html';
                    } else {
                        showError(res.message);
                    }
                });
        });
    }
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
        const form = document.querySelector('form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(errorDiv, form);
        }
    }
    errorDiv.textContent = msg;
}

function showErrorWithLogin(msg) {
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
        const form = document.querySelector('form');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(errorDiv, form);
        }
    }
    errorDiv.innerHTML = `
        <p>${msg}</p>
        <button onclick="window.location.href='login.html'" style="margin-top: 10px; padding: 8px 16px; background-color: #d291bc; color: white; border: none; border-radius: 5px; cursor: pointer;">Login</button>
    `;
}

// --- HOME PAGE ---
if (window.location.pathname.endsWith('index.html')) {
    const blogList = document.getElementById('blog-list');
    if (blogList) {
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
                blogs.forEach(blog => {
                    const card = document.createElement('div');
                    card.className = 'blog-card';
                    card.innerHTML = `
                        <h2>${blog.title}</h2>
                        <p class="blog-meta">By ${blog.author} on ${blog.created_at}</p>
                        <p class="blog-excerpt">${blog.content.substring(0, 80)}...</p>
                        <a href="blog.html?id=${blog.id}">Read More</a>
                    `;

                    if (userId && userId === blog.user_id) {
                        const actionsDiv = document.createElement('div');
                        actionsDiv.className = 'blog-actions';

                        const editBtn = document.createElement('button');
                        editBtn.textContent = 'Edit';
                        editBtn.addEventListener('click', () => editBlog(blog.id));

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.addEventListener('click', (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (confirm('Are you sure you want to delete this blog?')) {
                                deleteBlogApi(blog.id).then(res => {
                                    if (res.success) {
                                        window.location.href = 'index.html';
                                    } else {
                                        alert(res.message);
                                    }
                                });
                            }
                        });

                        actionsDiv.appendChild(editBtn);
                        actionsDiv.appendChild(deleteBtn);
                        card.appendChild(actionsDiv);
                    }

                    blogList.appendChild(card);
                });
            }
        });
    }
}

// --- BLOG VIEW PAGE ---
if (window.location.pathname.endsWith('blog.html')) {
    const blogContent = document.getElementById('blog-content');
    if (blogContent) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        fetchBlogs().then(res => {
            const blogs = res.blogs || [];
            const userId = res.currentUserId;
            const blog = blogs.find(b => b.id == id);

            if (blog) {
                blogContent.innerHTML = `
                    <h2>${blog.title}</h2>
                    <p class="blog-meta">By ${blog.author} on ${blog.created_at}</p>
                    <div class="blog-body">${blog.content}</div>
                `;

                if (userId && userId === blog.user_id) {
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'blog-actions';

                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => {
                        window.location.href = `editor.html?id=${blog.id}`;
                    });

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (confirm('Are you sure you want to delete this blog?')) {
                            deleteBlogApi(blog.id).then(res => {
                                if (res.success) {
                                    window.location.href = 'index.html';
                                } else {
                                    alert(res.message);
                                }
                            });
                        }
                    });

                    actionsDiv.appendChild(editBtn);
                    actionsDiv.appendChild(deleteBtn);
                    blogContent.appendChild(actionsDiv);
                }
            }
        });
    }
}

// --- EDITOR PAGE ---
if (window.location.pathname.endsWith('editor.html')) {
    const form = document.querySelector('form');
    if (form) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        const user = getUser();
        if (!user) {
            showErrorWithLogin('You must be logged in');
            form.style.display = 'none';
        } else {
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

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('title').value;
                const content = document.getElementById('content').value;
                const data = { title, content };
                if (id) data.id = id;

                createOrUpdateBlog(data).then(res => {
                    if (res.success) {
                        window.location.href = 'index.html';
                    } else {
                        showErrorWithLogin(res.message);
                    }
                });
            });
        }
    }
}

// --- LOGOUT ---
function logoutUserApi() {
    fetch('../backend/logout.php', {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });
}

// --- SHOW/HIDE NAV BASED ON AUTH ---
document.addEventListener('DOMContentLoaded', () => {
    const user = getUser();
    const nav = document.querySelector('nav');
    if (nav && user) {
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
        nav.appendChild(logoutLink);

        Array.from(nav.querySelectorAll('a')).forEach(a => {
            if (a.textContent === 'Login' || a.textContent === 'Register') {
                a.style.display = 'none';
            }
        });
    }
});