import '../styles/linkBoard.css'
export default function LinksItem({ linkName, url }) {
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
                <button className="Operation-btn copy-btn" title="Copy Link">
                    <span className="material-symbols-rounded">content_copy</span>
                </button>
                <button className="Operation-btn go-btn" title="Open Link">
                    <span className="material-symbols-rounded">open_in_new</span>
                </button>
            </div>
        </div>
    )
}