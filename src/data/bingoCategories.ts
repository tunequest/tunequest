export type BingoCategory = {
    id: string;
    label: string;
    description: string;
    side: "A" | "B";
    difficulty: "beginner" | "advanced";
    defaultSelected: boolean;
    color: string;
    icon: string;
};

export const bingoCategories: BingoCategory[] = [
    {
        id: "group-or-solo",
        label: "Group or Solo Artist",
        description: "Is it a band or a solo artist?",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
        color: "#10b981",
        icon: "👥",
    },
    {
        id: "before-or-after-2000",
        label: "Before or After 2000",
        description: "Was the song released before or after the millennium?",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
        color: "#3b82f6",
        icon: "📅",
    },
    {
        id: "year-plus-minus-four",
        label: "Year ±4",
        description: "Guess the release year (within +/- 4 years).",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
        color: "#8b5cf6",
        icon: "🎯",
    },
    {
        id: "decade-beginner",
        label: "Decade",
        description: "The decade of release.",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
        color: "#ec4899",
        icon: "📆",
    },
    {
        id: "year-plus-minus-two",
        label: "Year ±2",
        description: "Guess the release year (within +/- 2 years).",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
        color: "#f59e0b",
        icon: "🎲",
    },
    {
        id: "exact-title",
        label: "Exact Title",
        description: "The exact title of the song.",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
        color: "#ef4444",
        icon: "🎵",
    },
    {
        id: "exact-artist",
        label: "Artist Name",
        description: "The exact name of the artist.",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
        color: "#06b6d4",
        icon: "🎤",
    },
    {
        id: "exact-year",
        label: "Exact Year",
        description: "The exact release year.",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
        color: "#6366f1",
        icon: "📌",
    },
    {
        id: "year-plus-minus-three",
        label: "Year ±3",
        description: "Guess the release year (within +/- 3 years).",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
        color: "#f97316",
        icon: "🎯",
    },
];

export const defaultSelectedCategoryIds = bingoCategories
    .filter(category => category.defaultSelected)
    .map(category => category.id);
