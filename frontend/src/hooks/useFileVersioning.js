export const useFileVersioning = () => {
	const handleVersioning = (fileId, fileName) => {
		const safeName = encodeURIComponent(fileName);

<<<<<<< HEAD
		const url = `/verson?fileId=${fileId}`;
=======
		const url = `/versions?fileID=${fileId}&fileName=${safeName}`;
>>>>>>> 0f2f3125434ec0837609403e5147730d9a8e9918

		window.open(url, '_blank', 'noopener, noreferrer');
	}
	return {
		handleVersioning
	};
}