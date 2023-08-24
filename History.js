import React, { useState } from 'react';
import './History.css';

const HistoryTab = () => {
  const [folders, setFolders] = useState([
    { id: 1, name: 'Folder 1' },
    { id: 2, name: 'Folder 2' },
  ]);

  const [files, setFiles] = useState([
    { id: 1, folderId: 1, name: 'File 1.wav' },
    { id: 2, folderId: 2, name: 'File 2.wav' },
  ]);

  const [selectedFolders, setSelectedFolders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedItemsForExport, setSelectedItemsForExport] = useState([]);

  const handleRenameFolder = (id, newName) => {
    setFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === id ? { ...folder, name: newName } : folder
      )
    );
  };

  const handleRenameFile = (id, newName) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, name: newName } : file
      )
    );
  };

  const handleFileUpload = (event) => {
    const uploadedFileName = event.target.files[0].name;
    const newFile = { id: files.length + 1, folderId: 1, name: uploadedFileName };
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  const handleCreateFolder = () => {
    const newFolderName = prompt('Enter the new folder name:');
    if (newFolderName) {
      const newFolder = { id: folders.length + 1, name: newFolderName };
      setFolders((prevFolders) => [...prevFolders, newFolder]);
    }
  };

  const handleDelete = () => {
    // Check if any folders or files are selected
    if (selectedFolders.length === 0 && selectedFiles.length === 0) {
      alert('No items selected for deletion.');
      return;
    }

    // Create a list of items to delete
    const itemsToDelete = [
      ...selectedFolders.map((folderId) => {
        const folder = folders.find((folder) => folder.id === folderId);
        return folder ? `Folder: ${folder.name}` : null;
      }),
      ...selectedFiles.map((fileId) => {
        const file = files.find((file) => file.id === fileId);
        return file ? `File: ${file.name}` : null;
      }),
    ];

    // Show a confirmation prompt
    const confirmationMessage = `Are you sure you want to delete the following items?\n\n${itemsToDelete.join('\n')}`;
    if (window.confirm(confirmationMessage)) {
      // Remove selected folders and files from the state
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => !selectedFolders.includes(folder.id))
      );
      setFiles((prevFiles) =>
        prevFiles.filter((file) => !selectedFiles.includes(file.id))
      );

      // Clear selection
      setSelectedFolders([]);
      setSelectedFiles([]);
      setSelectedItemsForExport([]); // Reset selected items for export
    }
  };

  const handleSelectFolder = (id) => {
    if (selectedFolders.includes(id)) {
      setSelectedFolders(selectedFolders.filter((folderId) => folderId !== id));
      setSelectedItemsForExport(selectedItemsForExport.filter((itemId) => itemId !== id));
    } else {
      setSelectedFolders([...selectedFolders, id]);
      setSelectedItemsForExport([...selectedItemsForExport, id]);
    }
  };

  const handleSelectFile = (id) => {
    if (selectedFiles.includes(id)) {
      setSelectedFiles(selectedFiles.filter((fileId) => fileId !== id));
      setSelectedItemsForExport(selectedItemsForExport.filter((itemId) => itemId !== id));
    } else {
      setSelectedFiles([...selectedFiles, id]);
      setSelectedItemsForExport([...selectedItemsForExport, id]);
    }
  };

  const handleExport = () => {
    if (selectedItemsForExport.length === 0) {
      alert('No items selected for export.');
      return;
    }

    const itemsToExport = selectedItemsForExport.map((itemId) => {
      const folder = folders.find((f) => f.id === itemId);
      const file = files.find((f) => f.id === itemId);
      return folder ? `Folder: ${folder.name}` : file ? `File: ${file.name}` : null;
    });

    alert(`Exporting the following items:\n\n${itemsToExport.join('\n')}`);
  };

  return (
    <div className="history-tab">
      <div className="file-list">
        <h2>Files</h2>
        <ul className="file-list-items">
          {files.map((file) => (
            <li key={file.id}>
              <div
                className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
                onClick={() => handleSelectFile(file.id)}
              >
                <div className="file-name">{file.name}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="folder-list">
        <h2>Folders</h2>
        <div className="action-bar">
          <button className="action-button" onClick={handleCreateFolder}>Create</button>
          <button className="action-button" onClick={handleDelete}>Delete</button>
          <button className="action-button" onClick={handleExport}>Export</button>
        </div>
        <ul className="folder-list-items large-icons">
          {folders.map((folder) => (
            <li key={folder.id}>
              <div
                className={`folder-item ${selectedFolders.includes(folder.id) ? 'selected' : ''}`}
                onClick={() => handleSelectFolder(folder.id)}
              >
                <div className="folder-icon">&#128194;</div>
                <div className="folder-name">{folder.name}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="upload-button">
        <label className="upload-label">
          <input type="file" className="upload-input" onChange={handleFileUpload} />
          Upload File
        </label>
      </div>
    </div>
  );
};

export default HistoryTab;
