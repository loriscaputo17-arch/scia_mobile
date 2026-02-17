import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';


// NB: Da aggiornare. Definire con cliente quali sono precisamente gli impianti.. sono invertiti 
// //(2.1.4 Propulsione Diesel e' la classificazione ESWBS, Propulsione Diesel nell'albero WSWBS e' il padre di Motore Centrale che e' invece il sistema/impianto )

export const systemsTree = [
    {
        id: 'scafo',
        fullName: '100 - Scafo',
        ESWBSCode: '100',
        name: 'Scafo',
        macro: '',
        IconComponent: MaterialIcons,
        iconProps: { name: "directions-boat" },
        children: [
            {
                id: 'secondo_livello_A',
                fullName: '1.1 - Secondo livello A',
                ESWBSCode: '1.1',
                name: 'Secondo Livello A',
                macro: 'scafo',
                children: [
                    {
                        id: 'terzo_livello_A',
                        fullName: '1.1.1 - Terzo livello A',
                        ESWBSCode: '1.1.1',
                        name: 'Terzo livello A',
                        macro: 'secondo_livello_A',
                        children: [],
                    },
                    {
                        id: 'terzo_livello_B',
                        fullName: '1.1.2 - Terzo livello B',
                        ESWBSCode: '1.1.2',
                        name: 'Terzo livello B',
                        macro: 'secondo_livello_A',
                        children: [],
                    }
                ]
            },
            {
                id: 'secondo_livello_B',
                fullName: '1.2 - Secondo livello B',
                ESWBSCode: '1.2',
                name: 'Secondo livello B',
                macro: 'scafo',
                children: [],
            }
        ]
    },
    {
        id: 'propulsioni_motori',
        fullName: '200 - Propulsioni/Motori',
        ESWBSCode: '200',
        name: 'Propulsioni/Motori',
        macro: '',
        IconComponent: MaterialCommunityIcons,
        iconProps: { name: "engine" },
        children: [
            {
                id: 'motore_centrale',
                fullName: '2.1 - Motore centrale',
                ESWBSCode: '2.1',
                name: 'Motore centrale',
                macro: 'propulsioni_motori',
                children: [
                    {
                        id: 'terzo_livello_mc_A',
                        fullName: '2.1.1 - Terzo livello A',
                        ESWBSCode: '2.1.1',
                        name: 'Terzo livello A',
                        macro: 'motore_centrale',
                        children: [],
                    },
                    {
                        id: 'terzo_livello_mc_B',
                        fullName: '2.1.2 - Terzo livello B',
                        ESWBSCode: '2.1.2',
                        name: 'Terzo livello B',
                        macro: 'motore_centrale',
                        children: [],
                    },
                    {
                        id: 'terzo_livello_mc_C',
                        fullName: '2.1.3 - Terzo livello B',
                        ESWBSCode: '2.1.3',
                        name: 'Terzo livello B',
                        macro: 'motore_centrale',
                        children: [],
                    },
                    {
                        id: 'propulsione_diesel',
                        fullName: '2.1.4 - Propulsione Diesel',
                        ESWBSCode: '2.1.4',
                        name: 'Propulsione Diesel',
                        macro: 'motore_centrale',
                        children: [],
                    }
                ]
            },
            {
                id: 'motore_secondario',
                fullName: '2.2 - Motore secondario',
                ESWBSCode: '2.2',
                name: 'Motore secondario',
                macro: 'propulsioni_motori',
                children: []
            },
        ]
    },
    {
        id: 'impianto_elettrico',
        fullName: '300 - Impianto elettrico',
        ESWBSCode: '300',
        name: 'Impianto elettrico',
        macro: '',
        IconComponent: MaterialIcons,
        iconProps: { name: "electrical-services" },
        children: []
    },
    {
        id: 'comando_controllo_sorveglianza',
        fullName: '400 - Comando, controllo e sorveglianza',
        ESWBSCode: '400',
        name: 'Comando, controllo e sorveglianza',
        macro: '',
        IconComponent: Ionicons,
        iconProps: { name: "speedometer" },
        children: []
    },
    {
        id: 'impianti_ausiliari',
        fullName: '500 - Impianti ausiliari',
        ESWBSCode: '500',
        name: 'Impianti ausiliari',
        macro: '',
        IconComponent: MaterialCommunityIcons,
        iconProps: { name: "alert-rhombus" },
        children: []
    },
];