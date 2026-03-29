/**
* emotiart-bridge.js
* ──────────────────
* Drop this into your frontend. It is the ONLY frontend file
* from the backend team. It handles:
*
* 1. Capturing a JPEG frame from the user's camera
* 2. POSTing the frame + transcript to the Python server
* 3. Passing the art parameters back to your canvas renderer
*
* It does NOT draw anything. It does NOT touch the DOM.
* It exposes one object: window.EmotiArtBridge
*
* ── HOW TO USE ───────────────────────────────────────────────
*
* Step 1: Import this file in your frontend.
*
* Step 2: Give it a reference to a <video> element that already
* has a camera stream attached. Your frontend owns the
* camera — this file just reads frames from it.
*
* Step 3: Call start(), passing your video element and a
* callback that receives the art output:
*
* EmotiArtBridge.start({
* videoElement: document.getElementById("my-video"),
* onResult: (artOutput) => {
* // artOutput is the full object from the Python server.
* // Pass it to your canvas renderer here.
* myCanvasRenderer.draw(artOutput);
* },
* onError: (err) => console.error(err), // optional
* intervalMs: 2500, // optional, default 2500
* serverUrl: "http://localhost:5000", // optional, default shown
* });
*
* Step 4: When Gemini Live gives you a new transcript, call:
*
* EmotiArtBridge.setTranscript("I feel nervous today");
*
* Step 5: Call stop() to end the polling loop.
*
* EmotiArtBridge.stop();
*
* ── ART OUTPUT SHAPE ─────────────────────────────────────────
* The object passed to onResult() looks like:
*
* {
* emotion: "anxious",
* intensity: 0.74,
* conflict: true,
* conflict_blend: 0.35,
* art: {
* primary: { color: "#F4A261", colorRgb: [244,162,97], shape: "dot" },
* secondary: { color: "#06AED4", colorRgb: [6,174,212], shape: "wave" },
* shapeCount: 24,
* sizeMin: 18.0,
* sizeMax: 62.0,
