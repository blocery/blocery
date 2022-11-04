import React from 'react'
import ComUtil from '~/util/ComUtil'
import { HeaderTitle, NoSearchResultBox } from '~/components/common'
import GoodsQnAItem from './GoodsQnAItem'
import MoreButton from '~/components/common/buttons/MoreButton'
import GoodsQueModal from "./GoodsQueModal";
import useLogin from "~/hooks/useLogin";
import {Div, GridColumns} from "~/styledComponents/shared";
import {IoMdLock} from 'react-icons/io'

const GoodsQnAContent = ({goods, goodsQnAs=[], totalCount=0, onMoreClick = () => null, onGoodsQnASaved = ()=> null}) => {
    const {consumer} = useLogin()
    return(
        <div>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(totalCount)}개 문의</div>}
                sectionRight={
                    <GoodsQueModal goods={goods} onClose={onGoodsQnASaved} />
                }
            />
            {
                totalCount <= 0 && <hr className='m-0'/>
            }
            <GridColumns repeat={1} colGap={0} rowGap={1} bg={'veryLight'}>
                {
                    goodsQnAs.map((goodsQnA, index) => {
                            if(goodsQnA.privateFlag && (!consumer || consumer.consumerNo !== goodsQnA.consumerNo)) {
                                return (
                                    <Div key={'goodsQnA' + index} p={16} bg={'white'} fontSize={14}><IoMdLock style={{marginRight: 4}}/>비공개 문의</Div>
                                )
                            }
                            return <GoodsQnAItem key={'goodsQnA' + index} {...goodsQnA} />
                        }
                    )
                }
            </GridColumns>
            {
                goodsQnAs.length < totalCount && <MoreButton onClick={onMoreClick}>({goodsQnAs.length}/{totalCount})</MoreButton>
            }
            {
                goodsQnAs.length <= 0 && <NoSearchResultBox>상품문의 없습니다</NoSearchResultBox>
            }
        </div>
    )

}
export default GoodsQnAContent