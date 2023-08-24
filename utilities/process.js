import axios from "axios";

const process = async (file) => {
    const formData = new FormData();
    formData.append("file", file, "noisy.wav");
    const response = await axios.post(
        "http://132.249.242.199:8000/process",
        formData,
        {
            responseType: "blob"
        }
    );
    console.log(response);
    return response;
}

export { process };