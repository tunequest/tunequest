"use client";

import React from "react";
import { usePlaybackState } from "react-spotify-web-playback-sdk";

export function SpinningRecord({ player }: { player: Spotify.Player }) {
    const playbackState = usePlaybackState(true, 100);
    const isPlaying = playbackState && !playbackState.paused;

    const handleClick = () => {
        if (playbackState?.paused) {
            player.resume();
        } else {
            player.pause();
        }
    };

    return (
        <>
        <button
            onClick={handleClick}
            className="relative w-40 h-40 mx-auto mb-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
            aria-label={playbackState?.paused ? 'Play' : 'Pause'}
        >
            {/* Glow effect to indicate it's clickable */}
            <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 blur-lg" />
            
            {/* Outer vinyl record */}
            <div
                className={`absolute inset-0 rounded-full bg-gradient-to-b from-gray-800 to-black shadow-2xl ${
                    isPlaying ? "animate-spin" : ""
                }`}
                style={{
                    animationDuration: isPlaying ? "3s" : "0s",
                    animationDirection: "reverse",
                }}
            >
                {/* Record grooves */}
                <div className="absolute inset-2 rounded-full border-4 border-gray-700" />
                <div className="absolute inset-4 rounded-full border-2 border-gray-700" />
                <div className="absolute inset-6 rounded-full border border-gray-700" />

                {/* Center label */}
                <div className="absolute inset-12 rounded-full bg-gradient-to-b from-purple-600 to-purple-800 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                        <div className="text-white font-bold text-sm">TUNE</div>
                        <div className="text-purple-300 font-bold text-xs">QUEST</div>
                    </div>
                </div>

                {/* Shine effect when playing */}
                {isPlaying && (
                    <div className="absolute inset-0 rounded-full opacity-20 bg-gradient-to-tr from-transparent to-white animate-pulse" />
                )}
            </div>
        </button>
        
        {/* Tap to play overlay - positioned absolutely within container */}
        {!isPlaying && (
            <div className="absolute inset-0 flex items-end justify-center w-40 h-40 mx-auto pb-4">
                <div className="text-center text-xs font-semibold text-white bg-black bg-opacity-40 px-3 py-1 rounded-full animate-pulse">
                    TAP TO PLAY
                </div>
            </div>
        )}
        </>
    );
}
