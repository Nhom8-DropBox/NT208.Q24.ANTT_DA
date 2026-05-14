function VersionHolder({ VerNo, VerCreate, VerSize, isCurrent, onDownload, onRestore, onDelete }) {
    return (
        <div className="timeline-item">
            <div className="timeline-dot" style={{ background: "var(--bg-surface)" }}></div>
            <div className="version-header">
                <div className="version-tag">{VerNo}</div>
                <div className="version-date">{VerCreate}</div>
            </div>
            {VerSize && (
                <div className="version-size" style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                    📦 {VerSize}
                </div>
            )}
            <div className="version-actions">
                <button className="btn" onClick={onDownload}>
                    <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>download</span> Tải về
                </button>
                {!isCurrent && (
                    <button className="btn btn-restore" onClick={onRestore}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'red' }}>history</span> Khôi phục
                    </button>
                )}
                {!isCurrent && (
                    <button className="btn" onClick={onDelete} style={{ color: 'var(--text-tertiary)' }}>
                        <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'red' }}>delete</span> Xóa
                    </button>
                )}
            </div>
        </div>
    )
}

export default VersionHolder;