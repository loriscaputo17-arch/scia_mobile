import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { replacements, type Replacement } from "@/data/replacements";

const replacementsSlice = createSlice({
  name: "replacements",
  initialState: [] as Replacement[],
  reducers: {
    // setReplacements: (_state, action: PayloadAction<Replacement[]>) => {
    //   return action.payload;
    // },

    setReplacements: (_state, action: PayloadAction<Replacement[]>) => {
      return action.payload.map((rep) => ({
        ...rep,
        ID: String(rep.ID),
        element_model_id: String(rep.element_model_id),
        ship_id: String(rep.ship_id),
        user_id: String(rep.user_id),
        warehouse: String(rep.warehouse),
        locations: rep.locations.map((loc) => ({
          ...loc,
          id: String(loc.id),
          ship_id: String(loc.ship_id),
        })),
        warehouses: rep.warehouses.map((wh) => ({
          ...wh,
          id: String(wh.id),
        })),
        elementModel: {
          ...rep.elementModel,
          id: String(rep.elementModel.id),
          parent_element_model_id: rep.elementModel.parent_element_model_id !== null ? String(rep.elementModel.parent_element_model_id) : null,
          ship_model_id: String(rep.elementModel.ship_model_id),
          ContractualBreakdown_ID: rep.elementModel.ContractualBreakdown_ID !== null ? String(rep.elementModel.ContractualBreakdown_ID) : null,
          LCNtype_ID: String(rep.elementModel.LCNtype_ID),
        },
      }));
    },

    //da aggiornare
    // decrementReplacementsQuantity: (state, action: PayloadAction<{ replacementId: string; quantity: number }[]>) => {
    //   action.payload.forEach(({ replacementId, quantity }) => {
    //     const rep = state.find((r) => r.id === replacementId);
    //     if (rep) {
    //       rep.quantity -= quantity;
    //     }
    //   });
    // },
  },
});

export const { setReplacements /*  decrementReplacementsQuantity */ } = replacementsSlice.actions;
export default replacementsSlice.reducer;

// Selectors
export const selectReplacements = (state: { replacements: Replacement[] }) => state.replacements;

export const selectReplacementById = (id: string) => (state: { replacements: Replacement[] }) => state.replacements.find((r) => r.ID === id);

export const selectReplacementMap = createSelector([selectReplacements], (replacements) =>
  replacements.reduce<Record<string, Replacement>>((acc, rep) => {
    acc[rep.ID] = rep;
    return acc;
  }, {})
);

// const replacementsSlice = createSlice({
//   name: "replacements",
//   initialState: replacements,
//   reducers: {
//     setReplacements: (_state, action: PayloadAction<Replacement[]>) => {
//       return action.payload;
//     },
//     decrementReplacementsQuantity: (state, action: PayloadAction<{ replacementId: string; quantity: number }[]>) => {
//       action.payload.forEach(({ replacementId, quantity }) => {
//         const rep = state.find((r) => r.id === replacementId);
//         if (rep) {
//           rep.quantity -= quantity;
//         }
//       });
//     },
//   },
// });

// export const { setReplacements, decrementReplacementsQuantity } = replacementsSlice.actions;
// export default replacementsSlice.reducer;

// // Selectors
// export const selectReplacements = (state: { replacements: Replacement[] }) => state.replacements;

// export const selectReplacementById = (id: string) => (state: { replacements: Replacement[] }) =>
//   state.replacements.find((r) => r.id === id);

// export const selectReplacementMap = createSelector([selectReplacements], (replacements) =>
//   replacements.reduce<Record<string, Replacement>>((acc, rep) => {
//     acc[rep.id] = rep;
//     return acc;
//   }, {})
// );
