/**
 * SunPeak Solar - Interactive Solar Estimator
 * All calculation assumptions are centralized in SOLAR_ESTIMATE_CONFIG
 * for easy tuning and transparency.
 */

const SOLAR_ESTIMATE_CONFIG = {
  // Approximate average tariff per unit (kWh) in Maharashtra (MSEDCL illustrative bands)
  tariffs: {
    residential: 7.6,
    commercial: 11.4,
    industrial: 8.8,
    society: 8.2
  },
  // Average monthly solar energy generation per kW installed in Western Maharashtra (~4.0 peak sun hours/day)
  monthlyUnitsPerKw: 120,
  // Required shadow-free shadow rooftop area per kW in square feet
  sqftPerKw: {
    min: 80,
    max: 100
  },
  // Typical potential bill reduction range based on daytime usage & net metering
  offsetPercentage: {
    residential: { min: 0.72, max: 0.88 },
    commercial: { min: 0.65, max: 0.82 },
    industrial: { min: 0.60, max: 0.78 },
    society: { min: 0.70, max: 0.85 }
  },
  // Illustrative PM Surya Ghar central assistance for eligible residential systems.
  residentialSubsidy: {
    firstTwoKwPerKw: 30000,
    thirdKwPerKw: 18000,
    eligibleCapacityCapKw: 3
  },
  // Property type labels for user display & WhatsApp inquiry
  propertyLabels: {
    residential: 'Home / Residential Bungalow',
    commercial: 'Commercial / Office / Shop',
    industrial: 'Industrial / Factory Shed',
    society: 'Housing Society Common Area'
  },
  whatsappNumber: '917083330914'
};

function formatIndianNumber(val) {
  return new Intl.NumberFormat('en-IN').format(Math.round(val));
}

function estimateResidentialSubsidy(capacityKw) {
  const scheme = SOLAR_ESTIMATE_CONFIG.residentialSubsidy;
  const eligibleCapacity = Math.min(capacityKw, scheme.eligibleCapacityCapKw);
  const firstSlabCapacity = Math.min(eligibleCapacity, 2);
  const thirdSlabCapacity = Math.max(0, eligibleCapacity - 2);
  return (firstSlabCapacity * scheme.firstTwoKwPerKw) + (thirdSlabCapacity * scheme.thirdKwPerKw);
}

class SolarCalculator {
  constructor() {
    this.billInput = document.getElementById('calc-bill-slider');
    this.billDisplay = document.getElementById('calc-bill-display');
    this.propTypeButtons = document.querySelectorAll('[data-calc-type]');
    this.presetButtons = document.querySelectorAll('[data-calc-preset]');
    
    // Result displays
    this.capDisplay = document.getElementById('calc-res-capacity');
    this.areaDisplay = document.getElementById('calc-res-area');
    this.unitsDisplay = document.getElementById('calc-res-units');
    this.savingsDisplay = document.getElementById('calc-res-savings');
    this.whatsappCta = document.getElementById('calc-whatsapp-cta');
    this.formQuoteCta = document.getElementById('calc-form-cta');

    this.currentType = 'residential';
    this.currentBill = 4000;

    if (this.billInput) {
      this.init();
    }
  }

  init() {
    // Sync slider input
    this.billInput.addEventListener('input', (e) => {
      this.currentBill = parseInt(e.target.value, 10);
      this.updateQuickPresets();
      this.calculate();
    });

    // Property type pills
    this.propTypeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.propTypeButtons.forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        this.currentType = btn.getAttribute('data-calc-type');
        this.calculate();
      });
    });

    // Preset quick chips
    this.presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-calc-preset'), 10);
        this.currentBill = val;
        this.billInput.value = val;
        this.updateQuickPresets();
        this.calculate();
      });
    });

    // Run initial calculation
    this.calculate();
  }

  updateQuickPresets() {
    this.presetButtons.forEach((btn) => {
      const val = parseInt(btn.getAttribute('data-calc-preset'), 10);
      if (val === this.currentBill) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  calculate() {
    const tariff = SOLAR_ESTIMATE_CONFIG.tariffs[this.currentType] || 7.6;
    const unitsPerKw = SOLAR_ESTIMATE_CONFIG.monthlyUnitsPerKw;
    const offsets = SOLAR_ESTIMATE_CONFIG.offsetPercentage[this.currentType] || { min: 0.7, max: 0.85 };

    // Update bill display text
    if (this.billDisplay) {
      this.billDisplay.textContent = `₹${formatIndianNumber(this.currentBill)}`;
    }

    // Estimate monthly units required
    const estUnitsConsumed = this.currentBill / tariff;

    // Calculate required capacity in kWp (step of 0.5 kW)
    let rawCapacity = estUnitsConsumed / unitsPerKw;
    // Keep between minimum 1 kW and reasonable realistic roof cap
    let capacity = Math.max(1, Math.round(rawCapacity * 2) / 2);
    if (capacity > 100) capacity = Math.round(capacity);

    // Rooftop area estimate in sq.ft.
    const areaMin = Math.round(capacity * SOLAR_ESTIMATE_CONFIG.sqftPerKw.min);
    const areaMax = Math.round(capacity * SOLAR_ESTIMATE_CONFIG.sqftPerKw.max);

    // Monthly units generated
    const monthlyUnits = Math.round(capacity * unitsPerKw);

    // Potential bill reduction range
    const saveMin = Math.round(this.currentBill * offsets.min);
    const saveMax = Math.round(this.currentBill * offsets.max);

    // Update UI elements with gentle number animation or smooth update
    if (this.capDisplay) {
      this.capDisplay.textContent = `${capacity} kW`;
    }
    if (this.areaDisplay) {
      this.areaDisplay.textContent = `${formatIndianNumber(areaMin)} – ${formatIndianNumber(areaMax)} sq.ft`;
    }
    if (this.unitsDisplay) {
      this.unitsDisplay.textContent = `~${formatIndianNumber(monthlyUnits)} units/mo`;
    }
    if (this.savingsDisplay) {
      this.savingsDisplay.textContent = `₹${formatIndianNumber(saveMin)} – ₹${formatIndianNumber(saveMax)}`;
    }

    // Update WhatsApp CTA link with pre-filled customer details
    const propName = SOLAR_ESTIMATE_CONFIG.propertyLabels[this.currentType];
    const subsidyEstimate = this.currentType === 'residential'
      ? `₹${formatIndianNumber(estimateResidentialSubsidy(capacity))} (indicative; eligibility and final amount subject to current scheme rules)`
      : 'Eligibility to be confirmed for the selected property type';
    const waText = encodeURIComponent(
      `Hello SunPeak Solar, I used your website calculator.\n\n` +
      `• Property: ${propName}\n` +
      `• Approx. Monthly Bill: ₹${formatIndianNumber(this.currentBill)}\n` +
      `• Estimated System: ~${capacity} kW\n\n` +
      `• PM Surya Ghar Subsidy Estimate: ${subsidyEstimate}\n\n` +
      `I would like to request a free site survey & quotation.`
    );
    if (this.whatsappCta) {
      this.whatsappCta.href = `https://wa.me/${SOLAR_ESTIMATE_CONFIG.whatsappNumber}?text=${waText}`;
    }

    // Also sync the contact form bill & property type if present
    const formBillSelect = document.getElementById('form-bill');
    const formPropSelect = document.getElementById('form-property');
    if (formPropSelect) {
      formPropSelect.value = this.currentType;
    }
    if (formBillSelect) {
      // Find closest option
      if (this.currentBill <= 2000) formBillSelect.value = '₹1,000 – ₹2,500';
      else if (this.currentBill <= 5000) formBillSelect.value = '₹2,500 – ₹5,000';
      else if (this.currentBill <= 10000) formBillSelect.value = '₹5,000 – ₹10,000';
      else if (this.currentBill <= 25000) formBillSelect.value = '₹10,000 – ₹25,000';
      else formBillSelect.value = '₹25,000+';
    }
  }
}

// Instantiate on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SolarCalculator());
} else {
  new SolarCalculator();
}
