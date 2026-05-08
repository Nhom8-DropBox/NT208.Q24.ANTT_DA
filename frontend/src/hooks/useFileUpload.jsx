import { useRef, useState } from 'react'
import axios from 'axios';

export const useFileUpload = () => {
    const fileInputRef = useRef(null);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const abortControllers = useRef({});

    const handleTrigger = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files); // Chuyển FileList thành Array
        if (files.length === 0) return;

        files.forEach(file => console.log("Đã chọn file:", file.name));

        // Khởi tạo danh sách file đang chờ upload với progress = 0
        const newFiles = files.map(file => ({
            id: `${file.name}-${file.size}-${Date.now()}`,
            name: file.name,
            progress: 0,
            status: 'uploading',
            rawFile: file
        }));

        setUploadingFiles(prev => [...prev, ...newFiles]);
        setIsUploading(true);

        newFiles.forEach(file => uploadSingleFileInChunks(file));

        event.target.value = '';
    };

    const uploadSingleFileInChunks = async (fileObj) => {
        const file = fileObj.rawFile;
        const fileId = fileObj.id;
        const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
        const total_chunks = Math.ceil(file.size / CHUNK_SIZE);

        const controller = new AbortController();
        abortControllers.current[fileId] = controller;

        try {
            for (let i = 0; i < total_chunks; i++) {
                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append("chunk", chunk);
                formData.append("index", i);
                formData.append("fileId", fileId);

                await axios.post("http://localhost:3000/api/upload-chunk", formData, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    },
                    signal: controller.signal,
                    onUploadProgress: (e) => {
                        const chunkProgress = (e.loaded / e.total) * (100 / total_chunks);
                        const currentTotal = Math.round((i * (100 / total_chunks)) + chunkProgress);

                        setUploadingFiles(prev => prev.map(f =>
                            f.id === fileId ? { ...f, progress: currentTotal } : f
                        ));
                    }
                });
            }

            // Gộp file khi xong
            await axios.post("http://localhost:3000/api/merge", { fileId, fileName: file.name }, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });

            setUploadingFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, status: 'success', progress: 100 } : f
            ));

        } catch (error) {
            if (axios.isCancel(error)) {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === fileId ? { ...f, status: 'stopped' } : f
                ));
            } else {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === fileId ? { ...f, status: 'error' } : f
                ));
            }
            console.error(` Lỗi upload file ${file.name}:`, error.response?.data || error.message);
        } finally {
            delete abortControllers.current[fileId];
        }
    };

    const cancelUpload = (fileId) => {
        if (abortControllers.current[fileId]) {
            abortControllers.current[fileId].abort();
            delete abortControllers.current[fileId];
        }
    };

    return {
        fileInputRef,
        uploadingFiles,
        isUploading,
        handleTrigger,
        handleFileChange,
        cancelUpload
    };
};