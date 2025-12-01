// src/pages/Aproximacion.jsx
import React, { useState, useEffect } from "react";
import "./Aproximacion.css";

/*
  Fuente base: fragmentos de "Aproximación de números decimales" (PDF subido).
  Archivo original (local): /mnt/data/mates-6c2ba.pdf

*/

const PRECISIONS = [
  { label: "Unidad", digits: 0 },
  { label: "Décima", digits: 1 },
  { label: "Centésima", digits: 2 },
];

// utilidades
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomDecimal(maxInt = 9) {
  // genera números con hasta 3 decimales, rango amigable para primaria
  const integer = randInt(0, maxInt);
  const decimals = randInt(0, 999).toString().padStart(3, "0");
  // convertir a número con hasta 3 decimales
  return parseFloat(`${integer}.${decimals}`);
}
function roundTo(n, digits) {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}
function getKeyDigit(n, digits) {
  const s = n.toFixed(3); // representamos con 3 decimales para visualizar
  const idx = s.indexOf(".") + digits + 1;
  return idx < s.length ? parseInt(s[idx], 10) : 0;
}

// componente
export default function Aproximacion() {
  const [exercises, setExercises] = useState([]);
  const [matchGame, setMatchGame] = useState([]); // pares para emparejar
  const [matchAnswers, setMatchAnswers] = useState({});
  const [quiz, setQuiz] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  
  // NUEVO ESTADO para APIs
  const [apiStatus, setApiStatus] = useState({
    notification: "pendiente", // 'denied', 'granted', 'default', 'error'
    distanceKm: null, // distancia calculada
  });

  // al cargar: generar ejercicios iniciales y ejecutar la lógica de PWA
  useEffect(() => {
    generateExercises(6);
    generateMatchGame(4);
    
    // Lógica para solicitar permisos de Notificación
    // 1. Notificaciones
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setApiStatus(prev => ({ ...prev, notification: permission }));
        if (permission === "granted") {
          // Enviar una notificación de bienvenida si el usuario acepta
          new Notification("🎉 ¡Bienvenido a Aproximación!", {
            body: "Ya puedes recibir recordatorios y tips de estudio.",
            icon: "/icon-192x192.png", // Asumiendo un ícono en la raíz
          });
        }
      }).catch(error => {
        console.error("Error al solicitar permiso de notificación:", error);
        setApiStatus(prev => ({ ...prev, notification: 'error' }));
      });
    }
  }, []); // El array vacío asegura que solo se ejecute al montar

  // Generadores (el resto de funciones se mantienen igual)
  function generateExercises(count = 6) {
    // ... [código de generateExercises] ...
    const arr = [];
    for (let i = 0; i < count; i++) {
      const number = randomDecimal(20); // pequeños para niños
      const precisionObj = PRECISIONS[randInt(0, PRECISIONS.length - 1)];
      arr.push({
        id: `ex-${Date.now()}-${i}`,
        number: Number(number.toFixed(3)),
        precision: precisionObj,
        user: "",
        feedback: null,
      });
    }
    setExercises(arr);
  }

  function generateMatchGame(pairs = 4) {
    // ... [código de generateMatchGame] ...
    const items = [];
    for (let i = 0; i < pairs; i++) {
      const number = Number(randomDecimal(12).toFixed(3));
      const prec = PRECISIONS[randInt(0, PRECISIONS.length - 1)];
      const correct = roundTo(number, prec.digits);
      items.push({
        id: `m-${i}`,
        number,
        precision: prec,
        correct,
      });
    }
    // mezclamos derecha/izquierda
    const left = items.map((it) => ({ ...it, side: "left" }));
    const right = items.map((it) => ({
      ...it,
      side: "right",
      // mostrar la respuesta (mezclada)
    }));
    // Shuffle right answers
    for (let i = right.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [right[i], right[j]] = [right[j], right[i]];
    }
    // juntar y asignar ids para botones
    const combined = { left, right };
    setMatchGame(combined);
    setMatchAnswers({});
  }

  function generateQuiz() {
    // ... [código de generateQuiz] ...
    const q = Array.from({ length: 5 }, (_, i) => {
      const number = Number(randomDecimal(50).toFixed(3));
      const precision = PRECISIONS[randInt(0, PRECISIONS.length - 1)];
      return {
        id: `q-${i}-${Date.now()}`,
        number,
        precision,
        user: "",
        correct: roundTo(number, precision.digits),
      };
    });
    setQuiz(q);
    setQuizResult(null);
  }

  // acciones (se mantienen igual)
  function handleCheckExercise(ex) {
    // ... [código de handleCheckExercise] ...
    const precision = ex.precision.digits;
    const correct = roundTo(ex.number, precision);
    const parsed = parseFloat(ex.user);
    let feedback;
    if (isNaN(parsed)) {
      feedback = { ok: false, text: "Escribe un número" };
    } else if (
      Number(parsed.toFixed(precision)) === Number(correct.toFixed(precision))
    ) {
      feedback = {
        ok: true,
        text: `✅ Correcto. Vecino: ${getKeyDigit(ex.number, precision)}`,
      };
    } else {
      const kd = getKeyDigit(ex.number, precision);
      const hint = kd >= 5 ? "Debías SUBIR ↑" : "Debías MANTENER ↔";
      feedback = {
        ok: false,
        text: `❌ Incorrecto. ${hint}. Correcto: ${correct.toFixed(precision)}`,
      };
    }
    setExercises((prev) =>
      prev.map((p) => (p.id === ex.id ? { ...p, feedback } : p))
    );
  }

  function handleMatchSelect(side, itemId) {
    // ... [código de handleMatchSelect] ...
    if (side === "left") {
      setMatchAnswers((prev) => ({ ...prev, left: itemId }));
    } else {
      setMatchAnswers((prev) => ({ ...prev, right: itemId }));
    }
  }

  function checkMatch() {
    // ... [código de checkMatch] ...
    const leftId = matchAnswers.left;
    const rightId = matchAnswers.right;
    if (!leftId || !rightId) {
      alert("Selecciona un número y una respuesta para comparar.");
      return;
    }
    // buscar items
    const leftItem = matchGame.left.find((l) => l.id === leftId);
    const rightItem = matchGame.right.find((r) => r.id === rightId);
    if (!leftItem || !rightItem) return;
    const correct =
      Number(rightItem.correct) ===
      Number(roundTo(leftItem.number, leftItem.precision.digits));
    if (correct) {
      alert("¡Bien! Son pareja correcta 🎉");
      // eliminar la pareja para seguir jugando
      const remainingLeft = matchGame.left.filter((l) => l.id !== leftId);
      const remainingRight = matchGame.right.filter((r) => r.id !== rightId);
      setMatchGame({ left: remainingLeft, right: remainingRight });
      setMatchAnswers({});
    } else {
      alert("No coincide. Prueba otra combinación ✍️");
    }
  }

  function submitQuiz() {
    // ... [código de submitQuiz] ...
    let correct = 0;
    const wrong = [];

    quiz.forEach((q, index) => {
      const userNumber = Number(q.user);
      const isCorrect =
        !isNaN(userNumber) &&
        Number(userNumber.toFixed(q.precision.digits)) ===
          Number(q.correct.toFixed(q.precision.digits));

      if (isCorrect) {
        correct++;
      } else {
        wrong.push({
          questionNumber: index + 1,
          number: q.number.toFixed(3),
          precision: q.precision.label,
          user: q.user || "—",
          correct: q.correct.toFixed(q.precision.digits),
        });
      }
    });

    setQuizResult({
      correct,
      total: quiz.length,
      wrong,
    });
  }

  // render helpers (se mantienen igual)
  function ChalkNumber({ n }) {
    // representa el número en estilo tiza con resalte del vecino mágico para la unidad
    return (
      <div className="chalk-num">
        <div className="chalk-big">{n.toFixed(3)}</div>
      </div>
    );
  }

  function InteractiveCell({ value, label, highlight }) {
    const [show, setShow] = React.useState(false);

    return (
      <div
        className={`cell ${highlight ? "highlight" : ""}`}
        onClick={() => setShow((v) => !v)}
      >
        <div className="cell-value">{value}</div>

        {show && <div className="cell-pop">{label}</div>}
      </div>
    );
  }

  return (
    <div className="chalk-page">
      <div className="chalk-header">
        <h1 className="chalk-title">📋 Aproximación — Pizarrón interactivo</h1>
        <p className="chalk-sub">
          (Basado en el libro de primaria — sección: aproximación de decimales){" "}
        </p>
        <small className="chalk-source">
          Fuente local: <code>/mnt/data/mates-6c2ba.pdf</code>
        </small>
      </div>

      {/* NUEVA SECCIÓN DE ESTADO DE APIS */}
      <section className="chalk-card api-status">
        <h2 className="section-title">🔌 Estado de APIs y Sensores PWA</h2>
        <div className="api-info">
          {/* NOTIFICACIONES */}
          <div className="api-item">
            <strong>Notificaciones:</strong>{" "}
            <span className={`status-${apiStatus.notification}`}>
              {apiStatus.notification === "granted" ? "✅ Permitido (Recibirás consejos)" :
               apiStatus.notification === "denied" ? "🚫 Denegado (No habrá tips)" :
               "🟡 Pendiente/No soportado"}
            </span>
          </div>
        </div>
      </section>
      {/* FIN NUEVA SECCIÓN */}

      {/* EXPLICACIÓN (la mantienes) */}
      <section className="chalk-card">
        <h2 className="section-title">¿Qué es aproximar?</h2>

        <p className="section-text">
          Aproximar un número significa escribirlo con un valor más sencillo sin
          cambiar demasiado su magnitud. Para hacerlo se observa la cifra que
          está en la posición siguiente a la que queremos aproximar. Dependiendo
          de si esa cifra es menor o mayor que 5, el número se mantiene o
          aumenta.
        </p>

        {/* -------------------------------------------------- */}
        {/* APROXIMACIÓN A LAS UNIDADES */}
        {/* -------------------------------------------------- */}
        <h3 className="small-title">Aproximación a las unidades</h3>

        <p className="section-text">
          Para aproximar a las <strong>unidades</strong>, observa la cifra de
          las
          <strong> décimas</strong>:
        </p>

        <ul className="section-list">
          <li>
            Si la cifra de las décimas es <strong>mayor o igual que 5</strong>,
            aumenta en 1 las unidades.
          </li>
          <li>
            Si es <strong>menor que 5</strong>, las unidades se mantienen igual.
          </li>
        </ul>

        <h4 className="small-title">Ejemplo interactivo</h4>

        <p className="section-text">
          Aproxime el número <strong>12.68</strong> a las unidades.
        </p>

        {/* TABLA INTERACTIVA UNIDADES */}
        <div className="interactive-table">
          <div className="header-cell">Decenas</div>
          <div className="header-cell">Unidades</div>
          <div className="header-cell highlight-h">Décimas</div>
          <div className="header-cell">Centésimas</div>

          <InteractiveCell value="1" label="Decenas" />
          <InteractiveCell value="2" label="Unidades" />
          <InteractiveCell
            value="6"
            label="Décimas (deciden si sube o no)"
            highlight
          />
          <InteractiveCell value="8" label="Centésimas" />
        </div>

        <p className="section-text">
          La cifra que decide es la décima: <strong>6</strong>. Como es mayor o
          igual que 5, las unidades suben:
        </p>

        <div className="result-box">
          <strong>12.68 → 13</strong>
        </div>

        <br />
        <br />

        {/* -------------------------------------------------- */}
        {/* APROXIMACIÓN A LAS DÉCIMAS */}
        {/* -------------------------------------------------- */}
        <h3 className="small-title">Aproximación a las décimas</h3>

        <p className="section-text">
          Para aproximar a las <strong>décimas</strong>, observa la cifra de las
          <strong> centésimas</strong>:
        </p>

        <ul className="section-list">
          <li>
            Si la centésima es <strong>mayor o igual que 5</strong>, aumenta en
            1 la décima.
          </li>
          <li>
            Si es <strong>menor que 5</strong>, la décima se mantiene.
          </li>
        </ul>

        <h4 className="small-title">Ejemplo interactivo</h4>

        <p className="section-text">
          Aproxime <strong>4.37</strong> a las décimas.
        </p>

        {/* TABLA INTERACTIVA DÉCIMAS */}
        <div className="interactive-table">
          <div className="header-cell">Unidades</div>
          <div className="header-cell highlight-h">Décimas</div>
          <div className="header-cell">Centésimas</div>
          <div className="header-cell">Milésimas</div>

          <InteractiveCell value="4" label="Unidades" />
          <InteractiveCell value="3" label="Décimas" />
          <InteractiveCell value="7" label="Centésimas (deciden)" highlight />
          <InteractiveCell value="1" label="Milésimas" />
        </div>

        <p className="section-text">
          La centésima es <strong>7</strong> → mayor que 5, por lo tanto subimos
          la décima:
        </p>

        <div className="result-box">
          <strong>4.37 → 4.4</strong>
        </div>

        <br />
        <br />

        {/* -------------------------------------------------- */}
        {/* APROXIMACIÓN A LAS CENTÉSIMAS */}
        {/* -------------------------------------------------- */}
        <h3 className="small-title">Aproximación a las centésimas</h3>

        <p className="section-text">
          Para aproximar a las <strong>centésimas</strong>, observa la cifra de
          las
          <strong> milésimas</strong>:
        </p>

        <ul className="section-list">
          <li>
            Si la milésima es <strong>mayor o igual que 5</strong>, aumenta la
            centésima.
          </li>
          <li>
            Si es <strong>menor que 5</strong>, la centésima se mantiene.
          </li>
        </ul>

        <h4 className="small-title">Ejemplo interactivo</h4>

        <p className="section-text">
          Aproxime <strong>8.426</strong> a las centésimas.
        </p>

        {/* TABLA INTERACTIVA CENTÉSIMAS */}
        <div className="interactive-table">
          <div className="header-cell">Unidades</div>
          <div className="header-cell">Décimas</div>
          <div className="header-cell highlight-h">Centésimas</div>
          <div className="header-cell">Milésimas</div>

          <InteractiveCell value="8" label="Unidades" />
          <InteractiveCell value="4" label="Décimas" />
          <InteractiveCell value="2" label="Centésimas" />
          <InteractiveCell value="6" label="Milésimas (deciden)" highlight />
        </div>

        <p className="section-text">
          La milésima es <strong>6</strong> → mayor que 5. Subimos la centésima:
        </p>

        <div className="result-box">
          <strong>8.426 → 8.43</strong>
        </div>

        <br />
        <br />

        <p className="section-text">
          Con estas reglas y ejemplos podrás aproximar cualquier número según la
          unidad, décima o centésima que necesites.
        </p>
      </section>

      {/* EJERCICIOS VARIADOS */}
      <section className="chalk-card">
        <h2 className="section-title">Ejercicios prácticos ✍️</h2>

        <div className="exercise-controls">
          <button className="btn" onClick={() => generateExercises(6)}>
            Generar 6 ejercicios
          </button>
          <button className="btn ghost" onClick={() => generateExercises(10)}>
            Generar 10
          </button>
        </div>

        <div className="exercise-list">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className={`exercise-item ${
                ex.feedback ? (ex.feedback.ok ? "ok" : "bad") : ""
              }`}
            >
              <div className="ex-left">
                <div className="ex-number">
                  <ChalkNumber n={ex.number} />
                  <div className="precision-badge">{ex.precision.label}</div>
                </div>
              </div>

              <div className="ex-right">
                <input
                  type="number"
                  step="any"
                  className="chalk-input"
                  placeholder={`Aprox. a ${ex.precision.label}`}
                  value={ex.user}
                  onChange={(e) =>
                    setExercises((prev) =>
                      prev.map((p) =>
                        p.id === ex.id ? { ...p, user: e.target.value } : p
                      )
                    )
                  }
                />
                <button
                  className="btn small"
                  onClick={() => handleCheckExercise(ex)}
                >
                  Comprobar
                </button>

                <div
                  className={`feedback ${
                    ex.feedback ? (ex.feedback.ok ? "ok" : "bad") : ""
                  }`}
                >
                  {ex.feedback ? ex.feedback.text : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MATCH GAME: emparejar número <-> aproximación */}
      <section className="chalk-card">
        <h2 className="section-title">
          Juego: Empareja el número con su aproximación 🎯
        </h2>
        <p className="section-text">
          Selecciona un número (izquierda) y luego su respuesta (derecha).
        </p>

        <div className="match-game">
          <div className="match-col">
            <h4>Números</h4>
            {matchGame.left?.length ? (
              matchGame.left.map((l) => (
                <button
                  key={l.id}
                  className={`match-btn ${
                    matchAnswers.left === l.id ? "selected" : ""
                  }`}
                  onClick={() => handleMatchSelect("left", l.id)}
                >
                  {l.number.toFixed(3)} → ({l.precision.label})
                </button>
              ))
            ) : (
              <p className="small">Has emparejado todos. Genera de nuevo.</p>
            )}
          </div>

          <div className="match-col">
            <h4>Respuestas</h4>
            {matchGame.right?.length ? (
              matchGame.right.map((r) => (
                <button
                  key={r.id}
                  className={`match-btn ${
                    matchAnswers.right === r.id ? "selected" : ""
                  }`}
                  onClick={() => handleMatchSelect("right", r.id)}
                >
                  {Number(r.correct).toFixed(r.precision?.digits ?? 0)}
                </button>
              ))
            ) : (
              <p className="small">No quedan respuestas.</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={checkMatch}>
            Comprobar pareja
          </button>
          <button
            className="btn ghost"
            onClick={() => generateMatchGame(4)}
            style={{ marginLeft: 8 }}
          >
            Regenerar juego
          </button>
        </div>
      </section>

      {/* QUIZ */}
      <section className="chalk-card">
        <h2 className="section-title">
          Quiz final — Pon a prueba lo aprendido 🏁
        </h2>
        <p className="section-text">
          Genera 5 preguntas; responde y pulsa "Enviar quiz".
        </p>

        <div style={{ marginBottom: 10 }}>
          <button className="btn" onClick={generateQuiz}>
            Generar quiz
          </button>
        </div>

        {quiz.length > 0 && (
          <>
            <div className="quiz-list">
              {quiz.map((q, idx) => (
                <div key={q.id} className="quiz-row">
                  <div className="quiz-question">
                    {idx + 1}. Redondea <strong>{q.number.toFixed(3)}</strong> a{" "}
                    {q.precision.label}
                  </div>
                  <input
                    type="number"
                    step="any"
                    className="chalk-input"
                    value={q.user}
                    onChange={(e) =>
                      setQuiz((prev) =>
                        prev.map((p) =>
                          p.id === q.id ? { ...p, user: e.target.value } : p
                        )
                      )
                    }
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <button className="btn" onClick={submitQuiz}>
                Enviar quiz
              </button>
            </div>

            {quizResult && (
              <div className="quiz-result">
                <strong>Resultado: </strong> {quizResult.correct} /{" "}
                {quizResult.total} ✅
                <div className="final-comment">
                  {quizResult.correct === quizResult.total
                    ? "¡Perfecto! No fallaste ninguna 🎉"
                    : "Aquí están las que tuviste mal para que puedas revisarlas:"}
                </div>
                {/* LISTADO DE ERRORES */}
                {quizResult.wrong.length > 0 && (
                  <div className="wrong-list">
                    {quizResult.wrong.map((w, i) => (
                      <div key={i} className="wrong-item">
                        ❌ <strong>Pregunta {w.questionNumber}:</strong>
                        <br />
                        Número: <strong>{w.number}</strong>
                        <br />A aprox.: <strong>{w.precision}</strong>
                        <br />
                        Tu respuesta: <strong>{w.user}</strong>
                        <br />
                        Correcto era: <strong>{w.correct}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="chalk-footer">
        <small>
          Recurso educativo — sección: Aproximación (PDF local:
          /mnt/data/mates-6c2ba.pdf).
        </small>
      </footer>
    </div>
  );
}