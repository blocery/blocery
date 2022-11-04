import React, {Component, Fragment} from 'react'
import {Button, Collapse, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {Div, Flex, Right, Span} from '~/styledComponents/shared'

import PropTypes from 'prop-types'
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Required} from "~/styledComponents/ShopBlyLayouts";

const Star = () => <span className='text-danger'>*</span>

export default class Terms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            termsCollapse: false,
            personalInfoCollapse: false,
            data: this.props.data,
            isAllChecked: false
        }

    }

    //전체체크
    onCheckAllBoxChange = (e) => {
        const data = Object.assign([], this.state.data)
        const checked = e.target.checked

        data.map((item)=>{
            item.checked = checked
        })

        this.setState({
            data: data,
            isAllChecked: checked
        })

        this.props.onCheckAll(e)
    }

    //체크박스
    onCheckBoxChange = (index) => {
        const data = Object.assign([], this.state.data)

        const checked = data[index].checked || false
        data[index].checked = !checked

        let vAllChkCnt = 0;
        data.map((item)=>{
            if(item.checked){
                vAllChkCnt = vAllChkCnt + 1;
            }
            if(!item.checked){
                vAllChkCnt = vAllChkCnt - 1;
            }
        })

        if(vAllChkCnt !== data.length){
            this.setState({
                data: data,
                isAllChecked: false
            })
        }else if(vAllChkCnt === data.length){
            this.setState({
                data: data,
                isAllChecked: true
            })
        } else {
            this.setState({
                data: data
            })
        }

        this.props.onClickCheck(data, index)
    }

    // 약관 전체보기 클릭
    toggle = (index) => {
        const data = Object.assign([], this.state.data)
        const isOpen = data[index].isOpen || false
        data[index].isOpen = !isOpen

        this.setState({
            data: data
        })

    }

    render() {
        const data = this.state.data;
        return (

            <div>
                <Flex mb={5} mb={20}>
                    <Checkbox className='mr-2' id="checkAll" name="checkAll" bg={'green'} checked={this.state.isAllChecked} value="checkAll" onChange={this.onCheckAllBoxChange} />
                    {/*<input type="checkbox" id='checkAll' name="checkAll" className='mr-2' checked={this.state.isAllChecked} value="checkAll" onChange={this.onCheckAllBoxChange} />*/}
                    <label for='checkAll' className='m-0'><b>전체 동의 합니다</b></label>
                </Flex>
                {
                    data.map(({name, title, content, isOpen, checked}, index)=>{
                        return (
                            <Div key={index} mb={20}>
                                <Flex alignItems={'center'}>
                                    <Checkbox name={name} bg={'green'} checked={checked} onChange={this.onCheckBoxChange.bind(this, index)}>
                                        <Span fontSize={14}><b>{title}</b><Required /></Span>
                                    </Checkbox>
                                    <Right>
                                        {
                                            content && <Div fontSize={14} cursor onClick={this.toggle.bind(this, index)}><Span fg={'green'}>보기</Span></Div>
                                        }
                                    </Right>
                                </Flex>

                                {/*<Collapse isOpen={isOpen} className={'mb-3'}>*/}
                                {/*    <div className='small' style={{maxHeight: 300, overflow: 'auto'}}>{content}</div>*/}
                                {/*</Collapse>*/}
                                <Modal isOpen={isOpen} centered>
                                    <ModalHeader>
                                        {title}{' '}
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className='small' style={{maxHeight: 300, overflow: 'auto'}}>{content}</div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button outline size='sm' color='secondary' className='m-1' onClick={this.toggle.bind(this, index)}>확인</Button>
                                    </ModalFooter>
                                </Modal>

                            </Div>
                        )
                    })
                }
            </div>
        )
    }
}

Terms.propTypes = {
    data: PropTypes.array.isRequired
}
Terms.defaultProps = {

}