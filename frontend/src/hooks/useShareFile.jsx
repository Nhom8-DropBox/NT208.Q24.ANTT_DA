
export const useShareFile = () => {
	const handleShare = (fileId, fileName) => {

		const safeFileName = encodeURIComponent(fileName);

		const url = `/share?fileId=${fileId}&${fileName}`;

		window.open(url, '_blank', 'noopener, noreferrer');
	};

	return {
		handleShare
	};
};