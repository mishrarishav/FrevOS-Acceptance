# Acceptance Coverage Register

This register separates harness capability from product behavior. `Deferred`
means the corresponding FrevOS phase has not yet supplied an approved interface
or executable target; it does not mean the behavior passed.

| Area | Phase 2 state | Product phase or prerequisite |
| --- | --- | --- |
| Desktop browser execution | Harness-proven on synthetic fixture | Phase 3 screen contract |
| Mobile responsive execution | Harness-proven with Pixel 7 emulation | Phase 3, expanded in Phase 13 |
| Accessibility scan | Harness-proven WCAG A/AA automation | Phase 3 screen contract |
| Console/page errors | Harness guard proven | Phase 3 executable UI |
| Network failure state | Harness route control proven | Approved product failure behavior |
| Screenshots/traces/video | Failure retention configured | Any product-facing run |
| Happy paths and validation | Deferred | Relevant UI/API phase |
| Loading and empty states | Deferred | Phase 3 screen contract |
| Authentication and permission denial | Deferred | Phase 4 |
| Workspace isolation | Deferred | Phase 4 |
| Repository/default-branch safety | Deferred | Phase 5 and Phase 8 |
| Unauthorized tool calls | Deferred | Phase 6 |
| Approval states and replay denial | Deferred | Phase 6 and Phase 11 |
| Audit-event creation | Deferred | Phase 6 onward |
| Production deployment without approval | Deferred | Phase 11 |
| PWA/offline/slow network | Deferred | Phase 13 |

Each future row becomes implemented only through an acceptance-specific change
that names the target identity, behavior source, positive and negative cases,
browser projects, evidence, and limitations.
