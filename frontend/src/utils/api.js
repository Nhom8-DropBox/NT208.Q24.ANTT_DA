const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");

    try {
        let response = await fetch(API_URL + url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                "Content-Type": "application/json",
                authorization: "Bearer " + token
            },
            credentials: "include",
        });

        // Nếu 401 → token hết hạn, redirect login
        if (response.status === 401) {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return;
        }

        // Nếu 403 → thử refresh token
        if (response.status === 403) {
            console.log("Access token expired! Trying refresh...");
            const refreshResponse = await fetch(API_URL + `/auth/refresh`, {
                method: "POST",
                credentials: "include"
            });

            if (!refreshResponse.ok) {
                console.log("Refresh token expired!");
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return;
            }

            const refreshData = await refreshResponse.json();
            localStorage.setItem("accessToken", refreshData.accessToken);

            // Retry request với token mới
            response = await fetch(API_URL + url, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    "Content-Type": "application/json",
                    authorization: "Bearer " + refreshData.accessToken
                },
                credentials: "include",
            });
        }

        // Trả về response gốc, để caller tự xử lý .json() và lỗi
        return response;
    }
    catch (err) {
        console.error("Fetch error:", err);
        alert("Lỗi kết nối tới server!");
    }
};