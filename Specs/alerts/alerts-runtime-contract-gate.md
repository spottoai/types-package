# Alert runtime contract gate

Status: implemented and verified
Date: 2026-10-03
Parent: `core/specs/alerts/alerts-near-real-time-remediation.md`

The follow-up review found that the claimed `check:alert-contracts` wiring was absent from the current package. The user authorized its restoration. The existing runtime assertions cover the anomaly threshold, early-spend defaults and object independence, quick-alert membership, and data-basis mapping; compile-time contract checks already run in the build.

Task: edit `package.json` to expose `check:alert-contracts` and invoke it immediately after the fresh build in `npm test`. Verify by running `npm test` and checking that the alert assertions execute alongside the other existing gates. Preserve every other script. No public contracts, dependencies, package versions, or consumer behavior change. Rollback removes only this script wiring.

Verification: `npm test` passed on Node 24.19.0, including both builds, compile-time contracts, `check:alert-contracts` (`alert contracts OK`), all other runtime contract checks, and the packed CommonJS/ESM consumer fixture. Existing regulatory-scoreboard script changes were preserved.
