// Slice is reducers

import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  todos: [{ id: 1, text: "Hello World!" }],
};

export const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const todo = {
        id: nanoid(),
        text: action.payload,
        // Payload is Object having multiple things like text values etc we could have written payload.text but we have already defined text : action.payload so we don't have to write action.payload.text
      };
      state.todos.push(todo);
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
    },
    updateTodo: (state, action) => {
      state.todos = state.todos.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, text: action.payload.text }
          : todo
      );
    },
  },
});

export const { addTodo, removeTodo, updateTodo } = todoSlice.actions;

export default todoSlice.reducer;

// We have to export all the actions since we will be creating components for these.
// Also we have to to export all the reducers of all the slices. for store because store only updates the reducers which it has the acccess of.

// Every slice has some initial state so you can either define it in slice or outside the slice. Store is empty without reducers (properties)

// every reducer has two properties state and action state gives you access of all the variables of initialstate and action is responsible for any change of state
