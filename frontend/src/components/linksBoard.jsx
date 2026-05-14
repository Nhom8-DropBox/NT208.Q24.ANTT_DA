import '../styles/linkBoard.css'
import LinksItem from './linksItem'
import { useRef } from 'react'
import { useClickOutSide } from '../hooks/useClickOutSide'
import { useShareFile } from '../hooks/useShareFile'

const FE_URL = import.meta.env.VITE_FE_URL || window.location.origin;

export default function LinksBoard({ onClose }) {
    const boardRef = useRef(null);
    const { links, revokeLink } = useShareFile();

    useClickOutSide(boardRef, () => {
        if (onClose) onClose();
    });

    return (
        <div className="linkWrapper" ref={boardRef}>
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
                    {links && links.length > 0 ? (
                        links.map((link) => (
                            <LinksItem
                                key={link.id}
                                linkName={link.file_name}
                                url={`${FE_URL}/download?token=${link.token_uuid}`}
                                onRevoke={() => revokeLink(link.id)}
                            />
                        ))
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px", color: "var(--text-color)" }}>
                            Chưa có link nào được tạo.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}