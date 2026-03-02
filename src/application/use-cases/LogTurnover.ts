import { TaxRecord, ITaxRepository, ITaxCalculatorService, Money } from "../../types";

/**
 * Use Case: Log Daily Turnover.
 * Handles the business logic for recording sales and calculating tax.
 */
export class LogTurnoverUseCase {
  constructor(
    private taxRepository: ITaxRepository,
    private taxCalculator: ITaxCalculatorService
  ) {}

  async execute(vendorId: string, lgaId: string, amount: number): Promise<TaxRecord> {
    const turnover: Money = { amount, currency: 'NGN' };
    const { tax, bandId } = await this.taxCalculator.calculate(turnover, lgaId);

    const record: TaxRecord = {
      id: crypto.randomUUID(),
      vendorId,
      date: new Date(),
      turnover,
      calculatedTax: tax,
      lgaBandId: bandId,
      isSynced: false,
      createdAt: new Date(),
    };

    await this.taxRepository.logTurnover(record);
    return record;
  }
}
