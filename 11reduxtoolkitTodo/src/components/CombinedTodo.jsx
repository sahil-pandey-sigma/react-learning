import React from 'react'
import { addTodo, removeTodo, updateTodo } from '../features/todo/todoSlice'
import { useDispatch, useSelector } from 'react-redux';


function CombinedTodo() {
    const todos = useSelector(state => state.todo.todos);
    const dispatch = useDispatch();

    const [input, setInput] = React.useState("");
    const [editId, setEditId] = React.useState(null);

    const handleSubmit = () => {
        if (editId) {
            dispatch(updateTodo({ id: editId, text: input }))
            setEditId(null)
        }
        else {
            dispatch(addTodo(input))
        }
        setInput("");
    }
    const handleEdit = (todo) => {
        setInput(todo.text);
        setEditId(todo.id);
    }

    return (
        <div>
            <div className='flex justify-center items-center text-2xl font-bold mt-4'>Todos</div>

            <div className='flex items-center justify-center gap-3 mt-3'>
                <input type="text" className='border bg-amber-50 rounded-xl h-10 w-100 p-2'
                    placeholder='Enter the todo...'
                    value={input}
                    onChange={(e) => setInput(e.target.value)} />
                <button
                    className='bg-purple-500 text-white border border-amber-50 w-20 rounded-xl h-10 cursor-pointer'
                    onClick={handleSubmit}>
                    {editId ? "Update" : "Add"}
                </button>
            </div>
            <ul className='list-none mx-10 mt-4'>
                {todos.map((todo) => (
                    <li
                        className='bg-blue-400 mt-4 flex items-center justify-between px-4 py-2 rounded-xl shadow-xl'
                        key={todo.id}>
                        <div className="text-white font-bold ">{todo.text}</div>
                        <div className='flex space-x-2'>
                            <button
                                className='bg-green-900 text-white rounded-md px-2 py-1 cursor-pointer'
                                onClick={() => handleEdit(todo)}
                            >Edit</button>
                            <button
                                className='bg-red-800 text-white rounded-md px-2 
                                py-1 cursor-pointer'
                                onClick={() => dispatch(removeTodo(todo.id))}
                            >Remove</button>
                        </div>
                    </li>
                ))}

            </ul>

        </div>

    )
}

export default CombinedTodo