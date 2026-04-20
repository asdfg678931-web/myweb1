/**
 * Portfolio Interaction Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon between bars and times
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // 2. Smooth Scrolling to Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for fixed header
                const headerHeight = document.querySelector('.header-container').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    });

    // 3. Highlight Active Nav Item on Scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        const headerHeight = document.querySelector('.header-container').offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - headerHeight - 100)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // 4. Content Tabs Interaction
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.process-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all btns/panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active to clicked btn and corresponding pane
            btn.classList.add('active');
            const targetPaneId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetPaneId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // 5. Skill Progress Bar Animation on Scroll
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const animateSkills = () => {
        skillBars.forEach(bar => {
            const barPosition = bar.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (barPosition < screenPosition && bar.style.width !== bar.getAttribute('data-width')) {
                // To keep the HTML style="width: 90%" intact during initial page load, 
                // we'll manage an init-anim class logic instead
                bar.classList.add('animated'); 
            }
        });
    };
    
    window.addEventListener('scroll', animateSkills);
    // Initial check
    animateSkills();

    // 6. Board (CRUD) Functionality
    const boardListView = document.getElementById('boardListView');
    const boardFormView = document.getElementById('boardFormView');
    const boardForm = document.getElementById('boardForm');
    const boardListBody = document.getElementById('boardListBody');
    const btnWrite = document.getElementById('btnWrite');
    const btnCancel = document.getElementById('btnCancel');
    const editIndexInput = document.getElementById('editIndex');

    // Sample data or Load from localStorage
    let posts = JSON.parse(localStorage.getItem('portfolio_posts')) || [
        { name: "엔지니어", title: "방문을 환영합니다!", content: "궁금하신 점은 자유롭게 남겨주세요.", date: "2026-04-20" }
    ];

    const savePosts = () => {
        localStorage.setItem('portfolio_posts', JSON.stringify(posts));
    };

    const renderPosts = () => {
        boardListBody.innerHTML = '';
        if (posts.length === 0) {
            boardListBody.innerHTML = '<tr><td colspan="5">게시물이 없습니다. 첫 글을 남겨보세요!</td></tr>';
            return;
        }

        posts.forEach((post, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="title-col">${post.title}</td>
                <td>${post.name}</td>
                <td>${post.date}</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="editPost(${index})">수정</button>
                    <button class="btn btn-sm btn-delete" onclick="deletePost(${index})">삭제</button>
                </td>
            `;
            boardListBody.appendChild(tr);
        });
    };

    // Global scope functions for buttons
    window.editPost = (index) => {
        const post = posts[index];
        document.getElementById('boardName').value = post.name;
        document.getElementById('boardTitle').value = post.title;
        document.getElementById('boardContent').value = post.content;
        editIndexInput.value = index;
        
        boardListView.classList.remove('active');
        boardFormView.classList.add('active');
    };

    window.deletePost = (index) => {
        if (confirm('정말 이 게시물을 삭제하시겠습니까?')) {
            posts.splice(index, 1);
            savePosts();
            renderPosts();
        }
    };

    btnWrite.addEventListener('click', () => {
        boardForm.reset();
        editIndexInput.value = "-1";
        boardListView.classList.remove('active');
        boardFormView.classList.add('active');
    });

    btnCancel.addEventListener('click', () => {
        boardListView.classList.add('active');
        boardFormView.classList.remove('active');
    });

    boardForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const index = parseInt(editIndexInput.value);
        const name = document.getElementById('boardName').value;
        const title = document.getElementById('boardTitle').value;
        const content = document.getElementById('boardContent').value;
        const date = new Date().toISOString().split('T')[0];

        const newPost = { name, title, content, date };

        if (index === -1) {
            posts.push(newPost);
        } else {
            posts[index] = newPost;
        }

        savePosts();
        renderPosts();
        
        boardListView.classList.add('active');
        boardFormView.classList.remove('active');
    });

    // Initial Render
    renderPosts();
});
