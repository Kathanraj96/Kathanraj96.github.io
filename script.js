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
  { title: 'Two directions. One exchange.', copy: 'Client ERP information comes in for Amex use cases. Card events and later settlement data go out to clients or their approved systems.', role: 'INBOUND ERP DATA ≠ OUTBOUND CARD DATA' },
  { title: 'Bring information inward.', copy: 'The inbound connection moves client ERP information into Amex systems for the work that needs it.', role: '01 / CLIENT ERP → AMEX' },
  { title: 'Send the event outward.', copy: 'The outbound connection carries a card authorisation event to a client or its approved system in real time.', role: '02 / AMEX → CLIENT SYSTEM' },
  { title: 'Follow with settlement.', copy: 'After the event, settlement data moves through that same outbound direction when it becomes available.', role: '02 / AMEX → CLIENT SYSTEM' }
];
const apiNextLabels = ['NEXT / INBOUND ↓','NEXT / AUTHORISATION ↓','NEXT / SETTLEMENT ↓','CONTINUE THE STORY ↓'];
function setApiStage(stage) {
  if (stage === currentApiStage) return;
  currentApiStage = stage;
  const story = apiStories[stage];
  const panel = $('.api-story');
  panel.classList.remove('changing');
  void panel.offsetWidth;
  $('#api-story-title').textContent = story.title;
  $('#api-story-copy').textContent = story.copy;
  $('#api-story-role').textContent = story.role;
  $('#api-count').textContent = `0${stage + 1} / 04`;
  $('#api-next-label').textContent = apiNextLabels[stage];
  panel.classList.add('changing');
  $('#api-stage').dataset.stage = stage;
  $$('[data-api-step]').forEach((button, index) => {
    const active = index === stage;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active);
  });
}
$$('[data-api-step]').forEach(button => button.addEventListener('click', () => {
  const api = $('.api-scroll');
  const stage = Number(button.dataset.apiStep);
  const travel = Math.max(1, api.offsetHeight - innerHeight);
  window.scrollTo({ top: api.offsetTop + travel * ((stage + .04) / 4), behavior: 'instant' });
  setApiStage(stage);
}));
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
  const timeline = $('#timeline-track');
  const timelineRect = timeline.getBoundingClientRect();
  const timelineProgress = clamp((innerHeight * .55 - timelineRect.top) / Math.max(1, timelineRect.height));
  $('#timeline-fill').style.transform = `scaleY(${timelineProgress})`;
  $$('.timeline-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    item.classList.toggle('is-current', rect.top < innerHeight * .63 && rect.bottom > innerHeight * .28);
  });
  if (motionOK) {
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

const educationTrack = $('#education-track');
const educationCards = $$('.education-card', educationTrack);
let educationIndex = 0;
const educationPlaces = ['AHMEDABAD', 'ANAND', 'PUNE'];
function updateEducation() {
  const left = educationTrack.getBoundingClientRect().left;
  let nearest = 0;
  let distance = Infinity;
  educationCards.forEach((card, index) => {
    const nextDistance = Math.abs(card.getBoundingClientRect().left - left);
    if (nextDistance < distance) { distance = nextDistance; nearest = index; }
  });
  educationIndex = nearest;
  $('#education-position').textContent = `0${nearest + 1} / 03   ${educationPlaces[nearest]}`;
  $('#education-prev').disabled = nearest === 0;
  $('#education-next').disabled = nearest === educationCards.length - 1;
  const max = Math.max(1, educationTrack.scrollWidth - educationTrack.clientWidth);
  $('#education-progress-fill').style.transform = `scaleX(${(1 + 2 * clamp(educationTrack.scrollLeft / max)) / 3})`;
}
function goToEducation(index) {
  const target = educationCards[clamp(index, 0, educationCards.length - 1)];
  educationTrack.scrollTo({ left: educationTrack.scrollLeft + target.getBoundingClientRect().left - educationTrack.getBoundingClientRect().left, behavior: motionOK ? 'smooth' : 'instant' });
}
$('#education-prev').addEventListener('click', () => goToEducation(educationIndex - 1));
$('#education-next').addEventListener('click', () => goToEducation(educationIndex + 1));
educationTrack.addEventListener('scroll', updateEducation, { passive: true });
educationTrack.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  goToEducation(educationIndex + (event.key === 'ArrowRight' ? 1 : -1));
});
let educationDrag = null;
educationTrack.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse') return;
  educationDrag = { x: event.clientX, left: educationTrack.scrollLeft };
  educationTrack.setPointerCapture(event.pointerId);
});
educationTrack.addEventListener('pointermove', event => {
  if (!educationDrag) return;
  educationTrack.scrollLeft = educationDrag.left - (event.clientX - educationDrag.x);
});
educationTrack.addEventListener('pointerup', () => { educationDrag = null; });
educationTrack.addEventListener('pointercancel', () => { educationDrag = null; });
addEventListener('resize', updateEducation);
updateEducation();

const incidentStories = {
  repeat: ['Find the repeat, not just the alert.', 'Group similar issues, identify the root cause, and make the next response consistent across teams.'],
  delay: ['Make slowdowns visible.', 'A shared view helps teams trace repeated delays, understand handoffs and shorten the route to resolution.'],
  handoff: ['Clarify the handoff.', 'Map ownership and escalation paths so issues stop bouncing between teams.']
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
$$('button[data-lab]').forEach(button => button.addEventListener('click', () => {
  const stage = Number(button.dataset.lab);
  $('#lab-status').textContent = labs[stage][0];
  $('#lab-copy').textContent = labs[stage][1];
  $('#ai-console').dataset.lab = stage;
  $$('[data-lab-visual]').forEach((visual, index) => visual.setAttribute('aria-hidden', index !== stage));
  $$('button[data-lab]').forEach(item => { const active = Number(item.dataset.lab) === stage; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
}));

const certifications = [
  { date:'MAR 2025 · HUGGING FACE LEARN', name:'AI Agent Course', description:'Agent concepts, tools and workflows; part of my ongoing hands-on AI exploration.', category:'AI / EXPERIMENTATION', motif:'ai' },
  { date:'JUN–OCT 2024 · ISB EXECUTIVE EDUCATION', name:'Product Management', description:'Formal product-management learning alongside enterprise product practice.', category:'PRODUCT / PRACTICE', motif:'roadmap' },
  { date:'MAY 2020 · DATACAMP', name:'Data Science for Everyone (Python)', description:'Completed with Data Analyst in Python, building a stronger base for data analysis.', category:'DATA / PYTHON', motif:'data' },
  { date:'SEP 2019 · KPMG', name:'Lean Six Sigma Green Belt', description:'Training in process improvement and structured problem-solving.', category:'OPERATIONS / PROCESS', motif:'process' }
];
const certTabs = $$('button[data-cert]');
function selectCertification(index, focus = false) {
  const item = certifications[index];
  $('#cert-number').textContent = `FILE 0${index + 1} / 04`;
  $('#cert-date').textContent = item.date;
  $('#cert-name').textContent = item.name;
  $('#cert-description').textContent = item.description;
  $('#cert-category').textContent = item.category;
  $('#cert-art-use').setAttribute('href', `#motif-${item.motif}`);
  $('#cert-visual').dataset.certArt = index;
  $('.cert-visual-stamp').textContent = `KR / 0${index + 1}`;
  $('#cert-panel').setAttribute('aria-labelledby', `cert-tab-${index}`);
  certTabs.forEach((tab, tabIndex) => {
    tab.setAttribute('aria-selected', String(tabIndex === index));
    tab.tabIndex = tabIndex === index ? 0 : -1;
  });
  if (focus) certTabs[index].focus();
}
certTabs.forEach((tab, index) => tab.addEventListener('click', () => selectCertification(index)));
$('#cert-next').addEventListener('click', () => {
  const current = certTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  selectCertification((current + 1) % certTabs.length);
});
$('.cert-tabs').addEventListener('keydown', event => {
  const current = certTabs.indexOf(document.activeElement);
  if (current < 0) return;
  let next;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % certTabs.length;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + certTabs.length) % certTabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = certTabs.length - 1;
  else return;
  event.preventDefault();
  selectCertification(next, true);
});

const skillRoutes = $$('[data-skill]');
const skillMotifs = ['roadmap', 'systems', 'data', 'ai'];
const skillLabels = ['PRODUCT CRAFT', 'ENTERPRISE SYSTEMS', 'DATA + ANALYTICS', 'APPLIED AI'];
function setSkillFocus(index) {
  const board = $('.skill-switchboard');
  if (Number(board.dataset.active) === index && skillRoutes[index].classList.contains('is-active')) return;
  board.dataset.active = index;
  $('#skill-focus-use').setAttribute('href', `#motif-${skillMotifs[index]}`);
  $('#skill-focus-label').textContent = `0${index + 1} / ${skillLabels[index]}`;
  $$('.board-port').forEach((port, portIndex) => port.classList.toggle('is-active', portIndex === index));
  skillRoutes.forEach((route, routeIndex) => route.classList.toggle('is-active', routeIndex === index));
}
skillRoutes.forEach((route, index) => {
  route.addEventListener('pointerenter', () => setSkillFocus(index));
  route.addEventListener('focusin', () => setSkillFocus(index));
});
const skillObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting);
  if (visible.length) {
    visible.sort((a, b) => Math.abs(a.boundingClientRect.top - innerHeight * .38) - Math.abs(b.boundingClientRect.top - innerHeight * .38));
    setSkillFocus(Number(visible[0].target.dataset.skill));
  }
}, {rootMargin:'-25% 0px -50% 0px', threshold:0});
skillRoutes.forEach(route => skillObserver.observe(route));
setSkillFocus(0);

$$('.achievement-replay').forEach(button => button.addEventListener('click', () => {
  const ticket = button.closest('.achievement-ticket');
  ticket.classList.remove('is-replaying');
  void ticket.offsetWidth;
  ticket.classList.add('is-replaying');
  setTimeout(() => ticket.classList.remove('is-replaying'), 900);
}));

const foodStories = {
  fafda: 'Crisp fafda and chutney: a street-food ritual I always come back to.',
  khandvi: 'Soft, delicate rolls with mustard seeds and fresh coriander; worth slowing down for.',
  undhiyu: 'A seasonal bowl that tastes like winter gatherings and everyone sharing the table.'
};
const foodArtwork = {
  fafda: './assets/gujarat-fafda-cutout.png',
  khandvi: './assets/gujarat-khandvi-cutout.webp',
  undhiyu: './assets/gujarat-undhiyu-cutout.webp'
};
Object.values(foodArtwork).forEach(src => { const image = new Image(); image.src = src; });
$$('.food-picker [data-food]').forEach(button => button.addEventListener('click', () => {
  const choice = button.dataset.food;
  $('#food-detail').textContent = foodStories[choice];
  $('#food').dataset.food = choice;
  $('#food-artwork').src = foodArtwork[choice];
  $('#food-artwork').classList.remove('is-changing');
  void $('#food-artwork').offsetWidth;
  $('#food-artwork').classList.add('is-changing');
  $$('.food-picker [data-food]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
}));

$('#principles-button').addEventListener('click', event => {
  const section = $('.quote-section');
  const step = (Number(section.dataset.principleStep) + 1) % 3;
  section.dataset.principleStep = String(step);
  event.currentTarget.textContent = ['BREAK IT DOWN ↗','BUILD BACK UP ↗','START AGAIN ↺'][step];
  event.currentTarget.setAttribute('aria-label', ['Show the fundamental parts of a problem','Rebuild a better process from the fundamental parts','Start the first-principles illustration again'][step]);
});

const avatar = $('#personal-avatar');
const avatarImages = $$('.avatar-frame', avatar);
const portraitFrames = {
  neutral: './assets/kathan-portrait-neutral.webp',
  left: './assets/kathan-portrait-left.webp',
  right: './assets/kathan-portrait-right.webp',
  upLeft: './assets/kathan-portrait-up-left.webp',
  upRight: './assets/kathan-portrait-up-right.webp',
  curious: './assets/kathan-portrait-curious.webp',
  shades: './assets/kathan-portrait-shades.webp'
};
let portraitFrame = 'neutral';
let portraitWanted = 'neutral';
let portraitActiveImage = avatarImages[0];
let portraitTransitioning = false;
let portraitGaze = 'neutral';
let portraitReaction = '';
let portraitShadesOn = false;
let portraitReactionTimer;
function showPortraitFrame(frame) {
  portraitWanted = frame;
  if (portraitTransitioning || frame === portraitFrame) return;
  portraitTransitioning = true;
  const incoming = avatarImages.find(image => image !== portraitActiveImage);
  const reveal = () => {
    incoming.classList.add('is-visible');
    portraitActiveImage.classList.remove('is-visible');
    avatar.dataset.expression = frame;
    setTimeout(() => {
      portraitActiveImage = incoming;
      portraitFrame = frame;
      portraitTransitioning = false;
      if (portraitWanted !== portraitFrame) showPortraitFrame(portraitWanted);
    }, motionOK ? 110 : 0);
  };
  if (incoming.getAttribute('src') !== portraitFrames[frame]) incoming.src = portraitFrames[frame];
  if (incoming.complete && incoming.naturalWidth) requestAnimationFrame(reveal);
  else incoming.addEventListener('load', reveal, { once: true });
}
const portraitPreloader = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  Object.values(portraitFrames).forEach(src => { const image = new Image(); image.src = src; });
  portraitPreloader.disconnect();
}, { rootMargin: '700px' });
portraitPreloader.observe($('#beyond'));
function reactPortrait(expression, duration = 1200) {
  if (portraitShadesOn) return;
  clearTimeout(portraitReactionTimer);
  portraitReaction = expression;
  showPortraitFrame(expression);
  portraitReactionTimer = setTimeout(() => {
    portraitReaction = '';
    showPortraitFrame(portraitShadesOn ? 'shades' : portraitGaze);
  }, duration);
}
$('#beyond').addEventListener('pointermove', event => {
  if (!finePointer || !motionOK) return;
  const rect = avatar.getBoundingClientRect();
  const x = clamp((event.clientX - (rect.left + rect.width / 2)) / (innerWidth * .42), -1, 1);
  const y = clamp((event.clientY - (rect.top + rect.height * .38)) / (innerHeight * .65), -1, 1);
  avatar.style.setProperty('--head-yaw', `${x * 3}deg`);
  avatar.style.setProperty('--head-pitch', `${-y * 3}deg`);
  avatar.style.setProperty('--head-x', `${x * 5}px`);
  avatar.style.setProperty('--head-y', `${y * 4}px`);
  const leftEdge = portraitGaze === 'left' || portraitGaze === 'upLeft' ? -.2 : -.3;
  const rightEdge = portraitGaze === 'right' || portraitGaze === 'upRight' ? .2 : .3;
  const upEdge = portraitGaze === 'upLeft' || portraitGaze === 'upRight' ? -.18 : -.29;
  const side = x < leftEdge ? 'left' : x > rightEdge ? 'right' : 'center';
  portraitGaze = side === 'left' ? (y < upEdge ? 'upLeft' : 'left') : side === 'right' ? (y < upEdge ? 'upRight' : 'right') : 'neutral';
  if (!portraitReaction && !portraitShadesOn) showPortraitFrame(portraitGaze);
});
$('#beyond').addEventListener('pointerleave', () => {
  portraitGaze = 'neutral';
  avatar.style.setProperty('--head-yaw', '0deg');
  avatar.style.setProperty('--head-pitch', '0deg');
  avatar.style.setProperty('--head-x', '0px');
  avatar.style.setProperty('--head-y', '0px');
  if (!portraitReaction && !portraitShadesOn) showPortraitFrame('neutral');
});
avatar.addEventListener('pointerenter', () => {
  if (finePointer && motionOK) reactPortrait('curious', 850);
});
avatar.addEventListener('click', () => {
  clearTimeout(portraitReactionTimer);
  portraitReaction = '';
  portraitShadesOn = !portraitShadesOn;
  avatar.setAttribute('aria-pressed', String(portraitShadesOn));
  $('#avatar-cue').innerHTML = portraitShadesOn ? 'AFTER HOURS MODE ✳<br>TAP TO RESET' : 'FOLLOW MY GAZE ↗<br>TAP FOR SHADES';
  $('#avatar-announcement').textContent = portraitShadesOn ? 'Kathan puts on his sunglasses.' : 'Kathan takes off his sunglasses.';
  showPortraitFrame(portraitShadesOn ? 'shades' : portraitGaze);
});
const court = $('#movement-court');
function moveBall(event) {
  const rect = court.getBoundingClientRect();
  court.style.setProperty('--ball-x', `${clamp((event.clientX - rect.left) / rect.width, .08, .86) * 100}%`);
  court.style.setProperty('--ball-y', `${clamp((event.clientY - rect.top) / rect.height, .08, .78) * 100}%`);
}
court.addEventListener('pointermove', event => { if (finePointer && motionOK) moveBall(event); });
court.addEventListener('click', moveBall);

const gamesSection = $('#games');
const coopUnlock = $('#coop-unlock');
const coopOverlay = $('#coop-overlay');
const coopPath = ['match', 'island', 'myth'];
let coopStep = 0;
let coopFound = false;
let currentGameWorld = 'match';
function updateGameProgress() {
  $('#game-hud-progress').textContent = coopPath.map((_, index) => index < coopStep ? '●' : '○').join(' ');
}
$('#game-button').addEventListener('click', event => {
  const playing = gamesSection.classList.toggle('playing');
  event.currentTarget.setAttribute('aria-pressed', String(playing));
  event.currentTarget.textContent = playing ? 'PAUSE THE JOURNEY ↗' : 'START THE JOURNEY ↗';
  if (!playing && !coopFound) { coopStep = 0; updateGameProgress(); }
});
const gameWorlds = {
  match: { level: 'LEVEL 01 · THE MATCH', description: 'The match begins with one more pass. FIFA is the place I go when I want a quick test of timing and instinct.' },
  myth: { level: 'LEVEL 02 · THE MYTH', description: 'God of War pulls me into a world where every choice has weight and the story keeps widening.' },
  island: { level: 'LEVEL 03 · THE ISLAND', description: 'Ghost of Tsushima is the kind of world I stay in for its atmosphere, movement and sense of place.' }
};
$$('[data-game-choice]').forEach(button => button.addEventListener('click', () => {
  const world = button.dataset.gameChoice;
  currentGameWorld = world;
  gamesSection.dataset.game = world;
  $('#game-hud-level').textContent = gameWorlds[world].level;
  $('#game-description').textContent = gameWorlds[world].description;
  $$('[data-game-choice]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  if (gamesSection.classList.contains('playing') && !coopFound) {
    coopStep = world === coopPath[coopStep] ? coopStep + 1 : world === coopPath[0] ? 1 : 0;
    updateGameProgress();
    if (coopStep === coopPath.length) { coopFound = true; coopUnlock.hidden = false; }
  }
}));
coopUnlock.addEventListener('click', () => {
  gamesSection.dataset.game = 'coop';
  gamesSection.classList.add('coop-open');
  coopOverlay.hidden = false;
  coopUnlock.hidden = true;
  $('#coop-name-kathan').textContent = 'KATHAN';
  $('#coop-name-janhvi').textContent = 'JANHVI';
  $('#coop-story').textContent = 'I love playing with my wife Janhvi. Some nights it is one more Trackmania run or a Mortal Kombat rematch; It Takes Two makes the best case for sharing the controller.';
  $('#coop-close').focus();
});
function closeCoop() {
  coopOverlay.hidden = true;
  gamesSection.classList.remove('coop-open');
  gamesSection.dataset.game = currentGameWorld;
  coopUnlock.hidden = false;
  coopUnlock.focus();
}
$('#coop-close').addEventListener('click', closeCoop);
coopOverlay.addEventListener('keydown', event => { if (event.key === 'Escape') closeCoop(); });
$('#games').addEventListener('pointermove', event => {
  if (!finePointer || !motionOK) return;
  const rect = $('#games').getBoundingClientRect();
  $('#game-world').style.setProperty('--runner-x', `${clamp((event.clientX - rect.left) / rect.width,.1,.88)*100}%`);
});
const storyScroll = $('#story-scroll');
const storyStage = $('#manga-spread');
const storyScenes = $$('.story-scene', storyStage);
const storyNames = ['MANGA INK', 'HERO CITY', 'WATER PATH', 'ANIME FINISH'];
const storyReactions = [
  ['HA HA!', 'HEY!'],
  ['I CAN DO THIS!', 'FORWARD.'],
  ['BREATHE.', 'STAY KIND.'],
  ['POWER UP!', 'ONWARD!']
];
const storyReactionTimers = new WeakMap();
let currentStoryScene = -1;
let storyScrollQueued = false;
let storyFrameTick = 0;
function reactStoryScene(index) {
  const scene = storyScenes[index];
  if (!scene) return;
  const bubble = $('.scene-speech', scene);
  const sprite = $('.story-sprite', scene);
  if (!scene.dataset.defaultSpeech) scene.dataset.defaultSpeech = bubble.textContent;
  const prior = storyReactionTimers.get(scene);
  if (prior) prior.forEach(clearTimeout);
  scene.classList.add('is-reacting');
  bubble.textContent = storyReactions[index][0];
  if (sprite) sprite.dataset.frame = '2';
  const middle = setTimeout(() => {
    if (index === 3 && storyStage.classList.contains('is-finished')) return;
    bubble.textContent = storyReactions[index][1];
    if (sprite) sprite.dataset.frame = '3';
  }, 570);
  const end = setTimeout(() => {
    scene.classList.remove('is-reacting');
    const finished = index === 3 && storyStage.classList.contains('is-finished');
    bubble.textContent = finished ? 'WE MADE IT!' : scene.dataset.defaultSpeech;
    if (sprite) sprite.dataset.frame = finished ? '3' : '0';
  }, 1350);
  storyReactionTimers.set(scene, [middle, end]);
}
function setStoryScene(index) {
  if (index === currentStoryScene) return;
  const previousScene = storyScenes[currentStoryScene];
  if (previousScene) previousScene.style.setProperty('--actor-x', storyScenes[index].style.getPropertyValue('--actor-x'));
  currentStoryScene = index;
  storyStage.dataset.storyScene = String(index);
  storyScenes.forEach((scene, sceneIndex) => {
    const active = sceneIndex === index;
    scene.classList.toggle('is-active', active);
    scene.setAttribute('aria-hidden', String(!active));
    if (!active) {
      const sprite = $('.story-sprite', scene);
      if (sprite) sprite.dataset.frame = '0';
    }
  });
  $$('[data-story-jump]').forEach((button, buttonIndex) => button.setAttribute('aria-current', String(buttonIndex === index)));
  $('#story-scene-label').textContent = `0${index + 1} / ${storyNames[index]}`;
  $('#story-progress-label').textContent = `0${index + 1} / 04`;
  $('#manga-page-number').textContent = `0${index + 1}`;
  $('#manga-button').textContent = index === 3 ? 'BACK TO START ↺' : 'NEXT WORLD →';
  if (motionOK && storyStage.classList.contains('is-playing')) {
    setTimeout(() => { if (currentStoryScene === index) reactStoryScene(index); }, 550);
  }
}
function updateStoryScroll() {
  storyScrollQueued = false;
  const start = storyScroll.getBoundingClientRect().top + scrollY - 76;
  const travel = Math.max(1, storyScroll.offsetHeight - storyStage.offsetHeight);
  const progress = clamp((scrollY - start) / travel);
  const index = Math.min(3, Math.floor(progress * 4));
  const scene = storyScenes[index];
  const sceneWidth = Math.max(1, scene.clientWidth);
  const actorWidth = $('.scene-actor', scene).offsetWidth;
  const edge = Math.max(15, ((actorWidth / 2 + 16) / sceneWidth) * 100);
  const routePosition = edge + progress * (100 - edge * 2);
  scene.style.setProperty('--actor-x', `${routePosition}%`);
  storyStage.style.setProperty('--finish-x', `${100 - edge}%`);
  storyStage.style.setProperty('--route-progress', `${progress * 100}%`);
  setStoryScene(index);
  const finished = progress >= .94;
  const wasFinished = storyStage.classList.contains('is-finished');
  storyStage.classList.toggle('is-finished', finished);
  if (finished) {
    $('.scene-speech', storyScenes[3]).textContent = 'WE MADE IT!';
    $('.story-sprite', storyScenes[3]).dataset.frame = '3';
  } else if (wasFinished) {
    $('.scene-speech', storyScenes[3]).textContent = storyScenes[3].dataset.defaultSpeech || 'ALMOST THERE!';
    $('.story-sprite', storyScenes[3]).dataset.frame = '0';
  }
}
function jumpToStoryScene(index) {
  const start = storyScroll.getBoundingClientRect().top + scrollY - 76;
  const travel = Math.max(1, storyScroll.offsetHeight - storyStage.offsetHeight);
  scrollTo({top:start + travel * ((index + .08) / 4),behavior:motionOK ? 'smooth' : 'instant'});
}
$('#manga-button').addEventListener('click', () => jumpToStoryScene((currentStoryScene + 1) % 4));
$$('[data-story-jump]').forEach(button => button.addEventListener('click', () => jumpToStoryScene(Number(button.dataset.storyJump))));
$$('[data-react-scene]').forEach(button => button.addEventListener('click', () => reactStoryScene(Number(button.dataset.reactScene))));
storyScenes.forEach((scene, index) => {
  const actor = $('.scene-actor', scene);
  actor.addEventListener('pointerenter', () => { if (finePointer) reactStoryScene(index); });
  actor.addEventListener('pointerdown', () => reactStoryScene(index));
});
if (!motionOK) storyStage.classList.remove('is-playing');
$('#crew-button').textContent = motionOK ? 'PAUSE MOTION Ⅱ' : 'START MOTION ▶';
$('#crew-button').setAttribute('aria-pressed', String(motionOK));
$('#crew-button').addEventListener('click', event => {
  const playing = storyStage.classList.toggle('is-playing');
  event.currentTarget.setAttribute('aria-pressed', String(playing));
  event.currentTarget.textContent = playing ? 'PAUSE MOTION Ⅱ' : 'START MOTION ▶';
});
addEventListener('scroll', () => {
  if (storyScrollQueued) return;
  storyScrollQueued = true;
  requestAnimationFrame(updateStoryScroll);
}, {passive:true});
addEventListener('resize', updateStoryScroll);
addEventListener('pageshow', () => requestAnimationFrame(updateStoryScroll));
setInterval(() => {
  if (!motionOK || !storyStage.classList.contains('is-playing') || document.visibilityState !== 'visible') return;
  const box = storyStage.getBoundingClientRect();
  if (box.bottom < 0 || box.top > innerHeight) return;
  const scene = storyScenes[currentStoryScene];
  if (!scene || scene.classList.contains('is-reacting') || storyStage.classList.contains('is-finished')) return;
  const sprite = $('.story-sprite', scene);
  if (sprite) sprite.dataset.frame = storyFrameTick++ % 4 < 2 ? '0' : '1';
}, 260);
updateStoryScroll();

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}, {threshold:.12});
$$('.opening-title,.opening-aside,.health-intro,.pricing-head,.ai-top,.education-intro,.timeline-intro,.timeline-copy,.skills-intro,.skill-route,.achievements-intro,.achievement-ticket,.cert-intro,.personal-story,.story-header,.story-stage').forEach(item => { item.classList.add('reveal'); observer.observe(item); });
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
