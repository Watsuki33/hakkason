const browserStorage = (): Storage | null => {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
};

const tabStorage = (): Storage | null => {
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
};

export function readStoredJson<T>(key: string): T | null {
	const storage = browserStorage();
	if (!storage) return null;
	try {
		const raw = storage.getItem(key);
		return raw ? JSON.parse(raw) as T : null;
	} catch {
		return null;
	}
}

export function writeStoredJson<T>(key: string, value: T): boolean {
	const storage = browserStorage();
	if (!storage) return false;
	try {
		storage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

export function readTabJson<T>(key: string): T | null {
	const storage = tabStorage();
	if (!storage) return null;
	try {
		const raw = storage.getItem(key);
		return raw ? JSON.parse(raw) as T : null;
	} catch {
		return null;
	}
}

export function writeTabJson<T>(key: string, value: T): boolean {
	const storage = tabStorage();
	if (!storage) return false;
	try {
		storage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}
