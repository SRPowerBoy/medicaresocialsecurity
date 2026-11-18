/* Single source of truth for every figure on the site.
   Update this file once a year, then re-check each "status" note. */
window.SITE_DATA = {
  asOf: "November 18, 2026",

  partB: {
    premium2026: 202.90,
    premium2027: 209.40,
    deductible2026: 283,
    deductible2027: 292,
    partADeductible2026: 1736,
    partADeductible2027: 1776,
    status: "Reported by AARP, FedRateCalc and FedTools, citing CMS (November 17, 2026). Not yet checked on cms.gov."
  },

  cola2027: 0.036,
  colaStatus: "Confirmed on the SSA 2027 COLA fact sheet (ssa.gov).",

  history: [
    { year: 2020, premium: 144.60, deductible: 198, partADeductible: 1408 },
    { year: 2021, premium: 148.50, deductible: 203, partADeductible: 1484 },
    { year: 2022, premium: 170.10, deductible: 233, partADeductible: 1556 },
    { year: 2023, premium: 164.90, deductible: 226, partADeductible: 1600 },
    { year: 2024, premium: 174.70, deductible: 240, partADeductible: 1632 },
    { year: 2025, premium: 185.00, deductible: 257, partADeductible: 1676 },
    { year: 2026, premium: 202.90, deductible: 283, partADeductible: 1736 },
    { year: 2027, premium: 209.40, deductible: 292, partADeductible: 1776 }
  ],
  historyStatus: "Compiled from CMS fact sheets as tabulated by FedRateCalc. Check each year against cms.gov before publishing."
};
