const TABLE_LAYOUT = [
[1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
[3,4,null,null,null,null,null,null,null,null,null,null,5,6,7,8,9,10],
[11,12,null,null,null,null,null,null,null,null,null,null,13,14,15,16,17,18],
[19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
[37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
[55,56,57,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
[87,88,89,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118],
[null,null,"La",58,59,60,61,62,63,64,65,66,67,68,69,70,71,null],
[null,null,"Ac",90,91,92,93,94,95,96,97,98,99,100,101,102,103,null]
];

const CATEGORY_RUS = {
"alkali-metal":"Щелочной металл","alkaline-earth":"Щелочноземельный металл",
"transition-metal":"Переходный металл","basic-metal":"Простой металл",
"metalloid":"Металлоид","nonmetal":"Неметалл","halogen":"Галоген",
"noble-gas":"Благородный газ","lanthanide":"Лантаноид","actinide":"Актиноид",
"unknown":"Неизвестно"
};

let currentProperty = "weight";
let showNames = false;
let showConfig = false;
let currentTemp = 25;

function getElement(num) { return ELEMENTS.find(e => e.num === num); }
function getCategoryClass(cat) { return cat ? cat.replace(" ","-") : "unknown"; }

function getStateAtTemp(element, temp) {
  if (!element.melt && !element.boil) return "unknown";
  if (temp < element.melt) return "solid";
  if (temp < element.boil) return "liquid";
  return "gas";
}

function getPropertyValue(el, prop) {
  if (prop === "state") return null;
  return el[prop] || null;
}

function getMaxProperty(prop) {
  const values = ELEMENTS.map(e => getPropertyValue(e, prop)).filter(v => typeof v === "number");
  return Math.max(...values);
}

function getColorForProperty(el, prop) {
  if (prop === "state") return null;
  const val = getPropertyValue(el, prop);
  if (val === null || val === undefined || val === "unknown") return null;
  const max = getMaxProperty(prop);
  const min = Math.min(...ELEMENTS.map(e => getPropertyValue(e, prop)).filter(v => typeof v === "number"));
  const ratio = (val - min) / (max - min);
  if (ratio < 0.33) return `rgb(${Math.round(ratio*3*255)},100,255)`;
  if (ratio < 0.66) return `rgb(150,${Math.round((ratio-0.33)*3*255)},150)`;
  return `rgb(255,${Math.round((1-ratio)*3*255)},100)`;
}

function buildTable() {
  const container = document.getElementById("tableContainer");
  const table = document.createElement("table");
  const colorProp = document.getElementById("propertySelect").value;
  const isState = colorProp === "state";

  TABLE_LAYOUT.forEach((row, ri) => {
    const tr = document.createElement("tr");
    row.forEach((cell, ci) => {
      if (cell === null) {
        const td = document.createElement("td");
        td.className = "empty";
        tr.appendChild(td);
        return;
      }
      if (typeof cell === "string") {
        const td = document.createElement("td");
        td.className = "label-cell";
        td.textContent = cell;
        tr.appendChild(td);
        return;
      }
      const el = getElement(cell);
      if (!el) return;
      const td = document.createElement("td");
      td.className = getCategoryClass(el.category);
      td.dataset.num = el.num;

      if (isState) {
        const state = getStateAtTemp(el, currentTemp);
        if (state === "solid") td.style.opacity = "1";
        else if (state === "liquid") td.style.opacity = "0.7";
        else if (state === "gas") td.style.opacity = "0.4";
        else td.style.opacity = "0.3";
      } else {
        const color = getColorForProperty(el, colorProp);
        if (color && !showConfig) td.style.background = color;
      }

      let inner = `<span class="element-number">${el.num}</span>`;
      inner += `<span class="element-symbol">${el.sym}</span>`;
      if (showNames) inner += `<span class="element-name">${el.name}</span>`;
      if (showConfig) {
        inner += `<span class="element-weight" style="font-size:0.55em">${el.config}</span>`;
      } else {
        const propVal = getPropertyValue(el, colorProp);
        inner += `<span class="element-weight">${propVal !== null ? (typeof propVal === 'number' ? propVal.toFixed(2) : propVal) : '—'}</span>`;
      }
      td.innerHTML = inner;

      td.addEventListener("mouseenter", () => showElementDetail(el));
      td.addEventListener("click", () => showElementDetail(el));
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  container.innerHTML = "";
  container.appendChild(table);
}

function showElementDetail(el) {
  const d = document.getElementById("elementDetail");
  const state = getStateAtTemp(el, currentTemp);
  const stateRus = {solid:"Твёрдый",liquid:"Жидкий",gas:"Газ",unknown:"Неизвестно"}[state] || state;
  const catRus = CATEGORY_RUS[el.category] || el.category;

  let html = `<h2>${el.sym} — ${el.name}</h2>`;
  html += `<p><strong>Атомный номер:</strong> ${el.num}</p>`;
  html += `<p><strong>Английское название:</strong> ${el.name_en}</p>`;
  html += `<p><strong>Категория:</strong> ${catRus}</p>`;
  html += `<p><strong>Атомная масса:</strong> ${el.weight}</p>`;
  html += `<p><strong>Электронная конфигурация:</strong> ${el.config}</p>`;
  if (el.en) html += `<p><strong>Электроотрицательность:</strong> ${el.en}</p>`;
  if (el.radius) html += `<p><strong>Атомный радиус:</strong> ${el.radius} пм</p>`;
  if (el.density) html += `<p><strong>Плотность:</strong> ${el.density} г/см³</p>`;
  html += `<p><strong>Температура плавления:</strong> ${el.melt}°C</p>`;
  html += `<p><strong>Температура кипения:</strong> ${el.boil}°C</p>`;
  html += `<p><strong>Состояние при ${currentTemp}°C:</strong> ${stateRus}</p>`;

  const prop = document.getElementById("propertySelect").value;
  if (prop !== "state") {
    const val = getPropertyValue(el, prop);
    if (val !== null) {
      html += `<div class="property-color" style="background:${getColorForProperty(el,prop)}"></div>`;
    }
  }
  d.innerHTML = html;
}

document.getElementById("darkMode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const btn = document.getElementById("darkMode");
  btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

document.getElementById("simpleView").addEventListener("click", () => {
  showNames = false; showConfig = false;
  setActiveBtn("simpleView"); buildTable();
});
document.getElementById("namesView").addEventListener("click", () => {
  showNames = true; showConfig = false;
  setActiveBtn("namesView"); buildTable();
});
document.getElementById("configView").addEventListener("click", () => {
  showNames = false; showConfig = true;
  setActiveBtn("configView"); buildTable();
});

function setActiveBtn(id) {
  ["simpleView","namesView","configView"].forEach(b => {
    document.getElementById(b).classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

document.getElementById("propertySelect").addEventListener("change", (e) => {
  const val = e.target.value;
  if (val === "state") {
    document.getElementById("tempSlider").parentElement.style.display = "flex";
  } else {
    document.getElementById("tempSlider").parentElement.style.display = "none";
  }
  buildTable();
  const current = ELEMENTS.find(e => e.num === 1);
  if (current) showElementDetail(current);
});

document.getElementById("tempSlider").addEventListener("input", (e) => {
  currentTemp = parseInt(e.target.value);
  document.getElementById("tempValue").textContent = currentTemp;
  buildTable();
  const detailEl = document.querySelector("#elementDetail h2");
  if (detailEl) {
    const num = parseInt(detailEl.textContent.match(/^(\d+)/)?.[1] || "1");
    const el = getElement(num);
    if (el) showElementDetail(el);
  }
});

buildTable();
showElementDetail(getElement(1));
