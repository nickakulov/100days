/* =========================================================================
   НАСТРОЙКИ ДАТ И МУЗЫКИ (МЕНЯЙ ЗДЕСЬ ПРИ НЕОБХОДИМОСТИ)
   ========================================================================= */
// Точная дата начала отношений (по умолчанию: ровно 100 дней до 19 ноября 2026)
const START_DATE = new Date('2026-08-11T00:00:00');

// Дата новой встречи в Иркутске (19 декабря 2026, 20:00)
const NEXT_MEETING_DATE = new Date('2026-12-19T20:00:00');

// Громкость фоновой музыки (от 0.0 до 1.0)
const TARGET_VOLUME = 0.5;

/* =========================================================================
   1. ФОНОВЫЙ CANVAS: АЛЫЙ ПЕПЕЛ + ИНТЕРАКТИВНЫЙ ШЛЕЙФ ИСКР
   ========================================================================= */
(() => {
  const canvas = document.getElementById('ember-canvas');
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let scrollY = window.scrollY;
  const embers = [];
  const trails = [];
  const runes = [];
  const RUNE_CHARS = 'ΑΒΓΔΖΘΛΞΠΣΦΨΩ·IVXLCDM·';

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createRune(randomY = false) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + 40,
      vy: -(Math.random() * 0.22 + 0.1),
      size: Math.random() * 9 + 11,
      char: RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
      alpha: Math.random() * 0.05 + 0.04,
      flicker: Math.random() * Math.PI * 2,
      gold: Math.random() < 0.5,
      rot: (Math.random() - 0.5) * 0.5,
    };
  }

  function initRunes() {
    runes.length = 0;
    const count = Math.min(14, Math.max(6, Math.floor(width / 120)));
    for (let i = 0; i < count; i++) runes.push(createRune(true));
  }

  function createEmber(randomY = false) {
    const isGold = Math.random() < 0.25;
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + Math.random() * 40,
      r: Math.random() * 2.1 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.65 + 0.25),
      alpha: Math.random() * 0.55 + 0.25,
      flicker: Math.random() * Math.PI * 2,
      color: isGold ? '197, 160, 89' : '220, 20, 60',
    };
  }

  function initEmbers() {
    embers.length = 0;
    const count = Math.min(75, Math.floor((width * height) / 17000));
    for (let i = 0; i < count; i++) embers.push(createEmber(true));
  }

  window.spawnSparkBurst = function (x, y, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = Math.random() * 2.6 + 0.8;
      trails.push({
        x,
        y,
        r: Math.random() * 2.2 + 0.8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        alpha: 0.95,
        decay: 0.025 + Math.random() * 0.02,
        color: Math.random() < 0.4 ? '197, 160, 89' : '220, 20, 60',
      });
    }
  };

  function addTrail(x, y) {
    if (trails.length > 140) return;
    trails.push({
      x,
      y,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.9,
      vy: -(Math.random() * 0.9 + 0.2),
      alpha: 0.85,
      decay: 0.032,
      color: Math.random() < 0.35 ? '197, 160, 89' : '220, 20, 60',
    });
  }

  let lastTrail = 0;
  window.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - lastTrail < 24) return;
    lastTrail = now;
    addTrail(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    window.spawnSparkBurst(e.clientX, e.clientY, 7);
  }, { passive: true });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', () => { resize(); initEmbers(); initRunes(); });

  resize();
  initEmbers();
  initRunes();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.flicker += 0.03;
      e.x += e.vx + Math.sin(e.flicker) * 0.18;
      e.y += e.vy;

      const drawY = (e.y - scrollY * 0.12) % (height + 60);
      const yPos = drawY < -30 ? drawY + height + 60 : drawY;

      if (e.y < -30) {
        embers[i] = createEmber(false);
        continue;
      }

      const a = Math.max(0.08, e.alpha + Math.sin(e.flicker) * 0.15);
      ctx.beginPath();
      ctx.arc(e.x, yPos, e.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${e.color}, ${a})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${e.color}, 0.7)`;
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    /* Древние глифы, дрейфующие в темноте */
    for (let i = 0; i < runes.length; i++) {
      const r = runes[i];
      r.flicker += 0.015;
      r.y += r.vy;
      if (r.y < -30) {
        runes[i] = createRune(false);
        continue;
      }
      const a = Math.max(0, r.alpha + Math.sin(r.flicker) * 0.03);
      ctx.save();
      ctx.translate(r.x, r.y - scrollY * 0.06);
      ctx.rotate(r.rot);
      ctx.font = `${r.size}px Cinzel, 'Cormorant Garamond', serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r.gold ? '197, 160, 89' : '220, 20, 60'}, ${a})`;
      ctx.fillText(r.char, 0, 0);
      ctx.restore();
    }

    for (let i = trails.length - 1; i >= 0; i--) {
      const t = trails[i];
      t.x += t.vx;
      t.y += t.vy;
      t.alpha -= t.decay;
      if (t.alpha <= 0) {
        trails.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${t.color}, ${t.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  animate();
})();

/* =========================================================================
   2. АУДИО-СИСТЕМА С ПЛАВНЫМ FADE-IN / FADE-OUT
   ========================================================================= */
const audio = document.getElementById('bg-music');
const audioToggle = document.getElementById('audio-toggle');
let audioFadeTimer = null;
let audioAvailable = true;

audio.addEventListener('error', () => {
  audioAvailable = false;
  audioToggle.classList.add('hidden');
});

function fadeAudio(target, durationMs, onDone) {
  if (audioFadeTimer) clearInterval(audioFadeTimer);
  const steps = 25;
  const stepTime = durationMs / steps;
  const startVol = audio.volume;
  const delta = (target - startVol) / steps;
  let currentStep = 0;

  audioFadeTimer = setInterval(() => {
    currentStep++;
    const nextVol = Math.min(1, Math.max(0, startVol + delta * currentStep));
    audio.volume = nextVol;
    if (currentStep >= steps) {
      clearInterval(audioFadeTimer);
      audioFadeTimer = null;
      audio.volume = target;
      if (onDone) onDone();
    }
  }, stepTime);
}

function startMusic() {
  if (!audioAvailable) return;
  audio.volume = 0;
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.then === 'function') {
    playPromise
      .then(() => {
        audioToggle.classList.remove('hidden');
        audioToggle.classList.add('playing');
        fadeAudio(TARGET_VOLUME, 2500);
      })
      .catch(() => {
        audioToggle.classList.remove('hidden');
        audioToggle.classList.remove('playing');
      });
  }
}

audioToggle.addEventListener('click', () => {
  if (!audioAvailable) return;
  if (audio.paused) {
    audio.volume = 0;
    audio.play().then(() => {
      audioToggle.classList.add('playing');
      fadeAudio(TARGET_VOLUME, 900);
    }).catch(() => {});
  } else {
    audioToggle.classList.remove('playing');
    fadeAudio(0, 600, () => audio.pause());
  }
});

/* =========================================================================
   3. ЭКРАН 1: ВРАТА ЗАВЕТА (УДЕРЖАНИЕ ПЕЧАТИ 1.8 СЕК)
   ========================================================================= */
(() => {
  const gateOverlay = document.getElementById('gate-overlay');
  const gateFlash = document.getElementById('gate-flash');
  const sealBtn = document.getElementById('seal-btn');
  const progressRing = document.getElementById('progress-ring');
  const gateHint = document.getElementById('gate-hint');

  const CIRCUMFERENCE = 2 * Math.PI * 92; // r = 92
  const HOLD_DURATION = 1800; // мс

  let holdStart = null;
  let rafId = null;
  let unlocked = false;

  progressRing.style.strokeDasharray = CIRCUMFERENCE;
  progressRing.style.strokeDashoffset = CIRCUMFERENCE;

  function unlockGate() {
    if (unlocked) return;
    unlocked = true;
    cancelAnimationFrame(rafId);

    if (navigator.vibrate) navigator.vibrate([35, 30, 65]);

    gateFlash.classList.add('active');
    setTimeout(() => gateFlash.classList.remove('active'), 550);

    startMusic();
    gateOverlay.classList.add('unlocked');
    document.body.classList.remove('locked');

    const mainContent = document.getElementById('main-content');
    mainContent.classList.remove('gate-rumble');
    void mainContent.offsetWidth;
    mainContent.classList.add('gate-rumble');

    // Показываем бесёнка после открытия врат
    setTimeout(() => {
      const impWidget = document.getElementById('imp-widget');
      impWidget.classList.remove('hidden');
      if (window.impSay) {
        window.impSay('Врата открыты. Добро пожаловать в наши 100 дней, Дьяволица.');
      }
    }, 1100);
  }

  function updateHold(timestamp) {
    if (!holdStart || unlocked) return;
    const elapsed = timestamp - holdStart;
    const progress = Math.min(1, elapsed / HOLD_DURATION);
    progressRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    if (progress >= 1) {
      unlockGate();
    } else {
      rafId = requestAnimationFrame(updateHold);
    }
  }

  function startHold(e) {
    if (unlocked) return;
    e.preventDefault();
    holdStart = performance.now();
    sealBtn.classList.add('holding');
    gateHint.textContent = 'Печать поддаётся...';
    if (navigator.vibrate) navigator.vibrate(18);
    rafId = requestAnimationFrame(updateHold);
  }

  function cancelHold() {
    if (unlocked) return;
    holdStart = null;
    cancelAnimationFrame(rafId);
    sealBtn.classList.remove('holding');
    gateHint.textContent = 'Удерживай печать, чтобы открыть';
    progressRing.style.transition = 'stroke-dashoffset 0.35s ease';
    progressRing.style.strokeDashoffset = CIRCUMFERENCE;
    setTimeout(() => { progressRing.style.transition = ''; }, 360);
  }

  sealBtn.addEventListener('pointerdown', startHold);
  window.addEventListener('pointerup', cancelHold);
  window.addEventListener('pointercancel', cancelHold);
  sealBtn.addEventListener('contextmenu', (e) => e.preventDefault());
})();

/* =========================================================================
   4. ХРОНОМЕТРЫ (ВРЕМЯ ВМЕСТЕ + ОБРАТНЫЙ ОТСЧЁТ ДО 19 ДЕКАБРЯ)
   ========================================================================= */
(() => {
  const pad = (n) => String(Math.max(0, Math.floor(n))).padStart(2, '0');

  function setNum(el, value) {
    const str = String(value);
    if (el.textContent === str) return;
    el.textContent = str;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function updateTimers() {
    const now = new Date();

    // Время вместе
    const diffTogether = Math.max(0, now - START_DATE);
    const tDays = Math.floor(diffTogether / 86400000);
    const tHours = (diffTogether / 3600000) % 24;
    const tMins = (diffTogether / 60000) % 60;
    const tSecs = (diffTogether / 1000) % 60;

    setNum(document.getElementById('t-days'), tDays);
    setNum(document.getElementById('t-hours'), pad(tHours));
    setNum(document.getElementById('t-mins'), pad(tMins));
    setNum(document.getElementById('t-secs'), pad(tSecs));

    // Обратный отсчет до Иркутска
    const diffNext = Math.max(0, NEXT_MEETING_DATE - now);
    const cDays = Math.floor(diffNext / 86400000);
    const cHours = (diffNext / 3600000) % 24;
    const cMins = (diffNext / 60000) % 60;
    const cSecs = (diffNext / 1000) % 60;

    setNum(document.getElementById('c-days'), pad(cDays));
    setNum(document.getElementById('c-hours'), pad(cHours));
    setNum(document.getElementById('c-mins'), pad(cMins));
    setNum(document.getElementById('c-secs'), pad(cSecs));
  }

  updateTimers();
  setInterval(updateTimers, 1000);
})();

/* =========================================================================
   5. 3D-КАРТОЧКИ ПАМЯТИ + ИНТЕРАКТИВНАЯ СОВА
   ========================================================================= */
(() => {
  const cards = document.querySelectorAll('.flip-card');
  cards.forEach((card) => {
    const toggle = () => {
      card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', card.classList.contains('flipped'));
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  const owlBtn = document.getElementById('pet-owl-btn');
  const owlReply = document.getElementById('owl-reply');
  const owlPhrases = [
    'Угу-угу! Арес передавал, что скучает.',
    'Сова одобряет твой настрой на 666%.',
    'Мягкие перья, тёплые мысли. Обними её покрепче.',
    'Хранительница на посту: тревоги не пройдут.',
    'Угу! Скоро уже 19 декабря, держимся!'
  ];
  let owlIdx = 0;

  owlBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    owlReply.textContent = owlPhrases[owlIdx % owlPhrases.length];
    owlIdx++;
    const rect = owlBtn.getBoundingClientRect();
    if (window.spawnSparkBurst) {
      window.spawnSparkBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
    }
  });

  /* Каскадное появление карт при скролле */
  const grid = document.querySelector('.cards-grid');
  if (grid) {
    const gridObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        grid.classList.add('visible');
        setTimeout(() => grid.classList.add('settled'), 1400);
        gridObserver.disconnect();
      });
    }, { threshold: 0.2 });
    gridObserver.observe(grid);
  }

  /* 3D-наклон карточек за курсором + блик по поверхности */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (finePointer && !reduceMotion) {
    cards.forEach((card) => {
      let tiltRaf = null;

      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          tiltRaf = null;
          card.style.transform = `perspective(1200px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg)`;
        });
      });

      card.addEventListener('pointerleave', () => {
        if (tiltRaf) {
          cancelAnimationFrame(tiltRaf);
          tiltRaf = null;
        }
        card.style.transform = '';
      });
    });
  }
})();

/* =========================================================================
   6. ЗЕРКАЛО ИСТИНЫ (8 ФРАЗ)
   ========================================================================= */
(() => {
  const truths = [
    'Ты — невероятная. Даже когда тебе кажется иначе, я вижу тебя настоящей, и в моих глазах тебе нет равных.',
    'Твоя сила и твоя нежность вместе — это редчайшее сочетание. Именно за это я ценю тебя с каждым днём всё сильнее.',
    'Никакие километры и плохие дни не способны пошатнуть то, что мы уже построили. Я рядом — всегда.',
    'Когда ты улыбаешься, вокруг буквально меняется атмосфера. Не позволяй никому и ничему тушить этот свет.',
    'Ты заслуживаешь самого бережного отношения, самого громкого смеха и самых крепких объятий.',
    'Мне не нужно искать кого-то лучше или идеальнее — моя единственная уже со мной.',
    'Даже если день выдался тяжёлым, просто вспомни: у тебя есть я, и мы разберёмся с любым хаосом вместе.',
    'Эти 100 дней — только начало. Впереди у нас ещё столько городов, ночей и наших собственных историй.'
  ];
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  const truthText = document.getElementById('truth-text');
  const truthBtn = document.getElementById('truth-btn');
  const truthCounter = document.getElementById('truth-counter');
  let index = 0;

  truthBtn.addEventListener('click', (e) => {
    index = (index + 1) % truths.length;
    truthText.classList.add('fading');

    if (window.spawnSparkBurst) {
      window.spawnSparkBurst(e.clientX, e.clientY, 12);
    }

    setTimeout(() => {
      truthText.textContent = truths[index];
      truthCounter.textContent = `${romans[index]} / VIII`;
      truthText.classList.remove('fading');
    }, 320);
  });
})();

/* =========================================================================
   7. ГОВОРЯЩИЙ БЕСЁНОК (АНИМАЦИЯ РТА + ПЕЧАТНАЯ МАШИНКА + СКРОЛЛ)
   ========================================================================= */
(() => {
  const impWidget = document.getElementById('imp-widget');
  const impAvatar = document.getElementById('imp-avatar');
  const impBubble = document.getElementById('imp-bubble');
  const impText = document.getElementById('imp-text');
  const impMinBtn = document.getElementById('imp-minimize');

  const clickPhrases = [
    'Сильная и независимая, бла-бла-бла...',
    'У меня изо рта пахнет воппером?',
    'Так, без паники, 19 декабря уже близко!',
    'А сову ты сегодня гладила?',
    'Напоминаю: ты невероятно красивая, спорить с демоном бесполезно.',
    'Если что, Арес сейчас точно о тебе думает.',
    'Пора испечь еще брауни, я считаю.',
    'Кто тут у нас главная Дьяволица? Правильно, ты.',
    'Кого там Арес полечить просил? А, тебя? Ну-ка открывай ротик.',
    'Не тыкай в демона без надобности!.. Ладно, тыкай, я няшный.',
    'Я тут сердечко стерегу. Твоё, между прочим.',
    'Философия моего века: есть брауни, есть ты. Остальное — вопрос времени.',
    'Совет демона: улыбнись. Всё, сбор завершён.',
    'Ты — причина, по которой Арес улыбается. Мне докладывают.',
    'Кстати, я всю ночь стерёг твой покой. Гонорар — одна улыбка.',
    'Осторожно, я сегодня особенно огненный.',
    'Я бы спел, но мой репертуар — только крики упавших в бездну.',
    'Гладь сову, жми кнопки, читай скрижаль — я проверял, всё работает.'
  ];

  const sectionPhrases = {
    artifacts: 'Потыкай на карточки — там наши иркутские артефакты.',
    mirror: 'Если вдруг взгрустнётся — жми на кнопку, я прослежу.',
    oath: 'А вот и главная скрижаль. Читай внимательно.'
  };

  let clickIdx = 0;
  let typeTimer = null;
  let hideTimer = null;
  const triggeredSections = new Set();

  function impSay(message) {
    if (impWidget.classList.contains('hidden') || impWidget.classList.contains('minimized')) return;
    clearInterval(typeTimer);
    clearTimeout(hideTimer);

    impText.textContent = '';
    impBubble.classList.add('show');
    impAvatar.classList.add('speaking');

    let i = 0;
    typeTimer = setInterval(() => {
      impText.textContent += message.charAt(i);
      i++;
      if (i >= message.length) {
        clearInterval(typeTimer);
        impAvatar.classList.remove('speaking');
        hideTimer = setTimeout(() => {
          impBubble.classList.remove('show');
        }, 5200);
      }
    }, 36);
  }

  window.impSay = impSay;

  impAvatar.addEventListener('click', () => {
    if (impWidget.classList.contains('minimized')) {
      impWidget.classList.remove('minimized');
      impMinBtn.textContent = '×';
    }
    impSay(clickPhrases[clickIdx % clickPhrases.length]);
    clickIdx++;
  });

  impMinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isMin = impWidget.classList.toggle('minimized');
    impMinBtn.textContent = isMin ? '+' : '×';
    if (isMin) {
      clearInterval(typeTimer);
      impAvatar.classList.remove('speaking');
      impBubble.classList.remove('show');
    }
  });

  // Плавное появление секций + реакции бесёнка
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');

        const sec = entry.target.getAttribute('data-imp-section');
        if (sec && sectionPhrases[sec] && !triggeredSections.has(sec) && !document.body.classList.contains('locked')) {
          triggeredSections.add(sec);
          impSay(sectionPhrases[sec]);
        }
      });
    },
    { threshold: 0.22 }
  );

  /* Бесёнок иногда заговаривает сам, если ему скучно */
  const idlePhrases = [
    'Псс... я тут. Бесёнок на связи, скучаю по вам обоим.',
    'Между прочим, 19 декабря уже не за горами...',
    'Если скучно — потыкай карточки, там тепло.',
    'Арес велел передать: он гордится, что ты его Дьяволица.',
    'Не грусти, ладно? Я за тобой присматриваю.',
    'Кого там Арес полечить просил? Так, я на месте, я готов.',
    'Перелетаю на другой край... экрана. Следи за мной.',
    'Скучно? Потыкай зеркало — там истины про запас.',
    'Я, конечно, маленький демон, но преданности мне не занимать.',
    '100 дней — это вам не хухры. Я считал. Пальцев не хватило.',
    'Я тут. Скучаю. Я вообще профессиональный скучальщик.',
    'Если что, я всегда за тобой наблюдаю. В хорошем смысле!',
    'Демонический совет дня: тёплый чай и мысли об Аресе.',
    'Псс... ты невероятная. Так, по служебной обязанности напомнил.',
    'Арес скучает. Я чувствую это по вибрациям в аду.',
    'Я считал искры на фоне. Сбился. Тебе привет.',
    'Скучно? Вспомни Иркутск. Или лучше — планируй декабрь.'
  ];

  let idleIdx = 0;

  function scheduleIdle() {
    const delay = 20000 + Math.random() * 15000;
    setTimeout(() => {
      if (!document.hidden && !impWidget.classList.contains('hidden') && !impWidget.classList.contains('minimized')) {
        impSay(idlePhrases[idleIdx % idlePhrases.length]);
        idleIdx++;
      }
      scheduleIdle();
    }, delay);
  }
  scheduleIdle();

  /* Пасхалка: набрать 666 — бесёнок отзовётся */
  let sixBuffer = '';
  document.addEventListener('keydown', (e) => {
    const isSix = e.key === '6' || e.code === 'Digit6' || e.code === 'Numpad6';
    if (!isSix) {
      sixBuffer = '';
      return;
    }
    sixBuffer += '6';
    if (sixBuffer.length < 3) return;
    sixBuffer = '';

    const flash = document.getElementById('gate-flash');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 650);
    if (window.spawnSparkBurst) {
      window.spawnSparkBurst(window.innerWidth / 2, window.innerHeight / 2, 46);
    }
    if (navigator.vibrate) navigator.vibrate([40, 40, 40, 40, 120]);
    impSay('Ты нашла код. 666 — наши любимые цифры, Дьяволица.');
  });

  /* Меняем заголовок вкладки, когда её сворачивают */
  const originalTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Возвращайся, Дьяволица…' : originalTitle;
  });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
})();
/* =========================================================================
   8. КАСТОМНЫЙ КУРСОР: ТОЧКА + ИНЕРЦИОННОЕ КОЛЬЦО
   ========================================================================= */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;

  document.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    dot.classList.add('visible');
    ring.classList.add('visible');
    ring.classList.toggle('hot', !!e.target.closest('a, button, .flip-card'));
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.classList.remove('visible');
    ring.classList.remove('visible');
  });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();
})();

/* =========================================================================
   9. ПРОГРЕСС ЧТЕНИЯ, ПАРАЛЛАКС-ОРБЫ И ВЗГЛЯД БЕСЁНКА ЗА КУРСОРОМ
   ========================================================================= */
(() => {
  const progress = document.getElementById('scroll-progress');
  const orbs = document.querySelectorAll('.blur-orb');
  const look = document.querySelector('.imp-look');
  const avatar = document.getElementById('imp-avatar');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;

    if (!reduceMotion) {
      const y = window.scrollY;
      const depths = [0.06, -0.045, 0.1];
      orbs.forEach((orb, i) => {
        orb.style.transform = `translateY(${y * (depths[i] || 0.05)}px)`;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (finePointer && !reduceMotion && look && avatar) {
    document.addEventListener('pointermove', (e) => {
      const rect = avatar.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const shift = Math.min(2.6, dist / 40);
      look.style.transform = `translate(${(dx / dist) * shift}px, ${(dy / dist) * shift}px)`;
    }, { passive: true });
  }
})();
