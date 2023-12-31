import { resample } from 'wave-resampler';


const resampleAudio = (buffer, browserSampleRate) => {
    console.log(browserSampleRate)
    if (browserSampleRate === 48000) {
        return buffer;
    }
    console.log("Resampling audio...")
    return resample(buffer, browserSampleRate, 48000, {method: "cubic", LPF: true});
}

/**
 * Snippets taken from:
 * https://aws.amazon.com/blogs/machine-learning/capturing-voice-input-in-a-browser/
 */

function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Encodes the buffer as a WAV file.
 */
function encodeWAV(samples) {
    const recordSampleRate = 48000;
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, recordSampleRate, true);
    view.setUint32(28, recordSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return view;
}

/**
 * Samples the buffer at 48 kHz.
 * Encodes the buffer as a WAV file.
 * Returns the encoded audio as a Blob.
 */
function exportBuffer(recBuffer, browserSampleRate) {
    const resampledBuffer = resampleAudio(recBuffer, browserSampleRate);
    const encodedWav = encodeWAV(resampledBuffer);
    const audioBlob = new Blob([encodedWav], {
        type: 'application/octet-stream'
    });

    return audioBlob;
}

export { exportBuffer };
