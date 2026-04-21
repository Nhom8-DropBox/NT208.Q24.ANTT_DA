import MainContent from "../maincontent/mainContent";
import Sidebar from "../sidebar/sidebar";
import './UI.css';
function Dashboard() {
    return (
        <div className="Dashboard-Container">
            <div className="main-page">
                    <Sidebar />
                    <MainContent />

            </div>

        </div>
    )
}

export default Dashboard;