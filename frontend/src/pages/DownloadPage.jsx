import "../styles/DownloadPage.css"
import { useSearchParams } from "react-router-dom"
import { useDownloadFile } from "../hooks/useDownloadFile";
import logo from "../assets/nova_logo.png"

export default function DownloadPage() {
	const [searchParams] = useSearchParams();

	const fileId = searchParams.get('fileId');
	const fileName = searchParams.get('fileName');
	const { handlePresignedDownloadUrl } = useDownloadFile();
	return (
		<div className="DownloadContainer">
			<div className="logo-container">

				<img src={logo} className="brand-logo" />
				<div className="brand-text">Sakura Cloud</div>
			</div>

			<div className="share-card">
				<span className="material-symbols-rounded file-icon">description</span>
				<div className="file-name">{fileName || 'Unknown File'}</div>
				<div className="file-size">ID: {fileId}</div>

				<button className="btn-download-big" onClick={() => {
					handlePresignedDownloadUrl(fileId, fileName);
				}}>
					<span className="material-symbols-rounded">download</span> Download
				</button>
			</div>
		</div>
	)
}
