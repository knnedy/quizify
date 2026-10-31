import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { achievements, categories } from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

const categorySeed = [
  { slug: "geography", name: "Geography" },
  { slug: "science", name: "Science" },
  { slug: "history", name: "History" },
  { slug: "technology", name: "Technology" },
  { slug: "music", name: "Music" },
  { slug: "sports", name: "Sports" },
  { slug: "movies", name: "Movies" },
  { slug: "food", name: "Food" },
];

const achievementSeed: (typeof achievements.$inferInsert)[] = [
  {
    key: "first-steps",
    type: "QUIZZES_COMPLETED",
    threshold: 1,
    title: "First steps",
    description: "Complete your first quiz.",
    xpReward: 25,
  },
  {
    key: "getting-warm",
    type: "QUIZZES_COMPLETED",
    threshold: 10,
    title: "Getting warm",
    description: "Complete 10 quizzes.",
    xpReward: 50,
  },
  {
    key: "marathon",
    type: "QUIZZES_COMPLETED",
    threshold: 50,
    title: "Marathon",
    description: "Complete 50 quizzes.",
    xpReward: 250,
  },
  {
    key: "week-on-fire",
    type: "STREAK_DAYS",
    threshold: 7,
    title: "Week on fire",
    description: "Play on 7 days in a row.",
    xpReward: 100,
  },
  {
    key: "sharpshooter",
    type: "PERFECT_SCORES",
    threshold: 10,
    title: "Sharpshooter",
    description: "Get a perfect score on 10 quizzes.",
    xpReward: 150,
  },
  {
    key: "xp-hunter",
    type: "TOTAL_XP",
    threshold: 5000,
    title: "XP hunter",
    description: "Earn 5,000 XP in total.",
    xpReward: 300,
  },
  {
    key: "author",
    type: "QUIZZES_CREATED",
    threshold: 5,
    title: "Author",
    description: "Create 5 quizzes.",
    xpReward: 200,
  },
];

async function main() {
  for (const category of categorySeed) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: category.name },
      });
  }

  for (const achievement of achievementSeed) {
    await db
      .insert(achievements)
      .values(achievement)
      .onConflictDoUpdate({
        target: achievements.key,
        set: {
          type: achievement.type,
          threshold: achievement.threshold,
          title: achievement.title,
          description: achievement.description,
          xpReward: achievement.xpReward,
        },
      });
  }

  console.log(
    `Seeded ${categorySeed.length} categories and ${achievementSeed.length} achievements`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
