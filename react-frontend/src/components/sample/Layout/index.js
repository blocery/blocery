import React, {useState} from 'react';
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import FeedCard from "~/components/common/cards/FeedCard";
import {Div, GridColumns} from "~/styledComponents/shared";
import moment from 'moment-timezone'
import BuyingPeopleCard from "~/components/common/cards/BuyingPeopleCard";
import {GridList} from "~/styledComponents/ShopBlyLayouts";
import Toast from "~/components/common/toast/Toast";


function Content({componentName, children}) {
    return(
        <Div mt={20}>
            <Div fontSize={20}><strong>{componentName}</strong></Div>
            <Div mt={20}>
                {children}
            </Div>
        </Div>
    )
}

const CustomMask = () => {
    return(
        <Div>
            <Div>커스텀</Div>
            <Div>마스크</Div>
        </Div>
    )
}

const feedData = {
    type: 'producer',
    // profileUrl: 'https://img.hankyung.com/photo/201912/01.21032432.1.jpg',
    // nickname: 'DavidLee',
    // level: 2,
    // images: [
    //     {imageNo: 0, imageUrl: 'OcY8c2uWkt3u.jpg', imageNm: 'apple'},
    //     {imageNo: 1, imageUrl: 'dl4g3gX91Tv2.png', imageNm: 'apple'},
    //     {imageNo: 2, imageUrl: 'OcY8c2uWkt3u.jpg', imageNm: 'apple'}
    // ],
    myLike: true,
    likesCount: 9999,
    repliesCount: 8989,
    images: [
        {imageNo: 0, imageUrl: 'OcY8c2uWkt3u.jpg', imageNm: 'apple'},
        {imageNo: 1, imageUrl: 'dl4g3gX91Tv2.png', imageNm: 'apple'},
        {imageNo: 2, imageUrl: 'OcY8c2uWkt3u.jpg', imageNm: 'apple'}
    ],
    content: '무더운 여름이 지나가는 만큼 감자도 잘 익어가고 있습니다. 고객님들께 좋은 소식 알려드리고자 글을 쓰게 되었습니다. 2주 후 햇감자 수확의 계절이 오고 있는데요~ 꼭 그렇지많은 않다고 보여집니다.',
    tags: ['펭수', '마음먹기에따라달라', '봄이오면', '소설책', '리트리버','대니'],
    date: new Date(),// moment().format('YY.MM.DD'),
    profileInfo: {
        consumerNo: 2,
        producerNo: 3,
        name: '이승욱',
        nickname: 'Jaden',
        desc: '청년농부',
        level: 2,
        profileImages: [
            {imageNo: 0, imageUrl: 'OcY8c2uWkt3u.jpg', imageNm: 'apple'},
            {imageNo: 1, imageUrl: 'dl4g3gX91Tv2.png', imageNm: 'apple'},
            {imageNo: 2, imageUrl: 'OcY8c2uWkt3u.jpg', imageNm: 'apple'}
        ],
        producerFlag: true,
    }
}

const Layout = (props) => {
    return (
        <Div>
            <Div p={16}>
                <code>
                    import BuyingPeopleCard from "~/components/common/cards/BuyingPeopleCard";
                </code>
                <Content componentName={'BuyingPeopleCard'}>
                    <BuyingPeopleCard goodsNo={407} interval={3000} />
                </Content>
            </Div>
            <hr/>
            <Div p={16}>
                <code>
                    import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
                </code>
                <Content componentName={'VerticalGoodsCard.DealGoods'}>
                    <VerticalGoodsCard.DealGoods
                        goods={{
                            goodsNo: 431,
                            remainedCnt: 0,
                            goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                            goodsImages: [{
                                imageUrl: 'afPEoYhJdSeQ.jpeg',
                                imageNm: 'test'
                            }],
                            termsOfDeliveryFee: 'FREE',
                            buyingRewardFlag: true,
                            myLike: true,
                            discountRate: 10,
                            avgScore: 6,
                            goodsReviewsCount: 99,
                            consumerPrice: 46000,
                            currentPrice: 9800,
                            dealStartDate: 20210809,
                            dealEndDate: 20210813,
                            dealCount: 23,
                            dealMinCount: 15,
                            dealMaxCount: 98
                        }}
                        //isThumnail={false}
                    />

                    <GridList>
                        <VerticalGoodsCard.DealGoods
                            goods={{
                                goodsNo: 431,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: true,
                                discountRate: 10,
                                avgScore: 6,
                                goodsReviewsCount: 99,
                                consumerPrice: 46000,
                                currentPrice: 9800,
                                dealStartDate: 20210809,
                                dealEndDate: 20210813,
                                dealCount: 23,
                                dealMinCount: 15,
                                dealMaxCount: 98
                            }}
                            //isThumnail={false}
                        />
                        <VerticalGoodsCard.DealGoods
                            goods={{
                                goodsNo: 431,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: true,
                                discountRate: 10,
                                avgScore: 6,
                                goodsReviewsCount: 99,
                                consumerPrice: 46000,
                                currentPrice: 9800,
                                dealStartDate: 20210809,
                                dealEndDate: 20210813,
                                dealCount: 23,
                                dealMinCount: 15,
                                dealMaxCount: 98
                            }}
                            //isThumnail={false}
                        />
                    </GridList>

                </Content>
            </Div>

            <hr/>
            <Div p={16}>
                <code>
                    import FeedCard from "~/components/common/cards/FeedCard";
                </code>
                <Content componentName={'FeedCard'}>
                    <FeedCard {...feedData} type={'producer'} uniqueKey={'134'} />
                    {/*<FeedCard {...feedData} type={'board'} uniqueKey={'134'} farmName={null} consumerNo={1} />*/}
                    {/*<FeedCard {...feedData} type={'goodsReview'} uniqueKey={'24001908001'} farmName={null} consumerNo={1} />*/}
                </Content>
            </Div>

            <hr/>

            <Div p={16}>
                <code>
                    import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
                </code>

                <Content componentName={'VerticalGoodsCard.SpecialDeal'}>
                    <GridColumns repeat={2} colGap={10} rowGap={0}>
                        <VerticalGoodsCard.SpecialDeal
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: true,
                                discountRate: 10,
                                avgScore: 6,
                                goodsReviewsCount: 99
                            }}
                            // isThumnail={false}
                        />
                        <VerticalGoodsCard.SpecialDeal
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                // termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: false,
                                discountRate: 10,
                                avgScore: 6,
                                goodsReviewsCount: 1500
                            }}
                            //isThumnail={false}
                            maskContent={<CustomMask />}
                        />
                    </GridColumns>
                </Content>

                <Content componentName={'VerticalGoodsCard.Large'}>
                    <GridColumns repeat={2} colGap={10} rowGap={0}>
                        <VerticalGoodsCard.Large
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: true,
                                timeSale: true,
                                inTimeSalePeriod: true,
                                discountRate: 10,
                                consumerPrice: 46000,
                                currentPrice: 19900,
                                avgScore: 6,
                                goodsReviewsCount: 7
                            }}
                            //isThumnail={false}
                        />
                        <VerticalGoodsCard.Large
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                // termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: false,
                                superReward: true,
                                inSuperRewardPeriod: true,
                                discountRate: 10,
                                consumerPrice: 46000,
                                currentPrice: 19900,
                                avgScore: 6,
                                goodsReviewsCount: 1500
                            }}
                            //isThumnail={false}
                            maskContent={<CustomMask />}
                        />
                    </GridColumns>
                </Content>

                <Content componentName={'VerticalGoodsCard.Medium'}>
                    <GridColumns repeat={2} colGap={10} rowGap={0}>
                        <VerticalGoodsCard.Medium
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: true,
                                timeSale: true,
                                inTimeSalePeriod: true,
                                discountRate: 10,
                                consumerPrice: 46000,
                                currentPrice: 19900,
                                avgScore: 6,
                                goodsReviewsCount: 5000
                            }}
                            //isThumnail={false}
                        />
                        <VerticalGoodsCard.Medium
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                // termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: false,
                                superReward: true,
                                inSuperRewardPeriod: true,
                                discountRate: 10,
                                consumerPrice: 46000,
                                currentPrice: 19900,
                                avgScore: 6,
                                goodsReviewsCount: 150
                            }}
                            //isThumnail={false}
                        />
                    </GridColumns>
                    <VerticalGoodsCard.Medium
                        goods={{
                            goodsNo: 464,
                            remainedCnt: 0,
                            goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                            goodsImages: [{
                                imageUrl: 'afPEoYhJdSeQ.jpeg',
                                imageNm: 'test'
                            }],
                            termsOfDeliveryFee: 'FREE',
                            buyingRewardFlag: true,
                            myLike: false,
                            timeSale: true,
                            inTimeSalePeriod: true,
                            discountRate: 10,
                            consumerPrice: 46000,
                            currentPrice: 19900,
                            avgScore: 6,
                            goodsReviewsCount: 245
                        }}
                        //isThumnail={false}
                        maskContent={
                            <Div>
                                <Div fontSize={22} bold>4월 30일 10:00</Div>
                                <Div fontSize={41} lineHeight={41} fw={900}>오픈예정</Div>
                            </Div>
                        }
                        isWide={true}
                    />
                    <VerticalGoodsCard.Medium
                        goods={{
                            goodsNo: 464,
                            remainedCnt: 0,
                            goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                            goodsImages: [{
                                imageUrl: 'afPEoYhJdSeQ.jpeg',
                                imageNm: 'test'
                            }],
                            termsOfDeliveryFee: 'FREE',
                            buyingRewardFlag: true,
                            myLike: false,
                            superReward: true,
                            inSuperRewardPeriod: true,
                            discountRate: 10,
                            consumerPrice: 46000,
                            currentPrice: 19900,
                            avgScore: 6,
                            goodsReviewsCount: 1700
                        }}
                        maskContent={
                            <Div>
                                <Div fontSize={22} bold>4월 30일 10:00</Div>
                                <Div fontSize={41} lineHeight={41} fw={900}>오픈예정</Div>
                            </Div>
                        }
                        //isThumnail={false}
                        isWide={true}
                    />
                </Content>

                <Content componentName={'VerticalGoodsCard.Small'}>
                    <GridColumns repeat={2} colGap={10} rowGap={0}>
                        <VerticalGoodsCard.Small
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: true,
                                timeSale: true,
                                inTimeSalePeriod: true,
                                discountRate: 10,
                                consumerPrice: 46000,
                                currentPrice: 19900,
                                avgScore: 6,
                                goodsReviewsCount: 1340
                            }}
                            //isThumnail={false}
                        />
                        <VerticalGoodsCard.Small
                            goods={{
                                goodsNo: 464,
                                remainedCnt: 0,
                                goodsNm: '국내산 햇양파 2kg / 대 사이즈 (250g 이상)',
                                goodsImages: [{
                                    imageUrl: 'afPEoYhJdSeQ.jpeg',
                                    imageNm: 'test'
                                }],
                                // termsOfDeliveryFee: 'FREE',
                                buyingRewardFlag: true,
                                myLike: false,
                                superReward: true,
                                inSuperRewardPeriod: true,
                                discountRate: 10,
                                consumerPrice: 46000,
                                currentPrice: 19900,
                                avgScore: 6,
                                goodsReviewsCount: 0
                            }}
                            //isThumnail={false}
                        />
                    </GridColumns>
                </Content>
            </Div>




        </Div>
    );
};

export default Layout;
