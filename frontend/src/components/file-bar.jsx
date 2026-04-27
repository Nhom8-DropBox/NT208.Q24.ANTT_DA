import '../styles/file.css';

function FileBar({ Name, Owner, Date, Size, Icon }) {
    return (
        <div className="list-item">
            <div className="col-name">
                <span className={`material-symbols-rounded icon-doc`}>{Icon}</span>
                <span>{Name}</span>
            </div>
            <span className="col-owner">{Owner}</span>
            <span className="col-date">{Date}</span>
            <span className="col-size">{Size}</span>
            <button className="list-action"><span className="material-symbols-rounded">more_vert</span></button>
        </div>
    )
}

export default FileBar;