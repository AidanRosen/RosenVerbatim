import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/auth';

export default function AudioPlayer() {
    // State to store the temporary URLs
    const [tempUrls, setTempUrls] = useState([]);

    const { user, isLoading } = useAuth();

    useEffect(() => {
        async function fetchTempUrls() {
        try {
            const prefix = 'https://object.cloud.sdsc.edu/v1/AUTH_8492e628f69a472d965fab8d3c621959/myContainer/home/ubuntu/audio_recordings/';
            const processedEnding = "_processed.mp3";
            const response = await axios.get(`https://api-sl2ugsqq7a-uc.a.run.app/getFiles/${user.uid}`);
            const filteredUrls = response.data.filter((url) => url.startsWith(prefix) && url.includes(processedEnding));
            setTempUrls(filteredUrls);
        } catch (error) {
            console.error('Error fetching temp URLs:', error);
        }
        }

        fetchTempUrls();
        const intervalId = setInterval(fetchTempUrls, 86400000);
        return () => clearInterval(intervalId);
    }, []);

    console.log(user.uid);
    console.log(tempUrls);

    return (
        <div className="audio-list">
            {tempUrls.map((tempUrl, index) => (
                <audio key={index} controls>
                    <source src={tempUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            ))}
        </div>
    );
}
