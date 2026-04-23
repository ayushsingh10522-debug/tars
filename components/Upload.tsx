import React, {useCallback, useEffect, useRef, useState} from "react";
import {useOutletContext} from "react-router";
import {PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS} from "../lib/constants";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";

interface uploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: uploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
        };
    }, []);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = useCallback((file: File) => {
        if(!isSignedIn) return;

        setFile(file);
        setProgress(0);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;

            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

            progressIntervalRef.current = setInterval(() => {
                if (!isMountedRef.current) {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return;
                }

                setProgress((prev) => {
                    const next = prev + PROGRESS_INCREMENT;
                    if (next >= 100) {
                        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                        
                        completionTimeoutRef.current = setTimeout(() => {
                            if (isMountedRef.current) {
                                onComplete?.(base64Data);
                            }
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
    }, [isSignedIn, onComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > MAX_FILE_SIZE) {
                setError("File is too large. Maximum size is 50 MB.");
                return;
            }
            if (droppedFile.type.startsWith('image/')) {
                processFile(droppedFile);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (!isSignedIn) return;

        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > MAX_FILE_SIZE) {
                setError("File is too large. Maximum size is 50 MB.");
                return;
            }
            processFile(selectedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpeg,.jpg,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Click to upload or just drag and drop"
                            ): ("Please sign in to upload")}
                        </p>
                        <p className={`help ${error ? 'error' : ''}`}>
                            {error || "Maximum file size is 50 MB"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="Upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Upload;



