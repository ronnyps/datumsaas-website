# Working agreements

## Priority and scope

- User instructions and this `AGENT.md` take precedence over any individual skill guidance.
- Skills are opt-in only: do not read or apply any skill unless the user explicitly asks for that specific skill in the current conversation.

## Skill locations

- Base project skills root: `.agents/skills/`
- Always-on:
  - `context-optimization` -> `.agents/skills/context-optimization/SKILL.md`
- Superpowers root: `.agents/skills/superpowers/`
  - `brainstorming` -> `.agents/skills/superpowers/brainstorming/SKILL.md`
  - `writing-plans` -> `.agents/skills/superpowers/writing-plans/SKILL.md`
  - `systematic-debugging` -> `.agents/skills/superpowers/systematic-debugging/SKILL.md`
  - `verification-before-completion` -> `.agents/skills/superpowers/verification-before-completion/SKILL.md`
  - `executing-plans` -> `.agents/skills/superpowers/executing-plans/SKILL.md`
  - `test-driven-development` -> `.agents/skills/superpowers/test-driven-development/SKILL.md`
  - `requesting-code-review` -> `.agents/skills/superpowers/requesting-code-review/SKILL.md`
  - `receiving-code-review` -> `.agents/skills/superpowers/receiving-code-review/SKILL.md`
  - `finishing-a-development-branch` -> `.agents/skills/superpowers/finishing-a-development-branch/SKILL.md`
  - `using-git-worktrees` -> `.agents/skills/superpowers/using-git-worktrees/SKILL.md`
  - `dispatching-parallel-agents` -> `.agents/skills/superpowers/dispatching-parallel-agents/SKILL.md`
  - `subagent-driven-development` -> `.agents/skills/superpowers/subagent-driven-development/SKILL.md`
  - `writing-skills` -> `.agents/skills/superpowers/writing-skills/SKILL.md`
  - `using-superpowers` -> `.agents/skills/superpowers/using-superpowers/SKILL.md`
- Design skills root: `.agents/skills/designs/`
  - `designs/*` -> `.agents/skills/designs/*/SKILL.md`
  - `emil-design-eng` -> `.agents/skills/emil-design-eng/SKILL.md`

## Skills default behavior (strict)

- Do not load any skill by default.
- Do not open `SKILL.md` files unless the user explicitly requests it.
- Do not apply “always-on” skill behavior unless the user explicitly asks for it.
- If the user does not mention a skill, proceed with standard coding workflow directly.

## Superpowers: situational only

- `executing-plans`: only when a concrete written plan already exists.
- `test-driven-development`: for behavior changes, regressions, or high-risk logic.
- `requesting-code-review` and `receiving-code-review`: only during review cycles.
- `finishing-a-development-branch`: only when implementation is complete and ready to integrate.
- `using-git-worktrees`: only when isolation is needed.
- `dispatching-parallel-agents` and `subagent-driven-development`: only for independent, parallelizable tasks.
- `writing-skills`: only when creating or editing skills.
- `using-superpowers`: policy/reference skill, not required to run for every request.

## Design skills: explicit invocation only

- `designs/*` skills are opt-in and must be used only when explicitly requested.
- `emil-design-eng` is opt-in and should only be used when explicitly invoked.
- Do not activate design skills by default during regular engineering tasks.

## Execution discipline

- Do not start coding immediately without a short plan.

## Project CSS discipline (strict)

- No inline CSS allowed (`style=""` or Vue `:style` for presentation).
- All styling must live in recognizable `.css` files under the project style structure.
- Prefer class-based styling and reusable tokens over one-off visual overrides.
