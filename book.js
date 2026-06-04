async function loadBook() {
    const response = await fetch("/books");
    const books = await response.json();

<<<<<<< Updated upstream
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const book = books[id];

    if (!book) {
        document.getElementById("bookPage").innerHTML =
            "<h2>الوحدة غير موجودة</h2>";
        return;
=======
        // جلب بيانات الكتب
        const response = await fetch("http://localhost:3000/books");
        const books = await response.json();
        const book = books.find(b => b.id === id);
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

   

    <div class="book-breadcrumb">

    <a href="index.html">
        🏠 الرئيسية
    </a>

    <span>›</span>

    <a href="grades.html?term=${book.term}">
        ${book.term}
    </a>

    <span>›</span>

    <a href="subjects.html?term=${book.term}&grade=${book.grade}">
        ${book.grade}
    </a>

    <span>›</span>

    <a href="resources.html?term=${book.term}&grade=${book.grade}&subject=${book.subject}">
        ${book.subject}
    </a>

    <span>›</span>

    <span class="current">
        ${book.title}
    </span>

</div>


    <div class="title-row">

    <a
    class="action-btn"
    href="${book.file}"
    target="_blank">

        🔍 فتح بملء الشاشة

    </a>

    <h1 class="book-title">
        ${book.title}
    </h1>

    <a
    class="action-btn"
    href="${book.file}"
    target="_blank">

        📥 تحميل الملف

    </a>

</div>
    <iframe
        src="http://localhost:3000/pdf/${fileName}"
        style="width:100%;height:85vh;border:none;">
    </iframe>

</div>

`;
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الكتاب:", error);
        document.getElementById("bookPage").innerHTML = "<h2>تعذر الاتصال بالخادم لجلب البيانات</h2>";
>>>>>>> Stashed changes
    }

    document.getElementById("bookPage").innerHTML = `
        <h1>${book.title}</h1>
        <iframe
            src="http://localhost:3000/pdf/${book.file.split('/').pop()}"
            style="width:100%;height:1000px;border:none;">
        </iframe>
    `;
}

loadBook();