/**
 * Reproduz um som de gongo ("Ding-Dong") sem precisar de arquivo MP3 externo
 */
export function tocarGongoChamada(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    const tocarNota = (frequencia: number, inicioSeg: number, duracaoSeg: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequencia, ctx.currentTime + inicioSeg);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + inicioSeg);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicioSeg + duracaoSeg);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + inicioSeg);
      osc.stop(ctx.currentTime + inicioSeg + duracaoSeg);
    };

    // Notas classicas de painel de chamada: Sol (784Hz) -> Mi (659Hz)
    tocarNota(784, 0, 0.45);
    tocarNota(659, 0.35, 0.7);
  } catch (err) {
    console.warn('Áudio ainda não liberado pelo navegador:', err);
  }
}

/**
 * Fala em voz alta a senha e o guichê em Português (pt-BR)
 */
export function falarSenhaChamada(codigo: string, guicheNumero: number, prioritaria: boolean): void {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const tipoTexto = prioritaria ? 'Senha Prioritária' : 'Senha';
  const codigoSoletrado = codigo.replace('-', ' ').split('').join(' ');
  const frase = `${tipoTexto}, ${codigoSoletrado}. Dirigir-se ao Guichê ${guicheNumero}.`;

  const utterance = new SpeechSynthesisUtterance(frase);
  utterance.lang = 'pt-BR';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}
