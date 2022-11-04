import React, {useState} from 'react';
import {Button, Div, Flex, GridColumns, Input, Right, Space, Span} from "~/styledComponents/shared";
import useInput from "~/hooks/useInput";
import HashTagInput from "~/components/common/hashTag/HashTagInput";
import adminApi from "~/lib/adminApi";

const HashTagContent = ({onClose}) => {

    const [tags, setTags] = useState([])

    const onAvailableTagChange = tags => setTags(tags)

    const save = async(status) => {

        if (tags.length <= 0){
            alert('저장할 내역이 없습니다.');
            return
        }

        if (window.confirm('저장 하시겠습니까?')) {
            const promises = []
            tags.map(tag => promises.push(adminApi.addHashTag(tag, status)))
            await Promise.all(promises)
            onClose(true)
        }
    }

    return (
        <Div>
            <Flex mb={16}>
                <Div fg={'danger'} fontSize={12}>사용불가능 으로 등록된 태그는 "연관검색" 제외 시킵니다.</Div>
                <Right>
                    <Space>
                        <Button px={10} bg={'green'} fg={'white'} onClick={save.bind(this, 0)}>저장(사용가능)</Button>
                        <Button px={10} bg={'danger'} fg={'white'} onClick={save.bind(this, 1)}>저장(사용불가능)</Button>
                    </Space>
                </Right>
            </Flex>

            <Div minHeight={300} bg={'white'} p={10} rounded={4}>
                <HashTagInput tags={tags} limit={10} onChange={onAvailableTagChange} />
            </Div>








        </Div>
    );
};


export default HashTagContent;
