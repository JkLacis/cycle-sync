// =====================================================================
// Cycle Sync — app content (text only, no logic)
//
// Edit wording here; app.js only renders it.
// Phase suggestions are our own paraphrases inspired by *In the FLO* (Alisa Vitti) —
// never copy the book's text. Page refs point to reference/in-the-flo.pdf (local only).
// Evidence for phase-based work/exercise/food advice is limited: keep everything
// phrased as suggestions, never as health claims. See reference/CONTENT_NOTES.md.
//
// Templates: "{phase}", "{powr}", "{tagline}", "{firstMove}", "{firstWork}" are filled
// in by app.js for the current phase.
// =====================================================================

const CONTENT = {
  // Keyed by phase. Order through a cycle is defined in app.js.
  // strengths / watchOuts fill the Alignment cards when today's tasks don't (PDF p. 17–20).
  // focus = Cycle Plan "Phase Focus" tiles. typical = usual phase length (PDF p. 5).
  phases: {
    follicular: {
      name: "Follicular",
      powr: "Prepare",
      icon: "sprout",
      tagline: "Creativity and fresh starts. Energy is rising.",
      move: ["Dance class", "Jumping rope", "Indoor cycling", "Hiking"],
      eat: ["Broccoli and zucchini", "Oats and citrus", "Lentils and eggs", "Fermented foods"],
      work: ["Start new projects", "Brainstorm", "Research new ideas", "Plan the month ahead"],
      strengths: [
        { label: "Big ideas", icon: "bulb" },
        { label: "New projects", icon: "spark" },
        { label: "Planning", icon: "compass" },
      ],
      watchOuts: [
        { label: "Routine admin", icon: "doc" },
        { label: "Over-booking", icon: "calendar" },
        { label: "Late nights", icon: "moon" },
      ],
      focus: [
        { label: "Start new projects", icon: "spark" },
        { label: "Brainstorm", icon: "bulb" },
        { label: "Light cardio", icon: "dumbbell" },
      ],
      typical: "7–10 days",
    },
    ovulatory: {
      name: "Ovulatory",
      powr: "Open Up",
      icon: "sun",
      tagline: "Communication. Energy and confidence are at their peak.",
      move: ["HIIT", "Kettlebells", "Kickboxing", "Power yoga"],
      eat: ["Spinach and red peppers", "Quinoa and berries", "Salmon or shrimp", "Plenty of fibre"],
      work: ["Pitch and present", "Negotiate", "Network", "Have the important conversations"],
      strengths: [
        { label: "Networking", icon: "people" },
        { label: "Big ideas", icon: "bulb" },
        { label: "High energy", icon: "dumbbell" },
      ],
      watchOuts: [
        { label: "Admin work", icon: "doc" },
        { label: "High stress", icon: "bolt" },
        { label: "Energy dips", icon: "moon" },
      ],
      focus: [
        { label: "Networking", icon: "people" },
        { label: "Share ideas", icon: "bulb" },
        { label: "High energy activities", icon: "dumbbell" },
      ],
      typical: "3–4 days",
    },
    luteal: {
      name: "Luteal",
      powr: "Work",
      icon: "leaf",
      tagline: "Completion. Energy gradually winds down.",
      move: ["Weight lifting", "Pilates", "Barre", "Yoga"],
      eat: ["Sweet potato and squash", "Brown rice and chickpeas", "Leafy greens", "Apples and walnuts"],
      work: ["Deep focused work", "Admin", "Wrap up projects", "Review documents"],
      strengths: [
        { label: "Deep work", icon: "target" },
        { label: "Wrapping up", icon: "check" },
        { label: "Strength", icon: "dumbbell" },
      ],
      watchOuts: [
        { label: "New pitches", icon: "presentation" },
        { label: "High stress", icon: "bolt" },
        { label: "Skipping carbs", icon: "leaf" },
      ],
      focus: [
        { label: "Deep work", icon: "target" },
        { label: "Wrap up projects", icon: "check" },
        { label: "Strength training", icon: "dumbbell" },
      ],
      typical: "10–14 days",
    },
    menstrual: {
      name: "Menstrual",
      powr: "Rest",
      icon: "drop",
      tagline: "Rest and reflection. Energy is at its lowest.",
      move: ["Walking", "Yin yoga", "Gentle mat Pilates", "Rest"],
      eat: ["Soups and stews", "Beets and mushrooms", "Kidney beans", "Herbal tea"],
      work: ["Review the past month", "Journal", "Set intentions", "Take breaks"],
      strengths: [
        { label: "Reflection", icon: "pen" },
        { label: "Rest", icon: "moon" },
        { label: "Gentle walks", icon: "leaf" },
      ],
      watchOuts: [
        { label: "Big meetings", icon: "people" },
        { label: "Intense workouts", icon: "dumbbell" },
        { label: "Packed days", icon: "calendar" },
      ],
      focus: [
        { label: "Reflect and journal", icon: "pen" },
        { label: "Rest", icon: "moon" },
        { label: "Gentle walks", icon: "leaf" },
      ],
      typical: "3–7 days",
    },
  },

  // Task types (PDF p. 20 Work FLO). suits → High Sync. avoid → Low Sync is our own inference
  // (the book gives no avoid list). See getSyncLevel() in app.js for the rules.
  taskTypes: {
    pitch:      { label: "Pitch / presentation",          short: "Presenting",  icon: "presentation", suits: ["ovulatory"],               avoid: ["menstrual"] },
    networking: { label: "Networking / key conversation", short: "Networking",  icon: "people",       suits: ["ovulatory"],               avoid: ["menstrual"] },
    meeting:    { label: "Meeting / check-in",            short: "Meetings",    icon: "chat",         suits: [],                          avoid: ["menstrual"] },
    brainstorm: { label: "Brainstorm / new project",      short: "Big ideas",   icon: "bulb",         suits: ["follicular"],              avoid: ["luteal"] },
    planning:   { label: "Planning / research",           short: "Planning",    icon: "compass",      suits: ["follicular"],              avoid: [] },
    deepwork:   { label: "Deep work / admin",             short: "Admin work",  icon: "doc",          suits: ["luteal"],                  avoid: [] },
    wrapup:     { label: "Wrap-up / finishing",           short: "Wrapping up", icon: "check",        suits: ["luteal"],                  avoid: ["follicular"] },
    review:     { label: "Review / reflection",           short: "Reflection",  icon: "pen",          suits: ["menstrual"],               avoid: ["ovulatory"] },
    hiit:       { label: "High-intensity workout",        short: "High energy", icon: "dumbbell",     suits: ["follicular", "ovulatory"], avoid: ["menstrual"] },
    strength:   { label: "Strength / Pilates / yoga",     short: "Strength",    icon: "target",       suits: ["luteal"],                  avoid: [] },
    rest:       { label: "Rest / gentle walk",            short: "Rest",        icon: "leaf",         suits: ["menstrual"],               avoid: [] },
  },

  coach: {
    // Chips + keyword matching for typed questions.
    // reply: { text, list? (a phase field: "work" | "eat" | "move"), after?, session? } or byPhase.
    topics: [
      {
        id: "focus",
        question: "How can I stay focused today?",
        keywords: ["focus", "work", "productive", "concentrat", "task"],
        reply: { text: "You're in your {phase} phase ({powr}). Good fits for today:", list: "work" },
      },
      {
        id: "eat",
        question: "What should I eat?",
        keywords: ["eat", "food", "meal", "hungry", "snack", "nutrition", "cook"],
        reply: { text: "Some ideas for your {phase} phase:", list: "eat", after: "Suggestions only. Eat what feels good for you." },
      },
      {
        // Boundaries in Luteal/Menstrual, intentions and outreach in Follicular/Ovulatory (PDF p. 16–18).
        id: "boundaries",
        question: "Help me set boundaries",
        keywords: ["boundar", "say no", "overwhelm", "busy", "stress", "intention"],
        reply: {
          byPhase: {
            follicular: {
              text: "Your energy is rising, so it's a good time to set intentions. Write down what you'll say yes to this cycle, and what you'll leave out.",
              after: 'If something doesn\'t fit, try: "I\'d love to help once this project is launched."',
            },
            ovulatory: {
              text: "A great time to reach out. Pick one person to contact today: a mentor, a client or a colleague.",
              after: 'Try: "I\'d love 20 minutes to share an idea with you." Say yes to the conversations that matter, and no to the rest.',
            },
            luteal: {
              text: "Protect your focus this week. Block time for deep work and keep meetings short.",
              after: 'Try: "I can\'t take this on this week, but I can look at it on Monday."',
            },
            menstrual: {
              text: "Give yourself room to rest. Keep today light and move what can wait.",
              after: 'Try: "I\'m keeping today light. Can we move this to next week?"',
            },
          },
        },
      },
      {
        id: "breathing",
        question: "A quick breathing exercise",
        keywords: ["breath", "calm", "anxious", "relax", "reset"],
        reply: { text: "Let's slow down for two minutes. Breathe in for 4, out for 6.", session: "calm" },
      },
    ],
    fallback: {
      text: "I'm a demo coach, so I can help with a few things:",
      list: ["Staying focused", "What to eat", "Setting boundaries", "A quick breathing exercise"],
      after: "Tap a question above to try one.",
    },
    // Suggested for You. The breathing pattern is not from the PDF; no health claims made.
    sessions: [
      {
        id: "calm", title: "Calm your mind", minutes: 2, art: "water",
        tips: ["Sit comfortably and relax your shoulders.", "Let each breath out be a little longer.", "{phase} phase: {tagline}"],
      },
      {
        id: "energy", title: "Boost energy", minutes: 3, art: "sunrise",
        tips: ["Stand up and roll your shoulders.", "Take a few brisk steps between breaths.", "Movement idea for your {phase} phase: {firstMove}."],
      },
      {
        id: "goals", title: "Set clear goals", minutes: 2, art: "notebook",
        tips: ["Write down one goal for today.", "Keep it small and specific.", "Good fit for your {phase} phase: {firstWork}."],
      },
      {
        id: "sleep", title: "Better sleep", minutes: 3, art: "mountains",
        tips: ["Dim the lights and put your phone away.", "Let your breath out be slow and long.", "A warm, caffeine-free drink can help you wind down."],
      },
    ],
  },

  // Settings → Integrations (names only; nothing is connected in this prototype).
  integrations: [
    { id: "whatsapp", name: "WhatsApp" },
    { id: "gcal", name: "Google Calendar" },
    { id: "apple", name: "Apple Health" },
    { id: "outlook", name: "Outlook" },
    { id: "garmin", name: "Garmin" },
    { id: "oura", name: "Oura" },
  ],

  // Settings → Help & FAQs. Answers may contain simple HTML (<em>).
  faq: [
    {
      q: "What is cycle syncing?",
      a: "Planning your work, movement and food around the four phases of your cycle. Cycle Sync suggests what might suit each phase.",
    },
    {
      q: "Is this medical advice?",
      a: "No. Cycle Sync is for general wellness only. It is not medical advice and not for contraception. Talk to a doctor about any health concerns.",
    },
    {
      q: "Where is my data stored?",
      a: "Only on this device, in your browser. There is no account and no server.",
    },
    {
      q: "Is the AI Coach real AI?",
      a: "Not yet. The coach gives pre-written suggestions based on your phase.",
    },
    {
      q: "Where do the suggestions come from?",
      a: "They are inspired by <em>In the FLO</em> by Alisa Vitti, written in our own words. Evidence for cycle syncing is still limited, so treat them as ideas, not rules.",
    },
  ],
};
