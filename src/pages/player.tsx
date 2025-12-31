import { useCallback } from "react";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import GameController from "@/components/GameController";
import Head from "next/head";

type Props = { token: TokenObject };

const Player: React.VFC<Props> = ({token}) => {

    const getOAuthToken: Spotify.PlayerInit["getOAuthToken"] = useCallback(
        callback => callback(token.access_token),
        [token.access_token],
    );

    return (
        <>
            <Head>
                <title>TuneQuest</title>
            </Head>
            <WebPlaybackSDK
                initialDeviceName="TuneQuest"
                getOAuthToken={getOAuthToken}
                connectOnInitialized={true}
                initialVolume={1}>
                <GameController token={token.access_token}/>
            </WebPlaybackSDK>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
                                                                        query,
                                                                        req,
                                                                    }) => {
    const stateFromCookies = nookies.get({req}).state;
    const stateFromRequest = query.state;

    if (
        typeof stateFromCookies === "string" &&
        typeof stateFromRequest === "string" &&
        stateFromCookies === stateFromRequest &&
        typeof query.code === "string"
    ) {
        const redirectUri = process.env.SPOTIFY_REDIRECT_URI || "";
        const clientId = process.env.SPOTIFY_CLIENT_ID || "";
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
        const tokenUrl = process.env.SPOTIFY_API_TOKEN_URL || "";

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: query.code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        });

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        }).then(res => res.json());

        if (isTokenObject(response)) {
            return {
                props: {token: response},
            };
        } else {
            console.error('Got non token object as response from spotify', response);
        }
    }

    return {
        redirect: {
            destination: "/",
            permanent: false,
        },
    };
};

export default Player;

type TokenObject = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
};

function isTokenObject(value: any): value is TokenObject {
    return (
        value != undefined &&
        typeof value.access_token === "string" &&
        typeof value.token_type === "string" &&
        typeof value.scope === "string" &&
        typeof value.expires_in === "number" &&
        typeof value.refresh_token === "string"
    );
}
