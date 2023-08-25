/**
 * Get access to the users microphone through the browser.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Using_the_new_API_in_older_browsers
 */
const getAudioStream = () => {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    const params = { audio: true, video: false };

    return navigator.mediaDevices.getUserMedia(params);
}

export { getAudioStream }