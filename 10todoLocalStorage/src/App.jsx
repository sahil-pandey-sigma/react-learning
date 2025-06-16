import { useState, useEffect } from "react";
import { TodoProvider } from "./contexts";
import { TodoForm,TodoItem } from "./components";
function App() {
  const [todos, setTodos] = useState([]);

  const addTodo = (todo) => {
    setTodos((prev) => [{ id: Date.now(), ...todo }, ...prev]);
    // in the above line we have fired call back to access prev array , ...prev we have called all the prev value and have spread it in the current array similarly since todo is object having id so we have given an id and rest we have spread over the array
  };
  const updateTodo = (id, todo) => {
    setTodos((prev) =>
      prev.map((prevTodo) => (prevTodo.id === id ? todo : prevTodo))
    );
    // for updating any todo we need to access existing todo for doing that we used setTodos((prev) => ), now we want to iterate to find id thus we used prev.map in map we want to get the elements thus .map((prevTodo) => )
  };
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((prevTodo) => prevTodo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id
          ? { ...prevTodo, completed: !prevTodo.completed }
          : prevTodo
      )
    );
  };
  // Here we'll move on to localStorage so there will be some todos already in localStorage so we will need to fetch them from there into our todos array on the moment our applications start --> we are using useEffect

  //  local storage stores data in string key value pair so we'll need to convert it into json first
  // if you shift everything to  a server then there is no use of localStorage
  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos"));
    if (todos && todos.length > 0) {
      setTodos(todos);
    }
  }, []);

  //  Here we are storing the todos which we will be getting using useTodo or contextAPI in local Storage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);
  return (
    <TodoProvider
      value={{ todos, addTodo, updateTodo, deleteTodo, toggleComplete }}
    >
      <div className="bg-[#172842] min-h-screen py-8">
        <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
          <h1 className="text-2xl font-bold text-center mb-8 mt-2">
            Manage Your Todos
          </h1>
          <div className="mb-4">
            {/* todo form */}
            <TodoForm />
          </div>
          <div className="flex flex-wrap gap-y-3">
            {/* Loop and add todo Item here */}
            {todos.map((todo) => (
              <div key={todo.id} className="w-full">
                <TodoItem todo={todo}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TodoProvider>
  );
}

export default App;
