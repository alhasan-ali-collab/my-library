async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            // حفظ المفتاح المشفر في المتصفح بدلاً من كلمة "true" البسيطة
            localStorage.setItem("token", data.token); 
            location.href = "admin.html";
        } else {
            alert("بيانات الدخول غير صحيحة");
        }
    } catch (error) {
        alert("تعذر الاتصال بالخادم");
    }
}