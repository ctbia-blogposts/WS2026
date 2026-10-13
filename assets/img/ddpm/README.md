# DDPM explanatory figures

The PNG files `fig1-samples.png`, `fig2-graphical-model.png`,
`fig5-rate-distortion.png`, and `fig6-progressive-generation.png` are supplied
extracts from Ho, Jain, and Abbeel, _Denoising Diffusion Probabilistic Models_
(NeurIPS 2020). The review displays Figures 1 and 6 with explicit attribution.
The other supplied extracts are retained for future editing.

`forward-process*.svg` and `objective-ablation*.svg` are original visualizations.
Run `python3 assets/img/ddpm/figures.py` from the repository root to reproduce them;
only the Python standard library is required.

- The phantom is synthetic, not a medical scan. Its Gaussian noise uses seed 2026.
  The forward coefficients follow the 1000-step linear beta schedule from the
  paper. Panels share a noise realization to illustrate marginal corruption,
  rather than showing a Markov path. Clipping is for display only.
- Ablation values come from Tables 1 and 2 of the paper. These are reported
  results, not measurements from a model trained for this article. The NLL
  values are upper bounds. Desktop and mobile files show the same data.
- `ambiguity.js` implements exact Bayesian inference for an equally weighted
  prior over −1 and +1. It has no trained model, external dependencies, or
  stochastic sampling. The clean posterior mean is
  `tanh(sqrt(alpha_bar) * observed_value / (1 - alpha_bar))`.
- Four original TikZ diagrams are embedded in the Markdown article. TikZJax
  compiles them; descriptions and captions accompany each diagram.

Figures and prose are an explanatory review, not a reproduction study. Author
identity remains unassigned until the seminar supplies it.

Additional exact toy figures:

- `score-field*.svg`: an equal three-component Gaussian mixture, corrupted by
  the DDPM schedule. Scores use the exact mixture gradient; arrows have capped
  lengths and do not represent integrated sampling trajectories.
- `reverse-posterior*.svg`: the exact reverse conditional of a two-Gaussian
  previous-state mixture at observation zero. The comparison Gaussian matches
  its first two moments. Beta 0.4 deliberately illustrates a large step outside
  the paper’s schedule; density axes rescale independently.
- `loss-weighting*.svg`: normalized analytical KL weights for reverse variance
  equal to beta, with a logarithmic vertical axis and the decoder term excluded.

Architecture schematics:

- `unet-architecture*.svg`: the CIFAR-10 model’s four spatial resolutions,
  concatenating skip connections, timestep conditioning, and attention.
  Input/output convolutions, channel counts, and individual skip tensors are
  omitted; stages summarize groups of blocks. The middle attention block is
  present in the released `diffusion_tf/models/unet.py`.
- `residual-block*.svg`: normalization, Swish, convolutions, projected additive
  timestep conditioning, dropout, and the residual shortcut, following the
  original implementation. These are architectural diagrams, not execution traces.

`reverse-step.js` illustrates one Gaussian reverse transition using the exact
noise predictor for the equally weighted −1/+1 clean prior. The reverse variance
is beta, and the random term is suppressed at timestep one. The fresh-noise
control uses Box–Muller and displays z rounded to two decimal places; rare tails
extend the slider instead of being clipped. This is an analytical denoiser plus
a DDPM-style Gaussian approximation, not a trained model or exact posterior
sampler. Controls expose clean estimate, reverse mean, and next state separately.
