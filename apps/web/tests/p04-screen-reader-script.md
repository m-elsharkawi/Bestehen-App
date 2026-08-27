# Stage 04 keyboard and screen-reader script

Repository automation checks semantics and axe rules. A human must run this script on
the accepted private-staging commit before claiming branded browser or assistive
technology support.

1. At 320 CSS pixels, open the signed-out entry. Use only the keyboard. Confirm the
   skip link moves focus to the main landmark, the page has one level-one heading,
   the sign-in action says it uses an email code, and no credential field is inside
   Bestehen.
2. On Coach at compact and large widths, read landmarks and primary links. Confirm
   Coach, Readiness, Train, and Progress stay in that order, exactly one is current,
   Account is outside that destination set, and the dominant plan action comes before
   supporting evidence.
3. On the Writing fixture, confirm primary navigation is absent. Read the attempt
   conditions, prompt, draft label, saved-state sentence, and action. At 200 percent
   text zoom, confirm focus and the sticky action do not cover the editor.
4. On the Readiness fixture, read the summary before the table. Confirm Written and
   Oral are separate, missing values say "Not enough evidence", state is announced
   in words, and Gates A through F each include met or not met plus a reason.
5. On the expired-mid-attempt fixture, confirm the page says draft, elapsed time, and
   conditions are preserved, then says the server decides final validity. It must not
   claim that the attempt counts.
6. On draft conflict, compare both named branches, move through the three radio
   choices, and confirm no branch disappears before a choice. On transfer failure,
   confirm the local-artifact and affected-scope sentences are read.
7. Enable forced colors and reduced motion. Repeat keyboard focus, selected-state,
   error, Readiness, and transfer checks. Record browser, OS, screen reader and
   versions, date, accepted commit, pass/fail, and limitations without private data.
