export type Quote = {
  id: string;
  text: string;
  speaker: string;
  context: string;
  date: string;
  imageGradient: string;
  tags: string[];
};

export const QUOTES: Quote[] = [
  {
    id: "1",
    text: "The best way to predict the future is to create it.",
    speaker: "Peter Drucker",
    context: "Strategy meeting, Q1 kickoff",
    date: "Mar 28, 2026",
    imageGradient: "from-rose-300 via-pink-200 to-orange-200",
    tags: ["leadership", "inspiration"],
  },
  {
    id: "2",
    text: "Done is better than perfect.",
    speaker: "Sheryl Sandberg",
    context: "Design review with the team",
    date: "Mar 25, 2026",
    imageGradient: "from-amber-300 via-yellow-200 to-lime-200",
    tags: ["productivity", "work"],
  },
  {
    id: "3",
    text: "Clarity is the counterpart of deep feeling.",
    speaker: "Unknown",
    context: "Overheard at a gallery opening",
    date: "Mar 20, 2026",
    imageGradient: "from-sky-300 via-blue-200 to-indigo-200",
    tags: ["art", "creativity"],
  },
  {
    id: "4",
    text: "People don't buy what you do. They buy why you do it.",
    speaker: "Simon Sinek",
    context: "Podcast — Start With Why",
    date: "Mar 15, 2026",
    imageGradient: "from-violet-300 via-purple-200 to-pink-200",
    tags: ["business", "purpose"],
  },
  {
    id: "5",
    text: "You can't use up creativity. The more you use, the more you have.",
    speaker: "Maya Angelou",
    context: "Morning read — Letters to my daughter",
    date: "Mar 10, 2026",
    imageGradient: "from-teal-300 via-emerald-200 to-cyan-200",
    tags: ["creativity", "inspiration"],
  },
];

export const FILTER_OPTIONS = ["All", "Recent", "Saved", "Shared"] as const;
export type FilterOption = (typeof FILTER_OPTIONS)[number];
