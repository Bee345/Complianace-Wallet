/**
 * Domain Entities, Aggregates, and Value Objects for the Street Vendor Compliance Wallet.
 * Following Clean Architecture principles.
 */

// --- Domain Layer: Value Objects & Enums ---

export type UserRole = 'VENDOR' | 'ADMIN' | 'OFFICIAL';
export type RegistrationStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type ComplianceStatus = 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' | 'EXPIRED';

export interface Money {
  amount: number;
  currency: 'NGN';
}

export interface PhoneNumber {
  countryCode: string;
  number: string;
}

// --- Domain Layer: Entities ---

export interface User {
  readonly id: string;
  readonly phoneNumber: string;
  readonly name: string;
  readonly role: UserRole;
  readonly profilePhotoUrl?: string;
  readonly createdAt: Date;
}

export interface Business {
  readonly id: string;
  readonly vendorId: string;
  readonly name: string;
  readonly lgaId: string;
  readonly registrationStatus: RegistrationStatus;
  readonly cacNumber?: string;
  readonly address?: string;
  readonly businessType?: string;
  readonly createdAt: Date;
}

export interface TaxRecord {
  readonly id: string;
  readonly vendorId: string;
  readonly date: Date;
  readonly turnover: Money;
  readonly calculatedTax: Money;
  readonly lgaBandId: string;
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

// --- Domain Layer: Repository Interfaces ---

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

// --- Application Layer: Service Interfaces ---

export interface ITaxCalculatorService {
  calculate(turnover: Money, lgaId: string): Promise<{ tax: Money; bandId: string }>;
}

export interface ISyncService {
  syncAll(): Promise<void>;
}

export interface IPidginService {
  translate(text: string): Promise<string>;
  getVoiceGuidance(screenName: string, context: string): Promise<string>;
}
