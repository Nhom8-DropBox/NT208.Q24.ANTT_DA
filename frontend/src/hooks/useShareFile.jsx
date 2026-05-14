import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "../utils/api";

export const useShareFile = () => {
	const [role, setRole] = useState("view");
	const [expiry, setExpiry] = useState("1h");
	const [resultUrl, setResultUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [links, setLinks] = useState([]);

	const loadLinks = useCallback(async () => {
		try {
			const response = await fetchWithAuth("/share-links/links");
			if (response.ok) {
				const data = await response.json();
				setLinks(data.links || data);
			}
		} catch (err) {
			console.error("Lỗi fetch links:", err);
		}
	}, []);

	useEffect(() => {
		const handleStoragechange = (e) => {
			if (e.key === 'share-link-created') {
				loadLinks();
			}
		}
		window.addEventListener('storage', handleStoragechange);
		loadLinks();

		return () => window.removeEventListener('storage', handleStoragechange);
	}, [loadLinks])

	const handleShare = (fileId, fileName) => {

		const safeFileName = encodeURIComponent(fileName);

		const url = `/share?fileId=${fileId}&fileName=${safeFileName}`;

		window.open(url, '_blank', 'noopener, noreferrer');
	};

	const handleCreateShareLink = async (fileId) => {
		if (!fileId) {
			alert("Không tìm thấy fileId!");
			return;
		}

		setIsLoading(true);
		try {
			let expires_at = null;
			if (expiry !== "never") {
				const date = new Date();
				if (expiry === "1h") date.setHours(date.getHours() + 1);
				if (expiry === "1d") date.setDate(date.getDate() + 1);
				if (expiry === "7d") date.setDate(date.getDate() + 7);
				expires_at = date.toISOString();
			}

			const response = await fetchWithAuth("/share-links", {
				method: "POST",
				body: JSON.stringify({
					fileId: parseInt(fileId),
					permission: role,
					expires_at
				})
			});

			const data = await response.json();
			if (data && data.url) {
				setResultUrl(data.url);
				localStorage.setItem('share-link-created', Date.now().toString());
			} else {
				alert("Không thể tạo link chia sẻ: " + (data.message || "Lỗi không xác định"));
			}
		} catch (error) {
			console.error("Lỗi khi tạo share link:", error);
			alert(error.message || "Lỗi khi tạo share link");
		} finally {
			setIsLoading(false);
		}
	}

	const handleCopy = () => {
		if (resultUrl) {
			navigator.clipboard.writeText(resultUrl).then(() => {
				alert("Đã copy link!");
			});
		}
	}


	return {
		handleShare,
		handleCreateShareLink,
		links,
		handleCopy,
		role,
		setRole,
		expiry,
		setExpiry,
		isLoading,
		resultUrl
	};
};