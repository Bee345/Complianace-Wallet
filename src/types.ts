/**
 * DOMAIN VALUE OBJECTS
 */

export type UserRole = 'VENDOR' | 'OFFICIAL' | 'ADMIN';
export type ComplianceStatus = 'COMPLIANT' | 'PENDING' | 'EXPIRED' | 'DRAFT';
export type RegistrationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Money {
  amount: number;
  currency: 'NGN';
}

export interface LgaBand {
  id: string;
  name: string;
  minTurnover: number;
  maxTurnover: number;
  dailyTax: Money;
}

/**
 * DOMAIN ENTITIES
 */

export interface User {
  readonly id: string;
  readonly phoneNumber: string;
  readonly email: string;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly name: string;
  readonly dob?: string;
  readonly state?: string;
  readonly lga?: string;
  readonly profilePhotoUrl?: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

export interface Business {
  readonly id: string;
  readonly vendorId: string;
  readonly name: string;
  readonly cacRegistrationNumber?: string;
  readonly registrationStatus: RegistrationStatus;
  readonly lgaId: string;
  readonly address?: string;
  readonly businessType?: string;
  readonly photoUrl?: string;
  readonly createdAt: Date;
}

export interface TaxRecord {
  readonly id: string;
  readonly vendorId: string;
  readonly date: Date;
  readonly turnover: Money;
  readonly calculatedTax: Money;
  readonly lgaBandId?: string;
  readonly isSynced: boolean;
  readonly createdAt: Date;
}

export interface LevyRecord {
  readonly id: string;
  readonly vendorId: string;
  readonly date: Date;
  readonly amount: Money;
  readonly lgaId: string;
  readonly category: string;
  readonly receiptPhotoUrl?: string;
  readonly isSynced: boolean;
  readonly createdAt: Date;
}

export interface HealthPermit {
  readonly id: string;
  readonly vendorId: string;
  readonly permitNumber?: string;
  readonly issueDate?: Date;
  readonly expiryDate: Date;
  readonly photoUrl?: string;
  readonly status: ComplianceStatus;
  readonly createdAt: Date;
}

/**
 * AGGREGATES
 */

export interface VendorComplianceProfile {
  vendor: User;
  business?: Business;
  healthPermit?: HealthPermit;
  recentTaxRecords: TaxRecord[];
  recentLevyRecords: LevyRecord[];
  overallStatus: ComplianceStatus;
}

/**
 * REPOSITORY INTERFACES (Domain Layer)
 */

export interface IVendorRepository {
  getById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export interface IBusinessRepository {
  getByVendorId(vendorId: string): Promise<Business | null>;
  save(business: Business): Promise<void>;
}

export interface ITaxRepository {
  logTurnover(record: TaxRecord): Promise<void>;
  getHistory(vendorId: string): Promise<TaxRecord[]>;
  getUnsynced(): Promise<TaxRecord[]>;
}

export interface ILevyRepository {
  logLevy(record: LevyRecord): Promise<void>;
  getHistory(vendorId: string): Promise<LevyRecord[]>;
  getUnsynced(): Promise<LevyRecord[]>;
}

export interface IHealthRepository {
  getByVendorId(vendorId: string): Promise<HealthPermit | null>;
  save(permit: HealthPermit): Promise<void>;
}

/**
 * APPLICATION SERVICES
 */

export interface ITaxCalculatorService {
  calculate(turnover: Money, lgaId: string): Promise<{ tax: Money; bandId: string }>;
}

export interface IPidginService {
  translate(text: string): Promise<string>;
  getVoiceGuidance(screenName: string, context: string): Promise<string>;
}

export interface ISyncService {
  syncAll(): Promise<void>;
}
