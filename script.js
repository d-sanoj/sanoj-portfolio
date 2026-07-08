const navLinks = document.querySelectorAll("[data-nav]");
const sections = document.querySelectorAll("section[id]");
const magneticItems = document.querySelectorAll(".button");
const artifactModal = document.querySelector("#artifactModal");
const artifactPanel = artifactModal?.querySelector(".artifact-modal-panel");
const artifactCloseButtons = document.querySelectorAll("[data-artifact-close]");
const artifactContents = document.querySelectorAll("[data-artifact-modal]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
let lastArtifactTrigger = null;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

const updateActiveNav = () => {
  const headerOffset = 140;
  const currentY = window.scrollY + headerOffset;
  let activeId = "";

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (currentY >= top && currentY < bottom) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", Boolean(activeId) && link.dataset.nav === activeId);
  });
};

let navUpdateFrame = 0;
const requestNavUpdate = () => {
  if (navUpdateFrame) return;

  navUpdateFrame = requestAnimationFrame(() => {
    navUpdateFrame = 0;
    updateActiveNav();
  });
};

updateActiveNav();
window.addEventListener("scroll", requestNavUpdate, { passive: true });
window.addEventListener("resize", requestNavUpdate);

const openArtifactModal = (artifactId, trigger) => {
  if (!artifactModal) return;

  lastArtifactTrigger = trigger;
  let activeTitle = "Artifact details";
  artifactContents.forEach((content) => {
    const isActive = content.dataset.artifactModal === artifactId;
    content.classList.toggle("is-active", isActive);
    if (isActive) {
      activeTitle = content.querySelector("h3")?.textContent || activeTitle;
    }
  });
  artifactModal.setAttribute("aria-label", activeTitle);
  artifactModal.hidden = false;
  document.body.classList.add("modal-open");
  artifactPanel?.focus();
};

const closeArtifactModal = () => {
  if (!artifactModal || artifactModal.hidden) return;

  artifactModal.hidden = true;
  document.body.classList.remove("modal-open");
  lastArtifactTrigger?.focus();
};

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const openButton = event.target.closest("[data-artifact-open]");
  if (openButton) {
    openArtifactModal(openButton.dataset.artifactOpen, openButton);
  }
});

artifactCloseButtons.forEach((button) => {
  button.addEventListener("click", closeArtifactModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeArtifactModal();
  }
});

magneticItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    if (reducedMotion || !supportsFinePointer) return;

    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    item.style.setProperty("--button-x", `${event.clientX - rect.left}px`);
    item.style.setProperty("--button-y", `${event.clientY - rect.top}px`);
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});
