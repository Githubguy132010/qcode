require('@testing-library/jest-dom');
const { cleanup } = require('@testing-library/react');

// The i18n mock is now imported from src/__mocks__
require('./src/__mocks__/i18next');

// Mock window.matchMedia for jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
	window.matchMedia = function (query) {
		return {
			matches: false,
			media: query,
			onchange: null,
			addListener: function () {},
			removeListener: function () {},
			addEventListener: function () {},
			removeEventListener: function () {},
			dispatchEvent: function () { return false; },
		};
	};
}

// Ensure proper cleanup after each test
afterEach(() => {
	cleanup();
	
	// Clear any timers
	if (typeof jest !== 'undefined') {
		jest.clearAllTimers();
		jest.useRealTimers();
	}
	
	// Clear any pending Promise.resolve() calls
	if (typeof global.setImmediate !== 'undefined') {
		global.setImmediate(() => {});
	}
});

// Global cleanup before each test
beforeEach(() => {
	// Reset DOM state
	if (typeof document !== 'undefined') {
		document.body.innerHTML = '';
	}
	
	// Use fake timers consistently
	if (typeof jest !== 'undefined') {
		jest.useFakeTimers();
	}
});
