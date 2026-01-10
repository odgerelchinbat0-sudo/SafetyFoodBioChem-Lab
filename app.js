document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     1) CONSENT LOGIC
  ====================== */
  const agreeChk = document.getElementById("agreeChk");
  const agreeBtn = document.getElementById("agreeBtn");
  const consentSection = document.getElementById("consent");
  const homeSection = document.getElementById("home");

  function showHome() {
    if (consentSection) consentSection.style.display = "none";
    if (homeSection) homeSection.style.display = "block";
  }

  const saved = localStorage.getItem("foodbiolab_consent");
  if (saved) {
    try {
      const c = JSON.parse(saved);
      if (c?.agreed) showHome();
    } catch {}
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

  /* =====================
     2) NAVIGATION
  ====================== */
  function hideAllLabs() {
    document.querySelectorAll(".labCard").forEach(sec => {
      sec.style.display = "none";
    });
  }

  function goToLab(id) {
    if (homeSection) homeSection.style.display = "none";
    hideAllLabs();
    const sec = document.getElementById(id);
    if (sec) sec.style.display = "block";
    window.scrollTo(0, 0);
  }

  function backToHome() {
    hideAllLabs();
    if (homeSection) homeSection.style.display = "block";
    window.scrollTo(0, 0);
  }

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-go");
      if (id) goToLab(id);
    });
  });

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", backToHome);
  });

  /* =====================
     3) LAB 01 – CALCULATION
  ====================== */
  const constOut = document.getElementById("constOut");
  const moistOut = document.getElementById("moistOut");
  const moistNote = document.getElementById("moistNote");
  const protOut = document.getElementById("protOut");
  const autoConclusion = document.getElementById("autoConclusion");

  let lastMoist = null;
  let lastProtein = null;
  let isConst = false;

  const num = id => parseFloat(document.getElementById(id)?.value || "NaN");

  document.getElementById("btnCheckConst")?.addEventListener("click", () => {
    const m2 = num("m2");
    const m3 = num("m3");
    const tol = num("tol");

    if (![m2, m3, tol].every(isFinite)) {
      constOut.textContent = "⚠️ Утгууд буруу";
      isConst = false;
      return;
    }

    const diff = Math.abs(m3 - m2);
    isConst = diff <= tol;
    constOut.textContent = isConst
      ? `✅ Тогтмол жин (|m₃−m₂|=${diff.toFixed(3)} g)`
      : `⏳ Тогтмол биш (|m₃−m₂|=${diff.toFixed(3)} g)`;

    updateConclusion();
  });

  document.getElementById("btnCalcMoist")?.addEventListener("click", () => {
    const m0 = num("m0"), m1 = num("m1"), m2 = num("m2"), m3 = num("m3");
    if (![m0, m1, m2, m3].every(isFinite)) return;

    const dry = isConst ? m3 : m2;
    const moisture = ((m1 - dry) / (m1 - m0)) * 100;
    lastMoist = moisture;

    moistOut.textContent = `Ус = ${moisture.toFixed(2)} %`;
    moistNote.textContent = isConst
      ? "m₃ ашиглав (тогтмол жин)"
      : "⚠️ m₂ ашиглав (тогтмол батлагдаагүй)";

    updateConclusion();
  });

  document.getElementById("btnCalcProtein")?.addEventListener("click", () => {
    const N = num("nPct");
    const k = num("kFac");
    if (!isFinite(N) || !isFinite(k)) return;

    lastProtein = N * k;
    protOut.textContent = `Уураг = ${lastProtein.toFixed(2)} %`;
    updateConclusion();
  });

  function updateConclusion() {
    if (!autoConclusion) return;
    const parts = [];
    if (lastMoist != null) parts.push(`ус ${lastMoist.toFixed(2)}%`);
    if (lastProtein != null) parts.push(`уураг ${lastProtein.toFixed(2)}%`);

    autoConclusion.textContent =
      parts.length === 0
        ? "—"
        : `Дүгнэлт: Үхрийн махан дээжийн ${parts.join(", ")}.`;
  }

  /* =====================
     4) VISUAL MINI-SIM (OVEN)
  ====================== */
  const btnWet = document.getElementById("btnWet");
  const btnOven = document.getElementById("btnOven");
  const btnDry = document.getElementById("btnDry");
  const meatVisual = document.getElementById("meatVisual");
  const ovenTimer = document.getElementById("ovenTimer");
  const ovenStatus = document.getElementById("ovenStatus");

  let ovenInterval = null;

  btnWet?.addEventListener("click", () => {
    clearInterval(ovenInterval);
    meatVisual.textContent = "🥩💧";
    ovenTimer.textContent = "00:00";
    ovenStatus.textContent = "Нойтон төлөв";
    btnDry.disabled = true;
  });

  btnOven?.addEventListener("click", () => {
    if (ovenInterval) return;
    let sec = 0;
    ovenStatus.textContent = "Хатаалт явж байна…";

    ovenInterval = setInterval(() => {
      sec++;
      ovenTimer.textContent = `00:${String(sec).padStart(2,"0")}`;
      if (sec === 8) {
        clearInterval(ovenInterval);
        ovenInterval = null;
        btnDry.disabled = false;
        ovenStatus.textContent = "Хатаалт дууслаа";
      }
    }, 1000);
  });

  btnDry?.addEventListener("click", () => {
    meatVisual.textContent = "🥩✨";
    ovenStatus.textContent = "Хатаасан дээж";
  });

});
