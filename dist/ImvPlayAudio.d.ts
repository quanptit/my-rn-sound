import { PureComponent } from 'react';
import { ImageRequireSource, ImageURISource, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { IPlaySoundComponent } from './AppPlaySoundUtils';
import { IPathUtilsModule } from "my-rn-base-utils";
interface Props {
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    /** Có thể là subPath hoặc Full URL*/
    audio?: string;
    PathUtils: IPathUtilsModule;
    isFromResourceDir?: boolean;
    voca?: string;
    audioImg?: ImageURISource | ImageURISource[] | ImageRequireSource;
    audioImgActive?: ImageURISource | ImageURISource[] | ImageRequireSource;
    imgWidth?: number;
    imgHeight?: number;
    isButton?: boolean;
    displayText?: string;
}
interface State {
    isPlaying: boolean;
}
export declare class ImvPlayAudio extends PureComponent<Props, State> implements IPlaySoundComponent {
    static defaultProps: {
        audioImg: any;
        audioImgActive: any;
        imgWidth: number;
        imgHeight: number;
    };
    private completeCallback;
    constructor(props: any);
    playAudio(completeCallback?: () => void): Promise<void>;
    render(): JSX.Element;
    private _renderContent;
    setPlayingState(isPlaying: boolean): void;
    componentWillUnmount(): void;
}
export {};
