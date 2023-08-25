import React, { useState } from 'react';

const File = ({ file, onRename }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    // Toggle the play/pause state
    setIsPlaying(!isPlaying);
    
    // Here you can add the logic to start or stop playback of the file
    // For example, you can use the HTML5 audio element to play the audio file.
  };

  return (
    <div className="file-item">
      <div className="file-name">{file.name}</div>
      <button
        className="rename-button"
        onClick={() => {
          const newName = prompt('Enter the new file name:', file.name);
          if (newName) {
            onRename(file.id, newName);
          }
        }}
      >
        Rename
      </button>
      <button className="play-button" onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default File;
