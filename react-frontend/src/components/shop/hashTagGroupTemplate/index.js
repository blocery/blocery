import React, {useState, useEffect} from 'react';
import HashTagGroup from '~/components/common/hashTag/HashTagGroup'
import {getAllHashTagGroupList} from "~/lib/commonApi";
import {Div, Flex, Space} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";
import {withRouter} from 'react-router-dom'
import {getValue} from "~/styledComponents/Util";

const HashTagGroupTemplate = (props) => {

    let params = ComUtil.getParams(props)
    // if (!params || !params.groupNo) {
    //     params = {groupNo: null}
    // }

    const [groupNo, setGroupNo] = useState(params.groupNo || -1)

    const [hashTagGroupList, setHashTagGroupList] = useState()
    // const [hashTagGroup, setHashTagGroup] = useState()

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        //노출된 해시태그 그룹리스트 조회
        const {data} = await getAllHashTagGroupList()
        console.log({data})

        if (data && data.length > 0) {
            //선택된 것을 제일 처음으로 위치 이동
            const index = data.findIndex(item => item.groupNo === parseFloat(groupNo))
            const firstItem = data.splice(index,  1)[0]
            data.unshift(firstItem)
            setHashTagGroupList(data)

            if (groupNo === -1) {
                setGroupNo(firstItem.groupNo)
            }
        }
    }

    const onGroupClick = (hashTagGroup) => {
        setGroupNo(hashTagGroup.groupNo)
    }


    return (
        <div>
            <BackNavigation showShopRightIcons>추천 #</BackNavigation>
            {
                !hashTagGroupList ? <Skeleton.ProductList count={5} /> : (
                    <>
                        <Space pl={16} py={16} bg={'background'} spaceGap={10} overflow={'auto'} custom={`
                            & > div:last-child {
                                padding-right: ${getValue(16)};
                            }
                        `}>
                            {
                                hashTagGroupList.map(hashTagGroup =>
                                    <Div
                                        cursor={1}
                                        flexShrink={0}
                                        bg={parseFloat(groupNo) === hashTagGroup.groupNo ? 'green' : 'white'}
                                        fg={parseFloat(groupNo) === hashTagGroup.groupNo ? 'white' : 'dark'}
                                        bc={parseFloat(groupNo) === hashTagGroup.groupNo ? 'white' : 'light'}
                                        doActive rounded={25}
                                        px={16} py={4}
                                        //mb={10}
                                        onClick={onGroupClick.bind(this, hashTagGroup)}
                                    >
                                        {hashTagGroup.groupName}
                                    </Div>
                                )
                            }
                        </Space>

                        {
                            parseFloat(groupNo) !== -1 && (
                                <HashTagGroup.Detail hashTagGroup={hashTagGroupList.find(group => group.groupNo === parseFloat(groupNo))} />

                            )
                        }

                    </>
                )
            }

        </div>
    );
};

export default HashTagGroupTemplate;
