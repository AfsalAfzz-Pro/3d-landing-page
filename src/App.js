import React, { useRef } from 'react';
import './App.css';
import ThreeScene from './ThreeScene';

function App() {
  const threeSceneRef = useRef();

  const handleMoveCamera = () => {
    if (threeSceneRef.current && typeof threeSceneRef.current.moveCamera === 'function') {
      threeSceneRef.current.moveCamera();
    }
  };

  return (
    <div className="App">
      <div id="overlay">
        <h1>Welcome to the Room</h1>
        <button id="moveCameraBtn" onClick={handleMoveCamera}>
          Go to Window
        </button>
      </div>
      <ThreeScene ref={threeSceneRef} />
    </div>
  );
}

export default App; 