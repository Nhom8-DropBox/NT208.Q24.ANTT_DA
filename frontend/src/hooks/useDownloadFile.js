import { fetchWithAuth } from "../utils/api";

export const useDownloadFile = () => {
    
    // Nhận 2 tham số rời rạc để khớp 100% với cách sếp gọi onDownload(ID, Name)
    const handleDownload = async (fileId, fileName) => {
        try {
            const res = await fetchWithAuth(`api/${fileId}/generate-link`);
            const data = await res.json();

            if (!res.ok) throw new Error("Không lấy được link tải");

            const address = document.createElement('a');
            address.href = data.signedUrl;  // Mong đợi biến signedUrl chứa đường dẫn tải
            address.download = fileName;
            document.body.appendChild(address);
            address.click();
            address.remove();
        } catch(error) {
            alert("Lỗi tải file: " + error.message);
        }
    } 

    return { handleDownload };
};