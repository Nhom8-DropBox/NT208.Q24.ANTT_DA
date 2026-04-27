import MainContent from "../components/mainContent";
import Sidebar from "../components/sideBar";
import '../styles/UI.css';
import { fetchWithAuth } from "../utils/api";
import { useState, useEffect } from 'react';


function Dashboard() {
    
        const [data, setData] = useState(null); // hàm set state cho data
        useEffect(() => 
        {   
            const loadData = async () => 
                { 
                    try
                    {   
                        console.log("1. before fetch");
                        const response = await fetchWithAuth(`/dashboard`);

                        const result = await response.json();
                        console.log("2. after fetch");
                        if(!response.ok)
                        {
                            throw new Error(result.message);
                        }
                        console.log(result);
                        setData(result);
                    }
                    catch(err)
                    {
                        alert(err.message || "Lỗi kết nối tới server!");
                    }
                }
            loadData();
        }, []);

    return (
        <div className="Dashboard-Container">
            <div className="main-page">
                    <Sidebar data={data} />
                    <MainContent data={data} />
            </div>

        </div>
    )
}

export default Dashboard;