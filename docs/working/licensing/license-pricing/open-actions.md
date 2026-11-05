# Licensing context contract handoff

## Open work

- Implement currency-independent `productQuantities` extraction for served history
  from agreeing counts in stored currency blocks; missing free/excluded quantities
  need future engine evidence, while known stored counts are usable now.
- Deploy updated history readers before API emission of the optional quantity map.

- Publish the reviewed package through the normal release workflow.
- Adopt it for [API context reads and last-write-wins saves](../../../../../api/specs/licensing/license-pricing/license-pricing-api-context.md).
- Implement the [portal product/account notes and plan review workflow](../../../../../ui/Specs/licensing/license-pricing/license-pricing-ui-context.md).

## Contract scope

The [shared contract](../../../../specs/licensing/license-pricing/license-pricing-types-package.md)
supports product strategy/notes/review date and account notes. Compact collections
carry shared attribution; detail routes carry note bodies. Context stays outside
the license summary pipeline. ETag retries are internal persistence policy rather
than a client revision contract.

API/UI workflow implementation and registry publication are separate work.
The broader package spec checker has unrelated legacy errors.

## Local verification

- Full `npm test`, including build, contract typechecking and packed NodeNext/
  CommonJS declaration and CJS/ESM runtime consumers, passed in an isolated snapshot.
- Full lint passed; the final collection-boundary adjustment also passed focused
  contract-code lint. Source, tests and consumer fixture hashes match the snapshot.
- The 18 revised context tests cover minimal fields, shared attribution,
  revision-free responses, dates, scope, sparse arrays and storage/collection bounds.
- Served-history quantity contracts add four CJS/ESM cases for currency-independent
  counts, nullable money, legacy responses, malformed quantities and unchanged
  engine snapshot validation. The packed consumer fixture checks their declarations.
- Generated context artifacts were synchronized to the working checkout.
- The complete verified build was synchronized after all 587 source files matched
  the validation snapshot. All 60 M365 contract cases then passed in the working
  checkout, including the four new history-quantity cases.
- Core/API/UI spec validation and changed spec links pass. The local types contract
  spec passes; unrelated package spec-lint errors remain outside this work.

