import React, { Component } from 'react'
import {Div, Flex, JustListSpace, Span, Input, ListBorder} from "~/styledComponents/shared";
import { authMarkTypeInfo } from '~/lib/bloceryConst'
import { Server } from '~/components/Properties'
import AuthMarkCard from "~/components/common/cards/AuthMarkCard";
import {FaMedal} from "react-icons/all";
export default class AuthMark extends Component {
    constructor(props){
        super(props);
        this.state = {
            infoGubuns:[
                {gubun:'MAFRA',title:'농림축산식품부'},
                {gubun:'MOF',title:'해양수산부'},
                {gubun:'MFDS',title:'식품의약품안전처'}
            ],
            infoValues: []
        }
    }

    componentDidMount() {
        let infoValuesData = [];
        this.state.infoGubuns.map((pItem, index)=>{
            const infoValues = authMarkTypeInfo[pItem.gubun].map((item, index) => {
                const dataInfo = this.props.infoValues && this.props.infoValues.find((tItem) => tItem && tItem.key === item.key);
                const authNumber = dataInfo && dataInfo.authNumber ? dataInfo.authNumber : ''
                const checked = dataInfo && dataInfo.checked ? dataInfo.checked : false
                if(checked) {
                    infoValuesData.push({
                        gubun: pItem.gubun,
                        key: item.key,
                        imgUrl: Server.getFrontURL() + item.img,
                        img: item.img,
                        title: item.title,
                        desc: item.desc,
                        authNumber: authNumber,
                        checked: checked
                    });
                }
            })
        })
        this.setState({ infoValues:infoValuesData })
    }


    render() {
        if(this.state.infoValues.length == 0){
            return null
        }
        return (
            <div>
                <Div
                    // mt={5} mb={5} ml={32} mr={32}
                    //  px={16} py={16}
                    //  bg={'dark'} fg={'white'}
                    pt={30}
                    fontSize={17}
                    textAlign={'center'} bold fg={'green'}
                >
                    <FaMedal color={'green'}/>
                    <Span ml={4}>인증 마크를 확인하세요</Span>
                </Div>
                <ListBorder px={16} pb={16} spaceColor={'background'}>
                    {/*MAFRA:농림축산식품부,MOF:해양수산부,MFDS:식품의약품안전처*/}
                    {
                        this.state.infoGubuns.map((pItem, index)=>
                            this.state.infoValues.filter(item=>item.gubun===pItem.gubun).map(({gubun, key, img, imgUrl, title, desc, authNumber, checked}, index) => {
                                return (
                                    <AuthMarkCard
                                        authMark={{gubun, key, img, imgUrl, title, desc, authNumber, checked}}
                                    />
                                )
                            })
                        )
                    }
                </ListBorder>
                {/*<JustListSpace space={16} px={16} pb={30}>*/}
                {/*    /!*MAFRA:농림축산식품부,MOF:해양수산부,MFDS:식품의약품안전처*!/*/}
                {/*    {*/}
                {/*        this.state.infoGubuns.map((pItem, index)=>*/}
                {/*            this.state.infoValues.filter(item=>item.gubun===pItem.gubun).map(({gubun, key, img, imgUrl, title, desc, authNumber, checked}, index) => {*/}
                {/*                return (*/}
                {/*                    <AuthMarkCard*/}
                {/*                        authMark={{gubun, key, img, imgUrl, title, desc, authNumber, checked}}*/}
                {/*                    />*/}
                {/*                )*/}
                {/*            })*/}
                {/*        )*/}
                {/*    }*/}
                {/*</JustListSpace>*/}
            </div>
        )
    }
}