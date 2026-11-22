        // Default initial data if LocalStorage is empty
        const initialTasks = [
            { id: '1', title: 'Design user dashboard wireframe', status: 'todo' },
            { id: '2', title: 'Set up REST API endpoints', status: 'in-progress' },
            { id: '3', title: 'Setup GitHub Repository', status: 'completed' }
        ];

        // State Management
        let tasks = JSON.parse(localStorage.getItem('kanban_tasks')) || initialTasks;
        let draggedCardId = null;

        // Initialize Board
        function initBoard() {
            renderTasks();
            setupDragAndDrop();
            setupFormListeners();
        }

        // Save State to LocalStorage & Re-render
        function saveAndRender() {
            localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
            renderTasks();
        }

        // Render Cards into Respective Columns
        function renderTasks() {
            const columns = {
                'todo': document.getElementById('todo'),
                'in-progress': document.getElementById('in-progress'),
                'completed': document.getElementById('completed')
            };

            const counts = { 'todo': 0, 'in-progress': 0, 'completed': 0 };

            // Clear column containers
            Object.values(columns).forEach(col => col.innerHTML = '');

            tasks.forEach(task => {
                counts[task.status]++;
                const card = createCardElement(task);
                if (columns[task.status]) {
                    columns[task.status].appendChild(card);
                }
            });

            // Update Counts
            document.getElementById('count-todo').textContent = counts['todo'];
            document.getElementById('count-in-progress').textContent = counts['in-progress'];
            document.getElementById('count-completed').textContent = counts['completed'];
        }

        // Create Individual Card Element
        function createCardElement(task) {
            const card = document.createElement('div');
            card.className = 'card';
            card.draggable = true;
            card.dataset.id = task.id;

            card.innerHTML = `
                <span class="card-text">${escapeHTML(task.title)}</span>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">✕</button>
            `;

            // Drag Events on Card
            card.addEventListener('dragstart', (e) => {
                draggedCardId = task.id;
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', task.id);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                draggedCardId = null;
            });

            return card;
        }

        // Setup Drag & Drop Handlers for Columns
        function setupDragAndDrop() {
            const taskLists = document.querySelectorAll('.task-list');

            taskLists.forEach(list => {
                list.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necessary to allow drop
                    list.classList.add('drag-over');
                });

                list.addEventListener('dragleave', () => {
                    list.classList.remove('drag-over');
                });

                list.addEventListener('drop', (e) => {
                    e.preventDefault();
                    list.classList.remove('drag-over');
                    
                    const targetStatus = list.id;
                    if (draggedCardId && targetStatus) {
                        updateTaskStatus(draggedCardId, targetStatus);
                    }
                });
            });
        }

        // Update Status on Drop
        function updateTaskStatus(id, newStatus) {
            tasks = tasks.map(task => 
                task.id === id ? { ...task, status: newStatus } : task
            );
            saveAndRender();
        }

        // Delete Task Handler
        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            saveAndRender();
        }

        // Form Submit Listeners for Adding Tasks
        function setupFormListeners() {
            const forms = document.querySelectorAll('.add-card-form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = form.querySelector('.add-card-input');
                    const title = input.value.trim();
                    const status = form.dataset.status;

                    if (!title) return;

                    const newTask = {
                        id: Date.now().toString(),
                        title,
                        status
                    };

                    tasks.push(newTask);
                    input.value = '';
                    saveAndRender();
                });
            });
        }

        // Security Helper
        function escapeHTML(str) {
            return str.replace(/[&<>'"]/g, 
                tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
            );
        }

        // Run setup
        initBoard();
    
