const API_URL = "http://localhost:3000";

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    //console.log(token);

    try {
        const response = await fetch(API_URL + url, {
            ...options,
            headers: {
                ...(options.headers || {}), // header user nhap vao co the rong
                "Content-Type": "application/json",
                authorization: "Bearer " + token
            }
        });
        // if(response.status == 401) 
        // {
        //     localStorage.removeItem("token");
        //     location.href = "/auth/login";// Can xem lai
        // }
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/auth/login";
            }
            // Thử móc lỗi từ Backend ra (nếu Backend có trả về JSON chứa message)
            const errorInfo = await response.json().catch(() => ({}));
            // Chủ động ném lỗi ra ngoài
            throw new Error(errorInfo.message || `Lỗi từ Server: ${response.status}`);
        }
        return response;
    }
    catch (err) {
        alert("Lỗi kết nối tới server!");
    }

};