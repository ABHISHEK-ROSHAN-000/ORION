const fileInput = document.getElementById('audio-file');
const waveElements = document.querySelectorAll('.wave');
let audioContext, audioSource, analyser;

// Handle file input and start visualization
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        if (audioContext) {
            audioContext.close(); // Close previous audio context if it exists
        }
        
        // Create a new audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create an analyser node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 32; // Low value for fewer bars
        analyser.smoothingTimeConstant = 0.8;

        // Connect audio file to the audio context and analyser
        const audioBuffer = await file.arrayBuffer();
        const decodedData = await audioContext.decodeAudioData(audioBuffer);
        
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = decodedData;
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Play the audio
        audioSource.start();
        
        // Start the visualization
        visualize();
    }
});

// Function to visualize audio data
function visualize() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    function updateWaveHeights() {
        analyser.getByteFrequencyData(dataArray);
        
        const middleIndex = Math.floor(waveElements.length / 2);

        waveElements.forEach((wave, index) => {
            // Calculate symmetric data index
            const symmetricIndex = Math.abs(middleIndex - index); // Distance from the middle
            const dataIndex = Math.floor(symmetricIndex * dataArray.length / waveElements.length);
            
            // Ensure minimum height of 30px and calculate dynamic height based on audio data
            const height = Math.max((dataArray[dataIndex] || 30) / 2, 30);
            wave.style.height = `${height}px`;
        });

        requestAnimationFrame(updateWaveHeights); // Continue the animation
    }
    
    updateWaveHeights(); // Initial call to start animation
}
