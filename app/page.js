'use client';

import { compass, geolocation_detector } from "./geolocation_and_compass";
import { useState, useEffect, useRef } from "react"; // AÑADIDO: useRef

export default function Home() {
  const [coord, setCoords] = useState([0.0,0.0]);
  const [dir, setDir] = useState([0.0,0.0,0.0])
  const [orientation, setOrien] = useState(null);

  // AÑADIDO: estado para el envío al backend
  const [plate, setPlate] = useState("");
  const [sending, setSending] = useState(false);
  const [resp, setResp] = useState("");
  const latest = useRef({ coord, dir, orientation });

  useEffect(() => {
    geolocation_detector(setCoords);
  }, []);

  useEffect(() => {
    compass(setDir);
  }, []);

  // AÑADIDO: guarda siempre los últimos valores para el envío
  useEffect(() => {
    latest.current = { coord, dir, orientation };
  });

  // AÑADIDO: envía la posición y el rumbo cada segundo mientras "sending" esté activo
  useEffect(() => {
    if (!sending) return;
    let stopped = false;
    let timer;
    async function tick() {
      const { coord, dir, orientation } = latest.current;
      if (dir[0] == null || (coord[0] === 0 && coord[1] === 0)) {
        setResp("Esperando GPS y brújula…");
      } else {
        // misma "Rotación" que se muestra en pantalla, convertida a rumbo horario (0-360, 0 = norte)
        const rotation = orientation == null ? dir[0] : (dir[0] - orientation + 360) % 360;
        const heading = (360 - rotation) % 360;
        try {
          const t0 = performance.now();
          const res = await fetch("/api/position", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              license_plates: plate.trim().toUpperCase(),
              lat: coord[0],
              lon: coord[1],
              heading,
            }),
            signal: AbortSignal.timeout(4000),
          });
          const txt = await res.text(); // AÑADIDO
setResp(res.status + " " + txt + " (" + Math.round(performance.now() - t0) + " ms de latencia)"); // AÑADIDO
        } catch (e) {
          setResp("Sin conexión con el servidor");
        }
      }
      if (!stopped) timer = setTimeout(tick, 1000);
    }
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }, [sending, plate]);

  function calibrate_compass() {
    setOrien(dir[0]);
  }
  
  return (
    <div>
      <div>
          <title>GPS Ambulancia</title>
          <div style={{textAlign: 'center'}}>
              <br />
              <br />
              <img src = "https://i.pinimg.com/originals/68/f7/06/68f70659ffa1c253817619fcd559ea9d.jpg" 
              height = "200px" width="230px" alt = "Foto de Ambulancia"/>
          </div>
      </div>
      <div>
          <div style={{textAlign: 'center'}}>
              <h1>GPS Ambulancia</h1>
              <br />
              <p style={{color: 'red'}}>
                <br />
                LATITUD | LONGITUD 
              </p>
              <p>
                {coord[0] + " | " + coord[1]}
                {console.log(coord[0])}
                {console.log(coord[1])}
                <br />
              </p>
              <p style={{color: 'rebeccapurple'}}>
                <br />
                Rotación
              </p>
              <p>
                {(() => {
                  if (orientation == null) {
                    return dir[0];
                  }
                  else {
                    return (dir[0] - orientation + 360) % 360; // + 360 para evitar casos negativos y el % lo mantiene dentro del rango de 360°
                  }
                })()}
                <br />
                <br />
              </p>
              <button onClick={calibrate_compass}>
                Calibrar Brujula
              </button>

              {/* AÑADIDO: placa y botón de envío */}
              <br />
              <br />
              <input
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                disabled={sending}
                maxLength={10}
                placeholder="Placa del vehículo"
              />
              <br />
              <br />
              <button onClick={() => setSending(!sending)} disabled={!sending && !plate.trim()}>
                {sending ? "Detener envío" : "Iniciar envío"}
              </button>
              <p>{resp}</p>
          </div>

      </div>
    </div>
  );
}