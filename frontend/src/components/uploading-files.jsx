function UploadFiles({fileName, progress, status, onCancel }) {
  return (
    <div className="FileManager">
      <div className="file-info">
        <span className="material-symbols-rounded file-icon">folder_zip</span>
        <div className="file-name">{fileName}</div>
      </div>
      <div className="download-control">
        <div className="circle-progress-bar" style={{ '--p': `${progress}%` }}>
          <div className="inner-circle"></div>
        </div>
      {status == 'uploading' && (
		   <button className="cancel-btn" onClick={onCancel}>
          		<span className="material-symbols-rounded">close</span>
           </button>
		   )}
		   {status == 'success' && (
			<span className="material-symbols-rounded" style={{color: 'green', fontSize: '18px'}}>done</span>
		   )}
      </div>
    </div>
  );
}

export default UploadFiles;