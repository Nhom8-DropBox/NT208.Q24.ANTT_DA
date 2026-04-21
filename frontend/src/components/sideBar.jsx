import {useState} from 'react';
import '../styles/sidebar.css';
import navItem from './nav-item.jsx';
import logo from '../assets/nova_logo.png';
import {useFileUpload} from '../hooks/useFileUpload';

function SideBar(){
    const {fileInputRef, selectedFile, handleTrigger, handleFileChange} = useFileUpload();

    return(
        <aside className="sidebar">
            <div className="brand">
                <img src={logo} className="brand-logo"/>
                <span className="brand-text">Sakura Cloud</span>
            </div>

            <button className="btn-new" onClick={handleTrigger}> 
                <span className="material-symbols-rounded">add</span>
                New
            </button>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} style= {{display: 'none'}}/>

            <nav className="sidebar-nav">
                {navItem({icon: 'home', text: 'Home', link: '#', active: true})}
                {navItem({icon: 'folder', text: 'My Files', link: '#', active: false})}
                {navItem({icon: 'delete', text: 'Trash', link: '#', active: false})}
            </nav>

            <div className="storage">
                <div className="storage-header">
                    <span className="material-symbols-rounded">cloud</span>
                    <span className="storage-title">Storage</span>
                </div>
                <div className="progress-bar">
                    <div className="progress" style={{ width: '75%' }}></div>
                </div>
                <div className="storage-info">11.25 GB of 15 GB used</div>
                <button className="btn-upgrade">Upgrade Storage</button>
            </div>
        </aside>
    )
}

export default SideBar;