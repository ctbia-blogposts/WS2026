from pathlib import Path
import math, random, html
out=Path('assets/img/ddpm')
a=[1.0]
for t in range(1,1001): a.append(a[-1]*(1-(.0001+(.02-.0001)*(t-1)/999)))
def txt(x,y,s,size=20,anchor='start',fill='#303030'):
 return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}">{html.escape(s)}</text>'
def svg(w,h,parts,title,desc):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title><desc>{html.escape(desc)}</desc><rect width="{w}" height="{h}" fill="white"/><g font-family="system-ui, sans-serif">'+''.join(parts)+'</g></svg>\n'
# Analytic phantom: ellipses, not an actual scan or model sample.
n=40; rng=random.Random(2026); eps=[rng.gauss(0,1) for _ in range(n*n)]; phantom=[]
for y in range(n):
 for x in range(n):
  u=(x-n/2)/(n/2); v=(y-n/2)/(n/2)
  val=-.8
  if u*u/.72**2+v*v/.86**2<1: val=.5
  if u*u/.57**2+v*v/.72**2<1: val=.0
  if ((u+.21)/.15)**2+((v+.05)/.25)**2<1: val=-.4
  if ((u-.21)/.15)**2+((v+.05)/.25)**2<1: val=-.4
  if ((u-.14)/.12)**2+((v-.38)/.12)**2<1: val=.75
  phantom.append(val)
for mobile in [False,True]:
 w=480 if mobile else 1050; parts=[]; ts=[0,100,300,600,1000]; sz=130 if mobile else 170
 for i,t in enumerate(ts):
  x=(20+(i%3)*150) if mobile else 25+i*205; y=40+(i//3)*195 if mobile else 45
  parts.append(txt(x,y-12,f't = {t}',19))
  for j,(v,e) in enumerate(zip(phantom,eps)):
   value=math.sqrt(a[t])*v+math.sqrt(1-a[t])*e
   gray=round(255*max(0,min(1,(value+1)/2)))
   parts.append(f'<rect x="{x+(j%n)*sz/n:.2f}" y="{y+(j//n)*sz/n:.2f}" width="{sz/n+.03:.2f}" height="{sz/n+.03:.2f}" fill="rgb({gray},{gray},{gray})"/>')
  parts.append(txt(x,y+sz+25,f'ᾱ = {a[t]:.5f}' if t == 1000 else f'ᾱ = {a[t]:.3f}',17))
 y0=465 if mobile else 300; x0=60; cw=w-95; ch=145
 parts.append(txt(x0,y0-28,'Signal and noise coefficients',20))
 for q in [0,.5,1]:
  yy=y0+ch*(1-q)
  parts.append(f'<path d="M{x0} {yy} H{x0+cw}" stroke="#e5e5e5" fill="none"/>'); parts.append(txt(x0-10,yy+5,str(q),16,'end'))
 for mode,col,dash in [('signal','#176b71',''),('noise','#555',' stroke-dasharray="7 5"')]:
  pts=[(x0+cw*t/1000,y0+ch*(1-(math.sqrt(a[t]) if mode=='signal' else math.sqrt(1-a[t])))) for t in range(0,1001,5)]
  d='M'+' L'.join(f'{x:.2f} {y:.2f}' for x,y in pts)
  parts.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="2.5"{dash}/>')
 parts.extend([txt(x0,y0+ch+25,'0',16),txt(x0+cw,y0+ch+25,'1000',16,'end'),txt(x0+cw/2,y0+ch+25,'Diffusion timestep',17,'middle'),txt(x0+10,y0+ch+60,'— Signal √ᾱ',18,fill='#176b71'),txt(x0+cw/2,y0+ch+60,'– – Noise √(1 − ᾱ)',18)])
 h=y0+ch+80
 (out/('forward-process-mobile.svg' if mobile else 'forward-process.svg')).write_text(svg(w,h,parts,'A synthetic image under the DDPM forward process','Five noise levels and exact coefficients from the 1000-step linear beta schedule. Pixel values are clipped for display only.'))
# Aligned dot plots: shared rows, attached axes, and explicitly expanded NLL scale.
rows=[('Mean prediction','Variational bound',13.22,None),
      ('Noise prediction','Variational bound',13.51,3.70),
      ('Noise prediction','Simple loss',3.17,3.75)]
for mobile in [False,True]:
 w=480 if mobile else 1000; h=625 if mobile else 315; parts=[]
 if not mobile:
  parts.append(txt(20,30,'Prediction and loss',20))
 for panel in [0,1]:
  if mobile:
   x0=220; x1=395; value_x=463; top=0 if panel==0 else 305; ys=[90+top,150+top,210+top]; axis=260+top
   parts.append(txt(20,30+top,'Sample quality: FID ↓' if panel==0 else 'Test NLL bound ↓ · bits/dim',20))
   if panel==1:parts.append(txt(220,52+top,'Expanded scale',14,fill='#666'))
  else:
   x0=355 if panel==0 else 745; x1=635 if panel==0 else 915; value_x=705 if panel==0 else 995; ys=[105,165,225]; axis=265
   parts.append(txt(x0,30,'FID ↓' if panel==0 else 'Test NLL bound ↓',20))
   parts.append(txt(x0,52,'Sample quality' if panel==0 else 'bits/dim · expanded scale',14,fill='#666'))
  low,high=(0,16) if panel==0 else (3.65,3.8)
  ticks=[0,4,8,12,16] if panel==0 else [3.65,3.7,3.75,3.8]
  px=lambda v:x0+(v-low)/(high-low)*(x1-x0)
  for tick in ticks:
   xx=px(tick)
   parts.append(f'<path d="M{xx:.2f} {ys[0]-18} V{axis}" stroke="#e7e7e7" fill="none"/>')
   parts.append(txt(xx,axis+24,str(tick) if panel==0 else f'{tick:.2f}',12 if mobile else 14,'middle'))
  parts.append(f'<path d="M{x0} {axis} H{x1}" stroke="#aaa"/>')
  for (label,loss,fid,nll),y in zip(rows,ys):
   if panel==0 or mobile:
    parts.append(txt(20,y-3,label,16 if mobile else 18))
    parts.append(txt(20,y+17,loss,14,fill='#666'))
   value=fid if panel==0 else nll
   if value is None:
    parts.append(txt((x0+x1)/2,y+5,'Not reported',12 if mobile else 14,'middle',fill='#666'))
   else:
    color='#176b71' if loss=='Simple loss' else '#666'
    parts.append(f'<circle cx="{px(value):.2f}" cy="{y}" r="5" fill="{color}"/>')
    parts.append(txt(value_x,y+6,('≤ ' if panel else '')+f'{value:.2f}',16,'end',fill=color))
 (out/('objective-ablation-mobile.svg' if mobile else 'objective-ablation.svg')).write_text(svg(w,h,parts,'The DDPM objective ablation','Aligned dot plots compare three training choices. FID uses a zero-to-16 scale; the likelihood-bound panel uses an explicitly expanded 3.65-to-3.80 scale. Values from Tables 1 and 2; missing values are marked not reported.'))
print('Wrote reproducible scientific SVGs; alpha_bar[1000] =',a[-1])

# A continuous, three-component toy distribution: exact noisy marginals and scores.
centers=[(-1.,-.6),(1.,-.6),(0.,1.)]
for mobile in [False,True]:
 w=480 if mobile else 1080; h=1380 if mobile else 485; parts=[]
 for k,t in enumerate([50,300,800]):
  bx=65 if mobile else 35+k*360; by=65+k*435 if mobile else 65; size=350 if mobile else 300
  s=math.sqrt(a[t]); variance=a[t]*.04+(1-a[t]); means=[(s*x,s*y) for x,y in centers]
  px=lambda x:bx+(x+3)*size/6
  py=lambda y:by+(3-y)*size/6
  parts.append(txt(bx,by-25,f't = {t}: noisy data and score',18))
  parts.append(f'<path d="M{px(-3)} {py(0)} H{px(3)} M{px(0)} {py(-3)} V{py(3)}" stroke="#ddd" fill="none"/>')
  rng=random.Random(713)
  for j in range(210):
   m=means[j%3]; x=m[0]+math.sqrt(variance)*rng.gauss(0,1); y=m[1]+math.sqrt(variance)*rng.gauss(0,1)
   if abs(x)<3 and abs(y)<3: parts.append(f'<circle cx="{px(x):.2f}" cy="{py(y):.2f}" r="2.2" fill="#888" opacity=".45"/>')
  for i in range(-4,5):
   for j in range(-4,5):
    x=i*.6; y=j*.6
    logits=[-((x-mx)**2+(y-my)**2)/(2*variance) for mx,my in means]; high=max(logits)
    weights=[math.exp(v-high) for v in logits]; total=sum(weights)
    dx=sum(p*(mx-x)/variance for p,(mx,my) in zip(weights,means))/total
    dy=sum(p*(my-y)/variance for p,(mx,my) in zip(weights,means))/total
    norm=math.hypot(dx,dy)
    if norm<1e-8: continue
    length=min(.33,.1*norm); dx=dx/norm*length; dy=dy/norm*length
    x1=px(x); y1=py(y); x2=px(x+dx); y2=py(y+dy)
    angle=math.atan2(y2-y1,x2-x1); tip=4
    parts.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f} M{x2-tip*math.cos(angle-.5):.2f} {y2-tip*math.sin(angle-.5):.2f} L{x2:.2f} {y2:.2f} L{x2-tip*math.cos(angle+.5):.2f} {y2-tip*math.sin(angle+.5):.2f}" fill="none" stroke="#176b71" stroke-width="1.4"/>')
  for v in [-2,0,2]: parts.append(txt(px(v),by+size+22,str(v),15,'middle'))
  parts.append(txt(bx+size/2,by+size+47,'Coordinate 1',16,'middle'))
  parts.append(txt(bx,by+size+72,'Arrows: score direction, capped length',14))
 (out/('score-field-mobile.svg' if mobile else 'score-field.svg')).write_text(svg(w,h,parts,'A noisy data distribution and its exact score field','Three Gaussian clusters become one cloud as noise increases. Arrows point along the exact gradient of log density, not sampled diffusion trajectories.'))

# A deliberately enlarged forward step makes a multimodal reverse kernel visible.
for mobile in [False,True]:
 w=480 if mobile else 1000; h=740 if mobile else 385; parts=[]
 for k,beta in enumerate([.001,.4]):
  bx=55 if mobile else 50+k*500; by=65+k*355 if mobile else 65; cw=370 if mobile else 400; ch=180
  alpha=1-beta; pv=.04; mu=beta/(alpha*pv+beta); var=pv*beta/(alpha*pv+beta); mv=var+mu*mu
  def density(x): return sum(math.exp(-(x-m)**2/(2*var))/math.sqrt(2*math.pi*var)/2 for m in [-mu,mu])
  def approx(x): return math.exp(-x*x/(2*mv))/math.sqrt(2*math.pi*mv)
  xs=[-2+4*i/800 for i in range(801)]; peak=max(max(density(x),approx(x)) for x in xs)
  parts.append(txt(bx,by-26,'Small step: β = 0.001' if k==0 else 'Large step: β = 0.4',20))
  for func,col,dash in [(density,'#176b71',''),(approx,'#666',' stroke-dasharray="7 5"')]:
   d='M'+' L'.join(f'{bx+(x+2)*cw/4:.2f} {by+ch*(1-func(x)/peak):.2f}' for x in xs)
   parts.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="2.5"{dash}/>')
  parts.append(f'<path d="M{bx} {by+ch} H{bx+cw}" stroke="#bbb"/>')
  for v in [-1,0,1]:parts.append(txt(bx+(v+2)*cw/4,by+ch+25,str(v),16,'middle'))
  parts.append(txt(bx+cw/2,by+ch+49,'Previous state, given xₜ = 0',16,'middle'))
  parts.append(txt(bx,by+ch+77,'— Exact reverse density',16,fill='#176b71'))
  parts.append(txt(bx,by+ch+100,'– – Gaussian with the same moments',16))
 (out/('reverse-posterior-mobile.svg' if mobile else 'reverse-posterior.svg')).write_text(svg(w,h,parts,'When a Gaussian reverse approximation misses alternatives','A symmetric two-Gaussian prior and observation zero give an exact mixture posterior. The small-step posterior is approximately Gaussian; a deliberately large corruption step leaves two distinct alternatives. Each panel rescales its density axis.'))

# Relative timestep weighting: choose the paper's fixed sigma_t^2 = beta_t.
weights=[]
for t in range(2,1001):
 beta=.0001+(.02-.0001)*(t-1)/999
 weights.append(beta/(2*(1-beta)*(1-a[t])))
mean_weight=sum(weights)/len(weights)
for mobile in [False,True]:
 w=480 if mobile else 1000; h=435; bx=65; by=70; cw=w-115; ch=235; parts=[]
 parts.append(txt(bx,30,'Relative weight on noise-prediction error',20))
 py=lambda v:by+ch*(1-(math.log10(v)+.5)/2.5)
 for v in [.5,1,10,100]:
  yy=py(v)
  parts.append(f'<path d="M{bx} {yy:.2f} H{bx+cw}" stroke="#e5e5e5" fill="none"/>')
  parts.append(txt(bx-12,yy+5,str(v),15,'end'))
 d='M'+' L'.join(f'{bx+cw*(t-2)/998:.2f} {py(v/mean_weight):.2f}' for t,v in zip(range(2,1001),weights))
 parts.append(f'<path d="{d}" fill="none" stroke="#176b71" stroke-width="2.5"/>')
 parts.append(f'<path d="M{bx} {py(1):.2f} H{bx+cw}" stroke="#555" stroke-width="2" stroke-dasharray="7 5"/>')
 for t in [2,250,500,750,1000]:parts.append(txt(bx+cw*(t-2)/998,by+ch+25,str(t),15,'middle'))
 parts.append(txt(bx+cw/2,by+ch+50,'Diffusion timestep (t ≥ 2)',17,'middle'))
 parts.append(txt(bx,by+ch+78,'— Variational weights (mean = 1)',16,fill='#176b71'))
 parts.append(txt(bx,by+ch+101,'– – Uniform simple-loss weights',16))
 (out/('loss-weighting-mobile.svg' if mobile else 'loss-weighting.svg')).write_text(svg(w,h,parts,'The variational bound and simple loss weight noise levels differently','Exact weights for fixed reverse variance beta, normalized to mean one. The vertical axis is logarithmic. The final decoder term at timestep one is excluded.'))

# Original U-Net explanatory schematics, checked against the released implementation.
def arrow(parts,x1,y1,x2,y2,color='#555',dash=False):
 angle=math.atan2(y2-y1,x2-x1); tip=6
 extra=' stroke-dasharray="5 4"' if dash else ''
 parts.append(f'<path d="M{x1} {y1} L{x2} {y2} M{x2-tip*math.cos(angle-.5):.2f} {y2-tip*math.sin(angle-.5):.2f} L{x2} {y2} L{x2-tip*math.cos(angle+.5):.2f} {y2-tip*math.sin(angle+.5):.2f}" fill="none" stroke="{color}" stroke-width="1.5"{extra}/>')
def architecture_box(parts,x,y,w,h,lines):
 parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="#aaa" stroke-width="1"/>')
 for i,line in enumerate(lines):parts.append(txt(x+w/2,y+24+i*20,line,16 if i==0 else 14,'middle'))
for mobile in [False,True]:
 w=480 if mobile else 1000; h=770; parts=[]
 lx=20 if mobile else 105; rx=285 if mobile else 655; bw=175 if mobile else 240
 lc=lx+bw/2; rc=rx+bw/2
 parts.append(txt(w/2,32,'t → sinusoidal embedding → MLP',18,'middle',fill='#176b71'))
 parts.append(txt(w/2,57,'Condition every residual block',15,'middle',fill='#176b71'))
 # Separate side rails indicate conditioning, not feature-map flow.
 rail_l=10 if mobile else 55; rail_r=w-rail_l
 parts.append(f'<path d="M{w/2} 68 V85 H{rail_l} V575 M{w/2} 85 H{rail_r} V575" fill="none" stroke="#176b71" stroke-width="1" stroke-dasharray="5 4"/>')
 parts.append(txt(lc,116,'Noisy image xₜ',17,'middle'))
 parts.append(txt(rc,116,'Predicted noise εθ',17,'middle'))
 arrow(parts,lc,125,lc,160); arrow(parts,rc,160,rc,125)
 for i,res in enumerate([32,16,8,4]):
  y=165+i*105
  lines=[f'{res} × {res}', 'Residual blocks']
  if res==16:lines.append('+ self-attention')
  architecture_box(parts,lx,y,bw,75,lines); architecture_box(parts,rx,y,bw,75,lines)
  arrow(parts,rail_l,y+55,lx,y+55,'#176b71',True);arrow(parts,rail_r,y+55,rx+bw,y+55,'#176b71',True)
  arrow(parts,lx+bw,y+35,rx,y+35,'#888');parts.append(txt(w/2,y+24,'concat' if mobile else 'concatenate skip features',12 if mobile else 14,'middle',fill='#666'))
  if i<3:
   arrow(parts,lc,y+75,lc,y+105);arrow(parts,rc,y+105,rc,y+75)
 parts.append(txt(rail_l+15,614,'Encoder',14));parts.append(txt(rail_r-15,614,'Decoder',14,'end'))
 mx=w/2-120; my=650
 parts.append(f'<path d="M{rail_l} 575 V630 H{w/2} V640" fill="none" stroke="#176b71" stroke-width="1" stroke-dasharray="5 4"/>')
 arrow(parts,w/2,640,w/2,650,'#176b71',True)
 architecture_box(parts,mx,my,240,70,['4 × 4 bottleneck','Residual → attention → residual'])
 parts.append(f'<path d="M{lc} 555 V685 H{mx}" fill="none" stroke="#555" stroke-width="1.5"/>');arrow(parts,mx-15,685,mx,685)
 parts.append(f'<path d="M{mx+240} 685 H{rc} V555" fill="none" stroke="#555" stroke-width="1.5"/>');arrow(parts,rc,570,rc,555)
 parts.append(txt(w/2,752,'Stage overview; individual blocks and channels omitted',13,'middle',fill='#666'))
 (out/('unet-architecture-mobile.svg' if mobile else 'unet-architecture.svg')).write_text(svg(w,h,parts,'The timestep-conditioned DDPM U-Net','CIFAR-10 resolution stages run from 32 by 32 to 4 by 4 and back. Skip features concatenate into decoder blocks. Timestep embeddings condition all residual blocks; attention is used at 16 by 16 and in the middle block. Input and output convolutions are omitted.'))
for mobile in [False,True]:
 w=480 if mobile else 1000; h=490 if mobile else 300; parts=[]
 if mobile:
  parts.append(txt(255,30,'Input features h',18,'middle'))
  architecture_box(parts,130,65,250,65,['GroupNorm → Swish','3 × 3 convolution'])
  arrow(parts,255,37,255,65)
  parts.append(txt(255,185,'+',25,'middle'));arrow(parts,255,130,255,160)
  parts.append(txt(70,150,'Project e(t)',15,'middle',fill='#176b71'));arrow(parts,30,177,235,177,'#176b71',True)
  architecture_box(parts,130,225,250,85,['GroupNorm → Swish','Dropout','3 × 3 convolution'])
  arrow(parts,255,193,255,225);arrow(parts,255,310,255,365)
  parts.append(txt(255,390,'+',25,'middle'));arrow(parts,255,398,255,444)
  parts.append(txt(255,470,'Output features h′',18,'middle'))
  parts.append('<path d="M255 45 H95 V382 H235" fill="none" stroke="#555" stroke-width="1.5"/>');arrow(parts,220,382,235,382)
  parts.append(txt(30,345,'Skip',15))
 else:
  parts.append(txt(27,155,'h',20,'middle'));architecture_box(parts,85,120,215,65,['GroupNorm → Swish','3 × 3 convolution'])
  arrow(parts,40,148,85,148);arrow(parts,300,148,342,148);parts.append(txt(355,156,'+',25,'middle'))
  architecture_box(parts,415,110,260,85,['GroupNorm → Swish','Dropout','3 × 3 convolution'])
  arrow(parts,368,148,415,148);arrow(parts,675,148,765,148);parts.append(txt(778,156,'+',25,'middle'));arrow(parts,791,148,905,148);parts.append(txt(930,155,'h′',20,'middle'))
  parts.append(txt(355,35,'Timestep embedding e(t)',17,'middle',fill='#176b71'));parts.append(txt(355,68,'Swish → linear projection',15,'middle',fill='#176b71'));arrow(parts,355,80,355,130,'#176b71',True)
  parts.append('<path d="M45 148 V240 H778 V177" fill="none" stroke="#555" stroke-width="1.5"/>');arrow(parts,778,177,778,165)
  parts.append(txt(435,271,'Residual skip: identity, or channel projection when needed',16,'middle'))
 (out/('residual-block-mobile.svg' if mobile else 'residual-block.svg')).write_text(svg(w,h,parts,'Inside one DDPM residual block','Normalized and activated features pass through a convolution, receive a projected timestep embedding, and pass through normalization, activation, dropout, and a second convolution before a residual skip is added.'))
