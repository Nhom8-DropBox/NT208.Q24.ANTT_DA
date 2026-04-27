import '../styles/loadingbar.css';
import { useFileUpload } from '../hooks/useFileUpload';

function loadingbar(filename){
    const { progress } = useFileUpload();

    return(
        <div className="loading">
            <p>{filename}</p>
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    )
}