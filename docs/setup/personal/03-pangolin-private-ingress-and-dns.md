# Pangolin private ingress and DNS boundaries

Last verified: **2026-08-23**. Official references: Pangolin
[resource types](https://docs.pangolin.net/manage/resources/understanding-resources),
[private-resource authentication](https://docs.pangolin.net/manage/resources/private/authentication),
[destinations](https://docs.pangolin.net/manage/resources/private/destinations),
[blueprints/private HTTP mode](https://docs.pangolin.net/manage/blueprints), and
[DNS/networking](https://docs.pangolin.net/self-host/dns-and-networking).

Private resources require a Newt site and explicit client access. They are not public
HTTP resources with a login page, share link, PIN, or access token. Pangolin access is
an ingress control; Stage 03's App issuer+subject owner authorization remains mandatory.

### `NET-01` — Verify the existing Pangolin/Newt site

- **Owner:** Pangolin organization owner.
- **Action:** In **Sites**, open the existing Newt site serving the private LAN. Record installed Pangolin/Newt versions and connection health. Confirm no local/basic WireGuard site is being used for private resources.
- **Expected result:** the Newt site is connected and can resolve/reach VM-control and VM-app on their private network.
- **How to verify:** use the site's read-only health and a target reachability check; do not publish addresses.
- **Evidence:** date, versions, site class `newt`, and `verified`/`failed`.
- **Rollback:** stop before creating resources; restore the previously known-good Newt configuration if a reviewed change caused loss.
- **NEVER PASTE HERE:** Newt credentials, organization/site IDs, private routes/addresses, WireGuard keys, or dashboard export.

### `NET-02` — Create the owner-only Coolify resource

- **Owner:** Pangolin organization owner.
- **Action:** Create private resource `bestehen-coolify` in HTTP mode on the Newt site. Set its destination/port to the existing Coolify controller's private upstream and its internal full domain to the protected Coolify name. Grant only the owner user/machine; no role wildcard.
- **Expected result:** an authenticated Pangolin client with the owner grant reaches the Coolify HTTPS URL; a client without the grant sees no resource and cannot connect.
- **How to verify:** test once with the authorized client and once after removing access or from a separate ungranted client. Inspect TLS ownership: the browser-facing private name/certificate belongs to Pangolin; the upstream remains private.
- **Evidence:** resource class/name, method/port class, authorized/denied results, TLS result, and date.
- **Rollback:** disable the resource, remove the grant, and verify the tunnel is torn down; keep the controller private.
- **NEVER PASTE HERE:** private upstream address, owner identity, resource/site ID, client key, access token, or certificate private key.

### `NET-03` — Create the owner-only staging App resource

- **Owner:** Pangolin organization owner.
- **Action:** Create private HTTP resource `bestehen-staging` with internal full domain `staging.<owner-domain>`. Target only the Coolify web proxy/upstream on VM-app port `3000`; use the correct `http`/`https` method for the observed upstream. Grant only the owner user/machine. Do not route worker, database, Docker, or migrator ports.
- **Expected result:** the owner client reaches `https://staging.<owner-domain>/api/health/ready`; ungranted/no-client access fails; no Pangolin header is trusted as App identity.
- **How to verify:** positive HTTPS/health test plus anonymous/no-client and direct-port negative tests. Confirm the certificate covers the browser-facing name and only web traffic traverses Pangolin.
- **Evidence:** exact commit, normalized host class, status codes, denial results, certificate issuer/expiry class, and date.
- **Rollback:** disable the resource/grant first, then remove its alias/definition; verify the upstream is still reachable only on the private application network.
- **NEVER PASTE HERE:** owner domain, private target, owner/client identity, cookies, Pangolin headers, certificate key, or full URL in repository evidence.

### `NET-04` — Separate Pangolin naming from authoritative DNS

- **Owner:** Pangolin owner and authoritative-DNS owner.
- **Action:** Treat `bestehen-coolify` and `bestehen-staging` private names/aliases as Pangolin configuration. Create authoritative public DNS records only when a provider explicitly requires them: SES identity verification, three Easy-DKIM CNAMEs, custom MAIL FROM MX/SPF, and DMARC. If the existing self-hosted Pangolin control plane requires public A/AAAA/wildcard records and ports, inventory that pre-existing boundary; do not add or change it during `02E`.
- **Expected result:** no SES DNS record points at a Pangolin resource, and no private App/upstream address is placed in authoritative DNS.
- **How to verify:** compare the protected DNS inventory with SES's generated records and Pangolin's private resource list; resolve record types from an external resolver without publishing values.
- **Evidence:** record type/purpose/status only, split into `authoritative_dns` and `pangolin_private`; verification date.
- **Rollback:** remove only the new provider-verification record after disabling its provider dependency; private Pangolin aliases are removed in their own rollback steps.
- **NEVER PASTE HERE:** record values, owner domain, public/private IP, SES token/DKIM value, provider account ID, or DNS account credential.

### `NET-05` — Verify firewall and TLS ownership

- **Owner:** operations owner on the hosts and Pangolin boundary.
- **Action:** Allow only the ports required by the observed existing Pangolin deployment, approved administration, and private Newt path. Account for Docker-published port behavior. The Coolify public instance URL remains the protected controller URL; the App hostname remains the Pangolin private HTTP name; Pangolin owns browser-facing TLS, and Coolify owns only its private upstream/proxy configuration.
- **Expected result:** dashboard, worker, PostgreSQL, Docker, and container ports reject unsolicited traffic; the owner client receives valid HTTPS for each private name.
- **How to verify:** run bounded port/TLS checks from approved and unapproved locations. Confirm `/api/health/ready` routes only to web.
- **Evidence:** allowed port classes, denied port classes, TLS/health result, versions, and date.
- **Rollback:** close the newly opened rule or disable the resource; verify denial before deleting configuration.
- **NEVER PASTE HERE:** scan output with IPs/hostnames, firewall dump, certificate private material, private URLs, or authentication/session detail.

