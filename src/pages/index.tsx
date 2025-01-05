import Link from "next/link";
import Head from "next/head";

export default function Home() {
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

            <div className="h-screen overflow-scroll bg-gradient-to-t from-purple-200 to-pink-200 pb-12">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
                            <span className="text-indigo-500">Tune</span>Quest
                        </h1>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Build your own music game.
                        </h2>
                        <p className="mx-auto mt-12 max-w-xl text-lg leading-8 text-gray-600">
                            TuneQuest is inspired by the popular game Hitster.
                            With TuneQuest, you can create your own version of the original game with tracks tailored to
                            your music taste.
                            Do you want to create a version of the game with only metal tracks? We&lsquo;ve got you
                            covered!
                            Want to guess the years of movie soundtracks? Say no more.
                            Use our card generator to create a printable template for your Spotify playlist.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/api/login"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Play the Game
                            </Link>
                            <Link href="/REPLACEME_CREATE_URL" target="_blank" className="text-sm font-semibold leading-6 text-gray-900">
                                Create Your Own Game <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
