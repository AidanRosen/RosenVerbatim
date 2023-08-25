import React, { useState, useEffect, useRef } from 'react';
import { process } from '../utilities/process';
import RecorderJS from 'recorder-js';
import { exportBuffer } from '../utilities/preprocess';
import { getAudioStream } from '../utilities/permissions';
import '../App.css';
import './../AudioPlay.css';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import logo from './../a.png'; // Tell webpack this JS file uses this image
import { Link } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../hooks/auth";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";


import recordimage from './../Just-Press-Record-button.png'
import uploadimage from './../Upload-button.png'

let a; 

const AudioManager = () => {
  const [buttonName, setButtonName] = useState('Play');
  const [audio, setAudio] = useState();
  const [file, setFile] = useState();
  const [enhanced, setEnhanced] = useState();
  const [stream, setStream] = useState();
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState();
  const [browserSampleRate, setBrowserSampleRate] = useState(48000);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState();
  const { user, isLoading } = useAuth();
  const [enhancedFile, setEnhancedFile] = useState();

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
  
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (a) {
      a.pause();
      a = null;
      setButtonName('Play');
    }
    if (audio) {
      a = new Audio(audio);
      console.log(a);
      a.onended = () => {
        setButtonName('Play');
      };
    }

    if (isFirstRender.current) {
      try {
        const getStream = async () => {
          const audioStream = await getAudioStream();
          setStream(audioStream);
        };
        getStream();
      } catch (error) {
        console.log(error);
      }
      isFirstRender.current = false;
      return;
    }

    if (recording) {
      recorder.start();
      
      const innerCircle = document.querySelector('.inner-circle');
      innerCircle.style.animationPlayState = 'running';
    }
  }, [audio, recorder, recording]);

  const startRecord = () => {
    const audioContext = new window.AudioContext();
    console.log(audioContext.sampleRate);
    setBrowserSampleRate(audioContext.sampleRate);
    const recorderInstance = new RecorderJS(audioContext);
    recorderInstance.init(stream);

    setRecording(true);
    setRecorder(recorderInstance);
  };

  const stopRecord = async () => {
    const { buffer } = await recorder.stop();
    const audioBuffer = exportBuffer(buffer[0], browserSampleRate);

        console.log(audioBuffer);
    const audioFile = new File([audioBuffer], 'file.wav', { type: 'audio/wav' });
    setAudio(URL.createObjectURL(audioFile));
    setFile(audioFile);
    setRecording(false);

    const resetAnimation = () => {
      const innerCircle = document.querySelector('.inner-circle');
      innerCircle.style.animation = 'none';
      innerCircle.style.animation = null;
    };

    resetAnimation(); 
  };

  const processFile = async () => {
    setProcessing(true);
    console.log(file);
    const response = await process(file);
    const wav = new Blob([response.data], { type: 'audio/wav' });
    const url = window.URL.createObjectURL(wav);
    const result = new Audio(url);
    const name = file.name.substring(0, file.name.lastIndexOf(".")) + "_processed";
    const extension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
    const efName = name + extension;
    const ef = new File([wav], efName, { type: 'audio/wav' });
    setEnhancedFile(ef);
    setEnhanced(result);
    setTranscript(response.headers.transcript);
    setProcessing(false);
  };

  const playEnhanced = () => {
    enhanced.play();
  };

  const addFile = (e) => {
    if (e.target.files[0]) {
      console.log(e.target.files[0]);
      setFile(e.target.files[0]);
      setAudio(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleClick = () => {
    setButtonName(prevButtonName => prevButtonName === 'Play' ? 'Pause' : 'Play');
    if (a) {
      if (buttonName === 'Play') {
        a.play();
      } else {
        a.pause();
      }
    }
  };

  const upload = async () => {
    const formDataOriginal = new FormData();
    const formDataEnhanced = new FormData();
    const timestamp = serverTimestamp();
    formDataOriginal.append("file", file, file.name);
    formDataEnhanced.append("file", enhancedFile, enhancedFile.name);
    console.log("uploading");
    console.log(`https://api-sl2ugsqq7a-uc.a.run.app/upload/${user.uid}`)
    const uploadResponse = await axios.post(
        `https://api-sl2ugsqq7a-uc.a.run.app/upload/${user.uid}`,
        formDataOriginal,   
        {
            headers: {
                "Content-Type": "multipart/form-data",
                "boundary": `${formDataOriginal._boundary}`,
            }
        }
    )

    const enhancedUploadResponse = await axios.post(
        `https://api-sl2ugsqq7a-uc.a.run.app/upload/${user.uid}`,
        formDataEnhanced,   
        {
            headers: {
                "Content-Type": "multipart/form-data",
                "boundary": `${formDataEnhanced._boundary}`,
            }
        }
    )
    console.log(uploadResponse);
    const docRef = await addDoc(collection(db, "recordings"), {
        uid: user.uid,
        fileName: file.name,
        enhancedFileName: enhancedFile.name,
        timeAdded: timestamp

    })
    return [uploadResponse, enhancedUploadResponse];
  };

  return (
    <div>
    <div>  {/* Main Container Div Start *}
    
    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>  
    
     {/* Logo Start   */}
      <div class="centerimage smallerimage">	  
        <img src={logo} alt="Logo"  />	  
      </div>
      {/* Logo End */}
    
    
    
    </div>
    
    
    
    <div class="row">  {/* Body Container Div Start */}
     <div class="column columnbackground" >  {/*  Body Child Div 1 Start - Left Container  */}
     <h3>STEP 1: SELECT OPTIONS</h3>
            <div className="toggle-switch togglestyle child">
            <label className="switch">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
          <label className="toggle-label child">Destuttering</label>          
          </div>
    
 <div className="toggle-switch togglestyle child">
          <label className="switch">
            <input
              type="checkbox"
              onChange={() => {
                if (!isProcessing) { // Allow toggling only if not processing
                  setBackgroundRemoval(!backgroundRemoval);
                  /* processBackgroundRemoval(); */ /* COMMENT OUT FOR NOW -- JS 8/20/23 */
                }
              }}
            />
            <span className={`slider ${isProcessing ? 'processing' : ''}`}></span>
            </label>
            <label className="toggle-label child">Background Noise Removal</label>
          </div>
 
          <div className="toggle-switch togglestyle child">
          <label className="switch">
            {/* <input type="checkbox" onChange={() => startTranscription(setTranscription)} /> */}
            <span className="slider"></span>
          </label>
          <label className="toggle-label child">Transcription</label>
        </div>   
    
    
    
     </div>  {/*  Body Child Div 1 End - Left Container  */}
    
    
    <div class="column columnbackground" > {/*  Body Child Div 2 Start - Left Container */}
            <h3>STEP 2: RECORD or UPLOAD</h3>
    
    
    
            {/* New circle element */}
            <div className={`record-circle ${recording ? 'dancing' : ''}`}>  {/* Parent New Cirlce Element Start */}
    
              <div className={`outer-circle ${recording ? 'disabled' : ''}`}> {/* Outer Circle - Start */}
                {/* Additional circle with a delay */}
                <div className={`delay-circle ${recording ? 'delayed' : ''}`}></div>
                {/* End of additional circle */}
                  <div 
                    className={`inner-circle ${recording ? 'recording' : ''} ${recording ? 'disabled' : ''}`}
                    onClick={() => {
                      recording ? stopRecord() : startRecord();
                    }}
                  > {/* Sub Div 1 - Start */}
                    <button className={`record-button ${recording ? 'disabled' : ''}`}> {/* Recording Button - Start */}
                      <div className="button-content">
                        {recording ? 'Recording...' : 'Record'}
                      </div>
                    </button>  {/* Recording Button - End */}
                  </div> {/* Sub Div 1 - End */}
              </div> {/* Outer Circle - End */}
            </div> {/* Parent New Cirlce Element End */}
            {/* End of new circle element */}
        
        
                 
                  <div className='ORStyle'>
                  OR 
                  </div>
                    

                    {/* Upload Section - Start */}
                    <div>{/*  Upload Div - Start */}

                    <input disabled={recording} type="file" onChange={addFile} />

                    <button onClick={handleClick}>
                      {buttonName}
                    </button>

                    {audio != null && (
                      <button disabled={processing} onClick={processFile}>
                        Process
                      </button>
                    )}
                    {enhanced != null && (
                      <div>
                        <button onClick={playEnhanced}>Play Enhanced Audio</button>
                        <button onClick={upload}>Backup</button>
                      </div>
                    )}{transcript != null && (
                      <p className="transcript"> Transcript: {transcript} </p>
                    )}


                    </div>{/*  Upload Div - End */}
                    <Link to="/protected/history">
                      <button>Navigate to history</button>
                  </Link>
        
      </div>
      <div>
               
        
      </div>
      
            </div>
    

    
  
    

    
    

    
    
    
      
        
   
       
    </div>
  );
};

export default AudioManager;
