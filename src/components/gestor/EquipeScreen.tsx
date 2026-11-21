import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listarEquipe, criarFuncionario, alterarPapel, alterarAtivo } from '../../services/gestaoService';
import { useAuthStore } from '../../store/authStore';
import { Funcionario, Papel } from '../../types';
import { theme } from '../../style/theme';
import { Botao, BotaoVazado, Cabecalho, Colchetes, Fundo, Rotulo, Selo } from '../cyber';
import { Campo } from '../cyber/Campo';
import { ModalBase } from './CardapioScreen';

const PAPEIS: { valor: Papel; rotulo: string; descricao: string; cor: 'neon' | 'cyan' | 'magenta' }[] = [
  { valor: 'gestor', rotulo: 'Gestor', descricao: 'Cardápio, equipe, caixa e relatórios', cor: 'neon' },
  { valor: 'garcom', rotulo: 'Garçom', descricao: 'Abre mesa, lança pedido, fecha conta', cor: 'cyan' },
  { valor: 'cozinha', rotulo: 'Cozinha', descricao: 'Vê a fila e avança o preparo', cor: 'magenta' },
];

const COR_PAPEL: Record<Papel, 'neon' | 'cyan' | 'magenta'> = {
  gestor: 'neon', garcom: 'cyan', cozinha: 'magenta',
};

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
  const idUsuarioLogado = useAuthStore((s) => s.user?.idUsuario);

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
    Alert.alert(`Papel de ${f.nome}`, 'O que esta pessoa faz no restaurante?', [
      ...PAPEIS.filter((p) => p.valor !== f.papel).map((p) => ({
        text: p.rotulo,
        onPress: async () => {
          try { await alterarPapel(f.idFuncionario, p.valor); await carregar(); }
          catch (e: any) { Alert.alert('Não foi possível', e.message ?? 'Tente novamente.'); }
        },
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
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
    if (!novo.nome.trim()) return Alert.alert('Dados incompletos', 'Informe o nome.');
    if (!novo.email.trim()) return Alert.alert('Dados incompletos', 'Informe o e-mail.');
    if (novo.senha.length < 6) return Alert.alert('Senha curta', 'A senha precisa de ao menos 6 caracteres.');

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
    } finally { setSalvando(false); }
  };

  if (carregando) {
    return (
      <Fundo><View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color={theme.neon} /></View></Fundo>
    );
  }

  const ativos = equipe.filter((f) => f.ativo).length;

  return (
    <Fundo>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Cabecalho
          titulo="Equipe"
          sub={`${ativos} ativo(s) de ${equipe.length}`}
          direita={
            <TouchableOpacity
              className="px-3 items-center justify-center"
              style={{ height: 40, backgroundColor: theme.neon }}
              onPress={() => setNovo({ nome: '', email: '', senha: '', papel: 'garcom' })}
            >
              <Text style={{ fontFamily: theme.mono, fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.void }}>
                + PESSOA
              </Text>
              <Colchetes cor="neon" tamanho={7} espessura={2} />
            </TouchableOpacity>
          }
        />

        <FlatList
          data={equipe}
          keyExtractor={(f) => String(f.idFuncionario)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); carregar(); }}
              tintColor={theme.neon} colors={[theme.neon]} progressBackgroundColor={theme.surface} />
          }
          renderItem={({ item }) => {
            const souEu = item.idUsuario === idUsuarioLogado;
            return (
              <View
                className="px-4 py-3"
                style={{
                  borderWidth: 1,
                  borderColor: item.ativo ? theme.line : 'rgba(42,47,74,0.5)',
                  backgroundColor: item.ativo ? theme.surface : 'transparent',
                  opacity: item.ativo ? 1 : 0.6,
                }}
              >
                <View className="flex-row items-center">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-x-2">
                      <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: theme.text }}>
                        {item.nome.toUpperCase()}
                      </Text>
                      {souEu && <Selo cor="cyan">você</Selo>}
                      {!item.ativo && <Selo cor="muted">desligado</Selo>}
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginTop: 3 }}>
                      {item.email}
                    </Text>
                  </View>

                  <TouchableOpacity className="mr-3" onPress={() => trocarPapel(item)} activeOpacity={0.8}>
                    <Selo cor={COR_PAPEL[item.papel]} solido>{item.papel}</Selo>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => trocarAcesso(item)} className="p-1">
                    <Ionicons
                      name={item.ativo ? 'power' : 'power-outline'}
                      size={20}
                      color={item.ativo ? theme.neon : theme.muted}
                    />
                  </TouchableOpacity>
                </View>
                <Colchetes cor={item.ativo ? 'muted' : 'muted'} tamanho={8} espessura={1} />
              </View>
            );
          }}
        />

        <ModalBase visivel={!!novo} aoFechar={() => setNovo(null)}>
          <Text style={{ fontFamily: theme.mono, fontSize: 16, fontWeight: '700', letterSpacing: 2, color: theme.text }}>
            NOVA CREDENCIAL
          </Text>

          <View className="gap-y-3 mt-4">
            <Campo rotulo="Nome" valor={novo?.nome ?? ''} placeholder="Bruno Silva"
              aoMudar={(v) => novo && setNovo({ ...novo, nome: v })} />
            <Campo rotulo="E-mail" valor={novo?.email ?? ''} placeholder="bruno@restaurante.com"
              tipoTeclado="email-address" aoMudar={(v) => novo && setNovo({ ...novo, email: v })} />
            <Campo rotulo="Senha inicial" valor={novo?.senha ?? ''} placeholder="mínimo 6 caracteres"
              aoMudar={(v) => novo && setNovo({ ...novo, senha: v })} />
          </View>

          <View className="mt-4 mb-2"><Rotulo cor="muted">nível de acesso</Rotulo></View>
          {PAPEIS.map((p) => {
            const ativo = novo?.papel === p.valor;
            const corSolida = p.cor === 'neon' ? theme.neon : p.cor === 'cyan' ? theme.cyan : theme.magenta;
            return (
              <TouchableOpacity
                key={p.valor}
                className="px-4 py-3 mb-2"
                style={{ borderWidth: 1, borderColor: ativo ? corSolida : theme.line, backgroundColor: ativo ? theme.raised : theme.surface }}
                onPress={() => novo && setNovo({ ...novo, papel: p.valor })}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-between">
                  <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 1, color: ativo ? corSolida : theme.text }}>
                    {p.rotulo.toUpperCase()}
                  </Text>
                  {ativo && <Ionicons name="checkmark-circle" size={18} color={corSolida} />}
                </View>
                <Text style={{ fontFamily: theme.mono, fontSize: 10, color: theme.muted, marginTop: 3 }}>
                  {p.descricao}
                </Text>
                {ativo && <Colchetes cor={p.cor} tamanho={9} espessura={1} />}
              </TouchableOpacity>
            );
          })}

          <View className="flex-row gap-x-3 mt-4">
            <View className="flex-1"><BotaoVazado cor="muted" onPress={() => setNovo(null)}>Cancelar</BotaoVazado></View>
            <View className="flex-1"><Botao onPress={salvar} carregando={salvando}>Criar</Botao></View>
          </View>
        </ModalBase>
      </SafeAreaView>
    </Fundo>
  );
}
