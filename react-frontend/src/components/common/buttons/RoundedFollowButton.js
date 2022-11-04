import React from 'react';
import {Div} from "~/styledComponents/shared";
import useDangol from "~/hooks/useDangol";

const RoundedFollowButton = ({initialValue = false, producerNo, onClick, ...rest}) => {

    const {dangolFlag, addDangol} = useDangol({initialValue, producerNo})

    const onHandleClick = async (e) => {
        e.stopPropagation();
        await addDangol();
        if(onClick && typeof onClick === "function"){
            onClick();
        }
    }

    return (
        <Div bg={dangolFlag ? 'white' : 'green'} fg={dangolFlag ? 'dark' : 'white'}
             bc={'veryLight'}
             flexShrink={0}
             rounded={22} px={16} py={11} fontSize={12} lineHeight={12} cursor={1} onClick={onHandleClick}
             {...rest}
        >
            {dangolFlag ? '단골취소' : '+단골등록'}
        </Div>
    );
};

export default RoundedFollowButton;

// const FollowButton = ({initialValue = false, producerNo}) => {
//     const {consumer, isLoggedIn, isServerLoggedIn} = useLogin()
//     const [myFollowFlag, setMyFollowFlag] = useState(initialValue)
//     useEffect(() => {
//         if (consumer)
//             search()
//     }, [consumer])
//
//     const search = async () => {
//         //regularShop 객체 리턴
//         const {data} = await getMyFollowFlagByProducerNo(producerNo)
//         if (data) {
//             setMyFollowFlag(true)
//         }
//     }
//
//     const onClick = async () => {
//         if (await isServerLoggedIn()) {
//             if (myFollowFlag) {
//                 if (!window.confirm('단골을 취소하시겠어요? 이후 생산자 알림을 받을 수 없습니다.'))
//                     return
//             }
//             const {data} = await toggleRegularShop(producerNo)
//             setMyFollowFlag(data)
//         }
//     }
//
//     return (
//         <Div bg={myFollowFlag ? 'white' : 'green'} fg={myFollowFlag ? 'dark' : 'white'}
//              bc={'veryLight'}
//              rounded={22} px={16} py={11} fontSize={12} lineHeight={12} cursor={1} onClick={onClick}>
//             {myFollowFlag ? '단골취소' : '+단골상점'}
//         </Div>
//     );
// };
//
// export default FollowButton;
