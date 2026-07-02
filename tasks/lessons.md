# Lessons

- When the user asks for Radar and Research homepage content, do not assume they should be grouped into a single section. Confirm whether they should be independent numbered sections before writing the spec.
- For Research copy, do not mention that Blink is incubated by UFF unless the user explicitly asks. Frame Research as the place where Blink presents academic papers, research, and tools to Brazilian PMEs.
- When the user provides a glass blog card as inspiration, preserve the editorial preview pattern: compact article-like window, visible tags/title/excerpt/metadata, and one clear click path. Do not inflate it into pinned full-screen stacking animation that hides the section sequence.
- When adding a Next.js endpoint for Blink Press, do not treat helper tests as enough. Verify the canonical checkout path (`blink-press`), confirm `next build` lists the new `app/api/...` route, and call the endpoint locally before marking the homepage integration complete.
- When solving Blink Radar SEO, do not reduce the task to a tactical header/proxy patch. First map the project decision: which app owns the canonical domain, where Radar/Research should live long term, how `blinksite` and `blink-press` should relate, and only then choose the implementation path.
