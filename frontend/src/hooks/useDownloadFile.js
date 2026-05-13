import { fetchWithAuth } from "../utils/api";

export const useDownloadFile = () => {

    const handleDownload = (fileId, fileName) => {

        const safeFileName = encodeURIComponent(fileName);

        const url = `/download?fileId=${fileId}&fileName=${safeFileName}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    };
    /**
     * Dùng ở màn hình chính (Dashboard).
     * Tải phiên bản MỚI NHẤT của file theo fileId.
     * Endpoint: GET /files/:id/download-url
     */
    const handlePresignedDownloadUrl = async (fileId, fileName) => {
        try {
            const res = await fetchWithAuth(`/files/${fileId}/download-url`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Không lấy được link tải");

            const address = document.createElement("a");
            address.href = data.downloadURL;
            address.download = fileName;
            document.body.appendChild(address);
            address.click();
            address.remove();
        } catch (error) {
            alert("Lỗi tải file: " + error.message);
        }
    };

    /**
     * Dùng ở màn hình lịch sử phiên bản (Versioning).
     * Tải đúng VERSION được chỉ định theo fileId + versionNo.
     * Endpoint: GET /files/:id/versions/:versionNo/download-url
     */
    const handleVersionDownloadUrl = async (fileId, versionNo, fileName) => {
        try {
            const res = await fetchWithAuth(`/files/${fileId}/versions/${versionNo}/download-url`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Không lấy được link tải version");

            const address = document.createElement("a");
            address.href = data.downloadURL;
            address.download = fileName;
            document.body.appendChild(address);
            address.click();
            address.remove();
        } catch (error) {
            alert("Lỗi tải file version: " + error.message);
        }
    };

    return { handlePresignedDownloadUrl, handleVersionDownloadUrl, handleDownload };
};