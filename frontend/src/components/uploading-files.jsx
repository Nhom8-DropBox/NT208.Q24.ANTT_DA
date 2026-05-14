import { useState } from 'react';

function UploadFiles({ fileName, progress, status, onPause, onResume, onCancel }) {

  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="FileManager"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="file-info">
        <span className="material-symbols-rounded file-icon">folder_zip</span>
        <div className="file-name">{fileName}</div>
      </div>

      <div className="download-control">

        {/* Đang upload */}
        {status === 'uploading' && (
          isHovered ? (
            <button className="Operation-btn1 pause-btn" onClick={(e) => {
              e.stopPropagation();
              onPause();
            }} title="Tạm dừng">
              <span className="material-symbols-rounded">pause</span>
            </button>
          ) : (
            <div className="circle-progress-bar" style={{ '--p': `${progress}%` }}>
              <div className="inner-circle"></div>
            </div>
          )
        )}

        {/* Đã tạm dừng */}
        {status === 'stopped' && (
          isHovered ? (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="Operation-btn1" onClick={onResume} title="Tiếp tục">
                <span className="material-symbols-rounded" style={{ fontSize: '30px' }}>play_arrow</span>
              </button>
              <button className="Operation-btn1" onClick={onCancel} title="Hủy bỏ" style={{ color: 'var(--text-tertiary)' }}>
                <span className="material-symbols-rounded" style={{ fontSize: '30px', color: 'pink' }}>close</span>
              </button>
            </div>
          ) : (
            <div className="circle-progress-bar paused" style={{ '--p': `${progress}%` }}>
              <div className="inner-circle">
                <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--retro-stroke)' }}>pause</span>
              </div>
            </div>
          )
        )}

        {status === 'success' && (
          <span className="material-symbols-rounded" style={{ color: 'green', fontSize: '30px' }}>done</span>
        )}

        {status === 'error' && (
          <span className="material-symbols-rounded" style={{ color: 'red', fontSize: '30px' }}>error</span>
        )}

      </div>
    </div>
  );
}

export default UploadFiles;