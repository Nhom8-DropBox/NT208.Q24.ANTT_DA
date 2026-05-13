// hooks/useRestoreFile.js
import { fetchWithAuth } from "../utils/api";

export const useRestoreFile = (setData) => {

    const handleRestore = async (fileId) => {
        try {
            const response = await fetchWithAuth(`/files/${fileId}/restore`, {
                method: 'PUT' 
            });

            if (!response.ok) throw new Error("Lỗi khi khôi phục file!");

            setData(prevData => ({
                ...prevData,
                files: prevData.files?.filter(file => file.id !== fileId) || []
            }));

        } catch (error) {
            alert(error.message);
        }
    };

    return { handleRestore };
};