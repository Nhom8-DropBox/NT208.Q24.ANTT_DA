import {useState} from 'react';
import '../styles/sidebar.css';
import NavItem from './nav-item.jsx';
import logo from '../assets/nova_logo.png';

function SideBar({ data, onNewClick, fileInputRef, onFileChange, activeTab, setActiveTab}){
    return(
        <aside className="sidebar">
            <div className="brand">
                <img src={logo} className="brand-logo"/>
                <span className="brand-text">Sakura Cloud</span>
            </div>

            <button className="btn-new" onClick={onNewClick}> 
                <span className="material-symbols-rounded">add</span> New
            </button>

            <input type="file" ref={fileInputRef} onChange={onFileChange} style= {{display: 'none'}}/>

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
                    <div className="progress" id="progress" style={{ width: data?.progress||"0%" }}></div>
                </div>
                <div className="storage-info">11.25 GB of 15 GB used</div>
                <button className="btn-upgrade">Upgrade Storage</button>
            </div>
        </aside>
    )
}

export default SideBar;