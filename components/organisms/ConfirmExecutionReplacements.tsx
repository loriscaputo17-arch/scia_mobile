import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import SelectReplacement from './SelectReplacement';
import { selectReplacementMap } from '@/features/replacements/replacementsSlice';

type ConfirmExecutionReplacementsProps = {
    replacements: string[];  // Array di replacement IDs
    replacementQuantityMap: { [replacementId: string]: number }; // Quantità per ogni replacement
    setReplacementQuantityMap: (newMap: { [replacementId: string]: number }) => void; // Funzione per aggiornare le quantità
};

const ConfirmExecutionReplacements = ({ replacements, replacementQuantityMap, setReplacementQuantityMap }: ConfirmExecutionReplacementsProps) => {

    const replacementsData = useSelector(selectReplacementMap);

    const handleSelectReplacement = (replacementId: string, quantity: number) => {
        // Crea una nuova copia dell'oggetto aggiornato
        const updatedMap = {
            ...replacementQuantityMap,
            [replacementId]: quantity,
        };

        setReplacementQuantityMap(updatedMap);
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-40">
            <View className="flex-row w-full h-full">
                {/* {replacements.map(renderReplacement)} */}
                {replacements.map((replacementId) => {
                    const replacement = replacementsData[replacementId];
                    if (!replacement) return null;

                    const quantity = replacementQuantityMap[replacementId] || 0;
                    return (
                        <SelectReplacement
                            key={replacementId}
                            replacement={replacement}
                            quantity={quantity}
                            onSelect={(newQuantity) => handleSelectReplacement(replacementId, newQuantity)}
                        />
                    )
                })}
            </View>
        </ScrollView>
    );
};

export default ConfirmExecutionReplacements;
