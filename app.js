document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // A) CONSENT (I agree)
  // =========================
  const agreeChk = document.getElementById("agreeChk");
  const agreeBtn = document.getElementById("agreeBtn");
  const consentSection = document.getElementById("consent");
  const homeSection = document.getElementById("home");

  function showHome() {
    if (consentSection) consentSection.style.display = "none";
    if (homeSection) homeSection.style.display = "block";
    window.scrollTo(0, 0);
  }

  // If already agreed before, skip consent
  const savedConsent = localStorage.getItem("foodbiolab_consent");
  if (savedConsent) {
    try {
      const c = JSON.parse(savedConsent);
      if (c && c.agreed === true) showHome();
    } catch (_) {}
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

  // =========================
  // B) NAVIGATION: home <-> lab sections
  // =========================
  function hideAllLabs() {
    document.querySelectorAll(".labCard").forEach((sec) => {
      sec.style.display = "none";
    });
  }

  function goToLab(labId) {
    if (homeSection) homeSection.style.display = "none";
    hideAllLabs();
    const sec = document.getElementById(labId);
    if (sec) sec.style.display = "block";
    window.scrollTo(0, 0);
  }

  function backToHome() {
    hideAllLabs();
    if (homeSection) homeSection.style.display = "block";
    window.scrollTo(0, 0);
  }

  // Buttons in home list
  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const labId = btn.getAttribute("data-go");
      if (labId) goToLab(labId);
    });
  });

  // Back buttons in lab sections
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", backToHome);
  });

  // =========================
  // Helpers
  // =========================
  function num(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    return parseFloat(el.value);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // =========================
  // C) LAB 01: Constant mass + Moisture + Protein
  // =========================
  const constOut = document.getElementById("constOut");
  const moistOut = document.getElementById("moistOut");
  const moistNote = document.getElementById("moistNote");
  const protOut = document.getElementById("protOut");
  const autoConclusion = document.getElementById("autoConclusion");

  let lastMoist = null;
  let lastProtein = null;
  let isConst = false;

  function updateConclusion() {
    if (!autoConclusion) return;

    const parts = [];
    if (lastMoist != null) parts.push(`усны агууламж ${lastMoist.toFixed(2)}%`);
    if (lastProtein != null) parts.push(`уургийн агууламж ${lastProtein.toFixed(2)}%`);

    if (parts.length === 0) {
      autoConclusion.textContent = "Дүгнэлт = —";
      return;
    }

    const constTxt = isConst
      ? "Жин тогтмол болсон гэж баталсан."
      : "Жин тогтмол эсэхийг дахин шалгах шаардлагатай.";

    autoConclusion.textContent =
      `Дүгнэлт: Үхрийн махан дээжийн ${parts.join(", ")} байна. ${constTxt} ` +
      `Махан бүтээгдэхүүн нь өндөр биологийн үнэлэмжтэй уураг агуулдаг бөгөөд ` +
      `уургийн хэмжээ нь тэжээллэг чанар, булчингийн өсөлт, эдийн нөхөн төлжилтөд оруулах хувь нэмрийг үнэлэх үндэс болдог.`;
  }

  document.getElementById("btnCheckConst")?.addEventListener("click", () => {
    const m2 = num("m2");
    const m3 = num("m3");
    const tol = num("tol");

    if (!isFinite(m2) || !isFinite(m3) || !isFinite(tol) || tol <= 0) {
      if (constOut) constOut.textContent = "Төлөв = ⚠️ m₂, m₃, босго зөв оруулна уу";
      isConst = false;
      updateConclusion();
      return;
    }

    const diff = Math.abs(m3 - m2);
    isConst = diff <= tol;

    if (constOut) {
      constOut.textContent = isConst
        ? `Төлөв = ✅ Тогтмол жин болсон (|m₃−m₂| = ${diff.toFixed(3)} g)`
        : `Төлөв = ⏳ Тогтмол биш (|m₃−m₂| = ${diff.toFixed(3)} g). Дахин хатааж жинлэнэ.`;
    }
    updateConclusion();
  });

  document.getElementById("btnCalcMoist")?.addEventListener("click", () => {
    const m0 = num("m0");
    const m1 = num("m1");
    const m2 = num("m2");
    const m3 = num("m3");

    if (![m0, m1, m2, m3].every(isFinite)) {
      if (moistOut) moistOut.textContent = "Ус = ⚠️ m₀, m₁, m₂, m₃-ийг бүгдийг оруулна уу";
      if (moistNote) moistNote.textContent = "";
      lastMoist = null;
      updateConclusion();
      return;
    }
    if (m1 <= m0) {
      if (moistOut) moistOut.textContent = "Ус = ⚠️ m₁ нь m₀-оос их байх ёстой";
      if (moistNote) moistNote.textContent = "";
      lastMoist = null;
      updateConclusion();
      return;
    }
    if (m2 <= m0 || m3 <= m0 || m2 > m1 || m3 > m1) {
      if (moistOut) moistOut.textContent = "Ус = ⚠️ m₂/m₃ утга боломжгүй байна (жин шалгана уу)";
      if (moistNote) moistNote.textContent = "";
      lastMoist = null;
      updateConclusion();
      return;
    }

    const mDry = isConst ? m3 : m2; // if not confirmed, use m2 with warning
    const wetSample = m1 - m0;
    const waterLoss = m1 - mDry;

    const moisture = (waterLoss / wetSample) * 100;
    lastMoist = moisture;

    if (moistOut) moistOut.textContent = `Ус = ${moisture.toFixed(2)} %`;
    if (moistNote) {
      moistNote.textContent = isConst
        ? `m_dry = m₃ ашиглав (тогтмол жин). Нойтон дээж = ${wetSample.toFixed(3)} g`
        : `⚠️ Тогтмол жин батлагдаагүй тул m_dry = m₂ түр ашиглав. Дахин хатааж шалгаарай.`;
    }

    updateConclusion();
  });

  document.getElementById("btnCalcProtein")?.addEventListener("click", () => {
    const N = num("nPct");
    const k = num("kFac");

    if (!isFinite(N) || !isFinite(k) || N <= 0 || k <= 0) {
      if (protOut) protOut.textContent = "Уураг = ⚠️ Азот(%) ба коэффициент 0-ээс их байх ёстой";
      lastProtein = null;
      updateConclusion();
      return;
    }

    const protein = N * k;
    lastProtein = protein;

    if (protOut) protOut.textContent = `Уураг = ${protein.toFixed(2)} %`;
    updateConclusion();
  });

  // =========================
  // D) LAB 02: Fat (sausage) by extraction
  // =========================
  // Formula user gave:
  // fat% = (m4 - m3) / (m2 - m1) * 100
  // NOTE: physically sample mass should be (m1-m0) or similar,
  // but we'll follow your provided formula exactly.
  document.getElementById("btnCalcFat")?.addEventListener("click", () => {
    const m0 = num("f_m0");
    const m1 = num("f_m1");
    const m2 = num("f_m2");
    const m3 = num("f_m3");
    const m4 = num("f_m4");

    if (![m0, m1, m2, m3, m4].every(isFinite)) {
      setText("fatOut", "Өөх тос = ⚠️ Бүх m утгыг оруулна уу (m₀–m₄)");
      setText("fatNote", "");
      return;
    }

    // Basic sanity checks
    if (m1 <= m0) {
      setText("fatOut", "Өөх тос = ⚠️ m₁ нь m₀-оос их байх ёстой (дээж нэмэгдсэн жин)");
      setText("fatNote", "");
      return;
    }
    if (m2 > m1 || m2 <= m0) {
      setText("fatOut", "Өөх тос = ⚠️ m₂ буруу байна (хатаалтын дараах жин шалгана уу)");
      setText("fatNote", "");
      return;
    }
    if (m4 < m3) {
      setText("fatOut", "Өөх тос = ⚠️ m₄ нь m₃-оос бага байж болохгүй");
      setText("fatNote", "");
      return;
    }

    const fatMass = m4 - m3;

    const denom = (m2 - m1);
    if (denom === 0) {
      setText("fatOut", "Өөх тос = ⚠️ (m₂ − m₁) = 0 болж байна");
      setText("fatNote", "");
      return;
    }

    const fatPct = (fatMass / denom) * 100;

    setText("fatOut", `Өөх тос = ${fatPct.toFixed(2)} %`);
    setText(
      "fatNote",
      `Ялгарсан өөх тосны жин = (m₄ − m₃) = ${fatMass.toFixed(3)} g`
    );
  });
});
