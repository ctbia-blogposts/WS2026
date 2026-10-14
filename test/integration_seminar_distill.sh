#!/usr/bin/env bash
# Verify the full Distill demonstration and the DDPM review.
set -euo pipefail
check_dir=$(mktemp -d)
trap 'rm -rf "$check_dir"' EXIT
bundle exec jekyll build --destination "$check_dir/site" > "$check_dir/build.log" 2>&1 || {
  cat "$check_dir/build.log"
  exit 1
}
bundle exec ruby -rpathname -ryaml -rcgi -e '
  root = Pathname.new(ARGV.fetch(0))
  demo = root.join("articles/distill/index.html").read
  example = root.join("articles/ddpm/index.html").read
  ["<d-title>", "<d-article>", "<d-appendix>", "<d-cite", "<d-footnote", "l-page", "Albert Einstein", "/WS2026/assets/bibliography/2018-12-22-distill.bib", "/WS2026/assets/js/distillpub/template.v2.js"].each do |marker|
    abort "Missing native Distill marker: #{marker}" unless demo.include?(marker)
  end
  abort "Full demo is missing seminar footer" unless demo.include?("This feature demonstration uses the seminar layout") && demo.include?("seminar-article-footer")
  metadata = YAML.safe_load(File.read("_posts/2026-10-01-ddpm.md").split(/^---\s*$/)[1])
  abort "Seminar byline missing" unless example.include?("seminar-byline")
  [metadata["student_author"], metadata["supervisor"]].compact.reject(&:empty?).each do |name|
    abort "Article metadata missing from rendered output: #{name}" unless example.include?(CGI.escapeHTML(name))
  end
  abort "Topic color classes returned" if demo.include?("accent-") || example.include?("accent-")
  index = root.join("index.html").read
  abort "Article index must retain both demonstration articles" unless index.scan(/class="seminar-entry"/).size >= 2
  ["/WS2026/articles/distill/", "/WS2026/articles/ddpm/"].each do |url|
    abort "Missing index article: #{url}" unless index.include?(url)
  end
  puts "Distill and DDPM build successfully and remain in the article index."
' "$check_dir/site"
