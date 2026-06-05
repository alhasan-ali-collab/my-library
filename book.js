const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];

let pdfDoc = null,
    scale = 1.3,
    currentUnitGames = []; // تخزين ألعاب الوحدة النشطة هنا

async function initBook() {
    const titleElement = document.getElementById('main-content-title');
    const wrapper = document.getElementById('canvas-wrapper');

    if (!pdfjsLib) {
        if (wrapper) wrapper.innerHTML = '<h2 style="text-align:center; padding: 50px; color: red;">عذراً، لم يتم تحميل مكتبة تشغيل الـ PDF.</h2>';
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js';

    if (!bookId) {
        if (titleElement) titleElement.textContent = "لم يتم تحديد كتاب في الرابط!";
        return;
    }

    try {
        const response = await fetch("/books");
        const allBooks = await response.json();
        const book = allBooks.find(b => b.id == bookId);

        if (!book) {
            if (titleElement) titleElement.textContent = "الكتاب غير موجود!";
            return;
        }

        currentUnitGames = book.games || [];

        // صمام أمان أمامي فوري: مصفوفة الألعاب الخمسة الكاملة للدرس لغرض الفهرسة والتجربة
        if (bookId == 4 && currentUnitGames.length === 0) {
            currentUnitGames = [
                {
                    "gameId": "g_ar_1_1_1",
                    "title": "🔬 مختبر تصنيف الأشكال الهندسية",
                    "path": "/uploads/games/shape-sorting/index.html",
                    "skill": "التمييز البصري للأشكال والتصنيف"
                },
                {
                    "gameId": "g_ar_1_1_2",
                    "title": "🔤 تحدي قطار الحروف الذكي",
                    "path": "#",
                    "skill": "التعرف على شكل الحرف بالمحاكاة الصوتية"
                },
                {
                    "gameId": "g_ar_1_1_3",
                    "title": "🎈 فرقعة بالونات الكلمات الملونة",
                    "path": "#",
                    "skill": "السرعة البصرية لتركيب الجمل والكلمات"
                },
                {
                    "gameId": "g_ar_1_1_4",
                    "title": "🧩 بازل تركيب صور الوحدة",
                    "path": "#",
                    "skill": "الذاكرة المكانية والربط المنطقي"
                },
                {
                    "gameId": "g_ar_1_1_5",
                    "title": "🏆 مسابقة بطل الذاكرة السريعة",
                    "path": "#",
                    "skill": "قوة الحفظ واسترجاع الحروف والرموز"
                }
            ];
        }

        if (titleElement) {
            titleElement.textContent = `${book.subject} - ${book.title} (${book.grade})`;
        }

        initToolbarEvents();

        const loadingTask = pdfjsLib.getDocument(book.file);
        pdfDoc = await loadingTask.promise;
        
        if (document.getElementById('page-count')) document.getElementById('page-count').textContent = pdfDoc.numPages;
        if (document.getElementById('page-num-input')) document.getElementById('page-num-input').max = pdfDoc.numPages;
        
        createPagePlaceholders();

    } catch (error) {
        console.error("Error loading full interactive content:", error);
    }
}

function initToolbarEvents() {
    document.getElementById('zoom-in').addEventListener('click', () => { scale += 0.2; createPagePlaceholders(); });
    document.getElementById('zoom-out').addEventListener('click', () => { if(scale <= 0.5) return; scale -= 0.2; createPagePlaceholders(); });
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullScreen);
    
    document.getElementById('next-page-btn').addEventListener('click', () => {
        const input = document.getElementById('page-num-input');
        const currentPage = parseInt(input.value);
        if (currentPage < pdfDoc.numPages) scrollToPage(currentPage + 1);
    });

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        const input = document.getElementById('page-num-input');
        const currentPage = parseInt(input.value);
        if (currentPage > 1) scrollToPage(currentPage - 1);
    });

    document.getElementById('page-num-input').addEventListener('change', (e) => {
        const pageNum = parseInt(e.target.value);
        if (pageNum >= 1 && pageNum <= pdfDoc.numPages) scrollToPage(pageNum);
    });
}

function scrollToPage(pageNum) {
    const wrapper = document.getElementById('canvas-wrapper');
    const targetPage = document.querySelector(`.page-container[data-page="${pageNum}"]`);
    if (targetPage && wrapper) {
        wrapper.scrollTo({ top: targetPage.offsetTop - 10, behavior: 'smooth' });
    }
}

function createPagePlaceholders() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const container = entry.target;
            const pageNum = parseInt(container.dataset.page);

            if (entry.isIntersecting && !container.classList.contains('rendered')) {
                renderSinglePage(pageNum, container);
            }
            if (entry.isIntersecting) {
                document.getElementById('page-num-input').value = pageNum;
            }
        });
    }, { root: wrapper, rootMargin: '-100px 0px -50px 0px', threshold: 0.3 });

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.dataset.page = i;
        pageContainer.innerHTML = `<span class="page-loading-text">جاري تحميل صفحة ${i}... ⏳</span>`;
        wrapper.appendChild(pageContainer);
        observer.observe(pageContainer);
    }
}

async function renderSinglePage(num, container) {
    try {
        container.classList.add('rendered');
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        canvas.className = 'page-canvas';
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        container.innerHTML = '';
        container.appendChild(canvas);

        const renderCtx = { canvasContext: canvas.getContext('2d'), viewport: viewport };
        await page.render(renderCtx).promise;
    } catch (error) {
        console.error(error);
    }
}

function toggleFullScreen() {
    const viewer = document.getElementById('pdf-viewer-container');
    if (!document.fullscreenElement) { viewer.requestFullscreen().catch(err => console.error(err)); } 
    else { document.exitFullscreen(); }
}

window.switchView = function(viewType) {
    const pdfPanel = document.getElementById('pdf-panel');
    const gamePanel = document.getElementById('game-panel');
    const pdfTab = document.getElementById('pdf-tab-btn');
    const gameTab = document.getElementById('game-tab-btn');

    if (viewType === 'pdf') {
        pdfPanel.classList.remove('hidden');
        gamePanel.classList.add('hidden');
        pdfTab.classList.add('active');
        gameTab.classList.remove('active');
        exitGame();
    } else if (viewType === 'game') {
        pdfPanel.classList.add('hidden');
        gamePanel.classList.remove('hidden');
        pdfTab.classList.remove('active');
        gameTab.classList.add('active');
        buildGamesMenu();
    }
}

window.buildGamesMenu = function() {
    const menuContainer = document.getElementById('games-menu-list');
    if (!menuContainer) return;
    
    if (!currentUnitGames || currentUnitGames.length === 0) {
        menuContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94a3b8;"><h3 style="font-family: 'Cairo';">لم يتم إضافة ألعاب تفاعلية لهذه الوحدة حتى الآن.</h3></div>`;
        return;
    }

    menuContainer.innerHTML = currentUnitGames.map(game => `
        <div class="game-menu-card" onclick="loadActiveGame('${game.path}', '${game.title}')">
            <div style="font-size: 3rem; margin-bottom: 10px;">🕹️</div>
            <div style="font-size: 1.15rem; margin-bottom: 8px; color: #33004b; font-family: 'Cairo'; font-weight: bold;">${game.title}</div>
            <div style="font-size: 0.85rem; color: #33004b; background: rgba(51,0,75,0.06); padding: 4px 12px; border-radius: 20px; margin-bottom: 15px; font-family: 'Cairo'; font-weight: 600;">
                🎯 المهارة: ${game.skill}
            </div>
            <span style="font-size: 0.9rem; font-weight: bold; color: #d4af37; font-family: 'Cairo';">ابدأ التحدي الآن ⬅</span>
        </div>
    `).join('');
}

// 🌟 تعديل ذكي: دالة تشغيل الألعاب وحظر روابط التعارض المكسورة لـ # 🌟
window.loadActiveGame = function(gamePath, gameTitle) {
    document.getElementById('games-menu-list').classList.add('hidden');
    document.getElementById('game-frame-wrapper').classList.remove('hidden');
    document.getElementById('game-toolbar').classList.remove('hidden');
    document.getElementById('active-game-title').textContent = gameTitle;
    
    const frame = document.getElementById('game-frame');
    
    // إزالة أي إشعار "قريباً" قديم إن وُجد
    const oldNotice = document.getElementById('coming-soon-notice');
    if (oldNotice) oldNotice.remove();

    if (!gamePath || gamePath === "#" || gamePath.trim() === "") {
        // 🚧 إذا كانت اللعبة قيد التطوير: نخفي الإطار ونعرض لوحة انتظار مبهجة ومحمية
        if (frame) frame.classList.add('hidden');
        
        const noticeDiv = document.createElement('div');
        noticeDiv.id = 'coming-soon-notice';
        noticeDiv.style.cssText = "display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:75vh; color:#94a3b8; font-family:'Cairo'; text-align:center; padding:20px; background:#0f172a; border-radius: 0 0 12px 12px;";
        noticeDiv.innerHTML = `
            <div style="font-size:4.5rem; margin-bottom:15px;">🚧</div>
            <h2 style="color:#ffffff; margin:0; font-size:1.6rem;">هذا التحدي قيد التحضير والبرمجة حالياً!</h2>
            <p style="color:#64748b; max-width:500px; margin-top:12px; font-size:1rem; line-height:1.6;">نعمل بكل طاقة لتجهيز هذه اللعبة التعليمية وضخها بداخل المنصة لرفع كفاءة أبطال منصة الواجب. ترقبوها قريباً جداً! 🚀</p>
        `;
        document.getElementById('game-frame-wrapper').appendChild(noticeDiv);
    } else {
        // 🕹️ إذا كانت اللعبة حقيقية وجاهزة: نظهر الإطار ونمرر رابط التشغيل بأمان
        if (frame) {
            frame.classList.remove('hidden');
            frame.setAttribute('allow', 'autoplay');
            frame.src = gamePath;
        }
    }
}

window.exitGame = function() {
    const frame = document.getElementById('game-frame');
    if(frame) {
        frame.src = "";
        frame.classList.remove('hidden');
    }
    
    const notice = document.getElementById('coming-soon-notice');
    if (notice) notice.remove();

    document.getElementById('game-frame-wrapper').classList.add('hidden');
    document.getElementById('game-toolbar').classList.add('hidden');
    document.getElementById('games-menu-list').classList.remove('hidden');
}

initBook();