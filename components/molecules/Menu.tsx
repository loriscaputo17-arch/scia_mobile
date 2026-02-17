import { View, Modal, TouchableOpacity } from 'react-native';
import React from 'react';
import Button from '../atoms/Button';

export interface MenuAction {
    label: string;
    onClick: () => void;
    IconComponent?: React.ComponentType<any>;
    iconProps?: {
        name: string;
        size?: number;
        color?: string;
    };
}

type MenuProps = {
    actions: MenuAction[];
    styleWind?: string;
    visible: boolean;  
    onClose: () => void;  
}

export default function Menu({ actions, styleWind, visible, onClose }: MenuProps) {
    return (
        <Modal
            visible={visible}
            transparent={true} // Per mostrare il background trasparente
            animationType="fade" // Puoi cambiare l'animazione se vuoi
            onRequestClose={onClose} // Funziona quando si preme il tasto "back" su Android
            className={styleWind}
        >
            {/* Sfondo trasparente che cattura i click */}
            <TouchableOpacity 
                style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }} 
                activeOpacity={1} 
                onPress={onClose} // Quando si clicca fuori dal menu, si chiude
            >
                {/* Questa View ferma la propagazione dei tocchi */}
                <View style={{ flex: 1 }} />
            </TouchableOpacity>

            {/* Menu vero e proprio */}
            <View className={styleWind}>
                {actions.map((action, index) => (
                    <Button 
                        key={index} 
                        label={action.label} 
                        onPress={action.onClick} 
                        IconComponent={action.IconComponent} 
                        iconProps={action.iconProps} 
                        theme='menu'
                    />
                ))}
            </View>
        </Modal>
    );
}
