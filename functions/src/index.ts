import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import * as express from "express";
import * as cors from "cors";

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://grafica-goty.firebaseio.com"
});

const db = admin.firestore();

export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
    mensaje: "Hola mundo desde firebase function automatico"
  });
});

export const getGoty = functions.https.onRequest(async (request, response) => {
  // const nombre = request.query.nombre || 'Sin nombre'; Para recibir parametros

  const gotyRef = db.collection("goty"); // Referencia a la base de datos

  const snapshot = await gotyRef.get(); // Recibe la info de la referencia, No es una funcion asincrona por eso se usa el async await, para esperar que se regrese informacion del snapshot

  const juegos = snapshot.docs.map(doc => doc.data());
  response.json(juegos);
});

// Express

const app = express();

app.use(cors({ origin: true }));

app.get("/goty", async (req, res) => {
  // const nombre = request.query.nombre || 'Sin nombre'; Para recibir parametros

  const gotyRef = db.collection("goty"); // Referencia a la base de datos

  const snapshot = await gotyRef.get(); // Recibe la info de la referencia, No es una funcion asincrona por eso se usa el async await, para esperar que se regrese informacion del snapshot

  const juegos = snapshot.docs.map(doc => doc.data());
  res.json(juegos);
});

app.post("/goty/:id", async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection("goty").doc(id);
  const gameSnapshot = await gameRef.get();

  if (!gameSnapshot.exists)
    return res
      .status(404)
      .json({ ok: false, mensaje: "No existe un juego con el id" + id });
  else {
      const antes = gameSnapshot.data() || { vote: 0};

      await gameRef.update({
          vote: antes.vote + 1
      });

      return res.json({
          ok: true,
          mensaje: `Gracias por tu voto ${antes.name}`
      })
  }
});

export const api = functions.https.onRequest(app);
