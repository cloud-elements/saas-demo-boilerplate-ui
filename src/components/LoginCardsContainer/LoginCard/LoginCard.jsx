import React, { Component } from 'react';
import Card, { CardActions, CardHeader } from 'material-ui/Card';
import queryString from 'query-string';
import ConnectButton from './ConnectButton';
import { instanceBody } from '../../../ce-util';
import db from 'store2';

class LoginCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: null,
            redirectUrl: null
        };
        this.oauthRedirectSend = this.oauthRedirectSend.bind(this);
        this.createInstance = this.createInstance.bind(this);
    }

    oauthRedirectSend() {
        console.log('oauth redirect has been fired!');
        const { ceKeys, vendorData, vendorCallbackUrl, baseUrl } = this.props;
        // the normalized Cloud Elements URL for retrieving an OAuth redirect
        const path = `elements/${vendorData.elementKey}/oauth/url`;
        // The query parameters with the api key, api secret, and callback url.
        const queryParams = `apiKey=${vendorData.vendorApiKey}&apiSecret=${vendorData.vendorSecret}&callbackUrl=${vendorCallbackUrl}`;
        // place everything above into an object for fetch to use
        const config = {
            method: 'GET',
            headers: {
                'Authorization': `User ${ceKeys.userToken}, Organization ${ceKeys.orgToken}`,
                'Content-Type': 'application/json'
            }
        }
        const request = async () => {
            const response = await fetch(`${baseUrl}/${path}?${queryParams}`, config);
            const json = await response.json();
            // update state with redirect url generated by Cloud Elements
            // this.setState({
            //     redirectUrl: json.oauthUrl,
            // })
            window.location = await json.oauthUrl;
        }
        request();
    }

    createInstance(oauthCode, state) {
        const { ceKeys, vendorData, vendorCallbackUrl, baseUrl } = this.props;
        const path = `elements/${vendorData.elementKey}/instances`;
        // create the appropriate request body for the POST /instances API call
        const body = instanceBody(vendorData.elementKey, oauthCode, vendorCallbackUrl, vendorData, state)
        const config = {
            method: 'POST',
            headers: {
                'Authorization': `User ${ceKeys.userToken}, Organization ${ceKeys.orgToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }
        const request = async () => {
            const response = await fetch(`${baseUrl}/${path}`, config);
            const json = await response.json();
            // store instance token on response -- This should hit an external server API and store token in reference to the logged in user
            // but for now it's just hanging out in local storage on 
            if (await json.token) {
                await db.set(state, json.token);
                await this.setState({
                    connected: true
                });
            }
        }
        request();
    }

    componentWillMount() {
        const { vendorData } = this.props;
        // first check to see if instance already exists for this element
        console.log('login card mounting: ' + vendorData.elementKey);
        if (db.get(vendorData.elementKey)) {
            this.setState({
                connected: true
            });
        } else {
            const queryParams = queryString.parse(window.location.search);
            // If an OAuth code is not detected retrieve the OAuth redirect url, if one is detected use it to create an instance
            // if (!queryParams.code || (queryParams.state !== vendorData.elementKey)) {
            //     this.getOAuthUrl();
            if (queryParams.code && (queryParams.state === vendorData.elementKey)) {
                this.createInstance(queryParams.code, queryParams.state);
            }
        }
    }

    render() {
        const { connected } = this.state;
        const elementName = this.props.vendorData.nameText;
        let cardSubHeader = "Connect your " + elementName + " account";
        if (connected) {
            cardSubHeader = elementName + " is connected.";
        }
        return (
            <Card
                className="LoginCard"
                style={{
                    margin: '20px',
                    float: 'left'
                }}
            >
                <CardHeader
                    title={elementName}
                    subheader={cardSubHeader}
                />
                <CardActions>
                    <ConnectButton
                        connected={connected}
                        oauthRedirectSend={this.oauthRedirectSend}
                    />
                </CardActions>
            </Card>
        )
    }
};

export default LoginCard;