import React, { useState, useEffect } from "react";
import axios from "axios";


var a;
const AudioManager = () => {
    const [buttonName, setButtonName] = useState("Play");

    const [audio, setAudio] = useState();

    const [file, setFile] = useState();

    const [enhanced, setEnhanced] = useState();


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
    }, [audio]);



    const process = async () => {
        const formData = new FormData();
        console.log(file);
        formData.append("file", file, "noisy.wav");
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
        setEnhanced(result);
        return response;
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
            console.log(typeof (e.target.files[0]));
            setAudio(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>
                    <button onClick={handleClick}>{buttonName}</button>
                    <input type="file" onChange={addFile} />
                </div>
                <div>
                    {audio != null &&
                        <button onClick={process}>Process</button>
                    }
                    {enhanced != null &&
                        <button onClick={playEnhanced}>Play Enhanced Audio</button>
                    }
                </div>
            </div>
        </div>
    );
};
export default AudioManager;
