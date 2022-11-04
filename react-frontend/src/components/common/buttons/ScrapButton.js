import React, {useEffect, useState} from 'react';
import {BsBookmark, BsBookmarkFill} from "react-icons/bs";
import {IoMdBookmark} from 'react-icons/io'
import {Button} from "~/styledComponents/shared";
import {isScrapped, addMyScrap} from '~/lib/shopApi'
import useLogin from "~/hooks/useLogin";

const ScrapButton = React.memo(({type = "board", uniqueKey}) => {
    const [scrapped, setScraped] = useState()
    const {consumer, isServerLoggedIn} = useLogin()

    useEffect(() => {
        //로그인이 되어있고 키가 바뀌었을때 재 조회
        if (consumer && uniqueKey) {
            console.log({consumer, uniqueKey})
            getScrapStatus()
        }
    }, [uniqueKey])

    const onClick = async () => {
        if (await isServerLoggedIn()) {
            console.log({saveparams: {type, refNo: uniqueKey}})
            await addMyScrap({type, refNo: uniqueKey})
            getScrapStatus()
        }
    }

    //스크랩 되어있는지 여부 조회
    const getScrapStatus = async () => {
        const {data} = await isScrapped({type, refNo: uniqueKey})
        console.log({scrapped:data})
        setScraped(data)
    }

    return (
        <Button
            relative
            // px={12}
                // bc={scrapped ? 'primary' : 'secondary'}
                fg={scrapped ? 'green' : 'secondary'}
                // bw={3}
                rounded={19}
                custom={`
                    line-height: 0;
                `}
                onClick={onClick}
        >
            {/*<BsBookmarkFill size={24} />*/}
            <IoMdBookmark size={25} />
        </Button>
    );
});


export default ScrapButton;
