document.addEventListener("DOMContentLoaded", () => {
  const agreeChk = document.getElementById("agreeChk");
  const agreeBtn = document.getElementById("agreeBtn");
  const consentSection = document.getElementById("consent");
  const homeSection = document.getElementById("home");

  // Helper: show home, hide consent
  function goHome() {
    if (consentSection) consentSection.style.display = "none";
    if (homeSection) homeSection.style.display = "block";
  }

  // 1) If already agreed before, skip consent screen
  const saved = localStorage.getItem("foodbiolab_consent");
  if (saved) {
    try {
      const c = JSON.parse(saved);
      if (c && c.agreed === true) {
        goHome();
        return;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  // 2) Default button state
  if (!agreeChk || !agreeBtn) return;
  agreeBtn.disabled = !agreeChk.checked;

  // 3) Enable/disable button based on checkbox
  agreeChk.addEventListener("change", () => {
    agreeBtn.disabled = !agreeChk.checked;
  });

  // 4) On click, save consent and go home
  agreeBtn.addEventListener("click", () => {
    const consent = { agreed: true, time: new Date().toISOString() };
    localStorage.setItem("foodbiolab_consent", JSON.stringify(consent));
    goHome();
  });
});
