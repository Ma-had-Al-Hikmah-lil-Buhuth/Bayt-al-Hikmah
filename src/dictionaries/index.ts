import type { Locale } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import("./en.json").then((m) => m.default),
  ar: () => import("./ar.json").then((m) => m.default),
  bn: () => import("./bn.json").then((m) => m.default),
  ur: () => import("./ur.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return loader();
};
