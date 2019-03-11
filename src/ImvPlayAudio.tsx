import React, {PureComponent} from 'react'
import {ImageRequireSource, ImageURISource, StyleProp, Image, StyleSheet, ViewStyle, TextStyle} from 'react-native'
import {AppPlaySoundUtils, IPlaySoundComponent} from './AppPlaySoundUtils'
import {isEmpty, IPathUtilsModule} from "my-rn-base-utils";
import {Row, TextCustom, Touchable} from "my-rn-base-component";

interface Props {
    style?: StyleProp<ViewStyle>
    textStyle?: StyleProp<TextStyle>
    /** Có thể là subPath hoặc Full URL*/
    audio: string
    PathUtils: IPathUtilsModule
    isFromResourceDir?: boolean
    voca?: string, // Nếu không có audio thì chọn voca này để play theo TTS
    audioImg?: ImageURISource | ImageURISource[] | ImageRequireSource
    audioImgActive?: ImageURISource | ImageURISource[] | ImageRequireSource
    imgWidth?: number
    imgHeight?: number
    isButton?: boolean
    displayText?: string
}

interface State {
    isPlaying: boolean
}

export class ImvPlayAudio extends PureComponent<Props, State> implements IPlaySoundComponent {
    //region variable + default props
    static defaultProps = {
        audioImg: require('../../assets/audio_large_ic.png'),
        audioImgActive: require('../../assets/audio_large_ic_active.png'),
        imgWidth: 35,
        imgHeight: 35
    };
    private completeCallback: () => void;

    constructor(props) {
        super(props);
        this.state = {isPlaying: false};
    }

    //endregion

    async playAudio(completeCallback?: () => void) {
        this.completeCallback = completeCallback;
        let audioPath = this.props.audio;
        if (!isEmpty(audioPath)) {
            if (!this.props.isFromResourceDir)
                audioPath = await this.props.PathUtils.getPathOnlineOrOffline(this.props.audio);
            AppPlaySoundUtils.playAudioOrUsingTTS(this, audioPath, this.props.voca, this.props.isFromResourceDir);
        }
    }

    render() {
        if (this.props.isButton) {
            return (
                <Touchable onPress={() => this.playAudio()}>
                    {this._renderContent()}
                </Touchable>
            )
        }
        return this._renderContent()
    }

    private _renderContent() {
        let displayText = this.props.displayText;
        return (
            <Row dial={5} style={this.props.style}>
                <Image
                    source={this.state.isPlaying === true ? this.props.audioImgActive : this.props.audioImg}
                    resizeMode="contain"
                    style={{width: this.props.imgWidth, height: this.props.imgHeight}}/>
                {displayText && <TextCustom style={[styles.text, this.props.textStyle]} value={displayText}/>}
            </Row>
        )
    }

    setPlayingState(isPlaying: boolean) {
        this.setState({isPlaying: isPlaying});
        if (!isPlaying && this.completeCallback) {
            this.completeCallback();
            this.completeCallback = undefined
        }
    }

    componentWillUnmount() {
        this.completeCallback = undefined;
        AppPlaySoundUtils.removeComponent(this);
    }
}

const styles = StyleSheet.create({
    text: {marginLeft: 8, fontSize: 20, fontStyle: "italic", color: "#008dcc"}
});
