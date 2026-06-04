const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

async function main() {
    try {
        // التحقق من وجود ملف الـ json القديم
        if (!fs.existsSync("books.json")) {
            console.log("❌ ملف books.json غير موجود!");
            return;
        }

        // قراءة البيانات
        const data = fs.readFileSync("books.json", "utf8");
        const books = JSON.parse(data);

        console.log(`⏳ جاري نقل (${books.length}) وحدة إلى قاعدة البيانات الجديدة...`);

        // إدخال البيانات في قاعدة البيانات SQLite
        for (const book of books) {
            await prisma.book.create({
                data: {
                    term: book.term,
                    grade: book.grade,
                    subject: book.subject,
                    resource: book.resource || "",
                    title: book.title,
                    image: book.image,
                    file: book.file,
                    description: book.description || "",
                    views: book.views || 0
                }
            });
        }

        console.log("✅ تم نقل جميع البيانات بنجاح إلى قاعدة البيانات! يمكنك الآن تشغيل السيرفر.");
    } catch (error) {
        console.error("❌ حدث خطأ أثناء نقل البيانات:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();