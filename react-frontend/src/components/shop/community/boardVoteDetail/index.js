import React from 'react';
import {useParams} from "react-router-dom";
import BoardVoteDetail from "~/components/shop/community/boardVoteDetail/BoardVoteDetail";
const index = (props) => {
    const {writingId} = useParams()
    return (
        <BoardVoteDetail writingId={writingId} />
    );
};

export default index;
