# Auth0 EU Passwordless Email OTP and closed owner registration

Last verified: **2026-08-23**. Official references: Auth0
[tenant creation](https://auth0.com/docs/get-started/auth0-overview/create-tenants),
[multiple environments](https://auth0.com/docs/get-started/auth0-overview/create-tenants/set-up-multiple-environments),
[Passwordless Email OTP](https://auth0.com/docs/authenticate/passwordless/authentication-methods/email-otp),
[Passwordless with Universal Login](https://auth0.com/docs/authenticate/passwordless/passwordless-with-universal-login),
[Management API user provisioning](https://auth0.com/docs/manage-users/user-accounts/manage-users-using-the-management-api),
[application settings](https://auth0.com/docs/get-started/applications/application-settings),
[pre-user-registration](https://auth0.com/docs/customize/actions/explore-triggers/signup-and-login-triggers/pre-user-registration-trigger),
[post-login](https://auth0.com/docs/customize/actions/explore-triggers/signup-and-login-triggers/login-trigger),
[tenant sessions](https://auth0.com/docs/get-started/tenant-settings), and
[SMTP providers](https://auth0.com/docs/customize/email/smtp-email-providers).

Use the generally available Passwordless **Email** connection named/strategized
`email`, not an Early Access Flexible Identifiers database connection. Use OTP, not a
magic link or password. App routes and server authorization are Stage 03 work.

### `AUTH-01` — Create the isolated EU staging tenant

- **Owner:** Auth0 account owner after accepted/merged `02E`.
- **Action:** In the Auth0 tenant selector choose **Create Tenant**, choose the staging environment tag and region **EU**, and create an owner-only staging tenant. Record the displayed immutable region/sub-locality in the protected ledger.
- **Expected result:** tenant settings identify EU and Staging; no production application/user is present.
- **How to verify:** read tenant Settings/Overview. A wrong immutable region is a stop condition.
- **Evidence:** `tenant_region=EU`, environment, provider sub-locality category, checked date, and result—no tenant name/domain.
- **Rollback:** delete an empty wrong-region tenant and recreate it before adding identities.
- **NEVER PASTE HERE:** tenant name/domain, admin email, account ID, recovery codes, session, or support export.

### `AUTH-02` — Create the Regular Web Application

- **Owner:** Auth0 account owner.
- **Action:** Open **Applications → Applications → Create Application**, select **Regular Web Application**, OIDC/RS256 and Authorization Code with PKCE. Set Allowed Callback URL exactly to `https://staging.<owner-domain>/auth/callback`; Allowed Logout URL and Allowed Web Origin exactly to `https://staging.<owner-domain>`. Enable no wildcard, localhost, implicit/password grant, cross-origin authentication, or production URL.
- **Expected result:** one staging web client has exactly the three allowlisted URI entries.
- **How to verify:** compare each dashboard field against the [origin matrix](./README.md#origin-and-callback-matrix) character-for-character and run a wrong-origin callback denial test later.
- **Evidence:** application type, algorithm/flow, normalized URI classes, wildcard=false, date, and result.
- **Rollback:** disable/delete the empty application or restore the previous exact URI list; verify the removed callback fails.
- **NEVER PASTE HERE:** client ID/secret, tenant domain, owner domain, callback state/code, session, or application export.

### `AUTH-03` — Enable only GA Passwordless Email OTP

- **Owner:** Auth0 account owner.
- **Action:** Open **Authentication → Passwordless**, enable **Email**, choose OTP rather than magic link, configure a short reviewed OTP expiry/length, enable **Disable Sign Ups**, and enable the connection only for the staging application. Under **Authentication Profile**, select **Identifier First**. Disable every database, SMS, social, enterprise, and fallback connection for this application.
- **Expected result:** the sole enabled connection has name/strategy `email`, OTP delivery, and signups disabled.
- **How to verify:** inspect **Authentication → Passwordless → Email** and the application's **Connections** tab. Later call `/authorize` with `connection=email`; Auth0 must prompt for a fresh email OTP rather than reuse SSO.
- **Evidence:** `connection=email`, `method=otp`, `disable_signups=true`, enabled-connection count, and date.
- **Rollback:** disable the Email connection for the application; do not enable a password fallback.
- **NEVER PASTE HERE:** OTP, email address, template body with identity, client secret, tenant domain, code/state/nonce, or session cookie.

### `AUTH-04` — Configure SES as Auth0's email provider

- **Owner:** Auth0 and AWS account owner after `SES-01` through `SES-06`.
- **Action:** In **Branding/Email Provider** select custom SMTP and enter the SES Frankfurt SMTP endpoint/port/TLS, dedicated Auth0 SMTP username/password, and verified From identifier directly in Auth0. Use content-minimal OTP templates. Do not use Auth0's built-in test provider beyond an isolated pre-SES check.
- **Expected result:** Auth0 reports the custom provider configured and a sandbox-safe owner OTP arrives with no learning/profile content.
- **How to verify:** use the hosted Universal Login OTP flow for the pre-provisioned owner; inspect authentication headers/result without recording address, OTP, body, or message ID.
- **Evidence:** provider class `ses_smtp`, region `eu-central-1`, TLS, delivery/authentication result, and date.
- **Rollback:** disable OTP sends, rotate/revoke the SMTP credential, restore the prior disabled state, and verify the old credential fails.
- **NEVER PASTE HERE:** SMTP username/password, From/domain, OTP, message/body/headers, recipient, client secret, or Auth0 log event.

### `AUTH-05` — Bind the pre-user-registration allowlist Action

- **Owner:** Auth0 account owner.
- **Action:** Open **Actions → Library → Build Custom**, create a Pre User Registration Action that normalizes `event.user.email`, requires the Passwordless `email` connection, compares only to an Action secret holding the protected owner allowlist, and calls `api.access.deny` otherwise. Deploy and bind it under **Actions → Triggers → Pre User Registration**. Keep disabled signups as the primary control.
- **Expected result:** any unexpected registration is denied before user creation; the allowlist is absent from code/log text.
- **How to verify:** run a synthetic disallowed-address registration test and confirm a generic denial/no user creation. Do not reveal the attempted address in evidence.
- **Evidence:** Action version/digest, trigger binding, `disallowed=denied`, user-created=false, and date.
- **Rollback:** remove the binding and disable the whole connection while correcting it; never leave signups open.
- **NEVER PASTE HERE:** Action secret, owner/disallowed email, Action source with embedded identity, tenant log, token, or event body.

### `AUTH-06` — Provision exactly one Passwordless owner

- **Owner:** Auth0 account owner using a one-use Management API client.
- **Action:** Create a temporary Machine-to-Machine client authorized only for Auth0 Management API `create:users`. Add its client ID temporarily to the `email` connection's `enabled_clients`. Obtain a short-lived token in the protected session and call `POST /api/v2/users` with the protected owner address and `connection: "email"`. Do not use the Dashboard create-user form; it does not create Passwordless users. Remove the client from `enabled_clients`, revoke/delete its credential and client.
- **Expected result:** exactly one `email`-connection user exists; the temporary principal can no longer create or read users. The owner is not treated as verified until the real OTP flow succeeds.
- **How to verify:** inspect a count/result in the dashboard, complete one OTP, and require a subsequent create call with the revoked token to fail.
- **Evidence:** `created_count=1`, `connection=email`, OTP result, temporary-client removed/revoked, and date.
- **Rollback:** disable the connection and delete the empty/test user only after confirming no App binding/data duty exists; revoke temporary access first.
- **NEVER PASTE HERE:** owner email, JSON request, Management token/client secret/client ID, user/tenant ID, OTP, provider response, or command history.

### `AUTH-07` — Bind the post-login allowlist Action

- **Owner:** Auth0 account owner.
- **Action:** Create/deploy a Post Login Action that requires the Passwordless Email method, normalized verified owner email, expected application client, and the protected allowlist secret; call `api.access.deny` for every other identity. Bind it in the Login flow. This is defense in depth, not App authorization.
- **Expected result:** the allowed pre-provisioned owner completes OTP; another identity or connection is denied before tokens return.
- **How to verify:** perform allowed-owner and synthetic disallowed-identity flows. Confirm Stage 03 still must bind issuer+subject server-side and that neither email nor Pangolin headers authorize App data.
- **Evidence:** Action version/digest, trigger binding, allowed/denied result classes, connection method, and date.
- **Rollback:** disable the App/connection while repairing the Action; never bypass it with another connection.
- **NEVER PASTE HERE:** email, issuer/subject, client ID/secret, token/claims, Action secret/source containing identity, OTP, or session.

### `AUTH-08` — Configure session and recent-auth policy

- **Owner:** Auth0 and App security owner.
- **Action:** Configure the tenant session to match `session-policy/v1`: 24-hour idle and seven-day absolute maximum. The later App session uses an opaque same-origin cookie and requires OTP no older than ten minutes for adoption, credential changes, export, deletion, and revoking other sessions.
- **Expected result:** provider and App policy boundaries are documented without claiming Auth0 session settings replace App revocation.
- **How to verify:** inspect tenant settings and later test idle/absolute expiry, fresh OTP, logout, and revoked session denial.
- **Evidence:** policy revision, durations, result class, and date; no cookie/token.
- **Rollback:** tighten or disable sign-in while correcting drift; do not extend a session silently.
- **NEVER PASTE HERE:** session cookie, refresh/access/ID token, user email, recovery code, tenant/client identifiers, or browser storage.

### `AUTH-09` — Verify hosted login accessibility and failure

- **Owner:** owner/tester in the later identity stage.
- **Action:** Test New Universal Login and OTP with keyboard, copy/paste, current Safari/VoiceOver and Firefox or Chrome/NVDA, 320 CSS-pixel reflow, 200% zoom, representative 400% desktop reflow, expiration, wrong code, rate limit, and email-provider outage. No CAPTCHA/memory test may be the only core route.
- **Expected result:** labels/errors/focus are usable and failures preserve unrelated/local work; no password fallback appears.
- **How to verify:** execute the manual supported-AT script plus automated checks. A provider accessibility statement is not release evidence.
- **Evidence:** browser/AT versions, scenario IDs, result/issue classes, and date; no recording or identity.
- **Rollback:** keep sign-in disabled/fake and preserve guest/local work until the failing flow is corrected.
- **NEVER PASTE HERE:** screen recording with identity/OTP, email, token, session, accessibility/medical inference, or provider log.

### `AUTH-10` — Recovery, rotation, and provider exit

- **Owner:** identity/security owner.
- **Action:** Protect tenant-admin MFA/recovery offline. Rotate App/Action/SMTP/session secrets using overlap where supported, then revoke old values. For exit, export tenant/application/connection/Action configuration and provider identifiers into a protected migration record, map issuer+subject to stable App principals, re-verify email at the successor, and revoke Auth0 without rewriting learner facts.
- **Expected result:** loss of email plus no valid App session has no unsafe override; old credentials/sessions fail; App-owned IDs survive provider change.
- **How to verify:** annual/triggered rotation and a provider-neutral synthetic binding migration rehearsal.
- **Evidence:** credential class/version, overlap/revoke result, migration manifest digest, and date.
- **Rollback:** reactivate only a still-valid verified predecessor during overlap; otherwise keep sign-in closed and use the documented recovery limit.
- **NEVER PASTE HERE:** recovery code, email, issuer/subject, export body, client/Action/session secret, signing material, token, or App principal ID.

