import './styles.css';

type Reaction = { name: string; emoji: string; text: string; tone: string };
type Post = { id: string; name: string; time: string; image: string; text: string; reactions: string };
type Group = { id: string; name: string; image: string; members: string[]; posts: Post[] };
type SentReaction = { recipient: string; emoji: string; stamp: string; postText: string };

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

const groups: Group[] = [
	{ id: 'tanaka', name: '田中家', image: '🏡', members: ['たかし', 'ゆうき', 'さくら'], posts: [
		{ id: 'tanaka-1', name: 'ゆうき', time: '20分前', image: '🍛', text: '今日の田中家ごはん！', reactions: 'さくら 他2人' },
		{ id: 'tanaka-2', name: 'さくら', time: '昨日', image: '🍰', text: 'みんなでおやつを食べたよ', reactions: 'たかし 他1人' },
	] },
	{ id: 'friends', name: 'いつものメンバー', image: '🌳', members: ['たかし', 'けん', 'みさき'], posts: [
		{ id: 'friends-1', name: 'けん', time: '1時間前', image: '🍱', text: '次の集まりが楽しみ！', reactions: 'みさき 他2人' },
	] },
];

const root = document.querySelector<HTMLDivElement>('#app')!;
const sentReactions: SentReaction[] = [];

type CalendarEntry = {
	label: string;
	emoji: string;
	accent: 'blue' | 'pink' | 'orange';
	amount: number;
	date: Date;
};

let calendarWeekStart = getStartOfWeek(new Date());

function getStartOfWeek(date: Date): Date {
	const startOfWeek = new Date(date);
	startOfWeek.setHours(0, 0, 0, 0);
	const day = startOfWeek.getDay();
	const diffToMonday = day === 0 ? -6 : 1 - day;
	startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
	return startOfWeek;
}

function getCalendarWeekDates(weekStart: Date): Date[] {
	return Array.from({ length: 7 }, (_, index) => {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + index);
		return date;
	});
}

function formatDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function getCalendarStorageKey(weekStart: Date): string {
	return `meal-calendar-${formatDateKey(weekStart)}`;
}

function readCalendarWeekData(weekStart: Date): Record<string, number> {
	const key = getCalendarStorageKey(weekStart);
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) as Record<string, number> : {};
	} catch {
		return {};
	}
}

function writeCalendarWeekData(weekStart: Date, entries: CalendarEntry[]): void {
	const key = getCalendarStorageKey(weekStart);
	const map: Record<string, number> = {};
	entries.forEach((entry) => {
		map[formatDateKey(entry.date)] = entry.amount;
	});
	window.localStorage.setItem(key, JSON.stringify(map));
}

function buildCalendarEntries(weekStart: Date): CalendarEntry[] {
	const stored = readCalendarWeekData(weekStart);
	const days = getCalendarWeekDates(weekStart);
	const legacySeed = [1, 1.5, 1, 1, 1.6, 1.2, 1.1];
	const hasStoredEntries = Object.keys(stored).length > 0;
	const hasLegacySeed = days.every((date, index) => {
		const dateKey = formatDateKey(date);
		return Number(stored[dateKey]) === legacySeed[index];
	});

	const initialized = days.map((date, index) => {
		const emojis = ['🍽️', '🍜', '🥗', '🍙', '🍜', '🥗', '🥳'];
		const label = `${date.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`;
		const dateKey = formatDateKey(date);
		const amount = Number.isFinite(stored[dateKey]) ? Math.round(Number(stored[dateKey])) : 0;
		return { label, emoji: emojis[index], accent: getCalendarAccent(amount), amount, date };
	});
	const resetEntries = initialized.map((entry) => ({ ...entry, amount: 0, accent: getCalendarAccent(0) }));

	if (!hasStoredEntries || hasLegacySeed) {
		writeCalendarWeekData(weekStart, hasLegacySeed ? resetEntries : initialized);
	}

	if (hasLegacySeed) {
		return resetEntries;
	}

	return initialized;
}

let calendarEntries = buildCalendarEntries(calendarWeekStart);

function formatWeekRange(weekStart: Date): string {
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);
	const startText = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
	const endText = `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
	return `${startText}〜${endText}`;
}

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
			${renderNav('home')}
		</main>`;
	bindEvents();
}

function renderNav(active: 'home' | 'groups' | 'calendar'): string {
	return `<nav class="bottom-nav" aria-label="メインメニュー">
				<button class="nav-item ${active === 'home' ? 'active' : ''}" data-screen="home"><span>⌂</span><small>ホーム</small></button>
				<button class="nav-item ${active === 'groups' ? 'active' : ''}" data-screen="groups"><span>♟</span><small>グループ</small></button>
				<button class="nav-item"><span>✿</span><small>アドバイス</small></button>
				<button class="nav-item ${active === 'calendar' ? 'active' : ''}" data-screen="calendar"><span>□</span><small>カレンダー</small></button>
			</nav>`;
}

function getCalendarAccent(amount: number): CalendarEntry['accent'] {
	if (amount >= 3) return 'orange';
	if (amount >= 2) return 'pink';
	return 'blue';
}

function renderCalendar(): void {
	calendarEntries = buildCalendarEntries(calendarWeekStart);
	root.innerHTML = `
		<main class="calendar-shell">
			<header class="calendar-header">
				<button class="calendar-nav-button" id="calendar-prev" aria-label="前の週">‹</button>
				<div class="calendar-header-center">
					<h1>カレンダー</h1>
					<p>${formatWeekRange(calendarWeekStart)}</p>
				</div>
				<button class="calendar-nav-button" id="calendar-next" aria-label="次の週">›</button>
				<button class="profile-button profile-button-calendar" aria-label="プロフィール">◉</button>
			</header>
			<div class="calendar-content">
				<section class="calendar-card">
					<div class="calendar-title-row">
						<span class="little-dot"></span>
						<span class="little-dot"></span>
						<h2>今週の記録</h2>
					</div>
					<div class="calendar-grid">
						${calendarEntries.map((day, index) => `
						<div class="calendar-day ${day.accent}" data-card-index="${index}">
							<div class="day-label">${day.label}</div>
							<div class="day-art" aria-hidden="true">${day.emoji}</div>
							<label class="calendar-amount-field">
								<span>食べた量</span>
								<div class="calendar-amount-row">
									<input class="calendar-amount-input" type="number" min="0" max="5" step="1" value="${day.amount}" data-index="${index}" aria-label="${day.label}の食べた量">
									<span>食</span>
								</div>
							</label>
						</div>
						`).join('')}
					</div>
				</section>
				<div class="calendar-message-box">
					<div class="message-mini-avatar">◉</div>
					<div class="message-mini-copy">
						<p class="message-mini-label">いえん博士からのコメント</p>
						<p class="message-mini-text">今週の合計: ${calendarEntries.reduce((total, entry) => total + entry.amount, 0).toFixed(1)}食</p>
					</div>
				</div>
			</div>
			${renderNav('calendar')}
		</main>
	`;
	bindEvents();
}

function renderGroups(): void {
	root.innerHTML = `<main class="home-shell group-shell">
		<header class="home-header"><h1>グループ</h1><button class="profile-button" aria-label="プロフィール">◉</button></header>
		<div class="group-scroll">
			<section class="group-list-section" aria-label="参加しているグループ">
				<div class="group-list">${groups.map(renderGroupCard).join('')}</div>
				<button class="add-group-button" id="add-group" aria-label="グループを追加"><span>＋</span></button>
			</section>
		</div>
		${renderNav('groups')}
	</main>`;
	bindEvents();
}

function renderGroupCard(group: Group): string {
	return `<button class="group-card" data-group-id="${group.id}">
		<div class="group-cover">${group.image}<strong>${group.name}</strong></div>
		<div class="group-members">${group.members.map((member) => `<span title="${member}">${member.charAt(0)}</span>`).join('')}</div>
	</button>`;
}

function renderGroupDetail(group: Group): void {
	const myPost: Post = { id: `${group.id}-my-post`, name: 'たかし', time: 'あなたの投稿', image: '🍜', text: '今日のごはんを投稿しました！', reactions: 'リアクションを送る' };
	root.innerHTML = `<main class="home-shell group-shell">
		<header class="home-header group-detail-header"><button class="header-back" id="group-back" aria-label="グループ一覧に戻る">‹</button><h1>タイムライン</h1><button class="profile-button" aria-label="プロフィール">◉</button></header>
		<div class="group-scroll group-posts-scroll">
			<div class="timeline-group-name"><span class="post-avatar">${group.name.charAt(0)}</span><strong>${group.name}</strong></div>
			<div class="timeline-post-list"><section class="my-post-pin"><p class="pin-label">あなたの投稿</p>${renderTimelinePost(myPost, true)}</section>${group.posts.map((post) => renderTimelinePost(post, false)).join('')}</div>
		</div>
		${renderNav('groups')}
	</main>`;
	bindEvents();
}

function renderTimelinePost(post: Post, mine: boolean): string {
	return `<article class="timeline-post ${mine ? 'mine-post' : ''}" data-post-id="${post.id}">
		<div class="post-top"><span class="post-avatar">${post.name.charAt(0)}</span><span><strong>${post.name}</strong><small>${post.time}</small></span><button class="message-button" data-message-name="${post.name}" aria-label="${post.name}さんにメッセージ">✉</button></div>
		<div class="post-image">${post.image}</div><p class="post-text">${post.text}</p>
		<div class="stamp-area">
			<div class="stamp-heading"><strong>この写真にリアクションを送る</strong><small>${post.name}さんの投稿</small></div>
			<div class="stamp-list" aria-label="${post.name}さんへのリアクション">
			${['happy', 'love', 'sleepy', 'hungry', 'good', 'surprise'].map((stamp, index) => `<button class="stamp-button stamp-${stamp}" data-stamp="${post.id}-${stamp}" aria-label="${['おいしい', '大好き', 'おつかれ', '食べたい', 'いいね', 'びっくり'][index]}"><span class="stamp-stomach"><i>${['•ᴗ•', '♥ᴗ♥', '-ᴗ-', 'ᵔᴗᵔ', '^ᴗ^', '°o°'][index]}</i></span></button>`).join('')}
			</div>
			<p class="stamp-status" data-stamp-status="${post.id}">リアクションを選ぶと、投稿者へのメッセージとして届きます</p>
			<div class="sent-reaction" data-sent-reaction="${post.id}" aria-live="polite"></div>
		</div>
		<div class="reaction-count">${post.reactions}</div>
	</article>`;
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
	document.querySelectorAll<HTMLInputElement>('.calendar-amount-input').forEach((input) => {
		input.addEventListener('change', () => {
			const index = Number(input.dataset.index ?? '0');
			const amount = Math.round(Number(input.value || 0));
			calendarEntries[index].amount = amount;
			calendarEntries[index].accent = getCalendarAccent(amount);
			writeCalendarWeekData(calendarWeekStart, calendarEntries);
			const dayCard = input.closest('.calendar-day');
			dayCard?.classList.remove('blue', 'pink', 'orange');
			dayCard?.classList.add(calendarEntries[index].accent);
			const summary = document.querySelector<HTMLElement>('.message-mini-text');
			if (summary) summary.textContent = `今週の合計: ${calendarEntries.reduce((total, entry) => total + entry.amount, 0).toFixed(1)}食`;
		});
	});
	document.querySelector<HTMLButtonElement>('#calendar-prev')?.addEventListener('click', () => {
		calendarWeekStart = new Date(calendarWeekStart);
		calendarWeekStart.setDate(calendarWeekStart.getDate() - 7);
		renderCalendar();
	});
	document.querySelector<HTMLButtonElement>('#calendar-next')?.addEventListener('click', () => {
		calendarWeekStart = new Date(calendarWeekStart);
		calendarWeekStart.setDate(calendarWeekStart.getDate() + 7);
		renderCalendar();
	});
	document.querySelector<HTMLButtonElement>('[data-screen="home"]')?.addEventListener('click', render);
	document.querySelector<HTMLButtonElement>('[data-screen="groups"]')?.addEventListener('click', renderGroups);
	document.querySelector<HTMLButtonElement>('[data-screen="calendar"]')?.addEventListener('click', renderCalendar);
	document.querySelectorAll<HTMLButtonElement>('[data-group-id]').forEach((card) => card.addEventListener('click', () => {
		const group = groups.find((item) => item.id === card.dataset.groupId);
		if (group) renderGroupDetail(group);
	}));
	document.querySelector<HTMLButtonElement>('#group-back')?.addEventListener('click', renderGroups);
	document.querySelector<HTMLButtonElement>('#add-group')?.addEventListener('click', addGroup);
	document.querySelectorAll<HTMLButtonElement>('.stamp-button').forEach((button) => button.addEventListener('click', () => {
		const post = button.closest('.timeline-post');
		post?.querySelectorAll('.stamp-button').forEach((stamp) => stamp.classList.remove('selected'));
		button.classList.add('selected');
		const status = post?.querySelector<HTMLElement>('[data-stamp-status]');
		const emoji = button.querySelector('.stamp-stomach')?.textContent?.trim() ?? '♡';
		const recipient = post?.querySelector('.post-top strong')?.textContent ?? '友達';
		const postText = post?.querySelector('.post-text')?.textContent ?? '写真';
		const stampClass = Array.from(button.classList).find((className) => className.startsWith('stamp-') && className !== 'stamp-button') ?? '';
		const existing = sentReactions.findIndex((reaction) => reaction.recipient === recipient && reaction.postText === postText);
		const reaction = { recipient, emoji, stamp: stampClass.replace('stamp-', ''), postText };
		if (existing >= 0) sentReactions[existing] = reaction;
		else sentReactions.push(reaction);
		if (status) status.textContent = 'リアクションをメッセージとして送信しました ✓';
		const preview = post?.querySelector<HTMLElement>('[data-sent-reaction]');
		if (preview) preview.innerHTML = `<span>送信済み</span><img src="/reaction-${stampClass.replace('stamp-', '')}.png" alt="送信したリアクション">`;
	}));
	document.querySelectorAll<HTMLButtonElement>('.message-button').forEach((button) => button.addEventListener('click', () => showMessages(button.dataset.messageName ?? '友達')));
}

function addGroup(): void {
	const name = window.prompt('追加するグループ名を入力してください');
	if (!name?.trim()) return;
	groups.push({ id: `group-${Date.now()}`, name: name.trim(), image: '👨‍👩‍👧', members: ['たかし'], posts: [] });
	renderGroups();
}

function showMessages(name: string): void {
	root.innerHTML = `<main class="home-shell message-shell">
		<header class="home-header message-header"><button class="header-back" id="message-back" aria-label="タイムラインに戻る">‹</button><h1>メッセージ</h1><button class="profile-button" aria-label="プロフィール">◉</button></header>
		<div class="message-person"><span class="post-avatar">${name.charAt(0)}</span><strong>${name}</strong></div>
		<div class="message-list" id="message-list">
			<div class="message-photo outgoing"><div class="photo-preview">🍜</div><p>今日のごはんを投稿しました！</p></div>
			${sentReactions.filter((reaction) => reaction.recipient === name).map((reaction) => `<div class="reaction-message outgoing"><img src="/reaction-${reaction.stamp}.png" alt="送信したリアクション"></div>`).join('')}
			<div class="message-row incoming"><span class="message-avatar">${name.charAt(0)}</span><div class="message-bubble">投稿を見てくれてありがとう！</div></div>
		</div>
		<form class="message-composer" id="message-composer">
			<input id="message-input" autocomplete="off" placeholder="メッセージを入力..." aria-label="メッセージを入力">
			<button type="submit" aria-label="メッセージを送信">➤</button>
		</form>
		${renderNav('groups')}
	</main>`;
	document.querySelector('#message-back')?.addEventListener('click', renderGroups);
	document.querySelector<HTMLFormElement>('#message-composer')?.addEventListener('submit', (event) => {
		event.preventDefault();
		const input = document.querySelector<HTMLInputElement>('#message-input');
		const text = input?.value.trim();
		if (!input || !text) return;
		document.querySelector('#message-list')?.insertAdjacentHTML('beforeend', `<div class="message-row outgoing"><div class="message-bubble">${escapeHtml(text)}</div></div>`);
		input.value = '';
		document.querySelector('#message-list')?.scrollTo({ top: 99999, behavior: 'smooth' });
	});
}

function escapeHtml(value: string): string {
	return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] ?? character));
}

function showCamera(): void {
	root.innerHTML = `<main class="camera-screen"><button class="camera-back" id="camera-back">‹ ホーム</button><div class="camera-copy"><span class="camera-icon">▣</span><h1>写真を投稿</h1><p>今日のごはんをみんなにシェアしよう</p><label class="photo-picker">写真を選ぶ<input type="file" accept="image/*" capture="environment"></label></div></main>`;
	document.querySelector('#camera-back')?.addEventListener('click', render);
}

render();
