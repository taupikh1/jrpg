#!/usr/bin/env python3
"""
Deterministic synthesis of every SFX and ambient loop used by the game.

Every sound is generated from code in this file (sine and noise synthesis, no samples).
The output is original work under the project license. Each file is a single effect or a
noise-based environmental loop; nothing here composes or sequences notes.

Usage:  python3 tools/audio/generate-audio.py
Needs:  python3, numpy, ffmpeg with libmp3lame.
Output: assets/audio/sfx/*.mp3 and assets/audio/ambient/*.mp3
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 22050
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT_SFX = os.path.join(ROOT, 'assets', 'audio', 'sfx')
OUT_AMB = os.path.join(ROOT, 'assets', 'audio', 'ambient')
AMBIENT_SECONDS = 10.0  # loop length; every periodic component completes an integer number of cycles


# ---------- primitives -------------------------------------------------------

def t_of(dur):
    return np.arange(int(SR * dur)) / SR


def envelope(t, tau=None, attack=0.002):
    e = np.ones_like(t) if tau is None else np.exp(-t / tau)
    a = np.minimum(1.0, t / attack) if attack > 0 else np.ones_like(t)
    release = np.minimum(1.0, (t[-1] - t) / 0.004) if len(t) else t  # click guard
    return e * a * release


def tone(freq, dur, tau=None, amp=1.0, harmonics=(1.0,), attack=0.002):
    t = t_of(dur)
    f = freq(t) if callable(freq) else np.full_like(t, float(freq))
    phase = 2 * np.pi * np.cumsum(f) / SR
    y = sum(a * np.sin((k + 1) * phase) for k, a in enumerate(harmonics))
    return amp * y * envelope(t, tau, attack)


def lowpass(x, fc):
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    s = 0.0
    for i, v in enumerate(x):
        s += a * (v - s)
        y[i] = s
    return y


def highpass(x, fc):
    return x - lowpass(x, fc)


def bandpass(x, lo, hi):
    return highpass(lowpass(x, hi), lo)


def noise_burst(dur, seed, tau=None, amp=1.0, lo=None, hi=None, attack=0.002):
    n = int(SR * dur)
    x = np.random.default_rng(seed).uniform(-1, 1, n)
    if lo and hi:
        x = bandpass(x, lo, hi)
    elif hi:
        x = lowpass(x, hi)
    elif lo:
        x = highpass(x, lo)
    return amp * x * envelope(t_of(dur), tau, attack)


def sweep(f0, f1, dur, curve=1.0):
    return lambda t: f0 + (f1 - f0) * np.clip(t / dur, 0, 1) ** curve


def normalize(x, peak):
    m = float(np.max(np.abs(x))) or 1.0
    return x * (peak / m)


def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[:len(p)] += p
    return out


# ---------- one-shot sound effects ------------------------------------------
# Each entry: name -> builder returning float samples. Peak is normalized later.

def sfx_ui_select():
    return tone(880, 0.06, tau=0.02, harmonics=(1, 0.3))


def sfx_ui_confirm():
    return mix(tone(sweep(660, 990, 0.12, 0.0), 0.12, tau=0.07), tone(1980, 0.1, tau=0.03, amp=0.15))


def sfx_ui_cancel():
    return tone(sweep(520, 300, 0.14), 0.14, tau=0.08, harmonics=(1, 0.4))


def sfx_ui_open():
    return mix(noise_burst(0.25, 11, tau=0.12, amp=0.5, lo=400, hi=3500),
               tone(sweep(400, 760, 0.25), 0.25, tau=0.15, amp=0.25))


def sfx_ui_close():
    return mix(noise_burst(0.2, 12, tau=0.08, amp=0.45, lo=300, hi=2500),
               tone(sweep(700, 380, 0.2), 0.2, tau=0.1, amp=0.25))


def sfx_ui_notify():
    return tone(1046, 0.35, tau=0.12, harmonics=(1, 0.5, 0.25, 0.1))


def sfx_ui_error():
    return mix(tone(170, 0.18, tau=0.09, harmonics=(1, 0.6, 0.3)), tone(140, 0.18, tau=0.09, amp=0.6, harmonics=(1, 0.6)))


def sfx_ui_save_ok():
    return mix(tone(784, 0.3, tau=0.12), tone(988, 0.3, tau=0.12, amp=0.7, attack=0.04))


def sfx_ui_save_fail():
    return mix(tone(220, 0.3, tau=0.15, harmonics=(1, 0.5)), noise_burst(0.3, 21, tau=0.1, amp=0.25, hi=1200))


def sfx_quest_accept():
    return mix(tone(523, 0.2, tau=0.12), tone(659, 0.2, tau=0.12, attack=0.09), tone(784, 0.25, tau=0.15, attack=0.18))


def sfx_quest_complete():
    return mix(tone(784, 0.6, tau=0.25, harmonics=(1, 0.2)), tone(988, 0.6, tau=0.25, amp=0.7, attack=0.08),
               tone(1318, 0.6, tau=0.28, amp=0.5, attack=0.16))


def sfx_reward():
    return mix(tone(2400, 0.2, tau=0.05, amp=0.35, harmonics=(1, 0.3)), tone(3100, 0.18, tau=0.04, amp=0.25, attack=0.06))


def sfx_item_pickup():
    return mix(tone(sweep(500, 900, 0.1), 0.1, tau=0.05), tone(1350, 0.18, tau=0.07, amp=0.35, attack=0.05))


def sfx_item_use():
    return tone(sweep(380, 820, 0.2, 0.6), 0.2, tau=0.09, harmonics=(1, 0.2))


def sfx_npc_talk():
    return tone(lambda t: 560 + 90 * np.sin(2 * np.pi * 18 * t), 0.09, tau=0.05, harmonics=(1, 0.3))


def sfx_zone_enter():
    return mix(noise_burst(0.6, 31, tau=0.25, amp=0.55, lo=150, hi=2200, attack=0.12),
               tone(sweep(260, 180, 0.6), 0.6, tau=0.3, amp=0.2))


def sfx_examine():
    return tone(lambda t: 1180 + 25 * np.sin(2 * np.pi * 9 * t), 0.3, tau=0.12, harmonics=(1, 0.2))


def _footstep(seed, base, cut):
    thump = tone(sweep(base, base * 0.6, 0.12), 0.12, tau=0.04, amp=0.6, harmonics=(1,))
    rustle = noise_burst(0.12, seed, tau=0.03, amp=0.5, hi=cut)
    return mix(thump, rustle)


def sfx_footstep_1():
    return _footstep(41, 110, 1500)


def sfx_footstep_2():
    return _footstep(42, 130, 1800)


def sfx_footstep_3():
    return _footstep(43, 95, 1300)


def sfx_battle_start():
    return mix(noise_burst(0.5, 51, tau=0.22, amp=0.45, lo=200, hi=2500, attack=0.2),
               tone(sweep(120, 70, 0.4), 0.4, tau=0.12, amp=0.8))


def sfx_attack_physical():
    return noise_burst(0.2, 61, tau=0.07, amp=0.6, lo=900, hi=5000, attack=0.02)


def sfx_impact_weapon():
    return mix(noise_burst(0.15, 62, tau=0.03, amp=0.8, hi=3000), tone(sweep(180, 90, 0.15), 0.15, tau=0.05, amp=0.7))


def sfx_enemy_attack():
    return mix(noise_burst(0.25, 63, tau=0.1, amp=0.45, lo=120, hi=1400, attack=0.04),
               tone(sweep(160, 90, 0.25), 0.25, tau=0.12, amp=0.4))


def sfx_damage_player():
    return mix(tone(sweep(330, 140, 0.22), 0.22, tau=0.1, harmonics=(1, 0.5)), noise_burst(0.1, 64, tau=0.03, amp=0.3, hi=1500))


def sfx_damage_enemy():
    return mix(tone(sweep(900, 500, 0.12), 0.12, tau=0.04, amp=0.5), noise_burst(0.08, 65, tau=0.02, amp=0.4, hi=4000))


def sfx_magic_cast():
    return mix(tone(sweep(300, 1200, 0.4, 1.4), 0.4, tau=0.2, harmonics=(1, 0.3)),
               noise_burst(0.4, 66, tau=0.25, amp=0.15, lo=2000, hi=6000, attack=0.1))


def sfx_heal():
    return mix(tone(sweep(600, 900, 0.4), 0.4, tau=0.2, harmonics=(1, 0.2)), tone(1200, 0.4, tau=0.22, amp=0.3, attack=0.1))


def sfx_defend():
    return mix(tone(2600, 0.2, tau=0.04, amp=0.5, harmonics=(1, 0.4)), tone(3900, 0.2, tau=0.03, amp=0.25))


def sfx_status_apply():
    return tone(lambda t: 420 + 60 * np.sin(2 * np.pi * 7 * t) + 40 * t, 0.3, tau=0.15, harmonics=(1, 0.4))


def sfx_status_recover():
    return mix(tone(sweep(700, 1100, 0.25), 0.25, tau=0.12, amp=0.5), tone(1500, 0.22, tau=0.08, amp=0.25, attack=0.1))


def sfx_enemy_defeat():
    return mix(noise_burst(0.4, 71, tau=0.12, amp=0.5, hi=1800), tone(sweep(400, 80, 0.4), 0.4, tau=0.15, amp=0.6))


def sfx_party_ko():
    return tone(sweep(260, 70, 0.6), 0.6, tau=0.25, harmonics=(1, 0.3))


def sfx_battle_victory():
    return mix(tone(784, 0.8, tau=0.3, harmonics=(1, 0.25)), tone(1175, 0.8, tau=0.3, amp=0.6, attack=0.12))


def sfx_battle_defeat():
    return tone(sweep(330, 70, 0.9), 0.9, tau=0.35, harmonics=(1, 0.4))


def sfx_battle_escape():
    return noise_burst(0.3, 72, tau=0.1, amp=0.6, lo=600, hi=4000, attack=0.02)


def sfx_exp_gain():
    return tone(sweep(900, 1300, 0.2), 0.2, tau=0.1, amp=0.35)


def sfx_level_up():
    return mix(tone(523, 0.5, tau=0.25), tone(784, 0.5, tau=0.25, amp=0.7, attack=0.1), tone(1046, 0.6, tau=0.3, amp=0.5, attack=0.2))


def sfx_stat_up():
    return tone(sweep(600, 1000, 0.25), 0.25, tau=0.12, harmonics=(1, 0.3))


def sfx_skill_unlock():
    return mix(tone(sweep(500, 1500, 0.35, 0.5), 0.35, tau=0.18, harmonics=(1, 0.2)), noise_burst(0.35, 73, tau=0.15, amp=0.12, hi=8000))


SFX = {
    'ui_select': sfx_ui_select, 'ui_confirm': sfx_ui_confirm, 'ui_cancel': sfx_ui_cancel,
    'ui_open': sfx_ui_open, 'ui_close': sfx_ui_close, 'ui_notify': sfx_ui_notify,
    'ui_error': sfx_ui_error, 'ui_save_ok': sfx_ui_save_ok, 'ui_save_fail': sfx_ui_save_fail,
    'quest_accept': sfx_quest_accept, 'quest_complete': sfx_quest_complete, 'reward': sfx_reward,
    'item_pickup': sfx_item_pickup, 'item_use': sfx_item_use, 'npc_talk': sfx_npc_talk,
    'zone_enter': sfx_zone_enter, 'examine': sfx_examine,
    'footstep_1': sfx_footstep_1, 'footstep_2': sfx_footstep_2, 'footstep_3': sfx_footstep_3,
    'battle_start': sfx_battle_start, 'attack_physical': sfx_attack_physical,
    'impact_weapon': sfx_impact_weapon, 'enemy_attack': sfx_enemy_attack,
    'damage_player': sfx_damage_player, 'damage_enemy': sfx_damage_enemy,
    'magic_cast': sfx_magic_cast, 'heal': sfx_heal, 'defend': sfx_defend,
    'status_apply': sfx_status_apply, 'status_recover': sfx_status_recover,
    'enemy_defeat': sfx_enemy_defeat, 'party_ko': sfx_party_ko,
    'battle_victory': sfx_battle_victory, 'battle_defeat': sfx_battle_defeat,
    'battle_escape': sfx_battle_escape,
    'exp_gain': sfx_exp_gain, 'level_up': sfx_level_up, 'stat_up': sfx_stat_up,
    'skill_unlock': sfx_skill_unlock,
}


# ---------- seamless ambient loops ------------------------------------------
# Built in the frequency domain over exactly AMBIENT_SECONDS, so the waveform is periodic
# by construction. Modulators use integer cycles per loop, so they also repeat seamlessly.

def _loop_noise(seed, lo, hi):
    n = int(SR * AMBIENT_SECONDS)
    spec = np.fft.rfft(np.random.default_rng(seed).standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec[(freqs < lo) | (freqs > hi)] = 0
    return np.fft.irfft(spec, n)


def _cycles(t, k, phase=0.0):
    return np.sin(2 * np.pi * k * t / AMBIENT_SECONDS + phase)


def _ambient_samples(parts):
    x = np.zeros(int(SR * AMBIENT_SECONDS))
    for p in parts:
        x += p
    rms = float(np.sqrt(np.mean(x ** 2))) or 1.0
    x = x * (0.06 / rms)  # subtle: about -24 dBFS RMS
    return np.clip(x, -0.9, 0.9)


def amb_forest_wind():
    t = t_of(AMBIENT_SECONDS)
    wind = _loop_noise(101, 120, 900) * (0.65 + 0.2 * _cycles(t, 1) + 0.15 * _cycles(t, 3, 1.3))
    leaves = _loop_noise(102, 2200, 6500) * np.clip(_cycles(t, 7, 0.5), 0, 1) ** 4
    return _ambient_samples([wind, 0.45 * leaves])


def amb_village_breeze():
    t = t_of(AMBIENT_SECONDS)
    wind = _loop_noise(111, 90, 600) * (0.7 + 0.2 * _cycles(t, 2))
    stream = _loop_noise(112, 900, 2600) * (0.5 + 0.5 * _cycles(t, 5, 0.8))
    return _ambient_samples([wind, 0.35 * stream])


def amb_road_wind():
    t = t_of(AMBIENT_SECONDS)
    wind = _loop_noise(121, 60, 520) * (0.6 + 0.3 * _cycles(t, 2, 0.4) + 0.1 * _cycles(t, 5))
    return _ambient_samples([wind])


def amb_town_murmur():
    t = t_of(AMBIENT_SECONDS)
    murmur = _loop_noise(131, 250, 1400) * (0.55 + 0.2 * _cycles(t, 3) + 0.15 * _cycles(t, 5, 0.7) + 0.1 * _cycles(t, 11, 2.0))
    low = _loop_noise(132, 70, 200) * 0.6
    return _ambient_samples([murmur, low])


def amb_archive_room_tone():
    t = t_of(AMBIENT_SECONDS)
    hum = _loop_noise(141, 40, 120) * (0.8 + 0.2 * _cycles(t, 1))
    hiss = _loop_noise(142, 4000, 8000) * 0.12
    return _ambient_samples([hum, hiss])


def amb_ancient_hum():
    t = t_of(AMBIENT_SECONDS)
    drone = 0.6 * np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 56 * t)  # 1 Hz slow beating only
    grit = _loop_noise(151, 150, 400) * (0.5 + 0.5 * _cycles(t, 2))
    return _ambient_samples([drone, 0.4 * grit])


AMBIENT = {
    'forest_wind': amb_forest_wind, 'village_breeze': amb_village_breeze,
    'road_wind': amb_road_wind, 'town_murmur': amb_town_murmur,
    'archive_room_tone': amb_archive_room_tone, 'ancient_hum': amb_ancient_hum,
}


# ---------- encoding ---------------------------------------------------------

def write_mp3(samples, out_path, tmp_dir):
    pcm = (np.clip(samples, -1, 1) * 32767).astype('<i2')
    wav_path = os.path.join(tmp_dir, os.path.basename(out_path) + '.wav')
    with wave.open(wav_path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', wav_path,
         '-c:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', '-write_xing', '0', out_path],
        check=True,
    )


def main():
    os.makedirs(OUT_SFX, exist_ok=True)
    os.makedirs(OUT_AMB, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for name, build in SFX.items():
            write_mp3(normalize(build(), 0.7), os.path.join(OUT_SFX, name + '.mp3'), tmp)
        for name, build in AMBIENT.items():
            write_mp3(build(), os.path.join(OUT_AMB, name + '.mp3'), tmp)
    print(f'generated {len(SFX)} sfx and {len(AMBIENT)} ambient loops')


if __name__ == '__main__':
    main()
