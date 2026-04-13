document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger Progress Bar animation if in view
                if (entry.target.classList.contains('skills-bars')) {
                    const progressBars = entry.target.querySelectorAll('.progress');
                    progressBars.forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        bar.style.width = width;
                    });
                }
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // 2. Navbar style on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
            navbar.style.padding = '0.8rem 5%';
        } else {
            navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.05)';
            navbar.style.padding = '1.2rem 5%';
        }
    });

    // 3. Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Initial trigger for elements already in viewport on load
    setTimeout(() => {
        const event = new Event('scroll');
        window.dispatchEvent(event);
    }, 100);

    // 5. Q&A Board (localStorage)
    const postForm = document.getElementById('post-form');
    const boardList = document.getElementById('board-list');

    let posts = JSON.parse(localStorage.getItem('portfolio_posts')) || [];

    function savePosts() {
        localStorage.setItem('portfolio_posts', JSON.stringify(posts));
    }

    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function renderPosts() {
        if(!boardList) return;
        boardList.innerHTML = '';
        if (posts.length === 0) {
            boardList.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:2rem;">등록된 글이 아직 없습니다.</p>';
            return;
        }

        posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'post-item';
            
            let repliesHtml = '';
            if (post.replies && post.replies.length > 0) {
                repliesHtml = '<div class="replies">';
                post.replies.forEach(reply => {
                    const cleanReplyContent = escapeHtml(reply.content);
                    const cleanReplyAuthor = escapeHtml(reply.author);
                    repliesHtml += `
                        <div class="reply-item">
                            <span class="reply-author">↳ ${cleanReplyAuthor}</span>
                            <p class="reply-content">${cleanReplyContent}</p>
                        </div>
                    `;
                });
                repliesHtml += '</div>';
            }

            const cleanContent = escapeHtml(post.content);
            const cleanAuthor = escapeHtml(post.author);

            postEl.innerHTML = `
                <div class="post-header">
                    <span class="post-author">${cleanAuthor}</span>
                    <span class="post-date">${new Date(post.date).toLocaleString()}</span>
                </div>
                <div class="post-content" id="content-${post.id}">${cleanContent}</div>
                <div class="post-actions">
                    <button class="action-btn" onclick="toggleReply(${post.id})">답글</button>
                    <button class="action-btn" onclick="editPost(${post.id})">수정</button>
                    <button class="action-btn btn-danger" onclick="deletePost(${post.id})">삭제</button>
                </div>
                <!-- Reply Form (Hidden by default) -->
                <form class="reply-form" id="reply-form-${post.id}" onsubmit="submitReply(event, ${post.id})">
                    <input type="text" id="reply-author-${post.id}" class="board-form-input" style="padding:0.8rem; border:1px solid #e0e0e0; border-radius:5px;" placeholder="작성자 명" required>
                    <input type="text" id="reply-content-${post.id}" class="board-form-input" style="padding:0.8rem; border:1px solid #e0e0e0; border-radius:5px;" placeholder="답글 내용" required>
                    <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1rem; border:none; display:inline-block; font-size:0.9rem; margin-top:0.5rem; cursor:pointer;">답글 등록</button>
                </form>
                ${repliesHtml}
            `;
            boardList.appendChild(postEl);
        });
    }

    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = document.getElementById('post-author').value;
            const content = document.getElementById('post-content').value;

            const newPost = {
                id: Date.now(),
                author,
                content,
                date: new Date().toISOString(),
                replies: []
            };

            posts.unshift(newPost);
            savePosts();
            renderPosts();
            postForm.reset();
        });

        // Initial render
        renderPosts();
    }

    // Global functions for inline handlers
    window.deletePost = function(id) {
        if(confirm('이 게시글을 정말 삭제하시겠습니까?')) {
            posts = posts.filter(p => p.id !== id);
            savePosts();
            renderPosts();
        }
    };

    window.editPost = function(id) {
        const post = posts.find(p => p.id === id);
        if(!post) return;
        const newContent = prompt('수정할 내용을 입력하세요:', post.content);
        if(newContent !== null && newContent.trim() !== '') {
            post.content = newContent;
            post.date = new Date().toISOString(); 
            savePosts();
            renderPosts();
        }
    };

    window.toggleReply = function(id) {
        const form = document.getElementById(`reply-form-${id}`);
        form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
    };

    window.submitReply = function(e, id) {
        e.preventDefault();
        const author = document.getElementById(`reply-author-${id}`).value;
        const content = document.getElementById(`reply-content-${id}`).value;
        
        const post = posts.find(p => p.id === id);
        if(post) {
            post.replies.push({
                author,
                content,
                date: new Date().toISOString()
            });
            savePosts();
            renderPosts();
        }
    };
});
