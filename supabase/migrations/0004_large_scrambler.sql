CREATE TABLE "monthly_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"total_income" integer DEFAULT 0 NOT NULL,
	"total_expense" integer DEFAULT 0 NOT NULL,
	"net_savings" integer DEFAULT 0 NOT NULL,
	"balances_by_account" jsonb,
	"balances_by_group" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
