import './styles.css';
import {chapters,parts,environments,floors,cultures,futures,gifts,quizzes,archiveTitles} from './content.js';
import {TimberHouse} from './house.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconPaths={
 house:'M3 11 12 4l9 7M5 11h14M7 11v10m10-10v10M7 17h10M10 11v6m4-6v6',
 mountain:'m2 19 7-13 5 9 3-5 5 9H2Zm4-7 3 2 2-2',
 sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 flower:'M12 12C2 11 5 0 12 8c7-8 10 3 0 4Zm0 0c-2 10-12 4-4-2m4 2c10 2 4 12-2 4M12 12v10',
 joint:'M3 7 8 4l13 8-5 3L3 7Zm5-3v7m8 4v6l5-3v-6M3 7v6l13 8M5 18 18 5m-7 15L20 9',
 leaf:'M20 3C5 1 2 11 6 17c8 7 16-2 14-14ZM5 21 17 7m-8 8h6M12 10V6',
 rain:'M5 13a4 4 0 0 1 0-8 6 6 0 0 1 11-1 4 4 0 1 1 3 9H5Zm2 3-1 4m6-4-1 4m6-4-1 4',
 wind:'M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h5a2 2 0 1 1-2 2',
 arrow:'M4 12h16m-6-6 6 6-6 6',
 down:'M12 3v18m-6-6 6 6 6-6',
 book:'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3V4Zm9 2v15',
 close:'m5 5 14 14M19 5 5 19',
 check:'m5 12 4 4L20 5',
 rotate:'M3 10a9 9 0 1 1 2 9M3 4v6h6',
 expand:'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6',
 spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',
 pin:'M18 9c0 5-6 12-6 12S6 14 6 9a6 6 0 1 1 12 0Zm-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
 download:'M12 2v13m-5-5 5 5 5-5M4 16v5h16v-5',
 menu:'M3 6h18M3 12h18M3 18h18',
 plus:'M12 4v16M4 12h16',
 minus:'M4 12h16',
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name]||iconPaths.house}"/></svg>`;
const source=(page)=>`<button class="source-link" data-source="${page}">${icon('book')} 原稿 · 第 ${page} 页 ↗</button>`;
let saved=[];try{saved=JSON.parse(localStorage.getItem('qianlou-stamps')||'[]')}catch{}
const stamps=new Set(Array.isArray(saved)?saved.filter(id=>chapters.some(c=>c.id===id)):[]);
let materials=null,archiveDoc='work-pdf',archivePage=0,archiveZoom=1,quizIndex=0,quizScore=0,quizAnswered=false,buildStage=0,selectedPiece=null;
let model,buildModel;
document.querySelector('#app').innerHTML=`
<header class="site-header">
  <a class="brand" href="#top" aria-label="黔楼妙计，返回首页"><span class="brand-mark">${icon('house')}</span><span class="brand-name">黔楼妙计<small>山居智慧 · 数字手记</small></span></a>
  <nav class="main-nav" aria-label="主导航"><a href="#architecture">读建筑</a><a href="#life">看生活</a><a href="#workshop">玩一玩</a><button data-open-archive>原稿资料馆 <span>↗</span></button></nav>
  <button class="passport-button" data-passport>${icon('book')}<span>探索手册</span><b id="stamp-count">${stamps.size}/6</b></button>
  <button class="menu-toggle icon-button" aria-label="展开导航" aria-expanded="false">${icon('menu')}</button>
</header>
<main>
<section class="hero" id="top">
  <div class="hero-contours" aria-hidden="true"><svg viewBox="0 0 1300 750"><g fill="none" stroke="currentColor" stroke-width=".7">${Array.from({length:8},(_,i)=>`<path d="M${380+i*27} -40C${650+i*14} 180 ${220+i*50} 320 ${590+i*32} 570S${840+i*30} 800 ${1100+i*30} 680"/>`).join('')}</g></svg></div>
  <div class="hero-copy"><div class="eyebrow"><span class="tiny-square"></span> 贵州山地建筑探索计划 <span class="edition">VOL. 001</span></div>
    <h1>在山间，<br>把日子<span class="ink-accent">架起来。</span></h1>
    <p class="hero-subtitle">一栋吊脚楼，一方水土的生活智慧。</p>
    <p class="hero-description">沿着木梯向上，穿过风、雨与炊烟。<br>用眼睛发现，用双手拆解，读懂贵州的山居故事。</p>
    <a class="button primary" href="#architecture">推开山居的门 ${icon('arrow')}</a>
    <button class="text-button hero-quiz" data-start-quiz>先来一场山居挑战 <span>↗</span></button>
    <div class="hero-footnote"><span>GUIZHOU / STILT HOUSE</span><span class="small-line"></span><span>山地 · 木构 · 人间烟火</span></div>
  </div>
  <div class="hero-art">
    <div class="hero-orbit" aria-hidden="true"></div><div class="art-stamp" aria-hidden="true">山<br>居<br>有<br>智</div>
    <img src="/assets/hero-house.webp" class="hero-house" alt="原稿中的吊脚楼示意插画：坡屋顶、木构外廊与顺应山势的吊脚支柱" width="628" height="770" fetchpriority="high" />
    <button class="hero-label label-roof" data-explore-part="roof"><i></i><span>青瓦覆顶<small>让雨，顺势而下</small></span></button>
    <button class="hero-label label-frame" data-explore-part="beam"><i></i><span>木构相合<small>一榫一卯的秩序</small></span></button>
    <button class="hero-label label-stilts" data-explore-part="stilts"><i></i><span>架空而居<small>把生活托离地面</small></span></button>
    <span class="art-caption">图源：原稿设计插画 / 非实景测绘</span>
  </div>
  <a class="scroll-note" href="#chapter-index">向山里走 ${icon('down')}</a>
</section>
<div class="chapter-index" id="chapter-index"><span class="index-label">翻开这本<br><strong>山居手记</strong></span>${chapters.map(c=>`<a href="#${c.id}" class="chapter-item"><span class="chapter-num">${c.n}</span>${icon(c.icon)}<strong>${c.name}</strong><small>${c.sub}</small></a>`).join('')}</div>

<section class="chapter architecture section-pad" id="architecture">
  <div class="section-heading"><div><div class="eyebrow">01 / THE ART OF BUILDING</div><h2>木与木之间，<em>藏着一栋楼。</em></h2></div><p>试着转动它，拆开它。<br>从一根柱子开始，认识木构的秩序。</p></div>
  <div class="architecture-panel">
    <aside class="part-inspector"><div class="inspector-title">构件观察簿 <span>FIELD NOTES</span></div><div class="part-list">${parts.map((p,i)=>`<button class="part-button ${p.id==='stilts'?'active':''}" data-part-select="${p.id}" aria-pressed="${p.id==='stilts'}"><span>0${i+1}</span>${p.name}<b>↗</b></button>`).join('')}</div><div class="part-detail" id="part-detail" aria-live="polite"></div></aside>
    <div class="model-area"><div class="model-topbar"><div class="segmented" aria-label="模型展示方式"><button class="active" data-model-mode="whole" aria-pressed="true">整体观</button><button data-model-mode="explode" aria-pressed="false">拆解观</button><button data-model-mode="force" aria-pressed="false">受力路径</button></div><button class="icon-button" id="reset-model" aria-label="重置模型视角">${icon('rotate')}</button></div>
      <div class="model-canvas"><div class="model-grid" aria-hidden="true"></div><svg id="house-model" viewBox="0 0 840 600" role="img" aria-label="可旋转的吊脚楼木构示意模型，使用左侧按钮选择构件"></svg><span class="model-hint">${icon('spark')} 点选左侧构件，发现营造细节</span><span class="compass" aria-hidden="true">N<br>✧</span></div>
      <div class="model-controls"><label>${icon('rotate')}<span>转动视角</span><input id="rotation" type="range" min="-180" max="180" value="-32" aria-label="转动模型视角" /></label><div class="zoom-controls"><button class="icon-button" id="zoom-out" aria-label="缩小模型">${icon('minus')}</button><button class="icon-button" id="zoom-in" aria-label="放大模型">${icon('plus')}</button></div></div>
      <div class="model-footnote"><span>木构关系示意 · 非测绘模型</span><span id="model-mode-note">观察构件之间的空间关系</span></div>
    </div>
  </div>
  <div class="architecture-bottom"><p><span class="drop-cap">榫</span><strong>卯相合，构件相连。</strong>柱与梁构成骨架，楼板托起日常，廊道把房间与山景连接起来。不同地区的吊脚楼，形制与细部也各有不同。</p>${source(2)}</div>
</section>

<section class="chapter landscape section-pad" id="landscape">
  <div class="section-heading"><div><div class="eyebrow">02 / IN CONVERSATION WITH THE LAND</div><h2>先读山，<em>再读楼。</em></h2></div><p>山有高低，雨有来路，风有去处。<br>建筑的形状，是对环境的回应。</p></div>
  <div class="landscape-layout"><div class="environment-art" id="environment-art" data-weather="rain"><div class="art-top-note">山水适应实验室 <span>INTERACTIVE FIELD STUDY</span></div><img loading="lazy" src="/assets/nature-house.webp" alt="原稿中的山地环境适应示意插画" width="571" height="570"/><div class="weather-overlay rain-overlay" aria-hidden="true">${Array.from({length:26},(_,i)=>`<i style="--x:${6+(i*17)%89}%;--delay:${(i%7)*-.34}s"></i>`).join('')}</div><svg class="wind-overlay" viewBox="0 0 650 500" aria-hidden="true"><path d="M10 270C170 140 270 360 640 220M0 340C240 230 340 430 650 310M20 170C230 80 350 240 610 120"/></svg><div class="slope-line" aria-hidden="true"></div><span class="art-caption">原稿插画 / 动效仅说明原理</span></div>
    <div class="environment-copy"><div class="weather-tabs">${environments.map((e,i)=>`<button class="${i===0?'active':''}" data-weather="${e.id}" aria-pressed="${i===0}">${icon(e.icon)}${e.name}</button>`).join('')}</div><div id="environment-detail" aria-live="polite"></div>
      <div class="region-note"><span class="region-symbol">${icon('pin')}</span><div><span class="micro-label">不止一处的山居智慧</span><h4>贵州 · 湘西 · 广西北部</h4><p>原稿将这些地区列为主要分布线索，提及苗族、侗族等聚落。本页聚焦贵州，不用未核实的百分比划分各地数量。</p></div></div>${source(5)}</div>
  </div>
  <details class="history-note"><summary><span>一页建筑时间札记</span><span>干栏传统 · 地域形态 · 村寨生活 · 当代传承</span>${icon('plus')}</summary><div class="history-grid"><article><b>干栏传统</b><p>从抬升居住空间的思路，理解建筑与潮湿、多水环境的关系。</p></article><article><b>地域形态</b><p>当地材料、营造技艺与地形，共同塑造多样的木构民居。</p></article><article><b>村寨生活</b><p>房屋与道路、邻里、生产活动相连，形成可居可用的聚落。</p></article><article><b>当代传承</b><p>保护、修缮与活化，让传统营造与新的生活需求继续相遇。</p></article></div><small>依据原稿第 1 页作定性梳理，不将未考证的年代线索作为精确建筑史。</small></details>
</section>

<section class="chapter life section-pad" id="life">
  <div class="section-heading"><div><div class="eyebrow">03 / A HOUSE FULL OF LIFE</div><h2>楼有几层，<em>日子就有几重。</em></h2></div><p>从楼下的柴火，到阁楼的收成。<br>点一层，走进一层生活。</p></div>
  <div class="life-layout"><div class="life-copy"><div class="floor-selector" aria-label="选择观察楼层">${[...floors].reverse().map(f=>`<button data-floor="${f.id}" class="${f.id===1?'active':''}" aria-pressed="${f.id===1}"><span>${f.num}</span><strong>${f.name}</strong>${icon('arrow')}</button>`).join('')}</div><div id="floor-detail" aria-live="polite"></div><p class="small-note">这是原稿采用的三层生活示意，具体层数、布局和用途会因村寨与家庭而异。</p>${source(3)}</div>
    <div class="life-visual" data-floor="1"><img loading="lazy" src="/assets/living-house.webp" width="641" height="877" alt="原稿生活剖面插画，上部储藏、中部围坐火塘、下部生产储物"/><button class="floor-hotspot top" data-floor="2" aria-label="观察储藏层"><span>03</span> 收获</button><button class="floor-hotspot middle active" data-floor="1" aria-label="观察居住层"><span>02</span> 烟火</button><button class="floor-hotspot bottom" data-floor="0" aria-label="观察架空层"><span>01</span> 劳作</button><div class="floor-focus" aria-hidden="true"></div><span class="art-caption">原稿生活方式示意插画</span></div>
    <aside class="life-moments"><span class="vertical-title">一日山居</span>${[['火塘边','取暖 · 烹饪',0],['堂屋里','会客 · 手工',2],['屋檐下','晾晒 · 收成',4]].map(([title,sub,i])=>`<div class="moment"><img src="/assets/life-${i}.webp" alt="${title}的原稿示意插画" loading="lazy"/><strong>${title}</strong><small>${sub}</small></div>`).join('')}</aside>
  </div>
</section>

<section class="chapter culture section-pad" id="culture">
  <div class="section-heading"><div><div class="eyebrow">04 / THE LIFE AROUND THE HOUSE</div><h2>楼里楼外，<em>都是生活。</em></h2></div><button class="text-button" id="open-connections">打开文化关联图 ${icon('expand')}</button></div>
  <p class="section-intro">建筑承载的，不止是居住。翻开六张生活卡片，看看木楼与田地、节庆、手艺和记忆如何相连。</p>
  <div class="culture-cards">${cultures.map((c,i)=>`<button class="culture-card" data-culture="${i}"><div class="card-number">FIELD NOTE / 0${i+1}<span>↗</span></div><div class="culture-image"><img src="/assets/culture-${i}.webp" loading="lazy" alt="${c.label}原稿示意插画" /></div><small>${c.label}</small><h3>${c.title}</h3><span class="card-action">翻开这页故事 ${icon('arrow')}</span></button>`).join('')}</div>
  <div class="culture-foot"><p>以原稿中的苗族、侗族等文化线索为例；地方文化各有差异，插画不代表具体人物或实地影像。</p>${source(4)}</div>
</section>

<section class="chapter workshop section-pad" id="workshop">
  <div class="workshop-heading"><div class="eyebrow">05 / LEARN WITH YOUR HANDS</div><h2>把一栋山居，<br><em>亲手搭起来。</em></h2><p>四步小体验，认识构件之间的先后关系。<br>从一块基石开始，让一栋小楼慢慢站起来。</p><div class="workshop-chips"><span>约 1 分钟</span><span>可拖放 / 可点选</span></div><div class="build-progress"><span id="build-step-label">准备落脚</span><b id="build-count">0 / 4</b><div><i id="build-progress-fill"></i></div></div><button class="text-button" id="reset-build">重新搭建 ${icon('rotate')}</button><p class="workshop-note">小游戏采用简化构件顺序，用于理解原理，不是实际施工教程。</p></div>
  <div class="build-workspace"><div id="build-zone" class="build-zone" role="button" tabindex="0" aria-label="装配区域：先选择构件，再点击这里放置"><svg id="build-model" viewBox="0 0 840 600" role="img" aria-label="正在搭建的示意木楼"></svg><span id="build-instruction">先选一件材料，再放到山坡上</span></div><div class="parts-tray">${[['stone','石基','pin'],['posts','吊脚支撑','house'],['frame','梁柱楼面','joint'],['roof','屋顶','mountain']].map(([id,name,ic],i)=>`<button draggable="true" class="build-piece" data-piece="${i}" aria-label="选择${name}">${icon(ic)}<strong>${name}</strong><small>0${i+1}</small></button>`).join('')}</div><p class="build-feedback" id="build-feedback" role="status">哪一件，应该先与地面相接？</p></div>
  <div class="quiz-strip"><div><span class="micro-label">山居小考场</span><h3>你已经读懂这栋楼了吗？</h3></div><p>4 个问题，看看你发现了多少建筑智慧。</p><button class="button light" data-start-quiz>接受挑战 ${icon('arrow')}</button></div>
</section>

<section class="chapter future section-pad" id="future">
  <div class="section-heading"><div><div class="eyebrow">06 / A LIVING HERITAGE</div><h2>让老房子，<em>继续过日子。</em></h2></div><p>保存一栋建筑的样子，<br>也让技艺与生活继续发生。</p></div>
  <div class="future-layout"><div class="future-picture"><img id="future-image" src="/assets/future-0.webp" alt="原稿中的民宿改造概念插画" loading="lazy"/><span>来自原稿的应用设想 / 非已落地项目实拍</span></div><div class="future-copy"><div class="future-tabs">${futures.map((f,i)=>`<button data-future="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}">${f.type}</button>`).join('')}</div><div id="future-detail" aria-live="polite"></div><div class="values-row"><span>生态</span><span>文化</span><span>生计</span><span>教育</span><span>传承</span></div>${source(6)}</div></div>
  <div class="souvenir-heading"><div><span class="micro-label">把山居，带进日常</span><h3>原稿里的十种文创想象</h3></div><p>点开小物，看看建筑如何成为设计灵感。</p></div>
  <div class="souvenir-strip">${gifts.map((g,i)=>`<button class="souvenir" data-gift="${i}"><img loading="lazy" src="/assets/gift-${i}.webp" alt="${g}概念图"/><span>${String(i+1).padStart(2,'0')}</span><strong>${g}</strong></button>`).join('')}</div>
</section>

<section class="postcard-section section-pad"><div class="postcard-illustration"><img src="/assets/hero-house.webp" alt="吊脚楼原稿插画" loading="lazy"/><span class="postcard-corner" aria-hidden="true">黔</span></div><div><div class="eyebrow">A LITTLE MEMORY TO TAKE HOME</div><h2>把这一程山居，<br>写成一张明信片。</h2><p>留下一句话，把你的山居手记带走。</p><label class="postcard-input"><span>写给未来的自己</span><input id="postcard-message" maxlength="24" placeholder="愿日子有风，有山，也有归处。" aria-label="明信片留言，最多24个字"/></label><button class="button primary" id="save-postcard">生成并保存明信片 ${icon('download')}</button><span class="postcard-note" id="postcard-status" role="status">在本机生成，不会上传你的留言。</span></div></section>

<section class="archive-section section-pad" id="archive"><div><div class="eyebrow">THE SOURCE COLLECTION</div><h2>故事有出处，<br><em>原稿可回看。</em></h2><p>4 份原始文件，50 页资料。<br>从六张信息图，到设计思路与答辩过程，完整收录。</p><button class="button outline" data-open-archive>走进原稿资料馆 ${icon('arrow')}</button></div><div class="archive-fan" aria-hidden="true"><img src="/assets/work-page-3.webp" loading="lazy" alt=""/><img src="/assets/work-page-2.webp" loading="lazy" alt=""/><img src="/assets/work-page-1.webp" loading="lazy" alt=""/><span>原稿档案<br><b>04</b><small>DOCUMENTS</small></span></div></section>
<footer class="site-footer"><a class="footer-brand" href="#top">黔楼妙计<span>在山间，把日子架起来。</span></a><div class="footer-links"><button data-open-archive>原稿资料馆</button><button id="open-editorial-note">内容与图像说明</button><button data-passport>我的探索手册</button></div><p>内容依据用户提供的《黔楼妙计》资料整理。配图为原稿设计示意，包含 AI 生成图像。<br>未具可追溯来源的比例、性能与增长数据仅保留于原稿，不作为本站事实结论。</p><span class="footer-colophon">GUIZHOU · A MOUNTAIN DWELLING NOTEBOOK</span></footer>
</main>
<dialog id="modal" aria-labelledby="modal-title"><div class="modal-shell"><header class="modal-header"><div><span class="micro-label" id="modal-kicker">山居手记</span><h2 id="modal-title"></h2></div><button class="icon-button" id="close-modal" aria-label="关闭弹窗">${icon('close')}</button></header><div id="modal-content"></div></div></dialog>
`;

function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('visible'),3200)}
function stamp(id){if(stamps.has(id))return;stamps.add(id);try{localStorage.setItem('qianlou-stamps',JSON.stringify([...stamps]))}catch{}$('#stamp-count').textContent=`${stamps.size}/6`;toast(`已收集「${chapters.find(c=>c.id===id).name}」印记 ${stamps.size}/6`)}
const modal=$('#modal');
function openModal(title,html,kicker='山居手记',wide=false){$('#modal-title').textContent=title;$('#modal-kicker').textContent=kicker;$('#modal-content').innerHTML=html;modal.classList.toggle('wide',wide);if(!modal.open)modal.showModal();document.body.classList.add('dialog-open')}
$('#close-modal').addEventListener('click',()=>modal.close());
modal.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});

function choosePart(id,earned=true){const p=parts.find(p=>p.id===id);if(!p)return;$$('[data-part-select]').forEach(b=>{b.classList.toggle('active',b.dataset.partSelect===id);b.setAttribute('aria-pressed',b.dataset.partSelect===id)});$('#part-detail').innerHTML=`<span class="micro-label">${p.en}</span><h3>${p.note}</h3><p>${p.text}</p><div class="part-material">${icon('joint')} ${p.material}</div><small class="load-caption">${p.path}</small>`;if(model)model.set({selected:id});if(earned)stamp('architecture')}
model=new TimberHouse($('#house-model'),id=>choosePart(id));choosePart('stilts',false);
$$('[data-part-select]').forEach(b=>b.addEventListener('click',()=>choosePart(b.dataset.partSelect)));
$$('[data-explore-part]').forEach(b=>b.addEventListener('click',()=>{choosePart(b.dataset.explorePart);$('#architecture').scrollIntoView({behavior:reducedMotion()?'auto':'smooth'})}));
$$('[data-model-mode]').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.modelMode;$$('[data-model-mode]').forEach(el=>{el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',el===b)});model.set({mode});$('#model-mode-note').textContent=mode==='force'?'竖向传力路径的简化示意，非结构计算':mode==='explode'?'按层分离，观察构件组合':'观察构件之间的空间关系';stamp('architecture')}));
$('#rotation').addEventListener('input',e=>model.set({yaw:Number(e.target.value)*Math.PI/180}));
$('#zoom-in').addEventListener('click',()=>model.set({zoom:Math.min(1.23,model.zoom+.08)}));
$('#zoom-out').addEventListener('click',()=>model.set({zoom:Math.max(.72,model.zoom-.08)}));
$('#reset-model').addEventListener('click',()=>{model.set({yaw:-.55,zoom:1});$('#rotation').value=-32});
function chooseWeather(id,earned=true){const e=environments.find(e=>e.id===id);$('#environment-art').dataset.weather=id;$$('.weather-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.weather===id);b.setAttribute('aria-pressed',b.dataset.weather===id)});$('#environment-detail').innerHTML=`<span class="weather-icon">${icon(e.icon)}</span><h3>${e.title}</h3><p>${e.text}</p><div class="tag-row">${e.tags.map(t=>`<span>${t}</span>`).join('')}</div><small class="small-note">${e.note}</small>`;if(earned)stamp('landscape')}
chooseWeather('rain',false);$$('.weather-tabs button').forEach(b=>b.addEventListener('click',()=>chooseWeather(b.dataset.weather)));
function chooseFloor(id,earned=true){const f=floors[id];$$('[data-floor]').forEach(b=>{if(b.matches('button')){b.classList.toggle('active',Number(b.dataset.floor)===id);b.setAttribute('aria-pressed',Number(b.dataset.floor)===id)}});$('.life-visual').dataset.floor=id;$('#floor-detail').innerHTML=`<span class="micro-label">LAYER ${f.num} / ${f.name}</span><h3>${f.sub}</h3><p>${f.text}</p><div class="tag-row">${f.tags.map(t=>`<span>${t}</span>`).join('')}</div>`;if(earned)stamp('life')}
chooseFloor(1,false);$$('button[data-floor]').forEach(b=>b.addEventListener('click',()=>chooseFloor(Number(b.dataset.floor))));
$$('[data-culture]').forEach(b=>b.addEventListener('click',()=>{const c=cultures[Number(b.dataset.culture)];openModal(c.title,`<div class="culture-dialog"><img src="/assets/culture-${c.image}.webp" alt="${c.label}原稿示意图"/><div><span class="micro-label">${c.label}</span><p>${c.text}</p><p class="small-note">${c.more}</p>${source(4)}</div></div>`,'一页生活札记');stamp('culture')}));

function chooseFuture(i,earned=true){const f=futures[i];$$('[data-future]').forEach(b=>{b.classList.toggle('active',Number(b.dataset.future)===i);b.setAttribute('aria-pressed',Number(b.dataset.future)===i)});$('#future-image').src=`/assets/future-${f.image}.webp`;$('#future-image').alt=`原稿中的${f.type}概念插画`;$('#future-detail').innerHTML=`<span class="micro-label">POSSIBILITY ${String(i+1).padStart(2,'0')}</span><h3>${f.name}</h3><p>${f.text}</p>`;if(earned)stamp('future')}
chooseFuture(0,false);$$('[data-future]').forEach(b=>b.addEventListener('click',()=>chooseFuture(Number(b.dataset.future))));
$$('[data-gift]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.gift);openModal(gifts[i],`<div class="gift-dialog"><img src="/assets/gift-${i}.webp" alt="${gifts[i]}原稿概念图"/><div><span class="micro-label">原稿文创设想 / ${String(i+1).padStart(2,'0')}</span><p>把吊脚楼的屋顶轮廓、木构细节与山居意象，转化为「${gifts[i]}」的设计语言。</p><p class="small-note">图像来自原稿，作为文创概念展示，不代表在售商品或已实现项目。</p>${source(6)}</div></div>`,'把山居带进日常');stamp('future')}));

buildModel=new TimberHouse($('#build-model'));buildModel.set({stage:0,selected:'none',zoom:.95});
const buildNames=['石基','吊脚支撑','梁柱楼面','屋顶'];
const buildHints=['基石让支撑与地面相接。接下来，哪一件能把楼抬起来？','吊脚支撑立起来了。该用什么把柱子连成生活空间？','梁柱与楼面组织成框架。最后，为小楼遮雨。','小楼搭好了！从落脚到覆顶，你完成了四步构件关系体验。'];
function placePiece(i){if(buildStage>=4){toast('小楼已经完成，可以重新搭建。');return}if(i!==buildStage){$('#build-feedback').textContent=`还差一步：先放置${buildNames[buildStage]}，让后面的构件有所依托。`;$('.build-zone').classList.add('nudge');setTimeout(()=>$('.build-zone').classList.remove('nudge'),400);return}buildStage++;buildModel.set({stage:buildStage});$(`[data-piece="${i}"]`).classList.add('placed');$(`[data-piece="${i}"]`).setAttribute('disabled','');selectedPiece=null;$$('.build-piece').forEach(b=>b.classList.remove('selected'));$('#build-feedback').textContent=buildHints[i];$('#build-count').textContent=`${buildStage} / 4`;$('#build-progress-fill').style.width=buildStage*25+'%';$('#build-step-label').textContent=['准备落脚','基础已就位','支撑已立起','框架已相连','小楼已落成'][buildStage];$('#build-instruction').textContent=buildStage===4?'山居落成 · 一份木构智慧，已收入手册':`接下来：${buildNames[buildStage]}`;if(buildStage===4){$('.build-zone').classList.add('complete');stamp('workshop')}}
$$('[data-piece]').forEach(b=>{b.addEventListener('click',()=>{selectedPiece=Number(b.dataset.piece);$$('.build-piece').forEach(x=>x.classList.toggle('selected',x===b));$('#build-instruction').textContent=`已选择${buildNames[selectedPiece]}，点击山坡放置`});b.addEventListener('dragstart',e=>{selectedPiece=Number(b.dataset.piece);e.dataTransfer.setData('text/plain',b.dataset.piece);e.dataTransfer.effectAllowed='move';$('.build-zone').classList.add('drag-active')});b.addEventListener('dragend',()=>$('.build-zone').classList.remove('drag-active'))});
$('#build-zone').addEventListener('click',()=>{if(selectedPiece===null){toast('先在下方选择一件构件。');return}placePiece(selectedPiece)});
$('#build-zone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#build-zone').click()}});
$('#build-zone').addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move'});
$('#build-zone').addEventListener('drop',e=>{e.preventDefault();const value=e.dataTransfer.getData('text/plain');if(/^[0-3]$/.test(value))placePiece(Number(value));$('.build-zone').classList.remove('drag-active')});
$('#reset-build').addEventListener('click',()=>{buildStage=0;selectedPiece=null;buildModel.set({stage:0});$$('.build-piece').forEach(b=>{b.classList.remove('placed','selected');b.removeAttribute('disabled')});$('#build-count').textContent='0 / 4';$('#build-progress-fill').style.width='0';$('#build-step-label').textContent='准备落脚';$('#build-feedback').textContent='哪一件，应该先与地面相接？';$('#build-instruction').textContent='先选一件材料，再放到山坡上';$('.build-zone').classList.remove('complete')});

function renderQuiz(){quizAnswered=false;const q=quizzes[quizIndex];openModal('山居小考场',`<div class="quiz"><div class="quiz-progress"><span>QUESTION 0${quizIndex+1} / 04</span><div>${quizzes.map((_,i)=>`<i class="${i<=quizIndex?'active':''}"></i>`).join('')}</div></div><h3>${q.question}</h3><div class="quiz-options">${q.options.map((o,i)=>`<button data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${o}</button>`).join('')}</div><div id="quiz-explanation" class="quiz-explanation" role="status"></div><button class="button primary" id="quiz-next" disabled>${quizIndex===3?'查看结果':'下一题'} ${icon('arrow')}</button></div>`,'用四个问题，读懂山居');$$('[data-answer]').forEach(b=>b.addEventListener('click',()=>{if(quizAnswered)return;quizAnswered=true;const a=Number(b.dataset.answer);if(a===q.answer)quizScore++;$$('[data-answer]').forEach(btn=>{btn.disabled=true;btn.classList.toggle('correct',Number(btn.dataset.answer)===q.answer);btn.classList.toggle('incorrect',btn===b&&a!==q.answer)});$('#quiz-explanation').textContent=(a===q.answer?'答对了。':'再记住这个线索：')+q.explain;$('#quiz-next').disabled=false}));$('#quiz-next').addEventListener('click',()=>{quizIndex++;if(quizIndex<4)renderQuiz();else{openModal('山居观察，完成！',`<div class="quiz-result"><span class="result-seal">山居<br>知音</span><h3>你发现了 ${quizScore} / 4 个正确线索</h3><p>重要的是把问题带回建筑里。<br>再去转动模型、看看火塘，故事还有很多。</p><button class="button primary" id="restart-quiz">再挑战一次 ${icon('rotate')}</button></div>`,'探索结果');$('#restart-quiz').onclick=startQuiz}})}
function startQuiz(){quizIndex=0;quizScore=0;renderQuiz()}
$$('[data-start-quiz]').forEach(b=>b.addEventListener('click',startQuiz));

function openPassport(){openModal('我的山居手记',`<div class="passport-intro"><p>每完成一种探索，就留下一枚印记。<br>进度保存在当前浏览器里。</p><strong>${stamps.size}<small> / 6</small></strong></div><div class="stamp-grid">${chapters.map(c=>`<button data-passport-chapter="${c.id}" class="passport-stamp ${stamps.has(c.id)?'earned':''}">${icon(c.icon)}<strong>${c.name}</strong><small>${stamps.has(c.id)?'已收集印记':'去探索 →'}</small></button>`).join('')}</div><p class="small-note">构件点选、环境切换、生活分层、文化翻卡、完成搭建、探索新用途，各收集一枚。</p><button class="text-button" id="clear-stamps">重置我的探索记录</button>`,'六个切面，一栋山居');$$('[data-passport-chapter]').forEach(b=>b.onclick=()=>{modal.close();$('#'+b.dataset.passportChapter).scrollIntoView({behavior:reducedMotion()?'auto':'smooth'})});$('#clear-stamps').onclick=()=>{stamps.clear();try{localStorage.removeItem('qianlou-stamps')}catch{}$('#stamp-count').textContent='0/6';openPassport()}}
$$('[data-passport]').forEach(b=>b.addEventListener('click',openPassport));

async function getMaterials(){if(!materials){const r=await fetch('/materials.json');if(!r.ok)throw Error('资料索引暂时无法读取');materials=await r.json()}return materials}
async function openArchive(doc='work-pdf',page=1){archiveDoc=doc;archivePage=page-1;archiveZoom=1;try{await getMaterials();renderArchive()}catch(e){openModal('资料读取遇到问题',`<p>${esc(e.message)}。请使用本地预览服务打开网站。</p><a class="button primary" href="/originals/work-pdf.pdf" target="_blank" rel="noopener">打开原始 PDF</a>`)}}
function renderArchive(){const doc=materials.documents.find(d=>d.id===archiveDoc);const p=doc.pages[archivePage];const preview=doc.id==='work-slides'?`/assets/work-page-${archivePage+1}.webp`:p.preview;openModal('原稿资料馆',`<div class="archive-browser"><aside class="archive-sidebar"><div class="archive-doc-tabs">${materials.documents.map(d=>`<button data-document="${d.id}" class="${d.id===archiveDoc?'active':''}"><b>${({'work-pdf':'六张信息图 · PDF','work-slides':'信息图源文件 · PPTX',design:'设计说明 · PPTX',defense:'答辩演示 · PPTX'})[d.id]}</b><span>${d.pages.length} 页 / ${(d.size/1024/1024).toFixed(1)} MB</span></button>`).join('')}</div><div class="page-list">${doc.pages.map((p,i)=>`<button data-page="${i}" class="${i===archivePage?'active':''}"><span>${String(i+1).padStart(2,'0')}</span>${archiveTitles[doc.id][i]||'原稿页面'}</button>`).join('')}</div><a class="archive-download" href="${doc.file}" download>${icon('download')} 下载完整原文件</a></aside><div class="archive-main"><div class="archive-toolbar"><span>${archiveTitles[doc.id][archivePage]} <small>${archivePage+1} / ${doc.pages.length}</small></span><div><button class="icon-button" id="archive-minus" aria-label="缩小原稿">${icon('minus')}</button><button class="icon-button" id="archive-plus" aria-label="放大原稿">${icon('plus')}</button><button class="icon-button" id="archive-prev" aria-label="上一页" ${archivePage===0?'disabled':''}>←</button><button class="icon-button" id="archive-next" aria-label="下一页" ${archivePage===doc.pages.length-1?'disabled':''}>→</button></div></div><div class="archive-image-wrap"><img id="archive-preview" src="${preview}" alt="${esc(doc.name)}第${archivePage+1}页，${archiveTitles[doc.id][archivePage]}" style="width:${archiveZoom*100}%"/></div><div class="archive-page-note"><strong>原稿档案</strong> · ${esc(doc.name)}<br>${doc.id==='design'||doc.id==='defense'?'这里呈现幻灯片的原始主配图，叠加文字可在下方查看；完整排版请下载源文件。':doc.id==='work-slides'?'阅读预览使用同内容的 PDF 成稿；下载保留可编辑的 PPTX。':'PDF 页面按原样渲染。'} 原稿中的统计图、AI 示意图与设计设想按原样存档，不等于已核验事实。</div>${p.text?`<details class="source-text"><summary>查看此页可提取文字</summary><pre>${esc(p.text)}</pre></details>`:''}</div></div>`,'4 份文件 · 50 页原始资料',true);$$('[data-document]').forEach(b=>b.onclick=()=>{archiveDoc=b.dataset.document;archivePage=0;archiveZoom=1;renderArchive()});$$('[data-page]').forEach(b=>b.onclick=()=>{archivePage=Number(b.dataset.page);archiveZoom=1;renderArchive()});$('#archive-prev').onclick=()=>{archivePage--;archiveZoom=1;renderArchive()};$('#archive-next').onclick=()=>{archivePage++;archiveZoom=1;renderArchive()};$('#archive-minus').onclick=()=>{archiveZoom=Math.max(.6,archiveZoom-.2);$('#archive-preview').style.width=archiveZoom*100+'%'};$('#archive-plus').onclick=()=>{archiveZoom=Math.min(3,archiveZoom+.2);$('#archive-preview').style.width=archiveZoom*100+'%'}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-source]');if(b)openArchive('work-pdf',Number(b.dataset.source));const a=e.target.closest('[data-open-archive]');if(a)openArchive()});

$('#open-connections').onclick=()=>{const nodes=[['建筑形制','屋顶、木构与地方形态'],['结构系统','支撑、连接、围护、基础'],['功能用途','居住、生产与储藏'],['环境适应','坡地、雨水与通风'],['空间组织','楼层、廊道与活动'],['装饰艺术','木雕、织锦与纹样'],['人文文化','节庆、交往与记忆'],['价值传承','技艺传习与活化利用']];openModal('一栋楼，与八种生活线索',`<div class="connections"><div class="connection-center">${icon('house')}<strong>吊脚楼</strong><span>原稿文化关系图的交互整理</span></div><div class="connection-nodes">${nodes.map(([a,b],i)=>`<button data-connection="${i}"><span>0${i+1}</span><strong>${a}</strong></button>`).join('')}</div><div id="connection-detail" role="status">点选一个线索，发现它与建筑的联系。</div>${source(4)}</div>`,'文化关系手记');$$('[data-connection]').forEach(b=>b.onclick=()=>{$$('[data-connection]').forEach(x=>x.classList.toggle('active',x===b));const n=nodes[Number(b.dataset.connection)];$('#connection-detail').textContent=`${n[0]}：${n[1]}。这些主题共同构成原稿理解吊脚楼的框架。`;stamp('culture')})};
$('#open-editorial-note').onclick=()=>openModal('内容与图像说明',`<div class="editorial-note"><h3>资料来自哪里？</h3><p>页面依据压缩包内的《作品.pdf》《作品.pptx》《信息可视化设计-6号-2026081755.pptx》与《黔楼妙计：贵州吊脚楼信息可视化设计答辩.pptx》整理。四个原文件完整收录在资料馆，PDF 6 页、信息图 PPTX 6 页、设计说明 17 页、答辩演示 21 页。</p><h3>哪些是示意？</h3><p>图片均从原稿提取或裁切，原稿包含 AI 生成图像。这些图像不是特定村寨实拍，也不作为测绘证据。可旋转模型、分层高亮、雨风动效与搭建游戏，是根据原稿主题制作的教学示意。</p><h3>如何处理原稿中的数字？</h3><p>原稿中的区域占比、气候分布、抗震对比、碳减排与产业增长等数字，未提供足以追溯的统计出处。网页不把这些数字作为已证实的结论；完整图表保留在原稿档案中。抗震、防洪等性能不能从示意图直接推定。</p><h3>文化与创新如何呈现？</h3><p>民族文化以原稿中的案例为线索，不将其推广为所有村寨的共同习俗。现代应用与十种文创属于原稿设想，不代表已经实施或在售的项目。交互文案是定性解释，没有补写未经考证的历史、统计或传说。</p><button class="button primary" data-open-archive>查看原始资料 ${icon('arrow')}</button></div>`,'阅读约定');

$('#save-postcard').addEventListener('click',async()=>{const button=$('#save-postcard');button.disabled=true;$('#postcard-status').textContent='正在绘制你的明信片…';try{const img=new Image();img.src='/assets/hero-house.webp';await img.decode();await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1000;const ctx=canvas.getContext('2d');ctx.fillStyle='#f2eee5';ctx.fillRect(0,0,1600,1000);ctx.strokeStyle='#c4b59b';ctx.lineWidth=2;ctx.strokeRect(45,45,1510,910);ctx.drawImage(img,860,55,680,835);ctx.fillStyle='#263e35';ctx.font='30px Microsoft YaHei';ctx.fillText('黔楼妙计  /  山居手记',110,140);ctx.font='90px KaiTi, serif';ctx.fillText('在山间，',110,340);ctx.fillText('把日子架起来。',110,455);ctx.font='30px Microsoft YaHei';const msg=$('#postcard-message').value.trim()||'愿日子有风，有山，也有归处。';const chars=[...msg];for(let i=0;i<chars.length;i+=14)ctx.fillText(chars.slice(i,i+14).join(''),110,660+Math.floor(i/14)*51);ctx.font='21px Microsoft YaHei';ctx.fillStyle='#677062';ctx.fillText('GUIZHOU · STILT HOUSE · 我的山居印记 '+stamps.size+'/6',110,860);ctx.font='17px Microsoft YaHei';ctx.fillText('配图来自《黔楼妙计》原稿，为设计示意插画。',910,925);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('生成失败');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='黔楼妙计-我的山居明信片.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#postcard-status').textContent='明信片已生成，请在浏览器下载中查看。';toast('已生成你的山居明信片。')}catch{$('#postcard-status').textContent='图片尚未加载完成，请稍后重试。'}finally{button.disabled=false}});

function reducedMotion(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches}
$('.menu-toggle').addEventListener('click',()=>{const expanded=$('.menu-toggle').getAttribute('aria-expanded')==='true';$('.menu-toggle').setAttribute('aria-expanded',!expanded);$('.main-nav').classList.toggle('open',!expanded)});
$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>{$('.main-nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false')}));
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('.chapter-item').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}})},{rootMargin:'-20% 0px -55% 0px'});$$('.chapter').forEach(s=>observer.observe(s));
