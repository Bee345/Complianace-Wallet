import { ITaxCalculatorService, Money } from "../../types";
import { TAX_BANDS } from "../../constants";

/**
 * Implementation of the Tax Calculator Service.
 * Follows the business rules defined in the PRD for LGA-based bands.
 */
export class TaxCalculatorServiceImpl implements ITaxCalculatorService {
  async calculate(turnover: Money, lgaId: string): Promise<{ tax: Money; bandId: string }> {
    const band = TAX_BANDS.find(b => 
      b.lgaId === lgaId && 
      turnover.amount >= b.minTurnover && 
      turnover.amount <= b.maxTurnover
    );

    if (!band) {
      // Default to the highest band if none found or handle as error
      const defaultBand = TAX_BANDS[TAX_BANDS.length - 1];
      return {
        tax: { amount: defaultBand.taxAmount, currency: 'NGN' },
        bandId: defaultBand.id
      };
    }

    return {
      tax: { amount: band.taxAmount, currency: 'NGN' },
      bandId: band.id
    };
  }
}
