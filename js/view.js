/*global qs, qsa, $on, $parent, $delegate */

((window) => {
	'use strict';

	/**
	 * View that abstracts away the browser's DOM completely.
	 * It has two simple entry points:
	 *
	 *   - bind(eventName, handler)
	 *     Takes a todo application event and registers the handler
	 *   - render(command, parameterObject)
	 *     Renders the given command with the options
	 */
	class View {
		constructor(template) {
			this.template = template;

			this.ENTER_KEY = 13;
			this.ESCAPE_KEY = 27;

			this.$todoList = qs('.todo-list');
			this.$todoItemCounter = qs('.todo-count');
			this.$clearCompleted = qs('.clear-completed');
			this.$main = qs('.main');
			this.$footer = qs('.footer');
			this.$toggleAll = qs('#toggle-all');
			this.$newTodo = qs('.new-todo');
		}

		/**
		 * Remove an item fron the View
		 * 
		 * @param {number} id The ID of the todo to remove
		 */
		_removeItem(id) {
			let elem = qs('[data-id="' + id + '"]');

			if (elem) {
				this.$todoList.removeChild(elem);
			}
		}

		/**
		 * Toggle the "Clear completed" button
		 * 
		 * @param {number} completedCount Number of completed todos
		 * @param {boolean} visible Is visible or is not visible
		 */
		_clearCompletedButton(completedCount, visible) {
			this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
			this.$clearCompleted.style.display = visible ? 'block' : 'none';
		}

		/**
		 * Update the view according to the selected filter
		 * 
		 * @param {string} currentPage The current URL route.
		 */
		_setFilter(currentPage) {
			qs('.filters .selected').className = '';
			qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
		}

		/**
		 * Update the view when a task is completed.
		 * 
		 * @param {number} id The ID of the selected todo
		 * @param {boolean} completed If the todo is completed or not
		 */
		_elementComplete(id, completed) {
			let listItem = qs('[data-id="' + id + '"]');

			if (!listItem) {
				return;
			}

			listItem.className = completed ? 'completed' : '';

			// In case it was toggled from an event and not by clicking the checkbox
			qs('input', listItem).checked = completed;
		}

		/**
		 * Trigger the edit mode to modify a todo.
		 * 
		 * @param {number} id The ID of the selected todo
		 * @param {string} title The todo you want to modify
		 */
		_editItem(id, title) {
			let listItem = qs('[data-id="' + id + '"]');

			if (!listItem) {
				return;
			}

			listItem.className = listItem.className + ' editing';

			let input = document.createElement('input');
			input.className = 'edit';

			listItem.appendChild(input);
			input.focus();
			input.value = title;
		}

		/**
		 * quit the edit mode and display the new todo
		 * @param {number} id The ID of the todo selected
		 * @param {string} title The title of the todo
		 */
		_editItemDone(id, title) {
			let listItem = qs('[data-id="' + id + '"]');

			if (!listItem) {
				return;
			}

			let input = qs('input.edit', listItem);
			listItem.removeChild(input);

			listItem.className = listItem.className.replace('editing', '');

			qsa('label', listItem).forEach(function (label) {
				label.textContent = title;
			});
		}

		/**
		 * Update the view according to the command called by Controller.js.
		 * 
		 * @param {function} viewCmd A function called by Controller.js
		 * @param {object} parameter The parameter of the function
		 */
		render(viewCmd, parameter) {
			let viewCommands = {
				showEntries:  () => {
					this.$todoList.innerHTML = this.template.show(parameter);
				},
				removeItem:  () => {
					this._removeItem(parameter);
				},
				updateElementCount:  () => {
					this.$todoItemCounter.innerHTML = this.template.itemCounter(parameter);
				},
				clearCompletedButton:  () => {
					this._clearCompletedButton(parameter.completed, parameter.visible);
				},
				contentBlockVisibility:  () => {
					this.$main.style.display = this.$footer.style.display = parameter.visible ? 'block' : 'none';
				},
				toggleAll:  () => {
					this.$toggleAll.checked = parameter.checked;
				},
				setFilter:  () => {
					this._setFilter(parameter);
				},
				clearNewTodo:  () => {
					this.$newTodo.value = '';
				},
				elementComplete:  ()=> {
					this._elementComplete(parameter.id, parameter.completed);
				},
				editItem:  () => {
					this._editItem(parameter.id, parameter.title);
				},
				editItemDone:  () => {
					this._editItemDone(parameter.id, parameter.title);
				},
			};

			viewCommands[viewCmd]();
		}

		_itemId(element) {
			let li = $parent(element, 'li');
			return parseInt(li.dataset.id, 10);
		}

		/**
		 * Add events handlers : press Enter key or click out of the input.
		 * @param {function} handler Callback
		 */
		_bindItemEditDone(handler) {
			let self = this;
			$delegate(self.$todoList, 'li .edit', 'blur', function () {
				if (!this.dataset.iscanceled) {
					handler({
						id: self._itemId(this),
						title: this.value,
					});
				}
			});

			$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
				if (event.keyCode === self.ENTER_KEY) {
					// Remove the cursor from the input when you hit enter just like if it
					// were a real form
					this.blur();
				}
			});
		}

		/**
		 * Add an event handler : press Esc key to cancel the edit
		 * @param {function} handler Callback
		 */
		_bindItemEditCancel(handler) {
			$delegate(this.$todoList, 'li .edit', 'keyup', function (event) {
				if (event.keyCode === this.ESCAPE_KEY) {
					this.dataset.iscanceled = true;
					this.blur();

					handler({ id: this._itemId(this) });
				}
			});
		}

		// Amélioration : instruction switch à la place des if...else.
		bind(event, handler) {
			let self = this;

			switch (event) {
				case 'newTodo':
					$on(self.$newTodo, 'change', function () {
						handler(self.$newTodo.value);
					});
					break;
				case 'removeCompleted':
					$on(self.$clearCompleted, 'click', function () {
						handler();
					});
					break;
				case 'toggleAll':
					$on(self.$toggleAll, 'click', function () {
						handler({ completed: this.checked });
					});
					break;
				case 'itemEdit':
					$delegate(self.$todoList, 'li label', 'dblclick', function () {
						handler({ id: self._itemId(this) });
					});
					break;
				case 'itemRemove':
					$delegate(self.$todoList, '.destroy', 'click', function () {
						handler({ id: self._itemId(this) });
					});
					break;
				case 'itemToggle':
					$delegate(self.$todoList, '.toggle', 'click', function () {
						handler({
							id: self._itemId(this),
							completed: this.checked,
						});
					});
					break;
				case 'itemEditDone':
					self._bindItemEditDone(handler);
					break;
				case 'itemEditCancel':
					self._bindItemEditCancel(handler);
					break;
			}

			// if (event === 'newTodo') {
			// 	$on(self.$newTodo, 'change', function () {
			// 		handler(self.$newTodo.value);
			// 	});
			// } else if (event === 'removeCompleted') {
			// 	$on(self.$clearCompleted, 'click', function () {
			// 		handler();
			// 	});
			// } else if (event === 'toggleAll') {
			// 	$on(self.$toggleAll, 'click', function () {
			// 		handler({ completed: this.checked });
			// 	});
			// } else if (event === 'itemEdit') {
			// 	$delegate(self.$todoList, 'li label', 'dblclick', function () {
			// 		handler({ id: self._itemId(this) });
			// 	});
			// } else if (event === 'itemRemove') {
			// 	$delegate(self.$todoList, '.destroy', 'click', function () {
			// 		handler({ id: self._itemId(this) });
			// 	});
			// } else if (event === 'itemToggle') {
			// 	$delegate(self.$todoList, '.toggle', 'click', function () {
			// 		handler({
			// 			id: self._itemId(this),
			// 			completed: this.checked,
			// 		});
			// 	});
			// } else if (event === 'itemEditDone') {
			// 	self._bindItemEditDone(handler);
			// } else if (event === 'itemEditCancel') {
			// 	self._bindItemEditCancel(handler);
			// }
		}
	}

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
})(window);
