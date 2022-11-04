import React, {useState} from 'react'
import { Input } from 'reactstrap'
import {FaEye, FaEyeSlash} from 'react-icons/fa'
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {Div} from "~/styledComponents/shared";
const StyledInput = styled(Input)`
    padding: ${getValue(30)} ${getValue(25)};
    border: 1px solid whitesmoke;    
    border-bottom: 2px solid #acacac;
    ime-mode: inactive; 
`
const LoginPasswordInput = (props) => {

    //password type 변경용 state
    const [passwordType, setPasswordType] = useState({
        type: 'password',
        visible: false
    });

    //password type 변경하는 함수
    const handlePasswordType = e => {
        setPasswordType(() => {
            if (!passwordType.visible) {
                return { type: 'text', visible: true };
            }
            return { type: 'password', visible: false };
        })
    }
    return (
        <Div relative mb={16}>
            <StyledInput type={passwordType.type} placeholder={props.placeholder||''} />
            <Div absolute cursor yCenter top={'50%'} right={19} onClick={handlePasswordType}>
                {  passwordType.visible ? <FaEye size={30}/> : <FaEyeSlash size={30}/>  }
            </Div>
        </Div>
    )
}
export default LoginPasswordInput