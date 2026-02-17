import React from 'react';
import { FontAwesome, FontAwesome5, Octicons, FontAwesome6, MaterialCommunityIcons, MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';


export type IconCollection = 'Octicons' | 'FontAwesome' | 'FontAwesome5' | 'FontAwesome6' | 'MaterialCommunityIcons' | 'MaterialIcons' | 'AntDesign' | 'Ionicons';

// Mappatura dei componenti delle icone
export const iconComponentMapping: Record<IconCollection, React.ComponentType<any>> = {
    FontAwesome6,
    FontAwesome5,
    FontAwesome,
    MaterialCommunityIcons,
    MaterialIcons,
    AntDesign,
    Ionicons,
    Octicons,
};

export type IconComponentProps = {
    iconCollection: IconCollection; 
    iconProps: {
        name: string;   // Stringa generica per il nome dell'icona
        size?: number;  // Dimensione dell'icona
        color?: string; // Colore dell'icona
    };
}

export default function IconComponent({ iconCollection, iconProps }: IconComponentProps) {
    const Icon = iconComponentMapping[iconCollection];

    return Icon ? <Icon size={24} {...iconProps} /> : null;
}
