import React, { useState } from 'react';
import { Text } from 'react-native';
import ConfirmExecutionReplacements from '../organisms/ConfirmExecutionReplacements';
import ConfirmExecutionForm, { type ConfirmExecutionFormData } from '../organisms/ConfirmExecutionForm';
import { useSelector } from 'react-redux';
import { selectUserOptions } from '@/features/users/usersSlice';
import { Maintenance } from '@/data/maintenences';
import { Task } from '@/data/tasks';
import { connectedUserID } from '@/data/connectedUserID';

const locationItems = [
  { label: 'In mare', value: 'In mare' },
  { label: 'In banchina', value: 'In banchina' },
  { label: 'In bacino', value: 'In bacino' },
];

const userTypeItems = [
  { label: 'Utente connesso', value: 'Utente connesso' },
  { label: 'Utente esterno', value: 'Utente esterno' },
];

export type ConfirmExecutionData = {
  replacementQuantityMap: { [replacementId: string]: number };
} & ConfirmExecutionFormData;

type ConfirmExecutionProps = {
  activity: Maintenance | Task;
  onConfirm: (confirmData: ConfirmExecutionData) => void;
};

const ConfirmExecution = ({ activity, onConfirm }: ConfirmExecutionProps) => {
  const userNames = useSelector(selectUserOptions);
  const [replacementQuantityMap, setReplacementQuantityMap] = useState<{ [replacementId: string]: number }>({});

  return (
    <>
      <Text className="text-primary font-bold text-lg mb-4">Sei sicuro di confermare la Manutenzione?</Text>

      {'replacements' in activity && activity.replacements.length > 0 && (
        <ConfirmExecutionReplacements
          replacements={activity.replacements}
          replacementQuantityMap={replacementQuantityMap}
          setReplacementQuantityMap={setReplacementQuantityMap}
        />
      )}

      <ConfirmExecutionForm
        locationItems={locationItems}
        userTypeItems={userTypeItems}
        userItems={userNames}
        connectedUser={connectedUserID}
        onConfirm={(formData) => onConfirm({ ...formData, replacementQuantityMap })}
      />
    </>
  );
};

export default ConfirmExecution;
