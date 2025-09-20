// --- Игрок ---
let player = {
  name: '',
  class: '',
  level: 1,
  hp: 100,
  mana: 50,
  attack: 5,
  crit: 5,
  speed: 5,
  magic: 5,
  weapon: null,
  armor: null,
  weaponRarity: null,
  armorRarity: null,
  location: 'map1'
};

// --- Локации ---
const mapLocations = {
  map1: { name: 'Лес', monsters: ['Скелет', 'Волк'], next: 'map2' },
  map2: { name: 'Пещера', monsters: ['Гоблин', 'Тролль'], next: 'map3' },
  map3: { name: 'Замок', monsters: ['Рыцарь', 'Дракон'], next: null }
};

// --- Таверна задания ---
const tavernTasks = [
  { task: 'Убей 5 скелетов', reward: 50 },
  { task: 'Принеси редкий кристалл', reward: 100 }
];

// --- Навыки классов ---
const skills = {
  warrior: [
    {name:'Сильный удар', cost:0, effect:() => randomInt(10,20)},
    {name:'Ярость', cost:0, effect:() => randomInt(20,35)}
  ],
  mage: [
    {name:'Огненный шар', cost:10, effect:() => randomInt(15,30)},
    {name:'Ледяная стрела', cost:15, effect:() => randomInt(20,40)}
  ],
  archer: [
    {name:'Прицельный выстрел', cost:0, effect:() => randomInt(10,25)},
    {name:'Мгновенный выстрел', cost:0, effect:() => randomInt(15,30)}
  ],
  assassin: [
    {name:'Смертельный удар', cost:0, effect:() => randomInt(20,35)},
    {name:'Теневой прыжок', cost:0, effect:() => randomInt(25,45)}
  ]
};

// --- Создание персонажа ---
document.getElementById('createCharacterBtn').addEventListener('click', () => {
  const name = document.getElementById('charName').value;
  const charClass = document.getElementById('charClass').value;
  if (!name) { alert('Введите имя персонажа'); return; }

  player.name = name;
  player.class = charClass;

  player.hp = 100;
  player.mana = (charClass === 'mage') ? 50 : 0;
  player.attack = 5;
  player.crit = 5;
  player.speed = 5;
  player.magic = (charClass === 'mage') ? 5 : 0;

  savePlayer();
  document.getElementById('createCharacterMenu').classList.add('hidden');
  document.getElementById('gameplay').style.display = 'block';

  updateStatsUI();
  updateCharacterDisplay();
  renderMap();
});

// --- UI ---
function updateStatsUI() {
  document.getElementById('playerName').textContent = player.name;
  document.getElementById('playerClass').textContent = player.class;
  document.getElementById('playerLevel').textContent = player.level;
  document.getElementById('playerHP').textContent = player.hp;
  document.getElementById('playerMana').textContent = player.mana;
  document.getElementById('playerAttack').textContent = player.attack;
  document.getElementById('playerCrit').textContent = player.crit;
  document.getElementById('playerSpeed').textContent = player.speed;
  document.getElementById('playerMagic').textContent = player.magic;
  document.getElementById('weapon').textContent = player.weapon || '-';
  document.getElementById('armor').textContent = player.armor || '-';
}

function updateCharacterDisplay() {
  const classKey = player.class;
  document.getElementById('charBase').src = `icons/${classKey}.png`;
  document.getElementById('charArmor').src = player.armor ? `icons/${player.armor}.png` : '';
  document.getElementById('charWeapon').src = player.weapon ? `icons/${player.weapon}.png` : '';
}

// --- Экипировка ---
function equipItem(itemType, itemName, rarity) {
  if (itemType === 'weapon') { player.weapon = itemName; player.weaponRarity = rarity; }
  if (itemType === 'armor') { player.armor = itemName; player.armorRarity = rarity; }
  updateStatsUI();
  updateCharacterDisplay();
  savePlayer();
}

// --- Карта ---
function renderMap() {
  const mapDiv = document.getElementById('map');
  mapDiv.innerHTML = `<p>Вы находитесь в ${mapLocations[player.location].name}</p>`;
  const monsters = mapLocations[player.location].monsters;
  monsters.forEach(monster => {
    const btn = document.createElement('button');
    btn.textContent = `Сразиться с ${monster}`;
    btn.onclick = () => fightMonster(monster);
    mapDiv.appendChild(btn);
  });
  if (mapLocations[player.location].next) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Перейти дальше';
    nextBtn.onclick = goNextLocation;
    mapDiv.appendChild(nextBtn);
  }
}

// --- Бой ---
function fightMonster(monster) {
  let skillOptions = skills[player.class];
  let skillNames = skillOptions.map(s => s.name).join(', ');
  let choice = prompt(`Выберите навык (${skillNames}):`);
  let skill = skillOptions.find(s => s.name.toLowerCase() === choice.toLowerCase());
  if (!skill) { alert('Неверный выбор, используем первый навык'); skill = skillOptions[0]; }

  if (player.class === 'mage' && player.mana < skill.cost) {
    alert('Недостаточно маны! Используется обычная атака.');
    skill = {name:'Обычная атака', cost:0, effect:() => randomInt(5,15)};
  }

  let damage = skill.effect();
  if (player.class !== 'mage') player.mana += 5; // регенерация ярости
  else player.mana -= skill.cost;

  const monsterAttack = randomInt(5,15);
  player.hp -= monsterAttack;
  if (player.hp < 0) player.hp = 0;

  alert(`Вы используете ${skill.name} и наносите ${damage} урона.\n${monster} наносит вам ${monsterAttack} урона.`);

  if (player.hp === 0) {
    alert('Вы погибли! Начинаем заново.');
    localStorage.removeItem('rpgPlayer');
    location.reload();
    return;
  }

  player.level += 1;
  updateStatsUI();
  savePlayer();
}

// --- Перейти дальше ---
function goNextLocation() {
  if (mapLocations[player.location].next) {
    player.location = mapLocations[player.location].next;
    renderMap();
    savePlayer();
  }
}

// --- Таверна ---
function goToTavern() {
  document.getElementById('gameplay').style.display = 'none';
  document.getElementById('tavern').style.display = 'block';
  renderTavern();
}

function backToMap() {
  document.getElementById('tavern').style.display = 'none';
  document.getElementById('gameplay').style.display = 'block';
}

function renderTavern() {
  const tavDiv = document.getElementById('tavernTasks');
  tavDiv.innerHTML = '';
  tavernTasks.forEach(task => {
    const btn = document.createElement('button');
    btn.textContent = `${task.task} (Награда: ${task.reward} очков)`;
    btn.onclick = () => {
      alert(`Вы выполнили задание "${task.task}" и получили ${task.reward} очков!`);
      player.level += 1;
      player.mana += 10;
      updateStatsUI();
      savePlayer();
    };
    tavDiv.appendChild(btn);
  });
}

// --- Вспомогательные ---
function savePlayer() { localStorage.setItem('rpgPlayer', JSON.stringify(player)); }
function loadPlayer() {
  const saved = JSON.parse(localStorage.getItem('rpgPlayer'));
  if (saved) {
    player = saved;
    document.getElementById('createCharacterMenu').classList.add('hidden');
    document.getElementById('gameplay').style.display = 'block';
    updateStatsUI();
    updateCharacterDisplay();
    renderMap();
  }
}
function randomInt(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }

window.onload = loadPlayer;
