// db.ts
import Dexie, { type EntityTable } from "dexie";

interface IndustryFoundationClasses {
  id: number;
  name: string;
}

const db = new Dexie("SynergyDatabase") as Dexie & {
  ifcs: EntityTable<
    IndustryFoundationClasses,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  ifcs: "++id, name", // primary key "id" (for the runtime!)
});

export type { IndustryFoundationClasses };
export { db };
