import React, {useState, useEffect} from 'react';
import {getGoodsByGoodsNo} from '~/lib/goodsApi'
import {Button, Div, Span, Flex, Input, Space} from "~/styledComponents/shared";
import adminApi from '~/lib/adminApi'
import moment from 'moment-timezone'

const AdditionalDealContent = ({goodsNo, onClose}) => {

    const [goods, setGoods] = useState({
        fkDealCount: '',
        fkDealProfileList: []
    })

    useEffect(() => {
        if (goodsNo){
            search()
        }
    }, [goodsNo])

    const search = async () => {
        const {data} = await getGoodsByGoodsNo(goodsNo)
        //console.log({data})

        if (data && data.fkDealProfileList) {
            data.fkDealProfileList.map(item =>
                item.orderDate = moment(item.orderDate).format('YYYYMMDDHHmm')
            )

            setGoods(data)
        }
    }

    const onInputChange = e => {
        setGoods({
            ...goods,
            fkDealCount: e.target.value
        })
    }

    const onNicknameChange = (index, e) => {
        const newGoods = Object.assign({}, goods)
        const fkDealProfileList = newGoods.fkDealProfileList
        fkDealProfileList[index].nickname = e.target.value
        setGoods(newGoods)
    }

    const onDateChange = (index, e) => {
        const newGoods = Object.assign({}, goods)
        const fkDealProfileList = newGoods.fkDealProfileList

        //console.log(e.target.value)

        fkDealProfileList[index].orderDate = e.target.value
        setGoods(newGoods)
    }

    const addProfile = () => {
        const newGoods = Object.assign({}, goods)
        newGoods.fkDealProfileList.unshift({orderSeq: 0, nickname: '', orderDate: moment().format('YYYYMMDDHHmm').toString(), profileImageUrl: ''})
        //console.log(newGoods)
        setGoods(newGoods)
    }

    const onSaveClick = async () => {

        const newFkDealProfileList = []

        goods.fkDealProfileList.map(item => {
            if (item.nickname && item.orderDate) {
                newFkDealProfileList.push({
                    ...item,
                    orderDate: moment(item.orderDate, 'YYYYMMDDHHmm').format('YYYY-MM-DDTHH:mm:ss')
                })
            }
        })


        console.log({newFkDealProfileList})

        const newGoods = Object.assign({}, goods)
        newGoods.fkDealProfileList = newFkDealProfileList

        console.log(newGoods.fkDealProfileList)

        const {status} = await adminApi.updateGoodsFakeDeal(newGoods)
        if (status === 200) {
            alert('저장되었습니다.')
            onClose()
            return
        }
    }

    const onDeleteClick = (index) => {
        const newGoods = Object.assign({}, goods)

        //삭제
        newGoods.fkDealProfileList.splice(index, 1)

        // newGoods.fkDealProfileList.indexOf()
        setGoods(newGoods)
    }

    if (!goods) return null

    return (
        <div>

            <Div p={16} bg={'light'}>
                1. 프로필 이미지는 신규행 저장시 랜덤으로 저장 됩니다.<br/>
                2. 현재 시간은 사용되고 있지 않으니 신경 쓰지 않아도 됩니다. (상품 상세에서 주문번호로 정렬 하기 때문)<br/>
                3. 참여자수를 입력하면 실제 참여자수에 더해집니다.
            </Div>

            <Flex mt={16}>
                <Div>딜 추가 참여자 수</Div>
                <Div ml={16}>
                    <Input value={goods.fkDealCount} onChange={onInputChange} placeholder={'실제 구입자 + 추가로 참여될 수'}/>
                </Div>
            </Flex>

            <Div>
                <Space py={16}>
                    <Button bg={'green'} fg={'white'} onClick={addProfile}>행추가</Button>
                    <Button bg={'green'} fg={'white'} onClick={onSaveClick}>저장</Button>
                    <Span>{goods.fkDealProfileList.length}명</Span>
                </Space>
                <Div overflow={'auto'} maxHeight={500}>
                    {
                        goods.fkDealProfileList.map((item, index) =>
                            <Item
                                key={index}
                                nickname={item.nickname}
                                orderDate={item.orderDate}
                                onChange={onNicknameChange.bind(this, index)}
                                onDateChange={onDateChange.bind(this, index)}
                                onDeleteClick={onDeleteClick.bind(this, index)}
                            />
                        )
                    }
                </Div>

            </Div>
        </div>
    );
};

export default AdditionalDealContent;

const Item = ({nickname, orderDate, onChange, onDateChange, onDeleteClick}) => {
    // const date = moment(orderDate).format('YYYYMMDDHHmm').toString()
    // const day = moment(orderDate).format('YYYYMMDD').toString()
    // const hour = moment(orderDate).format('HH').toString()
    // const minutes = moment(orderDate).format('mm').toString()

    // const __onDateChange = (type, e) => {
    //     const value = e.target.value
    //     let date;
    //     if (type === 'day') {
    //         date = value + hour + minutes
    //     }else if (type === 'hour') {
    //         date = day + value + minutes
    //     }else{
    //         date = day + hour + minutes
    //     }
    //     onDateChange(date)
    // }

    return(
        <Flex>
            <Input height={35} value={nickname} onChange={onChange} placeholder={'닉네임'}/>
            <div>
                <Input height={35} value={orderDate} onChange={onDateChange} placeholder={'일자'} maxLength={12}/>
                {/*<Input value={day} onChange={__onDateChange.bind(this, 'day')} placeholder={'일자'} maxLength={8}/>*/}
                {/*<Input value={hour} onChange={__onDateChange.bind(this, 'hour')} placeholder={'일자'} maxLength={8}/>*/}
                {/*<Input value={minutes} onChange={__onDateChange.bind(this, 'minutes')} placeholder={'일자'} maxLength={8}/>*/}
            </div>
            <Button bg={'danger'} fg={'white'} onClick={onDeleteClick}>삭제</Button>
            <Div fg={'danger'} ml={16}>
                {
                    (!moment(orderDate, 'YYYYMMDDHHmm').isValid()) && '잘못된 날짜입니다!'
                }
            </Div>
        </Flex>
    )
}
