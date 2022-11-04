import React from 'react';
import {useParams, withRouter} from "react-router-dom";
import BoardDetail from "~/components/shop/community/boardViewer/BoardDetail";
const index = (props) => {
    const {writingId} = useParams()
    return (
        <BoardDetail writingId={writingId} />
    );
};
export default withRouter(index);