CREATE TABLE "event_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "event_participants_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "system_announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "slow_mode" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "who_can_send" text DEFAULT 'all';--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "invite_token" text;--> statement-breakpoint
ALTER TABLE "platform_events" ADD COLUMN "event_type" text DEFAULT 'event';--> statement-breakpoint
ALTER TABLE "platform_events" ADD COLUMN "cost" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "platform_events" ADD COLUMN "conditions" text;--> statement-breakpoint
ALTER TABLE "platform_events" ADD COLUMN "participant_count" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "idx_chat_members_user_id" ON "chat_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_messages_chat_id" ON "messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "idx_messages_chat_id_created_at" ON "messages" USING btree ("chat_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_reactions_message_id" ON "reactions" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_stories_expires_at" ON "stories" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_stories_user_id" ON "stories" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "gift_items" ADD CONSTRAINT "gift_items_name_unique" UNIQUE("name");