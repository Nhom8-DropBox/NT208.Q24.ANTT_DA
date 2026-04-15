const API_URL = "http://localhost:3000";
const loginform = document.querySelector("form");
const emailInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

loginform.addEventListener("submit", async (event) => {
    event.preventDefault(); // block reload page when submit form
    
    const formdata = 
    {
        user_email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formdata)
        });
        
        const result = await response.json();

        if(response.ok)
        {
            console.log("Login successful, token:", result.token);

            localStorage.setItem("token", result.token);

            alert("Đăng nhập thành công!");

            window.location.href = '../mainpage/PageUI.html';
        }
        else
        {
            alert(result.message || "Đăng nhập thất bại!)");
        }
    }
    catch (err)
    {
        console.error("Lỗi kết nối: ", err);
        alert("Lỗi kết nối tới server!");
    }
});
