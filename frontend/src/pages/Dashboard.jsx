import MainContent from "../components/mainContent";
import SideBar from "../components/sideBar";
import { useDeleteFile } from "../hooks/useDeleteFile";
import { useDownloadFile } from "../hooks/useDownloadFile";
import { useShareFile } from "../hooks/useShareFile.jsx";
import { useFileVersioning } from "../hooks/useFileVersioning.js";
import '../styles/UI.css';
import { fetchWithAuth } from "../utils/api";
import { useFileUpload } from '../hooks/useFileUpload';
import { useState, useEffect } from 'react';


function Dashboard() {

    const [data, setData] = useState({ files: [], user: null, progress: '0%' }); //Dữ liệu file từ DB, dữ liệu storage
    const [activeTab, setActiveTab] = useState('home');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const { handleDelete } = useDeleteFile(setData);
    const { handleDownload } = useDownloadFile();
    const { handleShare } = useShareFile();
    const { handleVersioning } = useFileVersioning(); // 

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch danh sách files
                let filesResponse = [];
                if (activeTab == "home") {
                    filesResponse = await fetchWithAuth(`/files`);
                }
                else if (activeTab === "trash") {
                    filesResponse = await fetchWithAuth(`/files/trash`); // Giả sử vì chưa có bảng trash hay api kiếm trong bảng trash
                }
                const filesList = await filesResponse.json();
                // Fetch thông tin profile và dung lượng (nếu cần thiết cho Sidebar)
                const profileResponse = await fetchWithAuth(`/dashboard/profile`);
                const profileResult = await profileResponse.json();

                if (!filesResponse.ok) {
                    throw new Error(filesList.message || "Lỗi lấy danh sách file");
                }

                setData({
                    files: filesList.files || [],
                    user: profileResult.user,
                    progress: profileResult.total_storage ?
                        `${((profileResult.total_storage / (15 * 1024 * 1024 * 1024)) * 100).toFixed(1)}%` : '0%'
                });
            }
            catch (err) {
                console.error("Lỗi fetch data:", err);
            }
        }
        loadData();
    }, [refreshTrigger]);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const {
        fileInputRef,
        uploadingFiles,
        isUploading,
        handleTrigger,
        handleFileChange,
        cancelUpload,
        resumeUpload,
        removeUpload,
        onClose
    } = useFileUpload(handleUploadSuccess);

    return (
        <div className="Dashboard-Container">
            <div className="main-page">
                <SideBar
                    data={data}
                    onNewClick={handleTrigger}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onDelete={handleDelete}
                />

                <MainContent
                    data={data}
                    isUploading={isUploading}
                    uploadingFiles={uploadingFiles}
                    activeTab={activeTab}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onVersioning={handleVersioning}
                    onCancelUpload={cancelUpload}
                    onResumeUpload={resumeUpload}
                    onRemoveUpload={removeUpload}
                    onClose={onClose}
                />
            </div>

        </div>
    )
}

export default Dashboard;