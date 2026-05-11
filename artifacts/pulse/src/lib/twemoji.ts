/**
 * Converts an emoji string to its Twemoji CDN PNG URL.
 * Uses jsDelivr CDN — Twitter Twemoji (CC-BY 4.0).
 * Handles simple emoji, variation selectors, and ZWJ sequences.
 */
export function emojiToTwemojiUrl(emoji: string): string {
  const cps = [...emoji].map(c => c.codePointAt(0)!.toString(16));
  const hasZWJ = cps.includes("200d");
  // Keep all codepoints for ZWJ sequences; strip lone fe0f variation selector otherwise
  const filtered = hasZWJ ? cps : cps.filter(cp => cp !== "fe0f");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${filtered.join("-")}.png`;
}

/**
 * Local PNG overrides — custom AI-generated or hand-crafted images
 * that take priority over Twemoji CDN for specific gift names.
 */
export const GIFT_LOCAL_PNG: Record<string, string> = {
  // AI-generated (transparent background)
  "Сердечко":           "/gifts/gen/heart.png",
  "Звёздочка":          "/gifts/gen/star.png",
  "Мыльный пузырь":     "/gifts/gen/bubble.png",
  "Конфета":            "/gifts/gen/candy.png",
  "Клубника":           "/gifts/gen/strawberry.png",
  "Леденец":            "/gifts/gen/lollipop.png",
  "Ромашка":            "/gifts/gen/daisy.png",
  "Цветок сакуры":      "/gifts/gen/sakura.png",
  "Пончик":             "/gifts/gen/donut.png",
  "Мороженое":          "/gifts/gen/icecream.png",
  // Existing hand-crafted PNGs
  "Рыбка":              "/gifts/fish.png",
  "Подсолнух":          "/gifts/sunflower.png",
  "Чашка кофе":         "/gifts/coffee.png",
  "Луна":               "/gifts/moon.png",
  "Четырёхлистник":     "/gifts/clover.png",
  "Бабочка":            "/gifts/butterfly.png",
  "Котёнок":            "/gifts/kitten.png",
  "Воздушный шар":      "/gifts/balloon.png",
  "Ретро-телефон":      "/gifts/retro-phone.png",
  "Пицца":              "/gifts/pizza.png",
  "Медвежонок":         "/gifts/teddy-bear.png",
  "Торт":               "/gifts/birthday-cake.png",
  "Игровая приставка":  "/gifts/gaming-console.png",
  "Корона":             "/gifts/crown.png",
  "Красная роза":       "/gifts/rose-in-glass.png",
  "Бриллиант":          "/gifts/diamond-heart.png",
  "Золотая монета":     "/gifts/gold-coin.png",
  "Морская звезда":     "/gifts/star-42.png",
  "Горящее сердце":     "/gifts/rose-in-glass.png",
  "Волшебство":         "/gifts/magic-crystal.png",
  "Кристалл":           "/gifts/magic-crystal.png",
  "Магический гриб":    "/gifts/magic-crystal.png",
  "Сапфировый кулон":   "/gifts/magic-crystal.png",
  "Хрустальное сердце": "/gifts/diamond-heart.png",
  "Золотая рыбка":      "/gifts/fish.png",
  "Пульс":              "/gifts/confetti-box.png",
  "Легендарная звезда": "/gifts/star-42.png",
  "Звёздная колесница": "/gifts/star-small.png",
  "Корона Prime":       "/gifts/crown.png",
  "Пульс Сердца":       "/gifts/confetti-box.png",
  "Звезда Prime":       "/gifts/star-42.png",
  "Единый трон":        "/gifts/crown.png",
};
