import { LevyRecord, ILevyRepository, Money } from "../../types";

/**
 * Use Case: Log New Levy.
 * Handles the business logic for recording informal "settlement" payments.
 */
export class LogLevyUseCase {
  constructor(private levyRepository: ILevyRepository) {}

  async execute(vendorId: string, lgaId: string, amount: number, category: string, receiptPhotoUrl?: string): Promise<LevyRecord> {
    const record: LevyRecord = {
      id: crypto.randomUUID(),
      vendorId,
      date: new Date(),
      amount: { amount, currency: 'NGN' },
      lgaId,
      category,
      receiptPhotoUrl,
      isSynced: false,
      createdAt: new Date(),
    };

    await this.levyRepository.logLevy(record);
    return record;
  }
}
