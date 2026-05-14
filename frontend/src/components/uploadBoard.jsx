import '../styles/upload.css'
import UploadFiles from './uploading-files';
import { useState } from 'react';
function UploadBoard({ files = [], onPause, onResume, onCancel, onClose}) {
    const [isExpanded, setIsExpanded] = useState(true); // tạo state để quản lý đóng mở

    const handleCloseAll = () => {

        const hasUploadingFile = files.some(
            file => file.status === 'uploading' || file.status === 'stopped'
        );

        if (hasUploadingFile) {
            const confirmClose = window.confirm(
                "Bạn có muốn hủy tất cả các tệp đang tải lên không?"
            );

            if (!confirmClose) return;

            files.forEach(file => {
                onCancel(file.id);
            });
        }

        if (onClose) {
            onClose();
        }
    };
    
    return (
        <div className={`uploadContainer ${isExpanded ? '' : 'collapsed'}`}> {}
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✦</div>
            <div className="sparkle s3">✦</div>
            <div className="upload-header">
                <span>Uploading {files.length || 1} item...</span>
                <div className="header-actions"> 
                    {/* Thêm sự kiện onClick để đảo ngược trạng thái */}
                    <span className="material-symbols-rounded" 
                        style={{ cursor: 'pointer', transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.5s' }}
                        onClick={() => setIsExpanded(!isExpanded)}>
                        expand_more
                    </span>
                    <span className="material-symbols-rounded" 
                        style={{ cursor: 'pointer' }}
                        onClick={handleCloseAll}>
                        close
                    </span>
                </div>
            </div>

            <div className="expand-wrapper">
                <div className="outer-border">
                    {files.map((file) => (
                        <UploadFiles
                            key={file.id}
                            fileName={file.name}
                            progress={file.progress}
                            status={file.status}
                            onPause={() => onPause(file.id)}
                            onResume={() => onResume(file)}
                            onCancel={() => onCancel(file.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default UploadBoard;