const CFG = window.MOTHERS_DAY_CONFIG;
const app = document.getElementById("app");

const SCREENS = ["welcome", "wordle", "intro", "sudoku", "crossword", "finale"];
let currentScreen = localStorage.getItem("mday-screen") || "wordle";
if (currentScreen === "threeButtons") currentScreen = "finale";

const state = {
  wordle: {
    row: 0,
    col: 0,
    guesses: Array.from({ length: 6 }, () => Array(5).fill("")),
    evaluations: Array.from({ length: 6 }, () => Array(5).fill(null)),
    solved: false
  },
  nextClicks: {
    intro: 0,
    sudoku: 0,
    crossword: 0
  },
  threeButtons: {
    clicked: [],
    solved: false
  }
};

function saveScreen(name) {
  currentScreen = name;
  localStorage.setItem("mday-screen", name);
}

function goTo(name) {
  saveScreen(name);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetProgress() {
  localStorage.removeItem("mday-screen");
  location.reload();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function photoGrid(groupName) {
  const photos = CFG.photos[groupName] || [];
  return `
    <div class="photo-grid">
      ${photos.map(photo => `
        <figure class="photo-card">
          <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.caption || "Memory photo")}" onerror="this.src='assets/photos/missing_photo.svg'" />
          ${photo.caption ? `<figcaption class="photo-caption">${escapeHtml(photo.caption)}</figcaption>` : ""}
        </figure>
      `).join("")}
    </div>
  `;
}

function topbar(kicker, title) {
  return `
    <div class="topbar">
      <div>
        <p class="kicker">${escapeHtml(kicker)}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <button class="ghost-btn" id="resetBtn">Start over</button>
    </div>
  `;
}

function attachCommonHandlers() {
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetProgress);
}

function openLetter(letterKey) {
  const letter = CFG.letters[letterKey];
  if (!letter) return;
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(letter.title)}">
      <h2>${escapeHtml(letter.title)}</h2>
      ${letter.body.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <div class="btn-row">
        <button id="closeLetter">Close letter</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById("closeLetter").addEventListener("click", () => backdrop.remove());
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) backdrop.remove();
  });
}

function showConfetti() {
  const colors = ["#e7568b", "#f4b942", "#77a86b", "#8b6fe8", "#58a6ff"];
  const confetti = document.createElement("div");
  confetti.className = "confetti";
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.7}s`;
    piece.style.animationDuration = `${2 + Math.random() * 1.3}s`;
    confetti.appendChild(piece);
  }
  document.body.appendChild(confetti);
  window.setTimeout(() => confetti.remove(), 3900);
}

function render() {
  const renderer = {
    welcome: renderWelcome,
    wordle: renderWordle,
    intro: renderIntro,
    sudoku: renderSudoku,
    crossword: renderCrossword,
    finale: renderFinale
  }[currentScreen] || renderWelcome;

  renderer();
  attachCommonHandlers();
}

function renderWelcome() {
  app.innerHTML = `
    <main class="screen">
      <div class="grid-two">
        <section>
          <p class="kicker">A little puzzle adventure</p>
          <h1>${escapeHtml(CFG.title)}</h1>
          <p>
            Solve each puzzle to unlock the next memory, letter, and clue.
            The first puzzle is a special Wordle.
          </p>
          <div class="btn-row">
            <button id="startBtn">Start</button>
            <button class="ghost-btn" id="resetBtn">Reset progress</button>
          </div>
        </section>
        <section class="big-card">
          ${photoGrid("intro")}
          <p class="hidden-hint">Tiny note: some clues are hiding inside the letters.</p>
        </section>
      </div>
    </main>
  `;
  document.getElementById("startBtn").addEventListener("click", () => goTo("wordle"));
}

function renderWordle() {
  app.innerHTML = `
    <main class="screen">
      ${topbar("Puzzle 1", "Mother's Day Wordle")}
      <div class="grid-two">
        <section class="big-card">
          <p>Guess the five-letter word. Type on your keyboard or use the buttons below.</p>
          <div class="wordle-wrap">
            <div class="wordle-grid" id="wordleGrid"></div>
            <div class="keyboard" id="keyboard"></div>
            <p class="status" id="wordleStatus"></p>
          </div>
          <p class="hidden-hint">Hidden hint: she makes everyone feel <button id="wordleHint">this</button>.</p>
        </section>
        <section>
          <div class="big-card">
            <h3>How this works</h3>
            <p>Green means the letter is in the correct spot. Yellow means the letter is in the word but not there. Gray means it is not in the word.</p>
            <p>When the word is solved, the Mother's Day sign opens.</p>
          </div>
        </section>
      </div>
    </main>
  `;

  drawWordleGrid();
  drawKeyboard();

  document.addEventListener("keydown", wordleKeyHandler);
  document.getElementById("wordleHint").addEventListener("click", () => {
    document.getElementById("wordleStatus").textContent = "Try HAPPY.";
  });
}

function drawWordleGrid() {
  const grid = document.getElementById("wordleGrid");
  if (!grid) return;
  grid.innerHTML = "";

  for (let r = 0; r < 6; r++) {
    const row = document.createElement("div");
    row.className = "wordle-row";
    for (let c = 0; c < 5; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      if (state.wordle.evaluations[r][c]) tile.classList.add(state.wordle.evaluations[r][c]);
      tile.textContent = state.wordle.guesses[r][c];
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }
    grid.appendChild(row);
  }
}

function drawKeyboard() {
  const keyboard = document.getElementById("keyboard");
  if (!keyboard) return;
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  keyboard.innerHTML = rows.map((letters, index) => `
    <div class="keyboard-row">
      ${index === 2 ? `<button class="key wide" data-key="Enter">Enter</button>` : ""}
      ${letters.split("").map(letter => `<button class="key" data-key="${letter}">${letter}</button>`).join("")}
      ${index === 2 ? `<button class="key wide" data-key="Backspace">Delete</button>` : ""}
    </div>
  `).join("");

  keyboard.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => handleWordleKey(button.dataset.key));
  });
}

function wordleKeyHandler(event) {
  if (currentScreen !== "wordle") return;
  handleWordleKey(event.key);
}

function handleWordleKey(key) {
  if (state.wordle.solved) return;
  const status = document.getElementById("wordleStatus");
  if (!status) return;

  if (/^[a-zA-Z]$/.test(key)) {
    if (state.wordle.col < 5) {
      state.wordle.guesses[state.wordle.row][state.wordle.col] = key.toUpperCase();
      state.wordle.col += 1;
      drawWordleGrid();
    }
    return;
  }

  if (key === "Backspace") {
    if (state.wordle.col > 0) {
      state.wordle.col -= 1;
      state.wordle.guesses[state.wordle.row][state.wordle.col] = "";
      drawWordleGrid();
    }
    return;
  }

  if (key === "Enter") {
    if (state.wordle.col < 5) {
      status.textContent = "The word needs five letters.";
      return;
    }
    submitWordleGuess();
  }
}

function submitWordleGuess() {
  const answer = CFG.wordleAnswer.toUpperCase();
  const guess = state.wordle.guesses[state.wordle.row].join("");
  const status = document.getElementById("wordleStatus");

  for (let i = 0; i < 5; i++) {
    const tile = document.getElementById(`tile-${state.wordle.row}-${i}`);
    const letter = guess[i];
    let result = "absent";
    if (letter === answer[i]) result = "correct";
    else if (answer.includes(letter)) result = "present";
    state.wordle.evaluations[state.wordle.row][i] = result;
    tile.classList.add(result);
  }

  if (guess === answer) {
    state.wordle.solved = true;
    status.textContent = "You solved it! Opening the sign...";
    showConfetti();
    window.setTimeout(() => {
      document.removeEventListener("keydown", wordleKeyHandler);
      goTo("intro");
    }, 900);
    return;
  }

  if (state.wordle.row === 5) {
    status.textContent = `The word was ${answer}. Click the hint if you want to try again.`;
    state.wordle.row = 0;
    state.wordle.col = 0;
    state.wordle.guesses = Array.from({ length: 6 }, () => Array(5).fill(""));
    state.wordle.evaluations = Array.from({ length: 6 }, () => Array(5).fill(null));
    window.setTimeout(drawWordleGrid, 1000);
    return;
  }

  state.wordle.row += 1;
  state.wordle.col = 0;
  status.textContent = "Try another guess.";
}

function renderIntro() {
  app.innerHTML = `
    <main class="screen">
      ${topbar("Unlocked", "HAPPY MOTHER'S DAY")}
      <section class="big-card">
        <h1>HAPPY MOTHER'S DAY</h1>
        <p>You solved the first puzzle! This Mother's Day I'm going to give you the chance to do your favorite thing - Play some games!!</p>
        ${photoGrid("intro")}
        <div class="btn-row">
          <button class="letter-btn" id="introLetter">💌 Open letter</button>
        </div>
        <div class="gimmick-area" id="introGimmick">
          <p class="status" id="introStatus">Click next to play the next game.</p>
          <button class="gimmick-button" id="introNext">Next</button>
        </div>
      </section>
    </main>
  `;
  document.getElementById("introLetter").addEventListener("click", () => openLetter("intro"));
  attachMovingClickButton("introNext", "introStatus", "sudoku", "intro");
}

function attachMovingClickButton(buttonId, statusId, destination, key) {
  const button = document.getElementById(buttonId);
  const status = document.getElementById(statusId);
  const area = button.closest(".gimmick-area");

  button.addEventListener("click", () => {
    state.nextClicks[key] += 1;
    if (state.nextClicks[key] >= 5) {
      status.textContent = "Okay, okay, you caught it.";
      goTo(destination);
      return;
    }

    button.classList.add("absolute");
    const maxX = Math.max(0, area.clientWidth - button.offsetWidth - 20);
    const maxY = Math.max(0, area.clientHeight - button.offsetHeight - 20);
    const x = 10 + Math.random() * maxX;
    const y = 60 + Math.random() * Math.max(20, maxY - 40);
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    status.textContent = `Almost. Maybe try 1 more time.`;
  });
}

function renderSudoku() {
  app.innerHTML = `
    <main class="screen">
      ${topbar("Puzzle 2", "Sudoku Memory")}
      <div class="grid-two">
        <section class="big-card" style="position: relative;">
          <p>Fill in the Sudoku.</p>

          <!-- Hidden debug skip button -->
          <button
            id="skipSudokuDebug"
            title="Debug: skip Sudoku"
            style="
              position: absolute;
              right: 12px;
              bottom: 12px;
              opacity: 0;
              width: 90px;
              height: 32px;
              border-radius: 999px;
              cursor: pointer;
              z-index: 10;
            "
            onmouseover="this.style.opacity='0.85'"
            onmouseout="this.style.opacity='0'"
          >
            Skip
          </button>

          <div id="sudokuBoard" class="sudoku-board"></div>
          <div class="btn-row">
            <button id="checkSudoku">Check Sudoku</button>
            <button class="secondary-btn" id="sudokuHint">Hint</button>
          </div>
          <p class="status" id="sudokuStatus"></p>
        </section>

        <section class="big-card" id="sudokuReward" style="display:none;">
          <h3>The highlighted numbers hide a memory</h3>
          <p>Add up only the highlighted numbers, then enter the total below.</p>

          <div class="btn-row">
            <input
              id="sudokuMemoryAnswer"
              type="number"
              placeholder="Enter total"
              style="
                max-width: 160px;
                padding: 0.75rem 1rem;
                border-radius: 999px;
                border: 1px solid rgba(120, 80, 120, 0.25);
                font-size: 1rem;
                text-align: center;
              "
            />
            <button id="checkSudokuMemory">Unlock memory</button>
          </div>

          <p class="status" id="sudokuMemoryStatus"></p>

          <div id="sudokuMemoryUnlocked" style="display:none;">
            <h3>2026 - 28 = 1998</h3>
            <p>That was the year you first became a mother!!</p>

            ${photoGrid("sudoku")}

            <div class="btn-row">
              <button class="letter-btn" id="sudokuLetter">💌 Open letter</button>
            </div>

            <div class="gimmick-area" id="sudokuGimmick">
              <p class="status" id="sudokuNextStatus">This next button is shrinking from responsibility.</p>
              <button class="gimmick-button" id="sudokuNext">Next</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;

  drawSudokuBoard(false);

  document.getElementById("checkSudoku").addEventListener("click", checkSudoku);

  document.getElementById("sudokuHint").addEventListener("click", () => {
    document.getElementById("sudokuStatus").textContent =
      "Use digits 1-9. Each row, column, and 3x3 box uses each digit once.";
  });

  document.getElementById("skipSudokuDebug").addEventListener("click", () => {
    goTo("crossword");
  });
}

function drawSudokuBoard(highlightSolvedNumbers) {
  const board = document.getElementById("sudokuBoard");
  board.innerHTML = "";

  // These highlighted cells add to 28:
  // solution[0][0] = 5
  // solution[0][3] = 6
  // solution[0][5] = 8
  // solution[0][6] = 9
  // 5 + 6 + 8 + 9 = 28
  const highlightedCells = [
    [0, 0],
    [0, 3],
    [0, 5],
    [0, 6]
  ];

  CFG.sudoku.puzzle.forEach((row, r) => {
    row.forEach((value, c) => {
      const input = document.createElement("input");
      input.className = "sudoku-cell";
      input.maxLength = 1;
      input.inputMode = "numeric";
      input.dataset.row = r;
      input.dataset.col = c;

      if ((c + 1) % 3 === 0 && c !== 8) input.classList.add("r-border");
      if ((r + 1) % 3 === 0 && r !== 8) input.classList.add("b-border");

      const shouldHighlight = highlightedCells.some(([hr, hc]) => hr === r && hc === c);

      if (highlightSolvedNumbers && shouldHighlight) {
        input.classList.add("highlighted");
      }

      if (value !== 0 || highlightSolvedNumbers) {
        input.value = value !== 0 ? value : CFG.sudoku.solution[r][c];
        input.disabled = true;
        if (value !== 0) input.classList.add("fixed");
      } else {
        input.addEventListener("input", () => {
          input.value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
        });
      }

      board.appendChild(input);
    });
  });
}

function checkSudoku() {
  const cells = document.querySelectorAll(".sudoku-cell");
  let correct = true;

  cells.forEach(cell => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    if (String(CFG.sudoku.solution[r][c]) !== cell.value) {
      correct = false;
    }
  });

  const status = document.getElementById("sudokuStatus");

  if (!correct) {
    status.textContent = "Not quite yet. Keep going — the board needs to match the solution.";
    return;
  }

  status.textContent = "Correct! Some numbers are lighting up.";
  drawSudokuBoard(true);

  document.getElementById("sudokuReward").style.display = "block";
  document.getElementById("checkSudokuMemory").onclick = checkSudokuMemoryAnswer;

  showConfetti();
}

function checkSudokuMemoryAnswer() {
  const answer = document.getElementById("sudokuMemoryAnswer").value.trim();
  const status = document.getElementById("sudokuMemoryStatus");

  if (answer !== "28") {
    status.textContent = "Not quite. Add only the highlighted numbers.";
    return;
  }

  status.textContent = "Correct. You found the hidden year.";
  document.getElementById("sudokuMemoryUnlocked").style.display = "block";

  document.getElementById("sudokuLetter").onclick = () => openLetter("sudoku");

  attachShrinkingButton("sudokuNext", "sudokuNextStatus", "crossword", "sudoku");

  showConfetti();
}

function attachShrinkingButton(buttonId, statusId, destination, key) {
  const button = document.getElementById(buttonId);
  const status = document.getElementById(statusId);
  button.addEventListener("click", () => {
    state.nextClicks[key] += 1;
    if (state.nextClicks[key] >= 5) {
      status.textContent = "Click next for the next game.";
      goTo(destination);
      return;
    }
    const scale = Math.max(0.45, 1 - state.nextClicks[key] * 0.12);
    button.style.transform = `scale(${scale})`;
    status.textContent = `Opps! It got smaller.`;
  });
}

function renderCrossword() {
  app.innerHTML = `
    <main class="screen">
      ${topbar("Puzzle 3", "Crossword of Memories")}
      <section class="big-card" style="position: relative;">
        <p>Fill the crossword using the clues.</p>

        <!-- Hidden debug skip button -->
        <button
          id="skipCrosswordDebug"
          title="Debug: skip Crossword"
          style="
            position: absolute;
            right: 12px;
            bottom: 12px;
            opacity: 0;
            width: 110px;
            height: 32px;
            border-radius: 999px;
            cursor: pointer;
            z-index: 10;
          "
          onmouseover="this.style.opacity='0.85'"
          onmouseout="this.style.opacity='0'"
        >
          Skip
        </button>

        <div class="crossword-layout">
          <div>
            <div id="crosswordGrid" class="crossword-grid"></div>
            <div class="btn-row">
              <button id="checkCrossword">Check crossword</button>
              <button class="secondary-btn" id="crosswordHint">Hint</button>
            </div>
            <p class="status" id="crosswordStatus"></p>
          </div>
          <div class="clues">
            <div>
              <h3>Across</h3>
              <ol class="clue-list" id="acrossClues"></ol>
            </div>
            <div>
              <h3>Down</h3>
              <ol class="clue-list" id="downClues"></ol>
            </div>
          </div>
        </div>
      </section>

      <section class="big-card" id="crosswordReward" style="display:none; margin-top:18px;">
        <h2>Final memory unlocked</h2>
        <p>You solved the crossword. Open the last letter, then catch the next button.</p>
        <div class="btn-row">
          <button class="letter-btn" id="crosswordLetter">💌 Open letter</button>
        </div>
        <div class="gimmick-area" id="crosswordGimmick">
          <p class="status" id="crosswordNextStatus">This next button gets tired each time it runs away.</p>
          <button class="gimmick-button" id="crosswordNext">Next</button>
        </div>
      </section>
    </main>
  `;

  drawCrossword();

  document.getElementById("checkCrossword").addEventListener("click", checkCrossword);

  document.getElementById("crosswordHint").addEventListener("click", () => {
    document.getElementById("crosswordStatus").textContent =
      "Use the clues. Some answers cross through each other.";
  });

  // Debug skip: hover near the bottom-right of the crossword card, then click Skip.
  document.getElementById("skipCrosswordDebug").addEventListener("click", () => {
  goTo("finale");
  }); 
  // document.getElementById("skipCrosswordDebug").addEventListener("click", () => {
  //   goTo("finale");
  // });
}

function buildCrosswordData() {
  const size = CFG.crossword.size;
  const solution = Array.from({ length: size }, () => Array(size).fill(null));
  const numbers = Array.from({ length: size }, () => Array(size).fill(null));

  CFG.crossword.words.forEach(word => {
    const answer = word.answer.toUpperCase();
    for (let i = 0; i < answer.length; i++) {
      const r = word.row + (word.direction === "down" ? i : 0);
      const c = word.col + (word.direction === "across" ? i : 0);
      solution[r][c] = answer[i];
    }
    numbers[word.row][word.col] = word.number;
  });

  return { size, solution, numbers };
}

function drawCrossword() {
  const { size, solution, numbers } = buildCrosswordData();
  const grid = document.getElementById("crosswordGrid");
  grid.style.gridTemplateColumns = `repeat(${size}, 38px)`;
  grid.innerHTML = "";

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const wrap = document.createElement("div");
      wrap.className = "cw-cell-wrap";
      if (!solution[r][c]) {
        wrap.classList.add("black");
      } else {
        if (numbers[r][c]) {
          const num = document.createElement("span");
          num.className = "cw-num";
          num.textContent = numbers[r][c];
          wrap.appendChild(num);
        }
        const input = document.createElement("input");
        input.className = "cw-input";
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.addEventListener("input", () => {
          input.value = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 1);
        });
        wrap.appendChild(input);
      }
      grid.appendChild(wrap);
    }
  }

  const across = CFG.crossword.words.filter(w => w.direction === "across");
  const down = CFG.crossword.words.filter(w => w.direction === "down");
  document.getElementById("acrossClues").innerHTML = across.map(w => `<li value="${w.number}">${escapeHtml(w.clue)}</li>`).join("");
  document.getElementById("downClues").innerHTML = down.map(w => `<li value="${w.number}">${escapeHtml(w.clue)}</li>`).join("");
}

function checkCrossword() {
  const { solution } = buildCrosswordData();
  const inputs = document.querySelectorAll(".cw-input");
  let correct = true;
  inputs.forEach(input => {
    const r = Number(input.dataset.row);
    const c = Number(input.dataset.col);
    if (input.value.toUpperCase() !== solution[r][c]) correct = false;
  });

  const status = document.getElementById("crosswordStatus");
  if (!correct) {
    status.textContent = "Not quite yet. Check the letters and clues.";
    return;
  }

  status.textContent = "Correct! The final note is unlocked.";
  document.getElementById("crosswordReward").style.display = "block";
  document.getElementById("crosswordLetter").addEventListener("click", () => openLetter("crossword"));
  // attachSlowingRunawayButton("crosswordNext", "crosswordNextStatus", "finale", "crossword");
  attachSlowingRunawayButton("crosswordNext", "crosswordNextStatus", "finale", "crossword");
  showConfetti();
}

function attachSlowingRunawayButton(buttonId, statusId, destination, key) {
  const button = document.getElementById(buttonId);
  const status = document.getElementById(statusId);
  const area = button.closest(".gimmick-area");

  if (state.nextClicks[key] === undefined) {
    state.nextClicks[key] = 0;
  }

  function moveButton() {
    state.nextClicks[key] += 1;

    button.classList.add("absolute");

    const maxX = Math.max(0, area.clientWidth - button.offsetWidth - 20);
    const maxY = Math.max(0, area.clientHeight - button.offsetHeight - 20);

    // It runs away less and less each time she tries.
    const attempts = state.nextClicks[key];
    const slowFactor = Math.max(0.18, 1 - attempts * 0.14);

    const x = 10 + Math.random() * maxX * slowFactor;
    const y = 60 + Math.random() * Math.max(20, maxY - 40) * slowFactor;

    button.style.left = `${x}px`;
    button.style.top = `${y}px`;

    status.textContent = "It ran away. Try catching it.";
  }

  button.addEventListener("mouseenter", moveButton);

  button.addEventListener("click", () => {
    status.textContent = "You caught it.";
    goTo(destination);
  });
}

function renderThreeButtons() {
  app.innerHTML = `
    <main class="screen">
      ${topbar("Puzzle 4", "Three Buttons")}
      <div class="grid-two">
        <section class="big-card">
          <h2>Figure out what to click</h2>
          <p>${escapeHtml(CFG.threeButtonPuzzle.instruction)}</p>
          ${photoGrid("threeButtons")}
          <div class="three-button-grid">
            ${CFG.threeButtonPuzzle.buttons.map(label => `<button class="puzzle-choice" data-choice="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join("")}
          </div>
          <div class="sequence-display" id="sequenceDisplay">Clicked: none yet</div>
          <div class="btn-row">
            <button class="secondary-btn" id="showAllHints">Hint icon</button>
            <button class="ghost-btn" id="clearSequence">Clear clicks</button>
          </div>
          <p class="status" id="threeButtonStatus"></p>
        </section>
        <section class="big-card" id="threeButtonReward" style="display:none;">
          <h2>You solved the last puzzle</h2>
          <p>Click the <span class="click-word-next" id="realNextWord">next</span> button.</p>
          <div class="btn-row">
            <button class="decoy-next" id="decoyNext">Next</button>
          </div>
          <p class="status" id="decoyStatus"></p>
        </section>
      </div>
    </main>
  `;

  document.querySelectorAll(".puzzle-choice").forEach(button => {
    button.addEventListener("click", () => chooseThreeButton(button.dataset.choice));
  });
  document.getElementById("showAllHints").addEventListener("click", showAllLetterHints);
  document.getElementById("clearSequence").addEventListener("click", () => {
    state.threeButtons.clicked = [];
    updateThreeButtonDisplay();
  });
}

function chooseThreeButton(choice) {
  if (state.threeButtons.solved) return;
  state.threeButtons.clicked.push(choice);
  const expected = CFG.threeButtonPuzzle.correctOrder;
  const status = document.getElementById("threeButtonStatus");

  const soFarCorrect = state.threeButtons.clicked.every((value, index) => value === expected[index]);
  if (!soFarCorrect) {
    status.textContent = "That order was not quite right. Try again from the beginning.";
    state.threeButtons.clicked = [];
    updateThreeButtonDisplay();
    return;
  }

  if (state.threeButtons.clicked.length === expected.length) {
    state.threeButtons.solved = true;
    status.textContent = "Correct order.";
    document.getElementById("threeButtonReward").style.display = "block";
    document.getElementById("realNextWord").addEventListener("click", () => goTo("finale"));
    document.getElementById("decoyNext").addEventListener("click", () => {
      document.getElementById("decoyStatus").textContent = "";
    });
    showConfetti();
  }

  updateThreeButtonDisplay();
}

function updateThreeButtonDisplay() {
  const display = document.getElementById("sequenceDisplay");
  if (!display) return;
  display.textContent = state.threeButtons.clicked.length
    ? `Clicked: ${state.threeButtons.clicked.join(" → ")}`
    : "Clicked: none yet";
}

function showAllLetterHints() {
  const hints = [
    "Letter 1 clue: HEART",
    "Letter 2 clue: HOME",
    "Letter 3 clue: STAR"
  ];
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Hints">
      <h2>All three clues</h2>
      ${hints.map(hint => `<p>${escapeHtml(hint)}</p>`).join("")}
      <div class="btn-row"><button id="closeHints">Close hints</button></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  document.getElementById("closeHints").addEventListener("click", () => backdrop.remove());
}

function renderFinale() {
  app.innerHTML = `
    <main class="screen">
      <section class="big-card">
        <p class="kicker">Finale</p>
        <h1 class="final-title">You earned your present</h1>
        ${CFG.finaleMessage.map(line => `<p style="text-align:center; font-size:1.15rem;">${escapeHtml(line)}</p>`).join("")}
        ${photoGrid("finale")}
        <div class="btn-row" style="justify-content:center;">
          <button class="ghost-btn" id="resetBtn">Play again</button>
        </div>
      </section>
    </main>
  `;
  showConfetti();
}

render();
