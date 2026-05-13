import "../styles/DownloadPage.css";
import { useSearchParams } from "react-router-dom";
import { useDownloadFile } from "../hooks/useDownloadFile";
import { useEffect, useState } from "react";
import logo from "../assets/nova_logo.png";

const API_URL = "http://localhost:3000";

export default function DownloadPage() {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");       // shared link mode
    const fileId = searchParams.get("fileId");     // owner mode
    const fileNameParam = searchParams.get("fileName");

    const { handlePresignedDownloadUrl } = useDownloadFile();

    // State cho token mode
    const [sharedFile, setSharedFile] = useState(null);  // { fileName, size, downloadUrl }
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Nếu có token → fetch thông tin file từ public API
    useEffect(() => {
        if (!token) return;
        const fetchShared = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/share-links/share/${token}`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.message || "Link không hợp lệ");
                } else {
                    setSharedFile(data); // { fileName, size, permission, downloadUrl }
                }
            } catch (err) {
                setError("Không thể kết nối tới server");
            } finally {
                setLoading(false);
            }
        };
        fetchShared();
    }, [token]);

    // Trigger download từ presigned URL (không cần auth)
    const handleSharedDownload = () => {
        if (!sharedFile?.downloadUrl) return;
        const a = document.createElement("a");
        a.href = sharedFile.downloadUrl;
        a.download = sharedFile.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const formatSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // --- Render ---
    return (
        <div className="DownloadContainer">
            <div className="logo-container">
                <img src={logo} className="brand-logo" alt="logo" />
                <div className="brand-text">Sakura Cloud</div>
            </div>

            <div className="share-card">
                {loading && <p className="file-size">Đang tải thông tin...</p>}

                {error && <p className="file-size" style={{ color: "red" }}>{error}</p>}

                {/* Token mode: shared link */}
                {token && sharedFile && !error && (
                    <>
                        <span className="material-symbols-rounded file-icon">description</span>
                        <div className="file-name">{sharedFile.fileName || "Unknown File"}</div>
                        {sharedFile.size && (
                            <div className="file-size">{formatSize(sharedFile.size)}</div>
                        )}
                        <button className="btn-download-big" onClick={handleSharedDownload}>
                            <span className="material-symbols-rounded">download</span> Download
                        </button>
                    </>
                )}

                {/* FileId mode: owner download (cần đăng nhập) */}
                {!token && fileId && (
                    <>
                        <span className="material-symbols-rounded file-icon">description</span>
                        <div className="file-name">{fileNameParam || "Unknown File"}</div>
                        <div className="file-size">ID: {fileId}</div>
                        <button
                            className="btn-download-big"
                            onClick={() => handlePresignedDownloadUrl(fileId, fileNameParam)}
                        >
                            <span className="material-symbols-rounded">download</span> Download
                        </button>
                    </>
                )}

                {/* Không có token lẫn fileId */}
                {!token && !fileId && (
                    <p className="file-size">Link không hợp lệ.</p>
                )}
            </div>
        </div>
    );
}
