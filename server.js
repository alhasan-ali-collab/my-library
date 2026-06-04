const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken"); // ⬅️ استدعاء مكتبة الحماية

const app = express();
const prisma = new PrismaClient();
const SECRET_KEY = "alwajeb_super_secret_key_2026"; // مفتاح التشفير الخاص بمنصتك

// إعداد رفع الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) cb(null, "uploads/images");
        else cb(null, "uploads/pdfs");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.static(__dirname));

// ==========================================
// 1. نظام تسجيل الدخول وإنشاء المفتاح (Token)
// ==========================================
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    // التحقق من بيانات المدير
    if (username === "admin" && password === "123456") {
        // إنشاء مفتاح مشفر صالح لمدة 24 ساعة
        const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }
});

// ==========================================
// 2. حاجز الحماية (Middleware)
// ==========================================
// أي مسار يمر عبر هذه الدالة يتطلب تسجيل دخول
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).send("غير مصرح لك بالدخول");

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send("الجلسة منتهية، يرجى تسجيل الدخول مجدداً");
        req.user = user;
        next(); // السماح بالمرور
    });
};

// ==========================================
// 3. المسارات العامة (مفتوحة للطلاب)
// ==========================================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/books", async (req, res) => {
    try { res.json(await prisma.book.findMany()); } 
    catch (err) { res.status(500).send("خطأ في قاعدة البيانات"); }
});
app.get("/pdf/:name", (req, res) => {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.sendFile(path.join(__dirname, "uploads", "pdfs", req.params.name));
});
app.post("/books/:id/view", async (req, res) => {
    try {
        const updatedBook = await prisma.book.update({
            where: { id: Number(req.params.id) },
            data: { views: { increment: 1 } }
        });
        res.json({ views: updatedBook.views });
    } catch (err) { res.status(500).send("خطأ"); }
});

// ==========================================
// 4. المسارات المحمية (مغلقة إلا للمدير) ⬅️ إضافة authenticate
// ==========================================
app.post("/upload", authenticate, upload.fields([{ name: "image", maxCount: 1 }, { name: "file", maxCount: 1 }]), (req, res) => {
    res.json({
        image: req.files.image ? "/uploads/images/" + req.files.image[0].filename : "",
        file: req.files.file ? "/uploads/pdfs/" + req.files.file[0].filename : ""
    });
});

app.post("/books", authenticate, async (req, res) => {
    try {
        const newBook = await prisma.book.create({ data: { ...req.body, views: 0 } });
        res.json({ message: "تم إضافة الكتاب", book: newBook });
    } catch (err) { res.status(500).send("خطأ في الإضافة"); }
});

app.put("/books/:id", authenticate, async (req, res) => {
    try {
        await prisma.book.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json({ message: "تم تعديل الكتاب" });
    } catch (err) { res.status(500).send("خطأ في التعديل"); }
});

app.delete("/books/:id", authenticate, async (req, res) => {
    try {
        await prisma.book.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: "تم الحذف" });
    } catch (err) { res.status(500).send("خطأ في الحذف"); }
});

// تشغيل الخادم
<<<<<<< Updated upstream
const PORT =
    process.env.PORT ||
    3000;

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));
>>>>>>> Stashed changes
