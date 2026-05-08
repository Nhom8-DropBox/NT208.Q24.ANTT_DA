import { useSearchParams } from "react-router-dom"
import { useFileUpload } from "../hooks/useFileUpload";
import "../styles/sharedBoard.css"
export default function ShareBoard() {
	const [searchParams] = useSearchParams();

	const fileId = searchParams.get('fileId');
	const fileName = searchParams.get('fileName');
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
						<select id="role">
							<option value="view">View Only</option>
							<option value="edit">Edit</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="expiry">Thời hạn (Expiry)</label>
						<select id="expiry">
							<option value="1h">1 Giờ</option>
							<option value="1d">1 Ngày</option>
							<option value="7d">7 Ngày</option>
							<option value="never">Vĩnh viễn</option>
						</select>
					</div>

					<button className="btn-create">
						<span className="material-symbols-rounded">link</span> Tạo Link Chia Sẻ cho {fileName || 'file'}
					</button>


					<div className="result-area">
						<input type="text" className="link-input" value={`http://localhost:3000/share/${fileId || 'example'}`} readOnly />
						<button className="btn-copy">
							<span className="material-symbols-rounded" style={{ fontSize: '18px' }}>content_copy</span> Copy
						</button>
					</div>

				</div>
			</div>
		</div>
	)
}