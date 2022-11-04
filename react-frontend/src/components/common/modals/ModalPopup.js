import React, { Component, Fragment } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import {Button} from '~/styledComponents/shared'
import PropTypes from 'prop-types'
import {color} from "~/styledComponents/Properties";
class ModalPopup extends Component {
    constructor(props){
        super(props)
        this.state = {
            modal: true
        }
    }
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        })

        //창이 닫히면 무조건 부모 콜백 호출
        if(!this.state.modal === false && this.props.onClick)
            this.props.onClick()
    }
    render(){
        return(
            <Fragment>
                <span onClick={this.toggle}>
                {
                    this.props.children
                }
                </span>
                <div>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                        <ModalHeader toggle={this.modalToggle}>{this.props.title}</ModalHeader>
                        <ModalBody>
                            { this.props.content }
                        </ModalBody>
                        {
                            this.props.showFooter && (
                                <ModalFooter>
                                    <Button bg={'green'} fg={'white'} px={10} py={8} rounded={3} onClick={this.toggle}>확인</Button>{' '}
                                </ModalFooter>
                            )
                        }

                    </Modal>
                </div>
            </Fragment>
        )
    }
}
ModalPopup.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    title: PropTypes.any.isRequired,
    content: PropTypes.any.isRequired,
    onClick: PropTypes.func,
    showFooter: PropTypes.bool
}
ModalPopup.defaultProps = {
    color: 'info',
    className: null,
    showFooter: true
}
export default ModalPopup