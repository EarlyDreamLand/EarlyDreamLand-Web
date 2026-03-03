document.addEventListener('DOMContentLoaded', function () {
    // 获取服务器状态
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
            console.warn("API Error:", error);
            dom.status.textContent = "离线";
            dom.status.className = "text-danger";
            dom.version.textContent = "未知";
            dom.players.textContent = "0/0";
        }
    }

    fetchServerStatus();

    // 通用数据加载
    async function loadData(url) {
        try {
            const timestamp = new Date().getTime();
            const separator = url.includes('?') ? '&' : '?';
            const urlWithTimestamp = `${url}${separator}v=${timestamp}`;

            const response = await fetch(urlWithTimestamp);

            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error(`加载数据失败 ${url}:`, error);
            return [];
        }
    }

    // 核心分页逻辑
    function setupPagination(containerId, itemClass, itemsPerPage, prevBtnId, nextBtnId) {
        const container = document.getElementById(containerId);
        const items = container.querySelectorAll(itemClass);
        const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
        let currentPage = 0;
        let isAnimating = false;

        const prevLi = document.getElementById(prevBtnId).parentElement;
        const nextLi = document.getElementById(nextBtnId).parentElement;

        function updateButtons() {
            // JS 控制禁用类，CSS 控制样式（已移除变黑样式，只保留逻辑）
            if (currentPage === 0) {
                prevLi.classList.add('disabled');
            } else {
                prevLi.classList.remove('disabled');
            }

            if (currentPage >= totalPages - 1) {
                nextLi.classList.add('disabled');
            } else {
                nextLi.classList.remove('disabled');
            }
        }

        function showPage(page) {
            if (isAnimating) return;
            isAnimating = true;

            // 淡出
            container.classList.add('fade-out');

            setTimeout(() => {
                const startIndex = page * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;

                // 切换内容
                items.forEach((item, index) => {
                    if (index >= startIndex && index < endIndex) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });

                // 手机端优化：切换后平滑滚动到容器顶部
                // 避免因为图片数量少导致页面高度变化而迷失方向
                if (window.innerWidth < 768) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    // 容器的父级 section
                    const section = container.closest('section'); 
                    if (section) {
                        const offset = section.offsetTop - navbarHeight - 20; // 留一点顶部空间
                        window.scrollTo({ top: offset, behavior: 'smooth' });
                    }
                }

                // 淡入
                container.classList.remove('fade-out');
                updateButtons();
                isAnimating = false;
            }, 300);
        }

        // 初始化
        items.forEach((item, index) => {
            item.style.display = (index < itemsPerPage) ? 'block' : 'none';
        });
        updateButtons();

        // 绑定事件
        document.getElementById(prevBtnId).onclick = (e) => {
            e.preventDefault();
            // 只有不是第一页才允许翻页
            if (currentPage > 0 && !isAnimating) {
                currentPage--;
                showPage(currentPage);
            }
        };

        document.getElementById(nextBtnId).onclick = (e) => {
            e.preventDefault();
            // 只有不是最后一页才允许翻页
            if (currentPage < totalPages - 1 && !isAnimating) {
                currentPage++;
                showPage(currentPage);
            }
        };
    }

    // 加载图片
    loadData('data/gallery-images.json').then(images => {
        if (!images.length) return;
        const container = document.getElementById('gallery-images');
        
        container.innerHTML = images.map(image => `
            <div class="col-md-4 mb-4 gallery-item" style="display:none">
                <a href="${image.src}" data-lightbox="gallery" data-title="${image.title}">
                    <img src="${image.src}" alt="${image.title}" class="img-fluid" loading="lazy">
                </a>
            </div>
        `).join('');

        setupPagination('gallery-images', '.gallery-item', 6, 'prev-page', 'next-page');
    });

    // 加载成员
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

    // 导航栏滚动与收起
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.offsetHeight;

    const smoothScroll = (targetId) => {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const offset = targetElement.offsetTop - navbarHeight;
            window.scrollTo({ top: offset, behavior: 'smooth' });

            // 手机端点击后自动收起菜单
            const toggler = document.querySelector('.navbar-toggler');
            const collapse = document.querySelector('.navbar-collapse');
            if (collapse.classList.contains('show')) {
                toggler.click(); // 模拟点击关闭
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