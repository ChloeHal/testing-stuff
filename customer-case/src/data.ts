export const CASE = {
  label: "CUSTOMER CASE",
  headline1: "Proven in catering.",
  headline2: "Designed to adapt to any business.",
  company: "Freddy Met Curry",
  subtitle: "What Freddy Met Curry achieved",
  quote:
    "We decided to integrate an ERP to replace our spreadsheets, but our production planning never matched reality. And communication between sales and logistics was always hell. Today with Enobase, our teams finally collaborate on the same platform, the way that we actually work. In catering, we're always under pressure. Enobase doesn't only get software out of our way. It actually helps us run the business.",
  stats: [
    {
      value: 3,
      suffix: "×",
      headline: "more events handled.",
      detail:
        "Because planning, inventory, and staffing update together.",
    },
    {
      value: 15,
      suffix: "",
      headline: "hours saved every week.",
      detail:
        "Because coordination isn't done by hand anymore.",
    },
    {
      value: 12,
      suffix: "%",
      headline: "less waste.",
      detail:
        "Because forecasts, orders, and production finally agree.",
    },
  ],
} as const;

export type Stat = (typeof CASE.stats)[number];
