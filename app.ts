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

function renderNav(active: 'home' | 'groups'): string {
	return `<nav class="bottom-nav" aria-label="メインメニュー">
				<button class="nav-item ${active === 'home' ? 'active' : ''}" data-screen="home"><span>⌂</span><small>ホーム</small></button>
				<button class="nav-item ${active === 'groups' ? 'active' : ''}" data-screen="groups"><span>♟</span><small>グループ</small></button>
				<button class="nav-item"><span>✿</span><small>アドバイス</small></button>
				<button class="nav-item"><span>□</span><small>カレンダー</small></button>
			</nav>`;
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
		<div class="post-top"><span class="post-avatar">${post.name.charAt(0)}</span><span><strong>${post.name}</strong><small>${post.time}</small></span><button class="message-button" data-message-name="${post.name}" aria-label="${post.name}さんにメッセージ">✉</button>${mine ? `<span class="post-more" data-delete-post="${post.id}" role="button" tabindex="0" aria-label="投稿を削除">•••</span>` : ''}</div>
		<div class="post-image">${imageMarkup(post.image)}</div><p class="post-text">${post.text}</p>
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
		<div class="post-top"><span class="post-avatar">${post.name.charAt(0)}</span><span><strong>${post.name}</strong><small>${post.time}</small></span><span class="post-more" ${post.name === 'たかし' ? `data-delete-post="${post.id}"` : ''} role="button" tabindex="0" aria-label="投稿メニュー">•••</span></div>
		<div class="post-image">${imageMarkup(post.image)}</div><p class="post-text">${post.text}</p><div class="post-reactions">♡ ${post.reactions}</div>
	</button>`;
}

function imageMarkup(image: string): string {
	return image.startsWith('data:image/') ? `<img src="${image}" alt="投稿した写真">` : image;
}

function bindEvents(): void {
	document.querySelectorAll<HTMLButtonElement>('.post-card').forEach((card) => card.addEventListener('click', () => card.scrollIntoView({ behavior: 'smooth', block: 'center' })));
	document.querySelector<HTMLButtonElement>('#show-all')?.addEventListener('click', () => document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' }));
	document.querySelector<HTMLButtonElement>('#camera-button')?.addEventListener('click', showCamera);
	document.querySelectorAll<HTMLButtonElement>('.reaction-bubble').forEach((bubble) => bubble.addEventListener('click', () => bubble.classList.toggle('selected')));
	document.querySelector<HTMLButtonElement>('[data-screen="home"]')?.addEventListener('click', render);
	document.querySelector<HTMLButtonElement>('[data-screen="groups"]')?.addEventListener('click', renderGroups);
	document.querySelectorAll<HTMLButtonElement>('[data-group-id]').forEach((card) => card.addEventListener('click', () => {
		const group = groups.find((item) => item.id === card.dataset.groupId);
		if (group) renderGroupDetail(group);
	}));
	document.querySelector<HTMLButtonElement>('#group-back')?.addEventListener('click', renderGroups);
	document.querySelector<HTMLButtonElement>('#add-group')?.addEventListener('click', addGroup);
	document.querySelector<HTMLButtonElement>('#cancel-group')?.addEventListener('click', () => document.querySelector('.group-dialog-backdrop')?.remove());
	document.querySelector<HTMLButtonElement>('#create-group')?.addEventListener('click', createGroup);
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
	document.querySelectorAll<HTMLElement>('[data-delete-post]').forEach((menu) => {
		const removePost = (): void => {
			const postId = menu.dataset.deletePost;
			if (!postId) return;
			showDeleteDialog(() => {
				const index = posts.findIndex((post) => post.id === postId);
				if (index >= 0) posts.splice(index, 1);
				groups.forEach((group) => {
					const groupIndex = group.posts.findIndex((post) => post.id === postId);
					if (groupIndex >= 0) group.posts.splice(groupIndex, 1);
				});
				const timelinePost = menu.closest('.timeline-post');
				if (timelinePost) {
					const group = groups.find((item) => item.posts.some((post) => post.id === postId) || postId.startsWith(`${item.id}-`));
					if (group) renderGroupDetail(group);
					else render();
				} else render();
			});
		};
		menu.addEventListener('click', (event) => { event.stopPropagation(); removePost(); });
		menu.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); removePost(); } });
	});
	document.querySelectorAll<HTMLElement>('.post-more:not([data-delete-post])').forEach((menu) => {
		menu.addEventListener('click', (event) => {
			event.stopPropagation();
			showInfoDialog('この投稿は削除できません', '自分の投稿だけ削除できます。');
		});
		menu.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				showInfoDialog('この投稿は削除できません', '自分の投稿だけ削除できます。');
			}
		});
	});
}

function showDeleteDialog(onConfirm: () => void): void {
	const dialog = document.createElement('div');
	dialog.className = 'delete-dialog-backdrop';
	dialog.innerHTML = `<section class="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
		<div class="delete-dialog-icon">!</div>
		<h2 id="delete-dialog-title">自分の投稿を削除しますか？</h2>
		<p>削除した投稿はタイムラインから見えなくなります。</p>
		<div class="delete-dialog-actions"><button class="delete-cancel">キャンセル</button><button class="delete-confirm">削除する</button></div>
	</section>`;
	document.body.appendChild(dialog);
	dialog.querySelector<HTMLButtonElement>('.delete-cancel')?.addEventListener('click', () => dialog.remove());
	dialog.querySelector<HTMLButtonElement>('.delete-confirm')?.addEventListener('click', () => {
		dialog.remove();
		onConfirm();
	});
}

function showInfoDialog(title: string, message: string): void {
	const dialog = document.createElement('div');
	dialog.className = 'delete-dialog-backdrop';
	dialog.innerHTML = `<section class="delete-dialog info-dialog" role="dialog" aria-modal="true" aria-labelledby="info-dialog-title">
		<div class="delete-dialog-icon">i</div>
		<h2 id="info-dialog-title">${title}</h2>
		<p>${message}</p>
		<div class="delete-dialog-actions"><button class="delete-confirm info-close">わかりました</button></div>
	</section>`;
	document.body.appendChild(dialog);
	dialog.querySelector<HTMLButtonElement>('.info-close')?.addEventListener('click', () => dialog.remove());
}

function addGroup(): void {
	const friends = [...new Set([...reactions.map((reaction) => reaction.name), 'けん', 'みさき'])];
	const dialog = document.createElement('div');
	dialog.className = 'group-dialog-backdrop';
	dialog.innerHTML = `<section class="group-dialog" role="dialog" aria-modal="true" aria-labelledby="group-dialog-title">
		<div class="group-dialog-header"><div><p class="dialog-kicker">NEW GROUP</p><h2 id="group-dialog-title">グループを作成</h2></div><button class="dialog-close" id="cancel-group" aria-label="閉じる">×</button></div>
		<label class="group-field-label" for="group-name">グループ名</label>
		<input class="group-name-input" id="group-name" type="text" maxlength="30" placeholder="例：週末ごはん会">
		<div class="group-friends-heading"><strong>フレンドを招待</strong><small>あとから追加することもできます</small></div>
		<div class="group-friend-list">${friends.map((friend) => `<label class="group-friend-option"><input type="checkbox" name="group-friend" value="${friend}"><span class="friend-avatar">${friend.charAt(0)}</span><strong>${friend}</strong><span class="friend-check">✓</span></label>`).join('')}</div>
		<button class="group-create-button" id="create-group">グループを作成する</button>
	</section>`;
	document.body.appendChild(dialog);
	dialog.querySelector<HTMLInputElement>('#group-name')?.focus();
	dialog.querySelector<HTMLButtonElement>('#cancel-group')?.addEventListener('click', () => dialog.remove());
	dialog.querySelector<HTMLButtonElement>('#create-group')?.addEventListener('click', createGroup);
	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) dialog.remove();
	});
}

function createGroup(): void {
	const nameInput = document.querySelector<HTMLInputElement>('#group-name');
	const name = nameInput?.value.trim() ?? '';
	if (!name) {
		nameInput?.focus();
		nameInput?.classList.add('input-error');
		return;
	}
	const members = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="group-friend"]:checked')).map((input) => input.value);
	groups.push({ id: `group-${Date.now()}`, name, image: '👨‍👩‍👧', members: ['たかし', ...members], posts: [] });
	document.querySelector('.group-dialog-backdrop')?.remove();
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
	root.innerHTML = `<main class="post-screen">
		<header class="home-header"><button class="header-back" id="camera-back" aria-label="ホームに戻る">‹</button><h1>投稿</h1><button class="profile-button" aria-label="プロフィール">◉</button></header>
		<div class="post-form">
			<div class="photo-preview-area empty" id="photo-preview"><span>写真を選択してください</span></div>
			<label class="photo-select-card" id="photo-select-card"><span class="photo-select-icon">＋</span><span class="photo-select-title">写真を選ぶ</span><small>タップしてカメラ撮影またはアルバムから選択</small><input id="photo-input" type="file" accept="image/*" capture="environment"></label>
			<div class="edit-tools" id="edit-tools" hidden><strong>写真を編集</strong><button type="button" data-filter="none">通常</button><button type="button" data-filter="bright">明るく</button><button type="button" data-filter="soft">やわらかく</button><button type="button" data-filter="gray">モノクロ</button><button type="button" id="rotate-photo">↻ 回転</button></div>
			<label class="comment-label" for="post-comment">コメント</label><textarea id="post-comment" placeholder="コメントを入力..."></textarea>
			<button class="publish-button" id="publish-button" disabled>投稿する</button>
		</div>
		${renderNav('home')}
	</main>`;
	let selectedImage = '';
	let filter = 'none';
	let rotation = 0;
	const preview = document.querySelector<HTMLDivElement>('#photo-preview')!;
	const input = document.querySelector<HTMLInputElement>('#photo-input')!;
	const tools = document.querySelector<HTMLDivElement>('#edit-tools')!;
	const publish = document.querySelector<HTMLButtonElement>('#publish-button')!;
	const updatePreview = (): void => {
		preview.className = `photo-preview-area ${filter}`;
		const image = preview.querySelector<HTMLImageElement>('img');
		if (image) image.style.transform = `rotate(${rotation}deg)`;
	};
	input.addEventListener('change', () => {
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			selectedImage = String(reader.result);
			preview.innerHTML = `<img src="${selectedImage}" alt="投稿写真">`;
			preview.classList.remove('empty');
			const selectCard = document.querySelector<HTMLElement>('#photo-select-card');
			if (selectCard) {
				selectCard.classList.add('has-photo');
				selectCard.querySelector<HTMLElement>('.photo-select-title')!.textContent = '写真を変更';
				selectCard.querySelector('small')!.textContent = '別の写真を選び直す';
			}
			tools.hidden = false;
			publish.disabled = false;
			updatePreview();
		});
		reader.readAsDataURL(file);
	});
	tools.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => {
		filter = button.dataset.filter ?? 'none';
		updatePreview();
	}));
	document.querySelector<HTMLButtonElement>('#rotate-photo')?.addEventListener('click', () => { rotation = (rotation + 90) % 360; updatePreview(); });
	publish.addEventListener('click', () => {
		const text = document.querySelector<HTMLTextAreaElement>('#post-comment')?.value.trim() || '今日のごはんを投稿しました！';
		posts.unshift({ id: `post-${Date.now()}`, name: 'たかし', time: '今', image: selectedImage, text, reactions: 'リアクションを送る' });
		render();
	});
	document.querySelector('#camera-back')?.addEventListener('click', render);
}

render();
