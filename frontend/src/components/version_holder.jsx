function VersionHolder({ VerNo, VerCreate, onDownload, onRestore }) {
    return (
        <div className="timeline-item">
            <div className="timeline-dot" style={{ background: "var(--bg-surface)" }}></div>
            <div className="version-header">
                <div className="version-tag">{VerNo}</div>
                <div className="version-date">{VerCreate}</div>
            </div>
            <div className="version-actions">
                <button className="btn" onClick={onDownload}>
                    <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>download</span> Tải về
                </button>
                <button
                    className="btn btn-restore"
                    onClick={onRestore}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'red' }}>history</span> Khôi phục
                </button>
            </div>
        </div>
    )
}

export default VersionHolder;