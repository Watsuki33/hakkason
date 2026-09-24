import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';

if (existsSync('.env')) {
	for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
		const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
		if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
	}
}

const port = 8787;
const client = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:client'], { stdio: 'inherit', shell: process.platform === 'win32' });
const send = (response, status, body) => {
	response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
	response.end(JSON.stringify(body));
};

const server = createServer(async (request, response) => {
	if (request.method !== 'POST' || request.url !== '/api/advice') return send(response, 404, { error: 'Not found' });
	let raw = '';
	for await (const chunk of request) raw += chunk;
	try {
		const { images } = JSON.parse(raw);
		if (!Array.isArray(images) || images.length === 0 || images.length > 10 || images.some((image) => typeof image !== 'string' || !image.startsWith('data:image/'))) return send(response, 400, { error: '画像データが正しくありません。' });
		if (!process.env.GEMINI_API_KEY) return send(response, 503, { error: 'GEMINI_API_KEY が未設定です。' });
		const parts = [
			{ text: 'あなたは食事改善のアドバイザーです。添付画像はユーザー自身の食事投稿です。画像から読み取れる範囲だけで、前向きで具体的な食事のヒントを日本語で作成してください。医療診断や極端な制限は避け、栄養素や分量は推定であることを意識してください。JSONのみで返してください: {"summary":"短い総評","tips":["具体的な助言を最大3つ"]}' },
			...images.map((image) => {
				const [header, data] = image.split(',', 2);
				return { inline_data: { mime_type: header.slice(5).split(';')[0], data } };
			}),
		];
		const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-3.6-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`;
		const requestBody = JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.3 } });
		let geminiResponse;
		for (let attempt = 0; attempt < 3; attempt += 1) {
			geminiResponse = await fetch(requestUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestBody });
			if (![429, 500, 502, 503].includes(geminiResponse.status) || attempt === 2) break;
			await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
		}
		const result = await geminiResponse.json();
		if (!geminiResponse.ok) {
			const apiMessage = typeof result?.error?.message === 'string' ? result.error.message : 'Gemini APIから応答を取得できませんでした。';
			return send(response, 502, { error: `Gemini APIエラー: ${apiMessage}` });
		}
		const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) return send(response, 502, { error: 'Geminiの応答が空でした。' });
		return send(response, 200, JSON.parse(text));
	} catch {
		return send(response, 500, { error: 'AI分析の処理に失敗しました。' });
	}
});

server.listen(port, '127.0.0.1', () => console.log(`AI server: http://localhost:${port}`));
const close = () => { client.kill(); server.close(); };
process.on('SIGINT', close);
process.on('SIGTERM', close);