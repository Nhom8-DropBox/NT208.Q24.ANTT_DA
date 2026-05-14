// Logic xử lý upload file từ lúc bấm Button New bên sidebar tới gởi tín hiệu tới backend và các componenet khác
// import vào dashboard để có thể truyền vào cả sidebar và maincontent - sidebar là nơi kích hoạt isUploading, maincontent dựa vao đó mà hiện thị ô uploadfile và hiển thị các file đã upload 
import { useRef, useState, useEffect } from 'react'
import axios from 'axios';
import { fetchWithAuth } from '../utils/api';

export const useFileUpload = (onUploadSuccess) => {
    const fileInputRef = useRef(null);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const abortControllers = useRef({});

    // Cảnh báo khi người dùng nhấn F5 hoặc tắt tab lúc đang tải lên
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            const hasUploadingFiles = uploadingFiles.some(f => f.status === 'uploading');
            if (hasUploadingFiles) {
                e.preventDefault();
                e.returnValue = ''; // Bắt buộc phải có dòng này để trình duyệt hiện popup cảnh báo
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [uploadingFiles]);

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
            id: `${file.name}-${file.size}-${file.lastModified}`,
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
        const localFileId = fileObj.id; // ID cục bộ dùng để cập nhật state
        const controller = new AbortController();
        abortControllers.current[localFileId] = controller;


        try {
            // Khởi tạo session hoặc Resume bằng fetchWithAuth
            // gửi dữ liệu lên server trước tiên để xác định versioning hay tạo mới
            const RespondFileID = await fetchWithAuth("/files/resolve", {
                method: "POST",
                body: JSON.stringify({
                    filename: file.name,
                    mimeType: file.type,
                })
            });

            const { fileId: serverFileId, name, mimeType = [] } = await RespondFileID.json(); // fileId từ server

            //
            const Respond = await fetchWithAuth("/files/upload/init", {
                method: "POST",
                body: JSON.stringify({
                    filename: file.name,
                    mimeType: file.type,
                    sizeBytes: file.size,
                    fileId: serverFileId // nếu server trả về null -> file tạo mới, nếu trả về số -> version
                })
            });
            const { sessionId, chunkSize, totalParts, uploadedParts = [] } = await Respond.json();
            //

            // Tính toán progress ban đầu dựa vào những phần đã upload (nếu có resume)
            let completedPartsCount = uploadedParts.length;
            const initialProgress = totalParts > 0 ? Math.round((completedPartsCount / totalParts) * 100) : 0;
            setUploadingFiles(prev => prev.map(f =>
                f.id === localFileId ? { ...f, progress: initialProgress } : f
            ));

            // Loop upload từng part
            for (let i = 0; i < totalParts; i++) {
                const partNumber = i + 1; // Vì S3 yêu cầu partNumber bắt đầu từ 1

                // If RESUME: Bỏ qua part đã được upload
                if (uploadedParts.includes(partNumber)) {
                    continue;
                }

                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);

                // API getUploadPartUrl
                const urlRes = await fetchWithAuth("/files/upload/part-url", {
                    method: "POST",
                    body: JSON.stringify({
                        sessionId: sessionId,
                        partNumber: partNumber
                    })
                });

                const { uploadUrl } = await urlRes.json();

                // Upload thẳng lên S3/ MinIO (Dùng onUploadProgress của axios)
                const s3Res = await axios.put(uploadUrl, chunk, {
                    headers: { "Content-Type": file.type || "application/octet-stream" },
                    signal: controller.signal,
                    onUploadProgress: (e) => {
                        const chunkProgress = (e.loaded / e.total) * (100 / totalParts);
                        const currentTotal = Math.round((completedPartsCount * (100 / totalParts)) + chunkProgress);

                        setUploadingFiles(prev => prev.map(f =>
                            f.id === localFileId ? { ...f, progress: Math.min(currentTotal, 100) } : f
                        ));
                    }
                });

                let etag = s3Res.headers.etag || s3Res.headers.Etag;
                if (etag) etag = etag.replace(/"/g, '');

                // Xác nhận upload part lên backend
                await fetchWithAuth("/files/upload/part-complete", {
                    method: "POST",
                    body: JSON.stringify({
                        sessionId: sessionId,
                        partNumber: partNumber,
                        etag: etag,
                        sizeBytes: chunk.size
                    })
                });

                // Tăng biến đếm part sau khi xác nhận thành công
                completedPartsCount++;
            }

            // Gộp file
            await fetchWithAuth("/files/upload/complete", {
                method: "POST",
                body: JSON.stringify({
                    sessionId: sessionId,
                })
            });

            setUploadingFiles(prev => prev.map(f =>
                f.id === localFileId ? { ...f, status: 'success', progress: 100 } : f
            ));

            // Kích hoạt callback nếu có để refresh danh sách file ngoài UI
            if (onUploadSuccess) {
                onUploadSuccess();
            }

        } catch (error) {
            if (axios.isCancel(error) || error.name === 'AbortError') {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === localFileId ? { ...f, status: 'stopped' } : f
                ));
            } else {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === localFileId ? { ...f, status: 'error' } : f
                ));
            }
            console.error(` Lỗi upload file ${file.name}:`, error.response?.data || error.message);
        } finally {
            delete abortControllers.current[localFileId];
        }
    };

    const cancelUpload = (fileId) => {
        if (abortControllers.current[fileId]) {
            abortControllers.current[fileId].abort();
            delete abortControllers.current[fileId];
        }
    };

    const resumeUpload = (fileObj) => {
        setUploadingFiles(prev => prev.map(f =>
            f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ));
        uploadSingleFileInChunks(fileObj);
    };

    const removeUpload = (fileId) => {
        cancelUpload(fileId);
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const onClose = () => {
        setIsUploading(false);
    }
    return {
        fileInputRef,
        uploadingFiles,
        isUploading,
        handleTrigger,
        handleFileChange,
        cancelUpload,
        resumeUpload,
        removeUpload,
        onClose
    };
};