/* ============================================================
   游戏引擎：关卡地图、测验、模拟、结算、进度、分享
   纯前端，无网络请求；进度仅存本机 localStorage。
   ============================================================ */
(function () {
  'use strict';

  const CONTENT = window.GHG_CONTENT;
  if (!CONTENT || !Array.isArray(CONTENT.levels)) {
    document.body.innerHTML = '<p style="padding:40px;color:#fff">内容加载失败，请刷新页面。</p>';
    return;
  }

  const PROGRESS_KEY = 'ghg_progress_v1';
  // 每关各回合对应的年份；L4 跳过 2030/2033 两年，让 8 个回合覆盖 2026–2035 十年。
  const YEAR_PLAN = {
    l2: [2027, 2028, 2029],
    l3: [2027, 2028, 2029, 2030],
    l4: [2026, 2027, 2028, 2029, 2031, 2032, 2034, 2035]
  };
  const EQUIV = {
    treePerYearKg: 22,        // 一棵树每年吸收约 22 kg CO2
    carPerYearTons: 4.6,      // 一辆典型乘用车每年约 4.6 t CO2
    flightTons: 0.5           // 一次短途往返约 0.5 t CO2（示意）
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const dom = {
    mapRoot: $('#map-levels'),
    mapSummary: $('#map-summary'),
    quizRoot: $('#quiz-root'),
    cards: $('#cards'),
    feedback: $('#feedback'),
    hud: {
      emissions: $('#hud-emissions'),
      budget: $('#hud-budget'),
      support: $('#hud-support'),
      year: $('#hud-year'),
      barEmissions: $('#bar-emissions'),
      barBudget: $('#bar-budget'),
      barSupport: $('#bar-support'),
      barYear: $('#bar-year')
    },
    roundTitle: $('#round-title'),
    roundHint: $('#round-hint'),
    gameGoal: $('#game-goal'),
    resultRoot: $('#result-root'),
    toast: $('#toast'),
    confetti: $('#confetti'),
    modal: $('#glossary-modal')
  };
  let progress = loadProgress();
  let quiz = null;
  let sim = null;
  let toastTimer = null;

  /* ---------------- 小工具 ---------------- */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatNumber(value) {
    const rounded = Math.abs(value) >= 100 || Number.isInteger(value)
      ? Math.round(value)
      : Math.round(value * 10) / 10;
    return rounded.toLocaleString('zh-CN');
  }

  function signed(value, unit) {
    const sign = value > 0 ? '+' : '−';
    return sign + formatNumber(Math.abs(value)) + (unit ? ' ' + unit : '');
  }

  function starsHtml(stars, total) {
    const count = total || 3;
    let html = '';
    for (let i = 0; i < count; i += 1) {
      html += `<span class="${i < stars ? 'on' : 'off'}">★</span>`;
    }
    return html;
  }

  function toast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2600);
  }

  function show(screenId) {
    $$('.screen').forEach((el) => el.classList.toggle('active', el.id === screenId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function findLevelIndex(id) {
    return CONTENT.levels.findIndex((level) => level.id === id);
  }

  /* ---------------- 进度持久化 ---------------- */
  function loadProgress() {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (!raw) return { levels: {} };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.levels !== 'object') {
        return { levels: {} };
      }
      return { levels: parsed.levels };
    } catch (error) {
      return { levels: {} };
    }
  }

  function saveProgress(next) {
    progress = next;
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    } catch (error) {
      toast('进度无法保存到本机浏览器，请检查隐私设置。');
    }
  }

  function recordResult(level, pass, stars, score, emissions) {
    if (!pass) return;
    const previous = progress.levels[level.id] || {};
    const bestStars = Math.max(previous.stars || 0, stars);
    const bestScore = Math.max(previous.bestScore || 0, score);
    const bestEmissions = emissions == null
      ? (previous.bestEmissions == null ? null : previous.bestEmissions)
      : Math.min(previous.bestEmissions == null ? Infinity : previous.bestEmissions, emissions);
    const next = {
      levels: {
        ...progress.levels,
        [level.id]: {
          passed: true,
          stars: bestStars,
          bestScore,
          bestEmissions: bestEmissions === Infinity ? null : bestEmissions
        }
      }
    };
    saveProgress(next);
  }

  function totalStars() {
    return Object.values(progress.levels).reduce((sum, item) => sum + (item.stars || 0), 0);
  }

  function isUnlocked(index) {
    if (index === 0) return true;
    const previous = CONTENT.levels[index - 1];
    const saved = progress.levels[previous.id];
    return Boolean(saved && saved.passed);
  }

  /* ---------------- 关卡地图 ---------------- */
  function renderMap() {
    if (!dom.mapRoot) return;
    const done = CONTENT.levels.filter((level) => progress.levels[level.id] && progress.levels[level.id].passed).length;
    if (dom.mapSummary) {
      dom.mapSummary.innerHTML = `
        <div class="eyebrow"><span class="dot"></span>${done === CONTENT.levels.length ? '全部通关' : '进度 ' + done + ' / ' + CONTENT.levels.length}</div>
        <p class="lede">共 <b>${totalStars()}</b> / ${CONTENT.levels.length * 3} 颗星。上一关通过后解锁下一关，难度逐级上升。</p>`;
    }

    dom.mapRoot.innerHTML = CONTENT.levels.map((level, index) => {
      const saved = progress.levels[level.id] || {};
      const unlocked = isUnlocked(index);
      const stars = saved.stars || 0;
      const typeText = level.type === 'quiz' ? '知识测验' : `${level.rounds.length} 个决策`;
      const actionText = saved.passed
        ? '最佳 ' + (saved.bestScore || 0) + ' 分'
        : (unlocked ? '开始挑战 →' : '完成上一关解锁');
      return `
        <button class="level-card ${unlocked ? '' : 'locked'} ${saved.passed ? 'done' : ''}"
          data-level="${index}" ${unlocked ? '' : 'aria-disabled="true"'}>
          <div class="level-no">${unlocked ? level.icon : '🔒'}</div>
          <div class="level-body">
            <div class="level-badge">${escapeHtml(level.difficulty)} · LEVEL ${level.no}</div>
            <h3>${escapeHtml(level.title)}</h3>
            <p>${escapeHtml(level.subtitle)}</p>
            <div class="level-meta">
              <span>${typeText}</span>
              <span>${escapeHtml(level.passText)}</span>
            </div>
          </div>
          <div class="level-right">
            <div class="stars" aria-label="${stars} 星">${starsHtml(stars)}</div>
            <div class="level-badge">${actionText}</div>
          </div>
        </button>`;
    }).join('');

    $$('.level-card', dom.mapRoot).forEach((card) => {
      card.addEventListener('click', () => {
        const index = Number(card.dataset.level);
        if (!isUnlocked(index)) {
          toast('先通过上一关才能解锁这里。');
          return;
        }
        startLevel(CONTENT.levels[index]);
      });
    });
  }

  /* ---------------- 进关 ---------------- */
  function startLevel(level) {
    if (level.type === 'quiz') startQuiz(level);
    else startSim(level);
  }

  /* ---------------- 测验 ---------------- */
  function startQuiz(level) {
    quiz = { level, index: 0, correct: 0, answered: false, chosen: -1, wrong: [] };
    show('screen-quiz');
    renderQuiz();
  }

  function renderQuiz() {
    const level = quiz.level;
    const question = level.questions[quiz.index];
    const total = level.questions.length;
    const bars = level.questions.map((_, i) => {
      if (i < quiz.index) return '<i class="done"></i>';
      if (i === quiz.index) return '<i class="now"></i>';
      return '<i></i>';
    }).join('');
    const options = question.options.map((option, i) => {
      let stateClass = '';
      if (quiz.answered) {
        if (i === question.answer) stateClass = 'correct';
        else if (i === quiz.chosen) stateClass = 'wrong';
      }
      return `
        <button class="option ${stateClass}" data-option="${i}" ${quiz.answered ? 'disabled' : ''}>
          <span class="k">${'ABCD'[i]}</span>
          <span>${escapeHtml(option)}</span>
        </button>`;
    }).join('');

    dom.quizRoot.innerHTML = `
      <div class="quiz-progress">${bars}</div>
      <div class="round-head">
        <h2>${escapeHtml(level.title)} · 第 ${quiz.index + 1} / ${total} 题</h2>
        <div class="hint">答错不扣分，看解释就好</div>
      </div>
      <h3 class="quiz-q">${escapeHtml(question.q)}</h3>
      <div class="options" id="quiz-options">${options}</div>
      <div id="quiz-explain"></div>`;

    $$('.option', $('#quiz-options')).forEach((button) => {
      button.addEventListener('click', () => answerQuiz(Number(button.dataset.option)));
    });

    if (quiz.answered) renderQuizExplain();
  }

  function answerQuiz(choice) {
    if (quiz.answered) return;
    const question = quiz.level.questions[quiz.index];
    const isCorrect = choice === question.answer;
    quiz = {
      ...quiz,
      answered: true,
      chosen: choice,
      correct: quiz.correct + (isCorrect ? 1 : 0),
      wrong: isCorrect ? quiz.wrong : quiz.wrong.concat(question.q)
    };
    renderQuiz();
  }

  function renderQuizExplain() {
    const question = quiz.level.questions[quiz.index];
    const isCorrect = quiz.chosen === question.answer;
    const isLast = quiz.index === quiz.level.questions.length - 1;
    const explain = $('#quiz-explain');
    if (!explain) return;
    explain.innerHTML = `
      <div class="feedback">
        <span class="answer-badge ${isCorrect ? 'ok' : 'no'}">${isCorrect ? '✓ 答对了' : '✗ 再记一下'}</span>
        <div class="fact" style="margin-top:10px">${escapeHtml(question.explain)}</div>
        <div class="feedback-actions">
          <button class="btn btn-primary btn-sm" id="quiz-next">${isLast ? '查看成绩' : '下一题 →'}</button>
        </div>
      </div>`;
    $('#quiz-next').addEventListener('click', () => {
      if (isLast) finishQuiz();
      else {
        quiz = { ...quiz, index: quiz.index + 1, answered: false, chosen: -1 };
        renderQuiz();
      }
    });
  }

  function finishQuiz() {
    const level = quiz.level;
    const total = level.questions.length;
    const correct = quiz.correct;
    const pass = correct >= 3;
    const stars = correct === total ? 3 : (correct >= 3 ? 2 : (correct === 2 ? 1 : 0));
    const score = correct * 25;
    recordResult(level, pass, stars, score, null);
    const facts = level.questions.map((q) => q.explain);
    renderResult({
      level,
      pass,
      stars,
      score,
      facts,
      title: pass ? (correct === total ? '概念全通关' : '概念已掌握') : '再来一次会更好',
      subtitle: pass
        ? `答对 ${correct} / ${total} 题。${correct === total ? '四个概念全部拿下，可以去管真账本了。' : '基础概念已经够用了，下一关是真实世界的取舍。'}`
        : `答对 ${correct} / ${total} 题，需要答对 3 题才能解锁下一关。看看下面的解释，再来一次。`,
      metrics: [
        { label: '答对题数', value: `${correct} / ${total}` },
        { label: '碳积分', value: score },
        { label: '解锁条件', value: '答对 3 题' }
      ],
      equivalents: []
    });
  }

  /* ---------------- 模拟关 ---------------- */
  function startSim(level) {
    sim = {
      level,
      roundIndex: 0,
      values: { ...level.start },
      facts: [],
      history: [],
      locked: false,
      pendingEvent: null
    };
    show('screen-game');
    if (dom.gameGoal) dom.gameGoal.textContent = '通关条件：' + level.passText;
    renderRound();
  }

  function yearOf(level, roundIndex) {
    const years = YEAR_PLAN[level.id];
    if (!years) return roundIndex + 1;
    return years[Math.min(roundIndex, years.length - 1)];
  }

  function renderHud(flash) {
    const level = sim.level;
    const values = sim.values;
    const start = level.start;
    const year = yearOf(level, sim.roundIndex);

    dom.hud.emissions.innerHTML = `${formatNumber(values.emissions)}<small>${level.unit.emissions}</small>`;
    dom.hud.budget.innerHTML = `${formatNumber(values.budget)}<small>${level.unit.budget}</small>`;
    dom.hud.support.innerHTML = `${formatNumber(values.support)}<small>%</small>`;
    dom.hud.year.innerHTML = `${year}<small>年</small>`;
    dom.hud.barEmissions.style.width = clamp(values.emissions / start.emissions * 100, 0, 100) + '%';
    dom.hud.barBudget.style.width = clamp(values.budget / start.budget * 100, 0, 100) + '%';
    dom.hud.barSupport.style.width = clamp(values.support, 0, 100) + '%';
    dom.hud.barYear.style.width = ((sim.roundIndex + 1) / level.rounds.length * 100) + '%';

    if (flash) {
      [dom.hud.emissions, dom.hud.budget, dom.hud.support].forEach((el) => {
        if (!el) return;
        el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 600);
      });
    }
  }

  function effectsChips(effects, level) {
    const chips = [];
    if (effects.emissions) {
      const good = effects.emissions < 0;
      chips.push(`<span class="chip ${good ? 'good' : 'bad'}">排放 ${signed(effects.emissions, level.unit.emissions)}</span>`);
    }
    if (effects.budget) {
      const good = effects.budget > 0;
      chips.push(`<span class="chip ${good ? 'good' : 'info'}">预算 ${signed(effects.budget, level.unit.budget)}</span>`);
    }
    if (effects.support) {
      const good = effects.support > 0;
      chips.push(`<span class="chip ${good ? 'good' : 'bad'}">支持度 ${signed(effects.support, 'pt')}</span>`);
    }
    return chips.join('');
  }

  function renderRound() {
    const level = sim.level;
    const round = level.rounds[sim.roundIndex];
    const year = yearOf(level, sim.roundIndex);
    dom.roundTitle.innerHTML = `${escapeHtml(round.title.replace(/^\d{4} · /, ''))} <em>· ${year}</em>`;
    dom.roundHint.textContent = round.hint || '';
    dom.feedback.innerHTML = '';
    dom.cards.classList.remove('hidden');
    dom.cards.innerHTML = round.cards.map((card, index) => `
      <button class="choice" data-card="${index}">
        <span class="tag">${escapeHtml(card.tag)}</span>
        <h3>${escapeHtml(card.title)}</h3>
        <span class="desc">${escapeHtml(card.desc)}</span>
        <span class="effects">${effectsChips(card.effects, level)}</span>
        <span class="pick">选择这项 →</span>
      </button>`).join('');

    $$('.choice', dom.cards).forEach((button) => {
      button.addEventListener('click', () => chooseCard(Number(button.dataset.card)));
    });
    renderHud(false);
  }

  function chooseCard(index) {
    if (sim.locked) return;
    const level = sim.level;
    const round = level.rounds[sim.roundIndex];
    const card = round.cards[index];
    const before = sim.values;
    const nextValues = {
      emissions: Math.max(0, before.emissions + (card.effects.emissions || 0)),
      budget: before.budget + (card.effects.budget || 0),
      support: clamp(before.support + (card.effects.support || 0), 0, 100)
    };

    sim = {
      ...sim,
      values: nextValues,
      facts: sim.facts.concat(card.fact),
      history: sim.history.concat({ cardId: card.id, title: card.title }),
      locked: true,
      pendingEvent: null
    };

    const allCards = $$('.choice', dom.cards);
    allCards.forEach((button, i) => {
      button.classList.toggle('picked', i === index);
      button.classList.toggle('dimmed', i !== index);
    });
    renderHud(true);

    const changes = {
      emissions: nextValues.emissions - before.emissions,
      budget: nextValues.budget - before.budget,
      support: nextValues.support - before.support
    };
    const event = findEvent(level, sim.roundIndex + 1);
    const isLastRound = sim.roundIndex === level.rounds.length - 1;
    const nextLabel = event ? '继续 →' : (isLastRound ? '查看成绩 →' : '进入下一阶段 →');

    dom.feedback.innerHTML = `
      <div class="feedback">
        <h4>${escapeHtml(card.title)} · 已生效</h4>
        <div class="deltas">${effectsChips(changes, level)}</div>
        <div class="fact">${escapeHtml(card.fact)}</div>
        <div class="feedback-actions">
          <button class="btn btn-primary btn-sm" id="sim-next">${nextLabel}</button>
        </div>
      </div>`;
    $('#sim-next').addEventListener('click', () => advanceSim(event));
    dom.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function findEvent(level, afterRound) {
    if (!level.events) return null;
    return level.events.find((event) => event.afterRound === afterRound) || null;
  }

  function advanceSim(event) {
    if (event) {
      applyEvent(event);
      return;
    }
    const level = sim.level;
    if (sim.roundIndex >= level.rounds.length - 1) {
      finishSim();
      return;
    }
    sim = { ...sim, roundIndex: sim.roundIndex + 1, locked: false };
    renderRound();
  }

  function applyEvent(event) {
    const level = sim.level;
    const before = sim.values;
    const nextValues = {
      emissions: Math.max(0, before.emissions + (event.effects.emissions || 0)),
      budget: before.budget + (event.effects.budget || 0),
      support: clamp(before.support + (event.effects.support || 0), 0, 100)
    };
    sim = { ...sim, values: nextValues, locked: true };
    renderHud(true);
    const changes = {
      emissions: nextValues.emissions - before.emissions,
      budget: nextValues.budget - before.budget,
      support: nextValues.support - before.support
    };
    const isLastRound = sim.roundIndex >= level.rounds.length - 1;
    dom.feedback.innerHTML = `
      <div class="feedback" style="border-color:rgba(255,200,87,.5);background:linear-gradient(170deg,rgba(255,200,87,.12),rgba(255,255,255,.03))">
        <span class="answer-badge" style="color:var(--amber)">⚡ ${escapeHtml(event.title)}</span>
        <div class="deltas" style="margin-top:10px">${effectsChips(changes, level)}</div>
        <div class="fact">${escapeHtml(event.text)}</div>
        <div class="feedback-actions">
          <button class="btn btn-amber btn-sm" id="event-next">${isLastRound ? '查看成绩 →' : '继续执政 →'}</button>
        </div>
      </div>`;
    $('#event-next').addEventListener('click', () => {
      if (isLastRound) {
        finishSim();
      } else {
        sim = { ...sim, roundIndex: sim.roundIndex + 1, locked: false };
        renderRound();
      }
    });
  }

  function finishSim() {
    const level = sim.level;
    const values = sim.values;
    const target = level.target;
    const pass = values.emissions <= target.emissions
      && values.budget >= (target.budget || 0)
      && values.support >= target.support;
    const strong = values.emissions <= target.emissions * 0.9
      && values.support >= target.support + 5;
    const stars = pass ? (strong ? 3 : 2) : 0;
    const reduction = Math.max(0, level.start.emissions - values.emissions);
    const score = pass
      ? Math.max(1, Math.round(
        100
        + (target.emissions - values.emissions) / target.emissions * 100
        + (values.support - target.support) * 2
      ))
      : Math.max(0, Math.round(reduction / level.start.emissions * 100));

    recordResult(level, pass, stars, score, values.emissions);
    const levelIndex = findLevelIndex(level.id);
    const nextLevel = CONTENT.levels[levelIndex + 1] || null;

    const equivalents = [];
    if (reduction > 0) {
      equivalents.push(
        { value: formatNumber(Math.round(reduction * 1000 / EQUIV.treePerYearKg)), label: '棵树一年吸收量（约）' },
        { value: formatNumber(Math.round(reduction / EQUIV.carPerYearTons)), label: '辆汽车一年排放（约）' },
        { value: formatNumber(Math.round(reduction / EQUIV.flightTons)), label: '次短途往返航班（约）' }
      );
    }

    const gradeTitle = pass
      ? (CONTENT.titles[levelIndex] || '通关')
      : '还差一点';
    const subtitle = pass
      ? `你在 ${yearOf(level, level.rounds.length - 1)} 年把排放控制在 ${formatNumber(values.emissions)} ${level.unit.emissions}。${CONTENT.cheerWords[levelIndex % CONTENT.cheerWords.length]}`
      : `目标未达成：${level.passText}。再试一次，换一组取舍会有完全不同的结果。`;

    renderResult({
      level,
      pass,
      stars,
      score,
      facts: sim.facts,
      title: gradeTitle,
      subtitle,
      metrics: [
        { label: '最终排放', value: `${formatNumber(values.emissions)} ${level.unit.emissions}` },
        { label: '剩余预算', value: `${formatNumber(values.budget)} ${level.unit.budget}` },
        { label: '公众支持度', value: `${formatNumber(values.support)} %` }
      ],
      equivalents,
      nextLevel: pass ? nextLevel : null
    });
  }

  /* ---------------- 结算页 ---------------- */
  function renderResult(options) {
    const { level, pass, stars, score, facts, title, subtitle, metrics, equivalents, nextLevel } = options;
    show('screen-result');
    if (dom.confetti && pass) launchConfetti();

    const starsBlock = level.type === 'quiz' || stars > 0
      ? `<div class="result-stars">${starsHtml(stars)}</div>` : '';
    const allMetrics = metrics.some((metric) => metric.label === '碳积分')
      ? metrics
      : [...metrics, { label: '碳积分', value: score }];
    const metricHtml = allMetrics.map((metric) => `
      <div class="metric"><div class="l">${escapeHtml(metric.label)}</div><div class="v">${escapeHtml(metric.value)}</div></div>`).join('');
    const equivHtml = equivalents && equivalents.length
      ? `<div class="equiv"><h3>这个减排量大约等于</h3><div class="equiv-grid">
          ${equivalents.map((item) => `<div class="equiv-item"><div class="v">${item.value}</div><div class="l">${escapeHtml(item.label)}</div></div>`).join('')}
        </div><p class="small muted" style="margin-top:8px">按 EPA 温室气体等价换算器的近似口径折算，仅供直观感受。</p></div>`
      : '';
    const factsHtml = facts && facts.length
      ? `<div class="learned"><h3>本轮你学到的知识点</h3><ul>
          ${facts.map((fact) => `<li><span class="ic">🌿</span><span>${escapeHtml(fact)}</span></li>`).join('')}
        </ul></div>`
      : '';
    const nextAction = pass && nextLevel
      ? `<button class="btn btn-primary" data-action="next">进入下一关 · ${escapeHtml(nextLevel.title)}</button>`
      : '';
    const allDone = pass && !nextLevel;

    dom.resultRoot.innerHTML = `
      <div class="result-hero ${pass ? '' : 'fail'}">
        <div class="eyebrow" style="margin-bottom:12px"><span class="dot"></span>${escapeHtml(level.title)} · 结算</div>
        ${starsBlock}
        <div class="grade">${escapeHtml(title)}</div>
        <p class="grade-sub">${escapeHtml(subtitle)}</p>
        <div class="result-metrics">${metricHtml}
        </div>
        ${equivHtml}
        <div class="result-actions">
          ${nextAction}
          ${pass ? '' : '<button class="btn btn-primary" data-action="retry">再试一次</button>'}
          <button class="btn btn-ghost" data-action="map">${allDone ? '回到关卡地图' : '关卡地图'}</button>
          <button class="btn btn-ghost" data-action="share">复制分享文案</button>
        </div>
        ${allDone ? '<p class="small muted" style="margin-top:16px">全部通关！把链接发给朋友，看看谁用更少的预算达成目标。</p>' : ''}
      </div>
      ${factsHtml}`;

    $$('[data-action]', dom.resultRoot).forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'next') startLevel(nextLevel);
        else if (action === 'retry') startLevel(level);
        else if (action === 'map') {
          renderMap();
          show('screen-map');
        } else if (action === 'share') {
          copyShare(score, title);
        }
      });
    });
  }

  function copyShare(score, title) {
    const text = `我在「${CONTENT.siteName} · ${CONTENT.tagline}」拿到了「${title}」，碳积分 ${score}。来挑战我：${window.location.href.split('#')[0]}`;
    const finish = () => toast('分享文案已复制，去粘贴给朋友吧。');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
    } else {
      fallbackCopy(text, finish);
    }
  }

  function fallbackCopy(text, onDone) {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      onDone();
    } catch (error) {
      toast('复制失败，请手动选择文本分享。');
    }
    document.body.removeChild(area);
  }

  /* ---------------- 彩纸 ---------------- */
  function launchConfetti() {
    const colors = ['#3ddc97', '#ffc857', '#5cc8ff', '#b79cff', '#ff7b6b'];
    const box = dom.confetti;
    box.innerHTML = '';
    for (let i = 0; i < 60; i += 1) {
      const piece = document.createElement('i');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.top = '-10vh';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (Math.random() * 1.6 + 1.6) + 's';
      piece.style.animationDelay = Math.random() * 0.8 + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(piece);
    }
    setTimeout(() => { box.innerHTML = ''; }, 3800);
  }

  /* ---------------- 名词解释弹层 ---------------- */
  function openGlossary() {
    if (!dom.modal) return;
    const list = dom.modal.querySelector('#glossary-list');
    if (list && !list.dataset.filled) {
      list.innerHTML = CONTENT.glossary.map((item) => `
        <div class="gloss"><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.def)}</dd></div>`).join('');
      list.dataset.filled = 'true';
    }
    dom.modal.classList.add('open');
    const closeBtn = dom.modal.querySelector('#btn-glossary-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeGlossary() {
    if (dom.modal) dom.modal.classList.remove('open');
  }

  function bindUi() {
    $$('[data-open-glossary]').forEach((button) => button.addEventListener('click', openGlossary));
    if (dom.modal) {
      dom.modal.addEventListener('click', (event) => {
        if (event.target === dom.modal) closeGlossary();
      });
      const closeBtn = dom.modal.querySelector('#btn-glossary-close');
      if (closeBtn) closeBtn.addEventListener('click', closeGlossary);
    }
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeGlossary();
    });
    const reset = document.querySelector('#btn-reset-progress');
    if (reset) {
      reset.addEventListener('click', () => {
        const confirmed = window.confirm('确定清空本机游戏进度？此操作不可撤销。');
        if (!confirmed) return;
        saveProgress({ levels: {} });
        renderMap();
        toast('进度已清空。');
      });
    }
  }

  /* ---------------- 启动 ---------------- */
  try {
    bindUi();
    renderMap();
    show('screen-map');
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const level = CONTENT.levels.find((item) => item.id === hash);
      if (level && isUnlocked(findLevelIndex(level.id))) startLevel(level);
    }
  } catch (error) {
    toast('页面初始化失败，请刷新重试。');
  }
})();
