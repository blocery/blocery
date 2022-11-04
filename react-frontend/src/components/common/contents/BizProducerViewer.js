import React, {useState, useEffect} from 'react'
import {Button, Div, Fixed, GridColumns, Span} from "~/styledComponents/shared";
import HashTagInput from "~/components/common/hashTag/HashTagInput";
import {getProducerByProducerNo} from "~/lib/producerApi";
import adminApi from "~/lib/adminApi";
import {hashTagVisiblePageStore} from "~/store";
// import GoodsContent from "~/components/common/goodsDetail/GoodsContent";

const BizProducerViewer = ({hashTagGroup, producerNo, onClose = () => null}) => {

    const [tags, setTags] = useState([])
    const [producer, setProducer] = useState()

    useEffect(() => {
        console.log({producerNo})
        if (producerNo)
            search()
    }, [])

    const search = async () => {
        const {data: producer, status} =  await getProducerByProducerNo(producerNo)

        if (producer.tags){
            setTags(producer.tags)
        }

        setProducer(producer)
    }

    const onHashTagChcnage = (tags) => {
        setTags(tags)
    }

    const onSaveClick = async() => {
        const saveProducer = {...producer}
        saveProducer.tags = tags

        await adminApi.updateProducerTags(saveProducer)
        onClose()
    }

    return (
        <Div bg={'white'}>
            <GridColumns repeat={2} colGap={0} rowGap={0}>
                <Div p={16}>
                    {
                        hashTagGroup && ( //현재 미출력중..
                            <Div p={10} rounded={4} bc={'secondary'}>
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
                        <HashTagInput tags={tags} onChange={onHashTagChcnage}/>
                    </Div>
                    <Div textAlign={'center'} my={20}>
                        <Button px={10} bg={'green'} fg={'white'} onClick={onSaveClick}>저장</Button>
                    </Div>
                </Div>

                { //TODO 필요시 생산자 정보출력.(profile? 상품목록? 등 가능)
                    // (producer) && (
                    //     <Div maxHeight={700} overflow={'auto'}>
                    //         <GoodsContent
                    //             goods={goods}
                    //             producer={producer}
                    //             // farmDiaries={state.farmDiaries}
                    //             // images={state.images}
                    //         />
                    //     </Div>
                    // )
                }

            </GridColumns>




        </Div>
    );
};

export default BizProducerViewer;
