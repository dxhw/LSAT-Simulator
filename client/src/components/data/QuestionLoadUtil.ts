import lrData from "../../LSAT_DATA/all_lr.json";
import rcData from "../../LSAT_DATA/all_rc_paragraph_split.json";
import arData from "../../LSAT_DATA/all_ar.json";

export type TestType = "LR" | "RC" | "AR" | "FULL";

export interface AppQuestion {
  context: string;
  question: string;
  answers: string[];
  label: number;
  id_string: string;
}

interface LRARItem {
  context: string;
  question: string;
  answers: string[];
  label: number;
  id_string: string;
}

interface RCItem {
  context_id: string;
  context: string;
  questions: {
    question: string;
    answers: string[];
    label: number;
    id_string: string;
  }[];
}

// Hash function to turn a string seed into a starting number
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

// Mulberry32: A simple, fast PRNG
function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Helper to get a random function (either seeded or native Math.random)
function getRng(seed?: string) {
  if (!seed || seed.trim() === "") {
    return Math.random;
  }
  const seedFunc = xmur3(seed);
  return mulberry32(seedFunc());
}

// --- END HELPERS ---

function normalizeRC(items: RCItem[]): AppQuestion[] {
  const out: AppQuestion[] = [];

  for (const passage of items) {
    for (const q of passage.questions) {
      out.push({
        context: passage.context,
        question: q.question,
        answers: q.answers,
        label: q.label,
        id_string: q.id_string,
      });
    }
  }

  return out;
}

function normalizeLRAR(items: LRARItem[]): AppQuestion[] {
  return items;
}

// Updated to accept RNG
function sliceLRAR(items: LRARItem[], rng: () => number): LRARItem[] {
  // Use rng() instead of Math.random()
  const index = Math.floor(rng() * (items.length - 1));
  let first = index;

  // Safety check to ensure we don't go out of bounds while searching backwards
  while (first > 0 && !items[first].id_string.endsWith("_1")) {
    first--;
  }

  let last = first + 1;
  while (last < items.length && !items[last].id_string.endsWith("_1")) {
    last++;
  }

  return items.slice(first, last);
}

function sliceRC(items: RCItem[], rng: () => number): AppQuestion[] {
  const index = Math.floor(rng() * (items.length - 1));
  let first = index;

  while (first > 0 && !items[first].context_id.endsWith("_1")) {
    first--;
  }

  // Ensure we have enough items for a full RC set
  const end = Math.min(first + 4, items.length);
  const passages = items.slice(first, end);
  return normalizeRC(passages);
}

function getTestQuestions(
  raw: LRARItem[] | RCItem[],
  testType: "LR" | "AR" | "RC",
  rng: () => number,
): AppQuestion[] {
  if (testType === "RC") {
    return sliceRC(raw as RCItem[], rng);
  }

  return normalizeLRAR(sliceLRAR(raw as LRARItem[], rng));
}

// shuffling is deterministic with seed
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadFullTestQuestions(seed: string, rng: () => number) {
  let passageTypes: TestType[] = ["LR", "LR", "RC", "LR"];

  // 50% chance of 2 RC passages
  if (Math.random() < 0.5) {
    passageTypes[0] = "RC";
  }

  passageTypes = shuffle(passageTypes, rng);

  const sections = passageTypes.map((t, index) => {
    // Create a sub-seed for this specific section (e.g. "myseed-0", "myseed-1")
    const sectionSeed = seed ? `${seed}-${index}` : "";
    return loadQuestions(t, sectionSeed)[0];
  });

  return sections;
}

export function loadQuestions(
  testType: TestType,
  seed: string,
): AppQuestion[][] {
  const rng = getRng(seed);
  switch (testType) {
    case "LR":
      return [getTestQuestions(lrData as LRARItem[], "LR", rng)];
    case "AR":
      return [getTestQuestions(arData as LRARItem[], "AR", rng)];
    case "RC":
      return [getTestQuestions(rcData as RCItem[], "RC", rng)];
    case "FULL":
      return loadFullTestQuestions(seed, rng);
  }
}
