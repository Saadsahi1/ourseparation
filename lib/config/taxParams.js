// ─────────────────────────────────────────────────────────────────────────────
// TAX PARAMETERS BY YEAR (2005-2025)
// Auto-generated from JSON tax data files
// ─────────────────────────────────────────────────────────────────────────────

const TAX_PARAMS = {

  // ── 2005 ──────────────────────────────────────────────────────────────────
  2005: {
    // Federal income tax
    fedBrackets: [53359, 106717, 165430, 235675, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      8196,
    fedBPAMin:   7376,
    fedBPAThresh: 165430,
    fedBPARange: 70000,
    eligibleDependantCredit: 7656,

    // Ontario income tax
    ontBrackets: [34010, 68020, Infinity],
    ontRates:    [0.0605, 0.0915, 0.1116],
    ontBPA:      6967,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       41100,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        1861.2,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 39000,
    eiRate:         0.0195,
    eiMax:          760.5,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2006 ──────────────────────────────────────────────────────────────────
  2006: {
    // Federal income tax
    fedBrackets: [36378, 72756, 118285, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 118285,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       42100,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        1910.7,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 39000,
    eiRate:         0.0187,
    eiMax:          729.3,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2007 ──────────────────────────────────────────────────────────────────
  2007: {
    // Federal income tax
    fedBrackets: [37178, 74357, 120887, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 120887,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       43700,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        1989.9,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 40000,
    eiRate:         0.018,
    eiMax:          720,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2008 ──────────────────────────────────────────────────────────────────
  2008: {
    // Federal income tax
    fedBrackets: [37885, 75769, 123184, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 123184,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       44900,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2049.3,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 41100,
    eiRate:         0.0173,
    eiMax:          711.03,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2009 ──────────────────────────────────────────────────────────────────
  2009: {
    // Federal income tax
    fedBrackets: [40726, 81452, 126264, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 126264,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       46300,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2118.6,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 42300,
    eiRate:         0.0173,
    eiMax:          731.79,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2010 ──────────────────────────────────────────────────────────────────
  2010: {
    // Federal income tax
    fedBrackets: [40970, 81491, 127021, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 127021,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       47200,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2163.15,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 43200,
    eiRate:         0.0173,
    eiMax:          747.36,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2011 ──────────────────────────────────────────────────────────────────
  2011: {
    // Federal income tax
    fedBrackets: [41544, 83088, 128800, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 128800,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       48300,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2217.6,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 44200,
    eiRate:         0.0178,
    eiMax:          786.76,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2012 ──────────────────────────────────────────────────────────────────
  2012: {
    // Federal income tax
    fedBrackets: [42707, 85414, 132406, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 132406,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       50100,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2306.7,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 45900,
    eiRate:         0.0183,
    eiMax:          839.97,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2013 ──────────────────────────────────────────────────────────────────
  2013: {
    // Federal income tax
    fedBrackets: [43561, 87123, 135054, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 135054,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       51100,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2356.2,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 47400,
    eiRate:         0.0188,
    eiMax:          891.12,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2014 ──────────────────────────────────────────────────────────────────
  2014: {
    // Federal income tax
    fedBrackets: [43953, 87907, 136270, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 136270,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       52500,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2425.5,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 48600,
    eiRate:         0.0188,
    eiMax:          913.68,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2015 ──────────────────────────────────────────────────────────────────
  2015: {
    // Federal income tax
    fedBrackets: [44701, 89401, 138586, Infinity],
    fedRates:    [0.15, 0.22, 0.26, 0.29],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 138586,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       53600,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2479.95,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 49500,
    eiRate:         0.0188,
    eiMax:          930.6,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2016 ──────────────────────────────────────────────────────────────────
  2016: {
    // Federal income tax
    fedBrackets: [45282, 90563, 140388, 200000, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      11865,
    fedBPAMin:   10679,
    fedBPAThresh: 140388,
    fedBPARange: 70000,
    eligibleDependantCredit: 10075,

    // Ontario income tax
    ontBrackets: [49231, 98463, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10085,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       54900,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2544.3,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 50800,
    eiRate:         0.0188,
    eiMax:          955.04,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1607,
    ocbThreshold: 24542,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2017 ──────────────────────────────────────────────────────────────────
  2017: {
    // Federal income tax
    fedBrackets: [45916, 91831, 142353, 202800, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      11865,
    fedBPAMin:   10679,
    fedBPAThresh: 142353,
    fedBPARange: 70000,
    eligibleDependantCredit: 10075,

    // Ontario income tax
    ontBrackets: [49231, 98463, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10085,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       55300,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2564.1,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 51300,
    eiRate:         0.0163,
    eiMax:          836.19,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1607,
    ocbThreshold: 24542,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2018 ──────────────────────────────────────────────────────────────────
  2018: {
    // Federal income tax
    fedBrackets: [46605, 93208, 144489, 205842, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      11865,
    fedBPAMin:   10679,
    fedBPAThresh: 144489,
    fedBPARange: 70000,
    eligibleDependantCredit: 10075,

    // Ontario income tax
    ontBrackets: [49231, 98463, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10085,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       55900,
    cppExemption:  3500,
    cppRate:       0.0495,
    cppMax:        2593.8,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 51700,
    eiRate:         0.0166,
    eiMax:          858.22,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1607,
    ocbThreshold: 24542,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2019 ──────────────────────────────────────────────────────────────────
  2019: {
    // Federal income tax
    fedBrackets: [47630, 95259, 147667, 210371, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      10582,
    fedBPAMin:   9524,
    fedBPAThresh: 147667,
    fedBPARange: 70000,
    eligibleDependantCredit: 8985,

    // Ontario income tax
    ontBrackets: [43906, 87813, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      8995,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 4740,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6067,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     244,
    ontTaxReductionPerChild: 452,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       57400,
    cppExemption:  3500,
    cppRate:       0.051,
    cppMax:        2748.9,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 53100,
    eiRate:         0.0162,
    eiMax:          860.22,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1434,
    ocbThreshold: 21887,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2020 ──────────────────────────────────────────────────────────────────
  2020: {
    // Federal income tax
    fedBrackets: [48535, 97069, 150473, 214368, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      10783,
    fedBPAMin:   9705,
    fedBPAThresh: 150473,
    fedBPARange: 70000,
    eligibleDependantCredit: 9156,

    // Ontario income tax
    ontBrackets: [44740, 89482, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      9166,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 4830,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6182,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     249,
    ontTaxReductionPerChild: 460,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       58700,
    cppExemption:  3500,
    cppRate:       0.0525,
    cppMax:        2898,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 54200,
    eiRate:         0.0158,
    eiMax:          856.36,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1461,
    ocbThreshold: 22303,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2021 ──────────────────────────────────────────────────────────────────
  2021: {
    // Federal income tax
    fedBrackets: [49020, 98040, 151978, 216511, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      10880,
    fedBPAMin:   9792,
    fedBPAThresh: 151978,
    fedBPARange: 70000,
    eligibleDependantCredit: 9238,

    // Ontario income tax
    ontBrackets: [45142, 90287, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      9248,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 4874,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6237,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     251,
    ontTaxReductionPerChild: 464,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       61600,
    cppExemption:  3500,
    cppRate:       0.0545,
    cppMax:        3166.45,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 56300,
    eiRate:         0.0158,
    eiMax:          889.54,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1474,
    ocbThreshold: 22504,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2022 ──────────────────────────────────────────────────────────────────
  2022: {
    // Federal income tax
    fedBrackets: [50197, 100392, 155625, 221708, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      11141,
    fedBPAMin:   10027,
    fedBPAThresh: 155625,
    fedBPARange: 70000,
    eligibleDependantCredit: 9460,

    // Ontario income tax
    ontBrackets: [46226, 92454, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      9470,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 4991,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6387,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     257,
    ontTaxReductionPerChild: 475,

    ontLiftMax:       850,
    ontLiftThreshold: 30000,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       64900,
    cppExemption:  3500,
    cppRate:       0.057,
    cppMax:        3499.8,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 60300,
    eiRate:         0.0158,
    eiMax:          952.74,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1509,
    ocbThreshold: 23044,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2023 ──────────────────────────────────────────────────────────────────
  2023: {
    // Federal income tax
    fedBrackets: [53359, 106717, 165430, 235675, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      11865,
    fedBPAMin:   10679,
    fedBPAThresh: 165430,
    fedBPARange: 70000,
    eligibleDependantCredit: 10075,

    // Ontario income tax
    ontBrackets: [49231, 98463, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10085,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5710,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 7307,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     294,
    ontTaxReductionPerChild: 544,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       66600,
    cppExemption:  3500,
    cppRate:       0.0595,
    cppMax:        3754.45,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 61500,
    eiRate:         0.0163,
    eiMax:          1002.45,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1607,
    ocbThreshold: 24542,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2024 ──────────────────────────────────────────────────────────────────
  2024: {
    // Federal income tax
    fedBrackets: [55867, 111733, 173205, 246752, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      12399,
    fedBPAMin:   11159,
    fedBPAThresh: 173205,
    fedBPARange: 70000,
    eligibleDependantCredit: 10528,

    // Ontario income tax
    ontBrackets: [51446, 102894, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10539,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5554,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 7108,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     286,
    ontTaxReductionPerChild: 529,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       68500,
    cppExemption:  3500,
    cppRate:       0.0595,
    cppMax:        3867.5,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 63200,
    eiRate:         0.0166,
    eiMax:          1049.12,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2739,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 29833,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7787,
    ccbAge6to17: 6570,
    ccbT1:      36502,
    ccbT2:      79087,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        340,
    gstSpouse:      340,
    gstPerChild:    179,
    gstPhaseInBase: 11039,
    gstPhaseOutBase: 44324,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  604,
    caiPerDependent: 151,

    // Ontario Child Benefit (OCB)
    ocbBase:      1680,
    ocbThreshold: 25646,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

  // ── 2025 ──────────────────────────────────────────────────────────────────
  2025: {
    // Federal income tax
    fedBrackets: [57375, 114750, 177882, 253414, Infinity],
    fedRates:    [0.15, 0.205, 0.26, 0.29, 0.33],
    fedBPA:      12747,
    fedBPAMin:   11472,
    fedBPAThresh: 177882,
    fedBPARange: 70000,
    eligibleDependantCredit: 10823,

    // Ontario income tax
    ontBrackets: [52886, 105775, 150000, 220000, Infinity],
    ontRates:    [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
    ontBPA:      10835,

    // Ontario surtax
    ontSurtax1Rate:      0.2,
    ontSurtax1Threshold: 5315,
    ontSurtax2Rate:      0.56,
    ontSurtax2Threshold: 6802,

    // Ontario health premium tiers
    ontHealthPremium: [
      { max: 20000,  base: 0,   rate: 0,    sub: 0      },
      { max: 25000,  base: 0,   rate: 0.06, sub: 20000  },
      { max: 36000,  base: 300, rate: 0,    sub: 0      },
      { max: 38500,  base: 300, rate: 0.06, sub: 36000  },
      { max: 48000,  base: 450, rate: 0,    sub: 0      },
      { max: 48600,  base: 450, rate: 0.25, sub: 48000  },
      { max: 72000,  base: 600, rate: 0,    sub: 0      },
      { max: 72600,  base: 600, rate: 0.25, sub: 72000  },
      { max: 200000, base: 750, rate: 0,    sub: 0      },
      { max: 200600, base: 750, rate: 0.25, sub: 200000 },
      { max: Infinity, base: 900, rate: 0,  sub: 0      },
    ],

    ontTaxReductionBase:     274,
    ontTaxReductionPerChild: 506,

    ontLiftMax:       875,
    ontLiftThreshold: 32500,
    ontLiftRate:      0.05,

    // CPP (Canada Pension Plan)
    cppYMPE:       71300,
    cppExemption:  3500,
    cppRate:       0.0595,
    cppMax:        4034.1,
    cppBaseProp:   0.831933,

    // EI (Employment Insurance)
    eiMaxInsurable: 61500,
    eiRate:         0.0163,
    eiMax:          1002.45,

    // Federal Canada Employment Amount
    canadaEmploymentAmount: 1368,

    // Canada Workers Benefit (CWB)
    cwbMaxBenefit:   2616,
    cwbPhaseInRate:  0.27,
    cwbPhaseInBase:  3000,
    cwbPhaseOutRate: 0.15,
    cwbPhaseOutBase: 28494,

    // Canada Child Benefit (CCB)
    ccbUnder6:  7437,
    ccbAge6to17: 6275,
    ccbT1:      34863,
    ccbT2:      75537,
    ccbR1: [0, 0.07,  0.135, 0.19, 0.23],
    ccbR2: [0, 0.032, 0.057, 0.08, 0.09],

    // GST/HST credit
    gstBase:        325,
    gstSpouse:      325,
    gstPerChild:    171,
    gstPhaseInBase: 10544,
    gstPhaseOutBase: 44342,
    gstPhaseOutRate: 0.05,

    // Climate Action Incentive (CAI)
    caiFirstAdult:  488,
    caiPerDependent: 122,

    // Ontario Child Benefit (OCB)
    ocbBase:      1727,
    ocbThreshold: 26364,
    ocbRate:      0.08,

    // Ontario Trillium Benefit (OTB)
    otbSalesTaxBase:        260,
    otbEnergyBase:          200,
    otbEnergyPropertyTax:   700,
    otbPhaseOutRate:        0.04,
    otbThresholdWithDep:    25000,
  },

};

export function getTaxParams(year = 2025) {
  if (!TAX_PARAMS[year]) {
    console.warn(`Tax parameters for ${year} not found, using 2025 defaults`);
    return TAX_PARAMS[2025];
  }
  return TAX_PARAMS[year];
}
