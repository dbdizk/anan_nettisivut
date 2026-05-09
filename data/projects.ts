export type Project = {
  name: string;
  description: string;
  stack: string;
  href: string;
};

export const projects: Project[] = [
  {
    name: "Nordic Atelier",
    description: "Editorial commerce platform focused on slow and intentional design.",
    stack: "Next.js · Shopify · Motion",
    href: "#",
  },
  {
    name: "Mono Journal",
    description: "Typography-heavy publishing interface for long-form storytelling.",
    stack: "TypeScript · MDX · CMS",
    href: "#",
  },
  {
    name: "Signal Rooms",
    description: "Minimal collaboration workspace with subtle real-time feedback loops.",
    stack: "React · WebRTC · Prisma",
    href: "#",
  },
  {
    name: "Frame Zero",
    description: "Concept portfolio for creative agencies with cinematic transitions.",
    stack: "Next.js · Framer Motion",
    href: "#",
  },
];
