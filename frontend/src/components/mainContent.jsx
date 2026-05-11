import IconBtn from "./icon-btn";
import Files from "./file-bar.jsx";
import { useToggle } from "../hooks/useToggle.js";
import ProfilePopUp from "./profile-popup.jsx";
import UploadBoard from "./uploadBoard.jsx";
import '../styles/mainContent.css';
import LinksBoard from "./linksBoard.jsx";
// import UploadFiles from "./uploading-files.jsx";
// import { use, useState } from "react";

function MainContent({ data, isUploading, uploadingFiles, activeTab, onDelete, onDownload, onShare, onVersoning, onCancelUpload, onResumeUpload, onRemoveUpload }) {
    const { isOpen: isLinksOpen, open: openLinks, close: closeLinks } = useToggle();
    const { isOpen: isProfileOpen, open: openProfile, close: closeProfile } = useToggle();
    return (
        <main className="main-content">

            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-rounded search-icon">search</span>
                    <input type="text" placeholder="Search in Drive..." />
                    <span className="material-symbols-rounded filter-icon">tune</span>
                </div>

                <div className="header-actions">
                    <IconBtn icon="offline_pin" title="Offline preview" onClick={openLinks} />
                    <IconBtn icon="help" title="Help" />
                    {IconBtn({ icon: 'settings', title: 'Settings', onClick: () => { } })}
                    <div className="profile-pic" onClick={openProfile}>
                        <span>AN</span>

                    </div>
                    <ProfilePopUp isOpen={isProfileOpen} onClose={closeProfile} />
                    {isLinksOpen && <LinksBoard onClose={closeLinks} />}
                </div>
            </header>

            <div className="content-board">
                <h1>
                    {activeTab === 'trash' ? 'Hello I am your Trash Can' : 'Welcome Back, An!'}
                </h1>
                {/* Lấy files từ database */}
                <section className="section">
                    <div className="file-list">
                        <Files key='1' Name='TopSecret.txt' Owner='me' Date='30-4-2026' Size='14 MB' Icon='description' onDelete={onDelete} onDownload={onDownload} onShare={onShare} />
                        {data?.files?.map((file) => (
                            <Files
                                key={file.id}
                                ID={file.id}
                                Name={file.name}
                                Owner='me'
                                Date={new Date(file.created_at).toLocaleDateString()}
                                Size={file.size_bytes ? (file.size_bytes / (1024 * 1024)).toFixed(2) + ' MB' : '0 MB'}
                                Icon={'description'}
                                onDelete={onDelete}
                                onDownload={onDownload}
                                onShare={onShare}
                                onVersoning={onVersoning}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {isUploading && <UploadBoard files={uploadingFiles} onPause={onCancelUpload} onResume={onResumeUpload} onCancel={onRemoveUpload} />}
            {/* {uploadingFiles?.length > 0 && <UploadBoard files={uploadingFiles} onPause={onCancelUpload} onResume={onResumeUpload} onCancel={onRemoveUpload} />} */}
        </main>
    )
}
export default MainContent;