import { View, Text, ScrollView, Image, ImageSourcePropType } from 'react-native'
import React from 'react'
import { getImageSource } from '@/app/utils/getImageSource'

type InstructionsProps = {
    text: string,
    images: ImageSourcePropType[],
}


export default function Instructions({ text, images }: InstructionsProps) {
    return (
        <ScrollView>
            <ScrollView horizontal>
                <View className='flex-row gap-space xxl:gap-space-xxl py-8'>
                    {images.map((img, index) => (
                        <Image source={getImageSource(img)} key={index} className="w-24 h-24 rounded-md" />
                    ))}
                </View>
            </ScrollView>
            <Text className='text-primary text-xl py-8'>{text || 'Non ci sono istruzioni disponibili per questa attività.'}</Text>
        </ScrollView>
    )
}