import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const factories = pgTable("factories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  mapLink: text("map_link"),
  contactName: text("contact_name"),
  contactPosition: text("contact_position"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  currentProducts: text("current_products"),
  employeeCount: text("employee_count"),
  shiftsPerDay: text("shifts_per_day"),
  workingDays: text("working_days"),
  kashrut: text("kashrut"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFactorySchema = createInsertSchema(factories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFactorySchema = insertFactorySchema.partial();

export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type UpdateFactory = z.infer<typeof updateFactorySchema>;
export type Factory = typeof factories.$inferSelect;

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  factoryName: text("factory_name").notNull(),
  inspector: text("inspector").notNull(),
  factoryAddress: text("factory_address").notNull(),
  mapLink: text("map_link"),
  hebrewDate: text("hebrew_date"),
  gregorianDate: text("gregorian_date").notNull(),
  
  // Contact person details
  contactName: text("contact_name"),
  contactPosition: text("contact_position"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  
  // General background
  currentProducts: text("current_products"),
  employeeCount: integer("employee_count"),
  shiftsPerDay: integer("shifts_per_day"),
  workingDays: integer("working_days"),
  kashrut: text("kashrut"), // yes, no, previous
  
  // Document checklist
  documents: jsonb("documents").$type<{
    masterIngredientList: boolean;
    blueprint: boolean;
    flowchart: boolean;
    boilerBlueprint: boolean;
  }>(),
  
  // Document files
  documentFiles: jsonb("document_files").$type<Record<string, string[]>>().default({}),
  
  // Factory category
  category: text("category"), // treif, issur, g6, kosher
  
  // Ingredients and production details
  ingredients: text("ingredients"),
  boilerDetails: text("boiler_details"),
  cleaningProtocols: text("cleaning_protocols"),
  
  // Special considerations
  bishuYisrael: boolean("bishu_yisrael").default(false),
  afiyaYisrael: boolean("afiya_yisrael").default(false),
  chalavYisrael: boolean("chalav_yisrael").default(false),
  linatLaila: boolean("linat_laila").default(false),
  kavush: boolean("kavush").default(false),
  chadash: boolean("chadash").default(false),
  hafrashChalla: boolean("hafrash_challa").default(false),
  kashrutPesach: boolean("kashrut_pesach").default(false),
  
  // Photos and attachments
  photos: text("photos").array().default([]),
  attachments: text("attachments").array().default([]),
  
  // Summary and recommendations
  summary: text("summary"),
  recommendations: text("recommendations"),
  inspectorOpinion: text("inspector_opinion"),
  
  // Status and timestamps
  status: text("status").notNull().default("draft"), // draft, completed, pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateInspectionSchema = insertInspectionSchema.partial();

export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type UpdateInspection = z.infer<typeof updateInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
