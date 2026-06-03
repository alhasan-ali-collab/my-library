 // صندوق كبير نخزن فيه جميع الكتب
    let allBooks = [];

    // تحميل الكتب من ملف books.json
    async function loadBooks() {

      const response =
    await fetch(
        "/books"
    );
        // تحويل البيانات إلى JavaScript
        allBooks =
            await response.json();

        // عرض عدد الكتب
        document.getElementById(
            "booksCount"
        ).innerHTML =
            `📚 عدد الكتب: ${allBooks.length}`;

        // رسم الكتب على الصفحة
        renderBooks(allBooks);

    }

    // إنشاء بطاقات الكتب
    function renderBooks(books) {

        const container =
            document.getElementById(
                "booksContainer"
            );

        // تنظيف المكان قبل إعادة الرسم
        container.innerHTML = "";

        books.forEach((book, index) => {

            container.innerHTML += `

            <div class="card">

                <img
                    src="${book.image}"
                    alt="${book.title}">

                <h3>${book.title}</h3>

                <p>${book.description}</p>

                <a
                    class="book-link"
                    href="book.html?id=${index}">

                    فتح الكتاب

                </a>

            </div>

            `;

        });

    }

    // البحث عن كتاب
    function searchBooks() {

        const keyword =
            document
                .getElementById("search")
                .value
                .toLowerCase();

        const filtered =
            allBooks.filter(book =>
                book.title
                    .toLowerCase()
                    .includes(keyword)
            );

        renderBooks(filtered);

    }

    // تصفية الكتب حسب المادة
    function filterBooks(category) {

        if (category === "الكل") {

            renderBooks(allBooks);

            return;

        }

        const filtered =
            allBooks.filter(book =>
                book.category === category
            );

        renderBooks(filtered);

    }

    // قراءة آخر كتاب تم حفظه
    const lastBook =
        localStorage.getItem(
            "lastBook"
        );

    if (lastBook) {

        document.getElementById(
            "lastBook"
        ).innerHTML =

            `📖 آخر كتاب قرأته:
            <strong>${lastBook}</strong>`;

    }

    // تشغيل الموقع عند فتح الصفحة
    loadBooks();

    document.getElementById(
    "path"
).innerHTML =
`${term} > ${grade} > ${subject}`;