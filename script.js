document.addEventListener('DOMContentLoaded', function() {
    // Game Data
    const classData = {
        warrior: {
            name: "Воин",
            icon: "⚔️",
            stats: { health: 120, mana: 50, strength: 15, agility: 8, vitality: 12, intellect: 5 },
            skills: [
                { name: "Мощный удар", icon: "💥", desc: "Наносит 150% урона", cost: "10 маны" },
                { name: "Берсерк", icon: "⚡", desc: "Увеличивает силу на 20%", cost: "15 маны" },
                { name: "Щитовая стена", icon: "🛡️", desc: "Блокирует следующую атаку", cost: "20 маны" },
                { name: "Рывок", icon: "🏃", desc: "Быстрое перемещение к цели", cost: "8 маны" }
            ]
        },
        mage: {
            name: "Маг",
            icon: "🧙",
            stats: { health: 80, mana: 150, strength: 5, agility: 7, vitality: 6, intellect: 20 },
            skills: [
                { name: "Огненный шар", icon: "🔥", desc: "Наносит 12-14 урона", cost: "15 маны" },
                { name: "Ледяная стрела", icon: "❄️", desc: "Замедление цели", cost: "12 маны" },
                { name: "Молния", icon: "⚡", desc: "16-18 урона", cost: "18 маны" },
                { name: "Магический щит", icon: "🛡️", desc: "Поглощение урона", cost: "25 маны" },
                { name: "Телепорт", icon: "✨", desc: "Короткое перемещение", cost: "20 маны" }
            ]
        },
        archer: {
            name: "Лучник",
            icon: "🏹",
            stats: { health: 100, mana: 80, strength: 8, agility: 18, vitality: 9, intellect: 7 },
            skills: [
                { name: "Точный выстрел", icon: "🎯", desc: "100% шанс попадания", cost: "12 маны" },
                { name: "Дождь стрел", icon: "🌧️", desc: "Атака по области", cost: "20 маны" },
                { name: "Скрытность", icon: "👁️", desc: "Невидимость на 10 сек", cost: "15 маны" },
                { name: "Ядовитая стрела", icon: "☠️", desc: "Наносит урон со временем", cost: "10 маны" }
            ]
        },
        rogue: {
            name: "Разбойник",
            icon: "🗡️",
            stats: { health: 90, mana: 70, strength: 10, agility: 16, vitality: 8, intellect: 6 },
            skills: [
                { name: "Смертельный удар", icon: "💀", desc: "Критический удар в спину", cost: "15 маны" },
                { name: "Отравление", icon: "🧪", desc: "Наносит урон со временем", cost: "8 маны" },
                { name: "Уклонение", icon: "🌀", desc: "Увеличивает шанс уклонения", cost: "12 маны" },
                { name: "Бросок ножей", icon: "🔪", desc: "Атака несколькими целями", cost: "10 маны" }
            ]
        }
    };

    const questsData = [
        {
            title: "Охотник на крыс",
            desc: "Убить 10 гигантских крыс в подвалах таверны",
            reward: { xp: 50, gold: 10 },
            level: 1
        },
        {
            title: "Волки у границы",
            desc: "Истребить стаю волков, нападающих на путников",
            reward: { xp: 100, gold: 25 },
            level: 2
        },
        {
            title: "Проклятый сад",
            desc: "Очистить сад от нежити, которая появилась там недавно",
            reward: { xp: 200, gold: 50 },
            level: 3
        },
        {
            title: "Бандиты на дороге",
            desc: "Разобраться с бандой, грабящей торговые караваны",
            reward: { xp: 150, gold: 40 },
            level: 2
        }
    ];

    // Game State
    let currentClass = 'warrior';
    let currentGender = 'male';
    let characterName = '';

    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const classOptions = document.querySelectorAll('.class-option');
    const genderOptions = document.querySelectorAll('.gender-option');
    const nicknameInput = document.getElementById('nickname');
    const startButton = document.getElementById('start-button');

    // Initialize
    initTabs();
    initCharacterCreation();
    updateStats(currentClass);
    renderSkills(currentClass);
    renderQuests();

    // Tab System
    function initTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Character Creation
    function initCharacterCreation() {
        // Class selection
        classOptions.forEach(option => {
            option.addEventListener('click', function() {
                classOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                currentClass = this.dataset.class;
                updateStats(currentClass);
                updateCharacterPreview();
                renderSkills(currentClass);
            });
        });

        // Gender selection
        genderOptions.forEach(option => {
            option.addEventListener('click', function() {
                genderOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                currentGender = this.dataset.gender;
                updateCharacterPreview();
            });
        });

        // Nickname input
        nicknameInput.addEventListener('input', function() {
            characterName = this.value.trim();
            updateCharacterPreview();
        });

        // Start game button
        startButton.addEventListener('click', function() {
            if (!characterName) {
                alert('Пожалуйста, введите имя персонажа!');
                nicknameInput.focus();
                return;
            }
            
            // Switch to stats tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            document.querySelector('[data-tab="stats"]').classList.add('active');
            document.getElementById('stats').classList.add('active');

            // Initialize game with created character
            initializeGame();
        });
    }

    function updateStats(className) {
        const stats = classData[className].stats;
        const statsContainer = document.getElementById('stats-display');

        statsContainer.innerHTML = `
            <div class="stat-row">
                <span class="stat-icon">❤️</span>
                <span class="stat-name">Здоровье:</span>
                <span class="stat-value">${stats.health}</span>
            </div>
            <div class="stat-row">
                <span class="stat-icon">🔮</span>
                <span class="stat-name">Мана:</span>
                <span class="stat-value">${stats.mana}</span>
            </div>
            <div class="stat-row">
                <span class="stat-icon">💪</span>
                <span class="stat-name">Сила:</span>
                <span class="stat-value">${stats.strength}</span>
            </div>
            <div class="stat-row">
                <span class="stat-icon">🏃</span>
                <span class="stat-name">Ловкость:</span>
                <span class="stat-value">${stats.agility}</span>
            </div>
            <div class="stat-row">
                <span class="stat-icon">🛡️</span>
                <span class="stat-name">Выносливость:</span>
                <span class="stat-value">${stats.vitality}</span>
            </div>
            <div class="stat-row">
                <span class="stat-icon">🧠</span>
                <span class="stat-name">Интеллект:</span>
                <span class="stat-value">${stats.intellect}</span>
            </div>
        `;
    }

    function renderSkills(className) {
        const skills = classData[className].skills;
        const skillsContainer = document.getElementById('skills-display');

        skillsContainer.innerHTML = skills.map(skill => `
            <div class="skill-card">
                <div class="skill-header">
                    <span class="skill-icon">${skill.icon}</span>
                    <h4 class="skill-name">${skill.name}</h4>
                </div>
                <p class="skill-desc">${skill.desc}</p>
                <div class="skill-cost">${skill.cost}</div>
            </div>
        `).join('');
    }

    function renderQuests() {
        const questsContainer = document.getElementById('quests-display');

        questsContainer.innerHTML = questsData.map(quest => `
            <div class="quest-card">
                <h4 class="quest-title">${quest.title}</h4>
                <p class="quest-desc">${quest.desc}</p>
                <div class="quest-level">Уровень: ${quest.level}</div>
                <div class="quest-reward">
                    <span>Награда: ${quest.reward.xp} опыта, ${quest.reward.gold} золота</span>
                </div>
            </div>
        `).join('');
    }

    function updateCharacterPreview() {
        const preview = document.getElementById('character-preview');
        const classInfo = classData[currentClass];

        preview.innerHTML = `
            <div class="character-image">
                ${classInfo.icon}
            </div>
            <h3>${characterName || 'Безымянный'}</h3>
            <p>${classInfo.name}</p>
            <p>${currentGender === 'male' ? '♂ Мужской' : '♀ Женский'}</p>
        `;
    }

    function initializeGame() {
        // Здесь будет логика инициализации игры
        console.log('Игра запущена!');
        console.log('Персонаж:', {
            name: characterName,
            class: currentClass,
            gender: currentGender,
            stats: classData[currentClass].stats
        });

        // Обновляем информацию о персонаже в статистике
        document.getElementById('character-info').innerHTML = `
            <h2>${characterName}</h2>
            <p>${classData[currentClass].icon} ${classData[currentClass].name}</p>
            <p>${currentGender === 'male' ? '♂ Мужской' : '♀ Женский'}</p>
        `;
    }

    // Добавляем обработчики для других функциональностей
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

});