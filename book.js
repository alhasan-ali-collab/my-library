async function loadBook() {
    const response = await fetch("http://localhost:3000/books");
    const books = await response.json();

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const book = books[id];

    if (!book) {
        document.getElementById("bookPage").innerHTML =
            "<h2>الوحدة غير موجودة</h2>";
        return;
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