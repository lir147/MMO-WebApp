/* ========= GAME DATA ========== */

/* rarities */
const RARITIES = [
  { id: "common", name: "Обычный", color: getComputedStyle(document.documentElement).getPropertyValue('--common') || "#888", weight: 60, mult: 1 },
  { id: "rare", name: "Редкий", color: getComputedStyle(document.documentElement).getPropertyValue('--rare') || "#4aa3ff", weight: 25, mult: 1.2 },
  { id: "epic", name: "Эпический", color: getComputedStyle(document.documentElement).getPropertyValue('--epic') || "#b84aff", weight: 12, mult: 1.5 },
  { id: "legendary", name: "Легендарный", color: getComputedStyle(document.documentElement).getPropertyValue('--legend') || "#ffcc00", weight: 3, mult: 2.2 }
];

/* classes and skills (more skills per class) */
const CLASSES = {
  Warrior: {
    portrait: "", hp:120, mp:30, str:20, agi:10, int:5, crit:5,
    skills: [
      {id:"w_shield", name:"Удар щитом", desc:"Оглушает 2с", lvl:1},
      {id:"w_berserk", name:"Берсерк", desc:"+50% урон 5с", lvl:3},
      {id:"w_mighty", name:"Могучий удар", desc:"Большой физ. урон", lvl:5},
      {id:"w_chall", name:"Вызов", desc:"Привлекает агро", lvl:7}
    ]
  },
  Archer: {
    portrait: "", hp:80, mp:40, str:10, agi:20, int:5, crit:15,
    skills: [
      {id:"a_mult", name:"Многокрит выстрел", desc:"3 стрелы подряд", lvl:1},
      {id:"a_poison", name:"Ядовитая стрела", desc:"Яд 5с", lvl:3},
      {id:"a_expl", name:"Взрывная стрела", desc:"Урон по области", lvl:5},
      {id:"a_trap", name:"Ловушка", desc:"Замедляет", lvl:7}
    ]
  },
  Mage: {
    portrait: "", hp:60, mp:100, str:5, agi:10, int:25, crit:8,
    skills: [
      {id:"m_fire", name:"Огненный шар", desc:"Огненный урон", lvl:1},
      {id:"m_ice", name:"Ледяная стена", desc:"Замедление", lvl:3},
      {id:"m_light", name:"Молния", desc:"Молниеносный урон", lvl:5},
      {id:"m_meta", name:"Магический щит", desc:"Поглощает урон", lvl:8}
    ]
  },
  Assassin: {
    portrait: "", hp:90, mp:40, str:15, agi:25, int:8, crit:25,
    skills: [
      {id:"s_stealth", name:"Скрытность", desc:"Исчезает 3с", lvl:1},
      {id:"s_back", name:"Удар в спину", desc:"Большой крит", lvl:3},
      {id:"s_blade", name:"Вихрь клинков", desc:"Удар по всем", lvl:5},
      {id:"s_poison", name:"Отравляющие клинки", desc:"Яд при атаке", lvl:7}
    ]
  }
};

/* utility: weighted random for rarities */
function weightedRandom(arr){
  const sum = arr.reduce((s,i)=>s+i.weight,0);
  let r = Math.random()*sum;
  for(let a of arr){ r-=a.weight; if(r<=0) return a; }
  return arr[arr.length-1];
}

/* ======= Player state ======= */
let player = {
  classKey: "Warrior",
  level: 1,
  exp: 0,
  xpNext: 100,
  baseAllocated: { hp:0, mp:0, str:5, agi:5, int:5, crit:0 }, // initial allocated = 5 per requested fields: str/agi/int set to 5, hp/mp kept base + allocated
  equip: { weapon:null, helmet:null, armor:null, pants:null, boots:null, accessory:null },
  inventory: [],
  statPoints: 5 // start with 5 (as requested)
};

/* ======= Items generation ======= */
const SAMPLE_ICONS = {
  weapon: "https://img.icons8.com/color/96/sword.png",
  helmet: "https://img.icons8.com/color/96/helmet.png",
  armor: "https://img.icons8.com/color/96/chest-armor.png",
  pants: "https://img.icons8.com/color/96/leggings.png",
  boots: "https://img.icons8.com/color/96/boots.png",
  accessory: "https://img.icons8.com/color/96/ring.png",
  potion: "https://img.icons8.com/color/96/health-potion.png"
};

function makeItem(slot){
  const rar = weightedRandom(RARITIES);
  const lvl = Math.floor(Math.random()*10)+1;
  const mult = rar.mult;
  // random stats scaled by level & rarity
  const stats = {
    str: Math.floor((Math.random()*3 + 1) * lvl * 0.6 * mult),
    agi: Math.floor((Math.random()*3 + 1) * lvl * 0.6 * mult),
    int: Math.floor((Math.random()*3 + 1) * lvl * 0.6 * mult),
    crit: Math.floor((Math.random()*2) * mult)
  };
  const name = (slot==="weapon" ? "Оружие" : slot.charAt(0).toUpperCase()+slot.slice(1)) + ` L${lvl}`;
  const img = SAMPLE_ICONS[slot] || SAMPLE_ICONS.weapon;
  return { id: Date.now().toString(36)+Math.random().toString(36).slice(2,5), name, slot, img, rarity:rar, level:lvl, stats };
}

/* initialize some items */
function initialLootFill(){
  player.inventory = [];
  // push variety
  ['weapon','helmet','armor','pants','boots','accessory'].forEach(s => {
    player.inventory.push(makeItem(s));
  });
  // add consumables
  for(let i=0;i<3;i++){ player.inventory.push({ id: 'pot'+i, name:'Зелье HP', slot:'consumable', img:SAMPLE_ICONS.potion, rarity:RARITIES[0], level:1, stats:{hp:20} }) }
}

/* ======= UI helpers ======= */
const $ = id => document.getElementById(id);
function log(msg){ $('log').innerText = 'Лог: '+msg; }

/* ======= Render ======= */
function renderClassSelect(){
  const sel = $('classSelect');
  sel.innerHTML = '';
  Object.keys(CLASSES).forEach(k=>{
    const opt = document.createElement('option'); opt.value=k; opt.textContent=k; sel.appendChild(opt);
  });
  sel.value = player.classKey;
  sel.onchange = ()=>{ player.classKey = sel.value; resetClassBase(); updateAll(); }
}

function resetClassBase(){
  // keep allocated base stat points but reset base stats
  // baseAllocated had initial 5 for str/agi/int; set hp/mp base from class
  const c = CLASSES[player.classKey];
  // Note: baseAllocated.hp/mp remain as allocated points, but we'll compute effective stats from class + allocated + equipment
}

function computeStats(){
  const base = CLASSES[player.classKey];
  // compute totals: base.hp + allocated.hp + equipment bonuses
  let totals = {
    hp: base.hp + (player.baseAllocated.hp || 0),
    mp: base.mp + (player.baseAllocated.mp || 0),
    str: base.str + (player.baseAllocated.str || 0),
    agi: base.agi + (player.baseAllocated.agi || 0),
    int: base.int + (player.baseAllocated.int || 0),
    crit: base.crit + (player.baseAllocated.crit || 0)
  };
  // add equipment stats
  Object.values(player.equip).forEach(it=>{
    if(!it) return;
    totals.str += it.stats.str||0;
    totals.agi += it.stats.agi||0;
    totals.int += it.stats.int||0;
    totals.crit += it.stats.crit||0;
    if(it.stats.hp) totals.hp += it.stats.hp;
    if(it.stats.mp) totals.mp += it.stats.mp;
  });
  return totals;
}

function updateAll(){
  // header & portrait
  $('char-name').innerText = player.classKey;
  $('char-level').innerText = player.level;
  $('char-exp').innerText = player.exp;
  $('char-xp-next').innerText = player.xpNext;
  $('stat-points').innerText = player.statPoints;

  const totals = computeStats();
  $('stat-hp').innerText = totals.hp;
  $('stat-mp').innerText = totals.mp;
  $('stat-str').innerText = totals.str;
  $('stat-agi').innerText = totals.agi;
  $('stat-int').innerText = totals.int;
  $('stat-crit').innerText = totals.crit + '%';

  // equipment slots
  ['weapon','helmet','armor','pants','boots','accessory'].forEach(slot=>{
    const el = $(slot+'-slot');
    el.innerHTML = '';
    el.style.borderColor = '#2a2f3f';
    const item = player.equip[slot];
    if(item){
      const img = document.createElement('img'); img.src = item.img; img.alt = item.name;
      el.appendChild(img);
      el.title = `${item.name} Lv.${item.level}\n+${item.stats.str} STR  +${item.stats.agi} AGI  +${item.stats.int} INT  +${item.stats.crit}% CRIT`;
      el.style.borderColor = item.rarity.color;
    } else {
      el.textContent = slot === 'weapon' ? 'Оружие' : slot.charAt(0).toUpperCase()+slot.slice(1);
      el.title = 'Пустой слот';
    }
  });

  // inventory
  const grid = $('inventoryGrid'); grid.innerHTML = '';
  player.inventory.forEach((it, idx)=>{
    const div = document.createElement('div'); div.className='inv-item';
    div.style.borderColor = it.rarity.color;
    div.innerHTML = `<img src="${it.img}" alt="${it.name}">` +
      `<div class="lvl-badge">L${it.level}</div>` +
      `<div class="rarity-tag" style="background:${it.rarity.color}">${it.rarity.name}</div>`;
    div.onclick = ()=> onInvClick(idx);
    div.title = `${it.name} | ${it.rarity.name} | Lv.${it.level}\nSTR +${it.stats.str} AGI +${it.stats.agi} INT +${it.stats.int} CRIT +${it.stats.crit}`;
    grid.appendChild(div);
  });

  // skills
  renderSkills();
}

/* ======= Inventory / equip actions ======= */
function onInvClick(index){
  const it = player.inventory[index];
  if(!it) return;
  if(it.slot === 'consumable'){
    // use immediately (heal)
    if(it.stats && it.stats.hp){ logUse(`${it.name} использовано. +${it.stats.hp} HP`); }
    player.inventory.splice(index,1);
  } else {
    // equip: move from inventory -> equip slot
    player.equip[it.slot] = it;
    player.inventory.splice(index,1);
    logUse(`Экипировано ${it.name} в слот ${it.slot}`);
  }
  updateAll();
}

/* unequip by clicking slot */
['weapon','helmet','armor','pants','boots','accessory'].forEach(slot=>{
  const elId = slot+'-slot';
  document.addEventListener('click', (e)=>{
    // slot click handling by id
  });
});
/* Better attach handlers after DOM ready: */
window.addEventListener('load', ()=>{
  ['weapon','helmet','armor','pants','boots','accessory'].forEach(slot=>{
    const el = document.getElementById(slot+'-slot');
    el.addEventListener('click', ()=>{
      if(player.equip[slot]){
        // move to inventory
        player.inventory.push(player.equip[slot]);
        logUse(`Снято ${player.equip[slot].name}`);
        player.equip[slot] = null;
        updateAll();
      } else {
        logUse('Пустой слот — экипируйте предмет из инвентаря');
      }
    });
  });

  // class selector & buttons
  renderClassSelect();
  $('newFightBtn').addEventListener('click', ()=> fightRandom());
  $('addExpBtn').addEventListener('click', ()=> gainExp(50));

  // initial fill
  initialLootFill();
  updateAll();
});

/* ======= Skills rendering & learning (unlocked by level) ======= */
function renderSkills(){
  const tree = $('skillTree'); tree.innerHTML = '';
  const classSkills = CLASSES[player.classKey].skills;
  classSkills.forEach(s=>{
    const node = document.createElement('div'); node.className='skill-node';
    if(player.level < s.lvl) node.classList.add('locked');
    node.innerHTML = `<div><b>${s.name}</b><div style="font-size:13px;color:#9aa0b0">${s.desc}</div></div>`;
    const btn = document.createElement('button');
    btn.innerText = player.level >= s.lvl ? (player.learned && player.learned.includes(s.id) ? '✓ Активно' : 'Изучить') : `Треб L${s.lvl}`;
    btn.disabled = player.level < s.lvl;
    btn.onclick = ()=>{
      if(player.level >= s.lvl){
        player.learned = player.learned || [];
        if(!player.learned.includes(s.id)){
          player.learned.push(s.id);
          btn.innerText = '✓ Активно';
          logUse(`Навык изучен: ${s.name}`);
        } else {
          // toggle off
          player.learned = player.learned.filter(x=>x!==s.id);
          btn.innerText = 'Изучить';
          logUse(`Навык сброшен: ${s.name}`);
        }
      }
    };
    node.appendChild(btn);
    tree.appendChild(node);
  });
}

/* ======= EXP, level up and stat allocation ======= */
function gainExp(amount){
  player.exp += amount;
  logUse(`+${amount} XP`);
  while(player.exp >= player.xpNext){
    player.exp -= player.xpNext;
    player.level++;
    player.xpNext = Math.floor(player.xpNext * 1.25);
    player.statPoints += 5; // +5 points each level
    logUse(`Уровень! Теперь ${player.level}. +5 очков характеристик`);
  }
  updateAll();
}

/* allocate stat: hp, mp, str, agi, int, crit */
function alloc(stat){
  if(player.statPoints <= 0){ logUse('Нет свободных очков.'); return; }
  if(!player.baseAllocated) player.baseAllocated = {hp:0,mp:0,str:0,agi:0,int:0,crit:0};
  player.baseAllocated[stat] = (player.baseAllocated[stat]||0)+1;
  player.statPoints--;
  updateAll();
}

/* fight simulation and loot drop */
function fightRandom(){
  // simple fight RNG
  const monsters = [
    {name:'Гоблин', exp:30, dropSlots:['weapon','helmet'], chance:0.6},
    {name:'Орк', exp:60, dropSlots:['weapon','armor','boots'], chance:0.75},
    {name:'Дракон', exp:180, dropSlots:['weapon','accessory','armor'], chance:0.95}
  ];
  const m = monsters[Math.floor(Math.random()*monsters.length)];
  logUse(`Сражение с ${m.name}...`);
  // simple fight: 80% win
  const win = Math.random() < 0.8;
  if(win){
    gainExp(m.exp);
    // drop?
    if(Math.random() < m.chance){
      const slot = m.dropSlots[Math.floor(Math.random()*m.dropSlots.length)];
      const it = makeItem(slot);
      player.inventory.push(it);
      logUse(`Дроп: ${it.name} (${it.rarity.name})`);
    } else logUse('Дропа нет');
  } else {
    logUse(`Поражение от ${m.name}`);
  }
  updateAll();
}

/* log helper */
function logUse(msg){ $('log').innerText = 'Лог: '+msg; }

/* class selector rendering */
function renderClassSelect(){
  const sel = $('classSelect');
  sel.innerHTML = '';
  Object.keys(CLASSES).forEach(k=>{
    const opt = document.createElement('option'); opt.value=k; opt.textContent=k; sel.appendChild(opt);
  });
  sel.value = player.classKey;
  sel.onchange = ()=>{
    player.classKey = sel.value;
    // reset allocated base stats for new class: keep current baseAllocated but ensure keys
    player.baseAllocated = player.baseAllocated || {hp:0,mp:0,str:5,agi:5,int:5,crit:0};
    updateAll();
  };
}
