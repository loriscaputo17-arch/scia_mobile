import React, { ReactNode, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ExpandComponentProps {
    children: ReactNode; // Accetta uno o più figli come contenuto
    label?: string;
    labelStyle?: string;
}

const ExpandComponent: React.FC<ExpandComponentProps> = ({ children, label, labelStyle }) => {
    const [expanded, setExpanded] = useState<boolean>(true);

    return (
        <>
            <Pressable onPress={() => setExpanded(!expanded)} className="flex-row">
                {label && <Text className={labelStyle}>{label}</Text>}
                {expanded
                    ? <MaterialIcons name="navigate-next" color="#fff" size={26} />
                    : <MaterialIcons name="keyboard-arrow-down" color="#fff" size={26} />
                }
            </Pressable>
            {expanded && <>{children}</>}
        </>
    );
};

export default ExpandComponent;




/* Esempio:

<ExpandComponent
    label={`Manutenzioni ${type} (${selectedMaintenances.length})`}
    labelStyle='text-primary text-xl font-bold mb-space xxl:mb-space-xxl'
>
    <CustomTable columns={columns} data={data} />
</ExpandComponent>

 */
