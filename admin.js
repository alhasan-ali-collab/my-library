let currentBook = null;

if (
    localStorage.getItem(
        "admin"
    ) !== "true"
) {

    location.href =
        "login.html";

}

const form =
    document.getElementById(
        "bookForm"
    );

const booksList =
    document.getElementById(
        "booksList"
    );

let editId = null;

async function loadBooks() {

    const response =
        await fetch(
    `${window.location.origin}/books`
);
    const books =
        await response.json();

        const topBooks =
    [...books]
    .sort(
        (a, b) =>
            (b.views || 0) -
            (a.views || 0)
    )
    .slice(0, 10);

document.getElementById(
    "viewsStats"
).innerHTML =

    topBooks.map(
        book => `
        <div class="card">
            <h3>
                ${book.title}
            </h3>

            <p>
                👁️
                ${book.views || 0}
                مشاهدة
            </p>
        </div>
        `
    ).join("");

        const subjects =
    [...new Set(
        books.map(
            b => b.subject
        )
    )];

const grades =
    [...new Set(
        books.map(
            b => b.grade
        )
    )];

const resources =
    [...new Set(
        books.map(
            b => b.resource
        )
    )];

document.getElementById(
    "statsBox"
).innerHTML = `

<div class="stats">

📚 الوحدات:
${books.length}

<br><br>

📖 المواد:
${subjects.length}

<br><br>

🎓 الصفوف:
${grades.length}

<br><br>

📂 الأقسام:
${resources.length}

</div>

`;

        const searchValue =
    document
        .getElementById(
            "searchAdmin"
        )?.value
        .toLowerCase() || "";

const filteredBooks =
    books.filter(
        book =>
            (book.title || "")
                .toLowerCase()
                .includes(
                    searchValue
                )
    );
    
   document.getElementById(
    "booksCounter"
).innerHTML =
    `📚 عدد الوحدات: ${filteredBooks.length}`;

    booksList.innerHTML = "";

    filteredBooks.sort(
    (a, b) =>
        (a.title || "")
        .localeCompare(
            b.title || "",
            "ar"
        )
);

    filteredBooks.forEach(
    (book) => {

            booksList.innerHTML += `

            <div class="card">

                <img
    src="${
        book.image
        ? `http://localhost:3000${book.image}`
        : 'https://via.placeholder.com/300x180'
    }"
    style="
        width:100%;
        height:180px;
        object-fit:cover;
    ">

                <h3>
                    ${book.title}
                </h3>

                <p>
                    📚 ${book.term}
                </p>

                <p>
                    🏫 ${book.grade}
                </p>

                <p>
                    📖 ${book.subject}
                </p>
                <p>
📂 ${book.resource || "غير محدد"}
</p>

                <div class="admin-actions">

    <button
        onclick="editBook(${books.indexOf(book)})">

        ✏️ تعديل

    </button>

    <button
        onclick="deleteBook(${books.indexOf(book)})">

        🗑 حذف

    </button>

</div>

            `;

        }
    );

}

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const uploadForm =
            new FormData();

        uploadForm.append(
            "image",
            document.getElementById(
                "image"
            ).files[0]
        );

        uploadForm.append(
            "file",
            document.getElementById(
                "file"
            ).files[0]
        );

        uploadForm.append(
    "grade",
    document.getElementById("grade").value
);

uploadForm.append(
    "subject",
    document.getElementById("subject").value
);

        const uploadResponse =
            await fetch(
                "http://localhost:3000/upload",
                {
                    method: "POST",
                    body: uploadForm
                }
            );

        const uploadData =
            await uploadResponse.json();

        const book = {

            term:
                document.getElementById(
                    "term"
                ).value,

            grade:
                document.getElementById(
                    "grade"
                ).value,

            subject:
                document.getElementById(
                    "subject"
                ).value,

            resource:
                document.getElementById(
                    "resource"
                )?.value || "",

            title:
                document.getElementById(
                    "title"
                ).value,

           image:
    uploadData.image ||
    currentBook.image,

file:
    uploadData.file ||
    currentBook.file,

            description:
                document.getElementById(
                    "description"
                ).value

        };

        if (editId !== null) {

    await fetch(
        `http://localhost:3000/books/${editId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(
                    book
                )
        }
    );

    alert(
        "تم تعديل الوحدة"
    );

    editId = null;

} else {

    await fetch(
        "http://localhost:3000/books",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(
                    book
                )
        }
    );

    alert(
        "تم إضافة الوحدة"
    );

}

form.reset();

loadBooks();

document.querySelector(
    "#bookForm button"
).innerText =
    "➕ إضافة الوحدة";

        
    }
);

async function deleteBook(id) {
if (
    !confirm(
        "هل تريد حذف هذه الوحدة؟"
    )
) {
    return;
}
    await fetch(
        `http://localhost:3000/books/${id}`,
        {
            method: "DELETE"
        }
    );

    loadBooks();

}

async function editBook(id) {

    const response =
        await fetch(
            "http://localhost:3000/books"
        );

    const books =
        await response.json();
        

    const book =
        books[id];

        currentBook = book;

    editId = id;

    document.getElementById(
        "term"
    ).value =
        book.term || "";

    document.getElementById(
        "grade"
    ).value =
        book.grade || "";

    document.getElementById(
        "subject"
    ).value =
        book.subject || "";

    if (
        document.getElementById(
            "resource"
        )
    ) {

        document.getElementById(
            "resource"
        ).value =
            book.resource || "";

    }

    document.getElementById(
        "title"
    ).value =
        book.title || "";

    document.getElementById(
        "description"
    ).value =
        book.description || "";

        document.querySelector(
    "#bookForm button"
).innerText =
    "💾 حفظ التعديل";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

loadBooks();

function logout() {

    localStorage.removeItem(
        "admin"
    );

    location.href =
        "login.html";

}

const searchInput =
    document.getElementById(
        "searchAdmin"
    );

if (searchInput) {

    searchInput.addEventListener(
        "input",
        loadBooks
    );

}