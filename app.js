// ptable-style periodic table
const LAYOUT = [
  [1,,,,,,,,,,,2],
  [3,4,,,,,,,,,,,5,6,7,8,9,10],
  [11,12,,,,,,,,,,,13,14,15,16,17,18],
  [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
  [37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
  [55,56,"La",72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
  [87,88,"Ac",104,105,106,107,108,109,110,111,112,113,114,115,116,117,118],
  [,"La",58,59,60,61,62,63,64,65,66,67,68,69,70,71],
  [,"Ac",90,91,92,93,94,95,96,97,98,99,100,101,102,103]
];

const CAT = {
  "alkali-metal":"Щелочной","alkaline-earth":"Щел-земельный",
  "transition-metal":"Переходный","basic-metal":"Постпереходный",
  "metalloid":"Металлоид","nonmetal":"Неметалл","halogen":"Галоген",
  "noble-gas":"Инертный","lanthanide":"Лантаноид","actinide":"Актиноид",
  "unknown":"Неизвестен"
};

let names=false, cfg=false, temp=25;

function el(n){ return ELEMENTS.find(e=>e.num===n) }
function cls(c){ return c?c.replace(' ','-'):'unknown' }

function build(){
  const box=document.getElementById('tableBox'), t=document.createElement('table'),
        prop=document.getElementById('propSelect').value, state=prop==='state';
  LAYOUT.forEach(row=>{
    const tr=document.createElement('tr');
    row.forEach(cell=>{
      if(cell===undefined){ const td=document.createElement('td'); td.className='empty'; tr.appendChild(td); return; }
      if(typeof cell==='string'){ const td=document.createElement('td'); td.className='label-cell'; td.textContent=cell; tr.appendChild(td); return; }
      const e=el(cell); if(!e) return;
      const td=document.createElement('td'); td.className=cls(e.category); td.dataset.n=e.num;
      if(state){
        const s=e.melt!==undefined&&e.boil!==undefined? temp<e.melt?'solid':temp<e.boil?'liquid':'gas':'unknown';
        td.style.opacity=s==='solid'?1:s==='liquid'?.7:s==='gas'?.4:.3;
      } else if(!cfg){
        const v=e[prop]; if(v!==undefined&&v!=='unknown'&&typeof v==='number'){
          const vals=ELEMENTS.map(x=>x[prop]).filter(x=>typeof x==='number'),
                mn=Math.min(...vals),mx=Math.max(...vals),r=(v-mn)/(mx-mn||1);
          td.style.background=`rgb(${Math.round(r*200)},${Math.round((1-r)*150+100)},${Math.round((1-r)*200)})`;
        }
      }
      td.innerHTML=`<span class="num">${e.num}</span><span class="sym">${e.sym}</span>${names?`<span class="nm">${e.name}</span>`:''}${cfg?`<span class="wt" style="font-size:.58em">${e.config}</span>`:`<span class="wt">${(e[prop]!==undefined&&e[prop]!=='unknown'? (typeof e[prop]==='number'?e[prop].toFixed(2):e[prop]):'—')}</span>`}`;
      td.onmouseenter=()=>detail(e); td.onclick=()=>detail(e);
      tr.appendChild(td);
    });
    t.appendChild(tr);
  });
  box.innerHTML=''; box.appendChild(t);
}

function detail(e){
  const d=document.getElementById('detail'), s=e.melt!==undefined&&e.boil!==undefined? temp<e.melt?'solid':temp<e.boil?'liquid':'gas':'unknown',
        sR={solid:'Твёрдый',liquid:'Жидкий',gas:'Газ',unknown:'Неизвестен'}[s],
        cR=CAT[e.category]||e.category;
  let h=`<h2>${e.sym} — ${e.name}</h2>`;
  h+=`<p><b>№:</b> ${e.num} | <b>EN:</b> ${e.name_en}</p>`;
  h+=`<p><b>Тип:</b> ${cR}</p>`;
  h+=`<p><b>Масса:</b> ${e.weight}</p>`;
  h+=`<p><b>Конф:</b> ${e.config}</p>`;
  if(e.en) h+=`<p><b>ЭО:</b> ${e.en}</p>`;
  if(e.radius) h+=`<p><b>Радиус:</b> ${e.radius} пм</p>`;
  if(e.density) h+=`<p><b>ρ:</b> ${e.density} г/см³</p>`;
  h+=`<p><b>Tпл:</b> ${e.melt}°C | <b>Tкип:</b> ${e.boil}°C</p>`;
  h+=`<p><b>При ${temp}°C:</b> ${sR}</p>`;
  d.innerHTML=h;
}

// Controls
document.getElementById('btnDark').onclick=()=>{
  document.body.classList.toggle('dark');
  document.getElementById('btnDark').textContent=document.body.classList.contains('dark')?'☀️':'🌙';
};
document.getElementById('btnSimple').onclick=()=>{ names=false;cfg=false; toggle('btnSimple'); build(); };
document.getElementById('btnNames').onclick=()=>{ names=true;cfg=false; toggle('btnNames'); build(); };
document.getElementById('btnConfig').onclick=()=>{ names=false;cfg=true; toggle('btnConfig'); build(); };
function toggle(id){ ['btnSimple','btnNames','btnConfig'].forEach(x=>document.getElementById(x).classList.remove('active')); document.getElementById(id).classList.add('active'); }

document.getElementById('propSelect').onchange=e=>{
  document.getElementById('tempWrap').style.display=e.target.value==='state'?'flex':'none';
  build(); detail(el(1));
};
document.getElementById('tempSlider').oninput=e=>{
  temp=+e.target.value; document.getElementById('tempLabel').textContent=temp+'°C'; build();
  const h2=document.querySelector('#detail h2'); if(h2){ const n=+h2.textContent.match(/\d+/)?.[0]||1; detail(el(n)); }
};

build(); detail(el(1));
