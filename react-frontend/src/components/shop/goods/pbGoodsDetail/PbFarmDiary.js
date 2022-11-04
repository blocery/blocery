import React, {useEffect, useState} from 'react';
import {useParams, withRouter} from 'react-router-dom'
import {Div, Flex, Right, Img} from "~/styledComponents/shared";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import BackNavigation from "~/components/common/navs/BackNavigation";
import BasicNavigation from "~/components/common/navs/BasicNavigation"
import {getJeilPbFarmDiary} from "~/lib/shopApi";
import LocalMapCard from "~/components/shop/local/components/LocalMapCard";
import FarmDiaryImg from "~/images/farmDiary.jpg"
import FarmDiaryBanner from "~/images/farmDiary_banner.jpg"
import FarmerIcon from "~/images/icons/farmerInfo.svg"
import FarmDiaryBottom from "~/images/farmDiary_bottom1.jpg"
import FarmDiaryBottomButton from "~/images/farmDiary_bottom2.jpg"
import ComUtil from "~/util/ComUtil";

const PbFarmDiary = (props) => {
    const {farmerCode, itemCode} = useParams()

    const [pbFarmDiary, setPbFarmDiary] = useState()
    const [action, setAction] = useState(props.history.action)

    //이미지 하드코딩
    const farmDiaryImageList = [
        {imageUrl:'/2022/11/bhYdLylpynAq.jpg', title:'종자소독', day:'2022-04-15'},
        {imageUrl:'/2022/11/jUJwc9CnbkQN.jpg', title:'모판작업', day:'2022-04-22'},
        {imageUrl:'/2022/11/5aiXofYS0otT.jpg', title:'못자리만들기', day:'2022-05-28'},
        {imageUrl:'/2022/11/Du3qHppx3WZa.jpg', title:'이양작업', day:'2022-05-31'},
        {imageUrl:'/2022/11/DTnOyqgv3bfd.jpg', title:'제초 및 피작업', day:'2022-06-15'},
        {imageUrl:'/2022/11/bIBLxTV8ocyv.jpg', title:'추수', day:'2022-10-17'}
    ]

    useEffect(() => {
        async function fetch() {
            const {data} = await getJeilPbFarmDiary({farmerCode:farmerCode,itemCode:itemCode});
            console.log(data)

            //생산일지 최신순
            const sortDiary = ComUtil.sortDate(data.diaryList, 'day', true)
            data.diaryList = sortDiary

            setPbFarmDiary(data)
        }
        fetch()
    }, [])

    const moveToHome = () => {
        props.history.push('/')
    }

    if(!pbFarmDiary) return null;
    return (
        <div>
            {
                action === "PUSH" ?
                    <BackNavigation rightContent={<CartLinkButton/>}>이력정보</BackNavigation>
                    :
                    <BasicNavigation><Div pl={16}>이력정보</Div></BasicNavigation>
            }

            <div>
                <Img src={FarmDiaryImg} alt="이미지" width={'100%'}/>
                <Img src={FarmDiaryBanner} alt="배너이미지" width={'100%'} />
            </div>

            <Div mx={16} mt={40} mb={27} fontSize={20} bold>농가 정보</Div>
            <Flex px={20} py={30} mx={16} bc={'background'} rounded={8} shadow={'md'}>
                <Div mr={18} width={50} height={50}>
                    <Img src={FarmerIcon} alt="농가아이콘" />
                </Div>
                <div>
                    <Div fontSize={16} bold mb={5}>{pbFarmDiary.farmerName}</Div>
                    <Div fg={'dark'} fontSize={13}>지역 : {pbFarmDiary.fieldAddress}</Div>
                    <Div fg={'dark'} fontSize={13}>주요품목 : {pbFarmDiary.itemName}</Div>
                </div>
            </Flex>

            <Div mx={16} mt={40} mb={27} fontSize={20} bold>생산지 위치</Div>
            <Div mx={16} rounded={8} shadow={'md'}>
                <LocalMapCard
                    title={pbFarmDiary.farmerName} addr={pbFarmDiary.fieldAddress}
                />
            </Div>

            <Div mx={16} mt={40} mb={27} fontSize={20} bold>매일매일 기록되는 생산일지</Div>

            {/*{*/}
            {/*    pbFarmDiary.diaryList.map((diary, i) => {*/}
            {/*        return (*/}
            {/*            <Div px={16} mb={40}>*/}
            {/*                <Flex mb={10} fontSize={13} flexWrap={'wrap'}>*/}
            {/*                    <Div fontSize={12} fg={'white'} bg={'green'} px={9} py={5} rounded={2}>생산</Div>*/}
            {/*                    <Div ml={10}>{diary.work}</Div>*/}
            {/*                    <Right fg={'dark'}>{diary.day}</Right>*/}
            {/*                </Flex>*/}
            {/*                <Div p={15} bg={'background'} rounded={5} fontSize={14}>*/}
            {/*                    {diary.remark}*/}
            {/*                </Div>*/}
            {/*            </Div>*/}
            {/*        )*/}
            {/*    })*/}
            {/*}*/}

            {
                farmDiaryImageList.map((diary,) => {
                    return (
                        <Div px={16} mb={40}>
                            <Flex mb={10} fontSize={13} flexWrap={'wrap'}>
                                <Div fontSize={12} fg={'white'} bg={'green'} px={9} py={5} rounded={2}>생산</Div>
                                <Div ml={10}>{diary.title}</Div>
                                <Right fg={'dark'}>{diary.day}</Right>
                            </Flex>
                            <Img src={'https://shopbly.shop/thumbnails'+diary.imageUrl} alt={'이미지'} width={'100%'} />
                        </Div>
                    )
                })
            }

            <Div mt={48}>
                <Img src={FarmDiaryBottom} alt="하단이미지" width={'100%'} />
                <Img cursor={1} src={FarmDiaryBottomButton} alt="하단버튼" width={'100%'} onClick={moveToHome} />
            </Div>


        </div>
    )
}

export default withRouter(PbFarmDiary);