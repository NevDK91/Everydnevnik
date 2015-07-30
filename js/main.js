$(function(){
	// Класс модели задач
	var Todo = Backbone.Model.extend({
		defaults: function(){
			return {
				title: "empty todo...",
				order: 0,//Todos.nextOrder(),
				done: false
			};
		},

		toggle: function(){
			this.save({done: !this.get("done")});
		},

	});



	// Класс коллекции моделей задач
	var TodoList = Backbone.Collection.extend({
		model: Todo,

		localStorage: new Store("todos-backbone"),

		done: function() {
			return this.where({done: true});
		},

		remaining: function(){
			return this.where({done: false});
		},

		nextOrder: function(){
			if (!this.length) return 1;
			return this.last().get('order') + 1;
		},

		comparator: 'order'
	});

	// Экземпляр коллекции моделей задач
	var Todos = new TodoList;


//console.log(todoList);

	// Класс вида задач
	var TodoView = Backbone.View.extend({

		tagName: "li",

		template: _.template( $('#item-template').html() ),

		events: {
			"click .toggle" : "toggleDone",
			"dblclick .view" : "edit",
			"click a.destroy" : "clear",
			"click a.cancel-editing" : "cancelEditing",
			"keypress .edit" : "updateOnEnter",
			"blur .edit" : "close"
		},

		initialize: function(){
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		render: function(){
			this.$el.html(this.template(this.model.toJSON() ));
			this.$el.toggleClass('done', this.model.get('done'));
			this.input = this.$('.edit');
			this.cancelEditing = this.$('.cancel-editing');
			this.input.hide();
			this.cancelEditing.hide();
			return this;
		},

		toggleDone: function(){
			this.model.toggle();
		},

		edit: function(){
			this.input.show();
			this.cancelEditing.show();
			var value = this.input.val();
			if (!value) {
				this.clear();
				}
			else {
				this.model.save({title: value});
				this.$el.removeClass("editing");
				}	
			},
		cancelEditing: function(){
			this.input.hide();
			this.cancelEditing.hide();
			this.$el.removeClass("editing");
		},

		close: function() {
			var value = this.input.val();
			if (!value) {
				this.clear();
			} else {
				this.model.save({title: value});
				this.$el.removeClass("editing");
			}
			
		 },

		 updateOnEnter: function(e) {
		 	if (e.keyCode == 13) this.close();
		 },

		 clear: function(){
		 	this.model.destroy();
		 }
		
	});
	

// Класс вида приложения
var AppView = Backbone.View.extend({

	el: $("#todoapp"),

	statsTemplate: _.template($('#stats-template').html() ),

	events: {
		"keypress #new-todo": "createOnEnter",
		"click #clear-completed": "clearCompleted",
		"click #toggle-all": "toggleAllComplete"
	},

	initialize: function() {
		this.input = this.$("#new-todo");
		this.allCheckbox = this.$("#toggle-all")[0];

		this.listenTo(Todos, 'add', this.addOne);
		this.listenTo(Todos, 'reset', this.addAll);
		this.listenTo(Todos, 'all', this.render);
		
		this.footer = this.$('footer');
		this.main = $('#main');

		Todos.fetch();
	},

	render: function(){
		var done = Todos.done().length;
		var remaining = Todos.remaining().length;

		//newTodoInput = $('#new-todo');
		//newTodoInput.focus();

		if (Todos.length){
			this.main.show();
			this.footer.show();
			this.footer.html(this.statsTemplate({done: done, remaining: remaining}) );
		} else {
			this.main.hide();
			this.footer.hide();
		}

		this.allCheckbox.checked = !remaining;
	},

	addOne: function(todo){
		var view = new TodoView({model: todo});
		this.$('#todo-list').append(view.render().el);
	},

	addAll: function(){
		Todos.each(this.addOne, this);
	},

	createOnEnter: function(e){
		if ((e.keyCode == 13) && (!this.input.val()) ){
			alert('Ничего не введено, задача не добавлена'); 
				return;
			}

		else if ((e.keyCode == 13) && (this.input.val()) ) {

		Todos.create({title: this.input.val()});
		this.input.val(''); 
		}
	},

	clearCompleted: function() {
		_.invoke(Todos.done(), 'destroy');
		return false;
	},

	toggleAllComplete: function(){
		var done = this.allCheckbox.checked;
		Todos.each(function (todo) {todo.save({ 'done': done }); });
	}	
});

var App = new AppView;
App.render();

/*
task1 = new Todo({title: "Проверить модель task1", order: 1, done: false});
	todoview1 = new TodoView({model:task1});
	console.log(todoview1.render().el.outerHTML);
	
	var todoList = new TodoList([

	{ title: "Задача 1",
	  order: 1,
	  done: false
	  			},
	  { title: "Задача 2",
	  order: 2,
	  done: false
	  			},
	  { title: "Задача 3",
	  order: 3,
	  done: false
	  			}						

]);

	console.log(todoList);
*/

});