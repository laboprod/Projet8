/*jshint eqeqeq:false */
((window) => {
	'use strict';

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */

	class Store {
		constructor(name, callback) {
			callback = callback || function () {};

			this._dbName = name;

			if (!localStorage[name]) {
				let data = {
					todos: [],
				};

				localStorage[name] = JSON.stringify(data);
			}

			callback.call(this, JSON.parse(localStorage[name]));
		}

		/**
		 * Finds items based on a query given as a JS object
		 *
		 * @param {object} query The query to match against (i.e. {foo: 'bar'})
		 * @param {function} callback	 The callback to fire when the query has
		 * completed running
		 *
		 * @example
		 * db.find({foo: 'bar', hello: 'world'}, function (data) {
		 *	 // data will return any items that have foo: bar and
		 *	 // hello: world in their properties
		 * });
		 */
		// Amélioration : on remplace le if(!callback) par if(callback) pur supprimer un return

		find(query, callback) {
			if (callback) {
				let todos = JSON.parse(localStorage[this._dbName]).todos;

				callback.call(
					this,
					todos.filter((todo) => {
						for (let q in query) {
							if (query[q] !== todo[q]) {
								return false;
							}
						}
						return true;
					})
				);
			}
		}

		// find(query, callback) {
		// 	if (!callback) {
		// 		return;
		// 	}

		// 	let todos = JSON.parse(localStorage[this._dbName]).todos;

		// 	callback.call(
		// 		this,
		// 		todos.filter((todo) => {
		// 			for (let q in query) {
		// 				if (query[q] !== todo[q]) {
		// 					return false;
		// 				}
		// 			}
		// 			return true;
		// 		})
		// 	);
		// }

		/**
		 * Will retrieve all data from the collection
		 *
		 * @param {function} callback The callback to fire upon retrieving data
		 */
		findAll(callback) {
			callback = callback || function () {};
			callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
		}

		/**
		 * Will save the given data to the DB. If no item exists it will create a new
		 * item, otherwise it'll simply update an existing item's properties
		 *
		 * @param {object} updateData The data to save back into the DB
		 * @param {function} callback The callback to fire after saving
		 * @param {number} id An optional param to enter an ID of an item to update
		 */
		// Erreur : possible d'avoir 2 id identiques
		// Amélioration : on assigne un id avec Date.now() qui sera forcément unique.
		save(updateData, callback, id) {
			let data = JSON.parse(localStorage[this._dbName]);
			let todos = data.todos;

			callback = callback || function () {};

			// Generate an ID
			// let newId = '';
			// let charset = '0123456789';

			// for (let i = 0; i < 6; i++) {
			// 	newId += charset.charAt(Math.floor(Math.random() * charset.length));
			// }

			// If an ID was actually given, find the item and update each property
			if (id) {
				for (let i = 0; i < todos.length; i++) {
					if (todos[i].id === id) {
						for (let key in updateData) {
							todos[i][key] = updateData[key];
						}
						break;
					}
				}

				localStorage[this._dbName] = JSON.stringify(data);
				callback.call(this, todos);
			} else {
				// Assign an ID
				updateData.id = Date.now();

				todos.push(updateData);
				localStorage[this._dbName] = JSON.stringify(data);
				callback.call(this, [updateData]);
			}
		}

		/**
		 * Will remove an item from the Store based on its ID
		 *
		 * @param {number} id The ID of the item you want to remove
		 * @param {function} callback The callback to fire after saving
		 */
		// Amélioration : on supprime la variable todoId pour regrouper les 2 boucles en 1 seule.
		remove(id, callback) {
			let data = JSON.parse(localStorage[this._dbName]);
			let todos = data.todos;
			// let todoId;

			for (let i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					todos.splice(i, 1);
				}
			}

			// for (let i = 0; i < todos.length; i++) {
			// 	if (todos[i].id == id) {
			// 		todoId = todos[i].id;
			// 	}
			// }

			// for (let i = 0; i < todos.length; i++) {
			// 	if (todos[i].id == todoId) {
			// 		todos.splice(i, 1);
			// 	}
			// }

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		}

		/**
		 * Will drop all storage and start fresh
		 *
		 * @param {function} callback The callback to fire after dropping the data
		 */
		drop(callback) {
			let data = { todos: [] };
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, data.todos);
		}
	}

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
