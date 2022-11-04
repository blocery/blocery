import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {Flex, GridColumns} from "~/styledComponents/shared";
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {BsBackspace} from "react-icons/bs"
import {color} from "~/styledComponents/Properties";
const NumberItem = styled(Flex)`
    justify-content: center;
    height: 18vmin;
    max-height: ${getValue(145)};
    font-size: ${getValue(45)};
    font-weight: ${700};    
    cursor: pointer;
    background-color: ${color.white};
    
    &:active {
        background-color: ${color.dark};
        color: white;
    }
`;
const NumberItemNon = styled(Flex)`
    justify-content: center;
    height: 18vmin;
    max-height: ${getValue(145)};
    font-size: ${getValue(23)};
    font-weight: ${700};
`;
class NumPadContent extends React.Component {

    render() {
        return (
            <Fragment>
                <GridColumns repeat={3} colGap={'1px'} rowGap={'1px'} bg={'veryLight'}>
                    <NumberItem onClick={() => this.props.onKeyPress('7')}>{'7'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('8')}>{'8'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('9')}>{'9'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('4')}>{'4'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('5')}>{'5'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('6')}>{'6'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('1')}>{'1'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('2')}>{'2'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('3')}>{'3'}</NumberItem>
                    <NumberItem onClick={() => this.props.onKeyPress('0')}>{'0'}</NumberItem>
                    <NumberItemNon
                        // onClick={() => this.props.onKeyPress('.')}
                    >{''}</NumberItemNon>
                    <NumberItem onClick={() => this.props.onKeyPress('<')}><BsBackspace size={40}/></NumberItem>
                </GridColumns>
            </Fragment>
        );
    }
}

NumPadContent.propTypes = {
    onKeyPress: PropTypes.func.isRequired
};

export default NumPadContent;
