import '../styles/linkBoard.css'
export default function LinksItem({ linkName, url, onRevoke }) {
    return (
        <div className="LinkManager">
            <div className="link-info">
                <span className="material-symbols-rounded link-icon">share</span>
                <div className="link-details">
                    <div className="link-name">{linkName}</div>
                    <div className="link-url" title={url}>{url}</div>
                </div>
            </div>
            <div className="link-control">
                <button className="Operation-btn" title="Copy Link" onClick={() => {
                    navigator.clipboard.writeText(url).then(() => alert("Đã copy link!"));
                }}>
                    <span className="material-symbols-rounded">content_copy</span>
                </button>
                <button className="Operation-btn" title="Open Link" onClick={() => window.open(url, "_blank")}>
                    <span className="material-symbols-rounded">open_in_new</span>
                </button>
                <button className="Operation-btn" title="Huỷ link" onClick={onRevoke} style={{ color: 'var(--danger-color, #e74c3c)' }}>
                    <span className="material-symbols-rounded">link_off</span>
                </button>
            </div>
        </div>
    )
}