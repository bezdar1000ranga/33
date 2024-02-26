Vue.component('task-board', {
    data() {
        return {
            plannedTasks: [],
            inProgressTasks: [],
            testingTasks: [],
            completedTasks: [],
            title: null,
            desc: null,
            deadline: null,
            importance: null,
            oneFilter: null,
            twoFilter: null,
            thrFilter: null,
            popup: false
        };
    },
    computed: {
        plannedTasksSortedByImportance() {
            return this.plannedTasks.slice().sort((a, b) => b.importance.number - a.importance.number);
        },
        inProgressTasksSortedByImportance() {
            return this.inProgressTasks.slice().sort((a, b) => b.importance.number - a.importance.number);
        },
        testingTasksSortedByImportance() {
            return this.testingTasks.slice().sort((a, b) => b.importance.number - a.importance.number);
        },
    },
    methods: {
        deleteTask(taskList, task) {
            const index = taskList.findIndex(t => t === task);
            if (index !== -1) {
                taskList.splice(index, 1);
            }
        },
        editTask(task) {
            if (!task.editMode) {
                task.editMode = !task.editMode;
            }
            else if(task.editMode && task.deadline >= 0 && task.deadline != '-0'){
                task.editMode = !task.editMode;
            }
        },

        addTask() {
            if (this.title && this.desc && this.deadline && this.importance) {
                let nametext 
                if (this.importance == 1) {
                    nametext = 'Низкий'
                } else if (this.importance == 2) {
                    nametext ='Средний'
                } else if (this.importance == 3) {
                    nametext = 'Высокий'
                } else if (this.importance == 4) {
                    nametext = 'Срочный'
                }
                const newTask = {
                    title: this.title,
                    desc: this.desc,
                    deadline: this.deadline,
                    createDate: new Date(),
                    editMode: false,
                    reason: null,
                    moveTime: [],
                    importance: { number: this.importance, text: nametext }
                };
                this.plannedTasks.push(newTask);
            }
            this.title = null;
            this.desc = null;
            this.deadline = null;
            this.createDate = null;
            this.editMode = null;
            this.reason = null;
            this.importance = null;
        },

        moveToInProgress(task) {
            this.plannedTasks = this.plannedTasks.filter(t => t !== task);
            task.moveTime.push({text: 'moved to inprogress', date: new Date()})
            this.inProgressTasks.push(task);
        },
        moveToTesting(task) {
            this.inProgressTasks = this.inProgressTasks.filter(t => t !== task);
            task.moveTime.push({text: 'moved to testing', date: new Date()})
            task.reason = null;
            this.testingTasks.push(task);
        },
        moveToDone(task) {
            if(!task.editMode){
                this.testingTasks = this.testingTasks.filter(t => t !== task);
                task.moveTime.push({text: 'moved to done', date: new Date()})
                task.completedInTime = this.isTaskCompletedInTime(task);
                this.completedTasks.push(task);
            }
        },
        moveToBack(task) {
            const reason = prompt("enter reason");
            if (reason) {
                this.testingTasks = this.testingTasks.filter(t => t !== task);
                task.reason = reason;
                task.moveTime.push({text: 'moved to back', date: new Date()})
                this.inProgressTasks.push(task);
            }
        },
        isTaskExpired(task) {
            return !task.completedInTime;
        },
        isTaskCompletedInTime(task) {
            const completeDate = new Date();
            const deadlineDate = new Date(task.createDate);
            deadlineDate.setDate(deadlineDate.getDate() + task.deadline);
            return completeDate <= deadlineDate;
        },
        switchPopup(){
            this.popup = !this.popup;
        }
    },
    template: `
    <div>
        <button v-on:click="switchPopup()">add Cart</button>
        <div class="popup" v-show="popup === true">
            <form class="cardForm" @submit.prevent="addTask">
                <button v-on:click="switchPopup()">Close</button>
                <p>
                    <label for="title">Title:</label>
                    <input id="title" v-model="title" placeholder="title">
                </p>
                <p>
                    <label for="desc">description:</label>
                    <input id="desc" v-model="desc" placeholder="desc">
                </p>
                <p>
                    <label for="deadline">days:</label>
                    <input type="number" id="deadline" v-model="deadline" placeholder="deadline" min="0">
                </p>
                <p>

                    <label for="priority">priority:</label>
                    <select v-model="importance" id="priority">
                        <option value="1">Низкий</option>
                        <option value="2">Средний</option>
                        <option value="3">Высокий</option>
                        <option value="4">Срочный</option>
                    </select>
                </p>
                <p>
                    <input type="submit" value="Submit">
                </p>
            </form>
        </div>
        <div class="columns">
            <div class="column">
                <h2>Запланированные задачи</h2>
                <div class="card-list">
                <label for="oneFilter">Filter by Priority:</label>
                <select v-model="oneFilter" id="oneFilter">
                    <option value="">Все</option>
                    <option value="1">Низкий</option>
                    <option value="2">Средний</option>
                    <option value="3">Высокий</option>
                    <option value="4">Срочный</option>
                </select>
                    <div v-for="task in plannedTasksSortedByImportance" v-if="!oneFilter || task.importance.number === oneFilter" :key="task.id" class="card">
                        <p v-if="!task.editMode">title - {{ task.title }}</p>
                        <input v-else type="text" v-model="task.title" placeholder="title">
                        <p v-if="!task.editMode">description - {{ task.desc }}</p>
                        <input v-else type="text" v-model="task.desc" placeholder="desc">
                        <p v-if="!task.editMode">days left - {{ task.deadline }}</p>
                        <input v-else type="number" v-model="task.deadline" placeholder="deadline" min="0">
                        <p v-if="!task.editMode">Priority - {{ task.importance.text }}</p>

                        <div v-for="date in task.moveTime">
                            <p>{{ date.text}}</p>
                            <p>{{ date.date}}</p>
                        </div>

                        <button @click="moveToInProgress(task)">Переместить работу</button>
                        <div class="customization__btns">
                            <button @click="deleteTask(plannedTasks, task)">Удалить</button>
                            <button @click="editTask(task)">Изменить</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <h2>Задачи в работе</h2>
                <div class="card-list">
                <label for="twoFilter">Filter by Priority:</label>
                <select v-model="twoFilter" id="twoFilter">
                    <option value="">Все</option>
                    <option value="1">Низкий</option>
                    <option value="2">Средний</option>
                    <option value="3">Высокий</option>
                    <option value="4">Срочный</option>
                </select>
                    <div v-for="task in inProgressTasksSortedByImportance" v-if="!twoFilter || task.importance.number === twoFilter" :key="task.id" class="card">
                        <p v-if="!task.editMode">title - {{ task.title }}</p>
                        <input v-else type="text" v-model="task.title" placeholder="title">
                        <p v-if="!task.editMode">description - {{ task.desc }}</p>
                        <input v-else type="text" v-model="task.desc" placeholder="desc">
                        <p v-if="!task.editMode">days left - {{ task.deadline }}</p>
                        <input v-else type="number" v-model="task.deadline" placeholder="deadline" min="0">
                        <p v-if="task.reason !== null">{{ task.reason }}</p>
                        <p v-if="!task.editMode">Priority - {{ task.importance.text }}</p>
                        
                        <div v-for="date in task.moveTime">
                            <p>{{ date.text}}</p>
                            <p>{{ date.date}}</p>
                        </div>

                        <button @click="moveToTesting(task)">Переместить работу</button>
                        <div class="customization__btns">
                            <button @click="deleteTask(inProgressTasks, task)">Удалить</button>
                            <button @click="editTask(task)">Изменить</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <h2>Тестирование</h2>
                <div class="card-list">
                <label for="thrFilter">Filter by Priority:</label>
                <select v-model="thrFilter" id="thrFilter">
                    <option value="">Все</option>
                    <option value="1">Низкий</option>
                    <option value="2">Средний</option>
                    <option value="3">Высокий</option>
                    <option value="4">Срочный</option>
                </select>
                    <div v-for="task in testingTasksSortedByImportance" v-if="!thrFilter || task.importance.number === thrFilter" :key="task.id" class="card">
                        <p v-if="!task.editMode">title - {{ task.title }}</p>
                        <input v-else type="text" v-model="task.title" placeholder="title">
                        <p v-if="!task.editMode">description - {{ task.desc }}</p>
                        <input v-else type="text" v-model="task.desc" placeholder="desc">
                        <p v-if="!task.editMode">days left - {{ task.deadline }}</p>
                        <input v-else type="number" v-model="task.deadline" placeholder="deadline" min="0">
                        <p v-if="!task.editMode">Priority - {{ task.importance.text }}</p>
                        
                        <div v-for="date in task.moveTime">
                            <p>{{ date.text}}</p>
                            <p>{{ date.date}}</p>
                        </div>

                        <button @click="moveToBack(task)">Переместить назад</button>
                        <button @click="moveToDone(task)">Переместить работу</button>
                        <div class="customization__btns">
                            <button @click="deleteTask(testingTasks, task)">Удалить</button>
                            <button @click="editTask(task)">Изменить</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="column">
                <h2>Выполненные задачи</h2>
                <completed-task-list :tasks="completedTasks"></completed-task-list>
            </div>
        </div>
    </div>
    `
});

Vue.component('completed-task-list', {
    data(){
        return{
            forFilter: null
        }
    },
    props: ['tasks'],
    template: `
    <div class="card-list">
        <label for="forFilter">Filter by Priority:</label>
        <select v-model="forFilter" id="forFilter">
            <option value="">Все</option>
            <option value="1">Низкий</option>
            <option value="2">Средний</option>
            <option value="3">Высокий</option>
            <option value="4">Срочный</option>
        </select>
        <div v-for="task in sortedTasks" v-if="!forFilter || task.importance.number === forFilter" :key="task.id" class="card" :class="{ 'expired': isTaskExpired(task) }">
            <p>title - {{ task.title }}</p>
            <p>description - {{ task.desc }}</p>
            <p v-if="!task.editMode">Priority - {{ task.importance.text }}</p>
            <p v-if="isTaskExpired(task)" class="expired-message">Просрочено</p>
            <p v-else class="done-message">Не Просрочено</p>
            <div v-for="date in task.moveTime">
                <p>{{ date.text}}</p>
                <p>{{ date.date}}</p>
            </div>
        </div>
    </div>
    `,
    computed: {
        sortedTasks() {
            return this.tasks.slice().sort((a, b) => b.importance.number - a.importance.number);
        }
    },
    methods: {
        isTaskExpired(task) {
            return !task.completedInTime;
        }
    }
});

new Vue({
    el: "#app",
});