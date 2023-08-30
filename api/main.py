from fastapi import FastAPI, File, UploadFile
from utilities import post_process, load_audio
import io
import whisper
import torchaudio
from fastapi.responses import Response
from df.enhance import enhance, init_df
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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



@app.on_event("startup")
async def startup_event():
    global deepFilterNet, df_state, whisperModel
    deepFilterNet, df_state, _ = init_df()
    whisperModel = whisper.load_model("small.en")

@app.post("/process")
async def process(file:UploadFile = File(...)):
    print(file.filename)
    audio, samplerate = torchaudio.load(file.file)
    print(samplerate)
    enhanced = enhance(deepFilterNet, df_state, audio)
    audio_tensor = post_process(enhanced)
    buffer_: bytes = io.BytesIO()
    torchaudio.save(buffer_, audio_tensor, df_state.sr(), format="wav")
    buffer_.seek(0)
    pretranscribe = load_audio(buffer_.read())
    result = whisperModel.transcribe(pretranscribe)
    print(result["text"])
    header = {"transcript": result["text"].strip()}
    return Response(content=buffer_.getvalue(), headers=header, media_type="audio/wav")


