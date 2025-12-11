const STORAGE_PREFIX = "link-pair:";

export function initLinkUI() {
  const linkDay = document.getElementById("link-day");
  const fromInput = document.getElementById("from-input");
  const toInput = document.getElementById("to-input");
  const todayFrom = document.getElementById("today-from");
  const todayTo = document.getElementById("today-to");
  const statusText = document.getElementById("status-text");
  const linkState = document.getElementById("link-state");
  const btnSave = document.getElementById("btn-save");
  const historyList = document.getElementById("history-list");

  if (!linkDay || !fromInput || !toInput || !todayFrom || !todayTo || !statusText || !linkState || !btnSave || !historyList) {
    return;
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const STORAGE_KEY = STORAGE_PREFIX + todayKey;

  // Format today's date
  const now = new Date();
  const formatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  linkDay.textContent = formatter.format(now);

  function loadForDate(key) {
    try {
      const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const from = typeof parsed.from === "string" ? parsed.from : "";
      const to = typeof parsed.to === "string" ? parsed.to : "";
      if (!from && !to) return null;
      return { from, to };
    } catch (err) {
      console.error("Failed to load link pair for", key, err);
      return null;
    }
  }

  function saveToday(from, to) {
    const payload = { from, to };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      linkState.textContent = "Saved for today";
      statusText.textContent = "Today’s link is saved.";
    } catch (err) {
      console.error("Failed to save link pair", err);
    }
  }

  function updateToday(from, to) {
    todayFrom.textContent = from || "—";
    todayTo.textContent = to || "—";
  }

  function buildHistory() {
    historyList.innerHTML = "";
    const todayDate = new Date(todayKey);
    const maxDaysBack = 15;
    let count = 0;

    for (let offset = 1; offset <= maxDaysBack && count < 10; offset++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - offset);
      const key = d.toISOString().slice(0, 10);
      const pair = loadForDate(key);
      if (!pair) continue;

      const item = document.createElement("div");
      item.className = "history-item";

      const dot = document.createElement("div");
      dot.className = "history-dot";

      const dateSpan = document.createElement("span");
      dateSpan.className = "history-date";
      const labelFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
      dateSpan.textContent = labelFmt.format(d);

      const link = document.createElement("div");
      link.className = "history-link";
      const fromChip = document.createElement("span");
      fromChip.className = "word";
      fromChip.textContent = pair.from || "—";
      const arrow = document.createElement("span");
      arrow.className = "arrow";
      arrow.textContent = "↔";
      const toChip = document.createElement("span");
      toChip.className = "word";
      toChip.textContent = pair.to || "—";

      link.appendChild(fromChip);
      link.appendChild(arrow);
      link.appendChild(toChip);

      item.appendChild(dot);
      item.appendChild(dateSpan);
      item.appendChild(link);
      historyList.appendChild(item);

      count++;
    }

    if (!historyList.children.length) {
      const span = document.createElement("span");
      span.className = "history-label";
      span.textContent = "No previous links yet.";
      historyList.appendChild(span);
    }
  }

  // Load today's pair if it exists
  const existing = loadForDate(todayKey);
  if (existing) {
    updateToday(existing.from, existing.to);
    fromInput.value = existing.from;
    toInput.value = existing.to;
    linkState.textContent = "Saved for today";
    statusText.textContent = "Today’s link is saved.";
  } else {
    statusText.textContent = "No link saved for today yet.";
    linkState.textContent = "Unsaved";
  }

  buildHistory();

  function handleSave() {
    const rawFrom = (fromInput.value || "").trim();
    const rawTo = (toInput.value || "").trim();
    if (!rawFrom && !rawTo) {
      statusText.textContent = "Type at least one word.";
      return;
    }
    updateToday(rawFrom, rawTo);
    saveToday(rawFrom, rawTo);
    buildHistory();
  }

  btnSave.addEventListener("click", handleSave);
  fromInput.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      handleSave();
    }
  });
  toInput.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      handleSave();
    }
  });
}
