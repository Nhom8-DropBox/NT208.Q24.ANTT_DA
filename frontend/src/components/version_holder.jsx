function VersionHolder({VerNum, VerDate}){
	return(
		<div className="timeline-item">
			<div className="timeline-dot" style="background: var(--bg-surface);"></div>
			<div className="version-header">
				<div className="version-tag">{VerNum}</div>
				<div className="version-date">{VerDate}</div>
			</div>
			<div className="version-actions">
				<button className="btn">
					<span className="material-symbols-rounded" style="font-size: 18px;">download</span> Tải về
				</button>
				<button className="btn btn-restore" onclick={`confirm('Bạn có chắc muốn lấy bản ${VerNum} đè lên bản V3 hiện tại không?')`}>
					<span className="material-symbols-rounded" style="font-size: 18px;">history</span> Khôi phục
				</button>
			</div>
		</div>
	)
}

export default VersionHolder;