import { useLocalSearchParams } from 'expo-router';
import NovoPedidoScreen from '../../../components/salao/NovoPedidoScreen';

export default function NovoPedido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NovoPedidoScreen idComanda={Number(id)} />;
}
