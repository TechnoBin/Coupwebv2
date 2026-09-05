document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================
     CONFIG
  ========================== */
  const SECRET_PASSWORD = "forever";

  /* =========================
     ELEMENTS
  ========================== */
  // Auto scroll jump ko rokne ke liye
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
let savedScrollY = 0; // Scroll position hold karne ke liye variable
  
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
  
let surpriseHeartInterval = null;
  let teaseIndex = 0;
  let toastTimer = null;
  let noMoveCount = 0;
  
let fadeInterval = null;
  let memoryScrollY = 0;

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
          text: `Nothing really went according to our first date plan 
But somehow, it all turned out even better than we imagined. Maybe that was God’s plan after all. 

And that beautiful purple sky… it just made an already perfect date feel even more magical. 💜✨`
      },
      {
          image: "images/memory2.jpg",
          text: `We went to this little cafe, had some Maggi and snacks, and somehow everything tasted better just because you were there with me. 

It just felt so good being there with you... and then you gave me that chocolate, making an already sweet moment even sweeter. 😗🍫`
      },
      {
          image: "images/memory3.jpg",
          text: `Our first long trip together, away to the beaches… 
We explored, laughed, stayed up, and did some things uk 😂... 
And remember that eye filter that somehow only worked on me?  Still one of those random moments I love remembering. ❤️`
      },
    { 
      image: "images/memory4.jpg",
       text: `Maybe it was just another cheesecake date, but sitting there with you made it feel like another little chapter of us. 
       Some moments don't need anything grand just you, me, and something sweet to share.`
    }
  ];

  function openMemory(index) {
    const modal = document.getElementById("memoryModal");
    const modalImg = document.getElementById("memoryPopupImage");
    const text = document.getElementById("memoryPopupText");

    const article = memoryArticles[index];

    if (!modal || !modalImg || !text || !article) return;

    savedScrollY = window.scrollY || window.pageYOffset;

    // Remember which card opened the popup
    modal._sourceCard = article;

    // Reset content animations
    modalImg.style.animation = "none";
    text.style.animation = "none";

    // Set memory content
    modalImg.src = memoryData[index].image;
    text.textContent = memoryData[index].text;

    // Open modal first so target dimensions can be measured
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    const animateFromCard = () => {
        const cardRect = article.getBoundingClientRect();
        const popupRect = modal.querySelector(".memory-popup").getBoundingClientRect();
        const popup = modal.querySelector(".memory-popup");

        if (!popup) return;

        // Distance between card center and popup center
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;

        const translateX = cardCenterX - popupCenterX;
        const translateY = cardCenterY - popupCenterY;

        const scaleX = cardRect.width / popupRect.width;
        const scaleY = cardRect.height / popupRect.height;

        // Start exactly from the clicked card
        popup.style.transition = "none";
        popup.style.transformOrigin = "center center";
        popup.style.transform =
            `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        popup.style.opacity = "1";

        // Force browser to register starting position
        void popup.offsetWidth;

        // Smoothly expand into the popup
        requestAnimationFrame(() => {
            popup.style.transition =
                "transform 0.72s cubic-bezier(.16, 1, .3, 1)";
            popup.style.transform =
                "translate(0, 0) scale(1)";
        });

        // Content animation starts slightly after the card expands
        requestAnimationFrame(() => {
            modalImg.style.animation =
                "memoryImageReveal 0.7s cubic-bezier(.22, 1, .36, 1) 0.18s both";

            text.style.animation =
                "memoryTextReveal 0.9s cubic-bezier(.22, 1, .36, 1) 0.32s both, " +
                "memoryTextFloat 4s ease-in-out 1.5s infinite";
        });
    };

    // Wait for image dimensions when needed
    if (modalImg.complete) {
        requestAnimationFrame(animateFromCard);
    } else {
        modalImg.addEventListener("load", animateFromCard, { once: true });
    }

    // Browser history
    history.pushState({ modalOpen: true }, "", window.location.href);
}

function closeMemory(fromPopState = false) {
    const modal = document.getElementById("memoryModal");

    if (!modal || !modal.classList.contains("active")) return;

    const popup = modal.querySelector(".memory-popup");
    const overlay = modal.querySelector(".memory-overlay");
    const sourceCard = modal._sourceCard;

    if (popup && sourceCard) {
        const cardRect = sourceCard.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();

        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const popupCenterX = popupRect.left + popupRect.width / 2;
        const popupCenterY = popupRect.top + popupRect.height / 2;

        const translateX = cardCenterX - popupCenterX;
        const translateY = cardCenterY - popupCenterY;

        const scaleX = cardRect.width / popupRect.width;
        const scaleY = cardRect.height / popupRect.height;

        // 1. Popup ke saath background overlay ko bhi smooth fade-out karo
        if (overlay) {
            overlay.style.transition = "opacity 0.45s ease";
            overlay.style.opacity = "0";
        }

        // 2. Popup ko reverse card ki taraf shrink aur fade-out karo
        popup.style.transition =
            "transform 0.48s cubic-bezier(.4, 0, .2, 1), opacity 0.4s ease";
        popup.style.transform =
            `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        popup.style.opacity = "0";

        setTimeout(() => {
            // 3. Modal ko instantly hide karo taaki koi jump/flash na dikhe
            modal.style.display = "none";
            modal.classList.remove("active");

            // 4. Styles reset karo
            popup.style.transition = "";
            popup.style.transform = "";
            popup.style.opacity = "";

            if (overlay) {
                overlay.style.transition = "";
                overlay.style.opacity = "";
            }

            document.body.style.overflow = "";

            // Next time popup open karne ke liye display restore kar do
            requestAnimationFrame(() => {
                modal.style.display = "";
                window.scrollTo({
                    top: savedScrollY,
                    behavior: "auto"
                });
            });
        }, 480);
    } else {
        modal.classList.remove("active");
        document.body.style.overflow = "";
        window.scrollTo({
            top: savedScrollY,
            behavior: "auto"
        });
    }

    if (!fromPopState && history.state && history.state.modalOpen) {
        history.back();
    }
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
  memoryOverlay.addEventListener("click", () => closeMemory(false));
}

if (memoryCloseBtn) {
  memoryCloseBtn.addEventListener("click", () => closeMemory(false));
}




/* =========================
   SCREEN NAVIGATION & MUSIC
========================== */


function showScreen(id) {
    const target = document.getElementById(id);
    if (!target) return;

    screens.forEach((screen) => {
        screen.classList.toggle("active", screen === target);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // --- Background Music Logic ---
   // --- Background Music Logic ---
const bgMusic = document.getElementById("bgMusic");
const finalMusic = document.getElementById("finalMusic");

// Cancel any previous fade
if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
}

if (id === "memories") {

    // Stop final song
    if (finalMusic) {
        finalMusic.pause();
        finalMusic.currentTime = 0;
    }

    // Play memory song
    if (bgMusic) {
        bgMusic.volume = 1.0;

        bgMusic.play().catch((error) => {
            console.log("Memory music playback prevented:", error);
        });
    }

} else if (id === "message") {

    // Stop memory song
    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    // Play final song
    if (finalMusic) {
        finalMusic.volume = 1.0;

        finalMusic.play().catch((error) => {
            console.log("Final music playback prevented:", error);
        });
    }

} else {

    // Stop both songs on other screens
    if (bgMusic) {
        fadeAudioOut(bgMusic);
    }

    if (finalMusic) {
        finalMusic.pause();
        finalMusic.currentTime = 0;
    }
}
}
function fadeAudioOut(audioElem) {
    if (audioElem.paused) return;

    let volume = audioElem.volume;

    fadeInterval = setInterval(() => {
        volume -= 0.1;

        if (volume <= 0) {
            audioElem.volume = 0;
            audioElem.pause();
            audioElem.currentTime = 0;

            clearInterval(fadeInterval);
            fadeInterval = null;

            return;
        }

        audioElem.volume = volume;
    }, 50);
}

  
  /* =========================
     NEXT BUTTONS
  ========================== */

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

    // Start subtle continuous hearts
    startSurpriseHeartFlow();
    
    showToast("Surprise unlocked 💖");
  });

  /* =========================
     RESTART
  ========================== */
  restartBtn.addEventListener("click", () => {
    if (surpriseHeartInterval) {
    clearInterval(surpriseHeartInterval);
    surpriseHeartInterval = null;
}

const heartFlow = document.getElementById("surpriseHeartFlow");

if (heartFlow) {
    heartFlow.remove();
}
    passwordInput.value = "";
   setPasswordMessage("Hint: The sweetest name I used to call u..😗❤️");

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
     BACK BUTTON HANDLING
  ========================== */
  history.replaceState({ coupweb: true }, "", window.location.href);

  window.addEventListener("popstate", () => {
    const memoryModal = document.getElementById("memoryModal");

    // Agar popup khula hai, toh bas popup close karo aur scroll restore hone do
    if (memoryModal && memoryModal.classList.contains("active")) {
      closeMemory(true); // 'true' batata hai ki browser ka back button daba hai
    }
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
   SURPRISE HEART FLOW
========================= */

function startSurpriseHeartFlow() {
    if (surpriseHeartInterval) return;

    const layer = document.createElement("div");
    layer.className = "surprise-heart-flow";
    layer.id = "surpriseHeartFlow";

    document.body.appendChild(layer);

    function createSmallHeart() {
        const heart = document.createElement("span");

        heart.className = "surprise-floating-heart";

        const symbols = ["♡", "♥", "❤"];

        heart.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];
      const colors = [
    "#ff4f81",
    "#ff6b9a",
    "#ff85ad",
    "#e94f8a",
    "#ffb3c6"
];

heart.style.setProperty(
    "--heart-color",
    colors[Math.floor(Math.random() * colors.length)]
);

        heart.style.setProperty(
            "--left",
            `${10 + Math.random() * 80}%`
        );

        heart.style.setProperty(
            "--size",
            `${14 + Math.random() * 10}px`
        );

        heart.style.setProperty(
            "--duration",
            `${7 + Math.random() * 5}s`
        );

        heart.style.setProperty(
            "--drift",
            `${-25 + Math.random() * 50}px`
        );

        layer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 13000);
    }

    // First heart after a short delay
    setTimeout(createSmallHeart, 1200);

    // Then only ONE small heart every few seconds
    surpriseHeartInterval = setInterval(() => {
        createSmallHeart();
    }, 2200);
}

  /* =========================
     INITIALIZE
  ========================== */
  createFloatingHearts();
});
