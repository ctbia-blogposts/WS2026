---
layout: seminar-page
title: Writing Guidelines
permalink: /writing-guidelines/
---

<p>Can you make a technically competent classmate understand this paper?</p>

The illustrated technical blog is an alternative to the conventional seminar report. The contribution is technical pedagogy: careful explanations and meaningful visual reasoning. Web-development effort is not the objective.

## Start with the problem

Aim for approximately **2,000–3,000 words of substantive content**. Motivate the problem before explaining the architecture. Provide enough background for another bachelor or master student to follow the paper, and introduce notation when it first appears.

Focus on **2–4 central technical ideas**. Explain why each is needed, how it works, and how it connects to the others. Avoid a tour of every implementation detail.

## Make figures do explanatory work

Use approximately **4–8 meaningful figures**. At least one should be **created or substantially redesigned by you**. Use labels such as “Student explanation” and “Adapted from the original paper” to distinguish your contribution and provide provenance.

Properly cite reproduced and adapted figures, identify the source figure where relevant, and check its reuse terms. Captions should explain what the reader should notice. Give images useful alt text; scientific meaning must not depend only on color.

Explain what experimental results mean instead of copying tables. Connect each result to a question, describe the comparison, and distinguish evidence from interpretation.

## Take a critical view

Discuss assumptions, limitations, failure cases, and open questions. What setting does the evaluation cover? What does it leave uncertain? Which claims depend on particular data or constraints?

Include related work and proper academic citations. Separate the original authors’ claims from your own reading of the evidence.

## Finish with what should be remembered

End with concise **Takeaways**, or “What should I remember?”. Summarize the central ideas and their practical limits.

A useful structure is Motivation → Background → Core Idea → How It Works → Results → Limitations → Takeaways. Adapt it to the paper rather than forcing every article into identical headings.

## Optional tools, shared design

Interactive plots, code, and animation are welcome but optional. Visual complexity cannot compensate for weak explanation. All articles use the shared Distill layout. Put your effort into the explanation and figures rather than writing CSS.

## Your three-file workflow

1. Copy `docs/examples/seminar-post.md` from the repository into a dated Markdown file under `_posts/`. Fill in its metadata and write the article.
2. Add your BibTeX references in `assets/bibliography/<article>.bib`; set `bibliography` to that filename and cite with `<d-cite key="reference-key"></d-cite>`.
3. Put figures in `assets/img/<article>/`. Use the shared figure and callout includes demonstrated in the example.

Set `status: published` when the article is ready. The homepage and article navigation update from post metadata. Keep layouts, styles, JavaScript, navigation, and global configuration unchanged. Detailed maintainer and author instructions are in `docs/SEMINAR.md`.
