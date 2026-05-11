import '../styles/upload.css'
import UploadFiles from './uploading-files';
function UploadBoard({ files = [], onPause, onResume, onCancel }) {
    return (
        <div className="uploadContainer">
            <div className="sparkle s1">✦</div>
            <div className="sparkle s2">✦</div>
            <div className="sparkle s3">✦</div>
            <div className="upload-header">
                <span>Uploading {files.length || 1} item...</span>
                <div className="header-actions">
                    <span className="material-symbols-rounded">expand_more</span>
                    <span className="material-symbols-rounded">close</span>
                </div>
            </div>

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
    )
}

export default UploadBoard;