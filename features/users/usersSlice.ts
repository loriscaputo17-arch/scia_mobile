import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { type User, type Users, users } from "@/data/users"; 

type UsersState = {
  users: Users; // Mantiene il formato a oggetto
  usersList: User[]; // Lista di utenti
  // usersIds: string[];
};

const initialState: UsersState = {
  users, // Mantieni l'oggetto degli utenti originale
  usersList: Object.values(users), // Inizializza anche come lista
  // usersIds: Object.keys(users),
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      const user = action.payload;
      state.users[user.id] = user; // Aggiorna la struttura come nei dati mock
      state.usersList.push(user); // Aggiorna la lista
      // state.usersIds.push(user.id); // Aggiorna gli id
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const user = action.payload;
      if (state.users[user.id]) {
        state.users[user.id] = { ...state.users[user.id], ...user };
        state.usersList = Object.values(state.users);
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.users[id];
      state.usersList = Object.values(state.users);
      // state.usersIds = Object.keys(state.users);
    },
  },
});

export const { addUser, updateUser, deleteUser } = usersSlice.actions;

export default usersSlice.reducer;

// Funzione per ottenere l'oggetto di tutti gli utenti
export const selectUsers = (state: { users: UsersState }) => state.users.users;

// Funzione per ottenere la lista di tutti gli utenti
export const selectUsersList = (state: { users: UsersState }) => state.users.usersList;

// export const selectUsersIds = (state: { users: UsersState }) => state.users.usersIds;

// Nuova funzione per ottenere un elenco di { label: id, value: name }
export const selectUserOptions = createSelector(
  [selectUsersList], // Usa la lista invece dell'oggetto
  (users) => users.map((user) => ({ value: user.id, label: user.firstName + ' ' + user.lastName })) // Mappa gli utenti per estrarre id e nome
);

// Funzione per ottenere un utente dato il suo id
export const selectUserById = (state: { users: UsersState }, userId: string) => {
  return state.users.users[userId] || null;
};