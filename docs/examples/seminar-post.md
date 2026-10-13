---
layout: seminar
seminar: true
example: true
order: 99
title: Attention Is All You Need — an authoring example
research_category: Authoring example
hook: Start with a question, explain the mechanism, and show what the evidence establishes.
description: A concise template for a scientific seminar article.
student_author: Student Name
supervisor: Supervisor Name
affiliation: Heinrich Heine University Düsseldorf
status: example
venue: NeurIPS
paper_year: 2017
paper_url: https://arxiv.org/abs/1706.03762
paper_title: Attention Is All You Need (citation demonstration only)
paper_authors: [Vaswani et al.]
# code_url:
# project_url:
bibliography: authoring-example.bib
mermaid:
  enabled: true
  zoomable: false
toc:
  - name: Motivation
  - name: Background
  - name: Core Idea
  - name: How It Works
  - name: Results
  - name: Limitations
  - name: Takeaways
at_a_glance:
  problem: State the concrete scientific problem and the obstacle existing methods face.
  key_idea: Explain the central mechanism in one or two sentences.
  why_it_matters: Say what this makes possible and what remains uncertain.
---

## Motivation

Open with the question the paper addresses, why it is difficult, and who benefits from solving it. This page demonstrates the shared authoring components; it is not a review of one of the six selected papers.

{% include seminar/paper-at-a-glance.liquid %}

## Background

Introduce only the concepts your explanation needs. For example, the transformer introduces attention as a way to relate elements of a sequence <d-cite key="vaswani2017attention"></d-cite>.

## Core Idea

{% include seminar/callout.liquid kind="idea" content="Explain the mechanism in plain language before introducing its mathematical form." %}

A compact equation can make a mechanism precise:

$$
\operatorname{Attention}(Q,K,V) = \operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V.
$$

Here $Q$, $K$, and $V$ denote queries, keys, and values; $d_k$ is the key dimension. Explain what each operation contributes.

## How It Works

{% capture explanation_figure %}
<div class="seminar-diagram" role="img" aria-label="Questions are compared with keys to obtain relevance weights; the weights combine values into contextual information.">
  <div><strong>Queries + keys</strong><span>Compare relevance</span></div><span aria-hidden="true">→</span><div><strong>Weights + values</strong><span>Combine information</span></div><span aria-hidden="true">→</span><div><strong>Context</strong><span>Represent the input</span></div>
</div>
{% endcapture %}
{% include seminar/figure.liquid wide=true neutral_background=true content=explanation_figure caption="A schematic explanation of attention, created for this template. It describes information flow rather than a measured experimental result. Based on the mechanism in Vaswani et al. (2017)." %}

For your own image, use the same component with `src` and `alt`:

```liquid
{% raw %}{% include seminar/figure.liquid src="/assets/img/your-article/mechanism.webp" alt="Describe the mechanism" layout="l-page-outset" caption="Explain the adaptation and cite its source." %}{% endraw %}
```

Mermaid is optional and uses the existing chart plugin:

```mermaid
flowchart LR
    A[Scientific question] --> B[Mechanism]
    B --> C[Evidence]
    C --> D[Interpretation]
```

## Results

Describe the experimental comparison and explain its meaning. Name the metric, baseline, and evaluation setting before drawing a conclusion.

| Question                 | Evidence to discuss                |
| ------------------------ | ---------------------------------- |
| Does the mechanism help? | Relevant baseline and ablation     |
| Where does it fail?      | Error analysis and unseen settings |

## Limitations

{% include seminar/callout.liquid kind="critical" content="Separate demonstrated performance from assumptions about clinical usefulness. Identify which evaluation would be needed to bridge that gap." %}

Use a footnote for a brief aside.<d-footnote>Keep essential reasoning in the main text.</d-footnote>

## Takeaways

{% include seminar/callout.liquid kind="takeaway" content="State the main mechanism, the strongest evidence, and the most important remaining limitation." %}
