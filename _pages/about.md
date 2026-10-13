---
layout: seminar-page
title: Articles
permalink: /
home: true
---

<p class="seminar-introduction">A seminar on recent research in biomedical image analysis, medical AI, and machine learning for science. Each article explains and critically examines one recent research paper.</p>

<section aria-label="Seminar articles">
  {% assign articles = site.posts | where_exp: 'post', 'post.seminar == true or post.distill_demo == true' | where_exp: 'post', 'post.example != true' | sort: 'order' %}
  {% for article in articles %}{% include seminar/article-entry.liquid article=article %}{% endfor %}
</section>
