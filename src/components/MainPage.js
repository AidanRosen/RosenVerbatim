import React, { useState, useEffect, useRef } from 'react';
import { process } from '../utilities/process';
import RecorderJS from 'recorder-js';
import { exportBuffer } from '../utilities/preprocess';
import { getAudioStream } from '../utilities/permissions';
import '../App.css';

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

  return (
    <div>
      <div className="button-container">
        {/* New circle element */}
        <div className={`record-circle ${recording ? 'dancing' : ''}`}>
          <div className={`outer-circle ${recording ? 'disabled' : ''}`}>
            {/* Additional circle with a delay */}
            <div className={`delay-circle ${recording ? 'delayed' : ''}`}></div>
            {/* End of additional circle */}
            <div
              className={`inner-circle ${recording ? 'recording' : ''} ${recording ? 'disabled' : ''}`}
              onClick={() => {
                recording ? stopRecord() : startRecord();
              }}
            >
              <button className={`record-button ${recording ? 'disabled' : ''}`}>
                <div className="button-content">
                  {recording ? 'Recording...' : 'Record'}
                </div>
              </button>
            </div>
          </div>
        </div>
        {/* End of new circle element */}
        <input disabled={recording} type="file" onChange={addFile} />
      </div>
      <div>
        <button onClick={handleClick}>
          {buttonName}
        </button>
        {audio != null && (
          <button disabled={processing} onClick={processFile}>
            Process
          </button>
        )}
        {enhanced != null && (
          <button onClick={playEnhanced}>Play Enhanced Audio</button>
        )}
      </div>
      {transcript != null && (
        <p className="transcript"> Transcript: {transcript} </p>
      )}
    </div>
  );
};

export default MainPage;
