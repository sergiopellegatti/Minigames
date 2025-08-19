// Impostazione del canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimensioni del canvas - lo rendiamo reattivo alla dimensione della finestra
canvas.width = 800;
canvas.height = 400;

// Variabili di gioco
const gravity = 0.6;
const jumpStrength = -15;
const quantumJumpStrength = -28;
const QUANTA_GOAL = 10;

let keys = {};
let scrollOffset = 0;
let score = 0;
let quantumLeapReady = false;
let gameState = 'start'; // 'start', 'playing', 'complete'

const player = {
    x: 100, y: 250, width: 40, height: 40,
    color: 'deepskyblue', speed: 5,
    velocityX: 0, velocityY: 0, isJumping: true
};

const platforms = [
    { x: 0, y: canvas.height - 40, width: 400, height: 40 },
    { x: 500, y: canvas.height - 100, width: 200, height: 20 },
    { x: 800, y: canvas.height - 180, width: 200, height: 20 },
    { x: 1150, y: canvas.height - 250, width: 150, height: 20 },
    { x: 1500, y: canvas.height - 150, width: 300, height: 20 },
    { x: 1900, y: canvas.height - 250, width: 150, height: 20 },
    { x: 2200, y: canvas.height - 450, width: 100, height: 20, goal: true }
];

const quanta = [];
function setupQuanta() {
    quanta.length = 0;
    const quantaPositions = [
        { x: 350, y: canvas.height - 80 }, { x: 550, y: canvas.height - 140 },
        { x: 650, y: canvas.height - 140 }, { x: 850, y: canvas.height - 220 },
        { x: 950, y: canvas.height - 220 }, { x: 1200, y: canvas.height - 300 },
        { x: 1550, y: canvas.height - 190 }, { x: 1650, y: canvas.height - 190 },
        { x: 1950, y: canvas.height - 290 }, { x: 2000, y: canvas.height - 290 }
    ];
    quantaPositions.forEach(pos => {
        quanta.push({ x: pos.x, y: pos.y, width: 15, height: 15, active: true });
    });
}

// --- CONTROLLI ---
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// --- FUNZIONI DI DISEGNO ---
function drawPlayer() {
    ctx.fillStyle = player.color;
    if (quantumLeapReady) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = "gold";
    }
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.goal ? 'gold' : '#2c5b1b';
        ctx.fillRect(platform.x - scrollOffset, platform.y, platform.width, platform.height);
    });
}

function drawQuanta() {
    ctx.fillStyle = 'gold';
    quanta.forEach(q => {
        if (q.active) {
            ctx.beginPath();
            ctx.arc(q.x - scrollOffset + q.width / 2, q.y + q.height / 2, q.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawUI() {
    ctx.fillStyle = 'black';
    ctx.font = '24px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Quanti: ' + score + ' / ' + QUANTA_GOAL, 20, 30);

    if (quantumLeapReady) {
        ctx.fillStyle = '#0000cd';
        ctx.font = 'bold 20px "Comic Sans MS", "Chalkboard SE", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SALTO QUANTICO PRONTO!', canvas.width / 2, 30);
    }
}

function drawStartScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '40px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText('Quantum Leap!', canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = '22px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText("Lezione 1: L'Energia è Quantizzata!", canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '18px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText("Aiuta Quarky a raccogliere i pacchetti di energia (i quanti).", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Raccoglili tutti per fare un Salto Quantico!", canvas.width / 2, canvas.height / 2 + 30);
    ctx.font = '24px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText("Premi Invio per iniziare", canvas.width / 2, canvas.height / 2 + 80);
}

function drawCompleteScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = '40px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText('Livello Completato!', canvas.width / 2, canvas.height / 2 - 80);
    ctx.font = '22px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText("Hai fatto un Salto Quantico!", canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillStyle = 'gold';
    ctx.font = '18px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText("Proprio come gli elettroni, hai assorbito energia", canvas.width / 2, canvas.height / 2);
    ctx.fillText("in 'pacchetti' (i quanti) per saltare più in alto!", canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillStyle = 'white';
    ctx.font = '22px "Comic Sans MS", "Chalkboard SE", sans-serif';
    ctx.fillText('Premi Invio per rigiocare', canvas.width / 2, canvas.height / 2 + 80);
}

// Funzione per aggiornare lo stato del gioco
function update() {
    if (keys['ArrowLeft'] || keys['KeyA']) player.velocityX = -player.speed;
    else if (keys['ArrowRight'] || keys['KeyD']) player.velocityX = player.speed;
    else player.velocityX = 0;
    player.x += player.velocityX;

    if (player.x > canvas.width / 2 && scrollOffset < (platforms[platforms.length - 1].x + platforms[platforms.length - 1].width - canvas.width)) {
        scrollOffset += player.speed;
        player.x -= player.speed;
    }
    if (player.x < 100 && scrollOffset > 0) {
        scrollOffset -= player.speed;
        player.x += player.speed;
    }

    player.y += player.velocityY;
    player.velocityY += gravity;

    platforms.forEach(platform => {
        const platformX = platform.x - scrollOffset;
        if (player.x + player.width > platformX && player.x < platformX + platform.width &&
            player.y + player.height >= platform.y && player.y + player.height <= platform.y + player.velocityY && player.velocityY >= 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            if (platform.goal) {
                gameState = 'complete';
            }
        }
    });

    quanta.forEach(q => {
        if (q.active) {
            const quantumX = q.x - scrollOffset;
            if (player.x < quantumX + q.width && player.x + player.width > quantumX &&
                player.y < q.y + q.height && player.y + player.height > q.y) {
                q.active = false;
                score++;
                if (score >= QUANTA_GOAL) {
                    quantumLeapReady = true;
                }
            }
        }
    });

    if ((keys['Space'] || keys['ArrowUp']) && !player.isJumping) {
        player.isJumping = true;
        if (quantumLeapReady) {
            player.velocityY = quantumJumpStrength;
            quantumLeapReady = false;
        } else {
            player.velocityY = jumpStrength;
        }
    }

    if (player.y > canvas.height) resetLevel();
}

function resetLevel() {
    player.x = 100;
    player.y = 250;
    player.velocityY = 0;
    player.isJumping = true;
    scrollOffset = 0;
    score = 0;
    quantumLeapReady = false;
    setupQuanta();
    gameState = 'playing';
}

// Il game loop principale
function gameLoop() {
    switch (gameState) {
        case 'start':
            drawStartScreen();
            if (keys['Enter']) {
                resetLevel();
            }
            break;
        case 'playing':
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPlatforms();
            drawQuanta();
            drawPlayer();
            drawUI();
            update();
            break;
        case 'complete':
            drawCompleteScreen();
            if (keys['Enter']) {
                resetLevel();
            }
            break;
    }
    requestAnimationFrame(gameLoop);
}

// Avvio del gioco
console.log("Benvenuto in Quantum Leap! Premi Invio per iniziare.");
gameLoop();
