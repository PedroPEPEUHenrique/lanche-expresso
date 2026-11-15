import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { login, PrecisaEscolherEmpresa, EscolhaEmpresa } from '../services/authService';
import { useAuthStore, rotaInicial } from '../store/authStore';
import { theme } from '../style/theme';
import { Botao, Colchetes, Divisor, Fundo, Halo, Painel, Regua, Rotulo, Selo } from './cyber';
import { Campo } from './cyber/Campo';

const ROTULO_PAPEL: Record<string, string> = {
  gestor: 'Gestor', garcom: 'Garçom', cozinha: 'Cozinha',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [opcoes, setOpcoes] = useState<EscolhaEmpresa[] | null>(null);
  const { setAuth } = useAuthStore();

  // Quem já tem sessão é redirecionado pelo GuardaDeRota no layout raiz, não
  // aqui: um router.replace no efeito desta tela roda antes de o navegador
  // montar e estoura "Attempted to navigate before mounting the Root Layout".

  const entrar = async (idEmpresa?: number) => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Dados incompletos', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      const dados = await login(email.trim(), senha, idEmpresa);
      setAuth(dados);
      router.replace(rotaInicial(dados.papel) as any);
    } catch (err: any) {
      // Vínculo com mais de um restaurante: a API devolve a lista e o login
      // se repete com o escolhido.
      if (err instanceof PrecisaEscolherEmpresa) setOpcoes(err.empresas);
      else Alert.alert('Acesso negado', err.message || 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  if (opcoes) {
    return (
      <Fundo>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 px-6 pt-24">
            <Regua cor="cyan" />
            <Text className="mt-4" style={estilos.titulo}>SELECIONE A UNIDADE</Text>
            <View className="mt-1 mb-8">
              <Rotulo cor="muted">Acesso múltiplo detectado</Rotulo>
            </View>

            {opcoes.map((o, i) => (
              <TouchableOpacity
                key={o.idEmpresa}
                className="mb-3"
                onPress={() => { setOpcoes(null); entrar(o.idEmpresa); }}
                activeOpacity={0.8}
              >
                <Painel cor="cyan" className="px-4 py-4 flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text style={estilos.item}>{o.nome}</Text>
                    <View className="mt-1.5 flex-row">
                      <Selo cor="neon">{ROTULO_PAPEL[o.papel] ?? o.papel}</Selo>
                    </View>
                  </View>
                  <Text style={{ fontFamily: theme.mono, fontSize: 11, color: theme.muted, marginRight: 8 }}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.cyan} />
                </Painel>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setOpcoes(null)} className="items-center mt-6">
              <Rotulo cor="muted">{'<< voltar'}</Rotulo>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Fundo>
    );
  }

  return (
    <Fundo>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pt-20 pb-10">

            {/* Marca */}
            <View className="items-center mb-2">
              <Halo cor="neon" intensidade={1.4}>
                <View
                  className="items-center justify-center"
                  style={{ width: 76, height: 76, backgroundColor: theme.neon }}
                >
                  <Ionicons name="restaurant" size={38} color={theme.void} />
                  <Colchetes cor="neon" tamanho={14} espessura={3} />
                </View>
              </Halo>
            </View>

            <Text className="text-center mt-6" style={estilos.marca}>GESTÃO</Text>
            <Text className="text-center" style={estilos.marcaNeon}>DE SALÃO</Text>

            <View className="flex-row justify-center gap-x-2 mt-3">
              <Selo cor="cyan">sys::online</Selo>
              <Selo cor="magenta">v2.0</Selo>
            </View>

            <Divisor cor="cyan">autenticação</Divisor>

            <View className="gap-y-4 mt-2">
              <Campo
                rotulo="Identificação"
                icone="mail-outline"
                valor={email}
                aoMudar={setEmail}
                placeholder="voce@restaurante.com"
                tipoTeclado="email-address"
              />
              <Campo
                rotulo="Chave de acesso"
                icone="lock-closed-outline"
                valor={senha}
                aoMudar={setSenha}
                placeholder="••••••••"
                secreto={!mostrarSenha}
                acessorio={
                  <TouchableOpacity onPress={() => setMostrarSenha((s) => !s)} className="pl-2">
                    <Ionicons name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'} size={18} color={theme.muted} />
                  </TouchableOpacity>
                }
              />
            </View>

            <View className="mt-8">
              <Botao onPress={() => entrar()} carregando={carregando} icone="log-in-outline">
                Conectar
              </Botao>
            </View>

            {/* Não há criar conta: quem admite funcionário é o gestor. */}
            <View className="mt-8 items-center">
              <Rotulo cor="muted" tamanho={9}>sem credencial? solicite ao gestor</Rotulo>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Fundo>
  );
}

const estilos = {
  marca: {
    fontFamily: theme.mono, fontSize: 30, fontWeight: '700' as const,
    color: theme.text, letterSpacing: 8,
  },
  marcaNeon: {
    fontFamily: theme.mono, fontSize: 30, fontWeight: '700' as const,
    color: theme.neon, letterSpacing: 8,
  },
  titulo: {
    fontFamily: theme.mono, fontSize: 20, fontWeight: '700' as const,
    color: theme.text, letterSpacing: 2,
  },
  item: {
    fontFamily: theme.mono, fontSize: 15, fontWeight: '700' as const,
    color: theme.text, letterSpacing: 1,
  },
};
