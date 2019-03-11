/// <reference types="react" />
import { StyleProp, ViewStyle } from 'react-native';
import { ComponentUpdateOnlyState } from "my-rn-base-component";
interface Props {
    onValueChange: (value: any) => void;
    style?: StyleProp<ViewStyle>;
}
interface State {
    duration: number;
    value: number;
}
export default class SeekBarAudioPlayer extends ComponentUpdateOnlyState<Props, State> {
    constructor(props: any);
    updateCurrentTime(current: any): void;
    updateState(duration: number): void;
    render(): JSX.Element;
}
export {};
