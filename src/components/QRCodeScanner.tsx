import {useEffect, useRef} from "react";
import QrScanner from "qr-scanner";

type Props = {
    handleSpotifyTrackId: (result: string) => void;
    isVisible: boolean;
}

const spotifyRegex = /^(https:\/\/open.spotify.com\/track\/|spotify:track:)([a-zA-Z0-9]+)(.*)$/gm;

export default function QRCodeScanner({handleSpotifyTrackId, isVisible}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null);

    const isVisibleRef = useRef(isVisible);

    useEffect(() => {
        isVisibleRef.current = isVisible;
    }, [isVisible]);

    useEffect(() => {
        if (!scannerRef.current) {
            const scanner = new QrScanner(
                document.getElementsByTagName('video')[0],
                result => {
                    // Only process scans when scanner is visible
                    if (!isVisibleRef.current) {
                        return;
                    }

                    const trackId = spotifyRegex.exec(result)?.[2];

                    if (trackId) {
                        // Play a "ba-ding" sound on successful scan
                        try {
                            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                            
                            // First part: "ba" - lower note
                            const osc1 = audioContext.createOscillator();
                            const gain1 = audioContext.createGain();
                            osc1.connect(gain1);
                            gain1.connect(audioContext.destination);
                            osc1.frequency.value = 500;
                            osc1.type = 'sine';
                            gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
                            gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                            osc1.start(audioContext.currentTime);
                            osc1.stop(audioContext.currentTime + 0.1);
                            
                            // Second part: "ding" - higher steady note
                            const osc2 = audioContext.createOscillator();
                            const gain2 = audioContext.createGain();
                            osc2.connect(gain2);
                            gain2.connect(audioContext.destination);
                            osc2.frequency.value = 1200;
                            osc2.type = 'sine';
                            gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
                            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                            osc2.start(audioContext.currentTime + 0.1);
                            osc2.stop(audioContext.currentTime + 0.3);
                        } catch (error) {
                            // Silently ignore audio errors (browser autoplay policy)
                            console.log('Audio playback blocked by browser policy');
                        }
                        
                        handleSpotifyTrackId(trackId);
                    }
                },
            )

            scanner.setInversionMode('both');
            scanner.start();
            scannerRef.current = scanner;
        }

        // Don't stop/start the scanner to avoid re-requesting camera permission
        // Just control visibility with CSS and process results only when visible
    }, [handleSpotifyTrackId]);

    return (
        <div className={`relative ${isVisible ? '' : 'hidden'}`}>
            <video ref={videoRef} className="fixed right-0 bottom-0 min-w-full min-h-full object-cover"></video>
            <div className="fixed border-2 border-white border-opacity-25 rounded-2xl w-[200px] h-[200px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
    );
}