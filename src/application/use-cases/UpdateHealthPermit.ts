import { HealthPermit, IHealthRepository, ComplianceStatus } from "../../types";

/**
 * Use Case: Update Health Permit.
 * Handles the business logic for recording health compliance.
 */
export class UpdateHealthPermitUseCase {
  constructor(private healthRepository: IHealthRepository) {}

  async execute(vendorId: string, permitNumber: string, expiryDate: Date, photoUrl?: string): Promise<HealthPermit> {
    const status: ComplianceStatus = expiryDate > new Date() ? 'COMPLIANT' : 'EXPIRED';

    const permit: HealthPermit = {
      id: crypto.randomUUID(),
      vendorId,
      permitNumber,
      expiryDate,
      photoUrl,
      status,
      createdAt: new Date(),
    };

    await this.healthRepository.save(permit);
    return permit;
  }
}
