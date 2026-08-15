(function () {
  "use strict";

  const OZ_TO_G = 28.3495;
  const LB_TO_KG = 0.453592;
  const IN_TO_CM = 2.54;
  const STANDARD_DRINK_G = 14; // grams of pure alcohol in one US standard drink

  const LOGS_KEY = "macrocalc_logs";
  const GOALS_KEY = "macrocalc_goals";
  const CUSTOM_FOODS_KEY = "macrocalc_custom_foods";
  const PROFILE_KEY = "macrocalc_profile";

  const DEFAULT_GOALS = { cals: 2000, protein: 150, carbs: 200, fat: 65 };
  const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const ACTIVITY_MULTIPLIERS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };

  const HEALTH_TIPS = [
    "Protein at breakfast (eggs, Greek yogurt, cottage cheese) helps curb cravings later in the day.",
    "Thirst is often mistaken for hunger — if you're peckish shortly after eating, try a glass of water first.",
    "Fiber-rich carbs (oats, beans, vegetables, whole fruit) digest slowly and keep energy steadier than refined carbs.",
    "A couple of alcohol-free days each week gives your liver a break and tends to improve sleep quality.",
    "Muscle is metabolically active tissue — pairing any weight-loss plan with resistance training helps you keep it.",
    "Sleep debt raises hunger hormones the next day, so consistent sleep is as much a nutrition tool as food choices are.",
    "Spreading protein across meals, rather than loading it at dinner, uses it more efficiently for muscle repair.",
    "Liquid calories add up fast without feeling like food — juice, soda, and alcohol are easy to undercount.",
    "A brisk 10-minute walk after a meal can meaningfully soften the blood sugar spike that follows eating.",
    "Whole fruit is generally a better choice than fruit juice — the fiber slows sugar absorption and adds satiety.",
  ];

  const ACTIVITY_SUGGESTIONS = {
    sedentary_lose: "Start small: three 20–25 minute brisk walks this week, plus two short bodyweight sessions (squats, push-ups, planks). Building the habit matters more than intensity right now.",
    sedentary_maintain: "Two to three 20-minute walks and one light full-body strength session would be a solid, sustainable amount of movement to add this week.",
    sedentary_gain: "Focus on eating enough alongside two full-body strength sessions this week — lifting, even light, gives those extra calories somewhere useful to go.",
    light_lose: "Keep your current activity and add one dedicated strength session — it helps preserve muscle while you're in a calorie deficit.",
    light_maintain: "Your current activity level is a solid base — mixing in one new activity you enjoy would add variety without overtraining.",
    light_gain: "Add a second strength session focused on progressive overload (a little more weight or a few more reps over time) to help those extra calories build muscle.",
    moderate_lose: "Keep strength training in the mix even in a deficit — it's the single best tool for making sure the weight you lose is fat, not muscle.",
    moderate_maintain: "A solid, consistent routine — consider a lighter deload week every 4–6 weeks so your body gets a real chance to recover.",
    moderate_gain: "Make sure sleep and calorie intake are keeping pace with your training — muscle is built in recovery, not just in the gym.",
    active_lose: "At this training volume, prioritize protein and sleep so a calorie deficit doesn't eat into performance or recovery.",
    active_maintain: "You're already doing a lot — the highest-leverage move now is probably recovery: sleep, mobility work, and rest days you actually take.",
    active_gain: "Make sure you're eating enough to support both the training and the goal — very active bodies often need more fuel than the default estimate suggests.",
    very_active_lose: "This is a demanding combination — a smaller, gentler calorie deficit will protect performance and recovery better than an aggressive one.",
    very_active_maintain: "At this activity level, recovery habits — sleep, hydration, mobility — likely matter as much as the training itself.",
    very_active_gain: "Your calorie needs are probably higher than a default estimate suggests — track your energy and weight trend and adjust upward if needed.",
  };

  // ---------- State ----------
  let currentDate = todayStr();
  let selectedFood = null; // {name, cals, protein, carbs, fat, alcohol} per 100g/ml
  let activeSuggestionIndex = -1;
  let currentSuggestions = [];

  // ---------- Date helpers ----------
  function todayStr() { return toDateStr(new Date()); }
  function toDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // ---------- Storage helpers ----------
  // Some browser contexts (private/incognito mode, certain restricted local-file
  // views) throw on localStorage writes even though reads succeed. Detect that
  // once at startup and fall back to an in-memory store so the app keeps working
  // for the session instead of silently failing every "Add to log".
  function createStorage() {
    try {
      const probeKey = "__macrocalc_probe__";
      localStorage.setItem(probeKey, "1");
      localStorage.removeItem(probeKey);
      return {
        persistent: true,
        get: (k) => localStorage.getItem(k),
        set: (k, v) => localStorage.setItem(k, v),
      };
    } catch (e) {
      const mem = {};
      return {
        persistent: false,
        get: (k) => (k in mem ? mem[k] : null),
        set: (k, v) => { mem[k] = v; },
      };
    }
  }
  const storage = createStorage();

  function loadAllLogs() {
    try { return JSON.parse(storage.get(LOGS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveAllLogs(all) { storage.set(LOGS_KEY, JSON.stringify(all)); }
  function getLogForDate(dateStr) { return loadAllLogs()[dateStr] || []; }
  function setLogForDate(dateStr, items) {
    const all = loadAllLogs();
    all[dateStr] = items;
    saveAllLogs(all);
  }

  function loadGoals() {
    try {
      const g = JSON.parse(storage.get(GOALS_KEY));
      return g ? { ...DEFAULT_GOALS, ...g } : { ...DEFAULT_GOALS };
    } catch (e) { return { ...DEFAULT_GOALS }; }
  }
  function saveGoals(goals) { storage.set(GOALS_KEY, JSON.stringify(goals)); }

  function loadCustomFoods() {
    try { return JSON.parse(storage.get(CUSTOM_FOODS_KEY)) || []; } catch (e) { return []; }
  }
  function saveCustomFoods(foods) { storage.set(CUSTOM_FOODS_KEY, JSON.stringify(foods)); }
  function allFoods() { return [...FOOD_DB, ...loadCustomFoods()]; }

  function loadProfile() {
    try { return JSON.parse(storage.get(PROFILE_KEY)) || null; } catch (e) { return null; }
  }
  function saveProfile(profile) { storage.set(PROFILE_KEY, JSON.stringify(profile)); }

  // ---------- DOM refs ----------
  const dateInput = document.getElementById("dateInput");
  const prevDayBtn = document.getElementById("prevDay");
  const nextDayBtn = document.getElementById("nextDay");
  const todayBtn = document.getElementById("todayBtn");

  const goalsBtn = document.getElementById("goalsBtn");
  const goalsModal = document.getElementById("goalsModal");
  const closeGoalsBtn = document.getElementById("closeGoals");
  const goalsForm = document.getElementById("goalsForm");
  const suggestGoalsBtn = document.getElementById("suggestGoalsBtn");
  const suggestHint = document.getElementById("suggestHint");

  const profileBtn = document.getElementById("profileBtn");
  const profileModal = document.getElementById("profileModal");
  const closeProfileBtn = document.getElementById("closeProfile");
  const profileForm = document.getElementById("profileForm");

  const backupBtn = document.getElementById("backupBtn");
  const backupModal = document.getElementById("backupModal");
  const closeBackupBtn = document.getElementById("closeBackup");
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const importFile = document.getElementById("importFile");
  const backupStatus = document.getElementById("backupStatus");

  const modeSearchBtn = document.getElementById("modeSearch");
  const modeCustomBtn = document.getElementById("modeCustom");
  const searchForm = document.getElementById("searchForm");
  const customForm = document.getElementById("customForm");

  const foodSearch = document.getElementById("foodSearch");
  const suggestionsEl = document.getElementById("suggestions");
  const qtyAmount = document.getElementById("qtyAmount");
  const qtyUnit = document.getElementById("qtyUnit");
  const searchPreview = document.getElementById("searchPreview");
  const mealSelect = document.getElementById("mealSelect");

  const calRing = document.getElementById("calRing");
  const ringNum = document.getElementById("ringNum");
  const ringOf = document.getElementById("ringOf");
  const macroBars = document.getElementById("macroBars");
  const logContent = document.getElementById("logContent");
  const notesContent = document.getElementById("notesContent");
  const tipsContent = document.getElementById("tipsContent");

  // ---------- Date navigation ----------
  function setDate(dateStr) {
    currentDate = dateStr;
    dateInput.value = dateStr;
    render();
  }
  dateInput.value = currentDate;
  dateInput.addEventListener("change", () => { if (dateInput.value) setDate(dateInput.value); });
  prevDayBtn.addEventListener("click", () => {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setDate(toDateStr(d));
  });
  nextDayBtn.addEventListener("click", () => {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setDate(toDateStr(d));
  });
  todayBtn.addEventListener("click", () => setDate(todayStr()));

  // ---------- Mode toggle ----------
  modeSearchBtn.addEventListener("click", () => {
    modeSearchBtn.classList.add("active");
    modeCustomBtn.classList.remove("active");
    searchForm.classList.remove("hidden");
    customForm.classList.add("hidden");
  });
  modeCustomBtn.addEventListener("click", () => {
    modeCustomBtn.classList.add("active");
    modeSearchBtn.classList.remove("active");
    customForm.classList.remove("hidden");
    searchForm.classList.add("hidden");
  });

  // ---------- Autocomplete ----------
  foodSearch.addEventListener("input", () => {
    const q = foodSearch.value.trim().toLowerCase();
    selectedFood = null;
    updateSearchPreview();
    if (!q) { hideSuggestions(); return; }
    const matches = allFoods()
      .filter((f) => f.name.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.name.localeCompare(b.name);
      })
      .slice(0, 8);
    currentSuggestions = matches;
    activeSuggestionIndex = -1;
    renderSuggestions(matches);
  });

  foodSearch.addEventListener("keydown", (e) => {
    if (suggestionsEl.classList.contains("hidden")) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, currentSuggestions.length - 1);
      highlightSuggestion();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
      highlightSuggestion();
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]) {
        e.preventDefault();
        pickFood(currentSuggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".autocomplete")) hideSuggestions();
  });

  function renderSuggestions(matches) {
    if (!matches.length) { hideSuggestions(); return; }
    suggestionsEl.innerHTML = matches.map((f, i) => `
        <li data-index="${i}">
          <span>${escapeHtml(f.name)}</span>
          <span class="sugg-macro">${Math.round(f.cals)} kcal / 100${isDrink(f) ? "ml" : "g"}</span>
        </li>`).join("");
    suggestionsEl.classList.remove("hidden");
    [...suggestionsEl.children].forEach((li) => {
      li.addEventListener("click", () => pickFood(matches[Number(li.dataset.index)]));
    });
  }
  function highlightSuggestion() {
    [...suggestionsEl.children].forEach((li, i) => li.classList.toggle("active", i === activeSuggestionIndex));
  }
  function hideSuggestions() {
    suggestionsEl.classList.add("hidden");
    suggestionsEl.innerHTML = "";
    activeSuggestionIndex = -1;
  }
  function isDrink(food) { return food.category === "Drink"; }

  function pickFood(food) {
    selectedFood = food;
    foodSearch.value = food.name;
    hideSuggestions();
    updateSearchPreview();
  }

  function amountInGrams() {
    const amt = parseFloat(qtyAmount.value) || 0;
    return qtyUnit.value === "oz" ? amt * OZ_TO_G : amt;
  }

  function updateSearchPreview() {
    if (!selectedFood) { searchPreview.textContent = ""; return; }
    const grams = amountInGrams();
    const factor = grams / 100;
    const c = selectedFood.cals * factor;
    const p = selectedFood.protein * factor;
    const cb = selectedFood.carbs * factor;
    const f = selectedFood.fat * factor;
    let text = `${Math.round(c)} kcal · P ${round1(p)}g · C ${round1(cb)}g · F ${round1(f)}g`;
    if (selectedFood.alcohol) {
      const drinks = (selectedFood.alcohol * factor) / STANDARD_DRINK_G;
      text += ` · ${round1(drinks)} standard drink${drinks === 1 ? "" : "s"}`;
    }
    searchPreview.textContent = text;
  }

  qtyAmount.addEventListener("input", updateSearchPreview);
  qtyUnit.addEventListener("change", updateSearchPreview);

  // ---------- Add item: search form ----------
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedFood) {
      foodSearch.focus();
      foodSearch.style.borderColor = "var(--danger)";
      setTimeout(() => (foodSearch.style.borderColor = ""), 1200);
      return;
    }
    const grams = amountInGrams();
    if (grams <= 0) return;
    const factor = grams / 100;
    addLogItem({
      name: selectedFood.name,
      meal: mealSelect.value,
      qtyLabel: `${trimNum(qtyAmount.value)} ${qtyUnit.value}`,
      cals: selectedFood.cals * factor,
      protein: selectedFood.protein * factor,
      carbs: selectedFood.carbs * factor,
      fat: selectedFood.fat * factor,
      alcoholG: (selectedFood.alcohol || 0) * factor,
    });
    foodSearch.value = "";
    selectedFood = null;
    qtyAmount.value = 100;
    qtyUnit.value = "g";
    updateSearchPreview();
    foodSearch.focus();
  });

  // ---------- Add item: custom form ----------
  customForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("customName").value.trim();
    const cals = parseFloat(document.getElementById("customCals").value) || 0;
    const protein = parseFloat(document.getElementById("customProtein").value) || 0;
    const carbs = parseFloat(document.getElementById("customCarbs").value) || 0;
    const fat = parseFloat(document.getElementById("customFat").value) || 0;
    const drinks = parseFloat(document.getElementById("customAlcohol").value) || 0;
    if (!name) return;

    const mealSelectCustom = document.getElementById("mealSelectCustom");
    addLogItem({
      name,
      meal: mealSelectCustom.value,
      qtyLabel: "custom",
      cals,
      protein,
      carbs,
      fat,
      alcoholG: drinks * STANDARD_DRINK_G,
    });

    if (document.getElementById("saveToDb").checked) {
      const customFoods = loadCustomFoods();
      customFoods.push({ name, category: "Custom", cals, protein, carbs, fat });
      saveCustomFoods(customFoods);
    }
    customForm.reset();
  });

  function addLogItem(item) {
    const items = getLogForDate(currentDate);
    items.push({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      ...item,
    });
    setLogForDate(currentDate, items);
    render();
  }
  function deleteLogItem(id) {
    const items = getLogForDate(currentDate).filter((i) => i.id !== id);
    setLogForDate(currentDate, items);
    render();
  }

  // ---------- Profile modal ----------
  function openProfileModal() {
    const p = loadProfile() || {};
    document.getElementById("profileSex").value = p.sex || "female";
    document.getElementById("profileAge").value = p.age || "";
    document.getElementById("profileHeight").value = p.heightVal || "";
    document.getElementById("profileHeightUnit").value = p.heightUnit || "cm";
    document.getElementById("profileWeight").value = p.weightVal || "";
    document.getElementById("profileWeightUnit").value = p.weightUnit || "kg";
    document.getElementById("profileActivity").value = p.activity || "moderate";
    document.getElementById("profileGoal").value = p.goalType || "maintain";
    profileModal.classList.remove("hidden");
  }
  function closeProfileModal() { profileModal.classList.add("hidden"); }
  profileBtn.addEventListener("click", openProfileModal);
  closeProfileBtn.addEventListener("click", closeProfileModal);
  profileModal.addEventListener("click", (e) => { if (e.target === profileModal) closeProfileModal(); });

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProfile({
      sex: document.getElementById("profileSex").value,
      age: parseFloat(document.getElementById("profileAge").value) || null,
      heightVal: parseFloat(document.getElementById("profileHeight").value) || null,
      heightUnit: document.getElementById("profileHeightUnit").value,
      weightVal: parseFloat(document.getElementById("profileWeight").value) || null,
      weightUnit: document.getElementById("profileWeightUnit").value,
      activity: document.getElementById("profileActivity").value,
      goalType: document.getElementById("profileGoal").value,
    });
    closeProfileModal();
    render();
  });

  // ---------- Backup & restore ----------
  function openBackupModal() {
    backupStatus.textContent = "";
    backupModal.classList.remove("hidden");
  }
  function closeBackupModal() { backupModal.classList.add("hidden"); }
  backupBtn.addEventListener("click", openBackupModal);
  closeBackupBtn.addEventListener("click", closeBackupModal);
  backupModal.addEventListener("click", (e) => { if (e.target === backupModal) closeBackupModal(); });

  async function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      logs: loadAllLogs(),
      goals: loadGoals(),
      profile: loadProfile(),
      customFoods: loadCustomFoods(),
    };
    const json = JSON.stringify(payload, null, 2);
    const filename = `macro-calculator-backup-${todayStr()}.json`;

    // Inside a sandboxed artifact preview, direct browser downloads are blocked —
    // use the host-provided downloads capability instead when it's available.
    if (typeof window.claude !== "undefined" && typeof window.claude.use === "function") {
      try {
        const downloads = await window.claude.use("downloads");
        if (downloads) {
          await downloads.save({ filename, data: json });
          backupStatus.textContent = "Backup saved.";
          return;
        }
      } catch (e) {
        backupStatus.textContent = "Couldn't save a backup file here — try the standalone app instead.";
        return;
      }
    }

    // Normal browser tab (e.g. the standalone HTML file): a plain download works fine.
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    backupStatus.textContent = "Backup saved.";
  }
  exportBtn.addEventListener("click", exportData);

  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    importFile.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (payload.logs) saveAllLogs(payload.logs);
        if (payload.goals) saveGoals(payload.goals);
        if ("profile" in payload) saveProfile(payload.profile);
        if (payload.customFoods) saveCustomFoods(payload.customFoods);
        render();
        backupStatus.textContent = "Backup restored.";
      } catch (err) {
        backupStatus.textContent = "That file doesn't look like a valid backup.";
      }
    };
    reader.readAsText(file);
  });

  // ---------- Goals modal ----------
  function openGoalsModal() {
    const g = loadGoals();
    document.getElementById("goalCals").value = g.cals;
    document.getElementById("goalProtein").value = g.protein;
    document.getElementById("goalCarbs").value = g.carbs;
    document.getElementById("goalFat").value = g.fat;
    suggestHint.textContent = "";
    goalsModal.classList.remove("hidden");
  }
  function closeGoalsModal() { goalsModal.classList.add("hidden"); }
  goalsBtn.addEventListener("click", openGoalsModal);
  closeGoalsBtn.addEventListener("click", closeGoalsModal);
  goalsModal.addEventListener("click", (e) => { if (e.target === goalsModal) closeGoalsModal(); });

  goalsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveGoals({
      cals: parseFloat(document.getElementById("goalCals").value) || 0,
      protein: parseFloat(document.getElementById("goalProtein").value) || 0,
      carbs: parseFloat(document.getElementById("goalCarbs").value) || 0,
      fat: parseFloat(document.getElementById("goalFat").value) || 0,
    });
    closeGoalsModal();
    render();
  });

  suggestGoalsBtn.addEventListener("click", () => {
    const profile = loadProfile();
    const suggestion = computeSuggestedGoals(profile);
    if (!suggestion) {
      suggestHint.textContent = "Add your height, weight, and age in your profile first, and I'll estimate a starting point for you.";
      return;
    }
    document.getElementById("goalCals").value = suggestion.cals;
    document.getElementById("goalProtein").value = suggestion.protein;
    document.getElementById("goalCarbs").value = suggestion.carbs;
    document.getElementById("goalFat").value = suggestion.fat;
    suggestHint.textContent = `Estimated from your profile: BMR ~${suggestion.bmr} kcal, maintenance ~${suggestion.tdee} kcal/day. This is a starting point, not a prescription — adjust it as you learn how your body responds.`;
  });

  // ---------- Suggested goals (Mifflin-St Jeor) ----------
  function computeSuggestedGoals(profile) {
    if (!profile || !profile.age || !profile.heightVal || !profile.weightVal) return null;
    const heightCm = profile.heightUnit === "in" ? profile.heightVal * IN_TO_CM : profile.heightVal;
    const weightKg = profile.weightUnit === "lb" ? profile.weightVal * LB_TO_KG : profile.weightVal;

    let bmr;
    if (profile.sex === "male") bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
    else if (profile.sex === "female") bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161;
    else bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 78;

    const tdee = bmr * (ACTIVITY_MULTIPLIERS[profile.activity] || 1.2);

    let calGoal;
    if (profile.goalType === "lose") calGoal = tdee - 500;
    else if (profile.goalType === "gain") calGoal = tdee + 400;
    else calGoal = tdee;
    calGoal = Math.max(calGoal, 1200); // conservative safety floor

    const proteinPerKg = profile.goalType === "lose" ? 2.0 : 1.8;
    const proteinGoal = proteinPerKg * weightKg;
    const fatGoal = (calGoal * 0.27) / 9;
    const carbsGoal = Math.max(0, (calGoal - proteinGoal * 4 - fatGoal * 9) / 4);

    return {
      cals: Math.round(calGoal),
      protein: Math.round(proteinGoal),
      carbs: Math.round(carbsGoal),
      fat: Math.round(fatGoal),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
  }

  // ---------- Rendering ----------
  function render() {
    const items = getLogForDate(currentDate);
    const goals = loadGoals();
    const profile = loadProfile();

    const totals = items.reduce(
      (acc, i) => {
        acc.cals += i.cals;
        acc.protein += i.protein;
        acc.carbs += i.carbs;
        acc.fat += i.fat;
        acc.alcohol += i.alcoholG || 0;
        return acc;
      },
      { cals: 0, protein: 0, carbs: 0, fat: 0, alcohol: 0 }
    );

    renderRing(totals, goals);
    renderMacroBars(totals, goals, profile);
    renderLog(items);
    renderNotes(items, totals, goals, profile);
    renderTips(profile);
  }

  function renderRing(totals, goals) {
    const pct = goals.cals > 0 ? Math.min(100, (totals.cals / goals.cals) * 100) : 0;
    const over = goals.cals > 0 && totals.cals > goals.cals;
    calRing.style.setProperty("--pct", pct);
    calRing.style.background = `conic-gradient(${over ? "var(--danger)" : "var(--accent)"} calc(var(--pct, 0) * 1%), var(--ring-track) 0)`;
    ringNum.textContent = Math.round(totals.cals);
    ringOf.textContent = `of ${Math.round(goals.cals)}`;
  }

  function alcoholReference(profile) {
    return profile && profile.sex === "male" ? 2 : 1;
  }

  function renderMacroBars(totals, goals, profile) {
    const rows = [
      { key: "protein", label: "Protein", value: totals.protein, goal: goals.protein, color: "var(--protein)", unit: "g" },
      { key: "carbs", label: "Carbs", value: totals.carbs, goal: goals.carbs, color: "var(--carbs)", unit: "g" },
      { key: "fat", label: "Fat", value: totals.fat, goal: goals.fat, color: "var(--fat)", unit: "g" },
    ];

    let html = rows.map((r) => {
      const pct = r.goal > 0 ? Math.min(100, (r.value / r.goal) * 100) : 0;
      const over = r.goal > 0 && r.value > r.goal;
      return `
        <div class="macro-row">
          <div class="macro-top">
            <span class="macro-name"><span class="swatch" style="background:${r.color}"></span>${r.label}</span>
            <span class="macro-val">${Math.round(r.value)} / ${Math.round(r.goal)} ${r.unit}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${over ? "var(--danger)" : r.color}"></div></div>
        </div>`;
    }).join("");

    const drinks = totals.alcohol / STANDARD_DRINK_G;
    const ref = alcoholReference(profile);
    const pctA = Math.min(100, (drinks / ref) * 100);
    const overA = drinks > ref;
    html += `
      <div class="macro-row">
        <div class="macro-top">
          <span class="macro-name"><span class="swatch" style="background:var(--alcohol)"></span>Alcohol</span>
          <span class="macro-val">${round1(drinks)} drink${drinks === 1 ? "" : "s"}</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pctA}%;background:${overA ? "var(--danger)" : "var(--alcohol)"}"></div></div>
        <div class="macro-note">General guideline: up to ${ref} standard drink${ref === 1 ? "" : "s"}/day</div>
      </div>`;

    macroBars.innerHTML = html;
  }

  function renderLog(items) {
    if (!items.length) {
      logContent.innerHTML = `<p class="log-empty">Nothing logged yet for this day. Add something on the left.</p>`;
      return;
    }
    const byMeal = {};
    MEALS.forEach((m) => (byMeal[m] = []));
    items.forEach((i) => {
      if (!byMeal[i.meal]) byMeal[i.meal] = [];
      byMeal[i.meal].push(i);
    });

    let html = "";
    Object.keys(byMeal).forEach((meal) => {
      const mealItems = byMeal[meal];
      if (!mealItems.length) return;
      const mealCals = mealItems.reduce((s, i) => s + i.cals, 0);
      html += `<div class="meal-group"><h3><span>${meal}</span><span>${Math.round(mealCals)} kcal</span></h3>`;
      mealItems.forEach((i) => {
        const drinks = (i.alcoholG || 0) / STANDARD_DRINK_G;
        let macroText = `P ${round1(i.protein)} · C ${round1(i.carbs)} · F ${round1(i.fat)}`;
        if (drinks > 0) macroText += ` · ${round1(drinks)} drink${drinks === 1 ? "" : "s"}`;
        html += `
          <div class="log-item">
            <div class="item-left">
              <span class="item-name">${escapeHtml(i.name)}</span>
              <span class="item-sub">${escapeHtml(i.qtyLabel || "")}</span>
            </div>
            <div class="item-right">
              <span class="item-macros">${macroText}</span>
              <span class="item-cals">${Math.round(i.cals)} kcal</span>
              <button class="delete-btn" data-id="${i.id}" title="Remove" aria-label="Remove item">&times;</button>
            </div>
          </div>`;
      });
      html += `</div>`;
    });

    logContent.innerHTML = html;
    logContent.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteLogItem(btn.dataset.id));
    });
  }

  // ---------- Nutritionist's notes ----------
  function buildNotes(itemsCount, totals, goals, profile) {
    const notes = [];
    const drinks = totals.alcohol / STANDARD_DRINK_G;
    const ref = alcoholReference(profile);

    if (itemsCount === 0) {
      return [{ tone: "info", text: "Log a meal or drink and I'll share a few thoughts on how today's balance is looking." }];
    }

    if (drinks >= 4) {
      notes.push({
        tone: "alert",
        text: `${round1(drinks)} standard drinks is a heavy day, and it's worth taking seriously. Drinking at this level puts real strain on your liver, dehydrates you, and impairs judgment and coordination — and if it becomes a regular pattern, it's linked to longer-term risks like liver disease, high blood pressure, and certain cancers. If this feels like part of a pattern rather than a one-off, it's worth a conversation with a doctor.`,
      });
    } else if (drinks > ref) {
      notes.push({
        tone: "caution",
        text: `You've logged ${round1(drinks)} standard drink${drinks === 1 ? "" : "s"} today, a bit above the general guideline of around ${ref} a day. An occasional heavier day isn't cause for alarm, but alcohol affects sleep quality and hydration — a glass of water between drinks and an earlier night can help you bounce back.`,
      });
    } else if (drinks > 0) {
      notes.push({
        tone: "positive",
        text: `You've logged ${round1(drinks)} standard drink${drinks === 1 ? "" : "s"} today, within the range generally considered lower-risk. Worth remembering: alcohol carries about 7 kcal per gram with no real nutritional value — I've already folded that into your calorie total above.`,
      });
    }

    if (goals.cals > 0 && totals.cals > goals.cals * 1.15) {
      notes.push({
        tone: "caution",
        text: `You're running about ${Math.round(totals.cals - goals.cals)} kcal above your calorie target today. One day like this is nothing to worry about — but if it becomes the norm rather than the exception, that consistent surplus is what gradually leads to weight gain, and can leave you feeling sluggish or make energy less steady. If today was a special occasion, enjoy it, and aim to land closer to target tomorrow.`,
      });
    } else if (goals.cals > 0 && totals.cals > 0 && totals.cals < goals.cals * 0.7) {
      notes.push({
        tone: "caution",
        text: `You're noticeably under your calorie target today. Undereating occasionally is fine, but making a habit of it can leave you low on energy and foggy, and — over time — can slow your metabolism and put lean muscle at risk. If that wasn't the plan, a balanced snack or meal would help close the gap.`,
      });
    }

    if (goals.protein > 0 && totals.protein < goals.protein * 0.6) {
      notes.push({
        tone: "info",
        text: `Protein is trailing behind today's target. It's the nutrient that does the most to keep you full and protect muscle, especially if you're active or eating in a deficit — eggs, yogurt, chicken, tofu, or legumes at your next meal would help close the gap.`,
      });
    }

    if (!notes.length) {
      notes.push({ tone: "positive", text: "Calories and macros are tracking close to target today — a nice, steady balance. Keep it up." });
    }

    return notes.slice(0, 4);
  }

  function renderNotes(items, totals, goals, profile) {
    const notes = buildNotes(items.length, totals, goals, profile);
    notesContent.innerHTML = notes.map((n) => `<div class="note-card tone-${n.tone}">${n.text}</div>`).join("");
  }

  // ---------- Health & activity tips ----------
  function hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function pickTips(dateStr, n) {
    const start = hashCode(dateStr) % HEALTH_TIPS.length;
    const out = [];
    for (let i = 0; i < n; i++) out.push(HEALTH_TIPS[(start + i) % HEALTH_TIPS.length]);
    return out;
  }

  function activitySuggestion(profile) {
    if (!profile || !profile.activity || !profile.goalType) {
      return "Fill in your profile (top right) with your activity level and goal, and I'll suggest a simple weekly activity focus tailored to you.";
    }
    const key = `${profile.activity}_${profile.goalType}`;
    return ACTIVITY_SUGGESTIONS[key] || "Keep an eye on how your activity, sleep, and eating patterns line up with your goal, and adjust gradually.";
  }

  function renderTips(profile) {
    const tips = pickTips(currentDate, 3);
    tipsContent.innerHTML = `
      <div class="activity-box">${activitySuggestion(profile)}</div>
      <ul class="tip-list">${tips.map((t) => `<li>${t}</li>`).join("")}</ul>
    `;
  }

  // ---------- Utils ----------
  function round1(n) { return Math.round(n * 10) / 10; }
  function trimNum(s) {
    const n = parseFloat(s);
    return Number.isFinite(n) ? String(n) : s;
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Init ----------
  if (!storage.persistent) {
    const storageBanner = document.getElementById("storageBanner");
    if (storageBanner) storageBanner.classList.remove("hidden");
  }
  render();
})();
