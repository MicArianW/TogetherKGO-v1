// translation.js

// Mobile and floating menu functions
function toggleLanguageMenu(event) {
    event.preventDefault();
    const menu = document.getElementById('languageMenu');
    menu.classList.toggle('show');
}

function toggleMobileMenu() {
    const overlay = document.getElementById('mobileNavOverlay');
    const menu = document.getElementById('mobileNavMenu');
    overlay.classList.toggle('show');
    menu.classList.toggle('show');
    document.body.style.overflow = menu.classList.contains('show') ? 'hidden' : '';
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileNavOverlay');
    const menu = document.getElementById('mobileNavMenu');
    overlay.classList.remove('show');
    menu.classList.remove('show');
    document.body.style.overflow = '';
}

function toggleMobileLangDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('mobileLangDropdown');
    dropdown.classList.toggle('show');
}

function toggleFloatingLangMenuCommunity(event) {
    event.stopPropagation();
    const menu = document.getElementById('floatingLangMenuCommunity');
    menu.classList.toggle('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.getElementById('languageMenu');
    const mobileDropdown = document.getElementById('mobileLangDropdown');
    const floatingMenu = document.getElementById('floatingLangMenuCommunity');
    const floatingBtn = document.querySelector('.floating-lang-btn');

    if (navMenu && !event.target.closest('.language-dropdown')) {
        navMenu.classList.remove('show');
    }

    if (mobileDropdown && !mobileDropdown.contains(event.target) && !event.target.closest('#mobileLangBtn')) {
        mobileDropdown.classList.remove('show');
    }

    if (floatingMenu && !floatingMenu.contains(event.target) && event.target !== floatingBtn) {
        floatingMenu.classList.remove('show');
    }
});

// Google Translate Widget Functions
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'google_translate_element'
    );
}

function setGoogTransCookie(lang) {
    const value = `/en/${lang}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${location.hostname}`;
}

function changeLanguage(langCode) {
    console.log('Changing language to:', langCode);

    const langMenu = document.getElementById('languageMenu');
    const mobileDropdown = document.getElementById('mobileLangDropdown');
    const floatingMenu = document.getElementById('floatingLangMenuCommunity');

    if (langMenu) langMenu.classList.remove('show');
    if (mobileDropdown) mobileDropdown.classList.remove('show');
    if (floatingMenu) floatingMenu.classList.remove('show');

    if (langCode === 'en') {
        if (typeof clearGoogleTranslateCookies === 'function') {
            clearGoogleTranslateCookies();
        }
        setGoogTransCookie('en');
    } else {
        setGoogTransCookie(langCode);
    }

    window.location.reload();
}

// For floating button compatibility
function translatePageFloatingCommunity(langCode) {
    changeLanguage(langCode);
}

// Clear Google Translate cookies
function clearGoogleTranslateCookies() {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (name.includes('googtrans') || name.includes('_ga') || name.includes('_gid')) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.translate.google.com;';
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
        }
    });
}