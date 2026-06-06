/**
 * 📘 منصة الواجب التعليمية - سكريبت مشغل الكتب والألعاب التفاعلية المطور 📘
 */

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];

// تهيئة المتغيرات العامة والأساسية للمشغل
let pdfDoc = null;
let scale = 1.3;
let currentUnitGames = []; // تخزين ألعاب الوحدة النشطة

// 🎯 استرجاع الصفحة الأخيرة التي وقف عندها الطالب لهذا الكتاب تحديداً (الافتراضي: 1)
let savedPageNum = Number(localStorage.getItem(`alwajeb_progress_book_${bookId}`)) || 1;

/**
 * دالة جلب بيانات الكتاب وتهيئة ملف الـ PDF والتحضير الأولي
 */
async function initBook() {
    const titleElement = document.getElementById('main-content-title');
    const wrapper = document.getElementById('canvas-wrapper');

    if (!pdfjsLib) {
        if (wrapper) wrapper.innerHTML = '<h2 style="text-align:center; padding: 50px; color: red; font-family:\'Cairo\';">عذراً، لم يتم تحميل مكتبة تشغيل الـ PDF.</h2>';
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js';

    if (!bookId) {
        if (titleElement) titleElement.textContent = "لم يتم تحديد كتاب في الرابط!";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/books");
        const allBooks = await response.json();
        const book = allBooks.find(b => b.id == bookId);

        if (!book) {
            if (titleElement) titleElement.textContent = "الكتاب غير موجود!";
            if (wrapper) wrapper.innerHTML = '<div class="text-center py-12 text-red-500 font-bold">⚠️ عذراً، لم يتم العثور على هذا الكتاب في قاعدة البيانات.</div>';
            return;
        }

        currentUnitGames = book.games || [];

        // صمام أمان أمامي فوري للألعاب الخمسة
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

        const pdfUrl = book.url || book.pdf || book.file || book.path || book.src || `/uploads/pdfs/book-${bookId}.pdf`;
        
        const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/cmaps/',
            cMapPacked: true
        });

        loadingTask.promise.then((pdf) => {
            pdfDoc = pdf;
            const pageCountEl = document.getElementById('page-count');
            if (pageCountEl) pageCountEl.textContent = pdf.numPages;
            
            // البدء الفوري في توليد ورسم جميع الصفحات مسبقاً
            loadAndRenderAllPagesUpfront();
        }).catch(err => {
            console.error("خطأ أثناء تحميل ملف الـ PDF:", err);
            if (wrapper) {
                wrapper.innerHTML = `
                    <div class="text-center py-12 px-6 bg-white rounded-xl border border-red-100 max-w-xl mx-auto my-8 shadow-sm">
                        <div class="text-4xl mb-3">⚠️</div>
                        <h3 class="text-red-600 font-black text-lg">فشل تحميل ملف الـ PDF الخاص بالدرس</h3>
                        <div class="bg-slate-50 p-3 rounded-lg text-xs font-mono text-left text-slate-500 mt-4 overflow-x-auto">
                            <strong>Tried Path:</strong> ${pdfUrl}<br>
                            <strong>Error Details:</strong> ${err.message}
                        </div>
                    </div>
                `;
            }
        });

    } catch (error) {
        console.error("خطأ أثناء جلب مصفوفة الكتب من السيرفر:", error);
    }
}

/**
 * 🌟 المحرك الجديد: إنشاء ورسم جميع الصفحات فوراً وبشكل مسبق دون انتظار التمرير
 */
async function loadAndRenderAllPagesUpfront() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper || !pdfDoc) return;
    wrapper.innerHTML = '';

    // مراقب صامت خفيف جداً: وظيفته فقط تحديث العداد العلوي وحفظ التقدم بداخل الـ LocalStorage
    const progressTrackerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const visiblePageNum = parseInt(entry.target.dataset.page);
                document.getElementById('page-num-input').value = visiblePageNum;
                
                // 💾 حفظ الصفحة الحالية في ذاكرة المتصفح فوراً باسم هذا الكتاب
                localStorage.setItem(`alwajeb_progress_book_${bookId}`, visiblePageNum);
            }
        });
    }, { root: wrapper, rootMargin: '-100px 0px -50px 0px', threshold: 0.4 });

    // بناء الهياكل والرسم المتسلسل الفوري لجميع الصفحات مسبقاً لمنع ظهور جاري التحميل لاحقاً
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.dataset.page = i;
        wrapper.appendChild(pageContainer);
        
        // تفعيل تتبع الصفحة الحالية
        progressTrackerObserver.observe(pageContainer);

        // رسم الصفحة فوراً وبشكل مسبق
        await renderSinglePageUpfront(i, pageContainer);
    }

    // 🚀 القفزة الذكية: نقل الطالب تلقائياً إلى الصفحة التي كان واقفاً عندها قبل خروجه
    if (savedPageNum > 1 && savedPageNum <= pdfDoc.numPages) {
        setTimeout(() => {
            scrollToPage(savedPageNum);
        }, 400); // مهلة زمنية صغيرة جداً بالملي ثانية لضمان استقرار أبعاد حاوية المتصفح تماماً
    }
}

/**
 * دالة الرسم المباشر والمسبق للصفحة على الكانفاس
 */
async function renderSinglePageUpfront(num, container) {
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
        console.error(`خطأ أثناء رسم الصفحة رقم ${num}:`, error);
    }
}

/**
 * ربط أحداث شريط الأدوات العلوي والتحكم بالصفحات والتكبير
 */
function initToolbarEvents() {
    // عند تغيير حجم التكبير والتصغير يتم إعادة توليد الشبكة مسبقاً للحفاظ على بقائها جاهزة
    document.getElementById('zoom-in').addEventListener('click', () => { scale += 0.2; loadAndRenderAllPagesUpfront(); });
    document.getElementById('zoom-out').addEventListener('click', () => { if(scale <= 0.5) return; scale -= 0.2; loadAndRenderAllPagesUpfront(); });
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullScreen);
    
    document.getElementById('next-page-btn').addEventListener('click', () => {
        const input = document.getElementById('page-num-input');
        const currentPage = parseInt(input.value);
        if (pdfDoc && currentPage < pdfDoc.numPages) scrollToPage(currentPage + 1);
    });

    document.getElementById('prev-page-btn').addEventListener('click', () => {
        const input = document.getElementById('page-num-input');
        const currentPage = parseInt(input.value);
        if (currentPage > 1) scrollToPage(currentPage - 1);
    });

    document.getElementById('page-num-input').addEventListener('change', (e) => {
        const targetPage = parseInt(e.target.value);
        if (pdfDoc && targetPage >= 1 && targetPage <= pdfDoc.numPages) scrollToPage(targetPage);
    });
}

function scrollToPage(num) {
    const wrapper = document.getElementById('canvas-wrapper');
    const targetPage = document.querySelector(`.page-container[data-page="${num}"]`);
    if (targetPage && wrapper) {
        wrapper.scrollTo({ top: targetPage.offsetTop - 10, behavior: 'smooth' });
    }
}

function toggleFullScreen() {
    const viewer = document.getElementById('pdf-viewer-container');
    if (!document.fullscreenElement) { viewer.requestFullscreen().catch(err => console.error(err)); } 
    else { document.exitFullscreen(); }
}

/**
 * التبديل التفاعلي بين ألسنة العرض (كتاب / ألعاب)
 */
window.switchView = function(viewType) {
    const pdfPanel = document.getElementById('pdf-panel');
    const gamePanel = document.getElementById('game-panel');
    const pdfTab = document.getElementById('pdf-tab-btn');
    const gameTab = document.getElementById('game-tab-btn');

    if (viewType === 'pdf') {
        pdfPanel.classList.remove('hidden');
        gamePanel.classList.add('hidden');
        pdfTab.classList.add('active-tab-style');
        gameTab.classList.remove('active-tab-style');
        exitGame();
    } else if (viewType === 'game') {
        pdfPanel.classList.add('hidden');
        gamePanel.classList.remove('hidden');
        pdfTab.classList.remove('active-tab-style');
        gameTab.classList.add('active-tab-style');
        buildGamesMenu();
    }
}

/**
 * بناء وحقن قائمة كروت اختيار الألعاب بداخل لوحة تايلوند الفاخرة
 */
window.buildGamesMenu = function() {
    const menuContainer = document.getElementById('games-menu-list');
    if (!menuContainer) return;
    
    if (!currentUnitGames || currentUnitGames.length === 0) {
        menuContainer.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-400 font-bold">
                <h3 class="font-['Cairo']">لم يتم إضافة ألعاب تفاعلية لهذه الوحدة حتى الآن.</h3>
            </div>
        `;
        return;
    }

    menuContainer.innerHTML = currentUnitGames.map(game => `
        <div class="group bg-white border border-slate-200 rounded-2xl p-6 text-center cursor-pointer shadow-sm hover:shadow-xl hover:border-purple-700 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center" onclick="loadActiveGame('${game.path}', '${game.title}')">
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">🕹️</div>
            <div class="text-md font-black text-[#33004b] mb-2">${game.title}</div>
            <div class="text-xs text-purple-900 bg-purple-50 px-3 py-1 rounded-full font-bold mb-4">
                🎯 المهارة: ${game.skill}
            </div>
            <span class="text-xs font-bold text-[#d4af37] group-hover:translate-x-[-4px] transition-transform">ابدأ التحدي الآن ⬅</span>
        </div>
    `).join('');
}

/**
 * تشغيل اللعبة المختارة بداخل حاوية الـ IFrame الآمنة
 */
window.loadActiveGame = function(gamePath, gameTitle) {
    document.getElementById('games-menu-list').classList.add('hidden');
    document.getElementById('game-frame-wrapper').classList.remove('hidden');
    document.getElementById('game-toolbar').classList.remove('hidden');
    document.getElementById('active-game-title').textContent = gameTitle;
    
    const frame = document.getElementById('game-frame');
    
    const oldNotice = document.getElementById('coming-soon-notice');
    if (oldNotice) oldNotice.remove();

    if (!gamePath || gamePath === "#" || gamePath.trim() === "") {
        if (frame) frame.classList.add('hidden');
        
        const noticeDiv = document.createElement('div');
        noticeDiv.id = 'coming-soon-notice';
        noticeDiv.className = "flex flex-col items-center justify-center w-full h-[70vh] text-slate-400 font-['Cairo'] text-center p-6 bg-slate-900 rounded-b-2xl";
        noticeDiv.innerHTML = `
            <div class="text-6xl mb-4">🚧</div>
            <h2 class="text-white font-black text-xl">هذا التحدي قيد التحضير والبرمجة حالياً!</h2>
            <p class="text-slate-500 max-w-md mt-3 text-sm leading-relaxed font-semibold">نعمل بكل طاقة لتجهيز هذه اللعبة التعليمية وضخها بداخل المنصة لرفع كفاءة أبطال منصة الواجب. ترقبوها قريباً جداً! 🚀</p>
        `;
        document.getElementById('game-frame-wrapper').appendChild(noticeDiv);
    } else {
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

// إطلاق التهيئة الكلية فور جاهزية الملفات
initBook();