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
  // focus = Cycle Plan "Phase Focus" tiles; section = which list the tile jumps to. typical = usual phase length (PDF p. 5).
  // hormones: PDF p. 9, 17–18. move: Fitness FLO p. 14. eat: Food FLO p. 11–12 (examples). work: Work FLO p. 20.
  phases: {
    follicular: {
      name: "Follicular",
      powr: "Prepare",
      icon: "sprout",
      tagline: "Creativity and fresh starts. Energy is rising.",
      hormones: "Estrogen is rising.",
      move: ["Dance class or cardio dance", "Jumping rope or rebounding", "HIIT", "Indoor cycling", "Hiking"],
      eat: ["Oats and barley", "Broccoli, carrots and zucchini", "Green peas and lentils", "Avocado and citrus fruit", "Eggs and chicken", "Sauerkraut and pickles"],
      work: ["Start new projects", "Brainstorm with your team", "Tackle hard problems", "Research new ideas", "Seek out new clients", "Plan the month ahead"],
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
        { label: "Start new projects", icon: "spark", section: "work" },
        { label: "Brainstorm", icon: "bulb", section: "work" },
        { label: "Light cardio", icon: "dumbbell", section: "move" },
      ],
      typical: "7–10 days",
    },
    ovulatory: {
      name: "Ovulatory",
      powr: "Open Up",
      icon: "sun",
      tagline: "Communication. Energy and confidence are at their peak.",
      hormones: "Estrogen is at its highest.",
      move: ["HIIT class", "Kettlebells", "Boot camp", "Kickboxing", "Indoor cycling", "Power yoga"],
      eat: ["Quinoa and corn", "Spinach, red peppers and asparagus", "Tomatoes and chard", "Berries, figs and apricots", "Red lentils and almonds", "Salmon or shrimp"],
      work: ["Pitch, negotiate and present", "Have the important conversations", "Ask for a raise or promotion", "Go to networking events", "Share your work publicly", "Give talks"],
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
        { label: "Networking", icon: "people", section: "work" },
        { label: "Share ideas", icon: "bulb", section: "work" },
        { label: "High energy activities", icon: "dumbbell", section: "move" },
      ],
      typical: "3–4 days",
    },
    luteal: {
      name: "Luteal",
      powr: "Work",
      icon: "leaf",
      tagline: "Completion. Energy gradually winds down.",
      hormones: "Progesterone is at its highest.",
      move: ["Weight lifting", "Pilates", "Barre", "Yoga", "Shorter HIIT early in the phase"],
      eat: ["Brown rice and millet", "Sweet potato and squash", "Cauliflower, cabbage and leafy greens", "Apples, pears and dates", "Chickpeas and walnuts", "Turkey, beef or cod"],
      work: ["Deep focused work", "Admin and paperwork", "Review documents and reports", "Wrap up projects", "Help your team hit deadlines", "Organise your files"],
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
        { label: "Deep work", icon: "target", section: "work" },
        { label: "Wrap up projects", icon: "check", section: "work" },
        { label: "Strength training", icon: "dumbbell", section: "move" },
      ],
      typical: "10–14 days",
    },
    menstrual: {
      name: "Menstrual",
      powr: "Rest",
      icon: "drop",
      tagline: "Rest and reflection. Energy is at its lowest.",
      hormones: "Hormone levels are at their lowest.",
      move: ["Walking", "Yin yoga", "Gentle mat Pilates", "Rest"],
      eat: ["Warm soups and stews", "Buckwheat and wild rice", "Beets, kale and mushrooms", "Seaweed, for example in miso soup", "Blueberries and blackberries", "Kidney or adzuki beans"],
      work: ["Review the past month", "Notice patterns in your planner", "Reassess your goals", "Trust your gut on decisions", "Take frequent breaks", "Take a personal day if you can"],
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
        { label: "Reflect and journal", icon: "pen", section: "work" },
        { label: "Rest", icon: "moon", section: "move" },
        { label: "Gentle walks", icon: "leaf", section: "move" },
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

  // Cycle Plan → phase detail screen.
  phaseDetail: {
    headings: { work: "Work", move: "Move", eat: "Eat" },
    // "Six steps for cyclical planning at work", PDF p. 21 (own wording).
    planTitle: "Plan with your cycle",
    planSteps: [
      "At the end of the month, look ahead at what's due.",
      "Map your phases and place flexible projects where they fit.",
      "Keep fixed deadlines where they fall.",
      "If a task lands in a tougher phase, drop something non-essential and add one small self-care moment.",
      "In meetings, bring the strength of your current phase.",
      "Share the idea with your team.",
    ],
    // McNulty et al. 2020 (Sports Med) and Colenso-Semple et al. 2023 found little or no change in
    // exercise or strength performance across the cycle; no good evidence for phase-specific foods.
    evidence: "Research on phase-based exercise and food is limited, and studies find little or no change in performance across the cycle. Treat these as ideas to try, and go by how you feel.",
    source: "Suggestions inspired by <em>In the FLO</em>. For general wellness only, not medical advice.",
  },

  // Cycle Plan → tap a day in the month calendar.
  daySheet: {
    phaseLine: "Day {day} · {phase} phase (estimated)",
    noTasks: "Nothing planned on this day.",
    addLabel: "Add a task on this day",
    ideasLabel: "See {phase} phase ideas",
  },

  // Alignment → tap the score ring. Points per level live in app.js (SYNC_LEVELS).
  // Honesty note: a 2025 meta-analysis (Jang et al., PLoS One) found no robust cycle-phase
  // changes in cognitive performance — so the score is a planning guide, not a prediction.
  score: {
    title: "How your score works",
    intro: "Your score shows how well today's tasks fit your {phase} phase. Each task gets a level, and the score is their average.",
    levels: {
      high: "Suits this phase",
      good: "Fine in any phase",
      moderate: "Better in another phase",
      low: "Best kept for another phase",
    },
    todayHeading: "Today",
    noTasks: "No tasks today. Add one to get a score.",
    note: "Research hasn't shown that your cycle changes how well you think or work. Treat the score as a planning guide inspired by <em>In the FLO</em>, not a prediction.",
  },

  // Alignment → recovery bar (score below 50). Ideas paraphrased from PDF p. 15 and p. 21 (steps 3–4).
  lighterDay: {
    title: "A lighter day",
    intro: "Today's plan is a tough fit for your {phase} phase. A few gentle ideas:",
    moveTask: "If you can, move “{task}” to your {better} phase.",
    shortenTask: "If you can, keep “{task}” short or move it to another day.",
    tips: [
      "Keep fixed deadlines where they are, and let the rest move.",
      "Drop one non-essential task today.",
      "Add one small moment for yourself, like a walk or an early night.",
    ],
    editLabel: "Edit this task",
    breatheLabel: "2-minute breathing break",
    detailsLabel: "See {phase} phase ideas",
  },

  coach: {
    // Typed questions are matched to the FIRST topic with a keyword in the text, so specific
    // topics come first. chip: true = shown as a question button (in this order).
    // reply: { text, list?, after?, session? } or { byPhase: { phaseKey: reply } }.
    //   list = an array, a phase field ("work" | "eat" | "move") or "planSteps".
    // Extra templates: {day}, {nextPhase}, {nextIn}, {scoreText}, {levels}.
    topics: [
      {
        id: "phase",
        question: "What phase am I in?",
        keywords: ["what phase", "which phase", "my phase", "phase am i", "cycle day", "what day"],
        reply: {
          text: "You're on Day {day} of your cycle, in your {phase} phase ({powr}). {tagline}",
          after: "Next up: {nextPhase} in {nextIn}. Dates are estimates based on your cycle settings.",
        },
      },
      {
        id: "score",
        question: "How is my score calculated?",
        keywords: ["score", "alignment", "calculat"],
        reply: {
          text: "Your score is the average fit of today's tasks for your {phase} phase: {levels}.",
          after: "Today: {scoreText}. Tap the ring on Alignment to see each task.",
        },
      },
      {
        // Energy leaks, PDF p. 16 (own wording).
        id: "overwhelm",
        question: "I feel overwhelmed",
        keywords: ["overwhelm", "too much", "exhausted", "drained", "burn"],
        reply: {
          text: "When everything feels like too much, look at where your energy is leaking. Common ones:",
          list: ["Not getting enough rest", "Skipping movement", "Skipping meals", "Saying yes when you mean no", "Not asking for help", "Worrying about money"],
          after: "Pick one to change this week. If you often feel this way, talk to someone you trust or a doctor.",
          session: "calm",
        },
      },
      {
        id: "plan",
        question: "Help me plan my week",
        keywords: ["plan my", "plan the", "my week", "this week", "schedule"],
        reply: {
          text: "A simple way to plan your week with your cycle:",
          list: "planSteps",
          after: "Your {phase} phase suits: {firstWork}.",
        },
      },
      {
        id: "focus",
        chip: true,
        question: "How can I stay focused today?",
        keywords: ["focus", "work", "productive", "concentrat", "task"],
        reply: { text: "You're in your {phase} phase ({powr}). Good fits for today:", list: "work" },
      },
      {
        id: "eat",
        chip: true,
        question: "What should I eat?",
        keywords: ["eat", "food", "meal", "hungry", "snack", "nutrition", "cook"],
        reply: { text: "Some ideas for your {phase} phase:", list: "eat", after: "Suggestions only. Eat what feels good for you." },
      },
      {
        // Boundaries in Luteal/Menstrual, intentions and outreach in Follicular/Ovulatory (PDF p. 16–18).
        id: "boundaries",
        chip: true,
        question: "Help me set boundaries",
        keywords: ["boundar", "say no", "busy", "stress", "intention"],
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
        chip: true,
        question: "A quick breathing exercise",
        keywords: ["breath", "calm", "anxious", "relax", "reset"],
        reply: { text: "Let's slow down for two minutes. Breathe in for 4, out for 6.", session: "calm" },
      },
    ],
    fallback: {
      text: "I'm a demo coach, so I can help with a few things:",
      list: ["Staying focused", "What to eat", "Setting boundaries", "A quick breathing exercise", "What phase you're in", "How your score works", "Planning your week", "Feeling overwhelmed"],
      after: "Tap a question above, or type one.",
    },
    // Suggested for You. The breathing pattern is not from the PDF; no health claims made.
    clearLabel: "Clear chat",
    cleared: "Chat cleared",
    noHistory: "No chat yet. Ask a question below.",
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

  // Settings → Integrations. Nothing is connected in this prototype: tapping a card explains what it
  // will do. demoConnected = shown as "Connected" in ?demo=1 only (matches the mockup).
  integrations: [
    { id: "whatsapp", name: "WhatsApp", demoConnected: true, description: "A short summary every morning at 8:00: your phase and how today's plan fits it." },
    { id: "gcal", name: "Google Calendar", demoConnected: true, description: "Bring your Google Calendar events in as tasks, so your score uses your real schedule." },
    { id: "apple", name: "Apple Health", description: "Use sleep and activity data from Apple Health in Track Today." },
    { id: "outlook", name: "Outlook", description: "Bring your Outlook calendar events in as tasks." },
    { id: "garmin", name: "Garmin", description: "Use sleep and activity data from your Garmin watch." },
    { id: "oura", name: "Oura", description: "Use sleep and readiness data from your Oura ring." },
  ],
  integrationSheet: {
    comingSoon: "Coming soon. Nothing is connected or shared in this prototype.",
    demoNote: "Shown as connected for the demo only.",
  },

  // Settings → bell. Weekly insight is built from the user's own cycle dates.
  notifications: {
    title: "Notifications",
    insightTitle: "This week's insight",
    insight: "You're in your {phase} phase ({powr}) until {phaseEnds}. Good for: {goodFor}.",
    insightNext: "Next: {nextPhase} from {nextStarts}, good for {nextGoodFor}.",
    empty: "No notifications. Turn on Weekly insight to get a short outlook each week.",
    estimate: "Dates are estimates.",
  },

  // Settings → Data & privacy → Reset all data.
  resetSheet: {
    title: "Delete all your data?",
    body: "This removes your cycle settings, tasks, check-ins, chat and profile from this device. It can't be undone.",
    confirm: "Delete everything",
    cancel: "Cancel",
  },

  // Settings → Contact us.
  contact: { email: "praphull371@gmail.com", subject: "Cycle Sync" },

  // Settings → Help & FAQs. Answers may contain simple HTML (<em>) and the {levels} template.
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
      q: "How is the score calculated?",
      a: "Each of today's tasks gets a level for your current phase: {levels}. The score is their average. It's a planning guide, not a prediction.",
    },
    {
      // NHS: ovulation usually 10–16 days before the next period; hard to pinpoint.
      q: "How accurate are the phase dates?",
      a: "They are estimates. Cycle Sync assumes ovulation about 14 days before your next period. The NHS notes it usually happens 10 to 16 days before a period and is hard to pinpoint, so don't use this app to prevent or plan a pregnancy.",
    },
    {
      q: "What does the research say?",
      a: "Evidence for cycle syncing is limited. Reviews of many studies found only a trivial change in exercise performance across the cycle (McNulty et al., 2020), no effect on strength training (Colenso-Semple et al., 2023) and no reliable change in thinking skills (Jang et al., 2025). Use the suggestions as ideas, and go by how you feel.",
    },
    {
      q: "Where do the suggestions come from?",
      a: "They are inspired by <em>In the FLO</em> by Alisa Vitti, written in our own words. Evidence for cycle syncing is still limited, so treat them as ideas, not rules.",
    },
  ],
};
