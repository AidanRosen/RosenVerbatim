import axios from "axios";

const destutter = async (file) => {
    const formData = new FormData();
    formData.append("file", file, "noisy.wav");
    const response = await axios.post(
        "https://api.verbatim.site/destutter",
        formData,
        {
            responseType: "blob"
        }
    );
    console.log(response);
    return response;
}

export { destutter };