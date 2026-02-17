import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { Link } from 'expo-router';


export type TreeNodeType = {
    id: string;
    name: string;
    macro: string;
    fullName: string;
    IconComponent?: React.ComponentType<any>; // Il tipo del componente dell'icona
    iconProps?: {
        name: string;
        size?: number;
        color?: string;
    };
    children: TreeNodeType[];

}

type TreeNodeProps = {
    id: string;
    name: string;
    macro: string;
    fullName: string;
    IconComponent?: React.ComponentType<any>; // Il tipo del componente dell'icona
    iconProps?: {
        name: string;
        size?: number;
        color?: string;
    };
    children: TreeNodeType[];
}

export default function TreeNode({ id, macro, name, fullName, IconComponent, iconProps, children }: TreeNodeProps) {
    const [expanded, setExpanded] = useState(false);
    // console.log(children)

    return (
        <View className="my-2.5 border-b-[1px] border-white">
            <View className='flex-row justify-between'>
                <Pressable onPress={() => setExpanded(!expanded)} className='flex-row'>
                    {expanded && <MaterialIcons name="navigate-next" color="#fff" size={22} />}
                    {!expanded && <MaterialIcons name="keyboard-arrow-down" color="#fff" size={22} />}
                    {IconComponent && <IconComponent size={24}  {...iconProps} className='ml-4 text-secondary' />}
                    <Text className="text-white ml-4">{fullName}</Text>
                </Pressable>
                <View className='flex-row '>
                    <Pressable className='mr-6'>
                        <Octicons name="bell-fill" color="#fff" size={22} />
                    </Pressable>
                    <Pressable className='mr-6'>
                        <Ionicons name="checkbox-sharp" color="#fff" size={22} />
                    </Pressable>
                    {children.length === 0 ? 
                    <Link className="text-primary" href={`./impianti/${id}`} >
                        <MaterialIcons name="navigate-next" color="#fff" size={22} />
                    </Link> : 
                    <MaterialIcons name="navigate-next" color="#fff" size={22} style={{ opacity: 0.2 }} />}

                </View>

            </View>

            {expanded && children.length > 0 && (
                <View className="ml-5 mt-2.5 ">
                    {children.map((child) => (
                        <TreeNode key={child.id} id={child.id} macro={child.macro} name={child.name} fullName={child.fullName} IconComponent={child.IconComponent} iconProps={child.iconProps} children={child.children} />
                    ))}
                </View>
            )}
        </View>
    );
};
