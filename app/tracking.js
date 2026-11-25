// Rumbo de la parte trasera del teléfono a partir de alpha/beta/gamma (ejemplo de la especificación W3C).
function compassHeading(alpha, beta, gamma) {
  const x = ((beta || 0) * Math.PI) / 180;
  const y = ((gamma || 0) * Math.PI) / 180;
  const z = ((alpha || 0) * Math.PI) / 180;
  const cY = Math.cos(y), cZ = Math.cos(z), sX = Math.sin(x), sY = Math.sin(y), sZ = Math.sin(z);
  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;
  let h = Math.atan(Vx / Vy);
  if (Vy < 0) h += Math.PI;
  else if (Vx < 0) h += 2 * Math.PI;
  return (h * 180) / Math.PI;
}

// Devuelve una función para detener el GPS.
export function startGps(onPosition, onError) {
  if (!("geolocation" in navigator)) {
    onError("Este navegador no tiene geolocalización");
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (p) => onPosition(p.coords),
    (e) => onError(`GPS: ${e.message}`),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

// Devuelve (async) una función para detener la brújula.
// En iPhone debe llamarse directamente desde un toque del usuario.
export async function startCompass(onHeading, onError) {
  if (typeof DeviceOrientationEvent === "undefined") {
    onError("Este teléfono no tiene sensor de orientación");
    return () => {};
  }
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const r = await DeviceOrientationEvent.requestPermission();
      if (r !== "granted") {
        onError("Permiso de brújula denegado");
        return () => {};
      }
    } catch {
      onError("No se pudo pedir el permiso de la brújula");
      return () => {};
    }
  }
  const handler = (e) => {
    let h = null;
    if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading; // iPhone
    else if (e.absolute && e.alpha !== null) h = compassHeading(e.alpha, e.beta, e.gamma); // Android
    if (h !== null) onHeading(((h % 360) + 360) % 360);
  };
  window.addEventListener("deviceorientationabsolute", handler, true);
  window.addEventListener("deviceorientation", handler, true);
  return () => {
    window.removeEventListener("deviceorientationabsolute", handler, true);
    window.removeEventListener("deviceorientation", handler, true);
  };
}