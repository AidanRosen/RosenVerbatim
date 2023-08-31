from fastapi import FastAPI, File, UploadFile
from utilities import post_process, load_audio
from destutter import detect_stutter
import io
import whisper
import torchaudio
from fastapi.responses import Response
from df.enhance import enhance, init_df
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://verbatim.site"
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
    whisperModel = whisper.load_model("medium.en")

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


@app.post("/destutter")
async def destutter(file:UploadFile = File(...)):
    p_sev, r_sev, o_sev, indices, buffer_ = detect_stutter(file.file)
    print('Prolongation % : '+str(p_sev))
    print('Repetition % : '+str(r_sev))
    print('Overall stutter % : '+str(o_sev))
    print(indices)
    return Response(content=buffer_.getvalue(), media_type="audio/wav")


