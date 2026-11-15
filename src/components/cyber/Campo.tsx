import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../style/theme';
import { Colchetes, Halo, Rotulo } from './index';

/**
 * Campo de texto do sistema.
 *
 * O foco acende: borda neon, halo e o prefixo `>` piscando de ciano para
 * neon. Num tema escuro a borda sozinha muda pouco, e o foco precisa ser
 * óbvio num tablet usado de pé.
 */
export function Campo({
  rotulo, valor, aoMudar, placeholder, icone, secreto, tipoTeclado,
  acessorio, multilinha, altura, className = '',
}: {
  rotulo?: string;
  valor: string;
  aoMudar: (v: string) => void;
  placeholder?: string;
  icone?: React.ComponentProps<typeof Ionicons>['name'];
  secreto?: boolean;
  tipoTeclado?: KeyboardTypeOptions;
  acessorio?: React.ReactNode;
  multilinha?: boolean;
  altura?: number;
  className?: string;
}) {
  const [focado, setFocado] = useState(false);
  const cor = focado ? theme.neon : theme.line;

  const corpo = (
    <View
      className={`flex-row items-center px-3 ${multilinha ? 'py-2' : ''}`}
      style={{
        borderWidth: 1,
        borderColor: cor,
        backgroundColor: focado ? theme.raised : theme.surface,
        height: multilinha ? undefined : 48,
        minHeight: multilinha ? (altura ?? 90) : undefined,
      }}
    >
      {icone && <Ionicons name={icone} size={16} color={focado ? theme.neon : theme.muted} />}
      <Text style={{ fontFamily: theme.mono, fontSize: 13, color: focado ? theme.neon : theme.cyan, marginHorizontal: 6 }}>
        {'>'}
      </Text>
      <TextInput
        className="flex-1"
        style={{
          fontFamily: theme.mono, fontSize: 14, color: theme.text,
          paddingVertical: multilinha ? 4 : 0,
          textAlignVertical: multilinha ? 'top' : 'center',
        }}
        value={valor}
        onChangeText={aoMudar}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        secureTextEntry={secreto}
        keyboardType={tipoTeclado}
        multiline={multilinha}
        autoCapitalize="none"
        selectionColor={theme.neon}
        cursorColor={theme.neon}
      />
      {acessorio}
      <Colchetes cor={focado ? 'neon' : 'muted'} tamanho={8} espessura={1} />
    </View>
  );

  return (
    <View className={className}>
      {!!rotulo && <View className="mb-1.5"><Rotulo cor={focado ? 'neon' : 'muted'}>{rotulo}</Rotulo></View>}
      {focado ? <Halo cor="neon" intensidade={0.8}>{corpo}</Halo> : corpo}
    </View>
  );
}

export default Campo;
