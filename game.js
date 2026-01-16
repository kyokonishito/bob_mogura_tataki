// ゲーム状態管理
let score = 0;
let timeLeft = 60;
let isPlaying = false;
let moleTimer = null;
let countdownTimer = null;
let activeMoles = new Set();
let combo = 0;
let maxCombo = 0;
let currentDifficulty = 'normal';

// 難易度設定
const difficulties = {
    easy: {
        popInterval: { min: 800, max: 1800 },
        showTime: { min: 1200, max: 2000 },
        specialChance: 0.15
    },
    normal: {
        popInterval: { min: 500, max: 1500 },
        showTime: { min: 800, max: 1500 },
        specialChance: 0.2
    },
    hard: {
        popInterval: { min: 300, max: 1000 },
        showTime: { min: 500, max: 1000 },
        specialChance: 0.25
    }
};

// DOM要素の取得
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const comboDisplay = document.getElementById('combo');
const difficultyScreen = document.getElementById('difficultyScreen');
const gameScreen = document.getElementById('gameScreen');
const backBtn = document.getElementById('backBtn');
const restartBtn = document.getElementById('restartBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const maxComboDisplay = document.getElementById('maxCombo');
const newHighScoreDisplay = document.getElementById('newHighScore');
const holes = document.querySelectorAll('.hole');
const moles = document.querySelectorAll('.mole');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const particleContainer = document.getElementById('particleContainer');

// 効果音（Web Audio API使用）
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playHitSound() {
    playSound(800, 0.1, 'square');
}

function playBonusSound() {
    playSound(1200, 0.15, 'sine');
    setTimeout(() => playSound(1400, 0.15, 'sine'), 50);
}

function playBombSound() {
    playSound(200, 0.2, 'sawtooth');
}

function playGameOverSound() {
    playSound(400, 0.3, 'sine');
    setTimeout(() => playSound(300, 0.3, 'sine'), 150);
    setTimeout(() => playSound(200, 0.5, 'sine'), 300);
}

function playComboSound(comboCount) {
    const baseFreq = 600;
    const freq = baseFreq + (comboCount * 50);
    playSound(freq, 0.1, 'triangle');
}

// ハイスコア管理
function getHighScore(difficulty) {
    return parseInt(localStorage.getItem(`highScore_${difficulty}`) || '0');
}

function setHighScore(difficulty, score) {
    localStorage.setItem(`highScore_${difficulty}`, score.toString());
    updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
    document.getElementById('highScoreEasy').textContent = getHighScore('easy');
    document.getElementById('highScoreNormal').textContent = getHighScore('normal');
    document.getElementById('highScoreHard').textContent = getHighScore('hard');
}

// パーティクルエフェクト
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = color;
        
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

// スコアポップアップ
function showScorePopup(x, y, points, type = 'normal') {
    const popup = document.createElement('div');
    popup.className = `score-popup ${type}`;
    popup.textContent = `+${points}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// ゲーム初期化
function initGame() {
    score = 0;
    timeLeft = 60;
    isPlaying = false;
    combo = 0;
    maxCombo = 0;
    activeMoles.clear();
    
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    comboDisplay.textContent = combo;
    gameOverScreen.classList.add('hidden');
    
    // すべてのもぐらを隠す
    moles.forEach(mole => {
        mole.classList.remove('show', 'hit', 'bonus', 'bomb');
    });
}

// 難易度選択
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.difficulty;
        difficultyScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startGame();
    });
});

// ゲーム開始
function startGame() {
    if (isPlaying) return;
    
    initGame();
    isPlaying = true;
    
    // タイマー開始
    startCountdown();
    
    // もぐら出現開始
    popUpMole();
}

// カウントダウンタイマー
function startCountdown() {
    countdownTimer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ランダムな穴を選択
function randomHole() {
    const availableHoles = Array.from(holes).filter((_, index) => !activeMoles.has(index));
    
    if (availableHoles.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableHoles.length);
    const selectedHole = availableHoles[randomIndex];
    const holeIndex = parseInt(selectedHole.dataset.index);
    
    return { hole: selectedHole, index: holeIndex };
}

// もぐらのタイプを決定
function getMoleType() {
    const difficulty = difficulties[currentDifficulty];
    const rand = Math.random();
    
    if (rand < difficulty.specialChance * 0.3) {
        return 'bomb'; // 爆弾（ペナルティ）
    } else if (rand < difficulty.specialChance) {
        return 'bonus'; // ボーナス
    }
    return 'normal'; // 通常
}

// もぐらを出現させる
function popUpMole() {
    if (!isPlaying) return;
    
    const selected = randomHole();
    
    if (selected) {
        const { hole, index } = selected;
        const mole = hole.querySelector('.mole');
        const moleType = getMoleType();
        
        // もぐらのタイプを設定
        mole.dataset.type = moleType;
        if (moleType === 'bonus') {
            mole.classList.add('bonus');
        } else if (moleType === 'bomb') {
            mole.classList.add('bomb');
        }
        
        // もぐらを表示
        mole.classList.add('show');
        activeMoles.add(index);
        
        // ランダムな時間後に消す
        const difficulty = difficulties[currentDifficulty];
        const showTime = Math.random() * (difficulty.showTime.max - difficulty.showTime.min) + difficulty.showTime.min;
        
        setTimeout(() => {
            if (mole.classList.contains('show') && !mole.classList.contains('hit')) {
                mole.classList.remove('show', 'bonus', 'bomb');
                activeMoles.delete(index);
                // ミスしたらコンボリセット
                if (combo > 0) {
                    combo = 0;
                    comboDisplay.textContent = combo;
                }
            }
        }, showTime);
    }
    
    // 次のもぐら出現をスケジュール
    const difficulty = difficulties[currentDifficulty];
    const nextPopTime = Math.random() * (difficulty.popInterval.max - difficulty.popInterval.min) + difficulty.popInterval.min;
    moleTimer = setTimeout(popUpMole, nextPopTime);
}

// もぐらをクリックした時の処理
function whackMole(e) {
    if (!isPlaying) return;
    
    const mole = e.target;
    
    if (mole.classList.contains('show') && !mole.classList.contains('hit')) {
        const moleType = mole.dataset.type || 'normal';
        const rect = mole.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        let points = 0;
        let particleColor = '#667eea';
        
        if (moleType === 'bonus') {
            // ボーナスもぐら
            points = 5;
            combo++;
            playBonusSound();
            particleColor = '#ffd700';
            showScorePopup(x, y, points, 'bonus');
        } else if (moleType === 'bomb') {
            // 爆弾もぐら（ペナルティ）
            points = -3;
            combo = 0;
            playBombSound();
            particleColor = '#e74c3c';
            showScorePopup(x, y, points, 'bomb');
        } else {
            // 通常もぐら
            points = 1;
            combo++;
            playHitSound();
            showScorePopup(x, y, points, 'normal');
        }
        
        // コンボボーナス
        if (combo > 1 && moleType !== 'bomb') {
            const comboBonus = Math.floor(combo / 3);
            points += comboBonus;
            playComboSound(combo);
            
            // コンボ表示アニメーション
            comboDisplay.classList.add('active');
            setTimeout(() => comboDisplay.classList.remove('active'), 300);
        }
        
        // スコア更新
        score = Math.max(0, score + points);
        scoreDisplay.textContent = score;
        comboDisplay.textContent = combo;
        
        // 最大コンボ更新
        if (combo > maxCombo) {
            maxCombo = combo;
        }
        
        // パーティクルエフェクト
        createParticles(x, y, particleColor, 15);
        
        // ヒットアニメーション
        mole.classList.add('hit');
        mole.classList.remove('show');
        
        // アクティブなもぐらリストから削除
        const hole = mole.parentElement;
        const index = parseInt(hole.dataset.index);
        activeMoles.delete(index);
        
        // アニメーション終了後にクラスを削除
        setTimeout(() => {
            mole.classList.remove('hit', 'bonus', 'bomb');
        }, 300);
    }
}

// ゲーム終了
function endGame() {
    isPlaying = false;
    
    // タイマーをクリア
    clearInterval(countdownTimer);
    clearTimeout(moleTimer);
    
    // すべてのもぐらを隠す
    moles.forEach(mole => {
        mole.classList.remove('show', 'hit', 'bonus', 'bomb');
    });
    activeMoles.clear();
    
    // ハイスコアチェック
    const currentHighScore = getHighScore(currentDifficulty);
    const isNewHighScore = score > currentHighScore;
    
    if (isNewHighScore) {
        setHighScore(currentDifficulty, score);
        newHighScoreDisplay.classList.remove('hidden');
    } else {
        newHighScoreDisplay.classList.add('hidden');
    }
    
    // ゲームオーバー画面を表示
    finalScoreDisplay.textContent = score;
    maxComboDisplay.textContent = maxCombo;
    gameOverScreen.classList.remove('hidden');
    
    // 効果音
    playGameOverSound();
}

// リスタート
function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

// メニューに戻る
function backToMenu() {
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    difficultyScreen.classList.remove('hidden');
}

// イベントリスナーの設定
backBtn.addEventListener('click', backToMenu);
restartBtn.addEventListener('click', restartGame);
backToMenuBtn.addEventListener('click', backToMenu);

// 各もぐらにクリックイベントを追加
moles.forEach(mole => {
    mole.addEventListener('click', whackMole);
});

// 初期化
updateHighScoreDisplay();

// Made with Bob
