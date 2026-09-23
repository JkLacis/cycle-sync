// ===== Screen switching =====

// Show one screen and hide all the others.
// name is e.g. "today", which matches the section id "screen-today".
function showScreen(name) {
  const screens = document.querySelectorAll(".screen");
  for (const screen of screens) {
    screen.hidden = screen.id !== "screen-" + name;
  }

  // Highlight the matching tab (if this screen has one)
  const tabs = document.querySelectorAll(".tab");
  for (const tab of tabs) {
    tab.classList.toggle("active", tab.dataset.screen === name);
  }
}

// When a tab is tapped, show its screen
const tabs = document.querySelectorAll(".tab");
for (const tab of tabs) {
  tab.addEventListener("click", function () {
    showScreen(tab.dataset.screen);
  });
}

// Start on the Today screen
showScreen("today");
