import { ReactChild } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import BtnPausePlay from "./BtnPausePlay";
import SeekBarAudioPlayer from "./SeekBarAudioPlayer";
import Sound from "../../RNSound";
import { PureComponentSkipFunction, ComboBox } from "my-rn-base-component";
export interface AudioPlayControlRenderUtilsProps {
    renderPlayBtn: (style?: any) => ReactChild;
    renderSeekbarAudioPlayer: (style?: any) => ReactChild;
    renderLoopBtn: () => ReactChild;
    renderSpeedBtn: () => ReactChild;
}
interface Props {
    audio: string;
    autoPlay?: boolean;
    duration?: number;
    showLoopBtn?: boolean;
    showSpeedBtn?: boolean;
    delay?: number;
    callbackStart?: (audioPlayer: AudioPlayControl) => void;
    disableAutoReleaseSound?: boolean;
    /** Nếu có sẽ tiếp tục sử dụng cái Sound này thay vì tạo mới */
    currentSound?: Sound;
    style?: StyleProp<ViewStyle>;
    overrideRender?: (params: AudioPlayControlRenderUtilsProps) => ReactChild;
}
interface State {
    loopButton?: {
        color: string;
    };
}
export declare class AudioPlayControl extends PureComponentSkipFunction<Props, State> {
    static defaultProps: {
        showLoopBtn: boolean;
    };
    btnPlay: BtnPausePlay;
    seekBarPlayer: SeekBarAudioPlayer;
    currentSound: Sound;
    private audio;
    private PlayerStateChange;
    private currentSpeed;
    private timeInterval;
    private loopState;
    constructor(props: any);
    componentDidMount(): Promise<void>;
    updateStateSoundToUIAndStartTracking(): void;
    componentWillUnmount(): void;
    initAndPlayAudio(): void;
    releaseAudio(releaseSound: any): void;
    /**
     * state: buffering, playing, stopped, error, paused, complete
     * */
    updateState(duration: number, state?: string): void;
    _PlayerStateChange(data: any): void;
    _seekValueChange(value: any): void;
    btnPlayPauseClick(): void;
    playAudio(): void;
    _startTimerCheckCurrentTime(): void;
    _stopTimerCheckCurrentTime(): void;
    render(): string | number | JSX.Element;
    _renderDefault(): JSX.Element;
    _renderPlayBtn(style?: any): JSX.Element;
    _renderSeekbarAudioPlayer(style: any): JSX.Element;
    btnLoopClick(): void;
    private getLoopState;
    _renderLoopBtn(): JSX.Element;
    cbSpeed: ComboBox;
    _selectSpeedChange(indexSelected: any): void;
    _renderSpeedBtn(): JSX.Element;
}
export {};
