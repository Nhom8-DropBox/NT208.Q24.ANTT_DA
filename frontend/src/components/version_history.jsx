import VersionHolder from "./version_holder"
import "../styles/VersionBoard.css"
import { useSearchParams } from "react-router-dom" // hook lấy thành phần trên url
import { useDownloadFile } from "../hooks/useDownloadFile";
import { useRestoreFile } from "../hooks/useRestoreFile";
import { fetchWithAuth } from "../utils/api";
import { useState, useEffect } from "react";

export default function VersionHistory() {

	const [SearchParams] = useSearchParams();

	const fileID = SearchParams.get('fileID');
	const fileName = SearchParams.get('fileName');

	const [versions, setVersions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const { handleVersionDownloadUrl } = useDownloadFile();
	const { handleRestore } = useRestoreFile(() => setRefreshTrigger(prev => prev + 1));

	useEffect(() => {
		if (!fileID)
			return;

		const getVersions = async () => {
			setIsLoading(true); // 

			try {
				const respone = await fetchWithAuth(`/files/${fileID}/versions`);

				if (respone && respone.ok) {
					const data = await respone.json();
					setVersions(data.versions);
				}
			}
			catch (err) {
				console.error("Lỗi khi lấy dữ liệu: ", err);
			}
			finally {
				setIsLoading(false);
			}
		};
		getVersions();
	}, [fileID, refreshTrigger]);

	// chuẩn hoá time
	const formatDate = (dateString) => {
		const d = new Date(dateString);
		return d.toLocaleDateString('vi-VN') + ' - ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
	};

	return (
		<div className="VersionContainer">
			<div className="modal-back">
				<div className="modal-content">

					<div className="file-info-side">
						<span className="material-symbols-rounded file-icon-large">description</span>
						<div className="file-name"> {fileName || 'TopSecret.txt'}</div>
					</div>

					<div className="timeline-side">
						<h2 className="modal-title">Cỗ Máy Thời Gian</h2>

						<div className="timeline">
							{isLoading ? (
								<p style={{ textAlign: "center", marginTop: "20px" }}>Đang tải...</p>
							) : versions.length === 0 ? (
								<p style={{ textAlign: "center", marginTop: "20px" }}>Không có dữ liệu.</p>
							) : (
								// Render vòng lặp truyền đúng 2 props VerNo và VerCreate
								versions.map((ver) => (
									<VersionHolder
										key={ver.id}
										// Nếu là isCurrent -> (Current), ngược lại nếu là isOriginal -> (Origin), còn lại -> Rỗng
										VerNo={`V${ver.versionNo} ${ver.isCurrent ? '(Current)' : (ver.isOriginal ? '(Origin)' : '')}`}
										VerCreate={formatDate(ver.createdAt)}
										onDownload={() => handleVersionDownloadUrl(fileID, ver.versionNo, fileName)}
										onRestore={() => handleRestore(fileID, ver.versionNo)}
									/>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)


}