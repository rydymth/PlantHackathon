"use client"; // This is a client component
import React, { useState, useEffect } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react';

function App() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [predictions, setPredictions] = useState<number[] | null>(null);
  
  // Image
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    async function loadModel() {
      const loadedModel = await tf.loadLayersModel('localstorage:../Models/ShubhamModel/model.json'); // Update the path to your model.json
      setModel(loadedModel);
    }

    loadModel();
  }, []);
  
    const takePicture = async () => {
      const constraints: MediaStreamConstraints = {
        video: true,
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas
          .getContext('2d')
          ?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataURL = canvas.toDataURL('image/png');
        const img = new Image();
        img.src = imageDataURL;

        setImage(img);
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
  };

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;

        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          setImage(img);
        };
      };

      reader.readAsDataURL(file);
    }
  };
  const predict = async () => {
    if (model && image) {
      const tensor = tf.browser.fromPixels(image);
      // Preprocess the image if needed (e.g., resizing and normalizing)
      const preprocessedTensor = preprocessImage(tensor);
      const predictions = model.predict(preprocessedTensor) as tf.Tensor;
      const predictionData : Float32Array | Int32Array | Uint8Array = await predictions.data();
      const predictionConvert : number[] = Array.from(predictionData);
      setPredictions(predictionConvert);
    }
  };

  const preprocessImage = (tensor: tf.Tensor): tf.Tensor => {
    // Implement any required preprocessing here
    return tensor;
  };

  return (
    <div className="App">
      <h1>Plant Identification</h1>
       <div className="file-input-container">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <label>Upload Image</label>
      </div>
      <button onClick={takePicture}>Take Picture</button>
      {image && <img src={image.src} alt="Uploaded" width={200} height={200} />}
      {predictions && (
        <div>
          <h2>Predictions:</h2>
          <ul>
            {predictions.map((value, index) => (
              <li key={index}>{`Class ${index}: ${value.toFixed(2)}`}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={predict}>Predict</button>
    </div>
  );
}

export default App;
