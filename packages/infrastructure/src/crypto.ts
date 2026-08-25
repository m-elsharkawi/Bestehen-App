import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { KeyedDigest, SecretSealer } from "@bestehen/application";

function deriveKey(secret: string, purpose: string): Buffer {
  return createHmac("sha256", secret).update(`bestehen:${purpose}:v1`).digest();
}

export class HmacDigest implements KeyedDigest {
  public constructor(private readonly secret: string) {
    if (Buffer.byteLength(secret) < 32) throw new Error("Digest secret must be at least 32 bytes");
  }

  public digest(purpose: string, value: string): string {
    return createHmac("sha256", deriveKey(this.secret, purpose)).update(value).digest("hex");
  }

  public equals(left: string, right: string): boolean {
    if (left.length !== right.length) return false;
    return timingSafeEqual(Buffer.from(left), Buffer.from(right));
  }
}

export class AesGcmSealer implements SecretSealer {
  public constructor(private readonly secret: string) {
    if (Buffer.byteLength(secret) < 32) throw new Error("Sealing secret must be at least 32 bytes");
  }

  public seal(purpose: string, plaintext: string): string {
    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", deriveKey(this.secret, purpose), nonce);
    cipher.setAAD(Buffer.from(`bestehen:${purpose}:v1`));
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return [
      "v1",
      nonce.toString("base64url"),
      cipher.getAuthTag().toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(".");
  }

  public open(purpose: string, sealed: string) {
    try {
      const [version, nonce, tag, ciphertext] = sealed.split(".");
      if (version !== "v1" || !nonce || !tag || !ciphertext) {
        return { ok: false as const, error: "invalid_seal" as const };
      }
      const decipher = createDecipheriv(
        "aes-256-gcm",
        deriveKey(this.secret, purpose),
        Buffer.from(nonce, "base64url"),
      );
      decipher.setAAD(Buffer.from(`bestehen:${purpose}:v1`));
      decipher.setAuthTag(Buffer.from(tag, "base64url"));
      const plaintext = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, "base64url")),
        decipher.final(),
      ]).toString("utf8");
      return { ok: true as const, value: plaintext };
    } catch {
      return { ok: false as const, error: "invalid_seal" as const };
    }
  }
}

export function randomOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
