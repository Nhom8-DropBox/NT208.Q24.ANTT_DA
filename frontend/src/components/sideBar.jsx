import { useState } from 'react';
import '../styles/sidebar.css';
import NavItem from './nav-item.jsx';
import logo from '../assets/nova_logo.png';
import { fetchWithAuth } from '../utils/api';

function SideBar({ data, onNewClick, fileInputRef, onFileChange, activeTab, setActiveTab, onUpgradeSuccess }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');

    const storageLimit = data?.storageLimit || 16106127360;
    const usedGB = ((parseInt(data?.progress || 0) * storageLimit / 100) / (1024 * 1024 * 1024)).toFixed(2);
    const limitGB = (storageLimit / (1024 * 1024 * 1024)).toFixed(0);

    const handleUpgrade = async () => {
        if (!code.trim()) return;
        try {
            const res = await fetchWithAuth('/dashboard/users/upgrade', {
                method: 'POST',
                body: JSON.stringify({ code: code.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Nâng cấp thành công!');
                setCode('');
                if (onUpgradeSuccess) onUpgradeSuccess();
                setTimeout(() => { setIsModalOpen(false); setMessage(''); }, 1500);
            } else {
                setMessage(data.message || 'Mã không hợp lệ');
            }
        } catch {
            setMessage('Lỗi kết nối');
        }
    };

    return (
        <aside className="sidebar">
            <div className="brand">
                <img src={logo} className="brand-logo" />
                <span className="brand-text">Sakura Cloud</span>
            </div>

            <button className="btn-new" onClick={onNewClick}>
                <span className="material-symbols-rounded">add</span> New
            </button>

            <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />

            <nav className="sidebar-nav">
                <div onClick={() => setActiveTab('home')}>
                    <NavItem icon="home" text="Home" link="#" active={activeTab === 'home'} />
                </div>

                <div onClick={() => setActiveTab('myfiles')}>
                    <NavItem icon="folder" text="My Files" link="#" active={activeTab === 'myfiles'} />
                </div>

                <div onClick={() => setActiveTab('trash')}>
                    <NavItem icon="delete" text="Trash" link="#" active={activeTab === 'trash'} />
                </div>
            </nav>

            <div className="storage">
                <div className="storage-header">
                    <span className="material-symbols-rounded">cloud</span>
                    <span className="storage-title">Storage</span>
                </div>
                <div className="progress-bar">
                    <div className="progress" id="progress" style={{ width: data?.progress || "0%" }}></div>
                </div>
                <div className="storage-info">{usedGB} GB of {limitGB} GB used</div>
                <button className="btn-upgrade" onClick={() => { setIsModalOpen(true); setMessage(''); }}>Upgrade Storage</button>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--bg-color, #fff)', padding: '24px', borderRadius: '12px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ margin: 0 }}>Nhập mã nâng cấp</h3>
                        <input
                            type="text"
                            placeholder="Nhập mã code..."
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                        {message && <span style={{ fontSize: '13px', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</span>}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => { setIsModalOpen(false); setCode(''); setMessage(''); }} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Huỷ</button>
                            <button onClick={handleUpgrade} className="btn-upgrade" style={{ padding: '8px 16px' }}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}

export default SideBar;