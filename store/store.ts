import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import maintenancesReducer    from "../features/maintenances/maintenanceSlice";
import tasksReducer           from "../features/tasks/tasksSlice";
import readingsReducer        from "../features/readings/readingsSlice";
import malfunctionReducer     from "../features/malfunctions/malfunctionsSlice";
import systemsReducer         from "../features/systems/systemSlice";
import scansReducer           from "../features/scans/scansSlice";
import historyReducer         from "../features/history/historySlice";
import replacementsReducer    from "../features/replacements/replacementsSlice";
import activityListsReducer   from "../features/activityLists/activityListsSlice";
import usersReducer           from "../features/users/usersSlice";
import authReducer            from "../features/auth/authSlice";
import ranksReducer           from "../features/ranks/ranksSlice";
import cartItemsReducer       from "../features/cartItems/cartItemsSlice";
import warehousesReducer      from "../features/warehouses/warehousesSlice";
import locationsReducer       from "../features/locations/locationsSlice";
import maintenanceTypesReducer from "../features/maintenanceTypes/maintenanceTypesSlice";
import shipFilesReducer       from "../features/shipFiles/shipFilesSlice";
import failuresReducer        from "../features/failures/failuresSlice";
import pendingActionsReducer from "./pendingActionsSlice";

const rootReducer = combineReducers({
  maintenances:     maintenancesReducer,
  systems:          systemsReducer,
  history:          historyReducer,
  scans:            scansReducer,
  replacements:     replacementsReducer,
  users:            usersReducer,
  tasks:            tasksReducer,
  readings:         readingsReducer,
  malfunctions:     malfunctionReducer,
  activityLists:    activityListsReducer,
  auth:             authReducer,
  ranks:            ranksReducer,
  cartItems:        cartItemsReducer,
  warehouses:       warehousesReducer,
  locations:        locationsReducer,
  maintenanceTypes: maintenanceTypesReducer,
  shipFiles:        shipFilesReducer,
  failures:         failuresReducer,
  pendingActions:   pendingActionsReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  whitelist: [
    "auth",
    "maintenances",
    "tasks",
    "readings",
    "replacements",
    "cartItems",
    "locations",
    "failures",
    "malfunctions",
    "warehouses",
    "systems",
    "ranks",
    "maintenanceTypes",
    "shipFiles",
    "pendingActions",
  ],
  // scans e history sono volatili, non persistere
  blacklist: ["scans", "history", "users", "activityLists"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;