import React from 'react'
import ReactGA from "react-ga4";
import { GA4 } from 'react-ga4/dist/ga4';
import {Server} from "~/components/Properties"
import ComUtil from '~/util/ComUtil'

const otherInstanceReactGA = new GA4();
const TRACKING_ID1 = "G-ZG3DSM7RXP";
const TRACKING_ID2 = "G-RC87RZNL7L";

function init() {

    // blocery.com 용 측정 ID = G-ZG3DSM7RXP
    // marketbly.com 용 측정 ID = G-RC87RZNL7L

    // Enable debug mode on the local development environment
    //const isDev = Server._serverMode() === 'production' ? true:false;
    //ReactGA.initialize(TRACKING_ID, { debug: isDev })
    ReactGA.initialize(TRACKING_ID1,{gaOptions:"TRACKING_ID1"});
    otherInstanceReactGA.initialize(TRACKING_ID2,{gaOptions:"TRACKING_ID2"});
}

function sendEvent(payload) {
    ReactGA.event(payload)
}

function sendPageview(path) {
    const isProduction = Server._serverMode() === 'production' ? true:false;
    //console.log("window.location.hostname",window.location.hostname)
    if(isProduction) {
        // Mobile 구분 방식
        if (ComUtil.isMobileApp()) {
            ReactGA.send({hitType: "pageview", page: path});
        } else {
            otherInstanceReactGA.send({hitType: "pageview", page: path});
        }

        /* URL 구분 방식
        if (window.location.hostname === 'blocery.com') {
            ReactGA.send({hitType: "pageview", page: path});
        } else if (window.location.hostname === 'marketbly.com') {
            otherInstanceReactGA.send({hitType: "pageview", page: path});
        }
        */
    }
}

export default {
    init,
    sendEvent,
    sendPageview,
}
