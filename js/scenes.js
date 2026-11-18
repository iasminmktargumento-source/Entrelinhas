/* Tinteiro — fundos animados realistas (renderizados no navegador com WebGL).
   Cada cena é um shader com luz, profundidade e desfoque de câmera. */
(function(T){
  const GENRES = [
    { id: 'fantasia', name: 'Fantasia' },
    { id: 'scifi', name: 'Ficção científica' },
    { id: 'terror', name: 'Terror e gótico' },
    { id: 'romance', name: 'Romance' },
    { id: 'misterio', name: 'Mistério e noir' },
    { id: 'aventura', name: 'Aventura' },
    { id: 'distopia', name: 'Distopia' },
    { id: 'contemplativo', name: 'Literário e contemplativo' },
  ];

  /* ---------------- GLSL comum ---------------- */
  const HEAD = `
precision highp float;
uniform vec2 uR; uniform float uT;
#define S smoothstep
#define PI 3.14159265
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float h11(float p){ p=fract(p*.1031); p*=p+33.33; p*=p+p; return fract(p); }
float h21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2 h22(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float h31(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float n3(vec3 p){ vec3 i=floor(p), f=fract(p); vec3 u=f*f*(3.-2.*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),u.x), mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),u.x),u.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),u.x), mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),u.x),u.y), u.z); }
float fbm2(vec2 p){ float a=.5, s=0.; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<5;i++){ s+=a*n2(p); p=m*p; a*=.5; } return s/.97; }
float fbm3(vec3 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*n3(p); p=p*2.02+vec3(1.7,9.2,3.1); a*=.5; } return s/.97; }
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }
`;
  const TAIL = `
void main(){
  vec3 c = scene(gl_FragCoord.xy);
#ifndef RAW
#ifdef EXPOSURE
  c *= EXPOSURE;
#endif
  c = aces(max(c,0.)); c = pow(c, vec3(1./2.2));
#endif
  vec2 q = gl_FragCoord.xy/uR;
  c *= .45+.55*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y), .16);
  c += (h21(gl_FragCoord.xy+fract(uT*7.13)*91.)-.5)*.022;
  gl_FragColor = vec4(c,1.);
}`;

  /* ---------------- shaders ---------------- */
  const SH = {};

  /* Chuva no vidro, com as luzes da rua desfocadas atrás (técnica de gotas com refração) */
  SH.chuva = `
vec3 pal(float r){
#if PAL==0
  if(r<.5) return vec3(1.,.5,.16); if(r<.78) return vec3(1.,.74,.4); if(r<.92) return vec3(1.,.22,.08); return vec3(.3,1.,.45);
#elif PAL==1
  if(r<.45) return vec3(.62,.78,1.); if(r<.7) return vec3(1.,.6,.25); if(r<.9) return vec3(.3,.78,.9); return vec3(1.,.18,.14);
#else
  if(r<.35) return vec3(1.,.1,.6); if(r<.65) return vec3(.1,.7,1.); if(r<.85) return vec3(.5,.2,1.); return vec3(1.,.7,.3);
#endif
}
vec3 bokeh(vec2 uv, float sharp){
#if PAL==0
  vec3 col = mix(vec3(.012,.008,.008), vec3(.03,.02,.02), uv.y);
#elif PAL==1
  vec3 col = mix(vec3(.004,.008,.016), vec3(.014,.024,.042), uv.y);
#else
  vec3 col = mix(vec3(.014,.004,.03), vec3(.008,.014,.045), uv.y);
#endif
  col += pal(.1)*.06*S(.75,0.,uv.y)*(.6+.4*fbm2(uv*2.));
  col += pal(.6)*.03*S(.9,.2,uv.y)*fbm2(uv*1.3+5.);
  for(int l=0;l<3;l++){
    float fl=float(l), sc=3.2+fl*2.6;
    vec2 p = uv*sc + vec2(fl*13.7 + uT*.01*(fl+1.), fl*3.1);
    vec2 id=floor(p), f=fract(p);
    for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
      vec2 o=vec2(float(i),float(j)), cid=id+o;
      float r=h21(cid+fl*17.);
      float wy=(cid.y+.5-fl*3.1)/sc;
      if(r > mix(.42,.03,S(.05,.75,wy))) continue;
      vec2 c = o + h22(cid+fl*5.)*.8+.1 - f;
      float rad = mix(.5,.06,sharp)*(.5+.5*h21(cid+2.3));
      float d = length(c);
      float disc = S(rad, rad-mix(.08,.7,sharp)*rad, d);
      disc *= mix(.55+.6*S(rad*.4,rad*.95,d), 1., sharp);
      float tw = .8+.2*sin(uT*(.4+h21(cid))+r*40.);
      float inten = (.15+.85*pow(h21(cid+9.1),2.))*tw*(1.+sharp*3.)/(1.+fl*.4);
      col += pal(h21(cid+4.4))*disc*inten*.55;
    }
  }
  return col;
}
vec3 N13(float p){ vec3 p3=fract(vec3(p)*vec3(.1031,.11369,.13787)); p3+=dot(p3,p3.yzx+19.19); return fract(vec3((p3.x+p3.y)*p3.z,(p3.x+p3.z)*p3.y,(p3.y+p3.z)*p3.x)); }
float Nf(float t){ return fract(sin(t*12345.564)*7658.76); }
float Saw(float b,float t){ return S(0.,b,t)*S(1.,b,t); }
vec2 DropLayer(vec2 uv,float t){
  vec2 UV=uv; uv.y+=t*.75; vec2 a=vec2(6.,1.); vec2 grid=a*2.; vec2 id=floor(uv*grid);
  uv.y+=Nf(id.x); id=floor(uv*grid);
  vec3 n=N13(id.x*35.2+id.y*2376.1); vec2 st=fract(uv*grid)-vec2(.5,0.);
  float x=n.x-.5; float y=UV.y*20.; float w=sin(y+sin(y)); x+=w*(.5-abs(x))*(n.z-.5); x*=.7;
  float ti=fract(t+n.z); y=(Saw(.85,ti)-.5)*.9+.5; vec2 p=vec2(x,y);
  float d=length((st-p)*a.yx); float mainDrop=S(.4,0.,d);
  float r=sqrt(S(1.,y,st.y)); float cd=abs(st.x-x); float trail=S(.23*r,.15*r*r,cd); float front=S(-.02,.02,st.y-y); trail*=front*r*r;
  y=UV.y; y=fract(y*10.)+(st.y-.5); float dd=length(st-vec2(x,y)); float droplets=S(.3,0.,dd);
  return vec2(mainDrop+droplets*r*front, trail);
}
float StaticDrops(vec2 uv,float t){ uv*=40.; vec2 id=floor(uv); uv=fract(uv)-.5; vec3 n=N13(id.x*107.45+id.y*3543.654);
  vec2 p=(n.xy-.5)*.7; float d=length(uv-p); float fade=Saw(.025,fract(t+n.z)); return S(.3,0.,d)*fract(n.z*10.)*fade; }
vec2 Drops(vec2 uv,float t,float l0,float l1,float l2){ float s=StaticDrops(uv,t)*l0; vec2 m1=DropLayer(uv,t)*l1; vec2 m2=DropLayer(uv*1.85,t)*l2;
  float c=s+m1.x+m2.x; c=S(.3,1.,c); return vec2(c,max(m1.y*l0,m2.y*l1)); }
vec3 scene(vec2 fc){
  vec2 uv=(fc-.5*uR)/uR.y; vec2 B=fc/uR.y;
  float t=uT*.18; float rain=sin(uT*.05)*.25+.75;
  float l0=S(-.5,1.,rain)*2., l1=S(.25,.75,rain), l2=S(0.,.5,rain);
  vec2 c=Drops(uv,t,l0,l1,l2); vec2 e=vec2(.0012,0.);
  float cx=Drops(uv+e,t,l0,l1,l2).x, cy=Drops(uv+e.yx,t,l0,l1,l2).x;
  vec2 n=vec2(cx-c.x, cy-c.x);
  float inDrop=S(.1,.2,c.x);
  float sharp = clamp(inDrop*.6 + c.y*.25, 0., 1.);
  vec3 col = bokeh(B - n*2.2 + vec2(0.,inDrop*.04), sharp);
  float fog = (1.-c.y)*(1.-inDrop);
  float lum=dot(col,vec3(.3,.5,.2));
  col = mix(col, col*.6+vec3(lum)*.5+pal(.1)*.008, fog*.3);
  col *= 1.-.25*S(.2,.5,c.x)*S(1.,.6,c.x);
  return col*1.6;
}
`;

  /* Mar aberto (baseado na técnica clássica de "seascape" com reflexo do céu) */
  SH.mar = `
#define RAW
#ifdef SUNSET
const float SEA_HEIGHT=.38; const float SEA_CHOPPY=3.2; const vec3 SEA_BASE=vec3(.05,.035,.09); const vec3 SEA_WATER=vec3(.55,.36,.3)*.6;
#else
const float SEA_HEIGHT=.6; const float SEA_CHOPPY=4.; const vec3 SEA_BASE=vec3(0.,.09,.18); const vec3 SEA_WATER=vec3(.8,.9,.6)*.6;
#endif
const float SEA_SPEED=.7; const float SEA_FREQ=.16;
const mat2 OCT=mat2(1.6,1.2,-1.2,1.6);
float snoise(vec2 p){ return -1.+2.*n2(p); }
float octave(vec2 uv,float ch){ uv+=snoise(uv); vec2 wv=1.-abs(sin(uv)); vec2 swv=abs(cos(uv)); wv=mix(wv,swv,wv); return pow(1.-pow(wv.x*wv.y,.65),ch); }
float seaT(){ return 1.+uT*SEA_SPEED; }
float mapS(vec3 p){ float fr=SEA_FREQ, amp=SEA_HEIGHT, ch=SEA_CHOPPY; vec2 uv=p.xz; uv.x*=.75; float h=0.;
  for(int i=0;i<3;i++){ float d=octave((uv+seaT())*fr,ch)+octave((uv-seaT())*fr,ch); h+=d*amp; uv*=OCT; fr*=1.9; amp*=.22; ch=mix(ch,1.,.2); } return p.y-h; }
float mapD(vec3 p){ float fr=SEA_FREQ, amp=SEA_HEIGHT, ch=SEA_CHOPPY; vec2 uv=p.xz; uv.x*=.75; float h=0.;
  for(int i=0;i<5;i++){ float d=octave((uv+seaT())*fr,ch)+octave((uv-seaT())*fr,ch); h+=d*amp; uv*=OCT; fr*=1.9; amp*=.22; ch=mix(ch,1.,.2); } return p.y-h; }
#ifdef SUNSET
const vec3 SUN = vec3(0., .07, -.997);
vec3 sky(vec3 e){ float y=max(e.y,0.);
  vec3 c=mix(vec3(1.,.42,.16), vec3(.55,.26,.42), S(0.,.18,y)); c=mix(c, vec3(.12,.12,.3), S(.12,.6,y));
  float s=max(dot(normalize(e),SUN),0.); c+=vec3(1.,.55,.25)*pow(s,6.)*.5+vec3(1.,.85,.6)*pow(s,900.)*3.;
  float cl=n2(vec2(e.x/(e.y+.08)*1.5, 1./(e.y+.08)*.6+uT*.01)); c=mix(c, vec3(.95,.45,.35)*.8, S(.55,.8,cl)*S(.02,.12,y)*.6);
  return c; }
#else
vec3 SUN = normalize(vec3(0.,1.,.8));
vec3 sky(vec3 e){ e.y=(max(e.y,0.)*.8+.2)*.8; return vec3(pow(1.-e.y,2.), 1.-e.y, .6+(1.-e.y)*.4)*1.1; }
#endif
float diffuse(vec3 n,vec3 l,float p){ return pow(dot(n,l)*.4+.6,p); }
float spec(vec3 n,vec3 l,vec3 e,float s){ float nrm=(s+8.)/(PI*8.); return pow(max(dot(reflect(e,n),l),0.),s)*nrm; }
vec3 seaColor(vec3 p,vec3 n,vec3 l,vec3 eye,vec3 dist){
  float fr=clamp(1.-dot(n,-eye),0.,1.); fr=min(pow(fr,3.),.5);
  vec3 refl=sky(reflect(eye,n)); vec3 refr=SEA_BASE+diffuse(n,l,80.)*SEA_WATER*.12;
  vec3 c=mix(refr,refl,fr); float at=max(1.-dot(dist,dist)*.001,0.);
  c+=SEA_WATER*(p.y-SEA_HEIGHT)*.18*at;
#ifdef SUNSET
  c+=vec3(1.,.7,.4)*spec(n,l,eye,90.)*1.4;
#else
  c+=vec3(spec(n,l,eye,60.));
#endif
  return c; }
vec3 normalS(vec3 p,float eps){ vec3 n; n.y=mapD(p); n.x=mapD(vec3(p.x+eps,p.y,p.z))-n.y; n.z=mapD(vec3(p.x,p.y,p.z+eps))-n.y; n.y=eps; return normalize(n); }
float trace(vec3 o,vec3 d,out vec3 p){ float tm=0., tx=1000.; float hx=mapS(o+d*tx); if(hx>0.){ p=o+d*tx; return tx; }
  float hm=mapS(o+d*tm); float tmid=0.;
  for(int i=0;i<8;i++){ tmid=mix(tm,tx,hm/(hm-hx)); p=o+d*tmid; float hmid=mapS(p); if(hmid<0.){ tx=tmid; hx=hmid; } else { tm=tmid; hm=hmid; } }
  return tmid; }
vec3 scene(vec2 fc){
  vec2 uv=fc/uR*2.-1.; uv.x*=uR.x/uR.y;
  float tt=uT*.3;
  vec3 ori=vec3(0.,3.2+sin(tt*1.3)*.15,-tt*5.);
  vec3 dir=normalize(vec3(uv.xy,-2.)); dir.z+=length(uv)*.14; dir=normalize(dir);
  dir.yz*=rot(-.12+sin(tt*.7)*.015); dir.xy*=rot(sin(tt*.9)*.02);
  vec3 p; trace(ori,dir,p); vec3 dist=p-ori;
  vec3 n=normalS(p,dot(dist,dist)*(.1/uR.x));
  vec3 col=mix(sky(dir), seaColor(p,n,SUN,dir,dist), pow(S(0.,-.02,dir.y),.2));
  return pow(clamp(col,0.,1.),vec3(.65));
}`;

  /* Mar de nuvens volumétricas (voando acima delas) */
  SH.nuvens = `
#define RAW
float cn(vec3 p){ return n3(p)*2.-1.; }
float mapC(vec3 p){ vec3 q=p-vec3(0.,.1,1.)*uT*.22; float f=.5*cn(q); q*=2.02; f+=.25*cn(q); q*=2.03; f+=.125*cn(q); q*=2.01; f+=.0625*cn(q);
  return clamp(1.5-p.y-2.+1.75*f,0.,1.); }
const vec3 SUND = vec3(-.55,.22,-.8);
vec3 scene(vec2 fc){
  vec2 p=(2.*fc-uR)/uR.y;
  vec3 ro=vec3(0.,.8,0.); vec3 rd=normalize(vec3(p,-1.6)); rd.yz*=rot(-.24);
  vec3 sd=normalize(SUND);
  float sun=clamp(dot(sd,rd),0.,1.);
  vec3 bg=vec3(.62,.66,.75)-rd.y*.22*vec3(1.,.55,1.)+.08; bg=mix(bg, vec3(1.,.72,.5), pow(1.-max(rd.y,0.),6.)*.35);
  bg+=.25*vec3(1.,.6,.2)*pow(sun,8.);
  vec4 sum=vec4(0.); float t=.05+.03*h21(fc);
  for(int i=0;i<70;i++){
    vec3 pos=ro+t*rd;
    if(pos.y<-3. || pos.y>2. || sum.a>.99) break;
    float den=mapC(pos);
    if(den>.01){
      float dif=clamp((den-mapC(pos+.3*sd))/.6,0.,1.);
      vec3 lin=vec3(.62,.66,.74)*1.35+vec3(1.,.62,.32)*dif*1.2;
      vec4 col=vec4(mix(vec3(1.,.95,.84),vec3(.28,.3,.38),den),den);
      col.xyz*=lin; col.xyz=mix(col.xyz,bg,1.-exp(-.0035*t*t));
      col.w*=.4; col.rgb*=col.w; sum+=col*(1.-sum.a);
    }
    t+=max(.06,.025*t);
  }
  sum=clamp(sum,0.,1.);
  vec3 col=bg*(1.-sum.w)+sum.xyz;
  col+=vec3(.25,.1,.04)*pow(sun,3.);
  return S(0.,1.,col);
}`;

  /* Tempestade com relâmpagos */
  SH.tempestade = `
#define EXPOSURE 1.3
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y; float a=uR.x/uR.y; float t=uT;
  float seg=floor(t*.45), ft=fract(t*.45)/.45;
  float has=step(.45,h11(seg*1.7));
  float fl=has*(exp(-ft*9.)+.7*exp(-abs(ft-.16)*45.)+.4*exp(-abs(ft-.33)*60.));
  vec2 fp=vec2((.15+.7*h11(seg+3.))*a, .62+.15*h11(seg+5.));
  float c1=fbm2(uv*vec2(1.3,2.4)+vec2(t*.015,0.)+.7*fbm2(uv*2.6-vec2(t*.02,0.)));
  float c2=fbm2(uv*vec2(3.,5.)+vec2(-t*.03,1.)+c1);
  float cl=S(.25,.85,c1*.7+c2*.4);
  vec3 col=mix(vec3(.012,.016,.024), vec3(.07,.08,.1), cl);
  col*=S(-.1,.6,uv.y)+.2;
  float lit=fl*exp(-length((uv-fp)*vec2(1.,1.5))*2.2)*(.25+cl*1.2);
  col+=vec3(.55,.6,.85)*lit*2.4;
  col+=vec3(.25,.28,.4)*fl*.12;
  float gy=.16+.06*fbm2(vec2(uv.x*1.8,3.))+.03*n2(vec2(uv.x*9.,1.));
  if(ft<.45 && has>.5){
    float bx=fp.x+(fbm2(vec2(uv.y*5.,seg))-.5)*.28+(n2(vec2(uv.y*45.,seg))-.5)*.025;
    float d=abs(uv.x-bx);
    float m=S(fp.y,fp.y-.03,uv.y)*S(gy-.02,gy+.02,uv.y);
    float k=S(.45,0.,ft)*(.4+.6*step(.5,fract(ft*14.)));
    col+=vec3(.8,.85,1.)*(S(.004,0.,d)*12.+exp(-d*70.)*1.2)*m*k;
  }
  if(uv.y<gy){ col=vec3(.006,.007,.01)+vec3(.05,.06,.09)*fl*.25; float tr=step(.82,h11(floor(uv.x*14.))); }
  vec2 rp=vec2((uv.x+uv.y*.18)*140., uv.y*2.5+t*9.);
  float rn=n2(rp); col+=vec3(.55,.6,.7)*S(.82,1.,rn)*(.08+fl*.25);
  rp=vec2((uv.x+uv.y*.16)*60., uv.y*1.5+t*6.); rn=n2(rp+7.); col+=vec3(.6,.65,.75)*S(.86,1.,rn)*(.06+fl*.2);
  return col;
}`;

  /* Floresta em camadas com neblina (terror) ou luz dourada e vaga-lumes (encantada) */
  SH.floresta = `
#ifdef HORROR
#define EXPOSURE 1.15
#else
#define EXPOSURE 1.25
#endif
vec2 trees(vec2 uv, float li, float lx){
  float sc=mix(11.,2.2,li);
  float x=uv.x*sc+li*31.7+uT*.005*(.3+li*3.);
  float y=uv.y; float gy=.17-li*.13+.025*sin(uv.x*2.3+li*5.)+.02*fbm2(vec2(uv.x*3.,li*9.));
  float id=floor(x); float m=0., sh=0.;
  float px=sc/uR.y;
  for(int k=-1;k<=1;k++){
    float cid=id+float(k);
    if(h11(cid*1.37+li*11.)<.42) continue;
    float hy=max(y-gy,0.);
    float cx=cid+.5+(h11(cid*7.1+li)-.5)*.7 + hy*(h11(cid*2.9+li)-.5)*.35 + sin(hy*2.+cid)*.04;
    float w=(.03+.07*h11(cid*3.3+li*5.))*(1.-hy*.1)*(1.+.8*exp(-hy*14.));
    float u=(x-cx)/w;
    float rough=(n2(vec2(cid*10., y*sc*6.))-.5)*.05;
    float d=abs(x-cx)-w*(1.+rough);
    float e=px*1.2+li*li*.02*sc;
    float mm=S(e,-e,d);
    if(mm>m){ m=mm; sh=clamp(u*lx*.5+.5,0.,1.); }
  }
  float ge=.004+li*li*.03;
  m=max(m, S(gy+ge,gy-ge,y));
  return vec2(m, sh);
}
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y; float a=uR.x/uR.y;
#ifdef HORROR
  vec3 fogC=vec3(.19,.23,.3); vec3 deep=vec3(.006,.008,.012); vec2 lp=vec2(a*.68,.82); vec3 lc=vec3(.7,.82,1.);
#else
  vec3 fogC=vec3(.36,.44,.22); vec3 deep=vec3(.012,.02,.01); vec2 lp=vec2(a*.75,1.05); vec3 lc=vec3(1.,.8,.42);
#endif
  float glow=exp(-length(uv-lp)*1.5);
  vec3 col=fogC*(.5+1.3*glow);
#ifdef HORROR
  float md=length(uv-lp); col+=vec3(.9,.95,1.)*S(.05,.045,md)*1.6*(.85+.15*n2(uv*40.))+lc*exp(-md*7.)*.45;
#endif
  float lx=sign(lp.x-uv.x);
  for(int i=0;i<6;i++){
    float li=float(i)/5.;
    vec2 tr=trees(uv,li,lx);
    float fogA=mix(.9,.03,pow(li,.55));
    vec3 bark=deep*(1.+tr.y*2.5)+lc*fogC*tr.y*.12*glow*(1.-li*.5);
    vec3 lcol=mix(bark, fogC*(.75+.9*glow), fogA);
    col=mix(col, lcol, tr.x);
    float fn=fbm2(vec2(uv.x*1.4+uT*.02*(1.+li*2.)+li*7., uv.y*3.+li*3.));
    float sheet=S(.45,.85,fn)*(.3+.45*S(.55,0.,uv.y))*(1.-li*.6);
    col=mix(col, fogC*(.85+.6*glow), sheet*.38);
  }
  vec2 dv=uv-lp; float ang=atan(dv.x,dv.y);
  float rays=pow(n2(vec2(ang*8.,uT*.035)),3.)*.8+pow(n2(vec2(ang*21.+4.,uT*.05)),4.)*.6;
  rays*=S(1.7,.1,length(dv))*S(-.1,.6,uv.y)*(.6+.4*fbm2(uv*3.+uT*.02));
#ifdef HORROR
  col+=lc*rays*.05;
  col=mix(col, fogC*1.15, S(.28,.0,uv.y)*.4*fbm2(vec2(uv.x*2.+uT*.04, uv.y*6.)));
#else
  col+=lc*rays*.3;
  for(int k=0;k<2;k++){
    vec2 p=uv*vec2(5.,5.)+float(k)*3.7; vec2 id=floor(p); vec2 f=fract(p)-.5;
    float r=h21(id+float(k)*9.);
    if(r>.6){
      vec2 o=.3*vec2(sin(uT*(.3+r)+r*30.), cos(uT*(.25+r*.5)+r*17.));
      float d=length(f-o); float bl=.5+.5*sin(uT*(1.5+r*2.)+r*50.); bl*=bl;
      col+=vec3(1.,.85,.35)*(.0006/(d*d+.0009))*bl*(1.-uv.y*.6)*.45;
    }
  }
#endif
  return col;
}
`;

  /* Lareira com fogo, brasas e tijolos iluminados */
  SH.lareira = `
#define EXPOSURE 1.0
float sdSeg(vec2 p,vec2 a,vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
float fireField(vec2 q, float seed){
  vec2 w=vec2(fbm2(vec2(q.x*3.+seed, q.y*2.5-uT*1.6)), 0.)-.5;
  q.x+=w.x*.18*q.y*2.5;
  float n1=fbm2(vec2(q.x*4.5+seed, q.y*3.2-uT*2.6));
  float n2_=fbm2(vec2(q.x*10.+seed*2.+5., q.y*7.-uT*4.2));
  float wd=.36*(1.-q.y*1.1)+.03;
  float shape=clamp(1.-pow(abs(q.x)/wd,1.6),0.,1.);
  float h=q.y/.6;
  float f=shape*(1.-h*.7)*1.5-(n1*.75+n2_*.45)*(.25+h*1.25);
  return S(0.,1.,clamp(f*1.7,0.,1.))*S(-.01,.03,q.y);
}
vec3 scene(vec2 fc){
  vec2 uv=(fc-vec2(.5*uR.x,0.))/uR.y;
  float t=uT;
  float flick=.85+.08*sin(t*7.3)+.06*sin(t*13.1+1.)+.08*(n2(vec2(t*5.,0.))-.5);
  vec2 b=uv*vec2(5.5,12.)+vec2(0.,.3); float row=floor(b.y); b.x+=mod(row,2.)*.5+h11(row)*.2;
  vec2 bf=fract(b); vec2 bid=floor(b);
  float mor=S(0.,.04+.03*n2(b*9.),bf.x)*S(1.,.96-.03*n2(b*7.),bf.x)*S(0.,.08,bf.y)*S(1.,.92,bf.y);
  float bn=h21(bid);
  vec3 brick=mix(vec3(.02,.016,.014), vec3(.2,.085,.05)*(.5+.6*bn)*(.7+.5*fbm2(uv*vec2(40.,25.))), mor);
  float soot=S(.15,.85,uv.y+.25*fbm2(uv*2.))*S(.9,.1,abs(uv.x)*1.2);
  brick*=1.-.75*soot;
  float lf=exp(-length((uv-vec2(0.,.1))*vec2(1.,1.15))*2.4)*flick;
  vec3 col=brick*lf*vec3(2.2,1.,.45);
  vec2 fq=vec2(uv.x, uv.y-.08);
  float f=fireField(fq,0.);
  f=max(f, fireField(vec2((fq.x+.2)*1.5, fq.y*1.25),4.3)*.9);
  f=max(f, fireField(vec2((fq.x-.22)*1.4, fq.y*1.2),9.1)*.9);
  f*=flick;
  vec3 fire=vec3(1.5*f, 1.35*f*f, f*f*f*f*f)*1.25;
  col+=fire;
  col+=vec3(1.,.42,.1)*exp(-length((uv-vec2(0.,.15))*vec2(1.,1.5))*4.5)*.22*flick;
  float l1=sdSeg(uv,vec2(-.44,.07),vec2(.38,.12))-.05;
  float l2=sdSeg(uv,vec2(.44,.05),vec2(-.32,.13))-.045;
  float l3=sdSeg(uv,vec2(-.22,.035),vec2(.27,.025))-.04;
  float ld=min(min(l1,l2),l3);
  if(ld<.002){
    float bark=fbm2(uv*vec2(70.,14.));
    float crack=pow(S(.62,.82,fbm2(uv*vec2(26.,10.)+3.)),2.);
    float top=S(-.03,0.,ld);
    vec3 wood=vec3(.022,.013,.009)*(.5+.9*bark);
    wood+=vec3(.35,.12,.04)*top*lf*.35;
    vec3 ember=vec3(1.,.28,.05)*crack*(.6+.4*sin(t*1.5+uv.x*25.))*flick*1.2;
    col=mix(col, wood+ember, S(.002,-.004,ld));
  }
  if(uv.y<.04){ float coal=S(.45,.85,fbm2(uv*vec2(25.,40.)+vec2(0.,t*.08))); col=mix(col, vec3(.012,.008,.006)+vec3(1.,.28,.05)*coal*1.1*flick, S(.04,.025,uv.y)*S(.58,.42,abs(uv.x))); }
  for(int i=0;i<3;i++){
    float fi=float(i);
    vec2 p=uv*vec2(9.,5.)*(1.+fi*.6); p.y-=t*(.5+fi*.25); p.x+=sin(p.y*1.7+fi*2.)*.35+t*.04;
    vec2 id=floor(p), ff=fract(p)-.5;
    float r=h21(id+fi*7.);
    if(r>.86){ vec2 o=(h22(id+fi)-.5)*.6; float d=length(ff-o);
      float life=S(.85,.3,uv.y)*S(.12,.3,uv.y)*S(.5,.08,abs(uv.x));
      col+=vec3(1.,.45,.12)*S(.05,0.,d)*life*(1.2+1.2*sin(t*9.+r*40.)); }
  }
  return col;
}
`;

  /* Vela acesa num quarto escuro */
  SH.vela = `
#define EXPOSURE 1.15
vec3 scene(vec2 fc){
  vec2 uv=(fc-.5*uR)/uR.y; uv.y+=.05;
  float t=uT;
  float sway=sin(t*1.3)*.006+(n2(vec2(t*2.5,1.))-.5)*.012;
  float flick=.88+.07*sin(t*9.)+.05*(n2(vec2(t*8.,4.))-.5);
  vec3 col=vec3(.012,.009,.007)*(1.+.3*n2(uv*4.));
  col*=.8+.4*S(-.6,.4,uv.y);
  float hd=length((uv-vec2(0.,.05))*vec2(1.,.9));
  col+=vec3(1.,.5,.18)*exp(-hd*3.)*.32*flick;
  col+=vec3(1.,.62,.3)*exp(-hd*9.)*.35*flick;
  col*=.85+.3*n2(uv*vec2(2.,7.)+3.);
  float ty=-.5;
  if(uv.y<ty){ float r=length((uv-vec2(0.,ty))*vec2(1.,4.)); col=vec3(.02,.012,.008)*(1.+n2(uv*vec2(4.,40.)))+vec3(1.,.55,.25)*exp(-r*4.)*.25*flick;
    vec2 rq=vec2(uv.x,(ty-uv.y)); col+=vec3(1.,.7,.4)*exp(-length((rq-vec2(0.,.1))*vec2(12.,4.)))*.3*flick; }
  float cw=.065; float top=-.02-.008*(1.-pow(uv.x/cw,2.));
  if(abs(uv.x)<cw && uv.y<top && uv.y>ty){
    float sh=cos(uv.x/cw*1.5707);
    float near=exp(-(top-uv.y)*5.);
    vec3 wax=vec3(.85,.74,.58)*(.04+.5*sh*near*flick)+vec3(1.,.55,.25)*near*.45*flick*(1.-abs(uv.x)/cw*.6);
    float drip=S(.5,.8,n2(vec2(uv.x*40.,0.)))*S(top-.12,top,uv.y);
    wax*=1.+drip*.3;
    col=wax*S(cw,cw-.003,abs(uv.x));
  }
  if(abs(uv.x)<.003 && uv.y>top-.004 && uv.y<.012) col=vec3(.01)+vec3(1.,.4,.1)*S(.0,.01,uv.y)*.6;
  vec2 fq=uv-vec2(0.,.012); fq.x-=sway*max(fq.y,0.)*10.;
  float wdt=.017*(1.-S(0.,.11,fq.y)*.85)+.001;
  vec2 e=vec2(fq.x/wdt, (fq.y-.032)/.055);
  float d=length(e);
  float core=S(1.,.15,d)*S(-.02,.0,fq.y);
  vec3 fl=mix(vec3(1.,.42,.08), vec3(1.,.93,.75), S(.75,.15,d))*core*7.*flick;
  fl+=vec3(.15,.25,1.)*S(.02,0.,fq.y+.002)*core*S(.0,-.02,fq.y-.012)*3.;
  col+=fl;
  col+=vec3(1.,.6,.3)*exp(-length(fq-vec2(0.,.035))*28.)*.9*flick;
  return col;
}`;

  /* Via Láctea sobre montanhas */
  SH.vialactea = `
#define EXPOSURE 1.3
vec3 stars(vec2 p, float sc, float dens, float seed){
  vec2 g=p*sc; vec2 id=floor(g), f=fract(g)-.5; float r=h21(id+seed);
  if(r>dens) return vec3(0.);
  vec2 o=(h22(id+seed*1.3)-.5)*.75; float d=length(f-o)*uR.y/sc;
  float b=pow(h21(id+seed+3.),8.)*2.5+.08;
  float tw=.7+.3*sin(uT*(1.+r*3.)+r*60.);
  vec3 c=mix(vec3(.7,.82,1.), vec3(1.,.78,.55), h21(id+seed+7.));
  return c*b*tw*exp(-d*d*1.2);
}
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y; float a=uR.x/uR.y; vec2 c=uv-vec2(.5*a,.45);
  c=rot(uT*.003)*c;
  vec2 bd=rot(-.55)*c; float d=bd.y+.08*(fbm2(vec2(bd.x*1.3,3.))-.5);
  float band=exp(-d*d*14.);
  float glow=fbm2(bd*vec2(3.,6.)+5.)*fbm2(bd*vec2(7.,12.)+2.)*1.6;
  vec3 mw=mix(vec3(.28,.34,.55), vec3(1.,.74,.48), exp(-d*d*60.)*S(.7,-.5,bd.x));
  vec3 col=mw*band*(.1+.9*glow)*.38;
  float dust=S(.42,.68,fbm2(bd*vec2(5.,16.)+11.))*exp(-d*d*40.);
  col*=1.-dust*.9;
  col+=mix(vec3(.0015,.002,.006), vec3(.008,.012,.022), S(.9,.0,uv.y));
  col+=vec3(.1,.055,.03)*exp(-uv.y*6.)*.45;
  col+=vec3(.02,.05,.025)*exp(-uv.y*10.)*.4;
  float sb=1.+band*3.;
  col+=stars(c,60.,.06*sb,1.)+stars(c,130.,.05*sb,7.)*.7+stars(c,280.,.06*sb,13.)*.45+stars(c,23.,.04,19.)*1.2;
  float mh=.14+.09*fbm2(vec2(uv.x*1.4,2.))+.03*n2(vec2(uv.x*8.,5.));
  float mh2=.085+.05*fbm2(vec2(uv.x*2.5+9.,2.))+.012*fbm2(vec2(uv.x*30.,1.));
  col=mix(col, vec3(.003,.003,.006)+vec3(.015,.011,.008)*exp(-(mh-uv.y)*20.), S(mh+.002,mh-.002,uv.y));
  col=mix(col, vec3(.0008,.0008,.0015), S(mh2+.002,mh2-.002,uv.y));
  float sp=floor(uT/9.); float st=fract(uT/9.)*9.;
  if(h11(sp)>.5 && st<.8){ vec2 s0=vec2(h11(sp+1.)*a, .6+.3*h11(sp+2.)); vec2 dir=normalize(vec2(-.8,-.4)); vec2 hp=s0+dir*st*.6;
    vec2 rel=uv-hp; float along=dot(rel,-dir), across=abs(dot(rel,vec2(-dir.y,dir.x)));
    col+=vec3(.85,.9,1.)*S(.0015,0.,across)*S(.12,0.,along)*S(-.002,.0,along)*S(.8,.3,st)*3.; }
  return col;
}
`;

  /* Aurora boreal refletida num lago */
  SH.aurora = `
#define RAW
mat2 mm2(float a){ float c=cos(a), s=sin(a); return mat2(c,s,-s,c); }
const mat2 M2=mat2(.95534,.29552,-.29552,.95534);
float tri(float x){ return clamp(abs(fract(x)-.5),.01,.49); }
vec2 tri2(vec2 p){ return vec2(tri(p.x)+tri(p.y), tri(p.y+tri(p.x))); }
float triNoise(vec2 p, float spd){ float z=1.8, z2=2.5, rz=0.; p*=mm2(p.x*.06); vec2 bp=p;
  for(int i=0;i<5;i++){ vec2 dg=tri2(bp*1.85)*.75; dg*=mm2(uT*spd); p-=dg/z2; bp*=1.3; z2*=.45; z*=.42; p*=1.21+(rz-1.)*.02; rz+=tri(p.x+tri(p.y))*z; p*=-M2; }
  return clamp(1./pow(rz*29.,1.3),0.,.55); }
vec4 aurora(vec3 ro, vec3 rd, vec2 fc){ vec4 col=vec4(0.), avg=vec4(0.);
  for(int ii=0;ii<44;ii++){ float i=float(ii);
    float of=.006*h21(fc)*S(0.,15.,i);
    float pt=((.8+pow(i,1.4)*.002)-ro.y)/(rd.y*2.+.4); pt-=of;
    vec3 bp=ro+pt*rd; float rzt=triNoise(bp.zx,.06);
    vec4 c2=vec4(0.,0.,0.,rzt); c2.rgb=(sin(1.-vec3(2.15,-.5,1.2)+i*.043)*.5+.5)*rzt;
    avg=mix(avg,c2,.5); col+=avg*exp2(-i*.065-2.5)*S(0.,5.,i); }
  col*=clamp(rd.y*15.+.4,0.,1.); return col*1.9; }
vec3 bgc(vec3 rd){ float sd=dot(normalize(vec3(-.5,-.6,.9)),rd)*.5+.5; sd=pow(sd,5.); return mix(vec3(.05,.1,.2),vec3(.1,.05,.2),sd)*.63; }
vec3 starsA(vec3 p){ vec3 c=vec3(0.); float res=uR.x;
  for(int ii=0;ii<3;ii++){ float i=float(ii); vec3 q=fract(p*(.15*res))-.5; vec3 id=floor(p*(.15*res)); vec2 rn=vec2(h31(id),h31(id+3.));
    float c2=1.-S(0.,.6,length(q)); c2*=step(rn.x,.0005+i*i*.001); c+=c2*(mix(vec3(1.,.49,.1),vec3(.75,.9,1.),rn.y)*.1+.9); p*=1.3; }
  return c*c*.8; }
float mount(float x){ return .02+.05*fbm2(vec2(x*1.6,1.))+.015*n2(vec2(x*9.,3.)); }
vec3 scene(vec2 fc){
  vec2 q=fc/uR; vec2 p=q-.5; p.x*=uR.x/uR.y;
  vec3 ro=vec3(0.,0.,-6.7); vec3 rd=normalize(vec3(p,1.3));
  rd.yz*=mm2(-.12); rd.xz*=mm2(sin(uT*.02)*.15);
  vec3 col=vec3(0.); vec3 brd=rd;
  float fade=S(0.,.01,abs(brd.y))*.1+.9;
  float hor=mount(atan(rd.x,rd.z));
  if(rd.y>0.){
    col=bgc(rd)*fade;
    vec4 aur=S(0.,1.5,aurora(ro,rd,fc))*fade;
    col+=starsA(rd);
    col=col*(1.-aur.a)+aur.rgb;
    if(rd.y<hor) col=mix(col, vec3(.004,.006,.01)+aur.rgb*.05, S(hor,hor-.002,rd.y));
  } else {
    rd.y=abs(rd.y);
    col=bgc(rd)*fade*.6;
    vec3 pos=ro+((.5-ro.y)/rd.y)*rd;
    float nz2=triNoise(pos.xz*vec2(.5,.7),0.);
    vec3 rrd=rd; rrd.x+=(nz2-.2)*.01;
    vec4 aur=S(0.,2.5,aurora(ro,rrd,fc));
    col+=starsA(rd)*.1;
    col=col*(1.-aur.a)+aur.rgb;
    col+=mix(vec3(.2,.25,.5)*.08, vec3(.3,.3,.5)*.7, nz2*.4);
    if(rd.y<hor) col=mix(col, vec3(.003,.004,.008), S(hor,hor-.003,rd.y)*.9);
  }
  return col;
}`;

  /* Viagem por dentro de uma nebulosa */
  SH.nebulosa = `
#define EXPOSURE 1.2
vec3 scene(vec2 fc){
  vec2 uv=(fc-.5*uR)/uR.y; vec3 col=vec3(.002,.002,.006);
  for(int i=0;i<6;i++){
    float fi=float(i); float z=fract(fi/6.+uT*.006);
    float sc=mix(3.5,.35,z); float fade=S(0.,.3,z)*S(1.,.75,z);
    vec2 p=rot(fi*1.3)*uv*sc+vec2(fi*7.3,fi*3.1);
    vec2 w=vec2(fbm2(p+vec2(0.,uT*.008)), fbm2(p+vec2(5.2,1.3)));
    float d=fbm2(p+w*2.2);
    float em=S(.42,.95,d);
    vec3 pc=mix(vec3(.9,.22,.45), vec3(.15,.45,.95), h11(fi*3.7));
    pc=mix(pc, vec3(1.,.6,.25), S(.7,1.,d)*.6);
    col+=pc*em*em*fade*.55;
    vec2 g=p*14.; vec2 id=floor(g), f=fract(g)-.5; float r=h21(id+fi);
    if(r>.9){ vec2 o=(h22(id)-.5)*.7; float sd=length(f-o)*uR.y/(sc*14.); col+=vec3(.9,.92,1.)*exp(-sd*sd*.8)*fade*(.4+pow(h21(id+2.),4.)*3.); }
  }
  col*=1.-.75*S(.5,.8,fbm2(uv*1.8+uT*.002+20.));
  vec2 g=uv*3.; vec2 id=floor(g), f=fract(g)-.5;
  if(h21(id+50.)>.75){ vec2 o=(h22(id+5.)-.5)*.6; vec2 dd=(f-o); float l=length(dd)*uR.y/3.;
    float spikes=exp(-abs(dd.x)*uR.y*.35)*exp(-abs(dd.y)*40.)+exp(-abs(dd.y)*uR.y*.35)*exp(-abs(dd.x)*40.);
    col+=vec3(.85,.9,1.)*(exp(-l*l*.25)*2.+spikes*.3)*(.5+.5*sin(uT*.7+h21(id)*30.)); }
  return col;
}`;

  /* Planeta visto da órbita, com nuvens, oceano, luzes das cidades e atmosfera */
  SH.planeta = `
#define EXPOSURE 1.1
vec3 scene(vec2 fc){
  vec2 uv=(fc-.5*uR)/uR.y;
  vec3 ro=vec3(0.,0.,3.2); vec3 rd=normalize(vec3(uv,-1.5));
  vec3 pc=vec3(.62,-.55,0.); float R=1.;
  vec3 sun=normalize(vec3(-1.,.45,.55));
  vec3 col=vec3(0.);
  vec2 g=uv*90.; vec2 id=floor(g), f=fract(g)-.5;
  if(h21(id)>.93){ float d=length(f-(h22(id)-.5)*.7)*uR.y/90.; col+=vec3(.9,.92,1.)*exp(-d*d)*(.2+pow(h21(id+1.),5.)*2.); }
  col+=vec3(.05,.03,.08)*fbm2(uv*1.5+4.)*.3;
  vec3 oc=ro-pc; float b=dot(oc,rd); float c=dot(oc,oc)-R*R; float hh=b*b-c;
  float dc=sqrt(max(dot(oc,oc)-b*b,0.));
  vec3 cp=ro+rd*(-b); vec3 cn=normalize(cp-pc);
  float sl=S(-.35,.6,dot(cn,sun));
  if(hh>0.){
    float tt=-b-sqrt(hh); vec3 p=ro+rd*tt; vec3 n=normalize(p-pc);
    vec3 q=n; q.xz*=rot(uT*.012); q.xy*=rot(.35);
    float e=fbm3(q*2.3+1.);
    float land=S(.53,.56,e);
    float lat=abs(q.y);
    float ice=S(.78,.86,lat+(e-.5)*.4);
    vec3 ocean=vec3(.005,.025,.08);
    vec3 lc=mix(vec3(.08,.14,.04), vec3(.32,.25,.14), S(.56,.68,e)+S(.3,.6,1.-lat)*.0);
    lc=mix(lc, vec3(.45,.36,.22), S(.25,0.,lat)*.5);
    vec3 surf=mix(ocean,lc,land); surf=mix(surf,vec3(.85,.88,.92),ice);
    vec3 q2=n; q2.xz*=rot(uT*.016); q2.xy*=rot(.35);
    float cl=S(.52,.78,fbm3(q2*3.5+fbm3(q2*1.8)*1.5));
    float dif=max(dot(n,sun),0.); float term=S(-.08,.25,dot(n,sun));
    vec3 lit=surf*dif*1.6;
    lit+=vec3(1.,.85,.6)*pow(max(dot(reflect(rd,n),sun),0.),35.)*(1.-land)*(1.-cl)*.8*term;
    lit=mix(lit, vec3(1.)*dif*1.35, cl);
    float city=land*(1.-ice)*pow(n3(q*70.),7.)*6.*S(.05,-.2,dot(n,sun))*(1.-cl*.8);
    lit+=vec3(1.,.6,.25)*city;
    float fres=pow(1.-max(dot(n,-rd),0.),2.5);
    lit+=vec3(.25,.5,1.)*fres*(term*1.1+.03);
    lit+=vec3(.9,.35,.15)*fres*S(.25,0.,abs(dot(n,sun)))*.25;
    col=lit;
  }
  float halo=exp(-max(dc-R,0.)*22.)*S(R-.02,R+.01,dc);
  col+=vec3(.3,.55,1.)*halo*sl*.9;
  return col;
}`;

  /* Viagem entre as estrelas */
  SH.estrelas = `
#define EXPOSURE 1.2
vec3 scene(vec2 fc){
  vec2 uv=(fc-.5*uR)/uR.y; vec3 col=vec3(.002,.003,.008);
  col+=vec3(.08,.04,.12)*S(.5,.8,fbm2(uv*1.2+uT*.004))*.4+vec3(.02,.06,.1)*S(.45,.8,fbm2(uv*2.-uT*.003+9.))*.4;
  float ang=atan(uv.y,uv.x); vec2 dir=normalize(uv+1e-5);
  for(int i=0;i<8;i++){
    float fi=float(i); float z=fract(fi/8.-uT*.025);
    float sc=mix(22.,.9,z); float fade=S(0.,.5,z)*S(1.,.85,z);
    vec2 p=uv*sc+fi*vec2(13.1,7.7); vec2 id=floor(p); vec2 f=fract(p)-.5;
    float r=h21(id+fi);
    if(r>.35) continue;
    vec2 o=(h22(id+fi*3.)-.5)*.7; vec2 l=f-o;
    float along=dot(l,dir), across=dot(l,vec2(-dir.y,dir.x));
    float stretch=1.+z*z*4.;
    float d=length(vec2(along/stretch, across))*uR.y/sc;
    vec3 sc_=mix(vec3(.7,.8,1.), vec3(1.,.85,.7), h21(id+2.));
    col+=sc_*exp(-d*d*.7)*fade*(.6+z*2.);
  }
  return col;
}`;

  /* Deserto de dunas ao entardecer */
  SH.deserto = `
#define EXPOSURE 1.05
float dune(vec2 p){
  float n=n2(p*.03)*2.5;
  float d1=pow(1.-abs(sin(dot(p,vec2(.09,.04))+n)),1.8)*2.4;
  float d2=pow(1.-abs(sin(dot(p,vec2(-.05,.1))+n*1.3+1.)),1.8)*1.6;
  float h=max(d1,d2*.85)+n2(p*.05)*1.3;
  h+=.02*sin(p.x*3.+p.y*1.2+n2(p*.4)*4.);
  return h;
}
vec3 SUNV=normalize(vec3(-.9,.22,.4));
vec3 skyD(vec3 rd){
  float y=max(rd.y,0.);
  vec3 c=mix(vec3(1.,.5,.22), vec3(.45,.48,.62), S(0.,.22,y)); c=mix(c,vec3(.12,.2,.42),S(.18,.8,y));
  float s=max(dot(rd,SUNV),0.); c+=vec3(1.,.5,.2)*pow(s,6.)*.7+vec3(1.,.88,.7)*pow(s,700.)*8.;
  return c;
}
vec3 scene(vec2 fc){
  vec2 uv=(fc-.5*uR)/uR.y;
  float hz=S(.1,0.,abs(uv.y+.03));
  uv.y+=hz*.0012*sin(fc.y*.6+uT*5.);
  vec3 ro=vec3(uT*.3, 0., 0.); ro.y=dune(ro.xz)+2.;
  vec3 rd=normalize(vec3(uv.x, uv.y-.1, 1.));
  vec3 col=skyD(rd);
  float t=.5; float hit=0.;
  for(int i=0;i<120;i++){
    vec3 p=ro+rd*t; float d=p.y-dune(p.xz);
    if(d<.002*t){ hit=1.; break; }
    t+=max(.015,d*.35);
    if(t>160.) break;
  }
  if(hit>.5){
    vec3 p=ro+rd*t; vec2 e=vec2(.02+.0015*t,0.);
    vec3 n=normalize(vec3(dune(p.xz-e.xy)-dune(p.xz+e.xy), 2.*e.x, dune(p.xz-e.yx)-dune(p.xz+e.yx)));
    float dif=max(dot(n,SUNV),0.);
    float sh=1.; float st=.2;
    for(int j=0;j<26;j++){ vec3 sp=p+SUNV*st; float dd=sp.y-dune(sp.xz); sh=min(sh, 10.*dd/st); st+=max(.12,dd*.5); if(sh<.01||st>30.) break; }
    sh=clamp(sh,0.,1.);
    vec3 alb=vec3(.86,.5,.26)*(.9+.2*n2(p.xz*3.));
    vec3 c=alb*(dif*sh*vec3(2.2,1.3,.75)+vec3(.12,.16,.3)*(.5+.5*n.y)*.9);
    c+=alb*vec3(1.,.45,.2)*(1.-sh)*.04;
    col=mix(c, skyD(normalize(vec3(rd.x,.01,rd.z)))*.8, 1.-exp(-t*.007));
  }
  float sand=n2(vec2(uv.x*3.-uT*1.3, uv.y*55.+uT*.2))*n2(vec2(uv.x*9.-uT*2., uv.y*20.));
  return col;
}
`;

  /* Cinzas caindo sobre uma cidade em ruínas */
  SH.cinzas = `
#define EXPOSURE 1.1
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y; float a=uR.x/uR.y;
  float s=fbm2(uv*vec2(1.4,2.)+vec2(uT*.01,0.)+fbm2(uv*3.-vec2(uT*.015,0.)));
  vec3 col=mix(vec3(.16,.07,.035), vec3(.6,.3,.12), S(.0,1.,uv.y*.55+s*.65));
  col=mix(col, vec3(.08,.05,.04), S(.55,.85,s)*.6);
  vec2 sp=vec2(a*.64,.66); float d=length(uv-sp);
  col+=vec3(1.,.3,.08)*S(.055,.05,d)*(1.-S(.5,.8,s)*.8)*1.4+vec3(1.,.38,.12)*exp(-d*5.)*.3;
  for(int L=0;L<3;L++){
    float fl=float(L); float sc=mix(9.,4.,fl/2.);
    float x=uv.x*sc+fl*10.3; float id=floor(x); float fx=fract(x);
    float r=h11(id+fl*7.);
    float hgt=(.12+.38*r*r)*(fl==0.?.55:(fl==1.?.8:1.))+.06*fl;
    float gap=step(.2,h11(id*3.1+fl));
    hgt*=gap*.8+.2;
    float broken=step(.55,h11(id*5.7+fl));
    hgt+=broken*(n2(vec2(fx*6.+id,fl))-.5)*.08 - broken*fx*.06*sign(h11(id+.5)-.5);
    float inB=S(.04,.06,fx)*S(.96,.94,fx);
    float m=S(hgt+.003,hgt-.003,uv.y)*max(inB, step(uv.y,hgt-.0))*1.;
    vec3 bc=mix(col*.55, vec3(.02,.012,.01), (fl+1.)/3.)*(.82+.3*n2(uv*vec2(sc*9.,140.)))*(.9+.2*step(.5,fract(uv.y*90.)));
    bc+=vec3(1.,.45,.15)*S(.08,0.,abs(fx-.5)-.42)*.0;
    float win=step(.985,h21(floor(uv*vec2(sc*7.,70.))+fl))*S(hgt-.02,hgt-.05,uv.y);
    bc+=vec3(1.,.4,.1)*win*.25*(fl/2.)*(.6+.4*sin(uT*3.+id));
    col=mix(col, bc, m);
  }
  col+=vec3(1.,.3,.06)*exp(-uv.y*9.)*.25*(.7+.3*sin(uT*1.7+uv.x*7.));
  float sm=fbm2(uv*vec2(1.6,3.2)+vec2(uT*.02,-uT*.01));
  col=mix(col, vec3(.32,.17,.08), S(.4,.85,sm)*S(.55,.0,uv.y)*.55);
  for(int k=0;k<4;k++){
    float fk=float(k); float sc=mix(4.,26.,fk/3.);
    vec2 p=uv*sc; p.y+=uT*mix(.18,.05,fk/3.)*sc*.25; p.x+=uT*.06*sc*.2+sin(uT*.4+p.y*.4+fk)*.25;
    vec2 id=floor(p), f=fract(p)-.5;
    float r=h21(id+fk*5.);
    if(r<.22){
      vec2 o=(h22(id+fk)-.5)*.5; float dd=length(f-o);
      float rad=.06+.1*h21(id+3.); float bl=mix(.85,.25,fk/3.);
      float m=S(rad,rad*(1.-bl),dd);
      bool ember=h21(id+11.)>.9;
      vec3 c=ember? vec3(1.,.45,.12)*2. : vec3(.75,.7,.66);
      col=ember? col+c*m*.6 : mix(col, c, m*mix(.45,.8,fk/3.));
    }
  }
  return col;
}`;

  /* Fundo do mar com raios de luz, plâncton e algas */
  SH.oceano = `
#define EXPOSURE 1.15
vec3 scene(vec2 fc){
  vec2 uv=(fc-vec2(.5*uR.x,0.))/uR.y;
  vec3 col=mix(vec3(.0,.02,.045), vec3(.02,.22,.32), pow(clamp(uv.y,0.,1.),1.4));
  float s=fbm2(vec2(uv.x*3.+uT*.04, uT*.08)+fbm2(vec2(uv.x*6.-uT*.05,uT*.1)));
  col+=vec3(.35,.75,.85)*S(.78,1.02,uv.y)*(.3+1.1*S(.4,.8,s));
  vec2 dv=uv-vec2(.25,1.5); float a=atan(dv.x,-dv.y);
  float rays=pow(n2(vec2(a*14.,uT*.12)),4.)*1.4+pow(n2(vec2(a*33.+5.,uT*.18)),5.)*.9;
  rays*=S(-.1,.95,uv.y)*exp(-length(dv)*.35);
  col+=vec3(.3,.72,.78)*rays*.5;
  for(int L=0;L<2;L++){
    float fl=float(L); float sc=mix(9.,4.,fl);
    float x=uv.x*sc+fl*5.7; float id=floor(x);
    for(int k=-1;k<=1;k++){
      float cid=id+float(k); float r=h11(cid*2.3+fl);
      if(r<.5) continue;
      float ht=(.25+.45*h11(cid*4.1+fl))*(1.+fl*.2);
      float sw=sin(uv.y*3.5+uT*.6+cid)*.25*uv.y*sc*.25+sin(uv.y*9.+uT*1.1+cid*3.)*.03*sc*.1;
      float cx=cid+.5+(h11(cid*9.+fl)-.5)*.5+sw;
      float w=.1+.1*n2(vec2(uv.y*22.,cid))+.04*sin(uv.y*60.+cid);
      float m=S(w,w*.3,abs(x-cx))*S(ht,ht-.05,uv.y);
      vec3 kc=mix(col*.5, vec3(.01,.05,.04), fl*.8+.1);
      col=mix(col,kc,m);
    }
    float gy=.06+.05*fbm2(vec2(uv.x*(2.+fl*2.)+fl*4.,fl))+fl*-.02;
    col=mix(col, mix(col*.45, vec3(.005,.02,.025), fl), S(gy+.005,gy-.005,uv.y));
  }
  for(int k=0;k<3;k++){
    float fk=float(k); float sc=mix(5.,22.,fk/2.);
    vec2 p=uv*sc+fk*4.; p.y-=uT*.02*sc*.3; p.x+=sin(uT*.2+p.y*.3+fk)*.2;
    vec2 id=floor(p), f=fract(p)-.5; float r=h21(id+fk*9.);
    if(r<.3){ vec2 o=(h22(id)-.5)*.6; float d=length(f-o); float rad=mix(.12,.05,fk/2.);
      col+=vec3(.6,.85,.9)*S(rad,rad*mix(.1,.7,fk/2.),d)*mix(.06,.25,fk/2.)*(.5+uv.y); }
  }
  return col;
}`;

  /* Neve caindo numa floresta de pinheiros, com profundidade de campo */
  SH.neve = `
#define EXPOSURE 1.0
float pine(vec2 uv, float li, float blur){
  float sc=mix(7.,2.5,li); float x=uv.x*sc+li*13.; float id=floor(x); float m=0.;
  for(int k=-1;k<=1;k++){
    float cid=id+float(k); if(h11(cid*3.1+li)<.3) continue;
    float cx=cid+.5+(h11(cid*5.3+li)-.5)*.5; float base=.2-li*.12; float H=(.4+.35*h11(cid*7.7+li))*(1.+li*.4);
    float y=(uv.y-base)/H; if(y<0.||y>1.) continue;
    float hw=(1.-y)*.33*(.85+.15*sin(y*28.+cid))+.012;
    float d=abs(x-cx)-hw*sc*.18*2.;
    m=max(m, S(blur,-blur,d));
  }
  return m;
}
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y;
  vec3 col=mix(vec3(.55,.59,.66), vec3(.34,.39,.48), S(.2,1.,uv.y));
  for(int i=0;i<3;i++){
    float li=float(i)/2.;
    float m=pine(uv, li, mix(.06,.2,li));
    vec3 tc=mix(col*.8, vec3(.07,.09,.1), mix(.35,.95,li));
    col=mix(col,tc,m*mix(.6,1.,li));
    col=mix(col, vec3(.7,.73,.79), .12*(1.-li));
  }
  float gy=.13+.02*sin(uv.x*1.7)+.01*n2(vec2(uv.x*5.,0.));
  col=mix(col, vec3(.82,.85,.9)*(.92+.08*n2(uv*vec2(20.,60.))), S(gy+.008,gy-.008,uv.y));
  for(int k=0;k<5;k++){
    float fk=float(k)/4.;
    float sc=mix(26.,3.,fk);
    vec2 p=uv*sc;
    p.y+=uT*mix(.045,.25,fk)*sc*.5;
    p.x+=uT*.05*sc*.3+sin(uT*.6+p.y*.5+fk*3.)*.25;
    vec2 id=floor(p), f=fract(p)-.5;
    float r=h21(id+fk*13.);
    if(r<mix(.5,.25,fk)){
      vec2 o=(h22(id+fk*7.)-.5)*.45;
      float d=length(f-o);
      float rad=mix(.09,.2,fk)*(.6+.5*h21(id+4.));
      float bl=mix(.35,.95,fk);
      float m=S(rad,rad*(1.-bl),d);
      col=mix(col, vec3(.97,.98,1.), m*mix(.85,.5,fk));
    }
  }
  return col*1.05;
}`;

  /* Lago ao amanhecer com névoa e montanhas refletidas */
  SH.lago = `
#define EXPOSURE 1.0
const float HZ=.38;
vec3 skyL(vec2 p, float a){
  float y=p.y-HZ;
  vec3 c=mix(vec3(1.,.5,.25), vec3(.78,.5,.55), S(0.,.12,y)); c=mix(c, vec3(.3,.36,.62), S(.08,.45,y)); c=mix(c, vec3(.1,.16,.38), S(.4,.8,y));
  vec2 sp=vec2(a*.36, HZ+.13); float d=length(p-sp);
  c+=vec3(1.,.6,.3)*exp(-d*5.)*.55+vec3(1.,.8,.55)*exp(-d*18.)*.6+vec3(1.,.95,.85)*S(.028,.023,d)*4.;
  float cl=fbm2(vec2(p.x*1.1+uT*.004, p.y*6.5));
  vec3 cc=mix(vec3(1.,.55,.4), vec3(.55,.42,.6), S(.05,.4,y));
  c=mix(c, cc*(1.+exp(-d*3.)), S(.55,.8,cl)*S(.08,.2,y)*.6);
  float m1=HZ+.08+.07*fbm2(vec2(p.x*1.1,1.))+.015*n2(vec2(p.x*7.,2.));
  c=mix(c, mix(vec3(.58,.42,.55), c, .45), S(m1+.0015,m1-.0015,p.y));
  float m2=HZ+.04+.05*fbm2(vec2(p.x*1.8+5.,3.))+.012*n2(vec2(p.x*12.,4.));
  c=mix(c, mix(vec3(.32,.22,.36), c, .2), S(m2+.0015,m2-.0015,p.y));
  float m3=HZ+.012+.025*fbm2(vec2(p.x*3.+9.,5.))+.012*pow(fbm2(vec2(p.x*90.,1.)),2.)*2.;
  c=mix(c, vec3(.05,.035,.06), S(m3+.0015,m3-.0015,p.y));
  return c;
}
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y; float a=uR.x/uR.y;
  vec3 col;
  if(uv.y>=HZ){ col=skyL(uv,a); }
  else {
    float dd=HZ-uv.y;
    float rip=(n2(vec2(uv.x*2.5/(dd+.03), (1./(dd+.02))*1.1 - uT*.3))-.5);
    float rip2=(n2(vec2(uv.x*8./(dd+.04)+3., (1./(dd+.03))*3.-uT*.55))-.5);
    vec2 rp=vec2(uv.x+rip*.01*(.3+dd*3.)+rip2*.003, HZ+dd+rip*.003);
    col=skyL(rp,a)*mix(.8,.45,S(0.,.38,dd));
    vec2 sp=vec2(a*.36, HZ);
    float glit=S(.6,.9,n2(vec2(uv.x*70., uv.y*280.-uT*2.)))*exp(-abs(uv.x-sp.x)*(9.+dd*18.))*S(.38,.0,dd);
    col+=vec3(1.,.72,.45)*glit*1.4;
  }
  float mist=fbm2(vec2(uv.x*1.5-uT*.015, uv.y*10.))*exp(-abs(uv.y-HZ-.012)*28.);
  col=mix(col, vec3(1.,.75,.6), S(.2,.75,mist)*.45);
  return col;
}
`;

  /* Raio de sol entrando por uma janela, com poeira flutuando */
  SH.poeira = `
#define EXPOSURE 1.15
float beamAt(vec2 uv){
  vec2 o=vec2(-.15,1.25); vec2 dir=normalize(vec2(1.,-.82)); vec2 pr=vec2(-dir.y,dir.x);
  vec2 r=uv-o; float al=dot(r,dir); float s=dot(r,pr);
  float w=.11+al*.16;
  float b=S(w,w*.55,abs(s))*S(0.,.4,al)*exp(-al*.35);
  b*=1.-.8*S(w*.06,w*.03,abs(s));
  return b;
}
vec3 scene(vec2 fc){
  vec2 uv=fc/uR.y;
  vec3 col=vec3(.022,.017,.013)*(1.+.25*fbm2(uv*vec2(3.,9.)))*(.7+.5*S(0.,1.,uv.y));
  float fy=.14;
  float b=beamAt(uv);
  float haze=.5+.7*fbm2(uv*2.2+vec2(uT*.012,uT*.005));
  col+=vec3(1.,.74,.44)*b*haze*.22;
  col+=vec3(1.,.7,.4)*b*.05;
  if(uv.y<fy){
    float pl=fract(uv.x*3.5);
    vec3 wood=vec3(.03,.018,.01)*(.75+.35*n2(vec2(uv.x*3.5,uv.y*140.)))*(.75+.25*S(.0,.015,pl)*S(1.,.985,pl));
    float patch=beamAt(vec2(uv.x, fy+(fy-uv.y)*3.));
    float cross=1.-.85*S(.012,.006,abs(fract((uv.x-.0)*2.2+uv.y*1.5)-.5));
    col=wood*(1.+patch*28.*vec3(1.,.72,.45)*mix(1.,cross,.0));
  }
  for(int k=0;k<4;k++){
    float fk=float(k)/3.;
    float sc=mix(110.,18.,fk);
    vec2 p=uv*sc+fk*20.;
    vec2 id=floor(p); vec2 f=fract(p)-.5;
    float r=h21(id+fk*3.);
    if(r<mix(.18,.05,fk)){
      vec2 o=.32*vec2(sin(uT*(.06+.08*r)+r*40.), cos(uT*(.05+.1*h21(id+1.))+r*23.));
      vec2 cpos=(id+.5+o-fk*20.)/sc;
      float bm=beamAt(cpos);
      float d=length(f-o);
      float rad=mix(.1,.2,fk);
      float m=S(rad,rad*mix(.1,.85,fk),d);
      float tw=.55+.45*sin(uT*2.+r*70.);
      col+=vec3(1.,.86,.62)*m*bm*bm*tw*mix(2.2,.6,fk);
    }
  }
  return col;
}
`;

  /* ---------------- catálogo ---------------- */
  const LIST = [
    { id: 'chuva-quente', name: 'Chuva no café', sh: 'chuva', defs: '#define PAL 0', g: ['romance', 'contemplativo', 'misterio'] },
    { id: 'chuva-noir', name: 'Chuva na cidade', sh: 'chuva', defs: '#define PAL 1', g: ['misterio', 'distopia'] },
    { id: 'neon', name: 'Neon na chuva', sh: 'chuva', defs: '#define PAL 2', g: ['scifi', 'distopia', 'misterio'] },
    { id: 'por-do-sol', name: 'Pôr do sol no mar', sh: 'mar', defs: '#define SUNSET', g: ['romance', 'aventura', 'contemplativo'], heavy: true },
    { id: 'mar', name: 'Mar aberto', sh: 'mar', defs: '', g: ['aventura'], heavy: true },
    { id: 'nuvens', name: 'Acima das nuvens', sh: 'nuvens', defs: '', g: ['aventura', 'fantasia', 'contemplativo'], heavy: true },
    { id: 'tempestade', name: 'Tempestade', sh: 'tempestade', defs: '', g: ['terror', 'misterio', 'aventura'] },
    { id: 'neblina', name: 'Floresta na neblina', sh: 'floresta', defs: '#define HORROR', g: ['terror', 'misterio'] },
    { id: 'encantada', name: 'Floresta encantada', sh: 'floresta', defs: '', g: ['fantasia', 'romance'] },
    { id: 'lareira', name: 'Lareira', sh: 'lareira', defs: '', g: ['fantasia', 'romance', 'contemplativo'] },
    { id: 'vela', name: 'Vela no escuro', sh: 'vela', defs: '', g: ['terror', 'misterio', 'contemplativo'] },
    { id: 'via-lactea', name: 'Via Láctea', sh: 'vialactea', defs: '', g: ['fantasia', 'scifi', 'contemplativo'] },
    { id: 'aurora', name: 'Aurora no lago', sh: 'aurora', defs: '', g: ['fantasia', 'contemplativo'], heavy: true },
    { id: 'nebulosa', name: 'Nebulosa', sh: 'nebulosa', defs: '', g: ['scifi', 'fantasia'] },
    { id: 'planeta', name: 'Planeta em órbita', sh: 'planeta', defs: '', g: ['scifi'] },
    { id: 'viagem', name: 'Viagem estelar', sh: 'estrelas', defs: '', g: ['scifi'] },
    { id: 'deserto', name: 'Dunas ao entardecer', sh: 'deserto', defs: '', g: ['aventura', 'distopia', 'fantasia'], heavy: true },
    { id: 'cinzas', name: 'Cidade em cinzas', sh: 'cinzas', defs: '', g: ['distopia', 'scifi', 'terror'] },
    { id: 'fundo-mar', name: 'Fundo do mar', sh: 'oceano', defs: '', g: ['aventura', 'fantasia'] },
    { id: 'neve', name: 'Neve no pinheiral', sh: 'neve', defs: '', g: ['contemplativo', 'fantasia', 'romance'] },
    { id: 'lago', name: 'Lago ao amanhecer', sh: 'lago', defs: '', g: ['romance', 'contemplativo'] },
    { id: 'poeira', name: 'Luz na janela', sh: 'poeira', defs: '', g: ['contemplativo', 'misterio', 'romance'] },
  ];
  const OLD = { chuva: 'chuva-quente', estrelas: 'via-lactea' };

  /* ---------------- motor WebGL ---------------- */
  const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
  function src(sc){ return (sc.defs || '') + '\n' + HEAD + SH[sc.sh] + TAIL; }
  function build(gl, sc){
    const mk = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn('[cena ' + sc.id + ']', gl.getShaderInfoLog(o)); return null; } return o; };
    const v = mk(gl.VERTEX_SHADER, VS), f = mk(gl.FRAGMENT_SHADER, src(sc)); if (!v || !f) return null;
    const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn('[cena ' + sc.id + ']', gl.getProgramInfoLog(pr)); return null; }
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.deleteShader(v); gl.deleteShader(f);
    return { pr, buf, uR: gl.getUniformLocation(pr, 'uR'), uT: gl.getUniformLocation(pr, 'uT') };
  }
  function fallback(cv){ const c = cv.getContext('2d'); if (c) { cv.width = 2; cv.height = 2; c.fillStyle = '#111'; c.fillRect(0, 0, 2, 2); } return () => {}; }

  T.Scenes = {
    genres: GENRES, list: LIST,
    get(id){ id = OLD[id] || id; return LIST.find(s => s.id === id) || LIST[0]; },
    start(id, cv, opts = {}){
      const sc = this.get(id);
      const gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.keep });
      if (!gl) { T.toast && T.toast('Este navegador não conseguiu desenhar a cena animada.'); return fallback(cv); }
      const P = build(gl, sc); if (!P) return fallback(cv);
      gl.useProgram(P.pr);
      const q = T.Store?.prefs?.().sceneQuality || 'auto';
      let scale = opts.scale || (q === 'alta' ? .85 : q === 'leve' ? .4 : (sc.heavy ? .5 : .65));
      const seed = 37 + Math.random() * 40; let raf = 0, last = 0, acc = 0, n = 0;
      const resize = () => { const W = cv.clientWidth || innerWidth, H = cv.clientHeight || innerHeight; cv.width = Math.max(2, Math.round(W * scale)); cv.height = Math.max(2, Math.round(H * scale)); gl.viewport(0, 0, cv.width, cv.height); };
      resize(); addEventListener('resize', resize);
      const draw = (now) => { gl.uniform2f(P.uR, cv.width, cv.height); gl.uniform1f(P.uT, (now / 1000 + seed) % 3000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
      if (opts.once) { draw(opts.at || 20000); return () => {}; }
      const loop = (now) => {
        raf = requestAnimationFrame(loop);
        if (last) { acc += now - last; n++; }
        last = now; draw(now);
        if (q === 'auto' && n >= 40) { const avg = acc / n; acc = 0; n = 0;
          if (avg > 26 && scale > .3) { scale = Math.max(.3, scale * .85); resize(); }
          else if (avg < 15 && scale < (sc.heavy ? .6 : .8)) { scale = Math.min(.8, scale * 1.08); resize(); } }
      };
      raf = requestAnimationFrame(loop);
      return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); const ext = gl.getExtension('WEBGL_lose_context'); ext && ext.loseContext(); };
    },
    /* miniaturas: uma tela pequena compartilhada, desenha um quadro de cada cena */
    _thumbs: {},
    thumb(id){
      const key = 'tinteiro-miniatura-v2-' + id;
      if (this._thumbs[id]) return Promise.resolve(this._thumbs[id]);
      try { const c = localStorage.getItem(key); if (c) { this._thumbs[id] = c; return Promise.resolve(c); } } catch (e) {}
      this._q = (this._q || Promise.resolve()).then(() => new Promise(res => setTimeout(() => {
        try {
          if (!this._tc) { const cv = document.createElement('canvas'); cv.width = 240; cv.height = 135;
            this._tc = { cv, gl: cv.getContext('webgl', { antialias: false, alpha: false, depth: false, preserveDrawingBuffer: true }) }; }
          const { cv, gl } = this._tc; if (!gl || gl.isContextLost()) return res('');
          const P = build(gl, this.get(id)); if (!P) return res('');
          gl.useProgram(P.pr); gl.viewport(0, 0, cv.width, cv.height);
          gl.uniform2f(P.uR, cv.width, cv.height); gl.uniform1f(P.uT, 26 + 37); gl.drawArrays(gl.TRIANGLES, 0, 3);
          const url = cv.toDataURL('image/jpeg', .82);
          gl.deleteProgram(P.pr); gl.deleteBuffer(P.buf);
          this._thumbs[id] = url; try { localStorage.setItem(key, url); } catch (e) {}
          res(url);
        } catch (e) { res(''); }
      }, 16)));
      return this._q.then(() => this._thumbs[id] || '');
    },
  };

  /* ---------------- camadas por cima (partículas em 2D) ---------------- */
  const LAYERS = [
    { id: 'chuva', name: 'Chuva' }, { id: 'neve', name: 'Neve' }, { id: 'brasas', name: 'Brasas' },
    { id: 'poeira', name: 'Poeira dourada' }, { id: 'vagalumes', name: 'Vaga-lumes' }, { id: 'petalas', name: 'Pétalas' },
    { id: 'folhas', name: 'Folhas secas' }, { id: 'nevoa', name: 'Névoa' }, { id: 'grao', name: 'Grão de filme' },
  ];
  function sprite(r, g, b, soft){
    const s = 64, c = document.createElement('canvas'); c.width = c.height = s; const x = c.getContext('2d');
    const gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(soft, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, s, s); return c;
  }
  T.SceneLayers = {
    list: LAYERS,
    start(cv, ids){
      const set = new Set(ids || []); if (!set.size) return () => {};
      const c = cv.getContext('2d'); let W, H, raf; const R = Math.random;
      const SP = { neve: sprite(255, 255, 255, .35), brasa: sprite(255, 140, 50, .2), poeira: sprite(255, 225, 170, .3), vaga: sprite(255, 225, 120, .15), petala: sprite(255, 190, 205, .5), nevoa: sprite(220, 225, 235, .1) };
      let P = [];
      const make = () => {
        P = [];
        const area = W * H / (1280 * 720);
        const add = (type, n, f) => { for (let i = 0; i < n * area; i++) P.push(Object.assign({ type, x: R() * W, y: R() * H, z: R() }, f())); };
        if (set.has('chuva')) add('chuva', 420, () => ({ v: 0 }));
        if (set.has('neve')) add('neve', 260, () => ({ s: R() * 6 }));
        if (set.has('brasas')) add('brasas', 90, () => ({ s: R() * 6, a: R() }));
        if (set.has('poeira')) add('poeira', 140, () => ({ s: R() * 6 }));
        if (set.has('vagalumes')) add('vagalumes', 36, () => ({ s: R() * 6 }));
        if (set.has('petalas')) add('petalas', 60, () => ({ s: R() * 6, r: R() * 6 }));
        if (set.has('folhas')) add('folhas', 40, () => ({ s: R() * 6, r: R() * 6, h: 20 + R() * 25 }));
        if (set.has('nevoa')) add('nevoa', 18, () => ({ s: R() * 6 }));
      };
      const resize = () => { W = cv.width = cv.clientWidth || innerWidth; H = cv.height = cv.clientHeight || innerHeight; make(); };
      resize(); addEventListener('resize', resize);
      let grain = null;
      if (set.has('grao')) { grain = document.createElement('canvas'); grain.width = grain.height = 160; }
      let last = 0;
      const loop = (now) => {
        raf = requestAnimationFrame(loop); const k = Math.min(3, (now - (last || now)) / 16.7); last = now; const t = now / 1000;
        c.clearRect(0, 0, W, H);
        for (const p of P) {
          const z = p.z;
          if (p.type === 'chuva') {
            const v = 14 + z * 22, l = 10 + z * 34; p.y += v * k; p.x += v * .12 * k; if (p.y > H + l) { p.y = -l; p.x = R() * W * 1.1 - W * .1; }
            c.strokeStyle = `rgba(200,215,235,${.08 + z * .28})`; c.lineWidth = .6 + z * 1.6; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - l * .12, p.y - l); c.stroke();
          } else if (p.type === 'neve') {
            const r = 1 + z * z * 9; p.y += (.4 + z * 1.6) * k; p.x += (Math.sin(t * .7 + p.s) * .5 + .3) * k; if (p.y > H + r) { p.y = -r; p.x = R() * W; }
            c.globalAlpha = .35 + z * .5; c.drawImage(SP.neve, p.x - r, p.y - r, r * 2, r * 2);
          } else if (p.type === 'brasas') {
            p.y -= (.6 + z * 1.8) * k; p.x += Math.sin(t * 1.5 + p.s) * .7 * k; p.a -= .003 * k;
            if (p.y < -10 || p.a <= 0) { p.y = H + 10; p.x = R() * W; p.a = 1; }
            const r = 1.5 + z * 5; c.globalAlpha = p.a * (.5 + .5 * Math.sin(t * 8 + p.s * 9)); c.drawImage(SP.brasa, p.x - r, p.y - r, r * 2, r * 2);
          } else if (p.type === 'poeira') {
            p.x += Math.sin(t * .2 + p.s) * .15 * k; p.y += Math.cos(t * .17 + p.s * 2) * .12 * k - .03 * k;
            if (p.y < -10) p.y = H + 10;
            const r = 1 + z * z * 7; c.globalAlpha = (.25 + .45 * z) * (.6 + .4 * Math.sin(t * 1.3 + p.s * 7)); c.drawImage(SP.poeira, p.x - r, p.y - r, r * 2, r * 2);
          } else if (p.type === 'vagalumes') {
            p.x += Math.sin(t * .5 + p.s) * .5 * k; p.y += Math.cos(t * .4 + p.s * 1.7) * .4 * k;
            const b = Math.max(0, Math.sin(t * (.8 + p.s * .1) + p.s * 5)); const r = 6 + z * 14;
            c.globalAlpha = b * b * (.5 + .5 * z); c.drawImage(SP.vaga, p.x - r, p.y - r, r * 2, r * 2);
          } else if (p.type === 'petalas' || p.type === 'folhas') {
            p.y += (.5 + z * 1.2) * k; p.x += (Math.sin(t * .8 + p.s) * 1.1 + .6) * k; p.r += .02 * k * (p.s > 3 ? 1 : -1);
            if (p.y > H + 30) { p.y = -30; p.x = R() * W - W * .2; }
            const r = (p.type === 'folhas' ? 6 : 4) + z * 9;
            c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, Math.abs(Math.sin(t * 1.5 + p.s)) * .7 + .3);
            c.globalAlpha = .55 + z * .4;
            if (p.type === 'petalas') { c.fillStyle = `hsl(${345 + p.s * 3} 70% ${80 - z * 10}%)`; c.beginPath(); c.ellipse(0, 0, r, r * .6, 0, 0, 7); c.fill(); }
            else { c.fillStyle = `hsl(${p.h} 70% ${35 + z * 10}%)`; c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(0, -r * .7, r, 0); c.quadraticCurveTo(0, r * .7, -r, 0); c.fill(); }
            c.restore();
          } else if (p.type === 'nevoa') {
            p.x += (.15 + z * .3) * k; if (p.x > W + 400) p.x = -400;
            const r = 260 + z * 260; c.globalAlpha = .06 + z * .05; c.drawImage(SP.nevoa, p.x - r, H * (.45 + z * .5) - r * .5 + Math.sin(t * .1 + p.s) * 20, r * 2, r);
          }
        }
        c.globalAlpha = 1;
        if (grain && ((now / 50) | 0) % 1 === 0) {
          const g = grain.getContext('2d'); const im = g.createImageData(160, 160);
          for (let i = 0; i < im.data.length; i += 4) { const v = R() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 22; }
          g.putImageData(im, 0, 0); c.fillStyle = c.createPattern(grain, 'repeat'); c.fillRect(0, 0, W, H);
        }
      };
      raf = requestAnimationFrame(loop);
      return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); c.clearRect(0, 0, W, H); };
    },
  };
})(window.T);
