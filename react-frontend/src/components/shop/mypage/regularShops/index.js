import React, { Component, Fragment } from 'react';
import { getConsumer, getRegularShopListByConsumerNo} from '~/lib/shopApi'
import { Link } from '~/styledComponents/shared/Links'
import {Div, Img, Flex, Span, Right, Space} from '~/styledComponents/shared/Layouts'
import { HrThin } from '~/styledComponents/mixedIn'
import {FiBox, FiUser} from 'react-icons/fi'
import Skeleton from '~/components/common/cards/Skeleton'
import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";
import {EmptyBox, ProfileImageStrokeBig, ProfileImageStrokeSmall} from "~/styledComponents/ShopBlyLayouts";
import NoProfile from "~/images/icons/renewal/mypage/no_profile.png";
import RoundedFollowButton from "~/components/common/buttons/RoundedFollowButton";
import ProfileBig from "~/components/common/cards/ProfileBig";
export default class RegularShopList extends Component {
    constructor(props) {
        super(props)
        const params = ComUtil.getParams(props);
        this.state = {
            consumerNo: params.consumerNo,
            loginUser: '',
            shopList: undefined,
            cancelButton: 'block'
        }
    }

    async componentDidMount() {
        await this.loginCheck();
        await this.regularShopList();
    }

    // 로그인 체크
    loginCheck = async () => {
        const loginUser = await getConsumer();
        let buttonDisplay = 'block';
        if (parseInt(this.state.consumerNo) !== loginUser.data.consumerNo) {
            buttonDisplay = 'none'
        }

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            cancelButton: buttonDisplay
        })
    }

    // 단골농장 리스트 조회
    regularShopList = async () => {
        const { data } = await getRegularShopListByConsumerNo(this.state.consumerNo);
        this.setState({
            shopList: data
        })


        console.log({lise: data})
    }

    // 단골 농장 삭제
    onClickFallowDel = () => {
        //재검색 할 경우 bug 발생, 재검색 보단 단골취소 후 다시 등록 할 수 있도록 그대로 놔두는게 자연스럽다 판단. (유투브 처럼)
    }

    onFarmClick = (producerNo) => {
        this.props.history.push(`/consumersDetailActivity?consumerNo=${900000000 + producerNo}`)
    }

    render() {

        const data = this.state.shopList
        return (
            <Fragment>
                <BackNavigation>단골상점</BackNavigation>
                {
                    !data ? <Skeleton.ProductList count={5}/> :
                        data.length <= 0 ? (
                                <div>
                                    <div className={'w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'}>{(data===undefined)?'':<EmptyBox>등록된 단골 상점이  없습니다.</EmptyBox>}</div>
                                </div>) :
                            data.map(({producerNo, countConsumer, countSellingItems, profileInfo}, index)=>{

                                return (
                                    <Div relative>
                                        <Space absolute bottom={0} left={120} zIndex={1} alignItems={'flex-start'}>
                                            <Space mb={7} fontSize={14} spaceGap={4}>
                                                <Div><FiBox /> 판매상품</Div>
                                                <Div fg={'adjust'} ml={8}>{countSellingItems}개</Div>
                                            </Space>
                                            <Space mb={7} fontSize={14} spaceGap={4}>
                                                <Div><FiUser /> 단골고객</Div>
                                                <Div fg={'adjust'} ml={8}>{countConsumer}명</Div>
                                            </Space>
                                        </Space>
                                        <ProfileBig {...profileInfo} hideGrade={true} onClick={this.onFarmClick.bind(this, producerNo)}/>

                                    </Div>
                                )

                                // const profileImageUrl = ComUtil.getFirstImageSrc(producerImage) || NoProfile;
                                // return(
                                //     <Fragment key={'shopItem'+index}>
                                //         <Flex px={16} my={24}>
                                //             <Link to={'/consumersDetailActivity?consumerNo=' + (900000000 + producerNo)}>
                                //                 <Flex>
                                //                     <Div>
                                //                         <ProfileImageStrokeSmall producerFlag={true} level={level}>
                                //                             <Img rounded={'50%'} cover width={78} height={78} src={profileImageUrl} alt={'프로필 이미지'} onError={(e)=>e.target.src = NoProfile} />
                                //                         </ProfileImageStrokeSmall>
                                //                     </Div>
                                //                     <Div ml={15}>
                                //                         <Div mb={7} fontSize={15} fg={'green'}>{farmName}</Div>
                                //                         <Flex mb={7} fontSize={14}>
                                //                             <Div minWidth={98}><FiBox /> 판매상품</Div>
                                //                             <Div fg={'adjust'} ml={8}>{countSellingItems}개</Div>
                                //                         </Flex>
                                //                         <Flex fontSize={14}>
                                //                             <Div minWidth={98}><FiUser /> 단골고객</Div>
                                //                             <Div fg={'adjust'} ml={8}>{countConsumer}명</Div>
                                //                         </Flex>
                                //                     </Div>
                                //                 </Flex>
                                //             </Link>
                                //         </Flex>
                                //         <Div px={16} my={16} display={this.state.cancelButton} textAlign={'center'}>
                                //             <RoundedFollowButton producerNo={producerNo} initialValue={true} onClick={this.onClickFallowDel}/>
                                //         </Div>
                                //
                                //         <HrThin m={0} />
                                //     </Fragment>
                                // )
                            })
                }
            </Fragment>
        )
    }
}