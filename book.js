const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];

let pdfDoc = null,
    scale = 1.3; // حجم التقريب الافتراضي

async function initBook() {
    const container = document.getElementById('bookPage');

    if (!pdfjsLib) {
        container.innerHTML = '<h2 style="text-align:center; padding: 50px; color: red;">عذراً، المتصفح يمنع تحميل المكتبة.</h2>';
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js';

    if (!bookId) {
        container.innerHTML = '<h2 style="text-align:center; padding: 50px;">لم يتم تحديد الكتاب!</h2>';
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/books");
        const allBooks = await response.json();
        const book = allBooks.find(b => b.id == bookId);

        if (!book) {
            container.innerHTML = '<h2 style="text-align:center; padding: 50px;">عذراً، الكتاب غير موجود!</h2>';
            return;
        }

        buildViewerUI(book);

        const loadingTask = pdfjsLib.getDocument(book.file);
        pdfDoc = await loadingTask.promise;
        
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        document.getElementById('page-num-input').max = pdfDoc.numPages;
        
        createPagePlaceholders();

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('bookPage').innerHTML = '<h2 style="text-align:center; padding: 50px;">حدث خطأ أثناء تحميل الكتاب.</h2>';
    }
}

function buildViewerUI(book) {
    const container = document.getElementById('bookPage');
    container.innerHTML = `
        <h1 class="book-title-header">${book.title}</h1>
        <div id="pdf-viewer-container">
            <div class="pdf-toolbar">
                <div class="toolbar-group">
                    <div class="page-navigation">
                        <span>صفحة</span>
                        <input type="number" id="page-num-input" value="1" min="1">
                        <span>من <span id="page-count">--</span></span>
                        
                        <button id="prev-page-btn" title="الصفحة السابقة" class="arrow-btn">🔼</button>
                        <button id="next-page-btn" title="الصفحة التالية" class="arrow-btn">🔽</button>
                    </div>
                </div>
                
                <div class="toolbar-group">
                    <button id="zoom-in" title="تكبير">➕ تكبير</button>
                    <button id="zoom-out" title="تصغير">➖ تصغير</button>
                    <button id="fullscreen-btn" title="ملء الشاشة">🔲</button>
                </div>
            </div>
            
            <div class="canvas-wrapper" id="canvas-wrapper"></div>
        </div>
    `;

    // تفعيل أزرار التكبير والتصغير وملء الشاشة
    document.getElementById('zoom-in').addEventListener('click', () => { scale += 0.2; createPagePlaceholders(); });
    document.getElementById('zoom-out').addEventListener('click', () => { if(scale <= 0.5) return; scale -= 0.2; createPagePlaceholders(); });
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullScreen);
    
    // تفعيل زر السهم لأسفل (الصفحة التالية)
    document.getElementById('next-page-btn').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('page-num-input').value);
        if (currentPage < pdfDoc.numPages) {
            scrollToPage(currentPage + 1);
        }
    });

    // تفعيل زر السهم لأعلى (الصفحة السابقة)
    document.getElementById('prev-page-btn').addEventListener('click', () => {
        const currentPage = parseInt(document.getElementById('page-num-input').value);
        if (currentPage > 1) {
            scrollToPage(currentPage - 1);
        }
    });

    // الانتقال المباشر عند تغيير رقم الصفحة يدوياً بالكتابة
    document.getElementById('page-num-input').addEventListener('change', (e) => {
        const pageNum = parseInt(e.target.value);
        if (pageNum >= 1 && pageNum <= pdfDoc.numPages) {
            scrollToPage(pageNum);
        }
    });
}

// 🌟 التعديل الجديد: دالة الانتقال المحصورة داخل صندوق التمرير فقط دون تحريك شاشة المتصفح الرئيسية
function scrollToPage(pageNum) {
    const wrapper = document.getElementById('canvas-wrapper');
    const targetPage = document.querySelector(`.page-container[data-page="${pageNum}"]`);
    
    if (targetPage && wrapper) {
        wrapper.scrollTo({
            top: targetPage.offsetTop - 10, // ترك هامش جمالي بسيط أعلى الصفحة
            behavior: 'smooth'
        });
    }
}

function createPagePlaceholders() {
    const wrapper = document.getElementById('canvas-wrapper');
    wrapper.innerHTML = '';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const container = entry.target;
            const pageNum = parseInt(container.dataset.page);

            if (entry.isIntersecting && !container.classList.contains('rendered')) {
                renderSinglePage(pageNum, container);
            }

            // تحديث الرقم النشط تلقائياً أثناء السكرول بالماوس أو التاتش
            if (entry.isIntersecting) {
                document.getElementById('page-num-input').value = pageNum;
            }
        });
    }, {
        root: wrapper,
        rootMargin: '-100px 0px -50px 0px',
        threshold: 0.3
    });

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
        console.error(`Error rendering page ${num}:`, error);
    }
}

function toggleFullScreen() {
    const viewer = document.getElementById('pdf-viewer-container');
    if (!document.fullscreenElement) {
        viewer.requestFullscreen().catch(err => console.error(err));
    } else {
        document.exitFullscreen();
    }
}

initBook();