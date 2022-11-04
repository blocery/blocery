import React, {useEffect, useState} from 'react';
import {getLocalfoodFarmer} from "~/lib/producerApi";
import {Div} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";

const LocalFarmerContent = ({localfoodFarmerNo}) => {

    const [localfoodFarmer, setLocalfoodFarmer] = useState()
    const [isError, setError] = useState(false)

    useEffect(() => {
        if (localfoodFarmerNo)
            searchLocalfoodFarmerInfo()

    }, [localfoodFarmerNo])

    const searchLocalfoodFarmerInfo = async () => {
        try{
            const {status, data} = await getLocalfoodFarmer(localfoodFarmerNo)
            console.log({data: data})

            if (status === 200) {
                setLocalfoodFarmer(data)
                setError(false)
            }

        }catch(error) {
            setError(true)
        }
    }

    if (!localfoodFarmerNo || !localfoodFarmer) return null
    if (isError) return <Div>조회중 에러가 발생 하였습니다. <b><u onClick={searchLocalfoodFarmerInfo}>새로고침</u></b></Div>
    return (
        <Div lineHeight={35}>
            {
                localfoodFarmer.starred && <Div bold>주요농가</Div>
            }
            <Div>
                {localfoodFarmer.farmerName} ({localfoodFarmer.farmName})
            </Div>
            <Div>
                연락처 <a href={`tel:${localfoodFarmer.phoneNum}`} style={{color: color.primary, textDecoration: 'underline'}}>{localfoodFarmer.phoneNum}</a>
            </Div>
            <Div>
                {localfoodFarmer.zipNo} {localfoodFarmer.address}
            </Div>
            <Div>
                {localfoodFarmer.addressDetail}
            </Div>
        </Div>
    );
};

export default LocalFarmerContent;
