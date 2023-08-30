import React, { useState, useEffect } from 'react';
import './History.css';
import axios from 'axios';
import { useAuth } from '../hooks/auth';
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from 'react-router-dom'
import LoadingPage from '../components/loading/loading';

const HistoryTab = () => {
  const navigate = useNavigate();
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [tempUrls, setTempUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading } = useAuth();
  const [folders, setFolders] = useState([
    { id: 1, name: 'Folder 1' },
    { id: 2, name: 'Folder 2' },
  ]);

  const [files, setFiles] = useState([
    { id: 1, folderId: 1, name: 'File 1.wav', fileUrl: null },
    { id: 2, folderId: 2, name: 'File 2.wav', fileUrl: null },
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

  const handleDelete = async () => {
    // Check if any folders or files are selected
    if (selectedFolders.length === 0 && selectedFiles.length === 0) {
      alert('No items selected for deletion.');
      return;
    }

    // Create a list of items to delete
    const itemsToDelete = [
      ...selectedFolders.map((folderId) => {
        const folder = folders.find((folder) => folder.id === folderId);
        return folder ? `${folder.name}` : null;
      }),
      ...selectedFiles.map((fileId) => {
        const file = files.find((file) => file.id === fileId);
        return file ? `${file.name}` : null;
      }),
    ];

    console.log(itemsToDelete);



    // Show a confirmation prompt
    const confirmationMessage = `Are you sure you want to delete the following items?\n\n${itemsToDelete.join('\n')}`;
    if (window.confirm(confirmationMessage)) {
      for(const item of itemsToDelete) {
        try {
          const unProcesesd = item.replace("_processed", "");
          // Send a DELETE request to your Express server
          await fetch(`https://api-sl2ugsqq7a-uc.a.run.app/deleteFile/${user.uid}/${item}`, {
            method: 'DELETE',
          });

          await fetch(`https://api-sl2ugsqq7a-uc.a.run.app/deleteFile/${user.uid}/${unProcesesd}`, {
            method: 'DELETE',
          });

          const recordingsRef = collection(db, "recordings");
          const q = query(recordingsRef, where("uid", "==", user.uid), where("enhancedFileName", "==", item));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
              console.log(doc.data())
              await deleteDoc(doc.ref);
            })
          }

          // Remove the item from the state
          if (item.type === 'folder') {
            setFolders((prevFolders) =>
              prevFolders.filter((folder) => folder.id !== item.id)
            );
          } else {
            setFiles((prevFiles) =>
              prevFiles.filter((file) => file.id !== item.id)
            );
          }
        } catch (e) {
          console.error(`Error deleting file ${item}`, e);
        }
      }
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

  const handlePlayAudio = (file) => {
    console.log(file)
    if (audioPlaying === file.id) {
      // If the audio is already playing, stop it
      setAudioPlaying(null);
    } else {
      // Otherwise, play the audio
      setAudioPlaying(file.id);
      const audio = new Audio(file.url); // Replace 'url' with the actual audio file URL
      audio.play();
      audio.onended = () => setAudioPlaying(null); // Stop when audio finishes
    }
  };

  console.log(loading);
  useEffect(() => {
    async function fetchTempUrls() {
      try {
        setLoading(true);
        console.log(loading)
        const prefix = 'https://object.cloud.sdsc.edu/v1/AUTH_8492e628f69a472d965fab8d3c621959/myContainer/home/ubuntu/audio_recordings/';
        const processedEnding = "_processed";
        const response = await axios.get(`https://api-sl2ugsqq7a-uc.a.run.app/getFiles/${user.uid}`);
        const filteredUrls = response.data.filter((url) => url.startsWith(prefix) && url.includes(processedEnding));

        const documentIds = {};
        const recordingsRef = collection(db, "recordings");
        const q = query(recordingsRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            console.log(doc.data())
            documentIds[doc.data().enhancedFileName] = doc.id;
          })
        }

        const names = Object.keys(documentIds);
        const fileNameToUrlMap = {};
        console.log(filteredUrls)
        for (const url of filteredUrls) {
          console.log(url);
          const truncated = url.replace(prefix + user.uid + "/", "")
          const fileName = truncated.substring(0, truncated.indexOf("?temp_url"));
          fileNameToUrlMap[fileName] = url;
        }
        console.log(fileNameToUrlMap)
        console.log(names)
        const files = names.map((name) => {
          return {
            id: documentIds[name],
            folderId: null,
            name: name,
            url: fileNameToUrlMap[name]
          }
        });
        setTempUrls(filteredUrls);
        setFiles(files);
        console.log(files);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching temp URLs:', error);
      }
    }

    fetchTempUrls();
    const intervalId = setInterval(fetchTempUrls, 86400000);
    return () => clearInterval(intervalId);
  }, []);
  console.log(loading);

  if (loading) {
    return (
      <div><LoadingPage/></div>
    )
  };
  return (
    <div className="history-tab">
       <div className="back-button">
        <button className="back-button" onClick={() => navigate('../AudioManager')}>
          Back to Home Page
        </button>
      </div>
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
                <button onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(file)
                }}>
                  {audioPlaying === file.id ? 'Stop' : 'Play'}
                </button>
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
