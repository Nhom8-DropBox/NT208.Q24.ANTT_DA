import iconBtn from "../buttons/icon-btn";
import Files from "../file-display/file-bar.jsx";
import './mainContent.css';

function MainContent() {
    return (
        <main className="main-content">

            <header className="top-header">
                <div className="search-bar">
                    <span className="material-symbols-rounded search-icon">search</span>
                    <input type="text" placeholder="Search in Drive..."/>
                    <span className="material-symbols-rounded filter-icon">tune</span>
                </div>

                <div className="header-actions">
                    {iconBtn({icon: 'offline_pin', title: 'Offline preview', onClick: () => {}})}
                    {iconBtn({icon: 'help', title: 'Help', onClick: () => {}})}
                    {iconBtn({icon: 'settings', title: 'Settings', onClick: () => {}})}
                    <div className="profile-pic">
                        <span>AN</span>
                    </div>
                </div>
            </header>

            <div className="content-board">
                <h1>Welcome Back, An!</h1>


                <section className="section">
                    <div className="file-list">
                        {Files({Name: 'Projects.docs', Owner: 'me', Date: 'Mar 25, 2026', Size: '24 KB', Icon: 'description'})}
                        {/* {Files({Name: 'Top-Secret.txt', Owner: 'me', Date: 'Mar 24, 2026', Size: '1.2 MB', Icon: 'description'})}
                        {Files({Name: 'Hello.pptx', Owner: 'me', Date: 'Mar 20, 2026', Size: '15 MB', Icon: 'slideshow'})} */}
                    </div>
                </section>
            </div>
        </main>
    )
}
export default MainContent;