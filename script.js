document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================
     CONFIG
  ========================== */
  const SECRET_PASSWORD = "forever";

  /* =========================
     ELEMENTS
  ========================== */
  const screens = document.querySelectorAll(".screen");
  const passwordForm = document.getElementById("passwordForm");
  const passwordInput = document.getElementById("passwordInput");
  const passwordMessage = document.getElementById("passwordMessage");

  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const choiceArea = document.getElementById("choiceArea");
  const teaseText = document.getElementById("teaseText");

  const surpriseBtn = document.getElementById("surpriseBtn");
  const surprise = document.getElementById("surprise");
  const restartBtn = document.getElementById("restartBtn");

  const toast = document.getElementById("toast");
  const confettiLayer = document.getElementById("confettiLayer");
  const bgHearts = document.querySelector(".bg-hearts");

  let teaseIndex = 0;
  let toastTimer = null;
  let noMoveCount = 0;

  const teaseMessages = [
    "Nice try. 😭",
    "That button suddenly got shy...",
    "Nope. Try again. 😂",
    "Are you REALLY sure?",
    "The website disagrees. 💀",
    "You know the correct answer. 👀",
    "Okay, you're making this difficult now. 😭❤️"
  ];
  /* ================================
     MEMORY PHOTO POPUP
  ================================ */

  const memoryData = [
      {
          image: "images/memory1.jpg",
          text: "Some moments are meant to stay with us forever. ❤️"
      },
      {
          image: "images/memory2.jpg",
          text: "A little memory that I will always keep close. 🫶🏻"
      },
      {
          image: "images/memory3.jpg",
          text: "One of those moments that makes me smile every time. ❤️"
      }
  ];

  function openMemory(index) {
      const modal = document.getElementById("memoryModal");
      const modalImg = document.getElementById("memoryPopupImage");
      const text = document.getElementById("memoryPopupText");

      modalImg.src = memoryData[index].image;
      text.textContent = memoryData[index].text;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
  }

  function closeMemory() {
      const modal = document.getElementById("memoryModal");
      modal.classList.remove("active");
      document.body.style.overflow = "";
  }

  /* ================================
     MEMORY POPUP EVENT LISTENERS
  ================================ */

  const memoryArticles = document.querySelectorAll('.memory');

  memoryArticles.forEach((article, index) => {
      article.addEventListener('click', () => {
          openMemory(index); 
      });
  });

  const memoryOverlay = document.querySelector('.memory-overlay');
  const memoryCloseBtn = document.querySelector('.memory-close');

  if (memoryOverlay) {
      memoryOverlay.addEventListener('click', closeMemory);
  }

  if (memoryCloseBtn) {
      memoryCloseBtn.addEventListener('click', closeMemory);
  }



  /* =========================
     SCREEN NAVIGATION
  ========================== */
  function showScreen(id) {
    const target = document.getElementById(id);
    if (!target) return;

    screens.forEach((screen) => {
      screen.classList.toggle("active", screen === target);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      showScreen(button.dataset.next);
    });
  });

  /* =========================
     PASSWORD
  ========================== */
  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const entered = passwordInput.value.trim();

    if (!entered) {
      setPasswordMessage("You forgot the password already? 😭❤️", "error");
      passwordInput.focus();
      return;
    }

    if (entered.toLowerCase() === SECRET_PASSWORD.toLowerCase()) {
      setPasswordMessage("Access granted. Welcome ❤️", "success");
      createConfetti();
      showToast("Secret unlocked ❤️");

      setTimeout(() => {
        showScreen("home");
      }, 500);
      return;
    }

    setPasswordMessage("Hmm... that's not it. Try again 😏❤️", "error");
    passwordInput.value = "";
    passwordInput.focus();

    if ("vibrate" in navigator) {
      navigator.vibrate(70);
    }
  });

  function setPasswordMessage(message, type = "") {
    passwordMessage.textContent = message;
    passwordMessage.className = `password-hint${type ? ` ${type}` : ""}`;
  }

  /* =========================
     PLAYFUL NO BUTTON
  ========================== */
  function moveNoButton() {
    if (!choiceArea || !noBtn) return;

    const areaRect = choiceArea.getBoundingClientRect();
    const buttonRect = noBtn.getBoundingClientRect();

    // Keep the button completely inside the play area.
    const padding = 4;
    const maxX = Math.max(
      padding,
      areaRect.width - buttonRect.width - padding
    );
    const maxY = Math.max(
      padding,
      areaRect.height - buttonRect.height - padding
    );

    const x = padding + Math.random() * Math.max(0, maxX - padding);
    const y = padding + Math.random() * Math.max(0, maxY - padding);

    noBtn.style.position = "absolute";
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;

    teaseText.textContent =
      teaseMessages[teaseIndex % teaseMessages.length];
    teaseIndex += 1;
    noMoveCount += 1;

    if (noMoveCount % 3 === 0) {
      showToast("The 'No' button is getting nervous 😂");
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(25);
    }
  }

  ["pointerenter", "touchstart"].forEach((eventName) => {
    noBtn.addEventListener(
      eventName,
      (event) => {
        if (eventName === "touchstart") event.preventDefault();
        moveNoButton();
      },
      { passive: eventName !== "touchstart" }
    );
  });

  noBtn.addEventListener("click", (event) => {
    event.preventDefault();
    moveNoButton();
  });

  /* =========================
     YES BUTTON
  ========================== */
  yesBtn.addEventListener("click", () => {
    createConfetti();
    showToast("I knew it! ❤️");

    setTimeout(() => {
      showScreen("afterYes");
    }, 400);
  });

  /* =========================
     SURPRISE
  ========================== */
  surpriseBtn.addEventListener("click", () => {
    if (surprise.classList.contains("show")) return;

    surprise.classList.add("show");
    surprise.setAttribute("aria-hidden", "false");

    surpriseBtn.querySelector("span").textContent = "Okay... now you know";
    surpriseBtn.querySelector("b").textContent = "😭❤️";
    surpriseBtn.disabled = true;
    surpriseBtn.style.opacity = "0.72";

    createConfetti();
    showToast("Surprise unlocked 💖");
  });

  /* =========================
     RESTART
  ========================== */
  restartBtn.addEventListener("click", () => {
    passwordInput.value = "";
    setPasswordMessage("Hint: it's something only we know. ❤️");

    surprise.classList.remove("show");
    surprise.setAttribute("aria-hidden", "true");

    surpriseBtn.querySelector("span").textContent = "Open your surprise";
    surpriseBtn.querySelector("b").textContent = "💌";
    surpriseBtn.disabled = false;
    surpriseBtn.style.opacity = "1";

    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    teaseText.textContent = "";
    teaseIndex = 0;
    noMoveCount = 0;

    showScreen("passwordScreen");
    setTimeout(() => passwordInput.focus(), 250);
  });

  /* =========================
     TOAST
  ========================== */
  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 1900);
  }

  /* =========================
     FLOATING HEARTS
  ========================== */
  function createFloatingHearts() {
    if (!bgHearts) return;

    const symbols = ["♡", "♥", "❤", "✦", "·"];
    const fragment = document.createDocumentFragment();

    // Fewer effects on small screens = smoother performance.
    const count = window.matchMedia("(max-width: 700px)").matches ? 13 : 20;

    for (let i = 0; i < count; i += 1) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";

      heart.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      heart.style.setProperty("--left", `${Math.random() * 100}%`);
      heart.style.setProperty("--size", `${12 + Math.random() * 21}px`);
      heart.style.setProperty("--duration", `${9 + Math.random() * 10}s`);
      heart.style.animationDelay = `${Math.random() * 10}s`;

      fragment.appendChild(heart);
    }

    bgHearts.replaceChildren(fragment);
  }

  /* =========================
     CONFETTI
  ========================== */
  function createConfetti() {
    if (!confettiLayer) return;

    const symbols = ["♥", "♡", "💗", "💖", "✦", "✧", "•"];
    const fragment = document.createDocumentFragment();

    const count = window.matchMedia("(max-width: 700px)").matches ? 28 : 42;

    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";

      piece.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      piece.style.setProperty("--left", `${Math.random() * 100}%`);
      piece.style.setProperty("--size", `${10 + Math.random() * 18}px`);
      piece.style.animationDelay = `${Math.random() * 0.45}s`;

      fragment.appendChild(piece);
    }

    confettiLayer.appendChild(fragment);

    setTimeout(() => {
      confettiLayer.replaceChildren();
    }, 2700);
  }

  /* =========================
     INITIALIZE
  ========================== */
  createFloatingHearts();
});
