/// <reference types="react" />
import { StyleProp, ViewStyle } from 'react-native';
import { ComponentUpdateOnlyState } from "my-rn-base-component";
interface Props {
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}
interface State {
    statePlayer: string;
}
export default class BtnPausePlay extends ComponentUpdateOnlyState<Props, State> {
    constructor(props: any);
    /**
     * state: buffering, playing, stopped, error, paused, complete
     * */
    updateState(statePlayer: string): void;
    render(): JSX.Element;
    private _renderSpinner;
}
export {};
