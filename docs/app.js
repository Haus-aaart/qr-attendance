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

  const sessions = Array.isArray(window.SESSIONS) ? window.SESSIONS : [];

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

  function pickSessionByTime(now) {
    const dow = now.getDay();
    const mins = minutesSinceMidnight(now);

    const candidates = sessions
      .filter((s) => s.dayOfWeek === dow)
      .filter((s) => {
        const start = s.startMinutes - (s.earlyCheckinMinutes ?? 0);
        const end = s.endMinutes + (s.lateCheckinMinutes ?? 0);
        return mins >= start && mins <= end;
      })
      .map((s) => ({ s, score: Math.abs(mins - s.startMinutes) }));

    candidates.sort((a, b) => a.score - b.score);
    return candidates.length ? candidates[0].s : null;
  }

  function formatLocalTime(d) {
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

  function setSelectedSession(session) {
    if (session) {
      sessionSelect.value = session.id;
      sessionHint.textContent = `Selected automatically: ${session.label}`;
    } else {
      sessionSelect.value = "";
      sessionHint.textContent = "No session window matched your current time — please choose from the list.";
    }
    syncHiddenSessionFields();
  }

  function syncHiddenSessionFields() {
    const selectedId = sessionSelect.value;
    const s = sessions.find((x) => x.id === selectedId);

    hiddenSessionId.value = selectedId || "";
    hiddenSessionLabel.value = s ? s.label : "";
  }

  function prefillFromStorage() {
    const saved = localStorage.getItem("qr_attendance_firstName");
    if (saved && !firstNameInput.value) firstNameInput.value = saved;
  }

  function saveToStorage() {
    localStorage.setItem("qr_attendance_firstName", firstNameInput.value.trim());
  }

  // Auto-pick session on load
  const now = new Date();
  $("nowText").textContent = formatLocalTime(now);
  setSelectedSession(pickSessionByTime(now));
  prefillFromStorage();

  // Allow manual override
  sessionSelect.addEventListener("change", syncHiddenSessionFields);

  // On submit, fill meta fields
  form.addEventListener("submit", () => {
    const now2 = new Date();
    hiddenClientTimeISO.value = now2.toISOString();

    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { tz = ""; }
    hiddenClientTimeZone.value = tz;
    hiddenUserAgent.value = navigator.userAgent || "";

    saveToStorage();
  });
})();
