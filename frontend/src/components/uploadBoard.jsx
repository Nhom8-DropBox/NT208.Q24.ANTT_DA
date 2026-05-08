import '../styles/upload.css'
import UploadFiles from './uploading-files';
function UploadBoard({ files = [], onCancel }) {
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
                    />
                ))}

                <div className="FileManager">
                    <div className="file-info">
                        <span className="material-symbols-rounded file-icon">folder_zip</span>
                        <div className="file-name">aaaaaaa.zip</div>
                    </div>
                    <div className="download-control">
                        {/* Đang test */}
                        {!(status == 'uploading') && (
                            <div className="circle-progress-bar" style={{ "--p": `70%` }}>
                                <div className="inner-circle"></div>
                            </div>
                        )}
                        {(status == 'uploading') && (
                            <button className="cancel-btn" onClick={onCancel}>
                                <span className="material-symbols-rounded" >close</span>
                            </button>
                        )}
                        {(status == 'success') && (
                            <span className="material-symbols-rounded" style={{ color: 'green', fontSize: '18px', fontWeight: '800px' }}>done</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadBoard;