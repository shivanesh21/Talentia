/**
 * ═══════════════════════════════════════════════════════════════
 *  TALENTIA ’26 — CENTRAL EVENT CONFIGURATION
 *  ─────────────────────────────────────────────────────────────────
 *  Organizers: edit ONLY this file to update dates, venue, fees,
 *  contacts, links and copy. No UI code changes needed.
 * ═══════════════════════════════════════════════════════════════
 */

export const TALENTIA_CONFIG = {
  eventName: "TALENTIA ’26",
  shortName: "TALENTIA",
  year: "2026",
  tagline: "Think. Decode. Compete. Conquer.",
  badge: "FIRST YEAR M.Sc. • 2026",
  supportingText: "An immersive inter-event experience for First Year M.Sc. students.",

  about: {
    heading: "WHAT IS TALENTIA?",
    text: "TALENTIA ’26 is an inter-event experience designed for first-year M.Sc. students, bringing together technical thinking, creativity, logical reasoning, precision, and teamwork through six unique challenges.",
    pillars: ["Logic", "Data", "Creativity", "Competition"],
  },

  // ── Editable placeholders: replace bracketed values when confirmed ──
  schedule: {
    date: "[EVENT DATE]",        // e.g. "March 14, 2026"
    time: "[EVENT TIME]",        // e.g. "9:00 AM onwards"
    venue: "[EVENT VENUE]",      // e.g. "M.Sc. Block, Seminar Hall"
  },

  registration: {
    fee: "[FEE]",                            // e.g. "₹100 per event"
    deadline: "[DEADLINE]",                  // e.g. "March 10, 2026"
    eligibility: "First Year M.Sc. Students",
    maxParticipants: "[NUMBER]",             // e.g. "200"
    heading: "READY TO ENTER THE ARENA?",
    subtext: "Choose your challenge and secure your spot at TALENTIA ’26.",
  },

  whatsapp: {
    number: "917092879289", // WhatsApp registration helpline (7092879289, India +91)
    helpTitle: "NEED HELP WITH REGISTRATION?",
    helpText: "For registration assistance, contact our coordinators on WhatsApp.",
    prefilledMessage: "Hi, I would like to know more about TALENTIA ’26 registration.",
  },

  // ── Head coordinators (big display) ──
  headCoordinators: ["Shivanesh", "Sruthi Sakthi", "Vignesh", "Shifana"],

  // ── Event volunteer teams (organizers) ──
  volunteers: [
    { eventId: "binary-quest", members: ["Deepthi", "Naveen Kumar", "Jeydarshana", "Janashree"] },
    { eventId: "data-deductive", members: ["Nandana", "Ranjana", "Kamalika", "Prejit J Santhosh"] },
    { eventId: "aptitude-arena", members: ["Mithra", "Asha Das", "Ridhuvarsini", "Pranav Dev"] },
    { eventId: "flip-frenzy", members: ["Meghaa", "Mounica", "Dhruva", "Arul Ronal", "Sam"] },
    { eventId: "meme-decode", members: ["Aruthra", "Devi Prasath", "Dhruvathara", "John Silva", "Vijayabaskaran"] },
    { eventId: "gift-hunt", members: ["Nethra Devi", "Jayasuryaa", "Vedha", "Dharani Tharan", "Arish"] },
  ],

  photography: ["Dharaneesh N", "Jasper Kins J"],

  social: {
    instagram: "[INSTAGRAM_URL]",
    whatsapp: "[WHATSAPP_CHANNEL_URL]",
    email: "[EMAIL]",
  },

  apiBase: "", // empty = same origin (Vite proxies /api → localhost:5000 in dev)
};

export const isPlaceholder = (v) =>
  typeof v !== "string" || /^\[.*\]$/.test(v.trim());

export const waLink = (number, message = "") => {
  if (isPlaceholder(number)) return "#register";
  const digits = String(number).replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
};

export const whatsappHelpLink = () =>
  waLink(TALENTIA_CONFIG.whatsapp.number, TALENTIA_CONFIG.whatsapp.prefilledMessage);
