const CACHE_NAME = 'lure-hangar-v2'; // バージョン管理用。ファイルを更新したらここも変えると良い
const ASSETS = [
  './lure_manager.html',
  './manifest.json',
  './favicon.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// インストール処理
self.addEventListener('install', (event) => {
  // 待機せずにすぐに有効化させる
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS);
      })
  );
});

// 有効化後の処理（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 現在のバージョン以外のキャッシュを削除
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 全てのクライアント（タブ）のコントロールを即座に開始
  return self.clients.claim();
});

// 通信発生時の処理
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 1. キャッシュにあればそれを返す（高速・オフライン対応）
        if (response) {
          return response;
        }
        
        // 2. キャッシュになければネットワークに取りに行く
        return fetch(event.request).catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          // ここでオフライン用の代替画像を返したりもできるが、
          // 今回は基本アセットを全てキャッシュしているのでエラーのままとする
          throw error;
        });
      })
  );
});