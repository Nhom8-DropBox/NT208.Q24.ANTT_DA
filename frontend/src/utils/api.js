const API_URL = "http://localhost:3000";

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem("accessToken");
    //console.log(token);

    try {
        const response = await fetch(API_URL + url, {
            ...options,
            headers: {
                ...(options.headers || {}), // header user nhap vao co the rong
                "Content-Type": "application/json",
                authorization: "Bearer " + token
            },
            credentials: "include",
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

        if (response.status == 403) {
            console.log("Access token expired!")
            const refreshResponse = await fetch(
                API_URL + `/auth/refresh`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!refreshResponse.ok) {
                console.log("refresh token expired!");
                localStorage.removeItem("accessToken");
                location.href = "/auth/login";
                return;
            }

            const refreshData = await refreshResponse.json();

            localStorage.setItem("accessToken", refreshData.accessToken);

            response = await fetch(API_URL + url, {
                ...options,
                headers: {
                    ...(options.headers || {}), // header user nhap vao co the rong
                    "Content-Type": "application/json",
                    authorization: "Bearer " + refreshData.accessToken
                },
                credentials: "include",
            });
        }
        return response;
    }
    catch (err) {
        alert("Lỗi kết nối tới server!");
    }

};