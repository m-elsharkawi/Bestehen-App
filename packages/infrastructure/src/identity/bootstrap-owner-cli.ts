import { randomUUID } from "node:crypto";
import { appSecuritySecret, databaseUrlFor, parseServerEnvironment } from "@bestehen/configuration";
import { appId } from "@bestehen/domain";
import { HmacDigest } from "../crypto.js";
import { bootstrapPersonalOwner } from "../postgres/foundation-repository.js";
import { createPostgresPool, foundationRevision } from "../postgres/index.js";

async function main(): Promise<void> {
  const { BESTEHEN_AUTH0_OWNER_SUBJECT: ownerSubject, ...serverInput } = process.env;
  const environment = parseServerEnvironment(serverInput);
  if (!ownerSubject || ownerSubject.length > 512) {
    throw new Error("Protected owner subject is unavailable or malformed");
  }
  const subject = ownerSubject;
  if (environment.BESTEHEN_SCHEMA_MIN_REVISION !== foundationRevision) {
    throw new Error("Owner bootstrap requires the exact Stage 03 foundation revision");
  }
  if (
    !environment.BESTEHEN_AUTH0_ISSUER_BASE_URL ||
    !environment.BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE
  ) {
    throw new Error("Owner bootstrap requires protected Auth0 binding configuration");
  }
  const pool = createPostgresPool(databaseUrlFor(environment, "migrator"), { max: 1 });
  try {
    const digest = new HmacDigest(appSecuritySecret(environment));
    const result = await bootstrapPersonalOwner(pool, {
      issuer: environment.BESTEHEN_AUTH0_ISSUER_BASE_URL,
      subject,
      subjectFingerprint: digest.digest(
        "identity-subject",
        `${environment.BESTEHEN_AUTH0_ISSUER_BASE_URL}\0${subject}`,
      ),
      allowlistReference: environment.BESTEHEN_AUTH0_OWNER_ALLOWLIST_REFERENCE,
      principalId: appId<"principal">(randomUUID()),
      learnerScopeId: appId<"learner_scope">(randomUUID()),
      credentialBindingId: randomUUID(),
      operationId: randomUUID(),
      verifiedAt: new Date(),
    });
    process.stdout.write(`Owner bootstrap result: ${result}\n`);
    if (result === "conflict") process.exitCode = 2;
  } finally {
    await pool.end();
  }
}

main().catch(() => {
  process.stderr.write("Owner bootstrap failed without exposing protected identity input.\n");
  process.exitCode = 1;
});
