import { ImageSourcePropType } from "react-native";

type Rank = {
  name: string;
  image: ImageSourcePropType;
  id: string;
};

type Ranks = Record<string, Rank>;

 const ranks: Ranks = {
  "colonnello_t_st": {
    id: "colonnello_t_st",
    name: "Colonnello t.ST",
    image: require("../assets/images/colonel.jpg"),
  },
  "capitano_di_fregata_t.sc": {
    id: "capitano_di_fregata_t.sc",
    name: "Capitano di Fregata t.SC",
    image: require("../assets/images/grade.png"),
  },
  "capitano_di_corvetta_t.mt": {
    id: "capitano_di_corvetta_t.mt",
    name: "Capitano di Corvetta t.MT",
    image: require("../assets/images/grade2.png"),
  },
  "capitano_di_vascello_t.ing": {
    id: "capitano_di_vascello_t.ing",
    name: "Capitano di Vascello t.ING",
    image: require("../assets/images/grade3.png"),
  },
  "tenente_di_Vascello_t.ict": {
    id: "tenente_di_Vascello_t.ict",
    name: "Tenente di Vascello t.ICT",
    image: require("../assets/images/grade4.png"),
  },
};
