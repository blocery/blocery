import React from 'react';
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";

const HashTagSearch = (props) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    return (
        <div></div>
    );
};

export default HashTagSearch;
