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

function sliceLRAR(items: LRARItem[]): LRARItem[] {
  const index = Math.floor(Math.random() * (items.length - 1));
  let first = index;

  while (!items[first].id_string.endsWith("_1")) {
    first--;
  }

  let last = first + 1;
  while (last < items.length && !items[last].id_string.endsWith("_1")) {
    last++;
  }

  return items.slice(first, last);
}

function sliceRC(items: RCItem[]): AppQuestion[] {
  const index = Math.floor(Math.random() * (items.length - 1));
  let first = index;

  while (!items[first].context_id.endsWith("_1")) {
    first--;
  }

  const passages = items.slice(first, first + 4);
  return normalizeRC(passages);
}

function getTestQuestions(
  raw: LRARItem[] | RCItem[],
  testType: "LR" | "AR" | "RC"
): AppQuestion[] {
  if (testType === "RC") {
    return sliceRC(raw as RCItem[]);
  }

  return normalizeLRAR(sliceLRAR(raw as LRARItem[]));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function loadFullTestQuestions() {
  let passageTypes: TestType[] = ["LR", "LR", "RC", "LR"];

  // 50% chance of 2 RC passages
  if (Math.random() < 0.5) {
    passageTypes[0] = "RC";
  }

  passageTypes = shuffle(passageTypes);

  while (true) {
    const sections = passageTypes.map((t) => loadQuestions(t)[0]);
    if (sections.every((section) => section.length > 0)) {
      return sections;
    }
  }
}

export function loadQuestions(testType: TestType): AppQuestion[][] {
  switch (testType) {
    case "LR":
      return [getTestQuestions(lrData as LRARItem[], "LR")];
    case "AR":
      return [getTestQuestions(arData as LRARItem[], "AR")];
    case "RC":
      return [getTestQuestions(rcData as RCItem[], "RC")];
    case "FULL":
      return loadFullTestQuestions();
  }
}
