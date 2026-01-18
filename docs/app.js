/* docs/app.js
 *
 * QR Attendance Tracker frontend logic.
 * - Auto-select session based on phone local date/time
 * - Check-in window: from (start - earlyCheckinMinutes) to (start + lateCheckinMinutes)
 * - Athlete enters Vorname, then form POSTs to Google Apps Script Web App
 */

(function () {
  const $ = (id) => document.getElementById(id);

  const form = $("checkinForm");
  const sessionSelect = $("sessionSelect");
  const sessionHint = $("sessionHint");
  const firstNameInput = $("firstName");

  const hiddenSessionId = $("sessionId");
  const hiddenSessionLabel = $("sessionLabel");
  const hiddenClientTimeISO = $("clientTimeISO");
  const hiddenClientTimeZone = $("clientTimeZone");
  const hiddenUserAgent = $("userAgent");

  const nowText = $("nowText");

  const sessions = Array.isArray(window.SESSIONS) ? window.SESSIONS : [];

  // If sessions.js is missing or empty, make it obvious.
  if (!sessions.length) {
    sessionHint.textContent =
      "Keine Sessions konfiguriert (sessions.js ist leer). Bitte Admin informieren.";
  }

  // Populate dropdown
  sessions.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.label;
    sessionSelect.appendChild(opt);
  });

  function minutesSinceMidnight(d) {
    return d.getHours() * 60 + d.getMinutes();
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function minsToHHMM(mins) {
    const m = ((mins % 1440) + 1440) % 1440; // keep within 0..1439
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function formatLocalDateTime(d) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(d);
    } catch {
      return d.toString();
    }
  }

  // Core: pick session based on phone time and allowed window around START time.
  function pickSessionByTime(now) {
    const dow = now.getDay(); // 0..6
    const mins = minutesSinceMidnight(now);

    const candidates = sessions
      .filter((s) => s.dayOfWeek === dow)
      .map((s) => {
        const early = Number.isFinite(s.earlyCheckinMinutes) ? s.earlyCheckinMinutes : 0;
        const late = Number.isFinite(s.lateCheckinMinutes) ? s.lateCheckinMinutes : 0;

        // Window based on start time (your requirement):
        // startWindow = start - early
        // endWindow   = start + late
        const startWindow = clamp(s.startMinutes - early, 0, 1440);
        const endWindow = clamp(s.startMinutes + late, 0, 1440);

        const inWindow = mins >= startWindow && mins <= endWindow;
        const score = Math.abs(mins - s.startMinutes); // closest start wins if multiple

        return { s, inWindow, score, startWindow, endWindow };
      })
      .filter((x) => x.inWindow);

    candidates.sort((a, b) => a.score - b.score);

    return candidates.length ? candidates[0] : null;
  }

  function setSelectedSessionById(sessionId) {
    sessionSelect.value = sessionId || "";
    syncHiddenSessionFields();
    updateHintText();
  }

  function syncHiddenSessionFields() {
    const selectedId = sessionSelect.value;
    const s = sessions.find((x) => x.id === selectedId);

    hiddenSessionId.value = selectedId || "";
    hiddenSessionLabel.value = s ? s.label : "";
  }

  function updateHintText() {
    const selectedId = sessionSelect.value;
    const s = sessions.find((x) => x.id === selectedId);

    if (!s) {
      sessionHint.textContent =
        "Keine passende Session gefunden — bitte Session manuell auswählen.";
      return;
    }

    const early = Number.isFinite(s.earlyCheckinMinutes) ? s.earlyCheckinMinutes : 0;
    const late = Number.isFinite(s.lateCheckinMinutes) ? s.lateCheckinMinutes : 0;

    const startWindow = clamp(s.startMinutes - early, 0, 1440);
    const endWindow = clamp(s.startMinutes + late, 0, 1440);

    sessionHint.textContent =
      `Session ausgewählt: ${s.label} (Check-in: ${minsToHHMM(startWindow)}–${minsToHHMM(endWindow)})`;
  }

  function prefillFromStorage() {
    const saved = localStorage.getItem("qr_attendance_firstName");
    if (saved && !firstNameInput.value) firstNameInput.value = saved;
  }

  function saveToStorage() {
    localStorage.setItem("qr_attendance_firstName", firstNameInput.value.trim());
  }

  // Time display + optional auto-refresh (until user manually overrides)
  let manualOverride = false;

  function updateNowAndAutoPick() {
    const now = new Date();
    if (nowText) nowText.textContent = formatLocalDateTime(now);

    if (!manualOverride) {
      const picked = pickSessionByTime(now);
      if (picked) {
        setSelectedSessionById(picked.s.id);
      } else {
        setSelectedSessionById("");
      }
    }
  }

  // Initial load behavior
  prefillFromStorage();
  syncHiddenSessionFields();
  updateNowAndAutoPick();

  // If athlete changes session manually, stop auto-picking (but keep showing time)
  sessionSelect.addEventListener("change", () => {
    manualOverride = true;
    syncHiddenSessionFields();
    updateHintText();
  });

  // On submit: fill metadata + enforce that a session was actually selected
  form.addEventListener("submit", (ev) => {
    const firstName = firstNameInput.value.trim();
    if (!firstName) {
      ev.preventDefault();
      alert("Bitte Vorname eingeben.");
      firstNameInput.focus();
      return;
    }

    // Ensure a session is selected (browser required may catch this, but enforce anyway)
    if (!sessionSelect.value) {
      ev.preventDefault();
      alert("Bitte eine Session auswählen.");
      sessionSelect.focus();
      return;
    }

    const now = new Date();
    hiddenClientTimeISO.value = now.toISOString();

    let tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      tz = "";
    }
    hiddenClientTimeZone.value = tz;
    hiddenUserAgent.value = navigator.userAgent || "";

    saveToStorage();
  });

  // Update time display every 30 seconds; auto-pick only if not manually overridden
  setInterval(updateNowAndAutoPick, 30000);
})();
