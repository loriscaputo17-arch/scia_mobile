import { View, Text, ScrollView, ImageSourcePropType, Image } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../atoms/Button';
import { type HistoryEntry } from '@/data/history';
import { formatISODate } from '@/app/utils/utils';
import { type Users } from '@/data/users';
import AudioPlayer from '../molecules/AudioPlayer';
import { getImageSource } from '@/app/utils/getImageSource';


type AudioNotesHistoryProps = {
    history: HistoryEntry[];
    users: Users;
};

export default function AudioNotesHistory({ history, users }: AudioNotesHistoryProps) {

    return (
        <ScrollView>
            {history.map( (h, hIndex) => {
                const user = users[h.user];
                if (h.audioNotes)
                    return (
                        <View key={hIndex} className='mb-6'>
                            {h.audioNotes.map((audioNote, audioIndex) => (
                                <View className='flex-row mb-space items-center' key={audioIndex}>
                                    {!!user.profileImage && <Image source={getImageSource(user.profileImage)} className="w-20 h-20 rounded-full" />}
                                    {audioNote ? 
                                        <AudioPlayer audioSrc={audioNote.audioSrc} audioDate={audioNote ? audioNote.date : undefined} />
                                        :
                                        <View className='ml-space'>
                                            <Text className='text-primary text-base font-bold'>Nessuna nota audio</Text>
                                            <Text className="text-secondary font-bold">{formatISODate(new Date().toISOString())}</Text>
                                        </View>
                                    }
                                </View>
                            ))}
                        </View>
                    )

            })}
        </ScrollView>
    );
}
