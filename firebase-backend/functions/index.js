/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
// const admin = require("firebase-admin");
const busboyCons = require("busboy");
const path = require("path");
// const os = require("os");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser());

// Create and deploy yo ur first functions
// https://firebase.google.com/docs/functions/get-started

app.post("/upload", (req, res) => {
  const busboy = busboyCons({headers: req.headers});
  console.log(busboy);
  // // let uploadFilePath;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const tempFilePath = path.join(".", filename);

    const writeStream = fs.createWriteStream(tempFilePath);
    file.pipe(writeStream);
    console.log(writeStream);

    // uploadFilePath = tempFilePath;
  });

  busboy.on("finish", () => {
    // Return a success response to the client
    res.json({success: true, message: "File uploaded successfully"});
  });

  busboy.on("error", (err) => {
    console.error("Error during file upload:", err);
    res.status(500).json({error: err.message});
  });

  req.pipe(busboy);
  // res.sendStatus(200);
});

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.api = onRequest(app);
