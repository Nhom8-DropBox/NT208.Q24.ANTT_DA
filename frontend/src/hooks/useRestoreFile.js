// hooks/useRestoreFile.js
import { fetchWithAuth } from "../utils/api";

export const useRestoreFile = (setData) => {

    const handleRestore = async (fileId, versionNo) => {
        try {
            console.log("Khôi phục bản:", versionNo);

            const isConfirmed = window.confirm(`Bạn có chắc muốn lấy bản V${versionNo} đè lên bản hiện tại không?`);
            if (!isConfirmed) return;

            const response = await fetchWithAuth(`/files/${fileId}/versions/${versionNo}/restore`, {
                method: 'POST'
            });

            if (response && response.ok) {
                alert(`Đã khôi phục thành công về bản V${versionNo}`);
                window.location.reload();
            }
            else {
                const errorData = await response.json();
                alert("Khôi phục thất bại: " + errorData.message);
            }
        } catch (err) {
            console.error("Lỗi khôi phục:", err);
        }
    };

    const handleRestoreFile = async (fileId, fileName) => {
        try {
            console.log("Khôi phục file", fileName);
            const isConfirmed = window.confirm("Bạn có chắc muốn khôi phục file này?");

            if (isConfirmed) {
                const res = await fetchWithAuth(`/files/${fileId}/restore`, {
                    method: 'POST'
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        alert("Khôi phục thành công");
                        if (setData) {
                            setData(prevData => ({
                                ...prevData,
                                files: prevData.files?.filter(file => file.id !== fileId) || []
                            }));
                        }
                    }
                    else {
                        alert("Khôi phục thất bại")
                    }
                }
                else {
                    alert("Lỗi server!");
                }
            }
        }
        catch (err) {
            console.error("Lỗi khôi phục file", err);
        }
    }
    return { handleRestore, handleRestoreFile };
};