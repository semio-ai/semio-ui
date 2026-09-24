# Figma Code Connect & Organization Tier — Upgrade Evaluation

**Audience:** whoever decides on the Figma plan. No engineering background assumed.
**Question it answers:** Should we upgrade Figma from **Professional** to **Organization/Enterprise** to unlock **Code Connect**, given we already maintain a code component library that is the real source of truth?
**Status:** for discussion — pricing must be confirmed against Figma's current plans page.

---

## TL;DR

We ship our UI from a **code** component library (`@semio/ui`) — that is the real, running product. We also keep a **Figma** file ("Semio UI Library") where design and prototyping happen. For these two to agree, the design tool needs to know what the real components and their options are.

**Code Connect** is the Figma feature that makes that link automatic: when anyone opens a component in Figma's developer view, they see *our actual code* (e.g. `<Icon name="trash" />`) instead of generic, machine-guessed markup. We deliberately engineered our icon system so this link is clean and automatable.

The catch: **Code Connect requires the Organization or Enterprise plan.** We're on Professional, so it's unavailable today (confirmed — the API returns *"You need a Dev or Full seat on an Organization or Enterprise plan to use Code Connect"*).

**Recommendation in one line:** if design↔code handoff is becoming a regular, multi-person activity, the upgrade pays for itself in handoff accuracy and unlocks the icon round-trip we've already built for. If it's still one or two people handing off occasionally, stay on Professional and use the manual naming convention (described below), then revisit as the team grows.

---

## Background: two sources of truth that must agree

| | What it is | Who uses it |
|---|---|---|
| **Code library** (`@semio/ui`) | The real components that ship in the product. The **source of truth**. | Engineers |
| **Figma library** ("Semio UI Library") | The design-tool version used to mock up screens and prototype. | Designers / PM |

When a designer mocks up a screen, an engineer has to rebuild it in code. The closer the Figma version matches the real components (same names, same options, same icons), the faster and less error-prone that handoff is. Today, matching them is **manual**.

We recently rebuilt the icon system specifically to make this matching automatable: every icon is now a **named key** (e.g. `"trash"`, `"close"`) shared by code and design, with the contract **registry key == Figma component name == handoff output**. That contract only pays off automatically *with* Code Connect.

---

## What Code Connect actually does (plain language)

Without it, Figma's "developer view" (Dev Mode) shows **auto-generated** CSS/markup that approximates a frame — it doesn't know about our components, so an engineer reads it and re-writes it by hand.

With Code Connect, each Figma component is pointed at its real code counterpart. Now the developer view shows **our actual API**:

- A button in Figma → `<Button variant="primary" size="md">…</Button>`
- An icon picked from a dropdown → `<Icon name="trash" />`

For icons this is the whole game: a designer visually picks an icon in a component's "swap icon" slot, and the handoff tells the engineer the exact `name` string to use — no guessing, no mismatch.

---

## What we gain WITH the upgrade (Organization/Enterprise)

Practical, team-level benefits:

1. **Accurate handoff.** Design → code uses the real component API. Fewer "that's not quite our button" rebuilds; faster prototyping-to-product.
2. **The icon round-trip we already engineered.** Pick an icon in Figma → get the correct `<Icon name>` automatically. This is the explicit reason the icon registry was built the way it was.
3. **Design-system analytics.** See which components/icons are actually used across files, where instances were detached/modified, and adoption over time — useful for keeping design and code from drifting.
4. **Library branching.** Make changes to the shared library on a "branch" and review them before publishing — like pull requests, but for design. Important once more than one person edits the library.
5. **Governance at team scale.** Central admin, shared publishing, and (Enterprise) SSO — the things that matter when the team grows beyond a few people.

> Note: items 3–5 are general Organization-tier features, not Code Connect specifically. They're part of what the higher tier buys.

---

## What we keep WITHOUT upgrading (Professional, today)

It's not nothing — most of the *prototyping* value survives:

- A real Figma icon library (once built) with components named by key.
- **Instance-swap pickers** — designers can still visually pick an icon in a component slot. This works on any plan.
- Visual parity between design and product.

What we lose by staying on Professional:

- **No automatic code in Dev Mode.** Engineers translate the design to `<Icon name>` by hand. Our naming convention makes this a near-mechanical 1:1 lookup, but nothing *enforces* it, so drift is possible.
- **No design-system analytics or library branching.**
- It **scales worse with people** — more designers/engineers means more manual translation and more chances to drift.

**Net:** on Professional, prototyping works and the icon naming convention keeps things close; the design↔code handoff is just more manual and less governed.

---

## What an AI agent can already do on Professional (pilot-tested 2026-06-24)

Separately from Code Connect, Figma now exposes an **MCP server** that lets an external AI agent (e.g. Claude Code) read *and* **write** to the canvas — and per Figma's docs the remote server is **"available on all seats and plans,"** i.e. it works on our current Professional plan (only Code Connect needs Organization/Enterprise).

We piloted this directly: an agent created three components in the "Semio UI Library" file, named by registry key (`search`, `chevron-down`, `box`), generated faithfully from our code's SVGs — spanning both icon sources (Tabler, semio-custom) and styles (stroke, fill). It worked first try on Professional.

**What this changes:** building the keyed icon library (the ~332 components) is **largely agent-automatable today**, not the manual design slog assumed earlier. The agent can also write to the canvas using existing design-system variables (the pilot's Button readout already surfaced our color/font variables).

**What the pilot also confirmed the upgrade is *narrowly* for:** when an engineer inspects a design *without* Code Connect, the handoff shows a **generic reconstruction**, not our API:
- an icon reads back as `Box` / `Search` as an `<img>`, not `<Icon name="box" />`;
- the Button reads back as a styled `<div>` + `<img>` + "Save" text, not `<Button variant="primary" leftIcon="save">`.

So the Organization upgrade's specific payoff is **turning that handoff readout into our real component API.** Everything else — agent-built library, instance-swap pickers, variables in the readout — is already available on Professional.

**And even that payoff is largely approximable on Professional.** Code Connect's job is a mapping from Figma component → our code API; that mapping can live on *our* side (our components are named by registry key, so the translation is deterministic) and be applied by our agent when it reads a design. That gives "Code Connect's output" agent-side, for free. What the upgrade then uniquely adds is **native Figma Dev-Mode snippets for developers who don't use our agent**, plus Figma-hosted enforcement/analytics of the mapping. So the decision sharpens to: *do non-agent developers regularly copy code out of Figma Dev Mode?* If yes, upgrade; if our handoff is agent-driven, Professional covers it.

## Cost vs. value

**Cost** (confirm exact figures on Figma's current pricing page — these move):

- Organization is a per-editor/month step up from Professional, plus the need for **Dev or Full seats** for the people doing handoff.
- Some admin/migration overhead to move the team into an Organization.

**Value** scales with how much the team actually hands off design→code:

- High-frequency, multi-person handoff → the time saved and mistakes avoided add up quickly, and the icon automation we built starts paying back.
- Low-frequency, 1–2 person → the manual naming convention is probably "good enough," and the upgrade is harder to justify on handoff alone (though analytics/governance may still appeal).

---

## Decision guide

**Lean upgrade if several are true:**

- More than ~2 people regularly hand off between design and code.
- Prototyping/handoff is a frequent, ongoing activity (not occasional).
- The design system is central to how we work, and keeping design/code in sync is a recurring pain.
- We want the icon (and component) round-trip automated, plus analytics/governance.

**Lean stay-on-Professional if:**

- It's still 1–2 people and handoff is infrequent.
- The manual naming convention is acceptable for now.
- Budget is the binding constraint and the team isn't scaling yet.

---

## What an upgrade does *not* remove (still required either way)

- The **Figma icon library must be built** — ~332 icon components named by key. Pilot-tested: this is **largely agent-automatable on Professional** via the Figma MCP server (no upgrade needed for this part), with light design cleanup. (See the pilot section above and the companion engineering plan.)
- A small amount of **repo setup** for Code Connect, which only activates on the higher tier. It's been scoped so it's a drop-in when/if we upgrade — nothing built now is wasted.

---

## Bottom line

We've already done the hard, plan-independent part on the code side (a named-key icon system designed to round-trip with Figma). The upgrade question is really: **is our design↔code handoff frequent and multi-person enough that automating it — instead of doing it by a naming convention by hand — is worth the per-seat cost?** If yes (or soon), upgrade and we turn the automation on with minimal extra work. If not yet, we proceed on Professional with the manual convention and keep everything upgrade-ready.

See **[icon-figma-integration-plan.md](icon-figma-integration-plan.md)** for how we proceed on the code side either way, structured so flipping plans later is a drop-in rather than a rebuild.
