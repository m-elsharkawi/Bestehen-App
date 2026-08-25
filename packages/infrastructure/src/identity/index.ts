import { randomUUID } from "node:crypto";
import {
  type AppSessionRecord,
  type AppSessionStore,
  type IdentityProof,
  type KeyedDigest,
  resolveSessionState,
  type SecretSealer,
  safeReturnPath,
  sessionPolicyV1,
} from "@bestehen/application";
import type { ServerEnvironment } from "@bestehen/configuration";
import { type AuthorizedScope, appId, type Result } from "@bestehen/domain";
import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  ClientSecretPost,
  type Configuration,
  calculatePKCECodeChallenge,
  discovery,
  type IDToken,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
} from "openid-client";
import type { Pool } from "pg";
import { AesGcmSealer, HmacDigest, randomOpaqueToken } from "../crypto.js";
import { PostgresFoundationRepository } from "../postgres/foundation-repository.js";

export type IdentityFailure =
  | "transaction_missing"
  | "transaction_expired"
  | "transaction_used"
  | "state_invalid"
  | "nonce_invalid"
  | "pkce_invalid"
  | "issuer_invalid"
  | "audience_invalid"
  | "subject_missing"
  | "email_unverified"
  | "authentication_time_invalid"
  | "issued_at_invalid"
  | "expired"
  | "not_yet_valid"
  | "protocol_error";

export interface OidcTransaction {
  readonly transactionDigest: string;
  readonly stateDigest: string;
  readonly nonceDigest: string;
  readonly verifierAndNonceSealed: string;
  readonly returnPath: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;
}

export interface ConsumedOidcTransaction extends OidcTransaction {
  readonly state: string;
  readonly nonce: string;
  readonly pkceVerifier: string;
}

export class PostgresOidcTransactionStore {
  public constructor(
    private readonly pool: Pool,
    private readonly digest: KeyedDigest,
    private readonly sealer: SecretSealer,
  ) {}

  public async insert(transaction: OidcTransaction): Promise<void> {
    await this.pool.query(
      `INSERT INTO app.oidc_transactions(transaction_digest,state_digest,nonce_digest,pkce_verifier_sealed,return_path,created_at,expires_at)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        transaction.transactionDigest,
        transaction.stateDigest,
        transaction.nonceDigest,
        transaction.verifierAndNonceSealed,
        transaction.returnPath,
        transaction.createdAt,
        transaction.expiresAt,
      ],
    );
  }

  public async consume(
    state: string,
    now: Date,
  ): Promise<Result<ConsumedOidcTransaction, IdentityFailure>> {
    const stateDigest = this.digest.digest("oidc-state", state);
    const result = await this.pool.query(
      `UPDATE app.oidc_transactions SET used_at=$2 WHERE state_digest=$1 AND used_at IS NULL AND expires_at>$2
       RETURNING *`,
      [stateDigest, now],
    );
    const row = result.rows[0];
    if (!row) return { ok: false, error: "transaction_missing" };
    const opened = this.sealer.open("oidc-pkce", row.pkce_verifier_sealed);
    if (!opened.ok) return { ok: false, error: "pkce_invalid" };
    try {
      const parsed = JSON.parse(opened.value) as { nonce: string; pkceVerifier: string };
      if (!this.digest.equals(row.nonce_digest, this.digest.digest("oidc-nonce", parsed.nonce))) {
        return { ok: false, error: "nonce_invalid" };
      }
      return {
        ok: true,
        value: {
          transactionDigest: row.transaction_digest,
          stateDigest: row.state_digest,
          nonceDigest: row.nonce_digest,
          verifierAndNonceSealed: row.pkce_verifier_sealed,
          returnPath: row.return_path,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          state,
          nonce: parsed.nonce,
          pkceVerifier: parsed.pkceVerifier,
        },
      };
    } catch {
      return { ok: false, error: "pkce_invalid" };
    }
  }
}

export interface Auth0AdapterConfiguration {
  readonly issuer: URL;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly callbackUrl: URL;
  readonly connection: "email";
}

export interface IdentityCallbackResult {
  readonly proof: IdentityProof;
  readonly returnPath: string;
}

export class Auth0EmailOtpAdapter {
  private configuration: Configuration | undefined;

  public constructor(
    private readonly settings: Auth0AdapterConfiguration,
    private readonly transactions: PostgresOidcTransactionStore,
    private readonly digest: KeyedDigest,
    private readonly sealer: SecretSealer,
  ) {}

  private async client(): Promise<Configuration> {
    this.configuration ??= await discovery(
      this.settings.issuer,
      this.settings.clientId,
      { redirect_uris: [this.settings.callbackUrl.href], response_types: ["code"] },
      ClientSecretPost(this.settings.clientSecret),
      { algorithm: "oidc", timeout: 5 },
    );
    return this.configuration;
  }

  public async begin(returnPath: string, now: Date): Promise<URL> {
    const state = randomState();
    const nonce = randomNonce();
    const pkceVerifier = randomPKCECodeVerifier();
    const codeChallenge = await calculatePKCECodeChallenge(pkceVerifier);
    await this.transactions.insert({
      transactionDigest: this.digest.digest("oidc-transaction", state),
      stateDigest: this.digest.digest("oidc-state", state),
      nonceDigest: this.digest.digest("oidc-nonce", nonce),
      verifierAndNonceSealed: this.sealer.seal(
        "oidc-pkce",
        JSON.stringify({ nonce, pkceVerifier }),
      ),
      returnPath,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    });
    return buildAuthorizationUrl(await this.client(), {
      redirect_uri: this.settings.callbackUrl.href,
      scope: "openid email",
      response_type: "code",
      connection: this.settings.connection,
      prompt: "login",
      max_age: "0",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });
  }

  public async callback(
    currentUrl: URL,
    now: Date,
  ): Promise<Result<IdentityCallbackResult, IdentityFailure>> {
    const state = currentUrl.searchParams.get("state");
    if (!state) return { ok: false, error: "state_invalid" };
    if (currentUrl.searchParams.get("iss") !== this.settings.issuer.href) {
      return { ok: false, error: "issuer_invalid" };
    }
    const transaction = await this.transactions.consume(state, now);
    if (!transaction.ok) return transaction;
    try {
      const response = await authorizationCodeGrant(await this.client(), currentUrl, {
        expectedState: transaction.value.state,
        expectedNonce: transaction.value.nonce,
        pkceCodeVerifier: transaction.value.pkceVerifier,
        maxAge: 10 * 60,
      });
      const proof = validateIdentityClaims(
        response.claims(),
        { issuer: this.settings.issuer.href, audience: this.settings.clientId },
        now,
      );
      return proof.ok
        ? { ok: true, value: { proof: proof.value, returnPath: transaction.value.returnPath } }
        : proof;
    } catch {
      return { ok: false, error: "protocol_error" };
    }
  }
}

export function validateIdentityClaims(
  claims: IDToken | undefined,
  expected: { readonly issuer: string; readonly audience: string },
  now: Date,
): Result<IdentityProof, IdentityFailure> {
  if (!claims) return { ok: false, error: "protocol_error" };
  if (claims.iss !== expected.issuer) return { ok: false, error: "issuer_invalid" };
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audience.includes(expected.audience)) return { ok: false, error: "audience_invalid" };
  if (typeof claims.sub !== "string" || claims.sub.length === 0)
    return { ok: false, error: "subject_missing" };
  const values = claims as IDToken & { email_verified?: unknown; nbf?: unknown };
  if (values.email_verified !== true) return { ok: false, error: "email_unverified" };
  if (typeof claims.auth_time !== "number" || claims.auth_time > now.getTime() / 1000 + 60)
    return { ok: false, error: "authentication_time_invalid" };
  if (typeof claims.iat !== "number" || claims.iat > now.getTime() / 1000 + 60)
    return { ok: false, error: "issued_at_invalid" };
  if (typeof claims.exp !== "number" || claims.exp <= now.getTime() / 1000)
    return { ok: false, error: "expired" };
  if (typeof values.nbf === "number" && values.nbf > now.getTime() / 1000 + 60)
    return { ok: false, error: "not_yet_valid" };
  return {
    ok: true,
    value: {
      issuer: claims.iss,
      subject: claims.sub,
      emailVerified: true,
      authenticationTime: new Date(claims.auth_time * 1000),
      authenticationMethod: "email_otp",
    },
  };
}

export class FakeEmailOtpIdentityAdapter {
  public constructor(
    private readonly expected: { readonly issuer: string; readonly audience: string },
    private readonly now: Date,
  ) {}

  public verify(claims: IDToken | undefined): Result<IdentityProof, IdentityFailure> {
    return validateIdentityClaims(claims, this.expected, this.now);
  }

  public verifyCallback(input: {
    readonly claims: IDToken | undefined;
    readonly state: string;
    readonly expectedState: string;
    readonly nonce: string;
    readonly expectedNonce: string;
    readonly pkceVerifier: string;
    readonly expectedPkceVerifier: string;
  }): Result<IdentityProof, IdentityFailure> {
    if (input.state !== input.expectedState) return { ok: false, error: "state_invalid" };
    if (input.nonce !== input.expectedNonce) return { ok: false, error: "nonce_invalid" };
    if (input.pkceVerifier !== input.expectedPkceVerifier) {
      return { ok: false, error: "pkce_invalid" };
    }
    return this.verify(input.claims);
  }
}

export const appSessionCookie = {
  name: "__Host-bestehen_session",
  options: {
    secure: true,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  },
} as const;

export async function resolveAndTouchAppSession(
  repository: AppSessionStore,
  tokenDigest: string,
  now: Date,
): Promise<AppSessionRecord | undefined> {
  const session = await repository.findByTokenDigest(tokenDigest);
  const resolved = resolveSessionState(session, now);
  if (!resolved.ok) {
    if (session?.state === "active") await repository.revoke(session.id, now);
    return undefined;
  }
  const touched = await repository.touch(
    resolved.value.id,
    resolved.value.lastUsedAt,
    now,
    new Date(now.getTime() + sessionPolicyV1.idleMilliseconds),
  );
  if (touched) return resolved.value;

  const authoritative = await repository.findByTokenDigest(tokenDigest);
  const reResolved = resolveSessionState(authoritative, now);
  if (!reResolved.ok) {
    if (authoritative?.state === "active") await repository.revoke(authoritative.id, now);
    return undefined;
  }
  return reResolved.value;
}

export class AppIdentityService {
  private readonly digest: HmacDigest;
  private readonly repository: PostgresFoundationRepository;
  private readonly auth0: Auth0EmailOtpAdapter | undefined;

  public constructor(
    pool: Pool,
    private readonly environment: ServerEnvironment,
    securitySecret: string,
  ) {
    this.digest = new HmacDigest(securitySecret);
    const sealer = new AesGcmSealer(securitySecret);
    this.repository = new PostgresFoundationRepository(pool);
    this.auth0 =
      environment.BESTEHEN_AUTH_ADAPTER === "auth0" &&
      environment.BESTEHEN_AUTH0_ISSUER_BASE_URL &&
      environment.BESTEHEN_AUTH0_CLIENT_ID &&
      environment.BESTEHEN_AUTH0_CLIENT_SECRET &&
      environment.BESTEHEN_APPLICATION_BASE_URL
        ? new Auth0EmailOtpAdapter(
            {
              issuer: new URL(environment.BESTEHEN_AUTH0_ISSUER_BASE_URL),
              clientId: environment.BESTEHEN_AUTH0_CLIENT_ID,
              clientSecret: environment.BESTEHEN_AUTH0_CLIENT_SECRET,
              callbackUrl: new URL(
                environment.BESTEHEN_AUTH0_CALLBACK_PATH ?? "/auth/callback",
                environment.BESTEHEN_APPLICATION_BASE_URL,
              ),
              connection: "email",
            },
            new PostgresOidcTransactionStore(pool, this.digest, sealer),
            this.digest,
            sealer,
          )
        : undefined;
  }

  public async loginUrl(returnPath: string, now = new Date()): Promise<URL | undefined> {
    if (!this.auth0 || !this.environment.BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS) return undefined;
    return this.auth0.begin(safeReturnPath(returnPath), now);
  }

  public async completeCallback(
    callbackUrl: URL,
    now = new Date(),
  ): Promise<
    Result<
      { readonly token: string; readonly returnPath: string },
      IdentityFailure | "unknown_binding"
    >
  > {
    if (!this.auth0 || !this.environment.BESTEHEN_FLAG_EXTERNAL_PROVIDER_CALLS) {
      return { ok: false, error: "protocol_error" };
    }
    const callback = await this.auth0.callback(callbackUrl, now);
    if (!callback.ok) return callback;
    const binding = await this.repository.resolve(callback.value.proof);
    if (!binding.ok) return { ok: false, error: "unknown_binding" };
    const token = randomOpaqueToken();
    await this.repository.insert({
      id: appId<"app_session">(randomUUID()),
      tokenDigest: this.digest.digest("app-session", token),
      principalId: binding.value.principalId,
      learnerScopeId: binding.value.learnerScopeId,
      state: "active",
      createdAt: now,
      lastUsedAt: now,
      authenticatedAt: callback.value.proof.authenticationTime,
      idleExpiresAt: new Date(now.getTime() + sessionPolicyV1.idleMilliseconds),
      absoluteExpiresAt: new Date(now.getTime() + sessionPolicyV1.absoluteMilliseconds),
    });
    return { ok: true, value: { token, returnPath: callback.value.returnPath } };
  }

  public async authenticate(
    rawToken: string | undefined,
    now = new Date(),
  ): Promise<AuthorizedScope | undefined> {
    if (!rawToken) return undefined;
    const session = await resolveAndTouchAppSession(
      this.repository,
      this.digest.digest("app-session", rawToken),
      now,
    );
    if (!session) return undefined;
    return {
      principalId: session.principalId,
      learnerScopeId: session.learnerScopeId,
      actorKind: "owner",
      capabilities: [],
      authenticatedAt: session.authenticatedAt,
    };
  }

  public async logout(rawToken: string | undefined, now = new Date()): Promise<void> {
    if (!rawToken) return;
    const session = await this.repository.findByTokenDigest(
      this.digest.digest("app-session", rawToken),
    );
    if (session) await this.repository.revoke(session.id, now);
  }
}
