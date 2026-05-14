import IconBtn from "./icon-btn";
import Files from "./file-bar.jsx";
import { useToggle } from "../hooks/useToggle.js";
import ProfilePopUp from "./profile-popup.jsx";
import UploadBoard from "./uploadBoard.jsx";
import '../styles/mainContent.css';
import LinksBoard from "./linksBoard.jsx";
import { useProfile } from "../hooks/useProfile.js";
import { getInitials } from "../utils/getInitial.js";
import { useState } from "react";


function MainContent({ data, isUploading, uploadingFiles, activeTab, onDelete, onRestore, onDownload, onShare, onVersioning, onCancelUpload, onResumeUpload, onRemoveUpload, onClose, onSearch }) {
    const { isOpen: isLinksOpen, open: openLinks, close: closeLinks } = useToggle();
    const { isOpen: isProfileOpen, open: openProfile, close: closeProfile } = useToggle();
    const { name, email } = useProfile();
    let profileName = getInitials(name);
    const [keyword, setKeyword] = useState("");

    return (
        <main className="main-content">

            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-rounded search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Search in Drive..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            onSearch?.(e.target.value);
                        }}
                    />
                    <span className="material-symbols-rounded filter-icon">tune</span>
                </div>

                <div className="header-actions">
                    <div style={{ position: 'relative' }}>
                        <IconBtn icon="offline_pin" title="Offline preview" onClick={openLinks} />
                        {isLinksOpen && <LinksBoard onClose={closeLinks} />}
                    </div>
                    {/* <IconBtn icon="help" title="Help" />
                    {IconBtn({ icon: 'settings', title: 'Settings', onClick: () => { } })} */}
                    <div className="profile-pic" onClick={openProfile}>
                        <span>{profileName}</span>

                    </div>
                    <ProfilePopUp isOpen={isProfileOpen} onClose={closeProfile} progress={data?.progress} files={data?.length} name={name} email={email} />
                </div>
            </header>

            <div className="content-board">
                <h1>
                    {activeTab === 'trash' ? 'Hello I am your Trash Can' : `Welcome Back, ${name}!`}
                </h1>
                {/* Lấy files từ database */}
                <section className="section">
                    <div className="file-list">
                        {data?.files?.map((file) => (
                            <Files
                                key={file.id}
                                fileId={file.id}
                                ID={file.id}
                                Name={file.name}
                                Owner='me' // 
                                Date={new Date(file.created_at || file.deleted_at).toLocaleDateString()}
                                Size={file.size_bytes ? (file.size_bytes / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB'}
                                Icon={'description'}
                                activeTab={activeTab}
                                onDelete={onDelete}
                                onRestore={onRestore}
                                onDownload={onDownload}
                                onShare={onShare}
                                onVersioning={onVersioning}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {isUploading && <UploadBoard files={uploadingFiles} onPause={onCancelUpload} onResume={onResumeUpload} onCancel={onRemoveUpload} onClose={onClose} />}
            {/* {uploadingFiles?.length > 0 && <UploadBoard files={uploadingFiles} onPause={onCancelUpload} onResume={onResumeUpload} onCancel={onRemoveUpload} />} */}
        </main>
    )
}
export default MainContent;