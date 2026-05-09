import { fetchWithAuth } from "../utils/api";
import { useState } from "react";

export const useFileShare = () => {

	const handleShare = async (fileId) => {
		try {
			const response = await fetchWithAuth(`/api/files/${fileId}`);
			
			if(response.ok){
				const fileData = response.json();
			}

		}
	}
}