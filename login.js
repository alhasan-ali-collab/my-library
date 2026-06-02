function login() {

    const username =
        document.getElementById(
            "username"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;

    if (
        username === "admin"
        &&
        password === "123456"
    ) {

        localStorage.setItem(
            "admin",
            "true"
        );

        location.href =
            "admin.html";

    }

    else {

        alert(
            "بيانات الدخول غير صحيحة"
        );

    }

}