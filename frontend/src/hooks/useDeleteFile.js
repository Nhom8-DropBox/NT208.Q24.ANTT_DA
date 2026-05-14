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

    // xóa version
    const handleDeleteVersion = async (fileId, versionNo, setVersions) => {
        if (!window.confirm(`Bạn có chắc muốn xóa version V${versionNo}?`)) return;

        try {
            const response = await fetchWithAuth(`/files/${fileId}/versions/${versionNo}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Lỗi khi xóa version');
            }

            alert('Đã xóa version thành công!');
            if (setVersions) {
                setVersions(prev => prev.filter(v => v.versionNo !== versionNo));
            }

        } catch (error) {
            alert(error.message);
        }
    };

    return { handleDelete, handleDeletePermanently, handleDeleteVersion };
};