// هذا الكود سيقوم بحقن الهيدر والفوتر في أي صفحة يتم استدعاؤه فيها

const headerHTML = `
<nav class="w-full bg-white shadow-sm border-b border-slate-100 sticky top-0 z-50 font-['Cairo']">
    <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <a href="index.html" class="flex items-center gap-3 group">
            <img src="logo.png" alt="منصة الواجب" class="h-14 w-auto object-contain transition-transform group-hover:scale-105 duration-300">
        </a>
        
        <div class="hidden md:flex items-center gap-8 font-bold text-slate-600">
            <a href="index.html" class="hover:text-[#33004b] transition-colors text-sm md:text-base">الرئيسية</a>
            <a href="grades.html?term=الفصل الدراسي الأول" class="hover:text-[#33004b] transition-colors text-sm md:text-base">الفصل الأول</a>
            <a href="grades.html?term=الفصل الدراسي الثاني" class="hover:text-[#33004b] transition-colors text-sm md:text-base">الفصل الثاني</a>
            <a href="about.html" class="hover:text-[#33004b] transition-colors text-sm md:text-base">من نحن</a>
            <a href="contact.html" class="hover:text-[#33004b] transition-colors text-sm md:text-base">تواصل معنا</a>
        </div>
    </div>
</nav>
`;

const footerHTML = `
<div class="max-w-6xl mx-auto px-4 mt-12 text-center font-['Cairo']">
    <span class="text-[10px] text-slate-400 font-bold block mb-1">— إعلان مروج —</span>
    <div class="w-full min-h-[90px] bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-2 shadow-sm overflow-hidden">
        
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="YYYYYYYYYY"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
        
    </div>
</div>

<footer class="w-full bg-[#110019] text-slate-300 font-['Cairo'] mt-12 pt-12 border-t-4 border-[#d4af37]">
    <div class="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        
        <div class="space-y-4">
            <h3 class="text-xl font-black text-white flex items-center gap-2">
                <span class="text-[#d4af37]">🎓🎮</span> منصة الواجب
            </h3>
            <p class="text-sm text-slate-400 leading-relaxed font-medium">
                منصتك التعليمية الأولى لحلول المناهج السعودية. نقدم شروحات، اختبارات، وأوراق عمل مبسطة وموثوقة لرفع كفاءة أبطال وبطلات جيل المستقبل.
            </p>
        </div>
        
        <div class="space-y-4">
            <h3 class="text-lg font-bold text-[#d4af37]">روابط هامة</h3>
            <div class="grid grid-cols-2 gap-2 text-sm font-semibold">
                <a href="index.html" class="hover:text-white hover:underline transition-all">🏠 الرئيسية</a>
                <a href="#" class="hover:text-white hover:underline transition-all">📝 الاختبارات</a>
                <a href="#" class="hover:text-white hover:underline transition-all">🔬 شروح الدروس</a>
                <a href="contact.html" class="hover:text-white hover:underline transition-all">🤝 تواصل معنا</a>
                <a href="privacy.html" class="hover:text-white hover:underline transition-all">🔒 سياسة الخصوصية</a>
            </div>
        </div>
        
        <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">رؤيتنا التعليمية 🚀</h3>
            <p class="text-sm text-slate-400 leading-relaxed font-medium">
                دمج متعة الألعاب التعليمية بالعملية المنهجية للوصول بالطالب إلى أعلى درجات الإتقان الدراسي والاعتماد الذاتي بذكاء وسهولة.
            </p>
        </div>
        
    </div>
    
    <div class="w-full bg-[#0a0010] py-5 border-t border-purple-950/40 text-center text-sm font-bold text-slate-500">
        جميع الحقوق محفوظة © 2026 | منصة الواجب التعليمية <span class="text-[#d4af37]">alwajeb.net</span>
    </div>
</footer>
`;

// حقن الهيدر في بداية الـ body تلقائياً
document.body.insertAdjacentHTML('afterbegin', headerHTML);

// حقن الفوتر في نهاية الـ body تلقائياً
document.body.insertAdjacentHTML('beforeend', footerHTML);