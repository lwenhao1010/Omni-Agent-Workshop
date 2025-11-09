import { message } from 'antd';
import { Base64 } from 'js-base64';
import { getTtsSign } from '@/services/chat';

// 类型定义
interface ExperienceConfig {
  language?: string;
  isDIY?: boolean;
  isDialect?: boolean;
  speed?: number;
  voice?: number;
  pitch?: number;
  text?: string;
  engineType?: string;
  tte?: string;
  voiceName?: string;
  defaultText?: string;
  close?: () => void;
  isAIPartner?: boolean;
  useTtsSignV2?: boolean;
  emotion?: number;
}

interface SetConfigParams {
  speed?: number;
  voice?: number;
  pitch?: number;
  text?: string;
  defaultText?: string;
  engineType?: string;
  voiceName?: string;
  isDIY?: boolean;
  isDialect?: boolean;
  language?: string;
  tte?: string;
  emotion?: number;
  isAIPartner?: boolean;
  useTtsSignV2?: boolean;
}

interface WebSocketParams {
  common?: {
    app_id: string;
    uid: string;
  };
  business?: {
    aue: string;
    auf: string;
    ent: string;
    pitch: number;
    tte: string;
    vcn: string;
    volume: number;
    speed: number;
  };
  data?: {
    status: number;
    text: string;
  };
  header?: {
    app_id: string;
    uid: string;
    did: string;
    imei: string;
    imsi: string;
    mac: string;
    net_type: string;
    net_isp: string;
    status: number;
    request_id: null;
    res_id: string;
  };
  parameter?: {
    tts: {
      vcn: string;
      speed: number;
      volume: number;
      pitch: number;
      bgs: number;
      reg: number;
      rdn: number;
      rhy: number;
      scn?: number;
      emotion?: number;
      LanguageID?: number;
      style?: string;
      audio: {
        encoding: string;
        sample_rate: number;
        channels: number;
        bit_depth: number;
        frame_size: number;
      };
      pybuf: {
        encoding: string;
        compress: string;
        format: string;
      };
    };
  };
  payload?: {
    text: {
      encoding: string;
      compress: string;
      format: string;
      status: number;
      seq: number;
      text: string;
    };
  };
}

interface WebSocketResponse {
  code?: number;
  message?: string;
  header?: {
    status: number;
  };
  payload?: {
    audio?: {
      audio: string;
    };
  };
  data?: {
    audio: string;
  };
}

export interface TtsSignResponse {
  appId: string;
  authorization: string;
  url: string;
}

const DEFAULT_TEXT =
  '科大讯飞成立于1999年，是中国先进的智能化语音技术提供商。我们提供的语音合成效果，达到了真正可商用的标准，您可以在这里输入任意文本进行语音合成体验。';

const NOT_SUPPORT_TIP = '当前浏览器不支持该功能，请换个浏览器试试';

let audioCtx: AudioContext | null = null;
let source: AudioBufferSourceNode | null = null;

class Experience {
  private speed: number;
  private voice: number;
  private pitch: number;
  private text: string;
  private defaultText: string;
  private engineType: string;
  private tte: string;
  private voiceName: string;
  private isDialect: boolean;
  private language: string;
  private playState: string;
  private audioDatas: Float32Array[];
  private rawAudioData: number[];
  private audioBuffer: AudioBuffer | undefined;
  private close: (() => void) | undefined;
  private websocket: WebSocket | null = null;
  private audioDatasIndex: number = 0;
  private playTimeout: NodeJS.Timeout | undefined;
  private flag: boolean = false;

  constructor({
    speed = 2,
    voice = 7,
    pitch = 7,
    text = '',
    engineType = 'intp65',
    voiceName = 'x4_EnUs_Gavin',
    isDialect = false,
    tte = 'UTF8',
    language = 'cn',
    defaultText = '',
    close,
  }: ExperienceConfig = {}) {
    this.speed = speed;
    this.voice = voice;
    this.pitch = pitch;
    this.text = text;
    this.defaultText = defaultText;
    this.engineType = engineType;
    this.voiceName = voiceName;
    this.isDialect = isDialect;
    this.tte = tte;
    this.language = language;
    this.playState = '';
    this.audioDatas = [];
    this.rawAudioData = [];
    this.close = close;
  }

  setConfig({
    speed,
    voice,
    pitch,
    text,
    defaultText,
    engineType,
    voiceName,
    isDialect,
    tte,
    language,
  }: SetConfigParams): void {
    speed !== undefined && (this.speed = speed);
    voice !== undefined && (this.voice = voice);
    pitch !== undefined && (this.pitch = pitch);
    text && (this.text = text);
    defaultText && (this.defaultText = defaultText);
    engineType && (this.engineType = engineType);
    voiceName && (this.voiceName = voiceName);
    isDialect !== undefined && (this.isDialect = isDialect);
    tte && (this.tte = tte);
    language && (this.language = language);
    this.resetAudio();
  }

  onmessageWork(e: MessageEvent): void {
    switch (e.data.command) {
      case 'newAudioData': {
        this.audioDatas.push(e.data.data);
        if (this.playState === 'ttsing' && this.audioDatas.length === 1) {
          this.playTimeout = setTimeout(() => {
            if (this.playState === 'unTTS') {
              this.resetAudio();
              return;
            }
            this.audioPlay();
          }, 1000) as NodeJS.Timeout;
        }
        break;
      }
      default:
        break;
    }
  }

  // 获取音频
  getAudio(): void {
    const self = this;
    const form = new FormData();
    form.append('text', self.text);
    form.append(
      'tts',
      self.voiceName.includes('x5_once_clone_') ? 'x5_clone' : self.voiceName
    );
    getTtsSign(form)
      .then((result: TtsSignResponse) => {
        const appId = result.appId;
        const url = result.url.replace('https://', 'wss://');
        this.connectWebsocket(url, appId);
      })
      .catch(err => {
        message.info(err.desc || '合成体验签名获取失败');
        this.resetAudio();
        this.close?.();
      });
  }

  // websocket连接
  connectWebsocket(url: string, appId: string): void {
    if ('WebSocket' in window) {
      this.websocket = new WebSocket(url);
    } else if ('MozWebSocket' in window) {
      this.websocket = new (
        window as unknown as { MozWebSocket: typeof WebSocket }
      ).MozWebSocket(url);
    } else {
      message.info(NOT_SUPPORT_TIP);
      return;
    }

    const self = this;
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      if (this.playState === 'unTTS') {
        this.resetAudio();
        return;
      }

      let params: WebSocketParams = {};

      params = {
        header: {
          app_id: appId,
          uid: '',
          did: '',
          imei: '',
          imsi: '',
          mac: '',
          net_type: 'wifi',
          net_isp: 'CMCC',
          status: 2,
          request_id: null,
          res_id: self.voiceName.includes('x5_once_clone_')
            ? self.voiceName.replace('x5_once_clone_', '')
            : '',
        },
        parameter: {
          tts: {
            vcn: self.voiceName.includes('x5_once_clone_')
              ? 'x5_clone'
              : self.voiceName,
            speed: self.speed,
            volume: 50,
            pitch: self.pitch || 50,
            bgs: 0,
            reg: 0,
            rdn: 0,
            rhy: 0,
            scn: self.voiceName.includes('x5_once_clone_') ? undefined : 0,
            audio: {
              encoding: 'raw',
              sample_rate: 16000,
              channels: 1,
              bit_depth: 16,
              frame_size: 0,
            },
            pybuf: {
              encoding: 'utf8',
              compress: 'raw',
              format: 'plain',
            },
          },
        },
        payload: {
          text: {
            encoding: 'utf8',
            compress: 'raw',
            format: 'plain',
            status: 2,
            seq: 0,
            text: self.encodeText(
              self.text || self.defaultText || DEFAULT_TEXT
            ) as string,
          },
        },
      };

      if (self.voiceName.includes('x5_once_clone_') && params.parameter?.tts) {
        params.parameter.tts.LanguageID = 0;
        params.parameter.tts.audio.sample_rate = 16000;
      }

      const hasStyleVcn = [
        'x4_lingfeichen',
        'x4_lingxiaoqi',
        'x4_lingfeizhe',
        'x4_EnUs_Luna',
        'x4_EnUs_Gavin',
        'x4_lingxiaoqi_em_v2',
      ];

      if (hasStyleVcn.indexOf(self.voiceName) > -1 && params.parameter?.tts) {
        params.parameter.tts.style = 'assistant';
      }

      this.websocket?.send(JSON.stringify(params));
      this.playTimeout = setTimeout(() => {
        this.playSource();
      }, 1500) as NodeJS.Timeout;
    };

    this.websocket.onmessage = (e: MessageEvent) => {
      const jsonData: WebSocketResponse = JSON.parse(e.data);
      let audioData = jsonData?.payload?.audio?.audio;
      if (audioData) {
        const s16 = this.base64ToS16(audioData);
        const f32 = this.transS16ToF32(s16);
        this.audioDatas.push(f32);

        // 收到第一个音频块立即开始播放，减少延迟
        if (this.audioDatas.length === 1) {
          clearTimeout(this.playTimeout);
          // 短延迟确保AudioContext准备好
          this.playTimeout = setTimeout(() => {
            this.playSource();
          }, 100) as NodeJS.Timeout;
        }
      }
      // 合成结束
      if (jsonData?.header?.status === 2) {
        this.websocket?.close();
      }
    };

    this.websocket.onerror = (e: Event) => {
      console.log(e);
      this.close?.();
    };

    this.websocket.onclose = (e: CloseEvent) => {
      console.log(e);
    };
  }

  // 编码文本
  encodeText(text: string, encoding?: string): string | ArrayBuffer {
    switch (encoding) {
      case 'utf16le': {
        const buf = new ArrayBuffer(text.length * 4);
        const bufView = new Uint16Array(buf);
        for (let i = 0, strlen = text.length; i < strlen; i++) {
          bufView[i] = text.charCodeAt(i);
        }
        return buf;
      }
      case 'buffer2Base64': {
        let binary = '';
        const bytes = new Uint8Array(text as any);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          const byte = bytes[i];
          if (byte !== undefined) {
            binary += String.fromCharCode(byte);
          }
        }
        return window.btoa(binary);
      }
      case 'base64&utf16le': {
        return this.encodeText(
          this.encodeText(text, 'utf16le') as string,
          'buffer2Base64'
        ) as string;
      }
      default: {
        return Base64.encode(text);
      }
    }
  }

  resetAudio(): void {
    this.audioPause();
    this.audioDatasIndex = 0;
    this.audioDatas = [];
    this.websocket && this.websocket.close();
    clearTimeout(this.playTimeout);
  }

  audioPlay(): void {
    this.resetAudio();
    source && source.stop();
    if (source?.buffer) source = null;

    try {
      if (!audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtx = new AudioContextClass();
        audioCtx.resume();
      }
      if (!audioCtx) {
        message.info(NOT_SUPPORT_TIP);
        return;
      }
    } catch (e) {
      message.info(NOT_SUPPORT_TIP);
      return;
    }

    this.audioDatasIndex = 0;
    this.playState = 'play';
    this.getAudio();
  }

  audioPause(state?: string): void {
    if (this.playState === 'play') {
      clearTimeout(this.playTimeout);
      try {
        this.playState = 'stop';
        this.audioDatasIndex = 0;
        this.audioDatas = [];
        this.websocket && this.websocket.close();
        source && source.stop();
      } catch (e) {
        console.log(e);
      }
    }
  }

  async playSource(): Promise<void> {
    let bufferLength = 0;
    const dataLength = this.audioDatas.length;

    for (let i = this.audioDatasIndex; i < dataLength; i++) {
      const audioData = this.audioDatas[i];
      if (audioData) {
        bufferLength += audioData.length;
      }
    }

    if (!audioCtx) return;

    const audioBuffer = audioCtx.createBuffer(1, bufferLength, 16000);
    let offset = 0;

    for (let i = this.audioDatasIndex; i < dataLength; i++) {
      const audioData = this.audioDatas[i];
      if (audioData) {
        audioBuffer.copyToChannel(audioData, 0, offset);
        offset += audioData.length;
        this.audioDatasIndex++;
      }
    }

    source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    if (this.flag) return;

    source.start();
    source.onended = () => {
      if (this.playState !== 'play') {
        this.close?.();
        return;
      }
      // 首先检查是否还有未播放的音频数据
      if (this.audioDatasIndex < this.audioDatas.length) {
        // 还有数据，继续播放
        setTimeout(() => {
          if (this.playState === 'play') {
            this.playSource();
          }
        }, 50);
      } else if (this.websocket?.readyState === WebSocket.OPEN) {
        // 没有更多数据但WebSocket还开着，等待新数据
        setTimeout(() => {
          if (this.playState === 'play') {
            this.playSource();
          }
        }, 100);
      } else {
        // 没有更多数据且WebSocket已关闭，播放完毕
        this.close?.();
        this.audioPause('endPlay');
      }
    };
  }

  transToAudioData(
    audioDataStr: string,
    fromRate: number = 16000,
    toRate: number = 22505
  ): void {
    let outputS16 = this.base64ToS16(audioDataStr);
    let output = this.transS16ToF32(outputS16);
    output = this.transSamplingRate(output, fromRate, toRate);
    const outputArray = Array.from(output);

    this.audioDatas.push(...(outputArray as any));
    this.rawAudioData.push(...Array.from(outputS16));
  }

  transSamplingRate(
    data: Float32Array,
    fromRate: number = 44100,
    toRate: number = 16000
  ): Float32Array {
    const fitCount = Math.round(data.length * (toRate / fromRate));
    const newData = new Float32Array(fitCount);

    if (data.length === 0 || fitCount === 0) {
      return newData;
    }

    const springFactor = (data.length - 1) / (fitCount - 1);

    if (data[0] !== undefined) {
      newData[0] = data[0];
    }

    for (let i = 1; i < fitCount - 1; i++) {
      const tmp = i * springFactor;
      const before = Math.floor(tmp);
      const after = Math.ceil(tmp);
      const atPoint = tmp - before;

      const beforeValue = data[before];
      const afterValue = data[after];

      if (beforeValue !== undefined && afterValue !== undefined) {
        newData[i] = beforeValue + (afterValue - beforeValue) * atPoint;
      }
    }

    if (data.length > 0 && fitCount > 0) {
      const lastValue = data[data.length - 1];
      if (lastValue !== undefined) {
        newData[fitCount - 1] = lastValue;
      }
    }

    return newData;
  }

  base64ToS16(base64AudioData: string): Int16Array {
    const decodedData = atob(base64AudioData);
    const outputArray = new Uint8Array(decodedData.length);

    for (let i = 0; i < decodedData.length; ++i) {
      outputArray[i] = decodedData.charCodeAt(i);
    }

    return new Int16Array(new DataView(outputArray.buffer).buffer);
  }

  transS16ToF32(input: Int16Array): Float32Array {
    const tmpData: number[] = [];

    for (let i = 0; i < input.length; i++) {
      const value = input[i];
      if (value !== undefined) {
        const d = value < 0 ? value / 0x8000 : value / 0x7fff;
        tmpData.push(d);
      }
    }
    return new Float32Array(tmpData);
  }
}

export default Experience;
