import { 
  ITaxRepository, 
  TaxRecord, 
  ILevyRepository, 
  LevyRecord,
  IBusinessRepository,
  Business,
  IVendorRepository,
  User,
  IHealthRepository,
  HealthPermit
} from "../../types";

/**
 * SQLite implementation of the repositories.
 * In a real mobile app, this would use a local database (like SQLite via Capacitor/React Native).
 * Here, we use the Express backend as a proxy to the SQLite database.
 */

export class SQLiteVendorRepository implements IVendorRepository {
  async getById(id: string): Promise<User | null> {
    const res = await fetch(`/api/vendor/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  }

  async save(user: User): Promise<void> {
    await fetch('/api/vendor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  }
}

export class SQLiteTaxRepository implements ITaxRepository {
  async logTurnover(record: TaxRecord): Promise<void> {
    await fetch('/api/tax', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  }

  async getHistory(vendorId: string): Promise<TaxRecord[]> {
    const res = await fetch(`/api/tax/${vendorId}`);
    return res.json();
  }

  async getUnsynced(): Promise<TaxRecord[]> {
    // In this web demo, we assume the server is the sync target
    return [];
  }
}

export class SQLiteLevyRepository implements ILevyRepository {
  async logLevy(record: LevyRecord): Promise<void> {
    await fetch('/api/levy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  }

  async getHistory(vendorId: string): Promise<LevyRecord[]> {
    const res = await fetch(`/api/levy/${vendorId}`);
    return res.json();
  }

  async getUnsynced(): Promise<LevyRecord[]> {
    return [];
  }
}

export class SQLiteHealthRepository implements IHealthRepository {
  async getByVendorId(vendorId: string): Promise<HealthPermit | null> {
    const res = await fetch(`/api/health-permit/${vendorId}`);
    if (!res.ok) return null;
    return res.json();
  }

  async save(permit: HealthPermit): Promise<void> {
    await fetch('/api/health-permit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permit)
    });
  }
}
