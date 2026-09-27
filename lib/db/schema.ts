/**
 * Data model from CLAUDE.md section 5. Change it only through a new migration
 * (`npm run db:generate`), never by editing files in /drizzle by hand.
 */
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const orgType = pgEnum("org_type", [
  "law_firm",
  "legal_tech",
  "think_tank",
  "regulator",
  "other",
]);
export const seniority = pgEnum("seniority", [
  "partner",
  "associate",
  "counsel",
  "founder",
  "other",
]);
export const arena = pgEnum("arena", ["tech_law", "legal_tech"]);
export const warmType = pgEnum("warm_type", [
  "worked_with",
  "alumni",
  "alumni_unverified",
  "course",
  "event",
  "none",
]);
export const stage = pgEnum("stage", [
  "new",
  "queued",
  "drafted",
  "sent",
  "following_up",
  "replied",
  "meeting",
  "closed",
  "do_not_contact",
]);
export const emailStatus = pgEnum("email_status", [
  "verified",
  "found",
  "pattern",
  "unknown",
]);
export const opportunityType = pgEnum("opportunity_type", [
  "internship",
  "vacation_scheme",
  "scholarship",
  "fellowship",
  "invitation_programme",
  "job",
  "clerkship",
]);
export const senderStatus = pgEnum("sender_status", [
  "connected",
  "needs_reconnect",
  "removed",
]);
export const sequenceMode = pgEnum("sequence_mode", ["auto", "review", "manual"]);
export const sequenceStatus = pgEnum("sequence_status", [
  "active",
  "paused",
  "replied",
  "exhausted",
  "stopped",
  "suppressed",
]);
export const channel = pgEnum("channel", ["email", "linkedin"]);
export const touchKind = pgEnum("touch_kind", ["first", "follow_up"]);
export const touchStatus = pgEnum("touch_status", [
  "scheduled",
  "drafted",
  "awaiting_review",
  "sent",
  "skipped",
  "failed",
]);

export const organizations = pgTable(
  "organizations",
  {
    id: id(),
    name: text("name").notNull(),
    type: orgType("type").notNull().default("other"),
    website: text("website"),
    domain: text("domain"),
    city: text("city"),
    country: text("country"),
    practiceTags: text("practice_tags").array().notNull().default([]),
    careersUrl: text("careers_url"),
    emailPattern: text("email_pattern"),
    emailPatternConfidence: real("email_pattern_confidence"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("organizations_domain_idx").on(t.domain)],
);

export const people = pgTable(
  "people",
  {
    id: id(),
    orgId: uuid("org_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    role: text("role"),
    seniority: seniority("seniority").notNull().default("other"),
    arena: arena("arena").notNull(),
    linkedinUrl: text("linkedin_url"),
    warmType: warmType("warm_type").notNull().default("none"),
    warmNote: text("warm_note"),
    hook: text("hook"),
    focus: text("focus"),
    stage: stage("stage").notNull().default("new"),
    // Lowercased name + org domain (section 5).
    dedupeKey: text("dedupe_key").notNull(),
    sourceUrls: text("source_urls").array().notNull().default([]),
    // Fields a human edited; imports never overwrite these (merge rule).
    humanEditedFields: text("human_edited_fields").array().notNull().default([]),
    // Per-contact cadence override (section 6.3); null = inherit.
    cadenceId: text("cadence_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("people_dedupe_key_idx").on(t.dedupeKey),
    index("people_stage_idx").on(t.stage),
  ],
);

export const emails = pgTable(
  "emails",
  {
    id: id(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    // Rule 1: every address carries status, source_url and checked_at.
    status: emailStatus("status").notNull(),
    sourceUrl: text("source_url"),
    verifierResult: jsonb("verifier_result"),
    checkedAt: timestamp("checked_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("emails_person_address_idx").on(t.personId, t.address)],
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: id(),
    title: text("title").notNull(),
    orgId: uuid("org_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    orgName: text("org_name"),
    type: opportunityType("type").notNull(),
    arena: arena("arena"),
    location: text("location"),
    // Only a real parsed date; otherwise deadline_text (never guess).
    deadline: date("deadline"),
    deadlineText: text("deadline_text"),
    url: text("url").notNull(),
    source: text("source"),
    note: text("note"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archived: boolean("archived").notNull().default(false),
  },
  (t) => [uniqueIndex("opportunities_url_idx").on(t.url)],
);

export const senderAccounts = pgTable("sender_accounts", {
  id: id(),
  // The logged-in user who connected this account.
  ownerEmail: text("owner_email").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  signature: text("signature"),
  // AES-GCM via lib/crypto.ts; never stored in plain text.
  encryptedRefreshToken: text("encrypted_refresh_token"),
  dailyCap: integer("daily_cap").notNull().default(25),
  isDefault: boolean("is_default").notNull().default(false),
  status: senderStatus("status").notNull().default("connected"),
  connectedAt: createdAt(),
});

export const sequences = pgTable(
  "sequences",
  {
    id: id(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    // Pinned to the account that sent the first email (section 7).
    senderAccountId: uuid("sender_account_id").references(
      () => senderAccounts.id,
    ),
    mode: sequenceMode("mode").notNull().default("review"),
    status: sequenceStatus("status").notNull().default("active"),
    cadenceId: text("cadence_id"),
    // Copy of the cadence at start, so later edits never silently apply.
    cadenceSnapshot: jsonb("cadence_snapshot"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    nextTouchAt: timestamp("next_touch_at", { withTimezone: true }),
    touchCount: integer("touch_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("sequences_next_touch_idx").on(t.status, t.nextTouchAt),
    index("sequences_person_idx").on(t.personId),
  ],
);

export const touches = pgTable(
  "touches",
  {
    id: id(),
    sequenceId: uuid("sequence_id")
      .notNull()
      .references(() => sequences.id, { onDelete: "cascade" }),
    channel: channel("channel").notNull(),
    kind: touchKind("kind").notNull(),
    n: integer("n").notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    status: touchStatus("status").notNull().default("scheduled"),
    subject: text("subject"),
    body: text("body"),
    // Inventory IDs the writer used (rule 3).
    inventoryRefs: text("inventory_refs").array().notNull().default([]),
    gmailDraftId: text("gmail_draft_id"),
    gmailMessageId: text("gmail_message_id"),
    gmailThreadId: text("gmail_thread_id"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("touches_sequence_idx").on(t.sequenceId, t.n)],
);

// Rule 6: permanent. Nothing may contact an address or person listed here.
export const suppression = pgTable("suppression", {
  id: id(),
  address: text("address"),
  personId: uuid("person_id").references(() => people.id, {
    onDelete: "set null",
  }),
  reason: text("reason").notNull(),
  createdAt: createdAt(),
});

// Key/value settings: profile, cadences, caps, send window, CV, inventory.
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
});
