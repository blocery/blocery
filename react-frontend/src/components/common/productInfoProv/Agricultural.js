import React, { Component } from 'react'
import { Row, Col, Label, Input, Button } from 'reactstrap';
import { goodsTypeInfo } from '~/components/Properties'

export default class Agricultural extends Component {
    constructor(props){
        super(props);
        this.state = {
            infoValues: [{title:'', content:'', checked:false}],
            allRefDetail: false
        }
    }

    componentDidMount() {
        const infoValues = goodsTypeInfo[this.props.code].map((item, index) => {

            const content = this.props.infoValues[index] ? this.props.infoValues[index].content : ''
            const checked = this.props.infoValues[index] ? this.props.infoValues[index].checked : false

            return {
                title: item.title,
                placeholder: item.placeholder,
                ess: item.ess,
                content: content,
                checked: checked
            }

        })
        //console.log(infoValues)
        this.setState({ infoValues })
    }

    handleChange = (index, e) => {
        const infoValues = Object.assign([], this.state.infoValues)
        infoValues[index].content = e.target.value
        this.setState({infoValues})
    }

    // 전체 상품정보참조
    allRefDetail = (e) => {
        const checked = e.target.checked
        const data = Object.assign([], this.state.infoValues)

        data.map((item)=>{
            item.checked = checked
        })

        if(checked) {
            data.map((item)=> {
                item.content = '상품정보 참조'
            })
        } else {
            data.map((item)=> {
                item.content = ''
            })
        }

        this.setState({
            infoValues: data,
            allRefDetail: checked
        })
    }

    // 체크되어 있으면 '상품정보 참조'
    refDetail = (index, e) => {
        const checked = e.target.checked

        const data = Object.assign([], this.state.infoValues)

        data[index].checked = checked
        if(checked) {
            data[index].content = '상품정보 참조'
        } else {
            data[index].content = ''
        }

        this.setState({ infoValues: data })
    }

    // 저장 클릭
    onClickSave = () => {
        const data = Object.assign([], this.state.infoValues)

        if(this.isValidatedSuccessful()) {
            data.map((item) => {
                delete item.placeholder
                delete item.ess
            })
            this.props.onClose([
                ...data
            ])
        } else {
            alert('필수입력 항목을 확인해주세요.')
        }
    }

    //필수값 체크
    isValidatedSuccessful = () => {
        const data = Object.assign([], this.state.infoValues)
        const essentialValue = data.filter(item => item.ess === true && item.content === '')

        if(essentialValue.length > 0) {
            return false;
        }

        return true;
    }


    render() {
        const star = <span className='text-danger'>*</span>
        return (
                <div>
                    <div className='p-3'>
                        <div className='d-flex'>
                            <div className='text-secondary f6 mb-2 mt-2'>'상품정보참조' 체크 시 해당 내용을 상품 상세설명에 이미지텍스트로 꼭 입력해 주시기 바랍니다.</div>
                            <div className='ml-auto'>
                                <Input id={'checkAll'} type='checkbox' checked={this.state.allRefDetail} onChange={this.allRefDetail.bind(this)} />
                                <label for={'checkAll'} className='f7'>전체 상품정보참조</label>
                            </div>
                        </div>
                        {
                            this.state.infoValues.map(({title, content, checked, placeholder, ess}, index) => {
                                return (
                                    <div key={index}>
                                        <Row className='mb-1 align-items-center'>
                                            <Col xs="4" className='f5'>{title} {ess&&star}</Col>
                                            <Col xs="7"><Input value={content} disabled={checked} placeholder={placeholder} onChange={this.handleChange.bind(this, index)}/></Col>
                                            <Col xs="1">
                                                <Input id={`check_${index}`} type='checkbox' checked={checked} onChange={this.refDetail.bind(this, index)}/>
                                                <label for={`check_${index}`} className='f7'>상품정보참조</label>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <hr className='p-0 m-0'/>
                    <div className='d-flex justify-content-center align-items-center m-2'>
                        <Button color='info' size='md' onClick={this.onClickSave}>설정</Button>
                    </div>
                </div>


        )
    }
}