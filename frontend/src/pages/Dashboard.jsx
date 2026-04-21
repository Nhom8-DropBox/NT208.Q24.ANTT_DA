import MainContent from "../components/mainContent";
import Sidebar from "../components/sideBar";
import '../styles/UI.css';
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