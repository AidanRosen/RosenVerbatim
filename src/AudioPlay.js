import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAudioRecorder } from 'react-audio-voice-recorder';
import './AudioPlay.css';
import { startTranscription } from "./Transcription";
import { startRecording, stopRecording } from "./Recorder"; // Update the path if needed
import logo from './a.png'; // Tell webpack this JS file uses this image
import { Link } from "react-router-dom";

import recordimage from './Just-Press-Record-button.png'
import uploadimage from './Upload-button.png'

import ReactTooltip from "react-tooltip";

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

    // -- This causes the permission issue
    // navigator.mediaDevices.getUserMedia({
    //   audio: true
    // });

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
      "http://localhost:3000/process",
      formData,
      {
        responseType: "blob1"
      }
    );

    const result = new Audio(url)
    result.play();
  }


  const processBackgroundRemoval = async (filenames) => {
    alert("BG Removal");
     
     if (!backgroundRemoval || isProcessing) return; // Only process if background removal is enabled and not already processing
 
     setIsProcessing(true); // Set processing flag to prevent further clicks on the slider
   
     //alert("BG Removal 2");
   
     var enhancedBackgroundRemovalStatus = backgroundRemoval;
   //alert("enhancedBackgroundRemovalStatus " +  enhancedBackgroundRemovalStatus);
   
     const formData = new FormData();
   
   
     //console.log(file);
     //  alert("file !!! " + filenames);
   

 
     try {
     alert("inside try!");
       const response = await axios.post(
         "http://localhost:3000/process",
         formData,
         {
            responseType: "blob"
         }		
       );
   
     alert("Done with try!");
       const wav = new Blob([response.data], { type: 'audio/wav' })
       const url = window.URL.createObjectURL(wav)
       const result = new Audio(url)
       setEnhancedBackgroundRemoval(result);
       result.play();
     } catch (error) {
       console.error("Error processing background removal:", error);
     alert("Catch with Error! " + error );
     } finally {
       setIsProcessing(false); // Reset processing flag after processing is complete
     alert("Finally Done with Try!");
     }
   }


   const handleClick = () => {
	  alert("Click Audio");
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


  function humanFileSize(size) {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
  }

  const addFile = (e) => {
    if (e.target.files[0]) {
		

		
      console.log(e.target.files[0]);
      setFile(e.target.files[0]);
	  	
	  var file = e.target.files[0];
	  var filenames = file.name;
    let filesize = e.target.files[0].size;

    
    // Format the Filesize correctly
    filesize = humanFileSize(filesize);

    setFileName(filenames, filesize);
    

      console.log(typeof (e.target.files[0]));
	  
	  	  // Check if background removal is on
		processBackgroundRemoval(filenames);
	  
      setAudio(URL.createObjectURL(e.target.files[0]));
    }
  };

  const setFileName = (filenames, filesize) => {
    var label = document.querySelector('label[for="filename"]');
    label.textContent = filenames;

    var filesizelabel = document.querySelector('label[for="filesize"]');
    filesizelabel.textContent = filesize;
       
     }

  return (    

    <div>  {/* Main Container Div Start *}
      
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>    

      {/* Logo Start   */}
      
      <div class="song">	  
        <img src={logo} alt="Logo" width="360px" />	  
      </div>
      {/* Logo End */}

       <div class="row">  {/* Body Container Div Start */}
      
        
        <div class="column columnbackground" > {/*  Body Child Div 1 Start - Left Container */}
              
            <h3>STEP 2: RECORD or UPLOAD</h3>
            <div className="">
{/* `              <input id="fileInput" type="file" onChange={addFile} style={{ display: "none" }} /> */}
              <input id="fileInput" type="file"  accept=".wav" onChange={addFile} style={{ display: "none" }} />

              <div className="RecordButtonNew">
                {/* <img src={recordimage} alt="Record Button" style={{ width: '120px', }}/> */}

                <button className="record_btn" >
                  <img src={recordimage} alt="Record Button" style={{ width: '120px', }}/>

                </button>



              </div>           

              <div className="ORStyle">
                OR
              </div>

              <div>
                {/* <img src={uploadimage} alt="Upload Button" style={{ width: '240px', }} onClick={() => document.getElementById("fileInput").click()}/> */}
                <div className="supportmessage">Supports only .WAV files</div>
                <button className="upload_btn">
                  <img src={uploadimage} alt="Upload Button" style={{ width: '240px', }} onClick={() => document.getElementById("fileInput").click()}/>
                </button>
              
              </div>


              {/* Old Button Saved for Ref */}
              {/* <br/><br/>
              <div className="upload-button" onClick={() => document.getElementById("fileInput").click()} >Upload</div> */}

              <span><label for="filename" class="filelabel" >File Name</label> </span>
              <span><label for="filesize" class="filelabel" >File Size</label> </span>


              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '12vh' }}>
                <button onClick={handleClick} disabled={!audio || file === null}>
                  {buttonName}
                </button>
              </div>

              {/* Check if Background Noise Removal Selected */}
              {enhancedBackgroundRemoval != null && (
                <div>
                  <button onClick={playEnhanced}>Play Enhanced Audio</button>
                  <button onClick={exportAudio}>Export Enhanced Audio</button>
                </div>
              )}

              
            </div>
            

        </div> {/*  Body Child Div 1 Start - Left Container */}
      
      </div>  {/* Body Container Div End */}


      
    </div>  // Main Container Div End
  );
};

export default AudioPlay;
