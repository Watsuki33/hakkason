import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		proxy: { '/api': 'http://localhost:8787' },
	},
});
import { defineConfig } from 'vite'

export default defineConfig({
  // この行を追加（リポジトリ名を前後に / をつけて指定）
  base: '/hakkason/', 
  
  // 他の設定があればそのまま残す
})
