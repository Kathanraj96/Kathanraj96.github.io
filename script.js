const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
$('#year').textContent = new Date().getFullYear();

let scrollQueued = false;
let heroProgress = 0;
let apiProgress = 0;
let currentApiStage = -1;
const apiStories = [
  { title: 'One product. Many moving parts.', copy: 'Corporate clients use different accounting, expense and invoice systems. The exchange gives those systems a consistent way to connect with Amex capabilities.', role: 'PRODUCT FOCUS · CONNECTIVITY AND DELIVERY ACROSS TEAMS' },
  { title: 'Bring ERP context inward.', copy: 'Data from client ERP and related systems enters the exchange so clients can make supplier payments through Amex tools. I shaped roadmap, requirements and partner connectivity.', role: 'INBOUND · ACCOUNTING / EXPENSES / INVOICES' },
  { title: 'Put transaction data to work.', copy: 'Amex transaction data goes out to a corporate client or its chosen expense and reconciliation partner. The downstream process belongs to that partner.', role: 'OUTBOUND · CLIENTS AND THEIR CHOSEN SYSTEMS' },
  { title: 'Go deeper, closer to real time.', copy: 'I have begun work on transaction APIs with richer details such as merchant and travel line items where available. This is the next chapter, not a finished launch.', role: 'CURRENT WORK · TRANSACTION API DEFINITION' }
];
function setApiStage(stage) {
  if (stage === currentApiStage) return;
  currentApiStage = stage;
  const story = apiStories[stage];
  const panel = $('.api-story');
  panel.classList.add('changing');
  window.setTimeout(() => {
    $('#api-story-title').textContent = story.title;
    $('#api-story-copy').textContent = story.copy;
    $('#api-story-role').textContent = story.role;
    $('#api-count').textContent = `0${stage + 1} / 04`;
    panel.classList.remove('changing');
  }, motionOK ? 150 : 0);
  $('#api-stage').dataset.stage = stage;
}
function updateScroll() {
  scrollQueued = false;
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  $('#progress-fill').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  $('#site-header').classList.toggle('scrolled', scrollY > innerHeight * .86);
  const hero = $('.hero-scroll');
  heroProgress = clamp((scrollY - hero.offsetTop) / Math.max(1, hero.offsetHeight - innerHeight));
  hero.style.setProperty('--hero-word-x', `${heroProgress * 43}px`);
  hero.style.setProperty('--hero-art-y', `${-heroProgress * 100}px`);
  hero.style.setProperty('--ring-rotation', `${heroProgress * 115}deg`);
  $('.cutout-one').style.setProperty('--cutout-x', `${heroProgress * 105}px`);
  $('.cutout-one').style.setProperty('--cutout-y', `${heroProgress * 95}px`);
  $('.cutout-two').style.setProperty('--cutout-x', `${-heroProgress * 115}px`);
  $('.cutout-two').style.setProperty('--cutout-y', `${-heroProgress * 105}px`);
  const api = $('.api-scroll');
  apiProgress = clamp((scrollY - api.offsetTop) / Math.max(1, api.offsetHeight - innerHeight));
  if (api.getBoundingClientRect().bottom > 0 && api.getBoundingClientRect().top < innerHeight) {
    setApiStage(Math.min(3, Math.floor(apiProgress * 4)));
    $('#api-progress-fill').style.transform = `scaleX(${apiProgress})`;
  }
  if (motionOK) {
    $$('.postcard-scene').forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      const shift = clamp((innerHeight - rect.top) / (innerHeight + rect.height)) * 45 - 22;
      $('.postcard-image', scene).style.setProperty('--postcard-shift', `${shift}px`);
    });
    $$('.curiosity-clippings span').forEach((item, index) => {
      const rect = $('.curiosity-section').getBoundingClientRect();
      const shift = clamp((innerHeight - rect.top) / (innerHeight + rect.height)) * (index % 2 ? -40 : 40);
      item.style.setProperty('--float', `${shift}px`);
    });
  }
}
addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
addEventListener('resize', () => { resizeVoxel(); updateScroll(); });
updateScroll();

const incidentStories = {
  repeat: ['Find the repeat, not just the alert.', 'Group similar issues, identify the root cause, and make the next response consistent across teams.'],
  delay: ['Make slowdowns visible.', 'A shared view helps teams trace repeated delays, understand handoffs and shorten the route to resolution.'],
  quality: ['Trace the mismatch to its source.', 'Profile attributes and define quality checks so teams can act on the cause of bad data.']
};
$$('[data-incident]').forEach(button => button.addEventListener('click', () => {
  $$('#incident-wall [data-incident]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active); });
  const [title, copy] = incidentStories[button.dataset.incident];
  $('#incident-title').textContent = title;
  $('#incident-copy').textContent = copy;
}));

const priceStories = [
  {title:'Watch the relationship.', copy:'The first view compares a product with its marketplace reference.', market:'$98', curve:'M20 150 C180 145 200 155 340 150 S550 147 680 149 S900 150 1060 146'},
  {title:'A change becomes a signal.', copy:'The marketplace price shifts. The anomaly is flagged for review.', market:'$82', curve:'M20 150 C180 145 200 155 340 150 S550 147 680 149 S850 264 1060 275'},
  {title:'The manager stays in control.', copy:'A later phase suggests a competitive price. A pricing manager reviews and approves the decision.', market:'$82', curve:'M20 150 C180 145 200 155 340 150 S550 147 680 149 S850 264 1060 275'}
];
$$('[data-price]').forEach(button => button.addEventListener('click', () => {
  const stage = Number(button.dataset.price);
  $('#price-stage').dataset.priceStage = stage;
  $('#market-price').textContent = priceStories[stage].market;
  $('#market-curve').setAttribute('d', priceStories[stage].curve);
  $('#price-title').textContent = priceStories[stage].title;
  $('#price-copy').textContent = priceStories[stage].copy;
  $$('[data-price]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active); });
}));

const labs = [
  ['WORK IN PROGRESS', 'Exploring how connected information can improve retrieval and context in AI systems.'],
  ['WORK IN PROGRESS', 'Building small retrieval and agent experiments to learn their product possibilities and limits.'],
  ['PRIVATE AI-ASSISTED BUILD', 'A personal dashboard I took from system design and architecture through development.']
];
$$('[data-lab]').forEach(button => button.addEventListener('click', () => {
  const stage = Number(button.dataset.lab);
  $('#lab-status').textContent = labs[stage][0];
  $('#lab-copy').textContent = labs[stage][1];
  $('.console-core').textContent = ['?', '→', '▥'][stage];
  $$('[data-lab]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active); });
}));

const foodStories = {
  fafda: 'A crisp street-food favourite, especially when the city is celebrating.',
  gathiya: 'A familiar Gujarati snack that tastes like home, even when I am far away.',
  undhiyu: 'A seasonal dish that carries the feeling of gathering and tradition.'
};
$$('[data-food]').forEach(button => button.addEventListener('click', () => {
  $('#food-detail').textContent = foodStories[button.dataset.food];
  $('#food').dataset.food = button.dataset.food;
  $$('[data-food]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', active); });
}));

const avatar = $('#personal-avatar');
avatar.addEventListener('pointermove', event => {
  if (!finePointer || !motionOK) return;
  const rect = avatar.getBoundingClientRect();
  avatar.style.setProperty('--eye-x', `${((event.clientX - rect.left) / rect.width - .5) * 10}px`);
  avatar.style.setProperty('--eye-y', `${((event.clientY - rect.top) / rect.height - .5) * 8}px`);
});
avatar.addEventListener('pointerleave', () => { avatar.style.setProperty('--eye-x','0px'); avatar.style.setProperty('--eye-y','0px'); });
const court = $('#movement-court');
function moveBall(event) {
  const rect = court.getBoundingClientRect();
  court.style.setProperty('--ball-x', `${clamp((event.clientX - rect.left) / rect.width, .08, .86) * 100}%`);
  court.style.setProperty('--ball-y', `${clamp((event.clientY - rect.top) / rect.height, .08, .78) * 100}%`);
}
court.addEventListener('pointermove', event => { if (finePointer && motionOK) moveBall(event); });
court.addEventListener('click', moveBall);

$('#game-button').addEventListener('click', event => {
  const playing = $('#games').classList.toggle('playing');
  event.currentTarget.setAttribute('aria-pressed', playing);
  event.currentTarget.textContent = playing ? 'PAUSE THE JOURNEY ↗' : 'START THE JOURNEY ↗';
});
$('#games').addEventListener('pointermove', event => {
  if (!finePointer || !motionOK) return;
  const rect = $('#games').getBoundingClientRect();
  $('#game-world').style.setProperty('--runner-x', `${clamp((event.clientX - rect.left) / rect.width,.1,.88)*100}%`);
});
$('#manga-button').addEventListener('click', event => {
  const turned = $('#manga-spread').classList.toggle('turned');
  event.currentTarget.setAttribute('aria-pressed', turned);
  event.currentTarget.textContent = turned ? 'BACK TO COVER ←' : 'TURN THE PAGE →';
  $('#manga-page-number').textContent = turned ? '02' : '01';
  $('.manga-burst').innerHTML = turned ? 'SERIOUS<br>ON THE<br>INSIDE.' : 'FREEDOM<br>LOOKS GOOD<br>ON YOU.';
});

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}, {threshold:.12});
$$('.opening-title,.opening-aside,.health-intro,.pricing-head,.ai-top,.path-intro,.roots-intro,.postcard-caption,.personal-story,.manga-spread').forEach(item => { item.classList.add('reveal'); observer.observe(item); });
const metricObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  metricObserver.disconnect();
  const number = $('[data-count]');
  if (!motionOK) { number.textContent = '50–60'; return; }
  const start = performance.now();
  function tick(time) {
    const progress = clamp((time - start) / 1100);
    number.textContent = `${Math.round(progress * 55)}`;
    if (progress < 1) requestAnimationFrame(tick);
    else number.textContent = '50–60';
  }
  requestAnimationFrame(tick);
}, {threshold:.5});
metricObserver.observe($('.health-measures'));

// A small deterministic voxel field. The blocks gather toward the centre as the hero scrolls.
const canvas = $('#voxel-canvas');
const ctx = canvas.getContext('2d');
let canvasWidth = 0, canvasHeight = 0, frame = 0;
let pointerX = 0, pointerY = 0;
function resizeVoxel() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvasWidth = rect.width; canvasHeight = rect.height;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if (!motionOK) drawVoxel(0);
}
function hexToRgb(hex) { const value = parseInt(hex.slice(1),16); return [(value>>16)&255,(value>>8)&255,value&255]; }
function shade(hex, amount) { const [r,g,b]=hexToRgb(hex); return `rgb(${clamp(r+amount,0,255)},${clamp(g+amount,0,255)},${clamp(b+amount,0,255)})`; }
function cube(cx, cy, size, height, base) {
  const half = size*.62, rise = size*.34;
  const top = [[cx,cy-height-rise],[cx+half,cy-height],[cx,cy-height+rise],[cx-half,cy-height]];
  ctx.beginPath();ctx.moveTo(...top[3]);ctx.lineTo(...top[2]);ctx.lineTo(cx,cy+rise);ctx.lineTo(cx-half,cy);ctx.closePath();ctx.fillStyle=shade(base,-35);ctx.fill();
  ctx.beginPath();ctx.moveTo(...top[2]);ctx.lineTo(...top[1]);ctx.lineTo(cx+half,cy);ctx.lineTo(cx,cy+rise);ctx.closePath();ctx.fillStyle=shade(base,-70);ctx.fill();
  ctx.beginPath();ctx.moveTo(...top[0]);top.slice(1).forEach(point=>ctx.lineTo(...point));ctx.closePath();ctx.fillStyle=base;ctx.fill();ctx.strokeStyle='#d8f4bb20';ctx.lineWidth=1;ctx.stroke();
}
function drawVoxel(time) {
  if (!canvasWidth || !canvasHeight) return;
  ctx.clearRect(0,0,canvasWidth,canvasHeight);
  const size = Math.min(canvasWidth/10,canvasHeight/9,64);
  const centerX = canvasWidth*.52 + pointerX*14;
  const centerY = canvasHeight*.53 + pointerY*9;
  const blocks=[];
  for(let row=-4;row<=4;row++)for(let col=-4;col<=4;col++){
    const radius=Math.hypot(row,col), noise=(Math.sin(row*15.7+col*24.2)+1)/2;
    const baseHeight=(noise*.65+.25)*size;
    const gathered=clamp(1-radius/5.8)*size*(1+heroProgress*3.4);
    const pulse=motionOK?Math.sin(time*.0015+row*.5+col*.6)*size*.05:0;
    const height=baseHeight+gathered+pulse;
    const x=centerX+(col-row)*size*.65*(1-heroProgress*.13);
    const y=centerY+(col+row)*size*.36;
    const color=radius<1.3?'#d7f151':radius<3.2?(noise>.5?'#6187d7':'#507ca1'):'#436260';
    blocks.push({x,y,height,color,order:col+row});
  }
  blocks.sort((a,b)=>a.order-b.order).forEach(block=>cube(block.x,block.y,size,block.height,block.color));
}
function voxelLoop(time) { frame=requestAnimationFrame(voxelLoop); drawVoxel(time); }
$('.hero-art').addEventListener('pointermove', event => {
  if (!finePointer || !motionOK) return;
  const rect = $('.hero-art').getBoundingClientRect();
  pointerX = (event.clientX - rect.left)/rect.width-.5;
  pointerY = (event.clientY - rect.top)/rect.height-.5;
});
$('.hero-art').addEventListener('pointerleave', () => { pointerX=0;pointerY=0; });
resizeVoxel();
if (motionOK) frame=requestAnimationFrame(voxelLoop);
