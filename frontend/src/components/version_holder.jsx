<<<<<<< HEAD
function VersionHolder({ Verson_no, VerDate }) {
	
	return (
		<div className="timeline-item">
			<div className="timeline-dot" style="background: var(--bg-surface);"></div>
			<div className="version-header">
				<div className="version-tag">{Verson_no}</div>
				<div className="version-date">{VerDate}</div>
			</div>
			<div className="version-actions">
				<button className="btn">
					<span className="material-symbols-rounded" style="font-size: 18px;">download</span> Tải về
				</button>
				<button className="btn btn-restore" onclick={`confirm('Bạn có chắc muốn lấy bản ${Verson_no} đè lên bản V3 hiện tại không?')`}>
					<span className="material-symbols-rounded" style="font-size: 18px;">history</span> Khôi phục
				</button>
			</div>
		</div>
	)
=======
function VersionHolder({ VerNo, VerCreate }) {
    return (
        <div className="timeline-item">
            <div className="timeline-dot" style={{ background: "var(--bg-surface)" }}></div>
            <div className="version-header">
                <div className="version-tag">{VerNo}</div>
                <div className="version-date">{VerCreate}</div>
            </div>
            <div className="version-actions">
                <button className="btn">
                    <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>download</span> Tải về
                </button>
                <button 
                    className="btn btn-restore" 
                    onClick={() => window.confirm(`Bạn có chắc muốn lấy bản ${VerNo} đè lên bản hiện tại không?`)}
                >
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'red' }}>history</span> Khôi phục
                </button>
            </div>
        </div>
    )
>>>>>>> 0f2f3125434ec0837609403e5147730d9a8e9918
}

export default VersionHolder;