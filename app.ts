import './styles.css';

type Message = { sender: 'me' | 'other'; text: string; time: string; read?: boolean };
type Conversation = { id: string; name: string; initial: string; avatar: string; preview: string; time: string; online?: boolean; messages: Message[] };

const conversations: Conversation[] = [
	{ id: 'yuki', name: 'ゆうき', initial: 'ゆ', avatar: '', preview: '明日の集合、10時で大丈夫！', time: '10:42', online: true, messages: [{ sender: 'other', text: 'おつかれさま！明日の集合、10時で大丈夫？', time: '10:40' }, { sender: 'me', text: 'うん、大丈夫！駅前に集合しよう', time: '10:41', read: true }, { sender: 'other', text: '了解！楽しみにしてるね', time: '10:42' }] },
	{ id: 'team', name: 'プロジェクトチーム', initial: 'P', avatar: 'blue', preview: 'さくら: 資料を更新しました', time: '昨日', messages: [{ sender: 'other', text: '資料を更新しました。確認お願いします！', time: '昨日' }, { sender: 'me', text: 'ありがとうございます、確認します', time: '昨日', read: true }] },
	{ id: 'sakura', name: 'さくら', initial: 'さ', avatar: 'purple', preview: '写真ありがとう！', time: '月', messages: [{ sender: 'other', text: '写真ありがとう！また行こうね', time: '月' }] },
	{ id: 'ken', name: 'けん', initial: 'け', avatar: 'orange', preview: 'また連絡するね', time: '日', messages: [{ sender: 'me', text: '今日はありがとう！', time: '日', read: true }] },
	{ id: 'family', name: '家族', initial: '家', avatar: 'teal', preview: '母: 夕飯どうする？', time: '土', messages: [{ sender: 'other', text: '夕飯どうする？', time: '土' }] },
];

let selectedId = 'yuki';
const root = document.querySelector<HTMLDivElement>('#app')!;

function avatar(conversation: Conversation, small = false): string { return `<span class="avatar ${conversation.avatar} ${conversation.online ? 'online' : ''} ${small ? 'message-avatar' : ''}">${conversation.initial}</span>`; }

function render(): void {
	const selected = conversations.find((item) => item.id === selectedId) ?? conversations[0];
	root.innerHTML = `<main class="shell chat-open"><aside class="sidebar"><header class="brand"><span class="brand-name">胃縁</span><button class="icon-button" aria-label="新しいメッセージ">＋</button></header><label class="search"><span class="search-icon">⌕</span><input id="search" type="search" placeholder="メッセージを検索" aria-label="メッセージを検索"></label><div class="section-label">Messages</div><div class="conversation-list" id="conversation-list">${renderConversations(conversations)}</div><footer class="sidebar-footer"><span class="profile-avatar"></span><span class="profile-copy"><strong class="profile-name">たかし</strong><small class="profile-status">オンライン</small></span><button class="icon-button" aria-label="設定">•••</button></footer></aside><section class="chat"><header class="chat-header"><div class="chat-person"><button class="icon-button back-button" aria-label="会話一覧に戻る">‹</button>${avatar(selected)}<div><h1 class="chat-title">${selected.name}</h1><p class="chat-subtitle">${selected.online ? 'オンライン' : '最近のメッセージ'}</p></div></div><div class="chat-actions"><button class="icon-button" aria-label="通話">⌕</button><button class="icon-button" aria-label="その他">•••</button></div></header><div class="messages" id="messages"><div class="day-divider">今日</div>${renderMessages(selected.messages)}</div><div class="composer-wrap"><form class="composer" id="composer"><button type="button" class="attach" aria-label="ファイルを添付">＋</button><input id="message-input" autocomplete="off" placeholder="メッセージを入力..." aria-label="メッセージを入力"><button class="send" type="submit" aria-label="送信">↑</button></form></div></section></main>`;
	bindEvents();
}

function renderConversations(items: Conversation[]): string { return items.length ? items.map((conversation) => `<button class="conversation ${conversation.id === selectedId ? 'active' : ''}" data-id="${conversation.id}">${avatar(conversation)}<span class="conversation-copy"><strong class="conversation-name">${conversation.name}</strong><small class="conversation-preview">${conversation.preview}</small></span><small class="conversation-time">${conversation.time}</small></button>`).join('') : '<p style="padding:16px;color:#81908b;font-size:13px">見つかりませんでした</p>'; }
function renderMessages(messages: Message[]): string { return messages.map((message) => `<div class="message-row ${message.sender === 'me' ? 'mine' : ''}">${message.sender === 'other' ? avatar(conversations.find((item) => item.id === selectedId)!, true) : ''}<div class="message-content"><div class="bubble">${escapeHtml(message.text)}</div><small class="message-time ${message.read ? 'read' : ''}">${message.time}${message.read ? ' ✓' : ''}</small></div></div>`).join(''); }

function bindEvents(): void {
	document.querySelectorAll<HTMLButtonElement>('[data-id]').forEach((button) => button.addEventListener('click', () => { selectedId = button.dataset.id ?? selectedId; render(); }));
	document.querySelector<HTMLButtonElement>('.back-button')?.addEventListener('click', () => document.querySelector('.shell')?.classList.remove('chat-open'));
	document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { const query = (event.target as HTMLInputElement).value.toLowerCase(); document.querySelector('#conversation-list')!.innerHTML = renderConversations(conversations.filter((item) => item.name.toLowerCase().includes(query) || item.preview.toLowerCase().includes(query))); });
	document.querySelector<HTMLFormElement>('#composer')?.addEventListener('submit', (event) => { event.preventDefault(); const input = document.querySelector<HTMLInputElement>('#message-input')!; const text = input.value.trim(); if (!text) return; const conversation = conversations.find((item) => item.id === selectedId)!; conversation.messages.push({ sender: 'me', text, time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }), read: true }); conversation.preview = text; conversation.time = '今'; render(); document.querySelector('#messages')?.scrollTo({ top: 99999, behavior: 'smooth' }); });
}
function escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] ?? character)); }
render();
