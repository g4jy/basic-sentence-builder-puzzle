"""
Generate Korean TTS audio files for Kids Korean Playground app using edge-tts.
Voice: ko-KR-SunHiNeural (female, natural quality)

Reads student JSON files, extracts all unique Korean text,
generates MP3 files and a manifest.json for each student.
"""

import asyncio
import edge_tts
import json
import os
import sys
import time
import hashlib

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
AUDIO_DIR = os.path.join(BASE_DIR, 'audio', 'tts')
VOICE = 'ko-KR-SunHiNeural'

generated_count = 0
total_count = 0


def extract_texts(data):
    """Extract all unique Korean text from a student's JSON data."""
    texts = set()

    # Review items
    for item in data.get('review', []):
        if item.get('kr'):
            texts.add(item['kr'])

    # Numbers
    for item in data.get('numbers', []):
        if item.get('kr'):
            texts.add(item['kr'])

    # Verbs — base form and polite form
    for item in data.get('verbs', []):
        if item.get('kr'):
            texts.add(item['kr'])
        if item.get('polite'):
            texts.add(item['polite'])

    # Nouns
    for item in data.get('nouns', []):
        if item.get('kr'):
            texts.add(item['kr'])

    # Sentences — full sentence and individual blocks
    for item in data.get('sentences', []):
        if item.get('kr'):
            texts.add(item['kr'])
        for block in item.get('blocks', []):
            texts.add(block)

    # Picture quiz sentences
    for item in data.get('pictureQuiz', []):
        sent = item.get('sentence', {})
        if sent.get('kr'):
            texts.add(sent['kr'])

    return sorted(texts)


def text_to_filename(text, index):
    """Create a short filename from text using index + hash."""
    h = hashlib.md5(text.encode('utf-8')).hexdigest()[:6]
    return f'{index:04d}_{h}.mp3'


async def generate(text, filepath, rate=None):
    """Generate a single TTS audio file."""
    global generated_count
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    kwargs = {'text': text, 'voice': VOICE}
    if rate:
        kwargs['rate'] = rate
    tts = edge_tts.Communicate(**kwargs)
    await tts.save(filepath)
    generated_count += 1
    filename = os.path.basename(filepath)
    student = os.path.basename(os.path.dirname(filepath))
    print(f'  [{generated_count}/{total_count}] {student}/{filename} -> "{text}"')


async def process_student(student_id):
    """Process a single student: extract texts, generate audio, write manifest."""
    global generated_count, total_count

    json_path = os.path.join(DATA_DIR, f'{student_id}.json')
    if not os.path.exists(json_path):
        print(f'  Skipping {student_id}: {json_path} not found')
        return 0

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    texts = extract_texts(data)
    print(f'\n  {student_id}: {len(texts)} unique texts found')

    output_dir = os.path.join(AUDIO_DIR, student_id)
    os.makedirs(output_dir, exist_ok=True)

    # Build manifest and task list
    manifest = {}
    tasks = []
    for i, text in enumerate(texts):
        filename = text_to_filename(text, i)
        filepath = os.path.join(output_dir, filename)
        manifest[text] = filename
        tasks.append((text, filepath))

    total_count += len(tasks)

    # Generate audio with concurrency limit
    sem = asyncio.Semaphore(5)

    async def limited(text, path):
        async with sem:
            await generate(text, path)

    await asyncio.gather(*[limited(t, p) for t, p in tasks])

    # Write manifest
    manifest_path = os.path.join(output_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f'  {student_id}: manifest.json written ({len(manifest)} entries)')

    return len(tasks)


async def main():
    global generated_count, total_count
    start_time = time.time()

    print(f'Kids TTS Generator')
    print(f'Voice: {VOICE}')
    print(f'Output: {AUDIO_DIR}')

    students = ['asa', 'leah', 'inessa']
    total_files = 0
    for sid in students:
        count = await process_student(sid)
        total_files += count

    elapsed = time.time() - start_time

    # Stats
    total_size = 0
    file_count = 0
    for root, dirs, files in os.walk(AUDIO_DIR):
        for f in files:
            if f.endswith('.mp3'):
                fpath = os.path.join(root, f)
                total_size += os.path.getsize(fpath)
                file_count += 1

    print(f'\n{"=" * 50}')
    print(f'DONE!')
    print(f'Total MP3 files: {file_count}')
    print(f'Total size: {total_size / 1024:.1f} KB ({total_size / (1024*1024):.2f} MB)')
    print(f'Time: {elapsed:.1f}s')

    for sid in students:
        sid_dir = os.path.join(AUDIO_DIR, sid)
        if os.path.exists(sid_dir):
            mp3s = [f for f in os.listdir(sid_dir) if f.endswith('.mp3')]
            sz = sum(os.path.getsize(os.path.join(sid_dir, f)) for f in mp3s)
            print(f'  {sid}: {len(mp3s)} files, {sz / 1024:.1f} KB')


if __name__ == '__main__':
    asyncio.run(main())
