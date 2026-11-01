'use strict';
'use strict';
/* Kelly's Giraffe Adventure Vol. 8 - original synthesized beach score (steel drum, ukulele-ish pluck) + SFX (WebAudio, no samples) */
const AU=(function(){
const A={ctx:null,muted:false,cur:null,next:0,step:0,timer:null,song:null};
const mf=m=>440*Math.pow(2,(m-69)/12);
function imp(c,sec,dec){const r=c.sampleRate,n=r*sec|0,b=c.createBuffer(2,n,r);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec)}return b}
A.init=function(){if(this.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=this.ctx=new C();
 this.master=c.createGain();this.master.gain.value=this.muted?0:0.8;const comp=c.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=3.5;
 this.master.connect(comp);comp.connect(c.destination);
 this.rev=c.createConvolver();this.rev.buffer=imp(c,1.8,2.6);const rg=c.createGain();rg.gain.value=0.22;this.rev.connect(rg);rg.connect(this.master);
 this.mus=c.createGain();this.mus.gain.value=0.42;this.mus.connect(this.master);const mr=c.createGain();mr.gain.value=0.5;this.mus.connect(mr);mr.connect(this.rev);
 this.sfx=c.createGain();this.sfx.gain.value=0.8;this.sfx.connect(this.master);
 const n=c.sampleRate;this.noise=c.createBuffer(1,n,n);const d=this.noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}catch(e){this.ctx=null}};
A.unlock=function(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})};
A.setMuted=function(m){this.muted=m;if(this.master)this.master.gain.setTargetAtTime(m?0:0.8,this.ctx.currentTime,0.05)};
/* --- voices --- */
function env(g,t,a,peak,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d)}
function osc(type,f,t,dur,peak,out,a=0.004){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);env(g,t,a,peak,dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+a+dur+0.05);return o}
function marimba(m,t,v,out){const f=mf(m);osc('sine',f,t,0.45,0.32*v,out);osc('sine',f*4,t,0.08,0.09*v,out);osc('triangle',f*2,t,0.16,0.06*v,out)}
function kalimba(m,t,v,out){const f=mf(m);osc('sine',f,t,0.9,0.22*v,out,0.002);osc('sine',f*5.4,t,0.05,0.05*v,out)}
/* steel drum: inharmonic partials with a quick bright attack */
function steel(m,t,v,out){const f=mf(m);osc('sine',f,t,0.55,0.26*v,out,0.003);osc('sine',f*2.01,t,0.3,0.12*v,out,0.003);osc('sine',f*2.98,t,0.14,0.06*v,out,0.002);osc('triangle',f*4.2,t,0.05,0.04*v,out,0.001)}
function pluck(m,t,v,out){const f=mf(m);osc('triangle',f,t,0.25,0.16*v,out,0.002);osc('sine',f*2,t,0.12,0.06*v,out,0.002)}
function bass(m,t,d,v,out){const c=A.ctx,o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=mf(m);fl.type='lowpass';fl.frequency.setValueAtTime(900,t);fl.frequency.exponentialRampToValueAtTime(180,t+d);env(g,t,0.01,0.28*v,d);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+d+0.1)}
function pad(m,t,d,v,out){const c=A.ctx;for(const det of[-7,7]){const o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=mf(m);o.detune.value=det;fl.type='lowpass';fl.frequency.value=1100;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.035*v,t+d*0.3);g.gain.linearRampToValueAtTime(0.0001,t+d);o.connect(fl);fl.connect(g);g.connect(out);o.start(t);o.stop(t+d+0.05)}}
function drum(t,f0,f1,d,v,out){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,0.002,0.7*v,d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+0.05)}
function nz(t,d,v,fq,type,out,q=1){const c=A.ctx,s=c.createBufferSource(),g=c.createGain(),fl=c.createBiquadFilter();s.buffer=A.noise;fl.type=type||'highpass';fl.frequency.value=fq||6000;fl.Q.value=q;env(g,t,0.002,v,d);s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random()*0.5);s.stop(t+d+0.05)}
/* --- songs: tempo, scale root, chords (semitone offsets from root), lead pattern seed, groove --- */
const SONGS={
 title:{bpm:104,root:65,ch:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],seed:1131,lead:'steel',gr:'soft'},
 w1:{bpm:122,root:67,ch:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],seed:1211,lead:'steel',gr:'calypso'},
 w2:{bpm:116,root:62,ch:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],seed:1307,lead:'steel',gr:'calypso'},
 w3:{bpm:100,root:64,ch:[[0,3,7],[5,8,12],[-2,2,5],[-5,-1,2]],seed:1401,lead:'kal',gr:'soft'},
 w4:{bpm:118,root:60,ch:[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]],seed:1509,lead:'steel',gr:'reggae'},
 boss:{bpm:146,root:58,ch:[[0,3,7],[0,3,7],[1,5,8],[-1,3,6]],seed:1719,lead:'steel',gr:'boss'},
 win:{bpm:124,root:65,ch:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],seed:1811,lead:'steel',gr:'calypso'},
 /* Happy Birthday (traditional, public domain) as a kalimba music box in 3/4; one step = an 8th note */
 bday:{bpm:50,root:65,len:6,start:46,ch:[[0,4,7],[-5,-1,2],[-5,-1,2],[0,4,7],[0,4,7],[5,9,12],[-5,-1,2],[0,4,7]],
  notes:[[-3,2],[-5,2],[0,2],[-1,4],[-5,1],[-5,1],[-3,2],[-5,2],[2,2],[0,4],[-5,1],[-5,1],[7,2],[4,2],[0,2],[-1,2],[-3,2],[5,1],[5,1],[4,2],[0,2],[2,2],[0,4],[-5,1],[-5,1]],lead:'kal',gr:'waltz'}};
for(const k in SONGS){const S=SONGS[k];if(S.notes){S.tune=[];for(const[n,d]of S.notes){S.tune.push(n);for(let i=1;i<d;i++)S.tune.push(null)}}}
function rngS(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function mkLead(S){const r=rngS(S.seed),bars=[];const pent=[0,2,4,7,9,12,14,16];for(let b=0;b<4;b++){const n=[];let p=2+(r()*3|0);for(let i=0;i<16;i++){const on=(i%4===0)||(r()<(i%2?0.28:0.55));if(on){p=Math.max(0,Math.min(7,p+((r()*5|0)-2)));n.push(pent[p])}else n.push(null)}bars.push(n)}return bars}
for(const k in SONGS)if(!SONGS[k].tune)SONGS[k].mel=mkLead(SONGS[k]);
function tick(){const c=A.ctx;if(!c||!A.song)return;const S=A.song,sp=60/S.bpm/4;
 if(S.tune){while(A.next<c.currentTime+0.15){const t=A.next,n=S.tune.length,st=A.step%n,i=st%S.len,bar=(st/S.len)|0,ch=S.ch[bar%S.ch.length],R=S.root,out=A.mus;
  if(i===0){pad(R+ch[0],t,sp*6,0.8,out);pad(R+ch[1],t,sp*6,0.6,out);pad(R+ch[2],t,sp*6,0.6,out);bass(R-24+ch[0],t,sp*1.8,0.8,out)}
  if(i===2||i===4){marimba(R+ch[1],t,0.28,out);marimba(R+ch[2],t,0.24,out)}
  const m=S.tune[st];if(m!==null&&m!==undefined){kalimba(R+12+m,t,1,out);kalimba(R+24+m,t+0.002,0.35,out);marimba(R+m,t,0.35,out)}
  if(i===0)drum(t,110,50,0.25,0.35,out);
  A.next+=sp;A.step++}return}
 while(A.next<c.currentTime+0.15){const t=A.next,i=A.step%16,bar=(A.step>>4)%4,ch=S.ch[bar],R=S.root,out=A.mus,big=(A.step>>6)%2;
  if(i===0){pad(R+ch[0],t,sp*16,1,out);pad(R+ch[1],t,sp*16,0.8,out);pad(R+ch[2],t,sp*16,0.7,out)}
  if(i%4===0||(S.gr!=='soft'&&i===10))bass(R-24+ch[i===8?2:0],t,sp*(i===10?1.5:3),1,out);
  const m=S.mel[bar][i];if(m!==null&&(S.gr!=='soft'||i%2===0)){const mm=R+12+m;(S.lead==='kal'?kalimba:S.lead==='steel'?steel:marimba)(mm,t,big?1:0.85,out);if(big&&i%8===0)kalimba(mm+12,t+sp*0.5,0.5,out)}
  if(i%2===1&&S.gr!=='soft')(S.gr==='boss'?marimba:pluck)(R+ch[(i>>1)%3]+12,t,0.35,out);
  if(S.gr==='calypso'){if(i===0||i===3||i===8||i===11)drum(t,140,55,0.22,0.9,out);if(i===4||i===12)nz(t,0.08,0.14,2500,'bandpass',out,1.2);nz(t,0.04,i%2?0.05:0.1,7500,'highpass',out)}
  else if(S.gr==='reggae'){if(i===0||i===8)drum(t,120,45,0.3,1,out);if(i===4||i===12){pluck(R+ch[0]+12,t,0.6,out);pluck(R+ch[1]+12,t,0.5,out)}if(i%4===2)nz(t,0.05,0.06,6000,'highpass',out)}
  else if(S.gr==='afro'){if(i===0||i===6||i===10)drum(t,150,55,0.22,0.9,out);if(i===4||i===12)drum(t,340,180,0.12,0.6,out);nz(t,0.04,i%2?0.05:0.09,7000,'highpass',out)}
  else if(S.gr==='jungle'){if(i%4===0||i===14)drum(t,130,48,0.25,1,out);if(i===3||i===7||i===11)drum(t,420,260,0.09,0.55,out);nz(t,0.05,i%4===2?0.12:0.05,5000,'bandpass',out,2)}
  else if(S.gr==='boss'){if(i%4===0||i===6)drum(t,120,40,0.3,1.1,out);if(i===4||i===12)nz(t,0.14,0.28,1800,'bandpass',out,0.8);nz(t,0.03,0.06,8000,'highpass',out)}
  else{if(i===0||i===8)drum(t,110,50,0.3,0.55,out);if(i%4===2)nz(t,0.06,0.04,6500,'highpass',out)}
  A.next+=sp;A.step++}}
A.music=function(name){this.init();if(!this.ctx)return;if(this.cur===name)return;this.cur=name;this.song=SONGS[name]||null;this.step=this.song&&this.song.start||0;this.next=this.ctx.currentTime+0.08;
 if(!this.timer)this.timer=setInterval(tick,40)};
A.stop=function(){this.cur=null;this.song=null};
const FX={
 jump(t,o){osc('square',380,t,0.09,0.08,o).frequency.exponentialRampToValueAtTime(760,t+0.09)},
 land(t,o){drum(t,120,60,0.08,0.35,o)},
 punch(t,o){nz(t,0.06,0.3,1400,'bandpass',o,1.5);drum(t,200,90,0.07,0.5,o)},
 kick(t,o){nz(t,0.09,0.35,900,'bandpass',o,1.2);drum(t,170,60,0.12,0.7,o)},
 bonk(t,o){drum(t,500,220,0.08,0.6,o);marimba(79,t,0.6,o)},
 ram(t,o){nz(t,0.25,0.3,700,'lowpass',o);osc('sawtooth',140,t,0.22,0.12,o).frequency.exponentialRampToValueAtTime(70,t+0.22)},
 pound(t,o){drum(t,90,30,0.4,1.1,o);nz(t,0.3,0.3,500,'lowpass',o)},
 tongue(t,o){osc('sine',300,t,0.14,0.2,o).frequency.exponentialRampToValueAtTime(900,t+0.12)},
 slurp(t,o){osc('sine',900,t,0.18,0.18,o).frequency.exponentialRampToValueAtTime(250,t+0.18);nz(t,0.1,0.06,3000,'bandpass',o,3)},
 gem(t,o){kalimba(88,t,0.9,o);kalimba(95,t+0.05,0.7,o)},
 star(t,o){[84,88,91,96,100].forEach((m,i)=>kalimba(m,t+i*0.06,0.9,o))},
 heart(t,o){[76,81,84].forEach((m,i)=>marimba(m,t+i*0.07,0.9,o))},
 hurt(t,o){osc('square',300,t,0.25,0.12,o).frequency.exponentialRampToValueAtTime(90,t+0.25);nz(t,0.1,0.15,1500,'bandpass',o)},
 kill(t,o){drum(t,600,120,0.12,0.6,o);kalimba(84,t+0.03,0.6,o)},
 hit(t,o){drum(t,200,70,0.2,1,o);nz(t,0.18,0.35,1200,'bandpass',o,0.8)},
 roar(t,o){const x=osc('sawtooth',110,t,0.7,0.16,o,0.05);x.frequency.linearRampToValueAtTime(70,t+0.7);nz(t,0.7,0.2,600,'bandpass',o,0.7)},
 laugh(t,o){for(let i=0;i<5;i++)osc('square',520-i*30,t+i*0.09,0.06,0.07,o)},
 cp(t,o){[72,76,79,84].forEach((m,i)=>marimba(m,t+i*0.08,0.8,o))},
 swing(t,o){nz(t,0.2,0.12,2500,'bandpass',o,1)},
 grab(t,o){marimba(91,t,0.7,o);drum(t,700,500,0.04,0.3,o)},
 crack(t,o){nz(t,0.22,0.4,1800,'bandpass',o,0.7);drum(t,160,50,0.2,0.7,o)},
 splash(t,o){nz(t,0.4,0.3,1200,'lowpass',o)},
 throw(t,o){nz(t,0.12,0.12,3000,'bandpass',o,2)},
 menu(t,o){marimba(84,t,0.5,o)},
 clear(t,o){[72,76,79,84,79,84,88].forEach((m,i)=>marimba(m,t+i*0.1,1,o))},
 over(t,o){[67,63,60,55].forEach((m,i)=>marimba(m,t+i*0.18,1,o))},
 free(t,o){[72,79,84,88,91,96].forEach((m,i)=>kalimba(m,t+i*0.08,1,o))},
 dive(t,o){osc('sine',700,t,0.3,0.18,o).frequency.exponentialRampToValueAtTime(160,t+0.3);nz(t,0.3,0.2,900,'lowpass',o)},
 swim(t,o){nz(t,0.16,0.1,700,'lowpass',o);osc('sine',220,t,0.12,0.06,o).frequency.exponentialRampToValueAtTime(420,t+0.12)},
 pip(t,o){[72,79,84,91].forEach((m,i)=>steel(m,t+i*0.09,1,o))},
 life(t,o){[79,84,88,91,96].forEach((m,i)=>marimba(m,t+i*0.06,1,o))}};
A.fx=function(n){if(typeof SIM!=='undefined'&&SIM||!this.ctx||this.muted)return;const f=FX[n];if(f)try{f(this.ctx.currentTime+0.005,this.sfx)}catch(e){}};
return A})();


/* ===== core: canvas, layout, input (touch / keys / gamepad), art, helpers ===== */
const $=id=>document.getElementById(id);
const cv=$('cv'),c=cv.getContext('2d');
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),sgn=v=>v<0?-1:1;
const TS=40,VH=400,GRAV=2200;
const QS=new URLSearchParams(location.search);
const SAVE_KEY='kga8_save';let save={};try{save=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(e){save={}}
save.reached=save.reached||0;save.stars=save.stars||{};save.best=save.best||0;
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}
AU.muted=!!save.muted;
let W=0,H=0,DPR=1,S=1,VV=400,viewW=800,gameH=400,portrait=false,SAFE={t:0,r:0,b:0,l:0};
let state='boot',G=null,frame=0,SIM=0;
function readSafe(){const p=$('sp');if(!p)return;const cs=getComputedStyle(p);SAFE={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0}}
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);portrait=H>W*1.08;readSafe();
 if(portrait){const vw=clamp(W,380,470);S=W/vw;gameH=Math.round(H*0.62);VV=gameH/S}
 else{VV=VH;S=H/VH;gameH=H}
 viewW=W/S;layoutPad();document.body.classList.toggle('portrait',portrait)}
let PADR={act:null,jump:null,dive:null};
/* Peter Oct 31 9:10/9:12 PM: 3 buttons -> smaller, all the same size, N64-style diamond at the bottom right with the bottom slot empty:
   JUMP (orange) left, ACTION (green) right, DIVE on top. Always fully visible above the iPhone Safari toolbar (safe-area + visual viewport). */
function layoutPad(){const pad=$('pad'),ba=$('bAct'),bj=$('bJump'),bd=$('bDive'),hint=$('swipeHint');if(!pad)return;
 let s,top0,ph;if(portrait){top0=gameH;ph=H-top0;s=Math.round(clamp(Math.min(W*0.19,ph*0.27),58,76))}else{top0=0;ph=H;s=Math.round(clamp(H*0.165,52,68))}
 pad.style.top=top0+'px';pad.style.height=ph+'px';
 /* Peter Oct 31 11:26 PM: whole pad raised, ACTION + JUMP nearly touching (3px gap), DIVE on top centred, lifted to clear them (4px gap) */
 const d=(s+3)/2,v=Math.ceil(Math.sqrt((s+4)*(s+4)-d*d)),bot=(portrait?Math.round(clamp(ph*0.07,12,26))+16:22)+SAFE.b,right=(portrait?14:12)+SAFE.r;
 const cy=ph-bot-s/2,cx=W-right-d-s/2;
 const at=(el,x,y)=>Object.assign(el.style,{width:s+'px',height:s+'px',left:Math.round(x-s/2)+'px',top:Math.round(y-s/2)+'px',right:'',bottom:'',fontSize:Math.round(s*(el.id==='bAct'?0.215:0.27))+'px'});
 /* tight N64 diamond (Peter Oct 31): left = ACTION (green), right = JUMP (orange), top = DIVE, bottom slot empty; ~8px between neighbours */
 at(ba,cx-d,cy);at(bj,cx+d,cy);at(bd,cx,cy-v);
 if(portrait){hint.style.display='';Object.assign(hint.style,{top:'12px',left:(14+SAFE.l)+'px',right:(right+d*2+s+10)+'px'})}else hint.style.display='none';
 requestAnimationFrame(()=>{const r=e=>{const b=e.getBoundingClientRect();return{x:b.left,y:b.top,w:b.width,h:b.height}};PADR.act=r(ba);PADR.jump=r(bj);PADR.dive=r(bd)})}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,120));
if(window.visualViewport)visualViewport.addEventListener('resize',resize);
/* ---------- input ---------- */
const K={L:0,R:0,U:0,D:0,J:0,A:0,Y:0,V:0};const KP={J:0,A:0,Y:0,V:0};const VIRT={jump:0,act:0,dive:0},VIRTP={jump:0,act:0,dive:0};const TOUCH=new Map();let swipeJump=0;
const inp={L:0,R:0,U:0,D:0,jumpP:0,jump:0,actP:0,act:0,ramP:0,diveP:0,dive:0};let lastJ=0,lastA=0,lastY=0,lastV=0;
const KEYMAP={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'U',KeyW:'U',ArrowDown:'D',KeyS:'D',Space:'J',KeyZ:'J',KeyX:'A',KeyJ:'A',KeyC:'Y',KeyK:'Y',KeyV:'V',KeyL:'V',ShiftLeft:'V'};
addEventListener('keydown',e=>{AU.unlock();if(e.target&&e.target.tagName==='INPUT')return;const k=KEYMAP[e.code];
 if(document.body.classList.contains('uiopen')){if(!e.repeat)uiKey(e);if(k||e.code==='Enter')e.preventDefault();return}
 if(k){if(!K[k]&&k in KP)KP[k]=1;K[k]=1;e.preventDefault()}
 if(e.code==='KeyP'||e.code==='Escape'){if(state==='play')pauseGame()}
 if(e.code==='KeyM')toggleMute()});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=0});
function swipeDir(t){const dx=t.x-t.ax,dy=t.y-t.ay,d=Math.hypot(dx,dy),o={};if(d<14)return o;if(d>44){t.ax=t.x-dx/d*44;t.ay=t.y-dy/d*44}
 const s=Math.round(Math.atan2(dy,dx)/(Math.PI/4));if(s===0||s===1||s===-1)o.R=1;if(s===4||s===-4||s===3||s===-3)o.L=1;if(s===2||s===1||s===3)o.D=1;if(s===-2||s===-1||s===-3)o.U=1;return o}
function tStart(id,x,y){AU.unlock();TOUCH.set(id,{x,y,ax:x,ay:y,z:{}})}
function tMove(id,x,y){const t=TOUCH.get(id);if(!t)return;t.x=x;t.y=y;const before=t.z.U;t.z=swipeDir(t);if(t.z.U&&!before)swipeJump=1}
function tEnd(id){TOUCH.delete(id)}
function clearInput(){TOUCH.clear();for(const k in K)K[k]=0;for(const k in KP)KP[k]=0;VIRT.jump=VIRT.act=VIRT.dive=VIRTP.jump=VIRTP.act=VIRTP.dive=0;swipeJump=0;document.querySelectorAll('#pad .big.on').forEach(b=>b.classList.remove('on'))}
function bindSurface(el){el.addEventListener('touchstart',e=>{if(state!=='play')return;e.preventDefault();for(const t of e.changedTouches)tStart(t.identifier,t.clientX,t.clientY)},{passive:false});
 el.addEventListener('touchmove',e=>{if(state!=='play')return;e.preventDefault();for(const t of e.changedTouches)tMove(t.identifier,t.clientX,t.clientY)},{passive:false});
 el.addEventListener('touchend',e=>{for(const t of e.changedTouches)tEnd(t.identifier)},{passive:false});el.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)tEnd(t.identifier)});
 let md=false;el.addEventListener('mousedown',e=>{if(state!=='play')return;md=true;tStart('m',e.clientX,e.clientY)});addEventListener('mousemove',e=>{if(md)tMove('m',e.clientX,e.clientY)});addEventListener('mouseup',()=>{if(md){md=false;tEnd('m')}})}
function bindBtn(el,k){const on=e=>{e.preventDefault();e.stopPropagation();AU.unlock();if(!VIRT[k])VIRTP[k]=1;VIRT[k]=1;el.classList.add('on')},off=e=>{e.preventDefault();e.stopPropagation();VIRT[k]=0;el.classList.remove('on')};
 el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
 el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off);el.addEventListener('contextmenu',e=>e.preventDefault())}
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state==='play')pauseGame()}});
/* ---------- gamepad (standard mapping; USB or Bluetooth, desktop or phone) ---------- */
const GP={on:false,L:0,R:0,U:0,D:0,J:0,A:0,Y:0,V:0,id:'',prev:{}};let gpIdx=0,gpSeen=false;
function pollPad(){let pads=[];try{pads=navigator.getGamepads?navigator.getGamepads():[]}catch(e){}let p=null;for(const q of pads||[])if(q&&q.connected!==false&&q.buttons&&q.buttons.length){p=q;break}
 if(!p){if(GP.on){GP.on=false;toast('Controller disconnected')}GP.L=GP.R=GP.U=GP.D=GP.J=GP.A=GP.Y=GP.V=0;return}
 if(!GP.on){GP.on=true;GP.id=p.id||'';if(!gpSeen){gpSeen=true}toast('🎮 Controller connected');refreshCtlHint()}
 const b=i=>!!(p.buttons[i]&&(p.buttons[i].pressed||p.buttons[i].value>0.5)),ax=i=>p.axes&&p.axes.length>i?p.axes[i]:0;
 const x=ax(0),y=ax(1);GP.L=b(14)||x<-0.4?1:0;GP.R=b(15)||x>0.4?1:0;GP.U=b(12)||y<-0.55?1:0;GP.D=b(13)||y>0.55?1:0;
 GP.J=b(0)?1:0;GP.A=(b(2)||b(5)||b(7))?1:0;GP.Y=(b(3)||b(4))?1:0;GP.V=(b(1)||b(6))?1:0;
 const now={st:b(9),bk:b(8),a:b(0),b:b(1),u:GP.U,d:GP.D,l:GP.L,r:GP.R},pr=GP.prev;const edge=k=>now[k]&&!pr[k];GP.prev=now;
 if(edge('st')){if(state==='play')pauseGame();else if(state==='pause')resumeGame()}
 if(edge('bk'))toggleMute();
 if(document.body.classList.contains('uiopen')){if(edge('u')||edge('l'))gpFocus(gpIdx-1);if(edge('d')||edge('r'))gpFocus(gpIdx+1);
  if(edge('a')){const t=document.querySelector('#ui .gpf')||document.querySelector('#ui [data-a]');if(t)t.click()}
  if(edge('b')){const bk=document.querySelector('#ui [data-a="back"],#ui [data-a="resume"]');if(bk)bk.click()}}}
addEventListener('gamepadconnected',()=>pollPad());
function gpFocus(i,ns){const bs=[...document.querySelectorAll('#ui [data-a]')];if(!bs.length)return;gpIdx=(i+bs.length)%bs.length;bs.forEach((b,j)=>b.classList.toggle('gpf',j===gpIdx));if(!ns){try{bs[gpIdx].scrollIntoView({block:'nearest'})}catch(e){}AU.fx('menu')}}
function uiKey(e){const nav={ArrowDown:1,ArrowRight:1,KeyS:1,KeyD:1,ArrowUp:-1,ArrowLeft:-1,KeyW:-1,KeyA:-1}[e.code];
 if(nav){gpFocus(gpIdx+(document.querySelector('#ui .gpf')?nav:0))}
 else if(e.code==='Enter'||e.code==='Space'||e.code==='KeyZ'){const t=document.querySelector('#ui .gpf')||document.querySelector('#ui [data-a]');if(t)t.click()}
 else if(e.code==='Escape'||e.code==='Backspace'||e.code==='KeyP'){const bk=document.querySelector('#ui [data-a="back"],#ui [data-a="resume"]');if(bk)bk.click()}}
function readInput(){pollPad();let L=K.L||GP.L,R=K.R||GP.R,U=K.U||GP.U,D=K.D||GP.D;for(const t of TOUCH.values()){if(t.z.L)L=1;if(t.z.R)R=1;if(t.z.U)U=1;if(t.z.D)D=1}
 if(window.__BOT&&G&&state==='play'){const b=botInput();L=b.L;R=b.R;U=b.U;D=b.D;b.J&&(KP.J=1);b.Jh&&(K.J=1);b.A&&(KP.A=1);b.Y&&(KP.Y=1);b.V&&(KP.V=1);if(!b.Jh&&window.__BOTJ)K.J=0;window.__BOTJ=b.Jh}
 inp.L=L&&!R?1:0;inp.R=R&&!L?1:0;inp.U=U?1:0;inp.D=D?1:0;
 const j=!!(K.J||GP.J||VIRT.jump||VIRTP.jump||KP.J);inp.jumpP=((j&&!lastJ)||swipeJump||KP.J||VIRTP.jump)?1:0;inp.jump=j||swipeJump?1:0;lastJ=j;swipeJump=0;
 const a=!!(K.A||GP.A||VIRT.act||VIRTP.act||KP.A);inp.actP=(a&&!lastA)||KP.A||VIRTP.act?1:0;inp.act=a?1:0;lastA=a;
 const y=!!(K.Y||GP.Y||KP.Y);inp.ramP=(y&&!lastY)||KP.Y?1:0;lastY=y;
 const v=!!(K.V||GP.V||VIRT.dive||VIRTP.dive||KP.V);inp.diveP=(v&&!lastV)||KP.V||VIRTP.dive?1:0;inp.dive=v?1:0;lastV=v;
 VIRTP.jump=VIRTP.act=VIRTP.dive=0;KP.J=KP.A=KP.Y=KP.V=0}
/* ---------- art ---------- */
const IMG={},META={};
function loadArt(onp){return fetch('art/meta.json?v='+VERSION).then(r=>r.json()).then(m=>{Object.assign(META,m);const ns=Object.keys(m);let done=0;
 return Promise.all(ns.map(n=>new Promise(res=>{const im=new Image();im.onload=()=>{IMG[n]=im;done++;onp&&onp(done/ns.length);res()};im.onerror=()=>{done++;res()};im.src='art/'+n+'.webp?v='+VERSION})))}).catch(()=>{})}
/* draw sprite anchored bottom-center; art is authored at 2 image px per world unit */
function spr(n,x,y,sc=1,flip=false,alpha=1,rot=0,ay=1){const im=IMG[n];if(!im)return;const w=im.width*0.5*sc,h=im.height*0.5*sc;c.save();c.translate(x,y);if(rot)c.rotate(rot);if(flip)c.scale(-1,1);if(alpha<1)c.globalAlpha*=alpha;c.drawImage(im,-w/2,-h*ay,w,h);c.restore()}
function sprH(n,sc=1){const im=IMG[n];return im?im.height*0.5*sc:0}
const TINT={};function tinted(n,col){const k=n+col;if(TINT[k])return TINT[k];const im=IMG[n];if(!im)return null;const cc=document.createElement('canvas');cc.width=im.width;cc.height=im.height;const x=cc.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=col;x.fillRect(0,0,cc.width,cc.height);return TINT[k]=cc}
function sprT(n,col,x,y,sc=1,flip=false,alpha=1){const im=tinted(n,col);if(!im)return;const w=im.width*0.5*sc,h=im.height*0.5*sc;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.globalAlpha*=alpha;c.drawImage(im,-w/2,-h,w,h);c.restore()}
/* ---------- fx ---------- */
function P(o){if(SIM)return o;if(G.parts.length<420)G.parts.push(o);return o}
function burst(x,y,n,cols,sp=240,life=0.6,size=3,grav=600){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=sp*(0.3+Math.random()*0.7);P({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*0.25,l:life*(0.5+Math.random()*0.7),m:life,s:size*(0.5+Math.random()),c:cols[i%cols.length],g:grav})}}
function dust(x,y,n=6,col='rgba(230,200,150,.8)'){for(let i=0;i<n;i++)P({x:x+rand(-12,12),y:y-rand(0,6),vx:rand(-60,60),vy:-rand(10,60),l:rand(0.35,0.7),m:0.7,s:rand(5,10),c:col,g:-30,puff:1})}
function ring(x,y,col,r=50,life=0.35,w=5){P({ring:1,x,y,l:life,m:life,s:r,c:col,w,vx:0,vy:0,g:0})}
function stars(x,y,n=6){burst(x,y,n,['#fff6a0','#ffd23a','#fff'],200,0.6,4,300)}
function ftxt(x,y,s,col='#fff',big=0){if(SIM)return;for(const t of G.texts)if(Math.abs(t.x-x)<120&&Math.abs(t.y-y)<26&&t.l>0.7)y-=26;G.texts.push({x,y,s,c:col,l:1.1,m:1.1,big})}
function shake(a){if(SIM)return;G.shake=Math.max(G.shake,a)}
function hitstop(t){if(SIM)return;G.hs=Math.max(G.hs,t)}
function flash(col,a=0.6){if(SIM)return;G.flash={c:col,a}}
let toastT=0;function toast(s,ms=1800){const t=$('toast');if(!t)return;t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms)}
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const ovr=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
/* respawn fix (Oct 30): blinking pit falls are free; respawn backs up onto solid ground */
function rfOk(x,row,w){const a=Math.floor((x-w/2)/TS),b=Math.floor((x+w/2)/TS);for(let t=a;t<=b;t++){if(!solidK(tileAt(t,row)))return false;for(let r=1;r<=2;r++){const k=tileAt(t,row-r);if(solidK(k)||k===5||k===6||k===7)return false}}return true}
function rfBack(s,fx,w){const row=Math.floor((s.y+1)/TS),d=sgn(fx-s.x)||1;let ex=s.x;for(let i=0;i<80;i++){if(!rfOk(ex+d*4,row,w))break;ex+=d*4}const need=w*2,dist=Math.abs(ex-s.x);if(rfOk(s.x,row,w)&&dist>=need)return s.x;for(let k=Math.max(0,need-dist);k<TS*30;k+=4){if(rfOk(s.x-d*k,row,w)&&rfOk(s.x-d*k-d*w,row,w))return s.x-d*k}return s.x}
function rfRestore(p){const s=p.rfSafe||(G.cp?{x:G.cp.x,y:G.cp.y}:{x:3*TS,y:9*TS});p.x=rfBack(s,p.x,p.w);p.y=s.y;p.vx=0;p.vy=0;p.pound=0;p.ram=0;p.ledge=null;p.onG=false;p.dive=0;if(p.mode==='swim')setMode(p,'ride');p.inv=Math.max(p.inv,1);camUpdate(0,true)}
function bx(o){return{x:o.x-o.w/2,y:o.y-o.h,w:o.w,h:o.h}}


/* ===== worlds, levels, chunk builder (Vol. 8: Ocean Giraffe: Pip's Deep Dive) ===== */
let ROWS=12,LVH=ROWS*TS;
const WORLDS=[
 {name:'Sunny Beach',bg:'bg1',uw:'uw0',ter:'ter1',top:'#f2d28a',top2:'#d8b060',edge:'#8a6a3a',plank:'#b07a3e',song:'w1',amb:'sparkle',sky:'#9fd8ff',fog:'rgba(255,240,200,.06)',cap:'sand'},
 {name:'Tide Pools',bg:'bg2',uw:'uw0',ter:'ter2',top:'#7aa84a',top2:'#4a6a2a',edge:'#22301a',plank:'#8a5a2a',song:'w2',amb:'sparkle',sky:'#ffd8a8',fog:'rgba(255,220,180,.06)',cap:'moss'},
 {name:'Coral Caves',bg:'bg3',uw:'uw1',ter:'ter3',top:'#c070c0',top2:'#7a3a8a',edge:'#2a1a3a',plank:'#7a5a6a',song:'w3',amb:'motes',sky:'#3a3a7a',fog:'rgba(120,200,255,.07)',cap:'coral'},
 {name:'Deep Reef',bg:'bg4',uw:'uw2',ter:'ter4',top:'#8a9aa8',top2:'#5a6a78',edge:'#1a2430',plank:'#6a4a2a',song:'w4',amb:'motes',sky:'#5a3a6a',fog:'rgba(255,140,90,.06)',cap:'reef'}];
const BOSSES=[
 {k:'tusk',name:'LARRY THE LOBSTER',hp:6},
 {k:'croc',name:'BIG BUBBA THE PUFFERFISH',hp:7},
 {k:'vex',name:'QUEEN WOBBLES THE JELLYFISH',hp:8},
 {k:'cak',name:'CAPTAIN CRAB',hp:12}];
const LEVELS=[
 {name:'Sandy Shore',w:0,rows:20,ch:['start','sign:Captain Crab grabbed Peter\'s birthday present for Kelly! Swipe and hold to run. Swipe up or tap JUMP to jump.','flat','sign:Tap ACTION near little crabs, seaweed or shells and your long TONGUE slurps them up! YUM!','scrab','tree*','scrab','sign:Double-tap ACTION for a NECK RAM. It smashes coral rocks and bad guys!','wall','cp','sign:Ledge too tall? Jump at it and hold UP (or push toward it) to NECK GRAB the edge!','ledge*','crab','sign:Pip the sea turtle is waiting! Hop in the water. Swipe to swim, tap DIVE to zoom down, JUMP at the top to leap out.','sea:w,g,s,p2,j,g,S,h3,f,g','cp','sign:Golden ring? Jump, then tap ACTION to SWING with your neck. JUMP lets go!','swing1','hermit','feast','end']},
 {name:'Seagull Shoals',w:0,rows:12,ch:['start','gull','steps*','crab','pit','scrab','cp','pool','ledge','swing1*','hermit','cp','gull','feast*','boss:0']},
 {name:'Tide Pool Trail',w:1,rows:20,ch:['start','sign:Tide pools! Wade right through them, but watch for crabs.','pool*','crab','plat','octo','cp','sign:Cracked coral? Pip can bust it: double-tap ACTION to DASH, or tap DIVE above it!','sea:g,p3,e,c,S,j,w,g,s','cp','swing2*','scrab','pool','feast','end']},
 {name:'Lighthouse Rocks',w:1,rows:12,ch:['start','octo','ledge*','pool','gull','cp','cliff*','crab','swing2','cp','hermit','feast*','boss:1']},
 {name:'Coral Caves',w:2,rows:20,ch:['start','sign:In the air, hold DOWN and tap ACTION to NECK POUND through cracked coral!','bricks*','scrab','sea:g,h3,j,j,e,c,S,f,p3,g','cp','mound*','octo','swing2','cp','sea:w,g,u,f,h2,j,g,s','feast','end']},
 {name:'Glow Grotto',w:2,rows:12,ch:['start','crab','plat*','gull','swing3*','cp','octo','mound','cp','thorns*','feast','boss:2']},
 {name:'Deep Reef',w:3,rows:20,ch:['start','sign:The Deep Reef! Captain Crab\'s ship is close. Dive deep for the hidden stars.','sea:g,p3,e,h3,j,c,S,f,g,u,e,g','cp','ledge*','crab','sea:w,j,f,h4,g,p4,e,c,S,j,g,s','cp','gull','feast','end']},
 {name:'Shipwreck Cove',w:3,rows:12,ch:['start','crab','thorns*','swing2','cp','octo','mound*','hermit','ledge','swing3*','cp','gull','crab','feast','sign:Captain Crab has Peter\'s present! RAM or STOMP him when he is dizzy. Watch out for flying shells!','boss:3']}];
/* tiles: 0 air, 1 ground, 2 one-way plank, 3 cracked coral, 4 coral rock, 5 sea urchins, 6 shallow tide-pool water (wade), 7 deep sea (swim with Pip) */
function buildLevel(li){const L=LEVELS[li],R=rng(4000+li*77),cols=[];let x=0,h=9;
 const T=[],ents=[],signs=[],hooks=[],gems=[],stars=[],cps=[],seas=[];let boss=null,cage=null,goal=null,pipAt=null;
 const col=(top,kind=1)=>{const a=new Array(ROWS).fill(0);if(top<ROWS)for(let y=top;y<ROWS;y++)a[y]=kind;T.push(a);return T.length-1};
 const flat=n=>{for(let i=0;i<n;i++)col(h)};
 const pit=(n)=>{for(let i=0;i<n;i++){const a=new Array(ROWS).fill(0);T.push(a)}};
 const set=(cx,cy,k)=>{if(T[cx]&&cy>=0&&cy<ROWS)T[cx][cy]=k};
 const plank=(cx,cy,n)=>{for(let i=0;i<n;i++)set(cx+i,cy,2)};
 const gem=(cx,cy)=>gems.push({x:cx*TS+TS/2,y:cy*TS+TS/2,t:R()*6});
 const arc=(cx,cy,n)=>{for(let i=0;i<n;i++)gem(cx+i,cy-Math.round(Math.sin(i/(n-1||1)*Math.PI)*1.5))};
 const foe=(k,cx,cy,o={})=>ents.push(Object.assign({k,x:cx*TS+TS/2,y:cy*TS},o));
 const star=(cx,cy)=>stars.push({x:cx*TS+TS/2,y:cy*TS+TS/2,id:stars.length});
 const food=(cx,cy,k='leaves')=>ents.push({k:'food',f:k,x:cx*TS+TS/2,y:cy*TS+TS/2});
 /* deep sea section: surface one row below the beach, seabed two rows from the bottom */
 const sea=(spec)=>{const top=h+1,bed=ROWS-2,s0=T.length;const wcol=()=>{const a=new Array(ROWS).fill(0);for(let y=top;y<bed;y++)a[y]=7;for(let y=bed;y<ROWS;y++)a[y]=1;T.push(a);return T.length-1};
  const mid=top+3,deep=bed-1;if(!pipAt)pipAt={x:(s0+1.5)*TS,y:top*TS};
  for(let i=0;i<3;i++)wcol();
  for(const f0 of spec.split(',')){const f=f0[0],n=+(f0.slice(1)||0),c=T.length;
   switch(f){
   case 'w':for(let i=0;i<4;i++)wcol();gem(c+2,mid+1);break;
   case 'g':for(let i=0;i<6;i++)wcol();for(let i=0;i<6;i++)gem(c+i,mid+1+Math.round(Math.sin(i/5*Math.PI)*1.5));break;
   case 's':for(let i=0;i<4;i++)wcol();foe('shrimp',c+2,mid+2);break;
   case 'p':{for(let i=0;i<5;i++)wcol();const hh=n||3;for(let y=bed-hh;y<bed;y++){set(c+2,y,4);set(c+3,y,4)}gem(c+2,bed-hh-1);gem(c+3,bed-hh-1);break}
   case 'h':{for(let i=0;i<5;i++)wcol();const hh=n||3;for(let y=top;y<top+hh;y++){set(c+2,y,4);set(c+3,y,4)}gem(c+2,top+hh+1);gem(c+3,top+hh+1);break}
   case 'j':for(let i=0;i<5;i++)wcol();foe('jelly',c+2,mid+1);gem(c+1,deep-1);gem(c+3,deep-1);break;
   case 'f':for(let i=0;i<7;i++)wcol();foe('puffer',c+3,mid+3);arc(c+1,mid,5);break;
   case 'e':for(let i=0;i<8;i++)wcol();foe('eel',c+4,mid+2);gem(c+2,top+1);gem(c+5,top+1);break;
   case 'c':for(let i=0;i<5;i++)wcol();for(let y=top;y<bed;y++)set(c+2,y,3);gem(c+4,mid);break;
   case 'S':for(let i=0;i<4;i++)wcol();set(c,bed-1,4);set(c+3,bed-1,4);star(c+1.5,deep);break;
   case 'u':for(let i=0;i<5;i++)wcol();for(let i=1;i<4;i++)set(c+i,bed-1,5);arc(c+1,mid+1,3);break;
   default:for(let i=0;i<3;i++)wcol()}}
  for(let i=0;i<3;i++)wcol();seas.push({x0:s0*TS,x1:T.length*TS,top:top*TS,bed:bed*TS})};
 for(const raw of L.ch){let name=raw,arg='';if(raw.includes(':')){[name,arg]=[raw.slice(0,raw.indexOf(':')),raw.slice(raw.indexOf(':')+1)]}
  const st=name.endsWith('*');if(st)name=name.slice(0,-1);const x0=T.length;
  switch(name){
  case 'start':flat(8);break;
  case 'sign':flat(2);signs.push({x:(T.length-1)*TS,y:h*TS,text:arg});flat(3);break;
  case 'flat':flat(4);arc(T.length-3,h-2,4);flat(6);if(R()<0.6)foe('crab',T.length-3,h);break;
  case 'crab':flat(5);arc(x0+1,h-2,4);foe('crab',T.length-2,h);flat(5);foe('crab',T.length-2,h);break;
  case 'hermit':flat(4);foe('hermit',T.length-1,h);flat(6);arc(x0+3,h-3,4);break;
  case 'steps':for(let i=0;i<3;i++){h-=1;flat(3);gem(T.length-2,h-1)}if(st)star(T.length-2,h-4);flat(3);for(let i=0;i<3;i++){h+=1;flat(2)}break;
  case 'pit':flat(2);pit(4);gem(T.length-2,h-3);gem(T.length-3,h-3.5|0);flat(4);break;
  case 'plat':flat(2);plank(T.length,h-3,3);flat(3);plank(T.length,h-5,3);gem(T.length+1,h-6);flat(3);if(st)star(T.length-1,h-7);flat(3);break;
  case 'feast':flat(2);for(let i=0;i<8;i++)gem(T.length+i,h-1-((i%2)));food(T.length+4,h-4,'melon');flat(10);if(st)star(T.length-5,h-5);plank(T.length-7,h-3,3);break;
  case 'cp':flat(3);cps.push({x:(T.length-1)*TS+TS/2,y:h*TS,on:false});flat(3);break;
  case 'wall':flat(3);for(let i=0;i<2;i++){const cx=col(h);for(let y=h-5;y<h;y++)set(cx,y,4)}gem(T.length+1,h-1);flat(5);break;
  case 'tree':flat(3);food(T.length,h-4);food(T.length+2,h-5);if(st)star(T.length+1,h-6);flat(5);foe('crab',T.length-1,h);flat(2);break;
  case 'pool':{flat(2);const s0=T.length;flat(7);for(let i=0;i<7;i++){set(s0+i,h,6)}for(let i=0;i<7;i++){set(s0+i,h+1,1)}
   for(let i=1;i<6;i++)gem(s0+i,h-1);foe('scrab',s0+5,h+1);if(st)star(s0+3,h-4);plank(s0+2,h-3,3);flat(3);break}
  case 'swing1':flat(2);{const g=9;hooks.push({x:(T.length+g/2)*TS,y:(h-5)*TS});for(let i=0;i<5;i++)gem(T.length+2+i,h-3);if(st)star(T.length+g/2|0,h-7);pit(g)}flat(4);break;
  case 'swing2':flat(2);{const g=14;hooks.push({x:(T.length+4)*TS,y:(h-5)*TS},{x:(T.length+10)*TS,y:(h-5)*TS});arc(T.length+5,h-3,4);if(st)star(T.length+7,h-6);pit(g)}flat(4);break;
  case 'swing3':flat(2);{const g=19;hooks.push({x:(T.length+4)*TS,y:(h-5)*TS},{x:(T.length+9.5)*TS,y:(h-6)*TS},{x:(T.length+15)*TS,y:(h-5)*TS});arc(T.length+6,h-3,7);if(st)star(T.length+9,h-8);pit(g)}flat(4);break;
  case 'sea':flat(2);sea(arg);flat(4);break;
  case 'gull':flat(6);foe('gull',T.length-2,h-4);flat(6);arc(x0+4,h-2,5);break;
  case 'octo':flat(3);plank(T.length,h-4,3);foe('octo',T.length+1,h-4);flat(4);if(st)star(T.length-3,h-7);gem(T.length-3,h-5);flat(5);break;
  case 'bricks':flat(2);{const s0=T.length;flat(8);for(let y=h-3;y<h;y++){set(s0,y,1);set(s0+7,y,1)}for(let i=1;i<7;i++){set(s0+i,h-3,3);gem(s0+i,h-1)}if(st)star(s0+4,h-2);gem(s0+3,h-4);gem(s0+4,h-4)}flat(3);break;
  case 'mound':flat(3);{const cx=T.length;for(let i=0;i<3;i++){col(h);for(let y=h-4;y<h;y++)set(cx+i,y,3)}if(st)star(cx+1,h-6);gem(cx,h-5);gem(cx+2,h-5)}flat(3);foe('hermit',T.length-1,h);flat(3);break;
  case 'cliff':flat(2);for(let i=0;i<3;i++){h-=2;flat(3);gem(T.length-2,h-1)}flat(4);foe('crab',T.length-2,h);for(let i=0;i<3;i++){h+=2;flat(2)}if(st)star(x0+10,h-9);break;
  case 'thorns':flat(3);{const s=T.length;flat(7);for(let i=1;i<6;i++)set(s+i,h-1,5);plank(s+1,h-4,2);plank(s+4,h-4,2);if(st)star(s+3,h-6);arc(s+1,h-5,5)}flat(3);break;
  case 'scrab':flat(4);foe('scrab',T.length-1,h);flat(4);arc(x0+2,h-2,4);foe('scrab',T.length-1,h);flat(3);break;
  case 'ledge':{flat(3);const up=h>=7?5:3;gem(T.length-2,h-1);h-=up;flat(6);gem(T.length-4,h-1);gem(T.length-3,h-1);if(st)star(T.length-3,h-3);foe('scrab',T.length-2,h);h+=up;flat(4);break}
  case 'end':flat(5);goal={x:(T.length-2)*TS,y:h*TS};flat(8);break;
  case 'boss':{flat(2);const a=T.length;h=9;flat(26);
   const bi=+arg,bk=BOSSES[bi].k;boss={i:bi,x0:a*TS,x1:(a+26)*TS,y:h*TS};
   if(bk==='croc'){for(let i=10;i<17;i++){const c2=new Array(ROWS).fill(0);c2[9]=7;c2[10]=7;c2[11]=1;T[a+i]=c2}plank(a+12,h,3);seas.push({x0:(a+10)*TS,x1:(a+17)*TS,top:9*TS,bed:11*TS})}
   if(bk==='vex'){plank(a+5,h-3,3);plank(a+18,h-3,3)}
   if(bk==='cak'){plank(a+4,h-4,4);plank(a+18,h-4,4)}
   flat(6);break}
  default:flat(4)}
 }
 return{T,ents,signs,hooks,gems,stars,cps,boss,cage,goal,seas,pipAt,cols:T.length,W:T.length*TS}}
function tileAt(tx,ty){if(tx<0)return 1;if(!G||tx>=G.L.cols)return 1;if(ty<0)return 0;if(ty>=ROWS)return 0;return G.L.T[tx][ty]}
const solidK=k=>k===1||k===3||k===4;
const waterK=k=>k===7;
function inSea(x,y){return waterK(tileAt(Math.floor(x/TS),Math.floor(y/TS)))}
function seaTop(x){const tx=Math.floor(x/TS);for(let y=0;y<ROWS;y++){if(tileAt(tx,y)===7)return y*TS;if(solidK(tileAt(tx,y)))return null}return null}

/* ===== player: Kelly's giraffe (land) and Kelly's giraffe riding Pip the sea turtle (swim) ===== */
const PH={foot:{w:28,h:76,spd:235,acc:1900,jv:640,hold:0.6},ride:{w:58,h:90,spd:300,acc:2100,jv:690,hold:0.6},swim:{w:66,h:72,spd:235,acc:1000,jv:0,hold:1}};
function newPlayer(x,y,mode){return{x,y,vx:0,vy:0,face:1,onG:false,mode,hp:3,maxhp:3,inv:0,coy:0,jbuf:0,holdJ:0,atk:0,atkK:'',atkHit:null,lastTap:-9,ram:0,ramDx:0,ramDy:0,ramCd:0,pound:0,swing:null,tng:0,tngT:null,anim:0,land:0,dead:0,w:PH[mode].w,h:PH[mode].h,squash:0,swCd:0,ledge:null,lgCd:0,dive:0,leap:0}}
function setMode(p,m){p.mode=m;p.w=PH[m].w;p.h=PH[m].h}
function headPt(p){if(p.mode==='swim')return{x:p.x+p.face*24,y:p.y-p.h-30};return p.mode==='ride'?{x:p.x+p.face*34,y:p.y-p.h+6}:{x:p.x+p.face*8,y:p.y-p.h+10}}
/* tile collision (axis separated) */
function collideX(o){const b=bx(o),y0=Math.floor((b.y+2)/TS),y1=Math.floor((b.y+b.h-2)/TS);
 if(o.vx>0){const tx=Math.floor((b.x+b.w)/TS);for(let ty=y0;ty<=y1;ty++)if(solidK(tileAt(tx,ty))){o.x=tx*TS-o.w/2-0.01;return tx}}
 else if(o.vx<0){const tx=Math.floor(b.x/TS);for(let ty=y0;ty<=y1;ty++)if(solidK(tileAt(tx,ty))){o.x=(tx+1)*TS+o.w/2+0.01;return tx}}
 return null}
function collideY(o,py,drop){const b=bx(o),x0=Math.floor((b.x+2)/TS),x1=Math.floor((b.x+b.w-2)/TS);o.onG=false;
 if(o.vy>=0){const ty=Math.floor(o.y/TS);for(let tx=x0;tx<=x1;tx++){const k=tileAt(tx,ty);if(solidK(k)||(k===2&&!drop&&py<=ty*TS+1)){o.y=ty*TS;o.vy=0;o.onG=true;return{tx,ty,k}}}}
 else{const ty=Math.floor(b.y/TS);for(let tx=x0;tx<=x1;tx++){const k=tileAt(tx,ty);if(solidK(k)){o.y=(ty+1)*TS+o.h;o.vy=0;return{tx,ty,k,up:1}}}}
 return null}
function breakTile(tx,ty,why){if(SIM)return false;const k=tileAt(tx,ty);if(k!==3&&k!==4)return false;G.L.T[tx][ty]=0;const x=tx*TS+TS/2,y=ty*TS+TS/2;
 burst(x,y,14,k===3?['#c8743a','#8a4a20','#e8a060']:['#9a9aa8','#6c6c7c','#d8d8e0'],260,0.7,5,1400);AU.fx('crack');shake(5);addScore(20,x,y,false);return true}
function addScore(n,x,y,show=true){G.score+=n;if(show)ftxt(x,y,'+'+n,'#fff6c0')}
function addGem(x,y){G.gems++;G.lvGems++;addScore(50,x,y,false);AU.fx('gem');burst(x,y,6,['#7aff7a','#d0ffd0','#30d050'],140,0.4,3,200);
 if(G.gems>=100){G.gems-=100;G.lives++;AU.fx('life');ftxt(x,y-20,'1UP!','#7aff7a',1)}}
function hurtPlayer(p,src){if(SIM){p.simHurt=1;return}if(p.inv>0||p.dead||G.won)return;if(window.__GOD){p.inv=0.3;return}p.hp--;p.inv=1.5;AU.fx('hurt');shake(8);flash('#ff3030',0.35);hitstop(0.06);
 const d=src?sgn(p.x-src):-p.face;p.vx=d*280;p.vy=-420;p.ram=0;p.pound=0;p.swing=null;p.atk=0;
 if(p.hp<=0)killPlayer(p)}
function killPlayer(p,why){if(SIM){p.dead=1;return}if(p.dead)return;if(window.__GOD&&why!=='fall'){p.hp=p.maxhp;return}p.dead=1;p.hp=0;p.vx=0;p.vy=-600;AU.fx(why==='water'?'splash':'hurt');G.deadT=1.6;G.deaths++}
function startAttack(p,k){p.atk=k==='kick'?0.32:k==='bonk'?0.22:0.2;p.atkK=k;p.atkHit=new Set();AU.fx(k==='kick'?'kick':k==='bonk'?'bonk':'punch');if(k==='kick'&&!p.onG)p.vy=Math.min(p.vy,-120)}
function attackBox(p){const r=p.atkK==='kick'?56:p.atkK==='bonk'?54:40;if(p.mode==='swim')return{x:p.face>0?p.x+16:p.x-16-60,y:p.y-p.h+4,w:60,h:p.h};if(p.mode==='ride')return{x:p.face>0?p.x+10:p.x-10-r-20,y:p.y-p.h-6,w:r+20,h:56};return{x:p.face>0?p.x:p.x-r,y:p.y-p.h+10,w:r,h:44}}
function ramBox(p){if(p.ramDy<0)return{x:p.x-34,y:p.y-p.h-30,w:68,h:70};return{x:p.face>0?p.x:p.x-80,y:p.y-p.h,w:80,h:p.h-10}}
/* Peter Oct 31 11:11 PM: easy ring grab - ACTION anywhere near a ring grabs it, no aiming. Reach is measured from the head OR the body, any direction, ~1.7x the old head reach */
const HOOK_R=205;function nearHook(p){if(p.mode!=='ride'||p.swCd>0)return null;const hp=headPt(p),cy=p.y-p.h*0.55;let best=null,bd=HOOK_R;for(const h of G.L.hooks){if(h===p.relH&&G.t-p.relAt<0.6)continue;const ry=h.y+30;const d=Math.min(Math.hypot(h.x-hp.x,ry-hp.y),Math.hypot(h.x-p.x,ry-cy),Math.hypot(h.x-p.x,h.y-cy));if(d<bd){bd=d;best=h}}return best}
function tongueTarget(p){if(p.mode==='foot')return null;const hp=headPt(p);let best=null,bd=150;
 const test=(o,kind)=>{const dx=(o.x-hp.x)*p.face,dy=o.y-hp.y;if(dx<-20||dy>40)return;const d=Math.hypot(dx,dy);if(d<bd){bd=d;best={o,kind}}};
 for(const e of G.ents){if(e.dead)continue;if(e.k==='food')test(e,'food');else if(EDEF[e.k]&&EDEF[e.k].eat)test({x:e.x,y:e.y-e.h/2,e},'bug')}for(const s of G.L.stars)if(!s.got)test(s,'star');
 if(!best)for(const g of G.L.gems)if(!g.got&&g.y<p.y-p.h+10)test(g,'gem');return best}
function findLedge(p){if(p.mode!=='ride'||p.onG||p.swing||p.ledge||p.lgCd>0||p.pound)return null;const dir=p.face,fx=p.x+dir*(p.w/2+6),tx=Math.floor(fx/TS);
 for(let ty=Math.floor((p.y-p.h-48)/TS);ty<=Math.floor((p.y-24)/TS);ty++){if(ty<1)continue;const k=tileAt(tx,ty);if(!solidK(k))continue;if(solidK(tileAt(tx,ty-1))||solidK(tileAt(tx,ty-2)))continue;
  const top=ty*TS;if(top<p.y-p.h-48||top>p.y-24)continue;if(solidK(tileAt(Math.floor((p.x)/TS),ty-1))||solidK(tileAt(Math.floor((p.x)/TS),ty-2)))return null;return{tx,ty,x:dir>0?tx*TS+p.w/2+4:(tx+1)*TS-p.w/2-4,y:top}}return null}
function startLedge(p,l){p.ledge={sx:p.x,sy:p.y,x:l.x,y:l.y,t:0};p.vx=p.vy=0;p.ram=0;p.pound=0;p.atk=0;AU.fx('grab');if(!SIM){dust(l.x,l.y,4);ftxt(l.x,l.y-p.h-14,'NECK GRAB!','#9ff0ff')}}
function doAction(p){const now=G.t;const dbl=now-p.lastTap<0.3;p.lastTap=now;
 if(p.mode==='swim'){const tt=tongueTarget(p);if(tt&&!dbl){p.tng=0.3;p.tngT=tt;AU.fx('tongue');return}if(dbl){startRam(p,0);return}startAttack(p,'bonk');return}
 if(p.swing)return;const hk=nearHook(p);if(hk){grabHook(p,hk);return}
 if(!p.onG){const lg=findLedge(p);if(lg){startLedge(p,lg);return}}
 const tt=tongueTarget(p);if(tt&&!dbl){p.tng=0.3;p.tngT=tt;AU.fx('tongue');return}
 if(!p.onG&&inp.D){startPound(p);return}
 if(inp.U){startRam(p,-1);return}
 if(dbl){startRam(p,0);return}
 if(hk){grabHook(p,hk);return}
 startAttack(p,'bonk')}
function startRam(p,dy){if(p.ramCd>0||p.mode==='foot')return;if(p.mode==='swim'){p.ram=0.32;p.ramDy=0;p.ramDx=p.face;p.atk=0;p.ramHit=new Set();p.vx=p.face*520;AU.fx('ram');bubbles(p.x-p.face*30,p.y-30,8);return}p.ram=dy<0?0.24:0.3;p.ramDy=dy;p.ramDx=dy<0?0:p.face;p.atk=0;AU.fx('ram');p.ramHit=new Set();
 if(dy<0){p.vy=-780;p.vx*=0.4}else{p.vx=p.face*660;p.vy=Math.min(p.vy,0)}dust(p.x-p.face*20,p.y,5)}
function startPound(p){p.pound=1;p.vy=950;p.vx*=0.2;p.ram=0;AU.fx('swing')}
function grabHook(p,h){const dx=p.x-h.x,dy=(p.y-p.h*0.55)-h.y;const L=clamp(Math.hypot(dx,dy),70,120);const a=clamp(Math.atan2(dx,dy),-1.45,1.45);
 p.swing={h,L,a,av:clamp((p.vx*Math.cos(a)-p.vy*Math.sin(a))/L,-5,5),tw:0,fx:p.x,fy:p.y};p.ram=0;p.pound=0;p.atk=0;p.ledge=null;AU.fx('grab');p.vy=0}
function releaseSwing(p,jump){const s=p.swing;if(!s)return;p.relH=s.h;p.relAt=G.t;const tv=s.av*s.L;p.vx=clamp(Math.cos(s.a)*tv,-560,560);p.vy=clamp(-Math.sin(s.a)*tv,-700,600)-(jump?330:0);p.swing=null;p.swCd=0.3;if(jump)AU.fx('jump');if(Math.abs(p.vx)>20)p.face=sgn(p.vx)}
function updatePlayer(p,dt){const C=PH[p.mode];p.anim+=dt;p.inv=Math.max(0,p.inv-dt);p.ramCd=Math.max(0,p.ramCd-dt);p.swCd=Math.max(0,p.swCd-dt);p.squash=Math.max(0,p.squash-dt*4);
 if(p.dead){p.vy+=GRAV*dt;p.y+=p.vy*dt;return}
 p.lgCd=Math.max(0,p.lgCd-dt);
 if(p.ledge){const l=p.ledge;l.t+=dt;const k=Math.min(1,l.t/0.3),e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;p.x=lerp(l.sx,l.x,e);p.y=lerp(l.sy,l.y,Math.min(1,e*1.3));if(k>=1){p.x=l.x;p.y=l.y;p.ledge=null;p.onG=true;p.vy=0;p.vx=p.face*60;p.lgCd=0.25;p.squash=0.4}return}
 if(G.cut){p.vx=0;p.vy+=GRAV*dt;const py=p.y;p.y+=p.vy*dt;collideY(p,py);return}
 if(p.mode!=='swim'&&!p.swing&&inSea(p.x,p.y-p.h*0.4))enterSea(p);
 if(p.mode==='swim'){updateSwim(p,dt);return}
 if(inp.diveP&&!SIM&&G.t-(G.diveTip||-9)>2.5){G.diveTip=G.t;toast('DIVE works when you ride Pip in the sea! 🐢')}
 /* swing */
 if(p.swing){const s=p.swing;let acc=-(GRAV/s.L)*Math.sin(s.a);const pump=(inp.R?1:0)-(inp.L?1:0);acc+=pump*4.2*Math.cos(s.a)*(Math.abs(s.a)<1.1?1:0.2);
  s.av+=acc*dt;s.av*=(1-0.12*dt);s.av=clamp(s.av,-6,6);s.a+=s.av*dt;s.a=clamp(s.a,-1.45,1.45);
  p.x=s.h.x+Math.sin(s.a)*s.L;p.y=s.h.y+Math.cos(s.a)*s.L+p.h*0.55;if(s.tw!==undefined&&s.tw<1){s.tw=Math.min(1,s.tw+dt/0.2);const e=1-Math.pow(1-s.tw,3);p.x=lerp(s.fx,p.x,e);p.y=lerp(s.fy,p.y,e)}if(Math.abs(s.av)>0.3)p.face=sgn(s.av*Math.cos(s.a));
  if(inp.jumpP||inp.actP&&G.t-p.lastTap>0.15){releaseSwing(p,inp.jumpP);p.lastTap=G.t}
  else if(!(s.tw<1)){const b=bx(p);if(solidAt(b)){releaseSwing(p,false);p.vx*=-0.3}}
  if(p.swing&&Math.random()<0.1&&Math.abs(s.av)>2)AU.fx('swing');return}
 /* horizontal */
 const want=(inp.R?1:0)-(inp.L?1:0);const wade=tileAt(Math.floor(p.x/TS),Math.floor((p.y-4)/TS))===6,WS=wade?0.62:1;
 if(wade&&p.onG&&Math.abs(p.vx)>60&&!SIM&&Math.random()<0.35)P({x:p.x+rand(-24,24),y:p.y-30,vx:-p.vx*0.2+rand(-40,40),vy:-rand(120,260),l:0.45,m:0.45,s:rand(2,4),c:'rgba(220,245,255,.85)',g:900});
 if(p.ram>0&&p.ramDy===0){p.ram-=dt;p.vx=p.ramDx*660;p.vy=0;if(Math.random()<0.6)dust(p.x-p.face*30,p.y,1);if(p.ram<=0){p.ramCd=0.22;p.vx=p.face*C.spd}}
 else{if(p.ram>0){p.ram-=dt;if(p.ram<=0)p.ramCd=0.2}
  const ctl=p.onG?1:0.75;if(want){const v0=p.vx;const SP=C.spd*WS;if(Math.abs(v0)>SP&&sgn(v0)===want)p.vx=sgn(v0)*Math.max(SP,Math.abs(v0)-(p.onG?1400:500)*dt);else{p.vx+=want*C.acc*ctl*dt;if(Math.abs(p.vx)>SP)p.vx=sgn(p.vx)*SP}if(p.atk<=0||p.mode==='ride')p.face=want}
  else{const f=(p.onG?2400:500)*dt;p.vx=Math.abs(p.vx)<=f?0:p.vx-sgn(p.vx)*f}}
 /* jump */
 p.coy=p.onG?0.1:p.coy-dt;p.jbuf=inp.jumpP?0.12:p.jbuf-dt;
 if(p.jbuf>0&&p.coy>0&&p.pound===0){p.vy=-C.jv;p.coy=0;p.jbuf=0;p.holdJ=1;AU.fx('jump');dust(p.x,p.y,5);p.squash=0.6}
 if(!inp.jump)p.holdJ=0;
 const rising=p.vy<0;let g=GRAV;if(p.holdJ&&rising)g*=C.hold;if(p.ram>0&&p.ramDy===0)g=0;if(p.pound)g=0;
 /* action */
 if(inp.actP)doAction(p);if(inp.ramP&&p.mode!=='foot')startRam(p,inp.U?-1:0);
 if(p.atk>0)p.atk-=dt;if(p.tng>0){p.tng-=dt;if(p.tngT&&p.tng<0.18){const t=p.tngT;p.tngT=null;collectTongue(t)}}
 /* integrate */
 p.vy=Math.min(p.vy+g*dt,p.pound?950:1100);
 p.x+=p.vx*dt;const hx=collideX(p);if(hx!==null){if(p.ram>0&&p.ramDy===0){const b=bx(p),y0=Math.floor(b.y/TS),y1=Math.floor((b.y+b.h-2)/TS);let br=false;for(let ty=y0;ty<=y1;ty++)br=breakTile(hx,ty)||br;if(!br){p.ram=0;p.ramCd=0.25;shake(4);AU.fx('bonk');p.vx=-p.face*120}}else p.vx=0}
 const py=p.y;p.y+=p.vy*dt;const wasG=p.onG;const hy=collideY(p,py,inp.D&&!p.pound&&p.onG);
 if(hy&&hy.up){if(p.ram>0||p.vy<=0){let br=breakTile(hy.tx,hy.ty);const b=bx(p);for(let tx=Math.floor(b.x/TS);tx<=Math.floor((b.x+b.w)/TS);tx++)if(tx!==hy.tx)br=breakTile(tx,hy.ty)||br;if(br&&p.ram>0)p.vy=-300}}
 if(hy&&!hy.up&&p.pound){let br=false;const b=bx(p);for(let tx=Math.floor((b.x+2)/TS);tx<=Math.floor((b.x+b.w-2)/TS);tx++)br=breakTile(tx,hy.ty)||br;
  if(br){p.onG=false;p.vy=600}else{p.pound=0;shake(10);AU.fx('pound');ring(p.x,p.y,'rgba(255,240,200,.9)',90,0.35,6);dust(p.x,p.y,12);poundWave(p)}}
 if(p.onG&&!wasG&&py<p.y+1){p.squash=0.5;if(p.vy===0&&!p.pound)AU.fx('land')}
 if(p.onG)p.pound=0;
 if(!p.onG&&!p.dead&&(inp.U||(want===p.face&&p.vy>-60))){const lg=findLedge(p);if(lg)startLedge(p,lg)}
 /* hazards */
 const b=bx(p);for(let tx=Math.floor(b.x/TS);tx<=Math.floor((b.x+b.w)/TS);tx++)for(let ty=Math.floor(b.y/TS);ty<=Math.floor((b.y+b.h-1)/TS);ty++){const k=tileAt(tx,ty);
  if(k===5&&p.y>ty*TS+14)hurtPlayer(p,tx*TS+TS/2);}
 if(p.onG&&!p.ledge&&!SIM&&rfOk(p.x,Math.floor((p.y+1)/TS),p.w+TS))p.rfSafe={x:p.x,y:p.y};
 if(p.y>LVH+120){if(p.inv>0&&!p.dead&&!SIM){rfRestore(p);return}killPlayer(p,'fall')}
 if(G.arena){const a=G.arena;if(p.x<a.x0+p.w/2){p.x=a.x0+p.w/2;p.vx=Math.max(0,p.vx)}if(p.x>a.x1-p.w/2){p.x=a.x1-p.w/2;p.vx=Math.min(0,p.vx)}}
 if(p.x<p.w/2)p.x=p.w/2}
function solidAt(b){for(let tx=Math.floor(b.x/TS);tx<=Math.floor((b.x+b.w)/TS);tx++)for(let ty=Math.floor(b.y/TS);ty<=Math.floor((b.y+b.h)/TS);ty++)if(solidK(tileAt(tx,ty)))return true;return false}
function splash(x,y){if(SIM)return;burst(x,y,18,['#9ad8ff','#e0f6ff','#4aa8ff'],320,0.7,4,1200);ring(x,y,'rgba(200,240,255,.8)',50,0.4,4)}
function collectTongue(t){const o=t.o;if(t.kind==='food'){o.dead=1;const p=G.p;if(p.hp<p.maxhp){p.hp++;AU.fx('heart');ftxt(o.x,o.y,'+1 HEART','#ff8aa0')}else{addScore(200,o.x,o.y);AU.fx('slurp')}burst(o.x,o.y,8,['#7ad04a','#c0f080'],160,0.5,3,300)}
 else if(t.kind==='bug'){if(!o.e.dead){hitEnemy(o.e,'yum');AU.fx('slurp')}}
 else if(t.kind==='star')getStar(o);else if(t.kind==='gem'){o.got=1;addGem(o.x,o.y)}}
function getStar(s){if(s.got)return;s.got=1;G.lvStars[s.id]=1;addScore(1000,s.x,s.y);AU.fx('star');stars(s.x,s.y,14);ftxt(s.x,s.y-20,'GOLD STAR!','#ffe060',1)}


/* ===== swimming with Pip ===== */
function bubbles(x,y,n=4){if(SIM)return;for(let i=0;i<n;i++)P({x:x+rand(-10,10),y:y+rand(-8,8),vx:rand(-30,30),vy:-rand(40,110),l:rand(0.6,1.2),m:1.2,s:rand(2.5,5.5),c:'b',g:-60,bub:1})}
function enterSea(p){const was=p.mode;setMode(p,'swim');p.vy*=0.35;p.vx*=0.6;p.pound=0;p.ram=0;p.swing=null;p.leap=0;p.dive=0;p.onG=false;
 if(SIM)return;const st=seaTop(p.x);splash(p.x,st!==null?st:p.y-30);AU.fx('splash');bubbles(p.x,p.y-20,10);
 if(!G.metPip){G.metPip=1;AU.fx('pip');ftxt(p.x,p.y-120,'PIP TO THE RESCUE!','#7affc0',1)}if(G.pip)G.pip.hide=1}
function exitSea(p){setMode(p,'ride');p.dive=0;p.ram=0;if(SIM)return;const st=seaTop(p.x);G.pip={x:p.x,y:st!==null?st:p.y,face:p.face,hide:0,t:0};splash(p.x,st!==null?st:p.y)}
function updateSwim(p,dt){const C=PH.swim;p.dive=Math.max(0,p.dive-dt);p.leap=Math.max(0,p.leap-dt);p.onG=false;p._sw=(p._sw||0)+dt;
 const wx=(inp.R?1:0)-(inp.L?1:0),wy=(inp.D?1:0)-(inp.U?1:0);
 if(p.ram>0){p.ram-=dt;p.vx=p.ramDx*520;p.vy*=0.92;if(!SIM&&Math.random()<0.5)bubbles(p.x-p.face*34,p.y-30,1);if(p.ram<=0){p.ramCd=0.25;p.vx=p.face*C.spd}}
 else{const tv=wx*C.spd;p.vx+=clamp(tv-p.vx,-C.acc*dt,C.acc*dt);if(wx)p.face=wx}
 if(p.dive>0){p.vy=Math.max(p.vy,440)}else if(p.leap<=0){const tv=wy*175-24;p.vy+=clamp(tv-p.vy,-760*dt,760*dt)}
 const st=seaTop(p.x),atSurf=st!==null&&p.y-p.h*0.6<=st+10;
 if(inp.jumpP){if(atSurf){p.vy=-700;p.leap=0.45;p.dive=0;AU.fx('jump');if(!SIM){splash(p.x,st);bubbles(p.x,p.y-20,6)}}else{p.vy=Math.min(p.vy,-330);AU.fx('swim');bubbles(p.x-p.face*20,p.y-20,4)}}
 if(inp.diveP){p.dive=0.42;p.vy=440;p.leap=0;AU.fx('dive');bubbles(p.x,p.y-p.h,10);if(!SIM)ring(p.x,p.y-p.h*0.5,'rgba(200,240,255,.7)',40,0.3,3)}
 if(inp.actP)doAction(p);if(inp.ramP)startRam(p,0);
 if(p.atk>0)p.atk-=dt;if(p.tng>0){p.tng-=dt;if(p.tngT&&p.tng<0.18){const t=p.tngT;p.tngT=null;collectTongue(t)}}
 if(!SIM&&Math.random()<dt*3)bubbles(p.x+p.face*30,p.y-p.h*0.8,1);
 p.x+=p.vx*dt;const hx=collideX(p);if(hx!==null){if(p.ram>0){const b=bx(p),y0=Math.floor(b.y/TS),y1=Math.floor((b.y+b.h-2)/TS);let br=false;for(let ty=y0;ty<=y1;ty++)br=breakTile(hx,ty)||br;if(!br){p.ram=0;p.ramCd=0.25;shake(3);AU.fx('bonk');p.vx=-p.face*120}}else p.vx=0}
 const py=p.y;p.y+=p.vy*dt;const hy=collideY(p,py,false);p.onG=false;
 if(hy&&!hy.up&&p.dive>0){let br=false;const b=bx(p);for(let tx=Math.floor((b.x+2)/TS);tx<=Math.floor((b.x+b.w-2)/TS);tx++)br=breakTile(tx,hy.ty)||br;if(br){p.vy=380}else{p.dive=0;shake(5);AU.fx('pound');ring(p.x,p.y,'rgba(220,250,255,.9)',70,0.35,5);bubbles(p.x,p.y-6,12);poundWave(p)}}
 if(hy&&hy.up&&(p.ram>0||p.leap>0)){breakTile(hy.tx,hy.ty)}
 if(st!==null&&p.leap<=0&&p.y-p.h*0.6<st){p.y=st+p.h*0.6;if(p.vy<0)p.vy=0}
 /* hazards: sea urchins */
 {const b=bx(p);for(let tx=Math.floor(b.x/TS);tx<=Math.floor((b.x+b.w)/TS);tx++)for(let ty=Math.floor(b.y/TS);ty<=Math.floor((b.y+b.h-1)/TS);ty++)if(tileAt(tx,ty)===5&&p.y>ty*TS+12)hurtPlayer(p,tx*TS+TS/2)}
 if(G.arena){const a=G.arena;if(p.x<a.x0+p.w/2){p.x=a.x0+p.w/2;p.vx=Math.max(0,p.vx)}if(p.x>a.x1-p.w/2){p.x=a.x1-p.w/2;p.vx=Math.min(0,p.vx)}}
 if(p.x<p.w/2)p.x=p.w/2;
 if(!inSea(p.x,p.y-p.h*0.4))exitSea(p)}

/* ===== enemies, items, projectiles ===== */
/* beach + sea critters. crab/scrab walk (8-leg rig), hermit = spiky walker, gull = swooper, octo = ink thrower, jelly/puffer/eel/shrimp swim */
const EDEF={scrab:{w:34,h:24,spd:52,pts:100,eat:1},crab:{w:50,h:36,spd:72,pts:100},hermit:{w:40,h:36,spd:30,pts:150,spiky:1},gull:{w:56,h:42,spd:90,pts:150,fly:1},octo:{w:50,h:52,spd:0,pts:150},
 jelly:{w:36,h:40,spd:0,pts:150,swim:1,spiky:1},puffer:{w:40,h:30,spd:60,pts:150,swim:1},eel:{w:70,h:26,spd:80,pts:200,swim:1},shrimp:{w:30,h:24,spd:0,pts:100,swim:1,eat:1}};
function spawnEnts(){G.ents=[];for(const e of G.L.ents){const o=Object.assign({},e);if(o.k==='food'){o.t=Math.random()*6;G.ents.push(o);continue}
 const d=EDEF[o.k];Object.assign(o,{w:d.w,h:d.h,vx:-d.spd,vy:0,face:-1,hp:1,t:Math.random()*3,st:'walk',x0:o.x,y0:o.y,cd:1+Math.random(),onG:false});G.ents.push(o)}}
function enemyActive(e){return Math.abs(e.x-G.p.x)<viewW*0.75+200}
function updEnemies(dt){const p=G.p;
 for(const e of G.ents){if(e.dead){if(e.dying){e.dying-=dt;e.vy+=GRAV*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot=(e.rot||0)+dt*8}continue}
  if(e.k==='food'){e.t+=dt;if(!p.dead&&ovr(bx({x:e.x,y:e.y+18,w:34,h:36}),bx(p))){G.p.tngT={o:e,kind:'food'};collectTongue(G.p.tngT);G.p.tngT=null}continue}
  if(!enemyActive(e))continue;e.t+=dt;e.stun=Math.max(0,(e.stun||0)-dt);
  if(e.k==='crab'||e.k==='hermit'||e.k==='scrab'){if(e.stun>0){e.vx=0}else if(Math.abs(e.vx)<1)e.vx=-EDEF[e.k].spd*(e.face||-1)*-1;
   e.vy+=GRAV*dt;e.x+=e.vx*dt;const hx=collideX(e);if(hx!==null){e.vx=-e.vx}const py=e.y;e.y+=e.vy*dt;collideY(e,py);
   if(e.onG){const ahead=e.x+sgn(e.vx)*(e.w/2+4);const tx=Math.floor(ahead/TS),ty=Math.floor((e.y+4)/TS);const k=tileAt(tx,ty);if(!(solidK(k)||k===2))e.vx=-e.vx}
   if(e.vx)e.face=sgn(e.vx);if(e.y>LVH+80)e.dead=1}
  else if(e.k==='jelly'){e.y=e.y0+Math.sin(e.t*1.3)*48;e.x=e.x0+Math.sin(e.t*0.5)*16;e.face=-1}
  else if(e.k==='shrimp'){e.x=e.x0+Math.sin(e.t*0.9)*60;e.y=e.y0+Math.sin(e.t*2.4)*10;e.face=Math.cos(e.t*0.9)>0?1:-1}
  else if(e.k==='eel'){e.x=e.x0+Math.sin(e.t*0.7)*110;e.y=e.y0+Math.sin(e.t*1.4)*20;e.face=Math.cos(e.t*0.7)>0?1:-1}
  else if(e.k==='puffer'){const near=Math.hypot(p.x-e.x,p.y-30-e.y)<130&&!p.dead;e.puff=clamp((e.puff||0)+(near?dt*4:-dt*1.5),0,1);
   if(e.puff<0.5){e.x=e.x0+Math.sin(e.t*0.8)*70;e.face=Math.cos(e.t*0.8)>0?1:-1}e.y=e.y0+Math.sin(e.t*2)*6;e.w=40+e.puff*16;e.h=30+e.puff*18}
  else if(e.k==='gull'){if(!e.st||e.st==='walk')e.st='fly';
   if(e.st==='fly'){e.x=e.x0+Math.sin(e.t*0.9)*120;e.y=e.y0+Math.sin(e.t*2.2)*14;e.face=Math.cos(e.t*0.9)>0?1:-1;e.cd-=dt;
    if(e.cd<=0&&Math.abs(p.x-e.x)<240&&p.y>e.y+40&&!p.dead&&p.mode!=='swim'){e.st='dive';e.tx=p.x;e.ty=p.y-30;e.face=sgn(p.x-e.x);AU.fx('throw')}}
   else if(e.st==='dive'){const dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy);if(d<12){e.st='rise'}else{e.x+=dx/d*360*dt;e.y+=dy/d*360*dt}}
   else{const y=e.y0;e.y-=200*dt;if(e.y<=y){e.y=y;e.st='fly';e.cd=2.4;e.x0=e.x-Math.sin(e.t*0.9)*120}}}
  else if(e.k==='octo'){e.face=sgn(p.x-e.x);e.cd-=dt;if(e.cd<=0&&Math.abs(p.x-e.x)<460&&!p.dead&&p.mode!=='swim'){e.cd=2.3;e.thr=0.35;const tx=p.x+p.vx*0.5,dx=tx-e.x;const T=0.9;G.shots.push({k:'ink',x:e.x,y:e.y-40,vx:dx/T,vy:-(GRAV*0.5*T)+(p.y-30-(e.y-40))/T,r:14,g:1,rot:0});AU.fx('throw')}e.thr=Math.max(0,(e.thr||0)-dt)}
  /* player interactions */
  if(p.dead)continue;const eb=bx(e),pb=bx(p);
  if(p.ram>0&&ovr(ramBox(p),eb)){hitEnemy(e,'ram');continue}
  if(p.atk>0&&!p.atkHit.has(e)&&ovr(attackBox(p),eb)){p.atkHit.add(e);if(e.k==='jelly'||e.k==='hermit'||(e.k==='puffer'&&e.puff>0.5)){hurtPlayer(p,e.x);continue}hitEnemy(e,p.atkK);continue}
  if(ovr(pb,eb)){const fromTop=p.vy>60&&p.y-eb.y<26;
   if(p.dive>0){hitEnemy(e,'dive');continue}
   const spk=EDEF[e.k].spiky||(e.k==='puffer'&&e.puff>0.5);
   if(fromTop&&!spk){hitEnemy(e,'stomp');if(p.mode==='swim')p.vy=-260;else bounce(p);continue}
   if(p.pound&&fromTop){hitEnemy(e,'pound');continue}
   if(p.swing&&!EDEF[e.k].spiky){hitEnemy(e,'kick');continue}
   hurtPlayer(p,e.x)}}
 G.ents=G.ents.filter(e=>!e.dead||e.dying>0||e.k==='food'&&!e.dead)}
function p_mode(){return G&&G.p?G.p.mode:''}
function bounce(p){p.vy=inp.jump?-720:-480;p.holdJ=inp.jump?1:0;p.pound=0;p.squash=0.5}
function hitEnemy(e,how){e.dead=1;e.dying=1.2;e.vy=-520;e.vx=sgn(e.x-G.p.x)*220;const pts=EDEF[e.k].pts*(G.combo>0?2:1);G.combo=1.2;addScore(pts,e.x,e.y-e.h);AU.fx('kill');hitstop(0.04);
 stars(e.x,e.y-e.h/2,8);ring(e.x,e.y-e.h/2,'rgba(255,255,255,.8)',36,0.25,4);const words={ram:p_mode()==='swim'?'DASH!':'RAM!',stomp:'STOMP!',kick:'KICK!',punch:'POW!',bonk:'BONK!',pound:'POUND!',yum:'YUM!',dive:'SPLASH!'};ftxt(e.x,e.y-e.h-22,words[how]||'POW!','#ffe060');shake(3)}
function poundWave(p){for(const e of G.ents){if(e.dead||e.k==='food')continue;if(Math.abs(e.x-p.x)<120&&Math.abs(e.y-p.y)<50)hitEnemy(e,'pound')}if(G.boss)bossPound(p)}
function updShots(dt){const p=G.p;for(const s of G.shots){s.t=(s.t||0)+dt;
  if(s.k==='wave'){s.x+=s.vx*dt;s.l-=dt;if(s.l<=0)s.dead=1;const tx=Math.floor((s.x+sgn(s.vx)*14)/TS),ty=Math.floor((s.y+4)/TS);if(!solidK(tileAt(tx,ty))&&tileAt(tx,ty)!==2)s.dead=1;
   if(!p.dead&&Math.abs(p.x-s.x)<22+p.w/2&&p.y>s.y-30&&p.y<=s.y+4&&!p.swing)hurtPlayer(p,s.x);if(Math.random()<0.5)dust(s.x,s.y,1,'rgba(255,220,160,.8)');continue}
  if(s.g)s.vy+=GRAV*0.5*dt*(s.k==='feather'?0:1);s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot=(s.rot||0)+dt*(s.k==='bone'?12:6);
  if(s.y>LVH+60||s.t>6)s.dead=1;const tx=Math.floor(s.x/TS),ty=Math.floor(s.y/TS);if(solidK(tileAt(tx,ty))&&s.k!=='feather'){s.dead=1;burst(s.x,s.y,6,s.k==='bone'?['#f4e0c8','#c8a080']:['#3a2050','#6a3a8a'],140,0.4,3);continue}
  if(s.k!=='feather'&&waterK(tileAt(tx,ty))){s.dead=1;splash(s.x,s.y);continue}
  if(p.dead)continue;
  if(p.ram>0||p.atk>0&&p.mode==='ride'){const rb=p.ram>0?ramBox(p):attackBox(p);if(ovr(rb,{x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2})){s.dead=1;stars(s.x,s.y,5);addScore(30,s.x,s.y);AU.fx('bonk');continue}}
  if(ovr(bx(p),{x:s.x-s.r*0.8,y:s.y-s.r*0.8,w:s.r*1.6,h:s.r*1.6})){s.dead=1;hurtPlayer(p,s.x)}}
 G.shots=G.shots.filter(s=>!s.dead)}
function updItems(dt){const p=G.p;if(p.dead)return;const pb=bx(p);const pad=p.mode==='ride'?10:4;const big={x:pb.x-pad,y:pb.y-pad,w:pb.w+pad*2,h:pb.h+pad*2};
 for(const g of G.L.gems){if(g.got)continue;if(Math.abs(g.x-p.x)>90)continue;if(ovr(big,{x:g.x-12,y:g.y-12,w:24,h:24})){g.got=1;addGem(g.x,g.y)}}
 for(const s of G.L.stars){if(s.got)continue;if(ovr(big,{x:s.x-16,y:s.y-16,w:32,h:32}))getStar(s)}
 for(const cp of G.L.cps){if(!cp.on&&p.x>cp.x-10){cp.on=true;G.cp=cp;AU.fx('cp');ftxt(cp.x,cp.y-110,'CHECKPOINT!','#7aff7a',1);burst(cp.x,cp.y-90,12,['#ff5050','#ffe060','#fff'],200,0.6,3)}}
 G.sign=null;for(const s of G.L.signs){if(Math.abs(p.x-s.x)<120){G.sign=s;s.seen=1}}
 if(G.L.goal&&!G.won&&p.x>G.L.goal.x-20)levelClear();
 if(G.L.cage&&!G.L.cage.open){const cg=G.L.cage,cb={x:cg.x-50,y:cg.y-100,w:100,h:100};if(p.atk>0&&!p.atkHit.has(cg)&&ovr(attackBox(p),cb)){p.atkHit.add(cg);cg.hp--;cg.sh=0.3;AU.fx('crack');shake(5);burst(cg.x,cg.y-50,10,['#c8a060','#8a6a30'],220,0.6,4,1200);if(cg.hp<=0)openCage()}
  if(p.x>cb.x-p.w/2+6){p.x=cb.x-p.w/2+6;p.vx=Math.min(0,p.vx)}}}


/* ===== bosses ===== */
/* AI keys kept from the engine: tusk = Larry the Lobster (charger), croc = Big Bubba the Pufferfish (pool diver), vex = Queen Wobbles (floater), cak = Captain Crab (final) */
const BSZ={tusk:{w:110,h:140,sc:1},croc:{w:110,h:130,sc:1},bab:{w:90,h:110,sc:1},vex:{w:90,h:110,sc:1},cak:{w:110,h:160,sc:1}};
function startBoss(){const A=G.L.boss,D=BOSSES[A.i],z=BSZ[D.k];G.arena={x0:A.x0,x1:A.x1};
 const b=G.boss={i:A.i,k:D.k,name:D.name,hp:D.hp,max:D.hp,x:A.x1-160,y:A.y,vx:0,vy:0,w:z.w,h:z.h,face:-1,st:'intro',t:0,inv:0,flash:0,ph:1,n:0,gy:A.y,onG:true};
 if(b.k==='vex'){b.y=A.y-200;b.onG=false}if(b.k==='bab'){b.perch=1;b.x=A.x0+21.5*TS;b.y=A.y-4*TS}
 AU.music('boss');AU.fx(b.k==='cak'?'laugh':'roar');G.bossIntro=2.2;shake(6)}
function bossOpen(b){return b.st==='dizzy'}
function damageBoss(b,n,how){if(b.inv>0||b.st==='intro'||b.st==='dead'||b.st==='dive'&&b.k==='croc'&&b.sub)return false;const dz=bossOpen(b);const dmg=dz?n+1:n;b.hp-=dmg;b.inv=0.7;b.flash=0.2;AU.fx('hit');shake(9);hitstop(0.08);
 stars(b.x,b.y-b.h*0.7,12);ftxt(b.x,b.y-b.h-24,dz?'CRITICAL!':(how==='stomp'?'STOMP!':'HIT!'),dz?'#ff9a40':'#ffe060',1);addScore(dz?500:250,b.x,b.y-b.h);
 if(b.k==='cak'&&b.ph===1&&b.hp<=b.max/2){b.ph=2;b.st='rage';b.t=0;AU.fx('roar');flash('#ff4020',0.4);ftxt(b.x,b.y-b.h-50,'CAPTAIN CRAB IS STEAMING MAD!','#ff6040',1)}
 if(b.hp<=0){b.hp=0;b.st='dead';b.t=0;G.shots.length=0;for(const e of G.ents)if(!e.dead&&e.k!=='food')hitEnemy(e,'pound');AU.fx('roar');shake(16);flash('#fff',0.7);G.slow=1.2}
 else if(!dz&&(b.k==='tusk'||b.k==='cak')&&how!=='stomp'){/* knock back a bit */b.x+=sgn(b.x-G.p.x)*30}
 return true}
function bossPound(p){const b=G.boss;if(!b)return;if(Math.abs(b.x-p.x)<130&&Math.abs(b.y-p.y)<60&&b.st==='dizzy')damageBoss(b,1,'pound')}
function wave(x,y,dir,spd=330){G.shots.push({k:'wave',x,y,vx:dir*spd,l:2.6,r:16})}
function lob(k,x,y,tx,ty,T,r=14){G.shots.push({k,x,y,vx:(tx-x)/T,vy:-(GRAV*0.5*T)+(ty-y)/T,r,g:1})}
function bossGround(b,dt){b.vy+=GRAV*dt;b.y+=b.vy*dt;if(b.y>=b.gy){if(b.vy>300){shake(8);dust(b.x,b.y,10)}b.y=b.gy;const land=b.vy>300;b.vy=0;b.onG=true;return land}b.onG=false;return false}
function updBoss(dt){const b=G.boss,p=G.p,A=G.arena;if(!b)return;b.t+=dt;b.inv=Math.max(0,b.inv-dt);b.flash=Math.max(0,b.flash-dt);const ph2=b.hp<=b.max/2;const dirP=sgn(p.x-b.x);
 if(b.st==='intro'){if(b.k!=='vex'&&b.k!=='bab')bossGround(b,dt);if(b.t>1.6){b.st='idle';b.t=0}return}
 if(b.st==='dead'){b.vy+=GRAV*0.4*dt;if(b.k==='vex'){b.y=Math.min(b.gy,b.y+200*dt)}else bossGround(b,dt);if(b.t>0.3&&Math.random()<0.3)stars(b.x+rand(-40,40),b.y-rand(20,b.h),3);if(b.t>2.2&&!G.won)bossBeaten();return}
 if(b.st==='dizzy'){if(b.k==='vex'){b.y=Math.min(b.gy,b.y+400*dt)}else bossGround(b,dt);if(b.t>(b.dz||1.6)){b.st=b.k==='vex'?'rise':(b.k==='bab'?'climb':'idle');b.t=0;b.n=0}}
 else if(b.k==='tusk'){
  if(b.st==='idle'){bossGround(b,dt);b.face=dirP;if(b.t>(ph2?0.7:1.1)){b.n++;if(b.n%3===0){b.st='hop';b.t=0;b.vy=-780;AU.fx('roar')}else{b.st='wind';b.t=0}}}
  else if(b.st==='wind'){b.x+=Math.sin(b.t*60)*1.5;if(b.t>0.45){b.st='charge';b.t=0;b.vx=b.face*(ph2?520:430);AU.fx('ram')}}
  else if(b.st==='charge'){bossGround(b,dt);b.x+=b.vx*dt;if(Math.random()<0.5)dust(b.x-b.face*40,b.y,1);if(b.x<A.x0+b.w/2||b.x>A.x1-b.w/2){b.x=clamp(b.x,A.x0+b.w/2,A.x1-b.w/2);b.st='dizzy';b.t=0;b.dz=ph2?1.4:1.8;shake(12);AU.fx('crack');stars(b.x+b.face*40,b.y-b.h*0.8,10)}}
  else if(b.st==='hop'){const land=bossGround(b,dt);if(land){wave(b.x-40,b.y,-1);wave(b.x+40,b.y,1);if(ph2){b.st='hop2';b.t=0;b.vy=-600}else{b.st='idle';b.t=0}AU.fx('pound')}}
  else if(b.st==='hop2'){const land=bossGround(b,dt);if(land){wave(b.x-40,b.y,-1,420);wave(b.x+40,b.y,1,420);b.st='idle';b.t=0;AU.fx('pound')}}}
 else if(b.k==='croc'){const pool={x0:A.x0+10*TS,x1:A.x0+17*TS};
  if(b.st==='idle'){bossGround(b,dt);b.face=dirP;b.x+=b.face*70*dt;if(b.x>pool.x0-50&&b.x<pool.x1+50)b.x-=b.face*140*dt;
   if(Math.abs(p.x-b.x)<170&&b.t>0.5){b.st='bite';b.t=0;AU.fx('roar')}else if(b.t>2.4){b.st='dive';b.t=0;b.sub=0;b.tx=(pool.x0+pool.x1)/2}}
  else if(b.st==='bite'){if(b.t<0.35){b.x-=b.face*30*dt}else if(b.t<0.7){b.x+=b.face*520*dt}else{b.st='idle';b.t=0;b.n++;if(b.n%2===0){b.st='dizzy';b.t=0;b.dz=1.2}}
   if((b.x<pool.x1&&b.x>pool.x0)){b.x=b.face>0?pool.x0-1:pool.x1+1}b.x=clamp(b.x,A.x0+50,A.x1-50)}
  else if(b.st==='dive'){if(!b.sub){const d=b.tx-b.x;b.face=sgn(d);b.x+=sgn(d)*Math.min(Math.abs(d),300*dt);b.y=b.gy-Math.abs(Math.sin(b.t*8))*10;if(Math.abs(d)<4){b.sub=1;b.t=0;splash(b.x,b.gy+20);AU.fx('splash')}}
   else{b.y=b.gy+90;b.x=b.tx+Math.sin(b.t*3)*60;if(b.t>1.3){b.st='leap';b.t=0;b.sub=0;const T=1.0;b.vx=(clamp(p.x,A.x0+60,A.x1-60)-b.x)/T;b.vy=-GRAV*0.5*T-90/T;b.y=b.gy+20;splash(b.x,b.gy+20);AU.fx('splash');b.face=sgn(b.vx)}}}
  else if(b.st==='leap'){b.x+=b.vx*dt;b.vy+=GRAV*dt;b.y+=b.vy*dt;const inPool=b.x>pool.x0&&b.x<pool.x1;if(b.vy>0&&b.y>=b.gy&&!inPool){b.y=b.gy;b.vy=0;shake(10);wave(b.x-40,b.y,-1);wave(b.x+40,b.y,1);b.st='dizzy';b.t=0;b.dz=ph2?1.3:1.7;AU.fx('pound')}
   else if(b.vy>0&&b.y>b.gy+30&&inPool){b.st='dive';b.sub=1;b.t=0.4;b.tx=b.x;splash(b.x,b.gy+20)}}}
 else if(b.k==='bab'){const perchX=[A.x0+4.5*TS,A.x0+21.5*TS],perchY=b.gy-4*TS;
  if(b.st==='idle'){if(b.perch){b.y=perchY;b.face=dirP;if(b.t>0.6){b.st='throw';b.t=0;b.n=0}}else{bossGround(b,dt);if(b.t>0.4){b.st='climb';b.t=0}}}
  else if(b.st==='throw'){b.face=dirP;if(b.t>(ph2?0.55:0.8)){b.t=0;b.n++;b.thr=0.3;const T=0.95;lob('coconut',b.x+b.face*30,b.y-110,p.x+p.vx*0.4,p.y-20,T,16);if(ph2){lob('coconut',b.x+b.face*30,b.y-110,p.x-90,p.y-20,T,16);lob('coconut',b.x+b.face*30,b.y-110,p.x+90,p.y-20,T,16)}AU.fx('throw');
    if(b.n>=(ph2?4:3)){b.st='leapdown';b.t=0;b.perch=0;const T2=0.8;b.vx=(clamp(p.x,A.x0+80,A.x1-80)-b.x)/T2;b.vy=-400;AU.fx('roar')}}b.thr=Math.max(0,(b.thr||0)-dt)}
  else if(b.st==='leapdown'){b.x+=b.vx*dt;const land=bossGround(b,dt);if(land){wave(b.x-40,b.y,-1);wave(b.x+40,b.y,1);b.st='dizzy';b.t=0;b.dz=ph2?1.5:1.9;AU.fx('pound')}}
  else if(b.st==='climb'){if(!b.cl){b.cl=1;b.tp=Math.abs(b.x-perchX[0])>Math.abs(b.x-perchX[1])?0:1;b.tp=1-b.tp;const tx=perchX[b.tp],T=0.9;b.vx=(tx-b.x)/T;b.vy=-(GRAV*0.5*T)+(perchY-b.y)/T;b.face=sgn(b.vx)}
   b.x+=b.vx*dt;b.vy+=GRAV*dt;b.y+=b.vy*dt;if(b.vy>0&&b.y>=perchY){b.y=perchY;b.vy=0;b.perch=1;b.cl=0;b.st='idle';b.t=0;b.x=perchX[b.tp]}}}
 else if(b.k==='vex'){const hy=b.gy-210;
  if(b.st==='idle'||b.st==='rise'){if(b.st==='rise'){b.y-=260*dt;if(b.y<=hy){b.y=hy;b.st='idle';b.t=0}}else{b.y=hy+Math.sin(b.t*2)*16}
   b.x+=Math.cos(b.t*0.8)*160*dt;b.x=clamp(b.x,A.x0+80,A.x1-80);b.face=dirP;
   if(b.st==='idle'){b.cd=(b.cd||1.2)-dt;if(b.cd<=0){b.cd=ph2?1.0:1.4;b.n++;for(let i=-1;i<=1;i++){const a=Math.atan2(p.y-40-b.y,p.x-b.x)+i*0.28;G.shots.push({k:'feather',x:b.x,y:b.y-60,vx:Math.cos(a)*280,vy:Math.sin(a)*280,r:11,g:0,rot:a})}AU.fx('throw');
    if(b.n>=(ph2?2:3)){b.st='tele';b.t=0;b.n=0;AU.fx('roar')}}}}
  else if(b.st==='tele'){b.y-=30*dt;b.face=dirP;if(b.t>0.6){b.st='dive';b.t=0;b.tx=p.x;b.ty=b.gy;const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);b.vx=dx/d*640;b.vy=dy/d*640}}
  else if(b.st==='dive'){b.x+=b.vx*dt;b.y+=b.vy*dt;b.x=clamp(b.x,A.x0+60,A.x1-60);if(b.y>=b.gy){b.y=b.gy;shake(12);dust(b.x,b.y,14,'rgba(255,255,255,.9)');wave(b.x-40,b.y,-1,300);wave(b.x+40,b.y,1,300);b.st='dizzy';b.t=0;b.dz=ph2?1.6:2.0;AU.fx('pound')}}}
 else if(b.k==='cak'){
  if(b.st==='rage'){bossGround(b,dt);b.x+=Math.sin(b.t*50)*2;if(b.t>1.2){b.st='idle';b.t=0}}
  else if(b.st==='idle'){bossGround(b,dt);b.face=dirP;if(b.t>(ph2?0.5:0.8)){b.n++;const m=b.n%4;b.st=m===1?'throw':m===2?'leap':m===3?(G.ents.filter(e=>!e.dead&&e.k==='crab').length<3?'summon':'throw'):'leap';b.t=0;b.c=0}}
  else if(b.st==='throw'){bossGround(b,dt);b.face=dirP;if(b.t>0.35){b.t=0;b.c++;b.thr=0.3;const sp=ph2?[-120,0,120]:[0];for(const o of sp)lob('conch',b.x+b.face*30,b.y-120,p.x+o+p.vx*0.3,p.y-20,0.85,14);AU.fx('throw');if(b.c>=(ph2?3:2)){b.st='idle';b.t=0}}b.thr=Math.max(0,(b.thr||0)-dt)}
  else if(b.st==='summon'){bossGround(b,dt);if(b.t>0.6&&!b.sm){b.sm=1;AU.fx('laugh');for(const sx of[A.x0+60,A.x1-60]){G.ents.push({k:'crab',x:sx,y:b.gy-200,w:50,h:36,vx:sgn(p.x-sx)*90,vy:0,face:1,hp:1,t:0,st:'walk',x0:sx,y0:b.gy,cd:1,onG:false})}}if(b.t>1.1){b.sm=0;b.st='idle';b.t=0}}
  else if(b.st==='leap'){if(!b.lp){b.lp=1;const tx=clamp(p.x+(p.x<(A.x0+A.x1)/2?120:-120),A.x0+80,A.x1-80);const T=0.85;b.vx=(tx-b.x)/T;b.vy=-GRAV*0.5*T;AU.fx('laugh')}
   b.x+=b.vx*dt;const land=bossGround(b,dt);if(land&&b.t>0.2){b.lp=0;wave(b.x-40,b.y,-1,ph2?420:340);wave(b.x+40,b.y,1,ph2?420:340);b.st='dizzy';b.t=0;b.dz=ph2?1.1:1.4;AU.fx('pound')}}}
 b.x=clamp(b.x,A.x0+30,A.x1-30);
 /* player vs boss */
 if(p.dead||b.st==='dead'||b.st==='intro')return;const bb={x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h};if(b.k==='croc'&&b.st==='dive'&&b.sub)return;
 const pb=bx(p);
 if(p.ram>0&&ovr(ramBox(p),bb)){if(damageBoss(b,1,'ram')){p.ram=0;p.ramCd=0.3;p.vx=-p.face*260;p.vy=-300}return}
 if(p.atk>0&&!p.atkHit.has(b)&&ovr(attackBox(p),bb)){p.atkHit.add(b);if(bossOpen(b))damageBoss(b,0,'bonk');else{AU.fx('bonk');ftxt(b.x,b.y-b.h-10,'WAIT TILL DIZZY!','#fff')}return}
 if(p.dive>0&&ovr(pb,bb)){if(damageBoss(b,1,'stomp')){p.dive=0;p.vy=-300}return}
 if(ovr(pb,bb)){const fromTop=p.vy>40&&p.y-bb.y<34;if(fromTop){damageBoss(b,1,'stomp');p.vy=-760;p.holdJ=0;p.pound=0;return}
  if(bossOpen(b)){p.x+=sgn(p.x-b.x)*4;return}hurtPlayer(p,b.x)}}
function bossBeaten(){const b=G.boss;save.bosses=save.bosses||{};save.bosses[b.i]=1;persist();if(b.k==='cak'){G.finale=1;const A=G.arena,p=G.p,d=p.x<(A.x0+A.x1)/2?1:-1,px=clamp(p.x+d*140,A.x0+90,A.x1-90),cx=clamp(p.x+d*82,A.x0+40,A.x1-40);p.face=d;G.fin=[{n:'peter',x:px,y:G.L.boss.y+2,fl:d>0,sc:1.05},{n:'present',x:cx,y:G.L.boss.y+2,fl:false,sc:0.9}];AU.fx('free');ftxt(px,G.L.boss.y-200,'THE PRESENT IS BACK!','#7aff7a',1);ftxt(px,G.L.boss.y-170,'HAPPY BIRTHDAY, KELLY!','#ff9ad0',1)}levelClear()}


/* ===== rendering ===== */
let HUDR={x:0,y:0,w:0,h:0},BOSSR=null,TIPR=null;const PAT={};
function pat(n){if(PAT[n])return PAT[n];const im=IMG[n];if(!im)return '#6a4a2a';const p=c.createPattern(im,'repeat');try{p.setTransform(new DOMMatrix().scale(0.5))}catch(e){}return PAT[n]=p}
function hsh(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function camUpdate(dt,snap){const p=G.p,cm=G.cam;let tx=p.x-viewW*0.4+p.vx*0.25,ty=p.y-VV*0.62;
 if(G.arena){const a=G.arena,aw=a.x1-a.x0;tx=aw<=viewW?a.x0+aw/2-viewW/2:clamp(p.x-viewW/2,a.x0,a.x1-viewW)}
 tx=clamp(tx,0,Math.max(0,G.L.W-viewW));const ymax=LVH-VV,ymin=Math.min(0,ymax);ty=clamp(ty,ymin,ymax);
 if(snap){cm.x=tx;cm.y=ty}else{cm.x+=(tx-cm.x)*Math.min(1,dt*6);cm.y+=(ty-cm.y)*Math.min(1,dt*4)}}
/* layered parallax: painted backdrop + procedural mid layer + light rays */
function drawBG(){const Wd=WORLDS[LEVELS[G.li].w],im=IMG[Wd.bg];c.fillStyle=Wd.sky;c.fillRect(0,0,W,gameH);
 if(im){const h=gameH*1.1,w=h*im.width/im.height,off=-((G.cam.x*S*0.12)%(w*2)),y=gameH-h+Math.min(0,(-G.cam.y)*S*0.05);
  for(let i=0,x=off;x<W;i++,x+=w){c.save();if(i%2){c.translate(x+w,y);c.scale(-1,1);c.drawImage(im,0,0,w,h)}else c.drawImage(im,x,y,w,h);c.restore()}}
 midLayer(Wd);c.fillStyle=Wd.fog;c.fillRect(0,0,W,gameH);
 if(Wd.cap==='coral'||Wd.cap==='reef'||Wd.cap==='sand'){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const bx0=((i*360-G.cam.x*S*0.3)%(W+400)+W+400)%(W+400)-200,a=0.05+0.03*Math.sin(G.t*0.7+i*2);
  const g=c.createLinearGradient(bx0,0,bx0+200,gameH);g.addColorStop(0,'rgba(255,250,210,'+a+')');g.addColorStop(1,'rgba(255,250,210,0)');c.fillStyle=g;c.beginPath();c.moveTo(bx0,0);c.lineTo(bx0+70,0);c.lineTo(bx0+260,gameH);c.lineTo(bx0+120,gameH);c.fill()}c.restore()}}
function midLayer(Wd){const k=S*0.45,ox=G.cam.x*k,base=gameH*0.98-Math.max(0,(G.cam.y)*S*0.08);c.save();
 const step=150*S,first=Math.floor(ox/step)-1,last=first+Math.ceil(W/step)+3;
 for(let i=first;i<=last;i++){const x=i*step-ox,r=hsh(i,77),r2=hsh(i,31);
  if(Wd.cap==='sand'){/* palms & dunes */c.fillStyle='rgba(60,110,90,.55)';c.beginPath();c.ellipse(x,base,step*0.8,40*S*(0.6+r),0,Math.PI,TAU);c.fill();
   if(r<0.45){const th=(120+r2*80)*S;c.strokeStyle='rgba(70,60,40,.75)';c.lineWidth=7*S;c.beginPath();c.moveTo(x,base-10*S);c.quadraticCurveTo(x+20*S,base-th*0.5,x+(r2-0.5)*40*S,base-th);c.stroke();
    c.fillStyle='rgba(40,110,60,.8)';for(let q=0;q<6;q++){const a=q/6*TAU+Math.sin(G.t*1.3+i)*0.08;c.save();c.translate(x+(r2-0.5)*40*S,base-th);c.rotate(a);c.beginPath();c.ellipse(26*S,6*S,30*S,7*S,0.35,0,TAU);c.fill();c.restore()}}}
  else if(Wd.cap==='moss'){c.fillStyle='rgba(70,60,70,.55)';c.beginPath();c.moveTo(x-step*0.7,base);c.quadraticCurveTo(x-step*0.3,base-(60+r*90)*S,x,base-(40+r*110)*S);c.quadraticCurveTo(x+step*0.4,base-(30+r2*60)*S,x+step*0.7,base);c.fill();
   if(r>0.82){c.fillStyle='rgba(255,255,255,.75)';c.fillRect(x-6*S,base-(150+r2*40)*S,12*S,(150+r2*40)*S);c.fillStyle='rgba(220,60,60,.75)';for(let q=0;q<3;q++)c.fillRect(x-6*S,base-(140-q*40)*S-r2*40*S,12*S,12*S)}}
  else if(Wd.cap==='coral'){c.fillStyle='rgba(40,20,70,.55)';const sh=(60+r*120)*S;c.beginPath();c.moveTo(x-22*S,0);c.lineTo(x,sh);c.lineTo(x+22*S,0);c.fill();
   c.beginPath();c.moveTo(x+step*0.3-30*S,base);c.lineTo(x+step*0.3,base-(50+r2*70)*S);c.lineTo(x+step*0.3+30*S,base);c.fill();
   if(r2<0.35){c.fillStyle='rgba(120,255,230,'+(0.25+0.2*Math.sin(G.t*2+i))+')';c.beginPath();c.arc(x+10*S,sh*0.7,5*S,0,TAU);c.fill()}}
  else{c.fillStyle='rgba(60,30,50,.6)';const hh=(70+r*130)*S;c.beginPath();c.moveTo(x-step*0.35,base);c.lineTo(x-step*0.2,base-hh);c.lineTo(x+step*0.15,base-hh*0.9);c.lineTo(x+step*0.35,base);c.fill();
   if(r2>0.8){c.strokeStyle='rgba(60,30,40,.7)';c.lineWidth=4*S;c.beginPath();c.moveTo(x,base-hh);c.lineTo(x+10*S,base-hh-90*S);c.stroke();c.lineWidth=2*S;c.beginPath();c.moveTo(x+10*S,base-hh-90*S);c.lineTo(x+60*S,base-hh-40*S);c.stroke()}}}
 c.restore()}
/* underwater backdrop clipped to each sea (screen space, parallax) */
function drawSeaBack(){const Wd=WORLDS[LEVELS[G.li].w],im=IMG[Wd.uw];const cm=G.cam;
 for(const sea of G.L.seas){if(sea.x1<cm.x-50||sea.x0>cm.x+viewW+50)continue;const sx=(sea.x0-cm.x)*S,sy=(sea.top-cm.y)*S,sw=(sea.x1-sea.x0)*S,sh=(sea.bed-sea.top+TS)*S;
  c.save();c.beginPath();c.rect(sx,sy,sw,sh);c.clip();const g=c.createLinearGradient(0,sy,0,sy+sh);g.addColorStop(0,'#3aa8d8');g.addColorStop(1,'#0a2a5a');c.fillStyle=g;c.fillRect(sx,sy,sw,sh);
  if(im){const h=Math.max(sh,gameH*0.6)*1.05,w=h*im.width/im.height,off=-((cm.x*S*0.35)%(w*2));for(let i=0,x=off;x<W;i++,x+=w){c.save();if(i%2){c.translate(x+w,sy);c.scale(-1,1);c.drawImage(im,0,0,w,h)}else c.drawImage(im,x,sy,w,h);c.restore()}}
  c.restore()}}
/* translucent water over everything that is under the surface */
function drawSeaFront(){const cm=G.cam;
 for(const sea of G.L.seas){if(sea.x1<cm.x-50||sea.x0>cm.x+viewW+50)continue;const x0=Math.max(sea.x0,cm.x-20),x1=Math.min(sea.x1,cm.x+viewW+20),top=sea.top+6,bot=sea.bed+TS*2;
  const g=c.createLinearGradient(0,top,0,bot);g.addColorStop(0,'rgba(60,190,240,.22)');g.addColorStop(1,'rgba(8,40,110,.42)');c.fillStyle=g;c.fillRect(x0,top,x1-x0,bot-top);
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(180,240,255,.07)';c.lineWidth=5;for(let k=0;k<5;k++){c.beginPath();for(let x=x0;x<=x1;x+=24){const yy=top+30+k*45+Math.sin(x*0.02+G.t*1.6+k)*10+Math.sin(x*0.007-G.t+k*3)*8;x===x0?c.moveTo(x,yy):c.lineTo(x,yy)}c.stroke()}c.restore();
  c.fillStyle='rgba(235,250,255,.85)';c.beginPath();c.moveTo(x0,top+3);for(let x=x0;x<=x1;x+=8)c.lineTo(x,top+Math.sin(x*0.05+G.t*3)*2.5+Math.sin(x*0.013-G.t*1.7)*2);c.lineTo(x1,top+6);c.lineTo(x0,top+6);c.fill();
  c.fillStyle='rgba(255,255,255,.55)';for(let x=Math.floor(x0/30)*30;x<x1;x+=30){const ph=Math.sin(G.t*2+x);if(ph>0.3)c.fillRect(x+Math.sin(G.t+x)*6,top-1+Math.sin(x*0.05+G.t*3)*2.5,10*ph,2)}
  if(Math.random()<0.25){const bx0=rand(x0,x1);P({x:bx0,y:sea.bed+rand(-10,10),vx:rand(-10,10),vy:-rand(40,90),l:rand(1.5,3),m:3,s:rand(2,5),c:'b',bub:1,g:-30,top:sea.top})}}}
function capDeco(Wd,tx,X,Y){const cap=Wd.cap;
 if(cap==='sand'){c.fillStyle='rgba(255,250,220,.55)';c.fillRect(X,Y,TS+0.6,3);if(hsh(tx,3)<0.18){c.fillStyle=['#ffd0e0','#fff4e0','#f0b090'][(hsh(tx,4)*3)|0];c.beginPath();c.ellipse(X+hsh(tx,5)*TS,Y+5,4,3,0,0,TAU);c.fill()}
  if(hsh(tx,9)<0.1){c.strokeStyle='#5a9a3a';c.lineWidth=2;for(let q=0;q<3;q++){c.beginPath();c.moveTo(X+20+q*3,Y);c.quadraticCurveTo(X+16+q*6+Math.sin(G.t*2+q)*2,Y-10,X+12+q*8,Y-16-q*2);c.stroke()}}}
 else if(cap==='moss'){for(let i=0;i<4;i++){c.fillStyle=i%2?Wd.top:Wd.top2;c.beginPath();c.ellipse(X+5+i*10,Y+1,7,5+hsh(tx,i)*3,0,Math.PI,TAU);c.fill()}
  if(hsh(tx,8)<0.12){c.fillStyle='#ff7a4a';c.beginPath();for(let q=0;q<5;q++){const a=q/5*TAU-G.t*0.3;c.lineTo(X+20+Math.cos(a)*7,Y-4+Math.sin(a)*7);c.lineTo(X+20+Math.cos(a+0.6)*3,Y-4+Math.sin(a+0.6)*3)}c.fill()}}
 else if(cap==='coral'||cap==='reef'){const cols=cap==='coral'?['#ff7ab0','#ffb050','#c070ff']:['#ff8a5a','#5ad0c0','#ffd060'];
  if(hsh(tx,2)<0.3){const col=cols[(hsh(tx,6)*3)|0],bx0=X+hsh(tx,7)*TS;c.strokeStyle=col;c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(bx0,Y);c.lineTo(bx0+Math.sin(G.t*1.5+tx)*2,Y-14);c.moveTo(bx0,Y-6);c.lineTo(bx0+7,Y-14);c.moveTo(bx0,Y-8);c.lineTo(bx0-7,Y-17);c.stroke()}
  else if(hsh(tx,2)<0.42){c.fillStyle=cols[(hsh(tx,6)*3)|0];for(let q=0;q<6;q++){const a=-Math.PI*(0.15+q*0.14);c.save();c.translate(X+20,Y);c.rotate(a+Math.PI/2+Math.sin(G.t*2+q)*0.15);c.fillRect(-1.5,-14,3,14);c.restore()}}}}
function drawTiles(){const Wd=WORLDS[LEVELS[G.li].w],T=G.L.T,x0=Math.max(0,Math.floor(G.cam.x/TS)-1),x1=Math.min(G.L.cols-1,Math.ceil((G.cam.x+viewW)/TS)+1);
 const P2=pat(Wd.ter);
 for(let tx=x0;tx<=x1;tx++){const col=T[tx];let y=0;while(y<ROWS){if(col[y]===1){let e=y;while(e<ROWS&&col[e]===1)e++;c.fillStyle=P2;c.fillRect(tx*TS,y*TS,TS+0.6,(e-y)*TS+(e>=ROWS?80:0));
   c.fillStyle='rgba(0,0,0,.28)';if(tx>0&&T[tx-1]&&!solidK(T[tx-1][y]))c.fillRect(tx*TS,y*TS,4,(e-y)*TS+80);if(tx<G.L.cols-1&&!solidK(T[tx+1][y]))c.fillRect(tx*TS+TS-4,y*TS,4,(e-y)*TS+80);y=e}else y++}}
 for(let tx=x0;tx<=x1;tx++){const col=T[tx];for(let ty=0;ty<ROWS;ty++){const k=col[ty],X=tx*TS,Y=ty*TS;
  if(k===1&&(ty===0||!solidK(col[ty-1]))){c.fillStyle=Wd.top2;c.fillRect(X,Y,TS+0.6,12);c.fillStyle=Wd.top;c.fillRect(X,Y-2,TS+0.6,8);capDeco(Wd,tx,X,Y)}
  else if(k===2){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+2,Y+12,TS-4,6);c.fillStyle=Wd.plank;c.beginPath();c.roundRect?c.roundRect(X,Y,TS+0.5,14,4):c.rect(X,Y,TS,14);c.fill();c.fillStyle='rgba(255,255,255,.22)';c.fillRect(X+3,Y+2,TS-6,3);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(X+TS-2,Y+2,2,10)}
  else if(k===3){const g=c.createLinearGradient(0,Y,0,Y+TS);g.addColorStop(0,'#ffa0c0');g.addColorStop(1,'#d0608a');c.fillStyle=g;c.fillRect(X,Y,TS,TS);c.fillStyle='rgba(255,255,255,.35)';for(let q=0;q<5;q++){c.beginPath();c.arc(X+6+hsh(tx*7+q,ty)*28,Y+6+hsh(q,tx+ty)*28,2.2,0,TAU);c.fill()}
   c.strokeStyle='rgba(90,10,40,.75)';c.lineWidth=1.8;c.beginPath();c.moveTo(X+8,Y+5);c.lineTo(X+18,Y+18);c.lineTo(X+13,Y+32);c.moveTo(X+18,Y+18);c.lineTo(X+32,Y+22);c.stroke();c.strokeStyle='rgba(0,0,0,.3)';c.strokeRect(X+0.5,Y+0.5,TS-1,TS-1)}
  else if(k===4){if(IMG.rock)c.drawImage(IMG.rock,X-1,Y-1,TS+2,TS+2);else{c.fillStyle='#999';c.fillRect(X,Y,TS,TS)}}
  else if(k===5){/* sea urchins */for(let i=0;i<2;i++){const ux=X+10+i*20,uy=Y+TS-11-hsh(tx,i)*3;c.strokeStyle='#2a0a3a';c.lineWidth=2;c.beginPath();for(let q=0;q<14;q++){const a=q/14*TAU+Math.sin(G.t*2+i+tx)*0.06;c.moveTo(ux+Math.cos(a)*6,uy+Math.sin(a)*6);c.lineTo(ux+Math.cos(a)*15,uy+Math.sin(a)*15)}c.stroke();
    const g=c.createRadialGradient(ux-3,uy-3,1,ux,uy,10);g.addColorStop(0,'#b070e0');g.addColorStop(1,'#3a0a5a');c.fillStyle=g;c.beginPath();c.arc(ux,uy,9,0,TAU);c.fill()}}}}}
function drawPools(){const T=G.L.T,x0=Math.max(0,Math.floor(G.cam.x/TS)-1),x1=Math.min(G.L.cols-1,Math.ceil((G.cam.x+viewW)/TS)+1);
 for(let tx=x0;tx<=x1;tx++){const col=T[tx];for(let ty=0;ty<ROWS;ty++){if(col[ty]!==6||(ty>0&&col[ty-1]===6))continue;const X=tx*TS,Y=ty*TS+8;let e=ty;while(e<ROWS&&col[e]===6)e++;const bot=e*TS;
  const g=c.createLinearGradient(0,Y,0,bot);g.addColorStop(0,'rgba(90,200,235,.62)');g.addColorStop(1,'rgba(20,80,140,.78)');c.fillStyle=g;c.fillRect(X,Y,TS+0.6,bot-Y);
  c.fillStyle='rgba(240,252,255,.85)';for(let i=0;i<4;i++){const wx=X+i*10+Math.sin(G.t*3+tx+i)*2;c.fillRect(wx,Y-1+Math.sin(G.t*4+i+tx)*1.5,6,2)}
  if(hsh(tx,(G.t*2)|0)<0.02)P({x:X+rand(4,36),y:Y,vx:0,vy:0,l:0.6,m:0.6,s:10,ring:1,w:2,c:'rgba(230,250,255,.7)',g:0})}}}
function drawEnt(e){const fl=e.face>0;if(e.dead&&!e.dying)return;c.save();if(e.dying){c.translate(e.x,e.y-e.h/2);c.rotate(e.rot||0);c.translate(-e.x,-(e.y-e.h/2));c.globalAlpha=clamp(e.dying,0,1)}
 if(e.k==='food'){const n=e.f==='mango'||e.f==='melon'?'melon':'leaves';if(n==='leaves')warpH('leaves',e.x,e.y+18,1,false,5,0.12,G.t*3+e.t,0,1);else spr(n,e.x,e.y+18+Math.sin(e.t*2)*3,1);if(G.p.mode!=='kelly'&&Math.hypot(e.x-G.p.x,e.y-G.p.y)<200){c.globalAlpha=0.5+0.5*Math.sin(G.t*6);c.strokeStyle='#fff6a0';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y-6,26,0,TAU);c.stroke()}}
 else if(e.k==='crab'||e.k==='scrab'){const sc=e.k==='crab'?0.92:0.6;if(!drawCrabRig(e,e.x,e.y+2,sc))spr('crab_body',e.x,e.y+2,sc)}
 else if(e.k==='hermit'){const st=Math.sin(e.t*9);spr('hermit',e.x,e.y+2-Math.abs(st)*2,1,fl,1,st*0.05);c.fillStyle='#c0402a';for(let q=0;q<3;q++){const lx=e.x+(fl?1:-1)*(-12+q*7),ph=e.t*9+q*2;c.fillRect(lx+Math.sin(ph)*3,e.y-4-Math.max(0,Math.cos(ph))*3,3,6)}}
 else if(e.k==='gull'){const fr=Math.floor(e.t*7)%2,fy=1+(e.st==='dive'?-0.25:Math.sin(e.t*14)*0.18);c.save();c.translate(e.x,e.y+10-20);c.scale(1,fy);spr(fr?'gull1':'gull2',0,20,0.95,fl,1,e.st==='dive'?(fl?0.5:-0.5):0);c.restore()}
 else if(e.k==='octo'){c.save();c.translate(e.x,e.y+2);const sq=e.thr>0?0.88:1+Math.sin(e.t*4)*0.03;c.scale(1/sq,sq);warpH('octo',0,0,1,fl,6,0.16,e.t*5,0.5);c.restore()}
 else if(e.k==='jelly'){c.save();c.translate(e.x,e.y+4);const pu=Math.sin(e.t*4);c.scale(1+pu*0.06,1-pu*0.06);c.globalAlpha*=0.92;warpH('jelly',0,0,1,false,5,0.2,e.t*6,0.45);c.restore();
  c.save();c.globalCompositeOperation='lighter';c.fillStyle='rgba(160,200,255,.12)';c.beginPath();c.arc(e.x,e.y-26,26,0,TAU);c.fill();c.restore()}
 else if(e.k==='puffer'){const big=e.puff>0.5,sc=big?0.9+e.puff*0.25:1;spr(big?'puffer_big':'puffer',e.x,e.y+4+Math.sin(e.t*3)*2,sc,fl,1,Math.sin(e.t*8)*0.05)}
 else if(e.k==='eel')warpV('eel',e.x,e.y+4,1.05,fl,7,0.09,e.t*7);
 else if(e.k==='shrimp'){spr('shrimp',e.x,e.y+4,1,fl,1,Math.sin(e.t*12)*0.12)}
 c.restore();if(e.stun>0&&!e.dying)dizzyStars(e.x,e.y-e.h-6,18)}
function dizzyStars(x,y,r){for(let i=0;i<3;i++){const a=G.t*5+i*TAU/3;spr('star',x+Math.cos(a)*r,y+Math.sin(a)*r*0.35+6,0.45)}}
function drawPlayer(p){if(p.inv>0&&Math.floor(p.inv*14)%2&&!p.dead)return;let n,rot=0;const ride=p.mode==='ride';
 if(p.mode==='swim'){drawSwimmer(p);if(p.ram>0){c.globalAlpha=0.35;drawPipRig(p.x-p.face*26,p.y+4,1,p.face<0,p._sph,1,true,0,p);c.globalAlpha=1}if(p.tng>0&&p.tngT){const hp=headPt(p),o=p.tngT.o,k=1-Math.abs(p.tng-0.15)/0.15,tx=lerp(hp.x,o.x,k),ty=lerp(hp.y+14,o.y,k);c.strokeStyle='#e8507a';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(hp.x,hp.y+14);c.lineTo(tx,ty);c.stroke();c.fillStyle='#ff7aa0';c.beginPath();c.arc(tx,ty,6,0,TAU);c.fill()}return}
 if(ride){if(p.ledge){n='ride_jump';rot=-p.face*0.35}else if(p.tng>0)n='ride_tongue';else if(p.ram>0||p.swing||p.pound)n='ride_ram';else if(!p.onG)n='ride_jump';else if(Math.abs(p.vx)>30)n=Math.floor(p.anim*9)%2?'ride_run1':'ride_run2';else n='ride_idle';
  if(p.swing)rot=-p.swing.a*0.6+(p.face>0?-0.5:0.5);if(p.pound)rot=p.face*0.9;if(p.ram>0&&p.ramDy<0)rot=-p.face*1.1}
 else{if(p.atk>0)n=p.atkK==='kick'?'kelly_kick':'kelly_punch';else if(!p.onG)n='kelly_jump';else if(Math.abs(p.vx)>30)n=Math.floor(p.anim*9)%2?'kelly_run1':'kelly_run2';else n='kelly_idle'}
 if(p.onG&&!p.dead){c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(p.x,p.y,ride?44:20,6,0,0,TAU);c.fill()}
 if(p.swing){const hp=headPt(p),h=p.swing.h;c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(h.x,h.y+20);c.lineTo(hp.x,hp.y);c.stroke()}
 if(p.tng>0&&p.tngT){const hp=headPt(p),o=p.tngT.o,k=1-Math.abs(p.tng-0.15)/0.15,tx=lerp(hp.x,o.x,k),ty=lerp(hp.y+14,o.y,k);c.strokeStyle='#e8507a';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(hp.x+p.face*6,hp.y+16);c.lineTo(tx,ty);c.stroke();c.fillStyle='#ff7aa0';c.beginPath();c.arc(tx,ty,6,0,TAU);c.fill()}
 const sq=p.squash>0?1+p.squash*0.12:1;c.save();c.translate(p.x,p.y);c.scale(1/sq*(1),sq>1?1/sq*0.98+0.02:1);c.translate(-p.x,-p.y);
 const anchorY=p.swing?0.5:1,yy=p.swing?p.y-p.h*0.5:p.y+2;
 const rdt=clamp(p.anim-(p._la===undefined?p.anim:p._la),0,0.1);p._la=p.anim;const isRun=/_run[12]$/.test(n),amp=rigStep(p,rdt,isRun,PH[p.mode].spd),useRig=!p.dead&&(isRun||(/_idle$/.test(n)&&p.onG&&p._ramt>0.15));
 if(!(useRig&&(ride?drawRideRig(p,p.x,yy,1,p.face<0,amp):drawKellyRig(p,p.x,yy,0.98,p.face<0,amp))))spr(n,p.x,yy,ride?1:0.98,p.face<0,1,rot,anchorY);c.restore();
 if(p.ram>0){c.globalAlpha=0.5;spr(n,p.x-p.face*22,p.y+2,1,p.face<0,0.4,rot);c.globalAlpha=1}
 if(G.p.mode==='ride'&&!p.swing){const hk=nearHook(p);if(hk){c.strokeStyle='rgba(255,240,140,'+(0.5+0.5*Math.sin(G.t*10))+')';c.lineWidth=3;c.beginPath();c.arc(hk.x,hk.y+38,22,0,TAU);c.stroke()}}}
function drawBoss(b){if(!b)return;const k=b.k;let n;const st=b.st;
 if(st==='dizzy'||st==='dead')n=k+'_dizzy';
 else if(k==='tusk')n=st==='charge'||st==='wind'?'tusk_charge':'tusk_idle';
 else if(k==='croc')n=st==='bite'&&b.t>0.3||st==='leap'?'croc_bite':'croc_idle';
 else if(k==='bab')n=b.thr>0||st==='leapdown'?'bab_throw':'bab_idle';
 else if(k==='vex')n=st==='dive'||st==='tele'?'vex_dive':'vex_fly';
 else n=st==='rage'||(b.ph===2&&st!=='throw')?'cak_rage':(b.thr>0?'cak_throw':'cak_idle');
 n=n.replace(/^tusk_/,'lob_').replace(/^croc_/,'puf_').replace(/^vex_/,'jel_').replace(/^cak_/,'cap_').replace('lob_charge','lob_charge').replace('puf_bite','puf_puff');
 const fl=b.face>0;if(b.onG||k!=='vex'){c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(b.x,b.gy-(b.perch?4*TS:0)+(b.perch?0:0),b.w*0.6,9,0,0,TAU);c.fill()}
 if(k==='croc'&&st==='dive'&&b.sub){c.save();c.globalAlpha=0.5;spr(n,b.x,b.y,1,fl);c.restore();for(let i=0;i<2;i++)if(Math.random()<0.3)P({x:b.x+rand(-30,30),y:b.y-rand(20,80),vx:0,vy:-60,l:0.8,m:0.8,s:rand(3,6),c:'b',bub:1,g:-40});return}
 if(b.ph===2&&k==='cak'&&st!=='dead'){c.save();c.globalAlpha=0.35+0.15*Math.sin(G.t*8);c.fillStyle='#ff3020';c.beginPath();c.ellipse(b.x,b.y-b.h/2,b.w,b.h*0.65,0,0,TAU);c.fill();c.restore()}
 if(st==='tele'){c.save();c.globalAlpha=0.4+0.4*Math.sin(G.t*30);c.fillStyle='#ff4060';c.beginPath();c.arc(b.x,b.y-60,90,0,TAU);c.fill();c.restore()}
 const yy=b.y+4+(st==='wind'?Math.sin(G.t*50)*2:0);
 const fa=st==='dead'?clamp(1-(b.t-0.8)/1.2,0,1):1;if(fa<=0)return;const sc=1,br=st==='idle'||st==='fly'?Math.sin(G.t*3)*0.015:0;c.save();c.translate(b.x,yy);c.scale(1-br,1+br);if(b.flash>0)sprT(n,'#ffffff',0,0,sc,fl,0.9*fa);else if(k==='vex'&&st!=='dizzy'&&st!=='dead')warpH(n,0,0,sc,fl,10,0.05,G.t*5,0.42);else spr(n,0,0,sc,fl,fa);c.restore();
 if(st==='dizzy')dizzyStars(b.x,b.y-b.h-10,40)}
function drawShot(s){if(s.k==='ink'){spr('ink',s.x,s.y,1,false,1,s.rot,0.5);if(Math.random()<0.3)P({x:s.x,y:s.y,vx:0,vy:0,l:0.4,m:0.4,s:6,c:'rgba(40,20,60,.5)',puff:1,g:0})}
 else if(s.k==='conch'||s.k==='bone'||s.k==='coconut')spr('conch',s.x,s.y,1.1,false,1,s.rot,0.5);
 else if(s.k==='feather'){c.save();c.translate(s.x,s.y);const r=11+Math.sin(G.t*20)*1.5;const g=c.createRadialGradient(-3,-3,1,0,0,r);g.addColorStop(0,'#fff');g.addColorStop(0.5,'#ff9ae8');g.addColorStop(1,'rgba(200,80,255,.4)');c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.strokeStyle='rgba(255,255,160,.9)';c.lineWidth=2;c.beginPath();for(let q=0;q<3;q++){const a=G.t*9+q*2.1;c.moveTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(Math.cos(a)*(r+7),Math.sin(a)*(r+7))}c.stroke();c.restore()}
 else if(s.k==='wave'){c.save();c.translate(s.x,s.y);c.scale(sgn(s.vx),1);c.fillStyle='rgba(150,220,255,.85)';c.beginPath();c.moveTo(-18,0);c.quadraticCurveTo(-4,-50,18,-8);c.quadraticCurveTo(4,-26,18,0);c.closePath();c.fill();c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;c.stroke();c.restore()}}
function drawWorld(){const L=G.L,cm=G.cam;c.save();c.translate(-cm.x,-cm.y);
 const vx0=cm.x-80,vx1=cm.x+viewW+80,vis=x=>x>vx0&&x<vx1;
 for(const s of L.signs)if(vis(s.x))spr('sign',s.x,s.y+2,0.8);
 for(const cp of L.cps)if(vis(cp.x)){if(cp.on)spr('flag',cp.x,cp.y+2,0.9,false,1,Math.sin(G.t*3)*0.03);else sprT('flag','rgba(60,60,70,1)',cp.x,cp.y+2,0.9,false,0.55)}
 if(L.goal&&vis(L.goal.x)){spr('flag',L.goal.x,L.goal.y+2,1.6,false,1,Math.sin(G.t*3)*0.04);if(Math.random()<0.2)stars(L.goal.x+rand(-30,30),L.goal.y-rand(40,140),1)}
 if(L.cage&&vis(L.cage.x)){const cg=L.cage;cg.sh=Math.max(0,(cg.sh||0)-0.016);const sh=cg.sh>0?Math.sin(G.t*80)*4:0;if(!cg.open){spr('cage',cg.x+sh,cg.y+4,1);spr('jinxy',cg.x+sh,cg.y-8,0.82,false,1,Math.sin(G.t*3)*0.04);for(let i=0;i<4;i++){const bx0=cg.x+sh-34+i*22;c.fillStyle='#8a5a22';rr(bx0-3,cg.y-92,7,86,3);c.fill();c.fillStyle='rgba(255,220,150,.5)';c.fillRect(bx0-1,cg.y-90,2,80)}if(G.p&&Math.abs(G.p.x-cg.x)<260){c.textAlign='center';c.font='18px "Lilita One",sans-serif';c.lineWidth=4;c.strokeStyle='#3a1a00';c.strokeText('PUNCH THE CAGE!',cg.x,cg.y-112);c.fillStyle='#fff';c.fillText('PUNCH THE CAGE!',cg.x,cg.y-112)}}}
 drawTiles();drawPools();
 for(const h of L.hooks)if(vis(h.x)){c.strokeStyle='#4a3a2a';c.lineWidth=3;c.beginPath();c.moveTo(h.x,h.y-600);c.lineTo(h.x,h.y-10);c.stroke();spr('hook',h.x,h.y+44,1,false,1,Math.sin(G.t*2+h.x)*0.06)}
 for(const g of L.gems)if(!g.got&&vis(g.x)){spr('gem',g.x,g.y+11+Math.sin(G.t*3+g.t)*2,0.95);if(hsh(g.x|0,(G.t*4)|0)<0.04)stars(g.x+rand(-8,8),g.y-6,1)}
 for(const s of L.stars)if(!s.got&&vis(s.x)){c.save();c.globalAlpha=0.35;c.fillStyle='#fff2a0';c.beginPath();c.arc(s.x,s.y,24+Math.sin(G.t*4)*4,0,TAU);c.fill();c.restore();spr('star',s.x,s.y+16,1.25+Math.sin(G.t*4)*0.08,false,1,Math.sin(G.t*2)*0.2)}
 for(const e of G.ents)if(vis(e.x))drawEnt(e);
 if(G.free){const f=G.free;spr('jinxy',f.x,f.y,0.9,f.face<0)}
 drawBoss(G.boss);
 if(G.fin){for(const f of G.fin){const by=f.n==='present'?-Math.abs(Math.sin(G.t*4))*10:0;spr(f.n,f.x,f.y+by,f.sc||1,f.fl);if(f.n==='present'&&Math.random()<0.15)stars(f.x+rand(-20,20),f.y-40+by,1)}}
 if(G.pip&&!G.pip.hide&&vis(G.pip.x)){const q=G.pip;q.t=(q.t||0)+(G.dtR||0.016);drawPipRig(q.x,q.y+30+Math.sin(q.t*2)*3,1,q.face<0,q.t*2.5,0.45,false,Math.sin(q.t*1.3)*0.05);if(!G.metPip&&G.p&&Math.abs(G.p.x-q.x)<330){c.textAlign='center';c.font='18px "Lilita One",sans-serif';c.lineWidth=4;c.strokeStyle='#08304a';const tt='HOP IN THE WATER! I\'M PIP!';c.strokeText(tt,q.x,q.y-40);c.fillStyle='#bfffe8';c.fillText(tt,q.x,q.y-40)}}
 if(G.p)drawPlayer(G.p);
 drawSeaFront();
 for(const s of G.shots)drawShot(s);
 for(const q of G.parts){const a=clamp(q.l/q.m,0,1);c.globalAlpha=a;if(q.ring){c.strokeStyle=q.c;c.lineWidth=q.w*a;c.beginPath();c.arc(q.x,q.y,q.s*(1.2-a),0,TAU);c.stroke()}else if(q.bub){if(q.top!==undefined&&q.y<q.top+4){q.l=0;continue}c.strokeStyle='rgba(225,250,255,.85)';c.lineWidth=1.3;c.beginPath();c.arc(q.x+Math.sin(G.t*5+q.s)*1.5,q.y,q.s,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.fillRect(q.x-q.s*0.4,q.y-q.s*0.5,q.s*0.4,q.s*0.4)}else{c.fillStyle=q.c;if(q.puff){c.beginPath();c.arc(q.x,q.y,q.s*(1.5-a*0.5),0,TAU);c.fill()}else c.fillRect(q.x-q.s/2,q.y-q.s/2,q.s,q.s)}}c.globalAlpha=1;
 c.textAlign='center';for(const t of G.texts){const a=clamp(t.l/t.m*1.6,0,1);c.globalAlpha=a;c.font=(t.big?'26px':'18px')+' "Lilita One",sans-serif';c.lineWidth=5;c.strokeStyle='rgba(30,10,0,.85)';c.strokeText(t.s,t.x,t.y);c.fillStyle=t.c;c.fillText(t.s,t.x,t.y)}c.globalAlpha=1;
 c.restore()}
function ambient(dt){const Wd=WORLDS[LEVELS[G.li].w];G.amb=G.amb||[];if(G.amb.length<40&&Math.random()<dt*20){G.amb.push({x:Math.random()*W,y:Wd.amb==='snow'||Wd.amb==='leaves'?-10:Wd.amb==='embers'||Wd.amb==='bubbles'?gameH+10:Math.random()*gameH,vx:rand(-20,20)+(Wd.amb==='snow'?-30:0),vy:Wd.amb==='snow'?rand(40,90):Wd.amb==='leaves'?rand(30,60):Wd.amb==='embers'?-rand(30,70):Wd.amb==='bubbles'?-rand(20,40):rand(-5,5),l:rand(4,9),s:rand(1.5,4),k:Wd.amb,ph:Math.random()*6})}
 for(const a of G.amb){a.x+=(a.vx+Math.sin(G.t+a.ph)*15)*dt-G.camDx*S*0.3;a.y+=a.vy*dt;a.l-=dt}G.amb=G.amb.filter(a=>a.l>0&&a.y>-20&&a.y<gameH+20&&a.x>-30&&a.x<W+30);
 for(const a of G.amb){c.globalAlpha=Math.min(1,a.l);c.fillStyle=a.k==='snow'?'#fff':a.k==='leaves'?'#7ac04a':a.k==='embers'?'#ffa040':a.k==='bubbles'?'rgba(220,250,255,.7)':'rgba(255,240,200,.6)';
  if(a.k==='leaves'){c.save();c.translate(a.x,a.y);c.rotate(G.t*2+a.ph);c.beginPath();c.ellipse(0,0,a.s*2,a.s,0,0,TAU);c.fill();c.restore()}else{c.beginPath();c.arc(a.x,a.y,a.s,0,TAU);c.fill()}}c.globalAlpha=1}
function rr(x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
function heart(x,y,s,full){c.save();c.translate(x,y);c.scale(s/16,s/16);c.beginPath();c.moveTo(0,5);c.bezierCurveTo(-8,-3,-8,-9,-3,-9);c.bezierCurveTo(-1,-9,0,-7,0,-6);c.bezierCurveTo(0,-7,1,-9,3,-9);c.bezierCurveTo(8,-9,8,-3,0,5);c.closePath();c.fillStyle=full?'#ff3a5a':'rgba(0,0,0,.45)';c.fill();c.lineWidth=1.6;c.strokeStyle='#fff';c.stroke();c.restore()}
function drawHUD(){const p=G.p,x=10+SAFE.l,y=8+SAFE.t;c.textAlign='left';
 const pw=portrait?Math.min(W-130-SAFE.r-x,250):250,ph=62;c.fillStyle='rgba(20,10,0,.48)';rr(x,y,pw,ph,16);c.fill();
 c.save();c.beginPath();c.arc(x+31,y+31,25,0,TAU);c.fillStyle='#7fd8f0';c.fill();c.clip();const im=IMG.ride_idle;if(im)c.drawImage(im,im.width*0.36,0,im.width*0.64,im.width*0.64,x+6,y+8,50,50);c.restore();c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(x+31,y+31,25,0,TAU);c.stroke();
 for(let i=0;i<p.maxhp;i++)heart(x+70+i*22,y+18,18,i<p.hp);
 c.font='17px "Lilita One",sans-serif';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=3;
 const t1='x'+G.lives;c.strokeText(t1,x+72+p.maxhp*22,y+24);c.fillText(t1,x+72+p.maxhp*22,y+24);
 spr('gem',x+78,y+52,0.45);const t2=String(G.gems).padStart(2,'0');c.strokeText(t2,x+88,y+52);c.fillText(t2,x+88,y+52);
 for(let i=0;i<3;i++){if(G.lvStars[i])spr('star',x+126+i*19,y+53,0.42);else{c.globalAlpha=0.35;spr('star',x+126+i*19,y+53,0.42);c.globalAlpha=1}}
 const sc=String(G.score).padStart(6,'0');c.textAlign='right';c.strokeText(sc,x+pw-10,y+52);c.fillStyle='#ffe27a';c.fillText(sc,x+pw-10,y+52);
 HUDR={x,y,w:pw,h:ph};
 /* boss bar */
 BOSSR=null;const b=G.boss;if(b&&b.st!=='dead'||b&&b.hp>0){const rightRes=130+SAFE.r;let bxp,byp,bw;const free0=x+pw+12,free1=W-rightRes;
  if(free1-free0>=300){bw=Math.min(440,free1-free0);bxp=free0+(free1-free0-bw)/2;byp=y+6}else{bxp=x;bw=W-x-10-SAFE.r;byp=y+ph+8}
  c.fillStyle='rgba(20,0,0,.6)';rr(bxp,byp,bw,46,12);c.fill();c.textAlign='center';c.font='15px "Lilita One",sans-serif';c.fillStyle='#fff';c.fillText(b.name,bxp+bw/2,byp+18);
  c.fillStyle='rgba(0,0,0,.6)';rr(bxp+10,byp+25,bw-20,13,6);c.fill();const f=clamp(b.hp/b.max,0,1);const g=c.createLinearGradient(bxp,0,bxp+bw,0);g.addColorStop(0,'#ff3030');g.addColorStop(1,'#ffb030');c.fillStyle=g;rr(bxp+10,byp+25,(bw-20)*f,13,6);c.fill();BOSSR={x:bxp,y:byp,w:bw,h:46}}
 /* sign tip */
 TIPR=null;if(G.sign&&!G.boss&&!G.cut){const s=G.sign.text;const top=Math.max(y+ph,BOSSR?BOSSR.y+BOSSR.h:0)+10;const maxW=Math.min(560,W-24-SAFE.l-SAFE.r);c.font='17px "Baloo 2",sans-serif';const lines=wrapText(s,maxW-28);const bh=lines.length*22+16;let bxp=(W-maxW)/2;
  c.fillStyle='rgba(255,248,225,.94)';rr(bxp,top,maxW,bh,14);c.fill();c.strokeStyle='#8a5a2a';c.lineWidth=3;c.stroke();c.fillStyle='#3a2210';c.textAlign='center';lines.forEach((l,i)=>c.fillText(l,W/2,top+28+i*22-6));TIPR={x:bxp,y:top,w:maxW,h:bh}}
 /* level banner */
 if(G.banner>0){const a=clamp(G.banner,0,1);c.globalAlpha=a;c.textAlign='center';c.font='30px "Lilita One",sans-serif';c.lineWidth=6;c.strokeStyle='#3a1a00';const L=LEVELS[G.li];const t=(L.w+1)+'-'+(G.li%2+1)+': '+L.name.toUpperCase();const yy=gameH*0.4;c.strokeText(t,W/2,yy);c.fillStyle='#ffe27a';c.fillText(t,W/2,yy);c.globalAlpha=1}
 if(G.finale&&G.won){const yy=gameH*0.3,k=1+Math.sin(G.t*5)*0.05;c.save();c.translate(W/2,yy);c.scale(k,k);c.textAlign='center';c.font=(portrait?'30px':'40px')+' "Lilita One",sans-serif';c.lineWidth=8;c.strokeStyle='#5a0a3a';c.strokeText('HAPPY BIRTHDAY,',0,0);c.strokeText('KELLY!',0,portrait?38:48);c.fillStyle='#ff9ad0';c.fillText('HAPPY BIRTHDAY,',0,0);c.fillStyle='#ffe27a';c.fillText('KELLY!',0,portrait?38:48);c.restore()}
 if(G.bossIntro>0&&G.boss){const a=clamp(G.bossIntro,0,1);c.globalAlpha=a;c.textAlign='center';c.font='34px "Lilita One",sans-serif';c.lineWidth=7;c.strokeStyle='#300';const yy=gameH*0.42;c.strokeText(G.boss.name,W/2,yy);c.fillStyle='#ff7040';c.fillText(G.boss.name,W/2,yy);c.globalAlpha=1}}
function wrapText(s,mw){const w=s.split(' '),out=[];let l='';for(const x of w){const t=l?l+' '+x:x;if(c.measureText(t).width>mw&&l){out.push(l);l=x}else l=t}if(l)out.push(l);return out}
function drawPadBG(){if(!portrait)return;const g=c.createLinearGradient(0,gameH,0,H);g.addColorStop(0,'#0e4a6a');g.addColorStop(1,'#06223a');c.fillStyle=g;c.fillRect(0,gameH,W,H-gameH);c.fillStyle='#f2d28a';c.fillRect(0,gameH,W,3);
 c.globalAlpha=0.08;c.fillStyle='#bff0ff';for(let i=0;i<14;i++){const y=gameH+((i*37)%(H-gameH));c.beginPath();c.ellipse((i*131)%W,y,40+(i%3)*20,10,0,0,TAU);c.fill()}c.globalAlpha=1}
function render(){c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,W,H);if(!G){c.fillStyle='#06223a';c.fillRect(0,0,W,H);return}
 c.save();c.beginPath();c.rect(0,0,W,gameH);c.clip();drawBG();drawSeaBack();
 const sx=G.shake>0?rand(-G.shake,G.shake):0,sy=G.shake>0?rand(-G.shake,G.shake):0;c.save();c.translate(sx,sy);c.scale(S,S);drawWorld();c.restore();
 ambient(G.dtR||0.016);if(G.flash&&G.flash.a>0){c.globalAlpha=G.flash.a;c.fillStyle=G.flash.c;c.fillRect(0,0,W,gameH);c.globalAlpha=1}
 const vg=c.createRadialGradient(W/2,gameH/2,Math.min(W,gameH)*0.45,W/2,gameH/2,Math.max(W,gameH)*0.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=vg;c.fillRect(0,0,W,gameH);
 c.restore();drawPadBG();if(state==='play'||state==='pause')drawHUD()}


/* ===== run-cycle rig: real alternating strides (body art + animated legs) ===== */
function rigLimb(x,y,a,len,w,fill,line){const ex=x+Math.sin(a)*len,ey=y+Math.cos(a)*len;c.lineCap='round';
 c.strokeStyle=line;c.lineWidth=w+3.2;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();
 c.strokeStyle=fill;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();return[ex,ey]}
function rigStep(p,dt,running,spd){if(p._rph===undefined){p._rph=0;p._ramt=0}
 p._ramt+=((running?1:0)-p._ramt)*Math.min(1,dt*14);
 const v=Math.abs(p.vx);if(running)p._rph=(p._rph+Math.min(1.375,v/(p.mode==='ride'?118:78))*dt)%1;/* cadence (arm check, Oct 30 2026): capped at ~2.75 steps/s (Jinxy gallop was ~5) */
 else if(p._ramt>0.02){/* settle the nearer leg pair toward a neutral passing pose */const t=p._rph%0.5;p._rph+=(t<0.25?-t:0.5-t)*Math.min(1,dt*10)}
 return p._ramt*clamp(v/spd,0.55,1)+0.0}
/* Kelly on foot. ix/iy in sprite pixels; bottom-centre of the sprite = ground */
function kellyLeg(hx,hy,t,amp,back){const th=0.1+amp*0.74*Math.sin(t),cs=Math.cos(t),kn=0.14+amp*(1.6*Math.pow(Math.max(0,cs),1.3)+0.16*Math.max(0,-cs));
 const J=back?'#1b3048':'#2a4a70',JL=back?'#0a1420':'#0e1a28',B=back?'#6a3a14':'#8e5222',BL=back?'#2a1404':'#3a1a06';
 const k=rigLimb(hx,hy,th,32,back?19:21,J,JL);
 if(!back){c.strokeStyle='rgba(120,160,210,.35)';c.lineWidth=3;c.beginPath();c.moveTo(hx+Math.cos(th)*5,hy-Math.sin(th)*5);c.lineTo(k[0]+Math.cos(th)*4,k[1]-Math.sin(th)*4);c.stroke()}
 const sa=th-kn,a=rigLimb(k[0],k[1],sa,24,back?14:15,J,JL);
 /* boot: shaft continues the shin, foot points forward */
 const b=rigLimb(a[0],a[1],sa,8,back?17:18,B,BL),fa=sa+Math.PI/2-0.15-amp*0.35*Math.max(0,cs);
 c.save();c.translate(b[0],b[1]);c.rotate(-fa+Math.PI/2);c.fillStyle=BL;c.beginPath();c.ellipse(5,1,13.5,7.8,0,0,TAU);c.fill();c.fillStyle=B;c.beginPath();c.ellipse(5,0,11.8,6.2,0,0,TAU);c.fill();
 c.fillStyle=BL;c.fillRect(-7,4.6,24,3);if(!back){c.fillStyle='rgba(255,210,150,.45)';c.fillRect(-2,-4,8,2)}c.restore()}
function drawKellyRig(p,x,y,sc,flip,amp){const im=IMG.kelly_torso;if(!im)return false;const f=0.5*sc,t=p._rph*TAU,
 bob=amp*5*Math.cos(2*t),lean=amp*0.035*Math.sin(2*t);
 c.save();c.translate(x,y);c.scale(flip?-f:f,f);const hx=3,hy=-66+bob;
 kellyLeg(hx-3,hy,t+Math.PI,amp,true);
 c.save();c.translate(hx,hy);c.rotate(lean);c.translate(-hx,-hy);c.drawImage(im,-59,-161+bob);c.restore();
 kellyLeg(hx+2,hy,t,amp,false);c.restore();return true}
/* Jinxy (ride mode): four-legged gallop under the body art */
function girLeg(hx,hy,t,amp,front,back){const cs=Math.cos(t),s=Math.sin(t),up=front?0.12+amp*0.7*s:-0.08+amp*0.64*s,
 bend=0.1+amp*1.25*Math.pow(Math.max(0,cs),1.3),lo=front?up-bend:up+bend*0.95;
 const T=back?'#c98a34':'#f2b24e',L=back?'#5a3410':'#8a5418',P=back?'#8a4e14':'#b8661c';
 const k=rigLimb(hx,hy,up,30,back?15:16.5,T,L);
 c.fillStyle=P;for(const q of [0.3,0.62]){c.beginPath();c.ellipse(hx+(k[0]-hx)*q+1.5,hy+(k[1]-hy)*q,4.4,3.2,-up,0,TAU);c.fill()}
 const a=rigLimb(k[0],k[1],lo,28,back?10:11,T,L);c.fillStyle=T;c.beginPath();c.arc(k[0],k[1],back?7:8,0,TAU);c.fill();
 c.save();c.translate(a[0],a[1]);c.rotate(-lo);c.fillStyle=back?'#2e1806':'#4a2608';c.beginPath();c.moveTo(-6.5,-2);c.lineTo(6.5,-2);c.lineTo(8,8);c.quadraticCurveTo(0,10,-8,8);c.closePath();c.fill();c.fillStyle='rgba(255,220,170,.25)';c.fillRect(-4,0,6,2);c.restore()}
function girLegS(hx,hy,t,amp,front,back,k){c.save();c.translate(hx,hy);c.scale(k,k);girLeg(0,0,t,amp,front,back);c.restore()}
function drawRideRig(p,x,y,sc,flip,amp){const im=IMG.ride_body;if(!im)return false;const f=0.5*sc,t=p._rph*TAU,
 bob=amp*4.5*Math.cos(t+0.4),pitch=amp*0.05*Math.sin(t+0.4),K=0.85;
 c.save();c.translate(x,y);c.scale(flip?-f:f,f);c.translate(0,bob);c.rotate(pitch);
 const HX=-28,FX=26,HY=-59,FY=-59;
 girLegS(HX+4,HY,t,amp,false,true,K);girLegS(FX+4,FY,t+Math.PI*0.9,amp,true,true,K);
 c.drawImage(im,-im.width/2,-im.height);
 girLegS(HX,HY+2,t+Math.PI*0.2,amp,false,false,K);girLegS(FX,FY+2,t+Math.PI*1.1,amp,true,false,K);
 c.restore();return true}
/* Hyena: 4-leg walk (lateral sequence) under the legless body art; sprite faces left natively. Render-only. */
/* ===== sea rigs: Pip (flipper rig), crabs (vector legs), warps for eel / jelly / octo ===== */
const DK={};function dkImg(n,a=0.38){const k=n+a;if(DK[k])return DK[k];const im=IMG[n];if(!im)return null;const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(10,30,50,'+a+')';x.fillRect(0,0,cv.width,cv.height);return DK[k]=cv}
function flip0(im,rx,ry,ang,dx,dy){if(!im)return;c.save();c.translate(rx,ry);c.rotate(ang);c.drawImage(im,dx,dy);c.restore()}
/* Pip: body 231x153px faces right. front flipper root at its left end, back flipper root at its right end */
function drawPipRig(x,y,sc,flip,ph,amp,rider,rot,rp){const body=IMG.pip_body;if(!body)return false;const f=0.5*sc*0.7;
 const fF=IMG.fl_front,fB=IMG.fl_back,dF=dkImg('fl_front'),dB=dkImg('fl_back');
 const aF=k=>0.55+amp*0.85*Math.sin(ph+k),aB=k=>-0.15+amp*0.45*Math.sin(ph+1.2+k);
 c.save();c.translate(x,y);if(rot)c.rotate(rot);if(flip)c.scale(-1,1);c.scale(f,f);c.translate(-115,-150);
 flip0(dB,40,86,aB(Math.PI),-97,-16);flip0(dF,162,84,aF(Math.PI)-0.15,-8,-30);
 c.drawImage(body,0,0);
 if(rider&&IMG.gsit){const g=IMG.gsit,bob=Math.sin(ph*2)*2.5;c.save();c.translate(98,46+bob);c.scale(1.45,1.45);c.rotate(Math.sin(ph)*0.04*(rp&&rp.dive>0?0:1)+(rp&&rp.leap>0?-0.12:0));c.drawImage(g,-g.width/2,-g.height);c.restore()}
 flip0(fB,50,100,aB(0),-92,-16);flip0(fF,124,90,aF(0),-10,-30);
 c.restore();return true}
function drawSwimmer(p){const sp=Math.hypot(p.vx,p.vy);p._sph=(p._sph||0)+(G.dtR||0.016)*TAU*(0.9+sp/150);
 let rot=clamp(p.vy/700,-0.45,0.45)*p.face;if(p.dive>0)rot=p.face*0.75;if(p.leap>0)rot=-p.face*0.35;
 const amp=p.ram>0?1:clamp(0.35+sp/260,0.35,1);drawPipRig(p.x,p.y+4,1,p.face<0,p._sph,amp,true,rot,p);
 if(p.tng>0&&p.tngT){}}
/* crab: body sprite (legs erased), legs drawn as jointed limbs */
function crabLeg(hx,hy,fx,fy,s,col,lw){const kx=(hx+fx)/2+s*7,ky=Math.min(hy,fy)-12;c.lineCap='round';c.lineJoin='round';
 c.strokeStyle='#4a0c08';c.lineWidth=lw+3;c.beginPath();c.moveTo(hx,hy);c.lineTo(kx,ky);c.lineTo(fx,fy);c.stroke();
 c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(hx,hy);c.lineTo(kx,ky);c.lineTo(fx,fy);c.stroke()}
function drawCrabRig(e,x,y,sc){const im=IMG.crab_body;if(!im)return false;const f=0.5*sc,mv=Math.abs(e.vx)>5&&!(e.stun>0)&&!e.dying,t=e.t*15;
 c.save();c.translate(x,y);c.scale(f,f);c.rotate(mv?sgn(e.vx)*0.05:0);const bob=mv?Math.abs(Math.sin(t))*-3:0;
 for(const back of [1,0])for(let i=0;i<3;i++)for(const s of [-1,1]){const ph=t+i*2.1+(s>0?Math.PI:0)+(back?1:0),hx=s*(18+i*7+(back?-4:0)),hy=-40+i*4+bob,lift=mv?Math.max(0,Math.cos(ph))*9:0,
   fx=s*(46+i*14+(back?-8:0))+(mv?Math.sin(ph)*7:0),fy=-lift;crabLeg(hx,hy,fx,fy,s,back?'#a8241a':'#e0442c',back?6:7)}
 c.drawImage(im,-im.width/2,-im.height-28+bob);c.restore();return true}
/* strip warps */
function warpH(n,x,y,sc,flip,amp,fq,t,from,ay=1){const im=IMG[n];if(!im)return;const f=0.5*sc,w=im.width,h=im.height,y0=Math.floor(h*from),st=3;
 c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(f,f);c.translate(-w/2,-h*ay);c.drawImage(im,0,0,w,y0,0,0,w,y0);
 for(let r=y0;r<h;r+=st){const k=(r-y0)/(h-y0),o=Math.sin(t+r*fq)*amp*k;c.drawImage(im,0,r,w,Math.min(st,h-r),o,r,w,Math.min(st,h-r)+0.6)}c.restore()}
function warpV(n,x,y,sc,flip,amp,fq,t,ay=1){const im=IMG[n];if(!im)return;const f=0.5*sc,w=im.width,h=im.height,st=4;
 c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(f,f);c.translate(-w/2,-h*ay);
 for(let q=0;q<w;q+=st){const k=0.25+0.75*(q/w),o=Math.sin(t-q*fq)*amp*k;c.drawImage(im,q,0,Math.min(st,w-q)+0.6,h,q,o,Math.min(st,w-q)+0.6,h)}c.restore()}

/* ===== menus (DOM) ===== */
const ui=$('ui');
function show(html,cls=''){ui.innerHTML='<div class="scr '+cls+'">'+html+'</div>';document.body.classList.add('uiopen');gpIdx=0;
 ui.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();AU.unlock();AU.fx('menu');act(b.dataset.a,b.dataset.v)}));
 if(GP.on||kbUsed)setTimeout(()=>gpFocus(0,1),30);$('bgart').hidden=!(cls.includes('title')||cls.includes('menu'))}
let kbUsed=false;addEventListener('keydown',()=>kbUsed=true,{once:true});
function hideUI(){ui.innerHTML='';document.body.classList.remove('uiopen');$('bgart').hidden=true}
function ctlLine(){return GP.on?'🎮 Controller: stick/D-pad move · A jump · X action · B dive · Start pause':'Swipe &amp; hold anywhere to move · swipe up to jump · tap ACTION · DIVE when riding Pip'}
function refreshCtlHint(){const h=document.querySelector('#ui .ctl');if(h)h.innerHTML=ctlLine()}
function titleScreen(){state='title';AU.music('title');const cont=save.reached>0;
 show(`<div class="logo"><div class="l1">KELLY'S</div><div class="l2">GIRAFFE ADVENTURE</div><div class="l3">VOL. 8 · PIP'S DEEP DIVE</div></div>
 <div class="tbtns"><button class="btn go" data-a="play">▶ ${cont?'CONTINUE':'PLAY'}</button>${cont?'<button class="btn alt" data-a="new">NEW GAME</button>':''}
 <button class="btn alt" data-a="levels">LEVELS</button><button class="btn alt2" data-a="how">HOW TO PLAY</button></div>
 <p class="tag">Wade, ram, slurp and swim with Pip the sea turtle through 8 levels and 4 silly sea bosses to win back Peter's birthday present!</p>${save.best?'<p class="sub">Best score: '+save.best.toLocaleString()+'</p>':''}<p class="ctl sub">${ctlLine()}</p><img class="studio" src="art/studio.webp?v=${VERSION}" alt="five8nine">`,'title')}
const STORY=[
 ['<b>Beach day!</b> Peter was carrying a big birthday present to Kelly\'s party by the sea, when <b>Captain Crab</b> scuttled out of the waves and SNATCHED it! 🦀🎁','"Finders keepers!" he cackled, and sailed off to <b>Shipwreck Cove</b>. Kelly\'s giraffe pulled on her swim scarf. Time to get that present back!','Down by the water, a friendly sea turtle waved a flipper. "I\'m <b>Pip</b>! Hop on my shell whenever you reach deep water, and press <b>DIVE</b> to swoop down!" 🐢'],
 ['The giraffe and Pip splashed past the lighthouse. Big Bubba the Pufferfish just deflated in a huff.','Ahead the rocks open into glowing <b>Coral Caves</b>. Captain Crab\'s pinchy footprints lead straight inside. Hang on, present!'],
 ['<b>You did it!</b> Captain Crab is dizzy as a whirlpool, and Peter has the present back without a single wet ribbon.','Even Captain Crab says sorry and joins the beach party. Pip blows the biggest bubble ever. <b>HAPPY BIRTHDAY, KELLY!</b> 🎂🦒🐢']];
let storyPg=0;
function storyScreen(i,next,pg=0){state='story';storyPg=pg;const T=STORY[i-1],last=pg>=T.length-1;
 show(`<img class="story" src="art/story${i}.webp?v=${VERSION}" alt=""><p class="big">${T[pg]}</p><div class="tbtns row"><button class="btn go" data-a="${last?next:'spage'}" data-v="${i}|${next}|${pg+1}">${last?(i===3?'THE END':"LET'S GO ▶"):'NEXT ▶'}</button><button class="btn dim skip" data-a="${next}">SKIP ⏭</button></div>`,'menu');if(pg===0)AU.music(i===3?'bday':'title')}
function levelsScreen(){state='levels';let h='<h2>LEVELS</h2><div class="lvls">';LEVELS.forEach((L,i)=>{const lock=i>save.reached;const st=save.stars[i]||[];const sn=[0,1,2].map(k=>st[k]?'★':'☆').join('');const bs=L.ch.find(x=>x.startsWith('boss:'));
  h+=`<button class="btn lv ${lock?'dim':''}" data-a="${lock?'locked':'lvl'}" data-v="${i}"><span class="n">${WORLDS[L.w].name.split(' ')[0]} ${L.w+1}-${i%2+1}</span> ${L.name}${bs?' <small>· BOSS</small>':''}<span class="st">${lock?'🔒':sn}</span></button>`});
 show(h+'</div><button class="btn alt" data-a="back">◀ BACK</button>','menu')}
function howScreen(){state='how';show(`<h2>HOW TO PLAY</h2><ul class="how">
 <li><b>Move:</b> swipe and hold anywhere (let go to stop). <b>Swipe up</b> or tap <b>JUMP</b> to jump. Hold JUMP to go higher.</li>
 <li>🐢 <b>Deep water?</b> Jump in and <b>Pip the sea turtle</b> carries you! Swipe to swim any way, tap <b>JUMP</b> to paddle up (or leap out at the surface), tap <b>DIVE</b> to swoop down and crack coral below. ACTION still slurps, bonks and double-tap dashes.</li>
 <li>Shallow tide pools are safe to wade through. Stay away from purple sea urchins!</li>
 <li><b>ACTION</b> changes with what is near you. Tap for a <b>HEAD BONK</b>, double-tap for a <b>NECK RAM</b> (smashes rocks and bad guys). Hold UP + ACTION to ram up.</li>
 <li>Cliff too tall? Jump at it and hold <b>UP</b> (or keep pushing toward it) to <b>NECK GRAB</b> the edge and pull yourself up.</li>
 <li>In the air, hold DOWN + ACTION to <b>NECK POUND</b> through cracked bricks.</li>
 <li>Near a golden ring: jump and tap ACTION to <b>SWING</b>. JUMP lets go.</li>
 <li>Near seaweed, melon, little crabs or shrimp: tap ACTION and your long <b>TONGUE</b> slurps them up (gems and stars too!).</li>
 <li>Collect pink shells (100 = extra life) and 3 gold stars in every level. Stomp bad guys, but never stomp hermit crabs, jellyfish or puffed-up pufferfish!</li>
 <li><b>Bosses:</b> wait till they are dizzy, then BONK, RAM or STOMP for big damage.</li>
 <li>🎮 <b>Controllers</b> (USB or Bluetooth, phone or computer): stick or D-pad to move, A jump, X action, B dive, Y ram, Start pause, Select sound.</li>
 <li>Keys: arrows/WASD, Z or Space jump, X action, V dive, C ram, P pause, M sound.</li></ul><button class="btn alt" data-a="back">◀ BACK</button>`,'menu')}
function pauseGame(){if(state!=='play')return;state='pause';clearInput();show(`<h2>PAUSED</h2><p>${LEVELS[G.li].name}</p><button class="btn go" data-a="resume">▶ RESUME</button><button class="btn alt" data-a="restart">RESTART LEVEL</button><button class="btn alt2" data-a="how2">HOW TO PLAY</button><button class="btn dim" data-a="quit">QUIT TO TITLE</button>`)}
function resumeGame(){hideUI();state='play';clearInput();AU.music(G.boss&&G.boss.st!=='dead'?'boss':WORLDS[LEVELS[G.li].w].song)}
function clearScreen(){state='clear';const L=LEVELS[G.li],n=G.lvStars.filter(Boolean).length;AU.music('win');
 show(`<h2>${G.L.boss?'BOSS BEATEN!':'LEVEL CLEAR!'}</h2><p class="big">${L.name}</p><table class="st"><tr><td>Gems</td><td>${G.lvGems}</td></tr><tr><td>Gold stars</td><td>${'★'.repeat(n)}${'☆'.repeat(3-n)}</td></tr><tr><td>Score</td><td>${G.score.toLocaleString()}</td></tr></table>
 <button class="btn go" data-a="next">NEXT ▶</button><button class="btn dim" data-a="quit">TITLE</button>`)}
function overScreen(){state='over';AU.stop();AU.fx('over');if(G.score>save.best){save.best=G.score;persist()}
 show(`<h2>GAME OVER</h2><p class="big">Score: ${G.score.toLocaleString()}</p><p>Your giraffe believes in you! Try this level again?</p><button class="btn go" data-a="retry">TRY AGAIN</button><button class="btn dim" data-a="quit">TITLE</button>`)}
function winScreen(){state='win';AU.music('bday');if(G.score>save.best){save.best=G.score;persist()}save.won=1;persist();
 show(`<h2>THE PRESENT IS BACK!</h2><p class="big hbd">🎁 HAPPY BIRTHDAY, KELLY! 🎂</p><img class="story" src="art/story3.webp?v=${VERSION}" alt=""><p class="big">Final score: ${G.score.toLocaleString()}</p><p>Gold stars: ${Object.values(save.stars).reduce((a,s)=>a+(s||[]).filter(Boolean).length,0)} / 24</p><button class="btn go" data-a="again">PLAY AGAIN</button><button class="btn alt" data-a="levels">LEVELS</button><button class="btn dim" data-a="quit">TITLE</button>`,'menu')}
function act(a,v){
 if(a==='play'){if(save.reached>0)newGame(save.reached);else{storyScreen(1,'start1')}}
 else if(a==='new'){save.reached=0;persist();storyScreen(1,'start1')}
 else if(a==='start1')newGame(0);
 else if(a==='spage'){const [i,nx,pg]=String(v).split('|');storyScreen(+i,nx,+pg)}
 else if(a==='levels')levelsScreen();else if(a==='how')howScreen();else if(a==='how2'){howScreen();state='pause';ui.querySelector('[data-a="back"]').dataset.a='pauseback';ui.querySelector('[data-a="pauseback"]').addEventListener('click',()=>{state='play';pauseGame()})}
 else if(a==='back')titleScreen();else if(a==='pauseback'){}
 else if(a==='lvl')newGame(+v);else if(a==='locked')toast('Beat the level before it to unlock!');
 else if(a==='resume')resumeGame();else if(a==='restart'){hideUI();startLevel(G.li,G.levelStart)}
 else if(a==='quit'){G=null;titleScreen()}
 else if(a==='next'){if(G.li===3&&!G.storyDone)storyScreen(2,'next2');else if(G.finale)storyScreen(3,'win');else if(G.li+1<LEVELS.length)startLevel(G.li+1);else winScreen()}
 else if(a==='next2'){G.storyDone=1;startLevel(G.li+1)}
 else if(a==='win')winScreen();
 else if(a==='retry'){G.lives=5;G.score=G.levelStart.score;startLevel(G.li,G.levelStart)}
 else if(a==='again'){save.reached=0;persist();storyScreen(1,'start1')}}
function toggleMute(){AU.setMuted(!AU.muted);save.muted=AU.muted;persist();$('bMute').textContent=AU.muted?'🔇':'🔊';toast(AU.muted?'Sound off':'Sound on',900)}
$('bMute').addEventListener('click',e=>{e.stopPropagation();AU.unlock();toggleMute()});$('bPause').addEventListener('click',e=>{e.stopPropagation();pauseGame()});


/* ===== game flow + loop ===== */
function newGame(li){G={score:0,lives:5,gems:0,deaths:0};startLevel(li)}
function setRows(li){ROWS=LEVELS[li].rows||12;LVH=ROWS*TS}
function startLevel(li,snap){const keep=G||{score:0,lives:5,gems:0,deaths:0};if(snap){keep.score=snap.score;keep.gems=snap.gems}
 setRows(li);const L=buildLevel(li);G=Object.assign({},{score:keep.score,lives:keep.lives,gems:keep.gems,deaths:keep.deaths||0,storyDone:keep.storyDone||li>3,metPip:keep.metPip||0},{li,L,t:0,ents:[],shots:[],parts:[],texts:[],cam:{x:0,y:0},shake:0,hs:0,flash:null,boss:null,arena:null,cp:null,won:0,lvGems:0,lvStars:[0,0,0],banner:2.6,camDx:0,slow:0,finale:0});
 G.levelStart={score:G.score,gems:G.gems};const lv=LEVELS[li];G.p=newPlayer(3*TS,9*TS,'ride');G.p.hp=G.p.maxhp=lv.w>=2?4:3;spawnEnts();G.pip=L.pipAt?{x:L.pipAt.x,y:L.pipAt.y,face:-1,t:0,hide:0}:null;Object.assign(BOT,{plan:null,hold:0,stuck:0});camUpdate(0,true);
 hideUI();state='play';clearInput();AU.music(WORLDS[lv.w].song)}
function openCage(){const cg=G.L.cage;cg.open=1;AU.fx('free');burst(cg.x,cg.y-60,30,['#c8a060','#8a6a30','#ffe060'],320,0.9,5,900);shake(10);G.free={x:cg.x,y:cg.y,face:-1};G.cut=2.4;ftxt(cg.x,cg.y-150,'JINXY IS FREE!','#7aff7a',1)}
function levelClear(){if(G.won)return;G.won=1;G.wonT=G.finale?3.2:G.L.boss?0.6:1.4;AU.fx('clear');const st=save.stars[G.li]||[];G.lvStars.forEach((v,i)=>{if(v)st[i]=1});save.stars[G.li]=st;save.reached=Math.max(save.reached,Math.min(LEVELS.length-1,G.li+1));if(G.score>save.best)save.best=G.score;persist();
 for(let i=0;i<4;i++)setTimeout(()=>G&&G.p&&stars(G.p.x+rand(-60,60),G.p.y-rand(60,140),10),i*200)}
function respawn(){G.lives--;if(G.lives<=0){G.lives=0;overScreen();return}const p=G.p,cp=G.cp;const mode='ride';const np=newPlayer(cp?cp.x:3*TS,cp?cp.y:9*TS,mode);np.maxhp=p.maxhp;np.hp=p.maxhp;np.inv=2;
 if(G.boss&&G.boss.st!=='dead'){np.x=G.arena.x0+60;np.y=G.L.boss.y;G.shots.length=0;const b=G.boss;if(b.k!=='vex'&&b.k!=='bab'){b.st='idle';b.y=b.gy;b.vy=0;b.x=G.arena.x1-160}b.t=0}
 G.p=np;G.shots=G.shots.filter(s=>Math.abs(s.x-np.x)>300);camUpdate(0,true)}
function update(dt){G.t+=dt;frame++;const p=G.p;G.banner=Math.max(0,G.banner-dt);G.bossIntro=Math.max(0,(G.bossIntro||0)-dt);G.shake=Math.max(0,G.shake-dt*30);if(G.flash)G.flash.a-=dt*2;G.combo=Math.max(0,(G.combo||0)-dt);
 if(G.cut){G.cut-=dt;const f=G.free;if(f){f.x+=(p.x-f.x)*dt*1.5;f.face=sgn(p.x-f.x)}if(G.cut<=0.8&&p.mode==='foot'){setMode(p,'ride');p.hp=p.maxhp=3;G.free=null;stars(p.x,p.y-60,20);AU.fx('star');ftxt(p.x,p.y-130,'HOP ON, KELLY!','#ffe060',1)}if(G.cut<=0){G.cut=0;levelClear()}}
 if(!G.won||G.wonT>0)updatePlayer(p,dt);
 if(p.dead){G.deadT-=dt;if(G.deadT<=0){respawn();if(state!=='play')return}}
 if(G.L.boss&&!G.boss&&!G.won&&p.x>G.L.boss.x0+140)startBoss();
 updEnemies(dt);updShots(dt);updBoss(dt);updItems(dt);
 for(const q of G.parts){q.l-=dt;q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt}G.parts=G.parts.filter(q=>q.l>0);
 for(const t of G.texts){t.l-=dt;t.y-=40*dt}G.texts=G.texts.filter(t=>t.l>0);
 const ox=G.cam.x;camUpdate(dt);G.camDx=G.cam.x-ox;
 if(G.finale&&G.won&&!SIM&&Math.random()<0.35)burst(G.cam.x+Math.random()*viewW,G.cam.y+20,4,['#ff6aa8','#ffd23a','#7ad0ff','#7aff7a','#fff'],120,1.6,6,260);
 if(!SIM&&frame%10===0){const bd=$('bDive');if(bd)bd.classList.toggle('off',p.mode!=='swim')}
 if(G.won){G.wonT-=dt;if(G.wonT<=0&&state==='play'){clearScreen()}}}
let last=performance.now(),acc=0;
function loop(now){requestAnimationFrame(loop);let dt=Math.min(0.05,(now-last)/1000);last=now;if(window.__FIXDT)dt=window.__FIXDT;
 if(state==='play'&&G){for(let k=0;k<(window.__SPEED||1)&&state==='play';k++){readInput();let d=dt;if(G.hs>0){G.hs-=dt;d=0}if(G.slow>0){G.slow-=dt;d*=0.35}const n=d>1/60?2:1;for(let i=0;i<n;i++)update(d/n);G.dtR=dt}}else if(state!=='play')pollPad();
 render()}

/* physics look-ahead planner for the QA bot: simulates the real player code with candidate inputs */
function simRun(p0,plan,frames){const save={};for(const k in inp)save[k]=inp[k];SIM=1;const p=Object.assign({},p0);p.swing=null;p.atkHit=new Set();let best=p.x,ok=true,hurt=0;
 for(let f=0;f<frames;f++){const a=plan(f);inp.L=a.L||0;inp.R=a.R||0;inp.U=0;inp.D=0;inp.jumpP=a.jp||0;inp.jump=a.j||0;inp.actP=0;inp.act=0;inp.ramP=0;
  updatePlayer(p,1/60);if(p.dead){ok=false;break}if(p.simHurt){hurt=1;ok=false;break}best=Math.max(best,p.x)}
 SIM=0;for(const k in save)inp[k]=save[k];return{ok,x:best,end:p,onG:p.onG}}
function planJump(p){const C=[];C.push({n:'run',f:()=>({R:1}),hold:0});for(const h of[6,12,20,32])for(const d of[0,4,9,15])C.push({n:'j'+h+'d'+d,d,h,f:fr=>({R:1,jp:fr===d?1:0,j:fr>=d&&fr<d+h?1:0})});
 C.push({n:'back',f:fr=>fr<14?{L:1}:{R:1,jp:fr===22?1:0,j:fr>=22&&fr<54?1:0}});
 let best=null;for(const c of C){const r=simRun(p,c.f,95);if(!r.ok)continue;const sc=r.x-(c.n==='run'?0:6)-(c.d||0)*0.5+(r.onG?20:0);if(!best||sc>best.sc)best={c,sc,r}}return best}
/* ===== QA autopilot (only when window.__BOT is set by the test harness) ===== */
const BOT={hold:0,wait:0,swingRel:0,lastX:0,stuck:0,ramT:0};
function botInput(){const p=G.p,o={L:0,R:0,U:0,D:0,J:0,Jh:0,A:0,Y:0};if(p.dead||G.cut||G.won)return o;const ride=p.mode==='ride';const fx=p.x,fy=p.y;const tx=Math.floor(fx/TS),ty=Math.floor((fy-1)/TS);
 const groundAt=cx=>{for(let y=Math.max(0,ty-5);y<ROWS;y++){const k=tileAt(cx,y);if(solidK(k)||k===2||k===7)return y;if(k===5&&y>=ty)return -y}return 99};
 /* boss mode */
 if(G.boss&&G.boss.st!=='dead'){const b=G.boss,d=b.x-p.x,ad=Math.abs(d);
  for(const s of G.shots){if(s.k==='wave'&&Math.abs(s.x-p.x)<110&&sgn(p.x-s.x)===sgn(s.vx)&&p.onG){o.J=1;o.Jh=1}
   if(s.k!=='wave'&&Math.hypot(s.x-p.x,s.y-(p.y-40))<140&&s.vy>0&&p.onG&&BOT.ramT<=0&&ride){o.A=1;BOT.ramT=0.2}}
  BOT.ramT-=1/60;
  if(b.st==='dizzy'){if(ad>90){o[d>0?'R':'L']=1}if(ad<170&&p.onG&&BOT.ramT<=0){if(ride){o.Y=1;BOT.ramT=0.4}else o.A=1}if(b.k==='bab'&&p.onG&&ad<60){o.J=1;o.Jh=1}}
  else{const want=b.k==='bab'||b.k==='vex'?0:260;const A=G.arena;let goal=p.x;if(ad<want)goal=b.x+(b.x>(A.x0+A.x1)/2?-want-40:want+40);
   if(b.k==='vex'){goal=b.x+(b.st==='tele'?(d>0?-260:260):0);if(b.st==='dive')goal=p.x+(b.vx>0?-200:200)}
   if(b.k==='bab'){goal=b.perch?(b.x<(A.x0+A.x1)/2?A.x1-120:A.x0+120):p.x;if(!b.perch&&b.st!=='climb'&&ad<240)goal=b.x+(d>0?-300:300)}
   if(b.k==='croc'){const pool0=A.x0+10*TS,pool1=A.x0+17*TS;if(b.st==='dive'||b.st==='leap'){goal=p.x<(pool0+pool1)/2?A.x0+80:A.x1-80}else if(ad<240)goal=b.x+(d>0?-300:300);goal=goal>pool0-60&&goal<pool1+60?(p.x<pool0?pool0-80:pool1+80):goal}
   if((b.k==='tusk'&&b.st==='charge'||b.k==='cak'&&b.st==='leap')&&ad<200&&sgn(b.vx||-d)===sgn(-d)&&p.onG){o.J=1;o.Jh=1}
   goal=clamp(goal,A.x0+40,A.x1-40);if(Math.abs(goal-p.x)>20)o[goal>p.x?'R':'L']=1}
  if(!p.onG&&BOT.hold>0){o.Jh=1;BOT.hold--}if(o.J)BOT.hold=14;return o}
 /* swimming with Pip */
 if(p.mode==='swim')return botSwim(p,o);
 /* swinging */
 if(p.swing){BOT.plan=null;const s=p.swing;o.R=1;if(BOT.sw!==s){BOT.sw=s;BOT.swf=0}BOT.swf++;if(BOT.swf<10)return o;const nextH=G.L.hooks.find(h=>h.x>s.h.x+40&&h.x-s.h.x<330);if(s.a<-0.15&&s.av>0&&nextH&&Math.abs(nextH.x-p.x)<240&&p.x>s.h.x-10){o.J=1;BOT.grab=1}else if(!nextH&&s.a>0.25&&s.av>0){o.J=1}else if(nextH&&s.a>0.35&&s.av>0){o.J=1;BOT.grab=1}return o}
 o.R=1;
 /* executing a committed plan */
 if(BOT.plan&&ride){const hk=nearHook(p);const gc=groundAt(Math.floor(p.x/TS));if(hk&&hk.x>p.x-20&&!p.onG&&(gc===99||gc>=ROWS-1)){BOT.plan=null;BOT.grab=1}}
 if(BOT.plan){const f=BOT.pf++;const a=BOT.plan(f);o.R=a.R||0;o.L=a.L||0;if(a.jp)o.J=1;o.Jh=a.j?1:0;if(f>=BOT.plen||(f>4&&p.onG&&BOT.pj&&f>BOT.pjf)){BOT.plan=null}else{botCombat(o,p,ride);return o}}
 if(!p.onG){if(BOT.hold>0){o.Jh=1;BOT.hold--}
  if(ride){const hk=nearHook(p);const gc=groundAt(Math.floor(p.x/TS));if(hk&&hk.x>p.x-20&&(BOT.grab||BOT.needHook||((gc===99||gc>=ROWS-1)&&p.vy>-100))){o.A=1;BOT.grab=0;BOT.needHook=0}}
  return o}
 BOT.grab=0;
 if(G.L.cage&&!G.L.cage.open&&G.L.cage.x-p.x<110){o.R=1;BOT.pc=(BOT.pc||0)+1;if(BOT.pc%14===0)o.A=1;return o}
 const ftx=Math.floor((p.x+p.w/2+8)/TS);let gapW=0;for(let i=0;i<12;i++){const g=groundAt(ftx+i);if(g===99||g>=ROWS-1||g<0||g>ty+3)gapW++;else if(gapW)break;else if(i>2)break}
 const front=Math.floor((p.x+p.w/2+6)/TS);let wallH=0,wallK=0;for(let y=ty;y>=Math.max(0,ty-6);y--){const k=tileAt(front,y);if(solidK(k)){wallH++;wallK=k}else if(wallH)break;else if(y<ty-1)break}
 const hasHook=G.L.hooks.some(h=>h.x>p.x&&h.x-p.x<300);
 if(ride&&wallH>=3&&(wallK===3||wallK===4)){o.Y=1;return o}
 if(ride&&gapW>5&&hasHook){BOT.plan=null;if(gapW<=7||ftx*TS-p.x<p.w){o.J=1;o.Jh=1;BOT.hold=24;BOT.needHook=1}return o}
 const pl=planJump(p);if(pl){BOT.plan=pl.c.f;BOT.pf=0;BOT.plen=pl.c.n==='run'?8:Math.min(95,(pl.c.d||0)+(pl.c.h||32)+60);BOT.pj=pl.c.n!=='run';BOT.pjf=(pl.c.d||0)+6;const a=BOT.plan(BOT.pf++);o.R=a.R||0;o.L=a.L||0;if(a.jp)o.J=1;o.Jh=a.j?1:0}
 else{o.J=1;o.Jh=1;BOT.hold=30}
 botCombat(o,p,ride);
 if(Math.abs(p.x-BOT.lastX)<0.5){BOT.stuck++;if(BOT.stuck>60){o.J=1;o.Jh=1;BOT.hold=30;if(ride&&BOT.stuck%80===61)o.Y=1}}else BOT.stuck=0;BOT.lastX=p.x;
 return o}
function botSwim(p,o){const sea=G.L.seas.find(s=>p.x>=s.x0-20&&p.x<=s.x1+20);o.R=1;if(!sea)return o;const st=sea.top;BOT.sf=(BOT.sf||0)+1;
 const tx=Math.floor((p.x+p.w/2+14)/TS),near=Math.floor((p.x+p.w/2+4)/TS),pr=Math.floor((p.y-p.h/2)/TS),pb=Math.floor((p.y-4)/TS),pt=Math.floor((p.y-p.h+4)/TS);
 const blockAt=y=>{const k=tileAt(tx,y);return solidK(k)?k:0};let wall=0,crack=0;for(let y=pt;y<=pb;y++){const k=blockAt(y);if(k){wall=1;if(k===3)crack=1}}
 const hazard=[...G.ents].some(e=>!e.dead&&EDEF[e.k]&&EDEF[e.k].swim&&e.x>p.x-20&&e.x-p.x<150&&Math.abs(e.y-p.y)<70&&(e.k==='jelly'||(e.k==='puffer'&&e.puff>0.3)));
 let ty=st+2.4*TS;const tgt=G.L.stars.find(s=>!s.got&&s.x>p.x-30&&s.x-p.x<260&&s.y>st);if(tgt&&!hazard)ty=tgt.y+20;
 if(sea.x1-p.x<4*TS){ty=st-10;if(Math.abs(p.y-p.h*0.4-st)<40&&BOT.sf%12===0){o.J=1;o.Jh=1}}
 if(crack&&BOT.sf%10===0)o.A=1;else if(crack){}
 if(wall&&!crack){let free=null;for(let d=0;d<ROWS;d++){for(const y of [pr-d,pr+d]){if(y<Math.floor(st/TS)||y>=ROWS)continue;if(!solidK(tileAt(tx,y))&&!solidK(tileAt(tx,y-1))){free=y;break}}if(free!==null)break}if(free!==null)ty=free*TS+TS*0.9+20;if(Math.abs(p.y-ty)>14)o.R=0}
 if(hazard){ty=Math.min(ty,p.y)-90}
 for(const e of G.ents)if(!e.dead&&(e.k==='eel'||e.k==='shrimp'||(e.k==='puffer'&&e.puff<0.3))&&e.x>p.x&&e.x-p.x<130&&Math.abs(e.y-p.y)<60&&BOT.sf%9===0)o.A=1;
 if(p.y<ty-12)o.D=1;else if(p.y>ty+12)o.U=1;return o}
function botCombat(o,p,ride){let foe=null;for(const e of G.ents){if(e.dead||e.k==='food')continue;const dx=e.x-p.x;if(dx>-10&&dx<(ride?160:90)&&Math.abs(e.y-p.y)<80){foe=e;break}}
 for(const s of G.shots)if(s.k==='coconut'&&Math.abs(s.x-p.x)<130&&ride)o.Y=1;
 if(foe){if(ride)o.Y=1;else if(Math.abs(foe.x-p.x)<70&&frame%8===0)o.A=1}}
/* ===== boot ===== */
resize();bindSurface(cv);bindSurface($('pad'));bindBtn($('bJump'),'jump');bindBtn($('bAct'),'act');bindBtn($('bDive'),'dive');
loadArt(f=>{const b=document.querySelector('#load .bar i');if(b)b.style.width=Math.round(f*100)+'%'}).then(()=>{$('load').remove();titleScreen()});
requestAnimationFrame(loop);
window.__G=()=>G;


