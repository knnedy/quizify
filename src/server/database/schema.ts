import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Enums
export const userRole = pgEnum("user_role", ["USER", "MODERATOR", "ADMIN"]);

export const difficulty = pgEnum("difficulty", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const quizStatus = pgEnum("quiz_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const quizVisibility = pgEnum("quiz_visibility", [
  "PUBLIC",
  "UNLISTED",
  "PRIVATE",
]);

export const questionType = pgEnum("question_type", [
  "SINGLE",
  "MULTIPLE",
  "TRUE_FALSE",
]);

export const attemptStatus = pgEnum("attempt_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
  "TIMED_OUT",
]);

export const xpSource = pgEnum("xp_source", [
  "QUIZ_COMPLETED",
  "STREAK_BONUS",
  "ACHIEVEMENT",
  "DAILY_CHALLENGE",
]);

export const achievementType = pgEnum("achievement_type", [
  "QUIZZES_COMPLETED",
  "QUIZZES_CREATED",
  "STREAK_DAYS",
  "PERFECT_SCORES",
  "TOTAL_XP",
]);

// Auth tables
export const users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: userRole("role").notNull().default("USER"),
  timezone: text("timezone").notNull().default("UTC"),
  socialLinks: json("social_links")
    .$type<
      Array<{
        platform: string;
        url: string;
      }>
    >()
    .default([]),
  totalXp: integer("total_xp").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable("session", {
  id: serial("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const accounts = pgTable("account", {
  id: serial("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Categories and tags
export const categories = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
});

export const tags = pgTable("tag", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// Quizzes
// Quizzes
export const quizzes = pgTable(
  "quiz",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    coverImage: text("cover_image"),
    difficulty: difficulty("difficulty").notNull(),
    status: quizStatus("status").notNull().default("DRAFT"),
    visibility: quizVisibility("visibility").notNull().default("PUBLIC"),
    timeLimitSeconds: integer("time_limit_seconds"),
    shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
    shuffleOptions: boolean("shuffle_options").notNull().default(false),
    maxAttempts: integer("max_attempts"),
    publishedAt: timestamp("published_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    check(
      "quiz_time_limit_positive",
      sql`${t.timeLimitSeconds} is null or ${t.timeLimitSeconds} > 0`,
    ),
    check(
      "quiz_max_attempts_positive",
      sql`${t.maxAttempts} is null or ${t.maxAttempts} > 0`,
    ),
    index("quiz_browse_idx").on(t.status, t.visibility, t.createdAt),
    index("quiz_category_idx").on(t.categoryId),
    index("quiz_user_idx").on(t.userId),
  ],
);

export const quizTags = pgTable(
  "quiz_tag",
  {
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.quizId, t.tagId] })],
);

// Questions and options
export const questions = pgTable(
  "question",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    type: questionType("type").notNull().default("SINGLE"),
    title: text("title").notNull(),
    explanation: text("explanation"),
    imageUrl: text("image_url"),
    position: integer("position").notNull().default(0),
    points: integer("points").notNull().default(1),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("question_quiz_position_idx").on(t.quizId, t.position)],
);

export const questionOptions = pgTable(
  "question_option",
  {
    id: serial("id").primaryKey(),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    label: text("label").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    position: integer("position").notNull(),
  },
  (t) => [index("question_option_question_idx").on(t.questionId)],
);

// Attempts
export const quizAttempts = pgTable(
  "quiz_attempt",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    status: attemptStatus("status").notNull().default("IN_PROGRESS"),
    score: integer("score").notNull().default(0),
    percentage: integer("percentage").notNull().default(0),
    timeTaken: integer("time_taken").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("attempt_user_created_idx").on(t.userId, t.createdAt),
    index("attempt_leaderboard_idx").on(t.quizId, t.score, t.timeTaken),
  ],
);

export const attemptAnswers = pgTable(
  "attempt_answer",
  {
    attemptId: integer("attempt_id")
      .notNull()
      .references(() => quizAttempts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    selectedOptionIds: integer("selected_option_ids").array().notNull(),
    isCorrect: boolean("is_correct").notNull(),
    timeSpentMs: integer("time_spent_ms"),
  },
  (t) => [primaryKey({ columns: [t.attemptId, t.questionId] })],
);

// Bookmarks and ratings
export const quizBookmarks = pgTable(
  "quiz_bookmark",
  {
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.quizId] })],
);

export const quizRatings = pgTable(
  "quiz_rating",
  {
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.quizId] }),
    check("quiz_rating_range", sql`${t.rating} between 1 and 5`),
  ],
);

// XP ledger
export const xpEvents = pgTable(
  "xp_event",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    amount: integer("amount").notNull(),
    source: xpSource("source").notNull(),
    sourceId: integer("source_id"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("xp_event_user_created_idx").on(t.userId, t.createdAt)],
);

// Achievements
export const achievements = pgTable("achievement", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  type: achievementType("type").notNull(),
  threshold: integer("threshold").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  xpReward: integer("xp_reward").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userAchievements = pgTable(
  "user_achievement",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    achievementId: integer("achievement_id")
      .notNull()
      .references(() => achievements.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    progress: integer("progress").notNull().default(0),
    isCompleted: boolean("is_completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  quizzes: many(quizzes),
  quizAttempts: many(quizAttempts),
  quizBookmarks: many(quizBookmarks),
  quizRatings: many(quizRatings),
  userAchievements: many(userAchievements),
  xpEvents: many(xpEvents),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  quizzes: many(quizzes),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  quizTags: many(quizTags),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  user: one(users, {
    fields: [quizzes.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [quizzes.categoryId],
    references: [categories.id],
  }),
  questions: many(questions),
  quizTags: many(quizTags),
  quizAttempts: many(quizAttempts),
  quizBookmarks: many(quizBookmarks),
  quizRatings: many(quizRatings),
}));

export const quizTagsRelations = relations(quizTags, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizTags.quizId],
    references: [quizzes.id],
  }),
  tag: one(tags, {
    fields: [quizTags.tagId],
    references: [tags.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  options: many(questionOptions),
  attemptAnswers: many(attemptAnswers),
}));

export const questionOptionsRelations = relations(
  questionOptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionOptions.questionId],
      references: [questions.id],
    }),
  }),
);

export const quizAttemptsRelations = relations(
  quizAttempts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [quizAttempts.userId],
      references: [users.id],
    }),
    quiz: one(quizzes, {
      fields: [quizAttempts.quizId],
      references: [quizzes.id],
    }),
    answers: many(attemptAnswers),
  }),
);

export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [attemptAnswers.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
}));

export const quizBookmarksRelations = relations(quizBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [quizBookmarks.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizBookmarks.quizId],
    references: [quizzes.id],
  }),
}));

export const quizRatingsRelations = relations(quizRatings, ({ one }) => ({
  user: one(users, {
    fields: [quizRatings.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizRatings.quizId],
    references: [quizzes.id],
  }),
}));

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, {
    fields: [xpEvents.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
  }),
);

// Base types
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type AttemptAnswer = typeof attemptAnswers.$inferSelect;
export type QuizRating = typeof quizRatings.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type XpEvent = typeof xpEvents.$inferSelect;

export type QuizDifficulty = Quiz["difficulty"];
export type QuizStatus = Quiz["status"];
export type QuizVisibility = Quiz["visibility"];
export type QuestionType = Question["type"];
export type AttemptStatus = QuizAttempt["status"];

// Question types for different access levels
export type PublicOption = Pick<QuestionOption, "id" | "label" | "position">;

export type PublicQuestion = Pick<
  Question,
  "id" | "title" | "type" | "imageUrl" | "position" | "points"
> & {
  options: PublicOption[];
};

export type AdminQuestion = Question & {
  options: QuestionOption[];
};

// Quiz types
type QuizAuthor = {
  name: string;
  image: string | null;
};

type QuizCategory = Pick<Category, "id" | "name" | "slug" | "icon">;

export type QuizOverview = Quiz & {
  category: QuizCategory;
  questions: number;
  attempts: number | null;
  avgRating: number | null;
  ratings: number | null;
};

export type PublicQuizOverview = QuizOverview & {
  user: QuizAuthor | null;
  isBookmarked: boolean;
};

export type PublicQuizDetail = Quiz & {
  category: QuizCategory;
  tags: Tag[];
  questions: PublicQuestion[];
  user: QuizAuthor | null;
  isBookmarked: boolean;
  avgRating: number | null;
  ratings: number | null;
  attempts: number | null;
};

export type OwnerQuizOverview = QuizOverview;

export type OwnerQuizDetail = Quiz & {
  category: QuizCategory;
  tags: Tag[];
  questions: AdminQuestion[];
  avgRating: number | null;
  ratings: number | null;
  attempts: number | null;
};

// Attempt and leaderboard types
export type QuizAttemptDetail = QuizAttempt & {
  answers: AttemptAnswer[];
};

export type QuizLeaderboard = (QuizAttempt & {
  user: QuizAuthor;
  rank: number;
})[];
