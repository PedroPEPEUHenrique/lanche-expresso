import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listarEquipe, criarFuncionario, alterarPapel, alterarAtivo } from '../../services/gestaoService';
import { useAuthStore } from '../../store/authStore';
import { Funcionario, Papel } from '../../types';
import { theme } from '../../style/theme';

const PAPEIS: { valor: Papel; rotulo: string; descricao: string }[] = [
  { valor: 'gestor', rotulo: 'Gestor', descricao: 'Cardápio, equipe, caixa e relatórios' },
  { valor: 'garcom', rotulo: 'Garçom', descricao: 'Abre mesa, lança pedido e fecha a conta' },
  { valor: 'cozinha', rotulo: 'Cozinha', descricao: 'Vê a fila e avança o preparo' },
];

const ROTULO: Record<Papel, string> = { gestor: 'Gestor', garcom: 'Garçom', cozinha: 'Cozinha' };

/**
 * Equipe do restaurante.
 *
 * As travas que importam estão na API — ninguém muda o próprio papel nem se
 * desliga, e o último gestor não pode deixar de ser gestor. A tela só traduz
 * as mensagens, em vez de duplicar a regra e correr o risco de divergir.
 */
export default function EquipeScreen() {
  const [equipe, setEquipe] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [novo, setNovo] = useState<{ nome: string; email: string; senha: string; papel: Papel } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const idFuncionarioLogado = useAuthStore((s) => s.user?.id);

  const carregar = useCallback(async () => {
    try {
      setEquipe(await listarEquipe());
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível carregar a equipe');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const trocarPapel = (f: Funcionario) => {
    Alert.alert(`Papel de ${f.nome}`, 'O que esta pessoa faz no restaurante?',
      [
        ...PAPEIS.filter((p) => p.valor !== f.papel).map((p) => ({
          text: p.rotulo,
          onPress: async () => {
            try { await alterarPapel(f.idFuncionario, p.valor); await carregar(); }
            catch (e: any) { Alert.alert('Não foi possível', e.message ?? 'Tente novamente.'); }
          },
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]
    );
  };

  const trocarAcesso = (f: Funcionario) => {
    const desligando = f.ativo;
    Alert.alert(
      desligando ? `Desligar ${f.nome}?` : `Reativar ${f.nome}?`,
      desligando
        ? 'A pessoa perde o acesso ao app. O histórico de vendas dela é preservado.'
        : 'A pessoa volta a conseguir entrar com a mesma senha.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: desligando ? 'Desligar' : 'Reativar',
          style: desligando ? 'destructive' : 'default',
          onPress: async () => {
            try { await alterarAtivo(f.idFuncionario, !f.ativo); await carregar(); }
            catch (e: any) { Alert.alert('Não foi possível', e.message ?? 'Tente novamente.'); }
          },
        },
      ]
    );
  };

  const salvar = async () => {
    if (!novo) return;
    if (!novo.nome.trim()) return Alert.alert('Atenção', 'Informe o nome.');
    if (!novo.email.trim()) return Alert.alert('Atenção', 'Informe o e-mail.');
    if (novo.senha.length < 6) return Alert.alert('Atenção', 'A senha precisa de ao menos 6 caracteres.');

    setSalvando(true);
    try {
      await criarFuncionario({
        nome: novo.nome.trim(), email: novo.email.trim().toLowerCase(),
        senha: novo.senha, papel: novo.papel,
      });
      setNovo(null);
      await carregar();
    } catch (e: any) {
      Alert.alert('Erro ao criar', e.message ?? 'Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={theme.ink} />
      </SafeAreaView>
    );
  }

  const ativos = equipe.filter((f) => f.ativo).length;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-5 pt-2 pb-4 border-b border-ink flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-ink">Equipe</Text>
          <Text className="text-sm text-ink-soft mt-0.5">
            {ativos} ativo(s) de {equipe.length}
          </Text>
        </View>
        <TouchableOpacity
          className="px-3 py-2 rounded-full border border-ink bg-brand"
          onPress={() => setNovo({ nome: '', email: '', senha: '', papel: 'garcom' })}
        >
          <Text className="text-xs font-bold text-ink">+ Pessoa</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={equipe}
        keyExtractor={(f) => String(f.idFuncionario)}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }} tintColor={theme.ink} />
        }
        renderItem={({ item }) => {
          const souEu = item.idUsuario === idFuncionarioLogado;
          return (
            <View className={`flex-row items-center px-5 py-3 border-b border-ink ${item.ativo ? 'bg-white' : 'bg-brand-light'}`}>
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-x-2">
                  <Text className={`text-base font-semibold ${item.ativo ? 'text-ink' : 'text-ink-muted'}`}>
                    {item.nome}
                  </Text>
                  {souEu && (
                    <View className="px-2 py-0.5 rounded-full border border-ink">
                      <Text className="text-[10px] font-bold text-ink">VOCÊ</Text>
                    </View>
                  )}
                  {!item.ativo && (
                    <View className="px-2 py-0.5 rounded-full border border-ink-muted">
                      <Text className="text-[10px] font-bold text-ink-muted">DESLIGADO</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-ink-soft mt-0.5" numberOfLines={1}>{item.email}</Text>
              </View>

              <TouchableOpacity
                className="px-3 py-1.5 rounded-full border-2 border-ink bg-brand mr-2"
                onPress={() => trocarPapel(item)}
                activeOpacity={0.8}
              >
                <Text className="text-[11px] font-bold text-ink">{ROTULO[item.papel]}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => trocarAcesso(item)} className="p-1">
                <Ionicons
                  name={item.ativo ? 'power' : 'power-outline'}
                  size={20}
                  color={item.ativo ? theme.ink : theme.inkMuted}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal visible={!!novo} transparent animationType="slide" onRequestClose={() => setNovo(null)}>
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="bg-white rounded-t-3xl border-t-2 border-ink p-5 pb-8">
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text className="text-lg font-extrabold text-ink mb-4">Nova pessoa na equipe</Text>

              <Campo rotulo="Nome" valor={novo?.nome ?? ''} placeholder="Bruno Silva"
                aoMudar={(v: string) => novo && setNovo({ ...novo, nome: v })} />
              <Campo rotulo="E-mail" valor={novo?.email ?? ''} placeholder="bruno@restaurante.com"
                tipoTeclado="email-address"
                aoMudar={(v: string) => novo && setNovo({ ...novo, email: v })} />
              <Campo rotulo="Senha inicial" valor={novo?.senha ?? ''} placeholder="mínimo 6 caracteres"
                aoMudar={(v: string) => novo && setNovo({ ...novo, senha: v })} />

              <Text className="text-sm font-semibold text-ink-soft mb-1.5 mt-1">Papel</Text>
              {PAPEIS.map((p) => (
                <TouchableOpacity
                  key={p.valor}
                  className={`border-2 border-ink rounded-2xl px-4 py-3 mb-2 ${novo?.papel === p.valor ? 'bg-brand' : 'bg-white'}`}
                  onPress={() => novo && setNovo({ ...novo, papel: p.valor })}
                  activeOpacity={0.8}
                >
                  <Text className="text-sm font-bold text-ink">{p.rotulo}</Text>
                  <Text className="text-[11px] text-ink-soft mt-0.5">{p.descricao}</Text>
                </TouchableOpacity>
              ))}

              <View className="flex-row gap-x-3 mt-3">
                <TouchableOpacity
                  className="flex-1 border-2 border-ink rounded-2xl h-12 items-center justify-center bg-white"
                  onPress={() => setNovo(null)}
                >
                  <Text className="text-base font-bold text-ink">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-brand border-2 border-ink rounded-2xl h-12 items-center justify-center"
                  onPress={salvar} disabled={salvando}
                >
                  {salvando ? <ActivityIndicator color={theme.ink} /> : (
                    <Text className="text-base font-bold text-ink">Criar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function Campo({ rotulo, valor, aoMudar, placeholder, tipoTeclado }: any) {
  const [focado, setFocado] = useState(false);
  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold text-ink-soft mb-1.5">{rotulo}</Text>
      <View className={`border-[1.5px] rounded-xl px-3 ${focado ? 'border-ink bg-brand-light' : 'border-ink bg-white'}`}>
        <TextInput
          className="text-ink text-base h-12"
          value={valor} onChangeText={aoMudar}
          onFocus={() => setFocado(true)} onBlur={() => setFocado(false)}
          placeholder={placeholder} placeholderTextColor={theme.inkMuted}
          keyboardType={tipoTeclado} autoCapitalize="none"
        />
      </View>
    </View>
  );
}
