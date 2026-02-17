import { Link, Stack } from 'expo-router';
import { View,Text } from 'react-native';



export default function NotFoundScreen() {
  return (
    <>
    <Stack.Screen options={{ title: 'Oops!' }} />
    <View className='bg-primary flex-1 justify-center items-center'>
      <Text className='text-primary'>This screen does not exist.</Text>
      <Link href="/">
        <Text className='text-4xl  font-extrabold underline text-primary'>Go back to home screen!</Text>
      </Link>
    </View>
  </>
  );
}
