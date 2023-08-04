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
// const busboyCons = require("busboy");
// const path = require("path");
// const os = require("os");
const formidableMiddleware = require("formidable-serverless");
const util = require("util");
const Client = require("ssh2").Client;
const {Client: SCPClient} = require("node-scp");
const keyFile = "verbatim-d8a20-e0b367ec9888.json";

const app = express();
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

async function send_file_using_async_await(file_path, destination_path, remote_server){
  try {
      const c = await new SCPClient(remote_server);
      await c.uploadFile(file_path, destination_path);
      c.close();
    } catch (e) {
      console.log(e);
    }
}

app.post("/upload", async (req, res) => {
  let localPath = null;
  if (req.url == "/upload" && req.method.toLowerCase() == "post") {
    // parse a file upload
    const form = new formidableMiddleware.IncomingForm();

    form.parse(req, (err, fields, files) => {
      res.writeHead(200, {"content-type": "text/plain"});
      res.write("received upload:\n\n");

      const uploadedFile = files.file;
      if (!uploadedFile) {
        return res.status(400).json({error: "No file uploaded"});
      }
      localPath = uploadedFile.path;
      res.end(util.inspect({fields: fields, files: files}));
    });

    const secretName = "verbatim-ssh-key";
    const id = "648639423919";

    const pathToKey = `projects/${id}/secrets/${secretName}/versions/latest`;

    const sshKey = await getSecret(pathToKey);

    const sshConfig = {
      host: "132.249.242.149",
      username: "ubuntu",
      port: 22,
      privateKey: sshKey,
    };

    const sshClient = new Client();
    console.log("connecting");
    sshClient.on("ready", () => {
      if (localPath === null) {
        return res.status(400).json({error: "Error uploading file to cloud"});
      }

      console.log("sourcing");
      // const rcPath = "rds-intern-su23-tearabytes-openrc.sh";
      sshClient.exec(`~/run_source.sh`, (err, stream) => {
        if (err) throw err;
        stream.on("close", (code, signal) => {
          console.log("RC file sourced");
          sshClient.end();
        }).on("data", (data) => {
          console.log("STDOUT:", data.toString());
        }).stderr.on("data", (data) => {
          console.log("STDERR:", data.toString());
        });
      });
    }).on("error", (err) => {
      console.error("SSH connection error:", err);
      res.status(500).write({error: "Failed to establish SSH connection"});
    }).connect(sshConfig);

    return;
  }

  // show a file upload form
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
