import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  real,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "FREELANCER", "CLIENT"]);

export const experienceEnum = pgEnum("experience", [
  "BEGINNER",
  "INTERMEDIATE",
  "EXPERT",
]);

export const industryEnum = pgEnum("industry", [
  "IT",
  "HEALTHCARE",
  "EDUCATION",
  "REAL_ESTATE",
  "HOSPITALITY",
  "RETAIL",
  "E_COMMERCE",
  "LEGAL",
  "CONSULTING",
  "MANUFACTURING",
  "TRANSPORTATION",
  "LOGISTICS",
  "MEDIA",
  "ENTERTAINMENT",
  "PUBLIC_SECTOR",
  "NON_PROFIT",
  "ENGINEERING",
  "BIOTECH",
  "PHARMACEUTICAL",
  "AGRICULTURE",
  "ENERGY",
  "TELECOMMUNICATION",
  "SECURITY",
  "CYBERSECURITY",
  "GAMING",
  "SPORTS",
  "AUTOMOTIVE",
  "AEROSPACE",
]);

export const jobStatusEnum = pgEnum("job_status", ["OPEN", "CLOSED", "FILLED"]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "MESSAGE",
  "JOB",
  "PAYMENT",
  "SYSTEM",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  role: roleEnum("role").default("CLIENT"),
  password: text("password").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id),

  industry: industryEnum("industry"),
  companyName: text("company_name"),
  companyWebsite: text("company_website"),
  linkedInProfile: text("linkedin_profile"),
});

export const freelancerProfiles = pgTable("freelancer_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .unique()
    .references(() => users.id),

  resume: text("resume"),
  industry: industryEnum("industry"),
  skills: text("skills").array(),
  experience: text("experience"),
  education: text("education"),
  languages: text("languages").array(),
  bio: text("bio"),
  ratePerHour: real("rate_per_hour"),
  DOB: timestamp("dob"),
  city: text("city"),
  state: text("state"),
  pincode: integer("pincode"),
  contact: text("contact"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id").references(() => users.id),

  title: text("title"),
  description: text("description"),
  postedAt: timestamp("posted_at").defaultNow(),

  requiredExperience: experienceEnum("required_experience"),
  payPerHour: real("pay_per_hour"),

  mandatorySkills: text("mandatory_skills").array(),
  niceToHaveSkills: text("nice_to_have_skills").array(),
  tools: text("tools").array(),

  preferredLocation: text("preferred_location"),
  preferredEducation: text("preferred_education"),
  clientLocation: text("client_location"),

  status: jobStatusEnum("status").default("OPEN"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id").references(() => jobs.id),
    freelancerId: uuid("freelancer_id").references(() => users.id),

    coverLetter: text("cover_letter"),
    resume: text("resume"),
    appliedAt: timestamp("applied_at").defaultNow(),

    status: applicationStatusEnum("status").default("PENDING"),
  },
  (table) => ({
    uniqueJobFreelancer: uniqueIndex("job_freelancer_unique").on(
      table.jobId,
      table.freelancerId
    ),
  })
);

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatParticipants = pgTable("chat_participants", {
  chatId: uuid("chat_id").references(() => chats.id),
  userId: uuid("user_id").references(() => users.id),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  chatId: uuid("chat_id").references(() => chats.id),
  senderId: uuid("sender_id").references(() => users.id),

  content: text("content"),
  timestamp: timestamp("timestamp").defaultNow(),
  isSeen: boolean("is_seen").default(false),
  isTyping: boolean("is_typing").default(false),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),

  type: notificationTypeEnum("type"),
  title: text("title"),
  description: text("description"),
  isNew: boolean("is_new").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

export const savedJobs = pgTable("saved_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  jobId: uuid("job_id").references(() => jobs.id),

  savedAt: timestamp("saved_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),

  jobId: uuid("job_id").references(() => jobs.id),
  freelancerId: uuid("freelancer_id").references(() => users.id),
  clientId: uuid("client_id").references(() => users.id),

  rating: integer("rating"),
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  jobId: uuid("job_id").references(() => jobs.id),
  clientId: uuid("client_id").references(() => users.id),
  freelancerId: uuid("freelancer_id").references(() => users.id),

  amount: real("amount"),
  status: paymentStatusEnum("status"),

  createdAt: timestamp("created_at").defaultNow(),
});
