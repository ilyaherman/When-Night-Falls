
let isNight = true;
const label = document.getElementById("cycleLabel");

function toggleDayNight() {
  isNight = !isNight;

  if (isNight) {
    container.classList.remove("day");
    container.classList.add("night");
    label.textContent = "🌙 Night";
  } else {
    container.classList.remove("night");
    container.classList.add("day");
    label.textContent = "☀️ Day";
  }
}

// Change every 10 seconds (180000 for 3 minutes)
setInterval(toggleDayNight, 10000);