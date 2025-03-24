document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');

    // Function to fetch todos from the server
    const fetchTodos = async () => {
        const response = await fetch('/todos');
        const todos = await response.json();
        renderTodos(todos);
    };

    // Function to render todos in the list
    const renderTodos = (todos) => {
        todoList.innerHTML = '';
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.title;
            todoList.appendChild(li);
        });
    };

    // Event listener for form submission
    if (todoForm) {
        todoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(todoForm);
            const data = {
                title: formData.get('title'),
                description: formData.get('description'),
                dueDate: formData.get('dueDate')
            };

            await fetch('/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            todoForm.reset();
            fetchTodos();
        });
    }

    // Handle checkbox clicks for todos
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            const todoId = this.getAttribute('data-todo-id');
            const todoItem = this.closest('li');
            const isCompleted = todoItem.classList.contains('completed');
            
            // Animate checkbox
            this.classList.add('animate');
            
            // Find and submit the form
            const form = todoItem.querySelector('form');
            if (form) {
                setTimeout(() => {
                    form.submit();
                }, 300);
            }
            
            // Show confirmation
            showConfirmation(isCompleted ? 'Task marked as incomplete' : 'Task completed');
        });
    });

    // Show confirmation message
    function showConfirmation(message) {
        // Remove any existing confirmation
        const existingConfirmation = document.querySelector('.confirmation-message');
        if (existingConfirmation) {
            existingConfirmation.remove();
        }
        
        // Create new confirmation
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation-message';
        confirmation.textContent = message;
        document.body.appendChild(confirmation);
        
        // Show and hide with animation
        setTimeout(() => {
            confirmation.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            confirmation.classList.remove('show');
            setTimeout(() => {
                confirmation.remove();
            }, 300);
        }, 2000);
    }

    // Mobile sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.getElementById('app-sidebar').classList.toggle('expanded');
        });
    }

    // Initial fetch of todos
    fetchTodos();
});

// Add this middleware before your routes
app.use((req, res, next) => {
    // Add current route and date offset to all templates
    res.locals.currentRoute = req.path;
    res.locals.dateOffset = req.query.dateOffset ? parseInt(req.query.dateOffset) : 0;
    res.locals.title = 'Tasks'; // Default title
    next();
});