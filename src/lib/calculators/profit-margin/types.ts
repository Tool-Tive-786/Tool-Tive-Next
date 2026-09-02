export interface FixedCostInputs {
  shipping: number;
  packaging: number;
  otherFixed: number;
}

export interface PercentageFeeInputs {
  paymentFeePercent: number; // e.g., 2.9 -> 0.029
  marketplaceFeePercent: number;
  advertisingFeePercent: number;
  otherFeePercent: number;
}

export interface MarginCalculationInputs {
  cost: number;
  sellingPrice: number;
  quantity: number;
  discountPercent: number; // e.g., 20 -> 0.20
  fixedCosts: FixedCostInputs;
  percentageFees: PercentageFeeInputs;
}

export interface MarginCalculationResult {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  revenue: number;
  baseCost: number;
  totalFixedCosts: number;
  totalPercentageFees: number;
  totalCost: number;
  profit: number;
  margin: number | null; // null if price is 0
  markup: number | null; // null if baseCost is 0
}

export interface ReversePricingInputs {
  cost: number;
  targetValue: number; // Margin (e.g. 0.4), Markup (e.g. 0.5), or Profit (e.g. 30)
  targetType: 'margin' | 'markup' | 'profit';
  fixedCosts: FixedCostInputs;
  percentageFees: PercentageFeeInputs;
}

export interface ReversePricingResult {
  requiredPrice: number | null; // null if impossible
  expectedProfit: number | null;
  expectedMargin: number | null;
  expectedMarkup: number | null;
  totalFees: number | null;
  errorMessage?: string;
}

export interface ScenarioResult {
  scenarioName: string;
  price: number;
  profit: number;
  margin: number | null;
  markup: number | null;
  totalCost: number;
}
