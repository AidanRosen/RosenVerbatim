import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AudioPlayer({tempurl}) {
    const [audioData, setAudioData] = useState(null);

    useEffect(() => {
        async function fetchAudio() {
        try {
            console.log('Fetching audio from:', tempurl);
            const response = await axios.get(tempurl, { responseType: 'blob' });
            console.log('Response data:', response.data);
            setAudioData(response.data);
        } catch (error) {
            console.error('Error fetching audio:', error);
        }
        }

        fetchAudio();
    }, [tempurl]);

    console.log('audioData:', audioData);

    return (
        <div>
        {audioData && (
            <audio controls>
            <source src={window.URL.createObjectURL(audioData)} type="audio/mpeg" />
            Your browser does not support the audio element.
            </audio>
        )}
        </div>
    );
}