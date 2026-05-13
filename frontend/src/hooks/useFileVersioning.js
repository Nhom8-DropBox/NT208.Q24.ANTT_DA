export const useFileVersioning = () => {
	const handleVersioning = (fileId, fileName) => {
		const safeName = encodeURIComponent(fileName);

		const url = `/versions?fileID=${fileId}&fileName=${safeName}`;

		window.open(url, '_blank', 'noopener, noreferrer');
	}
	return {
		handleVersioning
	};
}