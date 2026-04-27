const API_URL = "http://localhost:3000";

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    //console.log(token);

    try 
    {
        const response = await fetch(API_URL + url, {
            ...options,
            headers: {
                ...(options.headers || {}), // header user nhap vao co the rong
                "Content-Type": "application/json",
                authorization: "Bearer " + token
            }
        });
        if(response.status == 401) // token het han
        {
            localStorage.removeItem("token");
            location.href = "/auth/login";// redirect (dung js binh thuong, navigate chi dung duoc trong file jsx)
        }
        return response;
    }
    catch(err)
    {
        alert("Lỗi kết nối tới server!");
    }

};