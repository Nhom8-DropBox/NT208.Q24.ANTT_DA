import '../styles/profile.css'
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutSide } from '../hooks/useClickOutSide';

function ProfilePopUp({ isOpen, onClose, progress, files, name, email }) {

    const popupRef = useRef(null);
    const navigate = useNavigate();

    useClickOutSide(popupRef, () => {
        if (isOpen) onClose();
    });

    const handleLogout = () => {
        localStorage.removeItem("token");

        onClose();

        navigate('/login', { replace: true });

        console.log("Đăng Xuất Thành Công!")
    }

    return (
        <div className={`profile-popup ${isOpen ? 'active' : ''}`} ref={popupRef}>

            <div className="cloud-decoration">
                <svg width="86" height="42" viewBox="0 0 86 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22 39.5H68C76 39.5 81 33 81 26.5C81 20 76.5 16 71 15L68 14.5L66 11.5C62.5 4.5 54 2 46 2C38 2 32.5 7.5 31 13.5L30 16.5L26.5 17C18.5 18 14 23.5 14 28.5C14 34.5 18 39.5 22 39.5Z"
                        fill="white"
                        stroke="#42294A"
                        strokeWidth="3"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div className="body">
                <div className="inner-body">

                    <div className="sparkle s1">✦</div>
                    <div className="sparkle s2">✦</div>
                    <div className="sparkle s3">✦</div>


                    <div className="Content">
                        <div className="welcome-label">
                            <span className="material-symbols-rounded" style={{ fontSize: '14px', color: '#f29cd0' }} >cake</span>
                            <span>SakuraCloud</span>
                        </div>

                        <div className="title">Hi, {name}!</div>

                        <button className="logout" onClick={handleLogout}>LOG OUT</button>


                        <div className="info-box">
                            <div className="info-item">
                                <span className="material-symbols-rounded">mail</span>
                                <span>{email}</span>
                            </div>
                            <div className="info-item">
                                <span className="material-symbols-rounded">folder</span>
                                <span>{files} Files Uploaded</span>
                            </div>

                            <hr />

                            <div className="storage-header">
                                <span className="material-symbols-rounded">cloud</span>
                                <span>Storage Usage</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress" style={{ width: progress || "0%" }}></div>
                            </div>
                            <div className="storage-info">{(parseInt(progress) || 0) * 15 / 100} GB / 15 GB Used</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePopUp;