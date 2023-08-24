import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import './AudioPlay.css';
// import { startTranscription } from "./Transcription";
// import { startRecording, stopRecording } from "./Recorder"; // Update the path if needed

var a;

const AudioPlay = () => {
  const [buttonName, setButtonName] = useState("Play");
  const [audio, setAudio] = useState();
  const [file, setFile] = useState();
  const [enhancedBackgroundRemoval, setEnhancedBackgroundRemoval] = useState();
  const [backgroundRemoval, setBackgroundRemoval] = useState(false); // Track background removal state
  const [isProcessing, setIsProcessing] = useState(false); // Track whether processing is ongoing

  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder
  } = useAudioRecorder();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: true
    });

    if (a) {
      a.pause();
      a = null;
      setButtonName("Play");
    }

    if (audio) {
      a = new Audio(audio);
      console.log(a);
      a.onended = () => {
        setButtonName("Play");
      };
    }

    if (!recordingBlob) return;
  }, [audio, enhancedBackgroundRemoval, recordingBlob]);

  const endRecord = async () => {
    const url = URL.createObjectURL(recordingBlob);
    console.log(url);
    const audioFile = new File([recordingBlob], "file.wav", { type: "audio/wav" })
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await axios.post(
      "http://localhost:8000/process",
      formData,
      {
        responseType: "blob"
      }
    );

    const result = new Audio(url)
    result.play();
  }

  const processBackgroundRemoval = async () => {
    if (!backgroundRemoval || isProcessing) return; // Only process if background removal is enabled and not already processing

    setIsProcessing(true); // Set processing flag to prevent further clicks on the slider

    const formData = new FormData();
    console.log(file);
    formData.append("file", file, "noisy.wav");

    try {
      const response = await axios.post(
        "http://localhost:8000/process",
        formData,
        {
          responseType: "blob"
        }
      );

      const wav = new Blob([response.data], { type: 'audio/wav' })
      const url = window.URL.createObjectURL(wav)
      const result = new Audio(url)
      setEnhancedBackgroundRemoval(result);
      result.play();
    } catch (error) {
      console.error("Error processing background removal:", error);
    } finally {
      setIsProcessing(false); // Reset processing flag after processing is complete
    }
  }

  const handleClick = () => {
    if (audio && buttonName === "Play") {
      a.play();
      setButtonName("Pause");
    } else if (audio && buttonName === "Pause") {
      a.pause();
      setButtonName("Play");
    }
  };

  const playEnhanced = () => {
    enhancedBackgroundRemoval.play();
  };

  const exportAudio = () => {
    if (enhancedBackgroundRemoval) {
      const blob = new Blob([enhancedBackgroundRemoval.src], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'enhanced_audio.wav';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const addFile = (e) => {
    if (e.target.files[0]) {
      console.log(e.target.files[0]);
      setFile(e.target.files[0]);
      console.log(typeof (e.target.files[0]));
      setAudio(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadFile = async () => {
    const formData = new FormData();
    console.log(file);
    formData.append("file", file, "noisy.wav");
    console.log("uploading");
    const uploadResponse = await axios.post(
        "https://api-sl2ugsqq7a-uc.a.run.app/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
                "boundary": `${formData._boundary}`,
            }
        }
    )
    console.log(uploadResponse);
    return uploadResponse;
    }

  return (
    <div>
      <div className="toggle-switch-container">
        <div className="toggle-switch">
          <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
          <label className="toggle-label">Destuttering</label>
        </div>
        <div className="toggle-switch">
          <label className="switch">
            <input
              type="checkbox"
              onChange={() => {
                if (!isProcessing) { // Allow toggling only if not processing
                  setBackgroundRemoval(!backgroundRemoval);
                  processBackgroundRemoval();
                }
              }}
            />
            <span className={`slider ${isProcessing ? 'processing' : ''}`}></span>
          </label>
          <label className="toggle-label">Background Noise Removal</label>
        </div>
        <div className="toggle-switch">
          <label className="switch">
            {/* <input type="checkbox" onChange={() => startTranscription(setTranscription)} /> */}
            <span className="slider"></span>
          </label>
          <label className="toggle-label">Transcription</label>
        </div>
      </div>
      <div className="record-container">
        <input id="fileInput" type="file" onChange={addFile} style={{ display: "none" }} />
        <div className="record-button">
          <div className="record-button-inner">Record</div>
        </div>
        <div className="upload-button" onClick={() => document.getElementById("fileInput").click()}>Select File</div>
        <br></br>
        <div className="upload-button" onClick={uploadFile}>Click to Upload</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <button onClick={handleClick} disabled={!audio || file === null}>
          {buttonName}
        </button>
      </div>
      {enhancedBackgroundRemoval != null && (
        <div>
          <button onClick={playEnhanced}>Play Enhanced Audio</button>
          <button onClick={exportAudio}>Export Enhanced Audio</button>
        </div>
      )}
    </div>
  );
};

export default AudioPlay;