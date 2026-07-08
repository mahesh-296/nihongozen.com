/**
 * kanji-quiz.js
 * ---------------------------------------------------------------------------
 * Standalone Kanji Quiz engine — matches the exact schema used in your
 * existing nz-data.js. No UI here, only data + quiz logic, so it drops
 * straight into your project without touching your existing theme/components.
 *
 * HOW TO USE
 * ---------------------------------------------------------------------------
 * Load this AFTER nz-data.js, plain <script> tags (same pattern as your
 * existing project — no bundler / ES module import needed):
 *
 *   <script src="nz-data.js"></script>
 *   <script src="kanji-quiz.js"></script>
 *
 * This file reads the global `kanjiData` object that nz-data.js defines:
 *   var kanjiData = { N5: [...], N4: [...], N3: [...], N2: [...], N1: [...] }
 * Each entry looks like:
 *   { id:'k-N5-052', kanji:'水', reading:'みず・スイ', meaning:'water',
 *     kun:'みず', on:'スイ', example:'水 (みず) water',
 *     exampleMeaning:'water.', learned:false }
 *
 * Everything below is exposed on a single global object: `KanjiQuiz`.
 * Example:
 *   const quiz = KanjiQuiz.generateQuiz({ level: "N5", mode: "mixed", count: 10 });
 *   const isRight = KanjiQuiz.checkAnswer(quiz.questions[0], "water");
 * ---------------------------------------------------------------------------
 */

(function (global) {
  "use strict";

  // ---- 1. READ EXISTING DATA (no duplication) ------------------------------
  function getRawKanjiData() {
    const data = global.kanjiData;
    if (!data || typeof data !== "object") {
      throw new Error(
        "[kanji-quiz.js] `kanjiData` not found on window. Make sure nz-data.js " +
          "is loaded BEFORE kanji-quiz.js."
      );
    }
    return data; // { N5: [...], N4: [...], ... }
  }

  const LEVEL_KEYS = ["N5", "N4", "N3", "N2", "N1"];

  /**
   * Normalizes one raw nz-data.js entry into a consistent shape for quiz use.
   * Splits `on` / `kun` strings (e.g. "ジン・ニン") into arrays, and derives
   * a meaning array by splitting on "/" (e.g. "book/origin" -> ["book","origin"]).
   */
  function normalizeEntry(raw, level) {
    const onList = (raw.on || "").split("・").map((s) => s.trim()).filter(Boolean);
    const kunList = (raw.kun || "").split("・").map((s) => s.trim()).filter(Boolean);
    const meaningList = (raw.meaning || "")
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      id: raw.id,
      kanji: raw.kanji,
      reading: raw.reading || "",
      meaning: meaningList.length ? meaningList : [raw.meaning || ""],
      onyomi: onList,
      kunyomi: kunList,
      example: raw.example || "",
      exampleMeaning: raw.exampleMeaning || "",
      learned: !!raw.learned,
      jlpt: level,
      _raw: raw, // keep original in case you need extra fields later
    };
  }

  let _cache = null;
  function getAllKanji() {
    if (_cache) return _cache;
    const raw = getRawKanjiData();
    const all = [];
    LEVEL_KEYS.forEach((level) => {
      (raw[level] || []).forEach((entry) => all.push(normalizeEntry(entry, level)));
    });
    _cache = all;
    return all;
  }

  /** Call this if kanjiData is mutated at runtime (e.g. `learned` toggled) and you need fresh data. */
  function invalidateCache() {
    _cache = null;
  }

  // ---- 2. QUIZ CONFIG CONSTANTS ---------------------------------------------
  const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1", "ALL"];

  const QUIZ_MODES = {
    MEANING_TO_KANJI: "meaning_to_kanji",
    KANJI_TO_MEANING: "kanji_to_meaning",
    ONYOMI: "onyomi",
    KUNYOMI: "kunyomi",
    MIXED: "mixed",
    EXAMPLE_SENTENCE: "example_sentence",
    ALL_MODES: "all_modes",
  };

  const DIFFICULTY = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
    ADAPTIVE: "adaptive",
  };

  const SINGLE_MODES = [
    QUIZ_MODES.MEANING_TO_KANJI,
    QUIZ_MODES.KANJI_TO_MEANING,
    QUIZ_MODES.ONYOMI,
    QUIZ_MODES.KUNYOMI,
    QUIZ_MODES.EXAMPLE_SENTENCE,
  ];

  // ---- 3. FILTERING -----------------------------------------------------------
  function filterKanjiByLevel(level) {
    const all = getAllKanji();
    if (!level || level === "ALL") return all;
    return all.filter((k) => k.jlpt === level.toUpperCase());
  }

  // ---- 4. QUESTION GENERATION -------------------------------------------------
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function resolveModeForQuestion(mode) {
    if (mode === QUIZ_MODES.MIXED || mode === QUIZ_MODES.ALL_MODES) {
      return SINGLE_MODES[Math.floor(Math.random() * SINGLE_MODES.length)];
    }
    return mode;
  }

  function answerKeyForMode(entry, mode) {
    switch (mode) {
      case QUIZ_MODES.MEANING_TO_KANJI:
        return entry.kanji;
      case QUIZ_MODES.KANJI_TO_MEANING:
        return entry.meaning[0] || "";
      case QUIZ_MODES.ONYOMI:
        return entry.onyomi.join("・") || "(none)";
      case QUIZ_MODES.KUNYOMI:
        return entry.kunyomi.join("・") || "(none)";
      case QUIZ_MODES.EXAMPLE_SENTENCE:
        return entry.exampleMeaning || entry.meaning[0] || "";
      default:
        return entry.meaning[0] || "";
    }
  }

  function promptForMode(entry, mode) {
    switch (mode) {
      case QUIZ_MODES.MEANING_TO_KANJI:
        return { prompt: entry.meaning.join(" / "), promptType: "text" };
      case QUIZ_MODES.KANJI_TO_MEANING:
        return { prompt: entry.kanji, promptType: "kanji" };
      case QUIZ_MODES.ONYOMI:
        return { prompt: entry.kanji, promptType: "kanji", instruction: "Onyomi reading" };
      case QUIZ_MODES.KUNYOMI:
        return { prompt: entry.kanji, promptType: "kanji", instruction: "Kunyomi reading" };
      case QUIZ_MODES.EXAMPLE_SENTENCE:
        return { prompt: entry.example || entry.kanji, promptType: "sentence" };
      default:
        return { prompt: entry.kanji, promptType: "kanji" };
    }
  }

  /** Builds multiple-choice options (correct + distractors from the same pool), shuffled. */
  function buildChoices(entry, mode, pool, count) {
    count = count || 4;
    const correct = answerKeyForMode(entry, mode);
    const distractorPool = shuffle(pool.filter((k) => k.kanji !== entry.kanji)).slice(
      0,
      count - 1
    );
    const distractors = distractorPool.map((k) => answerKeyForMode(k, mode));
    return shuffle([correct].concat(distractors));
  }

  /**
   * Generates a full quiz question set.
   * @param {Object} opts
   * @param {string} opts.level - one of JLPT_LEVELS (default "ALL")
   * @param {string} opts.mode - one of QUIZ_MODES (default "mixed")
   * @param {string} opts.difficulty - one of DIFFICULTY (default "medium")
   * @param {number} opts.count - number of questions (default 10)
   * @param {boolean} opts.multipleChoice - include `choices` array (default true)
   * @param {boolean} opts.onlyUnlearned - skip kanji already marked `learned: true`
   */
  function generateQuiz(opts) {
    opts = opts || {};
    const level = opts.level || "ALL";
    const mode = opts.mode || QUIZ_MODES.MIXED;
    const difficulty = opts.difficulty || DIFFICULTY.MEDIUM;
    const count = opts.count || 10;
    const multipleChoice = opts.multipleChoice !== false;
    const onlyUnlearned = !!opts.onlyUnlearned;

    let pool = filterKanjiByLevel(level);
    if (onlyUnlearned) pool = pool.filter((k) => !k.learned);

    if (pool.length === 0) {
      throw new Error(
        '[kanji-quiz.js] No kanji available for level "' +
          level +
          (onlyUnlearned ? '" (with onlyUnlearned filter)' : '"')
      );
    }

    const chosen = shuffle(pool).slice(0, Math.min(count, pool.length));

    const timePerQuestion =
      difficulty === DIFFICULTY.EASY
        ? 75
        : difficulty === DIFFICULTY.HARD
        ? 45
        : 60; // medium / adaptive default starting point

    const questions = chosen.map(function (entry, idx) {
      const resolvedMode = resolveModeForQuestion(mode);
      const p = promptForMode(entry, resolvedMode);
      return {
        id: idx + "-" + entry.kanji,
        entry: entry,
        mode: resolvedMode,
        prompt: p.prompt,
        promptType: p.promptType,
        instruction: p.instruction || null,
        correctAnswer: answerKeyForMode(entry, resolvedMode),
        choices: multipleChoice ? buildChoices(entry, resolvedMode, pool) : null,
        timeLimitSeconds: timePerQuestion,
      };
    });

    return {
      level: level,
      mode: mode,
      difficulty: difficulty,
      createdAt: Date.now(),
      questions: questions,
    };
  }

  // ---- 5. ANSWER VALIDATION ---------------------------------------------------
  function normalizeAnswer(str) {
    return (str || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
  }

  /**
   * Validates a typed or selected answer. For meaning questions, accepts any
   * of the valid synonyms split from the original "a/b/c" meaning string.
   */
  function checkAnswer(question, userAnswer) {
    const given = normalizeAnswer(userAnswer);
    const acceptable = [question.correctAnswer]
      .concat(question.entry.meaning || [])
      .filter(Boolean)
      .map(normalizeAnswer);
    return acceptable.indexOf(given) !== -1;
  }

  // ---- 6. SCORING / XP / STREAK ENGINE ---------------------------------------
  function createSessionState() {
    return {
      correct: 0,
      incorrect: 0,
      skipped: 0,
      streak: 0,
      bestStreak: 0,
      xp: 0,
      comboMultiplier: 1,
      startedAt: Date.now(),
      reviewIncorrect: [],
    };
  }

  const BASE_XP = 10;

  /** result: "correct" | "incorrect" | "skipped" */
  function recordAnswer(state, payload) {
    const question = payload.question;
    const result = payload.result;
    const userAnswer = payload.userAnswer;

    const next = Object.assign({}, state);
    next.reviewIncorrect = state.reviewIncorrect.slice();

    if (result === "correct") {
      next.correct += 1;
      next.streak += 1;
      next.bestStreak = Math.max(next.bestStreak, next.streak);
      next.comboMultiplier = 1 + Math.floor(next.streak / 5) * 0.5;
      next.xp += Math.round(BASE_XP * next.comboMultiplier);
    } else if (result === "incorrect") {
      next.incorrect += 1;
      next.streak = 0;
      next.comboMultiplier = 1;
      next.reviewIncorrect.push({ question: question, userAnswer: userAnswer || null });
    } else {
      next.skipped += 1;
      next.streak = 0;
      next.comboMultiplier = 1;
      next.reviewIncorrect.push({ question: question, userAnswer: null });
    }

    return next;
  }

  function getAccuracy(state) {
    const total = state.correct + state.incorrect + state.skipped;
    if (total === 0) return 0;
    return Math.round((state.correct / total) * 100);
  }

  function getPerformanceRating(accuracy) {
    if (accuracy >= 90) return "S";
    if (accuracy >= 75) return "A";
    if (accuracy >= 50) return "B";
    return "C";
  }

  function buildResultsSummary(state, meta) {
    meta = meta || {};
    const accuracy = getAccuracy(state);
    const seen = {};
    const recommended = [];
    state.reviewIncorrect.forEach(function (r) {
      const k = r.question.entry.kanji;
      if (!seen[k]) {
        seen[k] = true;
        recommended.push(r.question.entry);
      }
    });

    return {
      finalScore: state.xp,
      accuracy: accuracy,
      xpEarned: state.xp,
      bestStreak: state.bestStreak,
      timeTakenSeconds: meta.timeTakenSeconds || null,
      jlptLevel: meta.level || null,
      performanceRating: getPerformanceRating(accuracy),
      incorrectAnswers: state.reviewIncorrect,
      recommendedPractice: recommended.slice(0, 10),
    };
  }

  // ---- 7. ADAPTIVE DIFFICULTY (optional helper) -------------------------------
  function adjustAdaptiveTime(currentTimeLimit, wasCorrect, timeUsedSeconds) {
    if (wasCorrect && timeUsedSeconds < currentTimeLimit * 0.4) {
      return Math.max(20, currentTimeLimit - 5);
    }
    if (!wasCorrect) {
      return Math.min(90, currentTimeLimit + 5);
    }
    return currentTimeLimit;
  }

  // ---- 8. OPTIONAL: mark a kanji as learned (mutates the shared kanjiData) ----
  /** Mirrors your existing `learned` flag pattern in nz-data.js */
  function markLearned(kanjiId, value) {
    const raw = getRawKanjiData();
    for (let i = 0; i < LEVEL_KEYS.length; i++) {
      const arr = raw[LEVEL_KEYS[i]] || [];
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].id === kanjiId) {
          arr[j].learned = value !== false;
          invalidateCache();
          return true;
        }
      }
    }
    return false;
  }

  // ---- 9. PUBLIC API -----------------------------------------------------------
  global.KanjiQuiz = {
    // data access
    getAllKanji: getAllKanji,
    filterKanjiByLevel: filterKanjiByLevel,
    invalidateCache: invalidateCache,
    markLearned: markLearned,
    // quiz flow
    generateQuiz: generateQuiz,
    checkAnswer: checkAnswer,
    // scoring
    createSessionState: createSessionState,
    recordAnswer: recordAnswer,
    getAccuracy: getAccuracy,
    getPerformanceRating: getPerformanceRating,
    buildResultsSummary: buildResultsSummary,
    adjustAdaptiveTime: adjustAdaptiveTime,
    // constants
    JLPT_LEVELS: JLPT_LEVELS,
    QUIZ_MODES: QUIZ_MODES,
    DIFFICULTY: DIFFICULTY,
  };
})(typeof window !== "undefined" ? window : globalThis);
