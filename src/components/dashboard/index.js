import React, { useRef, useState } from "react"
import { audioUploader } from "../../hooks/upload"

export default function DashBoard() {
    const [selectedFile, setSelectedFile] = useState(null);
    const { uploading, progress, uploadFile } = audioUploader();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleUpload = () => {
        if(selectedFile) {
            uploadFile(selectedFile);
            setSelectedFile(null);
        }
    };

    return (
        <div>
          <h1>DashBoard Page</h1>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={uploading || !selectedFile}>
            {uploading ? "Uploading..." : "Upload File"}
          </button>
          {uploading && (
            <div>
              <p>Progress: {progress}%</p>
            </div>
          )}
        </div>
    );
}