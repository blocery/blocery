import React,{Fragment} from 'react'
import {Div, Button, Space, Input, Right, Flex} from "~/styledComponents/shared";
import NumPadContent from './NumPadContent';
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";

class NumberPad extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.changeValue = this.changeValue.bind(this);
    }

    changeValue(numText) {
        let value = this.state.value;

        if (numText === '<') {
            value = value.slice(0, -1);
            if (!value) {
                value = '0';
            }
        } else if (numText === '.') {
            if (value.indexOf('.') === -1) {
                value += numText;
            }
        } else {
            if (value === '0') {
                value = '';
            }
            value += numText;
        }

        if (value.indexOf('.') !== -1) {
            value = value.substring(0, value.indexOf('.') + 3); // for upto 2 decimal places
        }

        this.setState({ value });
    }

    onInputFinished = () => {
        this.props.onChange(this.state.value);
    }

    render() {
        return (
            <Fragment>
                <Flex mb={5} px={25} bc={'#babfc7'} fontSize={60} py={25} justifyContent={'center'}>
                    {this.state.value}개
                </Flex>
                <NumPadContent onKeyPress={this.changeValue} />
                <Flex mt={5} px={16} bg={'green'} fg={'white'} doActive fontSize={23} minHeight={75}
                      justifyContent={'center'}
                      onClick={this.onInputFinished}>
                    입력
                </Flex>
            </Fragment>
        );
    }
}
export default NumberPad
