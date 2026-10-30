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
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const userRole = pgEnum("user_role", [
  "USER",
  "CREATOR",
  "MODERATOR",
  "ADMIN",
]);

export const difficulty = pgEnum("difficulty", [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const quizStatus = pgEnum("quiz_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "SUSPENDED",
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
  "PERFECT_SCORE",
  "STREAK_BONUS",
  "ACHIEVEMENT",
]);

export const achievementType = pgEnum("achievement_type", [
  "QUIZZES_COMPLETED",
  "QUIZZES_CREATED",
  "STREAK_DAYS",
  "PERFECT_SCORES",
  "TOTAL_XP",
]);

export const applicationStatus = pgEnum("application_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const reportReason = pgEnum("report_reason", [
  "NSFW",
  "HATE",
  "SPAM",
  "MISLEADING",
  "COPYRIGHT",
  "OTHER",
]);

export const reportStatus = pgEnum("report_status", [
  "OPEN",
  "DISMISSED",
  "ACTIONED",
]);

export const moderationKind = pgEnum("moderation_kind", [
  "CREATOR_APPROVED",
  "CREATOR_REJECTED",
  "CREATOR_REVOKED",
  "USER_BANNED",
  "USER_UNBANNED",
  "QUIZ_HIDDEN",
  "QUIZ_SUSPENDED",
  "QUIZ_RESTORED",
  "QUIZ_DELETED",
  "REPORT_DISMISSED",
]);

// Auth tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: userRole("role").notNull().default("USER"),
  timezone: text("timezone").notNull().default("UTC"),
  socialLinks: json("social_links")
    .$type<{
      website?: string;
      instagram?: string;
      x?: string;
    }>()
    .notNull()
    .default({}),
  totalXp: integer("total_xp").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable("sessions", {
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

export const accounts = pgTable("accounts", {
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

export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Categories and tags
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// Quizzes
export const quizzes = pgTable(
  "quizzes",
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
    difficulty: difficulty("difficulty").notNull(),
    status: quizStatus("status").notNull().default("DRAFT"),
    visibility: quizVisibility("visibility").notNull().default("PUBLIC"),
    timeLimitSeconds: integer("time_limit_seconds"),
    shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
    shuffleOptions: boolean("shuffle_options").notNull().default(false),
    maxAttempts: integer("max_attempts"),
    publishedAt: timestamp("published_at"),
    suspendedAt: timestamp("suspended_at"),
    suspendedBy: integer("suspended_by").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    suspensionReason: text("suspension_reason"),
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
      "quizzes_time_limit_positive",
      sql`${t.timeLimitSeconds} is null or ${t.timeLimitSeconds} > 0`,
    ),
    check(
      "quizzes_max_attempts_positive",
      sql`${t.maxAttempts} is null or ${t.maxAttempts} > 0`,
    ),
    check(
      "quizzes_suspended_has_time",
      sql`${t.status} <> 'SUSPENDED' or ${t.suspendedAt} is not null`,
    ),
    index("quizzes_browse_idx").on(t.status, t.visibility, t.createdAt),
    index("quizzes_category_idx").on(t.categoryId),
    index("quizzes_user_idx").on(t.userId),
  ],
);

export const quizTags = pgTable(
  "quiz_tags",
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
  "questions",
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
  (t) => [index("questions_quiz_position_idx").on(t.quizId, t.position)],
);

export const questionOptions = pgTable(
  "question_options",
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
  (t) => [index("question_options_question_idx").on(t.questionId)],
);

// Attempts
export const quizAttempts = pgTable(
  "quiz_attempts",
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
    shuffleSeed: integer("shuffle_seed")
      .notNull()
      .$defaultFn(() => Math.floor(Math.random() * 2_147_483_647)),
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
    index("quiz_attempts_user_created_idx").on(t.userId, t.createdAt),
    index("quiz_attempts_leaderboard_idx").on(t.quizId, t.score, t.timeTaken),
    uniqueIndex("quiz_attempts_one_active_idx")
      .on(t.userId, t.quizId)
      .where(sql`${t.status} = 'IN_PROGRESS'`),
  ],
);

export const attemptAnswers = pgTable(
  "attempt_answers",
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
  "quiz_bookmarks",
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
  "quiz_ratings",
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
    check("quiz_ratings_range", sql`${t.rating} between 1 and 5`),
  ],
);

// Creator applications
export const creatorApplications = pgTable(
  "creator_applications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    motivation: text("motivation").notNull(),
    status: applicationStatus("status").notNull().default("PENDING"),
    reviewedBy: integer("reviewed_by").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
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
      "creator_applications_motivation_length",
      sql`char_length(${t.motivation}) between 40 and 500`,
    ),
    index("creator_applications_queue_idx").on(t.status, t.createdAt),
    index("creator_applications_user_idx").on(t.userId),
    uniqueIndex("creator_applications_one_pending_idx")
      .on(t.userId)
      .where(sql`${t.status} = 'PENDING'`),
  ],
);

// Reports
export const quizReports = pgTable(
  "quiz_reports",
  {
    id: serial("id").primaryKey(),
    quizId: integer("quiz_id")
      .notNull()
      .references(() => quizzes.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    reporterId: integer("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    reason: reportReason("reason").notNull(),
    details: text("details"),
    status: reportStatus("status").notNull().default("OPEN"),
    reviewedBy: integer("reviewed_by").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      "quiz_reports_details_length",
      sql`${t.details} is null or char_length(${t.details}) <= 300`,
    ),
    uniqueIndex("quiz_reports_quiz_reporter_idx").on(t.quizId, t.reporterId),
    index("quiz_reports_queue_idx").on(t.status, t.quizId),
  ],
);

// Moderation
export const userNotes = pgTable(
  "user_notes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    authorId: integer("author_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      "user_notes_body_length",
      sql`char_length(${t.body}) between 3 and 400`,
    ),
    index("user_notes_user_created_idx").on(t.userId, t.createdAt),
  ],
);

export const moderationEvents = pgTable(
  "moderation_events",
  {
    id: serial("id").primaryKey(),
    kind: moderationKind("kind").notNull(),
    actorId: integer("actor_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    quizId: integer("quiz_id").references(() => quizzes.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date", precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      "moderation_events_has_subject",
      sql`${t.userId} is not null or ${t.quizId} is not null`,
    ),
    index("moderation_events_user_created_idx").on(t.userId, t.createdAt),
    index("moderation_events_quiz_created_idx").on(t.quizId, t.createdAt),
    index("moderation_events_created_idx").on(t.createdAt),
  ],
);

// XP ledger
export const xpEvents = pgTable(
  "xp_events",
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
  (t) => [index("xp_events_user_created_idx").on(t.userId, t.createdAt)],
);

// Achievements
export const achievements = pgTable("achievements", {
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
  "user_achievements",
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
  quizzes: many(quizzes, { relationName: "quiz_author" }),
  suspendedQuizzes: many(quizzes, { relationName: "quiz_suspender" }),
  quizAttempts: many(quizAttempts),
  quizBookmarks: many(quizBookmarks),
  quizRatings: many(quizRatings),
  userAchievements: many(userAchievements),
  xpEvents: many(xpEvents),
  creatorApplications: many(creatorApplications, {
    relationName: "application_applicant",
  }),
  reviewedApplications: many(creatorApplications, {
    relationName: "application_reviewer",
  }),
  quizReports: many(quizReports, { relationName: "report_reporter" }),
  reviewedReports: many(quizReports, { relationName: "report_reviewer" }),
  notes: many(userNotes, { relationName: "note_subject" }),
  writtenNotes: many(userNotes, { relationName: "note_author" }),
  moderationEvents: many(moderationEvents, { relationName: "event_subject" }),
  actedEvents: many(moderationEvents, { relationName: "event_actor" }),
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
    relationName: "quiz_author",
  }),
  suspender: one(users, {
    fields: [quizzes.suspendedBy],
    references: [users.id],
    relationName: "quiz_suspender",
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
  reports: many(quizReports),
  moderationEvents: many(moderationEvents),
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

export const creatorApplicationsRelations = relations(
  creatorApplications,
  ({ one }) => ({
    user: one(users, {
      fields: [creatorApplications.userId],
      references: [users.id],
      relationName: "application_applicant",
    }),
    reviewer: one(users, {
      fields: [creatorApplications.reviewedBy],
      references: [users.id],
      relationName: "application_reviewer",
    }),
  }),
);

export const quizReportsRelations = relations(quizReports, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizReports.quizId],
    references: [quizzes.id],
  }),
  reporter: one(users, {
    fields: [quizReports.reporterId],
    references: [users.id],
    relationName: "report_reporter",
  }),
  reviewer: one(users, {
    fields: [quizReports.reviewedBy],
    references: [users.id],
    relationName: "report_reviewer",
  }),
}));

export const userNotesRelations = relations(userNotes, ({ one }) => ({
  user: one(users, {
    fields: [userNotes.userId],
    references: [users.id],
    relationName: "note_subject",
  }),
  author: one(users, {
    fields: [userNotes.authorId],
    references: [users.id],
    relationName: "note_author",
  }),
}));

export const moderationEventsRelations = relations(
  moderationEvents,
  ({ one }) => ({
    user: one(users, {
      fields: [moderationEvents.userId],
      references: [users.id],
      relationName: "event_subject",
    }),
    actor: one(users, {
      fields: [moderationEvents.actorId],
      references: [users.id],
      relationName: "event_actor",
    }),
    quiz: one(quizzes, {
      fields: [moderationEvents.quizId],
      references: [quizzes.id],
    }),
  }),
);

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
export type CreatorApplication = typeof creatorApplications.$inferSelect;
export type QuizReport = typeof quizReports.$inferSelect;
export type UserNote = typeof userNotes.$inferSelect;
export type ModerationEvent = typeof moderationEvents.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type XpEvent = typeof xpEvents.$inferSelect;

export type QuizDifficulty = Quiz["difficulty"];
export type QuizStatus = Quiz["status"];
export type QuizVisibility = Quiz["visibility"];
export type QuestionType = Question["type"];
export type AttemptStatus = QuizAttempt["status"];
export type ModerationKind = ModerationEvent["kind"];

// Question types for different access levels
export type PublicOption = Pick<QuestionOption, "id" | "label" | "position">;

export type PublicQuestion = Pick<
  Question,
  "id" | "title" | "type" | "position" | "points"
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
  questions: number;
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
