const BANNED = [
  // Russian
  "хуй","хуе","хуя","хую","хуев","хуйн","пизд","пизда","ебат","ебл","еблан",
  "блядь","блядин","шлюха","шлюхи","сука","суки","мудак","мудил","ублюдок",
  "долбоёб","долбоеб","залупа","залупин","ёбан","ёбаный","пиздец","пиздит",
  "пиздато","манда","манды","ёбнут","ёб твою","нахуй","нахуя","похуй","похуя",
  "заебал","заебись","ёбана","пиздануть","хуесос","мразь","пидор","пидар","гандон",
  // English
  "fuck","fck","shit","bitch","asshole","cunt","nigger","nigga","faggot","fag",
  "retard","whore","slut","bastard","motherfucker","motherfuck","dickhead",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[ё]/g, "е");
  return BANNED.some(w => lower.includes(w.replace(/[ё]/g, "е")));
}

export function censorText(text: string): string {
  let result = text;
  for (const w of BANNED) {
    const normalized = w.replace(/[ё]/g, "е");
    const re = new RegExp(normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    result = result.replace(re, match => match[0] + "*".repeat(match.length - 1));
  }
  return result;
}
