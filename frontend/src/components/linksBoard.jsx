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

                    {/* <div className="LinkManager">
                        <div className="link-info">
                            <span className="material-symbols-rounded link-icon">download</span>
                            <div className="link-details">
                                <div className="link-name">TopSecret.xlsx</div>
                                <div className="link-url" title="https://sakura.cloud/dl/def456uvw">sakura.cloud/dl/def4...</div>
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


                    <div className="LinkManager">
                        <div className="link-info">
                            <span className="material-symbols-rounded link-icon">share</span>
                            <div className="link-details">
                                <div className="link-name">Hello_Presentation.pptx</div>
                                <div className="link-url" title="https://sakura.cloud/share/ghi789rst">sakura.cloud/share/ghi...</div>
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
                    </div> */}
                </div>
            </div>
        </div>
    )
}