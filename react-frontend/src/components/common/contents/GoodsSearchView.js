import React, {useEffect, useRef, useState} from 'react';
import {Div, Flex, GridColumns, Right, Space, Span} from "~/styledComponents/shared";
import AdminLayouts, {MenuButton} from "~/styledComponents/shared/AdminLayouts";
import {MdClose} from "react-icons/md";
import Textarea from "react-textarea-autosize";
import AdminApi from "~/lib/adminApi";
import {getProducerByProducerNo} from "~/lib/producerApi";
import {ProducerInfo} from "~/components/admin/goodsList/MultiTagManagerContent";
import _ from "lodash";
import {getGoodsByGoodsNo, getGoodsListByGoodsNos} from "~/lib/goodsApi";
import ComUtil from "~/util/ComUtil";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import Checkbox from "~/components/common/checkboxes/Checkbox";

function getFilteredListByStr(strTag) {
    //스페이스 제거된, 줄바꿈 제거
    const __tags = strTag.toLowerCase().replace(/\s/g, "").replace(/\r?\n|\r/g).split(',');

    //값 있는거만 필터
    const tags = __tags.filter(tag => tag !== null && tag !== undefined && tag !== '')
    return tags
}

function getStrGoodsNo(goodsList) {
    const goodsNoList = []
    goodsList.map(goods => goodsNoList.push(goods.goodsNo))
    return goodsNoList.join(', ')
}


const GoodsSearchView = ({goodsList = [], onApply}) => {
    const [list, setList] = useState([])
    const [selectedGoodsNos, setSelectedGoodsNos] = useState([])
    const [producer, setProducer] = useState()
    const strGoodsNoRef = useRef() //textarea ref(상품번호)

    useEffect(() => {
        strGoodsNoRef.current.value = getStrGoodsNo(goodsList)
        //DB로 조회해서 싱크 맞추
        onGoodsSearchClick()
    }, [])

    //상품코드로 검색
    const onGoodsSearchClick = async () => {

        const goodsNoList = _.uniq(getFilteredListByStr(strGoodsNoRef.current.value))
        // .filter(goodsNo => !isNaN(goodsNo))

        //숫자만 필터링된 리스트
        const filteredGoodsNoList = goodsNoList.filter(goodsNo => !isNaN(goodsNo))
        //문자가 섞여있는 잘못된 리스트
        const isNanGoodsNoList = goodsNoList.filter(goodsNo => isNaN(goodsNo))

        if(list.length > 0) {
            if (!window.confirm(`작업중이었던 태그가 있을 경우 미리 저장해 주세요. ${filteredGoodsNoList.length > 0 ? '조회 하시겠습니까?' : '클리어 하시겠습니까?'}`)) {
                return
            }
        }

        if (isNanGoodsNoList.length > 0) {
            let msg = ''
            isNanGoodsNoList.map(goodsNo => msg += goodsNo + " ")

            alert('상품코드 '+ msg + '가 잘못 되어 검색에 제외 되었습니다.')
        }

        const {data} = await getGoodsListByGoodsNos(filteredGoodsNoList)

        setSelectedGoodsNos(() => data.map(goods => goods.goodsNo))

        const newGoodsList = data

        // const promises = filteredGoodsNoList.map(goodsNo => getGoodsByGoodsNo(goodsNo).then(({data}) => {
        //     if (data) {
        //         newGoodsList.push(data)
        //     }
        // }))

        // await Promise.all(promises)

        ComUtil.sortNumber(newGoodsList, 'goodsNo')

        // const newList = res.map(({data}) => data)
        //
        // console.log({goodsNoList, newList})

        setList(newGoodsList)
        // setBackupObj({})

        //setStrTagObj()

    }

    //생산자 번호로 조회
    const searchProducerGoods = async () => {
        const value = window.prompt('생산자번호를 입력해주세요. (판매중단을 제외한 모든 상품을 검색 합니다)', producer ? producer.producerNo : '')
        if (!isNaN(value)) {
            try{
                const {status, data} =  await AdminApi.getAllProducerGoods(value)

                if (status === 200 || data) {
                    if (data.length <= 0) {
                        alert('조회된 상품이 없습니다. 생산자 번호를 다시 확인 바랍니다.')
                        return
                    }

                    // console.log("===", strTag)

                    const goodsNoList = []
                    data.map(goods => goodsNoList.push(goods.goodsNo))

                    const strGoodsNos = goodsNoList.join(', ')

                    // setStrGoodsNo(strGoodsNos)
                    setList(data)

                    setSelectedGoodsNos(() => data.map(goods => goods.goodsNo))

                    strGoodsNoRef.current.value = strGoodsNos

                    //임시
                    // setStrTag(strTagRef.current.value)


                    //전부 삭제모드로 강제 전환
                    // setBackupObj({})

                    const {data: producer} = await getProducerByProducerNo(value)
                    setProducer(producer)
                }
            }catch (error) {
                alert('가져오기를 실패하였습니다.')
            }
        }
    }




    const onCheckboxChange = (goodsNo, e) => {

        const newSelectedRow = [...selectedGoodsNos]

        const idx = newSelectedRow.indexOf(goodsNo)

        if (e.target.checked) {
            // if (idx === -1) {
            newSelectedRow.push(goodsNo)
            // }
        }else{
            newSelectedRow.splice(idx, 1)
        }

        setSelectedGoodsNos(newSelectedRow)
    }

    const onApplyClick = () => {
        const selectedGoodsList = selectedGoodsNos.map(goodsNo => list.find(goods => goods.goodsNo === goodsNo))
        onApply(selectedGoodsList)
    }

    return (
        <Div>
            <Flex mb={10}>
                <Space>
                    <Span><b>상품코드로 검색</b></Span>
                    <Span fg={'dark'} fontSize={12}>
                        상품코드로 상품을 검색 할 수 있습니다. "," (콤마)가 구분자 입니다.
                    </Span>
                </Space>
            </Flex>
            <Textarea
                inputRef={strGoodsNoRef}
                style={{width: '100%', minHeight: 50, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                className={'border'}
                rows={5}
                placeholder='ex) 400, 521, 665'
            />
            <Space spaceGap={16}>
                <MenuButton onClick={onGoodsSearchClick} width={100}>검색</MenuButton>
                <Space spaceGap={2}>
                    {
                        producer && <MenuButton onClick={() => {
                            setProducer(null)
                        }}><MdClose /></MenuButton>
                    }
                    {
                        producer && <ProducerInfo producer={producer} />
                    }
                    <MenuButton bg={producer ? 'green' : 'white'}
                                fg={producer ? 'white' : 'black'}
                                bc={'light'}
                                onClick={searchProducerGoods}>생산자 번호로 상품조회 (현재 {producer ? producer.producerNo : '미지정'})</MenuButton>
                </Space>
                <Right>
                    <MenuButton bg={'green'} onClick={onApplyClick} width={100} disabled={selectedGoodsNos.length === 0}>{selectedGoodsNos.length > 0 && `${selectedGoodsNos.length}개 `}적용</MenuButton>
                </Right>
            </Space>
            <GridColumns rowGap={8} colGap={0} py={16}>
                {
                    list.map((goods, index) =>
                        <Checkbox bg={'green'} onChange={onCheckboxChange.bind(this, goods.goodsNo)}
                                  checked={selectedGoodsNos.includes(goods.goodsNo)}
                                  size={'lg'}
                        >
                            <Space key={goods.goodsNo} spaceGap={16}>
                                <img src={ComUtil.getFirstImageSrc(goods.goodsImages, TYPE_OF_IMAGE.THUMB)} style={{width: 40, height: 40}} />
                                <div>
                                    {goods.goodsNm}
                                </div>
                                <div>
                                    {ComUtil.addCommas(goods.currentPrice)}원 {goods.options.length > 1 && `~ [옵션${goods.options.length}개]`}
                                </div>
                            </Space>
                        </Checkbox>
                    )
                }
            </GridColumns>
        </Div>
    );
};

export default GoodsSearchView;