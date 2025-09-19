let player = {
    name: "Игрок",
    class: null,
    gender: null,
    level: 1,
    vip: 0,
    inventory: []
};

const serverUrl = "http://localhost:3000/player/";

function selectClass(cls){
    player.class = cls;
    checkSelectionDone();
}

function selectGender(gender){
    player.gender = gender;
    checkSelectionDone();
}

function checkSelectionDone(){
    if(player.class && player.gender){
        document.getElementById('selection-screen').style.display = "none";
        document.getElementById('game-screen').style.display = "block";
        updateGameScreen();
        saveProgress();
    }
}

function updateGameScreen(){
    document.getElementById('player-name').innerText = `${player.class} (${player.gender})`;
    document.getElementById('player-level').innerText = player.level;
    document.getElementById('player-vip').innerText = player.vip;
    let charImg = getCharacterImage();
    document.getElementById('character-img').src = charImg;
    renderInventory();
}

function getCharacterImage(){
    // Примеры реальных ссылок pixel-art персонажей
    if(player.class === 'warrior') return player.gender==='male'?
        "https://opengameart.org/sites/default/files/warrior_m.png" :
        "https://opengameart.org/sites/default/files/warrior_f.png";
    if(player.class === 'mage') return player.gender==='male'?
        "https://opengameart.org/sites/default/files/mage_m.png" :
        "https://opengameart.org/sites/default/files/mage_f.png";
    if(player.class === 'archer') return player.gender==='male'?
        "https://opengameart.org/sites/default/files/archer_m.png" :
        "https://opengameart.org/sites/default/files/archer_f.png";
}

function renderInventory(){
    const container = document.getElementById('inventory-items');
    container.innerHTML = "";
    player.inventory.forEach(item=>{
        let img = document.createElement('img');
        img.src = item.img;
        img.title = `${item.name} (${item.rarity})`;
        container.appendChild(img);
    });
}

async function saveProgress(){
    await fetch(serverUrl + "1", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(player)
    });
}

async function donate(){
    let amount = parseInt(prompt("Введите сумму пополнения VIP:"));
    if(!amount || amount <= 0) return;
    await fetch("http://localhost:3000/donate/1", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({amount})
    });
    player.vip += amount;
    // Первый бонус
    if(player.level===1) player.inventory.push({
        name:"Бонусный меч",
        rarity:"Legendary",
        img:"https://opengameart.org/sites/default/files/legend_sword.png"
    });
    updateGameScreen();
    saveProgress();
}
