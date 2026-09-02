import {
  FixedCostInputs,
  PercentageFeeInputs,
  MarginCalculationInputs,
  MarginCalculationResult,
  ReversePricingInputs,
  ReversePricingResult,
  ScenarioResult
} from './types';

// Pure utility functions
export function calculateDiscountedPrice(price: number, discountPercent: number): number {
  if (discountPercent <= 0) return price;
  return price * (1 - discountPercent);
}

export function calculateRevenue(price: number, quantity: number): number {
  return price * quantity;
}

export function sumFixedCosts(baseCost: number, fixed: FixedCostInputs): number {
  return baseCost + (fixed.shipping || 0) + (fixed.packaging || 0) + (fixed.otherFixed || 0);
}

export function sumPercentageFees(fees: PercentageFeeInputs): number {
  return (fees.paymentFeePercent || 0) + (fees.marketplaceFeePercent || 0) + (fees.advertisingFeePercent || 0) + (fees.otherFeePercent || 0);
}

export function calculateFeeAmount(price: number, sumOfFees: number): number {
  return price * sumOfFees;
}

export function calculateProfit(revenue: number, totalCost: number): number {
  return revenue - totalCost;
}

export function calculateMargin(profit: number, revenue: number): number | null {
  if (revenue === 0) return null;
  return (profit / revenue);
}

export function calculateMarkup(profit: number, cost: number): number | null {
  if (cost === 0) return null;
  return (profit / cost);
}

export function calculateMarginMode(inputs: MarginCalculationInputs): MarginCalculationResult {
  const { cost, sellingPrice, quantity, discountPercent, fixedCosts, percentageFees } = inputs;

  const originalPrice = sellingPrice;
  const discountedPrice = calculateDiscountedPrice(sellingPrice, discountPercent);
  const discountAmount = originalPrice - discountedPrice;
  
  const revenuePerUnit = discountedPrice;
  const totalRevenue = calculateRevenue(revenuePerUnit, quantity);
  
  const totalFixedCostsPerUnit = sumFixedCosts(cost, fixedCosts);
  const sumOfPercentageFees = sumPercentageFees(percentageFees);
  
  const totalPercentageFeesPerUnit = calculateFeeAmount(revenuePerUnit, sumOfPercentageFees);
  const totalCostPerUnit = totalFixedCostsPerUnit + totalPercentageFeesPerUnit;
  const totalCost = totalCostPerUnit * quantity;
  
  const profit = calculateProfit(totalRevenue, totalCost);
  const margin = calculateMargin(profit, totalRevenue);
  
  // Markup is based on base cost per the requirement: "Markup = Profit / Cost * 100"
  // Let's use baseCost for markup denominator as specified.
  // "Markup = Profit / Cost × 100" -> Cost refers to baseCost or totalCost? 
  // Wait, typically markup is on total cost or base cost. The spec says:
  // "TargetMarkup is based on COST. TargetProfit = Cost × TargetMarkup". 
  // Let's assume 'cost' refers to the base cost input.
  const baseCostTotal = cost * quantity;
  const markup = calculateMarkup(profit, baseCostTotal);

  return {
    originalPrice: originalPrice * quantity,
    discountedPrice: discountedPrice * quantity,
    discountAmount: discountAmount * quantity,
    revenue: totalRevenue,
    baseCost: baseCostTotal,
    totalFixedCosts: (totalFixedCostsPerUnit - cost) * quantity, // Just the additional fixed costs
    totalPercentageFees: totalPercentageFeesPerUnit * quantity,
    totalCost,
    profit,
    margin,
    markup
  };
}

export function calculateRequiredPrice(inputs: ReversePricingInputs): ReversePricingResult {
  const { cost, targetValue, targetType, fixedCosts, percentageFees } = inputs;
  
  const fixedCostsTotal = sumFixedCosts(cost, fixedCosts);
  const sumOfPercentageFees = sumPercentageFees(percentageFees);

  let requiredPrice: number | null = null;
  let errorMessage: string | undefined;

  if (targetType === 'margin') {
    if (targetValue + sumOfPercentageFees >= 1) {
      errorMessage = "Target margin plus fee percentages exceed 100% — no price can satisfy this.";
    } else {
      requiredPrice = fixedCostsTotal / (1 - targetValue - sumOfPercentageFees);
    }
  } else if (targetType === 'markup') {
    if (sumOfPercentageFees >= 1) {
      errorMessage = "Percentage-based fees reach or exceed 100% of the selling price — no valid price exists.";
    } else {
      const targetProfit = cost * targetValue;
      requiredPrice = (fixedCostsTotal + targetProfit) / (1 - sumOfPercentageFees);
    }
  } else if (targetType === 'profit') {
    if (sumOfPercentageFees >= 1) {
      errorMessage = "Percentage-based fees reach or exceed 100% of the selling price — no valid price exists.";
    } else {
      requiredPrice = (fixedCostsTotal + targetValue) / (1 - sumOfPercentageFees);
    }
  }

  if (requiredPrice === null) {
    return {
      requiredPrice: null,
      expectedProfit: null,
      expectedMargin: null,
      expectedMarkup: null,
      totalFees: null,
      errorMessage
    };
  }

  const totalFees = calculateFeeAmount(requiredPrice, sumOfPercentageFees);
  const totalCost = fixedCostsTotal + totalFees;
  const expectedProfit = calculateProfit(requiredPrice, totalCost);
  const expectedMargin = calculateMargin(expectedProfit, requiredPrice);
  const expectedMarkup = calculateMarkup(expectedProfit, cost);

  return {
    requiredPrice,
    expectedProfit,
    expectedMargin,
    expectedMarkup,
    totalFees,
    errorMessage
  };
}

export function calculateScenario(
  baseInputs: MarginCalculationInputs,
  scenarioName: string,
  priceMultiplier: number,
  customPrice?: number
): ScenarioResult {
  const price = customPrice !== undefined ? customPrice : baseInputs.sellingPrice * priceMultiplier;
  
  const scenarioInputs: MarginCalculationInputs = {
    ...baseInputs,
    sellingPrice: price
  };

  const result = calculateMarginMode(scenarioInputs);

  return {
    scenarioName,
    price: result.discountedPrice, // Per unit equivalent if quantity = 1
    profit: result.profit,
    margin: result.margin,
    markup: result.markup,
    totalCost: result.totalCost
  };
}

export function getComparisonScenarios(inputs: MarginCalculationInputs): ScenarioResult[] {
  return [
    calculateScenario(inputs, 'Current', 1),
    calculateScenario(inputs, '+10%', 1.1),
    calculateScenario(inputs, '+5%', 1.05),
    calculateScenario(inputs, '-5%', 0.95),
    calculateScenario(inputs, '-10%', 0.9)
  ];
}
