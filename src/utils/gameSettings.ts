import { bingoCategories, defaultSelectedCategoryIds } from "@/data/bingoCategories";

export type GameMode = "regular" | "bingo";

export type GameSettings = {
    mode: GameMode;
    selectedCategoryIds: string[];
};

const GAME_SETTINGS_KEY = "tunequestGameSettings";

export const defaultGameSettings: GameSettings = {
    mode: "regular",
    selectedCategoryIds: defaultSelectedCategoryIds,
};

export const readGameSettings = (): GameSettings => {
    if (typeof window === "undefined") {
        return defaultGameSettings;
    }

    try {
        const raw = window.localStorage.getItem(GAME_SETTINGS_KEY);
        if (!raw) {
            return defaultGameSettings;
        }

        const parsed = JSON.parse(raw) as Partial<GameSettings>;
        const mode: GameMode = parsed.mode === "bingo" ? "bingo" : "regular";
        const ids = Array.isArray(parsed.selectedCategoryIds) ? parsed.selectedCategoryIds : [];
        const validIds = ids.filter(id => bingoCategories.some(category => category.id === id));

        return {
            mode,
            selectedCategoryIds: validIds.length > 0 ? validIds : defaultSelectedCategoryIds,
        };
    } catch (error) {
        console.error("Failed to read game settings", error);
        return defaultGameSettings;
    }
};

export const persistGameSettings = (settings: GameSettings) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to persist game settings", error);
    }
};
