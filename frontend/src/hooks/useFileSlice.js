import { useState, useRef } from "react";
import axios from 'axios';

export const useFileSlice = () => {

	const [FileStates, setFileStates] = useState({});
	const abortControllers = useRef({});

	const handleUpload = async (file) => {
		const CHUNK_SIZE = 5*1024*1024; //5MB
		const total_chunks = Math.ceil(file.size / CHUNK_SIZE);
		const fileId = `${file.name}-${file.size}-${Date.now()}`;

		const controller = new AbortController();
		abortControllers.current[fileId] = controller;

		setFileStates(prev => ({ ...prev, [fileId]: { progress: 0, status: 'uploading' } }));
		try {
			for(let i = 0; i < total_chunks; i++){
				const start = i * CHUNK_SIZE;
				const end = Math.min(start + CHUNK_SIZE, file.size);
				const chunk = file.slice(start, end);
				
				const formData = new FormData();
				formData.append("chunk", chunk);
				formData.append("index", i);
				formData.append("fileId", fileId);

				await axios.post("api/upload-chunk", formData, {
					signal: controller.signal,
					onUploadProgress: (e) => {
						const chunkProgress = (e.loaded / e.total) * (100/total_chunks);
						const currentTotal = Math.round((i * (100/ total_chunks)) + chunkProgress);
						
						setFileStates(prev => ({
							...prev,
							[fileId]: {...prev[fileId], progress: currentTotal}
						}));
					}
				});
			}
			await axios.post("/api/merge", {fileId, fileName: file.name});
			setFileStates(prev => ({ ...prev, [fileId]: { progress: 100, status: 'complete'}}));

		}
		catch(error){
			if(axios.isCancel(error)){
				setFileStates(prev => ({...prev, [fileId]: {...prev[fileId], status: 'stopped'}}));
			}
			else{
				setFileStates(prev => ({...prev, [fileId]: {...prev[fileId], status: 'error'}}))
			}
		}
	};

	const stopUpload = (fileId) => {
		if (abortControllers.current[fileId]){
			abortControllers.current[fileId].abort();
			delete abortControllers.current[fileId];
		}
	};

	return {FileStates, handleUpload, stopUpload};
}