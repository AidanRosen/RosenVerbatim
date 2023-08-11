/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {SecretManagerServiceClient} = require("@google-cloud/secret-manager");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
// const admin = require("firebase-admin");
const path = require("path");
const formidableMiddleware = require("formidable-serverless");
const util = require("util");
const Client = require("ssh2").Client;
const {Client: SCPClient} = require("node-scp");
const keyFile = "verbatim-d8a20-e0b367ec9888.json";
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors({origin: true}));
const secretManagerClient = new SecretManagerServiceClient({
  keyFilename: keyFile,
});

// Create and deploy yo ur first functions
// https://firebase.google.com/docs/functions/get-started

/**
 * gets the ssh key in Google Cloud Secret Manager
 * @param {*} pathToKey The path to the key in google cloud
 * @return {*} the ssh key retrieved from google cloud
 */
async function getSecret(pathToKey) {
  try {
    const [version] = await secretManagerClient.accessSecretVersion({
      name: pathToKey,
    });

    const sshKey = version.payload.data.toString("utf8");
    return sshKey;
  } catch (err) {
    console.error("Error retrieving SSH key from Secret Manager:", err);
    throw err;
  }
}

/**
 * Sends file in the express backend to the cloud instance through scp
 * @param {*} filePath the temporary file path in the express backend
 * @param {*} dest the destination location to send the file to in the instance
 * @param {*} remoteServer the config for the remote server to log in
 */
async function sendFileUsingAsyncAwait(filePath, dest, remoteServer) {
  try {
    const c = await new SCPClient(remoteServer);
    await c.uploadFile(filePath, dest);
    console.log("file sent");
    c.close();
  } catch (e) {
    console.log(e);
  }
}

/**
 * Parses Form data for any file uploads using formidableMiddleWare
 * @param {*} req the request made
 * @param {*} res response object to send responses
 * @return {Promise} A Promise that resolves with an object
 * containing the parsed form fields and files.
 */
async function parseForm(req, res) {
  return new Promise((resolve, reject) => {
    const form = new formidableMiddleware.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({fields, files});
    });
  });
}

let localPath = "";
app.post("/upload", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  // Name and id of the secret key in secret manager
  const secretName = "verbatim-ssh-key";
  const id = "648639423919";

  // Create the path to retrieve the SSH key from Google secret manager.
  const pathToKey = `projects/${id}/secrets/${secretName}/versions/latest`;

  // Retrieve SSH private key from secret manager using 'getSecret' function.
  const sshKey = await getSecret(pathToKey);

  // Set up the SSH configuration object for connecting to the remote server.
  const sshConfig = {
    host: "132.249.242.149", // IP addrerss of remote server
    username: "ubuntu", // Remote Username
    port: 22,
    privateKey: sshKey, // Private SSH Key
  };

  // Checks if the API endpoint is a POST request to upload
  if (req.url == "/upload" && req.method.toLowerCase() == "post") {
    try {
      // Parse the form data from the request using the 'parseForm' function.
      const {fields, files} = await parseForm(req);

      // Respond to client with success status 200 and plain text content
      res.writeHead(200, {"content-type": "text/plain"});
      res.write("received upload:\n\n");

      // Checks if uploaded file exists, if not respond with error status
      const uploadedFile = files.file;
      if (!uploadedFile) {
        return res.status(400).json({error: "No file uploaded"});
      }

      // Create destination path on the remote server, append with file name
      const destinationPath = path.join(
          "/home/ubuntu/audio_recordings/", uploadedFile.name);

      // Get the temporary local path generated from uploading to the server
      localPath = uploadedFile.path;

      // Respond to client with parsed form data
      res.end(util.inspect({fields: fields, files: files}));

      // Transfer the file using SCP to the remote server
      // using the 'sendFileUsingAsyncAwait' function.
      await sendFileUsingAsyncAwait(localPath, destinationPath, sshConfig);

      // Create new ssh client
      const sshClient = new Client();

      // Set up SSH listeners and connect to remote server
      sshClient.on("ready", () => {
        console.log("SSH Connection established...");

        /**
         * Executes a bash script on the remote server on a ssh session.
         * run_source.sh takes in two arguments, container, and destination
         * path of the file on the remote server.
         *
         * To use exec(~/run_source.sh <container name> <filePath>),
         * sources the openrc file to authenticate cloud user and then runs
         * swift upload <container name> <filePath> to upload to container.
         */
        sshClient.exec(`~/run_source.sh myContainer '${destinationPath}'`,
            (err, stream) =>{
              if (err) throw err; // Handles any errors encountered

              // Set up event listeners for the SSH command execution
              stream.on("close", (code, signal) => {
                // Once execution finishes (close) end the client session.
                console.log("RC file sourced and File uploaded");
                sshClient.end();
              }).on("data", (data) => {
                // Logs any output from the remote instance
                console.log("STDOUT:", data.toString());
              }).stderr.on("data", (data) => {
                console.log("STDERR:", data.toString());
              });
            });
      }).on("error", (err) => {
        // Handles any SSH connection errors and respond to client with error
        console.error("SSH connection error:", err);
        res.status(500).write({error: "Failed to establish SSH connection"});
      }).connect(sshConfig);
    } catch (err) {
      // Handles any errors during form parsing or file transferring
      console.error("Error during form parsing or SCP:", err);
      res.status(500).json({error: "Failed to process the upload"});
    } finally {
      // Clean up: remove tempory file on the server if it still exists
      if (localPath) {
        fs.unlinkSync(localPath);
      }
    }
    return;
  }

  // show a file upload form if not a post request or upload url
  res.writeHead(200, {"content-type": "text/html"});
  res.end(
      "<form action=\"/upload\" enctype=\"multipart/form-data\"" +
      "method=\"post\">"+
      "<input type=\"text\" name=\"title\"><br>"+
      "<input type=\"file\" name=\"upload\" multiple=\"multiple\"><br>"+
      "<input type=\"submit\" value=\"Upload\">"+
      "</form>",
  );
});

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.api = onRequest(app);
