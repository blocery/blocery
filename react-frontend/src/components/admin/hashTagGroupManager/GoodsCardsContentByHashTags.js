import React, {useEffect, useState} from 'react';
import GoodsCard from "~/components/common/cards/GoodsCard";
import {getGoodsByTags} from "~/lib/shopApi";
import {Button, Div, Flex, Space} from "~/styledComponents/shared";
import {Input} from "reactstrap";
import {saveTagPriorty} from "~/lib/adminApi";

//재사용 될 상품카드 리스트 컨텐츠
const GoodsCardsContentByHashTags = ({producerNo, hashTags = [], onChange = () => null}) => {

    const [goodsList, setGoodsList] = useState([])


    useEffect(() => {
        if (hashTags.length > 0) {
            search()
        }else{
            setGoodsList([])
            onChange([])
        }
    }, [hashTags])

    const search = async () => {
        console.log({tags: hashTags, localfoodProducerNo: producerNo, isGroupTag: true, isPaging:false, limit:999, page: 1})
        const {data} = await getGoodsByTags({tags: hashTags, localfoodProducerNo: producerNo, isGroupTag: true, isPaging:false, limit:999, page: 1}) //999이면 admin용도임
        console.log({data: data})
        setGoodsList(data.goodsList)
        onChange(data.goodsList)
    }

    const handleChange = (goodsNo, e) => {

        let tagPriroity = e.target.value
        const tempList = Object.assign([], goodsList)

        let index = tempList.findIndex( goods => goods.goodsNo === goodsNo )
        tempList[index].tagPriority = tagPriroity

        setGoodsList(tempList)
    }

    const saveTagPriority = async (goodsNo) => {

        let index = goodsList.findIndex( goods => goods.goodsNo === goodsNo )
        let tagPriority = goodsList[index].tagPriority
        console.log( goodsList[index].tagPriority )

        //todo save()
        const {data:errRes} = await saveTagPriorty(goodsNo, tagPriority)

        if (errRes.resCode) {
            alert(errRes.errMsg)
        }else {
            alert('저장 완료')
        }
    }



    return (
        <Div //maxHeight={450} overflow={'auto'}
        >
            {
                hashTags.map(tag => {
                    const listByTag = goodsList.filter(goods => goods.groupTags.includes(tag))

                    return(
                        <>
                            <Div px={16} bold>#{tag}</Div>
                            {
                                listByTag.map(goods =>
                                    <Div>
                                        <GoodsCard goods={goods} movePage={false} showProducer/>
                                        <Flex>
                                            <Space>우선순위: </Space>
                                            <input id={'tagPriority'+goods.goodsNo} type={'number'} value={goods.tagPriority}  onChange={handleChange.bind(this, goods.goodsNo)}/>
                                            <Space> <Button bg={'green'} fg={'white'} onClick={saveTagPriority.bind(this, goods.goodsNo)}> 저장</Button> </Space>
                                        </Flex>
                                    </Div>
                                    )
                            }
                        </>
                    )
                })
            }
            {/*{*/}
            {/*    goodsList.map(goods =>*/}
            {/*        <>*/}
            {/*            */}
            {/*            <GoodsCard goods={goods} showProducer/>*/}
            {/*        </>*/}
            {/*    )*/}
            {/*}*/}
        </Div>
    );
};

export default GoodsCardsContentByHashTags;
