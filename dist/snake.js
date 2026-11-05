"use strict";
(() => {
  const dialog = document.querySelector("#chat-dialog");
  const input = document.querySelector("#chat-input");
  const title = document.querySelector("#chat-title");
  const form = document.querySelector("#chat-form");
  if (!dialog || !input || !title || !form) return;
  let active = false;
  const columns = 40;
  const rows = 24;
  const cellSize = 15;

  function openGame() {
    if (active || !dialog.open) return;
    active = true;
    input.value = "";
    const originalTitle = title.textContent;
    const hidden = [...dialog.children].filter((node) => !node.matches(".chat-header") && !node.hidden);
    const previousHeight = dialog.getBoundingClientRect().height;
    hidden.forEach((node) => { node.hidden = true; });
    const game = document.createElement("section");
    game.className = "snake-game";
    game.innerHTML = `<div class="snake-board"><canvas width="600" height="360" tabindex="0" aria-label="Snake. Utilisez les flèches du clavier ou balayez le plateau pour changer de direction."></canvas>
      <div class="snake-overlay"><p data-game-message>Choisissez une direction pour commencer.</p>
      <p>Utilisez les flèches du clavier ou balayez le plateau sur écran tactile.</p>
      <p>Appuyez sur Échap pour revenir aux questions.</p>
      <div class="snake-overlay-actions"><button type="button" data-restart hidden>Rejouer</button>
      <button type="button" data-back>Retour aux questions</button></div></div></div>
      <p class="sr-only" role="status"></p>`;
    dialog.append(game);
    dialog.classList.add("snake-active");
    const canvas = game.querySelector("canvas");
    const context = canvas.getContext("2d");
    const status = game.querySelector("[role=status]");
    const overlay = game.querySelector(".snake-overlay");
    const gameMessage = game.querySelector("[data-game-message]");
    const restart = game.querySelector("[data-restart]");
    const board = game.querySelector(".snake-board");
    let touchStart = null;
    let snake, direction, nextDirection, food, score, timer, ended;
    let best = 0;
    try { best = Number(localStorage.getItem("eri-snake-best")) || 0; } catch {}
    const vectors = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    function updateScore() {
      title.textContent = `Score : ${score} · Record : ${best}`;
    }
    function placeFood() {
      const free = [];
      for (let y = 0; y < rows; y += 1)
        for (let x = 0; x < columns; x += 1)
          if (!snake.some((cell) => cell.x === x && cell.y === y)) free.push({ x, y });
      food = free[Math.floor(Math.random() * free.length)];
    }
    function draw() {
      const colors = getComputedStyle(game);
      context.fillStyle = colors.getPropertyValue("--snake-board");
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = colors.getPropertyValue("--snake-grid");
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x <= canvas.width; x += cellSize) {
        context.moveTo(x, 0); context.lineTo(x, canvas.height);
      }
      for (let y = 0; y <= canvas.height; y += cellSize) {
        context.moveTo(0, y); context.lineTo(canvas.width, y);
      }
      context.stroke();
      context.fillStyle = colors.getPropertyValue("--snake-body");
      snake.forEach(({ x, y }) => context.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2));
      if (food) {
        context.fillStyle = colors.getPropertyValue("--snake-food");
        context.beginPath();
        context.arc((food.x + 0.5) * cellSize, (food.y + 0.5) * cellSize, 5, 0, Math.PI * 2);
        context.fill();
      }
    }
    function stop(message, lost = false) {
      clearInterval(timer);
      timer = null;
      ended = true;
      status.textContent = message;
      gameMessage.textContent = message;
      restart.hidden = !lost;
      overlay.hidden = false;
      if (lost) restart.focus({ preventScroll: true });
    }
    function tick() {
      direction = nextDirection;
      const [dx, dy] = vectors[direction];
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      const eats = food && head.x === food.x && head.y === food.y;
      const body = eats ? snake : snake.slice(0, -1);
      if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows || body.some((cell) => cell.x === head.x && cell.y === head.y)) {
        stop("Partie terminée.", true);
        return;
      }
      snake.unshift(head);
      if (eats) {
        score += 1;
        if (score > best) {
          best = score;
          try { localStorage.setItem("eri-snake-best", String(best)); } catch {}
        }
        updateScore();
        status.textContent = `Score : ${score}.`;
        placeFood();
        if (!food) stop("Bravo, la grille est remplie !");
      } else snake.pop();
      draw();
    }
    function turn(value) {
      if (ended) return;
      const [dx, dy] = vectors[value];
      const [oldX, oldY] = vectors[direction];
      if (dx === -oldX && dy === -oldY) return;
      nextDirection = value;
      if (!timer) {
        overlay.hidden = true;
        status.textContent = "À vous de jouer !";
        timer = setInterval(tick, 160);
      }
    }
    function reset() {
      clearInterval(timer);
      timer = null;
      ended = false;
      snake = [{ x: 19, y: 12 }, { x: 18, y: 12 }, { x: 17, y: 12 }];
      direction = nextDirection = "right";
      score = 0;
      placeFood();
      updateScore();
      status.textContent = "";
      gameMessage.textContent = "Choisissez une direction pour commencer.";
      restart.hidden = true;
      overlay.hidden = false;
      draw();
      canvas.focus({ preventScroll: true });
    }
    function onKey(event) {
      const keys = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (!keys[event.key]) return;
      event.preventDefault();
      turn(keys[event.key]);
    }
    function onVisibility() {
      if (document.hidden && timer) {
        clearInterval(timer);
        timer = null;
        status.textContent = "En pause. Choisissez une direction pour reprendre.";
      }
    }
    function onCancel(event) {
      event.preventDefault();
      cleanup();
    }
    function cleanup() {
      const previousHeight = dialog.getBoundingClientRect().height;
      clearInterval(timer);
      themeObserver.disconnect();
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", cleanup);
      document.removeEventListener("visibilitychange", onVisibility);
      animations.forEach((animation) => animation.cancel());
      game.remove();
      dialog.classList.remove("snake-active");
      hidden.forEach((node) => { node.hidden = false; });
      title.textContent = originalTitle;
      active = false;
      if (dialog.open) {
        input.focus({ preventScroll: true });
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches && dialog.animate) {
          animations.push(dialog.animate([
            { height: `${previousHeight}px` },
            { height: `${dialog.getBoundingClientRect().height}px` },
          ], { duration: 320, easing: "ease-in-out" }));
          hidden.forEach((node) => animations.push(node.animate([
            { opacity: 0, transform: "translateY(8px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 320, easing: "ease-out" })));
          animations.push(title.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320 }));
        }
      }
    }
    board.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || event.target.closest("button")) return;
      touchStart = { x: event.clientX, y: event.clientY };
      board.setPointerCapture(event.pointerId);
    });
    board.addEventListener("pointerup", (event) => {
      if (!touchStart) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    });
    board.addEventListener("pointercancel", () => { touchStart = null; });
    restart.addEventListener("click", reset);
    game.querySelector("[data-back]").addEventListener("click", cleanup);
    dialog.addEventListener("keydown", onKey);
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", cleanup);
    document.addEventListener("visibilitychange", onVisibility);
    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const animations = [];
    reset();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && dialog.animate) {
      animations.push(dialog.animate([
        { height: `${previousHeight}px` },
        { height: `${dialog.getBoundingClientRect().height}px` },
      ], { duration: 320, easing: "ease-in-out" }));
      animations.push(game.animate([
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 320, easing: "ease-out" }));
      animations.push(title.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320 }));
    }
  }
  input.addEventListener("input", () => {
    if (input.value.trim().toLowerCase() === "snake") openGame();
  });
  form.addEventListener("submit", (event) => {
    if (input.value.trim().toLowerCase() !== "snake") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openGame();
  }, true);
})();
