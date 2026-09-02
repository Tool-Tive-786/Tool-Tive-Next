import { calculateMarginMode, calculateRequiredPrice, getComparisonScenarios } from './src/lib/calculators/profit-margin/engine';
import { MarginCalculationInputs, ReversePricingInputs } from './src/lib/calculators/profit-margin/types';

const EPSILON = 0.000001;

function assertClose(actual: number | null, expected: number | null, message: string) {
  if (actual === null && expected === null) return;
  if (actual === null || expected === null || Math.abs(actual - expected) > EPSILON) {
    throw new Error(`Test failed: ${message} - Expected ${expected}, got ${actual}`);
  }
}

function runTests() {
  console.log("Running Profit Margin Calculator Tests...");

  // Case 1
  const inputs1: MarginCalculationInputs = {
    cost: 60, sellingPrice: 100, quantity: 1, discountPercent: 0,
    fixedCosts: { shipping: 0, packaging: 0, otherFixed: 0 },
    percentageFees: { paymentFeePercent: 0, marketplaceFeePercent: 0, advertisingFeePercent: 0, otherFeePercent: 0 }
  };
  const res1 = calculateMarginMode(inputs1);
  assertClose(res1.profit, 40, "Case 1 Profit");
  assertClose(res1.margin, 0.4, "Case 1 Margin");
  assertClose(res1.markup, 40/60, "Case 1 Markup");

  // Case 2
  const inputs2 = { ...inputs1, cost: 0, sellingPrice: 100 };
  const res2 = calculateMarginMode(inputs2);
  assertClose(res2.profit, 100, "Case 2 Profit");
  assertClose(res2.margin, 1.0, "Case 2 Margin");
  assertClose(res2.markup, null, "Case 2 Markup");

  // Case 3
  const inputs3 = { ...inputs1, cost: 0, sellingPrice: 0 };
  const res3 = calculateMarginMode(inputs3);
  assertClose(res3.margin, null, "Case 3 Margin");
  assertClose(res3.markup, null, "Case 3 Markup");

  // Case 4
  const inputs4 = { ...inputs1, cost: 120, sellingPrice: 100 };
  const res4 = calculateMarginMode(inputs4);
  assertClose(res4.profit, -20, "Case 4 Profit");
  assertClose(res4.margin, -0.2, "Case 4 Margin");
  assertClose(res4.markup, -20/120, "Case 4 Markup");

  // Case 5
  const rev1: ReversePricingInputs = {
    cost: 60, targetValue: 0.4, targetType: 'margin',
    fixedCosts: inputs1.fixedCosts, percentageFees: inputs1.percentageFees
  };
  const res5 = calculateRequiredPrice(rev1);
  assertClose(res5.requiredPrice, 100, "Case 5 Required Price");

  // Case 6
  const rev2: ReversePricingInputs = {
    ...rev1, targetValue: 0.5, targetType: 'markup'
  };
  const res6 = calculateRequiredPrice(rev2);
  assertClose(res6.requiredPrice, 90, "Case 6 Required Price");

  // Case 7
  const rev3: ReversePricingInputs = {
    ...rev1, targetValue: 30, targetType: 'profit'
  };
  const res7 = calculateRequiredPrice(rev3);
  assertClose(res7.requiredPrice, 90, "Case 7 Required Price");

  // Case 8
  const rev4: ReversePricingInputs = {
    ...rev1, percentageFees: { ...rev1.percentageFees, paymentFeePercent: 0.029 }
  };
  const res8 = calculateRequiredPrice(rev4);
  assertClose(res8.requiredPrice, 60 / (1 - 0.40 - 0.029), "Case 8 Required Price");

  // Case 9
  const rev5: ReversePricingInputs = {
    ...rev4, targetValue: 30, targetType: 'profit'
  };
  const res9 = calculateRequiredPrice(rev5);
  assertClose(res9.requiredPrice, (60 + 30) / (1 - 0.029), "Case 9 Required Price");

  // Case 10
  const rev6: ReversePricingInputs = {
    ...rev4, targetValue: 0.5, targetType: 'markup'
  };
  const res10 = calculateRequiredPrice(rev6);
  assertClose(res10.requiredPrice, (60 + 30) / (1 - 0.029), "Case 10 Required Price");

  // Case 11
  const rev7: ReversePricingInputs = {
    ...rev1, targetValue: 0.98, targetType: 'margin', percentageFees: { ...rev1.percentageFees, paymentFeePercent: 0.03 }
  };
  const res11 = calculateRequiredPrice(rev7);
  if (res11.requiredPrice !== null) throw new Error("Case 11 should be invalid");

  // Case 12
  const inputs12 = { ...inputs1, cost: 0, sellingPrice: 100, discountPercent: 0.2 };
  const res12 = calculateMarginMode(inputs12);
  assertClose(res12.discountedPrice, 80, "Case 12 Discounted Price");

  console.log("All tests passed successfully!");
}

runTests();
