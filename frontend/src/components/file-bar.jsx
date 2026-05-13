import '../styles/file.css';
import { useToggle } from '../hooks/useToggle';
import { useClickOutSide } from '../hooks/useClickOutside';
import { useRef } from 'react';

function FileBar({ ID, Name, Owner, Date, Size, Icon, onDelete, activeTab, onRestore, onDownload, onShare, onVersioning}) {
    const { isOpen, toggle, close } = useToggle(false);

    const menuRef = useRef(null);

    useClickOutSide(menuRef, close);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        toggle();
    };

    return (
        <div className="list-item">
            <div className="col-name">
                <span className={`material-symbols-rounded icon-doc`}>{Icon}</span>
                <span>{Name}</span>
            </div>
            <span className="col-owner">{Owner}</span>
            <span className="col-date">{Date}</span>
            <span className="col-size">{Size}</span>
            <div className='action-menu' ref={menuRef} style={{ position: 'relative' }}>
                <button className="list-action" onClick={handleMenuClick}>
                    <span className="material-symbols-rounded" > more_vert </span>
                </button>

                {isOpen && (
                    <div className="dropdown-menu">
                        {activeTab === 'trash' ? (
                            
                            <>
                                <button className="menu-item" onClick={() => { close(); onRestore(ID); }}>
                                    <span className="material-symbols-rounded">restore_from_trash</span> Khôi phục
                                </button>
                                <button className="menu-item text-danger" onClick={() => { close(); onDelete(ID); }}>
                                    <span className="material-symbols-rounded">delete_forever</span> Xóa vĩnh viễn
                                </button>
                            </>
                        ) : (
                            
                            <>
                                <button className="menu-item" onClick={() => { close(); onDownload(ID, Name); }}>
                                    <span className="material-symbols-rounded">download</span> Tải xuống
                                </button>

                                <button className="menu-item" onClick={() => { close(); onDelete(ID); }}>
                                    <span className="material-symbols-rounded">delete</span> Xóa file
                                </button>

                                <button className="menu-item" onClick={() => { close(); onShare(ID, Name) }}>
                                    <span className="material-symbols-rounded">share</span> Chia sẻ
                                </button>

                                <button className="menu-item" onClick={() => { close(); onVersioning(ID, Name) }}>
                                    <span className="material-symbols-rounded">history</span> Version
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default FileBar;