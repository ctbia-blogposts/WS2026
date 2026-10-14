# WS2026 seminar publication

The seminar identity, semester, navigation and optional logos are in `_data/seminar.yml`. `_config.yml` holds deployment metadata: `url: https://ctbia-blogposts.github.io` and the case-sensitive `baseurl: /WS2026`. Change the host if the organization changes. The publication title also appears in `_config.yml` for metadata, so update both when renaming the seminar.

## Preview with Docker

Start Docker Desktop, then run from the repository root:

```sh
docker compose up --build -d
```

Open **http://localhost:8080/WS2026/**. The bind mount watches article and asset changes. Configuration changes restart Jekyll. The generated site stays inside the container at `/tmp/_site`, avoiding host bind-mount write deadlocks. The image builds from Ruby 3.3 and installs the repository's locked gems; it does not depend on an unrelated latest al-folio image. The entry point never restores or deletes the host's lockfile.

```sh
docker compose logs --tail=80
docker compose exec jekyll bundle exec jekyll build --destination /tmp/_site
docker compose down
```

For a native build, use Ruby 3.3 or newer, `bundle install`, and `bundle exec jekyll build`. For formatting and design verification, run `npm ci`, `npm run lint:prettier`, `npm run lint:style-contract`, then `npx playwright install chromium webkit` and `npm run test:visual`. Visual checks target this seminar, with the full Distill demo also available from the index. Run `bash test/integration_seminar_distill.sh` to build the original Distill demo and verify its native structure alongside the seminar example. To use the already running Docker preview for tests:

```sh
NO_WEBSERVER=1 SEMINAR_PREVIEW_URL=http://127.0.0.1:8080/WS2026 npm run test:visual
```

GitHub Actions continues to build Jekyll and publish `_site` to `gh-pages`. Enable GitHub Pages from that branch in repository settings. The configured baseurl is used by the build without an overriding CLI flag. No root archive or cross-year site is implemented.

## Add a student article

The student-facing [submission workflow](https://ctbia-blogposts.github.io/WS2026/writing-guidelines/#submit-your-article-with-a-pull-request) explains forks, pull requests, and requests to publish an online draft. PR builds run checks; deployment to the shared site happens after merge.

Copy `docs/examples/seminar-post.md` into a dated Markdown file under `_posts/`. Keep the template's `layout: seminar` and `seminar: true`. Remove `example: true`, choose a unique numeric `order`, and fill in:

- `title`: the full article title (usually the full paper title); `research_category`: the topic; `hook`: the one-sentence pedagogical subtitle; `description`: a short metadata summary; and `student_author`: the student’s name.
- `supervisor`: optional; shown as “Supervisor: Name” beneath the student’s name in the article header and in the credits. Omit it or leave it empty when unassigned.
- `affiliation`: optional, defaults to the seminar university; retained in article credits and author metadata. The header uses the supervisor line rather than repeating the university.
- Verified `paper_title`, `paper_authors` (a list of names), `venue`, `paper_year`, and `paper_url`; optionally `code_url` and `project_url`. Keep `venue` as the existing field for the original paper venue; do not add a second `paper_venue` field.
- Optional `at_a_glance.problem`, `at_a_glance.key_idea`, and `at_a_glance.why_it_matters`. Insert `{% include seminar/paper-at-a-glance.liquid %}` where the summary helps the explanation, usually after Motivation. The layout does not reserve space for it.
- `toc`: section names matching Markdown headings. The desktop rail is static; mobile hides it.
- `bibliography`: a filename in `assets/bibliography/`. An optional `hero` and `hero_alt` supply a small index thumbnail only; lead figures belong in article content.

The index reads these fields from post front matter through `seminar/article-entry.liquid` and the shared `seminar/paper-metadata.liquid`; article headings use the same paper metadata include. There is no separate homepage data list.

```yaml
layout: seminar
seminar: true
order: 8
title: "Full Paper Title: A Specific Technical Contribution"
hook: "What central question should the reader understand?"
description: "A brief summary for search and link previews."
student_author: Student Name
supervisor: Supervisor Name
affiliation: Heinrich Heine University Düsseldorf
research_category: Medical Image Analysis
paper_title: "Full Paper Title: A Specific Technical Contribution"
paper_authors: [First Author, Second Author]
venue: Verified Venue
paper_year: 2026
paper_url: https://example.org/paper
# code_url:
# project_url:
bibliography: your-article.bib
status: published
```

Use a date no later than publication day in the post filename. The date is a Jekyll requirement; it does not determine editorial ordering. Set `status: published` when ready. The index currently contains only “a distill-style blog post” and the DDPM review, ordered by their `order` fields. Both use `layout: seminar`. The concise authoring template is documentation at `docs/examples/seminar-post.md`, rather than a published article.

Students edit only their Markdown file, their BibTeX file, and their `assets/img/<article>/` directory. Lead figures are optional and should appear as part of the article explanation using the figure include. Add useful alt text and source attribution.

Cite with `<d-cite key="bibtex-key"></d-cite>`. Distill loads the article BibTeX file and creates its reference list. Use `<d-footnote>…</d-footnote>` for Distill footnotes. MathJax, fenced Mermaid, code, and Markdown tables retain the gem runtime. Follow the example for equations and wide figures.

```liquid
{% include seminar/figure.liquid src="/assets/img/your-article/diagram.webp" alt="Explain the diagram" wide=true caption="What to notice, with source attribution." %}
{% include seminar/callout.liquid kind="critical" content="Explain an important limitation." %}
```

Use `wide=true` (or `layout="l-page"`) for important figures, and `layout="l-page-outset"` for the equivalent native outset treatment. Both use Distill’s page tracks, approximately 1072px on a large desktop, while prose remains 704px. Figures get 40px above and 48px below (32/36px on mobile); captions are 14px, muted, and limited to the prose width.

The optional `neutral_background=true` adds a very subtle neutral surface behind the visual only. Leave it off for ordinary figures and paper screenshots. It has no border, radius, shadow, or topic color. Keep figure provenance and source attribution in the caption; no separate label appears above the visual.

For TikZ diagrams, set `tikzjax: true` and put only `\begin{tikzpicture}…\end{tikzpicture}` inside `<script type="text/tikz">`. TikZJax supplies the document wrapper; do not add `\begin{document}` or `\end{document}`.

Callout kinds are `idea`, `why`, `background`, `critical`, and `takeaway`. Caption text supports Markdown; add a `d-cite` within the caption when referencing a paper. All internal assets and links in components use `relative_url`.

## Maintain the design

The gem owns compiled Tailwind and scientific runtime. `assets/css/seminar.css` is a plain site stylesheet loaded afterward; there is no new compiler or styling dependency. There is one site-wide accent: `--global-theme-color` in the light and dark rules. No post-specific colors are used. The stylesheet sets a system sans-serif stack, 17px body text with 1.65 line height, a maximum 42px article title, and ordinary header/footer spacing. The homepage uses approximately 900px of content width. The article title, metadata, and prose share Distill’s native `text` tracks (704px on large desktops). The TOC occupies the adjacent page tracks with a 32px gap to the prose; margin notes keep their native gutter tracks; `l-page` and screen-wide figures retain their wider native tracks.

The local `seminar` layout inherits the gem's `distill` layout. `_includes/distill/render.liquid` intentionally shadows the gem renderer to add academic metadata and a shared article footer while preserving native `d-title`, content, TOC, bibliography, appendix, and runtime tags. Seminar student/supervisor metadata is ordinary text within `d-title` so the body starts promptly; non-seminar Distill pages still use native `d-byline`. Forthcoming posts have no empty visible appendix or author-credit block. Header and footer are also intentional overrides. First-time visitors start in light mode; the theme toggle remembers an explicit light, dark, or system choice. The local head override initializes this preference before the gem theme script and permits blob workers and WebAssembly compilation only for `tikzjax: true` pages, leaving other pages’ security policy unchanged. Review gem updates with:

```sh
bundle exec al-folio upgrade overrides audit
bundle exec al-folio upgrade overrides diff _includes/distill/render.liquid
bundle exec al-folio upgrade audit
bundle exec al-folio upgrade report
```

Only acknowledge reviewed changes using `upgrade overrides accept`, and retain `.al-folio-overrides.yml`. The site style contract allows local layouts/includes and still prohibits duplicating gem-owned Tailwind compilation, Sass, scripts, and icon fonts.

To add official logos, store supplied assets under `assets/img/identity/` and add entries to `logos` in `_data/seminar.yml`, each with `src`, descriptive `alt`, and the institution's `url`. The shared footer renders these without student changes. The current text branding makes no claim to official visual identity.

## Later template extraction

Reusable pieces are the seminar layouts/includes, stylesheet, authoring example, bibliography convention, Docker workflow, and seminar checks. Year-specific inputs are the semester/edition, deployment host/baseurl, topic posts, authors, and article assets. Extract reusable pieces into `seminar-template` after this year's content model is stable. Keep the permanent root archive in a separate repository.
