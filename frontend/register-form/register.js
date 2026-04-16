const URL_api = "http://localhost:3000" ;
const registerform = document.querySelector("form");
const emailInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const re_passwordInput = document.getElementById("re-password");

registerform.addEventListener("submit", async(event) => 
    {
        event.preventDefault(); // k tải lại trang khi đang gửi dữ liệu đi

        if(passwordInput.value != re_passwordInput.value)
        {
            event.preventDefault();
            alert("Password is not match!");
            return;
        }

        const formData = 
        {
            user_email: emailInput.value,
            password: passwordInput.value
        };

        try
        {
            const response = await fetch(`${URL_api}/auth/register`, 
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify(formData)
                });
                
            const result = await response.json;

            if(response.ok)
            {
                console.log('Register suscessful!');
                alert('Đăng kí thành công!');
                
            }
            else
            {
                console.log('Failed to register!');
                alert('Đăng kí thất bại!');
            }
        }
        catch (err)
        {
            console.error("Lỗi kết nối: ", err);
            alert("Lỗi kết nối tới server!");
        }
    })