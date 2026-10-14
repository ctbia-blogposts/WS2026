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

Use approximately **4–8 meaningful figures**. At least one should be **created or substantially redesigned by you**. State in the caption whether a figure is your own explanation or adapted from the original paper.

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

## Submit your article with a pull request

Students contribute through a **fork** and a **pull request (PR)**. A fork is your own copy of the repository; a PR asks the seminar maintainers to review and merge your changes into the shared site.

1. **Fork the repository.** Open [ctbia-blogposts/WS2026](https://github.com/ctbia-blogposts/WS2026) and click **Fork** to create a copy under your GitHub account.
2. **Create an article branch in your fork.** Clone your fork to your computer if you want to preview with Docker. Use a descriptive name such as `article/your-topic`. Work on this branch using GitHub Desktop, Git, or GitHub’s editor.
3. **Write and preview your article.** Follow the three-file workflow above. Keep `layout: seminar` and `seminar: true`, remove `example: true`, and choose an unused `order` after the existing articles. Use the [Docker preview instructions](https://github.com/ctbia-blogposts/WS2026#run-with-docker) to check the page locally, including figures, citations, equations, and mobile layout.
4. **Commit and push to your fork.** Include your Markdown post, bibliography, and article assets. Check the changed-file list for unrelated files before submitting.
5. **Open a PR to the seminar repository.** In your fork, choose **Contribute → Open pull request**. The base repository must be **ctbia-blogposts/WS2026**, with its **main** branch; the compare branch is your article branch in your fork. Give the PR a clear title and include your article title, student name, supervisor, original paper link, and whether you request feedback, publication of an online draft, or publication of the finished article.
6. **Respond to review and checks.** Read the feedback and the PR’s automated checks. Push corrections to the same branch; they update the existing PR. The seminar maintainers review and merge the contribution.

GitHub’s [fork and branch workflow](https://docs.github.com/en/get-started/using-github/github-flow) explains the general process if you are new to pull requests.

### Ready for publication—or just ready to see it online?

| Your goal                                        | What to submit                                                                                                                                                                                                                                                                                                                  |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Feedback while you are still writing             | Open a **draft PR** and describe the questions you want feedback on.                                                                                                                                                                                                                                                            |
| An online version before the article is finished | Open a PR titled **Online draft: Article title**, explain what remains unfinished, and explicitly request a merge for an online draft. Set `status: draft` and add **Work in progress** at the beginning of the article body so readers can recognize it. Mark the PR ready for review when you want it considered for merging. |
| Publication of the finished article              | Set `status: published`, open or mark your PR ready for review, and summarize your final checks.                                                                                                                                                                                                                                |

**A draft article and a draft PR are different things.** An unfinished article can be merged for online publication after review; a PR marked as draft is for ongoing work and must be marked ready before it can be merged. The article’s `status: draft` field does not automatically add a visible notice, so include the work-in-progress text in the body.

**Opening a PR does not publish the article.** The current workflow has no automatic per-PR preview URL. Once a maintainer merges your PR and the deployment succeeds, the article appears on the [WS2026 seminar site]({{ '/' | relative_url }}). To see changes before merging, use the local Docker preview. For later revisions, sync your fork with the seminar repository, create a new branch, and submit another PR.
