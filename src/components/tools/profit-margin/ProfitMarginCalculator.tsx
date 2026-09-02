"use client";

import React, { useState, useMemo } from 'react';
import { 
  FixedCostInputs, 
  PercentageFeeInputs, 
  MarginCalculationInputs, 
  ReversePricingInputs 
} from '@/lib/calculators/profit-margin/types';
import { 
  calculateMarginMode, 
  calculateRequiredPrice, 
  getComparisonScenarios 
} from '@/lib/calculators/profit-margin/engine';
import '@/styles/profit-margin-calculator.css';

type Mode = 'margin' | 'target' | 'compare';

export default function ProfitMarginCalculator() {
  const [mode, setMode] = useState<Mode>('margin');
  const [currency, setCurrency] = useState('USD');

  // Basic Inputs
  const [costStr, setCostStr] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [quantityStr, setQuantityStr] = useState('1');
  const [discountStr, setDiscountStr] = useState('');

  // Target Pricing Inputs
  const [targetType, setTargetType] = useState<'margin' | 'markup' | 'profit'>('margin');
  const [targetValueStr, setTargetValueStr] = useState('');

  // Advanced Inputs
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Fixed costs
  const [shippingStr, setShippingStr] = useState('');
  const [packagingStr, setPackagingStr] = useState('');
  const [otherFixedStr, setOtherFixedStr] = useState('');
  
  // Percentage fees
  const [paymentFeeStr, setPaymentFeeStr] = useState('');
  const [marketplaceFeeStr, setMarketplaceFeeStr] = useState('');
  const [advertisingFeeStr, setAdvertisingFeeStr] = useState('');
  const [otherPercentageStr, setOtherPercentageStr] = useState('');

  const num = (str: string) => {
    const val = parseFloat(str);
    return isNaN(val) ? 0 : val;
  };

  const fmtCurrency = (n: number | null) => {
    if (n === null || isNaN(n)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
  };

  const fmtPercent = (n: number | null) => {
    if (n === null || isNaN(n)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format(n);
  };

  const handleReset = () => {
    setCostStr('');
    setPriceStr('');
    setQuantityStr('1');
    setDiscountStr('');
    setTargetValueStr('');
    setShippingStr('');
    setPackagingStr('');
    setOtherFixedStr('');
    setPaymentFeeStr('');
    setMarketplaceFeeStr('');
    setAdvertisingFeeStr('');
    setOtherPercentageStr('');
  };

  // State derivation
  const cost = num(costStr);
  const price = num(priceStr);
  const quantity = Math.max(1, num(quantityStr));
  const discountPercent = num(discountStr) / 100;

  const targetValue = targetType === 'profit' ? num(targetValueStr) : num(targetValueStr) / 100;

  const fixedCosts: FixedCostInputs = {
    shipping: num(shippingStr),
    packaging: num(packagingStr),
    otherFixed: num(otherFixedStr)
  };

  const percentageFees: PercentageFeeInputs = {
    paymentFeePercent: num(paymentFeeStr) / 100,
    marketplaceFeePercent: num(marketplaceFeeStr) / 100,
    advertisingFeePercent: num(advertisingFeeStr) / 100,
    otherFeePercent: num(otherPercentageStr) / 100
  };

  const validationErrors: string[] = [];
  if (costStr && cost < 0) validationErrors.push("Cost cannot be negative.");
  if (priceStr && price < 0) validationErrors.push("Selling price must be greater than or equal to 0.");
  if (quantityStr && quantity <= 0) validationErrors.push("Quantity must be greater than 0.");
  if (num(paymentFeeStr) < 0 || num(marketplaceFeeStr) < 0 || num(advertisingFeeStr) < 0 || num(otherPercentageStr) < 0) {
    validationErrors.push("Percentage fees cannot be negative.");
  }
  const sumOfPercentageFees = Object.values(percentageFees).reduce((a, b) => a + b, 0);
  if (sumOfPercentageFees >= 1) {
    validationErrors.push("Percentage-based fees reach or exceed 100%.");
  }

  const marginInputs: MarginCalculationInputs = {
    cost, sellingPrice: price, quantity, discountPercent, fixedCosts, percentageFees
  };

  const reverseInputs: ReversePricingInputs = {
    cost, targetType, targetValue, fixedCosts, percentageFees
  };

  const marginResult = useMemo(() => calculateMarginMode(marginInputs), [marginInputs]);
  const reverseResult = useMemo(() => calculateRequiredPrice(reverseInputs), [reverseInputs]);
  const compareScenarios = useMemo(() => getComparisonScenarios(marginInputs), [marginInputs]);

  const renderAdvanced = () => (
    <div className="pmc-group" style={{ marginTop: '1rem', background: '#0A0908', padding: '1rem', borderRadius: '8px', border: '1px solid #2a2420' }}>
      <h3>Additional Costs & Fees</h3>
      <div className="pmc-row">
        <div className="pmc-field">
          <label>Shipping (Fixed)</label>
          <input type="number" min="0" step="any" placeholder="0.00" value={shippingStr} onChange={e => setShippingStr(e.target.value)} />
        </div>
        <div className="pmc-field">
          <label>Packaging (Fixed)</label>
          <input type="number" min="0" step="any" placeholder="0.00" value={packagingStr} onChange={e => setPackagingStr(e.target.value)} />
        </div>
      </div>
      <div className="pmc-row">
        <div className="pmc-field">
          <label>Payment Fee (%)</label>
          <input type="number" min="0" step="any" placeholder="e.g. 2.9" value={paymentFeeStr} onChange={e => setPaymentFeeStr(e.target.value)} />
        </div>
        <div className="pmc-field">
          <label>Marketplace Fee (%)</label>
          <input type="number" min="0" step="any" placeholder="0.0" value={marketplaceFeeStr} onChange={e => setMarketplaceFeeStr(e.target.value)} />
        </div>
      </div>
      <div className="pmc-row">
        <div className="pmc-field">
          <label>Advertising CAC (%)</label>
          <input type="number" min="0" step="any" placeholder="0.0" value={advertisingFeeStr} onChange={e => setAdvertisingFeeStr(e.target.value)} />
        </div>
        <div className="pmc-field">
          <label>Other Fixed Cost</label>
          <input type="number" min="0" step="any" placeholder="0.00" value={otherFixedStr} onChange={e => setOtherFixedStr(e.target.value)} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="pmc-wrapper">
      <div className="pmc-panel">
        <div className="pmc-tabs">
          <button className={mode === 'margin' ? 'is-active' : ''} onClick={() => setMode('margin')}>Calculate Margin</button>
          <button className={mode === 'target' ? 'is-active' : ''} onClick={() => setMode('target')}>What Should I Charge?</button>
          <button className={mode === 'compare' ? 'is-active' : ''} onClick={() => setMode('compare')}>Compare Prices</button>
        </div>

        {validationErrors.map((err, i) => (
          <div key={i} className="pmc-error">{err}</div>
        ))}

        <div className="pmc-group">
          <div className="pmc-row">
            <div className="pmc-field">
              <label>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </div>
          </div>
        </div>

        {mode === 'margin' && (
          <div className="pmc-group">
            <div className="pmc-row">
              <div className="pmc-field">
                <label>Cost</label>
                <input type="number" min="0" step="any" placeholder="e.g. 60" value={costStr} onChange={e => setCostStr(e.target.value)} />
              </div>
              <div className="pmc-field">
                <label>Selling Price</label>
                <input type="number" min="0" step="any" placeholder="e.g. 100" value={priceStr} onChange={e => setPriceStr(e.target.value)} />
              </div>
            </div>
            <div className="pmc-row">
              <div className="pmc-field">
                <label>Quantity</label>
                <input type="number" min="1" step="1" placeholder="1" value={quantityStr} onChange={e => setQuantityStr(e.target.value)} />
              </div>
              <div className="pmc-field">
                <label>Discount (%)</label>
                <input type="number" min="0" max="100" step="any" placeholder="0" value={discountStr} onChange={e => setDiscountStr(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {mode === 'target' && (
          <div className="pmc-group">
            <div className="pmc-row">
              <div className="pmc-field">
                <label>Cost</label>
                <input type="number" min="0" step="any" placeholder="e.g. 60" value={costStr} onChange={e => setCostStr(e.target.value)} />
              </div>
              <div className="pmc-field">
                <label>Target Type</label>
                <select value={targetType} onChange={e => setTargetType(e.target.value as any)}>
                  <option value="margin">Target Margin (%)</option>
                  <option value="markup">Target Markup (%)</option>
                  <option value="profit">Target Profit (Amt)</option>
                </select>
              </div>
            </div>
            <div className="pmc-field">
              <label>Target Value</label>
              <input type="number" step="any" placeholder="e.g. 40" value={targetValueStr} onChange={e => setTargetValueStr(e.target.value)} />
            </div>
          </div>
        )}

        {mode === 'compare' && (
          <div className="pmc-group">
            <div className="pmc-row">
              <div className="pmc-field">
                <label>Cost</label>
                <input type="number" min="0" step="any" placeholder="e.g. 60" value={costStr} onChange={e => setCostStr(e.target.value)} />
              </div>
              <div className="pmc-field">
                <label>Current Price</label>
                <input type="number" min="0" step="any" placeholder="e.g. 100" value={priceStr} onChange={e => setPriceStr(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <button className="pmc-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? '- Hide Advanced Costs' : '+ Add Advanced Costs & Fees'}
        </button>

        {showAdvanced && renderAdvanced()}

        <button className="pmc-reset-btn" onClick={handleReset}>Reset Calculator</button>
      </div>

      <div className="pmc-results">
        {mode === 'margin' && (
          <>
            <div className="pmc-big-result">
              <div className="label">Profit Margin</div>
              <div className="value">{cost === 0 && price === 0 ? 'N/A' : fmtPercent(marginResult.margin)}</div>
            </div>
            <div className="pmc-secondary-results">
              <div className="pmc-stat">
                <div className="label">Profit</div>
                <div className="value">{fmtCurrency(marginResult.profit)}</div>
              </div>
              <div className="pmc-stat">
                <div className="label">Markup</div>
                <div className="value">{cost === 0 ? 'N/A' : fmtPercent(marginResult.markup)}</div>
              </div>
            </div>
            <div className="pmc-breakdown">
              <div className="pmc-breakdown-row"><span>Revenue</span><span>{fmtCurrency(marginResult.revenue)}</span></div>
              {marginResult.discountAmount > 0 && <div className="pmc-breakdown-row"><span>Discount</span><span>-{fmtCurrency(marginResult.discountAmount)}</span></div>}
              <div className="pmc-breakdown-row"><span>Base Cost</span><span>{fmtCurrency(marginResult.baseCost)}</span></div>
              {marginResult.totalFixedCosts > 0 && <div className="pmc-breakdown-row"><span>Added Fixed Costs</span><span>{fmtCurrency(marginResult.totalFixedCosts)}</span></div>}
              {marginResult.totalPercentageFees > 0 && <div className="pmc-breakdown-row"><span>Percentage Fees</span><span>{fmtCurrency(marginResult.totalPercentageFees)}</span></div>}
              <div className="pmc-breakdown-row total"><span>Total Cost</span><span>{fmtCurrency(marginResult.totalCost)}</span></div>
            </div>
          </>
        )}

        {mode === 'target' && (
          <>
            {reverseResult.errorMessage ? (
              <div className="pmc-error" style={{ textAlign: 'center', marginTop: '2rem' }}>
                {reverseResult.errorMessage}
              </div>
            ) : (
              <>
                <div className="pmc-big-result">
                  <div className="label">Required Selling Price</div>
                  <div className="value">{fmtCurrency(reverseResult.requiredPrice)}</div>
                  <div style={{ fontSize: '0.85rem', color: '#a09890', marginTop: '0.5rem' }}>
                    Accounts for your selected costs and fees.
                  </div>
                </div>
                <div className="pmc-secondary-results">
                  <div className="pmc-stat">
                    <div className="label">Expected Profit</div>
                    <div className="value">{fmtCurrency(reverseResult.expectedProfit)}</div>
                  </div>
                  <div className="pmc-stat">
                    <div className="label">Expected Margin</div>
                    <div className="value">{fmtPercent(reverseResult.expectedMargin)}</div>
                  </div>
                </div>
                <div className="pmc-breakdown">
                  <div className="pmc-breakdown-row"><span>Base Cost</span><span>{fmtCurrency(cost)}</span></div>
                  <div className="pmc-breakdown-row"><span>Total Fees</span><span>{fmtCurrency(reverseResult.totalFees)}</span></div>
                  <div className="pmc-breakdown-row total"><span>Expected Markup</span><span>{cost === 0 ? 'N/A' : fmtPercent(reverseResult.expectedMarkup)}</span></div>
                </div>
              </>
            )}
          </>
        )}

        {mode === 'compare' && (
          <>
            <div className="pmc-big-result" style={{ marginBottom: '1rem' }}>
              <div className="label">Scenario Comparison</div>
            </div>
            <div className="pmc-scenario-container">
              <table className="pmc-scenario-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Price</th>
                    <th>Profit</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {compareScenarios.map((scen, idx) => (
                    <tr key={idx}>
                      <td>{scen.scenarioName}</td>
                      <td>{fmtCurrency(scen.price)}</td>
                      <td>{fmtCurrency(scen.profit)}</td>
                      <td>{fmtPercent(scen.margin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
