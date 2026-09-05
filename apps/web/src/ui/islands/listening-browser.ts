import type { ListeningAudio, ListeningStore, LocalListening } from "./listening-controller";

/** A separate origin-local store contains only bounded media and Listening protocol facts. */
export class IndexedListeningStore implements ListeningStore {
  private async database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("bestehen-listening-v1", 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore("blocks", { keyPath: "key" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async read(key: string): Promise<LocalListening | undefined> {
    const db = await this.database();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("blocks", "readonly");
      const request = tx.objectStore("blocks").get(key);
      tx.oncomplete = () => {
        db.close();
        resolve(request.result as LocalListening | undefined);
      };
      tx.onabort = tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }
  async write(record: LocalListening, previousRevision: number) {
    const db = await this.database();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("blocks", "readwrite", { durability: "strict" });
      const store = tx.objectStore("blocks");
      const request = store.get(record.key);
      request.onsuccess = () => {
        const previous = request.result as LocalListening | undefined;
        if ((previous?.revision ?? 0) !== previousRevision) {
          tx.abort();
          return;
        }
        store.put(record);
      };
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onabort = tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error("Listening journal conflict"));
      };
    });
  }
}

export class BrowserListeningAudio implements ListeningAudio {
  private context: AudioContext | undefined;
  private urls = new Map<string, string>();
  constructor(private readonly element: () => HTMLAudioElement | null) {}
  supports(mime: string) {
    return new Audio().canPlayType(mime) !== "";
  }
  private decoder() {
    this.context ??= new AudioContext();
    return this.context;
  }
  async decode(bytes: ArrayBuffer) {
    const result = await this.decoder().decodeAudioData(bytes);
    if (!Number.isFinite(result.duration) || result.duration <= 0 || result.length === 0)
      throw new Error("Decode failed");
  }
  retain(mediaId: string, bytes: ArrayBuffer, mime: string) {
    const previous = this.urls.get(mediaId);
    if (previous) URL.revokeObjectURL(previous);
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    this.urls.set(mediaId, url);
    return url;
  }
  async probe() {
    const context = this.decoder();
    await context.resume();
    if (context.state !== "running") throw new Error("Output unavailable");
    // Fixed non-linguistic 440 Hz, 300 ms output check. Not speech or learner evidence.
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 440;
    gain.gain.value = 0.1;
    oscillator.connect(gain).connect(context.destination);
    await new Promise<void>((resolve) => {
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        resolve();
      };
      oscillator.start();
      oscillator.stop(context.currentTime + 0.3);
    });
  }
  async play(url: string, speed: number) {
    const audio = this.element();
    if (!audio || !url.startsWith("blob:") || audio.getAttribute("src") !== url)
      throw new Error("Retained handle unavailable");
    audio.playbackRate = speed;
    await audio.play();
  }
  pause() {
    this.element()?.pause();
  }
  dispose() {
    this.pause();
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
    if (this.context) void this.context.close().catch(() => undefined);
    this.context = undefined;
  }
}
