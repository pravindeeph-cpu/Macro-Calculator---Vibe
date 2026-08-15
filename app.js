(function () {
  "use strict";

  const OZ_TO_G = 28.3495;
  const LOGS_KEY = "macrocalc_logs";
  const GOALS_KEY = "macrocalc_goals";
  const CUSTOM_FOODS_KEY = "macrocalc_custom_foods";
  const DEFAULT_GOALS = { cals: 2000, protein: 150, carbs: 200, fat: 65 };
  const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

  // ---------- State ----------
  let currentDate = todayStr();
  let selectedFood = null; // {name, cals, protein, carbs, fat} per 100g/ml
  let activeSuggestionIndex = -1;
  let currentSuggestions = [];

  // ---------- Storage helpers ----------
  function todayStr() {
    const d = new Date();
    return toDateStr(d);
  }

  function toDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function loadAllLogs() {
    try {
      return JSON.parse(localStorage.getItem(LOGS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveAllLogs(all) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(all));
  }

  function getLogForDate(dateStr) {
    const all = loadAllLogs();
    return all[dateStr] || [];
  }

  function setLogForDate(dateStr, items) {
    const all = loadAllLogs();
    all[dateStr] = items;
    saveAllLogs(all);
  }

  function loadGoals() {
    try {
      const g = JSON.parse(localStorage.getItem(GOALS_KEY));
      return g ? { ...DEFAULT_GOALS, ...g } : { ...DEFAULT_GOALS };
    } catch (e) {
      return { ...DEFAULT_GOALS };
    }
  }

  function saveGoals(goals) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }

  function loadCustomFoods() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomFoods(foods) {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
  }

  function allFoods() {
    return [...FOOD_DB, ...loadCustomFoods()];
  }

  // ---------- DOM refs ----------
  const dateInput = document.getElementById("dateInput");
  const prevDayBtn = document.getElementById("prevDay");
  const nextDayBtn = document.getElementById("nextDay");
  const todayBtn = document.getElementById("todayBtn");
  const goalsBtn = document.getElementById("goalsBtn");
  const goalsModal = document.getElementById("goalsModal");
  const closeGoalsBtn = document.getElementById("closeGoals");
  const goalsForm = document.getElementById("goalsForm");

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

  const totalsGrid = document.getElementById("totalsGrid");
  const logContent = document.getElementById("logContent");

  // ---------- Date navigation ----------
  function setDate(dateStr) {
    currentDate = dateStr;
    dateInput.value = dateStr;
    render();
  }

  dateInput.value = currentDate;

  dateInput.addEventListener("change", () => {
    if (dateInput.value) setDate(dateInput.value);
  });

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
    if (!q) {
      hideSuggestions();
      return;
    }
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
    if (!matches.length) {
      hideSuggestions();
      return;
    }
    suggestionsEl.innerHTML = matches
      .map(
        (f, i) => `
        <li data-index="${i}">
          <span>${escapeHtml(f.name)}</span>
          <span class="sugg-macro">${Math.round(f.cals)} kcal / 100${isDrink(f) ? "ml" : "g"}</span>
        </li>`
      )
      .join("");
    suggestionsEl.classList.remove("hidden");
    [...suggestionsEl.children].forEach((li) => {
      li.addEventListener("click", () => pickFood(matches[Number(li.dataset.index)]));
    });
  }

  function highlightSuggestion() {
    [...suggestionsEl.children].forEach((li, i) => {
      li.classList.toggle("active", i === activeSuggestionIndex);
    });
  }

  function hideSuggestions() {
    suggestionsEl.classList.add("hidden");
    suggestionsEl.innerHTML = "";
    activeSuggestionIndex = -1;
  }

  function isDrink(food) {
    return food.category === "Drink";
  }

  function pickFood(food) {
    selectedFood = food;
    foodSearch.value = food.name;
    hideSuggestions();
    if (isDrink(food) && qtyUnit.value === "oz") {
      // keep unit choice as-is; fl oz not modeled separately, treat oz as weight approx
    }
    updateSearchPreview();
  }

  function amountInGrams() {
    const amt = parseFloat(qtyAmount.value) || 0;
    return qtyUnit.value === "oz" ? amt * OZ_TO_G : amt;
  }

  function updateSearchPreview() {
    if (!selectedFood) {
      searchPreview.textContent = "";
      return;
    }
    const grams = amountInGrams();
    const factor = grams / 100;
    const c = selectedFood.cals * factor;
    const p = selectedFood.protein * factor;
    const cb = selectedFood.carbs * factor;
    const f = selectedFood.fat * factor;
    searchPreview.textContent = `${Math.round(c)} kcal · P ${round1(p)}g · C ${round1(cb)}g · F ${round1(f)}g`;
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

  // ---------- Goals modal ----------
  function openGoalsModal() {
    const g = loadGoals();
    document.getElementById("goalCals").value = g.cals;
    document.getElementById("goalProtein").value = g.protein;
    document.getElementById("goalCarbs").value = g.carbs;
    document.getElementById("goalFat").value = g.fat;
    goalsModal.classList.remove("hidden");
  }

  function closeGoalsModal() {
    goalsModal.classList.add("hidden");
  }

  goalsBtn.addEventListener("click", openGoalsModal);
  closeGoalsBtn.addEventListener("click", closeGoalsModal);
  goalsModal.addEventListener("click", (e) => {
    if (e.target === goalsModal) closeGoalsModal();
  });

  goalsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const goals = {
      cals: parseFloat(document.getElementById("goalCals").value) || 0,
      protein: parseFloat(document.getElementById("goalProtein").value) || 0,
      carbs: parseFloat(document.getElementById("goalCarbs").value) || 0,
      fat: parseFloat(document.getElementById("goalFat").value) || 0,
    };
    saveGoals(goals);
    closeGoalsModal();
    render();
  });

  // ---------- Rendering ----------
  function render() {
    const items = getLogForDate(currentDate);
    const goals = loadGoals();

    const totals = items.reduce(
      (acc, i) => {
        acc.cals += i.cals;
        acc.protein += i.protein;
        acc.carbs += i.carbs;
        acc.fat += i.fat;
        return acc;
      },
      { cals: 0, protein: 0, carbs: 0, fat: 0 }
    );

    renderTotals(totals, goals);
    renderLog(items);
  }

  function renderTotals(totals, goals) {
    const cards = [
      { key: "cals", label: "Calories", value: totals.cals, goal: goals.cals, unit: "kcal", color: "var(--cals)" },
      { key: "protein", label: "Protein", value: totals.protein, goal: goals.protein, unit: "g", color: "var(--protein)" },
      { key: "carbs", label: "Carbs", value: totals.carbs, goal: goals.carbs, unit: "g", color: "var(--carbs)" },
      { key: "fat", label: "Fat", value: totals.fat, goal: goals.fat, unit: "g", color: "var(--fat)" },
    ];

    totalsGrid.innerHTML = cards
      .map((c) => {
        const pct = c.goal > 0 ? Math.min(100, (c.value / c.goal) * 100) : 0;
        const over = c.goal > 0 && c.value > c.goal;
        return `
        <div class="total-card">
          <span class="label">${c.label}</span>
          <span class="value">${Math.round(c.value)}<small> / ${Math.round(c.goal)} ${c.unit}</small></span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${over ? "var(--danger)" : c.color}"></div></div>
        </div>`;
      })
      .join("");
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
        html += `
          <div class="log-item">
            <div class="item-left">
              <span class="item-name">${escapeHtml(i.name)}</span>
              <span class="item-sub">${escapeHtml(i.qtyLabel || "")}</span>
            </div>
            <div class="item-right">
              <span class="item-macros">P ${round1(i.protein)} · C ${round1(i.carbs)} · F ${round1(i.fat)}</span>
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

  // ---------- Utils ----------
  function round1(n) {
    return Math.round(n * 10) / 10;
  }

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
  render();
})();
