// hooks/useDeleteFile.js
import { fetchWithAuth } from "../utils/api";

export const useDeleteFile = (setData) => {

    // xóa mềm (chuyển vào trash)
    const handleDelete = async (fileId) => {
        if (!window.confirm("Bạn có chắc muốn đưa file này vào thùng rác không?")) return;

        try {
            const response = await fetchWithAuth(`/files/${fileId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error("Lỗi khi xóa file!");

            alert("Đã chuyển vào thùng rác!");
            setData(prevData => {
                const newFiles = prevData.files?.filter(file => file.id !== fileId) || [];
                return {
                    ...prevData,
                    files: newFiles,
                    length: newFiles.length
                };
            });

        } catch (error) {
            alert(error.message);
        }
    };

    // xóa cứng 
    const handleDeletePermanently = async (fileId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn file này? Hành động này không thể khôi phục!")) return;

        try {
            const response = await fetchWithAuth(`/files/${fileId}/permanent`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error("Lỗi khi xóa vĩnh viễn file!");

            alert("Đã xoá vĩnh viễn thành công!");
            setData(prevData => {
                const newFiles = prevData.files?.filter(file => file.id !== fileId) || [];
                return {
                    ...prevData,
                    files: newFiles,
                    length: newFiles.length
                };
            });

        } catch (error) {
            alert(error.message);
        }
    };

    // Trả về cả 2 hàm để Component có thể dùng
    return { handleDelete, handleDeletePermanently };
};