import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Job } from "@/data/jobs";

/* Dati dal backend inconsistenti (in valore e naming), necessario rimapparli a mano in stringhe. */

const maintenancesSlice = createSlice({
  name: "maintenances",
  initialState: [] as Job[],
  reducers: {
    setMaintenances: (_state, action: PayloadAction<Job[]>) => {
      return action.payload.map((job) => ({
        ...job,
        id: String(job.id),
        job_id: String(job.job_id),
        status_id: String(job.status_id),
        user_id: String(job.user_id),
        ship_id: String(job.ship_id),
        recurrency_type_id: String(job.recurrency_type_id),

        recurrencyType: {
          ...job.recurrencyType,
          id: String(job.recurrencyType.id),
        },

        status: {
          ...job.status,
          id: String(job.status.id),
        },

        job: job.job
          ? {
          ...job.job,
          id: String(job.job.id),
          maintenance_list_id: String(job.job.maintenance_list_id),
          level_id: String(job.job.level_id),
          recurrency_type_id: String(job.job.recurrency_type_id),
          team_id: String(job.job.team_id),

          maintenance_list: {
            ...job.job.maintenance_list,
            id: String(job.job.maintenance_list.id),
            id_ship: String(job.job.maintenance_list.id_ship),
            id_ship_model: String(job.job.maintenance_list.id_ship_model),
            System_ElementModel_ID: String(job.job.maintenance_list.System_ElementModel_ID),
            End_Item_ElementModel_ID: String(job.job.maintenance_list.End_Item_ElementModel_ID),
            Maintenance_Item_ElementModel_ID: String(job.job.maintenance_list.Maintenance_Item_ElementModel_ID),
            MaintenanceLevel_ID: String(job.job.maintenance_list.MaintenanceLevel_ID),
            RecurrencyType_ID: job.job.maintenance_list.RecurrencyType_ID !== null ? String(job.job.maintenance_list.RecurrencyType_ID) : null,
          },

          team: {
            ...job.job.team,
            id: String(job.job.team.id),
            team_leader_id: String(job.job.team.team_leader_id),
          },
        } : null,

        Element: {
          ...job.Element,
          id: String(job.Element.id),
          element_model_id: String(job.Element.element_model_id),
          ship_id: String(job.Element.ship_id),

          element_model: {
            ...job.Element.element_model,
            id: String(job.Element.element_model.id),
            parent_element_model_id: String(job.Element.element_model.parent_element_model_id),
            ship_model_id: String(job.Element.element_model.ship_model_id),
            Supplier_Parts_ID: String(job.Element.element_model.Supplier_Parts_ID),
            Manufacturer_Parts_ID: String(job.Element.element_model.Manufacturer_Parts_ID),
            LCNtype_ID: String(job.Element.element_model.LCNtype_ID),
          },
        },

        // Note: Le vocal/text/photographic notes hanno ID ma sono opzionali, quindi mappiamo solo se presenti
        vocalNotes:
          job.vocalNotes?.map((note) => ({
            ...note,
            id: String(note.id),
            failure_id: note.failure_id !== null ? String(note.failure_id) : null,
          })) ?? [],

        textNotes:
          job.textNotes?.map((note) => ({
            ...note,
            id: String(note.id),
            failure_id: note.failure_id !== null ? String(note.failure_id) : null,
          })) ?? [],

        photographicNotes:
          job.photographicNotes?.map((note) => ({
            ...note,
            id: String(note.id),
            failure_id: note.failure_id !== null ? String(note.failure_id) : null,
          })) ?? [],
      }));
    },
  },
});

export const { setMaintenances } = maintenancesSlice.actions;
export default maintenancesSlice.reducer;

export const selectMaintenances = (state: { maintenances: Job[] }) => state.maintenances;

export const selectMaintenanceById = (id: string) => (state: { maintenances: Job[] }) => state.maintenances.find((m) => m.id === id);
