import { ImageSourcePropType } from "react-native";

type Location = {
  id: string;
  location: string;
  quantity: number;
  ship_id: string;
  warehouse: string;
};

type Warehouse = {
  id: string;
  name: string;
  icon_url: ImageSourcePropType | string;
};

type ElementModel = {
  id: string;
  parent_element_model_id: string | null;
  ship_model_id: string;
  ESWBS_code: string;
  LCN_name: string;
  Supplier_Parts_ID: string;
  Installed_quantity_on_End_Item: number;
  Manufacturer_Parts_ID: string;
  Installed_Quantity_on_Ship: number;
  ContractualBreakdown_ID: string | null;
  LCNtype_ID: string;
  Heat_transfer_to_air: string | null;
  Heat_transfer_to_water: string | null;
  Power_supply: string | null;
  RatedPower: string | null;
  Shipyard_arrangement_drawing_link: string | null;
  Position_on_arrangement_drawing: string | null;
  Reference_Designator: string | null;
  Shock_mounts_Vibration_mounts: string | null;
  Ship_Area_Room_Code: string | null;
  ElementModel_installation_drawing_link: string | null;
  Yearly_Operating_Hours: string | null;
  Yearly_Operating_Hours_during_missions: string | null;
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
  XG_Center_of_gravity: string | null;
  YG_Center_of_gravity: string | null;
  ZG_Center_of_gravity: string | null;
  Installed_quantity_on_next_higher_assy: string | null;
  Absorbed_current: string | null;
  Revolution_speed: string | null;
  Operating_pressure: string | null;
  Mass_flow: string | null;
  Delivery_Head: string | null;
  Test_pressure: string | null;
};


export type Replacement = {
  ID: string;
  element_model_id: string;
  ship_id: string;
  Serial_number: string;
  Part_name: string;
  Unitary_price: string;
  location: string;
  quantity: string;
  warehouse: string;
  user_id: string;
  image: string | ImageSourcePropType;
  ean13: string;
  Dimensions_LxWxH: string | null;
  Price_reference_date: string | null;
  Weight: string | null;
  Volume: string | null;
  NSN: string | null;
  Provisioning_Lead_Time_PLT: number;
  Document_file_hyperlink: string | null;
  Shelf_Life: string | null;
  Limited_Life: string | null;
  Limited_Life_Ens_Action_Code: string | null;
  warehouses: Warehouse[];
  locations: Location[];
  
  supplier: string | null;
  elementModel: ElementModel;
};

export const replacements: Replacement[] = [
  //  {
  //             "ID": 1,
  //             "element_model_id": 6,
  //             "ship_id": 1,
  //             "Serial_number": "MatricolaA",
  //             "Part_name": "Motore centrale",
  //             "Parts_ID": 11,
  //             "Unitary_price": "124.55",
  //             "location": "1",
  //             "quantity": "10,10",
  //             "warehouse": 1,
  //             "user_id": null,
  //             "image": null,
  //             "ean13": "1234",
  //             "Dimensions_LxWxH": null,
  //             "Price_reference_date": null,
  //             "Weight": null,
  //             "Volume": null,
  //             "NSN": null,
  //             "Provisioning_Lead_Time_PLT": 10,
  //             "Document_file_hyperlink": null,
  //             "Shelf_Life": null,
  //             "Limited_Life": null,
  //             "Limited_Life_Ens_Action_Code": null,
  //             "locations": [
  //                 {
  //                     "id": 1,
  //                     "location": "A13",
  //                     "ship_id": 1,
  //                     "warehouse": "1"
  //                 }
  //             ],
  //             "warehouses": [
  //                 {
  //                     "id": 1,
  //                     "name": "A bordo",
  //                     "icon_url": "https://scia-project-questit.s3.amazonaws.com/warehouseImages/shape.png"
  //                 }
  //             ]
  //         },
];
