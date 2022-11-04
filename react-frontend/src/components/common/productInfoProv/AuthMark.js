import React, { Component } from 'react'
import { Row, Col, Label, Button } from 'reactstrap';
import {Div, Flex, JustListSpace, Span, Input} from "~/styledComponents/shared";
import { authMarkTypeInfo } from '~/lib/bloceryConst'
import { Server } from '~/components/Properties'
import Checkbox from "~/components/common/checkboxes/Checkbox";
export default class AuthMark extends Component {
    constructor(props){
        super(props);
        this.state = {
            infoGubuns:[
                {gubun:'MAFRA',title:'농림축산식품부'},
                {gubun:'MOF',title:'해양수산부'},
                {gubun:'MFDS',title:'식품의약품안전처'}
            ],
            infoValues: [{checked:false, gubun:'', key:'', title:'', desc:'', authNumber:''}]
        }
    }

    componentDidMount() {
        let infoValuesData = [];
        this.state.infoGubuns.map((pItem, index)=>{
            const infoValues = authMarkTypeInfo[pItem.gubun].map((item, index) => {
                const dataInfo = this.props.infoValues && this.props.infoValues.find((tItem) => tItem && tItem.key === item.key);
                const authNumber = dataInfo && dataInfo.authNumber ? dataInfo.authNumber : ''
                const checked = dataInfo && dataInfo.checked ? dataInfo.checked : false

                const isPrint = this.props.isPrint ? true:false;

                if(isPrint){
                    if(checked){
                        infoValuesData.push({
                            gubun:pItem.gubun,
                            key:item.key,
                            imgUrl:Server.getFrontURL() + item.img,
                            img:item.img,
                            title: item.title,
                            desc: item.desc,
                            authNumber:authNumber,
                            checked: checked
                        });
                    }
                }else{
                    infoValuesData.push({
                        gubun:pItem.gubun,
                        key:item.key,
                        imgUrl:Server.getFrontURL() + item.img,
                        img:item.img,
                        title: item.title,
                        desc: item.desc,
                        authNumber:authNumber,
                        checked: checked
                    });
                }
            })
        })
        console.log("infoValueList",infoValuesData)
        this.setState({ infoValues:infoValuesData })
    }

    handleChange = (key, e) => {
        const infoValues = Object.assign([], this.state.infoValues)
        const dataInfo = infoValues.find((item) => item && item.key === key)
        dataInfo.authNumber = e.target.value;
        this.setState({infoValues})
        const infoValuesList = infoValues.filter(item => item.checked === true)
        // 인증번호 값이 없을경우 안들어가게 할려면 item.authNumber.length > 0 필터링 추가
        // const infoValuesList = infoValues.filter(item => item.checked === true && item.authNumber.length > 0)
        this.props.onChange([
            ...infoValuesList
        ])
    }

    // 체크되어 있으면 '인증번호입력'
    refDetail = (key, e) => {
        const checked = e.target.checked
        const infoValues = Object.assign([], this.state.infoValues)
        const dataInfo = infoValues.find((item) => item && item.key === key)
        dataInfo.checked = checked
        if(checked === false){
            dataInfo.authNumber = '';
        }
        this.setState({ infoValues: infoValues })
        const infoValuesList = infoValues.filter(item => item.checked === true)
        this.props.onChange([
            ...infoValuesList
        ])
    }

    render() {
        return (
            <>
                <JustListSpace space={16}>
                    {
                        this.state.infoGubuns.map((pItem, index)=>{
                            {/*MAFRA:농림축산식품부,MOF:해양수산부,MFDS:식품의약품안전처*/}
                            return (
                                <div key={pItem.gubun}>
                                    {
                                        this.state.infoValues.filter(item=>item.gubun===pItem.gubun).length > 0 &&
                                        <>
                                            <Div mt={2} px={16} py={10} bg={'dark'} fg={'white'}>
                                                {pItem.title}
                                            </Div>
                                            <Flex alignItems={'flex-start'} flexWrap={'wrap'} bg={'white'} bc={'secondary'} p={16} lineHeight={30}>
                                                {
                                                    this.state.infoValues.filter(item=>item.gubun===pItem.gubun).map(({gubun, key, img, imgUrl, title, desc, authNumber, checked}, index) => {
                                                        return (
                                                            <Div key={key} minWidth={120}>
                                                                <Div>
                                                                    {
                                                                        this.props.isPrint ?
                                                                            <Span fontSize={12}>{title}</Span>
                                                                            :
                                                                            <Checkbox
                                                                                name={`check_${key}`} type='checkbox' checked={checked}
                                                                                onChange={this.refDetail.bind(this, key)}
                                                                                bg={'primary'}
                                                                                style={{height:'20px'}}
                                                                            >
                                                                                <Span fontSize={12}>
                                                                                    {title}
                                                                                </Span>
                                                                            </Checkbox>
                                                                    }
                                                                </Div>
                                                                <Div my={10}>
                                                                    <img
                                                                        src={imgUrl} width={80} height={80}
                                                                        alt={title}
                                                                        title={desc}
                                                                    />
                                                                </Div>
                                                                <Div pb={7}>
                                                                    {
                                                                        this.props.isPrint ?
                                                                            <Span>{authNumber}</Span>
                                                                            :
                                                                            checked &&
                                                                            <Input value={authNumber} placeholder={'인증번호'}
                                                                                   width={100}
                                                                                   onChange={this.handleChange.bind(this, key)}/>
                                                                    }
                                                                </Div>
                                                            </Div>
                                                        )
                                                    })
                                                }
                                            </Flex>
                                        </>
                                    }
                                </div>
                            )
                        })
                    }
                </JustListSpace>
            </>
        )
    }
}