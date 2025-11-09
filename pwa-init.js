// PWA Installation and Service Worker Registration
(function () {
    'use strict';

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js', { scope: './' })
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope);
                    console.log('   Active:', registration.active);
                    console.log('   Installing:', registration.installing);
                    console.log('   Waiting:', registration.waiting);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('🔄 New service worker found, installing...');
                        newWorker.addEventListener('statechange', () => {
                            console.log('   State changed to:', newWorker.state);
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker available, show update notification
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error);
                    console.error('   Error details:', error.message);
                });
        });
    } else {
        console.warn('⚠️ Service Workers are not supported in this browser');
    }

    // Install Prompt Handler
    let deferredPrompt;
    const installButton = document.getElementById('install-pwa-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show install button
        if (installButton) {
            installButton.style.display = 'block';
        } else {
            // Create floating install button if not exists
            createInstallButton();
        }
    });

    function createInstallButton() {
        const btn = document.createElement('button');
        btn.id = 'install-pwa-btn';
        btn.innerHTML = '<i class="fas fa-download mr-2"></i>Install App';
        btn.className = 'fixed bottom-24 right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 z-50 flex items-center space-x-2 font-semibold animate-bounce';
        btn.style.display = 'block';

        btn.addEventListener('click', installApp);
        document.body.appendChild(btn);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            btn.style.animation = 'none';
        }, 10000);
    }

    async function installApp() {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
            showInstallSuccessMessage();
        } else {
            console.log('❌ User dismissed the install prompt');
        }

        // Clear the deferredPrompt
        deferredPrompt = null;

        // Hide install button
        const installBtn = document.getElementById('install-pwa-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    function showInstallSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-24 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-fade-in';
        message.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-check-circle text-2xl"></i>
                <div>
                    <div class="font-bold">App Installed!</div>
                    <div class="text-sm">TechSafi is now on your device</div>
                </div>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-24 right-8 bg-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-fade-in';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-sync-alt text-2xl"></i>
                <div>
                    <div class="font-bold">Update Available</div>
                    <div class="text-sm">Refresh to get the latest version</div>
                </div>
                <button onclick="window.location.reload()" class="ml-4 bg-white text-blue-500 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                    Refresh
                </button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // Track installation
    window.addEventListener('appinstalled', () => {
        console.log('✅ TechSafi PWA was installed');
        // Hide install button
        const installBtn = document.getElementById('install-pwa-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }

        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'engagement',
                event_label: 'PWA Installation'
            });
        }
    });

    // Detect if running as installed PWA
    function isRunningStandalone() {
        return (window.matchMedia('(display-mode: standalone)').matches) ||
            (window.navigator.standalone) ||
            document.referrer.includes('android-app://');
    }

    if (isRunningStandalone()) {
        console.log('✅ Running as installed PWA');
        document.body.classList.add('pwa-mode');
    }

    // Online/Offline Detection
    window.addEventListener('online', () => {
        console.log('✅ Back online');
        showConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
        console.log('⚠️ Connection lost');
        showConnectionStatus('offline');
    });

    function showConnectionStatus(status) {
        const existingStatus = document.getElementById('connection-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        const statusBar = document.createElement('div');
        statusBar.id = 'connection-status';
        statusBar.className = `fixed top-0 left-0 right-0 py-2 px-4 text-center text-white text-sm font-semibold z-50 ${status === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`;
        statusBar.innerHTML = status === 'online'
            ? '<i class="fas fa-wifi mr-2"></i>You\'re back online!'
            : '<i class="fas fa-wifi-slash mr-2"></i>You\'re offline. Some features may be limited.';

        document.body.appendChild(statusBar);

        if (status === 'online') {
            setTimeout(() => {
                statusBar.remove();
            }, 3000);
        }
    }

})();
