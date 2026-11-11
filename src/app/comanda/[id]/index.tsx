import { useLocalSearchParams } from 'expo-router';
import ComandaScreen from '../../../components/salao/ComandaScreen';

export default function Comanda() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ComandaScreen idComanda={Number(id)} />;
}
