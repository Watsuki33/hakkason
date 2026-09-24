export type AdviceResponse = {
	summary?: string;
	tips?: string[];
	error?: string;
};

export async function requestAdvice(images: string[]): Promise<AdviceResponse> {
	const response = await fetch('/api/advice', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ images }),
	});
	const advice = await response.json() as AdviceResponse;
	if (!response.ok) throw new Error(advice.error || 'AI分析に失敗しました');
	return advice;
}
