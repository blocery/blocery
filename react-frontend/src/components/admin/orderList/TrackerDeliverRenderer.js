import React, {useEffect, useState} from 'react';
import { getTrackerDeliverTrace } from '~/lib/deliveryOpenApi'

import {getTransportCarrierId} from "~/util/bzLogic";
import {getTransportCompany} from "~/lib/shopApi";

const TrackerDeliverRenderer = (props) => {

    const [status, setStatus] = useState("");

    useEffect(() => {
        const transportCompanyCode = props.data.transportCompanyCode
        const trackingNumber = props.data.trackingNumber
        if (transportCompanyCode && trackingNumber) {
            if (trackingNumber.toString().length > 10) {
                setStatus("배송추적");
            }
        }
    }, []);

    // 통합배송조회 링크
    const onClickTrackDeliverInfo = async () => {
        let track_id = props.data.trackingNumber;
        const v_TransportCompanyCd = props.data.transportCompanyCode;
        const carrier_id = getTransportCarrierId(v_TransportCompanyCd);

        let { data:transportCompanies } = await getTransportCompany();
        let transportCompany = transportCompanies.find(transportCompany=>transportCompany.transportCompanyCode === v_TransportCompanyCd);
        let trackingUrl = transportCompany.transportCompanyUrl.replace('[number]', track_id);

        // if(v_TransportCompanyCd !== '07' && v_TransportCompanyCd !== '98' && v_TransportCompanyCd !== '99') {
        //     trackingUrl = `https://tracker.delivery/#/${carrier_id}/${track_id}`;
        // }

        window.open(trackingUrl,'_blank')
    }

    return(
        <div>
            {
                (props.data.trackingNumber && props.data.transportCompanyCode) ?
                    <span className='text-primary'
                          onClick={onClickTrackDeliverInfo}
                          style={{textColor:'blue'}}>{status}</span>
                    :
                    <span>{status}</span>
            }
        </div>
    )
}

export default TrackerDeliverRenderer;