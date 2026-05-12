export const useFileVersoning = () => {
	const handleVersoning = (fileId, fileName, fileSize, fileVer, fileDate) => {
		const safeName = encodeURIComponent(fileName);

		const url = `/verson?fileId=${fileId}`;

		window.on(url, '_blank', 'noopener, noreferrer');
	}

	return {
		handleVersoning
	};
}