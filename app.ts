import './styles.css';

type Reaction = { name: string; emoji: string; text: string; tone: string };
type Post = { id: string; name: string; time: string; image: string; text: string; reactions: string };
type Connection = { id: string; name: string; photo: string; message: string };
type SavedState = { profileName: string; profileImage: string; notificationsEnabled: boolean; profileMessage: string; profilePublic: boolean; connections: Connection[]; favorites: Post[] };

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

const myPosts: Post[] = [
	{ id: 'my-post-1', name: 'あなた', time: '昨日', image: '🍳', text: '朝ごはんをゆっくり食べました', reactions: 'さくら 他2人' },
	{ id: 'my-post-2', name: 'あなた', time: '3日前', image: '🍛', text: 'お気に入りのカレーを食べに行ったよ', reactions: 'ゆうき 他4人' },
	{ id: 'my-post-3', name: 'あなた', time: '1週間前', image: '🍰', text: '食後のデザートまで楽しみました', reactions: 'けん 他1人' },
];

let connections: Connection[] = [
	{ id: 'sakura', name: 'さくら', photo: '🌸', message: 'おいしいものが好き' },
	{ id: 'yuki', name: 'ゆうき', photo: '☕', message: 'カフェ巡り中' },
	{ id: 'ken', name: 'けん', photo: '🍙', message: 'みんなでごはん' },
	{ id: 'misaki', name: 'みさき', photo: '🍓', message: '料理に挑戦中' },
];

let favorites: Post[] = [
	{ id: 'favorite-1', name: 'さくら', time: '10分前', image: '🥗', text: '今日のお昼は野菜たっぷり！', reactions: 'さくら、ゆうき 他3人' },
	{ id: 'favorite-2', name: 'ゆうき', time: '1時間前', image: '🍝', text: 'お気に入りのお店でランチしてきたよ', reactions: 'けん 他2人' },
	{ id: 'favorite-3', name: 'けん', time: '昨日', image: '🍱', text: 'みんなで食べるごはんは最高！', reactions: 'みさき 他4人' },
];

const friendMessages: Record<string, string> = {
	さくら: 'おいしいものが好き',
	ゆうき: 'カフェ巡り中',
	けん: 'みんなでごはん',
	みさき: '料理に挑戦中',
};

const root = document.querySelector<HTMLDivElement>('#app')!;
let profileName = 'あなた';
let profileImage = '';
let notificationsEnabled = true;
let profileMessage = '';
let profilePublic = true;

function saveAppState(): void {
	const state: SavedState = { profileName, profileImage, notificationsEnabled, profileMessage, profilePublic, connections, favorites };
	try {
		localStorage.setItem('hakason-app-state', JSON.stringify(state));
	} catch {
	}
}

function loadAppState(): void {
	try {
		const saved = localStorage.getItem('hakason-app-state');
		if (!saved) return;
		const state = JSON.parse(saved) as Partial<SavedState>;
		if (typeof state.profileName === 'string') profileName = state.profileName;
		if (typeof state.profileImage === 'string') profileImage = state.profileImage;
		if (typeof state.notificationsEnabled === 'boolean') notificationsEnabled = state.notificationsEnabled;
		if (typeof state.profileMessage === 'string') profileMessage = state.profileMessage;
		if (typeof state.profilePublic === 'boolean') profilePublic = state.profilePublic;
		if (Array.isArray(state.connections)) connections = state.connections;
		if (Array.isArray(state.favorites)) favorites = state.favorites;
	} catch {
	}
}

function escapeHtml(value: string): string {
	return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function profileAvatarMarkup(className: string): string {
	return profileImage
		? `<div class="${className} has-image"><img src="${profileImage}" alt="プロフィール写真"></div>`
		: `<div class="${className}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.1-5.2 7-5.2s6.3 1.8 7 5.2" /></svg></div>`;
}

function friendAvatarMarkup(name: string, photo: string): string {
	return `<div class="friend-avatar" role="img" aria-label="${escapeHtml(name)}のプロフィール写真">${photo}</div>`;
}

function showDeleteConfirm(message: string, onConfirm: () => void): void {
	const modal = document.createElement('div');
	modal.className = 'delete-modal-backdrop';
	modal.innerHTML = `<section class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">削除の確認</h2><p>${escapeHtml(message)}</p><div class="delete-modal-actions"><button class="delete-cancel" type="button">キャンセル</button><button class="delete-confirm" type="button">削除</button></div></section>`;
	root.append(modal);
	modal.querySelector<HTMLButtonElement>('.delete-cancel')?.addEventListener('click', () => modal.remove());
	modal.querySelector<HTMLButtonElement>('.delete-confirm')?.addEventListener('click', () => {
		modal.remove();
		onConfirm();
	});
}

function render(): void {
	root.innerHTML = `
		<main class="home-shell">
			<header class="home-header"><h1>ホーム</h1><button class="profile-button" id="profile-button" aria-label="マイページ"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.1-5.2 7-5.2s6.3 1.8 7 5.2" /></svg></button></header>
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
				<button class="nav-item" id="advice-button"><span>✿</span><small>アドバイス</small></button>
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
	document.querySelector<HTMLButtonElement>('#profile-button')?.addEventListener('click', showProfile);
	document.querySelector<HTMLButtonElement>('#advice-button')?.addEventListener('click', showAdvice);
	document.querySelectorAll<HTMLButtonElement>('.reaction-bubble').forEach((bubble) => bubble.addEventListener('click', () => bubble.classList.toggle('selected')));
}

function showAdvice(): void {
	root.innerHTML = `<main class="home-shell advice-screen">
		<header class="home-header"><h1>アドバイス</h1><button class="profile-button" id="advice-profile-button" aria-label="マイページ"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.1-5.2 7-5.2s6.3 1.8 7 5.2" /></svg></button></header>
		<div class="home-scroll advice-content">
			<section class="advice-summary"><span class="advice-icon">✿</span><p class="section-kicker">今日の食事バランス</p><h2>いいペースです</h2><p>野菜と主食のバランスがとれています。次の食事も無理なく楽しみましょう。</p></section>
			<section class="advice-card"><span>💧</span><div><strong>水分をもう少し</strong><p>こまめに水分をとると、午後もすっきり過ごせます。</p></div></section>
			<section class="advice-card"><span>🥕</span><div><strong>次の一歩</strong><p>次の食事に彩りのある野菜を一品加えてみましょう。</p></div></section>
		</div>
		<nav class="bottom-nav" aria-label="メインメニュー">
			<button class="nav-item" id="advice-home-button"><span>⌂</span><small>ホーム</small></button>
			<button class="nav-item"><span>♟</span><small>グループ</small></button>
			<button class="nav-item active"><span>✿</span><small>アドバイス</small></button>
			<button class="nav-item"><span>□</span><small>カレンダー</small></button>
		</nav>
	</main>`;
	document.querySelector<HTMLButtonElement>('#advice-home-button')?.addEventListener('click', render);
	document.querySelector<HTMLButtonElement>('#advice-profile-button')?.addEventListener('click', showProfile);
}

function showProfile(): void {
	root.innerHTML = `<main class="home-shell profile-screen">
		<header class="home-header"><h1>マイページ</h1><button class="profile-button" aria-label="マイページ"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.1-5.2 7-5.2s6.3 1.8 7 5.2" /></svg></button></header>
		<div class="home-scroll">
		<section class="profile-content">
			${profileAvatarMarkup('profile-large-avatar')}
			<h2>${!profilePublic ? '<span class="private-lock" aria-label="非公開">🔒</span>' : ''}${escapeHtml(profileName)}</h2><p class="profile-handle">@my_gohan</p>${profileMessage ? `<p class="profile-message">${escapeHtml(profileMessage)}</p>` : ''}<p class="profile-visibility">${profilePublic ? '公開プロフィール' : '非公開プロフィール'}</p>
			<div class="profile-stats"><button class="profile-stat-button" id="my-posts"><strong>12</strong><small>投稿</small></button><button class="profile-stat-button" id="my-connections"><strong>${connections.length}</strong><small>つながり</small></button><button class="profile-stat-button" id="my-favorites"><strong>${favorites.length}</strong><small>お気に入り</small></button></div>
			<button class="profile-action" id="edit-profile">プロフィールを編集</button>
		</section>
		</div>
		<nav class="bottom-nav" aria-label="メインメニュー">
			<button class="nav-item active" id="profile-home-button"><span>⌂</span><small>ホーム</small></button>
			<button class="nav-item"><span>♟</span><small>グループ</small></button>
			<button class="nav-item" id="profile-advice-button"><span>✿</span><small>アドバイス</small></button>
			<button class="nav-item"><span>□</span><small>カレンダー</small></button>
		</nav>
	</main>`;
	document.querySelector<HTMLButtonElement>('#profile-home-button')?.addEventListener('click', render);
	document.querySelector<HTMLButtonElement>('#profile-advice-button')?.addEventListener('click', showAdvice);
	document.querySelector<HTMLButtonElement>('#my-posts')?.addEventListener('click', showMyPosts);
	document.querySelector<HTMLButtonElement>('#my-connections')?.addEventListener('click', showConnections);
	document.querySelector<HTMLButtonElement>('#my-favorites')?.addEventListener('click', showFavorites);
	document.querySelector<HTMLButtonElement>('#edit-profile')?.addEventListener('click', showProfileEdit);
}

function showFavorites(): void {
	root.innerHTML = `<main class="profile-posts-screen">
		<header class="profile-header"><button class="profile-back" id="favorites-back" aria-label="マイページに戻る">‹</button><h1>お気に入り</h1></header>
		<section class="favorite-list">${favorites.length ? favorites.map((post) => {
			const profile = connections.find((connection) => connection.name === post.name);
			const message = profile?.message ?? friendMessages[post.name] ?? 'お気に入りの投稿をチェック中';
			return `<div class="favorite-row">${friendAvatarMarkup(post.name, profile?.photo ?? '🍽️')}<div class="favorite-copy"><strong>${escapeHtml(post.name)}</strong><small>${escapeHtml(message)}</small></div><button class="favorite-remove" data-favorite-id="${post.id}">削除</button></div>`;
		}).join('') : '<p class="empty-connections">お気に入りはありません</p>'}</section>
	</main>`;
	document.querySelector<HTMLButtonElement>('#favorites-back')?.addEventListener('click', showProfile);
	document.querySelectorAll<HTMLButtonElement>('.favorite-remove').forEach((button) => button.addEventListener('click', () => {
		showDeleteConfirm('このお気に入りを削除しますか？', () => {
			favorites = favorites.filter((post) => post.id !== button.dataset.favoriteId);
			saveAppState();
			showFavorites();
		});
	}));
}

function showConnections(): void {
	root.innerHTML = `<main class="profile-posts-screen">
		<header class="profile-header"><button class="profile-back" id="connections-back" aria-label="マイページに戻る">‹</button><h1>つながり</h1></header>
		<section class="connections-list">${connections.length ? connections.map((connection) => `<div class="connection-row">${friendAvatarMarkup(connection.name, connection.photo)}<div class="connection-copy"><strong>${escapeHtml(connection.name)}</strong><small>${escapeHtml(connection.message)}</small></div><button class="connection-remove" data-connection-id="${connection.id}">削除</button></div>`).join('') : '<p class="empty-connections">つながりはありません</p>'}</section>
	</main>`;
	document.querySelector<HTMLButtonElement>('#connections-back')?.addEventListener('click', showProfile);
	document.querySelectorAll<HTMLButtonElement>('.connection-remove').forEach((button) => button.addEventListener('click', () => {
		showDeleteConfirm('このつながりを削除しますか？', () => {
			connections = connections.filter((connection) => connection.id !== button.dataset.connectionId);
			saveAppState();
			showConnections();
		});
	}));
}

function showMyPosts(): void {
	root.innerHTML = `<main class="profile-posts-screen">
		<header class="profile-header"><button class="profile-back" id="posts-back" aria-label="マイページに戻る">‹</button><h1>自分の投稿</h1></header>
		<div class="profile-posts-list">${myPosts.map((post) => renderPost({ ...post, name: profileName })).join('')}</div>
	</main>`;
	document.querySelector<HTMLButtonElement>('#posts-back')?.addEventListener('click', showProfile);
	document.querySelectorAll<HTMLButtonElement>('.post-card').forEach((card) => card.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', block: 'center' })));
}

function showProfileEdit(): void {
	root.innerHTML = `<main class="home-shell profile-screen">
		<header class="profile-header"><button class="profile-back" id="edit-back" aria-label="マイページに戻る">‹</button><h1>プロフィールを編集</h1></header>
		<form class="profile-edit-form" id="profile-edit-form">
			<label class="edit-photo-label" for="profile-photo">${profileAvatarMarkup('edit-avatar')}<span>プロフィール写真を変更</span><input id="profile-photo" type="file" accept="image/*"></label>
			<label class="edit-field">名前<input id="profile-name" type="text" value="${escapeHtml(profileName)}" maxlength="30" required></label>
			<label class="edit-field">一言メッセージ<textarea id="profile-message" maxlength="100" placeholder="好きな食べ物やひとことを入力">${escapeHtml(profileMessage)}</textarea></label>
			<label class="notification-row">通知<div class="toggle-wrap"><input id="notifications" type="checkbox" ${notificationsEnabled ? 'checked' : ''}><span class="toggle"></span></div></label>
			<label class="notification-row">公開設定<div class="toggle-wrap"><input id="profile-public" type="checkbox" ${profilePublic ? 'checked' : ''}><span class="toggle"></span></div></label>
			<button class="profile-save" type="submit">保存する</button>
		</form>
	</main>`;
	document.querySelector<HTMLButtonElement>('#edit-back')?.addEventListener('click', showProfile);
	document.querySelector<HTMLInputElement>('#profile-photo')?.addEventListener('change', handleProfilePhoto);
	document.querySelector<HTMLFormElement>('#profile-edit-form')?.addEventListener('submit', saveProfile);
}

function handleProfilePhoto(event: Event): void {
	const input = event.currentTarget as HTMLInputElement;
	const file = input.files?.[0];
	if (!file) return;
	const reader = new FileReader();
	reader.addEventListener('load', () => {
		profileImage = String(reader.result);
		const preview = document.querySelector('.edit-avatar');
		if (preview) preview.outerHTML = profileAvatarMarkup('edit-avatar');
	});
	reader.readAsDataURL(file);
}

function saveProfile(event: SubmitEvent): void {
	event.preventDefault();
	const nameInput = document.querySelector<HTMLInputElement>('#profile-name');
	const messageInput = document.querySelector<HTMLTextAreaElement>('#profile-message');
	const notificationInput = document.querySelector<HTMLInputElement>('#notifications');
	const publicInput = document.querySelector<HTMLInputElement>('#profile-public');
	profileName = nameInput?.value.trim() || profileName;
	profileMessage = messageInput?.value.trim() ?? profileMessage;
	notificationsEnabled = notificationInput?.checked ?? notificationsEnabled;
	profilePublic = publicInput?.checked ?? profilePublic;
	saveAppState();
	showProfile();
}

function showCamera(): void {
	root.innerHTML = `<main class="camera-screen"><button class="camera-back" id="camera-back">‹ ホーム</button><div class="camera-copy"><span class="camera-icon">▣</span><h1>写真を投稿</h1><p>今日のごはんをみんなにシェアしよう</p><label class="photo-picker">写真を選ぶ<input type="file" accept="image/*" capture="environment"></label></div></main>`;
	document.querySelector('#camera-back')?.addEventListener('click', render);
}

loadAppState();
render();
