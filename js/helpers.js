/*global NodeList */
((window) => {
	'use strict';

	/**
	 * Get the element by CSS selector.
	 * 
  	 * @func qs
  	 * @param {string} selector The name of the CSS selector.
  	 * @param {object} scope Scope where the selector is included.
	 */
	 
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
   	* 
   	* Get all elements in the document that matches a specified CSS selector.
  	* @func qsa
  	* @param {string} selector The name of the CSS selector.
   	* @param {object} scope Scope where the selector is included.
	  */
	  
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * Triggers setView() when the page is loaded or URL route is changed.
	 * @func $on
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * Attach a handler to event for all elements that match the selector, now or in the future, based on a root element
	 * @func $delegate
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			let targetElement = event.target;
			let potentialElements = window.qsa(selector, target);
			let hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		let useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	/**
	 * Find the element's parent with the given tag name:
	 * $parent(qs('a'), 'div');
	 * @func $parent
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
