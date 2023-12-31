from fastapi import FastAPI, File, UploadFile
import torch
from torch import Tensor
import io
import ffmpeg
import whisper
import numpy as np
import torchaudio
from fastapi.responses import Response
from df.enhance import enhance, init_df, load_audio, save_audio
from fastapi.middleware.cors import CORSMiddleware
#  init_df, load_audio, save_audio

app = FastAPI()

def load_audio(file: (str, bytes), sr: int = 16000):
    """
    Open an audio file and read as mono waveform, resampling as necessary

    Parameters
    ----------
    file: (str, bytes)
        The audio file to open or bytes of audio file

    sr: int
        The sample rate to resample the audio if necessary

    Returns
    -------
    A NumPy array containing the audio waveform, in float32 dtype.
    """
    
    if isinstance(file, bytes):
        inp = file
        file = 'pipe:'
    else:
        inp = None
    
    try:
        # This launches a subprocess to decode audio while down-mixing and resampling as necessary.
        # Requires the ffmpeg CLI and `ffmpeg-python` package to be installed.
        out, _ = (
            ffmpeg.input(file, threads=0)
            .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=sr)
            .run(cmd="ffmpeg", capture_stdout=True, capture_stderr=True, input=inp)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e

    return np.frombuffer(out, np.int16).flatten().astype(np.float32) / 32768.0

def post_process(
    audio: Tensor,
    dtype=torch.int16,
):
    audio = torch.as_tensor(audio)
    if audio.ndim == 1:
        audio.unsqueeze_(0)
    if dtype == torch.int16 and audio.dtype != torch.int16:
        audio = (audio * (1 << 15)).to(torch.int16)
    if dtype == torch.float32 and audio.dtype != torch.float32:
        audio = audio.to(torch.float32) / (1 << 15)
    return audio

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.post("/process")
async def postAudio(file:UploadFile = File(...)):
    print("Audio received!")
    print(file.filename)
    model, df_state, _ = init_df()
    audio, samplerate = torchaudio.load(file.file)
    print(samplerate)
    enhanced = enhance(model, df_state, audio)
    audio_tensor = post_process(enhanced)
    model = whisper.load_model("base.en")
    buffer_: bytes = io.BytesIO()
    torchaudio.save(buffer_, audio_tensor, df_state.sr(), format="wav")
    buffer_.seek(0)
    pretranscribe = load_audio(buffer_.read())
    result = model.transcribe(pretranscribe)
    print(result["text"])
    header = {"transcript": result["text"].strip()}
    return Response(content=buffer_.getvalue(), headers=header, media_type="audio/wav")


