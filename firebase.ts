import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';

export type CloudPost = {
	id: string;
	name: string;
	time: string;
	image: string;
	text: string;
	reactions: string;
	postedAt?: string;
	authorId?: string;
};

export type CloudMessage = {
	tid: string;
	text: string;
	senderId: string;
	senderName: string;
	createdAt?: number;
};

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Object.values(firebaseConfig).every(Boolean);

function getFirebaseServices(): { db: ReturnType<typeof getFirestore>; storage: ReturnType<typeof getStorage> } | null {
	if (!firebaseEnabled) return null;
	const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	return { db: getFirestore(app), storage: getStorage(app) };
}

async function ensureUser(): Promise<string> {
	const services = getFirebaseServices();
	if (!services) throw new Error('Firebase設定がありません');
	const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	const auth = getAuth(app);
	if (!auth.currentUser) await signInAnonymously(auth);
	return auth.currentUser?.uid ?? '';
}

export async function subscribeToPosts(onPosts: (posts: CloudPost[]) => void, onError: (error: Error) => void): Promise<() => void> {
	const services = getFirebaseServices();
	if (!services) return () => undefined;
	await ensureUser();
	const postsQuery = query(collection(services.db, 'posts'), orderBy('postedAt', 'desc'), limit(50));
	return onSnapshot(postsQuery, (snapshot) => {
		onPosts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CloudPost)));
	}, onError);
}

export async function createCloudPost(post: CloudPost): Promise<CloudPost> {
	const services = getFirebaseServices();
	if (!services) return post;
	const authorId = await ensureUser();
	let image = post.image;
	if (image.startsWith('data:image/')) {
		const imageRef = ref(services.storage, `posts/${authorId}/${post.id}.jpg`);
		await uploadString(imageRef, image, 'data_url');
		image = await getDownloadURL(imageRef);
	}
	const document = await addDoc(collection(services.db, 'posts'), { ...post, image, authorId, postedAt: serverTimestamp() });
	return { ...post, id: document.id, image, authorId };
}

export async function deleteCloudPost(postId: string): Promise<void> {
	const services = getFirebaseServices();
	if (!services) return;
	await ensureUser();
	await deleteDoc(doc(services.db, 'posts', postId));
}

function conversationId(first: string, second: string): string {
	return [first, second].sort().map((value) => value.replace(/[^a-zA-Z0-9_-]/g, '_')).join('__');
}

export async function subscribeToMessages(recipientId: string, senderName: string, onMessages: (messages: CloudMessage[]) => void, onError: (error: Error) => void): Promise<() => void> {
	const services = getFirebaseServices();
	if (!services) return () => undefined;
	const senderId = await ensureUser();
	const messagesQuery = query(collection(services.db, 'conversations', conversationId(senderName, recipientId), 'messages'), orderBy('createdAt', 'asc'), limit(100));
	return onSnapshot(messagesQuery, (snapshot) => {
		onMessages(snapshot.docs.map((item) => ({ tid: item.id, ...item.data() } as CloudMessage)));
	}, onError);
}

export async function sendCloudMessage(recipientId: string, text: string, senderName: string): Promise<void> {
	const services = getFirebaseServices();
	if (!services) return;
	const senderId = await ensureUser();
	await addDoc(collection(services.db, 'conversations', conversationId(senderName, recipientId), 'messages'), { text, senderId, senderName, createdAt: Date.now(), createdAtServer: serverTimestamp() });
}