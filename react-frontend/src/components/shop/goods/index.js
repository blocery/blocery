import React, { Component } from 'react'

import GoodsDetail from '../../common/goodsDetail'
import { BlocerySpinner } from '~/components/common'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getProducerByProducerNo } from '~/lib/producerApi'
import ComUtil from '../../../util/ComUtil'
import { Server } from '~/components/Properties'
import { Container, Row, Col } from 'reactstrap'
import {B2cBackHeader} from '~/components/common/headers'
export default class Goods extends Component {
    constructor(props) {
        super(props)

        console.log('goods props : ', this.props)
        let params = null;
        let goodsNo = null;
        let couponNo = null;
        if(this.props.location){
            params = ComUtil.getParams(props)
            goodsNo = params.goodsNo;
            couponNo = params && (params.couponNo || null)
        }else{
            goodsNo = this.props.goodsNo;
            couponNo = this.props.couponNo || null;
        }

        this.state = {
            goodsNo: goodsNo,
            couponNo: couponNo,
            loading: true,
            goods: null,
            producer: null,
            farmDiaries: [],
            images: null
        }
    }

    async componentDidMount(){
        //window.scrollTo(0,0)
        await this.search()
    }
    search = async () => {

        this.setState({loading: true})
        const goodsNo = this.state.goodsNo

        const { data:goods } = await getGoodsByGoodsNo(goodsNo)
        console.log('goods:',goods, goods.producerNo)
        const { data:producer } = await getProducerByProducerNo(goods.producerNo)

        //this.sortDesc(goods.cultivationDiaries)

        //TODO: 재배일지 농가의 전체를 가져 오도록 수정
        //const farmDiaries = this.getFilteredData(goods)
        //this.sortDesc(farmDiaries)

        this.setState({
            loading: false,
            goods: goods,
            producer: producer,
            images: goods.goodsImages,
            farmDiaries: []//farmDiaries.splice(0, 3)   //3건만
        })
    }
    //재배일지 등록일자 내림차순 정렬
    sortDesc = (data) => {
        data.sort((a,b)=>{
            //return a.diaryRegDate < b.diaryRegDate ? -1 : a.diaryRegDate > b.diaryRegDate ? 1 : 0
            return b.diaryRegDate - a.diaryRegDate
        })
    }
    //goods 에서 card 에 바인딩 할 object 반환
    getFilteredData = (goods) => {
        const { goodsNo, goodsNm } = goods
        const serverImageUrl = Server.getImageURL()
        console.log('getFileterdData', goods)
        return goods.cultivationDiaries.map((cultivationDiary)=>{
            return {
                goodsNo: goodsNo,
                goodsNm: goodsNm,
                imageUrl: serverImageUrl+cultivationDiary.diaryImages[0].imageUrl,
                ...cultivationDiary
            }
        })
    }


    render() {
        return(
            <Container>
                <Row>
                    <Col className={'p-0'}>
                        <B2cBackHeader title={'상품정보'} />
                        {
                            this.state.loading ? (<BlocerySpinner/>) :
                                (
                                    <GoodsDetail
                                        goods={this.state.goods}
                                        couponNo={this.state.couponNo}
                                        producer={this.state.producer}
                                        farmDiaries={this.state.farmDiaries}
                                        images={this.state.images}
                                        history={this.props.history}
                                    />
                                )
                        }
                    </Col>
                </Row>
            </Container>
        )
    }
}