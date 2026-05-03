// Стандартная таблица Менделеева 18×7 + 2 ряда внизу
const TABLE = [
  [1,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,2],
  [3,4,null,null,null,null,null,null,null,null,null,null,5,6,7,8,9,10],
  [11,12,null,null,null,null,null,null,null,null,null,null,13,14,15,16,17,18],
  [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
  [37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
  [55,56,"La",72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
  [87,88,"Ac",104,105,106,107,108,109,110,111,112,113,114,115,116,117,118],
  [null,null,"La",58,59,60,61,62,63,64,65,66,67,68,69,70,71,null],
  [null,null,"Ac",90,91,92,93,94,95,96,97,98,99,100,101,102,103,null]
];

const CAT_RUS = {
  "alkali-metal":"Щелочной металл","alkaline-earth":"Щелочноземельный",
  "transition-metal":"Переходный металл","basic-metal":"Постпереходный",
  "metalloid":"Металлоид","nonmetal":"Неметалл","halogen":"Галоген",
  "noble-gas":"Инертный газ","lanthanide":"Лантаноид","actinide":"Актиноид",
  "unknown":"Неизвестно"
};

let showNames = false, showConfig = false, currentTemp = 25;

function getEl(n) { return ELEMENTS.find(e => e.num === n); }
function catClass(c) { return c ? c.replace(" ","-") : "unknown"; }

function buildTable() {
  const cont = document.getElementById("tableContainer");
  const table = document.createElement("table");
  const propSel = document.getElementById("propertySelect").value;
  const isState = propSel === "state";

  TABLE.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      if (cell === null) {
        const td = document.createElement("td"); td.className = "empty"; tr.appendChild(td); return;
      }
      if (typeof cell === "string") {
        const td = document.createElement("td"); td.className = "label-cell"; td.textContent = cell; tr.appendChild(td); return;
      }
      const el = getEl(cell); if (!el) return;
      const td = document.createElement("td");
      td.className = catClass(el.category);
      td.dataset.num = el.num;

      if (isState) {
        const s = getState(el, currentTemp);
        td.style.opacity = s==="solid" ? "1" : s==="liquid" ? "0.7" : s==="gas" ? "0.4" : "0.3";
      } else if (!showConfig) {
        const c = getColor(el, propSel); if (c) td.style.background = c;
      }

      let h = `<span class="element-number">${el.num}</span>`;
      h += `<span class="element-symbol">${el.sym}</span>`;
      if (showNames) h += `<span class="element-name">${el.name}</span>`;
      if (showConfig) {
        h += `<span class="element-weight" style="font-size:0.55em">${el.config}</span>`;
      } else {
        const v = getVal(el, propSel);
        h += `<span class="element-weight">${v !== null ? (typeof v==='number' ? v.toFixed(2) : v) : '—'}</span>`;
      }
      td.innerHTML = h;
      td.onmouseenter = () => showDetail(el);
      td.onclick = () => showDetail(el);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  cont.innerHTML = ""; cont.appendChild(table);
}

function getState(el, t) {
  if (!el.melt && !el.boil) return "unknown";
  if (t < el.melt) return "solid";
  if (t < el.boil) return "liquid";
  return "gas";
}

function getVal(el, p) {
  if (p === "state") return null;
  return el[p] ?? null;
}

function getColor(el, p) {
  if (p === "state") return null;
  const v = getVal(el, p); if (v === null || v === "unknown") return null;
  const vals = ELEMENTS.map(e => getVal(e,p)).filter(x => typeof x === "number");
  const min = Math.min(...vals), max = Math.max(...vals);
  if (max === min) return null;
  const r = (v - min) / (max - min);
  // Синий -> Зелёный -> Красный
  const red = Math.round(r * 255), blue = Math.round((1-r) * 255);
  return `rgb(${red},${150},${blue})`;
}

function showDetail(el) {
  const d = document.getElementById("elementDetail");
  const s = getState(el, currentTemp);
  const sRus = {solid:"Твёрдый",liquid:"Жидкий",gas:"Газ",unknown:"Неизвестно"}[s]||s;
  const cRus = CAT_RUS[el.category]||el.category;
  let h = `<h2>${el.sym} — ${el.name}</h2>`;
  h += `<p><b>№</b> ${el.num} | <b>EN:</b> ${el.name_en}</p>`;
  h += `<p><b>Тип:</b> ${cRus}</p>`;
  h += `<p><b>Масса:</b> ${el.weight}</p>`;
  h += `<p><b>Конфиг:</b> ${el.config}</p>`;
  if (el.en) h += `<p><b>ЭО:</b> ${el.en}</p>`;
  if (el.radius) h += `<p><b>Радиус:</b> ${el.radius} пм</p>`;
  if (el.density) h += `<p><b>Плотность:</b> ${el.density} г/см³</p>`;
  h += `<p><b>Tпл:</b> ${el.melt}°C | <b>Tкип:</b> ${el.boil}°C</p>`;
  h += `<p><b>Состояние при ${currentTemp}°C:</b> ${sRus}</p>`;
  d.innerHTML = h;
}

// Обработчики
document.getElementById("darkMode").onclick = () => {
  document.body.classList.toggle("dark");
  document.getElementById("darkMode").textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

document.getElementById("simpleView").onclick = () => {
  showNames=false; showConfig=false; setActive("simpleView"); buildTable();
};
document.getElementById("namesView").onclick = () => {
  showNames=true; showConfig=false; setActive("namesView"); buildTable();
};
document.getElementById("configView").onclick = () => {
  showNames=false; showConfig=true; setActive("configView"); buildTable();
};
function setActive(id) {
  ["simpleView","namesView","configView"].forEach(b => document.getElementById(b).classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.getElementById("propertySelect").onchange = (e) => {
  const v = e.target.value;
  document.querySelector(".temp-slider").style.display = v==="state" ? "flex" : "none";
  buildTable(); showDetail(getEl(1));
};

document.getElementById("tempSlider").oninput = (e) => {
  currentTemp = +e.target.value;
  document.getElementById("tempValue").textContent = currentTemp;
  buildTable();
  const d = document.querySelector("#elementDetail h2");
  if (d) { const n = +d.textContent.match(/(\d+)/)?.[1]||1; showDetail(getEl(n)); }
};

buildTable(); showDetail(getEl(1));
