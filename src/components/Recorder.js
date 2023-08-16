import React, { useState, useEffect, useRef } from 'react';
import RecorderJS from 'recorder-js';
import axios from "axios";

import { exportBuffer } from '../utilities/preprocess';
import { getAudioStream } from '../utilities/permissions';

let browserSampleRate = 48000;
const Recorder = () => {

    const [stream, setStream] = useState();
    const [recording, setRecording] = useState(false);
    const [recorder, setRecorder] = useState();

    const [enhanced, setEnhanced] = useState();

    const isFirstRender = useRef(true)
    useEffect(() => {
        if (isFirstRender.current) {
            try {
                const getStream = async () => {
                    const audioStream = await getAudioStream();
                    console.log(audioStream.getAudioTracks()[0])
                    browserSampleRate = audioStream.getAudioTracks()[0].getSettings().sampleRate;
                    console.log(browserSampleRate);
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

    }, [recorder, recording])



    const startRecord = () => {

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const recorderInstance = new RecorderJS(audioContext);
        recorderInstance.init(stream);

        setRecording(true);
        setRecorder(recorderInstance);
    }

    const stopRecord = async () => {
        const { buffer } = await recorder.stop()
        const audio = exportBuffer(buffer[0], browserSampleRate);

        // Process the audio here.
        console.log(audio);
        const formData = new FormData();
        const audioFile = new File([audio], "file.wav", { type: "audio/wav" })
        formData.append("file", audioFile, "noisy.wav");
        const response = await axios.post(
            "http://localhost:8000/process",
            formData,
            {
                responseType: "blob"
            }
        );
        console.log(response);
        const wav = new Blob([response.data], { type: 'audio/wav' })
        const url = window.URL.createObjectURL(wav)
        const result = new Audio(url)
        setEnhanced(result);
        setRecording(false);
    }


    const playEnhanced = () => {
        enhanced.play();
    };

    if (!stream) {
        return null;
    }

    return (
        <div>
            <button
                onClick={() => {
                    recording ? stopRecord() : startRecord();
                }}
            >
                {recording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {enhanced != null &&
                <button onClick={playEnhanced}>Play Enhanced Audio</button>
            }
        </div>

    );
}

export default Recorder;
