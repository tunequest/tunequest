import React, {useEffect, useMemo, useRef, useState} from "react";
import { usePlayerDevice, useSpotifyPlayer } from "react-spotify-web-playback-sdk";
import QRCodeScanner from "@/components/QRCodeScanner";
import Link from "next/link";
import { ForwardButton } from "@/components/ForwardButton";
import { RewindButton } from "@/components/RewindButton";
import ProgressBar from "@/components/ProgressBar";
import { SpinningRecord } from "@/components/SpinningRecord";
import NoSleep from 'nosleep.js';
import TriggeredTimeout from "@/components/TriggeredTimeout";
import { bingoCategories, BingoCategory } from "@/data/bingoCategories";
import { GameSettings, defaultGameSettings, readGameSettings } from "@/utils/gameSettings";

type Props = {
    token: string;
};

const hitsterMapping = {
    'de': {
        '00300': 'spotify:track:5IMtdHjJ1OtkxbGe4zfUxQ',
    }
}

export default function GameController({token}: Props) {
    const player = useSpotifyPlayer();
    const device = usePlayerDevice();
    const [showScanner, setShowScanner] = useState<boolean>(true);
    const [randomStart, setRandomStart] = useState<boolean>(false);
    const [showTriggeredTimeoutControls, setShowTriggeredTimeoutControls] = useState<boolean>(false);
    const [triggeredTimeoutTargetSeconds, setTriggeredTimeoutTargetSeconds] = useState<number>(30);
    const [triggeredTimeoutEnabledByDefault, setTriggeredTimeoutEnabledByDefault] = useState<boolean>(false);
    const [triggeredTimeoutSoundEnabled, setTriggeredTimeoutSoundEnabled] = useState<boolean>(false);
    const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [wheelPreviewId, setWheelPreviewId] = useState<string | null>(null);
    const [isWheelSpinning, setIsWheelSpinning] = useState<boolean>(false);
    const [playerActivated, setPlayerActivated] = useState<boolean>(false);
    const [playerReady, setPlayerReady] = useState<boolean>(false);
    const spinIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if(!showScanner){
            const noSleep = new NoSleep();
            noSleep.enable();
        }
    }, [showScanner]);

    useEffect(() => {
        const storedSettings = readGameSettings();
        setGameSettings(storedSettings);
    }, []);

    useEffect(() => {
        return () => {
            if (spinIntervalRef.current !== null) {
                window.clearInterval(spinIntervalRef.current);
            }
        };
    }, []);

    const enabledCategories = useMemo(() => {
        return bingoCategories.filter(category => gameSettings.selectedCategoryIds.includes(category.id));
    }, [gameSettings.selectedCategoryIds]);

    const activeCategory = useMemo(() => {
        const targetId = wheelPreviewId ?? selectedCategoryId;
        if (!targetId) {
            return null;
        }
        return enabledCategories.find((category: BingoCategory) => category.id === targetId) ?? null;
    }, [enabledCategories, wheelPreviewId, selectedCategoryId]);

    const isBingoModeSelected = gameSettings.mode === "bingo";
    const hasBingoCategories = enabledCategories.length > 0;
    const shouldShowBingoUi = isBingoModeSelected && hasBingoCategories;

    const activatePlayer = async () => {
        if (!playerActivated && player) {
            try {
                await player.activateElement();
                setPlayerActivated(true);
                setPlayerReady(true);
                console.log('Player activated successfully');
            } catch (error) {
                console.error('Failed to activate player:', error);
                // Even if activation fails, allow scanning
                setPlayerReady(true);
            }
        } else {
            setPlayerReady(true);
        }
    };

    const stopWheelInterval = () => {
        if (spinIntervalRef.current !== null) {
            window.clearInterval(spinIntervalRef.current);
            spinIntervalRef.current = null;
        }
    };

    const handleSpinWheel = () => {
        if (!shouldShowBingoUi || isWheelSpinning) {
            return;
        }

        setIsWheelSpinning(true);
        setWheelPreviewId(null);

        const spinIntervalMs = 130;
        const totalDuration = 1800;
        let elapsed = 0;
        let latestCategoryId = enabledCategories[Math.floor(Math.random() * enabledCategories.length)].id;

        stopWheelInterval();
        spinIntervalRef.current = window.setInterval(() => {
            latestCategoryId = enabledCategories[Math.floor(Math.random() * enabledCategories.length)].id;
            setWheelPreviewId(latestCategoryId);
            elapsed += spinIntervalMs;

            if (elapsed >= totalDuration) {
                stopWheelInterval();
                setWheelPreviewId(null);
                setSelectedCategoryId(latestCategoryId);
                setIsWheelSpinning(false);
            }
        }, spinIntervalMs);
    };

    const resetCategorySelection = () => {
        stopWheelInterval();
        setWheelPreviewId(null);
        setSelectedCategoryId(null);
        setIsWheelSpinning(false);
    };

    const handleQrResult = async (trackId: string) => {
        setShowScanner(false);
        if (device === null) {
            console.error('Device is null, cannot play track');
            return;
        }
        
        // set position to random value between 0 and 60 seconds
        let position = randomStart ? Math.floor(Math.random() * 60000): 0;

        console.log('Playing track:', trackId, 'on device:', device.device_id, 'at position:', position);

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({uris: [`spotify:track:${trackId}`], position_ms: position}),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Spotify API error:', response.status, errorText);
                
                // If device is not active, try activating it first
                if (response.status === 404) {
                    console.log('Device not active, attempting to activate and retry...');
                    if (player) {
                        try {
                            await player.activateElement();
                            setPlayerActivated(true);
                        } catch (error) {
                            console.error('Activation failed:', error);
                        }
                    }
                    // Retry playback after a short delay
                    setTimeout(async () => {
                        const retryResponse = await fetch(
                            `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
                            {
                                method: "PUT",
                                body: JSON.stringify({uris: [`spotify:track:${trackId}`], position_ms: position}),
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            },
                        );
                        if (!retryResponse.ok) {
                            console.error('Retry failed:', await retryResponse.text());
                        } else {
                            console.log('Retry successful');
                        }
                    }, 1000);
                }
            } else {
                console.log('Playback started successfully');
            }
        } catch (error) {
            console.error('Failed to start playback:', error);
        }
    }

    const goToNext = () => {
        player?.pause();
        setShowScanner(true);
        if (shouldShowBingoUi) {
            resetCategorySelection();
        }
    }

    if (device === null) return null;
    if (player === null) return null;

    const handleTriggeredTimeoutTriggered = () => {
        player?.pause();
    };

    return (
        <div
            className="relative flex flex-col w-full min-h-screen bg-gradient-to-t from-purple-200 to-pink-200">
            <QRCodeScanner handleSpotifyTrackId={handleQrResult} isVisible={showScanner}/>
            
            {showScanner && (
                <>
                    {!playerReady && (
                        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="w-11/12 max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-2xl">
                                <div className="mb-4 text-6xl">🎵</div>
                                <h2 className="mb-3 text-2xl font-bold text-gray-900">Ready to Play?</h2>
                                <p className="mb-6 text-sm text-gray-600">
                                    Tap the button below to activate audio, then scan your first QR code to start the music.
                                </p>
                                <button
                                    className="rounded-full bg-indigo-600 px-8 py-3 text-base font-bold text-white shadow-lg transition hover:bg-indigo-500 hover:shadow-xl"
                                    onClick={activatePlayer}
                                >
                                    Activate Player
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col w-full sm:w-2/5 py-8 px-4 mx-auto relative z-20">
                        {shouldShowBingoUi && (
                            <div className="w-full mb-6 rounded-3xl bg-white/90 backdrop-blur-sm p-5 text-center shadow-xl border-2" style={{borderColor: activeCategory?.color || '#6366f1', minHeight: '140px'}}>
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    {activeCategory ? (
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl shadow-lg" style={{backgroundColor: activeCategory.color}}>
                                            {activeCategory.icon}
                                        </div>
                                    ) : (
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl shadow-lg bg-indigo-600">
                                            🎲
                                        </div>
                                    )}
                                    <div className="text-left flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{color: activeCategory?.color || '#6366f1'}}>Bingo Challenge</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {activeCategory ? activeCategory.label : "Spin the Wheel"}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 min-h-[40px]">
                                    {activeCategory ? activeCategory.description : "Tap \"Spin\" below to select your challenge."}
                                </p>
                                {!activeCategory && (
                                    <div className="mt-3 flex justify-center">
                                        <button
                                            className={`rounded-full px-8 py-2 text-sm font-bold text-white shadow-lg transition ${isWheelSpinning ? "opacity-60" : "hover:shadow-xl"}`}
                                            style={{backgroundColor: '#6366f1'}}
                                            onClick={handleSpinWheel}
                                            disabled={isWheelSpinning}
                                        >
                                            {isWheelSpinning ? "Spinning..." : "Spin"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="fixed flex w-full mb-4 bottom-0 left-1/2 transform -translate-x-1/2 z-20 px-4">
                        <Link
                            href="/"
                            className="text-center w-full rounded-md bg-white bg-opacity-70 px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-opacity-10"
                        >
                            Go back
                        </Link>
                    </div>
                </>
            )}
            {!showScanner && (<>
                <div className="flex flex-col w-full sm:w-2/5 py-8 px-4 mx-auto flex-grow">
                    <h1 className="w-full text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                        <span className="text-indigo-500">Tune</span>Quest
                    </h1>
                    {shouldShowBingoUi && activeCategory && (
                        <div className="mb-6 rounded-3xl bg-white/90 backdrop-blur-sm p-5 text-center shadow-xl border-2" style={{borderColor: activeCategory.color, minHeight: '140px'}}>
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl shadow-lg" style={{backgroundColor: activeCategory.color}}>
                                    {activeCategory.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{color: activeCategory.color}}>Bingo Challenge</p>
                                    <p className="text-lg font-bold text-gray-900">{activeCategory.label}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 min-h-[40px]">{activeCategory.description}</p>
                        </div>
                    )}
                    <SpinningRecord player={player} />
                    <div className="flex items-center mb-4">
                        <input type="checkbox"  id="randomStart" name="randomStart"  checked={randomStart} onChange={(event) => setRandomStart(event.target.checked)} className="w-4 h-4 rounded" />
                        <label htmlFor="randomStart" className="ms-2 text-sm font-medium"> Random start between 0 and 60s</label>
                    </div>
                    <div className="mb-8">
                        <ProgressBar/>
                    </div>
                    <div className="flex justify-around gap-x-6">
                        <RewindButton player={player}/>
                        <ForwardButton player={player} amount={10}/>
                    </div>
                    <div className="mt-16 flex w-full">
                        <button
                            className="w-full rounded-md bg-white bg-opacity-30 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-opacity-60"
                            onClick={() => goToNext()}
                        >
                            Scan Next Card
                        </button>
                    </div>
                    {showTriggeredTimeoutControls && (<>
                        <div>
                            <TriggeredTimeout
                                onTimeout={handleTriggeredTimeoutTriggered}
                                enabledByDefault={triggeredTimeoutEnabledByDefault}
                                setEnabledByDefault={setTriggeredTimeoutEnabledByDefault}
                                targetSeconds={triggeredTimeoutTargetSeconds}
                                setTargetSeconds={setTriggeredTimeoutTargetSeconds}
                                soundEnabled={triggeredTimeoutSoundEnabled}
                                setSoundEnabled={setTriggeredTimeoutSoundEnabled}
                            />
                        </div>
                    </>)}
                </div>
                <div className="mb-8 w-full text-center">
                    <button
                        onClick={() => setShowTriggeredTimeoutControls(!showTriggeredTimeoutControls)}
                    >
                        Toggle triggered timeout controls
                    </button>
                </div>
            </>)}
        </div>
    );
}
