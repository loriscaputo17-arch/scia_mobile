import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { usePathname } from 'expo-router';

const formatRouteName = (routeSegments: string[]) => {
  return routeSegments
    .map(segment => 
      segment
        .replace(/_/g, ' ')     // Sostituisce '_' con spazi
        .toLowerCase()          // Converte tutto il testo in minuscolo prima di capitalizzare il primo carattere
        .replace(/^\w/, c => c.toUpperCase()) // Capitalizza solo il primo carattere del segmento
    );
};

const PathNavigation = () => {
  const pathname = usePathname();  // Ottiene l'intero percorso URL

  // Divide il percorso per estrarre i segmenti (slug)
  const routeSegments = pathname.split('/').filter(Boolean);

  const paths = formatRouteName(routeSegments);

  return (
    // <View className='flex-1 flex-col p-space xxl:p-space-xxl'>
    <View className='flex flex-row items-center p-space xxl:p-space-xxl self-start w-auto'>
        <Feather size={20} color="#789fd6" name='home' />
        {paths.map((path, index) => (
          <Text key={index} className="text-primary text-base">
            {index === paths.length - 1 ? ` ${path}` : ` ${path} > `}
          </Text>
        ))}
      </View>
    // </View>
  );
};

export default PathNavigation;
