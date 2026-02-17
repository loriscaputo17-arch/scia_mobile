import { ImageSourcePropType } from "react-native";

type Magazine = "A bordo" | "A terra";

/* 
Non si trovera' qui il campo quantity
Uno stesso ricambio 'cinghia_di_distribuzione' puo' trovarsi (con una certa quantita') in piu' ubicazioni (A12, A13,..) dentro a piu' magazzini ('A bordo, 'In banchina, 'In bacino'...).
Quindi per ogni magazzino, e per ogni ubicazione al suo interno, vedo la quantita' disponibile di un certo ricambio.

*/

type Location = {
  id: string;
  name: string;
  quantity: number;
};

type Warehouse = {
  id: string;
  name: string;
  locations: Location[];
};

 type Replacement = {
  name: string;
  id: string;
  img: ImageSourcePropType;
  quantity: number; // DA MODIFICARE!!
  stockOutThresold: number;
  partNumber: string;

  manufacturerPartNumber: string;
  supplierNCAGE: string,
  manufacturerNCAGE: string,
  originalName: string,

  magazine: Magazine;
  location: string;
  supplier: string;
  description: string;
  price: number;
  systemId: string;
  warehouses: Warehouse[];
  ean13Image: ImageSourcePropType;
  
};


export const replacements: Replacement[] = [
  {
    name: "Cinghia di distribuzione",
    id: "cinghia_di_distribuzione",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    quantity: 0,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    magazine: "A bordo",
    location: "A12",
    supplier: "My Company Srl",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 190,
    systemId: "propulsione_diesel",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },

  {
    name: "Ricambio numero 2",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_2",
    quantity: 19,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 90,
    systemId: "propulsione_diesel",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
      {
        id: "12",
        name: "In bacino",
        locations: [
          {
            id: "154",
            quantity: 15,
            name: "C23",
          },
          {
            id: "155",
            quantity: 15,
            name: "C24",
          },
        ],
      },
    ],
  },

  {
    name: "Ricambio numero 3",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_3",
    quantity: 3,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 60,
    systemId: "propulsione_elettrica",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },

  {
    name: "Ricambio numero 4",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_4",
    quantity: 190,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 90,
    systemId: "testSystem",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },
  {
    name: "Ricambio numero 5",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_5",
    quantity: 0,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 60,
    systemId: "quadro_elettrico",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },
  {
    name: "Ricambio numero 6",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_6",
    quantity: 30,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 60,
    systemId: "scafo_struttura",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },
  {
    name: "Ricambio numero 7",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_7",
    quantity: 4,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 90,
    systemId: "scafo_struttura",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },
  {
    name: "Ricambio numero 8",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_8",
    quantity: 0,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 60,
    systemId: "controllo_sicurezza_entrata",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },
  {
    name: "Ricambio numero 9",
    img: require("@/assets/images/propulsione_diesel.png"),
    ean13Image: require("@/assets/images/ean13Image.png"),
    id: "ricambio_n_9",
    quantity: 30,
    stockOutThresold: 5,
    partNumber: "SIMB15013272Z",
    manufacturerPartNumber: "15013272Z",
    supplierNCAGE: "AL492",
    manufacturerNCAGE: "F0781",
    originalName: "Joint Culasse",
    
    magazine: "A bordo",
    location: "C3",
    supplier: "IJES ltd",
     description:
      "Buon sostituto per guarnizione vecchia o danneggiata, guarnizioni che, se non sostituite tempestivamente, potrebbero compromettere la tenuta del motore, causando perdite di fluidi vitali come olio e carburante. La sostituzione delle guarnizioni è fondamentale per mantenere l'efficienza del sistema e prevenire danni gravi alle componenti interne. Inoltre, un'adeguata manutenzione delle guarnizioni contribuisce a garantire la sicurezza operativa e a ridurre il rischio di malfunzionamenti durante il funzionamento del motore, prolungando la sua vita utile e ottimizzando le performance del sistema di propulsione.",
   
    price: 60,
    systemId: "controllo_sicurezza_entrata",
    warehouses: [
      {
        id: "10",
        name: "A bordo",
        locations: [
          {
            id: "10",
            quantity: 5,
            name: "A12",
          },
          {
            id: "15",
            quantity: 5,
            name: "A13",
          },
        ],
      },
      {
        id: "11",
        name: "In banchina",
        locations: [
          {
            id: "123",
            quantity: 15,
            name: "B4",
          },
        ],
      },
    ],
  },
];
