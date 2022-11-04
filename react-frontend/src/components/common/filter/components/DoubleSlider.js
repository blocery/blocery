import React from "react";
import styled from 'styled-components';
import ReactSlider from "react-slider";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {MAIN_COLOR_NAME} from '../FilterStore'


const StyledSlider = styled(ReactSlider)`
    width: 100%;
    height: 10px;
    z-index: 0;
`;

const StyledThumb = styled.div`
    width: ${getValue(20)};
    height: ${getValue(20)};
    text-align: center;
    background-color: ${color.white};
    border: 1px solid ${color[MAIN_COLOR_NAME]};
    border-radius: 50%;
    cursor: grab;
    top: 50%;
    transform: translateY(-58%);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.3);
    // border: 1px solid white;
`;

const Thumb = (props, state) => <StyledThumb {...props}></StyledThumb>;

const StyledTrack = styled.div`
    top: 0;
    bottom: 0;
    background: ${props => [0,2].includes(props.index) ? '#cecece' : color[MAIN_COLOR_NAME]};
    border-radius: 999px;
    height: 7px;
`;

const Track = (props, state) => <StyledTrack {...props} index={state.index} />;

// const StyledContainer = styled.div`
//     resize: horizontal;
//     overflow: auto;
//     width: 50%;
//     max-width: 100%;
//     padding-right: 8px;
// `;

const DoubleSlider = ({min, max, defaultValue, value, onChange}) => (
    <StyledSlider renderTrack={Track} renderThumb={Thumb} min={min} max={max}
                  defaultValue={defaultValue}
                  value={value}
                  step={1000} //1000원 단위로 스냅
                  onChange={onChange}  />

);
export default DoubleSlider