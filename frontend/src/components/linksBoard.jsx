import '../styles/linkBoard.css'
import LinksItem from './linksItem'

export default function LinksBoard({ onClose }) {
    return (
        <div className="linkWrapper">
            <div className="linkPopupContainer">
                <div className="sparkle s1">✦</div>
                <div className="sparkle s2">✦</div>
                <div className="sparkle s3">✦</div>

                <div className="popup-header">
                    <span>Recent Links</span>
                    <div className="header-actions">
                        <span className="material-symbols-rounded" title="Minimize">expand_more</span>
                        <span className="material-symbols-rounded" title="Close" onClick={onClose}>close</span>
                    </div>
                </div>

                <div className="outer-border">
                    <LinksItem linkName="Top Secret.txt" url="https://sakura.cloud/share/abc123xyz" />

                </div>
            </div>
        </div>
    )
}