import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ViewStyle, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../style/theme';

/**
 * Vocabulário visual do app: maximalismo, futurismo e cyberpunk.
 *
 * Existe como peça única porque o estilo é denso — cantos em colchete, halo,
 * scanline, rótulo técnico — e repetir essa camada em onze telas garantiria
 * que elas divergissem. Aqui a decisão é tomada uma vez.
 */

type Cor = 'neon' | 'cyan' | 'magenta' | 'danger' | 'muted';

const CORES: Record<Cor, { solido: string; fraco: string; medio: string }> = {
  neon: { solido: theme.neon, fraco: theme.neonFraco, medio: theme.neonMedio },
  cyan: { solido: theme.cyan, fraco: theme.cyanFraco, medio: theme.cyanMedio },
  magenta: { solido: theme.magenta, fraco: theme.magentaFraco, medio: theme.magentaFraco },
  danger: { solido: theme.danger, fraco: theme.dangerFraco, medio: theme.dangerFraco },
  muted: { solido: theme.muted, fraco: theme.linhaFraca, medio: theme.linhaFraca },
};

/**
 * Halo neon.
 *
 * O Android não desenha sombra colorida — `elevation` é sempre cinza e
 * `shadowColor` é ignorado fora do iOS. Então o brilho é construído com duas
 * camadas de borda translúcida por trás do conteúdo, o que dá o mesmo efeito
 * nas duas plataformas e não custa nada em desempenho.
 */
export function Halo({ cor = 'neon', intensidade = 1, raio = 0, children, style }: {
  cor?: Cor; intensidade?: number; raio?: number;
  children: React.ReactNode; style?: ViewStyle;
}) {
  const c = CORES[cor];
  return (
    <View style={style}>
      <View pointerEvents="none" style={[
        StyleSheet.absoluteFillObject,
        { borderWidth: 6 * intensidade, borderColor: c.fraco, borderRadius: raio + 6, margin: -6 * intensidade },
      ]} />
      <View pointerEvents="none" style={[
        StyleSheet.absoluteFillObject,
        { borderWidth: 2 * intensidade, borderColor: c.medio, borderRadius: raio + 2, margin: -2 * intensidade },
      ]} />
      {children}
    </View>
  );
}

/**
 * Colchetes nos quatro cantos.
 *
 * Substituem o canto arredondado: o React Native não tem clip-path, então o
 * chanfro diagonal que o estilo pede sairia caro em SVG. O colchete entrega a
 * mesma leitura de "quadro técnico" com quatro Views.
 */
export function Colchetes({ cor = 'neon', tamanho = 12, espessura = 2 }: {
  cor?: Cor; tamanho?: number; espessura?: number;
}) {
  const c = CORES[cor].solido;
  const base: ViewStyle = { position: 'absolute', width: tamanho, height: tamanho };
  return (
    <>
      <View pointerEvents="none" style={[base, { top: -1, left: -1, borderTopWidth: espessura, borderLeftWidth: espessura, borderColor: c }]} />
      <View pointerEvents="none" style={[base, { top: -1, right: -1, borderTopWidth: espessura, borderRightWidth: espessura, borderColor: c }]} />
      <View pointerEvents="none" style={[base, { bottom: -1, left: -1, borderBottomWidth: espessura, borderLeftWidth: espessura, borderColor: c }]} />
      <View pointerEvents="none" style={[base, { bottom: -1, right: -1, borderBottomWidth: espessura, borderRightWidth: espessura, borderColor: c }]} />
    </>
  );
}

/** Rótulo técnico: caixa alta, monoespaçada, espaçamento largo. */
export function Rotulo({ children, cor = 'muted', tamanho = 10, className = '' }: {
  children: React.ReactNode; cor?: Cor; tamanho?: number; className?: string;
}) {
  return (
    <Text
      className={className}
      style={{
        fontFamily: theme.mono, fontSize: tamanho, letterSpacing: 2,
        color: CORES[cor].solido, textTransform: 'uppercase', fontWeight: '700',
      }}
    >
      {children}
    </Text>
  );
}

/** Número grande em monoespaçada — total, saldo, contagem. */
export function Numero({ children, cor = 'neon', tamanho = 28 }: {
  children: React.ReactNode; cor?: Cor; tamanho?: number;
}) {
  return (
    <Text style={{ fontFamily: theme.mono, fontSize: tamanho, color: CORES[cor].solido, fontWeight: '700', letterSpacing: -0.5 }}>
      {children}
    </Text>
  );
}

/**
 * Painel: a unidade de conteúdo.
 *
 * Borda fria por padrão, neon quando em destaque, mais colchetes e halo
 * opcionais. A densidade de camadas é intencional — é o maximalismo.
 */
export function Painel({
  cor = 'muted', halo = false, colchetes = true, cabecalho, children, className = '', style,
}: {
  cor?: Cor; halo?: boolean; colchetes?: boolean;
  cabecalho?: React.ReactNode; children?: React.ReactNode;
  className?: string; style?: ViewStyle;
}) {
  const corpo = (
    <View
      className={className}
      style={[{ backgroundColor: theme.surface, borderWidth: 1, borderColor: CORES[cor].solido }, style]}
    >
      {cabecalho && (
        <View
          className="flex-row items-center justify-between px-3 py-2"
          style={{ backgroundColor: theme.raised, borderBottomWidth: 1, borderBottomColor: CORES[cor].solido }}
        >
          {cabecalho}
        </View>
      )}
      {children}
      {colchetes && <Colchetes cor={cor} />}
    </View>
  );
  return halo ? <Halo cor={cor}>{corpo}</Halo> : corpo;
}

/** Selo/etiqueta angular. `solido` preenche com a cor e inverte o texto. */
export function Selo({ children, cor = 'cyan', solido = false }: {
  children: React.ReactNode; cor?: Cor; solido?: boolean;
}) {
  const c = CORES[cor].solido;
  return (
    <View
      className="px-2 py-1"
      style={{ borderWidth: 1, borderColor: c, backgroundColor: solido ? c : 'transparent' }}
    >
      <Text style={{
        fontFamily: theme.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: '700',
        color: solido ? theme.void : c, textTransform: 'uppercase',
      }}>
        {children}
      </Text>
    </View>
  );
}

/** Botão principal: preenchido em neon, texto escuro, halo. */
export function Botao({ children, onPress, cor = 'neon', icone, carregando, desabilitado, className = '' }: {
  children: React.ReactNode; onPress?: () => void; cor?: Cor;
  icone?: React.ComponentProps<typeof Ionicons>['name'];
  carregando?: boolean; desabilitado?: boolean; className?: string;
}) {
  const c = CORES[cor].solido;
  return (
    <Halo cor={cor} intensidade={desabilitado ? 0 : 1}>
      <TouchableOpacity
        className={`h-14 items-center justify-center flex-row gap-x-2 ${className}`}
        style={{ backgroundColor: desabilitado ? theme.raised : c, borderWidth: 1, borderColor: c, opacity: desabilitado ? 0.5 : 1 }}
        onPress={onPress}
        disabled={desabilitado || carregando}
        activeOpacity={0.8}
      >
        {carregando ? (
          <ActivityIndicator color={theme.void} />
        ) : (
          <>
            {icone && <Ionicons name={icone} size={20} color={theme.void} />}
            <Text style={{ fontFamily: theme.mono, fontSize: 15, fontWeight: '700', letterSpacing: 2, color: theme.void, textTransform: 'uppercase' }}>
              {children}
            </Text>
          </>
        )}
        <Colchetes cor={cor} tamanho={10} espessura={2} />
      </TouchableOpacity>
    </Halo>
  );
}

/** Botão secundário: contorno, fundo vazado. */
export function BotaoVazado({ children, onPress, cor = 'cyan', icone, carregando, className = '' }: {
  children: React.ReactNode; onPress?: () => void; cor?: Cor;
  icone?: React.ComponentProps<typeof Ionicons>['name'];
  carregando?: boolean; className?: string;
}) {
  const c = CORES[cor].solido;
  return (
    <TouchableOpacity
      className={`h-12 items-center justify-center flex-row gap-x-2 ${className}`}
      style={{ borderWidth: 1, borderColor: c, backgroundColor: theme.surface }}
      onPress={onPress}
      disabled={carregando}
      activeOpacity={0.75}
    >
      {carregando ? <ActivityIndicator color={c} /> : (
        <>
          {icone && <Ionicons name={icone} size={18} color={c} />}
          <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', letterSpacing: 1.5, color: c, textTransform: 'uppercase' }}>
            {children}
          </Text>
        </>
      )}
      <Colchetes cor={cor} tamanho={8} espessura={1} />
    </TouchableOpacity>
  );
}

/**
 * Cabeçalho de tela: título grande, linha técnica abaixo, régua neon.
 *
 * A régua de blocos é ornamento deliberado — é o que separa este estilo de um
 * tema escuro comum.
 */
export function Cabecalho({ titulo, sub, direita }: {
  titulo: string; sub?: string; direita?: React.ReactNode;
}) {
  return (
    <View style={{ backgroundColor: theme.void, borderBottomWidth: 1, borderBottomColor: theme.line }}>
      <Regua />
      <View className="px-4 pt-3 pb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text style={{
            fontFamily: theme.mono, fontSize: 24, fontWeight: '700',
            color: theme.text, letterSpacing: 1, textTransform: 'uppercase',
          }}>
            {titulo}
          </Text>
          {!!sub && (
            <View className="flex-row items-center gap-x-1.5 mt-1">
              <View style={{ width: 6, height: 6, backgroundColor: theme.cyan }} />
              <Rotulo cor="muted" tamanho={10}>{sub}</Rotulo>
            </View>
          )}
        </View>
        {direita}
      </View>
    </View>
  );
}

/** Régua de blocos neon decrescentes. Ornamento futurista puro. */
export function Regua({ cor = 'neon' }: { cor?: Cor }) {
  const c = CORES[cor].solido;
  return (
    <View className="flex-row items-end" style={{ height: 3 }}>
      {[1, 0.85, 0.6, 0.4, 0.25, 0.15, 0.08].map((o, i) => (
        <View key={i} style={{ flex: i + 1, height: 3, backgroundColor: c, opacity: o }} />
      ))}
      <View style={{ flex: 12 }} />
    </View>
  );
}

/**
 * Scanlines: linhas horizontais translúcidas sobre o fundo.
 *
 * `pointerEvents="none"` é essencial — sem isso a camada engoliria todo toque
 * da tela abaixo dela.
 */
export function Scanlines({ linhas = 60, opacidade = 0.5 }: { linhas?: number; opacidade?: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { opacity: opacidade }]}>
      {Array.from({ length: linhas }).map((_, i) => (
        <View key={i} style={{ height: 1, marginBottom: 3, backgroundColor: 'rgba(255,255,255,0.025)' }} />
      ))}
    </View>
  );
}

/** Fundo padrão de tela: void mais scanlines. */
export function Fundo({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1" style={{ backgroundColor: theme.void }}>
      <Scanlines />
      {children}
    </View>
  );
}

/** Divisor técnico com texto no meio: `── // RÓTULO ──`. */
export function Divisor({ children, cor = 'muted' }: { children?: React.ReactNode; cor?: Cor }) {
  return (
    <View className="flex-row items-center gap-x-2 my-3">
      <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
      {!!children && (
        <Text style={{ fontFamily: theme.mono, fontSize: 9, letterSpacing: 2, color: CORES[cor].solido, textTransform: 'uppercase' }}>
          // {children}
        </Text>
      )}
      <View style={{ flex: 1, height: 1, backgroundColor: theme.line }} />
    </View>
  );
}

/** Linha de dado: rótulo técnico à esquerda, valor monoespaçado à direita. */
export function LinhaDado({ rotulo, valor, cor = 'text' }: {
  rotulo: string; valor: string; cor?: Cor | 'text';
}) {
  const c = cor === 'text' ? theme.text : CORES[cor].solido;
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Rotulo cor="muted" tamanho={10}>{rotulo}</Rotulo>
      <Text style={{ fontFamily: theme.mono, fontSize: 13, fontWeight: '700', color: c }}>{valor}</Text>
    </View>
  );
}

/** Estado vazio com moldura técnica. */
export function Vazio({ icone, titulo, texto }: {
  icone: React.ComponentProps<typeof Ionicons>['name']; titulo: string; texto?: string;
}) {
  return (
    <View className="items-center px-10 mt-20">
      <Halo cor="cyan" intensidade={0.6}>
        <View className="items-center justify-center" style={{ width: 72, height: 72, borderWidth: 1, borderColor: theme.cyan, backgroundColor: theme.surface }}>
          <Ionicons name={icone} size={32} color={theme.cyan} />
          <Colchetes cor="cyan" tamanho={10} />
        </View>
      </Halo>
      <Text className="mt-5" style={{ fontFamily: theme.mono, fontSize: 14, fontWeight: '700', letterSpacing: 2, color: theme.text, textTransform: 'uppercase' }}>
        {titulo}
      </Text>
      {!!texto && (
        <Text className="text-center mt-2" style={{ fontFamily: theme.mono, fontSize: 11, lineHeight: 18, color: theme.muted }}>
          {texto}
        </Text>
      )}
    </View>
  );
}

export { CORES };
export type { Cor };
