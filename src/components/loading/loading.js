import React, { useState, useEffect } from 'react';
import './loading.css'; // Import your CSS file for styling

function LoadingPage() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Create an interval to animate the dots
    const intervalId = setInterval(() => {
      setDots((prevDots) => {
        return prevDots.length === 3 ? '' : prevDots + '.';
      });
    }, 500); // Change the interval as needed

    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
    };
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-content">
        <h1>Loading{dots}</h1>
      </div>
    </div>
  );
}

export default LoadingPage;