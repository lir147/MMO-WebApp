let player = {
    name: "Игрок",
    class: null,
    gender: null,
    level: 1,
    vip: 0,
    inventory: [],
    equipment:{weapon:null,armor:null,accessory:null},
    skills:{strength:0,agility:0,intelligence:0},
    skillPoints:0
};

const serverUrl = "http://localhost:3000/player/";

// ====== Лут ======
const lootTable = [
    {name:"Деревянный меч", rarity:"Common", img:"https://opengameart.org/sites/default/files/sword_c.png", bonus:{atk:2}},
    {name:"Стальной щит", rarity:"Rare", img:"https://opengameart.org/sites/default/files/shield_r.png", bonus:{def:5}},
    {name:"Магический посох", rarity:"Epic", img:"https://opengameart.org/sites/default/files/armor_e.png", bonus:{atk:8, mana:5}},
    {name:"Легендарный меч", rarity:"Legendary", img:"https://opengameart.org/sites/default/files/legend_sword.png", bonus:{atk:15, crit:5}},
    {name:"Зелье HP", rarity:"Common", img:"https://opengameart.org/sites/default/files/hp_potion.png", bonus:{hp:20}},
    {name:"Зелье MP", rarity:"Common", img:"https://opengameart.org/sites/default/files/mp_potion.png", bonus:{mana:20}}
];

// ====== Монстры ======
const monsters = [
    {name:"Гоблин", hp:20, img:"https://opengameart.org/sites/default/files/goblin.png", lootChance:0.5},
    {name:"Орк", hp:50, img:"https://opengameart.org/sites/default/files/orc.png", lootChance:0.7},
    {name:"Дракон", hp:100, img:"https://opengameart.org/sites/default/files/dragon.png", lootChance:0.9}
];

// ====== Выбор класса и пола ======
function selectClass(cls){ player.class = cls; checkSelectionDone(); }
function selectGender(gender){ player.gender = gender; checkSelectionDone(); }

function checkSelectionDone(){
    if(player.class && player.gender){
        document.getElementById('selection-screen').style.display="none";
        document.getElementById('game-screen').style.display="block";
        updateGameScreen();
        saveProgress();
    }
}

// ====== Обновление интерфейса ======
function updateGameScreen(){
    document.getElementById('player-name').innerText = `${player.class} (${player.gender})`;
    document.getElementById('player-level').innerText = player.level;
    document.getElementById('player-vip').innerText = player.vip;
    document.getElementById('character-img').src = getCharacterImage();
    renderInventory();
    document.getElementById('skill-points').innerText = player.skillPoints;
}

function getCharacterImage(){
    if(player.class==='warrior') return player.gender==='male'? "https://opengameart.org/sites/default/files/warrior_m.png":"https://opengameart.org/sites/default/files/warrior_f.png";
    if(player.class==='mage') return player.gender==='male'? "https://opengameart.org/sites/default/files/mage_m.png":"https://opengameart.org/sites/default/files/mage_f.png";
    if(player.class==='archer') return player.gender==='male'? "https://opengameart.org/sites/default/files/archer_m.png":"https://opengameart.org/sites/default/files/archer_f.png";
}

// ====== Лут ======
function getRandomLoot(){
    const rand = Math.random();
    if(rand<0.5) return lootTable[0];
    if(rand<0.7) return lootTable[1];
    if(rand<0.9) return lootTable[2];
    return lootTable[3];
}

// ====== Бой с монстром ======
function fightMonster(){
    const monster = monsters[Math.floor(Math.random()*monsters.length)];
    alert(`Вы встретили ${monster.name}!`);
    const win = Math.random()>0.3;
    if(win){
        alert(`Вы победили ${monster.name}!`);
        player.level += 1;
        player.skillPoints += 3;
        if(Math.random()<monster.lootChance){
            const loot = getRandomLoot();
            player.inventory.push(loot);
            alert(`Вы получили лут: ${loot.name} (${loot.rarity})`);
        }
        updateGameScreen();
        saveProgress();
    } else {
        alert(`Вы проиграли ${monster.name}...`);
    }
}

// ====== Инвентарь и экипировка ======
function renderInventory(){
    const container = document.getElementById('inventory-items');
    container.innerHTML="";
    player.inventory.forEach((item,index)=>{
        let img=document.createElement('img');
        img.src=item.img;
        img.title=`${item.name} (${item.rarity})`;
        img.style.cursor="pointer";
        img.onclick=()=>equipItem(index);
        container.appendChild(img);
    });
    renderEquipment();
}

function equipItem(index){
    const item = player.inventory[index];
    if(!item) return;
    if(item.name.toLowerCase().includes("меч") || item.name.toLowerCase().includes("посох")){
        player.equipment.weapon = item;
    } else if(item.name.toLowerCase().includes("щит") || item.name.toLowerCase().includes("броня")){
        player.equipment.armor = item;
    } else {
        player.equipment.accessory = item;
    }
    updateGameScreen();
    saveProgress();
}

function renderEquipment(){
    document.getElementById('eq-weapon').innerText = player.equipment.weapon ? player.equipment.weapon.name : "—";
    document.getElementById('eq-armor').innerText = player.equipment.armor ? player.equipment.armor.name : "—";
    document.getElementById('eq-accessory').innerText = player.equipment.accessory ? player.equipment.accessory.name : "—";
}

// ====== Дерево навыков ======
function upgradeSkill(skill){
    if(player.skillPoints<=0) return alert("Нет очков!");
    player.skills[skill]+=1;
    player.skillPoints-=1;
    document.getElementById('skill-points').innerText=player.skillPoints;
    saveProgress();
}

// ====== VIP донат ======
function donate(){
    let amt = parseInt(prompt("Введите сумму пополнения VIP:"));
    if(!amt || amt<=0) return;
    fetch(serverUrl+"donate/1",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:amt})})
    .then(r=>r.json()).then(res=>{
        player.vip = res.vip;
        updateGameScreen();
        alert("VIP пополнен!");
    });
}

// ====== Сохранение/загрузка ======
function saveProgress(){
    fetch(serverUrl+"1",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(player)});
}

function loadProgress(){
    fetch(serverUrl+"1").then(r=>r.json()).then(data=>{
        if(data) player=data;
        updateGameScreen();
    });
}

loadProgress();
