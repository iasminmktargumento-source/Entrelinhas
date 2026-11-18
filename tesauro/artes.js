// Artes de abertura das 16 partes: ilustrações originais em SVG, coloridas pelo matiz da parte (--h)
(function(){
const st=document.createElement("style");
st.textContent=`.arte .f0{fill:hsl(var(--h) 90% var(--Lf))}.arte .f1{fill:hsl(var(--h) 85% 88%)}.arte .f2{fill:hsl(var(--h) 75% 72%)}.arte .f3{fill:hsl(var(--h) 70% 56%)}.arte .f4{fill:hsl(var(--h) 65% 40%)}.arte .f5{fill:hsl(var(--h) 55% 26%)}.arte .fo{fill:hsl(calc(var(--h) + 40) 85% 62%)}.arte .fw{fill:#fff}.arte .s3{fill:none;stroke:hsl(var(--h) 70% 56%);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.arte .s4{fill:none;stroke:hsl(var(--h) 65% 40%);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.arte .so{fill:none;stroke:hsl(calc(var(--h) + 40) 85% 58%);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.arte .sw{fill:none;stroke:#fff;stroke-width:4;stroke-linecap:round}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .arte .f1{fill:hsl(var(--h) 45% 24%)}:root:not([data-theme="light"]) .arte .fw{fill:hsl(var(--h) 30% 92%)}}
:root[data-theme="dark"] .arte .f1{fill:hsl(var(--h) 45% 24%)}:root[data-theme="dark"] .arte .fw{fill:hsl(var(--h) 30% 92%)}`;
document.head.appendChild(st);
const W=(inner,title)=>`<svg class="arte" viewBox="0 0 600 240" role="img" aria-label="${title}"><rect class="f0" width="600" height="240"/>${inner}</svg>`;
const A=window.ARTE;

// 1 Emoções: ondas concêntricas saindo de um coração, como emoção que se espalha pelo corpo
A[1]=()=>W(`
<circle class="f1" cx="300" cy="125" r="118"/><circle class="f2" cx="300" cy="125" r="84" opacity=".55"/>
<path class="s3" d="M40 70 Q90 40 140 70 T240 70" opacity=".6"/><path class="s3" d="M360 180 Q410 150 460 180 T560 180" opacity=".6"/>
<path class="s3" d="M30 190 Q80 160 130 190 T230 190"/><path class="s3" d="M370 60 Q420 30 470 60 T570 60"/>
<path class="f3" d="M300 178 C250 140 222 116 222 90 a38 38 0 0 1 78 -6 a38 38 0 0 1 78 6 C378 116 350 140 300 178z"/>
<path class="f4" d="M300 178 C270 155 250 138 240 120 C262 140 282 150 300 158z" opacity=".5"/>
<circle class="fw" cx="262" cy="92" r="9" opacity=".8"/>
<circle class="fo" cx="120" cy="120" r="12"/><circle class="f3" cx="485" cy="118" r="9"/><circle class="f2" cx="535" cy="110" r="5"/><circle class="f2" cx="78" cy="132" r="6"/>`,"Coração com ondas de emoção");

// 2 Defeitos: máscara rachada ao meio
A[2]=()=>W(`
<circle class="f1" cx="300" cy="120" r="112"/>
<path class="f3" d="M300 40 C230 40 196 70 196 118 C196 170 240 205 300 205z"/>
<path class="f2" d="M300 40 C370 40 404 70 404 118 C404 170 360 205 300 205z"/>
<path class="s4" d="M300 34 L288 70 L310 96 L286 128 L312 158 L294 210" />
<ellipse class="f5" cx="252" cy="110" rx="24" ry="13"/><ellipse class="f4" cx="348" cy="110" rx="24" ry="13"/>
<path class="s4" d="M262 160 Q300 146 338 160"/>
<path class="so" d="M110 60 l14 14 m0 -14 l-14 14"/><path class="so" d="M480 170 l14 14 m0 -14 l-14 14"/>
<circle class="f3" cx="500" cy="70" r="10"/><circle class="f2" cx="96" cy="176" r="12"/>`,"Máscara rachada");

// 3 Qualidades: sol com raios e estrelas
A[3]=()=>W(`
<g transform="translate(300 128)">${Array.from({length:16},(_,i)=>`<rect class="${i%2?"f2":"f3"}" x="-6" y="-118" width="12" height="44" rx="6" transform="rotate(${i*22.5})"/>`).join("")}</g>
<circle class="f3" cx="300" cy="128" r="62"/><circle class="fo" cx="300" cy="128" r="40"/><circle class="fw" cx="284" cy="112" r="10" opacity=".7"/>
<path class="f4" d="M95 70 l9 20 21 3 -15 15 4 21 -19 -10 -19 10 4 -21 -15 -15 21 -3z"/>
<path class="f3" d="M505 150 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z"/>
<circle class="f2" cx="150" cy="185" r="7"/><circle class="f2" cx="460" cy="60" r="6"/>`,"Sol e estrelas");

// 4 Cenários rurais: colinas, casa, árvore e sol
A[4]=()=>W(`
<circle class="fo" cx="470" cy="70" r="34"/>
<path class="f2" d="M0 170 Q120 100 260 160 T600 140 V240 H0z"/>
<path class="f3" d="M0 200 Q160 150 320 196 T600 186 V240 H0z"/>
<path class="f4" d="M0 226 Q200 200 400 224 T600 220 V240 H0z"/>
<rect class="fw" x="210" y="118" width="70" height="52"/><path class="f4" d="M200 122 L245 88 L290 122z"/>
<rect class="f4" x="236" y="140" width="18" height="30"/><rect class="f2" x="262" y="130" width="12" height="12"/>
<rect class="f5" x="378" y="128" width="10" height="44"/><circle class="f4" cx="383" cy="112" r="30"/><circle class="f3" cx="370" cy="104" r="16"/>
<path class="s4" d="M60 70 q10 -8 20 0 q10 -8 20 0" /><path class="s4" d="M110 52 q8 -6 16 0 q8 -6 16 0"/>`,"Colinas, casa e árvore");

// 5 Cenários urbanos: horizonte de prédios com janelas acesas
A[5]=()=>{const b=[[40,90,70],[118,60,56],[182,120,80],[270,40,62],[340,100,74],[422,70,56],[486,130,74]];
 let s=`<circle class="f1" cx="300" cy="240" r="200"/><circle class="fo" cx="120" cy="56" r="20"/>`;
 b.forEach(([x,y,w],i)=>{s+=`<rect class="${i%2?"f4":"f3"}" x="${x}" y="${y}" width="${w}" height="${240-y}" rx="4"/>`;
  for(let yy=y+14;yy<228;yy+=22) for(let xx=x+10;xx<x+w-12;xx+=18) if(((xx*7+yy*3+i)%5)>1) s+=`<rect class="${((xx+yy)%3)?"fw":"fo"}" x="${xx}" y="${yy}" width="9" height="11" rx="1.5" opacity=".9"/>`;});
 s+=`<rect class="f5" x="0" y="226" width="600" height="14"/>`;
 return W(s,"Prédios de uma cidade")};

// 6 Feridas emocionais: tigela remendada com ouro (as rachaduras viram desenho)
A[6]=()=>W(`
<circle class="f1" cx="300" cy="130" r="110"/>
<path class="f3" d="M170 100 H430 C430 170 380 206 300 206 C220 206 170 170 170 100z"/>
<ellipse class="f2" cx="300" cy="100" rx="130" ry="20"/><ellipse class="f4" cx="300" cy="100" rx="112" ry="13"/>
<path class="so" d="M232 112 L250 140 L238 168 L262 196"/><path class="so" d="M330 108 L318 136 L346 158 L334 200"/><path class="so" d="M250 140 L292 150 L318 136"/>
<rect class="f5" x="262" y="204" width="76" height="12" rx="5"/>
<circle class="fo" cx="110" cy="80" r="8"/><circle class="fo" cx="500" cy="170" r="10"/><circle class="f3" cx="480" cy="70" r="6"/>`,"Tigela remendada com ouro");

// 7 Profissões: engrenagem, lápis e chave
A[7]=()=>W(`
<circle class="f1" cx="300" cy="120" r="108"/>
<g transform="translate(240 120)">${Array.from({length:10},(_,i)=>`<rect class="f4" x="-11" y="-74" width="22" height="26" rx="5" transform="rotate(${i*36})"/>`).join("")}<circle class="f4" r="56"/><circle class="f1" r="22"/></g>
<g transform="translate(370 120) rotate(35)"><rect class="f3" x="-14" y="-90" width="28" height="140" rx="4"/><path class="fo" d="M-14 50 L14 50 L0 82z"/><rect class="f5" x="-14" y="-90" width="28" height="20" rx="4"/></g>
<g transform="translate(430 70) rotate(-20)"><circle class="s4" r="18"/><path class="s4" d="M18 0 H70 M54 0 v14 M66 0 v10"/></g>
<circle class="f3" cx="110" cy="70" r="9"/><circle class="f2" cx="140" cy="190" r="12"/>`,"Engrenagem, lápis e chave");

// 8 Conflitos 1: duas forças que se chocam
A[8]=()=>W(`
<circle class="f1" cx="300" cy="120" r="104"/>
<path class="f3" d="M60 92 H230 V64 L300 120 L230 176 V148 H60z"/>
<path class="f4" d="M540 92 H370 V64 L300 120 L370 176 V148 H540z" opacity=".9"/>
<path class="fo" d="M300 40 L272 112 H300 L282 200 L332 104 H302 L322 40z"/>
<circle class="f2" cx="120" cy="40" r="8"/><circle class="f2" cx="480" cy="206" r="10"/>`,"Duas setas que se chocam");

// 9 Conflitos 2: peças num tabuleiro, disputa de poder
A[9]=()=>{let s=`<circle class="f1" cx="300" cy="150" r="100"/>`;
 for(let i=0;i<8;i++) for(let j=0;j<2;j++) s+=`<rect class="${(i+j)%2?"f2":"f3"}" x="${140+i*40}" y="${196+j*22}" width="40" height="22"/>`;
 s+=`<g class="f5"><circle cx="230" cy="92" r="16"/><path d="M212 108 h36 l8 70 h-52z"/><rect x="200" y="176" width="60" height="16" rx="4"/></g>`;
 s+=`<g class="f3"><rect x="358" y="54" width="8" height="26"/><rect x="349" y="62" width="26" height="8"/><circle cx="362" cy="98" r="18"/><path d="M342 114 h40 l8 64 h-56z"/><rect x="328" y="176" width="68" height="16" rx="4"/></g>`;
 s+=`<path class="so" d="M268 100 q30 -30 60 0"/><circle class="fo" cx="110" cy="70" r="9"/><circle class="f3" cx="500" cy="80" r="7"/>`;
 return W(s,"Peças de xadrez em disputa")};

// 10 Amplificadores: barras de volume que sobem até o vermelho
A[10]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="110"/>`;
 const hs=[24,40,58,80,104,130,158,178];
 hs.forEach((h,i)=>{s+=`<rect class="${i<4?"f3":i<6?"f4":"fo"}" x="${150+i*40}" y="${210-h}" width="26" height="${h}" rx="6"/>`});
 s+=`<path class="s4" d="M120 60 q-24 30 0 60"/><path class="s4" d="M96 46 q-38 44 0 88"/><circle class="f5" cx="140" cy="90" r="12"/>`;
 return W(s,"Barras de volume crescentes")};

// 11 Medos: prédio com elevador descendo para andares mais escuros
A[11]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="112"/><rect class="f2" x="210" y="20" width="180" height="210" rx="8"/>`;
 const tons=["f1","f2","f3","f3","f4","f5"];
 for(let k=0;k<6;k++){const y=30+k*33; s+=`<rect class="${tons[k]}" x="222" y="${y}" width="156" height="28" rx="4"/>`;
  s+=`<rect class="${k<3?"fw":"f2"}" x="236" y="${y+7}" width="16" height="14" rx="2" opacity="${k<4?.9:.4}"/><rect class="${k<3?"fw":"f2"}" x="348" y="${y+7}" width="16" height="14" rx="2" opacity="${k<4?.9:.4}"/>`;}
 s+=`<rect class="f5" x="286" y="24" width="28" height="204"/><rect class="fo" x="289" y="140" width="22" height="26" rx="3"/>`;
 s+=`<ellipse class="fw" cx="340" cy="210" rx="12" ry="6"/><circle class="f5" cx="340" cy="210" r="4"/>`;
 s+=`<path class="s3" d="M440 60 q30 20 0 40 q-30 20 0 40"/><circle class="f3" cx="130" cy="80" r="8"/>`;
 return W(s,"Prédio com elevador descendo")};
// 12 Verbos de elocução: balões de fala de tamanhos diferentes, do sussurro ao grito, com travessões
A[12]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="112"/>`;
 s+=`<path class="f2" d="M118 150 h70 a14 14 0 0 1 14 14 v22 a14 14 0 0 1 -14 14 h-44 l-14 14 v-14 h-12 a14 14 0 0 1 -14 -14 v-22 a14 14 0 0 1 14 -14z"/><rect class="fw" x="132" y="172" width="12" height="4" rx="2"/><rect class="fw" x="150" y="172" width="34" height="4" rx="2" opacity=".8"/>`;
 s+=`<path class="f3" d="M206 58 h140 a20 20 0 0 1 20 20 v40 a20 20 0 0 1 -20 20 h-90 l-24 22 v-22 h-26 a20 20 0 0 1 -20 -20 v-40 a20 20 0 0 1 20 -20z"/><rect class="fw" x="224" y="92" width="22" height="6" rx="3"/><rect class="fw" x="254" y="92" width="76" height="6" rx="3" opacity=".85"/><rect class="fw" x="224" y="108" width="60" height="6" rx="3" opacity=".6"/>`;
 s+=`<path class="f4" d="M380 112 l24 -12 l10 -26 l18 22 l28 -8 l-6 28 l24 18 l-28 10 l2 28 l-24 -14 l-22 20 l-6 -28 l-28 -6 l20 -18z"/><rect class="fw" x="414" y="124" width="34" height="8" rx="4"/>`;
 s+=`<rect class="fo" x="300" y="176" width="44" height="7" rx="3.5"/><path class="s3" d="M90 70 q-16 22 0 44"/><path class="s3" d="M74 60 q-26 32 0 64" opacity=".6"/><circle class="f3" cx="520" cy="60" r="8"/><circle class="fo" cx="500" cy="200" r="6"/>`;
 return W(s,"Balões de fala do sussurro ao grito")};
// 13 Cenários de ficção científica: planeta com anel, lua e uma nave cruzando o céu estrelado
A[13]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="112"/>`;
 [[90,40],[150,190],[470,50],[520,170],[420,210],[60,140],[540,100]].forEach(([x,y],i)=>{s+=`<circle class="${i%2?"f3":"fo"}" cx="${x}" cy="${y}" r="${i%3?3:5}"/>`;});
 s+=`<ellipse class="s3" cx="300" cy="128" rx="128" ry="26" transform="rotate(-14 300 128)" style="stroke-width:6"/>`;
 s+=`<circle class="f3" cx="300" cy="120" r="66"/><path class="f4" d="M240 100 q60 -18 120 0 v12 q-60 -14 -120 0z"/><path class="f2" d="M246 140 q54 14 108 0 v10 q-54 14 -108 0z" opacity=".8"/>`;
 s+=`<path class="s4" d="M176 152 a128 26 -14 0 0 250 -60" style="fill:none"/>`;
 s+=`<circle class="f2" cx="430" cy="62" r="18"/><circle class="f3" cx="425" cy="58" r="4"/>`;
 s+=`<g transform="translate(120 70) rotate(-30)"><path class="f5" d="M0 0 q16 -14 32 0 v26 h-32z"/><rect class="fw" x="10" y="6" width="12" height="8" rx="4"/><path class="fo" d="M4 26 l12 18 l12 -18z"/></g>`;
 return W(s,"Planeta com anel, lua e nave")};
// 14 Descrição física: rosto de perfil com detalhes (olho, cabelo, brinco) e amostras de tons
A[14]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="112"/>`;
 s+=`<path class="f3" d="M270 40 q60 -10 80 40 q6 18 18 30 q-8 6 -14 6 q4 16 -4 22 q6 8 -2 14 q-8 22 -40 22 v40 h-70 v-50 q-30 -30 -18 -80 q14 -40 50 -44z"/>`;
 s+=`<path class="f5" d="M262 38 q60 -20 92 24 q-30 -6 -50 10 q-20 16 -38 10 q-6 30 -24 40 q-12 -50 20 -84z"/>`;
 s+=`<ellipse class="fw" cx="326" cy="96" rx="9" ry="5"/><circle class="f5" cx="328" cy="96" r="3.5"/><circle class="fo" cx="280" cy="128" r="6"/>`;
 [["f1",120],["f2",150],["f3",180],["f4",210],["f5",240]].forEach(([c,x],i)=>{s+=`<circle class="${c}" cx="${x-20}" cy="200" r="11"/>`;});
 s+=`<path class="s3" d="M440 80 q20 -10 40 0"/><path class="s3" d="M440 110 q20 10 40 0"/><circle class="f3" cx="500" cy="190" r="8"/>`;
 return W(s,"Rosto de perfil e amostras de tons")};
// 15 Clima, luz e hora: sol pela metade, lua, nuvem com chuva
A[15]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="112"/>`;
 s+=`<path class="fo" d="M196 150 a70 70 0 0 1 140 0z"/>`;
 for(let k=0;k<7;k++){const a=Math.PI*(k/6);s+=`<path class="s3" d="M${266-Math.cos(a)*84} ${150-Math.sin(a)*84} L${266-Math.cos(a)*100} ${150-Math.sin(a)*100}"/>`;}
 s+=`<path class="f4" d="M420 46 a30 30 0 1 0 22 52 a24 24 0 1 1 -22 -52z"/>`;
 s+=`<path class="f2" d="M300 150 h120 a24 24 0 0 0 0 -48 a34 34 0 0 0 -64 -10 a26 26 0 0 0 -56 22 a18 18 0 0 0 0 36z"/>`;
 [330,360,390].forEach((x,i)=>{s+=`<path class="s4" d="M${x} ${166+i*4} l-8 18"/>`;});
 s+=`<rect class="f3" x="150" y="160" width="160" height="6" rx="3"/><circle class="f3" cx="120" cy="70" r="6"/><circle class="fo" cx="500" cy="180" r="7"/>`;
 return W(s,"Sol, lua e nuvem com chuva")};
// 16 Deficiências: mãos sinalizando, roda de cadeira e linhas de bengala, em composição de acolhimento
A[16]=()=>{let s=`<circle class="f1" cx="300" cy="120" r="112"/>`;
 s+=`<circle class="s3" cx="380" cy="150" r="48" style="stroke-width:10"/><circle class="f4" cx="380" cy="150" r="8"/>`;
 for(let k=0;k<6;k++){const a=k*Math.PI/3;s+=`<path class="s4" d="M380 150 L${380+Math.cos(a)*40} ${150+Math.sin(a)*40}"/>`;}
 s+=`<path class="f3" d="M200 190 v-60 q0 -10 10 -10 q10 0 10 10 v-36 q0 -10 10 -10 q10 0 10 10 v-6 q0 -10 10 -10 q10 0 10 10 v10 q0 -10 10 -10 q10 0 10 10 v60 q0 40 -40 40 h-20 q-30 0 -40 -18z"/>`;
 s+=`<path class="s3" d="M190 74 q-14 -10 -22 4"/><path class="s3" d="M290 60 q14 -12 24 0"/>`;
 s+=`<path class="s4" d="M470 60 l-30 170" style="stroke-width:6"/><path class="fo" d="M466 56 q14 -8 20 6 l-8 4z"/>`;
 s+=`<circle class="fo" cx="120" cy="80" r="7"/><circle class="f3" cx="110" cy="190" r="5"/>`;
 return W(s,"Mão sinalizando, roda e bengala")};
})();
