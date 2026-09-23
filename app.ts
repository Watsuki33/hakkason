import './styles.css';

type Reaction = { name: string; emoji: string; text: string; tone: string };
type Post = { id: string; name: string; time: string; image: string; text: string; reactions: string };

const reactions: Reaction[] = [
	{ name: 'さくら', emoji: '🥰', text: 'おいしそう！', tone: 'peach' },
	{ name: 'ゆうき', emoji: '😋', text: 'いいね！', tone: 'yellow' },
	{ name: 'けん', emoji: '👏', text: '食べたい！', tone: 'blue' },
	{ name: 'みさき', emoji: '❤️', text: 'いいね！', tone: 'pink' },
];

const posts: Post[] = [
	{ id: 'sakura-post', name: 'さくら', time: '10分前', image: '🥗', text: '今日のお昼は野菜たっぷり！', reactions: 'さくら、ゆうき 他3人' },
	{ id: 'yuki-post', name: 'ゆうき', time: '1時間前', image: '🍝', text: 'お気に入りのお店でランチしてきたよ', reactions: 'けん 他2人' },
	{ id: 'ken-post', name: 'けん', time: '昨日', image: '🍱', text: 'みんなで食べるごはんは最高！', reactions: 'みさき 他4人' },
];

const root = document.querySelector<HTMLDivElement>('#app')!;

function render(): void {
	root.innerHTML = `
		<main class="home-shell">
			<header class="home-header"><h1>ホーム</h1><button class="profile-button" aria-label="プロフィール">◉</button></header>
			<div class="home-scroll">
				<section class="reaction-section" aria-label="友達からのリアクション">
					<p class="section-kicker">あなたの投稿にリアクション</p>
					<div class="stomach-scene">
						<svg class="stomach-art" viewBox="0 0 280 320" aria-hidden="true">
							<path d="M174 22c-9 55 5 77 40 95 38 20 40 62 13 91-26 28-62 31-92 48-33 19-49 42-57 72l-43-6c7-48 22-83 56-111 19-16 43-27 52-52 9-26-12-47-17-72-5-25 0-46 11-70z" />
							<path class="stomach-line" d="M174 23c15 15 43 16 57 1" />
						</svg>
						<div class="reaction-bubbles">
							${reactions.map((reaction, index) => `<button class="reaction-bubble ${reaction.tone} bubble-${index}" data-reaction="${reaction.name}"><span>${reaction.emoji}</span><small>${reaction.name}</small><strong>${reaction.text}</strong></button>`).join('')}
						</div>
					</div>
					<p class="reaction-hint">みんなの気持ちが胃の中にたまっているよ</p>
				</section>
				<section class="timeline-section" id="timeline">
					<div class="section-heading"><h2>タイムライン</h2><button class="timeline-link" id="show-all">すべて見る</button></div>
					<div class="post-list">${posts.map(renderPost).join('')}</div>
				</section>
			</div>
			<button class="camera-button" id="camera-button" aria-label="写真を投稿"><span>▣</span></button>
			<nav class="bottom-nav" aria-label="メインメニュー">
				<button class="nav-item active"><span>⌂</span><small>ホーム</small></button>
				<button class="nav-item"><span>♟</span><small>グループ</small></button>
				<button class="nav-item"><span>✿</span><small>アドバイス</small></button>
				<button class="nav-item"><span>□</span><small>カレンダー</small></button>
			</nav>
		</main>`;
	bindEvents();
}

function renderPost(post: Post): string {
	return `<button class="post-card" data-post-id="${post.id}">
		<div class="post-top"><span class="post-avatar">${post.name.charAt(0)}</span><span><strong>${post.name}</strong><small>${post.time}</small></span><span class="post-more">•••</span></div>
		<div class="post-image">${post.image}</div><p class="post-text">${post.text}</p><div class="post-reactions">♡ ${post.reactions}</div>
	</button>`;
}

function bindEvents(): void {
	document.querySelectorAll<HTMLButtonElement>('.post-card').forEach((card) => card.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', block: 'center' })));
	document.querySelector<HTMLButtonElement>('#show-all')?.addEventListener('click', () => document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' }));
	document.querySelector<HTMLButtonElement>('#camera-button')?.addEventListener('click', showCamera);
	document.querySelectorAll<HTMLButtonElement>('.reaction-bubble').forEach((bubble) => bubble.addEventListener('click', () => bubble.classList.toggle('selected')));
}

function showCamera(): void {
	root.innerHTML = `<main class="camera-screen"><button class="camera-back" id="camera-back">‹ ホーム</button><div class="camera-copy"><span class="camera-icon">▣</span><h1>写真を投稿</h1><p>今日のごはんをみんなにシェアしよう</p><label class="photo-picker">写真を選ぶ<input type="file" accept="image/*" capture="environment"></label></div></main>`;
	document.querySelector('#camera-back')?.addEventListener('click', render);
}

render();
