/**
 * 30 MCU trivia facts — rotated daily (index = dayOfYear % 30).
 * Each fact has a category for display color coding.
 */
export const TRIVIA = [
  {
    id: 1,
    fact: "Robert Downey Jr. improvised \"I am Iron Man\" at the end of the first Iron Man film — it wasn't in the script, but director Jon Favreau kept it.",
    category: 'Behind the Scenes',
  },
  {
    id: 2,
    fact: "The Infinity Gauntlet first appeared in a post-credits scene in the first Thor film (2011), four years before Thanos was formally introduced as a villain.",
    category: 'Easter Egg',
  },
  {
    id: 3,
    fact: "Stan Lee appeared in 37 MCU projects total before his passing in 2018, starting with Iron Man (2008).",
    category: 'Legacy',
  },
  {
    id: 4,
    fact: "Chris Evans almost turned down the role of Captain America four times before finally accepting. He was worried about the pressure of a 6-picture deal.",
    category: 'Casting',
  },
  {
    id: 5,
    fact: "The Avengers (2012) was the first MCU film to cross $1 billion at the worldwide box office — it eventually grossed $1.52 billion.",
    category: 'Records',
  },
  {
    id: 6,
    fact: "Avengers: Endgame (2019) surpassed Avatar to become the highest-grossing film of all time with $2.798 billion worldwide.",
    category: 'Records',
  },
  {
    id: 7,
    fact: "The Hulk's purple shorts are a nod to the comics — in nearly every appearance, Bruce Banner's pants miraculously survive the transformation.",
    category: 'Comics Nod',
  },
  {
    id: 8,
    fact: "Samuel L. Jackson's Nick Fury is based on the Ultimate Marvel version of the character, who was explicitly designed to look like Jackson — and he discovered this in a comic store.",
    category: 'Comics Nod',
  },
  {
    id: 9,
    fact: "Tom Hiddleston originally auditioned for Thor before being cast as Loki. He then bulked up 20 lbs of muscle for the role.",
    category: 'Casting',
  },
  {
    id: 10,
    fact: "The shawarma scene in The Avengers was filmed the day after the premiere — Robert Downey Jr. wore prosthetics to hide his beard he'd grown for Iron Man 3.",
    category: 'Behind the Scenes',
  },
  {
    id: 11,
    fact: "Black Panther (2018) was the first superhero film nominated for Best Picture at the Academy Awards.",
    category: 'Records',
  },
  {
    id: 12,
    fact: "Guardians of the Galaxy was considered a huge risk by Marvel — with an obscure team and a talking raccoon — but it grossed $774 million worldwide.",
    category: 'Fun Fact',
  },
  {
    id: 13,
    fact: "The 'snap' in Infinity War left the cast genuinely emotional on set. Many actors didn't know who would survive until they read the script.",
    category: 'Behind the Scenes',
  },
  {
    id: 14,
    fact: "Tony Stark's famous line 'I am Iron Man' appears in the first and last films of his MCU arc — Iron Man (2008) and Endgame (2019).",
    category: 'Callbacks',
  },
  {
    id: 15,
    fact: "Chadwick Boseman filmed Black Panther, Avengers: Infinity War, and Avengers: Endgame while privately battling colon cancer — a fact unknown to most of his co-stars.",
    category: 'Legacy',
  },
  {
    id: 16,
    fact: "Spider-Man: No Way Home features actors from three different Spider-Man film series — the first time this had been done in superhero cinema.",
    category: 'Records',
  },
  {
    id: 17,
    fact: "The mind stone, space stone, reality stone, power stone, time stone, and soul stone — all six Infinity Stones were introduced across different Phase 1–3 movies before Infinity War.",
    category: 'Lore',
  },
  {
    id: 18,
    fact: "WandaVision references classic American sitcoms from every decade from the 1950s to the 2000s — each episode's visual style is based on a real show of that era.",
    category: 'Easter Egg',
  },
  {
    id: 19,
    fact: "Chris Hemsworth's children appear in Avengers: Endgame as Korg's children during Thor's time in New Asgard.",
    category: 'Easter Egg',
  },
  {
    id: 20,
    fact: "The MCU has earned over $30 billion at the worldwide box office — making it the highest-grossing film franchise in history.",
    category: 'Records',
  },
  {
    id: 21,
    fact: "Loki was originally meant to be a one-film villain, but Tom Hiddleston's performance was so beloved that the character became one of the MCU's most recurring figures.",
    category: 'Casting',
  },
  {
    id: 22,
    fact: "The original six Avengers all had their own character arcs that concluded in Endgame — Iron Man died, Cap went back in time, Natasha sacrificed herself, Thor abdicated, Bruce merged with Hulk, and Clint returned to his family.",
    category: 'Lore',
  },
  {
    id: 23,
    fact: "Groot's entire vocabulary is 'I am Groot' — but Vin Diesel recorded the line in multiple languages for international versions of the film, including Russian and Mandarin.",
    category: 'Behind the Scenes',
  },
  {
    id: 24,
    fact: "The word 'Avengers' was first spoken in the MCU by Nick Fury in a deleted scene from Iron Man — not in The Avengers itself.",
    category: 'Lore',
  },
  {
    id: 25,
    fact: "Doctor Strange's opening car crash was choreographed to happen in exactly one take — the actual crash rig cost over $1 million to build.",
    category: 'Behind the Scenes',
  },
  {
    id: 26,
    fact: "Shang-Chi and the Legend of the Ten Rings retcons the fake Mandarin from Iron Man 3 — the real Mandarin is Wenwu, who has had the rings for 1,000 years.",
    category: 'Lore',
  },
  {
    id: 27,
    fact: "Deadpool & Wolverine is the first R-rated film in the main MCU continuity — previous R-rated Marvel films like Logan existed outside the MCU.",
    category: 'Records',
  },
  {
    id: 28,
    fact: "In Captain America: Civil War, Spider-Man's eyes in his suit are designed to squint — a mechanism built into the costume so Tom Holland could actually convey emotions through the mask.",
    category: 'Behind the Scenes',
  },
  {
    id: 29,
    fact: "Agatha All Along's musical theme 'Agatha All Along' from WandaVision won a Grammy Award for Best Song Written for Visual Media in 2022.",
    category: 'Legacy',
  },
  {
    id: 30,
    fact: "The MCU chronological watch order is about 554 hours of content — watching 2 hours per day, it would take nearly a full year to complete everything.",
    category: 'Fun Fact',
  },
];

/** Returns the trivia fact for today (deterministic, changes daily) */
export function getDailyTrivia() {
  const start = new Date(2024, 0, 1);
  const today = new Date();
  const dayIndex = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return TRIVIA[dayIndex % TRIVIA.length];
}
