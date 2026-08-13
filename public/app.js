const answers = [
  [0, "01", "Ya", "tepat sekali"], [1, "02", "Tidak", "bukan begitu"], [2, "03", "Tidak tahu", "masih samar"], [3, "04", "Mungkin", "bisa jadi"], [4, "05", "Mungkin tidak", "agaknya bukan"],
];
let game = null;
let busy = false;

const $ = id => document.getElementById(id);
const show = (id, visible) => $(id).classList.toggle("is-hidden", !visible);
const setMessage = (text = "", error = false) => {
  const box = $("message");
  box.textContent = text;
  box.classList.toggle("is-hidden", !text);
  box.classList.toggle("error", error);
};

async function request(payload) {
  const response = await fetch("/api/akinator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Arsip pertanyaan belum bisa dijangkau.");
    error.code = data.code;
    throw error;
  }
  return data;
}

function showRequestError(error) {
  if (error.code === "SESSION_INVALID") return reset("Sesi permainan sudah berakhir. Mulai permainan baru dari catatan pertama.");
  setMessage(error.message || "Arsip pertanyaan belum bisa dijangkau.", true);
}

function setBusy(value) {
  busy = value;
  document.querySelectorAll("button").forEach(button => { button.disabled = value; });
  if (value) $("start-button").innerHTML = "<span class='spin'>◌</span><span>Membuka arsip...</span>";
  else $("start-button").innerHTML = "<span>⌑</span><span>Mulai membaca</span><span>↗</span>";
}

function renderQuestion(data) {
  game = data.game;
  $("eyebrow").textContent = `PERTANYAAN ${String(data.step + 1).padStart(2, "0")}`;
  $("question-index").textContent = String(data.step + 1).padStart(2, "0");
  $("question-text").textContent = data.question;
  const progress = Math.round(data.progress);
  $("progress-label").textContent = `${progress}% terbaca`;
  $("progress-bar").style.width = `${Math.max(progress, 3)}%`;
  $("answer-list").innerHTML = answers.map(([value, number, label, note]) => `<button data-answer="${value}"><small>${number}</small><b>${label}</b><span>${note}</span><i>↗</i></button>`).join("");
  show("intro-view", false); show("result-view", false); show("play-view", true);
}

function renderResult(data) {
  game = data.game;
  $("eyebrow").textContent = "HASIL PEMBACAAN";
  $("result-name").textContent = data.result.name;
  $("result-description").textContent = data.result.description || "Sosok ini muncul dari jejak jawabanmu.";
  const photo = $("result-photo"), placeholder = $("portrait-placeholder");
  if (data.result.photo) { photo.src = data.result.photo; photo.alt = `Hasil tebakan: ${data.result.name}`; photo.hidden = false; placeholder.hidden = true; }
  else { photo.hidden = true; placeholder.hidden = false; }
  show("play-view", false); show("result-view", true);
}

async function start() {
  if (busy) return;
  setMessage(""); setBusy(true);
  try { renderQuestion(await request({ action: "start" })); }
  catch (error) { showRequestError(error); }
  finally { setBusy(false); }
}

async function answer(value) {
  if (busy || !game) return;
  setMessage(""); setBusy(true);
  try { const data = await request({ action: "answer", game, answer: value }); data.status === "result" ? renderResult(data) : renderQuestion(data); }
  catch (error) { showRequestError(error); }
  finally { setBusy(false); }
}

async function back() {
  if (busy || !game) return;
  if (game.step === 0) return setMessage("Ini sudah halaman pertama.");
  setMessage(""); setBusy(true);
  try { renderQuestion(await request({ action: "back", game })); }
  catch (error) { showRequestError(error); }
  finally { setBusy(false); }
}

function reset(message = "") {
  game = null; $("eyebrow").textContent = "CATATAN PERTAMA"; show("play-view", false); show("result-view", false); show("intro-view", true); setMessage(message);
}

$("start-button").addEventListener("click", start);
$("answer-list").addEventListener("click", event => { const button = event.target.closest("button[data-answer]"); if (button) answer(Number(button.dataset.answer)); });
$("back-button").addEventListener("click", back);
$("stop-button").addEventListener("click", () => reset("Arsip ditutup. Tidak ada jawaban yang disimpan."));
$("again-button").addEventListener("click", () => reset());
$("result-home").addEventListener("click", () => reset());
$("brand-home").addEventListener("click", () => reset());
window.addEventListener("keydown", event => { if (busy || !game) return; if (/^[1-5]$/.test(event.key)) answer(Number(event.key) - 1); if (event.key === "0" || event.key === "Backspace") back(); });
