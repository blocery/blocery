import React from "react";
import styled, {css} from "styled-components";
import ReactSlider from "react-slider";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";


const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 10px;
    z-index: 0;
`;

const StyledThumb = styled.div`
    width: ${getValue(35)};
    height: ${getValue(35)};
    text-align: center;
    background-color: ${color.green};
    color: ${color.white};
    border-radius: 50%;
    cursor: grab;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    // border: 1px solid white;
`;

const thumbActiveClassName = css`
    background-color: black;
`

const Thumb = (props, state) => <StyledThumb {...props}>{state.valueNow || ''}</StyledThumb>;
const ThumbNoLabel = (props, state) => <StyledThumb {...props}></StyledThumb>;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background: ${props => props.index === 0 ? color.secondary : color.green};
    border-radius: 999px;
    height: 10px;
`;

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;
function Slider({value = 0, onChange, disabled, thumbLabel = true}) {
    // const [rate, setRate] = useState(value)
    // const onSliderChange = (value) => {
    //     setRate(value)
    //     onChange(value)
    // }


    return(
        <StyledSlider
            value={value}
            renderTrack={Track}
            renderThumb={thumbLabel ? Thumb : ThumbNoLabel}
            onChange={onChange}
            // disabled={false}
            // snapDragDisabled={true}
            // thumbActiveClassName={'p-3'}
        />
    )
}

export default Slider