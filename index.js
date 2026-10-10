// 1. 按鈕點擊與蓋章音效變數
let audioCtx = null;

// 2. 🎵 背景音樂設定 (請確保 bgm.mp3 檔名與你的音樂檔一致)
const bgmAudio = new Audio('bgm.mp3');
bgmAudio.loop = true; // 開啟循環播放
let isBgmPlaying = false;

// 切換播放/暫停 MP3 背景音樂
function toggleBgm() {
    const btnText = document.getElementById('bgm-text');
    if (isBgmPlaying) {
        bgmAudio.pause();
        isBgmPlaying = false;
        btnText.innerText = "背景音樂：關閉";
    } else {
        bgmAudio.play().then(() => {
            isBgmPlaying = true;
            btnText.innerText = "背景音樂：播放中";
        }).catch(err => {
            console.log("音樂播放受阻：", err);
        });
    }
}

// 3. 點擊與互動音效產生器
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

/* 升級版：模擬真實厚重蓋章打擊聲 (木章重音 + 紙張撞擊感) */
function playStampSound() {
    initAudio();
    const now = audioCtx.currentTime;

    // 1. 印章壓下去的重低音撞擊 (Thump)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    oscGain.gain.setValueAtTime(1.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // 2. 印面接觸紙張瞬間的「喀噠」聲 (Contact Noise)
    const bufferSize = audioCtx.sampleRate * 0.04;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + 0.04);
}

function playCorrectSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.4);
}

function playWrongSound() {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 0.25);
}

function playPopSound() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

/* 模擬打字機按鍵按壓音效 */
function playTypewriterSound() {
    initAudio();
    const now = audioCtx.currentTime;

    const bufferSize = audioCtx.sampleRate * 0.025;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + Math.random() * 200, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + 0.025);
}

/* 漸變控制背景音樂音量 */
function fadeBgmVolume(targetVol) {
    if (!bgmAudio) return;
    const startVol = bgmAudio.volume;
    const duration = 500;
    const startTime = Date.now();
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            bgmAudio.volume = targetVol;
            clearInterval(timer);
        } else {
            bgmAudio.volume = startVol + (targetVol - startVol) * (elapsed / duration);
        }
    }, 30);
}

document.getElementById('bgm-toggle').addEventListener('click', toggleBgm);

/* 1. 門票驗票點擊邏輯 */
document.getElementById('punch-btn').addEventListener('click', function () {
    if (typeof playPopSound === 'function') playPopSound();

    const pwdInput = document.getElementById('ticket-pwd');
    const pwdError = document.getElementById('pwd-error');
    if (pwdInput) pwdInput.value = '';
    if (pwdError) pwdError.style.display = 'none';

    const pwdModal = document.getElementById('pwd-modal');
    if (pwdModal) {
        pwdModal.classList.add('show');
        setTimeout(() => pwdInput && pwdInput.focus(), 300);
    }
});

// 檢查通關密碼 (密碼錯誤時跳出奶蛙全螢幕彈窗)
function checkTicketPassword() {
    const pwdInput = document.getElementById('ticket-pwd');
    const pwdModal = document.getElementById('pwd-modal');
    const userPwd = pwdInput ? pwdInput.value.trim() : '';

    // 💡 正確密碼：1010
    if (userPwd === '1010') {
        if (pwdModal) pwdModal.classList.remove('show');

        playStampSound();
        const stamp = document.getElementById('ticket-stamp');
        if (stamp) stamp.classList.add('stamped');

        setTimeout(() => {
            document.getElementById('ticket-overlay').classList.add('hide');
            window.scrollTo(0, 0);
            if (!isBgmPlaying) toggleBgm();
        }, 700);

    } else {
        if (pwdModal) pwdModal.classList.remove('show');
        showFrogModal();
    }
}

// 顯示奶蛙全螢幕警告
function showFrogModal() {
    if (typeof playWrongSound === 'function') playWrongSound();
    const frogModal = document.getElementById('frog-modal');
    if (frogModal) frogModal.classList.add('show');
}

// 關閉奶蛙警告並重新聚焦密碼輸入框
function closeFrogModal() {
    if (typeof playPopSound === 'function') playPopSound();
    const frogModal = document.getElementById('frog-modal');
    const pwdModal = document.getElementById('pwd-modal');
    const pwdInput = document.getElementById('ticket-pwd');

    if (frogModal) frogModal.classList.remove('show');
    if (pwdModal) pwdModal.classList.add('show');

    if (pwdInput) {
        pwdInput.value = '';
        setTimeout(() => pwdInput.focus(), 200);
    }
}

/* 2. 相愛時間計數器 */
const startDate = new Date('2024-10-10T00:00:00');

function updateTimer() {
    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = hours;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;
}
setInterval(updateTimer, 1000);
updateTimer();

/* 3. 3D 拍立得卡片翻面 */
function playPageFlipSound() {
    initAudio();
    const now = audioCtx.currentTime;

    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    filter.Q.value = 2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + 0.12);
}

function flipCard(card) {
    playPageFlipSound();
    card.classList.toggle('flipped');
}

/* 4. Lightbox 放大照片彈窗邏輯 */
function openLightbox(imgSrc, title) {
    playPopSound();
    const box = document.getElementById('lightbox-box');
    const titleElem = document.getElementById('lightbox-title');

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.onerror = function () {
        box.innerHTML = '<i class="fa-solid fa-heart"></i>';
    };

    box.innerHTML = '';
    box.appendChild(img);
    titleElem.innerText = title;

    document.getElementById('lightbox-modal').classList.add('show');
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.remove('show');
}

/* 5. Canvas 刮刮樂邏輯 */
const canvas = document.getElementById('scratch-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let isScratching = false;
let isRevealed = false;

function initScratch() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth || 320;
    canvas.height = canvas.parentElement.offsetHeight || 180;

    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.fillText('✨ 滑動刮開驚喜 ✨', canvas.width / 2, canvas.height / 2 + 6);
}

function checkScratchPercentage() {
    if (isRevealed || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] < 128) transparentPixels++;
    }

    const scratchedRatio = transparentPixels / (pixels.length / 16);

    if (scratchedRatio >= 0.5) {
        revealScratchCard();
    }
}

function revealScratchCard() {
    if (isRevealed) return;
    isRevealed = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = '0';

    setTimeout(() => {
        canvas.style.display = 'none';
    }, 500);

    if (typeof playCorrectSound === 'function') playCorrectSound();

    const rewardModal = document.getElementById('reward-modal');
    if (rewardModal) rewardModal.classList.add('show');
}

function handleScratch(e) {
    if (!isScratching || isRevealed || !ctx) return;
    if (e.type === 'touchmove') e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
}

if (canvas) {
    canvas.addEventListener('mousedown', () => isScratching = true);
    window.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mousemove', handleScratch);

    canvas.addEventListener('touchstart', () => isScratching = true);
    window.addEventListener('touchend', () => isScratching = false);
    canvas.addEventListener('touchmove', handleScratch, { passive: false });
}

function closeRewardModal() {
    const rewardModal = document.getElementById('reward-modal');
    if (rewardModal) rewardModal.classList.remove('show');
}

window.addEventListener('load', initScratch);

/* ----------------------------------
   6. 默契問答邏輯 (預設答案：ACCBC)
----------------------------------- */
const quizAnswers = {
    q1: { correct: 'A', title: 'Q1: 第一次看電影時我們看了什麼？', correctText: 'A. 塔羅牌' },
    q2: { correct: 'C', title: 'Q2: 我最喜歡什麼？', correctText: 'C. 老波' },
    q3: { correct: 'C', title: 'Q3: 我們第一次一起去旅行住的地方在哪裡？', correctText: 'C. 台中' },
    q4: { correct: 'B', title: 'Q4: 甚麼時候認識的？', correctText: 'B. 2023' },
    q5: { correct: 'C', title: 'Q5:  怎麼認識的？', correctText: 'C. HeyMandi' }
};

const userSelections = {};

function selectQuizOption(element, qKey, optionKey) {
    if (typeof playPopSound === 'function') playPopSound();

    const group = element.closest('.quiz-question-group');
    group.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));

    element.classList.add('selected');
    userSelections[qKey] = optionKey;
}

function submitQuiz() {
    const totalQuestions = Object.keys(quizAnswers).length;
    const answeredCount = Object.keys(userSelections).length;

    if (answeredCount < totalQuestions) {
        alert(`還有 ${totalQuestions - answeredCount} 題尚未選擇喔！請全選後再送出～`);
        return;
    }

    let correctCount = 0;
    let wrongCount = 0;
    let wrongDetailsHTML = '';
    const resultImg = document.getElementById('quiz-result-img');

    for (let qKey in quizAnswers) {
        const userAns = userSelections[qKey];
        const qData = quizAnswers[qKey];

        if (userAns === qData.correct) {
            correctCount++;
        } else {
            wrongCount++;
            wrongDetailsHTML += `
        <div style="background: #ffebee; border-left: 4px solid #e53935; padding: 10px; margin-bottom: 8px; border-radius: 8px;">
          <strong style="color: #c62828;">❌ ${qData.title}</strong><br>
          <span style="color: #555;">你的選擇：${userAns} ｜ 正確答案：<strong style="color: #2e7d32;">${qData.correctText}</strong></span>
        </div>
      `;
        }
    }

    if (wrongCount === 0) {
        if (typeof playCorrectSound === 'function') playCorrectSound();
        document.getElementById('quiz-result-icon').innerText = '🎉';
        document.getElementById('quiz-result-title').innerText = '太神了！100 分完美默契！';
        wrongDetailsHTML = '<p style="text-align: center; color: #2e7d32; font-weight: bold; margin-top: 10px;">你每一題都答對了！不愧是最懂我的人 💕</p>';

        if (resultImg) {
            resultImg.style.display = 'block';
            resultImg.src = 'frog_happy.jpg';
        }
    } else {
        if (typeof playWrongSound === 'function') playWrongSound();
        document.getElementById('quiz-result-icon').innerText = '💡';
        document.getElementById('quiz-result-title').innerText = '默契測驗結果';
        wrongDetailsHTML = `<h5 style="margin-bottom: 8px; color: var(--text-main);">答錯題目的正確答案如下：</h5>` + wrongDetailsHTML;

        if (resultImg) {
            resultImg.style.display = 'block';
            resultImg.src = 'frog_sad.jpg';
        }
    }

    document.getElementById('quiz-score-text').innerText = `答對 ${correctCount} 題 ｜ 答錯 ${wrongCount} 題`;
    document.getElementById('quiz-wrong-details').innerHTML = wrongDetailsHTML;

    document.getElementById('quiz-result-modal').classList.add('show');
}

// 關閉測驗結果彈窗函式
function closeQuizResultModal() {
    if (typeof playPopSound === 'function') playPopSound();
    const resultModal = document.getElementById('quiz-result-modal');
    if (resultModal) resultModal.classList.remove('show');
}

/* ----------------------------------
   7. 原地信封打開 ➔ 打字 ➔ 全螢幕 ➔ 跑完解鎖叉叉按鈕
----------------------------------- */
const letterText = `老波老波~~~我們兩週年啦~
雖然好像不止了ouo

時間過得好快好快，我以為我們剛跨完年而已，眨眼一年又要過去了。在這兩年呢~謝謝你一直包容我亂七八糟的情緒還有偶爾發癲，有時候我也不想把我的壞情緒帶給你，可是又沒人聽我murmur，然後有時候真的控制不住情緒就想哭哭，但你看起來超怕的（？

朋友都說我們看起來像淡淡的情侶，很隨和的感覺。我覺得我的男朋朋很棒，是個很可愛又有趣的人類，可能你長的比較像小朋友嗎 :P 但是遇到事情又可以好冷靜的解決，然後順便安撫一下已經當機的 me。

我自己是一個有點患得患失的 people :D，有時候看起來沒什麼特別意思的語句還是表情什麼的，就會開始腦補一大堆有的沒的，搞得自己很敏感，所以有時候會一直問你比較想吃甚麼想做甚麼，就單純只是希望選擇的是你喜歡的，雖然知道你不會這樣想，但我自己會一直亂想萬一選到你不喜歡的你會不會不開心，反正就是這樣，希望你不要介意 :D

怎麼辦我不知道要說什麼了💦我很開心可以遇到你這麼棒ㄉ寶寶，我一直一直都很愛你也很喜歡你，你是一個香香軟軟的大寶寶ヽ( ° ▽°)ノ兩周年快樂!老波我愛你啾咪😍❤️`;

let isEnvOpening = false;
let isLetterLocked = true;
let typewriterTimer = null;
let bannerDelayTimer = null;

function openOnpageEnvelope() {
    if (isEnvOpening) return;
    isEnvOpening = true;
    isLetterLocked = true;

    if (typeof playStampSound === 'function') playStampSound();

    const env = document.getElementById('page-envelope');
    if (env) env.classList.add('opening');

    const closeBtn = document.querySelector('#letter-modal .close-btn');
    if (closeBtn) closeBtn.classList.add('locked');

    setTimeout(() => {
        const modal = document.getElementById('letter-modal');
        const target = document.getElementById('typewriter-text');

        if (modal) modal.classList.add('show');
        if (!target) return;

        target.innerText = '';
        if (typewriterTimer) clearTimeout(typewriterTimer);
        if (bannerDelayTimer) clearTimeout(bannerDelayTimer);

        if (typeof fadeBgmVolume === 'function') fadeBgmVolume(0.2);

        let i = 0;
        function type() {
            if (i < letterText.length) {
                const char = letterText.charAt(i);
                target.innerText += char;

                if (char !== ' ' && char !== '\n' && typeof playTypewriterSound === 'function') {
                    playTypewriterSound();
                }

                i++;
                typewriterTimer = setTimeout(type, 45);
            } else {
                bannerDelayTimer = setTimeout(() => {
                    showFancyAnniversaryBanner();
                }, 5000);
            }
        }
        type();
    }, 850);
}

// 華麗全螢幕驚喜與解鎖機制
function showFancyAnniversaryBanner() {
    const banner = document.getElementById('anniversary-banner');
    if (!banner) return;

    if (typeof playCorrectSound === 'function') playCorrectSound();

    banner.classList.add('show');

    setTimeout(() => {
        banner.classList.remove('show');

        isLetterLocked = false;
        const closeBtn = document.querySelector('#letter-modal .close-btn');
        if (closeBtn) closeBtn.classList.remove('locked');

        if (typeof fadeBgmVolume === 'function') fadeBgmVolume(1.0);
    }, 5000);
}

function closeLetter() {
    if (isLetterLocked) return;

    const modal = document.getElementById('letter-modal');
    const env = document.getElementById('page-envelope');

    if (modal) modal.classList.remove('show');
    if (env) env.classList.remove('opening');

    isEnvOpening = false;
    if (typewriterTimer) clearTimeout(typewriterTimer);
    if (bannerDelayTimer) clearTimeout(bannerDelayTimer);

    if (typeof fadeBgmVolume === 'function') fadeBgmVolume(1.0);
}

/* ----------------------------------
   8. 彩蛋角落貓咪觸發 15 秒全螢幕密集愛心雨
----------------------------------- */
let catClickCount = 0;
document.getElementById('cat-egg').addEventListener('click', function () {
    catClickCount++;
    if (typeof playPopSound === 'function') playPopSound();

    if (catClickCount === 5) {
        alert('🎉 解鎖隱藏彩蛋：被你發現了！');

        const heartEmojis = ['💖', '💕', '💗', '💓', '❤️', '🌸', '✨'];
        const startTime = Date.now();
        const duration = 15000;

        const rainInterval = setInterval(() => {
            if (Date.now() - startTime > duration) {
                clearInterval(rainInterval);
                return;
            }

            for (let i = 0; i < 2; i++) {
                const heart = document.createElement('div');
                heart.className = 'rain-heart';

                heart.innerHTML = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
                heart.style.left = Math.random() * 98 + 'vw';
                heart.style.fontSize = (18 + Math.random() * 18) + 'px';

                const fallDuration = 2.5 + Math.random() * 2;
                heart.style.animationDuration = fallDuration + 's';

                document.body.appendChild(heart);

                setTimeout(() => {
                    heart.remove();
                }, fallDuration * 1000);
            }
        }, 120);

        catClickCount = 0;
    }
});

let secretCode = [];
window.addEventListener('keydown', function (e) {
    secretCode.push(e.key.toLowerCase());
    if (secretCode.length > 4) secretCode.shift();
    if (secretCode.join('') === 'love') {
        alert('✨ 老波我愛你！');
    }
});

/* ----------------------------------
   旅行足跡左右跳頁按鈕滑動邏輯
----------------------------------- */
function slideFootprints(direction) {
    if (typeof playPopSound === 'function') playPopSound();
    const track = document.getElementById('footprints-track');
    if (!track) return;

    const scrollAmount = track.clientWidth;
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

/* ----------------------------------
   重新整理與返回頂部滾動邏輯
----------------------------------- */
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.addEventListener('load', function () {
    window.scrollTo(0, 0);
});

const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

function scrollToTop() {
    if (typeof playPopSound === 'function') playPopSound();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* ----------------------------------
   手機版漢堡選單開關邏輯
----------------------------------- */
function toggleMobileMenu() {
    if (typeof playPopSound === 'function') playPopSound();
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.toggle('active');
}

function closeMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('active');
}