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
  }); // ===== Lab 01 logic: constant mass + moisture + protein =====
const constOut = document.getElementById("constOut");
const moistOut = document.getElementById("moistOut");
const moistNote = document.getElementById("moistNote");
const protOut = document.getElementById("protOut");
const autoConclusion = document.getElementById("autoConclusion");

let lastMoist = null;
let lastProtein = null;
let isConst = false;
let dryMassUsed = null;

function num(id) {
  return parseFloat(document.getElementById(id)?.value || "NaN");
}

document.getElementById("btnCheckConst")?.addEventListener("click", () => {
  const m2 = num("m2");
  const m3 = num("m3");
  const tol = num("tol");

  if (!isFinite(m2) || !isFinite(m3) || !isFinite(tol) || tol <= 0) {
    constOut.textContent = "Төлөв = ⚠️ m₂, m₃, босго зөв оруулна уу";
    isConst = false;
    return;
  }

  const diff = Math.abs(m3 - m2);
  isConst = diff <= tol;
  dryMassUsed = m3; // тогтмол гэж үзвэл m3 ашиглана

  constOut.textContent = isConst
    ? `Төлөв = ✅ Тогтмол жин болсон (|m₃−m₂| = ${diff.toFixed(3)} g)`
    : `Төлөв = ⏳ Тогтмол биш (|m₃−m₂| = ${diff.toFixed(3)} g). Дахин хатааж жинлэнэ.`;

  updateConclusion();
});

document.getElementById("btnCalcMoist")?.addEventListener("click", () => {
  const m0 = num("m0");
  const m1 = num("m1");
  const m2 = num("m2");
  const m3 = num("m3");

  if (![m0, m1, m2, m3].every(isFinite)) {
    moistOut.textContent = "Ус = ⚠️ m₀, m₁, m₂, m₃-ийг бүгдийг оруулна уу";
    moistNote.textContent = "";
    return;
  }
  if (m1 <= m0) {
    moistOut.textContent = "Ус = ⚠️ m₁ нь m₀-оос их байх ёстой";
    moistNote.textContent = "";
    return;
  }
  if (m2 <= m0 || m3 <= m0 || m2 > m1 || m3 > m1) {
    moistOut.textContent = "Ус = ⚠️ m₂/m₃ утга боломжгүй байна (жин шалгана уу)";
    moistNote.textContent = "";
    return;
  }

  // Хуурай жин: тогтмол гэж үзвэл m3, эс бөгөөс m2-г түр ашиглана (гэхдээ сануулга өгнө)
  const mDry = isConst ? m3 : m2;
  dryMassUsed = mDry;

  const wetSample = m1 - m0;
  const waterLoss = m1 - mDry;

  const moisture = (waterLoss / wetSample) * 100;
  lastMoist = moisture;

  moistOut.textContent = `Ус = ${moisture.toFixed(2)} %`;
  moistNote.textContent = isConst
    ? `m_dry = m₃ ашиглав (тогтмол жин). Нойтон дээж = ${wetSample.toFixed(3)} g`
    : `⚠️ Тогтмол жин батлагдаагүй тул m_dry = m₂ түр ашиглав. Дахин хатааж шалгаарай.`;

  updateConclusion();
});

document.getElementById("btnCalcProtein")?.addEventListener("click", () => {
  const N = num("nPct");
  const k = num("kFac");

  if (!isFinite(N) || !isFinite(k) || N <= 0 || k <= 0) {
    protOut.textContent = "Уураг = ⚠️ Азот(%) ба коэффициент 0-ээс их байх ёстой";
    lastProtein = null;
    updateConclusion();
    return;
  }

  const protein = N * k;
  lastProtein = protein;

  protOut.textContent = `Уураг = ${protein.toFixed(2)} %`;
  updateConclusion();
});

function updateConclusion() {
  if (!autoConclusion) return;

  const parts = [];
  if (lastMoist != null) parts.push(`усны агууламж ${lastMoist.toFixed(2)}%`);
  if (lastProtein != null) parts.push(`уургийн агууламж ${lastProtein.toFixed(2)}%`);

  if (parts.length === 0) {
    autoConclusion.textContent = "Дүгнэлт = —";
    return;
  }

  const constTxt = isConst ? "Жин тогтмол болсон гэж баталсан." : "Жин тогтмол эсэхийг дахин шалгах шаардлагатай.";
  autoConclusion.textContent =
    `Дүгнэлт: Үхрийн махан дээжийн ${parts.join(", ")} байна. ${constTxt} ` +
    `Махан бүтээгдэхүүн нь өндөр биологийн үнэлэмжтэй уураг агуулдаг бөгөөд ` +
    `уургийн хэмжээ нь тэжээллэг чанар, булчингийн өсөлт, эдийн нөхөн төлжилтөд оруулах хувь нэмрийг үнэлэх үндэс болдог.`;
}
});
