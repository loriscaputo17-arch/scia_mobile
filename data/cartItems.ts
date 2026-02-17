import { type Replacement } from "@/data/replacements";
import { ImageSourcePropType } from "react-native";

// Estendiamo il tipo Replacement con "quantity" per rappresentare gli articoli nel carrello
export type CartItem = {
  //   cartQuantity: number;
  id: string;
  user_id: string;
  spare_id:  string;
  quantity: number ;
  status: string;
  created_at: string; // o Date, se lo converti
  updated_at: string; // idem
  Spare: Replacement;
};

// Dati mock (simulano due ricambi nel carrello)
export const cartItems: CartItem[] = [
  // {
  //   name: "Ricambio numero 3",
  //   img: require("@/assets/images/propulsione_diesel.png"),
  //   ean13Image: require("@/assets/images/ean13Image.png"),
  //   id: "ricambio_n_3",
  //   quantity: 3,
  //   cartQuantity: 1,
  //   stockOutThresold: 5,
  //   partNumber: "SIMB15013272Z",
  //   manufacturerPartNumber: "15013272Z",
  //   supplierNCAGE: "AL492",
  //   manufacturerNCAGE: "F0781",
  //   originalName: "Joint Culasse",
  //   magazine: "A bordo",
  //   location: "C3",
  //   supplier: "IJES ltd",
  //   description:
  //     "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
  //   price: 60,
  //   systemId: "propulsione_elettrica",
  //   warehouses: [
  //     {
  //       id: "10",
  //       name: "A bordo",
  //       locations: [
  //         {
  //           id: "10",
  //           quantity: 5,
  //           name: "A12",
  //         },
  //         {
  //           id: "15",
  //           quantity: 5,
  //           name: "A13",
  //         },
  //       ],
  //     },
  //     {
  //       id: "11",
  //       name: "In banchina",
  //       locations: [
  //         {
  //           id: "123",
  //           quantity: 15,
  //           name: "B4",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   name: "Ricambio numero 2",
  //   img: require("@/assets/images/propulsione_diesel.png"),
  //   ean13Image: require("@/assets/images/ean13Image.png"),
  //   id: "ricambio_n_2",
  //   quantity: 19,
  //   cartQuantity: 2,
  //   stockOutThresold: 5,
  //   partNumber: "SIMB15013272Z",
  //   manufacturerPartNumber: "15013272Z",
  //   supplierNCAGE: "AL492",
  //   manufacturerNCAGE: "F0781",
  //   originalName: "Joint Culasse",
  //   magazine: "A bordo",
  //   location: "C3",
  //   supplier: "IJES ltd",
  //   description:
  //     "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
  //   price: 90,
  //   systemId: "propulsione_diesel",
  //   warehouses: [
  //     {
  //       id: "10",
  //       name: "A bordo",
  //       locations: [
  //         {
  //           id: "10",
  //           quantity: 5,
  //           name: "A12",
  //         },
  //         {
  //           id: "15",
  //           quantity: 5,
  //           name: "A13",
  //         },
  //       ],
  //     },
  //     {
  //       id: "11",
  //       name: "In banchina",
  //       locations: [
  //         {
  //           id: "123",
  //           quantity: 15,
  //           name: "B4",
  //         },
  //       ],
  //     },
  //     {
  //       id: "12",
  //       name: "In bacino",
  //       locations: [
  //         {
  //           id: "154",
  //           quantity: 15,
  //           name: "C23",
  //         },
  //         {
  //           id: "155",
  //           quantity: 15,
  //           name: "C24",
  //         },
  //       ],
  //     },
  //   ],
  // },
];
