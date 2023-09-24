import React, { useState, useEffect, useRef } from 'react';

function Video() {
    const [model, setModel] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [location, setLocation] = useState(null);
    const [timestamp, setTimestamp] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        // Initialize the Roboflow model
        if (!window.roboflow) {
            console.error("Roboflow.js not loaded");
            return;
        }

        window.roboflow.auth({
            publishable_key: "rf_5XwP6b3QJgXLOmoTyAWNzvCV66h2",
        }).load({
            model: "strawberry_counting",
            version: 1
        }).then(loadedModel => {
            // model has loaded
            setModel(loadedModel);
        });

        // Access the webcam and stream to the video element
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(error => {
                    console.error("Error accessing the webcam:", error);
                });
        }

        const handleVideoLoaded = () => {
            setVideoLoaded(true);
        };

        if (videoRef.current) {
            videoRef.current.addEventListener('loadeddata', handleVideoLoaded);
        }

        return () => {
            // Cleanup, stop the camera stream when the component unmounts
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const detectObjects = () => {
        if (model && videoRef.current) {
            // Get current timestamp
            const currentTimestamp = new Date().toISOString();
            setTimestamp(currentTimestamp);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, error => {
                    console.error("Error getting location:", error);
                });
            } else {
                console.warn("Geolocation is not supported by this browser.");
            }

            model.detect(videoRef.current).then(resultingPredictions => {
                console.log("Predictions:", resultingPredictions);
                setPredictions(resultingPredictions);
            });
        }
    };


    const countClasses = () => {
        // const initialCounts = { total: 0 };
        const classCounts = predictions.reduce((acc, prediction) => {
            if (acc[prediction.class]) {
                acc[prediction.class] += 1;
            } else {
                acc[prediction.class] = 1;
            }
            return acc;
        }, 
        {}
        // initialCounts
        );

        return classCounts;
    };

    const classCounts = countClasses();

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline></video>
            <div>
            <button onClick={detectObjects}>
                Detect Strawberry Product for Labelling
            </button>
            </div>
            <div>
                <h3>Number of Strawberries Predicted:</h3>
                {Object.entries(classCounts).map(([className, count]) => (
                    <div key={className}>
                        {className}: {count}
                    </div>
                ))}
                {timestamp && <div>Timestamp: {timestamp}</div>}
                {location && (
                    <div>
                        Location: Latitude - {location.latitude}, Longitude - {location.longitude}
                    </div>
                )}
            </div>
        </div>
    );
}


export default Video;
