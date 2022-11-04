import React from 'react'
import Style from './BlockChainSpinner.module.scss'
import { ChainSpinner, BlocerySymbolGreen } from '../../common'
import {Div, Mask} from "~/styledComponents/shared";
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {Spinner} from "reactstrap";

const Modal = styled.div`
    
    position: absolute;
    
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
   
    background: ${color.white};
    font-size: ${getValue(15)};
    min-width: 45vmin;
    padding: ${getValue(23)};
    border-radius: ${getValue(3)};
    text-align: center;
`

const BlockChainSpinner = (props) => {

    return (
        <Mask zIndex={9999999}>
            <Modal>
                <Spinner color="success" style={{marginBottom: 13}}/>
                {/*<BlocerySymbolGreen style={{width: 25, height: 25}} />*/}
                {/*<div><ChainSpinner /></div>*/}
                <div>
                    {
                        props.children ? props.children : <b>블록체인 기록중!<br/>잠시만 기다려 주세요!</b>
                    }
                </div>
            </Modal>
        </Mask>
    )

    return (
        <div className={Style.wrap}>
            <div className={Style.modal}>
                <div>
                    <BlocerySymbolGreen style={{width: '30px', height: '30px'}}/>
                </div>
                <div className={'small'}><ChainSpinner/></div>
                <div className={'small'}>
                    {
                        props.children ? props.children : <b>블록체인에 기록 중이며, <br/>시간이 다소 소요됩니다!</b>
                    }
                </div>
            </div>
        </div>
    )
}
export default BlockChainSpinner