const { Client } = require('ssh2');
const {SecretManagerServiceClient} = require("@google-cloud/secret-manager");
const keyFile = "functions/verbatim-d8a20-e0b367ec9888.json";
const {Client: SCPClient} = require("node-scp");

const secretManagerClient = new SecretManagerServiceClient({
  keyFilename: keyFile,
});

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
      console.log("waiting to connect")
      const c = await new SCPClient(remote_server)
      console.log("connected, attempting to upload")
      await c.uploadFile(file_path, destination_path)
      console.log("uploaded")
      c.close()
    } catch (e) {
      console.log(e)
    }
}

const secretName = "verbatim-ssh-key";
const id = "648639423919";

const pathToKey = `projects/${id}/secrets/${secretName}/versions/latest`;

async function connect() {
    try {
      const sshKey = await getSecret(pathToKey);

      const sshConfig = {
        host: "132.249.242.149",
        username: "ubuntu",
        port: 22,
        privateKey: sshKey,
      };
      console.log(sshKey);
      //const client = await SCPClient(sshConfig)
      await send_file_using_async_await("/home/bzliang/SDSC/verbatim/firebase-backend/functions/sshtest.js", "/home/ubuntu/audio_recordings/test.js", sshConfig)
      //const result = await client.list("/home/ubuntu/audio_recordings")
      // console.log(result);
      console.log("scp done")

      const sshClient = new Client();
      console.log("connecting");
      sshClient.on("ready", () => {
        
        console.log("sourcing");
        sshClient.exec(`./run_source.sh`, {pty: true}, (err, stream) => {
          if (err) throw err;
          stream.on("close", (code, signal) => {
            console.log(`RC file sourced, exit code: ${code}`);
            sshClient.end();
          }).on("data", (data) => {
            console.log("STDOUT:", data.toString());
          }).stderr.on("data", (data) => {
            console.log("STDERR:", data.toString());
          });
        });
      }).on("error", (err) => {
        console.error("SSH connection error:", err);
      }).connect(sshConfig);

        
    } catch(err) {
        console.error("Error in connect function:", err);
    }
}

connect();
