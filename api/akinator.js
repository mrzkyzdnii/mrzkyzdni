const { Akinator } = require("@aqul/akinator-api");

function serialize(aki) {
  return {
    region: "id",
    childMode: aki.childMode,
    session: aki.session,
    signature: aki.signature,
    baseUrl: aki.baseUrl,
    sid: aki.sid,
    step: aki.step,
    progress: aki.progress,
  };
}

function restore(game) {
  const aki = new Akinator({ region: "id", childMode: Boolean(game.childMode) });
  Object.assign(aki, {
    session: game.session,
    signature: game.signature,
    baseUrl: game.baseUrl,
    sid: game.sid,
    step: game.step,
    progress: game.progress,
  });
  return aki;
}

function payload(aki) {
  const game = serialize(aki);
  if (aki.isWin) {
    return {
      status: "result",
      game,
      result: {
        name: aki.sugestion_name || "Sosok tanpa nama",
        description: aki.sugestion_desc || "Sosok ini muncul dari jejak jawabanmu.",
        photo: aki.sugestion_photo || "",
      },
    };
  }
  return { status: "question", game, question: aki.question, progress: aki.progress, step: aki.step };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Gunakan POST." });

  try {
    const { action, game, answer } = req.body || {};
    if (action === "start") {
      const aki = new Akinator({ region: "id", childMode: true });
      await aki.start();
      return res.status(200).json(payload(aki));
    }
    if (!game || game.region !== "id" || !game.session || !game.signature) {
      return res.status(400).json({ code: "SESSION_INVALID", error: "Sesi permainan sudah kedaluwarsa. Mulai permainan baru." });
    }
    const aki = restore(game);
    if (action === "answer") {
      if (!Number.isInteger(answer) || answer < 0 || answer > 4) return res.status(400).json({ error: "Pilihan jawaban tidak valid." });
      await aki.answer(answer);
      return res.status(200).json(payload(aki));
    }
    if (action === "back") {
      if (aki.step > 0) await aki.cancelAnswer();
      return res.status(200).json({ ...payload(aki), atFirstQuestion: aki.step === 0 });
    }
    return res.status(400).json({ error: "Aksi tidak dikenal." });
  } catch (error) {
    console.error("Akinator API error", error);
    return res.status(502).json({ error: "Arsip pertanyaan belum bisa dijangkau. Coba lagi sebentar." });
  }
};
