// هذا الكود سيقوم بحقن الهيدر والفوتر في أي صفحة يتم استدعاؤه فيها

const headerHTML = `
<nav class="navbar">
   <a href="index.html" class="logo">
        <img src="logo.png" alt="شعار منصة الواجب" class="nav-logo">
    </a>
    <div class="nav-links">
        <a href="index.html">الرئيسية</a>
        <a href="about.html">من نحن</a>
        <a href="contact.html">تواصل معنا</a>
    </div>
</nav>
`;

const footerHTML = `
<footer class="footer">
    <div class="footer-content">
        <div class="footer-section">
            <h3>منصة الواجب</h3>
            <p>منصتك التعليمية الأولى لحلول المناهج السعودية، نقدم شروحات، اختبارات، وأوراق عمل مبسطة وموثوقة.</p>
        </div>
        <div class="footer-section">
            <h3>روابط هامة</h3>
            <a href="about.html">من نحن</a>
            <a href="contact.html">تواصل معنا</a>
            <a href="privacy.html">سياسة الخصوصية</a>
        </div>
    </div>
    <div class="footer-bottom">
        <p>جميع الحقوق محفوظة © 2026 | منصة الواجب</p>
    </div>
</footer>
`;

// حقن الهيدر في بداية الـ body
document.body.insertAdjacentHTML('afterbegin', headerHTML);

// حقن الفوتر في نهاية الـ body
document.body.insertAdjacentHTML('beforeend', footerHTML);