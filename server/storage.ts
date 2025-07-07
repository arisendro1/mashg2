import { 
  inspections, 
  type Inspection, 
  type InsertInspection, 
  type UpdateInspection,
  factories,
  type Factory,
  type InsertFactory,
  type UpdateFactory
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, gte, lte, ilike } from "drizzle-orm";

export interface IStorage {
  // Inspection CRUD operations
  getInspection(id: number): Promise<Inspection | undefined>;
  getInspections(): Promise<Inspection[]>;
  searchInspections(query: string): Promise<Inspection[]>;
  filterInspections(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    inspector?: string;
  }): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: UpdateInspection): Promise<Inspection | undefined>;
  deleteInspection(id: number): Promise<boolean>;
  
  // Factory CRUD operations
  getFactory(id: number): Promise<Factory | undefined>;
  getFactories(): Promise<Factory[]>;
  searchFactories(query: string): Promise<Factory[]>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  updateFactory(id: number, factory: UpdateFactory): Promise<Factory | undefined>;
  deleteFactory(id: number): Promise<boolean>;
  
  // Statistics
  getInspectionStats(): Promise<{
    totalInspections: number;
    thisMonth: number;
    pending: number;
    completed: number;
  }>;
}

export class MemStorage implements IStorage {
  private inspections: Map<number, Inspection>;
  private currentId: number;

  constructor() {
    this.inspections = new Map();
    this.currentId = 1;
  }

  async getInspection(id: number): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }

  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async searchInspections(query: string): Promise<Inspection[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.inspections.values()).filter(inspection =>
      inspection.factoryName.toLowerCase().includes(lowercaseQuery) ||
      inspection.inspector.toLowerCase().includes(lowercaseQuery) ||
      inspection.factoryAddress.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterInspections(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    inspector?: string;
  }): Promise<Inspection[]> {
    let filtered = Array.from(this.inspections.values());

    if (filters.status) {
      filtered = filtered.filter(inspection => inspection.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(inspection => 
        new Date(inspection.gregorianDate) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(inspection => 
        new Date(inspection.gregorianDate) <= new Date(filters.dateTo!)
      );
    }

    if (filters.inspector) {
      filtered = filtered.filter(inspection => 
        inspection.inspector.toLowerCase().includes(filters.inspector!.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const id = this.currentId++;
    const now = new Date();
    const inspection: Inspection = {
      id,
      factoryName: insertInspection.factoryName,
      inspector: insertInspection.inspector,
      factoryAddress: insertInspection.factoryAddress,
      mapLink: insertInspection.mapLink || null,
      hebrewDate: insertInspection.hebrewDate || null,
      gregorianDate: insertInspection.gregorianDate,
      contactName: insertInspection.contactName || null,
      contactPosition: insertInspection.contactPosition || null,
      contactEmail: insertInspection.contactEmail || null,
      contactPhone: insertInspection.contactPhone || null,
      currentProducts: insertInspection.currentProducts || null,
      employeeCount: insertInspection.employeeCount || null,
      shiftsPerDay: insertInspection.shiftsPerDay || null,
      workingDays: insertInspection.workingDays || null,
      kashrut: insertInspection.kashrut || null,
      documents: insertInspection.documents || null,
      documentFiles: (insertInspection.documentFiles as Record<string, string[]>) || {},
      category: insertInspection.category || null,
      ingredients: insertInspection.ingredients || null,
      boilerDetails: insertInspection.boilerDetails || null,
      cleaningProtocols: insertInspection.cleaningProtocols || null,
      bishuYisrael: insertInspection.bishuYisrael || false,
      afiyaYisrael: insertInspection.afiyaYisrael || false,
      chalavYisrael: insertInspection.chalavYisrael || false,
      linatLaila: insertInspection.linatLaila || false,
      kavush: insertInspection.kavush || false,
      chadash: insertInspection.chadash || false,
      hafrashChalla: insertInspection.hafrashChalla || false,
      kashrutPesach: insertInspection.kashrutPesach || false,
      photos: (insertInspection.photos as string[]) || [],
      attachments: (insertInspection.attachments as string[]) || [],
      summary: insertInspection.summary || null,
      recommendations: insertInspection.recommendations || null,
      inspectorOpinion: insertInspection.inspectorOpinion || null,
      status: insertInspection.status || "draft",
      createdAt: now,
      updatedAt: now,
    };
    this.inspections.set(id, inspection);
    return inspection;
  }

  async updateInspection(id: number, updateInspection: UpdateInspection): Promise<Inspection | undefined> {
    const existing = this.inspections.get(id);
    if (!existing) return undefined;

    const updated: Inspection = {
      ...existing,
      ...updateInspection,
      photos: (updateInspection.photos as string[]) || existing.photos,
      attachments: (updateInspection.attachments as string[]) || existing.attachments,
      documentFiles: (updateInspection.documentFiles as Record<string, string[]>) || existing.documentFiles || {},
      updatedAt: new Date(),
    };
    this.inspections.set(id, updated);
    return updated;
  }

  async deleteInspection(id: number): Promise<boolean> {
    return this.inspections.delete(id);
  }

  async getInspectionStats(): Promise<{
    totalInspections: number;
    thisMonth: number;
    pending: number;
    completed: number;
  }> {
    const inspections = Array.from(this.inspections.values());
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalInspections: inspections.length,
      thisMonth: inspections.filter(i => new Date(i.createdAt) >= thisMonth).length,
      pending: inspections.filter(i => i.status === "pending").length,
      completed: inspections.filter(i => i.status === "completed").length,
    };
  }

  // Factory methods - stub implementations for MemStorage
  async getFactory(id: number): Promise<Factory | undefined> {
    return undefined;
  }

  async getFactories(): Promise<Factory[]> {
    return [];
  }

  async searchFactories(query: string): Promise<Factory[]> {
    return [];
  }

  async createFactory(factory: InsertFactory): Promise<Factory> {
    throw new Error("Factory management not implemented in MemStorage");
  }

  async updateFactory(id: number, factory: UpdateFactory): Promise<Factory | undefined> {
    throw new Error("Factory management not implemented in MemStorage");
  }

  async deleteFactory(id: number): Promise<boolean> {
    throw new Error("Factory management not implemented in MemStorage");
  }
}

export class DatabaseStorage implements IStorage {
  async getInspection(id: number): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
    return inspection || undefined;
  }

  async getInspections(): Promise<Inspection[]> {
    return await db.select().from(inspections).orderBy(sql`${inspections.createdAt} DESC`);
  }

  async searchInspections(query: string): Promise<Inspection[]> {
    return await db.select().from(inspections).where(
      sql`${inspections.factoryName} ILIKE ${`%${query}%`} OR ${inspections.inspector} ILIKE ${`%${query}%`}`
    );
  }

  async filterInspections(filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    inspector?: string;
  }): Promise<Inspection[]> {
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(inspections.status, filters.status));
    }
    
    if (filters.dateFrom) {
      conditions.push(gte(inspections.createdAt, new Date(filters.dateFrom)));
    }
    
    if (filters.dateTo) {
      conditions.push(lte(inspections.createdAt, new Date(filters.dateTo)));
    }
    
    if (filters.inspector) {
      conditions.push(ilike(inspections.inspector, `%${filters.inspector}%`));
    }
    
    if (conditions.length === 0) {
      return await this.getInspections();
    }
    
    return await db.select().from(inspections).where(and(...conditions));
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const [inspection] = await db
      .insert(inspections)
      .values(insertInspection as any)
      .returning();
    return inspection;
  }

  async updateInspection(id: number, updateInspection: UpdateInspection): Promise<Inspection | undefined> {
    const [inspection] = await db
      .update(inspections)
      .set(updateInspection as any)
      .where(eq(inspections.id, id))
      .returning();
    return inspection || undefined;
  }

  async deleteInspection(id: number): Promise<boolean> {
    const result = await db.delete(inspections).where(eq(inspections.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInspectionStats(): Promise<{
    totalInspections: number;
    thisMonth: number;
    pending: number;
    completed: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalResult] = await db.select({ count: sql`count(*)` }).from(inspections);
    const [thisMonthResult] = await db.select({ count: sql`count(*)` }).from(inspections)
      .where(gte(inspections.createdAt, startOfMonth));
    const [pendingResult] = await db.select({ count: sql`count(*)` }).from(inspections)
      .where(eq(inspections.status, 'pending'));
    const [completedResult] = await db.select({ count: sql`count(*)` }).from(inspections)
      .where(eq(inspections.status, 'completed'));

    return {
      totalInspections: Number(totalResult.count),
      thisMonth: Number(thisMonthResult.count),
      pending: Number(pendingResult.count),
      completed: Number(completedResult.count),
    };
  }

  // Factory methods
  async getFactory(id: number): Promise<Factory | undefined> {
    const [factory] = await db.select().from(factories).where(eq(factories.id, id));
    return factory || undefined;
  }

  async getFactories(): Promise<Factory[]> {
    return await db.select().from(factories).orderBy(sql`${factories.name} ASC`);
  }

  async searchFactories(query: string): Promise<Factory[]> {
    return await db.select().from(factories).where(
      sql`${factories.name} ILIKE ${`%${query}%`} OR ${factories.address} ILIKE ${`%${query}%`}`
    );
  }

  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const [factory] = await db
      .insert(factories)
      .values({
        ...insertFactory,
        updatedAt: new Date(),
      })
      .returning();
    return factory;
  }

  async updateFactory(id: number, updateFactory: UpdateFactory): Promise<Factory | undefined> {
    const [factory] = await db
      .update(factories)
      .set({
        ...updateFactory,
        updatedAt: new Date(),
      })
      .where(eq(factories.id, id))
      .returning();
    return factory || undefined;
  }

  async deleteFactory(id: number): Promise<boolean> {
    const result = await db.delete(factories).where(eq(factories.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
