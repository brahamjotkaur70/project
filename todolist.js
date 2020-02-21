 
const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');

const success = chalk.green;
const waiting = chalk.blue;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const template = `[
  {
    "isviewed": false,
    "text": "view me to test if is working! ",
    "lastActivity": "created",
    "lastUpdated": ${Date.now()}
  },
  {
    "isviewed": true,
    "text": "You can delete this template todo!",
    "lastActivity": "viewed",
    "lastUpdated": ${Date.now()}
  }
]`;

function formatTodoTime(time) {
  const date = new Date(time);
  return chalk.grey(
    `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
  );
}

function showTodos() {
  todos.forEach((todo, index)=> {
    const color = todo.isviewed ? success : waiting;
    console.log(color(`${index} - [${todo.isviewed ? 'X' : ' ' }] ${todo.text}\t ${todo.lastActivity} ${formatTodoTime(todo.lastUpdated)}`))
  });
}

function askForATask(withComplete) {
  console.clear();

  if(withComplete) {
    showComplete();
  } else {
    showTodos();
    console.log('Type an option: (n)new, (v)view, (d)delete,(q)quit ');
  }
  rl.question('> ', (answer) => {
    [answer, ...args] = answer.split(' ');
    viewTask(answer, args);
  });
}

function newTodo(text) {
  if( text.length > 0){
    todos.push({
      isviewed: false,
      text,
      lastActivity: 'created',
      lastUpdated: Date.now(),
    });
  }
}

function viewTodos(ids){
  ids.forEach((id) => {
    if (todos[id]){
      todos[id].isviewed = !todos[id].isviewed;
      todos[id].lastActivity = 'viewed';
      todos[id].lastUpdated = Date.now();
    }
  });
}

function deleteTodos(ids){
  if(ids[0].length === 3 && ids[0].includes('-')) {
    const [startdelete, stopdelete] = ids[0].split('-');
     if ((startdelete >= 0 && startdelete < todos.length)
      && (stopdelete >= 0 && stopdelete < todos.length)) {
      const todelete = (parseInt(stopdelete) - parseInt(startdelete)) + 1;
      todos.splice(startdelete, todelete);
    }
  } else {
    ids.sort((a, b) => b - a);
    ids.forEach((id) => {
      if (todos[id]) {
        todos.splice(id, 1);
      }
    });
  }
}

function showComplete() {
  console.log(`

 You can use the initial letter of each command for a shortcut.\n
  > PRESS ENTER TO CONTINUE < \n
`
)

}
function viewTask(answer, args) {
  let Complete = false;
  switch(answer){
    case 'n':
    case 'N':
    case 'new':
    case 'New':
      newTodo(args.join(' '));
      break;
    case 'v':
    case 'V':
    case 'view':
    case 'View':
      viewTodos(args);
      break;
    case 'd':
    case 'D':
    case 'delete':
    case 'delete':
      deleteTodos(args);
      break;
    case 'q':
    case 'Q':
    case 'quit':
    case 'Quit':
      console.clear();
      rl.close();
      process.quit();
      break;
    default:
      Complete = false;
  }
  saveData();
  askForATask(Complete);
}

function loadFile() {
  try{
    todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
    askForATask(false);
  } catch (err){
    if (err.code = 'ENOENT'){

      console.log('Todo file not found. Do you want generate a new one? (Y/N)');
      rl.question('> ', (answer) => {
        switch(answer) {
          case 'y':
          case 'Y':
          case 'YES':
          case 'yes':
          case 'Yes':
            fs.writeFileSync('todos.json', template, 'utf8');
            todos = JSON.parse(fs.readFileSync('todos.json', 'utf8'));
            askForATask(false);
            break;
          default:
            console.log('You can\'t use this app without creating the todo file.\nquiting...');
            process.quit(0);

        }
       });

    } else {
      console.log(err);
      process.quit(0);
    }
  }
}

function saveData() {
  fs.writeFileSync('todos.json', JSON.stringify(todos), 'utf8');
}

console.clear = function () {
  return process.stdout.write('\033c\033[3J');
}

let todos;
loadFile();