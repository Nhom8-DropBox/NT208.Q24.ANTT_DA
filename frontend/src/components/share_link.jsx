import { useState } from "react";
import { useSearchParams } from "react-router-dom"
import { fetchWithAuth } from "../utils/api";
import "../styles/sharedBoard.css"
import { useShareFile } from "../hooks/useShareFile";

export default function ShareBoard() {
	const [searchParams] = useSearchParams();
	const [refreshTrigger, setRefreshTrigger] = useState();
	const fileId = searchParams.get('fileId');
	const fileName = searchParams.get('fileName');
	const { role, setRole, expiry, setExpiry, resultUrl, setResultUrl, isLoading, setIsLoading, handleCopy, handleCreateShareLink, handleGetShareLinks } = useShareFile();

	// const [role, setRole] = useState("view");
	// const [expiry, setExpiry] = useState("1h");
	// const [resultUrl, setResultUrl] = useState("");
	// const [isLoading, setIsLoading] = useState(false);

	const onClose = () => {
		window.close();
	}

	return (
		<div className="SharedContainer">
			<div className="modal-back">
				<div className="modal-content">
					<button className="close-btn" onClick={onClose}>
						<span className="material-symbols-rounded">close</span>
					</button>

					<h2 className="modal-title">
						<span className="material-symbols-rounded">share</span> Trạm liên kết
					</h2>

					<div className="form-group">
						<label htmlFor="role">Quyền truy cập (Role)</label>
						<select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
							<option value="view">View Only</option>
							<option value="edit">Edit</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="expiry">Thời hạn (Expiry)</label>
						<select id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
							<option value="1h">1 Giờ</option>
							<option value="1d">1 Ngày</option>
							<option value="7d">7 Ngày</option>
							<option value="never">Vĩnh viễn</option>
						</select>
					</div>

					<button className="btn-create" onClick={() => handleCreateShareLink(fileId)} disabled={isLoading}>
						<span className="material-symbols-rounded">link</span>
						<span className="link-name">{isLoading ? "Đang tạo..." : `Tạo Link Chia Sẻ cho ${fileName || 'file'}`} </span>
					</button>

					<div className="result-area">
						<input
							type="text"
							className="link-input"
							value={resultUrl || 'Your Link Here...!'} // Cần link download từ minIO
							readOnly
						/>
						<button className="btn-copy" onClick={handleCopy} disabled={!resultUrl}>
							<span className="material-symbols-rounded" style={{ fontSize: '18px' }}>content_copy</span> Copy
						</button>
					</div>

				</div>
			</div>
		</div>
	)
}