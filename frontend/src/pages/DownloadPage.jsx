import "../styles/DownloadPage.css"
function DownloadPage({fileData}){
	return(
		<div className="DownloadContainer">
			 <div class="logo-container">

				<img src="assets/nova_logo.png" class="brand-logo"/>
				<div class="brand-text">Sakura Cloud</div>
			</div>

			<div class="share-card">
				<span class="material-symbols-rounded file-icon">description</span>
				<div class="file-name">{fileData.name}</div>
				<div class="file-size">{fileData.size}</div>

				<button class="btn-download-big">
					<span class="material-symbols-rounded">download</span> Download
				</button>
			</div>
		</div>
	)
}