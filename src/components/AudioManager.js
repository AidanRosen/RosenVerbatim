import React, { useState, useEffect, useRef } from "react";
import { process } from "../utilities/process";
import RecorderJS from 'recorder-js';
import { exportBuffer } from '../utilities/preprocess';
import { getAudioStream } from '../utilities/permissions';


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

    const isFirstRender = useRef(true)

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
        setAudio(URL.createObjectURL(audioBuffer))
        const audioFile = new File([audioBuffer], "file.wav", { type: "audio/wav" })
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
        setEnhanced(result);
        setTranscript(response.headers.transcript);
        setProcessing(false);
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
                        <button onClick={playEnhanced}>Play Enhanced Audio</button>
                    }
                </div>
            </div>
            {transcript != null &&
                <p> Transcript: {transcript} </p>}
        </div>
    );
};
export default AudioManager;
