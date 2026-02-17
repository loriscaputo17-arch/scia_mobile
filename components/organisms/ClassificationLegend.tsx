import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SciaModal from '../molecules/SciaModal';
import { AntDesign } from '@expo/vector-icons';
import IconComponent from '@/components/atoms/IconComponent';
import { classifications } from '@/data/classifications';


export default function ClassificationLegend() {
    const [showLegend, setShowLegend] = useState(false);
    const leftClassifications = Object.values(classifications).slice(0, 5); // Prima metà
    const rightClassifications = Object.values(classifications).slice(5); // Seconda metà

    return (
        <>
            <TouchableOpacity className='flex flex-row items-center' onPress={() => setShowLegend(!showLegend)} >
                <Text className='font-bold opacity-[0.6] mr-2'>Classificazione</Text>
                <AntDesign name={"exclamationcircle"} size={16} color={'#666666'} />
            </TouchableOpacity>
            <SciaModal visible={showLegend} onClose={() => setShowLegend(false)} title={"Legenda classificazioni"} onCllickButton={() => setShowLegend(false)} buttonName='Chiudi'>
                <View className='flex-1 flex-row'>
                    <View className='flex flex-1'>
                        {leftClassifications.map((classification) => {
                            return (
                                <View className='flex-row items-center mt-4' key={classification.id}>
                                    <IconComponent iconCollection={classification.iconCollection} iconProps={classification.iconProps} />
                                    <Text className='text-primary text-lg font-bold ml-4'>{classification.label}</Text>
                                </View>)
                        })}
                    </View>
                    <View className='flex flex-1'>
                        {rightClassifications.map((classification, index) => {
                            return (
                                <View className='flex-row items-center mt-4' key={classification.id}>
                                    <IconComponent iconCollection={classification.iconCollection} iconProps={classification.iconProps} />
                                    <Text className={`text-primary text-lg font-bold ${index === 0 ? 'ml-6' : 'ml-4'}`}>{classification.label}</Text>
                                </View>)
                        })}
                    </View>
                </View>
            </SciaModal>
        </>
    );
}
