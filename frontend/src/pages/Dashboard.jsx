import MainContent from "../components/mainContent";
import SideBar from "../components/sideBar";
import { useDeleteFile } from "../hooks/useDeleteFile";
import { useRestoreFile } from "../hooks/useRestoreFile";
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

    const { handleDelete, handleDeletePermanently } = useDeleteFile(setData);

    const handleRestoreSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    const { handleRestoreFile } = useRestoreFile(handleRestoreSuccess);

    const { handleDownload } = useDownloadFile();
    const { handleShare } = useShareFile();
    const { handleVersioning } = useFileVersioning(); // 

    const currentDeleteAction = activeTab === 'trash' ? handleDeletePermanently : handleDelete;

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch danh sách files
                let fetchUrl = '/files'; // Mặc định là home
                if (activeTab === 'trash') {
                    fetchUrl = '/files/trash';
                } else if (activeTab === 'home' || activeTab === 'myfiles') {
                    fetchUrl = '/files';
                }
                const filesResponse = await fetchWithAuth(fetchUrl);
                const filesData = await filesResponse.json();
                const fileList = filesData.files || [];
                const fileCount = fileList.length;

                if (!filesResponse.ok) {
                    throw new Error(filesData.message || "Lỗi lấy danh sách file");
                }

                const profileResponse = await fetchWithAuth(`/dashboard/profile`);
                const profileResult = await profileResponse.json();

                const storageLimit = profileResult.storage_limit || 16106127360;
                setData({
                    files: fileList,
                    length: fileCount,
                    user: profileResult.user,
                    storageLimit,
                    progress: profileResult.total_storage ?
                        `${((profileResult.total_storage / storageLimit) * 100).toFixed(1)}%` : '0%'
                });
            }
            catch (err) {
                console.error("Lỗi fetch data:", err);
            }
        }
        loadData();
    }, [refreshTrigger, activeTab]);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleSearch = async (keyword) => {
        try {
            const url = keyword ? `/files?search=${encodeURIComponent(keyword)}` : '/files';
            const response = await fetchWithAuth(url);
            const result = await response.json();
            setData(prev => ({ ...prev, files: result.files || [] }));
        } catch (err) {
            console.error("Lỗi search:", err);
        }
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
                    onUpgradeSuccess={handleUploadSuccess}
                />

                <MainContent
                    data={data}
                    isUploading={isUploading}
                    uploadingFiles={uploadingFiles}
                    activeTab={activeTab}
                    onDelete={currentDeleteAction}
                    onRestore={handleRestoreFile}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onVersioning={handleVersioning}
                    onCancelUpload={cancelUpload}
                    onResumeUpload={resumeUpload}
                    onRemoveUpload={removeUpload}
                    onClose={onClose}
                    onSearch={handleSearch}
                />
            </div>

        </div>
    )
}

export default Dashboard;