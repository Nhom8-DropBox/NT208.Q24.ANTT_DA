import {useRef, useState} from 'react'

export const useFileUpload = () => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleTrigger = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            console.log("Đã chọn file:", file.name);
        }
    };

    const simulateUpload = () => {
        setIsUploading(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    return{
        fileInputRef,
        selectedFile,
        isUploading,
        progress,
        handleTrigger,
        handleFileChange
    };
};