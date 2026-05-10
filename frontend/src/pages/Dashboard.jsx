import MainContent from "../components/mainContent";
import SideBar from "../components/sideBar";
import { useDeleteFile } from "../hooks/useDeleteFile";
import { useDownloadFile } from "../hooks/useDownloadFile";
import { useShareFile } from "../hooks/useShareFile.jsx";
import { useFileVersoning } from "../hooks/useFileVersioning.js";
import '../styles/UI.css';
import { fetchWithAuth } from "../utils/api";
import { useFileUpload } from '../hooks/useFileUpload';
import { useState, useEffect } from 'react';


function Dashboard() {

    const [data, setData] = useState(null); //Dữ liệu file từ DB, dữ liệu storage
    const [activeTab, setActiveTab] = useState('home');

    const { handleDelete } = useDeleteFile();
    const { handleDownload } = useDownloadFile();
    const { handleShare } = useShareFile();
    const { handleVersoning } = useFileVersoning();

    useEffect(() => {
        const loadData = async () => {
            try {
                //console.log("1. before fetch");
                const response = await fetchWithAuth(`/dashboard`);

                const result = await response.json();
                //console.log("2. after fetch");
                if (!response.ok) {
                    throw new Error(result.message);
                }
                console.log(result);
                setData(result);
            }
            catch (err) {
                alert(err.message || "Lỗi kết nối tới server!");
            }
        }
        loadData();
    }, []);

    const {
        fileInputRef,
        uploadingFiles,
        isUploading,
        handleTrigger,
        handleFileChange,
        cancelUpload
    } = useFileUpload();

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
                    onVersoning = {handleVersoning}
                    onCancelUpload={cancelUpload}
                />
            </div>

        </div>
    )
}

export default Dashboard;