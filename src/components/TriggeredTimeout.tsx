import React, { useState, useEffect, useRef } from 'react';
import { PauseIcon } from '@/components/PauseIcon';
import { PlayIcon } from '@/components/PlayIcon';

type Status = 'disabled' | 'pending' | 'triggered'

const getButtonText = (status: Status, seconds: number): string => {
    switch (status) {
        case "disabled": return `PRESS TO STOP AT ${seconds} SECONDS`;
        case "pending": return `STOPPING AT ${seconds} SECONDS`;
        case "triggered": return "TIMEOUT REACHED";
        default: return "error getting button text";
    }
};

type TriggeredTimeoutProps = {
    enabledByDefault: boolean;
    setEnabledByDefault: (value: boolean) => void;
    onTimeout: () => void;
    targetSeconds: number;
    setTargetSeconds: (value: number) => void;
    soundEnabled: boolean,
    setSoundEnabled: (value: boolean) => void;
};

const TriggeredTimeout: React.FC<TriggeredTimeoutProps> = ({ onTimeout, enabledByDefault, setEnabledByDefault, targetSeconds, setTargetSeconds, soundEnabled, setSoundEnabled }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [status, setStatus] = useState<Status>(enabledByDefault ? "pending" : "disabled");
    const [showHelp, setShowHelp] = useState<boolean>(false);

    // stores the interval id so we can stop the timer from anywhere
    const intervalIdRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // start interval after loading component
    useEffect(() => {
        intervalIdRef.current = window.setInterval(() => {
            setElapsedSeconds(prevSeconds => prevSeconds + 1);
        }, 1000);

        // clean up interval on component unmount
        return () => {
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
            }
        }
    }, []);

    useEffect(() => {

        const playTriggerSound = () => {
            if (audioRef.current && soundEnabled) {
                audioRef.current.play();
            }
        };

        // fire triggered timeout if the elapsed time is greater than the target seconds
        if (status == "pending" && elapsedSeconds >= targetSeconds) {
            playTriggerSound();
            setStatus("triggered");
            if (intervalIdRef.current !== null) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            // propagate to outside
            onTimeout();
        }
    }, [elapsedSeconds, onTimeout, status, targetSeconds, soundEnabled]);

    return (
        <div className="mt-16">
            <div className="flex justify-between">
                <div>Elapsed time: {elapsedSeconds} seconds</div>
                <div className="text-right text-blue-600 underline hover:no-underline"
                     onClick={() => setShowHelp(true)}>
                     What is this?
                </div>
            </div>
            <button
                type="button"
                className={`group relative flex h-24 w-full flex-shrink-0 items-center justify-center rounded-full text-white text-3xl mt-4
                    ${status != 'disabled' ? 'bg-red-700 focus:ring-red-700' : 'bg-slate-700 focus:ring-slate-700'} 
                    focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={() => setStatus((status) => (status === "disabled" ? "pending" : "disabled"))}
            >
            {getButtonText(status, targetSeconds)}
            </button>
            <div>
                <input className="flex w-full mt-4"
                    type="range"
                    min="1"
                    max="99"
                    value={targetSeconds}
                    onChange={(event) => {setTargetSeconds(Number(event.target.value))}}
                />
            </div>
            <audio ref={audioRef} src="/air-horn.mp3" />
            <div className="flex items-center mt-4">
                <input
                    type="checkbox"
                    id="enabledByDefault"
                    name="enabledByDefault"
                    checked={enabledByDefault}
                    className="h-4 w-4 rounded-md border-0 px-3.5 py-2"
                    onChange={(event) => {setEnabledByDefault(event.target.checked)}}
                />
                <label htmlFor="enabledByDefault" className="ml-2">
                    Timeout enabled by default
                </label>
            </div>
            <div className="flex items-center mt-4">
                <input
                    type="checkbox"
                    id="soundEnabled"
                    name="soundEnabled"
                    checked={soundEnabled}
                    className="h-4 w-4 rounded-md border-0 px-3.5 py-2"
                    onChange={(event) => {setSoundEnabled(event.target.checked)}}
                />
                <label htmlFor="soundEnabled" className="ml-2">
                    Play sound when timer expires
                </label>
            </div>
            {showHelp && (
            <div
                className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center flex-col"
                onClick={() => setShowHelp(false)}
            >
                <div
                    className="bg-white p-4 rounded shadow-lg w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-full overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-lg font-bold">About Triggered Timeouts</h2>
                    <p>
                        Do your friends keep waiting for the chorus to determine the song title, even if it takes forever?<br />
                        Do your <span className="font-bold"><span className="text-indigo-500">Tune</span>Quest tokens</span> pile up because you are just too good at <span className="font-bold"><span className="text-indigo-500">Tune</span>Quest</span>?<br />
                        With triggered timeouts, you can automatically stop playback after a set time!
                        Clicking the button will start or stop the timer, depending on its current state.<br />
                        This enables fun variants of the classic <span className="font-bold"><span className="text-indigo-500">Tune</span>Quest</span> experience:
                    </p>
                    <h3 className="mt-2">
                        <span className="font-bold">Variant 1:</span> &quot;The 30 second rule&quot;
                    </h3>
                    <p>
                        Enable the &quot;Timeout enabled by default&quot; option and set the timer to a value as you see fit. The default is 30 seconds.
                        Playback will stop after the timer expires. Usually, panning is not allowed in this variant.
                    </p>
                    <h3 className="mt-2">
                        <span className="font-bold">Variant 2:</span> Pay to continue
                    </h3>
                    <p>
                        Same as Variant 1, but the active team is allowed to pay one <span className="font-bold"><span className="text-indigo-500">Tune</span>Quest token</span> to switch the timer off so they can continue listening.
                    </p>
                    <h3 className="mt-2">
                        <span className="font-bold">Variant 3:</span> Pay to enforce
                    </h3>
                    <p>
                        <span className="font-bold">Disable</span> the &quot;Timeout enabled by default&quot; option and set the timer to a value as you see fit. The <span className="font-bold">enemy team</span> can spend a <span className="font-bold"><span className="text-indigo-500">Tune</span>Quest token</span> to switch the timer <span className="font-bold">on</span> and thus force playback for the active team after the indicated time. Of course, the amount of <span className="font-bold"><span className="text-indigo-500">Tune</span>Quest tokens</span> that have to be spent can be set to two or more if you feel like it.
                    </p>
                    <button
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                        onClick={() => setShowHelp(false)}
                    >
                        Close
                    </button>
                </div>
            </div>)}
        </div>
    );
};

export default TriggeredTimeout;
