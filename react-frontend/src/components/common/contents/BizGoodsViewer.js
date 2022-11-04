import React, {useState, useEffect} from 'react'
import {Button, Div, Fixed, GridColumns, Span} from "~/styledComponents/shared";
import {SingleArImageUploader} from '~/components/common'
import HashTagInput from "~/components/common/hashTag/HashTagInput";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
// import GoodsDetail from "~/components/common/goodsDetail";
import {getProducerByProducerNo} from "~/lib/producerApi";
// import GoodsContent from "~/components/common/goodsDetail/GoodsContent";
import GoodsContent from "~/components/shop/goods/directGoodsDetail/GoodsContent";
// import DealGoodsContent from "~/components/shop/dealGoods/DealGoodsDetail/DealGoodsContent";
import DealGoodsContent from "~/components/shop/goods/dealGoodsDetail/DealGoodsContent";
import adminApi, {updateGoodsTagsArFile} from "~/lib/adminApi";
import {hashTagVisiblePageStore} from "~/store";
import {FormGroup, Label} from "reactstrap";

const BizGoodsViewer = ({hashTagGroup, goodsNo, onClose = () => null}) => {

    const [tags, setTags] = useState([])
    const [groupTags, setGroupTags] = useState([])
    const [goods, setGoods] = useState()
    const [producer, setProducer] = useState()

    useEffect(() => {
        console.log({goodsNo})
        if (goodsNo)
            search()
    }, [])

    const search = async () => {
        const {data: goods, status} = await getGoodsByGoodsNo(goodsNo)
        if (status === 200) {

            const {data: producer} = await getProducerByProducerNo(goods.producerNo)

            setTags(goods.tags)
            setGroupTags(goods.groupTags)

            setGoods(goods)
            setProducer(producer)
        }
    }

    //AR 이미지
    const onArImageChange = (arimages) => {
        setGoods({...goods,arGlbFile:arimages})
    }
    const onArUsdzImageChange = (arimages) => {
        setGoods({...goods,arUsdzFile:arimages})
    }
    const onHashTagChcnage = (tags) => {
        setTags(tags)
    }
    const onGroupHashTagChcnage = (tags) => {
        setGroupTags(tags)
    }

    const onSaveClick = async() => {
        const saveGoods = {...goods}
        saveGoods.tags = tags
        saveGoods.groupTags = groupTags
        console.log({saveGoods: saveGoods})
        await adminApi.updateGoodsTagsArFile(saveGoods)
        onClose()
    }

    return (
        <Div bg={'white'}>
            <GridColumns repeat={2} colGap={0} rowGap={0}>
                <Div p={16}>
                    {
                        goods &&
                        <Div bc={'secondary'} p={10}>
                            <FormGroup>
                                <Label>AR 이미지(glb)</Label>
                                <SingleArImageUploader image={goods.arGlbFile} onChange={onArImageChange} />
                            </FormGroup>
                            <FormGroup>
                                <Label>AR 이미지(usdz) ios용</Label>
                                <SingleArImageUploader arType={'usdz'} image={goods.arUsdzFile} onChange={onArUsdzImageChange} />
                            </FormGroup>
                        </Div>
                    }
                    {
                        hashTagGroup && (
                            <Div p={10} mt={8} rounded={4} bc={'secondary'}>
                                <Div bold>{hashTagVisiblePageStore.find(({value}) => value === hashTagGroup.visiblePage).label}</Div>
                                <Div bold>{hashTagGroup.groupName}</Div>
                                <Div>
                                    {
                                        hashTagGroup.hashTags.map((tag) =>
                                            <Span fg={'primary'} mr={8}>#{tag}</Span>
                                        )
                                    }
                                </Div>
                            </Div>
                        )
                    }
                    <Div mt={20}>
                        <div>
                            상품 해시태그
                        </div>
                        <HashTagInput tags={tags} onChange={onHashTagChcnage}/>
                    </Div>
                    <Div mt={20}>
                        <div>
                            그룹 해시태그
                        </div>
                        <HashTagInput tags={groupTags} onChange={onGroupHashTagChcnage}/>
                    </Div>

                    <Div textAlign={'center'} my={20}>
                        <Button px={10} bg={'green'} fg={'white'} onClick={onSaveClick}>저장</Button>
                    </Div>
                </Div>
                {
                    (goods && producer) && (
                        <Div maxHeight={700} overflow={'auto'}>
                            {
                                goods.dealGoods ?
                                <DealGoodsContent
                                    goods={goods}
                                    producer={producer}
                                />
                                :
                                <GoodsContent
                                    goods={goods}
                                    producer={producer}
                                    // farmDiaries={state.farmDiaries}
                                    // images={state.images}
                                />
                            }
                        </Div>
                    )
                }
            </GridColumns>




        </Div>
    );
};

export default BizGoodsViewer;
