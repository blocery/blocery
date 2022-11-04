import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {getLocalfoodFarmer} from '~/lib/shopApi'
import {Div, Flex, ListBorder} from "~/styledComponents/shared";
import {Spinner} from "reactstrap";
import GoodsCard from "~/components/common/cards/GoodsCard";
import LocalGoodsList from "~/components/shop/local/localStore/LocalGoodsList";
import BackNavigation from "~/components/common/navs/BackNavigation";
import FarmerProfile from "~/components/shop/local/components/FarmerProfile";
const LocalFarmerGoodsList = (props) => {
    const {localfoodFarmerNo} = useParams()
    const [farmer, setFarmer] = useState()
    useEffect(() => {
        if (localfoodFarmerNo) {
            search()
        }
    }, [localfoodFarmerNo]);

    const search = async () => {
        const {data} = await getLocalfoodFarmer(localfoodFarmerNo)
        console.log(data)
        setFarmer(data)
    }

    if (!farmer) return <Flex minHeight={100} justifyContent={'center'} ><Spinner color={'success'}/></Flex>

    return (
        <div>
            <BackNavigation>{farmer.farmerName}</BackNavigation>
            <FarmerProfile desc={farmer.desc} farmerImages={farmer.farmerImages} />
            <LocalGoodsList localfoodFarmerNo={localfoodFarmerNo} hideLocalfoodFarmerName={true} />
        </div>
    );
};

export default LocalFarmerGoodsList;
