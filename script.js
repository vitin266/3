const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let round = 1;
let score = 0;
let highScore = 0;
let player = { x: 400, y: 300, size: 30, speed: 3, type: "insect", canEat: ["frog"], invincible: false };
let preys = [];
let predators = [];
let gameRunning = false;
let gamePaused = false;

const movement = { up: false, down: false, left: false, right: false };

// Dados dos animais
const animalData = {
    insect: { name: "Inseto", speed: 2, size: 10, predator: "frog", canEat: ["frog"] },
    frog: { name: "Sapo", speed: 3, size: 20, predator: "bird", canEat: ["insect"] },
    bird: { name: "Ave", speed: 6, size: 30, predator: "fox", canEat: ["frog"] },
    rat: { name: "Rato", speed: 5, size: 25, predator: "fox", canEat: ["bird"] },
    fox: { name: "Raposa", speed: 12, size: 40, predator: "eagle", canEat: ["rat"] },
    eagle: { name: "Águia", speed: 15, size: 50, predator: "none", canEat: ["fox"] },
};

// Atualiza o fundo com base no round
function updateBackground() {
    const backgrounds = [
        "linear-gradient(135deg, #A8E6CF, #DCEDC1)",
        "linear-gradient(135deg, #FFD3B6, #FFAAA5)",
        "linear-gradient(135deg, #FF8C94, #D291BC)",
        "linear-gradient(135deg, #957DAD, #D5AAFF)",
        "linear-gradient(135deg, #88E1F2, #55C1FF)",
        "linear-gradient(135deg, #83D475, #2EB872)",
    ];
    document.querySelector(".game-container").style.background = backgrounds[round - 1] || "#ffffff";
}

// Inicializa o round
function setupRound() {
    preys = [];
    predators = [];
    for (let i = 0; i < 10; i++) {
        preys.push(spawnEntity("insect"));
    }

    // Aumentar a quantidade de predadores conforme o round
    for (let i = 0; i < round; i++) {
        predators.push(spawnEntity("frog"));
    }

    updateBackground();
}

// Cria entidades
function spawnEntity(type) {
    const data = animalData[type];
    return {
        type,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: data.size,
        speed: data.speed,
        dx: Math.random() < 0.5 ? 1 : -1,
        dy: Math.random() < 0.5 ? 1 : -1,
    };
}

// Desenha entidades
function drawEntity(entity, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(entity.x, entity.y, entity.size, 0, Math.PI * 2);
    ctx.fill();

    // Desenha o nome do animal acima dele
    const animal = animalData[entity.type];
    const name = animal ? animal.name : "Desconhecido";
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(name, entity.x - ctx.measureText(name).width / 2, entity.y - entity.size - 10);
}

// Movimenta o jogador
function movePlayer() {
    if (movement.up && player.y > 0) player.y -= player.speed;
    if (movement.down && player.y + player.size < canvas.height) player.y += player.speed;
    if (movement.left && player.x > 0) player.x -= player.speed;
    if (movement.right && player.x + player.size < canvas.width) player.x += player.speed;
}

// Movimenta as presas aleatoriamente, garantindo que não saiam da tela
function movePrey(prey) {
    // Movimento aleatório
    prey.x += prey.dx * prey.speed;
    prey.y += prey.dy * prey.speed;

    // Impede que as presas saiam da tela e inverte a direção se chegar nas bordas
    if (prey.x - prey.size < 0 || prey.x + prey.size > canvas.width) {  // Limite horizontal
        prey.dx *= -1;  // Inverte a direção horizontal
    }
    if (prey.y - prey.size < 0 || prey.y + prey.size > canvas.height) {  // Limite vertical
        prey.dy *= -1;  // Inverte a direção vertical
    }
}

// Movimenta os predadores em direção ao jogador
function moveEntity(entity) {
    if (entity.type === "frog" || entity.type === "fox" || entity.type === "eagle") {
        const angle = Math.atan2(player.y - entity.y, player.x - entity.x);
        entity.dx = Math.cos(angle);
        entity.dy = Math.sin(angle);
    }

    entity.x += entity.dx * entity.speed;
    entity.y += entity.dy * entity.speed;

    // Impede que os predadores saiam da tela
    if (entity.x - entity.size < 0 || entity.x + entity.size > canvas.width) entity.dx *= -1;
    if (entity.y - entity.size < 0 || entity.y + entity.size > canvas.height) entity.dy *= -1;
}

// Colisão
function isColliding(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return dist < a.size + b.size;
}

// Loop principal
function drawGame() {
    if (!gameRunning || gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEntity(player, "blue");

    preys.forEach(prey => {
        drawEntity(prey, "green");
        movePrey(prey);  // As presas agora se movem aleatoriamente
        if (isColliding(player, prey)) {
            score += 5;
            preys = preys.filter(p => p !== prey);
        }
    });

    predators.forEach(predator => {
        drawEntity(predator, "red");
        moveEntity(predator);
        if (isColliding(player, predator)) {
            alert("Game Over! Pontuação Final: " + score);
            gameRunning = false;
            return;
        }
    });

    movePlayer();

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Pontuação: " + score, 10, 20);
    ctx.fillText("Rodada: " + round, 10, 50);

    if (preys.length === 0) {
        round++;
        if (round > 6) {  // Limitar o número de rounds
            alert("Você venceu o jogo! Pontuação Final: " + score);
            gameRunning = false;
            return;
        }
        setupRound();
    }

    requestAnimationFrame(drawGame);
}

// Controle de teclado
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") movement.up = true;
    if (e.key === "ArrowDown") movement.down = true;
    if (e.key === "ArrowLeft") movement.left = true;
    if (e.key === "ArrowRight") movement.right = true;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowUp") movement.up = false;
    if (e.key === "ArrowDown") movement.down = false;
    if (e.key === "ArrowLeft") movement.left = false;
    if (e.key === "ArrowRight") movement.right = false;
});

// Funções de controle
function startGame() {
    score = 0;
    round = 1;
    gameRunning = true;
    gamePaused = false;
    setupRound();
    drawGame();
}

function pauseGame() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        console.log("Jogo pausado");
    } else {
        console.log("Jogo retomado");
        drawGame();
    }
}

function resetGame() {
    score = 0;
    round = 1;
    gameRunning = false;
    preys = [];
    predators = [];
    setupRound();
    drawGame();
}

// Inicializa o jogo
document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("pauseButton").addEventListener("click", pauseGame);
document.getElementById("resetButton").addEventListener("click", resetGame);

setupRound();  // Inicia o primeiro round