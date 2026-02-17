import { type IconComponentProps } from '@/components/atoms/IconComponent';


export type MaintenanceLevelId = '1' | 'inBanchina' | '5' | 'fornitoreEsterno';

export type MaintenanceLevelDetails = {
    id: MaintenanceLevelId;
    label: string;
    IconComponent: IconComponentProps,
}

export type MaintenanceLevel = Record<MaintenanceLevelId,MaintenanceLevelDetails>

export const levels: MaintenanceLevel = {
    '1' : {
        id: '1',
        label: 'A bordo',
        IconComponent: {
            iconCollection: 'MaterialIcons',
            iconProps: { name: "directions-boat", color: "#67c2ae" },
        }

    },
    'inBanchina' : {
        id: 'inBanchina',
        label: 'In banchina',
        IconComponent: {
            iconCollection: 'MaterialIcons',
            iconProps: { name: "anchor", color: "#67c2ae" },
        }

    },
    '5' : {
        id: '5',
        label: 'In bacino',
        IconComponent: {
            iconCollection: 'MaterialCommunityIcons',
            iconProps: { name: "crane", color: "#67c2ae" },
        }

    },
    'fornitoreEsterno' : {
        id: 'fornitoreEsterno',
        label: 'Fornitore esterno',
        IconComponent: {
            iconCollection: 'MaterialIcons',
            iconProps: { name: "factory", color: "#67c2ae" },
        }

    },
}
