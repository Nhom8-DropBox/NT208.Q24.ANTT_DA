import { fetchWithAuth } from "../utils/api";



export const useDeleteFile = (setData) => {
    
  
    const handleDelete = async (fileId) => {
        if (!window.confirm("Bạn có chắc muốn đưa file này vào thùng rác không?")) return;

        try {
            const response = await fetchWithAuth(`/files/${fileId}`, {
                method: 'PUT' 
            });

            if (!response.ok) throw new Error("Lỗi khi xóa file!");
 

            setData(prevData => ({
                ...prevData,
                files: prevData.files?.filter(file => file.id !== fileId) || []
            }));

        } catch (error) {
            alert(error.message);
        }
    };
    
    return { handleDelete };
};