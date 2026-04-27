import '../styles/button.css';
function iconBtn({icon, title, onClick}) {

    return(
        <button className="icon-btn" title={title} onClick={onClick}>
            <span className="material-symbols-rounded">{icon}</span>
        </button>
    )
}
export default iconBtn;