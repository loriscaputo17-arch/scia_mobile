import { Recurrence } from "./recurrenceTresholds";

export type Job = {
  id: string;
  job_id: string;
  status_id: string;
  pauseDate?: string;
  user_id: string;
  element_eswbs_instance_id: number;
  starting_date: string | null;
  ending_date: string;
  data_recovery_expiration: string | null;
  execution_date: string;
  attachment_link: string | null;
  recurrency_type_id: string;
  ship_id: string;
  execution_state: string;

  recurrencyType: Recurrence;

  job: {
    id: string;
    maintenance_list_id: string;
    level_id: string;
    recurrency_type_id: string;
    team_id: string;
    name: string;
    recurrency_days: number;
    advance_threshold: number;
    delay_threshold: number;
    short_description: string | null;
    long_description: string | null;
    attachment_pdf_link: string | null;
    video_link: string | null;
    maintenance_list: {
      id: string;
      id_ship: string;
      id_ship_model: string;
      name: string;
      order: number;
      validity_from_date: string;
      validity_to_date: string;
      last_executed_job: string | null;
      System_ElementModel_ID: string;
      End_Item_ElementModel_ID: string;
      Maintenance_Item_ElementModel_ID: string;
      MaintenanceType_ID: number | null;
      Maintenance_Frequency: number | null;
      Operational_Not_operational: string | null;
      Maintenance_under_condition_description: string | null;
      Job_frequency: number | null;
      Mean_elapsed_time_MELAP: number | null;
      Note: string | null;
      Mean_Men_Hours_MMH: number | null;
      Personnel_no: number | null;
      Personnel_ID: number | null;
      RecurrencyType_ID: string | null;
      MaintenanceLevel_ID: string;
      Service_or_Maintenance_Manual_Link: string | null;
      Service_or_Maintenance_manual_ParagraphAndPage: string | null;
      Check_List: string;
      Maintenance_procedure_details: string | null;
      maintenance_level: {
        id: number;
        Level_MIL_STD_1388: string;
        Description: string;
        Level_MMI: string;
        Industry_Level: string;
      };
    };
    team: {
      id: string;
      team_leader_id: string;
      name: string;
    };
  } | null;

  status: {
    id: string;
    name: string;
  };

  Element: {
    id: string;
    element_model_id: string;
    ship_id: string;
    name: string;
    serial_number: string;
    installation_date: string | null;
    progressive_code: string | null;
    time_to_work: number | null;
    updated_at: string | null;
    element_model: {
      id: string;
      parent_element_model_id: string;
      ship_model_id: string;
      ESWBS_code: string;
      LCN_name: string;
      Supplier_Parts_ID: string;
      Installed_quantity_on_End_Item: number;
      Manufacturer_Parts_ID: string;
      Installed_Quantity_on_Ship: number;
      ContractualBreakdown_ID: number | null;
      LCNtype_ID: string;
      Heat_transfer_to_air: number | null;
      Heat_transfer_to_water: number | null;
      Power_supply: number | null;
      RatedPower: number | null;
      Shipyard_arrangement_drawing_link: string | null;
      Position_on_arrangement_drawing: string | null;
      Reference_Designator: string | null;
      Shock_mounts_Vibration_mounts: string | null;
      Ship_Area_Room_Code: string | null;
      ElementModel_installation_drawing_link: string | null;
      Yearly_Operating_Hours: number | null;
      Yearly_Operating_Hours_during_missions: number | null;
      Criticality_Code_CC: string | null;
      Repairability_Code_CR: string | null;
      Replaceability_Code_CS: string | null;
      Alternate_LCN_ALC: string | null;
      Level1: string | null;
      Level4: string | null;
      Level5: string | null;
      Level6: string | null;
      Level7: string | null;
      Level8: string | null;
      Level9: string | null;
      XG_Center_of_gravity: number | null;
      YG_Center_of_gravity: number | null;
      ZG_Center_of_gravity: number | null;
      Installed_quantity_on_next_higher_assy: string;
      Absorbed_current: number | null;
      Revolution_speed: number | null;
      Operating_pressure: number | null;
      Mass_flow: number | null;
      Delivery_Head: number | null;
      Test_pressure: number | null;
    };
  };

  vocalNotes: Array<{
    id: string;
    failure_id: string | null;
    task_id: string;
    audio_url: string;
    created_at: string;
    author: string;
    type: string;
    status: string | null;
  }>;

  textNotes: Array<{
    id: string;
    failure_id: string | null;
    task_id: string;
    author: string;
    text_field: string;
    created_at: string;
    type: string;
    status: string | null;
  }>;

  photographicNotes: Array<{
    id: string;
    failure_id: string | null;
    task_id: string;
    image_url: string;
    author: string;
    created_at: string;
    type: string;
    status: string | null;
  }>;
};
