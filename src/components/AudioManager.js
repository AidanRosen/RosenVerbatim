import React, { useState, useEffect, useRef } from 'react';
import { process } from '../utilities/process';
import { destutter } from '../utilities/destutter';
import RecorderJS from 'recorder-js';
import { exportBuffer } from '../utilities/preprocess';
import { getAudioStream } from '../utilities/permissions';
import '../App.css';
import './../AudioPlay.css';
import logo from './../a.png'; // Tell webpack this JS file uses this image
import { Link } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../hooks/auth";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';



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
    const [isDestutter, setIsDestutter] = useState(false);
    const { user, isLoading } = useAuth();
    const [enhancedFile, setEnhancedFile] = useState();
    const [recordingName, setRecordingName] = useState();

    const [backgroundRemoval, setBackgroundRemoval] = useState(false); // Track background removal state


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
        if (recordingName && recordingName.includes(".wav")) {
            setRecordingName(recordingName.substring(0, recordingName.indexOf(".wav")));
        }
        console.log(recordingName)
        const audioFile = new File([audioBuffer], recordingName, { type: 'audio/wav' });
        console.log(audioFile.name);
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
        let response = await process(file);
        setTranscript(response.headers.transcript);
        let wav = new Blob([response.data], { type: 'audio/wav' });
        let url = window.URL.createObjectURL(wav);
        let result = new Audio(url);
        let name = file.name.substring(0, file.name.lastIndexOf(".")) + "_processed";
        let extension = file.name.substring(file.name.lastIndexOf("."), file.name.length);
        let efName = name + extension;
        let ef = new File([wav], efName, { type: 'audio/wav' });
        if (isDestutter) {
            console.log("this is destutter: " + isDestutter);
            response = await destutter(ef);
            wav = new Blob([response.data], { type: 'audio/wav' });
            url = window.URL.createObjectURL(wav);
            result = new Audio(url);
            ef = new File([wav], efName, { type: 'audio/wav' });
        }
        setEnhancedFile(ef);
        setEnhanced(result);
        setProcessing(false);
    };

    const playEnhanced = () => {
        enhanced.play();
    };

    const addFile = async (e) => {
        if (e.target.files[0]) {
            console.log(e.target.files[0]);
            setFile(e.target.files[0]);
            const url = URL.createObjectURL(e.target.files[0]);
            setAudio(url);
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

    const handleFileNameChange = (event) => {
        setRecordingName(event.target.value);
    };

    return (
        <div>
            <div>  {/* Main Container Div Start *}
    
    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>  
    
     {/* Logo Start   */}
                <div class="centerimage smallerimage">
                    <img src={logo} alt="Logo" />
                </div>
                {/* Logo End */}



            </div>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={processing}
            // onClick={handleClose}
            >
                <CircularProgress color="secondary" size="8rem" />
                <h2> Processing...</h2>
            </Backdrop>

            <div class="row">  {/* Body Container Div Start */}
                <div class="column columnbackground" >  {/*  Body Child Div 1 Start - Left Container  */}
                    <h3>STEP 1: SELECT OPTIONS</h3>
                    <div className="toggle-switch togglestyle child">
                        <label className="switch">
                            <input type="checkbox" onChange={() => { setIsDestutter(!isDestutter); console.log(isDestutter) }} />
                            <span className="slider"></span>
                        </label>
                        <label className="toggle-label child">Destuttering</label>
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

                    {/* Text input for changing the file name */}
                    <input
                        type="text"
                        value={recordingName}
                        onChange={handleFileNameChange}
                        placeholder="Enter File Name"
                    />

                    {/* Display the current file name */}
                    <p>Current File Name: {recordingName}</p>



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