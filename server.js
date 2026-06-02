const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (
            file.mimetype.startsWith(
                "image"
            )
        ) {

            cb(
                null,
                "uploads/images"
            );

        } else {

            cb(
                null,
                "uploads/pdfs"
            );

        }

    },

    filename: (
        req,
        file,
        cb
    ) => {

        cb(
            null,
            Date.now() +
            path.extname(
                file.originalname
            )
        );

    }

});

const upload =
    multer({
        storage
    });

// السماح للواجهة بالاتصال بالخادم
app.use(cors());
app.use(
    "/uploads",
    express.static(
        "uploads"
    )
);

// قراءة JSON القادم من الطلبات
app.use(express.json());

// الصفحة الرئيسية
app.get("/", (req, res) => {

    res.send("Home Page");

});

// جلب جميع الكتب
app.get("/books", (req, res) => {

    fs.readFile(
        "books.json",
        "utf8",
        (err, data) => {

            if (err) {

                return res.status(500).send(
                    "خطأ في قراءة الملف"
                );

            }

            res.json(
                JSON.parse(data)
            );

        }
    );

});

// إضافة كتاب جديد
app.post("/books", (req, res) => {

    const newBook = req.body;

    fs.readFile(
        "books.json",
        "utf8",
        (err, data) => {

            if (err) {

                return res.status(500).send(
                    "خطأ في قراءة الملف"
                );

            }

            const books =
                JSON.parse(data);

            books.push(newBook);

            fs.writeFile(
                "books.json",
                JSON.stringify(
                    books,
                    null,
                    2
                ),
                (err) => {

                    if (err) {

                        return res.status(500).send(
                            "خطأ في الحفظ"
                        );

                    }

                    res.json({
                        message:
                            "تم إضافة الكتاب بنجاح"
                    });

                }
            );

        }
    );

});
app.delete("/books/:id", (req, res) => {

    const id =
        Number(req.params.id);

    fs.readFile(
        "books.json",
        "utf8",
        (err, data) => {

            if (err) {

                return res
                    .status(500)
                    .send("خطأ");

            }

            const books =
                JSON.parse(data);

            books.splice(id, 1);

            fs.writeFile(
                "books.json",
                JSON.stringify(
                    books,
                    null,
                    2
                ),
                () => {

                    res.json({
                        message:
                        "تم حذف الكتاب"
                    });

                }
            );

        }
    );

});
app.put("/books/:id", (req, res) => {

    const id =
        Number(req.params.id);

    const updatedBook =
        req.body;

    fs.readFile(
        "books.json",
        "utf8",
        (err, data) => {

            if (err) {

                return res
                    .status(500)
                    .send("خطأ");

            }

            const books =
                JSON.parse(data);

            books[id] =
                updatedBook;

            fs.writeFile(
                "books.json",
                JSON.stringify(
                    books,
                    null,
                    2
                ),
                () => {

                    res.json({
                        message:
                        "تم تعديل الكتاب"
                    });

                }
            );

        }
    );

});
app.post(
    "/upload",
    upload.fields([
        {
            name: "image",
            maxCount: 1
        },
        {
            name: "file",
            maxCount: 1
        }
    ]),
    (req, res) => {

        res.json({

            image:
                req.files.image
                ?
                "/uploads/images/" +
                req.files.image[0]
                    .filename
                :
                "",

            file:
                req.files.file
                ?
                "/uploads/pdfs/" +
                req.files.file[0]
                    .filename
                :
                ""

        });

    }
);
app.get("/pdf/:name", (req, res) => {

    const filePath =
        path.join(
            __dirname,
            "uploads",
            "pdfs",
            req.params.name
        );

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        "inline"
    );

    res.sendFile(filePath);

});
// تشغيل الخادم
app.listen(3000, () => {

    console.log(
        "Server running on port 3000"
    );

});
