document.addEventListener('DOMContentLoaded', function () {
    async function fetchServerStatus() {
        const dom = {
            status: document.getElementById("server-status"),
            version: document.getElementById("server-version"),
            players: document.getElementById("online-players")
        };

        try {
            const response = await fetch("https://uapis.cn/api/v1/game/minecraft/serverstatus?server=mc.11na.cn");
            const data = await response.json();

            if (data && data.online) {
                dom.status.textContent = "在线";
                dom.status.className = "text-success";
                dom.version.textContent = data.version || "未知";
                dom.players.textContent = `${data.players}/${data.max_players}`;
            } else {
                throw new Error("Server offline");
            }
        } catch (error) {
            console.warn("服务器状态获取失败 (可能是离线或API问题):", error);
            dom.status.textContent = "离线";
            dom.status.className = "text-danger";
            dom.version.textContent = "未知";
            dom.players.textContent = "0/0";
        }
    }

    fetchServerStatus();

    async function loadData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`加载数据失败 ${url}:`, error);
            return [];
        }
    }

    function setupPagination(containerId, itemClass, itemsPerPage, prevBtnId, nextBtnId) {
        const container = document.getElementById(containerId);
        const items = container.querySelectorAll(itemClass);
        const totalPages = Math.ceil(items.length / itemsPerPage);
        let currentPage = 0;
        let isAnimating = false;

        function updateButtons() {
            const prevBtn = document.getElementById(prevBtnId).parentElement;
            const nextBtn = document.getElementById(nextBtnId).parentElement;
            
            prevBtn.classList.toggle('disabled', currentPage === 0);
            nextBtn.classList.toggle('disabled', currentPage >= totalPages - 1);
        }

        function showPage(page) {
            if (isAnimating) return;
            isAnimating = true;

            container.classList.add('fade-out');

            setTimeout(() => {
                const startIndex = page * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;

                items.forEach((item, index) => {
                    if (index >= startIndex && index < endIndex) {
                        item.style.display = 'block'; 
                    } else {
                        item.style.display = 'none';
                    }
                });

                if (window.innerWidth < 768) {
                    const offset = container.parentElement.offsetTop - 80;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }

                container.classList.remove('fade-out');
                
                updateButtons();
                isAnimating = false;
            }, 300);
        }

        items.forEach((item, index) => {
            item.style.display = (index < itemsPerPage) ? 'block' : 'none';
        });
        updateButtons();

        document.getElementById(prevBtnId).addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 0 && !isAnimating) {
                currentPage--;
                showPage(currentPage);
            }
        });

        document.getElementById(nextBtnId).addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages - 1 && !isAnimating) {
                currentPage++;
                showPage(currentPage);
            }
        });
    }

    loadData('data/gallery-images.json').then(images => {
        if (!images.length) return;
        const container = document.getElementById('gallery-images');
        
        container.innerHTML = images.map(image => `
            <div class="col-md-4 mb-4 gallery-item" style="display:none"> <!-- 默认隐藏，交给分页控制 -->
                <a href="${image.src}" data-lightbox="gallery" data-title="${image.title}">
                    <!-- loading="lazy" 优化加载速度 -->
                    <img src="${image.src}" alt="${image.title}" class="img-fluid rounded" loading="lazy">
                </a>
            </div>
        `).join('');

        setupPagination('gallery-images', '.gallery-item', 6, 'prev-page', 'next-page');
    });

    loadData('data/team-members.json').then(members => {
        if (!members.length) return;
        const container = document.getElementById('team-members');

        container.innerHTML = members.map(member => `
            <div class="col-md-4 mb-4 team-item" style="display:none">
                <div class="card text-center h-100">
                    <img src="${member.avatar}" class="card-img-top mx-auto mt-4" alt="${member.name}" 
                         style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%;">
                    <div class="card-body d-flex flex-column">
                        <h3 class="card-title">${member.name}</h3>
                        <p class="card-subtitle mb-2 text-muted">${member.role}</p>
                        <p class="card-text flex-grow-1">${member.description}</p>
                        <a href="${member.link}" target="_blank" class="btn btn-primary mt-3">联系我</a>
                    </div>
                </div>
            </div>
        `).join('');

        setupPagination('team-members', '.team-item', 3, 'team-prev-page', 'team-next-page');
    });

    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.offsetHeight;

    const smoothScroll = (targetId) => {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offset = targetElement.offsetTop - navbarHeight;
            window.scrollTo({ top: offset, behavior: 'smooth' });

            const toggler = document.querySelector('.navbar-toggler');
            const collapse = document.querySelector('.navbar-collapse');
            if (collapse.classList.contains('show')) {
                toggler.click();
            }
        }
    };

    navbar.addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link, .navbar-brand');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                smoothScroll(href);
            }
        }
    });

    if (window.location.hash) {
        setTimeout(() => smoothScroll(window.location.hash), 100);
    }
});