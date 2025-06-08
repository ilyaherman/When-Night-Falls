// Get references to DOM elements
const ghost = document.getElementById("ghost");
const bottomBlocker = document.querySelector(".blocker.bottom");
const topBlocker = document.querySelector(".blocker.top");
const barrel = document.getElementById("barrel");
const rune = document.getElementById("rune");
const torchArea = document.getElementById("torchArea");
const painting = document.getElementById("painting");
const seal = document.getElementById("seal");
const container = document.getElementById("container");
const moonlight = document.getElementById("moonlight");

// Initial ghost position and state flags
let posX = 370;
let posY = 800;
let isBottomBlockerUnlocked = false;
let isTopBlockerUnlocked = false;
let isPossessed = false;
let hasRune = false;
let isOrbRevealed = false;
let isOrbTaken = false;
let orbActivated = false;
let isInPainting = false;
let hasSeal = false;
let hasmoonlight = false;

// Position the ghost on screen
ghost.style.left = posX + "px";
ghost.style.top = posY + "px";

// Handle keyboard controls
document.addEventListener("keydown", (e) => {
  const step = 10;
  let newPosX = posX;
  let newPosY = posY;

  // Movement keys
  if (e.key === "ArrowLeft") newPosX -= step;
  if (e.key === "ArrowRight") newPosX += step;
  if (e.key === "ArrowUp") newPosY -= step;
  if (e.key === "ArrowDown") newPosY += step;

  // Interact with torch area (unlock passage)
  if (e.key === "e" || e.key === "E") {
    const torchRect = torchArea.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const torchX = torchRect.left - containerRect.left + 16;
    const torchY = torchRect.top - containerRect.top + 16;
    const ghostCenterX = posX + 32;
    const ghostCenterY = posY + 32;
    const distance = Math.hypot(ghostCenterX - torchX, ghostCenterY - torchY);

    if (distance <= 50) {
      if (!isNight || !orbActivated) {
        showDialog(!isNight ? "Sun’s up — I’m weak." : "Something is still locked.");
      } else {
        isBottomBlockerUnlocked = true;
        bottomBlocker.classList.add("unlocked");
        showDialog("Passage unlocked!");
      }
    }
  }

  // Possess barrel or painting
  if (e.key === "f" || e.key === "F") {
    const barrelRect = barrel.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const barrelCenterX = barrelRect.left - containerRect.left + barrelRect.width / 2;
    const barrelCenterY = barrelRect.top - containerRect.top + barrelRect.height / 2;
    const ghostCenterX = posX + 32;
    const ghostCenterY = posY + 32;
    const distance = Math.hypot(ghostCenterX - barrelCenterX, ghostCenterY - barrelCenterY);

    // Possess barrel if near and it's night
    if (!isPossessed) {
      if (distance <= 60 && isNight) {
        isPossessed = true;
        ghost.style.display = "none";
        if (!hasRune) {
          rune.style.display = "block";
          rune.style.left = `${barrel.offsetLeft + 41}px`;
          rune.style.top = `${barrel.offsetTop - 10}px`;
        }
        showDialog("I'm hidden inside.");
      } else if (distance <= 60 && !isNight) {
        showDialog("Too bright to hide.");
      }
    } else {
      // Leave barrel
      isPossessed = false;
      ghost.style.display = "block";
      rune.style.display = "none";
      posX = barrel.offsetLeft + 40;
      posY = barrel.offsetTop + 30;
      ghost.style.left = posX + "px";
      ghost.style.top = posY + "px";
      showDialog("Back outside.");
    }

    // Enter or leave the painting
    const paintingRect = painting.getBoundingClientRect();
    const paintingCenterX = paintingRect.left - containerRect.left + paintingRect.width / 2;
    const paintingCenterY = paintingRect.top - containerRect.top + paintingRect.height / 2;
    const distancePainting = Math.hypot(ghostCenterX - paintingCenterX, ghostCenterY - paintingCenterY);

    if (!isInPainting && distancePainting <= 60 && isNight) {
      isInPainting = true;
      ghost.style.display = "none";
      showDialog("Inside the frame.");
    } else if (isInPainting) {
      isInPainting = false;
      ghost.style.display = "block";
      posX = painting.offsetLeft + 20;
      posY = painting.offsetTop + 60;
      ghost.style.left = posX + "px";
      ghost.style.top = posY + "px";
      showDialog("Out of the frame.");
    }
  }

  // Pick up rune, orb, or seal
  if (e.key === "g" || e.key === "G") {
    const containerRect = container.getBoundingClientRect();
    const ghostCenterX = posX + 32;
    const ghostCenterY = posY + 32;

    // Absorb rune if visible and nearby
    if (isPossessed && !hasRune && rune.style.display === "block") {
      const runeRect = rune.getBoundingClientRect();
      const runeCenterX = runeRect.left - containerRect.left + runeRect.width / 2;
      const runeCenterY = runeRect.top - containerRect.top + runeRect.height / 2;
      const distance = Math.hypot(ghostCenterX - runeCenterX, ghostCenterY - runeCenterY);

      if (distance <= 60) {
        hasRune = true;
        rune.style.display = "none";
        showDialog("Rune absorbed.");
        return;
      }
    }

    // Absorb energy orb
    const orb = document.getElementById("energyOrb");
    const orbRect = orb.getBoundingClientRect();
    const orbCenterX = orbRect.left - containerRect.left + orbRect.width / 2;
    const orbCenterY = orbRect.top - containerRect.top + orbRect.height / 2;
    const distanceToOrb = Math.hypot(ghostCenterX - orbCenterX, ghostCenterY - orbCenterY);

    if (distanceToOrb <= 60 && !isOrbTaken && isOrbRevealed) {
      orb.style.display = "none";
      isOrbTaken = true;
      orbActivated = true;
      showDialog("Energy absorbed.");
    }

    // Take the seal and unlock upper passage
    const sealRect = seal.getBoundingClientRect();
    const sealX = sealRect.left - containerRect.left + sealRect.width / 2;
    const sealY = sealRect.top - containerRect.top + sealRect.height / 2;
    const distanceToSeal = Math.hypot(ghostCenterX - sealX, ghostCenterY - sealY);

    if (distanceToSeal <= 50 && isNight && isBottomBlockerUnlocked && !hasSeal) {
      hasSeal = true;
      seal.style.display = "none";
      isTopBlockerUnlocked = true;
      topBlocker.classList.add("unlocked");
      showDialog("Seal taken. Passage unlocked!");
    }
  }

  // Reveal orb or lift box
  if (e.key === "q" || e.key === "Q") {
    const energyOrb = document.getElementById("energyOrb");
    const bigBox = document.getElementById("bigBox");

    if (!isOrbRevealed) {
      energyOrb.style.display = "block";
      isOrbRevealed = true;
      showDialog("Something glows beneath.");
    } else if (isOrbTaken && hasRune) {
      bigBox.style.top = "830px";
      showDialog("Box lifted.");
    } else {
      showDialog("The energy still lingers.");
    }
  }

  // Movement boundaries for the ghost
  const ghostWidth = 64;
  const houseWallLeft = 130;
  const houseWallRight = houseWallLeft + 540;
  if (newPosX >= houseWallLeft && newPosX <= houseWallRight - ghostWidth) {
    posX = newPosX;
  }

  const ghostHeight = 64;
  const blockerY = 495;
  const blockerHeight = 240;
  const houseHeight = 980;
  const basementTop = blockerY + blockerHeight;
  const firstFloorTop = blockerY;
  const basementBottom = houseHeight;

  // Vertical movement logic based on unlocked blockers
  if (!isBottomBlockerUnlocked) {
    if (newPosY >= basementTop && newPosY <= basementBottom - ghostHeight) {
      posY = newPosY;
    } else if (newPosY < basementTop) {
      posY = basementTop;
      showDialog("I can't go through the ceiling!");
    } else if (newPosY > basementBottom - ghostHeight) {
      posY = basementBottom - ghostHeight;
    }
  } else if (!isTopBlockerUnlocked) {
    if (newPosY >= firstFloorTop && newPosY <= basementBottom - ghostHeight) {
      posY = newPosY;
    } else if (newPosY < firstFloorTop) {
      posY = firstFloorTop;
    } else if (newPosY > basementBottom - ghostHeight) {
      posY = basementBottom - ghostHeight;
    }
  } else {
    if (newPosY >= 0 && newPosY <= houseHeight - ghostHeight) {
      posY = newPosY;
    } else if (newPosY < 0) {
      posY = 0;
    } else if (newPosY > houseHeight - ghostHeight) {
      posY = houseHeight - ghostHeight;
    }
  }

  ghost.style.left = posX + "px";
  ghost.style.top = posY + "px";
});

// Display dialog box near ghost
function showDialog(text) {
  let dialog = document.querySelector(".dialog");
  if (dialog) dialog.remove();
  dialog = document.createElement("div");
  dialog.className = "dialog";
  dialog.textContent = text;
  container.appendChild(dialog);
  dialog.style.left = `${posX}px`;
  dialog.style.top = `${posY - 40}px`;
  setTimeout(() => {
    if (dialog) dialog.remove();
  }, 2000);
}

// Show or hide the seal depending on night time and conditions
function updateSealVisibility() {
  if (isNight && isBottomBlockerUnlocked && !hasSeal) {
    seal.style.display = "block";
  } else {
    seal.style.display = "none";
  }
}

function updatemoonlight() {
  if (isNight && isTopBlockerUnlocked && !hasmoonlight) {
    moonlight.style.display = "block";
  } else {
    moonlight.style.display = "none";
  }
}

// Check seal visibility every 500ms
setInterval(updateSealVisibility, 500);
setInterval(updatemoonlight, 500);