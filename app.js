// SafetyFoodBioChem-Lab-Step 2
// Consent (I agree) logic ONLY

const agreeChk = document.getElementById("agreeChk");
const agreeBtn = document.getElementById("agreeBtn");
const consentSection = document.getElementById("consent");
const homeSection = document.getElementById("home");

if (agreeChk && agreeBtn) {
  agreeChk.addEventListener("change", () => {
    agreeBtn.disabled = !agreeChk.checked;
  });

  agreeBtn.addEventListener("click", () => {
    // хадгалах
    localStorage.setItem(
      "SafetyFoodBio-Lab_consent",
      JSON.stringify({ agreed: true, time: new Date().toISOString() })
    );

    // зааврыг нууж, дараагийн хэсгийг харуулна
    consentSection.style.display = "none";
    homeSection.style.display = "block";
  });
}

// өмнө нь зөвшөөрсөн бол шууд оруулах
const saved = localStorage.getItem("SafetyFoodBioChem-Lab_consent");
if (saved) {
  try {
    const data = JSON.parse(saved);
    if (data.agreed) {
      consentSection.style.display = "none";
      homeSection.style.display = "block";
    }
  } catch (e) {}
}
