var LAYOUT = [
  [1,,,,,,,,,,,,,,2],
  [3,4,,,,,,,,,,,,,,5,6,7,8,9,10],
  [11,12,,,,,,,,,,,,,,13,14,15,16,17,18],
  [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
  [37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
  [55,56,null,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
  [87,88,null,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118],
  [null,null,"La",58,59,60,61,62,63,64,65,66,67,68,69,70,71,null],
  [null,null,"Ac",90,91,92,93,94,95,96,97,98,99,100,101,102,103,null]
];

var showNames = false, showConfig = false, curTemp = 25;

function getEl(num) { return ELEMENTS.find(function(e){ return e.num === num; }); }

function buildTable() {
  var box = document.getElementById("tableBox");
  var prop = document.getElementById("propSelect").value;
  var isState = prop === "state";
  var table = document.createElement("table");

  LAYOUT.forEach(function(row) {
    var tr = document.createElement("tr");
    row.forEach(function(cell) {
      if (cell === null || cell === undefined) {
        tr.appendChild(Object.assign(document.createElement("td"), {className:"empty"}));
        return;
      }
      if (typeof cell === "string") {
        var ltd = document.createElement("td");
        ltd.className = "label-cell";
        ltd.textContent = cell;
        tr.appendChild(ltd);
        return;
      }
      var el = getEl(cell);
      if (!el) return;
      var td = document.createElement("td");
      td.className = el.category || "unknown";

      if (isState) {
        var s = "unknown";
        if (el.melt !== undefined && el.boil !== undefined)
          s = curTemp < el.melt ? "solid" : curTemp < el.boil ? "liquid" : "gas";
        td.style.opacity = s === "solid" ? 1 : s === "liquid" ? 0.65 : s === "gas" ? 0.35 : 0.25;
      } else if (!showConfig && el[prop] !== undefined && el[prop] !== "unknown" && typeof el[prop] === "number") {
        var vals = ELEMENTS.map(function(x){ return x[prop]; }).filter(function(x){ return typeof x === "number"; });
        var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
        var r = (el[prop] - mn) / (mx - mn || 1);
        td.style.background = "rgb(" + [Math.round(r*180+40), Math.round((1-r)*120+80), Math.round((1-r)*180+40)].join(",") + ")";
      }

      var html = '<span class="num">' + el.num + '</span><span class="sym">' + el.sym + '</span>';
      if (showNames) html += '<span class="nm">' + el.name + '</span>';
      else if (showConfig) html += '<span class="wt" style="font-size:.52em">' + el.config + '</span>';
      else html += '<span class="wt">' + (el[prop] !== undefined && el[prop] !== "unknown" ? (typeof el[prop] === "number" ? el[prop].toFixed(1) : el[prop]) : "—") + '</span>';
      td.innerHTML = html;

      td.onmouseenter = function(){ showDetail(el); };
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  box.innerHTML = "";
  box.appendChild(table);
}

function showDetail(el) {
  var d = document.getElementById("detail");
  var s = "unknown";
  if (el.melt !== undefined && el.boil !== undefined)
    s = curTemp < el.melt ? "solid" : curTemp < el.boil ? "liquid" : "gas";
  var sRus = {solid:"Твёрдый",liquid:"Жидкий",gas:"Газ",unknown:"Неизвестен"}[s];

  var catRus = {
    "alkali-metal":"Щелочной","alkaline-earth":"Щел-земельный",
    "transition-metal":"Переходный","basic-metal":"Постпереходный",
    "metalloid":"Металлоид","nonmetal":"Неметалл","halogen":"Галоген",
    "noble-gas":"Инертный","lanthanide":"Лантаноид","actinide":"Актиноид"
  }[el.category] || el.category;

  d.innerHTML =
    "<h2>" + el.sym + " — " + el.name + "</h2>" +
    "<p><b>№:</b> " + el.num + " | <b>EN:</b> " + el.name_en + "</p>" +
    "<p><b>Тип:</b> " + catRus + "</p>" +
    "<p><b>Масса:</b> " + el.weight + "</p>" +
    "<p><b>Конф:</b> " + el.config + "</p>" +
    (el.en ? "<p><b>ЭО:</b> " + el.en + "</p>" : "") +
    (el.radius ? "<p><b>Радиус:</b> " + el.radius + " пм</p>" : "") +
    (el.density ? "<p><b>ρ:</b> " + el.density + " г/см³</p>" : "") +
    "<p><b>Tпл:</b> " + el.melt + "°C | <b>Tкип:</b> " + el.boil + "°C</p>" +
    "<p><b>При " + curTemp + "°C:</b> " + sRus + "</p>";
}

document.getElementById("btnDark").onclick = function() {
  document.body.classList.toggle("dark");
  this.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};
document.getElementById("btnSimple").onclick = function() { showNames=false; showConfig=false; setActive("btnSimple"); buildTable(); };
document.getElementById("btnNames").onclick = function() { showNames=true; showConfig=false; setActive("btnNames"); buildTable(); };
document.getElementById("btnConfig").onclick = function() { showNames=false; showConfig=true; setActive("btnConfig"); buildTable(); };
function setActive(id) {
  ["btnSimple","btnNames","btnConfig"].forEach(function(x){ document.getElementById(x).classList.remove("active"); });
  document.getElementById(id).classList.add("active");
}

document.getElementById("propSelect").onchange = function() {
  document.getElementById("tempWrap").style.display = this.value === "state" ? "flex" : "none";
  buildTable(); showDetail(getEl(1));
};
document.getElementById("tempSlider").oninput = function() {
  curTemp = +this.value;
  document.getElementById("tempLabel").textContent = curTemp + "°C";
  buildTable();
  var h2 = document.querySelector("#detail h2");
  if (h2) { var n = +(h2.textContent.match(/\d+/) || [1])[0]; showDetail(getEl(n)); }
};

buildTable();
showDetail(getEl(1));
