# GitHub and repository source

Last verified: **2026-08-23**. Official references: GitHub
[secure use](https://docs.github.com/en/actions/reference/security/secure-use),
[Actions secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions),
[deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments),
[Dependency Graph](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph),
and [rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

### `GH-01` — Recheck repository controls

- **Owner:** repository owner in GitHub.
- **Action:** Open **Settings → Security → Advanced Security** and **Insights → Dependency graph**. Confirm this private repository's Dependency Graph remains enabled. Record whether plan-dependent rulesets/GHAS controls are available; do not buy or enable them for this checkpoint.
- **Expected result:** Dependency Graph is enabled. A plan-upgrade response for private-repository rulesets/GHAS is recorded as unavailable, not as a failed security gate.
- **How to verify:** View the Dependency Graph package list and the latest green `P01 exact-lock dependency audit` check.
- **Evidence:** verification date, `dependency_graph=enabled`, `ghas=unavailable_or_declined`, and check URL only.
- **Rollback:** If a setting was changed accidentally, restore its prior state and verify existing mandatory CI still runs.
- **NEVER PASTE HERE:** account email, billing detail, recovery code, session cookie, token, private settings export, or support correspondence.

### `GH-02` — Create the selected-repository Coolify GitHub App

- **Owner:** repository owner in Coolify and GitHub, after accepted/merged `02E`.
- **Action:** In Coolify choose **Sources → Add → GitHub App**, follow the GitHub installation flow, select **Only select repositories**, and select `m-elsharkawi/Bestehen-App` only. Accept only Coolify's currently documented minimum read/webhook permissions. Do not add runtime provider secrets to GitHub.
- **Expected result:** Coolify can list and clone only this repository; previews and branch autodeploy remain off.
- **How to verify:** In Coolify select the repository and resolve an exact 40-character commit without deploying it; in GitHub review the installation's repository access.
- **Evidence:** date, repository slug, permission names, and redacted `verified` result. Do not record installation/account IDs.
- **Rollback:** Suspend or uninstall the GitHub App, then verify Coolify can no longer refresh the source. Existing Git history is unaffected.
- **NEVER PASTE HERE:** App private key, client secret, webhook secret, installation token, owner identity, or generated manifest.

### `GH-03` — Preserve exact-lock CI

- **Owner:** agent/repository owner using the accepted repository workflow.
- **Action:** Require a green pull-request run before merge by operating policy. Keep frozen install, full-SHA Actions, read-only permissions, secret-free PR jobs, `pnpm audit --audit-level=critical`, source/lifecycle policy, and dependency/license inventories.
- **Expected result:** all seven existing jobs run; `P01 exact-lock dependency audit` remains blocking and provider-neutral.
- **How to verify:** Inspect the exact-head run. Confirm `pnpm-lock.yaml` digest and no job is skipped, `continue-on-error`, or replaced by a GHAS-only gate.
- **Evidence:** exact candidate SHA, workflow/run/job URLs, and check IDs.
- **Rollback:** Revert only the faulty workflow change; never force-push or weaken the exact-lock audit to obtain green.
- **NEVER PASTE HERE:** Actions secrets, environment values, raw audit artifacts with private metadata, or GitHub tokens.

### `GH-04` — Record source readiness

- **Owner:** agent via read-only GitHub access.
- **Action:** Confirm the PR head, branch, base, draft/open state, and exact accepted merge commit for the later checkpoint.
- **Expected result:** one unambiguous commit is eligible; a branch tip or dirty tree is not.
- **How to verify:** Compare local `git rev-parse HEAD`, remote branch head, and PR `headRefOid`; require equality.
- **Evidence:** public repository coordinates, exact commit, run URL, and `verified`/`failed` only.
- **Rollback:** Stop before deployment on mismatch; fetch and repeat from the accepted commit.
- **NEVER PASTE HERE:** authenticated remote URL, SSH key, token, private owner detail, or environment dump.
