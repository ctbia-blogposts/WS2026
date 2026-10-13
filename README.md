# Current Trends in Biomedical Image Analysis

**Machine Learning for Medical Data · Heinrich Heine University Düsseldorf**

**Winter Semester 2026/27**

This repository is the independent WS2026 seminar publication, built on al-folio v1.2 (`al_folio_core` 1.0.15, `al_folio_distill` 1.0.3). It presents illustrated technical articles in a simple academic publication index. The article index currently contains the full Distill demonstration and the DDPM review.

## Run with Docker

Start Docker Desktop, then:

```sh
docker compose up --build -d
```

Open **http://localhost:8080/WS2026/**. Edit files locally; Jekyll watches changes. Stop with `docker compose down`.

## Write an article

Students edit one post in `_posts/`, one BibTeX file in `assets/bibliography/`, and one image directory in `assets/img/`. Copy `docs/examples/seminar-post.md` into a dated file under `_posts/` to start a student article.

- [Authoring and maintenance](docs/SEMINAR.md)
- [Writing Guidelines source](_pages/writing-guidelines.md)
- [Seminar identity and navigation](_data/seminar.yml)

The deployment target is `https://ctbia-blogposts.github.io/WS2026/`. GitHub Actions builds the site and publishes the `gh-pages` branch; configure GitHub Pages to serve that branch. All site links and assets account for `/WS2026`.

The full “a distill-style blog post” demonstration is included in the article index. Other inherited upstream demo content is excluded from deployment. Site-specific templates are intentional, audited overrides; dependency and vendored internals remain in gems. No permanent archive or cross-year functionality is implemented here. The shared design can later be extracted into `seminar-template`.
