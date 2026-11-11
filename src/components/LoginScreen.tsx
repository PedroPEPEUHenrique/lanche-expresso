import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { login, PrecisaEscolherEmpresa, EscolhaEmpresa } from '../services/authService';
import { useAuthStore, rotaInicial } from '../store/authStore';
import { theme } from '../style/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focado, setFocado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [opcoes, setOpcoes] = useState<EscolhaEmpresa[] | null>(null);
  const { setAuth, token, papel } = useAuthStore();

  useEffect(() => {
    if (token) router.replace(rotaInicial(papel) as any);
  }, []);

  const entrar = async (idEmpresa?: number) => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setCarregando(true);
    try {
      const dados = await login(email.trim(), senha, idEmpresa);
      setAuth(dados);
      router.replace(rotaInicial(dados.papel) as any);
    } catch (err: any) {
      // Trabalha em mais de um restaurante: a API devolve a lista e o login
      // se repete com o escolhido.
      if (err instanceof PrecisaEscolherEmpresa) {
        setOpcoes(err.empresas);
      } else {
        Alert.alert('Não foi possível entrar', err.message || 'E-mail ou senha inválidos.');
      }
    } finally {
      setCarregando(false);
    }
  };

  if (opcoes) {
    return (
      <SafeArea>
        <View className="flex-1 px-8 pt-24">
          <Text className="text-2xl font-extrabold text-ink mb-1">Onde você vai trabalhar?</Text>
          <Text className="text-sm text-ink-soft mb-8">
            Você tem acesso a mais de um restaurante.
          </Text>
          {opcoes.map((o) => (
            <TouchableOpacity
              key={o.idEmpresa}
              className="border-2 border-ink rounded-2xl px-4 py-4 mb-3 bg-white flex-row items-center justify-between"
              onPress={() => { setOpcoes(null); entrar(o.idEmpresa); }}
              activeOpacity={0.85}
            >
              <View>
                <Text className="text-base font-bold text-ink">{o.nome}</Text>
                <Text className="text-xs text-ink-soft mt-0.5">{rotuloPapel(o.papel)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.ink} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setOpcoes(null)} className="items-center mt-4">
            <Text className="text-ink-soft font-semibold">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-8 pt-24 pb-10">
          <View className="items-center mb-2">
            <View className="w-16 h-16 rounded-2xl bg-brand border-2 border-ink items-center justify-center mb-4">
              <Ionicons name="restaurant" size={32} color={theme.ink} />
            </View>
          </View>
          <Text className="text-3xl font-extrabold text-ink text-center">Gestão de Salão</Text>
          <Text className="text-base text-ink-soft text-center mb-10 mt-1">
            Entre com sua conta de funcionário
          </Text>

          <View className="w-full gap-y-4">
            <Campo
              rotulo="E-mail" icone="mail-outline" valor={email} aoMudar={setEmail}
              focado={focado === 'email'} aoFocar={() => setFocado('email')} aoDesfocar={() => setFocado(null)}
              placeholder="voce@restaurante.com" tipoTeclado="email-address"
            />
            <Campo
              rotulo="Senha" icone="lock-closed-outline" valor={senha} aoMudar={setSenha}
              focado={focado === 'senha'} aoFocar={() => setFocado('senha')} aoDesfocar={() => setFocado(null)}
              placeholder="••••••••" secreto={!mostrarSenha}
              acessorio={
                <TouchableOpacity onPress={() => setMostrarSenha((s) => !s)}>
                  <Ionicons name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'} size={18} color={theme.inkMuted} />
                </TouchableOpacity>
              }
            />
          </View>

          <TouchableOpacity
            className="mt-10 bg-brand border-2 border-ink rounded-2xl h-14 items-center justify-center"
            activeOpacity={0.85}
            onPress={() => entrar()}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color={theme.ink} />
            ) : (
              <Text className="text-ink text-base font-bold tracking-wide">Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Não há "criar conta": quem admite funcionário é o gestor. */}
          <Text className="text-center text-xs text-ink-muted mt-6">
            Sem acesso? Peça ao gestor do restaurante para criar sua conta.
          </Text>
        </View>
      </ScrollView>
    </SafeArea>
  );
}

function SafeArea({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {children}
    </KeyboardAvoidingView>
  );
}

function Campo({
  rotulo, icone, valor, aoMudar, focado, aoFocar, aoDesfocar,
  placeholder, secreto, tipoTeclado, acessorio,
}: any) {
  return (
    <View>
      <Text className="text-sm font-semibold text-ink-soft mb-1.5">{rotulo}</Text>
      <View className={`flex-row items-center h-12 border-[1.5px] rounded-xl px-3 ${
        focado ? 'border-ink bg-brand-light' : 'border-ink bg-white'
      }`}>
        <Ionicons name={icone} size={18} color={focado ? theme.ink : theme.inkMuted} />
        <TextInput
          className="flex-1 ml-2 text-ink text-base"
          value={valor}
          onChangeText={aoMudar}
          onFocus={aoFocar}
          onBlur={aoDesfocar}
          placeholder={placeholder}
          placeholderTextColor={theme.inkMuted}
          secureTextEntry={secreto}
          keyboardType={tipoTeclado}
          autoCapitalize="none"
        />
        {acessorio}
      </View>
    </View>
  );
}

function rotuloPapel(papel: string): string {
  return { gestor: 'Gestor', garcom: 'Garçom', cozinha: 'Cozinha' }[papel] ?? papel;
}
