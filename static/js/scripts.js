document.addEventListener('DOMContentLoaded', function () {
    // 加载图片数据
    async function loadGalleryImages() {
        try {
            const response = await fetch('/data/gallery-images.json'); // JSON 文件路径
            const galleryImages = await response.json();
            renderGallery(galleryImages);
        } catch (error) {
            console.error('加载图片数据失败:', error);
        }
    }

    // 加载团队成员数据
    async function loadTeamMembers() {
        try {
            const response = await fetch('/data/team-members.json'); // JSON 文件路径
            const teamMembers = await response.json();
            renderTeam(teamMembers);
        } catch (error) {
            console.error('加载团队成员数据失败:', error);
        }
    }

    // 渲染图片
    function renderGallery(images) {
        const galleryContainer = document.getElementById('gallery-images');
        galleryContainer.innerHTML = images.map(image => `
            <div class="col-md-4 mb-4 gallery-item">
                <a href="${image.src}" data-lightbox="gallery" data-title="${image.title}">
                    <img src="${image.src}" alt="${image.title}" class="img-fluid rounded">
                </a>
            </div>
        `).join('');
        setupPagination('.gallery-item', 6, 'prev-page', 'next-page');
    }

    // 渲染团队成员
    function renderTeam(members) {
        const teamContainer = document.getElementById('team-members');
        teamContainer.innerHTML = members.map(member => `
            <div class="col-md-4 mb-4 team-item">
                <div class="card text-center">
                    <img src="${member.avatar}" class="card-img-top mx-auto mt-4" alt="${member.name}" style="width: 150px; height: 150px; object-fit: cover;">
                    <div class="card-body">
                        <h3 class="card-title">${member.name}</h3>
                        <p class="card-subtitle mb-2 text-muted">${member.role}</p>
                        <p class="card-text">${member.description}</p>
                        <a href="${member.link}" target="_blank" class="btn btn-primary">联系我</a>
                    </div>
                </div>
            </div>
        `).join('');
        setupPagination('.team-item', 3, 'team-prev-page', 'team-next-page');
    }

    // 通用分页逻辑
    function setupPagination(containerClass, itemsPerPage, prevButtonId, nextButtonId) {
        const items = document.querySelectorAll(containerClass);
        let currentPage = 0;

        function showPage(page) {
            const startIndex = page * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            items.forEach((item, index) => {
                item.style.display = (index >= startIndex && index < endIndex) ? 'block' : 'none';
            });

            // 更新分页按钮状态
            document.getElementById(prevButtonId).classList.toggle('disabled', page === 0);
            document.getElementById(nextButtonId).classList.toggle('disabled', endIndex >= items.length);
        }

        showPage(currentPage);

        document.getElementById(prevButtonId).addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 0) {
                currentPage--;
                showPage(currentPage);
            }
        });

        document.getElementById(nextButtonId).addEventListener('click', function (e) {
            e.preventDefault();
            if ((currentPage + 1) * itemsPerPage < items.length) {
                currentPage++;
                showPage(currentPage);
            }
        });
    }

    // 动态调整锚点定位
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarBrand = document.querySelector('.navbar-brand');
    const sections = document.querySelectorAll('section');

    // 监听品牌链接点击事件
    navbarBrand.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = targetElement.offsetTop - navbarHeight;
                window.scrollTo({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        }
    });

    // 监听导航栏链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // 增加有效性检查：必须是以 # 开头且长度大于 1 的有效锚点
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offset = targetElement.offsetTop - navbarHeight;
                    window.scrollTo({
                        top: offset,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 初始化时触发一次滚动事件
    window.dispatchEvent(new Event('scroll'));

    // 加载数据
    loadGalleryImages();
    loadTeamMembers();
    // API 地址
    const apiUrl = "https://api.mcsrvstat.us/3/mc.11na.cn";

    // 获取服务器状态
    async function fetchServerStatus() {
        try {
            const response = await fetch(apiUrl);
            // console.log("API 响应:", response); // 检查响应
            const data = await response.json();
            // console.log("API 数据:", data); // 检查数据
    
            // 更新页面内容
            document.getElementById("server-status").textContent = data.online ? "在线" : "离线";
            document.getElementById("server-status").className = data.online ? "text-success" : "text-danger";
            document.getElementById("server-version").textContent = `${data.software} ${data.version}` || "未知";
            document.getElementById("online-players").textContent = `${data.players.online}/${data.players.max}`;
        } catch (error) {
            // console.error("无法获取服务器状态:", error);
            document.getElementById("server-status").textContent = "无法加载";
            document.getElementById("server-status").className = "text-danger";
            document.getElementById("server-version").textContent = "无法加载";
            document.getElementById("server-version").className = "text-danger";
            document.getElementById("online-players").textContent = "无法加载";
            document.getElementById("online-players").className = "text-danger";
        }
    }

// 页面加载时获取状态
window.onload = fetchServerStatus;
});