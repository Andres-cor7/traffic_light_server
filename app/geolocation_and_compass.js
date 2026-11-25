import { useCallback } from "react";

export function geolocation_detector(callback) {
    let lat = 0.0;
    let lon = 0.0;

    navigator.geolocation.watchPosition(
        (pos) => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;

            callback ([lat, lon]);
        },
        (error) => {
            console.log("Error al recuperar los datos del GPS:", error.message);
        }
    );
}

export function compass(callback){
    window.addEventListener("deviceorientation", (event) => {

        let alpha = event.alpha; // rotacion de 0° a 360°
        let beta = event.beta; // inclicanción hacia delante y atras
        let gamma = event.gamma; // inicliación hacia los lados

        callback ([alpha, beta, gamma])
    })
}