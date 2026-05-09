import VersionHolder from "./version_holder"
import { useFileVersoning } from "../hooks/useFileVersioning"
import "../styles/VersionBoard.css"
import { useSearchParams } from "react-router-dom"

export default function VersionHistory()
{

	const {SearchParams} = useSearchParams;

	const fileId = SearchParams.get('fileId');
	const fileName = SearchParams.get('safeName');
	const fileSize = SearchParams.get('fileSize');
	const fileDate = SearchParams.get('safeDate');
	const fileVer = SearchParams.get('fileVer');
	const {handleVersoning} = useFileVersoning();

	const onClose = () => {
		window.close()
	}

	return (
		<div className="VersionContainer">
			<div className="modal-back">
				<div className="modal-content">
					<button className="close-btn">
						<span className="material-symbols-rounded">close</span>
					</button>

					<div className="file-info-side">
						<span className="material-symbols-rounded file-icon-large">description</span>
						<div className="file-name"> {fileName || 'TopSecret.txt'}</div>
						<div className="file-size">{fileSize || '14.2 MB'}</div>
					</div>

					<div className="timeline-side">
						<h2 className="modal-title">Cỗ Máy Thời Gian</h2>
						
						<div className="timeline">

							<div className="timeline-item">
								<div className="timeline-dot"></div>
								<div className="version-header">
									<div className="version-tag">V3 (Current)</div>
									<div className="version-date">02/05/2026 - 15:30</div>
								</div>
								<div className="version-actions">
									<button className="btn">
										<span className="material-symbols-rounded" style="font-size: 18px;">download</span> Tải về
									</button>
								</div>
							</div>

							<VersionHolder VerNum={1} VerDate={'2026'} />

						</div>
					</div>
				</div>
			</div>
		</div>
	)
}