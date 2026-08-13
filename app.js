(function(){
'use strict';
var TARGET=938000000;
var STATUS={active:21,sample:11,nego:2,total:34};
var COUNTRY={
'Ai Circle Lens':'미국','Bae Lenses':'미국','MSAPPEAL PTY LTD':'호주',
'BERRY CONTACT LENSES':'필리핀','iBlinkPh':'필리핀','Green Apple Co':'쿠웨이트',
'Pretty Kikay Collection FZC':'UAE','Linza 312':'키르기스스탄','Linzy kg':'키르기스스탄',
'IE RS STORE':'카자흐스탄','IP Ydyrysbekov':'카자흐스탄',
'PT JLo international group':'인도네시아','Lens by Seoul':'인도네시아',
'Beautology Company Limited Partnership':'태국','SIRINYASHOP CO., LTD':'태국',
'SU-ON LENS':'베트남','Lens Xoan':'베트남','lensforgirlss':'베트남','Hien lens':'베트남',
'Vi Feerie':'베트남','GLOWTIME VIETNAM COMPANY LIMITED':'베트남','VINA TEB CO':'베트남',
'Hikoco':'뉴질랜드','Glorry Beauty':'캄보디아','Nexsus Co., Ltd.':'일본','주식회사AOI':'일본',
'Tafasel optical(Iraq)':'이라크','KUMOKUMO HK':'홍콩','Uniqso Holdings Sdn Bhd':'말레이시아'};
var BM={'Ai Circle Lens':"Ai's circle lens",'BERRY CONTACT LENSES':'Berry Lens',
'Glorry Beauty':'Gloryy Beauty','Green Apple Co':'Green Apple','Hien lens':'Hien Lens',
'Hikoco':'HiKOCO','IP Ydyrysbekov':'IE RS Store','IE RS STORE':'IE RS Store',
'Lens by Seoul':'Lensbyseoul','Linza 312':'Malika / Linza321','MSAPPEAL PTY LTD':'Msappeal pty LTD',
'PT JLo international group':'PT JLO','SIRINYASHOP CO., LTD':'Sirinya co ltd(Luvly lens)',
'SU-ON LENS':'Suon Lens','lensforgirlss':'Lensforgirlss','Vi Feerie':'Vi Feerie Lens',
'주식회사AOI':'AOI (JP)','Beautology Company Limited Partnership':'Beautology Company Limited'};
function bmName(n){return BM[n]||n}

document.getElementById('app').innerHTML=
'<h1>B2B 수출 대시보드 — IM OLOLA</h1>'+
'<div class="sub">이카운트 2024~2026 · 소통 로그 기준일: 2026-07-07 · 데이터 기준일: 2026-08-13 <span style="color:#aab">※ 정적 스냅샷</span></div>'+
'<div class="toolbar">'+
'<div class="seg" id="granSeg"><button data-g="week">주간</button><button data-g="month" class="on">월간</button><button data-g="year">연간</button></div>'+
'<div class="seg" id="curSeg"><button data-c="krw" class="on">KRW</button><button data-c="usd">USD</button></div>'+
'</div>'+
'<div class="weekhero" id="weekHero"></div>'+
'<div class="kpis" id="kpis"></div>'+
'<div class="grid2"><div>'+
'<div class="panel">'+
'<div class="nav-row"><button class="nav-btn" id="prevBtn">&#8592;</button><span id="periodLabel"></span><button class="nav-btn" id="nextBtn">&#8594;</button></div>'+
'<div id="chartWrap"></div><div class="legend" id="legend"></div>'+
'<div class="hint">막대 클릭 → 기간별 업체 매출 + 소통 이력</div>'+
'</div>'+
'<div id="detailPanel" style="display:none">'+
'<div class="panel"><div class="period-title" id="buyerTitle"></div><div class="tscroll"><table><thead><tr><th>업체명</th><th>KRW</th><th>USD</th><th>비중</th></tr></thead><tbody id="buyerBody"></tbody></table></div></div>'+
'<div class="panel"><h2>소통 이력 <span style="font-weight:400;color:#8a93a3" id="commHint"></span></h2><div class="chips" id="commChips"></div><div id="commBody"></div></div>'+
'</div></div>'+
'<div>'+
'<div class="panel"><h2 id="topTitle">Top 바이어</h2><div class="blist" id="topList"></div></div>'+
'<div class="panel"><h2 id="ctryTitle">국가별 매출</h2><div class="blist" id="ctryList"></div></div>'+
'</div></div>';

var state={gran:'month',cur:'krw',page:0,sel:null,selBuyer:null,commType:'전체'};
var allBuyersForPeriod=[];

function rateOf(y){return(+y)>=2025?1450:1350}
function krwOf(r){return r.krw>0?r.krw:r.usd*rateOf(r.year)}
function usdOf(r){return r.usd>0?r.usd:r.krw/rateOf(r.year)}
function val(r){return state.cur==='krw'?krwOf(r):usdOf(r)}
function fmtKRW(v){if(!v||v<0)return'–';if(v>=1e8)return'₩'+(v/1e8).toFixed(1)+'억';if(v>=1e4)return'₩'+(v/1e4).toFixed(0)+'만';return'₩'+Math.round(v).toLocaleString()}
function fmtUSD(v){if(!v||v<0)return'–';if(v>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(v>=1e3)return'$'+(v/1e3).toFixed(1)+'k';return'$'+v.toLocaleString('en',{maximumFractionDigits:0})}
function fmt(v){return state.cur==='krw'?fmtKRW(v):fmtUSD(v)}

function weekStart(wk){var s=WEEK_MAP[wk];if(s)return new Date(s+'T00:00:00');var p=wk.split('-W');var d=new Date(+p[0],0,1+(+p[1]-1)*7);d.setDate(d.getDate()-(d.getDay()||7)+1);return d}
function weekLabel(wk){var d=weekStart(wk);var e=new Date(d);e.setDate(d.getDate()+6);return(d.getMonth()+1)+'/'+d.getDate()+'~'+(e.getMonth()+1)+'/'+e.getDate()}
function monthLabel(m){var p=m.split('-');return"'"+p[0].slice(2)+'/'+p[1]}
function monthMinus(m,n){var p=m.split('-');var y=+p[0],mm=+p[1]-n;while(mm<1){mm+=12;y--}return y+'-'+String(mm).padStart(2,'0')}

function getPages(){
 if(state.gran==='year')return[['2024','2025','2026']];
 if(state.gran==='month'){var ms=[];ECOUNT.forEach(function(r){if(ms.indexOf(r.month)<0)ms.push(r.month)});ms.sort();var pg=[];for(var i=0;i<ms.length;i+=12)pg.push(ms.slice(i,i+12));return pg}
 var ws=[];ECOUNT.forEach(function(r){if(ws.indexOf(r.week)<0)ws.push(r.week)});ws.sort();var pg2=[];for(var j=0;j<ws.length;j+=16)pg2.push(ws.slice(j,j+16));return pg2}
function curPage(){var pg=getPages();var i=Math.min(Math.max(0,state.page),pg.length-1);return{keys:pg[i],idx:i,total:pg.length}}
function keyOf(r){return state.gran==='year'?r.year:state.gran==='month'?r.month:r.week}
function aggBy(keys){var m={};keys.forEach(function(k){m[k]=0});ECOUNT.forEach(function(r){var k=keyOf(r);if(k in m)m[k]+=val(r)});return keys.map(function(k){return m[k]})}

function dHtml(a,b,label){if(!b)return'';var p=(a-b)/b*100;var up=p>=0;return'<span class="delta '+(up?'up':'down')+'">'+(up?'▲':'▼')+' '+Math.abs(p).toFixed(0)+'%</span> '+label}

function renderKPIs(){
 var months=[];ECOUNT.forEach(function(r){if(months.indexOf(r.month)<0)months.push(r.month)});months.sort();
 var latest=months[months.length-1];
 var ly=latest.split('-')[0], lm=+latest.split('-')[1];
 var lastFull=monthMinus(latest,1), before=monthMinus(latest,2);
 var yoy=(+lastFull.split('-')[0]-1)+'-'+lastFull.split('-')[1];
 function sumM(m){var s=0;ECOUNT.forEach(function(r){if(r.month===m)s+=val(r)});return s}
 var mtd=sumM(latest), cntL=ECOUNT.filter(function(r){return r.month===latest}).length;
 var mLF=sumM(lastFull), mBefore=sumM(before), mYoy=sumM(yoy);
 var ytdCur=0,ytdKRW=0;ECOUNT.forEach(function(r){if(r.year===ly){ytdCur+=val(r);ytdKRW+=krwOf(r)}});
 var pctT=ytdKRW/TARGET*100;
 document.getElementById('kpis').innerHTML=
 '<div class="kpi"><div class="lbl">'+lm+'월 매출 (진행중)</div><div class="val">'+fmt(mtd)+'</div><div class="sub2">거래 '+cntL+'건 · ~7/8 기준</div></div>'+
 '<div class="kpi"><div class="lbl">'+(+lastFull.split('-')[1])+'월 매출 (전월)</div><div class="val">'+fmt(mLF)+'</div><div class="sub2">'+dHtml(mLF,mBefore,'전월比')+' &nbsp;'+dHtml(mLF,mYoy,'전년比')+'</div></div>'+
 '<div class="kpi"><div class="lbl">'+ly+' 누적 매출 (YTD)</div><div class="val">'+fmt(ytdCur)+'</div><div class="sub2">목표 ₩9.38억 대비 <b>'+pctT.toFixed(1)+'%</b></div><div class="gaugewrap"><div class="gaugebar" style="width:'+Math.min(100,pctT)+'%"></div></div></div>'+
 '<div class="kpi"><div class="lbl">바이어 현황</div><div class="val">'+STATUS.total+'개사</div><div class="statusrow"><span>활성 '+STATUS.active+'</span><span>샘플 '+STATUS.sample+'</span><span>협의중 '+STATUS.nego+'</span></div></div>';
 renderWeekHero();
}

function renderWeekHero(){
 var weeks=[];ECOUNT.forEach(function(r){if(weeks.indexOf(r.week)<0)weeks.push(r.week)});weeks.sort();
 var wCur=weeks[weeks.length-1], wPrev=weeks[weeks.length-2];
 function sumW(w){var s=0;ECOUNT.forEach(function(r){if(r.week===w)s+=val(r)});return s}
 var vCur=sumW(wCur), cnt=ECOUNT.filter(function(r){return r.week===wCur}).length;
 var vPrev=wPrev?sumW(wPrev):0;
 document.getElementById('weekHero').innerHTML=
 '<div class="wh-box"><div class="wh-lbl">이번주 매출 (진행중) · '+weekLabel(wCur)+'</div><div class="wh-val">'+fmt(vCur)+'</div><div class="wh-sub">거래 '+cnt+'건</div></div>'+
 '<div class="wh-div"></div>'+
 '<div class="wh-box wh-prev"><div class="wh-lbl">전주 · '+(wPrev?weekLabel(wPrev):'–')+'</div><div class="wh-val2">'+fmt(vPrev)+'</div><div class="wh-sub">'+dHtml(vCur,vPrev,'전주比')+'</div></div>';
}

function renderChart(){
 var cp=curPage(), keys=cp.keys, idx=cp.idx, total=cp.total;
 var values=aggBy(keys);
 var prev=null;
 if(state.gran==='month'){
  var pm={};
  var pk=keys.map(function(k){var p=k.split('-');return(+p[0]-1)+'-'+p[1]});
  pk.forEach(function(k){pm[k]=0});
  ECOUNT.forEach(function(r){if(r.month in pm)pm[r.month]+=val(r)});
  prev=pk.map(function(k){return pm[k]});
 }
 document.getElementById('prevBtn').disabled=idx<=0;
 document.getElementById('nextBtn').disabled=idx>=total-1;
 var pl=document.getElementById('periodLabel');
 if(state.gran==='year')pl.textContent='2024~2026년';
 else if(state.gran==='month')pl.textContent=(keys[0]?keys[0].split('-')[0]:'')+'년';
 else{var s0=weekStart(keys[0]),e0=weekStart(keys[keys.length-1]);pl.textContent=s0.getFullYear()+'/'+(s0.getMonth()+1)+'~'+e0.getFullYear()+'/'+(e0.getMonth()+1)}
 var W=800,H=250,PL=64,PR=10,PT=14,PB=44,cw=W-PL-PR,ch=H-PT-PB;
 var maxV=Math.max.apply(null,values.concat(prev||[0],[1]));
 var n=keys.length, slot=cw/n, bw=Math.min(slot*0.5,44);
 var s='';
 for(var g=0;g<=4;g++){var gy=PT+ch-ch*g/4;s+='<line x1="'+PL+'" y1="'+gy+'" x2="'+(W-PR)+'" y2="'+gy+'" stroke="#eef1f5"/><text x="'+(PL-6)+'" y="'+(gy+4)+'" text-anchor="end" font-size="10" fill="#8a93a3">'+fmt(maxV*g/4)+'</text>'}
 keys.forEach(function(k,i){
  var cx=PL+slot*i+slot/2;
  if(prev){var pv=prev[i]||0,ph=ch*pv/maxV;s+='<rect x="'+(cx-bw/2-3)+'" y="'+(PT+ch-ph)+'" width="'+bw+'" height="'+Math.max(ph,0)+'" rx="3" fill="#c9d2de"/>'}
  var v=values[i]||0,h=ch*v/maxV;
  var fill=state.sel===k?'#e8963c':'#244061';
  var bx=prev?cx-bw/2+3:cx-bw/2;
  s+='<rect class="cbar" data-k="'+k+'" x="'+bx+'" y="'+(PT+ch-h)+'" width="'+bw+'" height="'+Math.max(h,1.5)+'" rx="3" fill="'+fill+'" style="cursor:pointer"/>';
  if(v>0)s+='<text x="'+(bx+bw/2)+'" y="'+(PT+ch-h-4)+'" text-anchor="middle" font-size="9.5" fill="#4a5568" font-weight="600">'+fmt(v)+'</text>';
  var lab=state.gran==='year'?k+'년':state.gran==='month'?monthLabel(k):weekLabel(k);
  s+='<text x="'+cx+'" y="'+(H-24)+'" text-anchor="middle" font-size="9.5" fill="#8a93a3" transform="rotate(-28 '+cx+' '+(H-24)+')">'+lab+'</text>';
 });
 document.getElementById('chartWrap').innerHTML='<svg class="svgchart" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
 document.getElementById('legend').innerHTML=prev?'<span><i style="background:#244061"></i>'+(keys[0]?keys[0].split('-')[0]:'')+'년</span><span><i style="background:#c9d2de"></i>전년 동월</span>':'';
 var bars=document.querySelectorAll('#chartWrap rect.cbar');
 for(var b=0;b<bars.length;b++){bars[b].addEventListener('click',function(){state.sel=this.dataset.k;renderChart();showDetail(this.dataset.k)})}
}

function renderSide(){
 var yr='2026';
 var per={};ECOUNT.forEach(function(r){if(r.year===yr)per[r.buyer]=(per[r.buyer]||0)+val(r)});
 var top=Object.keys(per).map(function(b){return[b,per[b]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
 var ytd=0;Object.keys(per).forEach(function(b){ytd+=per[b]});
 var mx=top.length?top[0][1]:1;
 document.getElementById('topTitle').textContent='Top 바이어 ('+yr+' YTD)';
 document.getElementById('topList').innerHTML=top.map(function(e){return'<div class="brow"><div class="t"><span class="nm">'+e[0]+'</span><span class="amt">'+fmt(e[1])+' · '+Math.round(e[1]/ytd*100)+'%</span></div><div class="bar"><div class="fill" style="width:'+(e[1]/mx*100)+'%"></div></div></div>'}).join('');
 var pc={};ECOUNT.forEach(function(r){if(r.year===yr){var c=COUNTRY[r.buyer]||'기타';pc[c]=(pc[c]||0)+val(r)}});
 var tc=Object.keys(pc).map(function(c){return[c,pc[c]]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
 var mc=tc.length?tc[0][1]:1;var tct=0;Object.keys(pc).forEach(function(c){tct+=pc[c]});
 document.getElementById('ctryTitle').textContent='국가별 매출 ('+yr+' YTD)';
 document.getElementById('ctryList').innerHTML=tc.map(function(e){return'<div class="brow c"><div class="t"><span class="nm">'+e[0]+'</span><span class="amt">'+fmt(e[1])+' · '+Math.round(e[1]/tct*100)+'%</span></div><div class="bar"><div class="fill" style="width:'+(e[1]/mc*100)+'%"></div></div></div>'}).join('');
}

function showDetail(period){
 document.getElementById('detailPanel').style.display='block';
 var title;
 if(state.gran==='year')title=period+'년';
 else if(state.gran==='month'){var p=period.split('-');title=p[0]+'년 '+(+p[1])+'월'}
 else{var d=weekStart(period);var e=new Date(d);e.setDate(d.getDate()+6);title=d.getFullYear()+'년 '+(d.getMonth()+1)+'/'+d.getDate()+'~'+(e.getMonth()+1)+'/'+e.getDate()}
 document.getElementById('buyerTitle').textContent=title+' 업체별 매출';
 var key=state.gran==='year'?'year':state.gran==='month'?'month':'week';
 var rows=ECOUNT.filter(function(r){return r[key]===period});
 var bm={};
 rows.forEach(function(r){if(!bm[r.buyer])bm[r.buyer]={krw:0,usd:0,eq:0};bm[r.buyer].krw+=r.krw;bm[r.buyer].usd+=r.usd;bm[r.buyer].eq+=krwOf(r)});
 var list=Object.keys(bm).map(function(b){return[b,bm[b]]}).sort(function(a,b){return b[1].eq-a[1].eq});
 var tot=0;list.forEach(function(e){tot+=e[1].eq});
 allBuyersForPeriod=list.map(function(e){return e[0]});
 function renderRows(){
  document.getElementById('buyerBody').innerHTML=list.map(function(e){
   var b=e[0],v=e[1],sel=state.selBuyer===b;
   return'<tr style="cursor:pointer;'+(sel?'background:#e8f0fb;font-weight:700':'')+'" data-buyer="'+b+'"><td>'+b+(sel?' ▶':'')+'</td><td>'+fmtKRW(v.krw)+'</td><td>'+fmtUSD(v.usd)+'</td><td>'+(tot?Math.round(v.eq/tot*100):0)+'%</td></tr>'}).join('');
  var trs=document.querySelectorAll('#buyerBody tr');
  for(var t=0;t<trs.length;t++){trs[t].addEventListener('click',function(){var b=this.dataset.buyer;state.selBuyer=state.selBuyer===b?null:b;renderRows();showComm()})}
 }
 state.selBuyer=null;renderRows();showComm();
}

var TYPES=['전체','주문','샘플','서류','클레임','일반문의','기타'];
function typeOf(t){return TYPES.indexOf(t)>0?t:'기타'}
function showComm(){
 var buyers=state.selBuyer?[state.selBuyer]:allBuyersForPeriod;
 var names={};buyers.forEach(function(b){names[bmName(b).toLowerCase()]=1});
 var logs=COMM_LOGS.filter(function(l){return names[(l.buyer||'').toLowerCase()]});
 document.getElementById('commChips').innerHTML=TYPES.map(function(t){return'<button class="chip'+(state.commType===t?' on':'')+'" data-t="'+t+'">'+t+'</button>'}).join('');
 var chips=document.querySelectorAll('#commChips .chip');
 for(var c=0;c<chips.length;c++){chips[c].addEventListener('click',function(){state.commType=this.dataset.t;showComm()})}
 if(state.commType!=='전체')logs=logs.filter(function(l){return typeOf(l.type)===state.commType});
 logs=logs.slice().sort(function(a,b){return(b.date||'').localeCompare(a.date||'')}).slice(0,60);
 document.getElementById('commHint').textContent=state.selBuyer?'('+bmName(state.selBuyer)+')':'('+buyers.length+'개 업체)';
 if(!logs.length){document.getElementById('commBody').innerHTML='<div class="msg">소통 기록 없음</div>';return}
 document.getElementById('commBody').innerHTML=logs.map(function(l){
  return'<div class="comm-item'+(l.type==='클레임'?' claim':'')+'"><div class="comm-date">'+l.date+'</div><div class="comm-buyer">'+l.buyer+'</div><div class="comm-type t'+typeOf(l.type)+'">'+(l.type||'–')+'</div><div><div class="comm-content">'+(l.content||'–')+'</div>'+(l.followup?'<div class="comm-followup">→ '+l.followup+'</div>':'')+'</div></div>'}).join('');
}

function renderAll(){renderKPIs();renderChart();renderSide()}

var gbs=document.querySelectorAll('#granSeg button');
for(var i1=0;i1<gbs.length;i1++){gbs[i1].addEventListener('click',function(){
 state.gran=this.dataset.g;state.page=getPages().length-1;state.sel=null;
 var all=document.querySelectorAll('#granSeg button');for(var x=0;x<all.length;x++)all[x].classList.toggle('on',all[x]===this);
 document.getElementById('detailPanel').style.display='none';renderChart()})}
var cbs=document.querySelectorAll('#curSeg button');
for(var i2=0;i2<cbs.length;i2++){cbs[i2].addEventListener('click',function(){
 state.cur=this.dataset.c;
 var all=document.querySelectorAll('#curSeg button');for(var x=0;x<all.length;x++)all[x].classList.toggle('on',all[x]===this);
 renderAll();if(state.sel)showDetail(state.sel)})}
document.getElementById('prevBtn').addEventListener('click',function(){state.page=curPage().idx-1;renderChart()});
document.getElementById('nextBtn').addEventListener('click',function(){state.page=curPage().idx+1;renderChart()});

state.page=getPages().length-1;
var ms0=[];ECOUNT.forEach(function(r){if(ms0.indexOf(r.month)<0)ms0.push(r.month)});ms0.sort();
state.sel=ms0[ms0.length-1];
renderAll();
showDetail(state.sel);
})();
