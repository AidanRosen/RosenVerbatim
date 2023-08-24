import React, { useState, useEffect, useRef } from "react";
import { process } from "../utilities/process";
import RecorderJS from 'recorder-js';
import { exportBuffer } from '../utilities/preprocess';
import { getAudioStream } from '../utilities/permissions';
import { Link } from 'react-router-dom';
import axios from "axios";
import { useAuth } from "../hooks/auth";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";


var a;
const AudioManager = () => {
    const [buttonName, setButtonName] = useState("Play");

    const [audio, setAudio] = useState();

    const [file, setFile] = useState();

    const [enhanced, setEnhanced] = useState();

    const [stream, setStream] = useState();

    const [recording, setRecording] = useState(false);

    const [recorder, setRecorder] = useState();

    const [browserSampleRate, setBrowserSampleRate] = useState(48000);

    const [processing, setProcessing] = useState(false);

    const [transcript, setTranscript] = useState();

    const [enhancedFile, setEnhancedFile] = useState();

    const isFirstRender = useRef(true);

    const { user, isLoading } = useAuth();

    useEffect(() => {
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

        if (isFirstRender.current) {
            try {
                const getStream = async () => {
                    const audioStream = await getAudioStream();
                    setStream(audioStream);
                }
                getStream();
            } catch (error) {
                console.log(error);
            }
            isFirstRender.current = false
            return;
        }

        if (recording) {
            recorder.start();
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
    }

    const stopRecord = async () => {
        const { buffer } = await recorder.stop()
        const audioBuffer = exportBuffer(buffer[0], browserSampleRate);

        // Process the audio here.
        console.log(audioBuffer);
        const audioFile = new File([audioBuffer], "file.wav", { type: "audio/wav" })
        setAudio(URL.createObjectURL(audioFile));
        setFile(audioFile);
        setRecording(false);
    }

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
        console.log(efName);
        const ef = new File([wav], efName, { type: 'audio/wav' });
        setEnhanced(result);
        setTranscript(response.headers.transcript);
        setProcessing(false);
        setEnhancedFile(ef);
    }

    const handleClick = () => {
        if (buttonName === "Play") {
            a.play();
            setButtonName("Pause");
        } else {
            a.pause();
            setButtonName("Play");
        }
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
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }}>
                <div>
                    <button disabled={recording || !audio} onClick={handleClick}>{buttonName}</button>
                    <input disabled={recording} type="file" onChange={addFile} />
                </div>
                <div>
                    <button
                        onClick={() => {
                            recording ? stopRecord() : startRecord();
                        }}
                    >
                        {recording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                </div>
                <div>
                    {audio != null &&
                        <button disabled={processing} onClick={processFile}>Process</button>
                    }
                    {enhanced != null &&
                    <div>
                        <button onClick={playEnhanced}>Play Enhanced Audio</button>
                        <button onClick={upload}>Backup</button>
                    </div>
                    }
                </div>
            </div>
            {transcript != null &&
                <p> Transcript: {transcript} </p>}
            <Link to="/protected/history">
                <button>Navigate to history</button>
            </Link>
        </div>
    );
};
export default AudioManager;
