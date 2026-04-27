import '../styles/button.css';
function NavItem({icon, text, link, active})
{
    return(
        <a href= {`${link}`} className={`nav-item ${active ? 'active' : ''}`}>
            <span className="material-symbols-rounded">{icon}</span>
            <span className="nav-text">{text}</span>
        </a>
    )
}

export default NavItem;