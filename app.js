document.addEventListener("DOMContentLoaded", () => {
  // ===== Consent logic =====
  const agreeChk = document.getElementById("agreeChk");
  const agreeBtn = document.getElementById("agreeBtn");
  const consentSection = document.getElementById("consent");
  const homeSection = document.getElementById("home");

  function showHome() {
    if (consentSection) consentSection.style.display = "none";
    if (homeSection) homeSection.style.display = "block";
  }

  // If already agreed before, skip consent
  const saved = localStorage.getItem("foodbiolab_consent");
  if (saved) {
    try {
      const c = JSON.parse(saved);
      if (c && c.agreed === true) {
        showHome();
      }
    } catch (e) {}
  }

  if (agreeChk && agreeBtn) {
    agreeBtn.disabled = !agreeChk.checked;

    agreeChk.addEventListener("change", () => {
      agreeBtn.disabled = !agreeChk.checked;
    });

    agreeBtn.addEventListener("click", () => {
      localStorage.setItem(
        "foodbiolab_consent",
        JSON.stringify({ agreed: true, time: new Date().toISOString() })
      );
      showHome();
    });
  }

  // ===== Navigation: home <-> lab sections =====
  function hideAllLabs() {
    document.querySelectorAll(".labCard").forEach(sec => {
      sec.style.display = "none";
    });
  }

  function goToLab(labId) {
    // hide home, show requested lab
    if (homeSection) homeSection.style.display = "none";
    hideAllLabs();
    const sec = document.getElementById(labId);
    if (sec) sec.style.display = "block";
  }

  function backToHome() {
    hideAllLabs();
    if (homeSection) homeSection.style.display = "block";
    // optional: scroll to top for iPhone comfort
    window.scrollTo(0, 0);
  }

  // Buttons in home list
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => {
      const labId = btn.getAttribute("data-go");
      if (labId) goToLab(labId);
    });
  });

  // Back buttons in lab sections
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", backToHome);
  });
});
