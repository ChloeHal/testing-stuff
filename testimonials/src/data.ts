export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  badge?: string;
}

export const SECTION_TITLE = "Testimonials";
export const SECTION_HEADLINE = "Current solutions just\ndon't cut it anymore.";

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Basile Pirlot",
    role: "CEO",
    company: "Gimi",
    quote:
      "We had the demand, but not the tools to keep up. The ERP changed everything: we grew from 20 to 31 people, and from \u20AC4M to \u20AC6M in revenue.",
    avatar: "BP",
  },
  {
    id: 2,
    name: "C\u00E9dric de Bellefroid",
    role: "CEO",
    company: "Futurewave",
    quote:
      "We just wanted our invoices and quotes to look like us. Instead, we had to pay $10K to make Odoo stop looking like Odoo.",
    avatar: "CB",
  },
  {
    id: 3,
    name: "Franck-Victor Laurant",
    role: "Co-Founder",
    company: "Wequity",
    quote:
      "We switched from Notion to Odoo as we scaled, but everything is locked in. I need something that works like we do.",
    avatar: "FL",
    badge: "Forbes 30u30",
  },
  {
    id: 4,
    name: "Enzo Mazza",
    role: "Co-founder",
    company: "Gili",
    quote:
      "My ERP thinks I\u2019m selling tables. I sell ginger. Now I\u2019ve got to pretend my products are \u2018parts\u2019 and \u2018assemblies\u2019? I just want to run my business, not translate it into furniture.",
    avatar: "EM",
  },
  {
    id: 5,
    name: "Viviane Schramme",
    role: "CEO",
    company: "Duckmotion",
    quote:
      "Our workflow is what makes us different, but running it on Airtable and Notion is getting messy as we grow. Generic ERPs just don\u2019t get us, and we don\u2019t want to force our team to change everything.",
    avatar: "VS",
  },
  {
    id: 6,
    name: "Martin Crochelet",
    role: "Partner",
    company: "Dualoop",
    quote:
      "We rely heavily on massive spreadsheets, but the fear of breaking something is always there. We need tools that grow safely with our operations.",
    avatar: "MC",
  },
  {
    id: 7,
    name: "Sebastien Germeau",
    role: "MP",
    company: "FinSquare",
    quote:
      "We want an ERP that doesn\u2019t require us to pay at every version update.",
    avatar: "SG",
  },
];
