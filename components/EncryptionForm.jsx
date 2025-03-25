import React, { useState, useRef } from "react";
import axios from "axios";
import "./EncryptionForm.css";

const EncryptionForm = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("encrypt");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "" });
    const fileInputRef = useRef(null);

    const showToast = (message, type = "error") => {
        setToast({ message, type });
        setTimeout(() => {
            setToast({ message: "", type: "" });
        }, 3000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!file) {
            showToast("Please select a file.");
            setIsLoading(false);
            return;
        }

        if (!password) {
            showToast("Please enter a password.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("password", password);

        const endpoint = mode === "encrypt" ? "/encrypt" : "/decrypt";

        try {
            const response = await axios.post(`https://576a-2401-4900-503a-f422-1585-aab-21d2-3649.ngrok-free.app${endpoint}`, formData, {
                responseType: "blob",
            });

            // Trigger file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                file.name + (mode === "encrypt" ? ".enc" : ".dec")
            );
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast(`File successfully ${mode}ed!`, "success");
        } catch (error) {
            console.error("Error:", error);
            showToast("Incorrect password or processing error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === "encrypt" ? "decrypt" : "encrypt");
        setFile(null);
        setPassword("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="encryption-container">
            <div className="grid-background"></div>
            <div className="encryption-wrapper">
                <div className="terminal-header">
                    <div className="terminal-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <h1>{mode === "encrypt" ? "FILE ENCRYPTION" : "FILE DECRYPTION"}</h1>
                </div>
                <form onSubmit={handleSubmit} className="encryption-form">
                    <div className="form-group file-input-group">
                        <label className="file-input-label">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                className="file-input"
                            />
                            <span className="file-input-text">
                                {file ? file.name : "SELECT FILE"}
                            </span>
                            <span className="file-input-icon">📁</span>
                        </label>
                    </div>
                    <div className="form-group password-input-group">
                        <input
                            type="password"
                            placeholder="ENTER PASSWORD"
                            value={password}
                            onChange={handlePasswordChange}
                            className="password-input"
                        />
                    </div>
                    <div className="button-group">
                        <button 
                            type="submit" 
                            className="action-button primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "PROCESSING..." : (mode === "encrypt" ? "ENCRYPT FILE" : "DECRYPT FILE")}
                        </button>
                        <button 
                            type="button" 
                            className="action-button secondary"
                            onClick={toggleMode}
                        >
                            SWITCH TO {mode === "encrypt" ? "DECRYPT" : "ENCRYPT"}
                        </button>
                    </div>
                </form>
            </div>
            {toast.message && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default EncryptionForm;