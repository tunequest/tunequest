import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { bingoCategories, BingoCategory, defaultSelectedCategoryIds } from "@/data/bingoCategories";
import { defaultGameSettings, GameMode, persistGameSettings, readGameSettings } from "@/utils/gameSettings";

export default function Home() {
    const router = useRouter();
    const [mode, setMode] = useState<GameMode>(defaultGameSettings.mode);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(defaultGameSettings.selectedCategoryIds);

    useEffect(() => {
        const storedSettings = readGameSettings();
        setMode(storedSettings.mode);
        setSelectedCategoryIds(storedSettings.selectedCategoryIds);
    }, []);

    useEffect(() => {
        persistGameSettings({mode, selectedCategoryIds});
    }, [mode, selectedCategoryIds]);

    const groupedCategories = useMemo(() => {
        return [
            {side: "A", title: "Side A (Beginner)", items: bingoCategories.filter(category => category.side === "A")},
            {side: "B", title: "Side B (Advanced)", items: bingoCategories.filter(category => category.side === "B")},
        ];
    }, []);

    const isBingoMode = mode === "bingo";
    const isStartDisabled = isBingoMode && selectedCategoryIds.length !== 5;

    const handleToggleCategory = (category: BingoCategory) => {
        setSelectedCategoryIds((prev: string[]) => {
            if (prev.includes(category.id)) {
                return prev.filter((id: string) => id !== category.id);
            }
            // Only allow selecting up to 5 categories
            if (prev.length >= 5) {
                return prev;
            }
            return [...prev, category.id];
        });
    };

    const handleReset = () => {
        setSelectedCategoryIds(defaultSelectedCategoryIds);
    };

    const handleClearAll = () => {
        setSelectedCategoryIds([]);
    };

    const handleStartGame = () => {
        persistGameSettings({mode, selectedCategoryIds});
        void router.push("/api/login");
    };

    const handleModeChange = (targetMode: GameMode) => {
        setMode(targetMode);
    };

    return (
        <>
            <Head>
                <title>TuneQuest</title>
            </Head>

            <div className="pointer-events-none fixed inset-x-0 bottom-0 sm:px-6 sm:pb-5 lg:px-8">
                <div
                    className="pointer-events-auto flex items-center justify-between gap-x-6 bg-blue-50 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                    <div className="text-sm leading-6 text-blue-700 flex space-x-2">
                        <div className="text-blue-400">
                            <strong className="font-semibold">Important</strong>
                            <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
                                <circle cx={1} cy={1} r={1}/>
                            </svg>
                            <span>
                                Due to constrains in the Spotify API this only works with a Spotify Premium Account.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gradient-to-t from-purple-200 to-pink-200 pb-20">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                            <span className="text-indigo-500">Tune</span>Quest
                        </h1>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Build your own music game.
                        </h2>
                        <p className="mx-auto mt-12 max-w-2xl text-lg leading-8 text-gray-600">
                            TuneQuest is inspired by the popular game Hitster.
                            With TuneQuest, you can create your own version of the original game with tracks tailored to
                            your music taste.
                            Do you want to create a version of the game with only metal tracks? We&lsquo;ve got you
                            covered!
                            Want to guess the years of movie soundtracks? Say no more.
                            Use our card generator to create a printable template for your Spotify playlist.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-4xl space-y-8">
                        <section className="rounded-3xl bg-white/70 p-6 shadow-xl shadow-indigo-200/50">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-left">
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Game Mode</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-2">Choose between Regular and Bingo</h3>
                                </div>
                                <div className="flex rounded-full bg-indigo-100 p-1 text-sm font-semibold">
                                    <button
                                        className={`rounded-full px-4 py-2 transition ${mode === "regular" ? "bg-white text-indigo-600 shadow" : "text-indigo-600/70"}`}
                                        onClick={() => handleModeChange("regular")}
                                        type="button"
                                    >
                                        Regular
                                    </button>
                                    <button
                                        className={`rounded-full px-4 py-2 transition ${mode === "bingo" ? "bg-white text-indigo-600 shadow" : "text-indigo-600/70"}`}
                                        onClick={() => handleModeChange("bingo")}
                                        type="button"
                                    >
                                        Bingo
                                    </button>
                                </div>
                            </div>
                            {isBingoMode && (
                                <p className="mt-4 text-sm text-gray-600">
                                    Bingo mode adds random challenges to each round before you scan. Enable the categories
                                    you want to play with and spin the wheel later.
                                </p>
                            )}
                        </section>

                        {isBingoMode && (
                            <section className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-indigo-200/60">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Categories</p>
                                        <h3 className="text-2xl font-bold text-gray-900 mt-2">Which challenges should go on the Bingo wheel?</h3>
                                    </div>
                                    <div className="flex gap-3 text-sm font-semibold">
                                        <button
                                            className="rounded-full border border-indigo-200 px-4 py-2 text-indigo-600 hover:bg-indigo-50"
                                            onClick={handleReset}
                                            type="button"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            className="rounded-full border border-indigo-200 px-4 py-2 text-indigo-600 hover:bg-indigo-50"
                                            onClick={handleClearAll}
                                            type="button"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-6 grid gap-6">
                                    {groupedCategories.map(group => (
                                        <div key={group.side}>
                                            <p className="text-base font-semibold text-gray-800">{group.title}</p>
                                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                                {group.items.map(category => {
                                                    const isChecked = selectedCategoryIds.includes(category.id);
                                                    return (
                                                        <label
                                                            key={category.id}
                                                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${isChecked ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white/60"}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                checked={isChecked}
                                                                onChange={() => handleToggleCategory(category)}
                                                            />
                                                            <span>
                                                                <span className="block text-sm font-semibold text-gray-900">{category.label}</span>
                                                                <span className="mt-1 block text-sm text-gray-600">{category.description}</span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    {selectedCategoryIds.length === 0 && (
                                        <p className="text-sm font-semibold text-rose-600">
                                            Select exactly 5 categories to start Bingo mode.
                                        </p>
                                    )}
                                    {selectedCategoryIds.length > 0 && selectedCategoryIds.length < 5 && (
                                        <p className="text-sm font-semibold text-amber-600">
                                            {5 - selectedCategoryIds.length} more {5 - selectedCategoryIds.length === 1 ? 'category' : 'categories'} needed (5 total required).
                                        </p>
                                    )}
                                    {selectedCategoryIds.length === 5 && (
                                        <p className="text-sm font-semibold text-green-600">
                                            ✓ 5 categories selected - ready to play!
                                        </p>
                                    )}
                                </div>
                            </section>
                        )}

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center">
                            <button
                                className={`rounded-md px-6 py-3 text-sm font-semibold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isStartDisabled ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"}`}
                                onClick={handleStartGame}
                                type="button"
                                disabled={isStartDisabled}
                            >
                                Play the Game
                            </button>
                            <Link
                                href="/REPLACEME_CREATE_URL"
                                target="_blank"
                                className="text-sm font-semibold leading-6 text-gray-900"
                            >
                                Create Your Own Game <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
