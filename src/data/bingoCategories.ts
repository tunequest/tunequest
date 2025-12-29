export type BingoCategory = {
    id: string;
    label: string;
    description: string;
    side: "A" | "B";
    difficulty: "beginner" | "advanced";
    defaultSelected: boolean;
};

export const bingoCategories: BingoCategory[] = [
    {
        id: "group-or-solo",
        label: "Group or Solo Artist",
        description: "Is it a band or a solo artist?",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
    },
    {
        id: "before-or-after-2000",
        label: "Before or After 2000",
        description: "Was the song released before or after the millennium?",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
    },
    {
        id: "year-plus-minus-four",
        label: "Year ±4",
        description: "Guess the release year (within +/- 4 years).",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
    },
    {
        id: "decade-beginner",
        label: "Decade",
        description: "The decade of release.",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
    },
    {
        id: "year-plus-minus-two",
        label: "Year ±2",
        description: "Guess the release year (within +/- 2 years).",
        side: "A",
        difficulty: "beginner",
        defaultSelected: true,
    },
    {
        id: "exact-title",
        label: "Exact Title",
        description: "The exact title of the song.",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
    },
    {
        id: "exact-artist",
        label: "Artist Name",
        description: "The exact name of the artist.",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
    },
    {
        id: "exact-year",
        label: "Exact Year",
        description: "The exact release year.",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
    },
    {
        id: "year-plus-minus-three",
        label: "Year ±3",
        description: "Guess the release year (within +/- 3 years).",
        side: "B",
        difficulty: "advanced",
        defaultSelected: true,
    },
];

export const defaultSelectedCategoryIds = bingoCategories
    .filter(category => category.defaultSelected)
    .map(category => category.id);

