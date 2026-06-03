async function loadBook() {
    try {
        // الحصول على معرف الكتاب من الرابط
        const params = new URLSearchParams(window.location.search);
        const id = Number(params.get("id"));

        // جلب بيانات الكتب
        const response = await fetch("http://localhost:3000/books");
        const books = await response.json();
        const book = books[id];

        // التحقق من وجود الكتاب قبل استخدام بياناته
        if (!book) {
            document.getElementById("bookPage").innerHTML = "<h2>الوحدة غير موجودة</h2>";
            return;
        }

        // تحديث عنوان الصفحة
        document.title = book.title;

        // إرسال طلب تسجيل المشاهدة (بشكل غير متزامن في الخلفية)
        fetch(`http://localhost:3000/books/${id}/view`, { method: "POST" })
            .catch(err => console.error("Error updating views:", err));

        // استخراج اسم الملف
        const fileName = book.file.split('/').pop();

        // حقن هيكل HTML (تم رفع الأزرار لتكون فوق الـ PDF)
        document.getElementById("bookPage").innerHTML = `
            <div class="book-details">
                
                <h1>${book.title}</h1>
                
    <div class="book-details">

    <div class="book-info">
        ...
    </div>

    <h1>
        ${book.title}
    </h1>

    <div class="book-actions">
        ...
    </div>

    <iframe ...></iframe>

</div>
        `;
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الكتاب:", error);
        document.getElementById("bookPage").innerHTML = "<h2>تعذر الاتصال بالخادم لجلب البيانات</h2>";
    }
}

loadBook();