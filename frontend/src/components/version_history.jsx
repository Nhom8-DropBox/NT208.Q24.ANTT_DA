import VersionHolder from "./version_holder"
import "../styles/VersionBoard.css"
import { useSearchParams } from "react-router-dom" // hook lấy thành phần trên url
import { fetchWithAuth } from "../utils/api";
import React, { useState, useEffect } from "react";

export default function VersionHistory()
{

	const [SearchParams] = useSearchParams();

	const fileID = SearchParams.get('fileID');
	const fileName = SearchParams.get('fileName');

	const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


	useEffect(() => 
	{
		if(!fileID)
			return;

		const getVersions = async () =>
		{
			setIsLoading(true); // 

			try 
				{
				const respone = await fetchWithAuth(`/files/${fileID}/versions`);

				if(respone && respone.ok)
				{
					const data = await respone.json();
					setVersions(data.versions);
				}
			}
			catch(err)
			{
				console.error("Lỗi khi lấy dữ liệuL: ", err);
			}
			finally
			{
				setIsLoading(false);
			}
		};
		getVersions();
	}, [fileID]);

// chuẩn hoá time
	const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('vi-VN') + ' - ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

	// func tải về
	const handleDownloadVersion = async (versionNo) => {
		try {
			// Lấy link download từ Backend
			const response = await fetchWithAuth(`/files/${fileID}/versions/${versionNo}/download-url`);
			if (response && response.ok) {
				const data = await response.json();
				if (data.url) {
					window.open(data.url, '_blank');
				} else {
					alert("Không lấy được đường dẫn tải file.");
				}
			}
		} catch (err) {
			console.error("Lỗi tải file:", err);
			alert("Đã xảy ra lỗi khi tải phiên bản này.");
		}
	};

	const handleExecuteRestore = async (versionNo) => {
		try {
			console.log("Khôi phục bản:", versionNo);

			const isConfirmed = window.confirm(`Bạn có chắc muốn lấy bản V${versionNo} đè lên bản hiện tại không?`);
			if (!isConfirmed) return;

			const response = await fetchWithAuth(`/files/${fileID}/versions/${versionNo}/restore`, {
				method: 'POST'
			});

			if (response && response.ok) {
				alert(`Đã khôi phục thành công về bản V${versionNo}`);
				window.location.reload(); 
			}
			else
			{
				const errorData = await response.json();
           		alert("Khôi phục thất bại: " + errorData.message);
			}
		} catch (err) {
			console.error("Lỗi khôi phục:", err);
		}
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
										onDownloadClick={() => handleDownloadVersion(ver.versionNo)}
										onRestoreClick={() => handleRequestRestore(ver.versionNo)} 
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