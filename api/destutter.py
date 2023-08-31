import librosa
import numpy as np
# import tensorflow as tf
from pydub import AudioSegment
from keras.models import load_model
import io
# import os

model_rep = load_model('best_model_rep.h5')
model_pro = load_model('best_model_pro.h5')

def detect_prolongation(mfcc): 
    s = 0
    indices = []
    i = 0
    for m in mfcc:
        y = model_pro.predict(m.reshape(1,2,44,1), batch_size=1)
        y = np.around(y,decimals=2)
        if y[0][0] > 0.5:
            indices.append(i)
            s += y[0][0]

        i += 1
    # p_sev = s/len(mfcc)*100
    p_sev = 0
    return p_sev, indices

def detect_repetition(mfcc):
    s = 0
    indices = []
    i = 0
    for m in mfcc:
        y = model_rep.predict(m.reshape(1,13,44,1), batch_size=1)
        y = np.around(y,decimals=2)
        if y[0][0] > 0.5:
            s += y[0][0]
            indices.append(i)
        i += 1
    # r_sev = s/len(mfcc)*100
    r_sev = 0
    return r_sev, indices

def detect_stutter(audio):
    sound_file = AudioSegment.from_wav(audio)
    audio_chunks = sound_file[::1000]
    ps = 0
    rs = 0
    mfcc_arr_p = []
    mfcc_arr_r = []
    for i, chunk in enumerate(audio_chunks):
        # chunkfile = "chunks_test/chunk{0}.wav".format(i)
        chunkfile = "chunk".format(i)
        chunk_wav = io.BytesIO()
        chunk.export(chunk_wav, format="wav")
        y, sr = librosa.load(chunk_wav)
        mfcc = np.array(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13))
        print(len(mfcc))
        if mfcc.shape[0] == 13 and mfcc.shape[1] == 44:
            a = []
            a.append(mfcc)
            mfcc_arr_r.append(a)
            b = []
            b.append(mfcc[0])
            b.append(mfcc[12])
            mfcc_arr_p.append(b)
            
    mfcc_arr_r = np.array(mfcc_arr_r)  
    mfcc_arr_p = np.array(mfcc_arr_p)    
    
    mfcc_arr_r.reshape(mfcc_arr_r.shape[0], 13, 44, 1)
    mfcc_arr_p.reshape(mfcc_arr_p.shape[0], 2, 44, 1)
    
    indices_p = []
    indices_r = []

    p_sev, indices_p = detect_prolongation(mfcc_arr_p)
    r_sev, indices_r = detect_repetition(mfcc_arr_r)
    
    indices = set(indices_p + indices_r)
    indices = list(indices)
    indices.sort()
    print(indices)
    if (len(indices) > 0):
        first_chunk = sound_file[:indices[0]*1000]
        index = indices[0]*1000
        if (len(indices) > 1):
            for i in indices[1:]:
                next_chunk = sound_file[index+250:i*1000]
                index = i*1000
                first_chunk = first_chunk + next_chunk
        last_chunk = sound_file[index:]
        first_chunk = first_chunk + last_chunk
    else:
        first_chunk = sound_file
    
    wavIO = io.BytesIO()
    first_chunk.export(wavIO, format="wav")

    o_sev = (p_sev+r_sev)/2
    

    return p_sev, r_sev, o_sev, indices, wavIO

# if __name__== "__main__":
#     common = '/home/mansi/anaconda3/beproject/stutter_det/demo_audios'
#     arr1 = os.listdir(common)
#     for a in arr1:
#         print('\n'+a)
#         arr2 = os.listdir(common+'/'+a)
#         for b in arr2:
#             if b.endswith('.wav'):
#                 print('\n'+b)
#                 p_sev, r_sev, o_sev = detect_stutter(common+'/'+a+'/'+b)
#                 print('Prolongation % : '+str(p_sev))
#                 print('Repetition % : '+str(r_sev))
#                 print('Overall stutter % : '+str(o_sev))