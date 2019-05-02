import React, {PureComponent, ReactChild} from 'react'
import {NativeEventEmitter, NativeModules, StyleProp, ViewStyle} from 'react-native'
import BtnPausePlay from "./BtnPausePlay"
import SeekBarAudioPlayer from "./SeekBarAudioPlayer"
import Sound from "../../RNSound";
import {RenderUtils} from "my-rn-base-component/dist/utils/RenderUtils";
import {PreferenceUtils} from "my-rn-base-utils";
import {PureComponentSkipFunction, Row, Touchable, ComboBox} from "my-rn-base-component";
import {ManagerOneAudioPlayer} from "../../ManagerOneAudioPlayer";

export interface AudioPlayControlRenderUtilsProps {
    renderPlayBtn: (style?) => ReactChild,
    renderSeekbarAudioPlayer: (style?) => ReactChild,
    renderLoopBtn: () => ReactChild,
    renderSpeedBtn: () => ReactChild
}

interface Props {
    //audio phải là full path
    audio: string
    autoPlay?: boolean
    // seconds
    duration?: number
    showLoopBtn?: boolean
    showSpeedBtn?: boolean
    delay?: number
    callbackStart?: (audioPlayer: AudioPlayControl) => void
    disableAutoReleaseSound?: boolean
    /** Nếu có sẽ tiếp tục sử dụng cái Sound này thay vì tạo mới */
    currentSound?: Sound,
    style?: StyleProp<ViewStyle>
    overrideRender?: (params: AudioPlayControlRenderUtilsProps) => ReactChild
    // true => Player sẽ có thể vẫn play khi có cái khác play đè lên
    skipManagerOneAudioPlayer?: boolean
}

interface State {
    loopButton?: { color: string }
}

export class AudioPlayControl extends PureComponentSkipFunction <Props, State> {
    static defaultProps = {showLoopBtn: true};
    btnPlay: BtnPausePlay;
    seekBarPlayer: SeekBarAudioPlayer;
    currentSound: Sound;
    private audio: string;
    private PlayerStateChange: any;
    private currentSpeed: any;
    private timeInterval: number;
    private loopState: boolean;

    //region ======== life ======
    constructor(props) {
        super(props);
        this.state = {loopButton: this.getLoopState(false)};

        this.audio = this.props.audio;
        this.currentSound = this.props.currentSound;
    }

    async componentDidMount() {
        if (this.props.showLoopBtn) {
            this.loopState = await PreferenceUtils.getBooleanSetting("LOOP_STATE", true);
            this.setState({loopButton: this.getLoopState(this.loopState)});
        }
        if (this.props.autoPlay) {
            setTimeout(() => {
                if (this.currentSound) return;
                this.initAndPlayAudio()
            }, this.props.delay || 1)
        } else {
            if (this.props.duration)
                this.updateState(this.props.duration);
            if (this.currentSound) {
                this.releaseAudio(false);
                this.updateStateSoundToUIAndStartTracking();
            }
        }
    }

    updateStateSoundToUIAndStartTracking() {
        this.updateState(this.currentSound.getDuration(), "playing");
        const myModule = new NativeEventEmitter(NativeModules.RNSound);
        this.PlayerStateChange = myModule.addListener('PlayerStateChange', this._PlayerStateChange.bind(this));
        this._startTimerCheckCurrentTime();
    }

    componentWillUnmount() {
        ManagerOneAudioPlayer.unregisterAudioPlayer(this);
        this.releaseAudio(!this.props.disableAutoReleaseSound)
    }

    initAndPlayAudio() {
        console.log("AudioPlayControl: ", this.props.audio);
        if (!this.props.skipManagerOneAudioPlayer)
            ManagerOneAudioPlayer.startPlayAudio(this);
        this.props.callbackStart && this.props.callbackStart(this);
        this._stopTimerCheckCurrentTime();
        const myModule = new NativeEventEmitter(NativeModules.RNSound);
        this.PlayerStateChange = myModule.addListener('PlayerStateChange', this._PlayerStateChange.bind(this));
        this.currentSound = new Sound(this.props.audio, null, (error, props) => {
            console.log("Prepare complete: ", error, props);
            if (error) {
                console.log('failed to load the sound', error);
                return
            }
            if (this.currentSound == undefined) return;
            if (this.currentSpeed != undefined)
                this.currentSound.setSpeed(this.currentSpeed);
            this.updateState(this.currentSound.getDuration());
            this.currentSound.play();
        });
        this._startTimerCheckCurrentTime();
    }

    releaseAudio(releaseSound) {
        this.btnPlay && this.btnPlay.updateState("stopped");
        this._stopTimerCheckCurrentTime();
        if (this.PlayerStateChange) {
            this.PlayerStateChange.remove();
            this.PlayerStateChange = null;
        }
        if (releaseSound && this.currentSound) {
            this.currentSound.release();
            this.currentSound = null;
        }
    }

    //endregion

    /**
     * state: buffering, playing, stopped, error, paused, complete
     * */
    updateState(duration: number, state?: string) {
        if (this.btnPlay && this.loopState && state === "complete" && this.currentSound) {
            this.currentSound.setCurrentTime(0);
            this.currentSound.play();
            return
        }
        if (duration)
            this.seekBarPlayer && this.seekBarPlayer.updateState(duration);
        if (state)
            this.btnPlay && this.btnPlay.updateState(state);
    }

    _PlayerStateChange(data) {
        let state = data.state;
        console.log("AudioPlayControl _PlayerStateChange", state);
        this.updateState(null, state);
    }

    _seekValueChange(value) {
        this.currentSound.setCurrentTime(value);
    }

    btnPlayPauseClick() {
        if (!this.currentSound) {
            this.initAndPlayAudio();
            return
        }
        if (this.btnPlay && this.btnPlay.state.statePlayer === "playing") {
            this.currentSound && this.currentSound.pause()
        } else {
            this.currentSound && this.currentSound.play()
        }
    }

    playAudio() {
        if (!this.currentSound) {
            this.initAndPlayAudio();
            return;
        }
        if (this.btnPlay && this.btnPlay.state.statePlayer === "playing") {
        } else {
            this.currentSound && this.currentSound.play();
        }
    }

    //region timer check current time =====
    _startTimerCheckCurrentTime() {
        this._stopTimerCheckCurrentTime();
        this.timeInterval = setInterval(() => {
            if (!this.currentSound) {
                this._stopTimerCheckCurrentTime();
                return
            }
            this.currentSound.getCurrentTime((error, currentTime) => {
                if (error || !this.seekBarPlayer) {
                    this._stopTimerCheckCurrentTime();
                    return
                }
                this.seekBarPlayer.updateCurrentTime(currentTime)
            })
        }, 1000)
    }

    _stopTimerCheckCurrentTime() {
        console.log("_stopTimerCheckCurrentTime")
        this.timeInterval && clearInterval(this.timeInterval)
    }

    //endregion ==================

    render() {
        if (this.props.overrideRender)
            return this.props.overrideRender({
                    renderPlayBtn: this._renderPlayBtn.bind(this),
                    renderSeekbarAudioPlayer: this._renderSeekbarAudioPlayer.bind(this),
                    renderLoopBtn: this._renderLoopBtn.bind(this),
                    renderSpeedBtn: this._renderSpeedBtn.bind(this)
                }
            );
        return this._renderDefault();
    }

    _renderDefault() {
        return (
            <Row style={this.props.style} dial={4}>
                {this._renderPlayBtn()}
                {this._renderSeekbarAudioPlayer({marginLeft: 6, flex: 1})}
                {this._renderLoopBtn()}
                {this._renderSpeedBtn()}
            </Row>
        )
    }

    _renderPlayBtn(style?) {
        return (
            <BtnPausePlay ref={(ref) => {this.btnPlay = ref}} style={style} onPress={this.btnPlayPauseClick.bind(this)}/>
        )
    }

    _renderSeekbarAudioPlayer(style) {
        return (
            <SeekBarAudioPlayer ref={(ref) => {this.seekBarPlayer = ref}} style={style}
                                onValueChange={this._seekValueChange.bind(this)}/>
        )
    }

    //region Loop ======
    btnLoopClick() {
        this.loopState = !this.loopState;
        PreferenceUtils.saveBooleanSetting("LOOP_STATE", this.loopState);
        this.setState({loopButton: this.getLoopState(this.loopState)});
    }

    private getLoopState(isLoop: boolean) {
        if (this.props.showLoopBtn)
            return {color: isLoop ? "#cc4f00" : "gray"};
        return undefined;
    }

    _renderLoopBtn() {
        if (this.props.showLoopBtn) {
            return <Touchable style={{justifyContent: "center", alignItems: "center", paddingLeft: 10, paddingRight: 10}}
                              onPress={this.btnLoopClick.bind(this)}>
                {RenderUtils.renderIcon("md-repeat", 25, this.state.loopButton.color)}
            </Touchable>
        }
        return undefined
    }

    //endregion

    //region ==== Speed ====
    cbSpeed: ComboBox;

    _selectSpeedChange(indexSelected) {
        switch (indexSelected) {
            case 0: //1.3x
                if (isNULL(this.currentSound))
                    this.currentSpeed = 1.3;
                else
                    this.currentSound.setSpeed(1.3);
                break;
            case 1: //1x
                if (isNULL(this.currentSound))
                    this.currentSpeed = 1;
                else
                    this.currentSound.setSpeed(1);
                break;
            case 2: //0.8x
                if (isNULL(this.currentSound))
                    this.currentSpeed = 0.8;
                else
                    this.currentSound.setSpeed(0.8);
                break;
            case 3: //0.7x
                if (isNULL(this.currentSound))
                    this.currentSpeed = 0.7;
                else
                    this.currentSound.setSpeed(0.7);
                break;
            case 4: //0.6x
                if (isNULL(this.currentSound))
                    this.currentSpeed = 0.6;
                else
                    this.currentSound.setSpeed(0.6);
                break;
            case 5: //0.5x
                if (isNULL(this.currentSound))
                    this.currentSpeed = 0.5;
                else
                    this.currentSound.setSpeed(0.5);
                break;
            default:
                break
        }
    }

    _renderSpeedBtn() {
        if (!this.props.showSpeedBtn || !NativeModules.RNSound.IsEnableSpeed) return undefined;
        return <ComboBox listData={["1.3x", "1x", "0.8x", "0.7x", "0.6x", "0.5x"]}
                         style={{width: 50, borderWidth: 0, height: 30}}
                         indexSelected={1}
                         selectedChange={this._selectSpeedChange.bind(this)}/>
    }

    //endregion
}

const isNULL = function (data) { return data == undefined};
